// Prueba del prototipo "Armá tu oreja": abre _prueba.html (index.html con su esqueleto), espera el 3D y saca capturas.
// Uso: node prueba-armador.mjs <salida-prefijo> [ancho] [alto] [cel] [acciones]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('C:/Users/AMDRYZEN7/Desktop/Trabajos Freelance/Pagina Panthera/package.json');
const puppeteer = require('puppeteer-core');
const [pref, ancho = '1440', alto = '900', cel = '', acciones = ''] = process.argv.slice(2);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// servidor propio, solo mientras dura la prueba (no dejar servidores en segundo plano: la máquina anda justa de memoria)
const RAIZ = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(new URL(q.url, 'http://x').pathname)); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise((ok) => srv.listen(5712, ok));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new',
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
const p = await b.newPage(); const avisos = [];
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') avisos.push(m.type() + ': ' + m.text().slice(0, 240)); });
p.on('pageerror', (e) => avisos.push('pageerror: ' + String(e).slice(0, 400)));
p.on('requestfailed', (r) => avisos.push('falló: ' + r.url().slice(0, 120)));
const esCel = cel === 'cel';
await p.setViewport({ width: +ancho, height: +alto, deviceScaleFactor: 1, isMobile: esCel, hasTouch: esCel });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.goto('http://localhost:5712/artefacto/_prueba.html?ordebug', { waitUntil: 'load', timeout: 120000 });
const listo = () => p.evaluate(() => { const h = document.querySelector('[data-pnt-or]'); const c = h && h.shadowRoot && h.shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); });
let t = 0; while (!(await listo()) && t < 60000) { await espera(500); t += 500; }
const tiempos = await p.evaluate(() => window.__or && window.__or.tiempos);
console.log('3D listo:', await listo(), 'en', t, 'ms', JSON.stringify(tiempos));
await espera(4200);
await p.screenshot({ path: pref + '-1.png' });
if (acciones.includes('lupa')) {
  await p.evaluate(() => { const v = window.__or.vivos.filter((a) => !a.sale); if (v[0]) window.__or.lupa(v[0].k); });
  await espera(2200); await p.screenshot({ path: pref + '-lupa.png' });
  await p.evaluate(() => window.__or.lupa(null)); await espera(800);
}
if (acciones.includes('suma')) {
  await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot; r.querySelector('.chip[data-c="Disney"]').click(); });
  await espera(400);
  await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot; const c = r.querySelector('.card[data-k="espm"]'); c && c.click(); });
  await espera(2600); await p.screenshot({ path: pref + '-suma.png' });
}
if (acciones.includes('gira')) {
  await p.evaluate(() => window.__or.gira(0.7)); await espera(1600); await p.screenshot({ path: pref + '-gira.png' });
}
console.log(avisos.length ? avisos.join('\n') : 'sin avisos');
await b.close(); srv.close();
