# Arma la tira de capturas de fluidez.mjs: python tira.py <carpeta con lista.json> <salida.jpg> [columnas]
import sys, json, os
from PIL import Image, ImageDraw

carpeta, sale = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
lista = json.load(open(os.path.join(carpeta, 'lista.json'), encoding='utf-8'))
ANCHO = 520
ims = []
for f, t in lista:
    im = Image.open(f).convert('RGB')
    im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
    ims.append((im, t))
if not ims:
    raise SystemExit('sin cuadros')
alto = ims[0][0].height
filas = (len(ims) + cols - 1) // cols
hoja = Image.new('RGB', (cols * ANCHO, filas * (alto + 22)), 'white')
d = ImageDraw.Draw(hoja)
for i, (im, t) in enumerate(ims):
    x, y = (i % cols) * ANCHO, (i // cols) * (alto + 22)
    hoja.paste(im, (x, y + 22))
    d.text((x + 6, y + 4), ('%+d ms' % t), fill='black')
hoja.save(sale, quality=82)
