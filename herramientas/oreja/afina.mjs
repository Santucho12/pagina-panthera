// Prueba terminaciones de la oreja en vivo (cambia el material con __or y recorta el escenario)
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('C:/Users/AMDRYZEN7/Desktop/Trabajos Freelance/Pagina Panthera/package.json');
const puppeteer = require('puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// servidor propio, solo mientras dura la prueba (no dejar servidores en segundo plano: la máquina anda justa de memoria)
const RAIZ = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(new URL(q.url, 'http://x').pathname)); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise((ok) => srv.listen(5712, ok));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.goto('http://localhost:5712/artefacto/_prueba.html?ordebug', { waitUntil: 'load' });
for (let t = 0; t < 60; t++) { const ok = await p.evaluate(() => { const c = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('cargando'); return c.classList.contains('listo'); }); if (ok) break; await espera(500); }
await espera(4000);
const caja = await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
const V = JSON.parse(process.argv[2]);
for (const [i, v] of V.entries()) {
  await p.evaluate((v) => { const m = window.__or.matOreja; for (const k in v) { if (k === 'ao') continue; if (k === 'color' || k === 'sheenColor' || k === 'emissive') m[k].set(v[k]); else m[k] = v[k]; } m.needsUpdate = true;
    if (v.ao) window.__or.scene.traverse((o) => { if (o.isMesh && o.material === m) { const c = o.geometry.attributes.color; if (!c.userData) c.userData = {}; if (!c.userData.base) c.userData.base = c.array.slice(); for (let j = 0; j < c.array.length; j++) c.array[j] = Math.pow(c.userData.base[j], v.ao); c.needsUpdate = true; } }); }, v);
  await espera(700);
  await p.screenshot({ path: `afina-${i}.png`, clip: caja });
}
await b.close(); console.log('ok', V.length);
srv.close();
