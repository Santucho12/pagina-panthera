# Saca la varilla de acrílico del exhibidor que cruza un aro recortado (2026-11-12: "apo2", y como estaba anotado en el LEEME para
# "brig"): una línea fina y larga, casi horizontal, pegada a la pieza. Se abre la máscara en vertical (lo que mide menos de ~1,2 % del
# alto desaparece: la varilla), se queda la pieza principal y se vuelve a la máscara original solo pegada a ella. Después rehace la
# tarjeta, el relieve y las medidas del aro en aros-meta.json (como el paso 5 de recorta_aros.py).
# Uso: python limpia_aros.py clave1,clave2     (luego: python mide_argollas.py && python construye.py)
import os, sys, json
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
import recorta_aros as R   # noqa: E402  (solo para contorno() y relieve())

SALIDA = os.path.join(AQUI, 'artefacto')
ruta = os.path.join(AQUI, 'aros-meta.json')
meta = json.load(open(ruta, encoding='utf-8'))
for k in sys.argv[1].split(','):
    im = Image.open(os.path.join(SALIDA, 'aros-hd', k + '.webp')).convert('RGBA')
    arr = np.asarray(im).copy(); a = arr[..., 3] > 127; H, W = a.shape
    fino = int(os.environ.get('FINO', 0)) or max(9, int(round(0.012 * H)))      # px de alto de lo que se saca (la varilla de apo2 mide ~16 a 900 px de alto: FINO=30)
    abierta = ndi.binary_opening(a, structure=np.ones((fino, 1), bool))
    lab, n = ndi.label(abierta, structure=np.ones((3, 3)))
    areas = ndi.sum(abierta, lab, range(1, n + 1)); pieza = lab == (int(np.argmax(areas)) + 1)
    # la pieza y lo que la rodea a 3 px (el borde suave); lo demás, afuera
    cerca = ndi.binary_dilation(pieza, iterations=3)
    arr[..., 3] = np.where(cerca, arr[..., 3], 0)
    ys, xs = np.where(arr[..., 3] > 10)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    hd = Image.fromarray(arr[y0:y1, x0:x1], 'RGBA')
    hd.save(os.path.join(SALIDA, 'aros-hd', k + '.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
    R.relieve(hd).save(os.path.join(SALIDA, 'aros-hd', k + '-n.webp'), 'WEBP', quality=92, method=6)
    t = hd.copy(); t.thumbnail((400, 400), Image.LANCZOS)
    t.save(os.path.join(SALIDA, 'aros', k + '.webp'), 'WEBP', quality=86, alpha_quality=100, method=6)
    A = np.asarray(hd)[..., 3] > 127; h, w = A.shape
    def tramo(y):
        xs_ = np.where(A[y])[0]
        return (xs_.min(), xs_.max()) if len(xs_) else None
    anchos = [t_ for t_ in (tramo(int(h * f)) for f in np.linspace(0.04, 0.14, 6)) if t_]
    aroW = max((b - a_ + 1) for a_, b in anchos) / w if anchos else 0.3
    aroCx = np.mean([(a_ + b) / 2 for a_, b in anchos]) / w if anchos else 0.5
    m = meta[k]; m.update({'asp': round(w / h, 4), 'aroW': round(aroW, 4), 'aroCx': round(float(aroCx), 4), 'px': [w, h], 'cont': R.contorno(hd)})
    print(k.ljust(5), (W, H), '->', (w, h), 'asp', m['asp'], 'aroW', m['aroW'], 'huecos', len(m['cont']) - 1)
json.dump(meta, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False)
