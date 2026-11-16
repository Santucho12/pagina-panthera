// Una captura (o varias) por cada ítem 46–115 de PENDIENTES.md, en la tienda local (localhost:5700), con Chrome real.
// node herramientas/revision/items-46-115.mjs <carpeta de salida> [números separados por coma, ej. 47,49,93]
// Solo lectura, salvo el carrito: los ítems 53/65/79 agregan UN producto al carrito de esta sesión de prueba y al final lo vacían.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2];
const SOLO = (process.argv[3] || '').split(',').filter(Boolean).map(Number);
fs.mkdirSync(SALIDA, { recursive: true });
const B = 'http://localhost:5700';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const UA_CELU = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const COMPU = { width: 1440, height: 900, deviceScaleFactor: 1 };
const CELU = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const P = {
  inicio: '/', todos: '/todos-los-productos/?sort_by=created-descending', pulseras: '/todos-los-productos/pulseras/?sort_by=created-descending',
  ficha: '/productos/pulsera-silver-flower-454/', charm: '/productos/jazmin-1940/', casiopea: '/productos/casiopea-corazon-3991-ier45/',
  inicial: '/productos/colgante-gold-con-inicial-en-circonios-grande-4034-1ia4s/', anillo: '/productos/anillo-flowers/',
  cuidados: '/cuidados/', envios: '/envios/', cambios: '/politica-de-cambios-garantias-devoluciones/', contacto: '/contacto/',
  arrep: '/contacto/?order_cancellation_without_id=true', busqueda: '/search/?q=mickey', vacia: '/search/?q=zzqqxx', carrito: '/comprar/',
  login: '/account/login/', registro: '/account/register/', reset: '/account/reset/', blog: '/blog/', e404: '/esta-pagina-no-existe/',
  ofertas: '/todos-los-productos/?ofertas&sort_by=created-descending', contrasena: '/account/login/?pnt-vista=contrasena',
};

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new',
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'],
});
const informe = [];
const nota = (n, t) => { informe.push(`${n}: ${t}`); console.log(`  [${n}] ${t}`); };

async function pagina(modo = 'compu', { ctx = browser, sinCookies = true } = {}) {
  const p = await ctx.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
  p.on('pageerror', (e) => console.log('    js:', String(e.message).slice(0, 120)));
  await p.setViewport(modo === 'celu' ? CELU : COMPU);
  await p.setUserAgent(modo === 'celu' ? UA_CELU : UA);
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  p._sinCookies = sinCookies;
  return p;
}
async function ir(p, ruta, esperaMs = 2500) {
  try { await p.goto(B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { /* sigue */ }
  await espera(esperaMs);
  if (p._sinCookies) await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
}
// baja de a poco para que entren las animaciones y las imágenes perezosas, y vuelve arriba
async function recorrer(p) {
  const alto = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 450) {
    await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }, y);
    await espera(160);
  }
  await espera(900);
  await arriba(p);
}
async function arriba(p) { await a(p, 0); }
async function a(p, y) {
  await p.evaluate((y) => { if (window.lenis) { window.lenis.start && window.lenis.start(); window.lenis.scrollTo(y, { immediate: true, force: true }); } window.scrollTo(0, y); }, y);
  await espera(700);
}
async function verEl(p, sel, bloque = 'center') {
  const ok = await p.evaluate((sel, bloque) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : null; if (!el) return false;
    const r = el.getBoundingClientRect(); const y = window.scrollY + r.top - (bloque === 'start' ? 90 : (innerHeight - Math.min(r.height, innerHeight)) / 2);
    if (window.lenis) window.lenis.scrollTo(Math.max(0, y), { immediate: true, force: true }); window.scrollTo(0, Math.max(0, y)); return true;
  }, sel, bloque);
  await espera(1200);
  return ok;
}
async function foto(p, nombre, { full = false } = {}) {
  const archivo = path.join(SALIDA, nombre + '.jpg');
  if (full) {
    await recorrer(p);
    await p.evaluate(() => { if (window.lenis) window.lenis.stop(); });
  }
  await p.screenshot({ path: archivo, type: 'jpeg', quality: 82, fullPage: full, captureBeyondViewport: full });
  console.log('  foto', nombre);
}
async function clic(p, sel) {
  return p.evaluate((sel) => { const el = [...document.querySelectorAll(sel)].find((e) => e.offsetWidth || e.offsetHeight); if (!el) return false; el.click(); return true; }, sel);
}
async function clicTexto(p, sel, re) {
  return p.evaluate((sel, src) => {
    const re = new RegExp(src, 'i');
    const el = [...document.querySelectorAll(sel)].find((e) => (e.offsetWidth || e.offsetHeight) && re.test(e.textContent || e.value || '')); if (!el) return false;
    el.scrollIntoView({ block: 'center' }); el.click(); return true;
  }, sel, re.source);
}
const desborde = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// ───────────────────────────── ítems ─────────────────────────────
const ITEMS = {
  async 46() {
    for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.inicio, 4000); await foto(p, `046-franja-navbar-${m}`); await p.close(); }
  },
  async 47() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.inicio, 3500);
      await clic(p, '[data-toggle="#nav-hamburger"]'); await espera(1200); await foto(p, `047-menu-${m}`);
      const sub = await clicTexto(p, '#nav-hamburger a, #nav-hamburger button', /todos los productos/);
      await espera(1100); await foto(p, `047-menu-submenu-${m}`); nota(47, `${m}: submenú ${sub ? 'abierto' : 'no encontrado'}`);
      await p.close();
    }
  },
  async 48() {
    const p = await pagina('compu'); await ir(p, P.inicio, 3500);
    await clic(p, '[data-toggle="#nav-hamburger"]'); await espera(1200);
    const txt = await p.evaluate(() => [...document.querySelectorAll('#nav-hamburger a')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean));
    nota(48, 'menú: ' + txt.join(' | '));
    const col1 = await p.evaluate(() => [...document.querySelectorAll('#nav-hamburger a')].some((a) => a.offsetWidth && /collares1/.test(a.href)));
    nota(48, 'link visible a /collares1/: ' + col1);
    await foto(p, '048-menu-items');
    await clicTexto(p, '#nav-hamburger a, #nav-hamburger button', /todos los productos/); await espera(1100);
    nota(48, 'submenú Todos: ' + await p.evaluate(() => [...document.querySelectorAll('#nav-hamburger a')].filter((e) => e.offsetWidth).map((e) => e.textContent.trim().replace(/\s+/g, ' ') + '→' + (e.getAttribute('href') || '').replace(/^https?:..[^/]+/, '')).join(' | ')));
    await foto(p, '048-submenu-todos-sin-duplicado'); await p.close();
  },
  async 49() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.inicio, 3500);
      const ok = await clic(p, m === 'compu' ? '.pnt-buscar, .js-search-button' : '.js-search-button, .pnt-buscar');
      await espera(1100); await foto(p, `049-buscador-${m}`);
      await p.type('#nav-search .search-input', 'mickey', { delay: 60 }); await espera(3000);
      await foto(p, `049-buscador-sugerencias-${m}`); nota(49, `${m}: abrió ${ok}`); await p.close();
    }
  },
  async 50() {
    for (const m of ['compu', 'celu']) {
      let p = await pagina(m); await ir(p, P.todos, 3500); await foto(p, `050-listado-${m}`);
      await foto(p, `050-listado-entera-${m}`, { full: true }); nota(50, `${m}: desborde ${await desborde(p)} px`);
      await p.close(); p = await pagina(m); await ir(p, P.todos, 3500);
      const ok = await clic(p, '.pnt-orden-btn'); await espera(800); await foto(p, `050-ordenar-abierto-${m}`); nota(50, `ordenar ${ok}`);
      await p.close();
    }
  },
  async 51() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.ficha, 4000); await foto(p, `051-ficha-${m}`);
      await foto(p, `051-ficha-entera-${m}`, { full: true }); nota(51, `${m}: desborde ${await desborde(p)} px`); await p.close();
    }
  },
  async 52() {
    const p = await pagina('compu'); await ir(p, P.ficha, 4000);
    const ok = await clicTexto(p, '.pnt-acc button, .pnt-acc summary, .pnt-acc [role=button], .pnt-acc-cab, .pnt-acc *', /descripci/);
    await espera(1200); await foto(p, '052-descripcion-desplegada'); nota(52, 'desplegable ' + ok);
    await ir(p, P.inicial, 4000);
    await clicTexto(p, '.pnt-acc button, .pnt-acc summary, .pnt-acc [role=button], .pnt-acc-cab, .pnt-acc *', /descripci/); await espera(1200);
    await foto(p, '052-descripcion-otro-producto'); await p.close();
  },
  async 53() {
    for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.carrito); await foto(p, `053-carrito-vacio-${m}`, { full: true }); await p.close(); }
    // con producto: ver ítem 79 (se agrega un charm y se vacía al final)
  },
  async 54() { for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.busqueda, 3500); await foto(p, `054-busqueda-${m}`, { full: true }); await p.close(); } },
  async 55() { for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.vacia); await foto(p, `055-busqueda-vacia-${m}`, { full: true }); await p.close(); } },
  async 56() { for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.contacto, 3500); await foto(p, `056-contacto-${m}`, { full: true }); await p.close(); } },
  async 57() {
    for (const m of ['compu', 'celu']) for (const k of ['envios', 'cuidados', 'cambios']) {
      const p = await pagina(m); await ir(p, P[k], 3000); await foto(p, `057-texto-${k}-${m}`, { full: true }); await p.close();
    }
  },
  async 58() { for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.e404, 3000); await foto(p, `058-404-${m}`, { full: true }); await p.close(); } },
  async 59() { for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.login); await foto(p, `059-login-${m}`, { full: true }); await p.close(); } },
  async 60() {
    for (const m of ['compu', 'celu']) for (const k of ['registro', 'reset']) { const p = await pagina(m); await ir(p, P[k]); await foto(p, `060-${k}-${m}`, { full: true }); await p.close(); }
  },
  async 61() {
    const p = await pagina('compu'); await ir(p, '/account/orders/');
    nota(61, 'sin sesión /account/orders/ lleva a: ' + p.url().replace(B, '')); await foto(p, '061-cuenta-sin-sesion'); await p.close();
  },
  async 62() { for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.contrasena, 3000); await foto(p, `062-contrasena-maqueta-${m}`); await p.close(); } },
  async 63() { const p = await pagina('compu'); await ir(p, P.blog); await foto(p, '063-blog-404'); await p.close(); },
  async 64() {
    const p = await pagina('compu'); await ir(p, P.pulseras, 3500);
    await verEl(p, '.js-item-product'); await p.hover('.js-item-product'); await espera(800); await foto(p, '064-tarjeta-hover');
    await Promise.all([p.waitForNavigation({ timeout: 15000 }).catch(() => {}), p.evaluate(() => { const c = document.querySelector('.js-item-product'); const bs = [...c.querySelectorAll('a,button')].filter((e) => e.offsetWidth && e.getBoundingClientRect().width < 60); bs[bs.length - 1].click(); })]);
    await espera(3000); const destino = p.url().replace(B, ''); await foto(p, '064-bolsita-lleva-a-la-ficha');
    nota(64, 'bolsita de pulsera con talles → ' + destino); await p.close();
  },
  async 66() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.todos, 3500); const ok = await clic(p, '[data-toggle="#nav-filters"]');
      await espera(1300); await foto(p, `066-filtros-${m}`); nota(66, `${m}: abrió ${ok}`); await p.close();
    }
  },
  async 67() {
    const p = await pagina('compu'); await ir(p, P.todos, 3500);
    const hay = await p.evaluate(() => { const e = document.querySelector('.pnt-mv-desc, .js-offer-label, .label-accent'); if (!e) return false; e.closest('.js-item-product')?.scrollIntoView({ block: 'center' }); return e.textContent.trim(); });
    await espera(1200); await foto(p, '067-etiquetas'); nota(67, 'etiqueta encontrada: ' + hay); await p.close();
  },
  async 68() {
    const ctx = await browser.createBrowserContext();
    for (const m of ['compu', 'celu']) { const p = await pagina(m, { ctx, sinCookies: false }); await ir(p, P.inicio, 4500); await foto(p, `068-cookies-${m}`); await p.close(); }
    await ctx.close();
  },
  async 69() {
    const p = await pagina('compu'); await ir(p, P.login, 3000);
    await p.evaluate(() => { const f = document.querySelector('form [type=password]')?.closest('form'); const e = f?.querySelector('[type=email], [name=email]'); const c = f?.querySelector('[type=password]'); if (e) e.value = 'prueba-no-existe@example.com'; if (c) c.value = 'clave-incorrecta-123'; });
    await p.evaluate(() => { const f = document.querySelector('form [type=password]').closest('form'); (f.querySelector('[type=submit], .btn-primary') || f).click(); }); await espera(6000);
    nota(69, 'tras login erróneo: ' + p.url().replace(B, '') + ' · aviso: ' + await p.evaluate(() => ([...document.querySelectorAll('.alert, .notification, .form-group .help-block, .alert-danger')].find((e) => e.offsetWidth && !e.closest('.js-notification-cookie-banner'))?.textContent || 'ninguno').trim().slice(0, 100)));
    await foto(p, '069-aviso-error-login'); await p.close();
  },
  async 70() {
    const p = await pagina('compu'); await ir(p, P.todos, 3500); await recorrer(p);
    const ok = await verEl(p, '.pnt-vermas, .js-load-more, [class*="ver-mas"], .pagination', 'center');
    await foto(p, '070-ver-mas-productos'); nota(70, 'botón ' + ok);
    const antes = await p.evaluate(() => document.querySelectorAll('.js-item-product').length);
    await p.evaluate(() => document.querySelector('.pnt-ver-mas-btn')?.click()); await espera(7000);
    const desp = await p.evaluate(() => document.querySelectorAll('.js-item-product').length);
    nota(70, `tarjetas antes ${antes} → después ${desp}`); await foto(p, '070-despues-de-ver-mas'); await p.close();
  },
  async 71() { const p = await pagina('compu'); await ir(p, P.pulseras, 3500); await foto(p, '071-migas-listado'); nota(71, 'migas: ' + await p.evaluate(() => document.querySelector('.breadcrumbs')?.textContent.trim().replace(/\s+/g, ' ') || 'no hay')); await p.close(); },
  async 72() {
    for (const [m, vp] of [['compu', { width: 1440, height: 1300 }], ['celu', { ...CELU, height: 1100 }]]) for (const k of ['carrito', 'vacia']) {
      const p = await pagina(m); await p.setViewport(vp); await ir(p, P[k]);
      await recorrer(p); await p.evaluate(() => { if (window.lenis) window.lenis.scrollTo(99999, { immediate: true, force: true }); window.scrollTo(0, 99999); }); await espera(900);
      const r = await p.evaluate(() => { const f = document.querySelector('footer, .js-footer'); const b = f.getBoundingClientRect().bottom; return { pie: Math.round(b), alto: innerHeight, doc: document.documentElement.scrollHeight }; });
      nota(72, `${m} ${k}: fin del pie ${r.pie}px / ventana ${r.alto}px → franja ${r.alto - r.pie}px`);
      await foto(p, `072-pagina-corta-${k}-${m}`); await p.close();
    }
  },
  async 73() { nota(73, 'popup de newsletter: no activado en la tienda (sin captura propia; ver 046)'); },
  async 74() {
    const p = await pagina('compu'); await ir(p, P.inicio, 3000); await a(p, 1400); await espera(12000);
    await foto(p, '074-cartel-whatsapp'); await p.close();
    for (const m of ['celu']) { const q = await pagina(m); await ir(q, P.inicio, 3000); await a(q, 1200); await foto(q, `074-boton-whatsapp-${m}`); await q.close(); }
  },
  async 75() { nota(75, 'checkout: es .tpl, no se ve hasta publicar (sin captura)'); },
  async 76() { nota(76, 'direcciones de categorías: guía en herramientas/PASOS-DEL-ADMIN.md (sin captura)'); },
  async 77() {
    const p = await pagina('compu'); await ir(p, '/todos-los-productos/anillos/?sort_by=created-descending&min_price=999999&max_price=9999999', 3500);
    await foto(p, '077-categoria-sin-resultados', { full: true });
    await ir(p, P.inicial, 4000); await foto(p, '077-producto-muchas-variantes'); await p.close();
  },
  async 78() {
    for (const w of [320, 768, 1024, 1920]) {
      const m = w < 700 ? 'celu' : 'compu'; const p = await pagina(m); await p.setViewport({ ...(m === 'celu' ? CELU : COMPU), width: w, height: w < 700 ? 720 : 900 });
      await ir(p, P.todos, 3500); nota(78, `${w}px listado desborde ${await desborde(p)}`); await foto(p, `078-listado-${w}px`); await p.close();
    }
  },
  async 79() {
    // agrega 1 charm al carrito de esta sesión, mira el carrito lateral y la página del carrito, y lo vacía
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.charm, 4000);
      const ok = await clic(p, '.js-addtocart:not(.js-addtocart-placeholder)'); await espera(5500);
      nota(79, `${m}: agregado ${ok}`); await foto(p, `079-065-carrito-lateral-${m}`);
      await ir(p, P.carrito, 3500); await foto(p, `053-carrito-con-producto-${m}`, { full: true });
      if (m === 'compu') {
        // 75: cómo se ve HOY el checkout (todavía sin el .tpl publicado). Solo se mira, no se completa nada.
        const ok = await clicTexto(p, 'a, button, input[type=submit]', /iniciar compra/);
        await espera(9000); nota(75, 'checkout actual: ' + (ok ? p.url().replace(/[0-9a-f]{20,}/g, '…') : 'no se encontró el botón'));
        await p.screenshot({ path: path.join(SALIDA, '075-checkout-actual-sin-publicar.jpg'), type: 'jpeg', quality: 80 }).catch(() => {});
        await ir(p, P.carrito, 3000);
      }
      await vaciar(p); await p.close();
    }
  },
  async 80() {
    const p = await pagina('compu');
    p.goto(B + P.pulseras, { timeout: 60000 }).catch(() => {});
    for (const t of [700, 1400, 2500]) { await espera(t === 700 ? 700 : t - (t === 1400 ? 700 : 1400)); await p.screenshot({ path: path.join(SALIDA, `080-carga-${t}ms.jpg`), type: 'jpeg', quality: 75 }).catch(() => {}); }
    await espera(2500); await p.close();
  },
  async 81() {
    const p = await pagina('compu'); await ir(p, P.todos, 3500); await clic(p, '.pnt-orden-btn'); await espera(600);
    await clicTexto(p, '.pnt-orden-op', /menor precio/); await espera(5000);
    nota(81, 'tras elegir "Menor precio": ' + p.url().replace(B, '')); await foto(p, '081-orden-menor-precio'); await p.close();
  },
  async 82() { const p = await pagina('compu'); await ir(p, '/todos-los-productos/aros/', 4500); nota(82, 'entrar sin orden → ' + p.url().replace(B, '')); await foto(p, '082-orden-novedades-por-defecto'); await p.close(); },
  async 83() {
    const p = await pagina('compu'); p.goto(B + P.inicio, { timeout: 60000 }).catch(() => {});
    await espera(1200); await p.screenshot({ path: path.join(SALIDA, '083-navbar-al-cargar-1200ms.jpg'), type: 'jpeg', quality: 75 }).catch(() => {});
    await espera(2500); await p.screenshot({ path: path.join(SALIDA, '083-navbar-cargada.jpg'), type: 'jpeg', quality: 75 }); await p.close();
  },
  async 84() {
    const p = await pagina('compu'); await ir(p, P.cuidados, 3000);
    await clicTexto(p, '.pnt-acc-pag button, [class*="acord"] button, .pnt-cu-btn', /./); await espera(1200);
    await foto(p, '084-cuidados-acordeon'); await p.close();
  },
  async 85() { nota(85, 'vista previa con muchas pestañas: interno del preview (sin captura)'); },
  async 86() { nota(86, 'ver 062-contrasena-maqueta'); },
  async 87() {
    for (const m of ['compu', 'celu']) { const p = await pagina(m); await ir(p, P.ofertas, 8000); await foto(p, `087-ofertas-franja-sale-${m}`); await foto(p, `087-ofertas-entera-${m}`, { full: true }); nota(87, m + ': tarjetas ' + await p.evaluate(() => [...document.querySelectorAll('.js-item-product')].filter((e) => e.offsetWidth).length)); await p.close(); }
    const p = await pagina('compu'); await ir(p, '/todos-los-productos/charms-panthera/?sort_by=created-descending', 3500); await foto(p, '087-categoria-sin-portada'); await p.close();
  },
  async 88() {
    for (const k of ['inicio', 'ficha', 'contacto', 'busqueda', 'carrito']) {
      const p = await pagina('celu'); await p.setViewport({ ...CELU, width: 320, height: 640 }); await ir(p, P[k], 3500);
      nota(88, `320px ${k}: desborde ${await desborde(p)} px`); await foto(p, `088-320px-${k}`); await p.close();
    }
  },
  async 89() { const p = await pagina('compu'); await p.setViewport({ width: 1366, height: 600 }); await ir(p, P.inicio, 4500); await foto(p, '089-portada-ventana-baja-1366x600'); await p.close(); },
  async 90() { nota(90, 'ver 051'); },
  async 91() {
    const p = await pagina('compu'); await ir(p, P.todos, 3500);
    await p.evaluate(() => { if (window.lenis) window.lenis.scrollTo(1600, { duration: 1.2 }); else window.scrollTo({ top: 1600, behavior: 'smooth' }); });
    await espera(450); await p.screenshot({ path: path.join(SALIDA, '091-entrada-al-bajar-mitad.jpg'), type: 'jpeg', quality: 80 });
    await espera(2500); await foto(p, '091-entrada-al-bajar-final');
    const esc = await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => { const s = getComputedStyle(e); return s.opacity === '0' && e.offsetHeight > 40 && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().bottom > 0; }).length);
    nota(91, 'piezas a la vista con opacidad 0 al final: ' + esc); await p.close();
  },
  async 92() {
    for (const [k, m] of [['arrep', 'compu'], ['carrito', 'celu'], ['todos', 'celu']]) { const p = await pagina(m); await ir(p, P[k], 3500); await foto(p, `092-titulo-${k}-${m}`); await p.close(); }
  },
  async 93() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.ficha, 4000);
      await p.evaluate(() => { const t = [...document.querySelectorAll('.js-accordion-toggle, .pnt-acc button, .pnt-acc summary, [data-toggle], a, button, div')].filter((e) => (e.offsetWidth || e.offsetHeight) && /^\s*medios de env[ií]o\s*$/i.test(e.textContent)); const el = t[t.length - 1]; if (el) { el.scrollIntoView({ block: 'center' }); el.click(); } });
      await espera(1200);
      const cp = await p.evaluateHandle(() => [...document.querySelectorAll('input[name="zipcode"], .js-shipping-input')].find((e) => e.offsetWidth)).then((h) => h.asElement());
      if (cp) { await cp.evaluate((e) => { e.scrollIntoView({ block: 'center' }); e.value = ''; }); await cp.click(); await cp.type('8000'); await p.keyboard.press('Enter'); await espera(6000); }
      await p.evaluate(() => { const r = document.querySelector('.js-shipping-calculator-response, .js-product-shipping-options, [class*="shipping-calculator"]'); r?.scrollIntoView({ block: 'center' }); });
      await espera(1200); await foto(p, `093-envio-calculado-${m}`); await foto(p, `093-envio-calculado-entera-${m}`, { full: true });
      const t = await p.evaluate(() => (document.querySelector('.js-shipping-calculator-response')?.innerText || '').replace(/\s+/g, ' ').slice(0, 600));
      nota(93, `${m}: ${t}`); await p.close();
    }
  },
  async 94() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.ficha, 4000);
      await clicTexto(p, '.pnt-acc *, .js-accordion-toggle, a, button', /medios de pago/); await espera(1300); await foto(p, `094-medios-pago-${m}`);
      const ok = await clicTexto(p, 'a, button', /ver todos los medios de pago/); await espera(1800); await foto(p, `094-ventana-pagos-${m}`);
      await clicTexto(p, '.modal.modal-show a, .modal.modal-show button, .modal.show a, .modal a.nav-link, .js-tab, [data-tab]', /mercado/); await espera(1300);
      await foto(p, `094-ventana-pagos-mercadopago-${m}`); nota(94, `${m}: ventana ${ok}`); await p.close();
    }
  },
  async 95() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.inicial, 4000);
      await clic(p, '.js-product-slide-link, .js-product-slide img, [data-fancybox]'); await espera(2200); await foto(p, `095-foto-ampliada-${m}`);
      await p.keyboard.press('ArrowRight'); await espera(1300); await foto(p, `095-foto-ampliada-siguiente-${m}`); await p.close();
    }
  },
  async 99() {
    const p = await pagina('compu'); await ir(p, P.casiopea, 4000);
    nota(99, 'título de la pestaña: «' + await p.title() + '» · h1: «' + await p.evaluate(() => document.querySelector('h1')?.textContent.trim()) + '»');
    await foto(p, '099-100-nombre-y-color');
    const ok = await p.evaluate(() => { const bs = [...document.querySelectorAll('.js-insta-variant, [data-option], .btn-variant')].filter((b) => b.offsetWidth); const b = bs[1] || bs[0]; if (!b) return 'sin variantes'; b.click(); return b.textContent.trim() || b.getAttribute('data-option') || 'ok'; });
    await espera(1300); nota(100, 'clic en variante: ' + ok + ' · rótulo: ' + await p.evaluate(() => (document.querySelector('.pnt-color-nombre, .form-label, label')?.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 80)));
    await foto(p, '100-color-elegido'); await p.close();
  },
  async 101() {
    const p = await pagina('compu'); await ir(p, P.ficha, 4000); await espera(14000); await foto(p, '101-ficha-whatsapp-no-tapa');
    nota(101, 'cartel WA visible: ' + await p.evaluate(() => { const c = document.querySelector('.pnt-wa-globo, .pnt-wa-cartel, [class*="pnt-wa"][class*="globo"]'); return c ? getComputedStyle(c).opacity + '/' + getComputedStyle(c).visibility : 'no existe'; }));
    await p.close();
  },
  async 102() {
    const p = await pagina('compu'); await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }, { name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await ir(p, P.contacto, 6000); await verEl(p, '.cf-turnstile, [class*="turnstile"], iframe[src*="challenges"]'); await espera(3000);
    await foto(p, '102-cloudflare-modo-oscuro-del-sistema'); await p.close();
  },
  async 104() {
    const p = await pagina('compu'); await ir(p, P.ficha, 4000);
    nota(104, 'comentarios FB: ' + await p.evaluate(() => { const f = document.querySelector('.fb-comments, [class*="fb-comments"]'); return f ? `existe, alto ${f.offsetHeight}px` : 'no está'; }));
    await verEl(p, '.fb-comments, [class*="fb-comments"]'); await foto(p, '104-ficha-sin-comentarios-facebook'); await p.close();
  },
  async 106() {
    for (const m of ['compu', 'celu']) {
      const p = await pagina(m); await ir(p, P.contacto, 3000); await recorrer(p);
      await p.evaluate(() => { if (window.lenis) window.lenis.scrollTo(99999, { immediate: true, force: true }); window.scrollTo(0, 99999); }); await espera(1500);
      await foto(p, `106-112-pie-logos-${m}`); await p.close();
    }
  },
  async 108() {
    const p = await pagina('compu'); await p.setViewport({ width: 1300, height: 760 });
    const html = `<body style="margin:0;font:15px system-ui;background:#fff;padding:30px">
      <h3>Favicon / íconos (108) y compartir (109)</h3>
      <div style="display:flex;gap:30px;align-items:flex-end">
        ${['favicon-32.png', 'favicon-192.png', 'apple-touch-icon.png'].map((f) => `<figure><img src="${B}/__tema/panthera/iconos/${f}" style="width:${f.includes('32') ? 32 : 120}px;border:1px solid #eee"><figcaption>${f}</figcaption></figure>`).join('')}
        <figure><img src="${B}/__tema/panthera/iconos/compartir-1200x630.jpg" style="width:600px;border:1px solid #eee"><figcaption>compartir-1200x630.jpg</figcaption></figure>
      </div><div id="tags"></div></body>`;
    await p.setContent(html); await espera(1500);
    const lista = fs.existsSync('tienda/static/panthera/iconos') ? fs.readdirSync('tienda/static/panthera/iconos').join(', ') : '?';
    nota(108, 'archivos: ' + lista);
    await p.screenshot({ path: path.join(SALIDA, '108-109-iconos-y-compartir.jpg'), type: 'jpeg', quality: 85 }); await p.close();
    const q = await pagina('compu'); await ir(q, P.inicio, 2500);
    const meta = await q.evaluate(() => ({
      titulo: document.title, desc: document.querySelector('meta[name=description]')?.content,
      og: document.querySelector('meta[property="og:image"]')?.content, icon: [...document.querySelectorAll('link[rel*=icon]')].map((l) => l.href.replace(location.origin, '')), theme: document.querySelector('meta[name=theme-color]')?.content,
    }));
    nota(110, JSON.stringify(meta)); await q.close();
  },
  async 111() {
    const p = await pagina('compu'); await ir(p, P.ficha, 4000);
    await p.evaluate(() => { const h = document.querySelector('h1'); const r = document.createRange(); r.selectNodeContents(h.parentElement); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
    await espera(400); await foto(p, '111-texto-seleccionado');
    nota(111, 'color-scheme: ' + await p.evaluate(() => getComputedStyle(document.documentElement).colorScheme)); await p.close();
  },
  async 113() {
    const p = await pagina('compu'); await ir(p, P.ficha, 4000);
    nota(113, 'franja: ' + await p.evaluate(() => [...document.querySelectorAll('body *')].map((e) => e.childElementCount === 0 ? e.textContent : '').filter((t) => /env[ií]o gratis|sin cargo/i.test(t)).slice(0, 4).join(' | ')));
    await p.close();
  },
};

// Ítems que no son una pieza de la página (admin, decisiones): una "ficha" con lo que se verificó, como imagen
async function documento(nombre, titulo, lineas) {
  const p = await pagina('compu'); await p.setViewport({ width: 1100, height: 700 });
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  await p.setContent(`<body style="margin:0;padding:36px;font:16px/1.5 system-ui;background:#fff;color:#000">
    <div style="border-left:6px solid #F4ACC4;padding:4px 0 4px 18px;margin-bottom:18px"><b style="font-size:22px">${esc(titulo)}</b></div>
    ${lineas.map((l) => `<p style="margin:0 0 10px;white-space:pre-wrap">${esc(l)}</p>`).join('')}</body>`);
  await p.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 85, fullPage: true }); await p.close();
  console.log('  foto', nombre);
}
const copia = (de, a) => { const o = path.join(SALIDA, de + '.jpg'); if (fs.existsSync(o)) fs.copyFileSync(o, path.join(SALIDA, a + '.jpg')); };
const leer = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } };
const tramo = (txt, re, n = 14) => { const ls = txt.split('\n'); const i = ls.findIndex((l) => re.test(l)); return i < 0 ? ['(no encontrado)'] : ls.slice(i, i + n); };
Object.assign(ITEMS, {
  async 65() { copia('079-065-carrito-lateral-compu', '065-aviso-al-agregar-carrito-lateral'); nota(65, 'ver 079-065 (se genera en el ítem 79; correr 79 antes)'); },
  async 73() {
    const p = await pagina('compu'); await ir(p, P.inicio, 9000);
    nota(73, 'popup newsletter visible: ' + await p.evaluate(() => { const m = document.querySelector('#modal-newsletter, .js-modal-newsletter, [id*=newsletter]'); return m ? (m.offsetWidth ? 'sí' : 'existe oculto') : 'no existe'; }));
    await foto(p, '073-sin-popup-newsletter-a-los-9s'); await p.close();
  },
  async 75() {
    const scss = leer('tienda/static/checkout.scss.tpl');
    await documento('075-checkout-tpl', '75 · Checkout (.tpl: se ve recién al publicar)', ['Colores en static/checkout.scss.tpl:', ...[...new Set(scss.match(/#[0-9a-fA-F]{6}\b/g) || [])].map((c) => '  ' + c), '', ...tramo(scss, /./, 30)]);
  },
  async 76() { await documento('076-direcciones-categorias', '76 · Direcciones de categorías (PASOS-DEL-ADMIN.md)', tramo(leer('herramientas/PASOS-DEL-ADMIN.md'), /direcci/i, 30)); },
  async 85() {
    const ps = []; for (let i = 0; i < 8; i++) { const p = await pagina('compu'); ps.push(p); p.goto(B + P.contacto, { timeout: 60000 }).catch(() => {}); }
    await espera(9000); const ult = ps[7];
    nota(85, '8 pestañas abiertas a la vez; la 8.ª cargó: ' + await ult.evaluate(() => document.readyState + ' · ' + document.title).catch(() => 'no'));
    await ult.screenshot({ path: path.join(SALIDA, '085-octava-pestana-carga.jpg'), type: 'jpeg', quality: 75 }); for (const p of ps) await p.close();
  },
  async 86() { copia('062-contrasena-maqueta-compu', '086-contrasena-maqueta'); nota(86, 'misma maqueta que 062'); },
  async 90() { copia('051-ficha-compu', '090-ficha-hecha'); nota(90, 'misma que 051'); },
  async 96() { nota(96, 'se genera con prueba-avisos.mjs (ver 096-*/097-*)'); },
  async 97() { nota(97, 'se genera con prueba-avisos.mjs'); },
  async 98() {
    // no hay promociones armadas: se le pone a una tarjeta la etiqueta que pondría Tiendanube y se rearma la tarjeta
    const p = await pagina('compu'); await ir(p, P.todos, 3500);
    const r = await p.evaluate(() => { const f = document.querySelector('.pnt-mv-promo'); return f ? 'ya hay una: ' + f.textContent : 'no hay promociones armadas en la tienda'; });
    nota(98, r);
    // la píldora se pone igual que mvTarjeta (marca.js): al lado del "-20%", dentro de la foto
    await p.evaluate(() => { const off = document.querySelector('.js-item-product .pnt-mv-off'); if (!off) return; const s = document.createElement('span'); s.className = 'pnt-mv-pildora pnt-mv-promo'; s.textContent = '2x1'; off.parentElement.appendChild(s); off.closest('.js-item-product').scrollIntoView({ block: 'center' }); });
    await espera(1000); await foto(p, '098-etiqueta-promo-simulada'); await p.close();
  },
  async 103() { await documento('103-opciones-del-admin', '103 · Opciones del admin sin diseño (visto, ok)', tramo(leer('PENDIENTES.md'), /^103\./, 8)); },
  async 105() { await documento('105-guia-de-talles', '105 · Guía de talles: decidido que no hace falta', tramo(leer('PENDIENTES.md'), /^105\./, 4)); },
  async 107() { copia('106-112-pie-logos-compu', '107-pie-sin-sellos'); nota(107, 'sin sellos cargados; ver pie'); },
  async 109() { copia('108-109-iconos-y-compartir', '109-imagen-compartir'); },
  async 110() {
    const q = await pagina('compu'); await ir(q, P.inicio, 2500);
    const m = await q.evaluate(() => [document.title, document.querySelector('meta[name=description]')?.content, document.querySelector('meta[property="og:title"]')?.content, document.querySelector('meta[property="og:description"]')?.content]);
    await q.close();
    await documento('110-texto-google', '110 · Texto de Google y links compartidos (→ Panthera, SEO del admin)', ['title: ' + m[0], 'description: ' + m[1], 'og:title: ' + m[2], 'og:description: ' + m[3], '', ...tramo(leer('PARA-PANTHERA.md'), /SEO|Google/i, 14)]);
  },
  async 112() { copia('106-112-pie-logos-compu', '112-pie-creado-con-tiendanube'); },
  async 114() { nota(114, 'ver el texto del punto de retiro en 093 (envío calculado)'); copia('093-envio-calculado-compu', '114-115-punto-de-retiro-y-textos-envio'); },
  async 115() { copia('093-envio-calculado-compu', '115-textos-envio-sin-tildes'); },
});
const _113 = ITEMS[113];
ITEMS[113] = async () => { await _113(); copia('093-envio-calculado-compu', '113-envio-gratis-90000-vs-150000'); };

async function vaciar(p) {
  const r = await p.evaluate(async () => {
    const ids = [...new Set([...document.querySelectorAll('[data-item-id]')].map((e) => e.getAttribute('data-item-id')).filter(Boolean))];
    for (const id of ids) {
      const fd = new URLSearchParams(); fd.set(`quantity[${id}]`, '0');
      await fetch('/cart/update/', { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    }
    return ids;
  });
  await ir(p, P.carrito, 2000);
  const queda = await p.evaluate(() => document.querySelectorAll('[data-item-id]').length);
  nota('carrito', `vaciado (ítems ${r.join(',') || 'ninguno'}) → quedan ${queda}`);
}

const nums = Object.keys(ITEMS).map(Number).filter((n) => !SOLO.length || SOLO.includes(n)).sort((x, y) => x - y);
for (const n of nums) {
  console.log('ítem', n);
  try { await ITEMS[n](); } catch (e) { nota(n, 'ERROR ' + e.message.slice(0, 200)); }
}
fs.appendFileSync(path.join(SALIDA, '_informe.txt'), `\n=== ${new Date().toISOString()} ${SOLO.join(',')}\n` + informe.join('\n') + '\n');
await browser.close();
