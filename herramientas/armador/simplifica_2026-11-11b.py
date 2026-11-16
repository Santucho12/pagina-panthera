# Ajuste del usuario sobre lo de hoy (2026-11-11): "mejor que sí venga una pulsera preseleccionada, lo que no quiero que aparezca
# ahí es el de la combinación". → La pulsera de muestra vuelve a estar elegida (Silver Flower); el talle sigue sin ninguno marcado;
# sin charms de ejemplo: "Tu combinación" aparece recién cuando se suma el primer charm.
# Uso: python herramientas/armador/simplifica_2026-11-11b.py
import os
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tienda')

def parcha(rel, cambios):
    ruta = os.path.join(RAIZ, rel)
    s = open(ruta, encoding='utf-8').read()
    for a, b in cambios:
        assert s.count(a) == 1, (rel, s.count(a), a[:90])
        s = s.replace(a, b)
    open(ruta, 'w', encoding='utf-8', newline='\n').write(s)

parcha('snipplets/panthera/armar.tpl', [
    ('<section class="paso" id="paso3"><h3><i></i>Tu combinación</h3>', '<section class="paso" id="paso3" hidden><h3><i></i>Tu combinación</h3>'),
])
parcha('static/panthera/armar3d.js', [
    ("// Nada elegido al entrar (pedido 2026-11-11): ni pulsera ni talle. El 3D muestra mientras tanto una de muestra (BASE_VISTA).\n"
     "var BASE_VISTA = 'silv';\n"
     "var st = { base: null, talle: null, sel: [], filtro: '', pausa: REDUCE, intro: true };",
     "// Al entrar (pedidos 2026-11-11): la pulsera Silver Flower elegida, el talle sin marcar (lo elige la persona) y sin charms de\n"
     "// ejemplo (\"Tu combinación\" aparece recién con el primer charm). BASE_VISTA: la que muestra el 3D si no hubiera ninguna elegida.\n"
     "var BASE_VISTA = 'silv';\n"
     "var st = { base: BASE_VISTA, talle: null, sel: [], filtro: '', pausa: REDUCE, intro: true };"),
    ("  $('paso3').classList.toggle('hecho', n > 0);",
     "  $('paso3').classList.toggle('hecho', n > 0); $('paso3').hidden = !n;      // sin charms, no hay combinación que mostrar"),
    ("""function sinTresD() {     // sin 3D: queda el póster (la pulsera de ejemplo) con un aviso chico, y el mismo ejemplo en la lista
  $('nogl').hidden = false; posterVisto = true; $('cargando').classList.add('con-poster', 'fallo');
  if (!st.sel.length) { st.sel = ['jaz', 'moon', 'mick'].filter(function (k) { return CH[k]; }); st.ejemplo = true; }
  st.intro = false; pintaResumen(true);""",
     """function sinTresD() {     // sin 3D: queda el póster (la pulsera, sin charms) con un aviso chico; los charms se eligen igual
  $('nogl').hidden = false; posterVisto = true; $('cargando').classList.add('con-poster', 'fallo');
  st.intro = false; pintaResumen(true);"""),
])
parcha('static/panthera/armar3d-escena.js', [
    ("""    ['jaz', 'moon', 'mick'].forEach(function (k, i) {
      setTimeout(function () {
        if (hayEleccion || st.sel.indexOf(k) > -1 || st.sel.length >= MAX) return;
        st.sel.push(k); st.ejemplo = true; X.pintaResumen(true);
        var card = X.raiz.querySelector('.card[data-k="' + k + '"] .card-f'); api.agregar(k, card, sinIntro);
      }, (rapido ? 0 : 1350) + i * (rapido ? 0 : 260));
    });
""", """    // (sin charms de ejemplo desde 2026-11-11: la pulsera arranca sola y "Tu combinación" aparece con el primer charm)
"""),
    ("    var hayEleccion = st.sel.length > 0;      // si ya eligió charms antes de que cargara el 3D, aparecen esos (y no el ejemplo)\n",
     "    // si ya eligió charms antes de que cargara el 3D, aparecen esos\n"),
])
print('ok')
