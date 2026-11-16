"""Clip chiquito para un círculo de "Seguinos en redes": recorte cuadrado que SIGUE a un objeto de color (por ejemplo el moño rosa de un
arito) con la trayectoria suavizada, a 200x200. Sirve cuando el objeto se mueve de lado a lado en el cuadro y un recorte fijo lo achicaría.

Uso (necesita Python con opencv-python, numpy y scipy, y ffmpeg en el PATH):
    python clip_circulo_sigue.py entrada.mp4 salida.mp4 [--recorte 560] [--y 730] [--hue 150 175] [--sat-min 77] [--val-min 153]

  entrada   el video vertical original (1080x1920)
  salida    el clip de 200x200 (sin audio, h264, ~60 KB)
  --recorte lado del recorte cuadrado en píxeles del cuadro original (más chico = más cerca del objeto)
  --y       borde de arriba del recorte (fijo); poné el objeto un poco más abajo del centro si arriba hay algo que querés mostrar (aritos)
  --hue     rango de tono (0-179 de OpenCV) del objeto a seguir; el rosa del moño es 150-175
Después sacar la foto fija del primer cuadro:  ffmpeg -i salida.mp4 -frames:v 1 -c:v libwebp -quality 85 salida.webp
Ejemplo real: "Aritos" (2026-11-11), --recorte 560 --y 730 sobre el moño rosa. Ver snipplets/panthera/redes.tpl y LEEME.md."""
import argparse
import subprocess
import sys

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter1d

sys.stdout.reconfigure(encoding='utf-8')
ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
ap.add_argument('entrada')
ap.add_argument('salida')
ap.add_argument('--recorte', type=int, default=560)
ap.add_argument('--y', type=int, default=730)
ap.add_argument('--lado', type=int, default=200)
ap.add_argument('--hue', type=int, nargs=2, default=[150, 175])
ap.add_argument('--sat-min', type=int, default=77)
ap.add_argument('--val-min', type=int, default=153)
a = ap.parse_args()

cap = cv2.VideoCapture(a.entrada)
cuadros, xs = [], []
while True:
    ok, f = cap.read()
    if not ok:
        break
    cuadros.append(f)
    chico = cv2.resize(f, (f.shape[1] // 2, f.shape[0] // 2), interpolation=cv2.INTER_AREA)
    m = cv2.inRange(cv2.cvtColor(chico, cv2.COLOR_BGR2HSV), (a.hue[0], a.sat_min, a.val_min), (a.hue[1], 255, 255))
    yy, xx = np.nonzero(m)
    xs.append(xx.mean() * 2 if len(xx) > 30 else np.nan)
cap.release()
if not cuadros:
    sys.exit('No se pudo leer el video: ' + a.entrada)
ancho = cuadros[0].shape[1]
xs = np.array(xs, dtype=float)
buenos = ~np.isnan(xs)
if not buenos.any():
    sys.exit('No se encontró el color en ningún cuadro: probá otro --hue / --sat-min / --val-min')
xs = np.interp(np.arange(len(xs)), np.nonzero(buenos)[0], xs[buenos])
suave = gaussian_filter1d(xs, sigma=2.0, mode='nearest')
print('cuadros:', len(cuadros), '| sin detectar:', int((~buenos).sum()), '| objeto en x de %d a %d' % (xs.min(), xs.max()))

ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{a.lado}x{a.lado}', '-r', '24', '-i', '-',
                       '-an', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', a.salida],
                      stdin=subprocess.PIPE)
desvio = 0
for i, f in enumerate(cuadros):
    X = int(round(min(max(suave[i] - a.recorte / 2, 0), ancho - a.recorte)))
    ff.stdin.write(cv2.resize(f[a.y:a.y + a.recorte, X:X + a.recorte], (a.lado, a.lado), interpolation=cv2.INTER_AREA).tobytes())
    desvio = max(desvio, abs(xs[i] - (X + a.recorte / 2)))
ff.stdin.close()
ff.wait()
print('listo:', a.salida, '| el objeto se aleja del centro del recorte, como mucho', int(desvio), 'px (la mitad del recorte es', a.recorte // 2, ')')
