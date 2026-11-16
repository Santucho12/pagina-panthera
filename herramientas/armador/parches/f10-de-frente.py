import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d-escena.js', [
("        orientaCharm(ch, ch.t, qFin, !!ch.enhebra); caraCamara(qTmp); if (!ch.enhebra) qFin.slerp(qTmp, 0.55); p.quaternion.copy(qTmp).slerp(qFin, e);   // (enhebrado: llega ya fijo a la cadena, sin salto al posarse)",
 "        orientaCharm(ch, ch.t, qFin); caraCamara(qTmp); qFin.slerp(qTmp, ch.enhebra ? 1 : 0.55); p.quaternion.copy(qTmp).slerp(qFin, e);   // (enhebrado: llega ya de frente a la cámara)"),
("""        orientaCharm(ch, ch.t, p.quaternion, !!ch.enhebra); caraCamara(qTmp);
        var fr = 1; if (ch.enhebra) { fr = Math.max(0, Math.min(1, (ch.frente - 0.05) / 0.6)); fr = fr * fr * (3 - 2 * fr); }   // de espaldas o de canto: sin torcerlo hacia la cámara
        p.quaternion.slerp(qTmp, (0.76 + 0.12 * ch.hov) * fr);
        if (ch.cuenta) { ch.giro += (giroCuenta(p, ch.t) - ch.giro) * Math.min(1, dt * 10); p.rotateZ(ch.giro); }""",
 """        /* (2026-11-14, 3.ª vuelta: "mirá cómo se ve el corazón") Mientras baja enhebrado va SIEMPRE de frente a la cámara (enhF = 1):
           las piezas son fotos con espesor y de costado se les ve el canto como una plancha. Así no gira nunca en el recorrido (el
           pedido de antes), no muestra el canto y llega de frente; al llegar afloja de a poco hasta la pose de reposo. Se probó
           llevarlo fijo a la cadena (de espaldas → de canto → de frente) y de costado se veía mal: no volver a eso. */
        ch.enhF = ch.enhebra ? 1 : Math.max(0, (ch.enhF || 0) - dt * 1.6);
        orientaCharm(ch, ch.t, p.quaternion); caraCamara(qTmp);
        var pf = 0.76 + 0.12 * ch.hov; p.quaternion.slerp(qTmp, pf + (1 - pf) * ch.enhF);
        if (ch.cuenta) { var gc = giroCuenta(p, ch.t); if (ch.enhF > 0) gc *= 1 - ch.enhF; ch.giro += (gc - ch.giro) * Math.min(1, dt * 10); p.rotateZ(ch.giro); }"""),
])
