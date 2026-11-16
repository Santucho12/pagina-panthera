// Revisión a fondo de los ítems 46–115: no solo fotos, PRUEBA que cada cosa funcione (clics, teclado, formularios, carrito),
// en compu (1440×900) y celular (390×844, iPhone). Cada prueba deja ✔ / ✘ en _pruebas.txt y fotos en la carpeta.
// node herramientas/revision/pruebas-46-115.mjs <carpeta> [grupos separados por coma: paginas,menu,buscador,listado,ficha,carrito,contacto,textos,cuenta,cookies,whatsapp,pie,ofertas,enlaces]
// Solo lectura, salvo el carrito de esta sesión de prueba (se agregan 2 productos y se vacía al final). Nunca envía formularios
// reales (contacto/registro): solo comprueba que no dejen enviar vacíos.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2];
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
fs.mkdirSync(SALIDA, { recursive: true });
const B = 'http://localhost:5700';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const UA_CELU = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
// iPad con iPadOS manda el User-Agent de una Mac (con pantalla táctil): así se prueba como lo ve una tablet de verdad
const UA_TABLET = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const VP = {
  compu: { width: 1440, height: 900, deviceScaleFactor: 1 }, celu: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  laptop: { width: 1366, height: 657, deviceScaleFactor: 1 },                                              // la notebook más común (1366×768 menos la barra del navegador)
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },              // tablet parada
  tabletH: { width: 1024, height: 768, deviceScaleFactor: 2, isMobile: true, hasTouch: true },             // tablet acostada
  apaisado: { width: 844, height: 390, deviceScaleFactor: 3, isMobile: true, hasTouch: true },             // celular acostado
};
// MODOS=tablet,apaisado node … elige tamaños (por defecto compu y celu)
const MODOS = (process.env.MODOS || 'compu,celu').split(',').filter((m) => VP[m]);
const TOQUE = (m) => !!(VP[m] && VP[m].hasTouch);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const P = {
  inicio: '/', todos: '/todos-los-productos/?sort_by=created-descending', pulseras: '/todos-los-productos/pulseras/?sort_by=created-descending',
  charms: '/todos-los-productos/charms-panthera/?sort_by=created-descending',
  ficha: '/productos/pulsera-silver-flower-454/', charm: '/productos/family-forever-cristal-3293-gjvco/', casiopea: '/productos/casiopea-corazon-3991-ier45/',
  inicial: '/productos/colgante-gold-con-inicial-en-circonios-grande-4034-1ia4s/', anillo: '/productos/cocodrilo-la-princesa-y-el-sapo-2381/',   // (2026-11-15) antes Anillo Flowers: ya no existe en la tienda; Cocodrilo está en "No los dejes escapar"
  cuidados: '/cuidados/', envios: '/envios/', cambios: '/politica-de-cambios-garantias-devoluciones/', contacto: '/contacto/',
  arrep: '/contacto/?order_cancellation_without_id=true', busqueda: '/search/?q=mickey', vacia: '/search/?q=zzqqxx', carrito: '/comprar/',
  login: '/account/login/', registro: '/account/register/', reset: '/account/reset/', e404: '/esta-pagina-no-existe/',
  ofertas: '/ofertas/?sort_by=created-descending',      // (2026-11-16) la categoría Ofertas (antes /todos-los-productos/?ofertas)
};

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.VER ? false : 'new',   // VER=1: con la ventana de Chrome a la vista, para mirar las pruebas
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', ...(process.env.VER ? ['--window-position=0,0', '--window-size=1536,816'] : [])],
});
// Con VER=1, si la ventana queda minimizada Chrome deja de dibujar la página y los toques no llegan (la prueba se traba): se restaura sola
if (process.env.VER) {
  setInterval(async () => {
    try {
      const pg = (await browser.pages()).pop(); if (!pg) return;
      const s = await pg.target().createCDPSession();
      const { windowId, bounds } = await s.send('Browser.getWindowForTarget');
      if (bounds.windowState === 'minimized') { await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } }); console.log('  (la ventana estaba minimizada: se restauró)'); }
      await s.detach();
    } catch (e) { /* la página se cerró en el medio */ }
  }, 15000).unref();
}
const log = [];
let paginaActual = null;
function cartel(t) {
  const p = paginaActual; if (!process.env.VER || !p || p.isClosed()) return;
  p.evaluate((t) => { let c = document.getElementById('pnt-revision-cartel'); if (!c) { c = document.createElement('div'); c.id = 'pnt-revision-cartel'; c.setAttribute('data-revision-ignora', ''); c.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;max-width:min(620px,92vw);padding:9px 14px;border-radius:10px;background:rgba(0,0,0,.85);color:#fff;font:600 14px/1.35 system-ui,sans-serif;pointer-events:none;box-shadow:0 4px 18px rgba(0,0,0,.3)'; document.documentElement.appendChild(c); } c.textContent = t; }, t).catch(() => {});
}
let ok = 0, mal = 0;
const anota = (t) => { log.push(t); console.log(t); };
function prueba(grupo, cond, texto, extra = '') {
  if (cond) ok++; else mal++;
  anota(`${cond ? '✔' : '✘'} [${grupo}] ${texto}${extra ? ' · ' + extra : ''}`);
  cartel(`${cond ? '✔' : '✘'} ${texto}`);
  return cond;
}
const info = (grupo, t) => anota(`  · [${grupo}] ${t}`);

async function pagina(modo = 'compu', { ctx = browser, sinCookies = true } = {}) {
  const p = await ctx.newPage();
  p._errores = []; p._fallas = [];
  await p.setRequestInterception(true);
  p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));   // sin la recarga sola de la vista previa (si se edita un archivo mientras corre)
  p.on('pageerror', (e) => p._errores.push(String(e.message).split('\n')[0].slice(0, 140)));
  p.on('response', (r) => { const u = r.url(); if (r.status() >= 400 && /localhost:5700|__tema|panthera/.test(u) && !/\/__/.test(u.replace(/__tema/, ''))) p._fallas.push(r.status() + ' ' + u.replace(B, '').slice(0, 110)); });
  await p.setViewport(VP[modo]);
  await p.setUserAgent(modo === 'celu' || modo === 'apaisado' ? UA_CELU : /^tablet/.test(modo) ? UA_TABLET : UA);
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  p._modo = modo; p._sinCookies = sinCookies; paginaActual = p;
  return p;
}
async function listo(p) {
  for (let i = 0; i < 60; i++) { if (await p.evaluate(() => document.readyState === 'complete').catch(() => false)) return; await espera(250); }
}
async function ir(p, ruta, esperaMs = 2500) {
  try { await p.goto(ruta.startsWith('http') ? ruta : B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { /* sigue */ }
  await listo(p);
  await espera(esperaMs);
  if (p._sinCookies) await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
  cartel(`${p._modo}: ${ruta.replace(/^https?:\/\/[^/]+/, '')}`);
}
async function a(p, y) {
  await p.evaluate((y) => { if (window.lenis) { window.lenis.start && window.lenis.start(); window.lenis.scrollTo(y, { immediate: true, force: true }); } window.scrollTo(0, y); }, y);
  await espera(600);
}
async function recorrer(p) {
  const alto = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 420) { await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }, y); await espera(150); }
  await espera(900); await a(p, 0);
}
async function deslizar(p, x, y, dx) {
  const cdp = await p.target().createCDPSession();
  const pt = (x, y) => [{ x, y, radiusX: 5, radiusY: 5, force: 1, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) });
  for (let k = 1; k <= 12; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x + (dx * k) / 12, y + k * 0.3) }); await espera(20); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach().catch(() => {});
}
async function verEl(p, sel) {
  const r = await p.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.offsetWidth || e.offsetHeight); if (!el) return false;
    const b = el.getBoundingClientRect(); const y = Math.max(0, window.scrollY + b.top - (innerHeight - Math.min(b.height, innerHeight)) / 2);
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); return true;
  }, sel);
  await espera(1100); return r;
}
async function foto(p, nombre, { full = false } = {}) {
  if (full) { await recorrer(p); await p.evaluate(() => { if (window.lenis) window.lenis.stop(); }); }
  await p.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 80, fullPage: full, captureBeyondViewport: full }).catch((e) => info('foto', nombre + ' falló: ' + e.message));
  if (full) await p.evaluate(() => { if (window.lenis) window.lenis.start(); });
}
// clic "de persona": con el mouse en el centro del elemento visible (si algo lo tapa, el clic le llega a lo que tapa: eso también se detecta)
async function tocar(p, sel, re) {
  const h = await p.evaluateHandle((sel, src) => {
    const re = src ? new RegExp(src, 'i') : null;
    return [...document.querySelectorAll(sel)].find((e) => (e.offsetWidth || e.offsetHeight) && getComputedStyle(e).visibility !== 'hidden' && (!re || re.test((e.textContent || e.value || e.getAttribute('aria-label') || '').trim())));
  }, sel, re ? re.source : null);
  const el = h.asElement(); if (!el) return false;
  await el.evaluate((e) => {
    const b = e.getBoundingClientRect();
    // lo que tapa la barra fija de arriba no "se ve" (con el celular acostado la barra mide ~118 px de 390)
    const nav = document.querySelector('.js-head-main'); const nb = nav ? nav.getBoundingClientRect() : null;
    const tope = Math.max(70, nb && nb.bottom > 0 && nb.bottom < innerHeight / 2 && !e.closest('.js-head-main, .modal, .js-modal, .pnt-cp, .fancybox__container') ? nb.bottom + 12 : 0);
    if (b.top >= tope && b.bottom <= innerHeight - 70) return;   // ya se ve: no se mueve la página
    const y = Math.max(0, window.scrollY + b.top - (innerHeight + tope) / 2 + b.height / 2);   // al medio de lo que queda libre debajo de la barra
    if (window.lenis && !e.closest('[data-lenis-prevent], .modal, .js-modal, .pnt-cp, .fancybox__container')) { window.lenis.scrollTo(y, { immediate: true, force: true }); }
    else e.scrollIntoView({ block: 'center' });
    window.scrollTo(0, y);
  });
  await espera(500);
  const tapado = await el.evaluate((e) => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const t = document.elementFromPoint(x, y); return t && t !== e && !e.contains(t) && !t.contains(e) ? (t.className || t.tagName).toString().slice(0, 60) : ''; });
  if (tapado) { p._tapado = tapado; anota(`  ⚠ [toque] ${p._modo}: «${sel.slice(0, 60)}» está TAPADO por «${tapado}» (${url(p)})`); }
  try { if (TOQUE(p._modo)) await el.tap(); else await el.click(); } catch (e) { await el.evaluate((x) => x.click()); }
  return true;
}
// (2026-11-15) Abre el orden: en compu el desplegable "Ordenar"; en celular el panel de "Filtrar", que tiene "Ordenar por" adentro (paginas.js 16).
// Devuelve qué se abrió ('menu' | 'panel') o false; la opción se toca después con OPCION_ORDEN[lo que se abrió].
const OPCION_ORDEN = { menu: '.pnt-orden-op', panel: '.pnt-fo-op' };
async function abrirOrden(p) {
  if (await visible(p, '.pnt-orden-btn')) { await tocar(p, '.pnt-orden-btn'); await espera(700); return (await visible(p, '.pnt-orden-menu')) ? 'menu' : false; }
  await tocar(p, '.pnt-filtrar-btn'); await espera(1300);
  return (await visible(p, '.pnt-fo-ops')) ? 'panel' : false;
}
const visible = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].some((e) => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && b.bottom > 0 && b.right > 0 && b.top < innerHeight && b.left < innerWidth; }), sel);
const url = (p) => p.url().replace(B, '');
const desborde = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const estado = async (ruta) => { try { const r = await fetch(B + ruta, { redirect: 'follow', headers: { 'user-agent': UA } }); return r.status; } catch (e) { return 0; } };
const precio = (t) => +String(t || '').replace(/[^\d,]/g, '').replace(/,\d+$/, '') || 0;
async function precios(p) {
  return p.evaluate(() => [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).map((c) => {
    const t = c.querySelector('.pnt-mv-ahora-precio, .js-price-display'); return t ? t.textContent : '';
  }));
}
const errores = (g, p, donde) => {
  const e = [...new Set(p._errores)].filter((x) => !/applySortBy/.test(x)); // ese error es de la tienda real (ítem 81)
  prueba(g, !e.length, `${donde}: sin errores de JavaScript`, e.join(' | ').slice(0, 300)); p._errores = [];
  const f = [...new Set(p._fallas)]; if (f.length) info(g, `${donde}: pedidos fallidos ${f.slice(0, 6).join(' | ')}`); p._fallas = [];
};

async function vaciar(p) {
  // se repite hasta que no quede nada (la página del carrito puede tardar en mostrar los productos)
  let total = 0, queda = -1;
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    await ir(p, P.carrito, 2500);
    const ids = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-item-id]')].map((e) => e.getAttribute('data-item-id')).filter(Boolean))]);
    if (!ids.length && vuelta > 0) { queda = 0; break; }
    total += await p.evaluate(async (ids) => {
      for (const id of ids) { const fd = new URLSearchParams(); fd.set(`quantity[${id}]`, '0'); await fetch('/cart/update/', { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } }); }
      return ids.length;
    }, ids);
  }
  if (queda < 0) { await ir(p, P.carrito, 2500); queda = await p.evaluate(() => document.querySelectorAll('[data-item-id]').length); }
  prueba('carrito', queda === 0, `carrito de prueba vaciado (${total} ítems) → quedan ${queda}`);
}
async function agregar(p, ruta) {
  await ir(p, ruta, 3500);
  await tocar(p, '.js-addtocart:not(.js-addtocart-placeholder)');
  for (let i = 0; i < 20; i++) { await espera(500); if (await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto'))) break; }
  await espera(2500);
}

// ───────────────────────────── grupos ─────────────────────────────
const G = {
  // Todas las páginas, en los dos tamaños: errores de JS, imágenes rotas, desborde lateral, letras chicas, foto entera
  async paginas() {
    const lista = (process.env.PAGINAS || 'inicio,todos,pulseras,ofertas,ficha,casiopea,inicial,busqueda,vacia,carrito,contacto,arrep,cuidados,envios,cambios,login,registro,reset,e404').split(',');
    for (const m of MODOS) for (const k of lista) {
      const p = await pagina(m); await ir(p, P[k], k === 'ofertas' ? 7000 : 3500); await recorrer(p);
      const d = await desborde(p);
      const r = await p.evaluate(() => {
        const rotas = [...document.images].filter((i) => i.offsetWidth > 8 && i.complete && i.naturalWidth === 0 && !/data:/.test(i.src)).map((i) => i.src.split('/').pop().slice(0, 40));
        const chicas = [...document.querySelectorAll('body *')].filter((e) => { if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false; const s = getComputedStyle(e); return e.offsetWidth && s.visibility !== 'hidden' && parseFloat(s.fontSize) < 10 && !e.closest('.grecaptcha-badge, iframe, .pnt-a3, .pnt-or'); }).map((e) => e.textContent.trim().slice(0, 20));
        const anchos = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return e.offsetWidth && b.right > innerWidth + 2 && getComputedStyle(e).position !== 'fixed' && !e.closest('.swiper, .swiper-wrapper, .pnt-mv-swiper, [class*="carrusel"], .pnt-res-pista, .pnt-desliza, .pnt-cp, #nav-hamburger, #nav-search, #nav-filters, .modal, .pnt-rh-circulos, .pnt-hero-v, .fancybox__container') && !/overflow|hidden|clip/.test(getComputedStyle(e.parentElement).overflowX); }).map((e) => (e.className || e.tagName).toString().slice(0, 40));
        const h1 = (document.querySelector('h1, .h1')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
        return { rotas, chicas: [...new Set(chicas)].slice(0, 6), anchos: [...new Set(anchos)].slice(0, 5), h1, titulo: document.title };
      });
      prueba('paginas', d <= 0, `${m} ${k}: sin desborde lateral`, d > 0 ? `${d}px` : '');
      prueba('paginas', !r.rotas.length, `${m} ${k}: sin imágenes rotas`, r.rotas.join(', '));
      if (r.chicas.length) info('paginas', `${m} ${k}: textos de menos de 10 px: ${r.chicas.join(' | ')}`);
      if (r.anchos.length) info('paginas', `${m} ${k}: piezas que se salen a la derecha: ${r.anchos.join(' | ')}`);
      prueba('paginas', !/ - \d{3,5}\b/.test(r.titulo), `${m} ${k}: pestaña sin código interno`, r.titulo);
      errores('paginas', p, `${m} ${k}`);
      await foto(p, `pag-${k}-${m}`, { full: true });
      await p.close();
    }
  },

  // El inicio, tocando todo: video del cartel, franja que corre, los dos carruseles (solos, puntitos, arrastrar/deslizar, tarjeta),
  // "No los dejes escapar" → Ofertas, armadores visibles, Disney, "Cómo cuidar" (uno abierto por vez), "Conocenos" (video y botones),
  // "Seguinos en redes" (cambiar de historia) y la navbar al bajar y subir
  async inicio() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.inicio, 5000);
      const t = TOQUE(m), W = VP[m].width, Hh = VP[m].height;
      // video del cartel
      const hv = await p.evaluate(async () => { const v = document.querySelector('.pnt-hero-v video'); if (!v) return { sin: 1 }; const t0 = v.currentTime; await new Promise((r) => setTimeout(r, 1500)); return { corre: v.currentTime !== t0, pausado: v.paused, estado: v.readyState }; });   // !== (no >): el video dura 6 s y se repite: si la medición cae en el reinicio, el tiempo vuelve a 0
      prueba('inicio', !!hv.corre, `${m}: el video del cartel se reproduce`, JSON.stringify(hv));
      const of = await p.evaluate(() => { const a = [...document.querySelectorAll('.pnt-hero-v a')].find((x) => /ofertas/i.test(x.textContent)); if (!a) return 'sin botón'; const b = a.getBoundingClientRect(); return b.width && b.top >= 0 && b.bottom <= innerHeight ? 'ok' : `fuera de la pantalla (${Math.round(b.top)}–${Math.round(b.bottom)} de ${innerHeight})`; });
      prueba('inicio', of === 'ok', `${m}: el botón "Ofertas" del cartel se ve sin bajar`, of);
      // franja de anuncios que corre
      const fr = await p.evaluate(async () => { const e = document.querySelector('.pnt-barra-pista'); if (!e) return -1; const x0 = e.getBoundingClientRect().left; await new Promise((r) => setTimeout(r, 1200)); return Math.round(Math.abs(e.getBoundingClientRect().left - x0)); });
      prueba('inicio', fr > 5, `${m}: la franja de anuncios se desplaza`, `${fr}px en 1,2 s`);
      // carruseles
      for (const [glob, nombre, store] of [['productsFeaturedSwiper', 'Los más elegidos', 'home-products-featured'], ['productsSaleSwiper', 'No los dejes escapar', 'home-products-sale']]) {
        const hay = await verEl(p, `[data-store="${store}"] .pnt-mv-swiper`);
        if (!hay) { prueba('inicio', false, `${m}: "${nombre}" está`); continue; }
        await p.mouse.move(2, 2);   // el mouse afuera (encima del carrusel se frena)
        // (2026-11-16) posición = tarjeta activa + desplazamiento: sin vuelta (menos de 6 tarjetas) el carrusel se corre sin cambiar la activa
        const pos = (g) => p.evaluate((g) => { const w = window[g]; return w ? w.realIndex + ':' + Math.round(w.translate) : '-1'; }, g);
        const trabado = await p.evaluate((g) => !!(window[g] && window[g].isLocked), glob);
        if (trabado) {
          const sinDesliza = await p.evaluate((s) => { const c = document.querySelector(`[data-store="${s}"] .pnt-desliza`); return !c || c.hidden || !c.offsetHeight; }, store);
          prueba('inicio', sinDesliza, `${m}: "${nombre}": entran todas las tarjetas, queda quieto y sin "Deslizá"`);
          continue;
        }
        const i0 = await pos(glob);
        await espera(5200);
        const i1 = await pos(glob);
        prueba('inicio', i0 !== '-1' && i1 !== i0, `${m}: "${nombre}" avanza solo`, `${i0} → ${i1}`);
        // puntitos
        const nP = await p.evaluate((s) => document.querySelectorAll(`[data-store="${s}"] .pnt-desliza-puntos button`).length, store);
        if (nP > 1) {
          const antes = await pos(glob);
          await p.evaluate((s) => { const b = [...document.querySelectorAll(`[data-store="${s}"] .pnt-desliza-puntos button`)]; const i = b.findIndex((x) => x.classList.contains('is-activo')); b.forEach((x) => x.removeAttribute('data-prueba')); b[(i + (b.length > 2 ? 2 : 1)) % b.length].setAttribute('data-prueba', '1'); }, store);
          await tocar(p, `[data-store="${store}"] .pnt-desliza-puntos button[data-prueba]`); await espera(1400);
          const despues = await pos(glob);
          const activo = await p.evaluate((s) => document.querySelector(`[data-store="${s}"] .pnt-desliza-puntos button[data-prueba]`)?.classList.contains('is-activo'), store);
          prueba('inicio', despues !== antes && activo, `${m}: "${nombre}": tocar un puntito lleva a esa parte`, `${antes} → ${despues}, puntito ${activo ? 'activo' : 'NO activo'}`);
        }
        // arrastrar (compu) / deslizar (táctil). El carrusel vuelve a la vista (tocar el puntito movió la página) y el dedo se apoya
        // dentro de la pantalla: con el celular acostado (390 px de alto) el carrusel mide 450 y el 35 % quedaba abajo del borde.
        await verEl(p, `[data-store="${store}"] .pnt-mv-swiper`);
        const c = await p.evaluate((s) => { const r = document.querySelector(`[data-store="${s}"] .pnt-mv-swiper`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.max(r.top + 20, Math.min(innerHeight - 40, r.top + r.height * 0.35)) }; }, store);
        // (2026-11-16) sin vuelta, desde el principio (si ya estaba en la última posición, no hay a dónde deslizar) y sin que avance solo mientras tanto
        await p.evaluate((g) => { const w = window[g]; if (w && !w.params.loop) { if (w.autoplay) w.autoplay.stop(); w.slideTo(0, 0); } }, glob); await espera(300);
        const u0 = url(p), a0 = await pos(glob);
        if (t) await deslizar(p, c.x + 120, c.y, -260);
        else { await p.mouse.move(c.x + 150, c.y); await p.mouse.down(); for (let k = 1; k <= 14; k++) { await p.mouse.move(c.x + 150 - k * 22, c.y); await espera(16); } await p.mouse.up(); }
        await espera(1500);
        const a1 = await pos(glob);
        prueba('inicio', a1 !== a0 && url(p) === u0, `${m}: "${nombre}": ${t ? 'deslizar' : 'arrastrar'} pasa de tarjeta (sin abrir el producto)`, `${a0} → ${a1} · ${url(p)}`);
        await p.mouse.move(2, 2);
      }
      // tocar una tarjeta de "Los más elegidos" abre el producto
      await verEl(p, '[data-store="home-products-featured"] .pnt-mv-swiper');
      // el carrusel avanza solo cada 3,5 s: se frena antes de elegir la tarjeta (si no, se corre entre que se elige y se toca)
      await p.evaluate(() => { const sw = window.productsFeaturedSwiper; if (sw && sw.autoplay) sw.autoplay.stop(); document.querySelectorAll('a[data-prueba]').forEach((x) => x.removeAttribute('data-prueba')); });
      await espera(1000);
      await p.evaluate(() => { const sw = document.querySelector('[data-store="home-products-featured"] .pnt-mv-swiper'); const r0 = sw.getBoundingClientRect(); const s = [...sw.querySelectorAll('.swiper-slide')].find((x) => { const b = x.getBoundingClientRect(); return b.left >= r0.left - 2 && b.right <= r0.right + 2; }); const a = s && [...s.querySelectorAll('a[href*="/productos/"]')].find((x) => { const bx = x.getBoundingClientRect(); return bx.width > 4 && bx.height > 4; }); if (a) a.setAttribute('data-prueba', '1'); });   // el primer link de Lima (js-product-item-image-link-private) mide 0×0: se toca el que se ve
      const destino = await p.evaluate(() => document.querySelector('a[data-prueba="1"]')?.getAttribute('href') || '');
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, 'a[data-prueba="1"]')]); await espera(1500);
      prueba('inicio', /\/productos\//.test(url(p)), `${m}: tocar una tarjeta abre el producto`, `${destino.replace(B, '').slice(0, 60)} → ${url(p).slice(0, 60)}`);
      await ir(p, P.inicio, 4000);
      // "No los dejes escapar": la tarjeta roja lleva a Ofertas
      const port = await p.evaluate(() => document.querySelector('.pnt-mv-portada')?.getAttribute('href') || '');
      prueba('inicio', /ofertas/.test(port) && (await estado(port.replace(/^https?:\/\/[^/]+/, ''))) === 200, `${m}: la tarjeta roja "Ofertas" lleva a Ofertas`, port.replace(B, ''));
      // armadores: se ven (3D o su póster) y sin errores
      for (const [sel, nombre] of [['[data-pnt-a3]', 'Armá tu pulsera'], ['[data-pnt-or], #armar-oreja, .pnt-or', 'Armá tu oreja']]) {
        const hay = await verEl(p, sel); await espera(3500);
        const r = await p.evaluate((sel) => { const s = document.querySelector(sel); if (!s) return 'no está'; const b = s.getBoundingClientRect(); const raiz = s.shadowRoot || s.querySelector('*')?.shadowRoot; return `${Math.round(b.width)}×${Math.round(b.height)}${raiz ? ' (con Shadow DOM)' : ''}`; }, sel);
        prueba('inicio', hay && !/no está|^0×|×0/.test(r), `${m}: "${nombre}" se ve`, r);
      }
      // Disney: cada colección lleva a una página que existe
      const dis = await p.evaluate(() => [...document.querySelectorAll('.pnt-di a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && !h.startsWith('#')));
      const disMal = []; for (const h of [...new Set(dis)]) { const r = h.replace(/^https?:\/\/[^/]+/, ''); if (!/^\//.test(r)) continue; const s = await estado(r); if (s !== 200) disMal.push(s + ' ' + r); }
      prueba('inicio', dis.length > 0 && !disMal.length, `${m}: Disney: ${new Set(dis).size} links responden`, disMal.join(' | '));
      // "Cómo cuidar tu plata": uno abierto por vez
      const nCu = await p.evaluate(() => document.querySelectorAll('.pnt-cu-item').length);
      let cuBien = nCu > 0; const cuMal = [];
      for (let i = 0; i < nCu; i++) {
        await p.evaluate((i) => { document.querySelectorAll('.pnt-cu-btn').forEach((b, k) => b.toggleAttribute('data-prueba', k === i)); }, i);
        const yaAbierto = await p.evaluate((i) => document.querySelectorAll('.pnt-cu-item')[i].classList.contains('is-open'), i);
        if (yaAbierto) continue;
        await tocar(p, '.pnt-cu-btn[data-prueba]'); await espera(1100);
        const st = await p.evaluate((i) => [...document.querySelectorAll('.pnt-cu-item')].map((e, k) => ({ k, abierto: e.classList.contains('is-open'), alto: Math.round(e.querySelector('.pnt-cu-resp')?.getBoundingClientRect().height || 0) })), i);
        const ok1 = st[i].abierto && st[i].alto > 20 && st.filter((x) => x.abierto).length === 1;
        if (!ok1) { cuBien = false; cuMal.push(`${i + 1}: ${JSON.stringify(st)}`); }
      }
      prueba('inicio', cuBien, `${m}: "Cómo cuidar": los ${nCu} se abren de a uno`, cuMal.join(' | ').slice(0, 200));
      // "Conocenos": video, mapa y WhatsApp
      await verEl(p, '.pnt-co-video'); await espera(1500);
      const co = await p.evaluate(async () => { const v = document.querySelector('.pnt-co-video'); const t0 = v ? v.currentTime : 0; await new Promise((r) => setTimeout(r, 1400)); const bs = [...document.querySelectorAll('.pnt-co a[href]')].map((a) => a.getAttribute('href')); return { corre: !!v && v.currentTime > t0, mapa: bs.some((h) => /google\.[a-z.]+\/maps|maps\.app|goo\.gl\/maps/.test(h)), wa: bs.some((h) => /wa\.me|whatsapp/.test(h)) }; });
      prueba('inicio', co.corre, `${m}: el video de "Conocenos" se reproduce al verlo`);
      prueba('inicio', co.mapa && co.wa, `${m}: "Conocenos" tiene "Cómo llegar" (mapa) y WhatsApp`, JSON.stringify(co));
      // "Seguinos en redes": cambiar de historia
      const nC = await p.evaluate(() => document.querySelectorAll('.pnt-rh-circ').length);
      if (nC > 1) {
        await verEl(p, '.pnt-rh-circulos');
        const antes = await p.evaluate(() => { const v = document.querySelector('.pnt-rh-video'); return (v && !v.hidden ? v.currentSrc || v.src : document.querySelector('.pnt-rh-foto')?.src) || ''; });
        await p.evaluate(() => { const cs = [...document.querySelectorAll('.pnt-rh-circ')]; const i = cs.findIndex((c) => c.classList.contains('is-activo')); cs.forEach((c) => c.removeAttribute('data-prueba')); cs[(i + 1) % cs.length].setAttribute('data-prueba', '1'); });
        await tocar(p, '.pnt-rh-circ[data-prueba]'); await espera(1800);
        const rh = await p.evaluate(() => { const c = document.querySelector('.pnt-rh-circ[data-prueba]'); const v = document.querySelector('.pnt-rh-video'); return { activo: c.classList.contains('is-activo'), src: (v && !v.hidden ? v.currentSrc || v.src : document.querySelector('.pnt-rh-foto')?.src) || '', corre: v && !v.hidden ? !v.paused : 'foto' }; });
        prueba('inicio', rh.activo && rh.src !== antes, `${m}: "Seguinos en redes": tocar otra historia la muestra`, `${antes.split('/').pop()} → ${rh.src.split('/').pop()} · ${rh.corre}`);
        const redes = await p.evaluate(() => [...document.querySelectorAll('.pnt-redes a[href]')].map((a) => a.getAttribute('href')));
        prueba('inicio', redes.some((h) => /instagram\.com/.test(h)) && redes.some((h) => /tiktok\.com/.test(h)), `${m}: "Seguinos en redes" lleva a Instagram y TikTok`, redes.filter((h) => /^https?:/.test(h)).map((h) => h.slice(0, 40)).join(' | '));
      }
      // navbar: después de bajar mucho y subir un poco, se puede volver a usar el menú
      await a(p, 5000); await espera(800);
      await p.evaluate(() => { if (window.lenis) window.lenis.scrollTo(window.scrollY - 300, { immediate: false }); else window.scrollBy(0, -300); }); await espera(1500);
      const nav = await p.evaluate(() => { const b = document.querySelector('[data-toggle="#nav-hamburger"]'); if (!b) return 'sin botón'; const r = b.getBoundingClientRect(); const enPantalla = r.bottom > 0 && r.top < innerHeight; const el = enPantalla ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null; return enPantalla && el && (el === b || b.contains(el)) ? 'a mano' : enPantalla ? 'tapado' : 'escondida'; });
      info('inicio', `${m}: al subir un poco después de bajar, la hamburguesa queda ${nav}`);
      errores('inicio', p, m); await p.close();
    }
  },

  // 46–48: franja, navbar, menú hamburguesa (abrir, submenús, volver, cerrar con cruz / fondo / Escape, links vivos)
  async menu() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.inicio, 4000);
      const franja = await p.evaluate(() => { const f = document.querySelector('.pnt-barra, .js-adbar, [class*="adbar"]'); return f ? f.innerText.replace(/\s+/g, ' ').slice(0, 120) : ''; });
      prueba('menu', !!franja, `${m}: franja de anuncios visible`, franja);
      await foto(p, `046-navbar-${m}`);
      // el logo lleva al inicio
      const logo = await p.evaluate(() => { const l = document.querySelector('.js-head-main a.navbar-brand, .js-head-main .logo-img-container a, .js-head-main a[href="/"], .js-head-main a[href$=".com.ar/"]'); return l ? l.getAttribute('href') : ''; });
      prueba('menu', /^(\/|https?:\/\/[^/]+\/?)$/.test(logo) || logo === B + '/', `${m}: el logo apunta al inicio`, logo);
      // abrir hamburguesa
      await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1200);
      prueba('menu', await visible(p, '#nav-hamburger'), `${m}: la hamburguesa abre el panel`);
      await foto(p, `047-menu-${m}`);
      const items = await p.evaluate(() => [...document.querySelectorAll('#nav-hamburger .nav-list > .nav-item, #nav-hamburger .nav-list-item')].filter((e) => e.offsetWidth).map((e) => (e.querySelector('a, .nav-list-link')?.textContent || '').trim().replace(/\s+/g, ' ')).filter(Boolean));
      info('menu', `${m}: ítems ${items.join(' | ')}`);
      prueba('menu', items.filter((t) => /^collares$/i.test(t)).length <= 1, `${m}: "Collares" no está repetido en el menú`);
      // abrir cada submenú y volver
      const subs = await p.evaluate(() => [...document.querySelectorAll('#nav-hamburger .modal-body > .nav-list > .nav-item .js-toggle-menu-panel, #nav-hamburger .nav-list > .nav-item > .js-toggle-menu-panel')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ')));
      info('menu', `${m}: con submenú: ${[...new Set(subs)].join(' | ')}`);
      for (const nombre of [...new Set(subs)]) {
        await p.evaluate((n) => { const t = [...document.querySelectorAll('#nav-hamburger .js-toggle-menu-panel')].find((e) => e.offsetWidth && e.textContent.trim().replace(/\s+/g, ' ') === n); t && t.click(); }, nombre);
        await espera(1100);
        const panel = await p.evaluate(() => { const pn = [...document.querySelectorAll('#nav-hamburger .nav-list-panel-show')].pop(); if (!pn) return null; const b = pn.getBoundingClientRect(); return { l: Math.round(b.left), w: Math.round(b.width), titulo: (pn.querySelector('.js-toggle-menu-back')?.textContent || '').trim().replace(/\s+/g, ' '), links: [...pn.querySelectorAll('a.nav-list-link')].filter((a) => a.offsetWidth && !a.classList.contains('js-toggle-menu-back')).map((a) => a.textContent.trim().replace(/\s+/g, ' ') + '→' + (a.getAttribute('href') || '').replace(/^https?:\/\/[^/]+/, '')) }; });
        prueba('menu', !!panel && panel.l >= 0 && panel.l < 20 && panel.w > 200, `${m}: submenú "${nombre}" abre encima del menú`, panel ? `título «${panel.titulo}» · ${panel.links.join(' | ')}` : '');
        if (panel) prueba('menu', panel.links.filter((t) => /^collares/i.test(t)).length <= 1, `${m}: sin "Collares" duplicado en "${nombre}"`);
        if (nombre === subs[0]) await foto(p, `047-submenu-${m}`);
        const volvio = await tocar(p, '#nav-hamburger .nav-list-panel-show .js-toggle-menu-back'); await espera(1000);
        const enRaiz = await p.evaluate(() => !document.querySelector('#nav-hamburger .nav-list-panel-show'));
        prueba('menu', volvio && enRaiz, `${m}: la flecha "volver" de "${nombre}" vuelve al menú`);
      }
      // links del menú vivos
      const hrefs = await p.evaluate(() => [...new Set([...document.querySelectorAll('#nav-hamburger a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && h !== '#' && !/^(javascript|mailto|tel|https?:\/\/(wa\.me|api\.whatsapp|www\.instagram|instagram|facebook|www\.facebook|www\.tiktok))/i.test(h)))]);
      const caidos = [];
      for (const h of hrefs) { const r = h.replace(/^https?:\/\/[^/]+/, ''); if (!r.startsWith('/')) continue; const s = await estado(r); if (s !== 200) caidos.push(`${s} ${r}`); }
      prueba('menu', !caidos.length, `${m}: los ${hrefs.length} links del menú responden 200`, caidos.join(' | '));
      const abiertoMenu = () => p.evaluate(() => document.querySelector('#nav-hamburger')?.classList.contains('modal-show'));
      const X = '#nav-hamburger > .modal-header .js-modal-close.modal-close, #nav-hamburger .modal-header > .js-modal-close';
      // cerrar: cruz
      await tocar(p, X); await espera(1000);
      prueba('menu', !(await abiertoMenu()), `${m}: la cruz cierra el menú`);
      // cerrar: fondo (en celular el panel ocupa todo el ancho: no hay "afuera")
      await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1100);
      const ancho = await p.evaluate(() => document.querySelector('#nav-hamburger').getBoundingClientRect().width);
      if (ancho < VP[m].width - 20) { await p.mouse.click(VP[m].width - 60, Math.min(400, VP[m].height - 60)); /* acostado mide 390 de alto */ await espera(1000); prueba('menu', !(await abiertoMenu()), `${m}: tocar afuera cierra el menú`); }
      else { info('menu', `${m}: el menú ocupa todo el ancho (${Math.round(ancho)} px)`); await tocar(p, X); await espera(1000); }
      // Escape (solo compu)
      if (!TOQUE(m)) {
        await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1100);
        await p.evaluate(() => { const t = [...document.querySelectorAll('#nav-hamburger .js-toggle-menu-panel')].find((e) => e.offsetWidth); t && t.click(); }); await espera(900);
        await p.keyboard.press('Escape'); await espera(1100);
        const sigue = await abiertoMenu();
        prueba('menu', !sigue, 'compu: Escape cierra el menú (con un submenú abierto)');
        if (sigue) { await p.mouse.click(1300, 400); await espera(900); }
        await espera(1200);
        await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1100);
        prueba('menu', !(await p.evaluate(() => document.querySelector('#nav-hamburger .nav-list-panel-show'))), 'compu: al volver a abrir el menú arranca desde el principio');
        await tocar(p, X); await espera(1000);
      }
      // entrar a una categoría desde el menú: Aros → "Ver todo en Aros"
      await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1100);
      await p.evaluate(() => { const t = [...document.querySelectorAll('#nav-hamburger .js-toggle-menu-panel')].find((e) => e.offsetWidth && /^aros$/i.test(e.textContent.trim())); t && t.click(); }); await espera(1100);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '#nav-hamburger .nav-list-panel-show a', /ver todo/)]);
      await espera(2500);
      prueba('menu', /\/aros\/.*sort_by=created-descending/.test(url(p)), `${m}: "Ver todo en Aros" lleva a la categoría en Novedades`, url(p));
      // "Ofertas" y "Crealo vos misma"
      await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1100);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '#nav-hamburger .nav-list > .nav-item > a', /^ofertas$/)]); await espera(4000);
      prueba('menu', /ofertas/.test(url(p)) && await p.evaluate(() => !!document.querySelector('.pnt-sale')), `${m}: "Ofertas" del menú abre la página de ofertas`, url(p));
      await tocar(p, '[data-toggle="#nav-hamburger"]'); await espera(1100);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '#nav-hamburger .nav-list > .nav-item > a', /crealo vos misma/)]); await espera(6000);
      const enArmar = await p.evaluate(() => { const s = document.querySelector('#armar-pulsera'); if (!s) return 'sin sección'; const b = s.getBoundingClientRect(); return Math.round(b.top) + '/' + innerHeight; });
      prueba('menu', /^\/(\?|#|$)/.test(url(p)) && /^-?\d+\//.test(enArmar) && Math.abs(parseInt(enArmar)) < 300, `${m}: "Crealo vos misma" baja hasta "Armá tu pulsera"`, `${url(p)} · sección a ${enArmar}`);
      await foto(p, `047-crealo-vos-misma-${m}`);
      errores('menu', p, m); await p.close();
    }
  },

  // 49, 54, 55: buscador lateral, sugerencias, Enter, "Ver todos los resultados", Explorá, cerrar; búsqueda sin resultados
  async buscador() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.inicio, 3500);
      await tocar(p, m === 'compu' ? '.pnt-buscar, .js-search-button' : '.js-search-button, .pnt-buscar'); await espera(1200);
      prueba('buscador', await visible(p, '#nav-search .search-input'), `${m}: la lupa abre el buscador`);
      const enFoco = await p.evaluate(() => document.activeElement?.matches?.('#nav-search .search-input'));
      prueba('buscador', enFoco, `${m}: el campo queda listo para escribir (foco)`);
      const lupa = await p.evaluate(() => { const i = document.querySelector('#nav-search .search-input'); const f = i.closest('form'); const b = f?.querySelector('[type=submit], .search-input-submit, button'); if (!b) return 'sin botón'; const r1 = i.getBoundingClientRect(), r2 = b.getBoundingClientRect(); return r2.left >= r1.left - 1 && r2.right <= r1.right + 1 && r2.top >= r1.top - 1 && r2.bottom <= r1.bottom + 1 ? 'adentro' : `afuera (campo ${Math.round(r1.left)}–${Math.round(r1.right)}, lupa ${Math.round(r2.left)}–${Math.round(r2.right)})`; });
      prueba('buscador', lupa === 'adentro', `${m}: la lupa queda dentro del campo`, lupa);
      const chips = await p.evaluate(() => [...document.querySelectorAll('.pnt-explora a')].filter((a) => a.offsetWidth).map((a) => a.getAttribute('href')));
      const malos = []; for (const h of chips) { const s = await estado(h.replace(/^https?:\/\/[^/]+/, '')); if (s !== 200) malos.push(s + ' ' + h); }
      prueba('buscador', chips.length > 0 && !malos.length, `${m}: accesos "Explorá" (${chips.length}) responden`, malos.join(' | '));
      await foto(p, `049-buscador-${m}`);
      await p.type('#nav-search .search-input', 'pulsera', { delay: 70 }); await espera(3500);
      const sug = await p.evaluate(() => [...document.querySelectorAll('.js-search-suggest a[href*="/productos/"], .search-suggest-link')].filter((a) => a.offsetWidth).map((a) => ({ h: a.getAttribute('href'), t: a.innerText.replace(/\s+/g, ' ').slice(0, 60) })));
      prueba('buscador', sug.length > 0, `${m}: aparecen sugerencias al escribir`, `${sug.length}: ${sug.slice(0, 2).map((s) => s.t).join(' | ')}`);
      prueba('buscador', !sug.some((s) => /,00/.test(s.t)), `${m}: precios de las sugerencias sin ",00"`);
      prueba('buscador', !sug.some((s) => / - \d{3,5}\b/.test(s.t)), `${m}: nombres de las sugerencias sin código`);
      await foto(p, `049-sugerencias-${m}`);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '#nav-search a, #nav-search button', /ver todos los resultados/)]); await espera(3000);
      prueba('buscador', /\/search\/\?q=pulsera/.test(url(p)), `${m}: "Ver todos los resultados" lleva a la búsqueda`, url(p));
      await tocar(p, m === 'compu' ? '.pnt-buscar, .js-search-button' : '.js-search-button, .pnt-buscar'); await espera(1100);
      await p.evaluate(() => { const i = document.querySelector('#nav-search .search-input'); i.value = ''; }); await p.type('#nav-search .search-input', 'pulsera', { delay: 50 }); await espera(2500);
      // Enter
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), p.keyboard.press('Enter')]); await espera(3000);
      const n = await p.evaluate(() => [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).length);
      prueba('buscador', /\/search\/\?q=pulsera/.test(url(p)) && n > 0, `${m}: Enter lleva a los resultados`, `${url(p)} · ${n} tarjetas`);
      // clic en una sugerencia
      await tocar(p, m === 'compu' ? '.pnt-buscar, .js-search-button' : '.js-search-button, .pnt-buscar'); await espera(1100);
      await p.evaluate(() => { const i = document.querySelector('#nav-search .search-input'); i.value = ''; }); await p.type('#nav-search .search-input', 'mickey', { delay: 70 }); await espera(3500);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '.js-search-suggest a[href*="/productos/"], .search-suggest-link')]); await espera(2500);
      prueba('buscador', /\/productos\//.test(url(p)), `${m}: tocar una sugerencia abre la ficha`, url(p));
      // cerrar el buscador con la flecha / cruz
      await tocar(p, m === 'compu' ? '.pnt-buscar, .js-search-button' : '.js-search-button, .pnt-buscar'); await espera(1100);
      await tocar(p, '#nav-search .js-modal-close, #nav-search [data-toggle="#nav-search"], #nav-search .modal-close'); await espera(1000);
      prueba('buscador', !(await visible(p, '#nav-search .search-input')), `${m}: la flecha/cruz cierra el buscador`);
      // sin resultados: botones
      await ir(p, P.vacia, 3000);
      const bot = await p.evaluate(() => [...document.querySelectorAll('.pnt-sinres a, .pnt-vacio a, main a.btn')].filter((a) => a.offsetWidth).map((a) => a.getAttribute('href')));
      const caidos = []; for (const h of bot) { const s = await estado(h.replace(/^https?:\/\/[^/]+/, '')); if (s !== 200) caidos.push(s + ' ' + h); }
      prueba('buscador', bot.length > 0 && !caidos.length, `${m}: búsqueda vacía con accesos que funcionan (${bot.length})`, caidos.join(' | '));
      await foto(p, `055-sin-resultados-${m}`);
      errores('buscador', p, m); await p.close();
    }
  },

  // 50, 64, 66, 67, 70, 77, 81, 82: listado (ordenar con orden correcto, filtros, píldoras, ver más, bolsitas, tarjeta → ficha)
  async listado() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.todos, 3500);
      const ordenes = [['menor precio', 'price-ascending', (a, b) => a <= b], ['mayor precio', 'price-descending', (a, b) => a >= b], ['a – z|a - z|a-z', 'alpha-ascending', null], ['z – a|z - a|z-a', 'alpha-descending', null], ['más vendidos', 'best-selling', null], ['novedades', 'created-descending', null]];
      for (const [txt, clave, cmp] of ordenes) {
        const menu = await abrirOrden(p);
        await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, OPCION_ORDEN[menu] || '.pnt-orden-op', new RegExp(txt))]); await listo(p); await espera(2500);
        const u = url(p);
        let det = u;
        if (cmp) { const ps = (await precios(p)).map(precio).filter(Boolean); const malos = ps.filter((v, i) => i && !cmp(ps[i - 1], v)).length; det += ` · ${ps.length} precios, ${malos} fuera de orden`; prueba('listado', menu && u.includes(clave) && malos === 0, `${m}: ordenar "${txt.split('|')[0]}"`, det); }
        else if (/alpha/.test(clave)) { const ns = await p.evaluate(() => [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).map((c) => (c.querySelector('.pnt-mv-nombre, .js-item-name')?.textContent || '').trim().toLowerCase())); const s = [...ns].sort((x, y) => x.localeCompare(y, 'es')); if (clave.includes('desc')) s.reverse(); const igual = ns.slice(0, 12).join() === s.slice(0, 12).join(); prueba('listado', u.includes(clave), `${m}: ordenar "${txt.split('|')[0]}"`, det + (igual ? '' : ' · (orden alfabético de la tienda distinto al del idioma: ' + ns.slice(0, 4).join(', ') + ')')); }
        else prueba('listado', u.includes(clave), `${m}: ordenar "${txt.split('|')[0]}"`, det);
        const rot = await p.evaluate(() => document.querySelector('.pnt-orden-btn')?.innerText.replace(/\s+/g, ' ').trim());
        info('listado', `${m}: botón dice "${rot}"`);
      }
      await foto(p, `050-listado-${m}`);
      // filtros
      await ir(p, P.todos, 3000);
      const antes = await p.evaluate(() => document.querySelectorAll('.js-item-product').length);
      await tocar(p, '[data-toggle="#nav-filters"], .pnt-filtrar-btn'); await espera(1300);
      prueba('listado', await visible(p, '#nav-filters'), `${m}: "Filtrar" abre el panel`);
      await foto(p, `066-filtros-${m}`);
      const cats = await p.evaluate(() => [...document.querySelectorAll('#nav-filters a[href]')].filter((a) => a.offsetWidth).map((a) => a.textContent.trim().replace(/\s+/g, ' ')));
      prueba('listado', cats.filter((t) => /^collares\b/i.test(t)).length <= 1, `${m}: "Collares" una sola vez en Filtros`, cats.slice(0, 14).join(' | '));
      // precio: se escribe como una persona (mínimo y máximo) y "Aplicar"
      const mi = await p.$('#nav-filters input[name="min_price"]'); const ma = await p.$('#nav-filters input[name="max_price"]');
      if (mi && ma && await mi.boundingBox()) {
        await mi.click(); await mi.type('10000', { delay: 40 }); await ma.click(); await ma.type('30000', { delay: 40 });
        await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '#nav-filters .js-price-filter-btn')]); await listo(p); await espera(2500);
        const ps = (await precios(p)).map(precio).filter(Boolean);
        const fuera = ps.filter((v) => v < 10000 || v > 30000);
        prueba('listado', /min_price=10000/.test(url(p)) && ps.length > 0 && !fuera.length, `${m}: filtro de precio $10.000–$30.000`, `${url(p)} · ${ps.length} tarjetas, ${fuera.length} fuera del rango ${fuera.slice(0, 3).join(', ')}`);
        const chip = await p.evaluate(() => [...document.querySelectorAll('.js-remove-filter')].filter((c) => c.offsetWidth).map((c) => c.textContent.trim().replace(/\s+/g, ' ')));
        prueba('listado', chip.length > 0 && !chip.some((t) => /\$\d{4,}/.test(t)), `${m}: píldora del filtro con el precio con puntos`, chip.join(' | '));
        await foto(p, `066-filtro-aplicado-${m}`);
        await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '.js-remove-filter')]); await listo(p); await espera(2000);
        prueba('listado', !/min_price/.test(url(p)), `${m}: tocar la píldora saca el filtro`, url(p));
      } else prueba('listado', false, `${m}: campos de precio en Filtros`);
      // filtro por categoría desde el panel
      await ir(p, P.todos, 3000); await tocar(p, '[data-toggle="#nav-filters"], .pnt-filtrar-btn'); await espera(1200);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '#nav-filters a[href*="/anillos"]')]); await listo(p); await espera(2500);
      prueba('listado', /anillos/.test(url(p)), `${m}: categoría "Anillos" desde Filtros`, url(p));
      // cerrar filtros con la cruz
      await tocar(p, '[data-toggle="#nav-filters"], .pnt-filtrar-btn'); await espera(1200);
      await tocar(p, '#nav-filters .js-modal-close, #nav-filters [data-toggle="#nav-filters"]'); await espera(1000);
      prueba('listado', !(await visible(p, '#nav-filters .modal-body, #nav-filters .modal-header')), `${m}: la cruz cierra Filtros`);
      // ver más
      await ir(p, P.todos, 3000); await recorrer(p);
      const n0 = await p.evaluate(() => document.querySelectorAll('.js-item-product').length);
      const hay = await verEl(p, '.pnt-ver-mas-btn');
      if (hay) { await tocar(p, '.pnt-ver-mas-btn'); await espera(1000); await foto(p, `070-ver-mas-cargando-${m}`); await espera(6000); }
      const r = await p.evaluate(() => { const ids = [...document.querySelectorAll('.js-item-product')].map((e) => e.getAttribute('data-product-id')).filter(Boolean); return { n: ids.length, rep: ids.length - new Set(ids).size, pnt: [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth && !e.querySelector('.pnt-mv-nombre')).length }; });
      prueba('listado', hay && r.n > n0, `${m}: "Ver más productos" trae más`, `${n0} → ${r.n}`);
      prueba('listado', r.rep === 0, `${m}: sin productos repetidos después de "Ver más"`, `${r.rep} repetidos`);
      prueba('listado', r.pnt === 0, `${m}: las tarjetas nuevas tienen el diseño de la marca`, `${r.pnt} sin diseño`);
      await foto(p, `070-despues-de-ver-mas-${m}`);
      // tarjeta → ficha
      await ir(p, P.pulseras, 3000);
      await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '.js-item-product .pnt-mv-nombre a, .js-item-product a[href*="/productos/"]')]); await espera(2000);
      prueba('listado', /\/productos\//.test(url(p)), `${m}: tocar una tarjeta abre la ficha`, url(p));
      // bolsita de un producto con talles → ficha
      await ir(p, P.pulseras, 3000);
      const dest = await p.evaluate(() => { const c = document.querySelector('.js-item-product'); const b = c.querySelector('.pnt-mv-bolsa, .pnt-bolsa, [class*="bolsa"]'); return b ? (b.getAttribute('href') || b.closest('a')?.getAttribute('href') || 'botón') : 'no hay'; });
      info('listado', `${m}: bolsita de una pulsera con talles → ${dest}`);
      // categoría sin resultados (77)
      await ir(p, '/todos-los-productos/anillos/?sort_by=created-descending&min_price=999999&max_price=9999999', 3000);
      const vacia = await p.evaluate(() => [...document.querySelectorAll('.pnt-catvacia a, .pnt-catvacia button')].filter((a) => a.offsetWidth).map((a) => a.textContent.trim()));
      prueba('listado', vacia.length > 0, `${m}: categoría sin productos muestra la tarjeta con salidas`, vacia.join(' | '));
      if (vacia.some((t) => /borrar/i.test(t))) { await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '.pnt-catvacia a, .pnt-catvacia button', /borrar/)]); await espera(2500); prueba('listado', !/min_price/.test(url(p)), `${m}: "Borrar filtros" los saca`, url(p)); }
      await foto(p, `077-sin-productos-${m}`);
      // orden por defecto (82)
      await ir(p, '/todos-los-productos/aros/', 4500);
      prueba('listado', /sort_by=created-descending/.test(url(p)), `${m}: entrar sin orden queda en Novedades`, url(p));
      errores('listado', p, m); await p.close();
    }
  },

  // 51, 52, 77, 93–95, 99–101, 104: ficha
  async ficha() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.inicial, 4500);
      const h1 = await p.evaluate(() => document.querySelector('h1')?.textContent.trim());
      prueba('ficha', !/ - \d{3,5}$/.test(h1), `${m}: nombre sin código`, h1);
      // miniaturas (en compu; en celular Lima las muestra como puntitos / deslizando)
      const activa = () => p.evaluate(() => document.querySelector('.js-swiper-product .swiper-slide-active, .js-product-slide.swiper-slide-active')?.getAttribute('data-image') || '');
      const mini = await p.evaluate(() => [...document.querySelectorAll('.js-product-thumb')].filter((e) => e.offsetWidth).length);
      if (mini > 1) {
        const a0 = await activa();
        const t2 = (await p.$$('.js-product-thumb')).filter(Boolean)[1];
        if (TOQUE(m)) await t2.tap(); else await t2.click();
        await espera(1200);
        const a1 = await activa();
        prueba('ficha', a0 && a1 && a0 !== a1, `${m}: tocar una miniatura cambia la foto (${mini} miniaturas)`, `${a0} → ${a1}`);
        // flechas de las miniaturas
        const fl = await p.evaluate(() => [...document.querySelectorAll('.js-swiper-product-thumbs-next, .js-swiper-product-thumbs-prev, [class*="thumbs"] [class*="swiper-button"]')].filter((e) => e.offsetWidth).map((e) => e.className.slice(0, 60)));
        info('ficha', `${m}: flechas de miniaturas: ${fl.length}`);
      } else {
        // celular: deslizar la foto
        const a0 = await activa();
        const box = await p.evaluate(() => { const b = document.querySelector('.js-swiper-product').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width }; });
        await p.mouse.move(box.x + box.w * 0.3, box.y); await p.mouse.down(); await p.mouse.move(box.x - box.w * 0.3, box.y, { steps: 12 }); await p.mouse.up(); await espera(1200);
        const a1 = await activa();
        prueba('ficha', a0 !== a1, `${m}: deslizar la foto pasa a la siguiente`, `${a0} → ${a1}`);
      }
      // variantes: elegir otra cambia la selección (una CON stock)
      const v = await p.evaluate(() => [...document.querySelectorAll('.js-insta-variant')].filter((b) => b.offsetWidth).length);
      if (v > 1) {
        const sel0 = await p.evaluate(() => document.querySelector('.js-insta-variant.selected')?.textContent.trim());
        await tocar(p, '.js-insta-variant:not(.selected):not(.btn-variant-no-stock)'); await espera(1500);
        const sel1 = await p.evaluate(() => document.querySelector('.js-insta-variant.selected')?.textContent.trim());
        prueba('ficha', sel0 !== sel1, `${m}: elegir otra variante la marca`, `${sel0} → ${sel1}`);
        // una agotada: botón gris y sin "0 en stock"
        const ag = await tocar(p, '.js-insta-variant.btn-variant-no-stock:not(.selected)'); await espera(1500);
        if (ag) {
          const r = await p.evaluate(() => { const b = document.querySelector('.js-addtocart:not(.js-addtocart-placeholder)'); const s = getComputedStyle(b); const st = document.querySelector('.js-product-stock'); return { txt: (b.value || b.textContent).trim(), dis: b.disabled, bg: s.backgroundColor, stockVisible: !!(st && st.parentElement.offsetWidth), stock: st ? st.parentElement.textContent.trim().replace(/\s+/g, ' ') : '' }; });
          prueba('ficha', /sin stock/i.test(r.txt) && r.dis && !/244, 172, 196|242, 154, 183/.test(r.bg), `${m}: modelo agotado → botón "Sin stock" gris y deshabilitado`, `${r.txt} · ${r.bg}`);
          prueba('ficha', !r.stockVisible, `${m}: sin el texto "0 en stock"`, r.stockVisible ? r.stock : '');
          await foto(p, `077-modelo-agotado-${m}`);
          await tocar(p, '.js-insta-variant:not(.selected):not(.btn-variant-no-stock)'); await espera(1200);
          const r2 = await p.evaluate(() => { const b = document.querySelector('.js-addtocart:not(.js-addtocart-placeholder)'); return { txt: (b.value || b.textContent).trim(), dis: b.disabled, bg: getComputedStyle(b).backgroundColor }; });
          prueba('ficha', !r2.dis && /agregar/i.test(r2.txt) && /244, 172, 196/.test(r2.bg), `${m}: volver a un modelo con stock → "Agregar al carrito" rosa`, `${r2.txt} · ${r2.bg}`);
        }
      }
      // cantidad + y −
      const q0 = await p.evaluate(() => document.querySelector('.js-quantity-input')?.value);
      await tocar(p, '.js-quantity-up'); await espera(500);
      const q1 = await p.evaluate(() => document.querySelector('.js-quantity-input')?.value);
      await tocar(p, '.js-quantity-down'); await espera(500);
      const q2 = await p.evaluate(() => document.querySelector('.js-quantity-input')?.value);
      prueba('ficha', +q1 === +q0 + 1 && +q2 === +q0, `${m}: cantidad + y −`, `${q0} → ${q1} → ${q2}`);
      // descripción desplegable: abre y vuelve a cerrar
      const accEst = () => p.evaluate(() => { const a = document.querySelector('.pnt-acc'); const c = a?.querySelector('.pnt-acc-cuerpo'); return { ab: !!a?.classList.contains('pnt-acc-abierto'), alto: c ? Math.round(c.getBoundingClientRect().height) : 0 }; });
      const d0 = await accEst();
      await tocar(p, '.pnt-acc-toggle'); await espera(1100);
      const d1 = await accEst();
      if (d1.ab) await foto(p, `052-descripcion-${m}`);
      await tocar(p, '.pnt-acc-toggle'); await espera(1100);
      const d2 = await accEst();
      prueba('ficha', d0.ab !== d1.ab && d2.ab === d0.ab && (d1.ab ? d1.alto > 20 : d0.alto > 20), `${m}: la descripción se abre y se cierra`, `${d0.ab}/${d0.alto} → ${d1.ab}/${d1.alto} → ${d2.ab}/${d2.alto}`);
      // medios de pago: ventana y pestañas
      await tocar(p, '.js-accordion-toggle', /^medios de pago$/); await espera(1200);
      const vent = await tocar(p, 'a, button', /ver todos los medios de pago/); await espera(1800);
      prueba('ficha', vent && await visible(p, '#installments-modal'), `${m}: "Ver todos los medios de pago" abre la ventana`);
      const pest = await p.evaluate(() => [...document.querySelectorAll('#installments-modal .tab-link')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ')));
      if (pest.length > 1) {
        await tocar(p, '#installments-modal .tab-link', /mercado/); await espera(1200);
        const act = await p.evaluate(() => document.querySelector('#installments-modal .tab.active .tab-link, #installments-modal .tab-link.active')?.textContent.trim().replace(/\s+/g, ' '));
        prueba('ficha', /mercado/i.test(act || ''), `${m}: pestaña Mercado Pago`, `activa ${act}`);
        await foto(p, `094-pagos-mercadopago-${m}`);
        const txt = await p.evaluate(() => document.querySelector('#installments-modal')?.innerText || '');
        prueba('ficha', !/\$\s?[\d.]+,00\b/.test(txt), `${m}: ventana de pagos sin "$X,00"`, (txt.match(/\$\s?[\d.]+,00\b/g) || []).slice(0, 4).join(' '));
        await tocar(p, '#installments-modal .tab-link', /personalizados/); await espera(1000);
        await foto(p, `094-pagos-transferencia-${m}`);
      }
      if (!TOQUE(m)) { await p.keyboard.press('Escape'); await espera(1100); prueba('ficha', !(await p.evaluate(() => document.querySelector('#installments-modal')?.classList.contains('modal-show'))), 'compu: Escape cierra la ventana de pagos'); }
      else { await tocar(p, '#installments-modal .js-modal-close'); await espera(1100); prueba('ficha', !(await p.evaluate(() => document.querySelector('#installments-modal')?.classList.contains('modal-show'))), 'celu: la cruz cierra la ventana de pagos'); }
      // foto ampliada
      await a(p, 0);
      await tocar(p, '.js-product-slide-link, .js-product-slide img, [data-fancybox]'); await espera(2200);
      const fb = await visible(p, '.fancybox__container');
      prueba('ficha', fb, `${m}: tocar la foto la amplía`);
      if (fb) {
        const c0 = await p.evaluate(() => document.querySelector('.fancybox__container [data-fancybox-index]')?.textContent.trim() || '');
        if (!TOQUE(m)) await p.keyboard.press('ArrowRight'); else { await espera(900); await tocar(p, '.fancybox__container .swiper-button-next'); }   // táctil: que termine de abrir (si no, el toque cae en la foto y la agranda)
        await espera(1300);
        const c1 = await p.evaluate(() => document.querySelector('.fancybox__container [data-fancybox-index]')?.textContent.trim() || '');
        prueba('ficha', c0 !== c1, `${m}: pasar a la foto siguiente en la ampliación`, `${c0} → ${c1}`);
        await foto(p, `095-foto-ampliada-${m}`);
        if (!TOQUE(m)) { await p.keyboard.press('Escape'); await espera(1300); prueba('ficha', !(await visible(p, '.fancybox__container')), `${m}: Escape cierra la ampliación`); }
        else { await tocar(p, '.fancybox__toolbar .carousel__button, .fancybox__container .carousel__button:not(.is-prev):not(.is-next)'); await espera(1300); prueba('ficha', !(await visible(p, '.fancybox__container')), `${m}: la cruz cierra la ampliación`); }
        if (await visible(p, '.fancybox__container')) { await p.keyboard.press('Escape'); await espera(1000); }
      }
      // reseñas
      if (await verEl(p, '.pnt-res')) {
        const fl = await p.evaluate(() => [...document.querySelectorAll('.pnt-res-flecha')].filter((e) => e.offsetWidth).length);
        const x0 = await p.evaluate(() => Math.round(document.querySelector('.pnt-res-item')?.getBoundingClientRect().left || 0));
        if (fl) { await tocar(p, '.pnt-res-flecha--der'); await espera(1300); }
        else { const b = await p.evaluate(() => { const r = document.querySelector('.pnt-res-item').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await p.touchscreen.touchStart(b.x + 100, b.y); await p.touchscreen.touchMove(b.x - 150, b.y); await p.touchscreen.touchEnd(); await espera(1300); }
        const x1 = await p.evaluate(() => Math.round(document.querySelector('.pnt-res-item')?.getBoundingClientRect().left || 0));
        prueba('ficha', x0 !== x1, `${m}: las reseñas avanzan (${fl ? 'flecha' : 'deslizando'})`, `${x0} → ${x1}`);
        await foto(p, `051-resenas-${m}`);
      }
      // te va a interesar
      if (await verEl(p, '.section-products-related')) {
        const x0 = await p.evaluate(() => document.querySelector('.section-products-related .swiper-container, .section-products-related .swiper')?.swiper?.activeIndex);
        const hayF = await tocar(p, '.pnt-rel-flechas .swiper-button-next, .section-products-related .swiper-button-next');
        if (!hayF) { const b = await p.evaluate(() => { const r = document.querySelector('.section-products-related .swiper-container, .section-products-related .swiper').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 120 }; }); await deslizar(p, b.x + 100, b.y, -240); }
        await espera(1300);
        const x1 = await p.evaluate(() => document.querySelector('.section-products-related .swiper-container, .section-products-related .swiper')?.swiper?.activeIndex);
        prueba('ficha', x0 !== x1, `${m}: "Te va a interesar" avanza (${hayF ? 'flecha' : 'deslizando'})`, `${x0} → ${x1}`);
        await verEl(p, '.section-products-related');
        await foto(p, `051-te-va-a-interesar-${m}`);
        const alturas = await p.evaluate(() => [...document.querySelectorAll('.section-products-related .swiper-slide')].filter((s) => { const b = s.getBoundingClientRect(); return b.left >= -5 && b.right <= innerWidth + 5; }).map((s) => Math.round(s.querySelector('.pnt-mv-nombre')?.getBoundingClientRect().height || 0)));
        prueba('ficha', new Set(alturas).size <= 1, `${m}: nombres de "Te va a interesar" del mismo alto`, alturas.join(', '));
      }
      prueba('ficha', await p.evaluate(() => { const f = document.querySelector('.fb-comments'); return !f || f.offsetHeight === 0; }), `${m}: sin hueco de comentarios de Facebook`);
      errores('ficha', p, m);
      // envío (Silver Flower: tiene stock): CP inválido, CP 8000 y "Cambiar CP"
      await ir(p, P.ficha, 4000);
      await tocar(p, '.js-accordion-toggle', /^medios de env[ií]o$/); await espera(1200);
      const cpSel = '.product-shipping-calculator input[name="zipcode"], .js-shipping-input';
      for (const [cp, esperado] of [['1234567', 'error'], ['8000', 'ok']]) {
        // si la tienda recuerda un CP anterior, se ve "Entregas para el CP: … · Cambiar CP" encima del campo: primero "Cambiar CP"
        if (await visible(p, '.product-shipping-calculator .js-shipping-calculator-change-zipcode')) { await tocar(p, '.product-shipping-calculator .js-shipping-calculator-change-zipcode'); await espera(1000); }
        const campo = (await p.$$(cpSel))[0];
        if (!campo || !(await campo.boundingBox())) { prueba('ficha', false, `${m}: campo de código postal visible`); break; }
        await campo.evaluate((e) => { e.scrollIntoView({ block: 'center' }); e.value = ''; });
        await campo.click({ clickCount: 3 }).catch(() => {}); await campo.type(cp, { delay: 40 });
        await tocar(p, '.product-shipping-calculator .js-calculate-shipping'); await espera(8000);
        const r = await p.evaluate(() => ({ resp: (document.querySelector('.product-shipping-calculator .js-shipping-calculator-response')?.innerText || '').replace(/\s+/g, ' ').trim(), err: [...document.querySelectorAll('.product-shipping-calculator .js-ship-calculator-error, .product-shipping-calculator .js-ship-calculator-common-error, .product-shipping-calculator .alert, .product-shipping-calculator .js-shipping-calculator-errors > *')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' ') }));
        if (esperado === 'ok') {
          prueba('ficha', r.resp.length > 20, `${m}: envío calculado para CP 8000`, r.resp.slice(0, 200));
          prueba('ficha', !/\$\s?[\d.]+,00\b/.test(r.resp), `${m}: precios de envío sin ",00"`);
          await foto(p, `093-envio-8000-${m}`);
          const cambiar = await tocar(p, '.product-shipping-calculator a, .product-shipping-calculator button', /cambiar/); await espera(1200);
          prueba('ficha', cambiar && !!(await (await p.$$(cpSel))[0]?.boundingBox()), `${m}: "Cambiar CP" vuelve al campo`);
        } else { prueba('ficha', !!r.err, `${m}: CP inválido muestra un aviso`, r.err.slice(0, 120)); await foto(p, `093-cp-invalido-${m}`); }
      }
      // color (100)
      await ir(p, P.casiopea, 4000);
      await tocar(p, '.js-insta-variant:not(.selected)'); await espera(1500);
      const col = await p.evaluate(() => [...document.querySelectorAll('.js-product-variants .form-label')].filter((l) => l.offsetWidth).map((l) => l.textContent.trim().replace(/\s+/g, ' ')).find((t) => /color/i.test(t)) || '');
      const elegido = await p.evaluate(() => [...document.querySelectorAll('.js-insta-variant.selected')].find((b) => b.offsetWidth)?.textContent.trim());
      prueba('ficha', new RegExp('color:\\s*' + elegido, 'i').test(col), `${m}: al elegir un color se ve su nombre`, `${col} (elegido ${elegido})`);
      await foto(p, `100-color-${m}`);
      // ficha "Ofertas" en rojo
      await ir(p, P.anillo, 4500);
      prueba('ficha', await p.evaluate(() => !!document.querySelector('.pnt-fp-oferta')), `${m}: Cocodrilo (está en "No los dejes escapar") con la estética roja`);
      await foto(p, `ficha-oferta-roja-${m}`);
      errores('ficha', p, m + ' (envío/color/oferta)'); await p.close();
    }
  },

  // 53, 65, 79, 72: carrito lateral y página del carrito (2 productos, +, −, quitar, envío, iniciar compra) → se vacía
  async carrito() {
    for (const m of MODOS) {
      const p = await pagina(m);
      // vacío
      await ir(p, P.carrito, 2500);
      if (await p.evaluate(() => document.querySelectorAll('[data-item-id]').length)) await vaciar(p);
      const vacio = await p.evaluate(() => [...document.querySelectorAll('main a, #shoppingCartPage a')].filter((a) => a.offsetWidth && /ver productos/i.test(a.textContent)).map((a) => a.getAttribute('href'))[0]);
      prueba('carrito', !!vacio && (await estado(vacio.replace(/^https?:\/\/[^/]+/, ''))) === 200, `${m}: carrito vacío con "Ver productos" que funciona`, vacio);
      // bolsa de arriba abre el lateral (vacío)
      await ir(p, P.inicio, 3500);
      await tocar(p, '.js-head-main a[href*="/comprar"]'); await espera(3500);
      prueba('carrito', await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto')), `${m}: la bolsa de arriba abre el carrito lateral`);
      await foto(p, `079-lateral-vacio-${m}`);
      await tocar(p, '.pnt-cp-cerrar'); await espera(900);
      prueba('carrito', !(await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto'))), `${m}: la cruz cierra el carrito lateral`);
      // agregar desde la ficha
      await agregar(p, P.charm);
      const ab = await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto'));
      prueba('carrito', ab, `${m}: "Agregar al carrito" abre el lateral`);
      const enMarco = await p.evaluate(() => { try { const d = document.querySelector('.pnt-cp-marco').contentDocument; return [...d.querySelectorAll('.js-cart-item')].map((e) => e.innerText.replace(/\s+/g, ' ').slice(0, 80)); } catch (e) { return ['?']; } });
      prueba('carrito', enMarco.length === 1 && /family/i.test(enMarco[0]), `${m}: el lateral muestra el producto agregado`, enMarco.join(' | '));
      prueba('carrito', !enMarco.some((t) => / - \d{3,5}\b/.test(t)), `${m}: nombre sin código en el carrito`);
      const badge = await p.evaluate(() => document.querySelector('.js-head-main .js-cart-widget-amount')?.textContent.trim());
      prueba('carrito', badge === '1', `${m}: el número de la bolsa se actualiza`, badge);
      await foto(p, `079-lateral-con-producto-${m}`);
      // Escape / fondo
      if (!TOQUE(m)) { await p.keyboard.press('Escape'); await espera(900); prueba('carrito', !(await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto'))), 'compu: Escape cierra el lateral'); }
      else { const w = await p.evaluate(() => document.querySelector('.pnt-cp-panel')?.getBoundingClientRect().width || 0); if (w < 370) { await p.mouse.click(10, 400); await espera(900); prueba('carrito', !(await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto'))), 'celu: tocar afuera cierra el lateral'); } else { info('carrito', `celu: el carrito lateral ocupa todo el ancho (${Math.round(w)} px): se cierra con la cruz`); await tocar(p, '.pnt-cp-cerrar'); await espera(900); } }
      // segundo producto: bolsita de una tarjeta de un charm simple en el listado de charms
      await ir(p, P.charms, 3500);
      const simple = await p.evaluate(() => { const b = [...document.querySelectorAll('.js-item-product .js-addtocart:not(.js-addtocart-placeholder), .js-item-product .pnt-mv-bolsa button')].find((e) => e.offsetWidth || e.closest('.js-item-product').offsetWidth); if (!b) return ''; b.scrollIntoView({ block: 'center' }); return b.closest('.js-item-product').querySelector('.pnt-mv-nombre')?.textContent.trim() || 'sí'; });
      if (simple) {
        await tocar(p, '.js-item-product .js-addtocart:not(.js-addtocart-placeholder), .js-item-product .pnt-mv-bolsa button'); await espera(6000);
        prueba('carrito', await p.evaluate(() => document.documentElement.classList.contains('pnt-cp-abierto')), `${m}: la bolsita de una tarjeta agrega y abre el lateral`, simple);
        await foto(p, `064-bolsita-agrega-${m}`);
      } else info('carrito', `${m}: no se encontró una tarjeta con bolsita que agregue directo`);
      // página del carrito
      await ir(p, P.carrito, 3500);
      const fila = async () => p.evaluate(() => { const its = [...document.querySelectorAll('#shoppingCartPage .js-cart-item')].filter((e) => e.offsetWidth); const pr = document.querySelector('#shoppingCartPage .js-cart-item[data-prueba]') || its[0]; return { n: its.length, q: [pr?.querySelector('.js-cart-quantity-input')?.value], sub: (document.querySelector('#shoppingCartPage .js-cart-subtotal')?.textContent || '').trim(), total: (document.querySelector('#shoppingCartPage .js-cart-total')?.textContent || '').trim() }; });
      await p.evaluate(() => { const it = [...document.querySelectorAll('#shoppingCartPage .js-cart-item')].find((e) => e.offsetWidth && /family/i.test(e.textContent)); if (it) it.setAttribute('data-prueba', '1'); });
      const f0 = await fila();
      info('carrito', `${m}: ${f0.n} productos, cantidades ${f0.q.join(',')}, subtotal ${f0.sub}`);
      prueba('carrito', !/,00/.test(f0.sub + f0.total), `${m}: totales sin ",00"`, `${f0.sub} / ${f0.total}`);
      const tach = await p.evaluate(() => [...document.querySelectorAll('.js-cart-item')].filter((e) => e.offsetWidth).map((it) => [...it.querySelectorAll('*')].filter((e) => e.offsetWidth && getComputedStyle(e).textDecorationLine.includes('line-through') && e.children.length === 0).length));
      prueba('carrito', tach.every((n) => n <= 1), `${m}: el precio tachado aparece una sola vez por producto`, tach.join(','));
      await foto(p, `053-carrito-pagina-${m}`, { full: true });
      await tocar(p, '#shoppingCartPage .js-cart-item[data-prueba] [data-component="quantity.plus"]'); await espera(5000);
      const f1 = await fila();
      prueba('carrito', +f1.q[0] === +f0.q[0] + 1 && f1.sub !== f0.sub, `${m}: "+" suma uno y cambia el subtotal`, `${f0.q[0]} → ${f1.q[0]} · ${f0.sub} → ${f1.sub}`);
      await tocar(p, '#shoppingCartPage .js-cart-item[data-prueba] [data-component="quantity.minus"]'); await espera(5000);
      const f2 = await fila();
      prueba('carrito', +f2.q[0] === +f0.q[0], `${m}: "−" resta uno`, `${f1.q[0]} → ${f2.q[0]}`);
      const barra = await p.evaluate(() => (document.querySelector('.pnt-envio-gratis, [class*="free-shipping"]')?.innerText || '').replace(/\s+/g, ' ').trim());
      info('carrito', `${m}: barra de envío gratis: ${barra || '(no está en la página del carrito)'}`);
      // calcular envío en el carrito
      const cpc = await p.$('#shoppingCartPage input[name="zipcode"]:not([type=hidden]), #shoppingCartPage .js-shipping-input');
      if (cpc && await cpc.boundingBox()) { await cpc.evaluate((e) => { e.scrollIntoView({ block: 'center' }); e.value = ''; }); await cpc.type('8000'); await tocar(p, '#shoppingCartPage .js-calculate-shipping'); await espera(8000); const r = await p.evaluate(() => (document.querySelector('#shoppingCartPage .js-shipping-calculator-response')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200)); prueba('carrito', r.length > 20, `${m}: calcular envío en el carrito`, r);
        const tot = await p.evaluate(() => [...document.querySelectorAll('#shoppingCartPage .js-cart-total, #shoppingCartPage .js-cart-subtotal, #shoppingCartPage .cart-shipping-costs-price')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim()).join(' | '));
        prueba('carrito', !/\$\s+\d/.test(tot), `${m}: totales sin espacio después del $`, tot);
        const lab = []; for (const l of await p.$$('#shoppingCartPage .js-shipping-calculator-response label.js-shipping-radio')) { if (await l.boundingBox()) lab.push(l); }
        if (lab[1]) {
          const e0 = await p.evaluate(() => document.querySelector('#shoppingCartPage .cart-shipping-costs-price')?.textContent.trim());
          await lab[1].evaluate((e) => e.scrollIntoView({ block: 'center' })); await espera(400);
          if (TOQUE(m)) await lab[1].tap(); else await lab[1].click();
          await espera(4500);
          const e1 = await p.evaluate(() => document.querySelector('#shoppingCartPage .cart-shipping-costs-price')?.textContent.trim());
          prueba('carrito', e0 !== e1, `${m}: elegir otra opción de envío cambia el costo`, `${e0} → ${e1}`);
          const marca = await p.evaluate(() => { const i = document.querySelector('#shoppingCartPage .js-shipping-calculator-response input[type=radio]:checked + .radio-button-content'); return i ? getComputedStyle(i, '::before').backgroundColor : 'sin elegida'; });
          prueba('carrito', /244, 172, 196/.test(marca), `${m}: la opción elegida se ve marcada (circulito rosa)`, marca);
        }
        await foto(p, `053-carrito-envio-${m}`); }
      else info('carrito', `${m}: la página del carrito no tiene calculadora de envío visible`);
      // iniciar compra
      const ini = await p.evaluate(() => { const b = [...document.querySelectorAll('#shoppingCartPage a, #shoppingCartPage input[type=submit], #shoppingCartPage button')].find((e) => e.offsetWidth && /iniciar compra/i.test(e.textContent || e.value)); if (!b) return null; const s = getComputedStyle(b); return { bg: s.backgroundColor, color: s.color }; });
      prueba('carrito', !!ini, `${m}: botón "Iniciar compra"`, ini ? `fondo ${ini.bg}, letra ${ini.color}` : '');
      // quitar uno
      const n0 = (await fila()).n;
      await tocar(p, '#shoppingCartPage .js-cart-item [data-component="line-item.remove"]');
      let n1 = n0; for (let k = 0; k < 24 && n1 === n0; k++) { await espera(500); n1 = await p.evaluate(() => [...document.querySelectorAll('#shoppingCartPage .js-cart-item')].filter((e) => e.offsetWidth).length).catch(() => n0); }
      prueba('carrito', n1 === n0 - 1, `${m}: el tachito quita el producto`, `${n0} → ${n1}`);
      errores('carrito', p, m);
      await vaciar(p); await p.close();
    }
  },

  // 56, 102: contacto (sin enviar)
  async contacto() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.contacto, 4500);
      const r = await p.evaluate(() => {
        const f = document.querySelector('form[action*="contact"], .js-contact-form, form#contact-form') || [...document.forms].find((x) => x.querySelector('textarea'));
        if (!f) return null;
        const req = [...f.querySelectorAll('input, textarea')].filter((e) => e.required || e.getAttribute('data-required')).map((e) => e.name);
        const vacio = f.checkValidity();
        const em = f.querySelector('[type=email], [name=email]'); if (em) { em.value = 'no-es-un-mail'; }
        const malMail = em ? em.checkValidity() : null; if (em) em.value = '';
        return { req, vacio, malMail, campos: [...f.querySelectorAll('input:not([type=hidden]), textarea')].map((e) => e.name || e.type) };
      });
      prueba('contacto', !!r, `${m}: formulario de contacto presente`, r ? r.campos.join(', ') : '');
      if (r) {
        prueba('contacto', !r.vacio, `${m}: no deja enviar el formulario vacío`, `obligatorios: ${r.req.join(', ') || 'ninguno marcado'}`);
        prueba('contacto', r.malMail === false, `${m}: rechaza un mail mal escrito`);
      }
      const wa = await p.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]')].filter((a) => a.offsetWidth && !a.closest('.btn-whatsapp, .wa-globo')).map((a) => a.textContent.trim().replace(/\s+/g, ' ') + ' → ' + a.getAttribute('href')));
      prueba('contacto', wa.length > 0 && wa.every((x) => /5492915661062/.test(x)), `${m}: WhatsApp de Contacto lleva al número`, wa.join(' | '));
      const locales = await p.evaluate(() => [...document.querySelectorAll('.pnt-local-ciudad')].map((e) => e.parentElement.innerText.replace(/\s+/g, ' ').trim()));
      prueba('contacto', locales.length === 2, `${m}: un renglón por local`, locales.join(' | '));
      await verEl(p, '.cf-turnstile, iframe[src*="challenges"]'); await espera(2500);
      await foto(p, `056-contacto-formulario-${m}`);
      errores('contacto', p, m);
      // botón de arrepentimiento
      await ir(p, P.arrep, 3500);
      const t = await p.evaluate(() => document.querySelector('h1, .h1')?.textContent.trim());
      prueba('contacto', /arrepentimiento/i.test(t || ''), `${m}: título de "Botón de arrepentimiento"`, t);
      await p.close();
    }
  },

  // 57, 84: páginas de texto (acordeón: abre, cierra, uno por vez)
  async textos() {
    for (const m of MODOS) for (const k of ['cuidados', 'cambios', 'envios']) {
      const p = await pagina(m); await ir(p, P[k], 3500);
      const n = await p.evaluate(() => [...document.querySelectorAll('.pnt-cu-pagina .pnt-cu-btn, .pnt-cu-pagina .pnt-cu-item button')].filter((e) => e.offsetWidth).length);
      if (n) {
        const est = async () => p.evaluate(() => [...document.querySelectorAll('.pnt-cu-pagina .pnt-cu-item')].map((it) => (it.classList.contains('is-abierto') || it.classList.contains('abierto') || it.getAttribute('aria-expanded') === 'true' || it.querySelector('[aria-expanded="true"]') ? 1 : 0)).join(''));
        const e0 = await est();
        await tocar(p, '.pnt-cu-pagina .pnt-cu-item:nth-child(2) .pnt-cu-btn, .pnt-cu-pagina .pnt-cu-item:nth-child(2) button'); await espera(1200);
        const e1 = await est();
        await tocar(p, '.pnt-cu-pagina .pnt-cu-item:nth-child(3) .pnt-cu-btn, .pnt-cu-pagina .pnt-cu-item:nth-child(3) button'); await espera(1200);
        const e2 = await est();
        await tocar(p, '.pnt-cu-pagina .pnt-cu-item:nth-child(3) .pnt-cu-btn, .pnt-cu-pagina .pnt-cu-item:nth-child(3) button'); await espera(1200);
        const e3 = await est();
        prueba('textos', e1 !== e0 && (e2.match(/1/g) || []).length <= 1 && e2 !== e1 && e3 !== e2, `${m} ${k}: acordeón abre, cambia y cierra (${n} ítems)`, `${e0} → ${e1} → ${e2} → ${e3}`);
        await tocar(p, '.pnt-cu-pagina .pnt-cu-item:nth-child(2) .pnt-cu-btn, .pnt-cu-pagina .pnt-cu-item:nth-child(2) button'); await espera(1300);
        const alto = await p.evaluate(() => { const r = [...document.querySelectorAll('.pnt-cu-pagina .pnt-cu-resp')].map((e) => e.getBoundingClientRect().height); return Math.max(0, ...r); });
        prueba('textos', alto > 20, `${m} ${k}: el texto abierto se ve`, `${Math.round(alto)} px`);
      } else {
        const filas = await p.evaluate(() => document.querySelectorAll('.pnt-pag-fichas > *, .pnt-co-fila').length);
        info('textos', `${m} ${k}: sin acordeón (${filas} fichas)`);
      }
      await foto(p, `057-${k}-${m}`, { full: true });
      errores('textos', p, `${m} ${k}`); await p.close();
    }
    // 404
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.e404, 3500);
      const bs = await p.evaluate(() => [...document.querySelectorAll('.pnt-404 a, main a.btn')].filter((a) => a.offsetWidth).map((a) => a.getAttribute('href')));
      const caidos = []; for (const h of bs) { const s = await estado(h.replace(/^https?:\/\/[^/]+/, '')); if (s !== 200) caidos.push(s + ' ' + h); }
      prueba('textos', bs.length >= 2 && !caidos.length, `${m}: botones del 404 funcionan`, caidos.join(' | ') || bs.join(' | '));
      const sug = await p.evaluate(() => [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).length);
      prueba('textos', sug > 0, `${m}: 404 con productos sugeridos`, String(sug));
      await p.close();
    }
  },

  // 59–61, 69: cuenta
  async cuenta() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.login, 3000);
      const links = await p.evaluate(() => [...document.querySelectorAll('body a[href]')].filter((a) => a.offsetWidth && !a.closest('header, footer, .js-head-main, #nav-hamburger, #nav-search, .wa-globo, .btn-whatsapp')).map((a) => a.textContent.trim().replace(/\s+/g, ' ') + '→' + a.getAttribute('href')));
      info('cuenta', `${m}: links del login: ${links.join(' | ')}`);
      const reg = links.find((l) => /cre(á|a)|registr/i.test(l)); const olv = links.find((l) => /olvid/i.test(l));
      prueba('cuenta', !!reg && !!olv, `${m}: el login lleva a "Crear cuenta" y "Olvidé mi contraseña"`);
      // vacío
      const v = await p.evaluate(() => { const f = document.querySelector('form [type=password]')?.closest('form'); return f ? f.checkValidity() : null; });
      if (v) {
        await tocar(p, 'form [type=submit], form .btn-primary', /iniciar|ingresar/); await espera(4000);
        const aviso = await p.evaluate(() => [...document.querySelectorAll('.notification-centered, .alert, .help-block, .form-group-error')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '));
        prueba('cuenta', !!aviso, `${m}: login vacío avisa qué falta`, aviso.slice(0, 160));
        await foto(p, `069-login-vacio-${m}`);
      } else prueba('cuenta', v === false, `${m}: login vacío no se envía (validación del navegador)`);
      // mal
      await ir(p, P.login, 2500);
      await p.evaluate(() => { const f = document.querySelector('form [type=password]').closest('form'); f.querySelector('[type=email], [name=email]').value = 'prueba-no-existe@example.com'; f.querySelector('[type=password]').value = 'clave-incorrecta-123'; });
      await tocar(p, 'form [type=submit], form .btn-primary', /iniciar|ingresar/); await espera(6000);
      const aviso = await p.evaluate(() => [...document.querySelectorAll('.notification-centered, .alert')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '));
      prueba('cuenta', /correctos|incorrect|no coinciden|inválid/i.test(aviso), `${m}: login con datos malos muestra el error`, aviso.slice(0, 120));
      await foto(p, `069-login-error-${m}`);
      // registro y olvido: validación sin enviar
      for (const k of ['registro', 'reset']) {
        await ir(p, P[k], 3000);
        const r = await p.evaluate(() => { const f = [...document.forms].find((x) => x.querySelector('[type=email], [name=email]')); if (!f) return null; return { valido: f.checkValidity(), campos: [...f.querySelectorAll('input:not([type=hidden])')].map((e) => e.name + (e.required ? '*' : '')) }; });
        prueba('cuenta', !!r, `${m}: formulario de ${k}`, r ? r.campos.join(', ') : '');
        if (r && r.valido) info('cuenta', `${m}: ${k} vacío pasa la validación del navegador (la hace Tiendanube al enviar)`);
        await foto(p, `060-${k}-${m}`);
      }
      // cuenta sin sesión
      await ir(p, '/account/orders/', 2500);
      prueba('cuenta', /\/account\/login/.test(url(p)), `${m}: "Mis pedidos" sin sesión lleva al login`, url(p));
      errores('cuenta', p, m); await p.close();
    }
  },

  // 68: cookies (aparece, "Entendido" la cierra y no vuelve)
  async cookies() {
    for (const m of MODOS) {
      const ctx = await browser.createBrowserContext();
      const p = await pagina(m, { ctx, sinCookies: false }); await ir(p, P.inicio, 5000);
      prueba('cookies', await visible(p, '.js-notification-cookie-banner'), `${m}: aviso de cookies aparece la primera vez`);
      await foto(p, `068-cookies-${m}`);
      const wa = await p.evaluate(() => { const c = document.querySelector('.js-notification-cookie-banner')?.getBoundingClientRect(); const w = document.querySelector('.btn-whatsapp')?.getBoundingClientRect(); if (!c || !w) return 'falta'; return c.right > w.left && c.left < w.right && c.bottom > w.top && c.top < w.bottom ? 'se pisan' : 'libre'; });
      prueba('cookies', wa !== 'se pisan', `${m}: el aviso no tapa el botón de WhatsApp`, wa);
      await tocar(p, '.js-notification-cookie-banner .js-acknowledge-cookies, .js-notification-cookie-banner button, .js-notification-cookie-banner a', /entendido|aceptar/); await espera(1200);
      prueba('cookies', !(await visible(p, '.js-notification-cookie-banner')), `${m}: "Entendido" cierra el aviso`);
      await ir(p, P.contacto, 3500);
      prueba('cookies', !(await visible(p, '.js-notification-cookie-banner')), `${m}: no vuelve a aparecer en otra página`);
      await p.close(); await ctx.close();
    }
  },

  // 74, 101: WhatsApp (botón, cartel, cerrar, CTA)
  async whatsapp() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.contacto, 3000);
      const href = await p.evaluate(() => { const b = document.querySelector('.btn-whatsapp'); return b ? (b.getAttribute('href') || b.querySelector('a')?.getAttribute('href') || '') : ''; });
      prueba('whatsapp', /5492915661062/.test(href), `${m}: el botón flotante va al WhatsApp de Panthera`, href.slice(0, 80));
      // el saludo lo lleva también en celular (paginas.js 7d)
      await espera(1500);
      const href2 = await p.evaluate(() => document.querySelector('a.btn-whatsapp')?.getAttribute('href') || '');
      prueba('whatsapp', /\?text=.*Panthera/i.test(decodeURIComponent(href2)), `${m}: el botón abre el chat con el saludo`, decodeURIComponent(href2).slice(0, 90));
      let globo = false;
      if (TOQUE(m)) { info('whatsapp', m + ': el cartel es solo para compu (marca.js no lo arma en pantallas táctiles)'); }
      else {
        for (let i = 0; i < 30 && !globo; i++) { await espera(1000); globo = await p.evaluate(() => document.querySelector('.wa-globo')?.classList.contains('is-open')); }
        prueba('whatsapp', globo, `${m}: el cartel de WhatsApp aparece solo`);
      }
      if (globo) {
        await foto(p, `074-cartel-${m}`);
        const cta = await p.evaluate(() => { const c = document.querySelector('.wa-globo .wa-cta'); return c ? (c.getAttribute('href') || c.closest('a')?.getAttribute('href') || 'botón') : ''; });
        prueba('whatsapp', /5492915661062|botón/.test(cta), `${m}: "Quiero comprar" va al WhatsApp`, cta.slice(0, 90));
        await tocar(p, '.wa-globo .wa-cerrar'); await espera(1000);
        prueba('whatsapp', !(await p.evaluate(() => document.querySelector('.wa-globo')?.classList.contains('is-open'))), `${m}: la cruz cierra el cartel`);
      }
      if (!TOQUE(m)) {
        await ir(p, P.ficha, 3000); let g = false; for (let i = 0; i < 20 && !g; i++) { await espera(1000); g = await p.evaluate(() => document.querySelector('.wa-globo')?.classList.contains('is-open')); }
        const pisa = await p.evaluate(() => { const g = document.querySelector('.wa-globo'); if (!g || !g.classList.contains('is-open')) return 'cerrado'; const a = g.getBoundingClientRect(); return [...document.querySelectorAll('[data-wa-evitar]')].some((e) => { const b = e.getBoundingClientRect(); return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom; }) ? 'pisa la ficha' : 'libre'; });
        prueba('whatsapp', pisa !== 'pisa la ficha', 'compu: en la ficha el cartel no tapa la columna de compra', pisa);
      }
      errores('whatsapp', p, m); await p.close();
    }
  },

  // 106, 112: pie (links vivos, logos cargados, redes)
  async pie() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.contacto, 3000); await recorrer(p); await a(p, 99999); await espera(1200);
      const r = await p.evaluate(() => { const f = document.querySelector('footer'); return { links: [...f.querySelectorAll('a[href]')].map((a) => ({ t: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 30), h: a.getAttribute('href') })), logos: [...f.querySelectorAll('.footer-payments-shipping-logos img, .footer-payments-shipping-logos svg')].map((i) => (i.tagName === 'IMG' ? (i.complete && i.naturalWidth ? 1 : 0) : 1)), filas: [...new Set([...f.querySelectorAll('.footer-payments-shipping-logos > span > *')].filter((e) => e.offsetWidth).map((e) => Math.round(e.getBoundingClientRect().top)))].length }; });
      const internos = [...new Set(r.links.map((l) => l.h).filter((h) => h && (h.startsWith('/') || /^https?:\/\/(www\.)?(pantherajoyeria\.com\.ar|localhost:5700)(\/|$)/.test(h))))];
      const caidos = []; for (const h of internos) { const s = await estado(h.replace(/^https?:\/\/[^/]+/, '')); if (s !== 200) caidos.push(s + ' ' + h); }
      prueba('pie', !caidos.length, `${m}: ${internos.length} links internos del pie responden`, caidos.join(' | '));
      info('pie', `${m}: externos: ${r.links.filter((l) => /^https?:/.test(l.h) && !/^https?:\/\/(www\.)?(pantherajoyeria\.com\.ar|localhost:5700)(\/|$)/.test(l.h)).map((l) => l.t + '→' + l.h.slice(0, 50)).join(' | ')}`);
      prueba('pie', r.logos.length > 0 && r.logos.every(Boolean), `${m}: logos de pago y envío cargados (${r.logos.length})`, `${r.logos.filter((x) => !x).length} sin cargar · ${r.filas} filas`);
      await foto(p, `106-pie-${m}`);
      const crea = await p.evaluate(() => [...document.querySelectorAll('footer a')].find((a) => /crealo vos misma/i.test(a.textContent))?.getAttribute('href'));
      info('pie', `${m}: "Crealo vos misma" del pie → ${crea}`);
      errores('pie', p, m); await p.close();
    }
  },

  // 87: Ofertas (franja SALE, orden, filtro, tarjetas en rojo)
  async ofertas() {
    for (const m of MODOS) {
      const p = await pagina(m); await ir(p, P.ofertas, 8000);
      const r = await p.evaluate(() => ({ sale: (document.querySelector('.pnt-sale')?.innerText || '').replace(/\s+/g, ' '), n: [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).length, fila: [...new Set([...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).slice(0, 10).map((e) => Math.round(e.getBoundingClientRect().top)))].length }));
      prueba('ofertas', !!r.sale && r.n > 0, `${m}: franja SALE y productos`, `${r.sale.slice(0, 80)} · ${r.n} productos`);
      // (2026-11-16) la categoría con la estética de la página armada: todas sus tarjetas rojas (dentro del envoltorio de "No los dejes escapar")
      const rojas = await p.evaluate(() => ({ rojas: document.querySelectorAll('.pnt-ofertas-grilla .pnt-mv-card').length, sueltas: document.querySelectorAll('.js-product-table > .js-item-product').length }));
      prueba('ofertas', rojas.rojas === r.n && !rojas.sueltas, `${m}: tarjetas rojas como en "No los dejes escapar"`, JSON.stringify(rojas));
      if (r.n < 2) { info('ofertas', `${m}: con ${r.n} producto no se puede probar el orden`); }
      else {
      { const abierto = await abrirOrden(p); await tocar(p, OPCION_ORDEN[abierto] || '.pnt-orden-op', /menor precio/); } await espera(4500);
      const ps = (await precios(p)).map(precio).filter(Boolean);
      prueba('ofertas', ps.length > 1 && ps.every((v, i) => !i || ps[i - 1] <= v), `${m}: Ofertas ordenadas por menor precio`, ps.join(', '));
      { const abierto = await abrirOrden(p); await tocar(p, OPCION_ORDEN[abierto] || '.pnt-orden-op', /mayor precio/); } await espera(4500);
      const ps2 = (await precios(p)).map(precio).filter(Boolean);
      prueba('ofertas', ps2.length > 1 && ps2.every((v, i) => !i || ps2[i - 1] >= v), `${m}: Ofertas ordenadas por mayor precio`, ps2.join(', '));
      prueba('ofertas', /ofertas/.test(url(p)), `${m}: sigue en Ofertas después de ordenar`, url(p));
      }
      // la dirección de la página armada con código lleva a la categoría
      await ir(p, '/todos-los-productos/?ofertas&sort_by=created-descending', 3000);
      prueba('ofertas', url(p).includes('/ofertas/?sort_by=created-descending'), `${m}: la dirección vieja de Ofertas lleva a la categoría`, url(p));
      await foto(p, `087-ofertas-${m}`, { full: true });
      // del hero
      await ir(p, P.inicio, 4500);
      const h = await p.evaluate(() => [...document.querySelectorAll('.pnt-hero-v a, header a')].find((a) => /ofertas/i.test(a.textContent))?.getAttribute('href'));
      prueba('ofertas', /ofertas/.test(h || ''), `${m}: el botón "Ofertas" del hero lleva a Ofertas`, h);
      errores('ofertas', p, m); await p.close();
    }
  },


  // 78, 88: desborde lateral en 7 anchos (320 a 1920) para las páginas principales
  async anchos() {
    const anchos = [320, 360, 414, 768, 1024, 1280, 1920];
    for (const k of (process.env.PAGINAS || 'inicio,todos,ficha,busqueda,carrito,contacto,cuidados,login,ofertas,e404').split(',')) {
      const malos = [];
      for (const w of anchos) {
        const m = w < 768 ? 'celu' : 'compu';
        const p = await pagina(m); await p.setViewport({ ...VP[m], width: w, height: w < 768 ? 740 : 900 });
        await ir(p, P[k], k === 'ofertas' ? 6000 : 3000); await recorrer(p);
        const d = await desborde(p);
        const tapa = await p.evaluate(() => { const n = document.querySelector('.js-head-main'); if (!n) return 'sin navbar'; const b = n.getBoundingClientRect(); return b.left < -1 || b.right > innerWidth + 1 ? `navbar ${Math.round(b.left)}–${Math.round(b.right)}` : ''; });
        if (d > 0 || tapa) malos.push(`${w}px: ${d > 0 ? d + 'px de desborde' : ''} ${tapa}`.trim());
        if (d > 0) await foto(p, `088-desborde-${k}-${w}`);
        errores('anchos', p, `${k} ${w}px`);
        await p.close();
      }
      prueba('anchos', !malos.length, `${k}: sin desborde en ${anchos.join(', ')} px`, malos.join(' | '));
    }
  },

  // 91: al bajar, nada queda invisible (las entradas animadas terminan de aparecer) — compu y celu
  async animaciones() {
    for (const m of MODOS) for (const k of (process.env.PAGINAS || 'inicio,todos,ficha,contacto,cuidados,busqueda,ofertas').split(',')) {
      const p = await pagina(m); await ir(p, P[k], k === 'ofertas' ? 6000 : 3500);
      const alto = await p.evaluate(() => document.documentElement.scrollHeight);
      const quietos = new Set();
      for (let y = 0; y < alto; y += 600) {
        await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y);
        await espera(1300);
        const r = await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => {
          const b = e.getBoundingClientRect(); if (b.height < 40 || b.width < 40 || b.bottom < 60 || b.top > innerHeight - 60) return false;
          const s = getComputedStyle(e); if (+s.opacity > 0.05 || s.visibility === 'hidden' || s.display === 'none') return false;
          if (e.closest('.modal, .js-modal, #nav-search, #nav-hamburger, #nav-filters, .pnt-cp, .wa-globo, .fancybox__container, [aria-hidden="true"], .swiper-slide-duplicate, .pnt-a3, .pnt-or, .js-search-container')) return false;
          // si un contenedor con overflow escondido lo recorta (tarjetas de los costados de un carrusel), no se ve: no cuenta
          for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const sa = getComputedStyle(a); if (/hidden|clip/.test(sa.overflowX + sa.overflow)) { const ra = a.getBoundingClientRect(); if (b.right <= ra.left + 4 || b.left >= ra.right - 4 || b.bottom <= ra.top + 4 || b.top >= ra.bottom - 4) return false; } }
          if (e.parentElement && +getComputedStyle(e.parentElement).opacity <= 0.05) return false;   // se cuenta solo el de más afuera
          return true;
        }).map((e) => (e.className || e.tagName).toString().slice(0, 60)));
        r.forEach((x) => quietos.add(x));
      }
      prueba('animaciones', !quietos.size, `${m} ${k}: al bajar, todo termina de aparecer`, [...quietos].slice(0, 6).join(' | '));
      await p.close();
    }
  },

  // links de toda la tienda (inicio, listado, ficha): que ninguno interno dé error
  async enlaces() {
    const vistos = new Set(); const caidos = [];
    for (const k of ['inicio', 'todos', 'ficha', 'contacto', 'carrito']) {
      const p = await pagina('compu'); await ir(p, P[k], 3500);
      // internos de verdad: misma dirección (o el dominio de la tienda); se descartan "//cdn…", "whatsapp://", los de compartir, etc.
      const hs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => { try { const u = new URL(a.getAttribute('href'), location.href); if (!/^https?:$/.test(u.protocol)) return ''; if (u.host !== location.host && !/(^|\.)pantherajoyeria\.com\.ar$/.test(u.hostname)) return ''; return u.pathname + u.search; } catch (e) { return ''; } }).filter((h) => h && !/^\/(cart|comprar\/?\?|account\/logout)/.test(h)));
      for (const h of hs) { const r = h.split('#')[0]; if (!r || vistos.has(r)) continue; vistos.add(r); const s = await estado(r); if (s !== 200) caidos.push(`${s} ${r} (en ${k})`); }
      await p.close();
    }
    prueba('enlaces', !caidos.length, `${vistos.size} links internos distintos responden 200`, caidos.join(' | '));
  },
};

const grupos = Object.keys(G).filter((g) => !SOLO.length || SOLO.includes(g));
for (const g of grupos) {
  anota(`\n── ${g} ──`);
  try { await G[g](); } catch (e) { prueba(g, false, 'la prueba se cortó', e.message.slice(0, 200)); }
}
anota(`\n${ok} ✔ · ${mal} ✘`);
fs.appendFileSync(path.join(SALIDA, '_pruebas.txt'), `\n=== ${new Date().toISOString()} ${grupos.join(',')}\n` + log.join('\n') + '\n');
await browser.close();
