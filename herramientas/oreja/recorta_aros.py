# Recorte de los aros para "Armá tu oreja" (prototipo, 2026-11-11). Las fotos de la tienda NO tienen fondo blanco (colgados de un
# exhibidor de acrílico sobre gris rosado, o puestos en la oreja), así que el recorte lo hace un modelo de IA local (rembg,
# isnet-general-use; no sube nada) en dos pasadas: la primera ubica el aro en la foto; la segunda corre sobre ese recorte
# agrandado ×4 con Real-ESRGAN (local, placa de video), así el aro ocupa todo el cuadro y sale nítido y preciso.
# Por cada aro deja: aros/<k>.webp (tarjeta), aros-hd/<k>.webp (3D) y <k>-n.webp (relieve), su contorno con huecos y medidas.
# Uso: python recorta_aros.py [k1,k2,...]
import os, sys, json, subprocess, urllib.request, io, time
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, 'artefacto')
TMP = os.path.join(AQUI, 'tmp')
ESRGAN = r'C:\Users\AMDRYZEN7\Desktop\Trabajos Freelance\Pagina Panthera\herramientas\armador\realesrgan\realesrgan-ncnn-vulkan.exe'
for d in (SALIDA, os.path.join(SALIDA, 'aros'), os.path.join(SALIDA, 'aros-hd'), TMP): os.makedirs(d, exist_ok=True)
sys.path.insert(0, r'C:\Users\AMDRYZEN7\Desktop\Trabajos Freelance\Pagina Panthera\herramientas\armador')
from recorte import relieve  # noqa: E402  (el mismo relieve de los charms)

# clave: (parte del nombre en la tienda, foto: 'estudio' colgado del acrílico u 'oreja' puesto, índice de foto)
SELECCION = {
    'espm': ('Espada Mulan', 'estudio'), 'jaul': ('Jaulita de Mulan', 'estudio'), 'mush': ('Mushu Mulan', 'estudio'),
    'pein': ('Peineta Mulan', 'estudio'), 'arco': ('Arco y flecha Valiente', 'estudio'), 'flec': ('Flecha valiente - 3022', 'estudio'),
    'neni': ('Nenito de Valiente', 'estudio'), 'lilo': ('Lilo - 4063', 'estudio'), 'trap': ('Muñeca de trapo', 'estudio'),
    'reno': ('Reno frozen', 'estudio'), 'hadr': ('Hada aurora rosa', 'estudio'), 'hadv': ('Hada Aurora verde', 'estudio'),
    'dona': ('Donald', 'estudio'), 'mono': ('Monito Aladdin', 'estudio'), 'carr': ('Carroza Cenicienta', 'oreja'),
    'zapa': ('Zapato Cenicienta', 'oreja'),
    'moon': ('Moon gold', 'estudio'), 'rayo': ('Rayito gold', 'estudio'), 'star': ('STAR - 2851', 'estudio'),
    'estr': ('Estrellita rose', 'estudio'), 'esci': ('Estrella con circonio', 'estudio'), 'cohe': ('Cohete de cristal - 058', 'estudio'),
    'satu': ('Saturn - 3864', 'estudio'), 'apol': ('Aro apolo - 015', 'estudio'),
    'quee': ('Argollita queen', 'estudio'), 'alas': ('Circonio rectangular con alas', 'estudio'), 'tres': ('tres circonios', 'estudio'),
    'libe': ('libelula', 'estudio'), 'ojo': ('Ojo cristal azul', 'estudio'), 'flor': ('Flor turquesa', 'estudio'),
    'love': ('Love - 3949', 'estudio'), 'powe': ('Power love', 'estudio'), 'swep': ('Sweet purple', 'estudio'),
    'lazo': ('moño liston', 'estudio'), 'musi': ('Music - 049', 'estudio'), 'ancl': ('Ancla gold', 'estudio'),
    'plan': ('Plane silver', 'estudio'), 'boli': ('Bolita silver', 'estudio'), 'sire': ('Cola de sirena', 'oreja'),
    'torn': ('Crystal Tornasol', 'oreja'),
    'apo2': ('Apolo 2.0 - 2048', 'estudio'),
    'chag': ('Argollita colgante chain gold', 'estudio'),
    'cdos': ('dos circonios colgante', 'estudio'),
    'anci': ('Argollita con ancla silver', 'oreja'),
    'cueb': ('Aro cuernito blue', 'estudio'),
    'cueg': ('Aro cuernito green', 'estudio'),
    'avio': ('Aro plane - 019', 'oreja'),
    'arsk': ('Aro sky - 044', 'estudio'),
    'vele': ('Aro velero Moana', 'oreja'),
    'best': ('Bestia de la Bella', 'oreja'),
    'brig': ('BRIGHT - 3526', 'estudio'),
    'cact': ('Cactus de cristal', 'estudio'),
    'casi': ('Casiopea corazon', 'estudio'),
    'chai': ('Chains - 3525', 'estudio'),
    'chan': ('CHANCHITO MOANA', 'oreja'),
    'coco': ('Cocodrilo La princesa', 'oreja'),
    'coh2': ('Cohete de cristal - 4026', 'oreja'),
    'comp': ('Compromiso - 027', 'estudio'),
    'emoj': ('Emoji enamorado', 'oreja'),
    'emot': ('Emoticon con estrellitas', 'estudio'),
    'espi': ('Aro espiral multicolor', 'oreja'),
    'gall': ('Gallo Moana', 'oreja'),
    'garf': ('Garfio - 2388', 'oreja'),
    'icec': ('Ice cream silver', 'oreja'),
    'luci': ('Luciernaga (La princesa', 'oreja'),
    'mchi': ('Minnie chain', 'oreja'),
    'mont': ('rusa - 2514', 'estudio'),
    'perc': ('Percy de Pocahontas', 'oreja'),
    'rato': ('Cenicienta - 2378', 'oreja'),
    'sat2': ('Saturn silver - 1580', 'oreja'),
    'swhi': ('Sweet white', 'estudio'),
    'tene': ('Tenedor - 2374', 'oreja'),
    'cmin': ('Moño minnie', 'cuff'), 'cshi': ('Ear cuff shine silver', 'cuff'),
}
PRODUCTOS = json.load(open(os.path.join(AQUI, 'aros.json'), encoding='utf-8')) + json.load(open(os.path.join(AQUI, 'cuffs.json'), encoding='utf-8'))


def producto(nombre):
    m = [p for p in PRODUCTOS if nombre.lower() in p['nombre'].lower()]
    if len(m) != 1: raise SystemExit(f'"{nombre}": {len(m)} productos')
    return m[0]


SESION = None
def isnet(im):
    global SESION
    from rembg import new_session, remove
    if SESION is None: SESION = new_session('isnet-general-use')
    return np.asarray(remove(im, session=SESION, only_mask=True)).astype(np.float32) / 255.0


def baja(url):
    q = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return Image.open(io.BytesIO(urllib.request.urlopen(q, timeout=60).read())).convert('RGB')


def principal(a, umbral=0.5):
    """La pieza: la mancha más grande y las que están pegadas a ella (el aro y su dije, una cadenita)."""
    lab, n = ndi.label(a > umbral)
    if n == 0: return np.zeros_like(a, bool)
    areas = ndi.sum(np.ones_like(a), lab, range(1, n + 1)); g = int(np.argmax(areas)) + 1
    cerca = ndi.binary_dilation(lab == g, iterations=max(3, int(0.015 * max(a.shape))))
    keep = np.zeros(n + 1, bool); keep[g] = True
    for i in range(1, n + 1):
        if i != g and areas[i - 1] > 0.002 * areas[g - 1] and (cerca & (lab == i)).any(): keep[i] = True
    return keep[lab]


def recorta(k):
    T0 = time.time()
    nombre, tipo = SELECCION[k]
    p = producto(nombre)
    url = 'https:' + p['img'] if p['img'].startswith('//') else p['img']
    foto = baja(url.replace('-1024-1024.webp', '-640-0.webp'))      # la de 640: Real-ESRGAN la lleva ×4 (más rápido que desde 1024)
    W, H = foto.size
    # 1) dónde está el aro
    a1 = isnet(foto); pieza = principal(a1, 0.3)
    ys, xs = np.where(pieza)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    mx, my = int((x1 - x0) * 0.22) + 12, int((y1 - y0) * 0.10) + 12
    caja = (max(0, x0 - mx), max(0, y0 - my), min(W, x1 + mx), min(H, y1 + my))
    rec = foto.crop(caja)
    # 2) el recorte ×4 con Real-ESRGAN (y suavizado bilateral en el esmalte de color, como los charms)
    ent, x4 = os.path.join(TMP, k + '-in.png'), os.path.join(TMP, k + '-x4.png')
    rec.save(ent)
    subprocess.run([ESRGAN, '-i', ent, '-o', x4, '-n', 'realesrgan-x4plus', '-s', '4', '-t', '128', '-j', '1:1:1'], check=True, capture_output=True)
    import cv2
    img = cv2.imread(x4, cv2.IMREAD_COLOR)
    bil = cv2.bilateralFilter(img, 9, 38, 7)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    color = np.clip((hsv[..., 1] / 255.0 - 0.28) / 0.22, 0, 1) * np.clip(hsv[..., 2] / 255.0 / 0.25, 0, 1)
    color = cv2.GaussianBlur(color, (0, 0), 3)[..., None]
    img = (img * (1 - color) + bil * color).round().astype(np.uint8)
    grande = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    os.remove(ent); os.remove(x4)
    print('  ', k, 'esrgan', round(time.time() - T0, 1), 's', flush=True)
    f = 1400 / max(grande.size)
    if f < 1: grande = grande.resize((round(grande.width * f), round(grande.height * f)), Image.LANCZOS)
    # 3) segunda pasada sobre el aro grande
    a = isnet(grande)
    c = np.asarray(grande).astype(np.float32)
    borde = np.concatenate([c[:6].reshape(-1, 3), c[-6:].reshape(-1, 3), c[:, :6].reshape(-1, 3), c[:, -6:].reshape(-1, 3)])
    fondo = np.median(borde, axis=0)
    dif = np.linalg.norm(c - fondo, axis=2)
    a = np.clip((a - 0.10) / 0.75, 0, 1)
    pieza = principal(a, 0.45)
    # adentro de la pieza, lo que NO es fondo queda opaco (esmaltes claros que el modelo dejaba medio transparentes); los huecos
    # de verdad (el centro del aro) son color de fondo y siguen transparentes
    lleno = ndi.binary_fill_holes(ndi.binary_dilation(pieza, iterations=2))
    a = np.where(lleno & (dif > 22) & (a > 0.08), np.maximum(a, np.clip((dif - 22) / 30, 0, 1)), a)
    a = a * ndi.binary_dilation(pieza, iterations=3)
    # el acrílico del exhibidor (arriba del aro): filas de arriba donde casi todo es blanco sin color → afuera
    hsv = cv2.cvtColor(np.asarray(grande), cv2.COLOR_RGB2HSV).astype(np.float32)
    blanco = (hsv[..., 2] > 200) & (hsv[..., 1] < 34)
    filas = np.where((a > 0.5).any(1))[0]
    sacadas = 0
    for y in filas:
        en = a[y] > 0.5
        if blanco[y][en].mean() > 0.55: a[y][blanco[y]] = 0; sacadas += 1
        else: break
    # líneas finas que no son de la pieza (el filo del acrílico, un pelo en las fotos puestas): se abre la máscara (lo más fino que
    # ~0,5 % del tamaño desaparece), se queda la pieza principal y se vuelve a la máscara original solo cerca de ella
    rr = max(2, int(round(max(a.shape) * (0.0045 if tipo == 'oreja' else 0.0030))))
    est = ndi.generate_binary_structure(2, 1)
    abierta = ndi.binary_opening(a > 0.5, structure=est, iterations=rr)
    pieza = principal(abierta.astype(np.float32), 0.5)
    a = a * ndi.binary_dilation(pieza, structure=est, iterations=rr + 2)
    # 4) sin el halo del fondo en el borde
    m = (a > 0) & (a < 1)
    for ch in range(3):
        cc = c[..., ch]; cc[m] = np.clip((cc[m] - fondo[ch] * (1 - a[m])) / np.maximum(a[m], 0.03), 0, 255)
    ys, xs = np.where(a > 0.04)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.dstack([c, a * 255])[y0:y1, x0:x1].round().astype(np.uint8)
    hd = Image.fromarray(rgba, 'RGBA')
    if max(hd.size) > 1024: f = 1024 / max(hd.size); hd = hd.resize((round(hd.width * f), round(hd.height * f)), Image.LANCZOS)
    hd.save(os.path.join(SALIDA, 'aros-hd', k + '.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
    relieve(hd).save(os.path.join(SALIDA, 'aros-hd', k + '-n.webp'), 'WEBP', quality=92, method=6)
    t = hd.copy(); t.thumbnail((400, 400), Image.LANCZOS)
    t.save(os.path.join(SALIDA, 'aros', k + '.webp'), 'WEBP', quality=86, alpha_quality=100, method=6)
    # 5) medidas: alto/ancho, el aro de arriba (ancho y centro) y el contorno con sus huecos
    A = np.asarray(hd)[..., 3] > 127
    h, w = A.shape
    def tramo(y):
        xs_ = np.where(A[y])[0]
        return (xs_.min(), xs_.max()) if len(xs_) else None
    anchos = [tramo(int(h * f)) for f in np.linspace(0.04, 0.14, 6)]
    anchos = [t_ for t_ in anchos if t_]
    aroW = max((b - a_ + 1) for a_, b in anchos) / w if anchos else 0.3
    aroCx = np.mean([(a_ + b) / 2 for a_, b in anchos]) / w if anchos else 0.5
    return {'k': k, 'n': p['nombre'], 'tipo': tipo, 'asp': round(w / h, 4), 'aroW': round(aroW, 4), 'aroCx': round(float(aroCx), 4),
            'px': [w, h], 'acrilico': sacadas, 'cont': contorno(hd)}


def contorno(im):
    """Contorno exterior + huecos grandes (el centro del aro), en fracciones (x a la derecha, y hacia abajo)."""
    import cv2
    a = np.asarray(im)[..., 3]
    f = min(1.0, 512 / max(a.shape))
    if f < 1: a = cv2.resize(a, (round(a.shape[1] * f), round(a.shape[0] * f)), interpolation=cv2.INTER_AREA)
    _, b = cv2.threshold(a, 127, 255, cv2.THRESH_BINARY)
    cs, jer = cv2.findContours(b, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    H, W = a.shape
    def plano(c):
        ap = cv2.approxPolyDP(c, 0.0012 * cv2.arcLength(c, True), True)[:, 0, :].astype(float)
        return [v for x, y in ap for v in (round((x + 0.5) / W, 4), round((y + 0.5) / H, 4))]
    ext = [i for i in range(len(cs)) if jer[0][i][3] < 0]
    g = max(ext, key=lambda i: cv2.contourArea(cs[i]))
    area = cv2.contourArea(cs[g])
    huecos = [plano(cs[i]) for i in range(len(cs)) if jer[0][i][3] == g and cv2.contourArea(cs[i]) > 0.004 * area and len(cs[i]) > 8]
    return [plano(cs[g])] + huecos


if __name__ == '__main__':
    ks = sys.argv[1].split(',') if len(sys.argv) > 1 else list(SELECCION)
    ruta = os.path.join(AQUI, 'aros-meta.json')
    meta = json.load(open(ruta, encoding='utf-8')) if os.path.exists(ruta) else {}
    for k in ks:
        try:
            r = recorta(k); meta[k] = r
            print(k.ljust(5), r['px'], 'asp', r['asp'], 'aroW', r['aroW'], 'acrílico', r['acrilico'], 'huecos', len(r['cont']) - 1, flush=True)
        except Exception as e:
            print(k, 'ERROR', e, flush=True)
        json.dump(meta, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False)
