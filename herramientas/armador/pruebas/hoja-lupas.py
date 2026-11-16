# Hoja de contacto de las capturas de lupa de enhebrado.mjs: python hoja-lupas.py <carpeta> <salida.jpg> [k1,k2,...] [columnas]
import sys, os
from PIL import Image, ImageDraw
carpeta, sale = sys.argv[1], sys.argv[2]
ks = [k for k in (sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else []) if k]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
if not ks: ks = sorted(f[5:-4] for f in os.listdir(carpeta) if f.startswith('lupa-'))
T = (430, 300)
tiles = []
for k in ks:
    f = os.path.join(carpeta, 'lupa-%s.png' % k)
    if not os.path.exists(f): continue
    im = Image.open(f).convert('RGB'); w, h = im.size
    rec = im.crop((int(w * 0.16), int(h * 0.40), int(w * 0.84), int(h * 0.76)))     # la zona del aro, en el medio de la lupa
    rec = rec.resize(T, Image.LANCZOS); tiles.append((k, rec))
rows = (len(tiles) + cols - 1) // cols
hoja = Image.new('RGB', (cols * T[0], rows * (T[1] + 20)), 'white'); d = ImageDraw.Draw(hoja)
for i, (k, rec) in enumerate(tiles):
    x, y = (i % cols) * T[0], (i // cols) * (T[1] + 20); hoja.paste(rec, (x, y + 20)); d.text((x + 6, y + 4), k, fill='black')
hoja.save(sale, quality=88); print(hoja.size, len(tiles))
