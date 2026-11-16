# Hoja de comparación antes/después: python herramientas/armador/pruebas/compara.py <etiquetaA> <etiquetaB> [nombres] [salida] [ancho]
# Pone lado a lado las capturas con el mismo nombre de capturas/<A>/ y capturas/<B>/ (por defecto: todas las que estén en las dos),
# con el nombre de cada una arriba. Ej.: compara.py antes f1 d-ejemplo,d-vit-crys
import os, sys
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
A, B = sys.argv[1], sys.argv[2]
DA, DB = os.path.join(AQUI, 'capturas', A), os.path.join(AQUI, 'capturas', B)
nombres = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else sorted(f[:-4] for f in os.listdir(DA) if f.endswith('.png') and os.path.exists(os.path.join(DB, f)))
salida = sys.argv[4] if len(sys.argv) > 4 else os.path.join(AQUI, 'capturas', 'compara-%s-%s.png' % (A, B))
ANCHO = int(sys.argv[5]) if len(sys.argv) > 5 else 760
try:
    fuente = ImageFont.truetype('arial.ttf', 22)
except Exception:
    fuente = ImageFont.load_default()
filas = []
for n in nombres:
    par = []
    for d in (DA, DB):
        im = Image.open(os.path.join(d, n + '.png')).convert('RGB')
        im = im.resize((ANCHO, int(im.height * ANCHO / im.width)), Image.LANCZOS)
        par.append(im)
    alto = max(p.height for p in par)
    fila = Image.new('RGB', (ANCHO * 2 + 30, alto + 40), (255, 255, 255))
    d = ImageDraw.Draw(fila)
    for i, p in enumerate(par):
        fila.paste(p, (i * (ANCHO + 30), 36))
        d.text((i * (ANCHO + 30) + 4, 6), '%s · %s' % ((A, B)[i], n), fill=(0, 0, 0), font=fuente)
    filas.append(fila)
hoja = Image.new('RGB', (filas[0].width, sum(f.height for f in filas) + 10 * len(filas)), (230, 230, 230))
y = 0
for f in filas:
    hoja.paste(f, (0, y)); y += f.height + 10
hoja.save(salida)
print(salida, hoja.size)
