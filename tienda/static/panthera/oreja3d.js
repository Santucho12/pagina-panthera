/* Panthera — "Armá tu oreja" (2026-11-11). La interfaz es la de "Armá tu pulsera" (armar3d.js): tarjetas de la tienda, lupa,
   toasts con "Deshacer", arrastrar a la escena, total con transferencia y cuotas, barra fija en el celular. Cambia lo propio de una
   oreja: en vez de base y talle, "¿cuántos agujeros tenés?", y "Tu combinación" va por agujero (1.º, 2.º, 3.º y el ear cuff).
   El mismo archivo sirve para el prototipo (artefacto) y para la tienda (static/panthera/oreja3d.js): si el componente trae
   data-carrito, "Agregar al carrito" es real (un POST a /comprar/ por aro, como el armador de pulseras); si no, se simula.
   Los datos (ids, variantes, precios, stock) son los de la tienda al 2026-11-11, escritos a mano (oreja.tpl / index.html). */
(function () {
'use strict';
var host = document.querySelector('[data-pnt-or]');
if (!host || !host.attachShadow || !('content' in document.createElement('template'))) return;
var molde = host.querySelector('template');
if (!molde || host.shadowRoot) return;
var raiz = host.attachShadow({ mode: 'open' });
raiz.appendChild(molde.content.cloneNode(true));
(function () {
  var link = raiz.querySelector('link[rel="stylesheet"]'), hecho = false;
  function listo() { if (!hecho) { hecho = true; host.classList.add('listo'); } }
  if (!link) { listo(); return; }
  link.addEventListener('load', listo); link.addEventListener('error', listo); setTimeout(listo, 4000);
})();
var num = function (v) { return Number(v) || 0; };
// (2026-11-16, a mano: repetir si se regenera con construye_tienda.py) Lo que la tienda rechaza al agregarlo queda anotado 12 h en este navegador
// (la misma lista que "Armá tu pulsera", con 'or:'): al volver a entrar ya no aparece y, si era de los aritos de entrada, se reemplaza.
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
var AGOTADOS = agotadosGuardados('or');
var TODOS_AROS = Array.prototype.map.call(raiz.querySelectorAll('[data-or-aros] li'), function (li) {
  var d = li.dataset;
  // arg: la argolla medida en la foto (fracciones): arriba, abajo, corte (donde empieza el dije), x del cuello, grosor, metal, pavé
  var g = (d.arg || '').split(','), arg = g.length >= 7 ? { arriba: num(g[0]), abajo: num(g[1]), corte: num(g[2]), cxCorte: num(g[3]), banda: num(g[4]), metal: g[5], pave: g[6] === '1' } : null;
  return { k: d.k, n: d.n, cat: d.cat, id: d.id, v: d.v, p: num(d.p), a: num(d.a), st: num(d.st), tipo: d.tipo, asp: num(d.asp), ag: num(d.ag), cx: num(d.cx), alto: num(d.alto), img: d.img, hd: d.hd || '', hdn: d.hdn || '', url: d.url, arg: arg };
});
var DATA = { aros: TODOS_AROS.filter(function (c) { return c.st > 0 && !AGOTADOS[c.k]; }) };   // (2026-11-15, a mano: repetir si se regenera con construye_tienda.py) sin stock = no aparece (pedido: "si un arito… no está disponible, no debe aparecer")
var TEMA_AR = {}; TODOS_AROS.forEach(function (c) { TEMA_AR[c.k] = { cat: c.cat, tipo: c.tipo }; });   // también los sin stock: para el reemplazo de uno de entrada
if (!DATA.aros.length) return;
var AR = {}; DATA.aros.forEach(function (c) { AR[c.k] = c; });
host.classList.add('anima');
var fmt = function (n) { return '$' + Math.round(n).toLocaleString('es-AR'); };
var fmtc = function (n) { var e = Math.floor(n + 1e-9), c = Math.round((n - e) * 100); if (c === 100) { e++; c = 0; } return '$' + e.toLocaleString('es-AR') + (c ? ',' + (c < 10 ? '0' : '') + c : ''); };
var TARJETA = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg>';
function precios(p, a, chico) {
  return '<span class="p-lista">' + (a > p ? '<s>' + fmt(a) + '</s>' : '') + '<span class="ah">Ahora </span>' + fmt(p) + '</span>' +
    '<span class="p-transf"><b>' + fmt(p * 0.7) + '</b><span>Con transferencia</span></span>' +
    (chico ? '' : '<span class="p-cuotas">' + TARJETA + '<span>3 cuotas sin interés de ' + fmtc(p / 3) + '</span></span>');
}
var $ = function (id) { return raiz.getElementById(id); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || raiz).querySelectorAll(s)); };
var LOBULO = ['l1', 'l2', 'l3'], TODOS = ['l1', 'l2', 'l3', 'cuff'];
var NOMBRE = { l1: '1.er arito', l2: '2.º arito', l3: '3.er arito', cuff: 'Ear cuff' };
var st = { huecos: 3, pos: { l1: null, l2: null, l3: null, cuff: null }, activo: 'l1', filtro: '', intro: true, ejemplo: false };
var G = null;
function donde(k) { for (var i = 0; i < TODOS.length; i++) if (st.pos[TODOS[i]] === k) return TODOS[i]; return null; }
function visible(id) { return id === 'cuff' || +id.slice(1) <= st.huecos; }
function libres() { return LOBULO.filter(function (id) { return visible(id) && !st.pos[id]; }); }
function puestos() { return TODOS.filter(function (id) { return visible(id) && st.pos[id]; }); }

/* ═════════ Interfaz ═════════ */
var CATS = ['Todos', 'Disney', 'Cielo', 'Brillos', 'Clásicos', 'Plateados', 'Ear cuffs'];
$('chips').innerHTML = CATS.map(function (c, i) {
  var n = i ? DATA.aros.filter(function (x) { return x.cat === c; }).length : DATA.aros.length;
  return n ? '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-c="' + (i ? c : '') + '">' + c + '<small>' + n + '</small></button>' : '';
}).join('');
$('dock-s').textContent = DATA.aros.length + ' aros solitarios y ear cuffs · tocalos o arrastralos a la oreja';
var MAS = '<svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10"/></svg>';
$('tira').innerHTML = DATA.aros.map(function (c) {
  return '<button type="button" class="card" data-k="' + c.k + '" data-cat="' + c.cat + '" aria-pressed="false" aria-label="' + c.n + ', ' + fmt(c.p) + '">' +
    '<span class="card-f"><img class="cg" data-src="' + c.img + '" alt="" draggable="false" decoding="async">' + (c.st === 1 ? '<span class="ult">Última</span>' : '') +
    (c.a > c.p ? '<span class="off">-' + Math.round((1 - c.p / c.a) * 100) + '%</span>' : '') +
    '<span class="mas">' + MAS + '</span><span class="en">En tu oreja</span></span>' +
    '<span class="card-i"><span class="card-n">' + c.n + '</span><span class="p-linea"></span>' + precios(c.p, c.a) + '</span></button>';
}).join('');
var fotosIO = null;
function ponFoto(im) {
  if (!im.dataset.src) return;
  function listo(e) { im.classList.remove('cg'); var card = im.closest('.card'); if (e.type === 'load' && G && G.precarga && card) G.precarga(card.dataset.k); }
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
function pintaHuecos() {
  $('huecos').innerHTML = [1, 2, 3].map(function (n) {
    return '<button type="button" class="talle" data-h="' + n + '" aria-pressed="' + (n === st.huecos) + '">' + n + '<small>' + (n === 1 ? 'arito' : 'aritos') + '</small></button>';
  }).join('');
}
var FL_ARR = '<svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>', FL_ABA = '<svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></svg>', CRUZ = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function pintaResumen(late) {
  var t = 0, a = 0, ids = puestos(), n = ids.length;
  ids.forEach(function (id) { var c = AR[st.pos[id]]; t += c.p; a += c.a; });
  $('t-lista').innerHTML = n ? (a > t ? '<s>' + fmt(a) + '</s>' : '') + 'Ahora ' + fmt(t) : 'Todavía sin aros';
  rueda($('t-tr'), t * 0.7, late); $('t-cuota').textContent = fmtc(t / 3);
  var nAros = ids.filter(function (id) { return id !== 'cuff'; }).length, cuff = !!(st.pos.cuff);
  $('t-lbl').textContent = n ? 'Tu oreja: ' + (nAros ? nAros + (nAros === 1 ? ' aro' : ' aros') : '') + (nAros && cuff ? ' + ' : '') + (cuff ? 'ear cuff' : '') : 'Tu oreja';
  host.classList.toggle('sin-total', !n);
  $('cuenta').textContent = n; $('cuenta-l').textContent = n === 1 ? 'pieza' : 'piezas';
  $('lista').innerHTML = TODOS.filter(visible).map(function (id) {
    var k = st.pos[id], act = st.activo === id;
    if (!k) return '<li class="vacia' + (act ? ' activa' : '') + '" data-elige="' + id + '"><span class="hueco-i" aria-hidden="true"></span><span class="n"><em>' + NOMBRE[id] + '</em>' +
      (act ? (id === 'cuff' ? 'Elegí un ear cuff de la lista' : 'Elegí un aro de la lista') : (id === 'cuff' ? 'Libre · sin perforación' : 'Libre · tocá para elegirlo')) + '</span></li>';
    var c = AR[k], i = LOBULO.indexOf(id), vis = LOBULO.filter(visible);
    return '<li data-pos="' + id + '"><img src="' + c.img + '" alt=""><span class="n"><em>' + NOMBRE[id] + '</em>' + c.n + '<small>' + fmt(c.p) + ' · <i>' + fmt(c.p * 0.7) + ' c/ transf.</i></small></span><span class="acc">' +
      (id === 'cuff' ? '' :
        '<button type="button" data-mover="' + id + '" data-d="-1" aria-label="Pasar ' + c.n + ' al lugar de arriba en la lista"' + (i <= 0 ? ' disabled' : '') + '>' + FL_ARR + '</button>' +
        '<button type="button" data-mover="' + id + '" data-d="1" aria-label="Pasar ' + c.n + ' al lugar de abajo en la lista"' + (i >= vis.length - 1 ? ' disabled' : '') + '>' + FL_ABA + '</button>') +
      '<button type="button" data-quitar="' + k + '" aria-label="Sacar ' + c.n + '">' + CRUZ + '</button></span></li>';
  }).join('');
  $('vacio').hidden = n > 0 || !G || st.intro;
  $('b-total').textContent = fmt(t); rueda($('b-tr'), t * 0.7, late);
  $('paso2').classList.toggle('hecho', n > 0); $('paso2').hidden = !n;      // sin aros, no hay combinación que mostrar
  $$('.card').forEach(function (el) { el.setAttribute('aria-pressed', String(!!donde(el.dataset.k))); });
  if (late) {
    var g = $('t-tr'); g.classList.remove('late'); void g.offsetWidth; g.classList.add('late');
    var c2 = $('cuenta'); c2.classList.remove('late'); void c2.offsetWidth; c2.classList.add('late');
  }
}
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
$('hint').innerHTML = '<kbd>⇆</kbd> Arrastrá para hamacarlos · tocá un aro para verlo de cerca o un lugar libre para elegirlo';
var lupaEspera;
function muestraLupa(info) {
  var l = $('lupa'), sacar = $('lupa-sacar');
  if (!info) { l.classList.remove('ve'); clearTimeout(lupaEspera); lupaEspera = setTimeout(function () { l.hidden = true; }, 380); return; }
  clearTimeout(lupaEspera); l.hidden = false;
  var c = AR[info.k];
  $('lupa-t').textContent = c.cat; $('lupa-n').textContent = c.n;
  $('lupa-d').textContent = (c.tipo === 'cuff' ? 'Ear cuff · sin perforación' : 'Aro solitario · se vende por unidad') + ' · ' + NOMBRE[info.hueco].toLowerCase() + (c.st === 1 ? ' · última unidad' : '');
  $('lupa-p').innerHTML = precios(c.p, c.a); sacar.dataset.k = info.k;
  void l.offsetWidth; l.classList.add('ve');
  try { $('lupa-x').focus({ preventScroll: true }); } catch (e) {}
}
$('lupa-x').addEventListener('click', function () { if (G && G.cierraLupa) G.cierraLupa(); else muestraLupa(null); });
$('lupa-sacar').addEventListener('click', function () { var k = this.dataset.k; if (k) quitar(k); if (G && G.cierraLupa) G.cierraLupa(); });
var toastT, deshacer = null;
function toast(msg, undo, etq) {
  $('toast-t').textContent = msg; $('toast-b').hidden = !undo; $('toast-b').textContent = etq || 'Deshacer'; deshacer = undo || null;
  $('toast').classList.add('ve'); clearTimeout(toastT); toastT = setTimeout(function () { $('toast').classList.remove('ve'); deshacer = null; }, undo ? 5000 : 3600);
}
$('toast-b').addEventListener('click', function () { if (deshacer) deshacer(); $('toast').classList.remove('ve'); deshacer = null; });
var medidaT;
function medida(txt) { var m = $('medida'); m.textContent = txt; m.classList.add('ve'); clearTimeout(medidaT); medidaT = setTimeout(function () { m.classList.remove('ve'); }, 2100); }
function foto() { return JSON.parse(JSON.stringify(st.pos)); }
function restaura(antes) {     // "Deshacer": vuelve a dejar la oreja como estaba (saca, mueve o vuelve a poner cada aro)
  var ahora = foto(), enAntes = {};
  TODOS.forEach(function (id) { if (antes[id]) enAntes[antes[id]] = id; });
  TODOS.forEach(function (id) { var k = ahora[id]; if (k && !enAntes[k] && G) G.quitar(k); });
  TODOS.forEach(function (id) {
    var k = antes[id]; if (!k) return;
    var d = null; TODOS.forEach(function (j) { if (ahora[j] === k) d = j; });
    if (d !== id && G) { if (d) G.mueve(k, id); else G.agregar(k, null, id); }
  });
  st.pos = antes; st.activo = libres()[0] || st.activo; pintaResumen(true);
}
function siguienteActivo(desde) {
  var l = libres(); if (l.length) return l[0];
  return desde && desde !== 'cuff' ? desde : 'l1';
}
// Poner un aro: va al agujero elegido (el activo) o al primero libre; si ya había otro, lo reemplaza (con "Deshacer")
function colocar(k, hueco, desde) {
  var c = AR[k]; st.ejemplo = false;
  if (c.tipo === 'cuff') hueco = 'cuff';
  else if (!hueco || hueco === 'cuff' || !visible(hueco)) hueco = st.activo && st.activo !== 'cuff' && visible(st.activo) && !st.pos[st.activo] ? st.activo : (libres()[0] || (st.activo !== 'cuff' && visible(st.activo) ? st.activo : 'l1'));
  if (st.pos[hueco] === k) return;
  var antes = foto(), previo = st.pos[hueco], estaba = donde(k);
  if (estaba) st.pos[estaba] = null;
  st.pos[hueco] = k;
  if (G) { if (previo) G.quitar(previo); if (estaba) G.mueve(k, hueco); else G.agregar(k, desde, hueco); }
  st.activo = siguienteActivo(hueco);
  pintaResumen(true);
  if (previo) toast('Cambiaste ' + AR[previo].n + ' por ' + c.n, function () { restaura(antes); });
  else medida(c.n + ' · ' + NOMBRE[hueco].toLowerCase());
}
function quitar(k, conDeshacer) {
  var id = donde(k); if (!id) return;
  var antes = foto(); st.ejemplo = false;
  st.pos[id] = null; st.activo = id; pintaResumen(true); if (G) G.quitar(k);
  if (conDeshacer !== false) toast('Sacaste ' + AR[k].n, function () { restaura(antes); });
}
// (2026-11-15, a mano: repetir si se regenera con construye_tienda.py) Un aro que la tienda rechaza al agregarlo (se agotó después de la última
// actualización de oreja.tpl) deja de aparecer ya mismo: sale de la oreja y de la lista, y se recuentan los temas (pedido: "sin stock, no debe aparecer").
function agota(k) {
  if (!AR[k]) return;
  AR[k].st = 0; quitar(k, false); guardaAgotado('or', k);
  DATA.aros = DATA.aros.filter(function (x) { return x.k !== k; });
  var card = $('tira').querySelector('.card[data-k="' + k + '"]'); if (card) card.remove();
  $$('.chip', $('chips')).forEach(function (b) {
    var n = b.dataset.c ? DATA.aros.filter(function (x) { return x.cat === b.dataset.c; }).length : DATA.aros.length, s = b.querySelector('small');
    if (s) s.textContent = n;
    b.hidden = !n;
  });
  $('dock-s').textContent = DATA.aros.length + ' aros solitarios y ear cuffs · tocalos o arrastralos a la oreja';
}
function mover(id, d) {
  var vis = LOBULO.filter(visible), i = vis.indexOf(id), j = vis[i + d]; if (i < 0 || !j) return;
  st.ejemplo = false;
  var a = st.pos[id], b = st.pos[j]; st.pos[id] = b; st.pos[j] = a;
  if (G) { if (a) G.mueve(a, j); if (b) G.mueve(b, id); }
  pintaResumen(); medida(AR[a].n + ' · ' + NOMBRE[j].toLowerCase());
  var bt = $$('[data-mover="' + j + '"][data-d="' + d + '"]')[0]; if (bt && !bt.disabled) bt.focus();
}
function activa(id) {
  if (!visible(id)) return;
  st.activo = id; pintaResumen();
  medida(st.pos[id] ? NOMBRE[id] + ': tocá otro aro para cambiarlo' : (id === 'cuff' ? 'Elegí un ear cuff de la lista' : 'Elegí un aro para el ' + NOMBRE[id].toLowerCase()));
  if (id === 'cuff') { var ch = $$('.chip').filter(function (b) { return b.dataset.c === 'Ear cuffs'; })[0]; if (ch && st.filtro !== 'Ear cuffs') ch.click(); }
  else if (st.filtro === 'Ear cuffs') { var to = $$('.chip')[0]; if (to) to.click(); }
}
function cambiaHuecos(n) {
  if (n === st.huecos) return;
  var antes = foto(), sacados = [], previo = st.huecos;
  st.huecos = n;
  LOBULO.forEach(function (id) { if (!visible(id) && st.pos[id]) { sacados.push(st.pos[id]); if (G) G.quitar(st.pos[id]); st.pos[id] = null; } });
  if (!visible(st.activo)) st.activo = libres()[0] || 'l1';
  else if (!st.pos[st.activo] && st.activo !== 'cuff') st.activo = libres()[0] || st.activo;
  pintaHuecos(); pintaResumen(true); if (G) G.huecos();
  if (sacados.length) { var h0 = antes; toast('Sacamos ' + sacados.map(function (k) { return AR[k].n; }).join(' y ') + ': ahora son ' + n + (n === 1 ? ' arito' : ' aritos'), function () { st.huecos = previo; pintaHuecos(); restaura(h0); if (G) G.huecos(); }); }
  else medida(n === 1 ? 'Un arito en el lóbulo' : n + ' aritos en el lóbulo');
}

// El filtro es un botón que abre la lista de temas (igual que en el armador de pulseras); se cierra al elegir, al tocar afuera o con Escape
function cierraFiltro() { $('chips').hidden = true; $('filtro-b').setAttribute('aria-expanded', 'false'); }
$('filtro-b').addEventListener('click', function () {
  var abre = $('chips').hidden; $('chips').hidden = !abre; this.setAttribute('aria-expanded', String(abre));
});
raiz.addEventListener('click', function (e) { if (!e.target.closest('.filtro')) cierraFiltro(); });
raiz.addEventListener('keydown', function (e) { if (e.key === 'Escape') cierraFiltro(); });
$('chips').addEventListener('click', function (e) {
  var b = e.target.closest('.chip'); if (!b) return;
  st.filtro = b.dataset.c;
  $$('.chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
  $('filtro-t').textContent = st.filtro ? st.filtro : 'Filtrar'; $('filtro-b').classList.toggle('activo', !!st.filtro);
  cierraFiltro();
  $$('.card').forEach(function (el) { el.hidden = !!st.filtro && el.dataset.cat !== st.filtro; });
  $('tira').scrollTo({ left: 0, top: 0, behavior: 'smooth' }); flechas();
});
var ignorarClic = false;
$('tira').addEventListener('click', function (e) {
  var b = e.target.closest('.card'); if (!b) return;
  if (ignorarClic) { ignorarClic = false; return; }
  var k = b.dataset.k;
  if (donde(k)) quitar(k); else colocar(k, null, b.querySelector('.card-f'));
});
function flechas() { var t = $('tira'); $('t-izq').disabled = t.scrollLeft < 8; $('t-der').disabled = t.scrollLeft + t.clientWidth > t.scrollWidth - 8; }
$('tira').addEventListener('scroll', flechas, { passive: true });
$('t-izq').addEventListener('click', function () { $('tira').scrollBy({ left: -$('tira').clientWidth * 0.8, behavior: 'smooth' }); });
$('t-der').addEventListener('click', function () { $('tira').scrollBy({ left: $('tira').clientWidth * 0.8, behavior: 'smooth' }); });
$('lista').addEventListener('click', function (e) {
  var q = e.target.closest('[data-quitar]'), m = e.target.closest('[data-mover]'), v = e.target.closest('[data-elige]'), f = e.target.closest('li[data-pos]');
  if (q) quitar(q.dataset.quitar); else if (m) mover(m.dataset.mover, +m.dataset.d); else if (v) activa(v.dataset.elige); else if (f) activa(f.dataset.pos);
});
$('huecos').addEventListener('click', function (e) { var b = e.target.closest('.talle'); if (b) cambiaHuecos(+b.dataset.h); });

/* Agregar al carrito. En la tienda (data-carrito): un pedido a /comprar/ por aro, uno atrás de otro, igual que el armador de
   pulseras y el botón del tema (add_to_cart, quantity, variant_id y add_to_cart_enhanced=1 para que conteste JSON). Si entra todo,
   festeja y lleva al carrito; si alguno no tiene stock, avisa (lo que ya entró no se repite al reintentar). En el prototipo, se simula. */
var CARRITO = host.getAttribute('data-carrito') || '';
var ocupado = false, yaAgregados = {};
function pedir(item) {
  var cuerpo = new URLSearchParams();
  cuerpo.set('add_to_cart', item.id); cuerpo.set('quantity', '1'); cuerpo.set('zipcode', ''); cuerpo.set('variant_id', item.variante);
  cuerpo.set('add_to_cart_enhanced', '1');
  return fetch(CARRITO, { method: 'POST', credentials: 'same-origin', body: cuerpo.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' } })
    .then(function (r) { return r.json(); }).then(function (j) { return !!(j && j.success); });
}
$('cta').addEventListener('click', function () {
  if (ocupado) return;
  var ids = puestos();
  if (!ids.length) { toast('Sumá al menos un aro'); return; }
  var bt = $('cta'), t = $('cta-t'), bolsa = bt.querySelector('svg');
  function fin() { ocupado = false; bt.disabled = false; $('b-cta').disabled = false; bolsa.style.display = ''; t.textContent = 'Agregar al carrito'; }
  ocupado = true; bt.disabled = true; $('b-cta').disabled = true; bolsa.style.display = 'none';
  t.innerHTML = '<span class="spin" style="display:inline-block;vertical-align:-3px;margin-right:10px"></span>Agregando…';
  if (!CARRITO) {
    setTimeout(function () {
      t.textContent = '¡Listo!'; if (G) G.festejo();
      toast('Prototipo: en la tienda, ' + (ids.length === 1 ? 'la pieza entra' : 'las ' + ids.length + ' piezas entran') + ' juntas a tu carrito y te lleva a pagar.');
      setTimeout(fin, 2600);
    }, 900);
    return;
  }
  var cola = ids.map(function (id) { var c = AR[st.pos[id]]; return { clave: 'aro-' + c.id, nombre: c.n, id: c.id, variante: c.v, k: c.k }; })
    .filter(function (it) { return !yaAgregados[it.clave]; });
  var fallaron = [];
  cola.reduce(function (cadena, item) {
    return cadena.then(function () { return pedir(item).then(function (ok) { if (ok) yaAgregados[item.clave] = true; else fallaron.push(item); }); });
  }, Promise.resolve()).then(function () {
    if (!fallaron.length) {
      // lo que antes era una nota fija del panel, ahora aparece recién al agregar (como en el armador de pulseras, 2026-11-11)
      t.textContent = '¡Listo! Te llevamos al carrito'; if (G) G.festejo();
      toast((ids.length === 1 ? 'Tu pieza ya está' : 'Tus ' + ids.length + ' piezas ya están') + ' en tu carrito (se venden por unidad), con el descuento de la tienda');
      setTimeout(function () { if (window.pntCarrito) { window.pntCarrito.abrir(); } else { window.location.href = CARRITO; } }, 900);   // carrito lateral enseguida (2026-11-12; a mano: si se regenera con construye_tienda.py, repetirlo)
      return;
    }
    fin();
    var alCarrito = function () { if (window.pntCarrito) { window.pntCarrito.abrir(); } else { window.location.href = CARRITO; } };
    fallaron.forEach(function (f) { agota(f.k); });   // (2026-11-15) lo rechazado deja de aparecer
    toast('No pudimos agregar ' + fallaron.map(function (f) { return f.nombre; }).join(', ') + ' (sin stock).' + (fallaron.length < cola.length ? ' Lo demás ya está en tu carrito.' : ''),
      fallaron.length < cola.length ? alCarrito : null, 'Ver carrito');
  }).catch(function () { fin(); toast('No pudimos conectar con la tienda. Probá de nuevo en un momento.'); });
});
$('b-cta').addEventListener('click', function () { $('cta').click(); });

/* Arrastrar una tarjeta (con mouse) hasta un agujero de la oreja */
(function () {
  var fan = $('fantasma'), fanImg = fan.querySelector('img'), arr = null;
  $('tira').addEventListener('pointerdown', function (e) {
    var card = e.target.closest('.card'); if (!card || e.pointerType === 'touch' || e.button !== 0) return;
    arr = { card: card, x0: e.clientX, y0: e.clientY, activo: false };
  });
  window.addEventListener('pointermove', function (e) {
    if (!arr) return;
    if (!arr.activo && Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) > 7) {
      arr.activo = true; fanImg.src = AR[arr.card.dataset.k].img; fan.hidden = false; arr.card.classList.add('arrastra');
      document.body.style.userSelect = 'none';
    }
    if (arr.activo) {
      fan.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) rotate(' + Math.max(-12, Math.min(12, (e.clientX - arr.x0) * 0.03)) + 'deg)';
      var r = $('stage').getBoundingClientRect(), dentro = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      $('stage').classList.toggle('soltar', dentro); arr.dentro = dentro;
      arr.hueco = G && dentro ? G.resalta(e.clientX, e.clientY, arr.card.dataset.k) : null;
    }
  });
  window.addEventListener('pointerup', function () {
    if (!arr) return;
    var a = arr; arr = null;
    if (!a.activo) return;
    ignorarClic = true; setTimeout(function () { ignorarClic = false; }, 50);
    document.body.style.userSelect = ''; $('stage').classList.remove('soltar'); a.card.classList.remove('arrastra'); if (G) G.resalta(null);
    if (a.dentro) { colocar(a.card.dataset.k, a.hueco, fan); fan.hidden = true; }
    else {
      var r = a.card.getBoundingClientRect();
      fan.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)';
      fan.style.transform = 'translate(' + (r.left + r.width / 2) + 'px,' + (r.top + r.width / 2) + 'px)';
      setTimeout(function () { fan.hidden = true; fan.style.transition = ''; }, 450);
    }
  });
})();

pintaHuecos(); pintaResumen();
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
scrollInterno($('tira'), window.matchMedia && matchMedia('(min-width: 1100px) and (hover: hover)'));
scrollInterno(raiz.querySelector('.panel'), window.matchMedia && matchMedia('(min-width: 1100px) and (hover: hover)'));
raiz.addEventListener('animationend', function (e) { if (e.target.classList && e.target.classList.contains('entra')) e.target.classList.remove('entra'); });
requestAnimationFrame(flechas); window.addEventListener('resize', flechas);

/* ═════════ 3D: three.js 0.187.0 de jsDelivr (el mismo del armador de pulseras) y la escena (data-escena) ═════════
   import() va adentro de new Function: así un navegador viejo que no lo entiende no rompe este archivo (queda sin 3D, con todo lo
   demás andando). Con ?ordebug en la URL la escena deja window.__or para las pruebas (?ordemora=ms demora el 3D para ver el póster).
   CUÁNDO SE ARMA (2026-11-12, igual que en armar3d.js; pedido del usuario: "tarda en cargar, la animación se ve trabada y parece que
   aparece primero fija y luego se vuelve a cargar"): la escena se arma ANTES de llegar, apenas termina la intro del inicio, en pasos
   chicos y de a un armador por vez (secciones.js → PNT_3D). Al llegar ya está lista y la intro arranca cuando el escenario se ve bien
   (40 %). Si igual no llegó a estar lista: el escenario espera un momento y, si tarda, aparece el póster (la oreja con los aros de
   ejemplo), ubicado igual que la cámara del 3D; cuando el 3D está, lo reemplaza en la misma pose, sin que se note. */
var CDN3 = 'https://cdn.jsdelivr.net/npm/three@0.187.0';
/* (2026-11-14) three.js ahora se aloja en la tienda (static/panthera/three/, el mismo archivo que jsDelivr arma con /+esm): no depende de
   un servidor externo, usa el caché del propio sitio y los dos armadores comparten el mismo módulo. Si el archivo propio no cargara,
   cae a jsDelivr como antes. */
var THREE_LOCAL = host.getAttribute('data-three') || '';
function importaThree() { return THREE_LOCAL ? importa(THREE_LOCAL).catch(function () { return importa(CDN3 + '/+esm'); }) : importa(CDN3 + '/+esm'); }
var DEBUG = null;
try { var qs = new URLSearchParams(location.search); if (qs.has('ordebug')) DEBUG = { poster: qs.has('poster'), demora: Number(qs.get('ordemora')) || 0 }; } catch (e) {}
var importa = null;
try { importa = new Function('u', 'return import(u)'); } catch (e) {}
// Los turnos compartidos con el armador de pulseras (secciones.js). Si no estuvieran, todo corre igual, sin esperas.
var P3 = window.PNT_3D || {
  quieta: function () { return 1e9; }, respiro: function () { return new Promise(function (ok) { setTimeout(ok, 0); }); }, calma: function () { return Promise.resolve(); },
  obra: function (d, fn) { var p = null; try { p = fn(); } catch (e) {} return Promise.resolve(p); }, temprano: function () {}, ahorra: function () { return false; }
};
var enVista = false, threeListo = false, pedido = false, arrancado = false, quiere = false, visto = false, cerca = false, adelanta = false, T3 = null;
function distancia() { var r = host.getBoundingClientRect(); return r.bottom < 0 ? -r.bottom : Math.max(0, r.top - (window.innerHeight || 0)); }   // px hasta la pantalla
function urgente() { return quiere || visto; }      // el escenario ya asoma: no hay que dejar pasar cuadros de más
// (2026-11-16, pedido: "siempre tiene que aparecer como mínimo… 2 aritos por defecto. En caso de que se venda alguno de los que estaban por
// defecto, reemplazarlo por otros"; a mano: repetir si se regenera con construye_tienda.py) SIEMPRE 2 aritos de entrada: los de data-ejemplo
// (oreja.tpl) que tengan stock y, en el lugar de cada uno que no, otro con stock (reemplazoAro): del mismo tema y, entre esos, el de más
// unidades; si no hay del tema, el de más unidades de todos. En el lóbulo va un arito, nunca un ear cuff (y en el lugar del cuff, un cuff).
var N_EJEMPLO = 2;
function reemplazoAro(como, usados, cuff) {
  var mejor = null, puntos = -1;
  DATA.aros.forEach(function (c) {
    if ((c.tipo === 'cuff') !== !!cuff || usados.indexOf(c.k) >= 0) return;
    var p = como && c.cat === como.cat ? 1 : 0;
    if (p > puntos || (p === puntos && c.st > mejor.st)) { mejor = c; puntos = p; }
  });
  return mejor ? mejor.k : null;
}
var EJEMPLO = (function () {
  var pedidos = (host.getAttribute('data-ejemplo') || '').split(',').map(function (x) { var q = x.split(':'); return { id: q[0], k: q[1] }; }).filter(function (x) { return x.id && x.k; });
  var out = [], usados = pedidos.map(function (x) { return x.k; });
  pedidos.forEach(function (x) {
    var k = AR[x.k] ? x.k : reemplazoAro(TEMA_AR[x.k], usados, x.id === 'cuff');
    if (k) { out.push({ id: x.id, k: k }); usados.push(k); }
  });
  LOBULO.forEach(function (id) {      // si data-ejemplo trae menos de 2 (o no hubo reemplazo), se completa en los lugares libres del lóbulo
    if (out.filter(function (x) { return x.id !== 'cuff'; }).length >= N_EJEMPLO || out.some(function (x) { return x.id === id; })) return;
    var k = reemplazoAro(null, usados, false); if (k) { out.push({ id: id, k: k }); usados.push(k); }
  });
  return out;
})();
host.setAttribute('data-entrada', EJEMPLO.map(function (x) { return x.id + ':' + x.k; }).join(','));   // "l1:estr,l2:chag": con qué arranca (posterVale)
var posterVisto = false, posterT = null;
var CTX = {
  raiz: raiz, $: $, st: st, DATA: DATA, AR: AR, fmt: fmt, debug: DEBUG, malla: host.getAttribute('data-malla'),
  // la foto de la oreja y sus datos (en la tienda, las direcciones de la foto y su máscara vienen aparte: static_url)
  foto: (function () {
    var f = null; try { f = JSON.parse(host.getAttribute('data-foto') || 'null'); } catch (e) {}
    if (f) { if (host.getAttribute('data-foto-url')) f.url = host.getAttribute('data-foto-url'); if (host.getAttribute('data-foto-mascara')) f.mascara = host.getAttribute('data-foto-mascara'); }
    return f;
  })(),
  pintaResumen: function (late) { pintaResumen(late); }, muestraLupa: function (info) { muestraLupa(info); }, activa: function (id) { activa(id); },
  totalFlota: function () { return totalFlota; }, enVista: function () { return enVista; }, sinIntro: function () { return posterVisto; },
  quieta: P3.quieta, sinTresD: function () { sinTresD(); },      // quieta: ms desde el último scroll
  respiro: P3.respiro, calma: P3.calma, urgente: urgente, obra: !!window.PNT_3D,
  ejemplo: function (cb) { EJEMPLO.forEach(function (e, i) { cb(e.k, e.id, i); }); },
  ponEjemplo: function (k, id, yaPuesto) {
    if (st.pos[id] || donde(k) || !visible(id)) return;
    st.pos[id] = k; st.ejemplo = true; st.activo = siguienteActivo(id); pintaResumen(!yaPuesto);
    var card = raiz.querySelector('.card[data-k="' + k + '"] .card-f'); if (G) G.agregar(k, card, id, yaPuesto);
  }
};
function ponEjemplosYa() {      // los aros de ejemplo en el resumen (total, tarjetas): cuando se ven en el póster o si no hay 3D
  if (!puestos().length) { EJEMPLO.forEach(function (e) { st.pos[e.id] = e.k; }); st.ejemplo = true; st.activo = siguienteActivo(); }
}
function sinTresD() {
  $('nogl').hidden = false; posterVisto = true;
  if (posterVale()) { ubicaPoster(); $('cargando').classList.add('con-poster', 'fallo'); } else $('cargando').classList.add('fallo');   // (2026-11-16) sin un póster con otros aros
  ponEjemplosYa();
  st.intro = false; pintaResumen(true);
}
/* El póster: si con el escenario a la vista el 3D todavía no está, espera un momento (GRACIA) con el escenario vacío (casi siempre
   el 3D llega antes y arranca con su intro); si tarda más, aparece la oreja con los aros de ejemplo como foto, ubicada y del tamaño que
   va a tener en el 3D (ubicaPoster). Cuando el 3D arranca lo hace sin intro, en la misma pose: la reemplaza sin que se note. */
var GRACIA = 900;
function tresDVisible() { return $('cargando').classList.contains('listo'); }
function fotoPoster() { return $('cargando').querySelector('.poster'); }
// El encuadre de la escena (oreja3d-escena.js: altoVista, focoBase y encierra) para un escenario de esa forma: alto visible y centro, en
// unidades de la escena (y hacia arriba). Una sola cuenta para el 3D y para el póster.
function vistaDe(asp, movil) {
  var f = CTX.foto; if (!f) return null;
  var E = f.escala, cel = asp < 0.9, mov = !!movil && !cel && !!f.altoM, ANCHO = f.w * E, ALTO = f.h * E;
  var H = Math.min((cel ? f.altoCel : (mov ? f.altoM : f.alto)) * E, ANCHO * 0.995 / asp, ALTO * 0.995);
  var fb = cel ? f.focoCel : (mov ? f.focoM : f.foco), cx0 = f.foco[0], cy0 = f.foco[1];
  var x = (fb[0] - cx0) * E, y = -(fb[1] - cy0) * E, hw = H * asp / 2, hh = H / 2;
  x = Math.max(-cx0 * E + hw, Math.min((f.w - cx0) * E - hw, x)); y = Math.max(-(f.h - cy0) * E + hh, Math.min(cy0 * E - hh, y));
  return { H: H, x: x, y: y };
}
function ubicaPoster() {
  var im = fotoPoster(), esc = $('stage'), W = esc.clientWidth, Hs = esc.clientHeight;
  if (!im || !im.naturalWidth || !W || !Hs) return;
  // la foto es el escenario entero tal como se capturó (herramientas/oreja/pruebas/poster-tienda.mjs): su forma dice con qué cámara
  var a0 = im.naturalWidth / im.naturalHeight, v0 = vistaDe(a0), v = vistaDe(W / Hs, W < 700);
  if (!v0 || !v) return;
  var k = Hs / v.H, alto = v0.H * k, ancho = alto * a0;
  im.style.width = ancho.toFixed(1) + 'px'; im.style.height = alto.toFixed(1) + 'px';
  im.style.left = (W / 2 + (v0.x - v.x) * k - ancho / 2).toFixed(1) + 'px'; im.style.top = (Hs / 2 - (v0.y - v.y) * k - alto / 2).toFixed(1) + 'px';
}
// (2026-11-16) El póster vale si muestra los aritos de entrada de hoy (data-poster-de de oreja.tpl, lo escribe pruebas/poster-oreja.mjs, igual a
// data-entrada). Si uno de entrada se agotó y se reemplazó, la foto tendría otro: no se muestra.
function posterVale() { var de = host.getAttribute('data-poster-de'); return !de || de === host.getAttribute('data-entrada'); }
function pidePoster() { var im = fotoPoster(); if (im && im.loading === 'lazy' && posterVale()) { im.loading = 'eager'; } }     // (en el .tpl va con loading="lazy")
function muestraPoster() {
  posterT = null; if (tresDVisible() || posterVisto || !posterVale()) return;
  var im = fotoPoster();
  if (!im || !im.complete || !im.naturalWidth) { pidePoster(); posterT = setTimeout(muestraPoster, 250); return; }    // todavía no bajó
  posterVisto = true; ubicaPoster(); ponEjemplosYa(); pintaResumen(false); $('cargando').classList.add('con-poster');
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
// Lo que va a hacer falta se empieza a bajar apenas carga la página (solo la descarga: no frena nada), así al terminar la intro del
// inicio ya está. Con ahorro de datos o 2G, o con la pestaña en segundo plano, no se adelanta nada.
function adelantaDescargas() {
  if (!importa || P3.ahorra() || document.hidden) return;
  var pon = function (rel, href, as, cors) {
    if (!href) return;
    var l = document.createElement('link'); l.rel = rel; l.href = href; if (as) l.as = as; if (cors) l.crossOrigin = 'anonymous';
    try { l.fetchPriority = 'low'; } catch (e) {}
    document.head.appendChild(l);
  };
  try {
    pon('modulepreload', THREE_LOCAL || (CDN3 + '/+esm')); pon('preload', host.getAttribute('data-escena'), 'script'); pon('preload', host.getAttribute('data-contornos'), 'script');
    pon('preload', CTX.foto && CTX.foto.url, 'image', true); pon('preload', CTX.foto && CTX.foto.mascara, 'image', true);     // (las texturas se piden con CORS)
  } catch (e) {}
}
function pideThree() {
  if (threeListo || pedido) return; pedido = true;
  if (!importa) { sinTresD(); return; }
  Promise.all([importaThree(), cargaScript(host.getAttribute('data-escena'), 'PNT_OR_ESCENA'), cargaScript(host.getAttribute('data-contornos'), 'PNT_OR_CONTORNOS').catch(function () {})])
    .then(function (r) { return DEBUG && DEBUG.demora ? new Promise(function (ok) { setTimeout(function () { ok(r); }, DEBUG.demora); }) : r; })
    .then(function (r) { T3 = r[0]; threeListo = true; arma(); })
    .catch(function (e) { console.warn('Armá tu oreja: sin 3D', e); sinTresD(); });
}
function buenMomento(maxMs) {      // la página quieta (a lo sumo maxMs), o enseguida si el escenario ya asoma
  var desde = performance.now();
  return new Promise(function (ok) {
    (function mira() { if (urgente() || P3.quieta() >= 220 || performance.now() - desde >= maxMs) ok(); else setTimeout(mira, 60); })();
  });
}
/* Armar la escena: en su turno (de a un armador por vez: PNT_3D.obra), con la página quieta si se puede (a lo sumo se espera 1,5 s;
   nada si el escenario ya asoma) y, adentro de la escena, en pasos chicos. Queda lista sin dibujar nada a la vista; el primer cuadro
   (y la intro) esperan a que el escenario se vea (G.empieza). */
function arma() {
  if (arrancado || !threeListo || !(cerca || quiere || adelanta)) return;
  arrancado = true;
  P3.obra(distancia, function () {
    return buenMomento(1500).then(function () { return P3.respiro(urgente()); }).then(function () {
      try { G = window.PNT_OR_ESCENA(T3, CTX); } catch (err) { console.warn(err); sinTresD(); return null; }
      if (visto) G.empieza();
      return G.lista;
    });
  });
}
function arranca() {      // el escenario ya se ve bien (40 %)
  visto = true; quiere = true;
  if (!threeListo) { pideThree(); return; }
  if (G) G.empieza(); else arma();
}
var totalEl = raiz.querySelector('.total'), totalRanura = $('total-ranura'), mTotal = window.matchMedia ? matchMedia('(min-width: 1280px)') : { matches: true }, totalFlota = true;
function ubicaTotal() { totalFlota = mTotal.matches; (totalFlota ? $('stage') : totalRanura).appendChild(totalEl); }
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
  var hostVisto = false, totalVisto = false, celu = window.matchMedia ? matchMedia('(max-width: 699px)') : { matches: false };
  var barra = function () { var on = hostVisto && !totalVisto && celu.matches; host.classList.toggle('barra-on', on); document.documentElement.classList.toggle('pnt-or-barra', on); };
  new IntersectionObserver(function (es) { hostVisto = es[es.length - 1].isIntersecting; barra(); }).observe(host);
  new IntersectionObserver(function (es) { totalVisto = es[es.length - 1].isIntersecting; barra(); }, { threshold: 0.4 }).observe(totalEl);
  if (celu.addEventListener) celu.addEventListener('change', barra);
} else { enVista = true; quiere = true; pideFotos(); arranca(); }
})();
