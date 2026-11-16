import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/oreja3d-escena.js', [
("      var ctrl = de.clone().lerp(anc, 0.5); ctrl.y += 1.4; ctrl.z += 1;",
 """      // (2026-11-14, realismo) llega DE FRENTE: pasa por delante del lóbulo (hacia la cámara) y recién ahí entra a su lugar, como
      // cuando uno se pone un arito. Antes hacía un arco por arriba y caía de costado, girando.
      var ctrl = anc.clone(); ctrl.z += 2.6; ctrl.y += 0.35; ctrl.x += (de.x - anc.x) * 0.12;"""),
("        a.esc = 0.45 + 0.55 * e; a.col.rotation.z = ie2 * ie2 * 1.1 * a.vol.giro + (esCuff ? CUFF_GIRO * e : 0); a.col.rotation.x = 0;",
 "        a.esc = 0.45 + 0.55 * e; a.col.rotation.z = ie2 * ie2 * 0.3 * a.vol.giro + (esCuff ? CUFF_GIRO * e : 0); a.col.rotation.x = 0;"),
("    vuelo: 0.95, inclina: 0.06,", "    vuelo: 0.85, inclina: 0.06,"),
])
