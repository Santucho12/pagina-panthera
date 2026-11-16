import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/oreja3d-escena.js', [
("var ABRE = { l1: 0.15, l2: 0.11, l3: 0.19 };",
 "var ABRE = { l1: 0.07, l2: 0.05, l3: 0.09 };           // (2026-11-14, 2.ª vuelta) casi de canto del todo: abierta se veía como un gancho en \"J\", grueso"),
("      var w = Math.max(0.11, Math.min(0.2, (g ? g.banda : 0.24) * D * 0.78)), t = Math.max(0.08, Math.min(0.11, w * 0.5 + 0.015));",
 "      var w = Math.max(0.1, Math.min(0.16, (g ? g.banda : 0.24) * D * 0.62)), t = Math.max(0.075, Math.min(0.1, w * 0.5 + 0.015));"),
("var sombraOreja = receptor(0.0005, true, 0.3), sombraFondo = receptor(-0.65, false, 0.26);",
 "var sombraOreja = receptor(0.0005, true, 0.26), sombraFondo = receptor(-0.65, false, 0.15);   // (2026-11-14) la del cuello más leve: se veía como una mancha sucia junto a los dijes"),
])
