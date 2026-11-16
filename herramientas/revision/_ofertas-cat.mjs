// (2026-11-16) Ofertas = la categoría "Ofertas" y carruseles del inicio sin tarjetas repetidas.
//   node herramientas/revision/_ofertas-cat.mjs [compu|celu]
// Mira: los dos carruseles (cuántas tarjetas, si hay copias, si dan la vuelta, si "Deslizá" se ve), de dónde salen las de "No los dejes escapar"
// (la categoría o, si todavía está oculta, las del panel), que la dirección vieja de Ofertas lleve a la categoría, y la ficha roja / rosa.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const B = 'http://localhost:5700';
const celu = process.argv[2] === 'celu';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = [];
const ok = (n, c, x) => res.push((c ? '✔ ' : '✘ ') + n + (x !== undefined && x !== '' ? ' — ' + x : ''));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const ctx = await browser.createBrowserContext();
const p = await ctx.newPage();
const errores = [];
p.on('pageerror', (e) => errores.push(String(e.message).split('\n')[0].slice(0, 160)));
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
await p.setUserAgent(celu ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
await p.setViewport(celu ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const ir = async (ruta, ms = 4000) => { try { await p.goto(B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }); } catch { /* sigue */ } await espera(ms); };

// ── inicio ──
await ir('/', 9000);
const car = await p.evaluate(() => ['home-products-featured', 'home-products-sale'].map((st) => {
  const s = document.querySelector('[data-store="' + st + '"]');
  if (!s) return { st, no: true };
  const sw = s.querySelector('.pnt-mv-swiper');
  const slides = [...s.querySelectorAll('.swiper-wrapper > .swiper-slide')];
  const ids = slides.map((x) => (x.querySelector('.js-item-product') || {}).getAttribute?.('data-product-id') || (x.querySelector('.pnt-mv-portada') ? 'roja' : '?'));
  const inst = sw && sw.swiper;
  const caja = s.querySelector('.pnt-mv-desliza, [class*="desliza"]');
  return { st, oculta: s.hidden, slides: slides.length, ids, copias: s.querySelectorAll('.swiper-slide-duplicate, .swiper-slide[aria-hidden="true"]').length,
    loop: inst ? !!inst.params.loop : null, trabado: inst ? !!inst.isLocked : null, autoplay: inst && inst.autoplay ? !!inst.autoplay.running : null,
    deslizaVisible: caja ? !caja.hidden && !!caja.offsetHeight : null, cargando: s.classList.contains('pnt-of-cargando') };
}));
for (const c of car) {
  const repetidos = c.ids.filter((x, i) => x !== 'roja' && c.ids.indexOf(x) !== i);
  ok(`${c.st}: sin tarjetas repetidas`, !c.no && !repetidos.length && !c.copias, `${c.slides} tarjetas (${c.ids.join(',')}) · copias ${c.copias} · vuelta ${c.loop} · avanza solo ${c.autoplay} · trabado ${c.trabado} · Deslizá ${c.deslizaVisible}`);
}
const venta = car.find((c) => c.st === 'home-products-sale');
const cat = await p.evaluate(async (u) => { const h = await (await fetch(u)).text(); return /<body[^>]*template-category/.test(h); }, '/ofertas/?sort_by=created-descending');
ok(`"No los dejes escapar": ${cat ? 'sale de la categoría Ofertas' : 'la categoría todavía no anda (oculta): quedan las del panel'}`, venta && !venta.cargando && (cat ? venta.ids.filter((x) => x !== 'roja').length >= 1 : venta.slides >= 2), venta && venta.ids.join(','));
const links = await p.evaluate(() => [...document.querySelectorAll('a.pnt-hero-cartel-btn, [data-store="home-products-sale"] a.pnt-mv-portada, [data-store="home-products-sale"] a.pnt-mv-mas-btn, #nav-hamburger .pnt-menu-ofertas a')].map((a) => a.getAttribute('href')));
ok('los links de Ofertas (cartel, tarjeta roja, Ver todos, menú) van a la categoría', links.length >= 2 && links.every((h) => /^\/ofertas\/\?sort_by=created-descending$/.test(h)), links.join(' | '));

// ── la dirección vieja de Ofertas ──
await ir('/todos-los-productos/?ofertas&sort_by=price-ascending', 3000);
ok('la dirección vieja lleva a la categoría (con su orden)', /^\/ofertas\/\?sort_by=price-ascending/.test(new URL(p.url()).pathname + new URL(p.url()).search), p.url().replace(B, ''));
if (cat) {
  const pag = await p.evaluate(() => ({ clase: document.documentElement.classList.contains('pnt-pag-ofertas'), sale: !!document.querySelector('.pnt-sale'), dato: (document.querySelector('.pnt-sale-dato') || {}).textContent || '',
    rojas: document.querySelectorAll('.pnt-ofertas-grilla .pnt-mv-card').length, sueltas: document.querySelectorAll('.js-product-table > .js-item-product').length }));
  ok('categoría Ofertas: franja SALE y tarjetas rojas (como la página armada)', pag.clase && pag.sale && pag.rojas >= 1 && !pag.sueltas, JSON.stringify(pag));
}

// ── ficha: roja si está en la categoría Ofertas ──
for (const [ruta, debe] of [['/productos/pulsera-silver-flower-454/', true], ['/productos/minnie-con-mono-rosa-shine-3819/', false]]) {
  await ir(ruta, 4000);
  const roja = await p.evaluate(() => !!document.querySelector('.pnt-fp-oferta'));
  ok(`ficha ${ruta.split('/')[2]}: ${debe ? 'roja (en la categoría Ofertas)' : 'rosa (no está en la categoría)'}`, roja === debe, String(roja));
}
ok('sin errores de JavaScript', !errores.length, errores.join(' | '));
console.log(res.join('\n'));
await browser.close();
