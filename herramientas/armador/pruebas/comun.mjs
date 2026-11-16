// Banco de pruebas del armador 3D ("Armá tu pulsera"): utilidades compartidas. Corre sobre el preview (npm run dev, localhost:5700),
// que tiene que estar prendido (no se apaga nunca). Nada de esto se sube: vive fuera de tienda/.
// Receta (verificada 2026-11-11):
//  - Chrome del sistema con GPU (--enable-gpu --ignore-gpu-blocklist --use-angle=d3d11) y "sin movimiento reducido" emulado.
//  - /__recarga bloqueado (si no, el preview recarga la página a mitad de la prueba) y los POST a /comprar/ interceptados con
//    {"success":true} (el carrito real no se toca).
//  - La página usa Lenis: para ir a la sección, lenis.stop() + scrollTo inmediato, y se repite antes de cada captura.
//  - La captura de elemento del canvas sale en blanco: se captura la ventana y se recorta el escenario.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const puppeteer = require('../../../node_modules/puppeteer-core');

export const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export const PREVIEW = 'http://localhost:5700/';
export const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export async function abrir({ ancho = 1600, alto = 900, dpr = 2, cpu = 1, query = '', sinCdn = false, celular = false } = {}) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  const avisos = [], pedidos = [];
  // los "Failed to load resource" de Chrome no dicen qué archivo: se anotan con su URL desde requestfailed (salvo lo que la prueba
  // corta a propósito: /__recarga, analytics, el CDN si se pidió sinCdn)
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !t.startsWith('Failed to load resource')) avisos.push(m.type() + ': ' + t.slice(0, 220)); });
  page.on('pageerror', (e) => avisos.push('pageerror: ' + String(e).slice(0, 220)));
  page.on('requestfailed', (r) => { const u = r.url(); if (!/__recarga|__version|5700\/comprar|google-analytics|analytics\.google|googletagmanager|doubleclick|facebook|myperfit|\.mp4/.test(u) && !(sinCdn && u.includes('jsdelivr'))) avisos.push('falló: ' + u.slice(0, 160) + ' ' + ((r.failure() && r.failure().errorText) || '')); });
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    const u = r.url();
    if (/\/__(recarga|version)/.test(u)) return r.abort();
    if (sinCdn && u.includes('cdn.jsdelivr.net')) return r.abort();
    if (r.method() === 'POST' && u.includes('/comprar')) { pedidos.push(r.postData() || ''); return r.respond({ status: 200, contentType: 'application/json', body: '{"success":true}' }); }
    // "Agregar al carrito" después lleva a /comprar/: un 204 cancela esa navegación y la página queda donde estaba
    if (r.isNavigationRequest() && r.frame() === page.mainFrame() && u.includes('/comprar')) { pedidos.push('ir al carrito'); return r.respond({ status: 204, body: '' }); }
    r.continue();
  });
  await page.setViewport({ width: ancho, height: alto, deviceScaleFactor: dpr, isMobile: celular, hasTouch: celular });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  if (cpu > 1) { const s = await page.target().createCDPSession(); await s.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
  await page.goto(PREVIEW + (query ? '?' + query : ''), { waitUntil: 'domcontentloaded', timeout: 120000 });
  page.__dpr = dpr;     // la escala de las capturas sale de acá (devicePixelRatio de la página a veces vuelve 1 en medio de la prueba)
  return { browser, page, avisos, pedidos };
}

// Deja el escenario del armador a la vista (40 px debajo del borde de arriba) y frena Lenis. Mientras corre la intro de la home el
// scroll está trabado: se reintenta hasta que el escenario queda en su lugar (hasta ~15 s).
export async function irASeccion(page) {
  for (let i = 0; i < 50; i++) {
    const top = await page.evaluate(() => {
      const st = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('stage');
      const y = st.getBoundingClientRect().top + window.scrollY - 40;
      if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
      window.scrollTo(0, y);
      return st.getBoundingClientRect().top;
    });
    if (Math.abs(top - 40) < 4) return true;
    await espera(300);
  }
  return false;
}

// Espera a que el 3D esté listo (sin la ruedita) y la intro termine. En celular la intro de la home vuelve el scroll arriba al
// terminar: por eso se reubica la sección mientras se espera.
export async function esperaListo(page, extra = 4500) {
  const listo = () => page.evaluate(() => { const r = document.querySelector('[data-pnt-a3]'); const c = r && r.shadowRoot && r.shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); });
  for (let i = 0; i < 120 && !(await listo()); i++) { await irASeccion(page); await espera(500); }
  for (let t = 0; t < extra; t += 500) { await irASeccion(page); await espera(500); }
}

// Captura del escenario: ventana entera y recorte (con CDP; si falla, se recorta con Python)
export async function capturaEscenario(page, archivo, { todo = false } = {}) {
  await irASeccion(page); await espera(140);
  const caja = await page.evaluate((todo) => {
    const h = document.querySelector('[data-pnt-a3]');
    const el = todo ? h : h.shadowRoot.getElementById('stage');
    const r = el.getBoundingClientRect();
    const y = Math.max(0, r.top), alto = Math.min(r.bottom, innerHeight) - y;
    // CDP pide la caja en coordenadas de la página (no de la ventana): se suma el scroll
    return { x: Math.max(0, r.left) + scrollX, y: y + scrollY, width: Math.min(r.width, innerWidth), height: alto, dpr: devicePixelRatio };
  }, todo);
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const cdp = await page.target().createCDPSession();
  const { dpr, ...clip } = caja;
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { ...clip, scale: page.__dpr || dpr } });
  fs.writeFileSync(archivo, Buffer.from(data, 'base64'));
  await cdp.detach();
  return caja;
}

// Ayudas dentro del componente (Shadow DOM)
export const enA3 = (page, fn, ...args) => page.evaluate((src, args) => {
  const raiz = document.querySelector('[data-pnt-a3]').shadowRoot;
  return (new Function('raiz', 'args', 'return (' + src + ')(raiz, ...args)'))(raiz, args);
}, fn.toString(), args);
export const clicBase = (page, k) => enA3(page, (raiz, k) => raiz.querySelector('.base[data-b="' + k + '"]').click(), k);
export const clicCharm = (page, k) => enA3(page, (raiz, k) => raiz.querySelector('.card[data-k="' + k + '"]').click(), k);
export const clicTalle = (page, t) => enA3(page, (raiz, t) => raiz.querySelector('.talle[data-t="' + t + '"]').click(), t);
export const BASES = ['silv', 'hart', 'crys', 'circ', 'rosb', 'rigi'];   // 'arbo' (Cierre árbol family) ya no está en la tienda y el armador no la muestra (2026-11-15)
