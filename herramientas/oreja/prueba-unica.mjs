// Prueba de una sola vez: levanta un servidor estático propio, saca capturas del prototipo y cierra todo al terminar
// (sin servidores en segundo plano: la máquina anda justa de memoria). Uso: node prueba-unica.mjs <prefijo> <ancho> <alto> [cel] [lupa]
import http from 'http'; import fs from 'fs'; import path from 'path';
import { createRequire } from 'module';
const require = createRequire('C:/Users/AMDRYZEN7/Desktop/Trabajos Freelance/Pagina Panthera/package.json');
const puppeteer = require('puppeteer-core');
const [pref, ancho = '1440', alto = '900', cel = '', acc = ''] = process.argv.slice(2);
const RAIZ = path.resolve('.'), TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.txt': 'text/plain', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(new URL(q.url, 'http://x').pathname); const f = path.join(RAIZ, u); if (!f.startsWith(RAIZ)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise((ok) => srv.listen(5712, ok));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
try {
  const p = await b.newPage(); const avisos = [];
  p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('404')) avisos.push(m.text().slice(0, 200)); });
  p.on('pageerror', (e) => avisos.push('pageerror: ' + String(e).slice(0, 300)));
  const esCel = cel === 'cel';
  await p.setViewport({ width: +ancho, height: +alto, deviceScaleFactor: 1, isMobile: esCel, hasTouch: esCel });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.goto('http://localhost:5712/artefacto/_prueba.html?ordebug', { waitUntil: 'load', timeout: 90000 });
  for (let t = 0; t < 60; t++) { const ok = await p.evaluate(() => document.querySelector('[data-pnt-or]').shadowRoot.getElementById('cargando').classList.contains('listo')); if (ok) break; await espera(500); }
  await espera(4800);
  const caja = await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await p.screenshot({ path: pref + '-escenario.png', clip: caja });
  if (acc.includes('lupa')) { await p.evaluate(() => { const v = window.__or.vivos.filter((a) => !a.sale); window.__or.lupa(v[1] ? v[1].k : v[0].k); }); await espera(2400); await p.screenshot({ path: pref + '-lupa.png', clip: caja }); }
  console.log(avisos.length ? 'AVISOS:\n' + avisos.join('\n') : 'sin errores en la consola');
} finally { await b.close(); srv.close(); }
