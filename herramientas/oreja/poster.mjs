// Póster del prototipo: la oreja de ejemplo, quieta, sin destellos (como el póster del armador de pulseras)
import { createRequire } from 'module';
import fs from 'fs'; import http from 'http'; import path from 'path';
const require = createRequire('C:/Users/AMDRYZEN7/Desktop/Trabajos Freelance/Pagina Panthera/package.json');
const puppeteer = require('puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const RAIZ = path.resolve('.'), TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(new URL(q.url, 'http://x').pathname)); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise((ok) => srv.listen(5712, ok));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
for (const [nombre, w, h, cel] of [['poster', 1440, 900, false], ['poster-m', 390, 844, true]]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: cel, hasTouch: cel });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.goto('http://localhost:5712/artefacto/_prueba.html?ordebug&poster', { waitUntil: 'load' });
  for (let t = 0; t < 60; t++) { const ok = await p.evaluate(() => document.querySelector('[data-pnt-or]').shadowRoot.getElementById('cargando').classList.contains('listo')); if (ok) break; await espera(500); }
  await espera(6500);
  const url = await p.evaluate(() => window.__or.poster());
  fs.writeFileSync(nombre + '.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log(nombre, 'ok'); await p.close();
}
await b.close(); srv.close();
