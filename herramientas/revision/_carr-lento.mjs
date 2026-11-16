// Línea de tiempo de los dos carruseles del inicio en un celular lento (CPU x6): ¿hay un momento con 1 tarjeta por fila?
// node herramientas/revision/_carr-lento.mjs [cpu=6] [ancho=390]
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const CPU = +(process.argv[2] || 6), ANCHO = +(process.argv[3] || 390);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
await p.setViewport({ width: ANCHO, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const c = await p.target().createCDPSession(); await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
const errores = []; p.on('pageerror', (e) => errores.push(String(e).slice(0, 200))); p.on('console', (m) => { if (/pnt|error/i.test(m.text())) errores.push('console: ' + m.text().slice(0, 200)); });
await p.evaluateOnNewDocument(() => {
  const t0 = performance.now(); window.__linea = [];
  const muestra = () => {
    const fila = { t: Math.round(performance.now() - t0) };
    for (const k of ['featured', 'sale']) {
      const cont = document.querySelector('.js-swiper-' + k); if (!cont) { fila[k] = '-'; continue; }
      const sl = [...cont.querySelectorAll('.swiper-slide')].filter((s) => s.getBoundingClientRect().width > 0);
      const w = cont.getBoundingClientRect().width, s0 = sl[0] ? sl[0].getBoundingClientRect().width : 0;
      const card = sl[0] && sl[0].querySelector('.js-item-product, .pnt-mv-portada');
      let op = 1; for (let e = card; e && e !== document.body; e = e.parentElement) op *= +getComputedStyle(e).opacity;
      const ours = !!cont.querySelector('[data-pnt-carrusel]');
      const ini = cont.classList.contains('swiper-container-initialized') || !!cont.swiper;
      fila[k] = (ours ? 'NUESTRO' : ini ? 'lima' : 'sin-swiper') + ' porVista=' + (s0 ? (w / s0).toFixed(2) : '?') + ' op=' + op.toFixed(2);
    }
    const ult = window.__linea[window.__linea.length - 1];
    if (!ult || ult.featured !== fila.featured || ult.sale !== fila.sale) window.__linea.push(fila);
  };
  const tic = () => { muestra(); if (performance.now() - t0 < 15000) setTimeout(tic, 50); };
  document.addEventListener('readystatechange', muestra); setTimeout(tic, 0);
  document.addEventListener('DOMContentLoaded', () => window.__linea.push({ t: Math.round(performance.now() - t0), evento: 'DOMContentLoaded' }));
  window.addEventListener('load', () => window.__linea.push({ t: Math.round(performance.now() - t0), evento: 'load' }));
});
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 180000 });
await espera(16000);
const linea = await p.evaluate(() => window.__linea);
for (const f of linea) console.log(f.evento ? `${String(f.t).padStart(6)} ms  ── ${f.evento}` : `${String(f.t).padStart(6)} ms  featured: ${f.featured}   |   sale: ${f.sale}`);
console.log('errores:', errores.length ? errores : 'ninguno');
await b.close(); process.exit(0);
