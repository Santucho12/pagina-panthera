# Retoque de los recortes dorados de estudio: corta lo que queda arriba del aro (restos del exhibidor de acrílico: un capuchón
# blanco o gris) desde la primera fila con dorado de verdad, y vuelve a sacar tarjeta, relieve, contorno y medidas.
# Uso: python retoca.py [k1,k2,...]   (sin claves: todos los dorados de estudio)
import os, sys, json
import numpy as np
from PIL import Image
import cv2
import recorta_aros as R

ruta = os.path.join(R.AQUI, 'aros-meta.json')
meta = json.load(open(ruta, encoding='utf-8'))
ks = sys.argv[1].split(',') if len(sys.argv) > 1 else [k for k, m in meta.items() if m['tipo'] == 'estudio' and k not in ('plan', 'boli')]
for k in ks:
    f = os.path.join(R.SALIDA, 'aros-hd', k + '.webp')
    im = Image.open(f).convert('RGBA'); arr = np.asarray(im).copy()
    a = arr[..., 3] > 127
    hsv = cv2.cvtColor(arr[..., :3], cv2.COLOR_RGB2HSV).astype(np.float32)
    oro = a & (hsv[..., 0] >= 10) & (hsv[..., 0] <= 32) & (hsv[..., 1] > 90) & (hsv[..., 2] > 90)
    filas = np.where(oro.sum(1) >= max(3, int(arr.shape[1] * 0.04)))[0]
    if not len(filas): print(k, 'sin dorado: queda igual'); continue
    y0 = max(0, filas[0] - 2)
    if y0 < 3: print(k, 'nada que cortar'); continue
    arr[:y0, :, 3] = 0
    ys, xs = np.where(arr[..., 3] > 10)
    arr = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    hd = Image.fromarray(arr, 'RGBA')
    hd.save(f, 'WEBP', quality=90, alpha_quality=100, method=6)
    R.relieve(hd).save(os.path.join(R.SALIDA, 'aros-hd', k + '-n.webp'), 'WEBP', quality=92, method=6)
    t = hd.copy(); t.thumbnail((400, 400), Image.LANCZOS)
    t.save(os.path.join(R.SALIDA, 'aros', k + '.webp'), 'WEBP', quality=86, alpha_quality=100, method=6)
    A = arr[..., 3] > 127; h, w = A.shape
    tramos = []
    for fr in np.linspace(0.04, 0.14, 6):
        x_ = np.where(A[int(h * fr)])[0]
        if len(x_): tramos.append((x_.min(), x_.max()))
    m = meta[k]
    m['px'] = [w, h]; m['asp'] = round(w / h, 4)
    if tramos: m['aroW'] = round(max(b - a_ + 1 for a_, b in tramos) / w, 4); m['aroCx'] = round(float(np.mean([(a_ + b) / 2 for a_, b in tramos]) / w), 4)
    m['cont'] = R.contorno(hd); m['retocado'] = int(y0)
    print(k.ljust(5), 'cortadas', y0, 'filas · ahora', [w, h], 'aroW', m['aroW'])
json.dump(meta, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False)
