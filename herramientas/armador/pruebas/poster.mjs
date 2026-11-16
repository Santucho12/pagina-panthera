// Póster del armador: node herramientas/armador/pruebas/poster.mjs
// Renderiza la pulsera de entrada (Silver Flower con Painter, Mickey Shine y Stitch: BASE_VISTA y DE_ENTRADA de armar3d.js), quieta y sin destellos, con fondo
// transparente, y la guarda como tienda/static/panthera/arma/poster.webp (compu y tablet) y poster-m.webp (celular). El armador la
// muestra si el 3D tarda en cargar y si el navegador no puede mostrar 3D. Volver a correrlo si cambia la pulsera de ejemplo.
// (2026-11-12) La foto es el ESCENARIO ENTERO en la pose exacta del primer cuadro del 3D cuando reemplaza al póster (__a3.poster():
// tiempo 0, colgantes en reposo, encuadre en su lugar). armar3d.js (ubicaPoster) la ubica con la misma cuenta de cámara que la
// escena, a partir de la forma de la imagen: por eso se captura sin recortar. La de compu se saca con el total flotando
// (ventana de 1280 px o más: la pulsera va 13 % arriba del centro) y la de celular sin él (5 %); si eso cambia, cambiar sube0 ahí.
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { abrir, irASeccion, esperaListo, espera, AQUI } from './comun.mjs';

const DEST = path.resolve(AQUI, '..', '..', '..', 'tienda', 'static', 'panthera', 'arma');
let firma = '';   // (2026-11-16) la combinación de entrada que muestra el póster
for (const [nombre, op] of [['poster', { ancho: 1536, alto: 730, dpr: 2 }], ['poster-m', { ancho: 390, alto: 844, dpr: 2, celular: true }]]) {
  const { browser, page, avisos } = await abrir({ ...op, query: 'a3debug&a3quieto=1&a3nivel=alto' });
  await espera(3000); await irASeccion(page); await esperaListo(page, 6000);
  if (!firma) firma = await page.evaluate(() => document.querySelector('[data-pnt-a3]').getAttribute('data-entrada') || '');
  const png = await page.evaluate(() => { window.__a3.relojManual(true); for (let i = 0; i < 40; i++) window.__a3.avanza(1 / 30); return window.__a3.poster(); });
  const tmp = path.join(AQUI, 'capturas', nombre + '.png');
  fs.writeFileSync(tmp, Buffer.from(png.split(',')[1], 'base64'));
  execFileSync('python', ['-c', "import sys; from PIL import Image; im = Image.open(sys.argv[1]); im.save(sys.argv[2], 'WEBP', quality=84, alpha_quality=90, method=6); print(im.size)", tmp, path.join(DEST, nombre + '.webp')], { stdio: 'inherit' });
  console.log(nombre, fs.statSync(path.join(DEST, nombre + '.webp')).size >> 10, 'KB', avisos.length ? avisos : '');
  await browser.close();
}
// (2026-11-16) El .tpl anota con qué combinación de entrada se sacó el póster (data-poster-de): si un día la de entrada cambia (algo se agotó
// y se reemplazó solo), el armador no muestra un póster viejo (posterVale).
if (firma) {
  const TPL = path.resolve(AQUI, '..', '..', '..', 'tienda', 'snipplets', 'panthera', 'armar.tpl');
  let t = fs.readFileSync(TPL, 'utf8');
  t = /data-poster-de="[^"]*"/.test(t) ? t.replace(/data-poster-de="[^"]*"/, 'data-poster-de="' + firma + '"') : t.replace('data-pnt-a3 ', 'data-pnt-a3 data-poster-de="' + firma + '" ');
  fs.writeFileSync(TPL, t);
  console.log('armar.tpl: data-poster-de="' + firma + '"');
}
process.exit(0);
