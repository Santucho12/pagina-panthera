# Prepara la foto real de la oreja (Sam Badmaeva, Unsplash, licencia libre) para "Armá tu oreja":
# recorte, un retoque suave (más luz, menos rojo en los capilares de arriba), la máscara del lóbulo (donde el lado de atrás de cada
# argolla queda escondido) y los datos para la escena (escala, agujeros, encuadres). Todo en píxeles de la foto recortada.
import json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
Y_CORTE = 600
im = Image.open('fotos/oreja-real.jpg').convert('RGB').crop((0, Y_CORTE, 2400, 3600))
a = np.asarray(im).astype(np.float32) / 255.0
# retoque: un poco más de exposición y sombras apenas levantadas
a = np.clip(a * 1.09, 0, 1); a = a * 0.95 + 0.035
# capilares rojos de la parte de arriba de la oreja: menos saturación en los rojos/magentas de esa zona (con borde suave)
import colorsys
h, w, _ = a.shape
mx, mn = a.max(2), a.min(2); sat = (mx - mn) / np.maximum(mx, 1e-4)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
rojo = np.clip((r - np.maximum(g, b)) / np.maximum(mx, 1e-4) * 3.0 - 0.55, 0, 1)         # cuánto más rojo que la piel
zona = Image.new('L', (w, h), 0); ImageDraw.Draw(zona).ellipse((480, 450, 1350, 1500), fill=255)
zona = np.asarray(zona.filter(ImageFilter.GaussianBlur(120))).astype(np.float32) / 255.0
k = (0.55 * rojo * zona)[..., None]
gris = a.mean(2, keepdims=True); piel = np.dstack([gris * 1.08, gris * 0.93, gris * 0.86])
a = a * (1 - k) + np.clip(piel, 0, 1) * k
EXT = 500
espejo = a[:, -1:-EXT - 1:-1]                                     # las últimas 500 columnas, al revés
from PIL import ImageFilter as _IF
esp = np.asarray(Image.fromarray((np.clip(espejo, 0, 1) * 255).astype(np.uint8)).filter(_IF.GaussianBlur(2.5))).astype(np.float32) / 255.0
ancho = np.concatenate([a, esp], axis=1)
mezcla = np.clip((np.arange(EXT) / 40.0), 0, 1)[None, :, None]     # 40 px de transición entre la foto y su espejo
ancho[:, w:] = espejo * (1 - mezcla) + esp * mezcla
a = ancho; w = a.shape[1]
Image.fromarray((np.clip(a, 0, 1) * 255).round().astype(np.uint8)).save('artefacto/foto-oreja.webp', 'WEBP', quality=84, method=6)
# máscara del lóbulo (y la parte baja de la oreja): 1 = tejido de la oreja delante del lado de atrás de la argolla
LOBULO = [(970, 2150), (955, 2250), (982, 2345), (1040, 2432), (1110, 2497), (1190, 2534), (1270, 2546), (1342, 2533), (1408, 2500),
          (1462, 2450), (1500, 2382), (1520, 2300), (1532, 2200), (1505, 2118), (1400, 2075), (1200, 2072), (1050, 2095)]
F = 8
m = Image.new('L', (w // F, h // F), 0)
ImageDraw.Draw(m).polygon([(x / F, (y - Y_CORTE) / F) for x, y in LOBULO], fill=255)
m = m.filter(ImageFilter.GaussianBlur(1.2)); m.save('artefacto/foto-lobulo.png', optimize=True)
ESC = 6.1 / 1692.0          # unidades de la escena por píxel (la oreja mide ~1692 px de alto = 6,1, como antes)
datos = {'w': w, 'h': h, 'escala': ESC,
         'foco': [1560, 1840], 'alto': 2000,              # compu: de la mitad del hélix a los dijes, la oreja a la izquierda (el total va a la derecha)
         'focoCel': [1160, 1500], 'altoCel': 2600,        # celular: la oreja entera
         'agujeros': {'l1': [1425, 2425 - Y_CORTE], 'l2': [1252, 2402 - Y_CORTE], 'l3': [1078, 2338 - Y_CORTE], 'cuff': [712, 1700 - Y_CORTE]}}
json.dump(datos, open('artefacto/foto-oreja.json', 'w'), indent=1)
import os
print({f: os.path.getsize('artefacto/' + f) for f in ['foto-oreja.webp', 'foto-lobulo.png', 'foto-oreja.json']}, (w, h))
