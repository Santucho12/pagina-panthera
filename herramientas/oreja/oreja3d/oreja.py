# La oreja de "Armá tu oreja": una oreja derecha esculpida (vista de costado: la cara queda a la DERECHA, +x; la nuca a la
# izquierda; y arriba; z hacia quien mira). Se modela como un relieve: la superficie de adelante zf(x, y) (hélix, antihélix con
# sus dos ramas, fosa triangular, escafa, concha con la raíz del hélix, trago, antitrago, escotadura y lóbulo) y la de atrás
# zb(x, y), recortadas por la silueta con bordes redondeados (SDF). Uso:
#   python oreja.py vista      -> vista.png (relieve iluminado, de frente, para revisar la anatomía rápido)
#   python oreja.py malla      -> oreja.bin (malla: marching cubes + normales del gradiente) y agujeros.json
import sys, json, struct
import numpy as np
from scipy import ndimage as ndi
from PIL import Image, ImageDraw

PASO = 0.02
# Ancho (pedido 2026-11-11: "más ancha la oreja", como en la foto de referencia): todo el diseño se estira en x por SX
SX = 1.22
def E(pts): return [(x * SX, y) for x, y in pts]
X0, X1, Y0, Y1 = -2.3 * SX - 0.1, 2.1 * SX, -3.45, 3.45
xs = np.arange(X0, X1 + 1e-9, PASO); ys = np.arange(Y0, Y1 + 1e-9, PASO)
GX, GY = np.meshgrid(xs, ys)          # filas = y, columnas = x


def catmull(pts, n=24, cerrada=False):
    p = np.array(pts, float)
    if cerrada: p = np.vstack([p[-1], p, p[0], p[1]])
    else: p = np.vstack([2 * p[0] - p[1], p, 2 * p[-1] - p[-2]])
    out = []
    for i in range(1, len(p) - 2):
        a, b, c, d = p[i - 1], p[i], p[i + 1], p[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3))
    if not cerrada: out.append(p[-2])
    return np.array(out)


def dist_polilinea(P, X=GX, Y=GY):
    """Distancia de cada punto de la grilla a la polilínea P, y el parámetro (0..1 a lo largo) del punto más cercano."""
    d = np.full(X.shape, 1e9); s = np.zeros(X.shape)
    largos = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]; L = largos[-1]
    for i in range(len(P) - 1):
        ax, ay = P[i]; bx, by = P[i + 1]; vx, vy = bx - ax, by - ay; ll = vx * vx + vy * vy + 1e-12
        t = np.clip(((X - ax) * vx + (Y - ay) * vy) / ll, 0, 1)
        dd = np.hypot(X - (ax + t * vx), Y - (ay + t * vy))
        m = dd < d; d[m] = dd[m]; s[m] = (largos[i] + t[m] * np.sqrt(ll)) / L
    return d, s


def sdf_poligono(P):
    """Distancia con signo a un polígono cerrado (negativa adentro), en unidades del mundo."""
    h, w = GX.shape
    im = Image.new('L', (w, h), 0)
    ImageDraw.Draw(im).polygon([((x - X0) / PASO, (y - Y0) / PASO) for x, y in P], fill=1)
    m = np.array(im, bool)
    return (ndi.distance_transform_edt(~m) - ndi.distance_transform_edt(m)) * PASO, m


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def bulto(cx, cy, rx, ry, ang=0.0):
    c, s = np.cos(ang), np.sin(ang)
    u = ((GX - cx) * c + (GY - cy) * s) / rx; v = (-(GX - cx) * s + (GY - cy) * c) / ry
    r2 = u * u + v * v
    return np.where(r2 < 1, (1 - r2) ** 2, 0.0)


# ───── La silueta (sentido horario desde arriba) ─────
# el lóbulo: ancho, redondo y carnoso (como en la foto de referencia), para que los aros entren repartidos a lo ancho
SILUETA = catmull(E([
    (-0.10, 3.10), (-0.85, 2.95), (-1.45, 2.52), (-1.82, 1.85), (-1.95, 1.05), (-1.90, 0.25), (-1.72, -0.50), (-1.52, -1.15),
    (-1.46, -1.70), (-1.42, -2.20), (-1.22, -2.62), (-0.80, -2.88), (-0.25, -2.96), (0.22, -2.80), (0.52, -2.42), (0.66, -1.95),
    (0.72, -1.50), (0.86, -1.22), (1.08, -0.95), (1.22, -0.45), (1.20, 0.05), (1.05, 0.45), (1.08, 0.95), (1.05, 1.55), (0.88, 2.20),
    (0.55, 2.75), (0.20, 3.02)]), n=20, cerrada=True)
SD, ADENTRO = sdf_poligono(SILUETA)
SDs = ndi.gaussian_filter(SD, 2.0)

# ───── El hélix: el borde enrollado. Arriba y atrás ES el borde (sale de la distancia a la silueta); adelante baja por el
# frente y entra a la concha como raíz del hélix. En el frente (donde la oreja se une a la cara) y en el lóbulo no hay rollo. ─────
borde = np.clip(-SDs, 0, None)                                       # distancia al borde, adentro
frente = sstep(0.45 * SX, 0.80 * SX, GX) * (1 - sstep(1.05, 1.55, GY)) * sstep(-1.75, -1.25, GY)   # el borde que se une a la cara
lobZ = sstep(-1.05, -1.65, GY)                                       # zona del lóbulo
zonaH = (1 - frente) * (1 - lobZ)
perfil = sstep(0.0, 0.17, borde) * (1 - sstep(0.20, 0.50, borde))  # sube desde el filo, cresta a ~0,18 y baja a la escafa
helix = 0.40 * perfil * zonaH
# la raíz del hélix: del frente (donde termina el rollo) hacia adentro de la concha, cada vez más baja
RAIZ = catmull(E([(0.84, 1.16), (0.58, 1.00), (0.22, 0.80), (-0.12, 0.70)]), n=24)
dR, sR = dist_polilinea(RAIZ)
raiz = 0.22 * np.exp(-(dR / (0.15 - 0.04 * sR)) ** 2) * (1 - sstep(0.40, 1.0, sR)) * sstep(-0.02, 0.10, sR)
raiz = raiz * (1 - sstep(-0.32, -0.12, SDs))                      # se apaga antes de llegar al borde (no asoma afuera)

# ───── El antihélix: una loma ancha y suave del antitrago hacia arriba; arriba se abre en dos ramas más finas ─────
ANTI = catmull(E([(-0.42, -0.98), (-0.88, -0.55), (-1.12, 0.10), (-1.16, 0.80), (-1.00, 1.40), (-0.78, 1.92), (-0.42, 2.30)]), n=24)
RAMA_INF = catmull(E([(-1.00, 1.40), (-0.55, 1.50), (-0.05, 1.45), (0.40, 1.32)]), n=24)
dA, sA = dist_polilinea(ANTI); dRi, sRi = dist_polilinea(RAMA_INF)
anti = 0.22 * np.exp(-(dA / (0.30 - 0.12 * sA)) ** 2) * (1 - 0.45 * sstep(0.72, 1.0, sA))
rama = 0.17 * np.exp(-(dRi / 0.15) ** 2) * (1 - sstep(0.62, 1.0, sRi))
crestas = np.maximum(anti, rama)

# ───── La concha: un cuenco redondo (cavum abajo, cymba arriba, separadas por la raíz del hélix) ─────
CONCHA = catmull(E([(0.38, 1.10), (-0.20, 1.18), (-0.68, 0.92), (-0.84, 0.34), (-0.76, -0.30), (-0.48, -0.72), (-0.02, -0.92),
                  (0.30, -1.04), (0.55, -0.74), (0.70, -0.30), (0.78, 0.25), (0.68, 0.80)]), n=20, cerrada=True)
SDc, _ = sdf_poligono(CONCHA)
SDc = ndi.gaussian_filter(SDc, 6.0)
concha = 0.50 * (1 - np.clip(1 + SDc / 0.55, 0, 1) ** 2) * (SDc < 0)   # cuenco: paredes curvas, fondo redondo
canal = 0.22 * bulto(0.50 * SX, -0.22, 0.26 * SX, 0.24)          # la entrada del conducto, más honda

# ───── Fosa triangular (entre las ramas): apenas más honda ─────
fosa = 0.08 * bulto(-0.40 * SX, 1.92, 0.44 * SX, 0.26, 0.35)

# ───── Trago, antitrago y lóbulo ─────
trago = 0.40 * bulto(0.92 * SX, -0.44, 0.30 * SX, 0.50, -0.10)
antitrago = 0.26 * bulto(-0.47 * SX, -1.02, 0.38 * SX, 0.24, 0.50)
LOB_Y = -1.40
enLobulo = sstep(LOB_Y + 0.45, LOB_Y - 0.40, GY)                # 0 arriba, 1 en el lóbulo
adentro = ndi.gaussian_filter(np.clip(-SD, 0, None), 4.0)
lobulo = 0.08 + 0.26 * np.sqrt(np.clip(adentro / 0.70, 0, 1))  # cúpula carnosa

BASE = 0.12
zf_cart = BASE + helix + crestas - concha + raiz - canal - fosa + trago + antitrago
zf_cart = np.maximum(zf_cart, BASE - 0.62)
zf = zf_cart * (1 - enLobulo) + lobulo * enLobulo
zf = ndi.gaussian_filter(zf, 1.4)
# atrás: una cáscara suave, más gruesa en el centro y en el lóbulo
zb = -0.10 - 0.16 * np.sqrt(np.clip(adentro / 0.9, 0, 1)) - 0.10 * enLobulo
zb = np.minimum(zb, zf - 0.10)


def smax(a, b, k):
    h = np.clip(0.5 + 0.5 * (a - b) / k, 0, 1)
    return a * h + b * (1 - h) + k * h * (1 - h)


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'vista'
    if modo == 'vista':
        gy, gx = np.gradient(zf, PASO)
        n = np.dstack([-gx, -gy, np.ones_like(zf)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
        L = np.array([-0.45, 0.55, 0.70]); L /= np.linalg.norm(L)
        dif = np.clip((n * L).sum(2), 0, 1)
        Hh = n + np.array([0, 0, 1.0]); Hh /= np.linalg.norm(Hh, axis=2, keepdims=True)
        spec = np.clip((Hh * ((L + [0, 0, 1]) / np.linalg.norm(L + [0, 0, 1]))).sum(2), 0, 1) ** 40
        ao = np.clip(0.55 + 0.9 * (zf - ndi.gaussian_filter(zf, 9)), 0.2, 1.15)
        col = np.array([247, 205, 219]) / 255.0
        img = col * (0.38 + 0.62 * dif)[..., None] * ao[..., None] + 0.25 * spec[..., None]
        borde = sstep(0.0, -0.03, SDs)
        img = img * borde[..., None] + (1 - borde[..., None]) * 1.0
        Image.fromarray((np.clip(img[::-1], 0, 1) * 255).astype(np.uint8)).save('vista.png')
        print('vista.png', img.shape)


def malla(paso_z=0.02):
    """Volumen con distancia con signo (positiva afuera) → marching cubes. Devuelve vértices (x, y, z), caras y normales."""
    from skimage import measure
    zs = np.arange(-0.80, 1.00 + 1e-9, paso_z)
    vol = np.empty((len(zs),) + GX.shape, np.float32)
    for i, z in enumerate(zs):
        cara = smax(z - zf, zb - z, 0.05)              # entre la cara de atrás y la de adelante
        vol[i] = smax(SDs, cara, 0.09)                 # recortado por la silueta, con el canto redondeado
    v, f, n, _ = measure.marching_cubes(vol, level=0.0, spacing=(paso_z, PASO, PASO), gradient_direction='ascent')
    # ejes del volumen: (z, y, x) → (x, y, z) del mundo
    V = np.c_[v[:, 2] + X0, v[:, 1] + Y0, v[:, 0] + zs[0]].astype(np.float32)
    N = np.c_[n[:, 2], n[:, 1], n[:, 0]].astype(np.float32)
    N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-9
    F = f.astype(np.uint32)
    return V, F, N


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'malla':
    V, F, N = malla()
    V.tofile('crudo_v.f32'); N.tofile('crudo_n.f32'); F.tofile('crudo_f.u32')
    print('vértices', len(V), 'caras', len(F), 'caja', V.min(0).round(3), V.max(0).round(3))


def sombra_huecos():
    """Oclusión (cavidad) de la cara de adelante: más oscuro donde la superficie está más honda que sus alrededores."""
    g1, g2 = ndi.gaussian_filter(zf, 7), ndi.gaussian_filter(zf, 20)
    ao = 1 + 2.4 * (zf - g1) + 1.1 * (zf - g2)
    return np.clip(ao, 0.38, 1.0)


def muestra(campo, x, y):
    fx = np.clip((x - X0) / PASO, 0, campo.shape[1] - 1.001); fy = np.clip((y - Y0) / PASO, 0, campo.shape[0] - 1.001)
    x0, y0 = np.floor(fx).astype(int), np.floor(fy).astype(int); tx, ty = fx - x0, fy - y0
    return (campo[y0, x0] * (1 - tx) * (1 - ty) + campo[y0, x0 + 1] * tx * (1 - ty) + campo[y0 + 1, x0] * (1 - tx) * ty + campo[y0 + 1, x0 + 1] * tx * ty)


# Los agujeros: repartidos a lo ancho del lóbulo como en una oreja real (el 1.º adelante, el 2.º al medio y el 3.º atrás, subiendo
# apenas), a ~7 mm entre sí; y el lugar del ear cuff, sobre el hélix, atrás (en coordenadas del mundo: ya con el ancho SX)
AGUJEROS = {'l1': (0.30, -2.30), 'l2': (-0.44, -2.22), 'l3': (-1.14, -1.96), 'cuff': (-1.96, 0.48)}

if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'extra':
    V = np.fromfile('crudo_v.f32', np.float32).reshape(-1, 3); N = np.fromfile('crudo_n.f32', np.float32).reshape(-1, 3)
    ao2 = sombra_huecos()
    frente = np.clip(N[:, 2] * 2.5, 0, 1)                       # solo la cara de adelante; atrás y en el canto, sin oclusión
    ao = 1 - (1 - muestra(ao2, V[:, 0], V[:, 1])) * frente
    ao.astype(np.float32).tofile('crudo_ao.f32')
    gy, gx = np.gradient(zf, PASO)
    out = {}
    for k, (x, y) in AGUJEROS.items():
        z = float(muestra(zf, np.array([x]), np.array([y]))[0])
        nx, ny = float(muestra(-gx, np.array([x]), np.array([y]))[0]), float(muestra(-gy, np.array([x]), np.array([y]))[0])
        n = np.array([nx, ny, 1.0]); n /= np.linalg.norm(n)
        out[k] = {'p': [x, y, round(z, 4)], 'n': [round(float(v), 4) for v in n]}
    json.dump(out, open('agujeros.json', 'w'), indent=1)
    print('oclusión: mín', ao.min().round(3), '· agujeros', out)
