# Prepara la foto de la oreja para "Armá tu oreja" (desde 2026-11-11: la foto que eligió el usuario, fotos/oreja-ia.png,
# 1279×1230: oreja derecha de perfil, pelo castaño atrás, luz suave de frente; trae una marquita de agujero en el lóbulo).
# - La agranda ×2 con IA local (Real-ESRGAN ×4 → la mitad, mezclada con un 25 % de la original agrandada común, para que la piel
#   no quede plástica): la oreja pasa de ~540 a ~1080 px y aguanta la lupa.
# - La máscara de la OREJA (foto-mascara.png, 1/4): un polígono marcado sobre los bordes medidos en la foto (el hélix contra el
#   pelo y el borde de abajo del lóbulo contra la sombra del cuello). La escena la usa para tapar la mitad de atrás de cada
#   argolla, esconder lo que el ear cuff pasa por detrás del borde y saber dónde cae cada sombra.
# - Los datos para la escena (foto-oreja.json): escala, agujeros, encuadres, de qué lado está la cara, de dónde viene la luz y los
#   colores de alrededor (pelo, cara, cuello) para el entorno que reflejan los aros.
# Para otra foto: cambiar FOTO, OREJA (polígono), AGUJEROS, los encuadres y ALTO_OREJA, y correr: python foto_oreja.py && python construye.py
import json, os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTO = os.path.join(AQUI, 'fotos', 'oreja-ia.png')
X2 = os.path.join(AQUI, 'tmp', 'oreja-ia-x2.png')
ESRGAN = r'C:\Users\AMDRYZEN7\Desktop\Trabajos Freelance\Pagina Panthera\herramientas\armador\realesrgan\realesrgan-ncnn-vulkan.exe'
K = 2                                                   # la foto final es el doble de la original
# ESPEJO: dar vuelta la foto. Se probó el 2026-11-11 (para alejar los aros del total) y el usuario NO lo quiso: "no me gustó que
# espejaras la foto, volvela a su lugar". Queda en False; si algún día se usa, las coordenadas de abajo se dan vuelta solas.
ESPEJO = False

# todo en píxeles de la foto ORIGINAL (1279×1230)
ALTO_OREJA = 757 - 219                                  # del borde de arriba del hélix al borde de abajo del lóbulo
OREJA = [(593, 220), (640, 218), (700, 228), (756, 267), (802, 314), (830, 380), (850, 450), (868, 520), (884, 590), (895, 650),
         (893, 690), (880, 724), (860, 742), (840, 750), (800, 753), (760, 749), (720, 735), (680, 717), (640, 685), (608, 650),
         (568, 600), (545, 550), (515, 500), (505, 450), (500, 400), (505, 350), (530, 300), (560, 260)]
AGUJEROS = {'l1': (810, 689),       # la marquita de agujero que trae la foto (a ~7 mm del borde del lóbulo)
            'l2': (746, 690),       # ~7 mm hacia atrás (la nuca está a la izquierda) y apenas más arriba siguiendo el lóbulo
            'l3': (687, 671),
            'cuff': (536, 410)}     # sobre el borde del hélix, a media altura: el moño queda adentro del borde

os.makedirs(os.path.dirname(X2), exist_ok=True)
orig = Image.open(FOTO).convert('RGB')
if not os.path.exists(X2):
    x4 = os.path.join(AQUI, 'tmp', 'oreja-ia-x4.png')
    if not os.path.exists(x4):
        subprocess.run([ESRGAN, '-i', FOTO, '-o', x4, '-n', 'realesrgan-x4plus', '-t', '128', '-j', '1:1:1'], check=True)
    Image.open(x4).convert('RGB').resize((orig.width * K, orig.height * K), Image.LANCZOS).save(X2)
ia = np.asarray(Image.open(X2).convert('RGB')).astype(np.float32)
comun = np.asarray(orig.resize((orig.width * K, orig.height * K), Image.BICUBIC)).astype(np.float32)
a = ia * 0.75 + comun * 0.25
if ESPEJO: a = a[:, ::-1]
W0 = orig.width
X = (lambda x: W0 - 1 - x) if ESPEJO else (lambda x: x)
Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8)).save(os.path.join(AQUI, 'artefacto', 'foto-oreja.webp'), 'WEBP', quality=86, method=6)
h, w = a.shape[:2]

# máscara de la oreja, a 1/4 de la foto final
E = 4
m = Image.new('L', (w // E, h // E), 0)
ImageDraw.Draw(m).polygon([(X(x) * K / E, y * K / E) for x, y in OREJA], fill=255)
m.filter(ImageFilter.GaussianBlur(0.8)).save(os.path.join(AQUI, 'artefacto', 'foto-mascara.png'), optimize=True)

# los colores de alrededor (lo que reflejan los aros): el pelo, la cara y el cuello
def media(x0, y0, x1, y1):
    r = np.asarray(orig.crop((x0, y0, x1, y1))).reshape(-1, 3).mean(0)
    return '#%02x%02x%02x' % tuple(int(v) for v in r)
entorno = {'pelo': media(150, 300, 420, 900), 'cara': media(1000, 300, 1250, 700), 'cuello': media(640, 800, 900, 1000)}

ESC = 6.1 / (ALTO_OREJA * K)       # unidades de la escena por píxel: la oreja mide 6,1 (como antes; ~6 cm)
P = lambda p: [round(p[0] * K), round(p[1] * K)]          # (ya en la foto final: dada vuelta si ESPEJO)
PX = lambda p: P((X(p[0]), p[1]))                          # de la foto original a la final
datos = {'w': w, 'h': h, 'escala': ESC,
         # encuadres, en la foto final: compu, la oreja entera y los dijes con los aros a la izquierda (el total va abajo a la
         # derecha); celular, la oreja centrada
         # compu: el foco va a propósito más allá del borde derecho; la escena lo frena en el borde de la foto, así los aros quedan
         # lo más a la izquierda posible (lejos del total) en cualquier ancho; el alto muestra la oreja entera y los dijes
         'foco': P((640, 600) if ESPEJO else (1000, 650)), 'alto': 870 * K,
         'focoCel': P((585, 560) if ESPEJO else (690, 560)), 'altoCel': 1010 * K,
         'agujeros': {k: PX(v) for k, v in AGUJEROS.items()},
         'lado': -1 if ESPEJO else 1,                 # de qué lado está la cara: ahí queda la mitad de adelante de cada argolla
         'cuffGiro': -0.05 if ESPEJO else 0.05,       # el borde del hélix en el cuff baja casi derecho
         'bordeCuff': PX((503, 410)),                 # el borde del hélix a la altura del cuff (los cuffs en anillo lo abrazan)
         'luz': [1.3 if ESPEJO else -1.3, 2.6, 6.5],  # de dónde viene la luz de la foto (de frente, apenas de arriba, del lado del pelo)
         'entorno': entorno}
json.dump(datos, open(os.path.join(AQUI, 'artefacto', 'foto-oreja.json'), 'w'), indent=1)
print({f: os.path.getsize(os.path.join(AQUI, 'artefacto', f)) for f in ['foto-oreja.webp', 'foto-mascara.png', 'foto-oreja.json']}, (w, h), entorno)
