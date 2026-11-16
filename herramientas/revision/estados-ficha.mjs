// Abre estados ocultos de la ficha de producto y saca capturas: medios de envío (con un código postal), medios de pago,
// foto ampliada, segunda foto al pasar el mouse por una tarjeta. Solo lectura: no agrega nada al carrito.
// node herramientas/revision/estados-ficha.mjs <carpeta de salida> [ruta del producto]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2]; const RUTA = process.argv[3] || '/productos/pulsera-silver-flower-454/';
fs.mkdirSync(SALIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
await p.setViewport({ width: 1440, height: 900 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.goto('http://localhost:5700' + RUTA, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => console.log('goto', e.message));
await espera(3000);
await p.evaluate(() => { document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()); if (window.lenis) window.lenis.stop(); });
const foto = async (nombre) => { await espera(900); await p.screenshot({ path: path.join(SALIDA, nombre + '.png') }); console.log('captura', nombre); };
// lista de acordeones / botones de la columna de datos
const titulos = await p.evaluate(() => [...document.querySelectorAll('.pnt-acc, [data-toggle], .js-accordion-toggle, button, a')]
  .filter((e) => e.offsetWidth && /medios de (pago|env)|descripci|ver medios|calcular|gu[ií]a de talles/i.test(e.textContent))
  .map((e) => e.tagName + '.' + String(e.className).trim().split(/\s+/).slice(0, 3).join('.') + ' «' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + '»'));
console.log(titulos.join('\n'));
// 1. Medios de envío
const abrir = async (re) => p.evaluate((src) => {
  const re = new RegExp(src, 'i');
  const el = [...document.querySelectorAll('.pnt-acc summary, .pnt-acc button, .pnt-acc [role=button], .js-accordion-toggle, [data-toggle], summary, button, a')]
    .find((e) => e.offsetWidth && re.test(e.textContent));
  if (!el) return 'no encontrado';
  el.scrollIntoView({ block: 'center' }); el.click(); return 'ok ' + el.tagName;
}, re.source);
console.log('envío:', await abrir(/medios de env/));
await foto('1-medios-envio');
const cp = await p.$('input[name="zipcode"], .js-shipping-input, input[placeholder*="ódigo"], input[placeholder*="odigo"]');
if (cp) {
  await cp.click({ clickCount: 3 }); await cp.type('8000');
  await p.evaluate(() => { const bt = document.querySelector('.js-calculate-shipping, .js-shipping-calculator-button, [data-component*="shipping"] button'); if (bt) bt.click(); });
  await p.keyboard.press('Enter');
  await espera(4500);
  await foto('2-envio-calculado');
} else console.log('sin campo de código postal');
// 2. Medios de pago
console.log('pago:', await abrir(/medios de pago/));
await foto('3-medios-pago');
const verPagos = await p.evaluate(() => { const a = [...document.querySelectorAll('a, button')].find((e) => e.offsetWidth && /ver (los )?medios de pago|ver detalle|ver cuotas|ver más/i.test(e.textContent)); if (!a) return 'no hay link'; a.click(); return 'ok ' + a.textContent.trim().slice(0, 40); });
console.log('ver pagos:', verPagos);
await foto('4-detalle-pagos');
await p.keyboard.press('Escape'); await espera(600);
// 3. Foto ampliada
await p.evaluate(() => window.scrollTo(0, 0)); await espera(500);
const img = await p.$('.js-product-slide img, .product-slider img, .js-swiper-product img, [data-fancybox] img');
if (img) { await img.click(); await espera(1500); await foto('5-foto-ampliada'); await p.keyboard.press('Escape'); } else console.log('sin foto clicable');
await b.close();
