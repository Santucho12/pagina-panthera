# Hoja de control de los recortes: cada charm sobre fondo oscuro y sobre rosa (deja ver halos blancos y huecos rellenos)
import os, sys
from PIL import Image, ImageDraw
os.chdir(os.path.dirname(os.path.abspath(__file__)))
carpeta = sys.argv[1] if len(sys.argv) > 1 else 'im_rgba'
salida = sys.argv[2] if len(sys.argv) > 2 else 'z_rgba.png'
ks = sorted(f[:-5] for f in os.listdir(carpeta) if f.endswith('.webp'))
T = 230; cols = 7
filas = (len(ks) + cols - 1) // cols
s = Image.new('RGB', (cols * (T * 2 + 8), filas * (T + 20)), (255, 255, 255)); d = ImageDraw.Draw(s)
for i, k in enumerate(ks):
    im = Image.open(os.path.join(carpeta, k + '.webp')).convert('RGBA'); im.thumbnail((T - 10, T - 10), Image.LANCZOS)
    x = (i % cols) * (T * 2 + 8); y = (i // cols) * (T + 20)
    for j, fondo in enumerate([(38, 38, 42), (236, 150, 180)]):
        b = Image.new('RGBA', (T, T), fondo + (255,)); b.alpha_composite(im, ((T - im.width) // 2, (T - im.height) // 2))
        s.paste(b.convert('RGB'), (x + j * T, y + 18))
    d.text((x + 3, y + 3), k, fill=(0, 0, 0))
s.save(salida); print('ok', len(ks), s.size)
