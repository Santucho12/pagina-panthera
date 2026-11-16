// "Armá tu oreja" en la TIENDA LOCAL (localhost:5700, el preview: tiene que estar prendido; no se apaga nunca). Nada se sube.
// Misma receta que el banco del armador de pulseras (herramientas/armador/pruebas/comun.mjs):
//  - Chrome con GPU y "sin movimiento reducido"; /__recarga bloqueado; los POST a /comprar/ se interceptan y contestan
//    {"success":true} (el carrito real NO se toca) y la ida al carrito se corta con un 204.
//  - Lenis: lenis.stop() + scrollTo inmediato; la captura se hace de la ventana, recortada.
// Uso: node herramientas/oreja/pruebas/tienda.mjs [etiqueta]   → capturas en herramientas/oreja/pruebas/capturas/<etiqueta>/
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const puppeteer = require('../../../node_modules/puppeteer-core');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(AQUI, 'capturas', process.argv[2] || 'tienda');
fs.mkdirSync(DIR, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0, mal = 0;
function chequea(nombre, cond, extra) { if (cond) ok++; else mal++; console.log((cond ? '✔ ' : '✘ ') + nombre + (extra ? ' — ' + extra : '')); }

async function abrir(ancho, alto, celular) {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
  const page = await browser.newPage(), avisos = [], pedidos = [];
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !t.startsWith('Failed to load resource')) avisos.push(m.type() + ': ' + t.slice(0, 200)); });
  page.on('pageerror', (e) => avisos.push('pageerror: ' + String(e).slice(0, 200)));
  page.on('requestfailed', (r) => { const u = r.url(); if (!/__recarga|__version|5700\/comprar|analytics|googletagmanager|doubleclick|facebook|myperfit|\.mp4/.test(u)) avisos.push('falló: ' + u.slice(0, 140)); });
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    const u = r.url();
    if (/\/__(recarga|version)/.test(u)) return r.abort();
    if (r.method() === 'POST' && u.includes('/comprar')) { pedidos.push(r.postData() || ''); return r.respond({ status: 200, contentType: 'application/json', body: '{"success":true}' }); }
    if (r.isNavigationRequest() && r.frame() === page.mainFrame() && u.includes('/comprar')) { pedidos.push('ir al carrito'); return r.respond({ status: 204, body: '' }); }
    r.continue();
  });
  await page.setViewport({ width: ancho, height: alto, deviceScaleFactor: 1, isMobile: !!celular, hasTouch: !!celular });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto('http://localhost:5700/?ordebug', { waitUntil: 'domcontentloaded', timeout: 90000 });
  return { browser, page, avisos, pedidos };
}
async function irA(page, sel, arriba = 40) {
  for (let i = 0; i < 50; i++) {
    const top = await page.evaluate((sel, arriba) => {
      const h = document.querySelector(sel); if (!h) return 1e9;
      const st = h.shadowRoot ? h.shadowRoot.getElementById('stage') : h;
      const y = st.getBoundingClientRect().top + window.scrollY - arriba;
      if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
      window.scrollTo(0, y);
      return st.getBoundingClientRect().top;
    }, sel, arriba);
    if (Math.abs(top - arriba) < 4) return true;
    await espera(300);
  }
  return false;
}
async function listo(page) {
  for (let i = 0; i < 120; i++) {
    await irA(page, '[data-pnt-or]');
    const l = await page.evaluate(() => { const h = document.querySelector('[data-pnt-or]'); const c = h && h.shadowRoot && h.shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); });
    if (l) return true;
    await espera(500);
  }
  return false;
}
// (el escenario queda debajo del menú fijo de la tienda, que mide ~120 px, para que no lo tape)
async function captura(page, archivo, todo) {
  await irA(page, '[data-pnt-or]', 140); await espera(250);
  const caja = await page.evaluate((todo) => {
    const h = document.querySelector('[data-pnt-or]'), el = todo ? h.closest('section') : h.shadowRoot.getElementById('stage'), r = el.getBoundingClientRect();
    // en coordenadas de la página (no de la ventana): se suma el scroll
    const y = Math.max(0, r.top); return { x: Math.max(0, r.left) + scrollX, y: y + scrollY, width: Math.min(r.width, innerWidth), height: Math.min(r.bottom, innerHeight) - y };
  }, todo);
  await page.screenshot({ path: archivo, clip: caja });
}
const enOr = (page, fn, ...a) => page.evaluate((src, a) => { const raiz = document.querySelector('[data-pnt-or]').shadowRoot; return (new Function('raiz', 'a', 'return (' + src + ')(raiz, a)'))(raiz, a); }, fn.toString(), a);

// 1) compu: carga, ejemplo, capturas en tres anchos
for (const [ancho, alto] of [[1440, 900], [1280, 800], [1920, 1080]]) {
  const { browser, page, avisos, pedidos } = await abrir(ancho, alto);
  try {
    await espera(2500);
    const l = await listo(page); await espera(5000);
    if (ancho === 1440) chequea('carga el 3D en la tienda', l);
    await captura(page, path.join(DIR, 'compu-' + ancho + '.png'), false);
    if (ancho === 1440) {
      const vivos = await page.evaluate(() => window.__or ? window.__or.vivos.filter((a) => !a.sale).map((a) => a.k + '@' + a.hueco).join(' ') : '');
      // los aros de entrada: data-ejemplo de oreja.tpl ("l1:tres,l2:moon,l3:hadr" → "tres@l1 moon@l2 hadr@l3")
      const ej = (fs.readFileSync(path.resolve(AQUI, '..', '..', '..', 'tienda', 'snipplets', 'panthera', 'oreja.tpl'), 'utf8').match(/data-ejemplo="([^"]*)"/) || [])[1] || '';
      const esperado = ej.split(',').filter(Boolean).map((x) => x.split(':')[1] + '@' + x.split(':')[0]).join(' ');
      chequea('arranca con los aros de entrada (' + esperado + ')', vivos === esperado, vivos);
      // 2) carrito real (interceptado): un pedido por pieza, con su producto y variante, y después al carrito
      const datos = await enOr(page, (raiz) => [...raiz.querySelectorAll('#lista li[data-pos]')].map((li) => li.dataset.pos));
      await enOr(page, (raiz) => raiz.getElementById('cta').click()); await espera(4500);
      const posts = pedidos.filter((x) => x.includes('add_to_cart'));
      chequea('un POST a /comprar/ por pieza', posts.length === datos.length, posts.length + ' de ' + datos.length);
      chequea('cada POST lleva producto y variante', posts.every((x) => /add_to_cart=\d+/.test(x) && /variant_id=\d+/.test(x) && x.includes('add_to_cart_enhanced=1')), posts[0]);
      chequea('después abre el carrito lateral', pedidos.includes('ir al carrito') || await page.evaluate(() => !!document.querySelector('.is-abierto iframe[src*="pnt-panel"]')));
      // 3) el cartel de WhatsApp no se abre encima del armador
      await irA(page, '[data-pnt-or]'); await espera(16000); await irA(page, '[data-pnt-or]');
      const wa = await page.evaluate(() => { const g = document.querySelector('.wa-globo'); return g ? g.classList.contains('is-open') : null; });
      chequea('el cartel de WhatsApp no tapa el armador', wa !== true, 'abierto: ' + wa);
    }
    console.log('compu ' + ancho + ': ' + (avisos.length ? avisos.join(' | ') : 'sin avisos'));
  } finally { await browser.close(); }
}
// 4) celular
{
  const { browser, page, avisos } = await abrir(390, 844, true);
  try {
    await espera(2500); const l = await listo(page); await espera(5000);
    chequea('carga en el celular', l);
    await captura(page, path.join(DIR, 'celular.png'), false);
    await irA(page, '[data-pnt-or]'); await espera(900);      // en el escenario (la barra se esconde cuando ya se ve el total de abajo)
    // (2026-11-14) con el escenario de celular más bajo, a esta altura ya puede verse el total del panel: ahí la barra se esconde a propósito.
    // Vale si está la barra O si el total de verdad se ve (≥ 40 %): nunca los dos escondidos.
    const barra = await page.evaluate(() => { const h = document.querySelector('[data-pnt-or]'); if (h.classList.contains('barra-on')) return 'barra'; const t = h.shadowRoot.querySelector('.panel .total, #total-ranura .total, .total'); const r = t.getBoundingClientRect(); const v = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); return r.height && v / r.height >= 0.4 ? 'total a la vista' : ''; });
    chequea('barra fija del total en el celular (o el total a la vista)', !!barra, barra);
    console.log('celular: ' + (avisos.length ? avisos.join(' | ') : 'sin avisos'));
  } finally { await browser.close(); }
}
console.log(`\n${ok} bien, ${mal} mal`);
