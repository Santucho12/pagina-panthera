# Arma hojas para mirar a ojo lo que sacó responsive.mjs:
#   vistas-<pag>.jpg       → el primer pantallazo de la página en todos los anchos, uno al lado del otro
#   hoja-<pag>-<ancho>-N.jpg → la página entera cortada en tiras (celu: 4 tiras por hoja; tablet: 2; compu: 2 una abajo de otra)
# python -I herramientas/revision/hojas.py <carpeta> [pagina]
import os, re, sys, glob
from PIL import Image, ImageDraw

carpeta = sys.argv[1]
solo = sys.argv[2] if len(sys.argv) > 2 else None
MAX_W, MAX_PX = 1560, 1_150_000

def achica(im):
    f = min(1.0, MAX_W / im.width, (MAX_PX / (im.width * im.height)) ** 0.5)
    return im.resize((max(1, int(im.width * f)), max(1, int(im.height * f))), Image.LANCZOS) if f < 1 else im

def rotulo(d, x, y, t):
    d.rectangle([x, y, x + 8 + 7 * len(t), y + 16], fill=(0, 0, 0))
    d.text((x + 4, y + 2), t, fill=(255, 255, 0))

hechas = 0
for f in sorted(glob.glob(os.path.join(carpeta, 'todo-*.jpg'))):
    m = re.match(r'todo-(.+?)-(\d+(?:x\d+)?)\.jpg$', os.path.basename(f))
    if not m or (solo and m.group(1) != solo):
        continue
    pag, ancho = m.group(1), m.group(2)
    w = int(ancho.split('x')[0])
    for vieja in glob.glob(os.path.join(carpeta, f'hoja-{pag}-{ancho}-*.jpg')):
        os.remove(vieja)
    im = Image.open(f).convert('RGB')
    if w < 700:
        alto, cols, filas = 1000, 4, 1
    elif w <= 1100:
        alto, cols, filas = 900, 2, 1
    else:
        alto, cols, filas = 760, 1, 2
    gap = 14
    tiras = [im.crop((0, y, im.width, min(im.height, y + alto))) for y in range(0, im.height, alto)]
    por_hoja = cols * filas
    for n in range(0, len(tiras), por_hoja):
        grupo = tiras[n:n + por_hoja]
        hoja = Image.new('RGB', (cols * im.width + (cols - 1) * gap, filas * alto + (filas - 1) * gap), (255, 0, 0))
        d = ImageDraw.Draw(hoja)
        for i, t in enumerate(grupo):
            x = (i % cols) * (im.width + gap) if filas == 1 else 0
            y = 0 if filas == 1 else i * (alto + gap)
            fondo = Image.new('RGB', (im.width, alto), (230, 230, 230))
            fondo.paste(t, (0, 0))
            hoja.paste(fondo, (x, y))
            rotulo(d, x + 2, y + 2, f'{pag} {ancho}px  y={(n + i) * alto}')
        achica(hoja).save(os.path.join(carpeta, f'hoja-{pag}-{ancho}-{n // por_hoja + 1}.jpg'), quality=82)
        hechas += 1

# primeros pantallazos en todos los anchos
pags = sorted({re.match(r'vista-(.+?)-\d+(?:x\d+)?\.jpg$', os.path.basename(f)).group(1) for f in glob.glob(os.path.join(carpeta, 'vista-*.jpg'))})
for pag in pags:
    if solo and pag != solo:
        continue
    vs = sorted([f for f in glob.glob(os.path.join(carpeta, f'vista-{pag}-*.jpg')) if re.match(rf'vista-{re.escape(pag)}-\d+(?:x\d+)?\.jpg$', os.path.basename(f))], key=lambda f: int(re.search(r'-(\d+)(?:x\d+)?\.jpg$', f).group(1)))
    H = 430
    ims = []
    for f in vs:
        im = Image.open(f).convert('RGB')
        im = im.resize((max(1, int(im.width * H / im.height)), H), Image.LANCZOS)
        ims.append((re.search(r'-(\d+(?:x\d+)?)\.jpg$', f).group(1), im))
    filas, fila, ancho = [], [], 0
    for w, im in ims:
        if fila and ancho + im.width + 10 > 2400:
            filas.append(fila); fila, ancho = [], 0
        fila.append((w, im)); ancho += im.width + 10
    if fila:
        filas.append(fila)
    W = max(sum(im.width + 10 for _, im in f) for f in filas)
    hoja = Image.new('RGB', (W, len(filas) * (H + 10)), (255, 0, 0))
    d = ImageDraw.Draw(hoja)
    for r, f in enumerate(filas):
        x = 0
        for w, im in f:
            hoja.paste(im, (x, r * (H + 10)))
            rotulo(d, x + 2, r * (H + 10) + 2, f'{w}px')
            x += im.width + 10
    achica(hoja).save(os.path.join(carpeta, f'vistas-{pag}.jpg'), quality=82)
    hechas += 1
print('hojas:', hechas)
