// Prueba visual de dos piezas que solo aparecen en casos reales (ítems 96 y 97 de PENDIENTES.md):
//  - Aviso "Seguí acá tu última compra": se agrega al HTML de la página el mismo marcado que pone Tiendanube adentro del encabezado
//    (notification.tpl) y se ve si paginas.js lo saca y cómo queda.
//  - Ventana "¡Descuento exclusivo!" (venta cruzada): se abre con modalOpen() de Lima y un contenido de ejemplo con las clases que
//    usa el componente de Tiendanube (snipplets/cross-selling.tpl). No se agrega nada al carrito.
// node herramientas/revision/prueba-avisos.mjs <carpeta de salida>
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2];
fs.mkdirSync(SALIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const traer = (url, headers) => new Promise((ok, mal) => http.get(url, { headers }, (res) => {
  const partes = []; res.on('data', (d) => partes.push(d)); res.on('end', () => ok({ status: res.statusCode, headers: res.headers, body: Buffer.concat(partes).toString('utf8') }));
}).on('error', mal));
const AVISO = `<div class="js-notification js-notification-status-page notification notification-primary notification-order w-100" style="display:none;" data-url="http://localhost:5700/prueba-pedido-${Date.now()}">
  <div class="container"><div class="row"><div class="col">
    <a class="d-block d-sm-inline mr-2" href="#"><strong>Seguí acá</strong> tu última compra</a>
    <a class="js-notification-close js-notification-status-page-close notification-close position-relative-md" href="#"><svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg></a>
  </div></div></div></div>`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
for (const [modo, vp] of [['compu', { width: 1440, height: 900 }], ['celu', { width: 390, height: 844, isMobile: true, hasTouch: true }]]) {
  const p = await browser.newPage();
  await p.setViewport(vp);
  if (modo === 'celu') await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
  await p.setRequestInterception(true);
  p.on('request', async (r) => {
    const u = r.url();
    if (/\/__(recarga|version)/.test(u)) return r.abort();
    if (r.isNavigationRequest() && r.frame() === p.mainFrame() && u.includes('/productos/jazmin')) {
      const res = await traer(u, { ...r.headers(), 'accept-encoding': 'identity' });
      // cada vista con su propia dirección de pedido: si no, la cruz de la primera prueba lo deja "no mostrar más" para la segunda
      const body = res.body.replace('</header>', AVISO.replace('prueba-pedido-', 'prueba-pedido-' + modo + '-') + '</header>');
      return r.respond({ status: res.status, contentType: 'text/html; charset=utf-8', body });
    }
    r.continue();
  });
  await p.goto('http://localhost:5700/productos/jazmin-1940/', { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => console.log('goto', e.message));
  await espera(3000);
  await p.evaluate(() => { document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()); const w = document.querySelector('.wa-globo'); if (w) w.remove(); });
  const aviso = await p.evaluate(() => {
    const a = document.querySelector('.js-notification-status-page');
    if (!a) return 'no está';
    const r = a.getBoundingClientRect();
    return 'padre: ' + a.parentElement.tagName + (a.parentElement.className ? '.' + String(a.parentElement.className).split(' ')[0] : '') + ' | display: ' + getComputedStyle(a).display + ' | caja: ' + [r.x, r.y, r.width, r.height].map(Math.round).join(',');
  });
  console.log(modo, 'aviso →', aviso);
  await espera(900);
  await p.screenshot({ path: path.join(SALIDA, modo + '-aviso-pedido.png') });
  // La cruz lo cierra (y Lima recuerda no mostrarlo más)
  await p.evaluate(() => { const c = document.querySelector('.js-notification-status-page-close'); if (c) c.click(); });
  await espera(500);
  console.log(modo, 'después de la cruz →', await p.evaluate(() => { const a = document.querySelector('.js-notification-status-page'); return a ? getComputedStyle(a).display : 'no está'; }));
  // Ventana de venta cruzada con contenido de ejemplo
  const abierta = await p.evaluate(() => {
    const cuerpo = document.querySelector('.js-cross-selling-modal-body');
    if (!cuerpo || typeof window.modalOpen !== 'function') return 'sin ventana o sin modalOpen';
    const img = (document.querySelector('.js-product-slide-img') || {}).currentSrc || '';
    cuerpo.innerHTML = `<div class="js-cross-selling-container m-auto" data-quantity="1" data-add-to-cart-translation="Agregar al carrito">
      <div class="position-relative"><div class="label label-accent position-absolute label-top-left">30% OFF</div>
        <img class="img-fluid w-100 lazyload product-image-limited js-cross-selling-product-image" src="${img}" alt="Jazmín"></div>
      <form class="js-product-form px-4 py-3" method="post" action="#" onsubmit="return false">
        <div class="font-big text-center mb-2 js-cross-selling-product-name">Jazmin</div>
        <div class="price-container text-center mb-3"><div class="d-inline-block"><span class="price-compare font-weight-normal mb-0">$71.520</span></div>
          <div class="d-inline-block"><span class="text-primary mb-0 js-cross-selling-promo-price">$50.064</span></div></div>
        <div class="form-group px-2 mb-2"><label class="form-label">Modelo</label><select class="form-select"><option>Único</option></select>
          <div class="form-select-icon"><svg class="icon-inline" viewBox="0 0 512 512"><path d="M256,340.3,451.75,144.55l18.1,18.1L256,376.5,42.15,162.65l18.1-18.1Z"/></svg></div></div>
        <input type="submit" class="js-addtocart js-prod-submit-form btn btn-primary btn-block mt-3 mb-1" value="Agregar al carrito">
      </form></div>`;
    window.modalOpen('#js-cross-selling-modal');
    cuerpo.style.display = 'block';
    return 'ok';
  });
  console.log(modo, 'venta cruzada →', abierta);
  await espera(1400);
  await p.screenshot({ path: path.join(SALIDA, modo + '-venta-cruzada.png') });
  await p.close();
}
await browser.close();
