# Pasa "Armá tu oreja" a la tienda LOCAL (2026-11-11, pedido del usuario: "subámosla a localhost, no por FTP"). NO sube nada.
# Desde el prototipo (artefacto/index.html, que arma construye.py) escribe:
#   tienda/snipplets/panthera/oreja.tpl        la sección: datos de cada aro escritos a mano (como armar.tpl) + el componente
#   tienda/static/panthera/oreja3d.js          la interfaz (= artefacto/oreja.js: con data-carrito, el carrito es real)
#   tienda/static/panthera/oreja3d.css         sus estilos (van adentro del Shadow DOM)
#   tienda/static/panthera/oreja3d-escena.js   la escena 3D (= artefacto/escena-foto.js)
#   tienda/static/panthera/oreja/              fotos de los aros (tarjetas y HD + relieve), la oreja, su máscara, pósters, contornos
# Uso: python construye.py && python construye_tienda.py
import os, re, json, shutil, html

AQUI = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(AQUI, 'artefacto')
PROYECTO = r'C:\Users\AMDRYZEN7\Desktop\Trabajos Freelance\Pagina Panthera'
TIENDA = os.path.join(PROYECTO, 'tienda')
EST = os.path.join(TIENDA, 'static', 'panthera')
V = '20261111'

pagina = open(os.path.join(ART, 'index.html'), encoding='utf-8').read()
host = re.search(r'<div class="pnt-or-host" ([^>]*)>', pagina).group(1)
ejemplo = re.search(r'data-ejemplo="([^"]*)"', host).group(1)
molde = re.search(r'<template>\n(.*?)\n    </template>', pagina, re.S).group(1)

# los aros: de la lista escondida del prototipo a un arreglo Twig editable a mano
CAMPOS = ['k', 'n', 'cat', 'id', 'v', 'p', 'a', 'st', 'tipo', 'asp', 'ag', 'cx', 'alto', 'url', 'arg']
NUM = {'id', 'v', 'p', 'a', 'st', 'asp', 'ag', 'cx', 'alto'}
aros = []
for li in re.findall(r'<li (data-k="[^"]+"[^>]*)></li>', molde):
    d = {m.group(1): html.unescape(m.group(2)) for m in re.finditer(r'data-([a-z]+)="([^"]*)"', li)}
    aros.append(d)
def fila(d):
    partes = []
    for c in CAMPOS:
        v = d.get(c, '')
        partes.append('%s: %s' % (c, v if c in NUM else "'" + v.replace("'", "\\'") + "'"))
    return '    { ' + ', '.join(partes) + ' }'
datos = '{% set pnt_or_aros = [\n' + ',\n'.join(fila(d) for d in aros) + '\n] %}'

lista = ('<ul hidden data-or-aros>\n{% for c in pnt_or_aros %}<li data-k="{{ c.k }}" data-n="{{ c.n }}" data-cat="{{ c.cat }}" data-id="{{ c.id }}" '
         'data-v="{{ c.v }}" data-p="{{ c.p }}" data-a="{{ c.a }}" data-st="{{ c.st }}" data-tipo="{{ c.tipo }}" data-asp="{{ c.asp }}" '
         'data-ag="{{ c.ag }}" data-cx="{{ c.cx }}" data-alto="{{ c.alto }}" data-url="{{ c.url }}" data-arg="{{ c.arg }}" '
         'data-img="{{ (\'panthera/oreja/aros/\' ~ c.k ~ \'.webp\') | static_url }}" data-hd="{{ (\'panthera/oreja/aros-hd/\' ~ c.k ~ \'.webp\') | static_url }}" '
         'data-hdn="{{ (\'panthera/oreja/aros-hd/\' ~ c.k ~ \'-n.webp\') | static_url }}"></li>\n{% endfor %}</ul>')
cuerpo = re.sub(r'<ul hidden data-or-aros>.*?</ul>', lambda m: '@@LISTA@@', molde, flags=re.S)
cuerpo = cuerpo.replace('<link rel="stylesheet" href="oreja.css">', '<link rel="stylesheet" href="{{ \'panthera/oreja3d.css\' | static_url }}?v=' + V + '">')
cuerpo = cuerpo.replace('<picture><source media="(max-width: 699px)" srcset="poster-m.webp"><img class="poster" src="poster.webp" alt="" decoding="async"></picture>',
                        '<picture><source media="(max-width: 699px)" srcset="{{ \'panthera/oreja/poster-m.webp\' | static_url }}?v=' + V + '"><img class="poster" src="{{ \'panthera/oreja/poster.webp\' | static_url }}?v=' + V + '" alt="" decoding="async" loading="lazy"></picture>')
assert '{#' not in cuerpo.replace('@@LISTA@@', '') and 'oreja.css' not in cuerpo and 'poster.webp"' not in cuerpo, 'quedó algo del prototipo'
cuerpo = cuerpo.replace('@@LISTA@@', lista)

foto = json.load(open(os.path.join(ART, 'foto-oreja.json'), encoding='utf-8'))
foto_attr = json.dumps(foto, separators=(',', ':'))
assert "'" not in foto_attr

tpl = '''{# Panthera — "Armá tu oreja" en 3D (2026-11-11). Elegís cuántos agujeros tenés en el lóbulo (1 a 3) y el ear cuff, sumás aros
   solitarios y los ves puestos en una oreja; "Agregar al carrito" pone cada aro en el carrito (un POST a /comprar/ por aro, como el
   armador de pulseras). Es el prototipo de herramientas/oreja/ pasado a la tienda (lo genera herramientas/oreja/construye_tienda.py:
   si se rehace desde ahí, los cambios a mano de este archivo se pisan). La interfaz está en static/panthera/oreja3d.js y los estilos
   en oreja3d.css (adentro del componente, en su Shadow DOM: Lima no los toca). La escena 3D, en oreja3d-escena.js (data-escena: la
   pide oreja3d.js recién cerca de la sección, con three.js 0.187.0, el mismo del armador de pulseras).
   La oreja es una foto (panthera/oreja/foto-oreja.webp + su máscara); la argolla de cada aro es 3D (medida en su foto: arg) y el
   dije es la foto del producto (panthera/oreja/aros-hd/). Ver herramientas/oreja/LEEME.md.

   ⚠️ Los datos de abajo (ids, variantes, precios, stock) son los de la tienda real al 2026-11-11 y están escritos a mano: el tema no
   puede pedirle a la tienda "este producto en particular" desde el inicio. Si cambia un precio o el stock, actualizarlo acá.
   El carrito SIEMPRE cobra el precio real (esto es solo lo que se muestra).
   - p = precio, a = precio de antes (tachado), st = stock (1 = "Última"), tipo = 'aro' o 'cuff'.
   - asp, ag, cx, alto: la foto recortada del aro (ancho/alto, el agujero, el centro y el tamaño en 3D).
   - arg: la argolla medida en la foto (arriba, abajo, corte del dije, x del cuello, grosor, metal, pavé).

   ⚠️ Preparado en local: NO subido. #}
''' + datos + '''

<section class="pnt-s pnt-a3 pnt-or" id="armar-oreja" aria-labelledby="pnt-or-t" data-wa-evitar>
    <div class="pnt-s-caja">
        {# Cabecera igual a la de "Armá tu pulsera" #}
        <header class="pnt-a3-cab pnt-rv">
            <h2 class="pnt-s-titulo" id="pnt-or-t">Armá tu oreja</h2>
            <p class="pnt-a3-sub">Elegí cuántos aritos, combinalos y mirá cómo quedan puestos antes de comprar.</p>
        </header>
        <div class="pnt-or-host" data-pnt-or data-carrito="{{ store.cart_url ?: '/comprar/' }}" data-escena="{{ 'panthera/oreja3d-escena.js' | static_url }}?v=''' + V + '''" data-contornos="{{ 'panthera/oreja/contornos.js' | static_url }}?v=''' + V + '''" data-foto-url="{{ 'panthera/oreja/foto-oreja.webp' | static_url }}?v=''' + V + '''" data-foto-mascara="{{ 'panthera/oreja/foto-mascara.png' | static_url }}?v=''' + V + '''" data-ejemplo="''' + ejemplo + '''" data-foto=\'''' + foto_attr + '''\'>
            <template>
''' + cuerpo + '''
            </template>
        </div>
    </div>
</section>
'''
open(os.path.join(TIENDA, 'snipplets', 'panthera', 'oreja.tpl'), 'w', encoding='utf-8', newline='\n').write(tpl)

# los archivos
os.makedirs(os.path.join(EST, 'oreja', 'aros'), exist_ok=True); os.makedirs(os.path.join(EST, 'oreja', 'aros-hd'), exist_ok=True)
shutil.copyfile(os.path.join(ART, 'oreja.js'), os.path.join(EST, 'oreja3d.js'))
shutil.copyfile(os.path.join(ART, 'oreja.css'), os.path.join(EST, 'oreja3d.css'))
shutil.copyfile(os.path.join(ART, 'escena-foto.js'), os.path.join(EST, 'oreja3d-escena.js'))
shutil.copyfile(os.path.join(ART, 'contornos-aros.js'), os.path.join(EST, 'oreja', 'contornos.js'))
for f in ['foto-oreja.webp', 'foto-mascara.png', 'poster.webp', 'poster-m.webp']:
    shutil.copyfile(os.path.join(ART, f), os.path.join(EST, 'oreja', f))
for d in ['aros', 'aros-hd']:
    for f in os.listdir(os.path.join(ART, d)):
        shutil.copyfile(os.path.join(ART, d, f), os.path.join(EST, 'oreja', d, f))
print('oreja.tpl con', len(aros), 'aros · ejemplo', ejemplo)
