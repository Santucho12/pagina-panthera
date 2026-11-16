/* Panthera — "Armá tu pulsera" en 3D (2026-11-10). Es el armador del artefacto "El riel" (vista pulsera), pasado a la tienda.
   El marcado y los datos (ids, variantes, precios, stock) están en snipplets/panthera/armar.tpl; los estilos, en armar3d.css,
   que se carga ADENTRO del componente (Shadow DOM): así el CSS de Lima no lo toca y el suyo no toca la tienda.
   - La escena 3D está en armar3d-escena.js (2026-11-11) y usa three.js 0.187.0 (jsDelivr). Desde el 2026-11-12 se arma ANTES de
     llegar a la sección (apenas termina la intro del inicio, en pasos chicos: ver "3D" más abajo); la intro de la pulsera arranca
     cuando el escenario se ve un 40 %; fuera de pantalla no se dibuja.
   - "Agregar al carrito" es real: un POST a /comprar/ por producto (la pulsera con su talle y cada charm) y después al carrito.
   - Anima siempre, aunque la compu pida "movimiento reducido" (como el resto de la tienda; pedido 2026-11-11).
   ⚠️ Preparado en local: NO subido. No se sube por FTP sin el OK de Panthera (ver CLAUDE.md). */
(function () {
'use strict';
var SRC_JS = (document.currentScript && document.currentScript.src) || '';
var host = document.querySelector('[data-pnt-a3]');
if (!host || !host.attachShadow || !('content' in document.createElement('template'))) return;
var molde = host.querySelector('template');
if (!molde || host.shadowRoot) return;
var raiz = host.attachShadow({ mode: 'open' });
raiz.appendChild(molde.content.cloneNode(true));
(function () {      // hasta que cargan sus estilos el componente no se ve (secciones.css: .pnt-a3-host:not(.listo))
  var link = raiz.querySelector('link[rel="stylesheet"]'), hecho = false;
  function listo() { if (!hecho) { hecho = true; host.classList.add('listo'); } }
  if (!link) { listo(); return; }
  link.addEventListener('load', listo); link.addEventListener('error', listo); setTimeout(listo, 4000);
  try { if (link.sheet && link.sheet.cssRules.length) listo(); } catch (e) {}
})();
function leeDatos() {   // los datos los escribe armar.tpl en dos listas escondidas (ver ahí cómo actualizarlos)
  // (2026-11-15, pedido: "si un arito o pulsera o charm no está disponible (no hay stock), no debe aparecer") Los charms sin stock y las
  // pulseras sin ningún talle con stock no se arman: no aparecen en la lista, ni de entrada en la pulsera, ni en el 3D. Los talles sin stock
  // de una pulsera que sí tiene otros siguen a la vista como "Sin stock" (no se pueden elegir). El stock es el que está escrito en armar.tpl
  // (se actualiza con herramientas/armador/sincroniza_charms.mjs); si la tienda igual rechaza algo al agregarlo, desaparece ahí (agota).
  // (2026-11-16) También lo que la tienda rechazó en este navegador en las últimas 12 h (agotadosGuardados): al volver a entrar ya no aparece.
  var num = function (v) { return Number(v) || 0; };
  var agotados = agotadosGuardados('a3');
  var charms = Array.prototype.map.call(raiz.querySelectorAll('[data-a3-charms] li'), function (li) {
    var d = li.dataset;
    return { k: d.k, n: d.n, cat: d.cat, me: d.me || 'plata', id: d.id, v: d.v, p: num(d.p), a: num(d.a), st: num(d.st), tipo: d.tipo, ag: num(d.ag), alto: num(d.alto), asp: num(d.asp), img: d.img, hd: d.hd || '', hdn: d.hdn || '', hueco: d.hueco || '' };
  });
  var temaDe = {};      // tema y forma de TODOS (también los sin stock): para elegir el reemplazo de uno de entrada que se agotó
  charms.forEach(function (c) { temaDe[c.k] = { cat: c.cat, tipo: c.tipo }; });
  return {
    charms: charms.filter(function (c) { return c.st > 0 && !agotados[c.k]; }),
    bases: Array.prototype.map.call(raiz.querySelectorAll('[data-a3-bases] li'), function (li) {
      var d = li.dataset;
      return { k: d.k, n: d.n, id: d.id, p: num(d.p), a: num(d.a), img: d.img, cierre: d.cierre, desc: d.desc, rad: num(d.rad),
        talles: d.talles.split(';').map(function (x) { var q = x.split('|'); return [q[0], num(q[2]), q[1]]; }) };   // [talle, stock, variante]
    }).filter(function (b) { return b.talles.some(function (t) { return t[1] > 0; }); }),
    temaDe: temaDe
  };
}
// (2026-11-16) Lo que la tienda rechaza al agregarlo (se agotó después de la última sincronización de armar.tpl) queda anotado 12 h en este
// navegador: al volver a entrar ya no aparece y, si era de la pulsera de entrada, se reemplaza. La misma lista usa "Armá tu oreja" ('or:').
var AGOTADOS_CLAVE = 'pnt-agotados-v1', AGOTADOS_MS = 12 * 3600 * 1000;
function agotadosGuardados(pre) {
  var out = {};
  try {
    var t = JSON.parse(localStorage.getItem(AGOTADOS_CLAVE) || '{}') || {}, ahora = Date.now();
    Object.keys(t).forEach(function (x) { if (x.indexOf(pre + ':') === 0 && ahora - t[x] < AGOTADOS_MS) out[x.slice(pre.length + 1)] = true; });
  } catch (e) {}
  return out;
}
function guardaAgotado(pre, k) {
  try {
    var t = JSON.parse(localStorage.getItem(AGOTADOS_CLAVE) || '{}') || {}, ahora = Date.now();
    Object.keys(t).forEach(function (x) { if (!(ahora - t[x] < AGOTADOS_MS)) delete t[x]; });
    t[pre + ':' + k] = ahora;
    localStorage.setItem(AGOTADOS_CLAVE, JSON.stringify(t));
  } catch (e) {}
}
var DATA = leeDatos();
if (!DATA.charms.length || !DATA.bases.length) return;
var CH = {}; DATA.charms.forEach(function (c) { CH[c.k] = c; });
var BA = {}; DATA.bases.forEach(function (b) { BA[b.k] = b; });
var REDUCE = false;      // anima siempre, aunque la compu pida "movimiento reducido": como el resto de la tienda (pedido 2026-11-11)
host.classList.add('anima');
var FINO = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
var MAX = 15;
var fmt = function (n) { return '$' + Math.round(n).toLocaleString('es-AR'); };
var fmtc = function (n) {    // como las cuotas de la tienda: con centavos solo si hacen falta ("$24.293,33")
  var e = Math.floor(n + 1e-9), c = Math.round((n - e) * 100); if (c === 100) { e++; c = 0; }
  return '$' + e.toLocaleString('es-AR') + (c ? ',' + (c < 10 ? '0' : '') + c : '');
};
var TARJETA = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg>';
function precios(p, a, chico) {   // el bloque de precios de las tarjetas de la tienda (marca.css sección 10)
  return '<span class="p-lista">' + (a > p ? '<s>' + fmt(a) + '</s>' : '') + '<span class="ah">Ahora </span>' + fmt(p) + '</span>' +
    '<span class="p-transf"><b>' + fmt(p * 0.7) + '</b><span>Con transferencia</span></span>' +
    (chico ? '' : '<span class="p-cuotas">' + TARJETA + '<span>3 cuotas sin interés de ' + fmtc(p / 3) + '</span></span>');
}
var $ = function (id) { return raiz.getElementById(id); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || raiz).querySelectorAll(s)); };
var cm = function (t) { return parseFloat(t) || 19; };
// Al entrar (pedidos 2026-11-11): la pulsera Silver Flower elegida, el talle sin marcar (lo elige la persona) y 3 charms ya
// agregados (The Moon, Mickey Shine y Stitch), sin el cartel de "combinación de ejemplo". La lista "Tu combinación" NO se muestra
// ("oculta esto, no quiero que se vea"): se saca un charm tocando su tarjeta otra vez o tocándolo en la pulsera (lupa → Sacar).
// BASE_VISTA: la que muestra el 3D si no hubiera ninguna elegida.
var TALLE_DE_ENTRADA = '18 cm';   // combinación de entrada pedida: Silver Flower 18 cm + Painter, Mickey Shine y Stitch
// (2026-11-16, pedido: "siempre tiene que aparecer como mínimo 3 charms por defecto… en caso de que se venda alguno de los que estaban por
// defecto, reemplazarlo por otros") La pulsera de entrada lleva SIEMPRE 3 charms: los pedidos que tengan stock y, en el lugar de cada uno que
// no, otro con stock elegido solo (reemplazo): del mismo tema y forma (cuenta o colgante); si no hay, del mismo tema; si no, de la misma forma;
// y entre esos, el de más unidades. Hoy Mickey Shine ya no existe → Mickey y Minnie reversible. Si la Silver Flower se agotara, arranca con la
// primera pulsera con stock (y si no tuviera 18 cm, con su primer talle con stock).
// El póster (la foto que se ve si el 3D tarda) muestra la pulsera de entrada con la que se sacó (data-poster-de en armar.tpl, lo escribe
// pruebas/poster.mjs): si la de hoy es otra, no se muestra (posterVale). Si cambia la de entrada, regenerarlo.
var PEDIDOS_DE_ENTRADA = ['pain', 'mick', 'stit'], N_DE_ENTRADA = 3;   // Painter, Mickey Shine y Stitch (pedido 2026-11-12)
function reemplazo(como, usados) {
  var mejor = null, puntos = -1;
  DATA.charms.forEach(function (c) {
    if (usados.indexOf(c.k) >= 0) return;
    var p = (como && c.cat === como.cat ? 2 : 0) + (como && c.tipo === como.tipo ? 1 : 0);
    if (p > puntos || (p === puntos && c.st > mejor.st)) { mejor = c; puntos = p; }
  });
  return mejor ? mejor.k : null;
}
function entrada(pedidos, n) {
  var out = [];
  pedidos.forEach(function (k) {
    if (out.length >= n) return;
    var r = CH[k] ? k : reemplazo(DATA.temaDe[k], out.concat(pedidos));
    if (r && out.indexOf(r) < 0) out.push(r);
  });
  for (var r = null; out.length < n && (r = reemplazo(null, out.concat(pedidos))); ) out.push(r);
  return out;
}
var BASE_VISTA = BA.silv ? 'silv' : DATA.bases[0].k, DE_ENTRADA = entrada(PEDIDOS_DE_ENTRADA, N_DE_ENTRADA);
var st = { base: BASE_VISTA, talle: null, sel: [], filtro: '', pausa: REDUCE, intro: true };
DE_ENTRADA.forEach(function (k) { if (CH[k]) st.sel.push(k); });
host.setAttribute('data-entrada', BASE_VISTA + '|' + (function (b) {      // "silv|18 cm|pain,mmre,stit": con qué arranca (lo compara posterVale)
  var hay = b.talles.filter(function (t) { return t[1] > 0; }).map(function (t) { return t[0]; });
  return hay.indexOf(TALLE_DE_ENTRADA) >= 0 ? TALLE_DE_ENTRADA : (hay[0] || '');
})(BA[BASE_VISTA]) + '|' + DE_ENTRADA.join(','));
var G = null;

/* ═════════ Interfaz ═════════ */
var CATS = ['Todos', 'Disney', 'Amor y familia', 'Viajes', 'Brillos y cielo', 'Varios'];   // "Varios" desde 2026-11-11 (los 62 charms de la tienda)
$('chips').innerHTML = CATS.map(function (c, i) {
  var n = i ? DATA.charms.filter(function (x) { return x.cat === c; }).length : DATA.charms.length;
  return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-c="' + (i ? c : '') + '">' + c + '<small>' + n + '</small></button>';
}).join('');
$('dock-s').textContent = DATA.charms.length + ' charms de plata 925 · tocalos o arrastralos a la pulsera';
// (2026-11-16, pedido: "que también se pueda filtrar por dorado o plateado") En el mismo panel de "Filtrar", debajo de los temas, una fila "Metal":
// Todos / Plateado / Dorado. Se combina con el tema (Disney + Dorado = los de Disney dorados). Los chips de metal llevan data-m.
var METALES = [['', 'Todos'], ['plata', 'Plateado'], ['oro', 'Dorado']];
st.metal = '';
$('chips').insertAdjacentHTML('beforeend', '<span class="chips-sep">Metal</span>' + METALES.map(function (m, i) {
  return '<button type="button" class="chip" data-m="' + m[0] + '" aria-pressed="' + (i === 0) + '">' + m[1] + '</button>';
}).join(''));
function aplicaFiltros() {
  $$('.card').forEach(function (el) { el.hidden = (!!st.filtro && el.dataset.cat !== st.filtro) || (!!st.metal && el.dataset.me !== st.metal); });
  var t = [st.filtro, st.metal ? (st.metal === 'oro' ? 'Dorado' : 'Plateado') : ''].filter(Boolean).join(' · ');
  $('filtro-t').textContent = t || 'Filtrar'; $('filtro-b').classList.toggle('activo', !!t);
}
var MAS = '<svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10"/></svg>';
$('tira').innerHTML = DATA.charms.map(function (c) {
  return '<button type="button" class="card" data-k="' + c.k + '" data-cat="' + c.cat + '" data-me="' + c.me + '" aria-pressed="false" aria-label="' + c.n + ', ' + fmt(c.p) + '">' +
    '<span class="card-f"><img class="cg" data-src="' + c.img + '" alt="" draggable="false" decoding="async">' + (c.st === 1 ? '<span class="ult">Última</span>' : '') +
    (c.a > c.p ? '<span class="off">-' + Math.round((1 - c.p / c.a) * 100) + '%</span>' : '') +
    '<span class="mas">' + MAS + '</span><span class="en">En tu pulsera</span></span>' +
    '<span class="card-i"><span class="card-n">' + c.n + '</span><span class="p-linea"></span>' + precios(c.p, c.a) + '</span></button>';
}).join('');
// Las fotos de las tarjetas (~1,7 MB entre las 27) bajan recién cuando la sección se acerca y de a las que están por verse en la
// lista (600 px antes); aparecen con un fundido. (loading="lazy" no ahorraba: el navegador las pedía todas igual.)
var fotosIO = null;
function ponFoto(im) {
  if (!im.dataset.src) return;
  function listo(e) {
    im.classList.remove('cg');
    var card = im.closest('.card');      // con el 3D andando, se adelanta también su foto para la pulsera
    if (e.type === 'load' && G && G.precarga && card) G.precarga(card.dataset.k);
  }
  im.addEventListener('load', listo); im.addEventListener('error', listo);
  im.src = im.dataset.src; im.removeAttribute('data-src');
  if (fotosIO) fotosIO.unobserve(im);
}
function pideFotos() {
  if (pideFotos.ya) return; pideFotos.ya = true;
  var ims = Array.prototype.slice.call($('tira').querySelectorAll('img[data-src]'));
  if (!('IntersectionObserver' in window)) { ims.forEach(ponFoto); return; }
  fotosIO = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) ponFoto(e.target); }); }, { root: $('tira'), rootMargin: '600px' });
  ims.forEach(function (im) { fotosIO.observe(im); });
}
$('bases').innerHTML = DATA.bases.map(function (b) {
  return '<button type="button" class="base" data-b="' + b.k + '" aria-pressed="' + (b.k === st.base) + '" aria-label="Pulsera ' + b.n + '" title="' + b.n + '"><img src="' + b.img + '" alt=""></button>';
}).join('');

// El talle aparece recién cuando se elige la pulsera (pedido 2026-11-11), sin ninguno marcado: lo elige la persona
function pintaTalles() {
  var b = BA[st.base];
  ['base-n', 'base-d', 'base-s'].forEach(function (id) { $(id).hidden = !b; });
  $('paso1').classList.toggle('hecho', !!b);
  $('paso2').hidden = !b; $('paso2').classList.toggle('hecho', !!(b && st.talle));
  if (!b) { $('talles').innerHTML = ''; return; }
  var hay = b.talles.filter(function (t) { return t[1] > 0; }).map(function (t) { return t[0]; });
  if (st.talle && hay.indexOf(st.talle) < 0) st.talle = null;
  if (!st.talle && hay.length) st.talle = hay.indexOf(TALLE_DE_ENTRADA) >= 0 ? TALLE_DE_ENTRADA : hay[0];   // siempre viene un talle marcado (el primero con stock), pedido 2026-11-11
  $('paso2').classList.toggle('hecho', !!st.talle);
  $('talles').innerHTML = b.talles.map(function (t) {
    return '<button type="button" class="talle" data-t="' + t[0] + '" aria-pressed="' + (t[0] === st.talle) + '"' + (t[1] ? '' : ' disabled') + '>' + t[0] +
      '<small>' + (t[1] ? (t[1] === 1 ? 'Última' : t[1] + ' disponibles') : 'Sin stock') + '</small></button>';
  }).join('');
  $('base-n').textContent = 'Pulsera ' + b.n;
  $('base-d').textContent = b.desc;
  $('base-s').innerHTML = precios(b.p, b.a, true);
}
var FL_IZQ = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>', FL_DER = '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>', CRUZ = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function pintaResumen(late) {
  var b = st.base ? BA[st.base] : null, t = b ? b.p : 0, a = b ? b.a : 0, n = st.sel.length;
  st.sel.forEach(function (k) { t += CH[k].p; a += CH[k].a; });
  $('t-lista').innerHTML = (a > t ? '<s>' + fmt(a) + '</s>' : '') + 'Ahora ' + fmt(t); rueda($('t-tr'), t * 0.7, late); $('t-cuota').textContent = fmtc(t / 3);
  var partes = [];
  if (b) partes.push('Pulsera' + (st.talle ? ' ' + st.talle : ''));
  if (n) partes.push(n + (n === 1 ? ' charm' : ' charms'));
  $('t-lbl').textContent = partes.join(' + ') || 'Tu pulsera';
  host.classList.toggle('sin-total', !b && !n);
  $('cuenta').textContent = n; $('cuenta-l').textContent = n === 1 ? 'charm' : 'charms';
  $('lista').innerHTML = st.sel.map(function (k, i) {
    var c = CH[k];
    return '<li><img src="' + c.img + '" alt=""><span class="n">' + c.n + '<small>' + fmt(c.p) + ' · <i>' + fmt(c.p * 0.7) + ' c/ transf.</i></small></span><span class="acc">' +
      '<button type="button" data-mover="' + k + '" data-d="-1" aria-label="Mover ' + c.n + ' a la izquierda"' + (i === 0 ? ' disabled' : '') + '>' + FL_IZQ + '</button>' +
      '<button type="button" data-mover="' + k + '" data-d="1" aria-label="Mover ' + c.n + ' a la derecha"' + (i === n - 1 ? ' disabled' : '') + '>' + FL_DER + '</button>' +
      '<button type="button" data-quitar="' + k + '" aria-label="Sacar ' + c.n + '">' + CRUZ + '</button></span></li>';
  }).join('');
  $('vacia').hidden = n > 0; $('orden').hidden = n < 2; $('vacio').hidden = n > 0 || !G || st.intro;
  $('b-total').textContent = fmt(t); rueda($('b-tr'), t * 0.7, late);
  $('paso3').hidden = true;      // "Tu combinación" no se muestra (pedido 2026-11-11); la lista se sigue armando escondida
  $$('.card').forEach(function (el) { el.setAttribute('aria-pressed', String(st.sel.indexOf(el.dataset.k) > -1)); });
  if (late) {
    var g = $('t-tr'); g.classList.remove('late'); void g.offsetWidth; g.classList.add('late');
    var c2 = $('cuenta'); c2.classList.remove('late'); void c2.offsetWidth; c2.classList.add('late');
  }
}
// el precio con transferencia "rueda" hasta el valor nuevo (0,5 s, frena al final) cuando cambia por algo que hizo la persona
function rueda(el, valor, anima) {
  var desde = el._valor == null ? valor : el._valor; el._valor = valor;
  if (!anima || desde === valor) { el.textContent = fmt(valor); return; }
  var t0 = performance.now(), id = el._rueda = {};
  (function f(ahora) {
    if (el._rueda !== id) return;
    var u = Math.min(1, (ahora - t0) / 500), e = 1 - Math.pow(1 - u, 3);
    el.textContent = fmt(desde + (valor - desde) * e);
    if (u < 1) requestAnimationFrame(f);
  })(t0);
}
function pintaHint() {
  $('hint').innerHTML = '<kbd>⟲</kbd> Arrastrá para girarla · tocá un charm o el cierre para verlo de cerca';
}
// La lupa: al tocar un charm (o el cierre) en el 3D, la cámara se acerca y esta tarjeta muestra qué es y cuánto sale.
// Se cierra con la ×, con Esc o tocando afuera; "Sacar de la pulsera" lo saca (también se puede desde "Tu combinación").
var lupaEspera;
function muestraLupa(info) {
  var l = $('lupa'), sacar = $('lupa-sacar');
  if (!info) { l.classList.remove('ve'); clearTimeout(lupaEspera); lupaEspera = setTimeout(function () { l.hidden = true; }, 380); return; }
  clearTimeout(lupaEspera); l.hidden = false;
  if (info.k) {
    var c = CH[info.k];
    $('lupa-t').textContent = c.cat; $('lupa-n').textContent = c.n;
    $('lupa-d').textContent = (c.tipo === 'c' ? 'Charm de cuenta' : 'Charm colgante') + ' · plata 925' + (c.st === 1 ? ' · última unidad' : '');
    $('lupa-p').innerHTML = precios(c.p, c.a); sacar.hidden = false; sacar.dataset.k = info.k;
  } else {
    var b = BA[st.base || BASE_VISTA];
    $('lupa-t').textContent = 'El cierre'; $('lupa-n').textContent = 'Pulsera ' + b.n; $('lupa-d').textContent = b.desc;
    $('lupa-p').innerHTML = precios(b.p, b.a, true); sacar.hidden = true;
  }
  void l.offsetWidth; l.classList.add('ve');
  try { $('lupa-x').focus({ preventScroll: true }); } catch (e) {}
}
$('lupa-x').addEventListener('click', function () { if (G && G.cierraLupa) G.cierraLupa(); else muestraLupa(null); });
$('lupa-sacar').addEventListener('click', function () { var k = this.dataset.k; if (k) quitar(k); if (G && G.cierraLupa) G.cierraLupa(); });
var toastT, deshacer = null;
function toast(msg, undo, etq) {
  $('toast-t').textContent = msg; $('toast-b').hidden = !undo; $('toast-b').textContent = etq || 'Deshacer'; deshacer = undo || null;
  $('toast').classList.add('ve'); clearTimeout(toastT); toastT = setTimeout(function () { $('toast').classList.remove('ve'); deshacer = null; }, undo ? 5000 : 3200);
}
$('toast-b').addEventListener('click', function () { if (deshacer) deshacer(); $('toast').classList.remove('ve'); deshacer = null; });
var medidaT;
function medida(txt) { var m = $('medida'); m.textContent = txt; m.classList.add('ve'); clearTimeout(medidaT); medidaT = setTimeout(function () { m.classList.remove('ve'); }, 1900); }
var vitT;
function muestraBase(txt) {     // tarjeta de la pulsera elegida, mientras el 3D muestra su cierre de frente
  var b = BA[st.base || BASE_VISTA], v = $('vitrina');
  v.querySelector('img').src = b.img; v.querySelector('b').textContent = 'Pulsera ' + b.n; v.querySelector('span').textContent = txt;
  v.classList.remove('ve'); void v.offsetWidth; v.classList.add('ve');
  clearTimeout(vitT); vitT = setTimeout(function () { v.classList.remove('ve'); }, 2900);
}

function agregar(k, desde, i) {
  if (st.sel.indexOf(k) > -1) return;
  st.ejemplo = false;
  if (st.sel.length >= MAX) { toast('En este prototipo entran hasta ' + MAX + ' charms'); return; }
  if (typeof i === 'number') st.sel.splice(i, 0, k); else st.sel.push(k);
  pintaResumen(true); if (G) G.agregar(k, desde);
}
function quitar(k, conDeshacer) {
  var i = st.sel.indexOf(k); if (i < 0) return;
  st.ejemplo = false;
  st.sel.splice(i, 1); pintaResumen(true); if (G) G.quitar(k);
  if (conDeshacer !== false) toast('Sacaste ' + CH[k].n, function () { agregar(k, null, i); });
}
// (2026-11-15) Sin stock = no aparece (pedido: "si un arito o pulsera o charm no está disponible (no hay stock), no debe aparecer"). Lo que
// armar.tpl ya marca sin stock ni se arma (leeDatos); estas dos sacan lo que la tienda rechazó al agregarlo (se agotó después de la última
// sincronización de armar.tpl).
function cuentaCharms() {
  $$('.chip', $('chips')).forEach(function (b) {
    var s = b.querySelector('small'); if (!s) return;
    s.textContent = b.dataset.c ? DATA.charms.filter(function (x) { return x.cat === b.dataset.c; }).length : DATA.charms.length;
  });
  $('dock-s').textContent = DATA.charms.length + ' charms de plata 925 · tocalos o arrastralos a la pulsera';
}
function agota(k) {            // el charm sale de la pulsera y de la lista (y queda anotado 12 h en este navegador)
  if (!CH[k]) return;
  CH[k].st = 0; quitar(k, false); guardaAgotado('a3', k);
  DATA.charms = DATA.charms.filter(function (x) { return x.k !== k; });
  var card = $('tira').querySelector('.card[data-k="' + k + '"]'); if (card) card.remove();
  cuentaCharms();
}
function agotaTalle(bk, talle) {   // el talle queda "Sin stock"; si la pulsera no tiene otro, sale de la lista (devuelve true)
  var b = BA[bk]; if (!b) return false;
  b.talles.forEach(function (t) { if (t[0] === talle) t[1] = 0; });
  if (b.talles.some(function (t) { return t[1] > 0; })) {
    if (st.base === bk) { st.talle = null; pintaTalles(); pintaResumen(); if (G && st.talle) G.talle(cm(st.talle)); }
    return false;
  }
  DATA.bases = DATA.bases.filter(function (x) { return x.k !== bk; });
  var bt = $('bases').querySelector('.base[data-b="' + bk + '"]'); if (bt) bt.remove();
  var otra = $('bases').querySelector('.base');
  if (st.base === bk) { if (otra) otra.click(); else { st.base = null; st.talle = null; pintaTalles(); pintaResumen(); } }
  delete BA[bk];
  return true;
}
function mover(k, d) {
  var i = st.sel.indexOf(k), j = i + d; if (i < 0 || j < 0 || j >= st.sel.length) return;
  st.ejemplo = false;
  st.sel.splice(i, 1); st.sel.splice(j, 0, k); pintaResumen(); if (G) G.reordenar();
  var b = $$('[data-mover="' + k + '"][data-d="' + d + '"]')[0]; if (b && !b.disabled) b.focus();
}

// El filtro es un botón que abre la lista de temas (pedido 2026-11-11); se cierra al elegir, al tocar afuera o con Escape
function cierraFiltro() { $('chips').hidden = true; $('filtro-b').setAttribute('aria-expanded', 'false'); }
$('filtro-b').addEventListener('click', function () {
  var abre = $('chips').hidden; $('chips').hidden = !abre; this.setAttribute('aria-expanded', String(abre));
});
raiz.addEventListener('click', function (e) { if (!e.target.closest('.filtro')) cierraFiltro(); });
raiz.addEventListener('keydown', function (e) { if (e.key === 'Escape') cierraFiltro(); });
$('chips').addEventListener('click', function (e) {
  var b = e.target.closest('.chip'); if (!b) return;
  var esMetal = b.hasAttribute('data-m');
  if (esMetal) st.metal = b.dataset.m; else st.filtro = b.dataset.c;
  $$(esMetal ? '.chip[data-m]' : '.chip:not([data-m])').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
  cierraFiltro();
  aplicaFiltros();
  $('tira').scrollTo({ left: 0, top: 0, behavior: REDUCE ? 'auto' : 'smooth' }); flechas();
});
var ignorarClic = false;
$('tira').addEventListener('click', function (e) {
  var b = e.target.closest('.card'); if (!b) return;
  if (ignorarClic) { ignorarClic = false; return; }
  var k = b.dataset.k;
  if (st.sel.indexOf(k) > -1) quitar(k); else agregar(k, b.querySelector('.card-f'));
});
function flechas() { var t = $('tira'); $('t-izq').disabled = t.scrollLeft < 8; $('t-der').disabled = t.scrollLeft + t.clientWidth > t.scrollWidth - 8; if (typeof deslizaCh === 'function') deslizaCh(); }
$('tira').addEventListener('scroll', flechas, { passive: true });
$('t-izq').addEventListener('click', function () { $('tira').scrollBy({ left: -$('tira').clientWidth * 0.8, behavior: 'smooth' }); });
$('t-der').addEventListener('click', function () { $('tira').scrollBy({ left: $('tira').clientWidth * 0.8, behavior: 'smooth' }); });
$('lista').addEventListener('click', function (e) {
  var q = e.target.closest('[data-quitar]'), m = e.target.closest('[data-mover]');
  if (q) quitar(q.dataset.quitar); else if (m) mover(m.dataset.mover, +m.dataset.d);
});
$('bases').addEventListener('click', function (e) {
  var b = e.target.closest('.base'); if (!b || b.dataset.b === st.base) return;
  var antes = st.talle, primera = !st.base;
  st.base = b.dataset.b; $('paso1').classList.remove('pide');
  $$('.base').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
  pintaTalles(); pintaResumen(true);
  if (G) { G.cambiaBase(); if (st.talle !== antes) G.talle(cm(st.talle)); }
  muestraBase(antes && st.talle !== antes ? 'Esta no tiene el talle ' + antes + ' con stock: pasamos al ' + st.talle : BA[st.base].desc);
  ['base-n', 'base-d', 'base-s'].concat(primera ? ['paso2'] : []).forEach(function (id) { var el = $(id); el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); });
});
$('talles').addEventListener('click', function (e) {
  var b = e.target.closest('.talle'); if (!b || b.disabled || b.dataset.t === st.talle) return;
  st.talle = b.dataset.t; $('paso2').classList.remove('pide'); pintaTalles(); pintaResumen();
  if (G) G.talle(cm(st.talle));
  medida('Largo de la pulsera: ' + st.talle);
});
/* Agregar al carrito: la pulsera (en el talle elegido) y cada charm, un pedido a /comprar/ por producto y uno atrás de otro, igual
   que el botón del tema (add_to_cart, quantity, variant_id, variation[0] en la pulsera y add_to_cart_enhanced=1 para que conteste
   JSON). Si entra todo, festeja y lleva al carrito; si algo no tiene stock, avisa (lo que ya entró no se repite al reintentar). */
var CARRITO = host.getAttribute('data-carrito') || '/comprar/';
var ocupado = false, yaAgregados = {};
function pedir(item) {
  var cuerpo = new URLSearchParams();
  cuerpo.set('add_to_cart', item.id); cuerpo.set('quantity', '1'); cuerpo.set('zipcode', ''); cuerpo.set('variant_id', item.variante);
  if (item.talle) cuerpo.set('variation[0]', item.talle);
  cuerpo.set('add_to_cart_enhanced', '1');
  return fetch(CARRITO, { method: 'POST', credentials: 'same-origin', body: cuerpo.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' } })
    .then(function (r) { return r.json(); }).then(function (j) { return !!(j && j.success); });
}
$('cta').addEventListener('click', function () {
  if (ocupado) return;
  var b = st.base ? BA[st.base] : null, talle = b && b.talles.filter(function (x) { return x[0] === st.talle; })[0];
  if (!b) { pide('paso1', 'Elegí tu pulsera'); return; }
  if (!talle || !(talle[1] > 0)) { pide('paso2', 'Elegí tu talle'); return; }
  var cola = [{ clave: 'base-' + talle[2], nombre: 'la pulsera ' + b.n + ' en ' + talle[0], id: b.id, variante: talle[2], talle: talle[0], esBase: true, base: b.k }];
  st.sel.forEach(function (k) { var c = CH[k]; cola.push({ clave: 'charm-' + c.id, nombre: c.n, id: c.id, variante: c.v, k: k }); });
  cola = cola.filter(function (it) { return !yaAgregados[it.clave]; });
  var bt = $('cta'), t = $('cta-t'), flecha = bt.querySelector('svg'), fallaron = [], bajaLaBase = false;
  function fin() { ocupado = false; bt.disabled = false; $('b-cta').disabled = false; t.textContent = 'Agregar al carrito'; flecha.style.display = ''; }
  ocupado = true; bt.disabled = true; $('b-cta').disabled = true;
  flecha.style.display = 'none'; t.innerHTML = '<span class="spin" style="display:inline-block;vertical-align:-3px;margin-right:10px"></span>Agregando…';
  cola.reduce(function (cadena, item) {
    return cadena.then(function () {
      if (bajaLaBase) return null;          // si la pulsera no entró, no se agregan los charms
      return pedir(item).then(function (ok) { if (ok) { yaAgregados[item.clave] = true; return; } fallaron.push(item); if (item.esBase) bajaLaBase = true; });
    });
  }, Promise.resolve()).then(function () {
    if (!fallaron.length) {
      // lo que antes era una nota fija del panel, ahora aparece recién al agregar (pedido 2026-11-11)
      var nCh = st.sel.length;
      t.textContent = '¡Listo! Te llevamos al carrito'; if (G) G.festejo();
      toast('La pulsera en tu talle' + (nCh ? (nCh === 1 ? ' y tu charm' : ' y tus ' + nCh + ' charms') : '') + ' ya están en tu carrito, con el descuento de la tienda');
      setTimeout(function () { if (window.pntCarrito) { window.pntCarrito.abrir(); } else { window.location.href = CARRITO; } }, 900);   // carrito lateral enseguida (2026-11-12)
      return;
    }
    fin();
    var alCarrito = function () { if (window.pntCarrito) { window.pntCarrito.abrir(); } else { window.location.href = CARRITO; } };
    // (2026-11-15) Lo que la tienda rechazó deja de aparecer ya mismo: el charm sale de la pulsera y de la lista; el talle queda "Sin stock"
    // y, si la pulsera no tiene otro, la pulsera sale de la lista (agota / agotaTalle)
    if (fallaron[0].esBase) {
      var sinPulsera = agotaTalle(fallaron[0].base, fallaron[0].talle);
      toast('No pudimos agregar ' + fallaron[0].nombre + ': no tiene stock. ' + (sinPulsera ? 'Elegí otra pulsera.' : 'Probá con otro talle.'));
    } else {
      fallaron.forEach(function (f) { agota(f.k); });
      toast('No pudimos agregar ' + fallaron.map(function (f) { return f.nombre; }).join(', ') + ' (sin stock). Lo demás ya está en tu carrito.', alCarrito, 'Ver carrito');
    }
  }).catch(function () { fin(); toast('No pudimos conectar con la tienda. Probá de nuevo en un momento.'); });
});
$('b-cta').addEventListener('click', function () { $('cta').click(); });
// "Agregar al carrito" sin pulsera o sin talle: avisa, lleva al paso que falta (en el celular está más abajo) y su número late
function pide(id, msg) {
  var el = $(id); toast(msg);
  el.classList.remove('pide'); void el.offsetWidth; el.classList.add('pide');
  if (!mTotal.matches || !el.getBoundingClientRect().height) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
}

/* Arrastrar una tarjeta (con mouse) hasta la pulsera */
(function () {
  var fan = $('fantasma'), fanImg = fan.querySelector('img'), arr = null;
  $('tira').addEventListener('pointerdown', function (e) {
    var card = e.target.closest('.card'); if (!card || e.pointerType === 'touch' || e.button !== 0) return;
    arr = { card: card, x0: e.clientX, y0: e.clientY, activo: false };
  });
  window.addEventListener('pointermove', function (e) {
    if (!arr) return;
    if (!arr.activo && Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) > 7) {
      if (st.sel.indexOf(arr.card.dataset.k) > -1) { arr = null; return; }
      arr.activo = true; fanImg.src = CH[arr.card.dataset.k].img; fan.hidden = false; arr.card.classList.add('arrastra');
      document.body.style.userSelect = 'none'; if (G) G.cursorTexto('Soltá');
    }
    if (arr.activo) {
      fan.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) rotate(' + Math.max(-12, Math.min(12, (e.clientX - arr.x0) * 0.03)) + 'deg)';
      var r = $('stage').getBoundingClientRect(), dentro = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      $('stage').classList.toggle('soltar', dentro); arr.dentro = dentro;
    }
  });
  window.addEventListener('pointerup', function () {
    if (!arr) return;
    var a = arr; arr = null;
    if (!a.activo) return;
    ignorarClic = true; setTimeout(function () { ignorarClic = false; }, 50);
    document.body.style.userSelect = ''; $('stage').classList.remove('soltar'); a.card.classList.remove('arrastra'); if (G) G.cursorTexto('');
    if (a.dentro) { agregar(a.card.dataset.k, fan); fan.hidden = true; }
    else {
      var r = a.card.getBoundingClientRect();
      fan.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)';
      fan.style.transform = 'translate(' + (r.left + r.width / 2) + 'px,' + (r.top + r.width / 2) + 'px)';
      setTimeout(function () { fan.hidden = true; fan.style.transition = ''; }, 450);
    }
  });
})();

pintaTalles(); pintaResumen(); pintaHint();
// Scroll suave (estilo Lenis) adentro de las columnas que se desplazan solas (lista de charms y panel; pedido 2026-11-11).
// Arreglo 2026-11-12 ("a veces el scroll se vuela y salta para arriba y abajo", sobre todo en la columna derecha): antes tenían
// data-lenis-prevent fijo y, al llegar al tope, la rueda seguía con el scroll NATIVO de la página mientras Lenis se movía: los dos
// se peleaban. Ahora data-lenis-prevent se pone solo mientras la columna de verdad se mueve; en el tope se saca y la página la
// sigue Lenis (suave, sin pelea). Y mientras la columna todavía se está deslizando, la rueda no pasa a la página (no "se vuela").
function scrollInterno(t, mq) {
  if (!t || !mq) return;
  var obj = 0, pos = 0, corre = false, ult = 0;
  function paso(ms) {
    var dt = Math.min(50, ms - ult) || 16; ult = ms;
    pos += (obj - pos) * (1 - Math.pow(1 - 0.09, dt / 16.67));
    if (Math.abs(obj - pos) < 0.4) { pos = obj; corre = false; }
    t.scrollTop = pos;
    if (corre) requestAnimationFrame(paso);
  }
  t.addEventListener('wheel', function (e) {
    if (!mq.matches || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) { t.removeAttribute('data-lenis-prevent'); return; }
    var max = t.scrollHeight - t.clientHeight, base = corre ? obj : t.scrollTop;
    var dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    var nuevo = Math.max(0, Math.min(max, base + dy * 0.85));
    if (nuevo === base && !corre) { t.removeAttribute('data-lenis-prevent'); return; }   // en el tope y quieta: sigue la página (Lenis)
    t.setAttribute('data-lenis-prevent', '');
    e.preventDefault();
    if (!corre) { pos = t.scrollTop; ult = performance.now(); corre = true; requestAnimationFrame(paso); }
    obj = nuevo;
  }, { passive: false });
}
// (2026-11-15, pedido del usuario) Celular: "Deslizá → ••••" (como en "Los más elegidos") en la fila de "Filtrar" de los charms y al lado de
// "La pulsera" (en celular la lista de pulseras es una tira que se desliza: armar3d.css). Los puntitos marcan por dónde va la tira; si entra
// todo (compu, o un filtro con pocos charms) no se muestra. Solo se ve en celular (CSS).
function desliza(caja, tira) {
  if (!caja || !tira) return null;
  var p = caja.querySelector('.desliza-p'), N = 4, pend = false;
  for (var i = 0; i < N; i++) p.appendChild(document.createElement('span'));   // span, no i: '.paso h3 i' es el número del paso
  function marca() {
    pend = false;
    var max = tira.scrollWidth - tira.clientWidth;
    caja.hidden = max < 8;
    var k = max > 0 ? Math.round(Math.min(1, tira.scrollLeft / max) * (N - 1)) : 0;
    for (var j = 0; j < N; j++) p.children[j].classList.toggle('on', j === k);
  }
  tira.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(marca); } }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(marca).observe(tira); else window.addEventListener('resize', marca);
  marca();
  return marca;
}
var deslizaCh = desliza($('desliza-ch'), $('tira'));
desliza($('desliza-ba'), $('bases'));
var mqScroll = window.matchMedia && matchMedia("(min-width: 1100px) and (hover: hover)");
scrollInterno($("tira"), mqScroll);
scrollInterno(raiz.querySelector(".panel"), window.matchMedia && matchMedia("(min-width: 700px) and (hover: hover)"));
// al terminar las animaciones de entrada se les saca la animación (con la placa de video, Chrome a veces dejaba el texto sin pintar)
$$('.vacio').forEach(function (el) { el.addEventListener('animationend', function () { el.style.animation = 'none'; }, { once: true }); });
raiz.addEventListener('animationend', function (e) { if (e.target.classList && e.target.classList.contains('entra')) e.target.classList.remove('entra'); });
requestAnimationFrame(flechas);
window.addEventListener('resize', flechas);

/* ═════════ 3D ═════════
   La escena vive en armar3d-escena.js (data-escena en armar.tpl) y usa three.js 0.187.0 como módulo ES de jsDelivr. import() va
   adentro de new Function: así un navegador viejo que no lo entiende no rompe este archivo (se queda sin 3D, con todo lo demás
   andando). Con ?a3debug en la URL se pueden pedir variantes para comparar (a3env=room, a3tm=agx|aces, a3piso=reflejo, a3nivel,
   a3quieto=1, a3demora=ms: demora el 3D para ver el póster) y la escena deja window.__a3 para las pruebas.
   CUÁNDO SE ARMA (2026-11-12, pedido del usuario: "tarda en cargar, la animación se ve trabada y parece que aparece primero fija y
   luego se vuelve a cargar"). Antes se pedía recién a ~1000 px de la sección y se armaba cuando la página quedaba quieta: con el
   scroll suave eso pasaba ya parado en la sección (ruedita → foto fija → página trabada ~0,5 s → a los 3–4 s el 3D, distinto de la
   foto). Ahora la escena se arma ANTES de llegar: apenas termina la intro del inicio, en pasos chicos y de a un armador por vez
   (secciones.js → PNT_3D). Al llegar ya está lista y la intro de la pulsera arranca cuando el escenario se ve bien (40 %).
   Si igual no llegó a estar lista (conexión lenta, o se bajó de golpe): el escenario espera vacío un momento y, si tarda, aparece
   el póster ubicado como la pulsera del 3D; cuando el 3D está, lo reemplaza en la misma pose, sin que se note, y recién ahí se mueve. */
var V3 = '0.187.0', CDN3 = 'https://cdn.jsdelivr.net/npm/three@' + V3;
/* (2026-11-14) three.js ahora se aloja en la tienda (static/panthera/three/, el mismo archivo que jsDelivr arma con /+esm): no depende de
   un servidor externo, usa el caché del propio sitio y los dos armadores comparten el mismo módulo. Si el archivo propio no cargara,
   cae a jsDelivr como antes. */
var THREE_LOCAL = host.getAttribute('data-three') || '';
function importaThree() { return THREE_LOCAL ? importa(THREE_LOCAL).catch(function () { return importa(CDN3 + '/+esm'); }) : importa(CDN3 + '/+esm'); }
var ESCENA = host.getAttribute('data-escena') || (SRC_JS ? SRC_JS.replace(/armar3d\.js(\?[^#]*)?$/, 'armar3d-escena.js$1') : '');
var DEBUG = null;
try {
  var qs = new URLSearchParams(location.search);
  if (qs.has('a3debug')) DEBUG = { env: qs.get('a3env') || '', tm: qs.get('a3tm') || '', piso: qs.get('a3piso') || '', nivel: qs.get('a3nivel') || '', quieto: qs.get('a3quieto') === '1', demora: Number(qs.get('a3demora')) || 0 };
} catch (e) {}
var importa = null;
try { importa = new Function('u', 'return import(u)'); } catch (e) {}
// Los turnos compartidos con el armador de aritos (secciones.js). Si no estuvieran, todo corre igual, sin esperas.
var P3 = window.PNT_3D || {
  quieta: function () { return 1e9; }, respiro: function () { return new Promise(function (ok) { setTimeout(ok, 0); }); }, calma: function () { return Promise.resolve(); },
  obra: function (d, fn) { var p = null; try { p = fn(); } catch (e) {} return Promise.resolve(p); }, temprano: function () {}, ahorra: function () { return false; }
};
var enVista = false, threeListo = false, pedido = false, arrancado = false, quiere = false, visto = false, cerca = false, adelanta = false, T3 = null;
function distancia() { var r = host.getBoundingClientRect(); return r.bottom < 0 ? -r.bottom : Math.max(0, r.top - (window.innerHeight || 0)); }   // px hasta la pantalla
function urgente() { return quiere || visto; }      // el escenario ya asoma: no hay que dejar pasar cuadros de más
// La distancia de la cámara según la forma del escenario. La usan la escena (el encuadre) y ubicaPoster (más abajo): una sola cuenta.
function fovDe(asp) { return asp < 1 ? 40 : 30; }
// (2026-11-15, pedido: "en mobile acercá la pulsera") movil = el escenario de celular (apaisado y bajo): se acerca la cámara (alto visible 3,2 en vez de 4,3 unidades) y
// se achica el margen de los costados: la pulsera pasa de ocupar el 46 % del ancho a ~64 %
function distCam(asp, movil) { var th = Math.tan(fovDe(asp) * Math.PI / 360), m = !!movil && asp >= 1; return Math.max(m ? 3.6 : 6, (1.5 * 1.06 + (asp < 1 ? 0.5 : (m ? 0.12 : 0.9))) / (th * asp), (m ? 1.32 : 2.15) / th); }   // (2026-11-15, "de más cerca") celular: antes 4,3 · 0,35 · 1,6 (con 1,15 se cortaban los colgantes)
var CTX = {      // lo que la escena necesita de la interfaz
  raiz: raiz, $: $, st: st, DATA: DATA, CH: CH, BA: BA, MAX: MAX, fmt: fmt, cm: cm, REDUCE: REDUCE, debug: DEBUG, addons: {}, baseVista: BASE_VISTA,
  agregar: function (k) { agregar(k); }, quitar: function (k, conDeshacer) { quitar(k, conDeshacer); },
  pintaResumen: function (late) { pintaResumen(late); }, muestraLupa: function (info) { muestraLupa(info); },
  totalFlota: function () { return totalFlota; }, enVista: function () { return enVista; }, sinIntro: function () { return posterVisto; },
  quieta: P3.quieta,      // ms desde el último scroll
  respiro: P3.respiro, calma: P3.calma, urgente: urgente, distCam: distCam, obra: !!window.PNT_3D
};
function sinTresD() {     // sin 3D: queda el póster (la pulsera de ejemplo) con un aviso chico; los charms se eligen igual
  $('nogl').hidden = false; posterVisto = true;
  if (posterVale()) { ubicaPoster(); $('cargando').classList.add('con-poster', 'fallo'); } else $('cargando').classList.add('fallo');   // (2026-11-16) sin un póster con otra pulsera
  st.intro = false; pintaResumen(true);
}
/* El póster: si con el escenario a la vista el 3D todavía no está, espera un momento (GRACIA) con el escenario vacío (casi siempre
   el 3D llega antes y arranca con su intro); si tarda más, aparece la pulsera de ejemplo como foto, ubicada y del tamaño que va a
   tener en el 3D (ubicaPoster), sobre el mismo fondo. Cuando el 3D arranca lo hace sin intro, en la misma pose: la reemplaza sin
   que se note. Ya no hay ruedita ni fondo blanco tapando el escenario. */
var GRACIA = 900, posterVisto = false, posterT = null;
function tresDVisible() { return $('cargando').classList.contains('listo'); }     // ya se dibujó el primer cuadro del 3D
function fotoPoster() { return $('cargando').querySelector('.poster'); }
function ubicaPoster() {
  var im = fotoPoster(), esc = $('stage'), W = esc.clientWidth, H = esc.clientHeight;
  if (!im || !im.naturalWidth || !W || !H) return;
  // la foto es el escenario entero tal como se capturó (herramientas/armador/pruebas/poster.mjs): su forma dice con qué cámara
  var a0 = im.naturalWidth / im.naturalHeight, a = W / H;
  var alto = H * (distCam(a0) * Math.tan(fovDe(a0) * Math.PI / 360)) / (distCam(a, W < 700) * Math.tan(fovDe(a) * Math.PI / 360)), ancho = alto * a0;
  // dónde mira la cámara: en compu (el total flota abajo) la pulsera va 13 % más arriba del centro; si no, 5 %
  var sube0 = /poster-m/.test(im.currentSrc || im.src || '') ? 0.05 : 0.13, sube = totalFlota ? 0.13 : (W < 700 ? 0.12 : 0.05);
  im.style.width = ancho.toFixed(1) + 'px'; im.style.height = alto.toFixed(1) + 'px';
  im.style.left = (W / 2 - ancho / 2).toFixed(1) + 'px'; im.style.top = (H * (0.5 - sube) - alto * (0.5 - sube0)).toFixed(1) + 'px';
}
function pidePoster() { var im = fotoPoster(); if (im && im.loading === 'lazy' && posterVale()) { im.loading = 'eager'; } }     // (en el .tpl va con loading="lazy")
// (2026-11-16) El póster vale si muestra la pulsera de entrada de hoy: la que tenía cuando se sacó (data-poster-de, lo escribe pruebas/poster.mjs)
// tiene que ser la misma (data-entrada). Si un charm de entrada se agotó y se reemplazó, la foto tendría otro charm: no se muestra.
function posterVale() { var de = host.getAttribute('data-poster-de'); return !de || de === host.getAttribute('data-entrada'); }
function muestraPoster() {
  posterT = null; if (tresDVisible() || posterVisto || !posterVale()) return;
  var im = fotoPoster();
  if (!im || !im.complete || !im.naturalWidth) { pidePoster(); posterT = setTimeout(muestraPoster, 250); return; }    // todavía no bajó
  posterVisto = true; ubicaPoster(); $('cargando').classList.add('con-poster');
}
(function () {
  var im = fotoPoster(); if (!im) return;
  im.addEventListener('load', ubicaPoster);
  if (window.ResizeObserver) new ResizeObserver(function () { if (posterVisto && !tresDVisible()) ubicaPoster(); }).observe($('stage'));
})();
function cargaScript(url, global) {
  return new Promise(function (ok, mal) {
    if (window[global]) { ok(); return; }
    var s = document.createElement('script'); s.src = url; s.async = true;
    s.onload = function () { if (window[global]) ok(); else mal(new Error(url + ' vino vacío')); };
    s.onerror = function () { mal(new Error('no cargó ' + url)); };
    document.head.appendChild(s);
  });
}
var CONTORNOS = host.getAttribute('data-contornos') || '';
// Lo que va a hacer falta se empieza a bajar apenas carga la página (solo la descarga: no frena nada), así al terminar la intro
// del inicio ya está. Con ahorro de datos o 2G, o con la pestaña en segundo plano, no se adelanta nada.
function adelantaDescargas() {
  if (!importa || !ESCENA || P3.ahorra() || document.hidden) return;
  var pon = function (rel, href, as) {
    var l = document.createElement('link'); l.rel = rel; l.href = href; if (as) l.as = as;
    try { l.fetchPriority = 'low'; } catch (e) {}
    document.head.appendChild(l);
  };
  try { pon('modulepreload', THREE_LOCAL || (CDN3 + '/+esm')); pon('preload', ESCENA, 'script'); if (CONTORNOS) pon('preload', CONTORNOS, 'script'); } catch (e) {}
}
function pideThree() {
  if (threeListo || pedido) return; pedido = true;
  if (!importa || !ESCENA) { sinTresD(); return; }
  var extras = [];
  if (DEBUG && DEBUG.env === 'room') extras.push(['RoomEnvironment', '/examples/jsm/environments/RoomEnvironment.js']);
  if (DEBUG && DEBUG.piso === 'reflejo') extras.push(['Reflector', '/examples/jsm/objects/Reflector.js']);
  // los contornos de los charms son opcionales: si no llegan, los charms se arman como antes (capas)
  var contornos = CONTORNOS ? cargaScript(CONTORNOS, 'PNT_A3_CONTORNOS').catch(function () {}) : Promise.resolve();
  Promise.all([importaThree(), cargaScript(ESCENA, 'PNT_A3_ESCENA'), contornos].concat(extras.map(function (x) {
    return importa(CDN3 + x[1] + '/+esm').then(function (m) { CTX.addons[x[0]] = m[x[0]]; });
  }))).then(function (r) { return DEBUG && DEBUG.demora ? new Promise(function (ok) { setTimeout(function () { ok(r); }, DEBUG.demora); }) : r; })
    .then(function (r) { T3 = r[0]; threeListo = true; arma(); })
    .catch(function (e) { console.warn('Armá tu pulsera: sin 3D', e); sinTresD(); });
}
/* Armar la escena: en su turno (de a un armador por vez: PNT_3D.obra), con la página quieta si se puede (a lo sumo se espera
   1,5 s; nada si el escenario ya asoma) y, adentro de la escena, en pasos chicos. Queda lista sin dibujar nada a la vista; el primer
   cuadro (y la intro) esperan a que el escenario se vea (G.empieza). Después, cuando ya se armó también la de los aritos, se
   adelantan los cierres de las otras pulseras (G.extras). */
function buenMomento(maxMs) {      // la página quieta (a lo sumo maxMs), o enseguida si el escenario ya asoma
  var desde = performance.now();
  return new Promise(function (ok) {
    (function mira() { if (urgente() || P3.quieta() >= 220 || performance.now() - desde >= maxMs) ok(); else setTimeout(mira, 60); })();
  });
}
function arma() {
  if (arrancado || !threeListo || !(cerca || quiere || adelanta)) return;
  arrancado = true;
  P3.obra(distancia, function () {
    return buenMomento(1500).then(function () { return P3.respiro(urgente()); }).then(function () {
      try { G = window.PNT_A3_ESCENA(T3, CTX); } catch (err) { console.warn(err); sinTresD(); return null; }
      if (visto) G.empieza();
      return G.lista;
    });
  }).then(function () {
    if (G && G.extras && window.PNT_3D) P3.obra(function () { return 1e7; }, function () { return G.extras(); });
  });
}
function arranca() {      // el escenario ya se ve bien (40 %)
  visto = true; quiere = true;
  if (!threeListo) { pideThree(); return; }
  if (G) G.empieza(); else arma();
}
var totalEl = raiz.querySelector('.total'), totalRanura = $('total-ranura'), mTotal = window.matchMedia ? matchMedia('(min-width: 1280px)') : { matches: true }, totalFlota = true;
function ubicaTotal() {      // compu: tarjeta abajo a la derecha del escenario · tablet y celular: en el panel (su ranura)
  totalFlota = mTotal.matches; (totalFlota ? $('stage') : totalRanura).appendChild(totalEl);
}
ubicaTotal(); if (mTotal.addEventListener) mTotal.addEventListener('change', ubicaTotal);
if ('IntersectionObserver' in window) {
  adelantaDescargas();
  P3.temprano(function () { adelanta = true; pideThree(); arma(); pideFotos(); });      // (2026-11-15) las fotos de las tarjetas también, apenas carga el inicio: al llegar bajando rápido aparecían vacías ~0,9 s      // terminó la intro del inicio: se adelanta el armado
  new IntersectionObserver(function (es) {
    cerca = es[es.length - 1].isIntersecting;
    if (cerca) { pideThree(); pideFotos(); arma(); if (!G || !G.estaLista || !G.estaLista()) pidePoster(); }
  }, { rootMargin: '1500px 0px' }).observe(host);
  new IntersectionObserver(function (es) {
    var e = es[es.length - 1]; enVista = e.isIntersecting;
    if (enVista && !quiere) { quiere = true; pideThree(); arma(); }      // asoma: lo que falte, ya
    // (2026-11-15) arranca con el escenario visible al 2 % (era 40 %): entre el 1 y el 40 % se veía la caja vacía ~0,25 s al llegar bajando
    if (e.intersectionRatio >= 0.02 || (e.intersectionRect && e.intersectionRect.height >= (window.innerHeight || 1e9) * 0.5)) {
      arranca(); if (!tresDVisible() && !posterT && !posterVisto) posterT = setTimeout(muestraPoster, GRACIA);
    }
    if (enVista && G) G.despierta();
  }, { threshold: [0, 0.02, 0.1, 0.25, 0.4, 0.6] }).observe($('stage'));
  // celular: la barra fija del total aparece solo mientras se ve el armador y no se ve el total de abajo
  var hostVisto = false, totalVisto = false, celu = window.matchMedia ? matchMedia('(max-width: 699px)') : { matches: false };
  var barra = function () { var on = hostVisto && !totalVisto && celu.matches; host.classList.toggle('barra-on', on); document.documentElement.classList.toggle('pnt-a3-barra', on); };
  new IntersectionObserver(function (es) { hostVisto = es[es.length - 1].isIntersecting; barra(); }).observe(host);
  new IntersectionObserver(function (es) { totalVisto = es[es.length - 1].isIntersecting; barra(); }, { threshold: 0.4 }).observe(totalEl);
  if (celu.addEventListener) celu.addEventListener('change', barra);
} else { enVista = true; quiere = true; pideFotos(); arranca(); }
})();
