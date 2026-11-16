# Hoja de control: cada recorte sobre rosa claro y sobre negro, con su foto al lado
import sys
from PIL import Image
pares = sys.argv[2:]
h = 300; filas = []
for f in pares:
    a = Image.open(f).convert('RGBA')
    fondo1 = Image.new('RGBA', a.size, (252, 230, 238, 255)); fondo1.alpha_composite(a)
    fondo2 = Image.new('RGBA', a.size, (20, 20, 20, 255)); fondo2.alpha_composite(a)
    ims = [fondo1.convert('RGB'), fondo2.convert('RGB')]
    ims = [i.resize((int(i.width * h / i.height), h)) for i in ims]
    W = sum(i.width for i in ims) + 10; fila = Image.new('RGB', (W, h), 'white'); x = 0
    for i in ims: fila.paste(i, (x, 0)); x += i.width + 10
    filas.append(fila)
W = max(f.width for f in filas); H = sum(f.height for f in filas) + 10 * (len(filas) - 1)
hoja = Image.new('RGB', (W, H), 'white'); y = 0
for f in filas: hoja.paste(f, (0, y)); y += f.height + 10
hoja.save(sys.argv[1], quality=85); print(hoja.size)
