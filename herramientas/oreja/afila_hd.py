# Afila las fotos HD de los aros (2026-11-14, "los aritos se siguen viendo irreales, mejorá los recortes"): las fotos de la tienda son
# chicas y el escalado con IA las deja blandas; al lado de la oreja (nítida) y de la argolla 3D parecían pegadas. Enfoque suave en el
# color (máscara de desenfoque en dos radios) y borde del recorte más firme y 1 px más adentro (sin el fleco claro del fondo).
# Parte SIEMPRE de los originales del respaldo, así se puede repetir sin acumular: python herramientas/oreja/afila_hd.py
import glob, os, sys
from PIL import Image, ImageFilter, ImageChops
ORIG = 'respaldos/2026-11-14-armadores-antes-de-realismo/aros-hd'
SAL = 'tienda/static/panthera/oreja/aros-hd'
n = 0
for f in sorted(glob.glob(ORIG + '/*.webp')):
    if f.endswith('-n.webp'): continue
    im = Image.open(f).convert('RGBA'); r, g, b, a = im.split()
    rgb = Image.merge('RGB', (r, g, b))
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=3.2, percent=85, threshold=2)).filter(ImageFilter.UnsharpMask(radius=1.1, percent=70, threshold=2))
    a2 = a.filter(ImageFilter.MinFilter(3))                                  # 1 px adentro: saca el fleco
    a2 = a2.point(lambda v: 0 if v < 70 else (255 if v > 185 else int((v - 70) * 255 / 115)))   # borde más firme
    a2 = a2.filter(ImageFilter.GaussianBlur(0.6))
    a2 = ImageChops.darker(a2, a)                                            # nunca más opaco que el original
    Image.merge('RGBA', (*rgb.split(), a2)).save(os.path.join(SAL, os.path.basename(f)), 'WEBP', quality=92, method=6)
    n += 1
print('afiladas', n)
