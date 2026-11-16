# Arma el prototipo "Armá tu oreja" (artefacto/): index.html con los datos reales de la tienda (al 2026-11-11) escritos en la lista
# escondida, y contornos-aros.js con el contorno (y los huecos) de cada aro. Uso: python construye.py
import os, json, html
AQUI = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(AQUI, 'artefacto')
META = json.load(open(os.path.join(AQUI, 'aros-meta.json'), encoding='utf-8'))
PROD = json.load(open(os.path.join(AQUI, 'aros.json'), encoding='utf-8')) + json.load(open(os.path.join(AQUI, 'cuffs.json'), encoding='utf-8'))

# clave: (nombre en la tarjeta, tema)
NOMBRES = {
    'espm': ('Espada Mulan', 'Disney'), 'jaul': ('Jaulita Mulan', 'Disney'), 'mush': ('Mushu', 'Disney'), 'pein': ('Peineta Mulan', 'Disney'),
    'arco': ('Arco y flecha Valiente', 'Disney'), 'flec': ('Flecha Valiente', 'Disney'), 'neni': ('Nenito Valiente', 'Disney'),
    'lilo': ('Lilo', 'Disney'), 'trap': ('Muñeca de Lilo', 'Disney'), 'reno': ('Reno Frozen', 'Disney'), 'hadr': ('Hada Aurora rosa', 'Disney'),
    'hadv': ('Hada Aurora verde', 'Disney'), 'dona': ('Donald', 'Disney'), 'mono': ('Monito Aladdin', 'Disney'),
    'carr': ('Carroza Cenicienta', 'Disney'), 'zapa': ('Zapato Cenicienta', 'Disney'),
    'moon': ('Moon gold', 'Cielo'), 'rayo': ('Rayito gold', 'Cielo'), 'star': ('Star', 'Cielo'), 'estr': ('Estrellita rose', 'Cielo'),
    'esci': ('Estrella con circonio', 'Cielo'), 'cohe': ('Cohete de cristal', 'Cielo'), 'satu': ('Saturn', 'Cielo'), 'apol': ('Aro Apolo', 'Cielo'),
    'musi': ('Music', 'Cielo'),
    'quee': ('Argollita Queen', 'Brillos'), 'alas': ('Circonio con alas', 'Brillos'), 'tres': ('Tres circonios y nácar', 'Brillos'),
    'libe': ('Libélula de cristal', 'Brillos'), 'ojo': ('Ojo cristal azul', 'Brillos'), 'flor': ('Flor turquesa', 'Brillos'), 'swep': ('Sweet purple', 'Brillos'),
    'love': ('Love', 'Clásicos'), 'powe': ('Power love', 'Clásicos'), 'lazo': ('Moño listón', 'Clásicos'), 'ancl': ('Ancla gold', 'Clásicos'),
    'plan': ('Plane silver', 'Plateados'), 'boli': ('Bolita silver', 'Plateados'), 'sire': ('Cola de sirena', 'Plateados'), 'torn': ('Crystal tornasol', 'Plateados'),
    'apo2': ('Aro Apolo 2.0', 'Cielo'),
    'chag': ('Argollita cadena gold', 'Brillos'),
    'cdos': ('Colgante dos circonios y shine', 'Brillos'),
    'anci': ('Argollita con ancla', 'Plateados'),
    'cueb': ('Cuernito blue', 'Clásicos'),
    'cueg': ('Cuernito green', 'Clásicos'),
    'avio': ('Aro Plane', 'Clásicos'),
    'arsk': ('Aro Sky', 'Cielo'),
    'vele': ('Velero Moana', 'Disney'),
    'cact': ('Cactus de cristal', 'Brillos'),
    'casi': ('Casiopea corazón', 'Cielo'),
    'chai': ('Chains', 'Clásicos'),
    'chan': ('Chanchito Moana', 'Disney'),
    'coco': ('Cocodrilo Tiana', 'Disney'),
    'coh2': ('Cohete de cristal 2', 'Cielo'),
    'emoj': ('Emoji enamorado', 'Plateados'),
    'emot': ('Emoticon con estrellitas', 'Brillos'),
    'espi': ('Espiral multicolor', 'Brillos'),
    'gall': ('Gallo Moana', 'Disney'),
    'garf': ('Garfio', 'Disney'),
    'icec': ('Ice cream silver', 'Plateados'),
    'luci': ('Luciérnaga Tiana', 'Disney'),
    'mont': ('Montaña rusa', 'Disney'),
    'perc': ('Percy', 'Disney'),
    'rato': ('Ratón Cenicienta', 'Disney'),
    'sat2': ('Saturn silver', 'Plateados'),
    'swhi': ('Sweet white', 'Brillos'),
    'tene': ('Tenedor', 'Disney'),
    'cmin': ('Ear cuff Moño Minnie', 'Ear cuffs'), 'cshi': ('Ear cuff Shine silver', 'Ear cuffs'),
}
SELECCION_NOMBRE = {  # el nombre del producto en la tienda (para sus datos)
    'espm': 'Espada Mulan', 'jaul': 'Jaulita de Mulan', 'mush': 'Mushu Mulan', 'pein': 'Peineta Mulan', 'arco': 'Arco y flecha Valiente',
    'flec': 'Flecha valiente - 3022', 'neni': 'Nenito de Valiente', 'lilo': 'Lilo - 4063', 'trap': 'Muñeca de trapo', 'reno': 'Reno frozen',
    'hadr': 'Hada aurora rosa', 'hadv': 'Hada Aurora verde', 'dona': 'Donald', 'mono': 'Monito Aladdin', 'carr': 'Carroza Cenicienta',
    'zapa': 'Zapato Cenicienta', 'moon': 'Moon gold', 'rayo': 'Rayito gold', 'star': 'STAR - 2851', 'estr': 'Estrellita rose',
    'esci': 'Estrella con circonio', 'cohe': 'Cohete de cristal - 058', 'satu': 'Saturn - 3864', 'apol': 'Aro apolo - 015', 'musi': 'Music - 049',
    'quee': 'Argollita queen', 'alas': 'Circonio rectangular con alas', 'tres': 'tres circonios', 'libe': 'libelula', 'ojo': 'Ojo cristal azul',
    'flor': 'Flor turquesa', 'swep': 'Sweet purple', 'love': 'Love - 3949', 'powe': 'Power love', 'lazo': 'moño liston', 'ancl': 'Ancla gold',
    'plan': 'Plane silver', 'boli': 'Bolita silver', 'sire': 'Cola de sirena', 'torn': 'Crystal Tornasol', 'cmin': 'Moño minnie', 'cshi': 'Ear cuff shine silver',
    'apo2': 'Apolo 2.0 - 2048',
    'chag': 'Argollita colgante chain gold',
    'cdos': 'dos circonios colgante',
    'anci': 'Argollita con ancla silver',
    'cueb': 'Aro cuernito blue',
    'cueg': 'Aro cuernito green',
    'avio': 'Aro plane - 019',
    'arsk': 'Aro sky - 044',
    'vele': 'Aro velero Moana',
    'cact': 'Cactus de cristal',
    'casi': 'Casiopea corazon',
    'chai': 'Chains - 3525',
    'chan': 'CHANCHITO MOANA',
    'coco': 'Cocodrilo La princesa',
    'coh2': 'Cohete de cristal - 4026',
    'emoj': 'Emoji enamorado',
    'emot': 'Emoticon con estrellitas',
    'espi': 'Aro espiral multicolor',
    'gall': 'Gallo Moana',
    'garf': 'Garfio - 2388',
    'icec': 'Ice cream silver',
    'luci': 'Luciernaga (La princesa',
    'mont': 'rusa - 2514',
    'perc': 'Percy de Pocahontas',
    'rato': 'Cenicienta - 2378',
    'sat2': 'Saturn silver - 1580',
    'swhi': 'Sweet white',
    'tene': 'Tenedor - 2374',
}
ARG = json.load(open(os.path.join(AQUI, 'argollas.json')))   # la argolla de cada aro, medida en su foto (mide_argollas.py)
A640 = json.load(open(os.path.join(AQUI, 'alto640.json'))) if os.path.exists(os.path.join(AQUI, 'alto640.json')) else {}
K640 = 0.0087                                 # unidades de la escena por píxel de la foto de 640 (calibrado con los aros bien medidos)
HOOP_W = 0.44                                  # ancho del aro de arriba en la escena (la oreja mide ~6 de alto: ~6 cm)
ALTO_A_MANO = {'carr': 2.3, 'zapa': 2.1, 'sire': 2.4, 'torn': 2.2, 'cmin': 0.62, 'cshi': 0.95,
  # (2026-11-12) los de foto puesta que se sumaron: el alto total sale de que el aro (huggie) mida ~1,15 cm → alto = 1,15 / (alto de la argolla en la foto)
  'apo2': 2.6, 'anci': 2.3, 'avio': 2.35, 'vele': 2.1, 'chan': 2.45, 'coh2': 2.9, 'emoj': 2.2, 'espi': 3.0, 'gall': 2.8, 'garf': 2.25,
  'luci': 2.5, 'rato': 2.1, 'sat2': 2.2, 'tene': 2.5}
# de entrada, 2 aros puestos (2026-11-11, como el armador de pulseras arranca con 2 charms), sin cartel de "ejemplo"
EJEMPLO = os.environ.get('EJEMPLO', 'l1:estr,l2:chag')   # 2026-11-12: Estrellita rose + Argollita cadena gold (pedido del usuario; antes Tres circonios, sin stock, y Moon gold)
ORDEN = list(NOMBRES)


def producto(nombre):
    m = [p for p in PROD if nombre.lower() in p['nombre'].lower()]
    assert len(m) == 1, (nombre, len(m))
    return m[0]


def fila(k):
    m = META[k]; p = producto(SELECCION_NOMBRE[k]); n, cat = NOMBRES[k]
    w, h = m['px']
    tipo = 'cuff' if m['tipo'] == 'cuff' else 'aro'
    porAro = h / max(1, m['aroW'] * w) * HOOP_W
    if k in ALTO_A_MANO: alto = ALTO_A_MANO[k]
    elif k in A640 and porAro / A640[k] * 100 > 1.2: alto = A640[k] * K640     # el ancho del aro se midió mal: va el alto en la foto
    else: alto = porAro
    if tipo != 'cuff': alto = max(1.3, min(3.6, alto))
    if tipo == 'cuff': ag, cx = 0.5, 0.5
    elif m['tipo'] == 'oreja': ag, cx = 0.012, m['aroCx']
    else: ag, cx = min(0.08, 0.18 * m['aroW'] * w / h), m['aroCx']
    url = p['url']
    g = ARG.get(k)
    arg = ','.join(str(g[x]) for x in ('arriba', 'abajo', 'corte', 'cxCorte', 'banda', 'metal', 'pave')) if g and tipo != 'cuff' else ''
    return {'k': k, 'n': n, 'cat': cat, 'id': p['pid'], 'v': p['vid'], 'p': p['p'], 'a': p['a'] or 0, 'st': p['st'], 'tipo': tipo,
            'asp': m['asp'], 'ag': round(ag, 4), 'cx': round(cx, 4), 'alto': round(alto, 3), 'url': url, 'arg': arg}


filas = [fila(k) for k in ORDEN if k in META and os.path.exists(os.path.join(ART, 'aros', k + '.webp'))]
faltan = [k for k in ORDEN if k not in META]
conts = {k: META[k]['cont'] for k in META if k in NOMBRES}
with open(os.path.join(ART, 'contornos-aros.js'), 'w', encoding='utf-8') as f:
    f.write('/* Panthera — contornos de los aros de "Armá tu oreja" (los calcula recorta_aros.py). Cada aro: [contorno, hueco, hueco...],\n'
            '   cada uno [x, y, x, y, ...] en fracciones de su foto recortada (x a la derecha, y hacia abajo). El 3D extruye la pieza. */\n')
    f.write('window.PNT_OR_CONTORNOS = ' + json.dumps(conts, separators=(',', ':'), sort_keys=True) + ';\n')

e = html.escape
_f = json.load(open(os.path.join(ART, 'foto-oreja.json')))
_f.update({'url': 'foto-oreja.webp', 'mascara': 'foto-mascara.png'})
FOTO = html.escape(json.dumps(_f, separators=(',', ':')), quote=True)
lis = '\n'.join(
    f'<li data-k="{r["k"]}" data-n="{e(r["n"])}" data-cat="{e(r["cat"])}" data-id="{r["id"]}" data-v="{r["v"]}" data-p="{r["p"]}" data-a="{r["a"]}" data-st="{r["st"]}" '
    f'data-tipo="{r["tipo"]}" data-asp="{r["asp"]}" data-ag="{r["ag"]}" data-cx="{r["cx"]}" data-alto="{r["alto"]}" data-url="{e(r["url"])}" data-arg="{r["arg"]}" '
    f'data-img="aros/{r["k"]}.webp" data-hd="aros-hd/{r["k"]}.webp" data-hdn="aros-hd/{r["k"]}-n.webp"></li>' for r in filas)
hay_poster = os.path.exists(os.path.join(ART, 'poster.webp'))
poster = '<picture><source media="(max-width: 699px)" srcset="poster-m.webp"><img class="poster" src="poster.webp" alt="" decoding="async"></picture>' if hay_poster else ''
BOLSA = '<svg class="bolsa" viewBox="0 0 565 512" aria-hidden="true"><path d="M528.22,422.85l-37.53-230.4c-6.05-37.16-38.15-64.45-75.8-64.45h-4.65C410.24,57.31,352.93,0,282.24,0S154.24,57.31,154.24,128h-4.65c-37.65,0-69.75,27.29-75.8,64.45l-37.53,230.4c-7.610,46.73,28.46,89.15,75.8,89.15H452.42c47.34,0,83.42-42.42,75.8-89.15ZM282.24,51.2c42.42,0,76.8,34.38,76.8,76.8H205.44c0-42.42,34.38-76.8,76.8-76.8Zm170.18,409.6H112.05c-15.78,0-27.8-14.14-25.27-29.72l37.53-230.4c2.020-12.39,12.72-21.48,25.27-21.48h4.65v51.2h51.2v-51.2h153.6v51.2h51.2v-51.2h4.65c12.55,0,23.25,9.1,25.27,21.48l37.53,230.4c2.540,15.58-9.48,29.72-25.27,29.72Z"/></svg>'
TARJ = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg>'

pagina = f'''<title>Armá tu oreja</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700&family=Outfit:wght@400;500;600;700&display=swap">
<style>
/* Prototipo con la estética de la tienda: paleta y letras de marca.css (una sola versión, clara, como la tienda) */
:root{{
  --pnt-rosa:#F4ACC4; --pnt-rosa-hover:#F29AB7; --pnt-dorado:#EEC049; --pnt-dorado-hover:#EAB838; --pnt-rosa-precio:#EE779F;
  --pnt-blanco:#FFFFFF; --pnt-texto:#000000; --pnt-gris:#4D4D4D;
  --pnt-letra:'Outfit',system-ui,-apple-system,'Segoe UI',sans-serif; --pnt-titulo-general:'Archivo','Arial Narrow',system-ui,sans-serif;
  color-scheme:light;
}}
html{{background:#FFFFFF}}
body{{margin:0;background:#FFFFFF;color:#000000;font:400 15px/1.5 var(--pnt-letra);-webkit-font-smoothing:antialiased;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
.pie-proto,.cab-proto{{max-width:none;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 24px;color:#4D4D4D;font-size:12px;line-height:1.45}}
.cab-proto{{padding-block:14px 0}}
.cab-proto b{{color:#000000;font-weight:600;letter-spacing:.16em;text-transform:uppercase;font-size:10.5px}}
.seccion{{padding-block:clamp(28px,4vw,56px) clamp(28px,4vw,48px);margin:0 auto;max-width:1900px}}
.cab{{margin:0 0 clamp(14px,1.6vw,24px)}}
.cab h1{{margin:0;font:700 clamp(23px,2.6vw,44px)/1 var(--pnt-titulo-general);letter-spacing:-.02em;text-transform:uppercase;font-synthesis:none;text-wrap:balance}}
.cab p{{margin:8px 0 0;color:#4D4D4D;font-size:clamp(12.5px,.95vw,15px);line-height:1.35;max-width:70ch}}
.pnt-or-host{{display:block;min-height:clamp(560px,76vh,690px)}}
.pnt-or-host:not(.listo){{visibility:hidden}}
.pie-proto{{padding-block:0 28px;max-width:110ch;flex-direction:column;justify-content:flex-start}}
.pie-proto p{{margin:0}}
@media (max-width:699px){{.pnt-or-host{{min-height:0}}}}
</style>
<header class="cab-proto"><b>Prototipo para Panthera</b><span>Aros, precios y stock reales de la tienda al 11/11/2026 · el carrito está simulado</span></header>
<main class="seccion">
  <header class="cab">
    <h1>Armá tu oreja</h1>
    <p>Elegí cuántos aritos, combinalos y mirá cómo quedan puestos antes de comprar.</p>
  </header>
  <div class="pnt-or-host" data-pnt-or data-escena="escena-foto.js" data-contornos="contornos-aros.js" data-foto="{FOTO}" data-ejemplo="{EJEMPLO}">
    <template>
<link rel="stylesheet" href="oreja.css">
<ul hidden data-or-aros>
{lis}
</ul>
<div class="app">
  <section class="stage" id="stage" aria-label="Vista 3D de tu oreja">
    <canvas id="c" aria-hidden="true"></canvas>
    <div class="cargando" id="cargando">{poster}<i></i><p>Preparando tu oreja…</p></div>
    <p class="vacio" id="vacio" hidden>Tocá un aro (o arrastralo) para sumarlo</p>
    <div class="etiqueta" id="etiqueta" hidden></div>
    <p class="medida" id="medida" aria-live="polite"></p>
    <div class="cuenta"><b id="cuenta">0</b><span id="cuenta-l">piezas</span></div>
    <div class="st-pie"><p class="hint" id="hint"></p></div>
    <div class="total" aria-live="polite">
      <p class="t-cab" id="t-lbl"></p>
      <span class="p-linea"></span>
      <p class="p-lista" id="t-lista"></p>
      <p class="p-transf"><b id="t-tr"></b><span>Con transferencia</span></p>
      <p class="p-cuotas">{TARJ}<span>3 cuotas sin interés de <span id="t-cuota"></span></span></p>
      <button type="button" class="cta" id="cta"><span id="cta-t">Agregar al carrito</span>{BOLSA}</button>
    </div>
    <div class="nogl" id="nogl" hidden><p>Tu navegador no muestra 3D. Igual podés elegir aros y ver el total.</p></div>
    <div class="lupa" id="lupa" hidden role="dialog" aria-labelledby="lupa-n">
      <button type="button" class="lupa-x" id="lupa-x" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <p class="lupa-t" id="lupa-t">De cerca</p>
      <p class="lupa-n" id="lupa-n"></p>
      <p class="lupa-d" id="lupa-d"></p>
      <div class="lupa-p" id="lupa-p"></div>
      <button type="button" class="lupa-sacar" id="lupa-sacar">Sacar de la oreja</button>
    </div>
  </section>
  <section class="dock" aria-labelledby="dock-t">
    <div class="dock-cab">
      <div><h2 id="dock-t">Sumá tus aros</h2><p id="dock-s"></p></div>
      <div class="chips" id="chips" role="group" aria-label="Filtrar por tema"></div>
    </div>
    <div class="tira-caja">
      <button type="button" class="flecha izq" id="t-izq" aria-label="Aros anteriores"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="tira" id="tira"></div>
      <button type="button" class="flecha der" id="t-der" aria-label="Más aros"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
  </section>
  <aside class="panel" aria-label="Tu oreja">
    <section class="paso hecho"><h3><i>1</i>¿Cuántos aritos tenés?</h3><div class="talles" id="huecos"></div></section>
    <section class="paso" id="paso2"><h3><i>2</i>Tu combinación</h3><ol class="lista" id="lista"></ol></section>
    <div class="total-ranura" id="total-ranura"></div>
  </aside>
</div>
<div class="fantasma" id="fantasma" hidden><img alt=""></div>
<div class="toast" id="toast" role="status" aria-live="polite"><span id="toast-t"></span><button type="button" id="toast-b" hidden>Deshacer</button></div>
<div class="barra" id="barra"><div class="barra-p"><span class="p-lista">Ahora <b id="b-total"></b></span><span class="p-transf"><b id="b-tr"></b><span>Con transferencia</span></span></div><button type="button" class="cta" id="b-cta" aria-label="Agregar al carrito">{BOLSA}<span>Agregar</span></button></div>
    </template>
  </div>
</main>
<footer class="pie-proto">
  <p>Cómo funciona: la oreja es una foto de muestra. La argolla de cada aro es 3D (con las medidas y el metal de su foto en la tienda): cuelga casi de canto, atraviesa el lóbulo y la mitad de atrás queda detrás de la oreja, como en las fotos de Panthera con el aro puesto. El dije es la foto del producto, recortada y con volumen, colgando de la argolla. Arrastrá para hamacarlos, tocá un aro para verlo de cerca o un agujero libre para elegir dónde va el próximo.</p>
  <p>{len(filas)} aros solitarios y ear cuffs de la tienda (de 73 solitarios y 2 ear cuffs). En la tienda, "Agregar al carrito" sumaría cada aro al carrito real, como el armador de pulseras.</p>
</footer>
<script src="oreja.js"></script>
'''
open(os.path.join(ART, 'index.html'), 'w', encoding='utf-8').write(pagina)
print('index.html con', len(filas), 'aros · faltan:', faltan)
for r in filas: print(' ', r['k'].ljust(5), r['cat'].ljust(10), str(r['p']).rjust(6), 'alto', r['alto'], 'ag', r['ag'], 'cx', r['cx'], 'st', r['st'])
# copia local para las pruebas (con su esqueleto, como la publica el artefacto): no se publica
open(os.path.join(ART, '_prueba.html'), 'w', encoding='utf-8').write(
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + pagina + '</body></html>')
