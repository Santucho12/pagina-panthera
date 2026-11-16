// Revisión "responsive" a fondo: cada página en muchos anchos (celular, tablet, compu), con detectores automáticos de
// problemas de diseño y fotos de la página entera para mirar a ojo (las hojas las arma hojas.py).
// node herramientas/revision/responsive.mjs <carpeta> [páginas separadas por coma] [anchos separados por coma]
//   FOTOS=375,1366  → anchos con foto de la página entera (por defecto 375, 768, 1024, 1366, 1920)
// Detecta: desborde lateral, piezas que se salen de la pantalla, textos cortados o encimados, botones tapados, toques chicos
// (celu/tablet), letra < 10 px, campos con letra < 16 px (el iPhone hace zoom al tocarlos), imágenes deformadas o borrosas,
// botones con el texto en 2 renglones, líneas de texto muy largas (compu), barras fijas que ocupan mucho, errores de JS.
// Solo lee: no toca el carrito ni envía formularios.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2];
if (!SALIDA) { console.log('uso: node responsive.mjs <carpeta> [páginas] [anchos]'); process.exit(1); }
fs.mkdirSync(SALIDA, { recursive: true });
const B = 'http://localhost:5700';
const UA = {
  compu: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  celu: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  tablet: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};
const P = {
  inicio: '/', todos: '/todos-los-productos/?sort_by=created-descending', pulseras: '/todos-los-productos/pulseras/?sort_by=created-descending',
  charms: '/todos-los-productos/charms-panthera/?sort_by=created-descending', aros: '/todos-los-productos/aros/?sort_by=created-descending',
  disney: '/todos-los-productos/disney-lovers/?sort_by=created-descending', anillos: '/todos-los-productos/anillos/?sort_by=created-descending',
  ofertas: '/todos-los-productos/?ofertas&sort_by=created-descending',
  ficha: '/productos/pulsera-silver-flower-454/', charm: '/productos/family-forever-cristal-3293-gjvco/', casiopea: '/productos/casiopea-corazon-3991-ier45/',
  inicial: '/productos/colgante-gold-con-inicial-en-circonios-grande-4034-1ia4s/', anillo: '/productos/anillo-flowers/',
  busqueda: '/search/?q=mickey', vacia: '/search/?q=zzqqxx', carrito: '/comprar/',
  contacto: '/contacto/', arrep: '/contacto/?order_cancellation_without_id=true',
  cuidados: '/cuidados/', envios: '/envios/', cambios: '/politica-de-cambios-garantias-devoluciones/',
  login: '/account/login/', registro: '/account/register/', reset: '/account/reset/', e404: '/esta-pagina-no-existe/',
};
const PAGS = (process.argv[3] || 'inicio,todos,ofertas,ficha,charm,busqueda,vacia,carrito,contacto,cuidados,login,registro,e404').split(',').filter(Boolean);
// un ancho solo ("375") usa el alto de un equipo real (ALTO); "844x390" fija también el alto (celular acostado)
const ANCHOS = (process.argv[4] || '320,375,414,600,768,1024,1180,1366,1536,1920,844x390').split(',').map((t) => { const [w, h] = t.split('x').map(Number); return { w, h: h || 0, txt: t }; });
const FOTOS = new Set((process.env.FOTOS || '375,768,1024,1366,1920,844x390').split(',').map((t) => (/x/.test(t) ? t : Number(t))));
const ALTO = { 320: 568, 360: 740, 375: 667, 390: 844, 414: 896, 600: 960, 768: 1024, 820: 1180, 1024: 768, 1180: 820, 1280: 720, 1366: 657, 1440: 900, 1536: 730, 1920: 960 };
const modoDe = (w) => (w < 700 ? 'celu' : w <= 1024 ? 'tablet' : 'compu');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────── detector (corre dentro de la página) ───────────────────────────
async function DETECTOR(cfg) {
  const W = document.documentElement.clientWidth, H = innerHeight;
  const padre = (e) => e.parentElement || (e.parentNode && e.parentNode.host) || null;
  const corto = (s, n = 42) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, n);
  const nom = (e) => {
    if (!e || !e.tagName) return '?';
    const c = (typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
    return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (c ? '.' + c : '')).slice(0, 72);
  };
  const txt = (e) => corto(e.innerText || e.textContent || e.value || (e.getAttribute && (e.getAttribute('aria-label') || e.getAttribute('title') || e.getAttribute('alt') || e.getAttribute('placeholder'))) || '');
  const est = new Map(); const cs = (e) => { let s = est.get(e); if (!s) { s = getComputedStyle(e); est.set(e, s); } return s; };
  const vcache = new Map();
  const cadena = (e) => {
    if (!e || e === document.documentElement || e.nodeType !== 1) return true;
    if (vcache.has(e)) return vcache.get(e);
    const s = cs(e); const v = s.display !== 'none' && +s.opacity > 0.05 && s.contentVisibility !== 'hidden' && cadena(padre(e));
    vcache.set(e, v); return v;
  };
  const visto = (e) => cs(e).visibility === 'visible' && cadena(e);
  const fcache = new Map();
  const fija = (e) => {
    if (!e || e === document.documentElement || e === document.body || e.nodeType !== 1) return null;
    if (fcache.has(e)) return fcache.get(e);
    const p = cs(e).position; const r = p === 'fixed' || p === 'sticky' ? e : fija(padre(e));
    fcache.set(e, r); return r;
  };
  const rcache = new Map();
  const recortes = (e) => {
    if (!e || e === document.documentElement || e === document.body || e.nodeType !== 1) return [];
    if (rcache.has(e)) return rcache.get(e);
    const s = cs(e);
    const arriba = s.position === 'fixed' ? [] : recortes(padre(e));
    const t = (o) => (/hidden|clip/.test(o) ? 'c' : /auto|scroll/.test(o) ? 's' : '');
    const x = t(s.overflowX), y = t(s.overflowY);
    const r = x || y ? [{ e, x, y }, ...arriba] : arriba;
    rcache.set(e, r); return r;
  };
  const caja = new Map(); const rect = (e) => { let b = caja.get(e); if (!b) { b = e.getBoundingClientRect(); caja.set(e, b); } return b; };
  // 'fuera' si un ancestro lo esconde entero (carrusel, panel cerrado), {por, cx, cy} si lo corta en parte, null si se ve entero
  // (lo que asoma menos de un cuarto cuenta como escondido: renglones de más de un texto limitado, tarjetas de un carrusel)
  const enTira = (e) => { for (let a = e; a; a = padre(a)) { if (a.nodeType === 1 && a.matches && a.matches('.swiper-slide, [class*="carrusel"], [class*="pista"], [class*="desliza"], [class*="tira"]')) return true; } return false; };
  const recorte = (el, r) => {
    let parcial = null, pasoScroll = false;
    for (const c of recortes(el)) {
      if (c.e === el && el.nodeType === 1 && r === rect(el)) continue;   // un elemento no se recorta a sí mismo
      const b = rect(c.e), s = cs(c.e);
      const L = b.left + (parseFloat(s.borderLeftWidth) || 0), Rr = b.right - (parseFloat(s.borderRightWidth) || 0);
      const T = b.top + (parseFloat(s.borderTopWidth) || 0), Bo = b.bottom - (parseFloat(s.borderBottomWidth) || 0);
      const vx = Math.min(r.right, Rr) - Math.max(r.left, L), vy = Math.min(r.bottom, Bo) - Math.max(r.top, T);
      const afueraX = vx <= Math.max(1, (r.right - r.left) * 0.25), afueraY = vy <= Math.max(1, (r.bottom - r.top) * 0.25);
      if ((c.x && afueraX) || (c.y && afueraY)) return 'fuera';
      if ((c.x === 'c' || c.y === 'c') && !pasoScroll) {
        const cx = c.x === 'c' ? Math.max(0, L - r.left) + Math.max(0, r.right - Rr) : 0;
        const cy = c.y === 'c' ? Math.max(0, T - r.top) + Math.max(0, r.bottom - Bo) : 0;
        if (!parcial && (cx > 2 || cy > Math.max(4, r.height * 0.3))) parcial = { por: c.e, cx: Math.round(cx), cy: Math.round(cy) };
      }
      if (c.x === 's' || c.y === 's') pasoScroll = true;   // lo de adentro de algo que se desplaza puede asomar cortado a propósito
    }
    return parcial;
  };
  // recorrido de todo (también dentro de los Shadow DOM de los armadores)
  const elementos = [], textos = [];
  const NO = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK|META|svg|IFRAME|OPTION|TITLE|HEAD)$/i;
  const recorre = (root) => {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeType === 1 && NO.test(n.tagName) ? 2 : 1) });
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 1) { elementos.push(n); if (n.shadowRoot) recorre(n.shadowRoot); }
      else if (n.textContent.trim() && n.parentNode && n.parentNode.nodeType === 1) textos.push(n);
    }
  };
  recorre(document.body);
  const EXCL = (e) => { for (let a = e; a; a = padre(a)) { if (a.nodeType === 1 && a.matches && a.matches('.grecaptcha-badge, .js-notification-cookie-banner, [data-revision-ignora]')) return true; } return false; };
  const INTER = (e) => e.matches && e.matches('a[href], button, input:not([type=hidden]), select, textarea, [role="button"], summary, label[for]');
  const R = { W, H, dpr: devicePixelRatio, desborde: document.documentElement.scrollWidth - W, salen: [], cortados: [], truncados: [], encimados: [], tapados: [], chicos: [], letraChica: [], letraCasi: 0, zoom: [], deformes: [], borrosas: [], dosRenglones: [], largas: [], fijas: '' };

  // ── botones tapados (en la posición actual de la página). zona: 'arriba' (página arriba de todo: cuenta lo fijo de la
  // mitad de arriba, que no se puede correr), 'abajo' (página abajo de todo: lo fijo de la mitad de abajo), 'medio' (solo lo del flujo)
  const tapados = (zona) => {
    const out = [];
    for (const e of elementos) {
      if (!INTER(e) || !visto(e) || EXCL(e)) continue;
      const b = rect(e); if (b.width < 6 || b.height < 6 || b.top < 0 || b.left < 0 || b.bottom > H || b.right > W) continue;
      if (recorte(e, b) === 'fuera') continue;
      const x = b.left + b.width / 2, y = b.top + b.height / 2;
      const raiz = e.getRootNode(); const t = (raiz.elementFromPoint ? raiz : document).elementFromPoint(x, y);
      if (!t || t === e || e.contains(t) || t.contains(e)) continue;
      if ((t.tagName === 'LABEL' && t.control === e) || (e.tagName === 'LABEL' && e.control === t)) continue;
      const tf = fija(t);
      if (tf) {
        if (zona === 'medio') continue;
        const bt = rect(tf); const centro = (bt.top + bt.bottom) / 2;
        if (zona === 'arriba' && centro > H / 2) continue;   // lo fijo de abajo se corre bajando
        if (zona === 'abajo' && centro < H / 2) continue;    // lo fijo de arriba se corre subiendo
      }
      out.push(`${nom(e)} «${txt(e)}» tapado por ${nom(t)}${tf ? ' (fijo)' : ''}`);
    }
    return [...new Set(out)];
  };
  if (cfg.solo === 'tapados') return { tapados: tapados(cfg.zona) };
  if (cfg.solo === 'fijas') {
    let arriba = 0, abajo = 0; const quienes = [];
    for (const e of elementos) {
      if (!visto(e) || EXCL(e)) continue; const p = cs(e).position; if (p !== 'fixed' && p !== 'sticky') continue;
      if (fija(padre(e))) continue;   // solo la capa de más afuera
      const b = rect(e); if (b.width < W * 0.5 || b.height < 4 || b.bottom <= 0 || b.top >= H) continue;
      if (b.top <= 2) { arriba = Math.max(arriba, b.bottom); quienes.push(`${nom(e)} arriba ${Math.round(b.bottom)}px`); }
      else if (b.bottom >= H - 2) { abajo = Math.max(abajo, H - b.top); quienes.push(`${nom(e)} abajo ${Math.round(H - b.top)}px`); }
    }
    return { fijas: { arriba: Math.round(arriba), abajo: Math.round(abajo), pct: Math.round(((arriba + abajo) / H) * 100), quienes } };
  }

  // ── textos: letra chica, cortados, rectángulos para ver si se enciman, botones en 2 renglones
  const rango = document.createRange();
  const cajas = [];
  const lineasDe = new Map();   // botón → tops de sus renglones
  const esBoton = (e) => { for (let a = e, k = 0; a && k < 4; a = padre(a), k++) { if (a.nodeType === 1 && a.matches && a.matches('button, .btn, [class*="btn"], input[type=submit], [role=button], .pnt-boton, [class*="-boton"], [class*="-cta"]')) return a; } return null; };
  for (const n of textos) {
    const el = n.parentNode; if (!visto(el) || EXCL(el)) continue;
    const fs = parseFloat(cs(el).fontSize);
    rango.selectNodeContents(n);
    const rs = [...rango.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
    if (!rs.length) continue;
    let algunoSeVe = false;
    for (const r of rs) {
      const c = recorte(el, r);
      if (c === 'fuera') continue;
      if (r.bottom < -2000 || r.top > document.documentElement.scrollHeight + 2000) continue;
      algunoSeVe = true;
      if (c) {
        // los cortes a propósito (puntos suspensivos, renglones limitados) van aparte
        let adrede = false;
        for (let a = el; a && a !== c.por.parentNode; a = padre(a)) { const s = cs(a); if (s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none')) { adrede = true; break; } }
        if (!adrede && !enTira(el) && !/^[★☆✩✭\s]+$/.test(n.textContent) && !(el.closest && el.closest('.pnt-barra, [class*="stars-on"], [class*="estrellas-on"]'))) R.cortados.push(`«${corto(n.textContent, 34)}» (${nom(el)}) cortado por ${nom(c.por)}${c.cx ? ' ' + c.cx + 'px de costado' : ''}${c.cy ? ' ' + c.cy + 'px de alto' : ''}`);
      }
      if (!fija(el)) cajas.push({ el, l: r.left, t: r.top + scrollY, r: r.right, b: r.bottom + scrollY });
    }
    // un mismo texto de un botón partido en 2 renglones ("AGREGAR AL / CARRITO")
    const bt = esBoton(el);
    if (bt && !(bt.matches && bt.matches('.card, .talle')) && (bt.textContent || '').trim().replace(/\s+/g, ' ').length <= 30) {   // solo rótulos cortos ("AGREGAR AL CARRITO", "Ver todas")
      const tops = [...new Set(rs.filter((r) => recorte(el, r) !== 'fuera').map((r) => Math.round(r.top)))].sort((a, b) => a - b);
      let renglones = tops.length ? 1 : 0; for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] > 6) renglones++;
      if (renglones > 1) lineasDe.set(bt, Math.max(lineasDe.get(bt) || 0, renglones));
    }
    if (!algunoSeVe) continue;
    if (fs < 10) R.letraChica.push(`${Math.round(fs * 10) / 10}px «${corto(n.textContent, 28)}» (${nom(el)})`);
    else if (fs < 11) R.letraCasi++;
  }
  for (const [bt, renglones] of lineasDe) R.dosRenglones.push(`${nom(bt)} «${txt(bt)}» partido en ${renglones} renglones (${Math.round(rect(bt).width)}px de ancho)`);
  // textos encimados (en el flujo, no en barras fijas)
  cajas.sort((a, b) => a.t - b.t);
  const pares = new Set();
  for (let i = 0; i < cajas.length; i++) {
    const A = cajas[i];
    for (let j = i + 1; j < cajas.length && cajas[j].t < A.b - 1; j++) {
      const Bq = cajas[j]; if (A.el === Bq.el || A.el.contains(Bq.el) || Bq.el.contains(A.el)) continue;
      const ix = Math.min(A.r, Bq.r) - Math.max(A.l, Bq.l), iy = Math.min(A.b, Bq.b) - Math.max(A.t, Bq.t);
      if (ix <= 0 || iy <= 0) continue;
      const area = Math.min((A.r - A.l) * (A.b - A.t), (Bq.r - Bq.l) * (Bq.b - Bq.t));
      if (ix * iy < area * 0.3) continue;
      const k = nom(A.el) + '|' + nom(Bq.el); if (pares.has(k)) continue; pares.add(k);
      R.encimados.push(`«${txt(A.el)}» (${nom(A.el)}) encima de «${txt(Bq.el)}» (${nom(Bq.el)}) en y≈${Math.round(A.t)}`);
    }
  }
  // cortes a propósito (para revisar que no se corte algo importante)
  for (const e of elementos) {
    if (!visto(e) || EXCL(e)) continue; const s = cs(e);
    const lc = s.webkitLineClamp && s.webkitLineClamp !== 'none';
    if (s.textOverflow !== 'ellipsis' && !lc) continue;
    if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2) { const b = rect(e); if (recorte(e, b) !== 'fuera' && b.width) R.truncados.push(`${nom(e)} «${txt(e)}»`); }
  }
  // piezas que se salen de la pantalla (sin un contenedor que las recorte)
  const salen = new Set();
  for (const e of elementos) {
    if (!visto(e) || EXCL(e) || fija(e)) continue;
    const b = rect(e); if (!b.width || !b.height) continue;
    if (b.right <= W + 2 && b.left >= -2) continue;
    if (recorte(e, b) || recortes(padre(e)).some((c) => c.x)) continue;   // lo recorta o lo desplaza un contenedor (carrusel, tira)
    const pa = padre(e); if (pa && pa.nodeType === 1 && salen.has(pa)) { salen.add(e); continue; }
    salen.add(e); R.salen.push(`${nom(e)} [${Math.round(b.left)}–${Math.round(b.right)}] «${txt(e)}»`);
  }
  // toques chicos (celu / tablet) y campos que hacen zoom en el iPhone
  if (cfg.toque) {
    const blancos = elementos.filter((e) => INTER(e) && e.tagName !== 'LABEL' && visto(e) && !EXCL(e) && (() => { const b = rect(e); return b.width > 0 && b.height > 0 && recorte(e, b) !== 'fuera'; })());
    const centro = (b) => [b.left + b.width / 2, b.top + b.height / 2];
    const distRect = (x, y, b) => Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
    for (const e of blancos) {
      const b = rect(e);
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName) && !/^(checkbox|radio|submit|button|range|color|file|image)$/.test(e.type || '')) {
        const f = parseFloat(cs(e).fontSize); if (f < 16) R.zoom.push(`${nom(e)} «${txt(e)}» letra ${f}px`);
      }
      if (b.width >= 24 && b.height >= 24) continue;
      if (e.tagName === 'A' && /inline/.test(cs(e).display) && [...(padre(e)?.childNodes || [])].some((n) => n !== e && n.nodeType === 3 && n.textContent.trim().length > 2)) continue;   // link dentro de un párrafo
      // excepción de WCAG 2.5.8: si un círculo de 24 px centrado en el toque no pisa otro toque, alcanza
      const [x, y] = centro(b);
      const vecino = blancos.find((o) => { if (o === e || o.contains(e) || e.contains(o)) return false; const bo = rect(o); if (bo.width < 24 || bo.height < 24) { const [ox, oy] = centro(bo); return Math.hypot(ox - x, oy - y) < 24; } return distRect(x, y, bo) < 12; });
      if (!vecino) continue;
      R.chicos.push(`${nom(e)} «${txt(e)}» ${Math.round(b.width)}×${Math.round(b.height)} (pegado a «${txt(vecino)}»)`);
    }
  }
  // imágenes deformadas o borrosas. Ojo: con srcset, naturalWidth NO es el ancho real del archivo (es el "sizes"):
  // el ancho real se mide abriendo el mismo archivo aparte (sale del caché).
  const fotos = elementos.filter((e) => e.tagName === 'IMG');
  const real = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res([im.naturalWidth, im.naturalHeight]); im.onerror = () => res([0, 0]); im.src = src; setTimeout(() => res([0, 0]), 4000); });
  const dudosas = [];
  for (const i of fotos) {
    if (!visto(i) || EXCL(i) || !i.complete || !i.naturalWidth || /\.svg(\?|$)|^data:/i.test(i.currentSrc || i.src)) continue;
    const b = rect(i); if (b.width < 30 || b.height < 30 || recorte(i, b) === 'fuera') continue;
    if (/lazyload(?!ed)/.test(i.className)) continue;   // todavía no bajó la foto buena
    const s = cs(i); const of = s.objectFit || 'fill';
    if ((s.maskImage && s.maskImage !== 'none') || (s.webkitMaskImage && s.webkitMaskImage !== 'none')) continue;   // se pinta con máscara (el logo)
    const rr = b.width / b.height, rn = i.naturalWidth / i.naturalHeight;
    if (of === 'fill' && Math.abs(rr / rn - 1) > 0.04) R.deformes.push(`${nom(i)} …${(i.currentSrc || i.src).split('/').pop().slice(0, 40)} se ve ${Math.round(b.width)}×${Math.round(b.height)}, la foto es ${i.naturalWidth}×${i.naturalHeight}`);
    if (b.width > 110) dudosas.push({ i, b, of });
  }
  const vistas = new Map();
  for (const d of dudosas.slice(0, 60)) {
    const src = d.i.currentSrc || d.i.src; if (!vistas.has(src)) vistas.set(src, await real(src));
    const [nw, nh] = vistas.get(src); if (!nw) continue;
    const esc = d.of === 'cover' ? Math.max(d.b.width / nw, d.b.height / nh) : d.of === 'contain' || d.of === 'scale-down' ? Math.min(d.b.width / nw, d.b.height / nh) : d.b.width / nw;
    if (esc * devicePixelRatio > 1.6) R.borrosas.push(`${nom(d.i)} …${src.split('/').pop().slice(0, 46)} (${nw}px reales) agrandada ×${(esc * devicePixelRatio).toFixed(1)} · ${Math.round(d.b.width)}px en pantalla`);
  }
  // renglones muy largos (compu): más de ~110 letras por renglón cansan
  if (W >= 1024) {
    for (const e of elementos) {
      if (!/^(P|LI|DD|BLOCKQUOTE)$/.test(e.tagName) || !visto(e) || EXCL(e)) continue;
      const b = rect(e); const f = parseFloat(cs(e).fontSize); if (!b.width || (e.textContent || '').trim().length < 160) continue;
      const letras = b.width / (f * 0.55); if (letras > 115) R.largas.push(`${nom(e)} ~${Math.round(letras)} letras por renglón (${Math.round(b.width)}px, ${f}px) «${txt(e)}»`);
    }
  }
  R.tapados = tapados('arriba');
  const uniq = (a, n = 14) => { const u = [...new Set(a)]; return u.length > n ? [...u.slice(0, n), `… y ${u.length - n} más`] : u; };
  for (const k of ['salen', 'cortados', 'truncados', 'encimados', 'tapados', 'chicos', 'letraChica', 'zoom', 'deformes', 'borrosas', 'dosRenglones', 'largas']) R[k] = uniq(R[k], k === 'truncados' ? 8 : 14);
  return R;
}

// ─────────────────────────────────────── recorrido ───────────────────────────────────────
let browser;
async function abrir() {
  browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.VER ? false : 'new',   // VER=1: con la ventana de Chrome a la vista, para mirar las pruebas
    args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--hide-scrollbars', ...(process.env.VER ? ['--window-position=0,0', '--window-size=1536,816'] : [])],
  });
}
await abrir();
const informe = [];
const anota = (t) => { informe.push(t); console.log(t); };
const resumen = {};
let vueltas = 0;
for (const k of PAGS) {
  if (!P[k]) { anota(`(página desconocida: ${k})`); continue; }
  for (const { w, h: altoFijo, txt } of ANCHOS) {
    if (++vueltas % 12 === 0) { await browser.close(); await abrir(); }   // Chrome limpio cada tanto (poca memoria)
    const m = altoFijo && altoFijo < 600 ? 'celu' : modoDe(w); const h = altoFijo || ALTO[w] || Math.round(w * (m === 'compu' ? 0.56 : 1.8));   // acostado: celular (iPhone)
    const toque = m !== 'compu';
    const p = await browser.newPage();
    const errs = [], fallas = [];
    await p.setRequestInterception(true);
    p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
    p.on('pageerror', (e) => errs.push(String(e.message).split('\n')[0].slice(0, 140)));
    p.on('response', (r) => { const u = r.url(); if (r.status() >= 400 && /localhost:5700/.test(u) && !/\/__|offer-cache/.test(u)) fallas.push(r.status() + ' ' + u.replace(B, '').slice(0, 100)); });
    await p.setViewport({ width: w, height: h, deviceScaleFactor: toque ? 2 : 1, isMobile: toque, hasTouch: toque });
    await p.setUserAgent(UA[m]);
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    const t0 = Date.now();
    try { await p.goto(B + P[k], { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { /* sigue */ }
    for (let i = 0; i < 60; i++) { if (await p.evaluate(() => document.readyState === 'complete').catch(() => false)) break; await espera(250); }
    await espera(k === 'ofertas' ? 6500 : 3200);
    await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove())).catch(() => {});
    const base = `${k}-${txt}`;
    await p.screenshot({ path: path.join(SALIDA, `vista-${base}.jpg`), type: 'jpeg', quality: 72 }).catch(() => {});
    // bajar toda la página (entradas animadas y fotos diferidas), volver arriba
    const alto = await p.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
    for (let y = 0; y < alto; y += Math.round(h * 0.6)) { await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y).catch(() => {}); await espera(170); }
    await espera(1200);
    const ir = async (y) => { await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y).catch(() => {}); await espera(700); };
    await ir(0);
    let R;
    try { R = await p.evaluate(DETECTOR, { toque }); } catch (e) { R = { error: e.message.slice(0, 200) }; }
    // en el medio: barras fijas; abajo de todo: lo que tapan las barras fijas (ahí ya no se puede bajar más)
    const altoFinal = await p.evaluate(() => document.documentElement.scrollHeight).catch(() => alto);
    await ir(Math.round(altoFinal / 2));
    const fj = await p.evaluate(DETECTOR, { solo: 'fijas' }).catch(() => ({}));
    const tm = await p.evaluate(DETECTOR, { solo: 'tapados', zona: 'medio' }).catch(() => ({}));
    await ir(altoFinal);
    const tb = await p.evaluate(DETECTOR, { solo: 'tapados', zona: 'abajo' }).catch(() => ({}));
    if (R && !R.error) {
      R.fijas = fj.fijas; R.tapadosMedio = tm.tapados || []; R.tapadosAbajo = tb.tapados || [];
    }
    if (FOTOS.has(w) || FOTOS.has(txt)) {
      try {
        if (toque) {
          // la foto entera va en densidad 1 (en 2 pesa el doble); al cambiarla, las fotos diferidas y el 3D se vuelven a
          // pedir: se recorre la página otra vez para que estén cargadas (si no, salen en blanco en la foto y no en la tienda)
          await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await espera(900);
          const alto2 = await p.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
          for (let y = 0; y < alto2; y += Math.round(h * 0.6)) { await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y).catch(() => {}); await espera(260); }
          await espera(1500);
        }
        await ir(0);
        // que terminen de bajar las fotos que se pidieron al recorrer (si no, salen tarjetas en blanco en la foto y no en la tienda)
        await p.evaluate(async () => { const t0 = Date.now(); while (Date.now() - t0 < 9000) { if (![...document.images].some((i) => i.currentSrc && !i.complete)) break; await new Promise((r) => setTimeout(r, 300)); } }).catch(() => {});
        await espera(900);
        await p.evaluate(() => { if (window.lenis) window.lenis.stop(); });
        await p.screenshot({ path: path.join(SALIDA, `todo-${base}.jpg`), type: 'jpeg', quality: 74, fullPage: true, captureBeyondViewport: true });
        await p.evaluate(() => { if (window.lenis) window.lenis.start(); });
      } catch (e) { anota(`  (foto entera ${base} falló: ${e.message.slice(0, 80)})`); }
    }
    // informe
    const lin = [];
    if (R.error) lin.push('detector falló: ' + R.error);
    else {
      if (R.desborde > 0) lin.push(`DESBORDE lateral ${R.desborde}px`);
      const sec = (t, a) => { if (a && a.length) lin.push(`${t}:\n      ${a.join('\n      ')}`); };
      sec('se salen de la pantalla', R.salen); sec('textos CORTADOS', R.cortados); sec('textos ENCIMADOS', R.encimados);
      sec('tapados (arriba)', R.tapados); sec('tapados por algo en el medio de la página', R.tapadosMedio); sec('tapados al final de la página', R.tapadosAbajo);
      sec('letra < 10px', R.letraChica); sec('campos con letra < 16px (zoom en iPhone)', R.zoom); sec('toques chicos (< 24px)', R.chicos);
      sec('imágenes deformadas', R.deformes); sec('imágenes borrosas', R.borrosas); sec('botones en 2+ renglones', R.dosRenglones);
      sec('renglones muy largos', R.largas); sec('cortes a propósito (…)', R.truncados);
      if (R.fijas && R.fijas.pct >= 22) lin.push(`barras fijas ocupan ${R.fijas.pct}% de la pantalla (${R.fijas.quienes.join(', ')})`);
      if (R.letraCasi) lin.push(`(${R.letraCasi} textos entre 10 y 11 px)`);
    }
    const e = [...new Set(errs)].filter((x) => !/applySortBy/.test(x)); if (e.length) lin.push('errores JS: ' + e.join(' | '));
    const f = [...new Set(fallas)]; if (f.length) lin.push('pedidos fallidos: ' + f.slice(0, 5).join(' | '));
    anota(`\n■ ${k} ${w}×${h} (${m}) · ${Math.round((Date.now() - t0) / 1000)}s${lin.length ? '' : ' · sin problemas detectados'}`);
    lin.forEach((l) => anota('   ' + l));
    resumen[base] = R;
    await p.close().catch(() => {});
  }
}
fs.appendFileSync(path.join(SALIDA, '_responsive.txt'), `\n=== ${new Date().toISOString()} ${PAGS.join(',')} · ${ANCHOS.map((x) => x.txt).join(',')}\n` + informe.join('\n') + '\n');
const jf = path.join(SALIDA, '_responsive.json');
let previo = {}; try { previo = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) { /* nuevo */ }
fs.writeFileSync(jf, JSON.stringify({ ...previo, ...resumen }, null, 1));
await browser.close();
