import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d-escena.js', [
("sombra.mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.42, depthWrite: false, toneMapped: false });",
 "sombra.mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.36, depthWrite: false, toneMapped: false });   // (2026-11-14) más suave y difusa: la pulsera está suspendida, la sombra es una mancha blanda"),
("    difumina(sombra.rt, sombra.rt2, p * 2.2, 0); difumina(sombra.rt2, sombra.rt, 0, p * 2.2);\n    difumina(sombra.rt, sombra.rt2, p * 0.9, 0); difumina(sombra.rt2, sombra.rt, 0, p * 0.9);",
 "    difumina(sombra.rt, sombra.rt2, p * 5.0, 0); difumina(sombra.rt2, sombra.rt, 0, p * 5.0);\n    difumina(sombra.rt, sombra.rt2, p * 2.4, 0); difumina(sombra.rt2, sombra.rt, 0, p * 2.4);\n    difumina(sombra.rt, sombra.rt2, p * 1.0, 0); difumina(sombra.rt2, sombra.rt, 0, p * 1.0);"),
])
