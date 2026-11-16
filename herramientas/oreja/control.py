# Hoja de control de los recortes: todos sobre rosa claro, mismo alto, con su clave
import sys, glob, os
from PIL import Image, ImageDraw
fs = sorted(glob.glob('artefacto/aros-hd/*.webp')); fs = [f for f in fs if not f.endswith('-n.webp')]
H = 210; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 11
celdas = []
for f in fs:
    a = Image.open(f).convert('RGBA'); s = H / a.height; a = a.resize((max(1, int(a.width * s)), H), Image.LANCZOS)
    if a.width > 260: a = a.resize((260, int(a.height * 260 / a.width)), Image.LANCZOS)
    fondo = Image.new('RGBA', (max(a.width, 70) + 12, H + 22), (252, 230, 238, 255)); fondo.alpha_composite(a, ((fondo.width - a.width) // 2, 0))
    ImageDraw.Draw(fondo).text((4, H + 6), os.path.basename(f)[:-5], fill=(0, 0, 0, 255)); celdas.append(fondo.convert('RGB'))
filas = [celdas[i:i + cols] for i in range(0, len(celdas), cols)]
W = max(sum(c.width for c in f) + 6 * len(f) for f in filas); hoja = Image.new('RGB', (W, len(filas) * (H + 28)), 'white')
for j, f in enumerate(filas):
    x = 0
    for c in f: hoja.paste(c, (x, j * (H + 28))); x += c.width + 6
hoja.save(sys.argv[1], quality=82); print(hoja.size, len(celdas))
