import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d-escena.js', [
("        orientaCharm(ch, ch.t, qFin); caraCamara(qTmp); qFin.slerp(qTmp, 0.55); p.quaternion.copy(qTmp).slerp(qFin, e);",
 "        orientaCharm(ch, ch.t, qFin, !!ch.enhebra); caraCamara(qTmp); if (!ch.enhebra) qFin.slerp(qTmp, 0.55); p.quaternion.copy(qTmp).slerp(qFin, e);   // (enhebrado: llega ya fijo a la cadena, sin salto al posarse)"),
])
