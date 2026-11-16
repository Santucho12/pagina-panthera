# Recorte de calidad de las fotos de charms (fondo blanco -> transparente) — v3, 2026-11-11.
# Para cada charm deja:
#   - im_rgba/<clave>.webp ............ el recorte liviano de siempre (desde la foto de 640): las tarjetas usan esta (opción --liviana)
#   - tienda/static/panthera/arma/charms-hd/<clave>.webp .... la foto en alta para el 3D (desde la de 1024 o la escalada con IA)
#   - tienda/static/panthera/arma/charms-hd/<clave>-n.webp .. su mapa de relieve (normales): bordes redondeados + el detalle de la foto
#   - tienda/static/panthera/arma/contornos.js ........ el contorno simplificado de la pieza (el 3D la extruye: volumen real)
# El recorte (qué es pieza y qué es fondo) se calcula como siempre sobre la foto de 640 (im_hd/), que es el algoritmo probado, y esa
# forma se lleva a la foto grande (im_1024/ o esrgan/<clave>-x4.png). Uso:
#   python recorte.py                      todos los charms de im_hd/
#   python recorte.py jaz,moon             solo esos
#   python recorte.py --liviana jaz        también rehace el recorte liviano (im_rgba/, después se copia a arma/charms/)
#   python recorte.py --ia moon            usa la foto escalada con Real-ESRGAN (esrgan/<clave>-x4.png; si no está, la genera)
#   python recorte.py --vista ...          deja las salidas en esrgan/vista/ en vez de la tienda (para mostrar antes de usar)
# Necesita Python con numpy, scipy, pillow y opencv-python.
#
# Cómo se recorta (sin cambios desde la v2):
# - el fondo es lo casi blanco CONECTADO al borde, pero buscado sobre una máscara erosionada: así no se "escapa"
#   por los brillos de la plata que tocan el borde de la pieza (eso dejaba agujeros por donde se veía la cadena);
# - se saca el REFLEJO del piso de la foto (la mancha gris clara debajo de cada charm). Es una zona clara, sin color y
#   suave (sin bordes), pegada al fondo y en la parte de abajo: se inunda desde el fondo por esos píxeles y la inundación
#   se frena en el borde marcado de la pieza;
# - después se rellena todo hueco interno (la pieza queda sólida) y se sacan motas sueltas;
# - el borde se suaviza 1-2 px y se le quita el blanco (des-contaminación), para que no quede halo.
import os, sys, json, subprocess
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = os.path.join(AQUI, 'im_hd'), os.path.join(AQUI, 'im_rgba')
GRANDE, IA = os.path.join(AQUI, 'im_1024'), os.path.join(AQUI, 'esrgan')
# PNT_SALIDA_ARMA: escribir en otra carpeta (2026-11-11): si se escribe directo en tienda/, el preview recarga la página de quien
# la está mirando con cada foto nueva; se copia todo junto al final
TIENDA = os.environ.get('PNT_SALIDA_ARMA') or os.path.normpath(os.path.join(AQUI, '..', '..', 'tienda', 'static', 'panthera', 'arma'))
os.makedirs(SRC, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
CORTE_ABAJO = {'estr': 0.86, 'glob': 0.90}   # reflejos que no se van solos: se cortan derecho
# reflejo: (fracción de abajo donde se busca, claridad mínima, borde máximo que deja pasar la inundación)
REFLEJO = {'_': (0.18, 70, 13.0)}
CORTE_FILAS = {}   # hasta qué fracción de abajo puede subir el corte por filas (por defecto 12 %)
LADO_HD = 1024     # la foto en alta del 3D no pasa de 1024 px del lado largo (memoria de la placa de video)
LADO_N = 512       # el mapa de relieve, 512


def mascara(k):
    """Alfa suave (0..1) de la pieza sobre la foto de 640, la foto (RGB) y la caja del recorte (y0, y1, x0, x1)."""
    im = np.asarray(Image.open(os.path.join(SRC, k + '.webp')).convert('RGB')).astype(np.float32)
    h, w, _ = im.shape
    mn = im.min(axis=2); mx = im.max(axis=2)
    lum = im[..., 0] * 0.299 + im[..., 1] * 0.587 + im[..., 2] * 0.114
    cand = mn >= 241
    er = ndi.binary_erosion(cand, iterations=3, border_value=1)
    lab, n = ndi.label(er)
    borde = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    borde = borde[borde > 0]
    core = np.isin(lab, borde)
    bg = ndi.binary_dilation(core, iterations=4) & cand
    prod = ~bg
    zf, lmin, gmax = REFLEJO.get(k, REFLEJO['_'])
    if zf > 0:
        ys = np.where(prod.any(axis=1))[0]
        zona = np.zeros_like(prod); zona[int(ys[0] + (ys[-1] - ys[0]) * (1 - zf)):] = True
        ls = ndi.gaussian_filter(lum, 1.0)
        grad = np.hypot(ndi.sobel(ls, 0), ndi.sobel(ls, 1)) / 8.0
        sat = (mx - mn) / np.maximum(mx, 1)
        nitido = prod & (grad > 14)
        ult = np.where(nitido.any(axis=0), h - 1 - np.argmax(nitido[::-1], axis=0), -1)
        ult = ndi.maximum_filter1d(ult, 9)
        debajo = np.arange(h)[:, None] > ult[None, :] + 2
        paso = (lum >= lmin) & (sat < 0.12) & (grad < gmax) & zona & debajo
        reg = paso | ~prod
        lab3, n3 = ndi.label(reg)
        ids = np.unique(lab3[~prod]); ids = ids[ids > 0]
        quitar = np.isin(lab3, ids) & prod
        prod = prod & ~quitar
        prod = ndi.binary_opening(prod, iterations=1)
        ys = np.where(prod.any(axis=1))[0]
        if len(ys):
            claro = (lum > 200) & (sat < 0.12)
            frac = np.array([claro[y][prod[y]].mean() if prod[y].any() else 1.0 for y in range(h)])
            fs = np.convolve(frac, np.ones(3) / 3, mode='same')
            tope = int(ys[-1] - (ys[-1] - ys[0]) * CORTE_FILAS.get(k, 0.12))
            y = ys[-1]
            while y > tope and fs[y] > 0.74: y -= 1
            if y < ys[-1] - 1: prod[y + 2:] = False
    lab2, n2 = ndi.label(prod)
    if n2 > 1:
        tam = ndi.sum(prod, lab2, range(1, n2 + 1))
        prod = np.isin(lab2, [i + 1 for i, t in enumerate(tam) if t >= max(60, tam.max() * 0.004)])
    prod = ndi.binary_fill_holes(prod)
    if k in CORTE_ABAJO:
        ys = np.where(prod.any(axis=1))[0]
        lim = int(ys[0] + (ys[-1] - ys[0]) * CORTE_ABAJO[k])
        prod[lim:] = False
    dist = ndi.distance_transform_edt(prod)
    a = prod.astype(np.float32)
    anillo = prod & (dist <= 1.6)
    suave = np.clip((255.0 - mn) / 34.0, 0.0, 1.0)
    a[anillo] = np.clip(np.maximum(suave[anillo], 0.45), 0, 1)
    ys, xs = np.where(a > 0.02)
    caja = (max(0, ys.min() - 2), min(h, ys.max() + 3), max(0, xs.min() - 2), min(w, xs.max() + 3))
    return im, a, caja


def sin_blanco(c, a):
    """Le quita al borde el blanco del fondo de la foto: c = (c - 255 (1 - a)) / a."""
    c = c.copy(); m = (a > 0) & (a < 1)
    for ch in range(3):
        cc = c[..., ch]
        cc[m] = np.clip((cc[m] - 255.0 * (1 - a[m])) / np.maximum(a[m], 0.02), 0, 255)
    return c


def liviana(k, im, a, caja):
    y0, y1, x0, x1 = caja
    rgba = np.dstack([sin_blanco(im, a), a * 255.0])[y0:y1, x0:x1].round().astype(np.uint8)
    out = Image.fromarray(rgba, 'RGBA')
    out.save(os.path.join(OUT, k + '.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    return out


def fuente_grande(k, con_ia):
    if con_ia:
        x4 = os.path.join(IA, k + '-x4.png')
        if not os.path.exists(x4):   # Real-ESRGAN (local, con la placa de video): herramientas/armador/realesrgan/
            os.makedirs(IA, exist_ok=True)
            ent = os.path.join(IA, k + '-in.png')
            # (2026-11-11) desde la de 640, no la de 1024: ×4 da 2560 px, de sobra para la foto HD (1024 de lado), y tarda menos de la
            # mitad; con bloques de 128 (-t 128) para no quedarse sin memoria en esta compu
            Image.open(os.path.join(SRC, k + '.webp')).convert('RGB').save(ent)
            exe = os.path.join(AQUI, 'realesrgan', 'realesrgan-ncnn-vulkan.exe')
            subprocess.run([exe, '-i', ent, '-o', x4, '-n', 'realesrgan-x4plus', '-s', '4', '-t', '128'], check=True, capture_output=True)
        # Real-ESRGAN le inventa una textura de pinceladas al esmalte liso (lo vimos en The Moon): en las zonas de mucho color se
        # suaviza con un filtro bilateral (respeta los bordes); la plata y los grabados quedan como los dejó el escalado
        sv = os.path.join(IA, k + '-x4s.png')
        if not os.path.exists(sv):
            import cv2
            img = cv2.imread(x4, cv2.IMREAD_COLOR)
            bil = cv2.bilateralFilter(img, 9, 38, 7)
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
            color = np.clip((hsv[..., 1] / 255.0 - 0.28) / 0.22, 0, 1) * np.clip(hsv[..., 2] / 255.0 / 0.25, 0, 1)
            color = cv2.GaussianBlur(color, (0, 0), 3)[..., None]
            cv2.imwrite(sv, (img * (1 - color) + bil * color).round().astype(np.uint8))
        return sv
    g = os.path.join(GRANDE, k + '.webp')
    return g if os.path.exists(g) else os.path.join(SRC, k + '.webp')


def alta(k, a640, caja, fuente):
    """La forma del recorte de 640 llevada a la foto grande: foto en alta (RGBA) recortada a la misma caja."""
    hd = np.asarray(Image.open(fuente).convert('RGB')).astype(np.float32)
    H, W = hd.shape[:2]; h, w = a640.shape
    s = W / w
    a = np.asarray(Image.fromarray((a640 * 255).round().astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255.0
    a = np.clip((a - 0.5) * 1.8 + 0.5, 0, 1)          # la forma agrandada queda blanda: el borde se afirma (sigue suave, sin serrucho)
    y0, y1, x0, x1 = [int(round(v * s)) for v in caja]
    rgba = np.dstack([sin_blanco(hd, a), a * 255.0])[y0:y1, x0:x1].round().astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    if max(im.size) > LADO_HD:
        f = LADO_HD / max(im.size); im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
    return im


def relieve(im):
    """Mapa de normales (convención OpenGL, Y arriba): borde redondeado según la distancia al contorno + el detalle de la foto."""
    if max(im.size) > LADO_N:
        f = LADO_N / max(im.size); im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
    arr = np.asarray(im).astype(np.float32)
    a = arr[..., 3] / 255.0; pieza = a > 0.5
    d = ndi.distance_transform_edt(pieza)
    rc = 0.08 * max(arr.shape[:2])                       # radio del canto redondeado (8 % del tamaño)
    t = np.clip(d / rc, 0, 1)
    alto = np.sqrt(1 - (1 - t) ** 2) * rc * 0.85
    lum = (arr[..., 0] * 0.299 + arr[..., 1] * 0.587 + arr[..., 2] * 0.114) / 255.0
    ls = ndi.gaussian_filter(lum, 1.1)
    detalle = (ls - ndi.gaussian_filter(ls, 6)) * rc * 0.35   # lo claro de la foto, apenas más alto (grabados y relieves)
    alto = ndi.gaussian_filter(alto, 0.8) + detalle * pieza
    gy, gx = np.gradient(alto)                            # gy: hacia abajo de la imagen
    n = np.dstack([-gx, gy, np.ones_like(gx)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    n[~pieza] = (0, 0, 1)
    return Image.fromarray(((n * 0.5 + 0.5) * 255).round().astype(np.uint8), 'RGB')


def contorno(im):
    """Contorno exterior simplificado, en fracciones del recorte (x a la derecha, y hacia abajo)."""
    import cv2
    a = np.asarray(im)[..., 3]
    f = min(1.0, 512 / max(a.shape))
    if f < 1: a = cv2.resize(a, (round(a.shape[1] * f), round(a.shape[0] * f)), interpolation=cv2.INTER_AREA)
    _, b = cv2.threshold(a, 127, 255, cv2.THRESH_BINARY)
    cs, _ = cv2.findContours(b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)
    ap = cv2.approxPolyDP(c, 0.0009 * cv2.arcLength(c, True), True)[:, 0, :].astype(float)
    H, W = a.shape
    plano = []
    for x, y in ap: plano += [round((x + 0.5) / W, 4), round((y + 0.5) / H, 4)]
    return plano


def guarda_contornos(nuevos, carpeta):
    ruta = os.path.join(carpeta, 'contornos.js'); todos = {}
    if os.path.exists(ruta):
        txt = open(ruta, encoding='utf8').read(); i = txt.find('{')
        if i >= 0: todos = json.loads(txt[i:txt.rfind('}') + 1])
    todos.update(nuevos)
    with open(ruta, 'w', encoding='utf8') as f:
        f.write('/* Panthera — contornos de los charms del armador 3D (los genera herramientas/armador/recorte.py: no editar a mano).\n'
                '   Cada charm: [x, y, x, y, ...] en fracciones de su foto recortada (x a la derecha, y hacia abajo). El 3D extruye la pieza. */\n')
        f.write('window.PNT_A3_CONTORNOS = ' + json.dumps(todos, separators=(',', ':'), sort_keys=True) + ';\n')
    return ruta


if __name__ == '__main__':
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    con_liviana, con_ia, vista = '--liviana' in sys.argv, '--ia' in sys.argv, '--vista' in sys.argv
    ks = sorted(f[:-5] for f in os.listdir(SRC) if f.endswith('.webp'))
    if args: ks = args[0].split(',')
    destino = os.path.join(IA, 'vista') if vista else os.path.join(TIENDA, 'charms-hd')
    os.makedirs(destino, exist_ok=True)
    info = json.load(open(os.path.join(AQUI, 'rgba_aspectos.json'))) if os.path.exists(os.path.join(AQUI, 'rgba_aspectos.json')) else {}
    tam = json.load(open(os.path.join(AQUI, 'rgba_tam.json'))) if os.path.exists(os.path.join(AQUI, 'rgba_tam.json')) else {}
    conts = {}
    for k in ks:
        im, a, caja = mascara(k)
        if con_liviana:
            o = liviana(k, im, a, caja)
            info[k] = round(o.width / o.height, 4); tam[k] = [o.width, o.height, int(caja[0])]
        hd = alta(k, a, caja, fuente_grande(k, con_ia))
        hd.save(os.path.join(destino, k + '.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
        relieve(hd).save(os.path.join(destino, k + '-n.webp'), 'WEBP', quality=92, method=6)
        conts[k] = contorno(hd)
        print(k.ljust(5), 'alta', hd.size, '·', len(conts[k]) // 2, 'puntos de contorno')
    if con_liviana:
        json.dump(info, open(os.path.join(AQUI, 'rgba_aspectos.json'), 'w'), indent=1)
        json.dump(tam, open(os.path.join(AQUI, 'rgba_tam.json'), 'w'), indent=0)
    print('contornos en', guarda_contornos(conts, destino if vista else TIENDA))
    tot = sum(os.path.getsize(os.path.join(destino, f)) for f in os.listdir(destino) if f.endswith('.webp'))
    print(len(ks), 'charms ·', tot // 1024, 'KB en', destino)
