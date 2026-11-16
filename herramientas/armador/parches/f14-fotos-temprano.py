import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
for f in ('tienda/static/panthera/armar3d.js', 'tienda/static/panthera/oreja3d.js'):
    parche(f, [("P3.temprano(function () { adelanta = true; pideThree(); arma(); });",
                "P3.temprano(function () { adelanta = true; pideThree(); arma(); pideFotos(); });      // (2026-11-15) las fotos de las tarjetas también, apenas carga el inicio: al llegar bajando rápido aparecían vacías ~0,9 s")])
