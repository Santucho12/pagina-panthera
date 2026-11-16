// Videos de los movimientos del armador: node herramientas/armador/pruebas/movimiento.mjs <etiqueta> [acciones] [query]
// Con la escena nueva (?a3debug) graba con RELOJ FIJO: la escena avanza 1/30 s por cuadro y se captura cada cuadro, así el video
// sale a 30 cuadros por segundo exactos aunque la prueba sea lenta (las animaciones CSS de la interfaz no van sincronizadas).
// Sin el hook de pruebas (la versión vieja) graba en tiempo real con el screencast de Chrome.
// Acciones: intro, sumar, sacar, lupa, base, talle, festejo, reposo. Salida: capturas/<etiqueta>/mov-<accion>.mp4
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { abrir, irASeccion, esperaListo, espera, clicBase, clicCharm, clicTalle, enA3, AQUI } from './comun.mjs';

const etiqueta = process.argv[2] || 'prueba';
const acciones = (process.argv[3] || 'intro,sumar,sacar,lupa,base,talle,festejo,reposo').split(',');
const query = process.argv[4] || 'a3debug';
const DIR = path.join(AQUI, 'capturas', etiqueta);
const TMP = path.join(DIR, '_cuadros');
fs.mkdirSync(TMP, { recursive: true });

const { browser, page, avisos } = await abrir({ ancho: 1600, alto: 900, dpr: 1, query });
const cdp = await page.target().createCDPSession();
await espera(3000); await irASeccion(page); await esperaListo(page, 4000);
const fijo = await page.evaluate(() => !!(window.__a3 && window.__a3.avanza));

async function caja() {
  return page.evaluate(() => { const r = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.left + scrollX, y: Math.max(0, r.top) + scrollY, width: r.width, height: Math.min(r.bottom, innerHeight) - Math.max(0, r.top) }; });
}
function video(nombre, n) {
  const sal = path.join(DIR, 'mov-' + nombre + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(TMP, 'c%04d.jpg'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-movflags', '+faststart', sal]);
  console.log(nombre, '→', path.basename(sal), n, 'cuadros');
}
async function grabar(nombre, cuadros, hacer) {
  fs.readdirSync(TMP).forEach((f) => fs.unlinkSync(path.join(TMP, f)));
  await irASeccion(page);
  const clip = { ...(await caja()), scale: 1 };
  await page.evaluate(() => window.__a3.relojManual(true));
  if (hacer) await hacer();
  for (let i = 0; i < cuadros; i++) {
    await page.evaluate(() => window.__a3.avanza(1 / 30));
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90, captureBeyondViewport: false, clip });
    fs.writeFileSync(path.join(TMP, 'c' + String(i).padStart(4, '0') + '.jpg'), Buffer.from(data, 'base64'));
  }
  await page.evaluate(() => window.__a3.relojManual(false));
  video(nombre, cuadros);
  await espera(400);
}
if (!fijo) { console.log('esta versión no tiene el hook de pruebas: se graba en tiempo real con el script de antes'); process.exit(1); }

if (acciones.includes('intro')) await grabar('intro', 75, () => page.evaluate(() => window.__a3.repiteIntro()));
if (acciones.includes('sumar')) await grabar('sumar', 60, () => clicCharm(page, 'stit'));
if (acciones.includes('sacar')) await grabar('sacar', 45, () => enA3(page, (raiz) => { const b = raiz.querySelector('[data-quitar="stit"]'); if (b) b.click(); }));
if (acciones.includes('lupa')) {
  await grabar('lupa', 75, () => page.evaluate(() => window.__a3.lupa('stit')));
  await grabar('lupa-cierre', 60, () => page.evaluate(() => window.__a3.lupa('cierre')));
  await page.evaluate(() => window.__a3.lupa(null)); await espera(600);
}
if (acciones.includes('base')) await grabar('base', 100, () => clicBase(page, 'crys'));
if (acciones.includes('talle')) await grabar('talle', 45, () => clicTalle(page, '20 cm'));
if (acciones.includes('festejo')) await grabar('festejo', 80, () => page.evaluate(() => window.__a3.api.festejo()));
if (acciones.includes('reposo')) await grabar('reposo', 120, () => page.evaluate(() => window.__a3.barrido()));
fs.rmSync(TMP, { recursive: true, force: true });
console.log('avisos:', avisos.length ? avisos.slice(0, 8) : 'ninguno');
await browser.close();
process.exit(0);
