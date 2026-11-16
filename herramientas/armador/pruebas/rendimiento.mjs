// Rendimiento del armador: node herramientas/armador/pruebas/rendimiento.mjs <etiqueta> [query]
// - fps de la página con el armador a la vista (Chrome nuevo para cada medida: Chrome sin ventana se clava en 30 fps después de
//   un rato, así que solo vale la primera medida de cada navegador).
// - Si la escena tiene el hook de pruebas (?a3debug → window.__a3): ms por cuadro del 3D solo (CPU + GPU, sincronizado con
//   readPixels), por nivel de calidad, y memoria (geometrías/texturas) antes y después de sumar y sacar 30 charms.
// Deja el resultado en herramientas/armador/pruebas/capturas/<etiqueta>/rendimiento.json
import path from 'path';
import fs from 'fs';
import { abrir, irASeccion, esperaListo, espera, AQUI } from './comun.mjs';

const etiqueta = process.argv[2] || 'prueba';
const query = process.argv[3] || '';
const DIR = path.join(AQUI, 'capturas', etiqueta);
fs.mkdirSync(DIR, { recursive: true });
const res = {};

async function fps(nombre, opciones) {
  const { browser, page, avisos } = await abrir({ ...opciones, query });
  await espera(3000); await irASeccion(page); await esperaListo(page, 5000);
  res[nombre] = await page.evaluate(() => new Promise((ok) => {
    let n = 0, t0 = performance.now(), peor = 0, prev = t0;
    function f(t) { n++; peor = Math.max(peor, t - prev); prev = t; if (t - t0 < 4000) requestAnimationFrame(f); else ok({ fps: +(n / ((t - t0) / 1000)).toFixed(1), peorMs: +peor.toFixed(1) }); }
    requestAnimationFrame(f);
  }));
  if (await page.evaluate(() => !!(window.__a3 && window.__a3.medir))) {
    res[nombre].escena = await page.evaluate(() => window.__a3.medir());
  }
  res[nombre].avisos = avisos.slice(0, 10);
  await browser.close();
}
await fps('compu 1600×900 2×', { ancho: 1600, alto: 900, dpr: 2 });
await fps('celular 390×844 3× (CPU 4× más lenta)', { ancho: 390, alto: 844, dpr: 3, celular: true, cpu: 4 });

// memoria: sumar y sacar 30 charms (solo con el hook)
{
  const { browser, page } = await abrir({ query });
  await espera(3000); await irASeccion(page); await esperaListo(page, 4000);
  if (await page.evaluate(() => !!(window.__a3 && window.__a3.memoria))) res.memoria = await page.evaluate(() => window.__a3.memoria(30));
  await browser.close();
}
fs.writeFileSync(path.join(DIR, 'rendimiento.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
process.exit(0);
