import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d-escena.js', [
("""  function orientaCharm(ch, t, out) {     // X = la cadena (en el mundo), Y = arriba (gravedad), Z = hacia el lado de la cámara
    camino(t - 0.0015, pA); camino(t + 0.0015, pB); pulsera.localToWorld(pA); pulsera.localToWorld(pB);
    cX.subVectors(pB, pA).normalize();
    cY.set(0, 1, 0).addScaledVector(cX, -cX.y).normalize();
    cZ.crossVectors(cX, cY);
    if (cZ.dot(haciaCam) < 0) { cX.negate(); cZ.negate(); }""",
"""  /* (2026-11-14, pedido del usuario: "entran de una forma y cuando llegan a la mitad del recorrido se giran… deberían entrar al
     revés para que al final lleguen de frente") Mientras el charm baja enhebrado desde el cierre (rigido) va fijo a la cadena, con
     la cara hacia AFUERA de la pulsera: atrás se lo ve de espaldas, de costado de canto y adelante llega de frente, girando con la
     cadena sin saltos. Antes su cara se daba vuelta de golpe al cruzar el costado (para mirar siempre a la cámara). En reposo
     sigue como antes. ch.frente: cuánto mira a la cámara (1 de frente, −1 de espaldas). */
  var oCen = new THREE.Vector3(), oRad = new THREE.Vector3();
  function orientaCharm(ch, t, out, rigido) {     // X = la cadena (en el mundo), Y = arriba (gravedad), Z = hacia el lado de la cámara
    camino(t - 0.0015, pA); camino(t + 0.0015, pB); pulsera.localToWorld(pA); pulsera.localToWorld(pB);
    cX.subVectors(pB, pA).normalize();
    cY.set(0, 1, 0).addScaledVector(cX, -cX.y).normalize();
    cZ.crossVectors(cX, cY);
    if (rigido) { pulsera.getWorldPosition(oCen); oRad.addVectors(pA, pB).multiplyScalar(0.5).sub(oCen); if (cZ.dot(oRad) < 0) { cX.negate(); cZ.negate(); } }
    else if (cZ.dot(haciaCam) < 0) { cX.negate(); cZ.negate(); }
    if (ch) ch.frente = cZ.dot(haciaCam);"""),
("        orientaCharm(ch, ch.t, p.quaternion); caraCamara(qTmp); p.quaternion.slerp(qTmp, 0.76 + 0.12 * ch.hov);",
 """        orientaCharm(ch, ch.t, p.quaternion, !!ch.enhebra); caraCamara(qTmp);
        var fr = 1; if (ch.enhebra) { fr = Math.max(0, Math.min(1, (ch.frente - 0.05) / 0.6)); fr = fr * fr * (3 - 2 * fr); }   // de espaldas o de canto: sin torcerlo hacia la cámara
        p.quaternion.slerp(qTmp, (0.76 + 0.12 * ch.hov) * fr);"""),
])
