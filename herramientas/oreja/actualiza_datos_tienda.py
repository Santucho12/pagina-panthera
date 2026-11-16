# Actualiza SOLO los aros de "Armá tu oreja" en la tienda LOCAL (2026-11-12). NO sube nada.
# A diferencia de construye_tienda.py (que reescribe todo y pisa los retoques a mano de la interfaz), esto:
#   - reemplaza la lista `{% set pnt_or_aros = [ ... ] %}` de tienda/snipplets/panthera/oreja.tpl con los aros de artefacto/index.html
#   - copia a tienda/static/panthera/oreja/ las fotos (aros/, aros-hd/) y contornos.js que cambiaron
#   - sube la versión (?v=) de contornos.js para que el navegador no use el viejo
# No toca oreja3d.js / oreja3d.css / oreja3d-escena.js ni el resto del .tpl.
# Uso: python construye.py && python actualiza_datos_tienda.py
import os, re, html, shutil, filecmp

AQUI = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(AQUI, 'artefacto')
TIENDA = os.path.join(os.path.dirname(os.path.dirname(AQUI)), 'tienda')
EST = os.path.join(TIENDA, 'static', 'panthera')
TPL = os.path.join(TIENDA, 'snipplets', 'panthera', 'oreja.tpl')
V = os.environ.get('PNT_V', '20261112b')

pagina = open(os.path.join(ART, 'index.html'), encoding='utf-8').read()
molde = re.search(r'<template>\n(.*?)\n    </template>', pagina, re.S).group(1)
CAMPOS = ['k', 'n', 'cat', 'id', 'v', 'p', 'a', 'st', 'tipo', 'asp', 'ag', 'cx', 'alto', 'url', 'arg']
NUM = {'id', 'v', 'p', 'a', 'st', 'asp', 'ag', 'cx', 'alto'}
aros = []
for li in re.findall(r'<li (data-k="[^"]+"[^>]*)></li>', molde):
    aros.append({m.group(1): html.unescape(m.group(2)) for m in re.finditer(r'data-([a-z]+)="([^"]*)"', li)})


def fila(d):
    partes = []
    for c in CAMPOS:
        v = d.get(c, '')
        partes.append('%s: %s' % (c, v if c in NUM else "'" + v.replace("'", "\\'") + "'"))
    return '    { ' + ', '.join(partes) + ' }'


datos = '{% set pnt_or_aros = [\n' + ',\n'.join(fila(d) for d in aros) + '\n] %}'
tpl = open(TPL, encoding='utf-8').read()
viejo = re.search(r'\{% set pnt_or_aros = \[\n.*?\n\] %\}', tpl, re.S)
assert viejo, 'no encontré la lista pnt_or_aros en oreja.tpl'
nuevo = tpl[:viejo.start()] + datos + tpl[viejo.end():]
nuevo, n = re.subn(r'(panthera/oreja/contornos\.js\' \| static_url \}\}\?v=)[0-9a-z]+', lambda m: m.group(1) + V, nuevo)
assert n == 1, 'no encontré data-contornos con ?v='
open(TPL, 'w', encoding='utf-8', newline='\n').write(nuevo)

copiados = 0
for d in ('aros', 'aros-hd'):
    os.makedirs(os.path.join(EST, 'oreja', d), exist_ok=True)
    for f in os.listdir(os.path.join(ART, d)):
        o, t = os.path.join(ART, d, f), os.path.join(EST, 'oreja', d, f)
        if not os.path.exists(t) or not filecmp.cmp(o, t, shallow=False): shutil.copyfile(o, t); copiados += 1
c_o, c_t = os.path.join(ART, 'contornos-aros.js'), os.path.join(EST, 'oreja', 'contornos.js')
if not os.path.exists(c_t) or not filecmp.cmp(c_o, c_t, shallow=False): shutil.copyfile(c_o, c_t); copiados += 1
print('oreja.tpl con', len(aros), 'aros ·', copiados, 'archivos copiados')
