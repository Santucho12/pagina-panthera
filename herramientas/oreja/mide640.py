# Alto de cada aro de estudio en su foto original de 640 (las fotos de estudio están sacadas a la misma distancia): fondo
# estimado en chiquito (mediana sobre 80x80 y agrandado), diferencia de color, la mancha principal y su alto en píxeles.
import json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
aros = json.load(open('aros.json', encoding='utf-8'))
meta = json.load(open('aros-meta.json', encoding='utf-8'))
txt = open('recorta_aros.py', encoding='utf-8').read(); ns = {}
exec(txt[txt.index('SELECCION = {'):txt.index('PRODUCTOS =')], ns); SEL = ns['SELECCION']
res = {}
for k, (nombre, tipo) in SEL.items():
    if tipo != 'estudio': continue
    idx = [i for i, p in enumerate(aros) if nombre.lower() in p['nombre'].lower()]
    if len(idx) != 1: print(k, 'ambiguo', len(idx)); continue
    foto = Image.open(f'f640/{idx[0]:02d}.webp').convert('RGB'); im = np.asarray(foto).astype(np.float32)
    chica = np.asarray(foto.resize((80, 80), Image.BOX)).astype(np.float32)
    chica = ndi.median_filter(chica, size=(9, 9, 1))
    fondo = np.asarray(Image.fromarray(chica.round().astype(np.uint8)).resize(foto.size, Image.BILINEAR)).astype(np.float32)
    m = np.linalg.norm(im - fondo, axis=2) > 26
    m = ndi.binary_opening(m, iterations=1)
    lab, n = ndi.label(ndi.binary_dilation(m, iterations=3))
    if n == 0: continue
    areas = ndi.sum(np.ones(m.shape), lab, range(1, n + 1)); g = int(np.argmax(areas)) + 1
    ys, xs = np.where(lab == g)
    res[k] = int(ys.max() - ys.min())
porAro = {k: meta[k]['px'][1] / (meta[k]['aroW'] * meta[k]['px'][0]) * 0.44 for k in res}
for k in sorted(res, key=lambda k: res[k]):
    print(k.ljust(5), 'alto en foto', str(res[k]).rjust(4), 'px · alto por aro', str(round(porAro[k], 2)).ljust(5), '· razón x100', round(porAro[k] / res[k] * 100, 3))
json.dump(res, open('alto640.json', 'w'), indent=0)
