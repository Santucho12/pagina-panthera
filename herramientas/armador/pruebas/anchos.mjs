// La sección entera en varios anchos (para revisar espaciados, alineaciones y que nada se pise): node herramientas/armador/pruebas/anchos.mjs <etiqueta> [ancho,ancho…]
// Cada ancho con el alto de pantalla de un equipo real (el escenario mide en vh: con una ventana más alta de lo normal sale gigante).
// Si la sección no entra en la pantalla, se recorre de arriba abajo y se guarda cada tramo (seccion-<ancho>-1.png, -2…), tal como
// lo ve la persona mientras baja (con la cabecera de la tienda y la barra fija del total).
import path from 'path';
import fs from 'fs';
import { abrir, irASeccion, esperaListo, espera, AQUI } from './comun.mjs';
const etiqueta = process.argv[2] || 'anchos';
const solo = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const DIR = path.join(AQUI, 'capturas', etiqueta);
fs.mkdirSync(DIR, { recursive: true });
const anchos = [[1920, 1080, 1], [1600, 900, 1], [1440, 900, 1], [1280, 800, 1], [1024, 768, 1], [768, 1024, 1], [390, 844, 2, true], [360, 780, 2, true]];
for (const [ancho, alto, dpr, celular] of anchos) {
  if (solo && !solo.includes(ancho)) continue;
  const { browser, page, avisos } = await abrir({ ancho, alto, dpr, celular: !!celular, query: 'a3debug&a3quieto=1' });
  await espera(3000); await irASeccion(page); await esperaListo(page, 4500);
  // de dónde a dónde va la sección (en coordenadas de la página)
  const sec = await page.evaluate(() => { const r = document.querySelector('[data-pnt-a3]').getBoundingClientRect(); return { y0: r.top + scrollY, y1: r.bottom + scrollY }; });
  const cdp = await page.target().createCDPSession();
  let y = sec.y0 - 70, i = 1;
  for (;;) {
    await page.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y);
    await espera(900);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(DIR, 'seccion-' + ancho + '-' + i + '.png'), Buffer.from(data, 'base64'));
    if (y + alto >= sec.y1 + 10 || i >= 6) break;
    y += Math.round(alto * 0.8); i++;
  }
  console.log(ancho, i, 'tramo(s)', avisos.length ? avisos : 'ok');
  await cdp.detach(); await browser.close();
}
process.exit(0);
