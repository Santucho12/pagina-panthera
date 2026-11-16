# Limpia el BLANCO que el recorte dejó en un charm (2026-11-12): el fleco blanco alrededor de la pieza y el interior de un aro
# que quedó pintado de blanco (el fondo de la foto) en vez de transparente. Pasaba en Mickey gold (cmic) y Flor rose (flor): con el
# escenario blanco no se notaba, pero contra la cadena o contra otro charm se veía un parche blanco.
#   python limpia_blancos.py cmic,flor [--vista]
# Trabaja sobre lo ya recortado en la tienda (no vuelve a recortar): arma/charms/<k>.webp (la de la tarjeta) y
# arma/charms-hd/<k>.webp (la del 3D); rehace el relieve (<k>-n.webp) y el contorno (arma/contornos.js). El tamaño de las fotos no
# cambia: ag, asp y hueco de armar.tpl siguen valiendo. Con --vista no escribe: deja antes/después en limpia-vista/ para mirar.
# SOLO para piezas que no tienen blanco propio en el borde (doradas, rosé): en una de plata se comería los brillos del canto.
import os, sys
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from recorte import relieve, contorno, guarda_contornos, TIENDA  # noqa: E402


def limpia(im):
    arr = np.asarray(im.convert('RGBA')).astype(np.float32)
    rgb, a = arr[..., :3], arr[..., 3] / 255.0
    h, w = a.shape
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    r = max(1, round(max(h, w) / 500))
    afuera = a < 0.35
    # 1) el fleco: blanco (muy claro y sin color) pegado al borde de afuera de la pieza
    blanco = (mn >= 232) & (mx - mn <= 16) & (a > 0.35)
    lab, n = ndi.label(blanco, structure=np.ones((3, 3)))
    fuera = np.zeros_like(blanco); fleco = interior = 0
    if n:
        toca = np.zeros(n + 1, bool); toca[np.unique(lab[ndi.binary_dilation(afuera, iterations=2) & (lab > 0)])] = True
        fuera = toca[lab]; fleco = int(fuera.sum())
    # 2) el interior de un aro: blanco PURO y liso, encerrado, grande y macizo (una piedra clara tiene facetas y líneas: no entra)
    puro = (mn >= 247) & (mx - mn <= 8) & (a > 0.35) & ~fuera
    lab2, n2 = ndi.label(puro, structure=np.ones((3, 3)))
    if n2:
        areas = ndi.sum(puro, lab2, range(1, n2 + 1))
        macizo = ndi.binary_opening(puro, iterations=3 * r)
        for i in range(1, n2 + 1):
            if areas[i - 1] < 0.008 * h * w: continue
            if ndi.sum(macizo, lab2, i) < 0.6 * areas[i - 1]: continue
            m = lab2 == i
            # (lo claro pegado a ese blanco también es fondo: se suma lo que lo rodea hasta el metal)
            m = ndi.binary_dilation(m, iterations=2 * r) & blanco | m
            fuera |= m; interior += int(m.sum())
    if not fuera.any(): return im, 0, 0
    # el borde nuevo: se come 1–2 px más (ahí el color está mezclado con el blanco) y queda suave
    cerca = ndi.binary_dilation(fuera, iterations=r + 1)
    a2 = a.copy(); a2[fuera] = 0
    claro = cerca & (mn >= 205) & (mx - mn <= 40)             # el pixel de transición (casi blanco) pegado a lo que se sacó
    a2[claro] = 0
    a2[(a2 < 0.7) & (mn >= 215) & (mx - mn <= 30)] = 0         # restos del fleco, medio transparentes
    suave = ndi.gaussian_filter(a2, 0.6 * r)
    zona = ndi.binary_dilation(fuera | claro, iterations=2 * r + 1)
    a2[zona] = np.minimum(a2[zona], suave[zona])
    # sin islitas sueltas (pedacitos del fleco que quedaron lejos de la pieza)
    lab3, n3 = ndi.label(a2 > 0.35)
    if n3 > 1:
        ar = ndi.sum(a2 > 0.35, lab3, range(1, n3 + 1)); chicas = np.where(ar < 0.02 * ar.max())[0] + 1
        if len(chicas): a2[ndi.binary_dilation(np.isin(lab3, chicas), iterations=2)] = 0
    a2[~ndi.binary_dilation(a2 > 0.5, iterations=2 * r)] = 0      # nada medio transparente lejos de la pieza
    out = np.dstack([rgb, a2 * 255.0]).round().astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), fleco, interior


if __name__ == '__main__':
    ks = [k for k in sys.argv[1].split(',') if k]
    vista = '--vista' in sys.argv
    dv = os.path.join(AQUI, 'limpia-vista'); os.makedirs(dv, exist_ok=True)
    conts = {}
    for k in ks:
        for carpeta, calidad in (('charms-hd', 90), ('charms', 88)):
            ruta = os.path.join(TIENDA, carpeta, k + '.webp')
            antes = Image.open(ruta).convert('RGBA')
            despues, fleco, interior = limpia(antes)
            print(k.ljust(5), carpeta.ljust(10), antes.size, '· fleco', fleco, 'px · interior', interior, 'px')
            # antes y después sobre un fondo oscuro, para mirar
            par = Image.new('RGBA', (antes.width * 2 + 10, antes.height), (50, 60, 80, 255))
            par.alpha_composite(antes, (0, 0)); par.alpha_composite(despues, (antes.width + 10, 0))
            par.convert('RGB').save(os.path.join(dv, k + '-' + carpeta + '.jpg'), quality=88)
            if vista or (fleco == 0 and interior == 0): continue
            despues.save(ruta, 'WEBP', quality=calidad, alpha_quality=100, method=6)
            if carpeta == 'charms-hd':
                relieve(despues).save(os.path.join(TIENDA, carpeta, k + '-n.webp'), 'WEBP', quality=92, method=6)
                conts[k] = contorno(despues)
    if conts and not vista:
        guarda_contornos(conts, TIENDA)
        print('contornos.js: ' + ', '.join(sorted(conts)))
