// (2026-11-15) Prueba de la barra de envío gratis del carrito (marca.js → barraEnvio; paginas.css 18): "Te faltan $X para tener envío gratis" +
// "Envío gratis en compras desde $150.000", en la PÁGINA del carrito (compu y celular) y en el carrito LATERAL.
// Usa un carrito de prueba DE VERDAD (1 charm "Family forever", después 2 y 3 unidades) y lo VACÍA al terminar (CLAUDE.md).
//   node herramientas/revision/_envio-gratis.mjs [carpeta]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2] || 'revision-envio-gratis';
fs.mkdirSync(SALIDA, { recursive: true });
const B = 'http://localhost:5700';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const UA_CELU = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const PRODUCTO = { add_to_cart: '363797957', variant_id: '1585834719' };   // Family forever (charm, $66.960)
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let fallas = 0;
const prueba = (ok, txt, extra = '') => { if (!ok) fallas++; console.log(`${ok ? '✔' : '✘'} ${txt}${extra ? ' — ' + extra : ''}`); };

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const ctx = await browser.createBrowserContext();   // cookies propias: el carrito de prueba no se mezcla con nada
const p = await ctx.newPage();
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
const errores = [];
p.on('pageerror', (e) => errores.push(String(e.message).split('\n')[0].slice(0, 140)));
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const modo = async (celu) => { await p.setUserAgent(celu ? UA_CELU : UA); await p.setViewport(celu ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900 }); };
const ir = async (ruta, ms = 3500) => { try { await p.goto(B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }); } catch { /* sigue */ } await espera(ms); await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove())); };
const leer = (doc = 'document') => p.evaluate((doc) => {
  const d = doc === 'marco' ? document.querySelector('.pnt-cp-marco')?.contentDocument : document;
  const c = d && d.querySelector('.pnt-envio-gratis');
  if (!c) return null;
  return { txt: c.innerText.replace(/\s+/g, ' ').trim(), oculto: c.hidden || !c.offsetHeight, ancho: c.querySelector('.pnt-envio-pista i').style.width, enResumen: !!c.closest('#cart-sticky-summary'),
    sub: (d.querySelector('.js-cart-subtotal')?.textContent || '').trim() };
}, doc);
const tocarMas = async () => { await p.evaluate(() => { const b = [...document.querySelectorAll('#shoppingCartPage [data-component="quantity.plus"]')].find((e) => e.offsetWidth); b && b.click(); }); await espera(5500); };
const foto = async (nombre, sel) => {
  const el = sel && await p.$(sel);
  if (el) { await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await espera(500); await el.screenshot({ path: path.join(SALIDA, nombre + '.png') }); }
  else await p.screenshot({ path: path.join(SALIDA, nombre + '.png') });
};
async function vaciar() {
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    await ir('/comprar/', 2500);
    const ids = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-item-id]')].map((e) => e.getAttribute('data-item-id')).filter(Boolean))]);
    if (!ids.length) return 0;
    await p.evaluate(async (ids) => { for (const id of ids) { const fd = new URLSearchParams(); fd.set(`quantity[${id}]`, '0'); await fetch('/cart/update/', { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } }); } }, ids);
  }
  await ir('/comprar/', 2500);
  return p.evaluate(() => document.querySelectorAll('[data-item-id]').length);
}

try {
  await modo(false);
  await ir('/comprar/', 2500);
  const vacio = await leer();
  prueba(!vacio || vacio.oculto, 'carrito vacío: la barra no se ve', JSON.stringify(vacio));
  const ok = await p.evaluate(async (prod) => {
    const b = new URLSearchParams({ ...prod, quantity: '1', zipcode: '', add_to_cart_enhanced: '1' });
    const r = await fetch('/comprar/', { method: 'POST', credentials: 'same-origin', body: b.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } });
    return !!(await r.json()).success;
  }, PRODUCTO);
  prueba(ok, 'carrito de prueba: 1 × Family forever');

  // página del carrito, compu
  await ir('/comprar/');
  let b = await leer();
  prueba(b && !b.oculto && b.enResumen, 'compu: la barra está en la página del carrito, arriba del resumen', JSON.stringify(b));
  prueba(b && /Te faltan \$83\.040 para tener envío gratis/.test(b.txt) && /Envío gratis en compras desde \$150\.000/.test(b.txt), 'compu: dice cuánto falta y el monto', b && b.txt);
  await foto('envio-compu-1', '#cart-sticky-summary');
  await tocarMas();
  b = await leer();
  prueba(b && /Te faltan \$16\.080/.test(b.txt), 'compu: con 2 unidades se actualiza lo que falta', b && `${b.sub} · ${b.txt} · ${b.ancho}`);
  await tocarMas();
  b = await leer();
  prueba(b && /¡Ya tenés envío gratis!/.test(b.txt) && b.ancho === '100%', 'compu: con 3 unidades ($200.880) dice que ya tiene envío gratis', b && `${b.sub} · ${b.txt} · ${b.ancho}`);
  await foto('envio-compu-3', '#cart-sticky-summary');
  await p.screenshot({ path: path.join(SALIDA, 'envio-compu-pagina.png'), fullPage: false });

  // página del carrito, celular
  await modo(true);
  await ir('/comprar/');
  b = await leer();
  prueba(b && !b.oculto && /¡Ya tenés envío gratis!/.test(b.txt), 'celu: la barra en la página del carrito', b && b.txt);
  await foto('envio-celu-pagina', '#cart-sticky-summary');

  // carrito lateral (celular y compu): se baja a 1 unidad desde la página y se abre la bolsa en otra página
  await p.evaluate(() => { const b = [...document.querySelectorAll('#shoppingCartPage [data-component="quantity.minus"]')].find((e) => e.offsetWidth); b && b.click(); });
  await espera(5500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#shoppingCartPage [data-component="quantity.minus"]')].find((e) => e.offsetWidth); b && b.click(); });
  await espera(5500);
  for (const celu of [true, false]) {
    await modo(celu);
    await ir('/contacto/', 3000);
    await p.evaluate(() => { const a = document.querySelector('.js-head-main a[href*="/comprar"]'); a && a.click(); });
    await espera(6000);
    b = await leer('marco');
    const m = celu ? 'celu' : 'compu';
    prueba(b && !b.oculto && !b.enResumen && /Te faltan \$83\.040 para tener envío gratis/.test(b.txt) && /desde \$150\.000/.test(b.txt), `${m}: carrito lateral con lo que falta y el monto`, b && b.txt);
    await foto(`envio-lateral-${m}`, '.pnt-cp-panel');
  }
  prueba(!errores.length, 'sin errores de JavaScript', errores.join(' | '));
} finally {
  await modo(false);
  const quedan = await vaciar();
  prueba(quedan === 0, `carrito de prueba vaciado → quedan ${quedan}`);
  await browser.close();
  console.log(fallas ? `\n${fallas} con ✘` : '\nTodo bien');
}
