import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d-escena.js', [
# ── el giro queda donde se suelta ──
("  var inercia = 0, crudo = Math.PI, lupa = null, lupaT = 0, saltar = false;",
 """  var inercia = 0, crudo = Math.PI, lupa = null, lupaT = 0, saltar = false;
  /* (2026-11-14, realismo) El giro QUEDA donde se suelta (giroU): antes tenía un tope elástico de ~1,15 rad y a los 2 s volvía sola
     al frente, así que no se podía dejar de costado ni ver el cierre o la parte de atrás. Vuelve al frente sola cuando hace falta
     ver lo que pasa adelante (al sumar un charm, al cambiar de pulsera, en el festejo) o con doble clic / doble toque. */
  var giroU = 0;
  function alFrente() { centro += Math.round(giroU / (Math.PI * 2)) * Math.PI * 2; giroU = 0; }"""),
("""    crudo += dx * 0.0065;                                // tope elástico: después de 0,7 rad cuesta cada vez más
    var d = crudo - eje, ad = Math.abs(d), lim = ad < 0.7 ? ad : Math.min(1.15, 0.7 + (ad - 0.7) * 0.35);
    rotY = eje + (d < 0 ? -lim : lim);
    rotV = rotV * 0.5 + (rotY - antes) * 30;""",
 """    crudo += dx * 0.0065;                                // (2026-11-14) gira libre, sin tope: queda donde se la suelta
    rotY = crudo;
    rotV = rotV * 0.5 + (rotY - antes) * 30;"""),
("    if (a.movio) { inercia = MOV.inercia; return; }       // se deja llevar un momento y vuelve suave al frente",
 "    if (a.movio) { inercia = MOV.inercia; if (!lupa) giroU = rotY + Math.max(-0.5, Math.min(0.5, rotV * 0.16)) - (centro + extraObj); return; }   // se deja llevar un momento y se queda ahí"),
("      var meta = centro + extraObj + (lupa ? extraLupa : 0) + Math.sin(tiempo * MOV.reposoVel) * MOV.reposo * calma * (quieta ? 1 : 0.3);",
 "      var meta = centro + extraObj + (lupa ? extraLupa : giroU) + Math.sin(tiempo * MOV.reposoVel) * MOV.reposo * calma * (quieta ? 1 : 0.3);"),
("""  canvas.addEventListener('pointermove', function (e) {
    if (!agarre) { sobre = tocado(e); canvas.classList.toggle('sobre', !!sobre); return; }""",
 """  canvas.addEventListener('dblclick', function () { if (!lupa) alFrente(); });
  canvas.addEventListener('pointermove', function (e) {
    if (!agarre) { sobre = tocado(e); canvas.classList.toggle('sobre', !!sobre); return; }"""),
# ── el charm entra por el cierre y se desliza hasta su lugar ──
("    vuelo: 0.9, enhebra: 0.075,         // segundos del vuelo desde la tarjeta y cuánto se desliza por la cadena (en vueltas) hasta su lugar",
 """    vuelo: 0.9, enhebra: 0.075,         // segundos del vuelo desde la tarjeta y cuánto se desliza por la cadena (en vueltas) hasta su lugar
    vueloCierre: 0.62, entraCierre: 0.075, enhebraK: 13,   // (2026-11-14) entra junto al cierre (a esa fracción de vuelta) y baja deslizándose, más despacio"""),
("""      var tA = ch.tObj - MOV.enhebra, tB = ch.tObj + MOV.enhebra, wA = anclaje(tA, new THREE.Vector3()), wB = anclaje(tB, new THREE.Vector3());
      ch.t = wA.distanceTo(de) < wB.distanceTo(de) ? tA : tB; ch.tv = 0;     // se enhebra del lado de donde viene y después se desliza""",
 """      var tA = ch.tObj - MOV.enhebra, tB = ch.tObj + MOV.enhebra, wA = anclaje(tA, new THREE.Vector3()), wB = anclaje(tB, new THREE.Vector3());
      ch.t = wA.distanceTo(de) < wB.distanceTo(de) ? tA : tB; ch.tv = 0;     // se enhebra del lado de donde viene y después se desliza
      /* (2026-11-14, realismo) Como en la realidad: el charm se ENHEBRA por la punta de la cadena, al lado del cierre, y baja
         deslizándose hasta su lugar (antes aparecía volando sobre su lugar, atravesando a los que ya estaban). Entra por la punta
         más cercana a su lugar: el último de la fila, por el final. La pulsera vuelve al frente para que se vea. */
      var porCierre = !yaPuesto && !REDUCE;
      if (porCierre) {
        var iSel = st.sel.indexOf(k), fin = iSel < 0 || iSel >= (st.sel.length - 1) / 2;
        ch.t = fin ? 1 - MOV.entraCierre : MOV.entraCierre; ch.enhebra = true;
        if (!lupa) alFrente();
      }"""),
("      ch.vol = { de: de, ctrl: ctrl, u: REDUCE || yaPuesto ? 1 : 0, dur: MOV.vuelo, giro: Math.random() < 0.5 ? -1 : 1 };",
 "      ch.vol = { de: de, ctrl: ctrl, u: REDUCE || yaPuesto ? 1 : 0, dur: porCierre ? MOV.vueloCierre : MOV.vuelo, giro: Math.random() < 0.5 ? -1 : 1 };"),
("      if (!ch.vol) { ch.tv += ((ch.tObj - ch.t) * MOV.deslizar - ch.tv * 2 * MOV.deslizarAmort * Math.sqrt(MOV.deslizar)) * dt; ch.t += ch.tv * dt; }   // se desliza por la cadena",
 """      if (!ch.vol) {                                     // se desliza por la cadena (recién enhebrado: más despacio, se lo ve bajar)
        var kd = ch.enhebra ? MOV.enhebraK : MOV.deslizar;
        ch.tv += ((ch.tObj - ch.t) * kd - ch.tv * 2 * (ch.enhebra ? 1 : MOV.deslizarAmort) * Math.sqrt(kd)) * dt; ch.t += ch.tv * dt;
        if (ch.enhebra && Math.abs(ch.tObj - ch.t) < 0.006) ch.enhebra = false;
      }"""),
("      else { extraObj = Math.PI; cambioEn = 0.5; }                 // media vuelta: el cierre viene al frente y ahí cambia",
 "      else { alFrente(); extraObj = Math.PI; cambioEn = 0.5; }     // media vuelta: el cierre viene al frente y ahí cambia"),
("      festejo = REDUCE ? 0 : 2.4; if (!REDUCE) centro += Math.PI * 2;     // una vuelta lenta, destellos y el barrido de luz",
 "      alFrente(); festejo = REDUCE ? 0 : 2.4; if (!REDUCE) centro += Math.PI * 2;     // una vuelta lenta, destellos y el barrido de luz"),
])
