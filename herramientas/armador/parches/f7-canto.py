import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d-escena.js', [
("caraCamara(qTmp); p.quaternion.slerp(qTmp, 0.55 + 0.25 * ch.hov);",
 "caraCamara(qTmp); p.quaternion.slerp(qTmp, 0.76 + 0.12 * ch.hov);   // (2026-11-14) más de frente (era 0,55): en los costados de la pulsera se veía el canto de la pieza como una plancha recortada"),
])
