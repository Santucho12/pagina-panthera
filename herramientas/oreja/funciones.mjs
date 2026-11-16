// Banco de funciones del prototipo "Armá tu oreja" (como herramientas/armador/pruebas/funciones.mjs del armador de pulseras)
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
const p = await b.newPage(); const avisos = [];
p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('404')) avisos.push(m.text().slice(0, 200)); });
p.on('pageerror', (e) => avisos.push('pageerror: ' + String(e).slice(0, 300)));
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.goto('http://localhost:5712/artefacto/_prueba.html?ordebug', { waitUntil: 'load' });
for (let t = 0; t < 60; t++) { const ok = await p.evaluate(() => document.querySelector('[data-pnt-or]').shadowRoot.getElementById('cargando').classList.contains('listo')); if (ok) break; await espera(500); }
await espera(4500);
const R = (fn, ...a) => p.evaluate((src, a) => { const raiz = document.querySelector('[data-pnt-or]').shadowRoot; return (new Function('raiz', 'a', 'return (' + src + ')(raiz, a)'))(raiz, a); }, fn.toString(), a);
const lista = () => R((raiz) => [...raiz.querySelectorAll('#lista li')].map((li) => (li.querySelector('em') ? li.querySelector('em').textContent : '') + ': ' + (li.classList.contains('vacia') ? '(vacío' + (li.classList.contains('activa') ? ', elegido)' : ')') : li.querySelector('.n').childNodes[1].textContent)));
const toast = () => R((raiz) => raiz.getElementById('toast').classList.contains('ve') ? raiz.getElementById('toast-t').textContent : '');
const total = () => R((raiz) => raiz.getElementById('t-lbl').textContent + ' · ' + raiz.getElementById('t-lista').textContent + ' · transf ' + raiz.getElementById('t-tr').textContent);
const vivos = () => p.evaluate(() => window.__or.vivos.filter((a) => !a.sale).map((a) => a.k + '@' + a.hueco).join(' '));
let ok = 0, mal = 0;
function chequea(nombre, cond, extra) { if (cond) ok++; else mal++; console.log((cond ? '✔ ' : '✘ ') + nombre + (extra ? ' — ' + extra : '')); }

chequea('arranca con 2 aros y sin el cartel de ejemplo', (await vivos()) === 'tres@l1 moon@l2' && await R((raiz) => !raiz.getElementById('paso2').hidden && !raiz.getElementById('ejemplo')), await vivos());
for (const k of ['hadr', 'cmin']) { await R((raiz, a) => raiz.querySelector('.card[data-k="' + a[0] + '"]').click(), k); await espera(500); }
await espera(1600);
let L = await lista(); chequea('sumar con las tarjetas (3.er agujero y cuff)', L.join('|').includes('Hada Aurora rosa') && L.length === 4 && await R((raiz) => !raiz.getElementById('paso2').hidden), L.join(' | '));
chequea('3D con 4 piezas', (await vivos()).split(' ').length === 4, await vivos());
// 1) dos agujeros: sale el del 3.º, con "Deshacer"
await R((raiz) => raiz.querySelector('#huecos .talle[data-h="2"]').click()); await espera(700);
L = await lista(); let T = await toast();
chequea('con 2 agujeros sale el del 3.º', L.length === 3 && !L.join('|').includes('Hada Aurora rosa'), L.join(' | '));
chequea('avisa y ofrece deshacer', T.includes('Sacamos') && T.includes('2 aritos'), T);
await R((raiz) => raiz.getElementById('toast-b').click()); await espera(1200);
L = await lista(); chequea('deshacer vuelve a 3 agujeros con el aro', L.length === 4 && L.join('|').includes('Hada Aurora rosa'), L.join(' | '));
chequea('el 3D lo vuelve a poner', (await vivos()).includes('hadr@l3'), await vivos());
// 2) sacar el del 2.º agujero (✕) → queda libre y elegido; una tarjeta va ahí
await R((raiz) => raiz.querySelector('#lista li[data-pos="l2"] [data-quitar]').click()); await espera(600);
L = await lista(); chequea('sacar deja el 2.º libre y elegido', L[1].includes('vacío, elegido'), L.join(' | '));
await R((raiz) => raiz.querySelector('.card[data-k="flor"]').click()); await espera(1400);
L = await lista(); chequea('la tarjeta va al agujero elegido', L[1].includes('Flor turquesa'), L.join(' | '));
// 3) mover: el del 1.º baja al 2.º (se intercambian)
await R((raiz) => raiz.querySelector('#lista li[data-pos="l1"] [data-mover][data-d="1"]').click()); await espera(900);
L = await lista(); chequea('mover intercambia 1.º y 2.º', L[0].includes('Flor turquesa') && L[1].includes('Tres circonios'), L.join(' | '));
chequea('el 3D los cambia de agujero', (await vivos()).includes('flor@l1') && (await vivos()).includes('tres@l2'), await vivos());
// 4) otro ear cuff: reemplaza al de Minnie, con deshacer
await R((raiz) => raiz.querySelector('.card[data-k="cshi"]').click()); await espera(900);
L = await lista(); T = await toast();
chequea('el ear cuff nuevo reemplaza al anterior', L[3].includes('Shine silver'), L.join(' | ') + ' · ' + T);
// 5) arrastrar una tarjeta hasta el 3.er agujero (con el mouse)

await R((raiz) => { raiz.querySelector('.chip[data-c=""]').click(); });
await espera(300);
await p.evaluate(() => { const c = document.querySelector('[data-pnt-or]').shadowRoot.querySelector('.card[data-k="moon"]'); c.scrollIntoView({ block: 'center' }); }); await espera(500);
const pts = await p.evaluate(() => {
  const T = window.__or.THREE, v = new T.Vector3(), cam = window.__or.camera, c = window.__or.renderer.domElement.getBoundingClientRect();
  window.__or.AG.l3.g.getWorldPosition(v); v.project(cam);
  return { x: c.left + (v.x + 1) / 2 * c.width, y: c.top + (1 - v.y) / 2 * c.height };
});
const card = await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot.querySelector('.card[data-k="moon"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.width / 2 }; });
await p.mouse.move(card.x, card.y); await p.mouse.down(); await p.mouse.move(card.x + 30, card.y + 10, { steps: 4 });
await p.mouse.move(pts.x + 8, pts.y + 6, { steps: 14 }); await espera(150); await p.mouse.up(); await espera(1500);
L = await lista(); chequea('arrastrar suelta en el agujero más cercano (3.º)', L[2].includes('Moon gold'), L.join(' | ') + ' · punto ' + Math.round(pts.x) + ',' + Math.round(pts.y));
// 6) el total y el botón del carrito (simulado)
const tt = await total(); chequea('total con 3 aros + ear cuff', tt.startsWith('Tu oreja: 3 aros + ear cuff'), tt);
await R((raiz) => raiz.getElementById('cta').click()); await espera(1300);
T = await toast(); chequea('el botón del carrito festeja y avisa que es prototipo', T.includes('Prototipo'), T);
await espera(1500); await p.screenshot({ path: 'funciones-final.png' });
console.log(`\n${ok} bien, ${mal} mal`); console.log(avisos.length ? 'AVISOS:\n' + avisos.join('\n') : 'sin errores en la consola');
await b.close(); srv.close();
