import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
for f in ('tienda/static/panthera/armar3d.js', 'tienda/static/panthera/oreja3d.js'):
    parche(f, [
        ("if (e.intersectionRatio >= 0.4 || (e.intersectionRect && e.intersectionRect.height >= (window.innerHeight || 1e9) * 0.5)) {",
         "// (2026-11-15) arranca con el escenario visible al 10 % (era 40 %): entre el 1 y el 40 % se veía la caja vacía ~0,25 s al llegar bajando\n    if (e.intersectionRatio >= 0.1 || (e.intersectionRect && e.intersectionRect.height >= (window.innerHeight || 1e9) * 0.5)) {"),
        ("}, { threshold: [0, 0.25, 0.4, 0.6] }).observe($('stage'));", "}, { threshold: [0, 0.1, 0.25, 0.4, 0.6] }).observe($('stage'));"),
    ])
