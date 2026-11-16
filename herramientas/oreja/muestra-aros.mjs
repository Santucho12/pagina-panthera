// Cambia los aros de la escena por varias combinaciones y saca una captura de cada una (para revisar todos los tipos)
import http from 'http'; import fs from 'fs'; import path from 'path';
import { createRequire } from 'module';
const require = createRequire('C:/Users/AMDRYZEN7/Desktop/Trabajos Freelance/Pagina Panthera/package.json');
const puppeteer = require('puppeteer-core');
const RAIZ = path.resolve('.'), TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(new URL(q.url, 'http://x').pathname); const f = path.join(RAIZ, u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise((ok) => srv.listen(5712, ok));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const COMBOS = (process.argv[2] || 'plan,boli,torn,cshi;cohe,apol,swep,cmin;carr,love,satu,cshi;zapa,sire,musi,cmin').split(';');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
try {
  const p = await b.newPage(); const avisos = [];
  p.on('pageerror', (e) => avisos.push('pageerror: ' + String(e).slice(0, 300)));
  p.on('console', (m) => { if (m.type() === 'error') avisos.push(m.text().slice(0, 200)); });
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.goto('http://localhost:5712/artefacto/_prueba.html?ordebug', { waitUntil: 'load', timeout: 90000 });
  for (let t = 0; t < 60; t++) { const ok = await p.evaluate(() => document.querySelector('[data-pnt-or]').shadowRoot.getElementById('cargando').classList.contains('listo')); if (ok) break; await espera(500); }
  await espera(4000);
  const caja = await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  for (let i = 0; i < COMBOS.length; i++) {
    const ks = COMBOS[i].split(',');
    await p.evaluate((ks) => { const o = window.__or; o.vivos.slice().forEach((a) => { if (!a.sale) o.api.quitar(a.k); });
      setTimeout(() => { ['l1', 'l2', 'l3', 'cuff'].forEach((id, j) => { if (ks[j]) o.api.agregar(ks[j], null, id, true); }); }, 900); }, ks);
    await espera(4200);
    await p.screenshot({ path: 'v' + (i + 1) + '-' + ks.join('-') + '.png', clip: caja });
  }
  console.log(avisos.length ? 'AVISOS:\n' + avisos.join('\n') : 'sin errores en la consola');
} finally { await b.close(); srv.close(); }
