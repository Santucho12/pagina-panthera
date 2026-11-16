# "Armá tu pulsera" más simple (2026-11-11, pedidos del usuario sobre capturas del panel):
#  1. "el talle debe aparecer cuando selecciono la pulsera, por defecto no debe venir ninguna seleccionada"
#  2. "LA BASE" → "aca debe decir: la pulsera"
#  3. la nota "Al agregar, la pulsera en tu talle y cada charm entran juntos a tu carrito" → "esto debe aparecer cuando las sumo
#     al carrito, no ahora"
#  4. el total: "más pequeño y comprimido"; 5. "la pulsera más arriba y a la izquierda"
# Respaldo de antes: respaldos/2026-11-11-armadores-antes-de-simplificar/. Uso: python herramientas/armador/simplifica_2026-11-11.py
import os
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tienda')

def parcha(rel, cambios):
    ruta = os.path.join(RAIZ, rel)
    s = open(ruta, encoding='utf-8').read()
    for a, b in cambios:
        assert s.count(a) == 1, (rel, s.count(a), a[:90])
        s = s.replace(a, b)
    open(ruta, 'w', encoding='utf-8', newline='\n').write(s)

# ── armar.tpl: pasos numerados solos (CSS), "La pulsera", talle escondido hasta elegir la pulsera, sin la nota del carrito
parcha('snipplets/panthera/armar.tpl', [
    ('''    <section class="paso hecho"><h3><i>1</i>La base</h3><div class="bases" id="bases"></div><p class="base-n" id="base-n"></p><p class="base-d" id="base-d"></p><p class="base-s" id="base-s"></p></section>
    <section class="paso hecho"><h3><i>2</i>Tu talle</h3><div class="talles" id="talles"></div><p class="guia">Es el largo de la pulsera. Medí tu muñeca y sumale 2 cm (guía orientativa).</p></section>
    <section class="paso" id="paso3"><h3><i>3</i>Tu combinación</h3>''',
     '''    <section class="paso" id="paso1"><h3><i></i>La pulsera</h3><div class="bases" id="bases"></div><p class="base-n" id="base-n" hidden></p><p class="base-d" id="base-d" hidden></p><p class="base-s" id="base-s" hidden></p></section>
    <section class="paso" id="paso2" hidden><h3><i></i>Tu talle</h3><div class="talles" id="talles"></div><p class="guia">Es el largo de la pulsera. Medí tu muñeca y sumale 2 cm (guía orientativa).</p></section>
    <section class="paso" id="paso3"><h3><i></i>Tu combinación</h3>'''),
    ('''    <p class="nota">Los precios ya tienen el descuento de la tienda. Al agregar, la pulsera en tu talle y cada charm entran juntos a tu carrito.</p>
''', ''),
])

# ── armar3d.css: números de los pasos con contador (si el talle no se ve, los que siguen se renumeran), aviso del paso que falta,
#    total compacto (4 renglones), y sin total cuando no hay nada elegido
parcha('static/panthera/armar3d.css', [
    ('.paso{min-width:0}\n',
     '.paso{min-width:0;counter-increment:paso}\n.panel{counter-reset:paso}\n.paso h3 i::before{content:counter(paso)}\n'
     '/* el paso que falta (al tocar "Agregar al carrito" sin pulsera o sin talle): su número late en rosa */\n'
     '.paso.pide h3 i{animation:pide .5s var(--resorte) 3;background:var(--rosa);box-shadow:none}\n'
     '@keyframes pide{50%{transform:scale(1.3)}}\n'),
    ('''.stage>.total{position:absolute;z-index:3;right:16px;bottom:16px;width:min(292px,calc(100% - 32px));padding:14px 16px 16px;border-radius:22px;''',
     '''/* compu: tarjeta compacta (pedido 2026-11-11: "más pequeño y comprimido"): el rótulo, el precio con transferencia, en un renglón
   el precio y las cuotas, y el botón; sin la línea divisoria */
.stage>.total{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:baseline;column-gap:10px;row-gap:4px;width:min(256px,calc(100% - 32px))}
.stage>.total>.t-cab,.stage>.total>.p-transf,.stage>.total>.cta{grid-column:1/-1}
.stage>.total>.p-linea{display:none}
.stage>.total>.p-lista{grid-row:3;font-size:11.5px;white-space:nowrap}
.stage>.total>.p-lista s{margin-right:5px}
.stage>.total>.p-cuotas{grid-row:3;justify-self:end;font-size:10.5px;gap:5px;white-space:nowrap}
.stage>.total>.p-cuotas svg{width:14px;height:10px}
.stage>.total .t-cab{font-size:9.5px;letter-spacing:.16em}
.stage>.total .p-transf b{font-size:23px}
.stage>.total .p-transf span{font-size:9px}
.stage>.total .cta{min-height:40px;margin-top:4px;padding:0 18px;font-size:11.5px;letter-spacing:.1em}
.stage>.total{position:absolute;z-index:3;right:14px;bottom:14px;padding:11px 13px 12px;border-radius:18px;'''),
    ('''@media (min-width:1280px){
  .st-pie,.vitrina{max-width:calc(100% - 344px)}''',
     '''@media (min-width:1280px){
  .st-pie,.vitrina{max-width:calc(100% - 300px)}'''),
    ('''.toast{position:fixed;''',
     '''/* sin nada elegido (ni pulsera ni charms) no hay total que mostrar */
:host(.sin-total) .total,:host(.sin-total) .barra{display:none!important}
.toast{position:fixed;'''),
])

# ── armar3d.js
parcha('static/panthera/armar3d.js', [
    ("var st = { base: 'silv', talle: '19 cm', sel: [], filtro: '', pausa: REDUCE, intro: true };",
     "// Nada elegido al entrar (pedido 2026-11-11): ni pulsera ni talle. El 3D muestra mientras tanto una de muestra (BASE_VISTA).\n"
     "var BASE_VISTA = 'silv';\n"
     "var st = { base: null, talle: null, sel: [], filtro: '', pausa: REDUCE, intro: true };"),
    ("""function pintaTalles() {
  var b = BA[st.base], hay = b.talles.filter(function (t) { return t[1] > 0; }).map(function (t) { return t[0]; });
  if (hay.indexOf(st.talle) < 0) st.talle = hay.indexOf('19 cm') > -1 ? '19 cm' : (hay[0] || st.talle);
  $('talles').innerHTML""",
     """// El talle aparece recién cuando se elige la pulsera (pedido 2026-11-11), sin ninguno marcado: lo elige la persona
function pintaTalles() {
  var b = BA[st.base];
  ['base-n', 'base-d', 'base-s'].forEach(function (id) { $(id).hidden = !b; });
  $('paso1').classList.toggle('hecho', !!b);
  $('paso2').hidden = !b; $('paso2').classList.toggle('hecho', !!(b && st.talle));
  if (!b) { $('talles').innerHTML = ''; return; }
  var hay = b.talles.filter(function (t) { return t[1] > 0; }).map(function (t) { return t[0]; });
  if (st.talle && hay.indexOf(st.talle) < 0) st.talle = null;
  $('talles').innerHTML"""),
    ("""function pintaResumen(late) {
  var b = BA[st.base], t = b.p, a = b.a, n = st.sel.length;
  st.sel.forEach(function (k) { t += CH[k].p; a += CH[k].a; });
  $('t-lista').innerHTML = (a > t ? '<s>' + fmt(a) + '</s>' : '') + 'Ahora ' + fmt(t); rueda($('t-tr'), t * 0.7, late); $('t-cuota').textContent = fmtc(t / 3);
  $('t-lbl').textContent = 'Pulsera ' + st.talle + (n ? ' + ' + n + (n === 1 ? ' charm' : ' charms') : '');""",
     """function pintaResumen(late) {
  var b = st.base ? BA[st.base] : null, t = b ? b.p : 0, a = b ? b.a : 0, n = st.sel.length;
  st.sel.forEach(function (k) { t += CH[k].p; a += CH[k].a; });
  $('t-lista').innerHTML = (a > t ? '<s>' + fmt(a) + '</s>' : '') + 'Ahora ' + fmt(t); rueda($('t-tr'), t * 0.7, late); $('t-cuota').textContent = fmtc(t / 3);
  var partes = [];
  if (b) partes.push('Pulsera' + (st.talle ? ' ' + st.talle : ''));
  if (n) partes.push(n + (n === 1 ? ' charm' : ' charms'));
  $('t-lbl').textContent = partes.join(' + ') || 'Tu pulsera';
  host.classList.toggle('sin-total', !b && !n);"""),
    ("""  } else {
    var b = BA[st.base];
    $('lupa-t').textContent = 'El cierre';""",
     """  } else {
    var b = BA[st.base || BASE_VISTA];
    $('lupa-t').textContent = 'El cierre';"""),
    ("""function muestraBase(txt) {     // tarjeta de la pulsera elegida, mientras el 3D muestra su cierre de frente
  var b = BA[st.base], v = $('vitrina');""",
     """function muestraBase(txt) {     // tarjeta de la pulsera elegida, mientras el 3D muestra su cierre de frente
  var b = BA[st.base || BASE_VISTA], v = $('vitrina');"""),
    ("""  var antes = st.talle;
  st.base = b.dataset.b;
  $$('.base').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
  pintaTalles(); pintaResumen(true);
  if (G) { G.cambiaBase(); if (st.talle !== antes) G.talle(cm(st.talle)); }
  muestraBase(st.talle !== antes ? 'Pasamos al talle ' + st.talle + ': el ' + antes + ' de esta no tiene stock' : BA[st.base].desc);
  ['base-n', 'base-d', 'base-s'].forEach(function (id) { var el = $(id); el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); });""",
     """  var antes = st.talle, primera = !st.base;
  st.base = b.dataset.b; $('paso1').classList.remove('pide');
  $$('.base').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
  pintaTalles(); pintaResumen(true);
  if (G) { G.cambiaBase(); if (st.talle !== antes) G.talle(cm(st.talle)); }
  muestraBase(antes && !st.talle ? 'Esta no tiene el talle ' + antes + ' con stock: elegí otro' : BA[st.base].desc);
  ['base-n', 'base-d', 'base-s'].concat(primera ? ['paso2'] : []).forEach(function (id) { var el = $(id); el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); });"""),
    ("""  st.talle = b.dataset.t; pintaTalles(); pintaResumen();""",
     """  st.talle = b.dataset.t; $('paso2').classList.remove('pide'); pintaTalles(); pintaResumen();"""),
    # el carrito: si falta la pulsera o el talle, lo pide (y el paso late); al entrar todo, el aviso de qué se agregó
    ("""  var b = BA[st.base], talle = b.talles.filter(function (x) { return x[0] === st.talle; })[0];
  if (!talle || !(talle[1] > 0)) { toast('Elegí un talle con stock para la pulsera'); return; }""",
     """  var b = st.base ? BA[st.base] : null, talle = b && b.talles.filter(function (x) { return x[0] === st.talle; })[0];
  if (!b) { pide('paso1', 'Elegí tu pulsera'); return; }
  if (!talle || !(talle[1] > 0)) { pide('paso2', 'Elegí tu talle'); return; }"""),
    ("""    if (!fallaron.length) {
      t.textContent = '¡Listo! Te llevamos al carrito'; if (G) G.festejo();
      setTimeout(function () { window.location.href = CARRITO; }, REDUCE ? 500 : 1400);
      return;
    }""",
     """    if (!fallaron.length) {
      // lo que antes era una nota fija del panel, ahora aparece recién al agregar (pedido 2026-11-11)
      var nCh = st.sel.length;
      t.textContent = '¡Listo! Te llevamos al carrito'; if (G) G.festejo();
      toast('La pulsera en tu talle' + (nCh ? (nCh === 1 ? ' y tu charm' : ' y tus ' + nCh + ' charms') : '') + ' ya están en tu carrito, con el descuento de la tienda');
      setTimeout(function () { window.location.href = CARRITO; }, REDUCE ? 800 : 2400);
      return;
    }"""),
    ("""$('b-cta').addEventListener('click', function () { $('cta').click(); });""",
     """$('b-cta').addEventListener('click', function () { $('cta').click(); });
// "Agregar al carrito" sin pulsera o sin talle: avisa, lleva al paso que falta (en el celular está más abajo) y su número late
function pide(id, msg) {
  var el = $(id); toast(msg);
  el.classList.remove('pide'); void el.offsetWidth; el.classList.add('pide');
  if (!mTotal.matches || !el.getBoundingClientRect().height) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
}"""),
    ("""  raiz: raiz, $: $, st: st, DATA: DATA, CH: CH, BA: BA, MAX: MAX, fmt: fmt, cm: cm, REDUCE: REDUCE, debug: DEBUG, addons: {},""",
     """  raiz: raiz, $: $, st: st, DATA: DATA, CH: CH, BA: BA, MAX: MAX, fmt: fmt, cm: cm, REDUCE: REDUCE, debug: DEBUG, addons: {}, baseVista: BASE_VISTA,"""),
])

# ── armar3d-escena.js: la pulsera de muestra mientras no se elige ninguna; la pulsera más arriba y más a la izquierda
parcha('static/panthera/armar3d-escena.js', [
    ("      if (REDUCE) { ponBase(st.base, true); return; }\n      basePend = st.base;",
     "      if (REDUCE) { ponBase(st.base || X.baseVista, true); return; }\n      basePend = st.base || X.baseVista;"),
    ("  ponBase(st.base, false); Robj = R = R0 * cm(st.talle) / 19;",
     "  ponBase(st.base || X.baseVista, false); Robj = R = R0 * cm(st.talle) / 19;      // (sin pulsera elegida: la de muestra; sin talle: 19 cm)"),
    ("""    focoObj.y -= vis * (flota ? 0.09 : 0.05) * afuera;                              // la pulsera sube un poco (pedido 2026-11-10)
    if (flota) focoObj.x += vis * camera.aspect * (stage.clientWidth < 800 ? 0.06 : 0.025) * afuera;   // y un poco a la izquierda: abajo a la derecha está el total""",
     """    focoObj.y -= vis * (flota ? 0.13 : 0.05) * afuera;                              // la pulsera sube (pedidos 2026-11-10 y 2026-11-11: "más arriba")
    if (flota) focoObj.x += vis * camera.aspect * (stage.clientWidth < 800 ? 0.09 : 0.06) * afuera;   // y a la izquierda: abajo a la derecha está el total"""),
])
print('ok')
