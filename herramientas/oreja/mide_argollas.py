# Mide la argolla de cada aro en su foto recortada (aros-hd/<k>.webp), para dibujarla en 3D y dejar de la foto solo el dije.
# Pedido del usuario (2026-11-11): "los aritos se ven muy falsos... quiero que sea super realista". En las fotos de Panthera con
# el aro puesto, la argolla se ve casi de canto (un óvalo angosto que cuelga del agujero); en las fotos de producto se ve de 3/4,
# con su cara de adentro. Por eso la argolla pasa a ser 3D y de la foto queda el dije (del cuello del aro para abajo).
# Por aro: arriba (y de la argolla), corte (y donde empieza el dije), cxCorte (x del cuello), banda (grosor de la argolla / su
# alto), metal (oro, plata, rosa) y pave (con cristales). Todo en fracciones de la foto. Uso: python mide_argollas.py
import json, os, sys, colorsys
import numpy as np
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
META = json.load(open(os.path.join(AQUI, 'aros-meta.json'), encoding='utf-8'))
PAVE = {'apol', 'cohe', 'swep', 'apo2', 'anci', 'cueb', 'cueg', 'emoj', 'emot', 'swhi', 'coh2'}                      # argollas con cristales (a ojo, en las fotos)
# correcciones a mano (fracciones del alto de la foto) si la medición automática se equivoca
A_MANO = json.load(open(os.path.join(AQUI, 'argollas-a-mano.json'))) if os.path.exists(os.path.join(AQUI, 'argollas-a-mano.json')) else {}


def mide(k):
    im = Image.open(os.path.join(AQUI, 'artefacto', 'aros-hd', k + '.webp')).convert('RGBA')
    A = np.asarray(im).astype(np.float32) / 255.0
    a = A[..., 3] > 0.5
    H, W = a.shape
    filas = np.where(a.any(1))[0]
    arriba = int(filas[0])
    ancho = np.zeros(H); izq = np.zeros(H); der = np.zeros(H); tramos = np.zeros(H, int)
    for y in range(H):
        xs = np.where(a[y])[0]
        if len(xs):
            ancho[y] = xs[-1] - xs[0] + 1; izq[y] = xs[0]; der[y] = xs[-1]
            tramos[y] = 1 + int(np.sum(np.diff(xs) > 2))
    lim = int(H * 0.85)
    # la argolla: el ancho crece hasta su máximo (arriba) y se angosta hasta el cuello (la argolla de unión del dije)
    zona = ancho[arriba:arriba + int((lim - arriba) * 0.55)]
    ymax = arriba + int(np.argmax(zona)); wmax = ancho[ymax]
    y = ymax
    while y < lim and ancho[y] >= 0.36 * wmax: y += 1
    cuello = y
    yb = y; mejor = ancho[y]
    while y < lim and ancho[y] <= mejor * 1.25 + 3:
        if ancho[y] < mejor: mejor = ancho[y]; yb = y
        y += 1
    abajo = cuello                                       # donde termina la banda de la argolla
    corte = cuello                                       # el dije empieza ahí (su argolla de unión queda colgando de la 3D)
    a_m = A_MANO.get(k, {})
    if 'arriba' in a_m: arriba = int(a_m['arriba'] * H)
    if 'abajo' in a_m: abajo = int(a_m['abajo'] * H)
    if 'corte' in a_m: corte = int(a_m['corte'] * H)
    xs = np.where(a[min(H - 1, corte + 2)])[0]
    cxc = float((xs[0] + xs[-1]) / 2) if len(xs) else W / 2
    # grosor de la banda: en la mitad de la argolla, el tramo más ancho (la cara de afuera de la argolla vista de 3/4)
    ym = (arriba + abajo) // 2; mx = 0
    for yy in range(max(arriba, ym - 6), min(abajo, ym + 6)):
        xs = np.where(a[yy])[0]
        if not len(xs): continue
        cortes = np.where(np.diff(xs) > 2)[0]
        ini = np.concatenate([[0], cortes + 1]); fin = np.concatenate([cortes, [len(xs) - 1]])
        for i0, i1 in zip(ini, fin): mx = max(mx, xs[i1] - xs[i0] + 1)
    alto_arg = max(1, abajo - arriba)
    banda = mx / alto_arg if tramos[ym] >= 2 else 0.24
    banda = float(np.clip(banda, 0.12, 0.34))
    # el color del metal: los píxeles de la argolla sin brillos ni sombras
    reg = A[arriba:abajo, :, :3][a[arriba:abajo]]
    lum = reg @ np.array([0.3, 0.59, 0.11])
    sel = reg[(lum > 0.25) & (lum < 0.85)]
    r, g, b = sel.mean(0) if len(sel) > 20 else reg.mean(0)
    hh, ss, vv = colorsys.rgb_to_hsv(r, g, b)
    if ss < 0.2: metal = 'plata'
    elif hh * 360 < 33 and ss < 0.5: metal = 'rosa'
    else: metal = 'oro'
    if 'metal' in a_m: metal = a_m['metal']
    return {'arriba': round(arriba / H, 4), 'abajo': round(abajo / H, 4), 'corte': round(corte / H, 4), 'cxCorte': round(cxc / W, 4),
            'banda': round(banda, 3), 'metal': metal, 'pave': 1 if k in PAVE else 0, 'rgb': [round(float(v), 3) for v in (r, g, b)],
            'px': [W, H]}


def hoja(res, salida):
    tiles = []
    for k, r in res.items():
        im = Image.open(os.path.join(AQUI, 'artefacto', 'aros-hd', k + '.webp')).convert('RGBA')
        W, H = im.size
        bg = Image.new('RGBA', im.size, (60, 60, 64, 255)); bg.alpha_composite(im)
        d = ImageDraw.Draw(bg)
        for y, col in ((r['arriba'], (0, 255, 255)), (r['abajo'], (255, 60, 60)), (r['corte'], (60, 255, 60))):
            d.line([(0, y * H), (W, y * H)], fill=col, width=max(2, H // 300))
        x = r['cxCorte'] * W; d.line([(x, r['corte'] * H - 30), (x, r['corte'] * H + 30)], fill=(255, 255, 0), width=3)
        d.text((4, H - 40), k + ' ' + r['metal'] + (' pave' if r['pave'] else '') + ' b%.2f' % r['banda'], fill=(255, 255, 255))
        h = 300; w = max(1, round(W * h / H)); tiles.append(bg.convert('RGB').resize((w, h)))
    filas = []; fila = []; anchoF = 0
    for t in tiles:
        if anchoF + t.width > 1900 and fila: filas.append(fila); fila = []; anchoF = 0
        fila.append(t); anchoF += t.width + 6
    if fila: filas.append(fila)
    out = Image.new('RGB', (1900, 306 * len(filas)), (255, 255, 255))
    for i, f in enumerate(filas):
        x = 0
        for t in f: out.paste(t, (x, i * 306)); x += t.width + 6
    out.save(salida, quality=85)


if __name__ == '__main__':
    res = {k: mide(k) for k in META if META[k]['tipo'] != 'cuff' and os.path.exists(os.path.join(AQUI, 'artefacto', 'aros-hd', k + '.webp'))}
    json.dump(res, open(os.path.join(AQUI, 'argollas.json'), 'w'), indent=1)
    hoja(res, os.path.join(AQUI, 'control-argollas.jpg'))
    for k, r in res.items(): print(k, r['arriba'], r['abajo'], r['corte'], r['cxCorte'], r['banda'], r['metal'], r['rgb'])
