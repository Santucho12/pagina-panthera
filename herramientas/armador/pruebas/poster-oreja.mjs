// Póster de "Armá tu combinación de aritos": node herramientas/armador/pruebas/poster-oreja.mjs
// (2026-11-12) Renderiza la oreja con los aros de ejemplo (data-ejemplo de oreja.tpl) en la pose exacta del primer cuadro del 3D
// cuando reemplaza al póster (__or.poster(): tiempo 0, aros en reposo, agujeros a la vista, encuadre en su lugar) y la guarda como
// tienda/static/panthera/oreja/poster.webp (compu y tablet) y poster-m.webp (celular). oreja3d.js (ubicaPoster) la ubica con la misma
// cuenta de encuadre que la escena a partir de la forma de la imagen: por eso se captura sin recortar y con la forma del escenario
// más ANCHA que no encoge la vista (aspecto 1,46 en compu: así cubre cualquier escenario más angosto) y la más ancha de celular (0,89:
// por debajo de 0,9 la escena usa el encuadre de celular). Volver a correrlo si cambian los aros de ejemplo o la foto de la oreja.
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { abrir, espera, AQUI } from './comun.mjs';

const DEST = path.resolve(AQUI, '..', '..', '..', 'tienda', 'static', 'panthera', 'oreja');
const enOr = (page, fn, ...a) => page.evaluate(fn, ...a);
let firma = '';   // (2026-11-16) la combinación de entrada que muestra el póster
for (const [nombre, op, objetivo] of [['poster', { ancho: 1920, alto: 900, dpr: 1.5 }, 1.46], ['poster-m', { ancho: 390, alto: 844, dpr: 2, celular: true }, 0.89]]) {
  const { browser, page, avisos } = await abrir({ ...op, query: 'ordebug&poster' });
  await espera(9000);
  const lugar = () => page.evaluate(() => {
    const st = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage');
    const y = st.getBoundingClientRect().top + scrollY - 40;
    if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
    window.scrollTo(0, y);
    return { w: st.clientWidth, h: st.clientHeight, top: Math.round(st.getBoundingClientRect().top) };
  });
  // la forma del escenario: se ajusta el alto de la ventana hasta que dé el aspecto buscado
  let alto = op.alto, medida = await lugar();
  if (op.celular) {      // en celular el alto del escenario no sigue al de la ventana: se fija a mano (solo para la captura)
    await page.evaluate((ob) => { const st = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage'); const h = Math.round(st.clientWidth / ob) + 'px'; st.style.height = h; st.style.minHeight = h; st.style.maxHeight = h; st.style.aspectRatio = 'auto'; }, objetivo);
    await espera(1200); medida = await lugar();
  } else for (let i = 0; i < 8 && Math.abs(medida.w / medida.h - objetivo) > 0.015; i++) {
    alto = Math.max(500, Math.min(1400, Math.round(alto * (medida.h * objetivo / medida.w))));
    await page.setViewport({ width: op.ancho, height: alto, deviceScaleFactor: op.dpr, isMobile: false, hasTouch: false });
    await espera(900); medida = await lugar();
  }
  for (let i = 0; i < 80; i++) {
    const listo = await page.evaluate(() => document.querySelector('[data-pnt-or]').shadowRoot.getElementById('cargando').classList.contains('listo'));
    if (listo) break; await lugar(); await espera(500);
  }
  for (let t = 0; t < 5000; t += 500) { await lugar(); await espera(500); }
  if (!firma) firma = await page.evaluate(() => document.querySelector('[data-pnt-or]').getAttribute('data-entrada') || '');
  const png = await page.evaluate(() => { window.__or.relojManual(true); return window.__or.poster(); });
  const tmp = path.join(AQUI, 'capturas', 'oreja-' + nombre + '.png');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, Buffer.from(png.split(',')[1], 'base64'));
  execFileSync('python', ['-c', "import sys; from PIL import Image; im = Image.open(sys.argv[1]).convert('RGB'); im.save(sys.argv[2], 'WEBP', quality=82, method=6); print(im.size, round(im.width / im.height, 3))", tmp, path.join(DEST, nombre + '.webp')], { stdio: 'inherit' });
  console.log(nombre, fs.statSync(path.join(DEST, nombre + '.webp')).size >> 10, 'KB · escenario', medida.w + '×' + medida.h, 'aspecto', (medida.w / medida.h).toFixed(3), avisos.length ? avisos : '');
  await browser.close();
}
// (2026-11-16) El .tpl anota con qué combinación de entrada se sacó el póster (data-poster-de): si un día la de entrada cambia (algo se agotó
// y se reemplazó solo), el armador no muestra un póster viejo (posterVale).
if (firma) {
  const TPL = path.resolve(AQUI, '..', '..', '..', 'tienda', 'snipplets', 'panthera', 'oreja.tpl');
  let t = fs.readFileSync(TPL, 'utf8');
  t = /data-poster-de="[^"]*"/.test(t) ? t.replace(/data-poster-de="[^"]*"/, 'data-poster-de="' + firma + '"') : t.replace('data-pnt-or ', 'data-pnt-or data-poster-de="' + firma + '" ');
  fs.writeFileSync(TPL, t);
  console.log('oreja.tpl: data-poster-de="' + firma + '"');
}
process.exit(0);
