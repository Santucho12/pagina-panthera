# (2026-11-15, noche) CLAUDE.md y PENDIENTES.md: envío gratis del carrito, "sin stock no aparece" en los armadores, checkout con la paleta
# y lo que la revisión antes de subir encontró "forzado" o desactualizado (ítems 197 y 199–207).
import io


def parche(p, pares, al_final=None):
    s = io.open(p, encoding='utf8', newline='').read()
    e = '\r\n' if '\r\n' in s else '\n'
    for a, b in pares:
        a = a.replace('\n', e)
        b = b.replace('\n', e)
        assert s.count(a) == 1, (p, s.count(a), a[:90])
        s = s.replace(a, b)
    if al_final:
        if not s.endswith(e):
            s += e
        s += al_final.replace('\n', e)
    io.open(p, 'w', encoding='utf8', newline='').write(s)


parche('CLAUDE.md', [
    ("""    Mickey Shine y Stitch, `DE_ENTRADA` en armar3d.js; talle 18 cm, `TALLE_DE_ENTRADA`). **Sin el cartel "Arrancamos con una combinación de ejemplo"**.
    Si cambian, regenerar el póster (`node herramientas/armador/pruebas/poster.mjs`; regenerado el 2026-11-12 con Painter, Mickey y Stitch).""",
     """    Mickey Shine y Stitch, `DE_ENTRADA` en armar3d.js; talle 18 cm, `TALLE_DE_ENTRADA`). **Sin el cartel "Arrancamos con una combinación de ejemplo"**.
    **Desde el 2026-11-15: Painter y Stitch** (Mickey Shine ya no existe en la tienda; lo sin stock no se muestra, ver "Pedidos de la noche").
    Si cambian, regenerar el póster (`node herramientas/armador/pruebas/poster.mjs`; regenerado el 2026-11-15 con Painter y Stitch)."""),
], al_final="""
## 🛒 Pedidos de la noche del 2026-11-15 — carrito, stock de los armadores y checkout
- **Carrito: cuánto falta para el envío gratis** (pedido: "me debe decir cuánto me falta para llegar al envío gratis, además de decirme cuál es el monto"):
  la barra rosa dice "Te faltan **$X** para tener envío gratis" (o "¡Ya tenés envío gratis!") y abajo "Envío gratis en compras desde $150.000". Va en el
  carrito lateral y, desde ese día, también en la PÁGINA del carrito, arriba del resumen (marca.js `barraEnvio`, paginas.css 18). Con el carrito vacío no
  se ve. Prueba con un carrito de prueba real que se vacía solo: `node herramientas/revision/_envio-gratis.mjs <carpeta>`. **Ojo:** el monto sale del texto
  de la barra de anuncios; la tienda NO tiene un envío gratis con mínimo que Tiendanube informe (si lo tuviera, Lima mostraría su propia barra en el
  carrito): confirmar en el panel que el envío gratis desde $150.000 de verdad se aplique.
- **Armadores: lo que no tiene stock NO aparece** (pedido: "si un arito o pulsera o charm no está disponible, no debe aparecer"): charms y aritos con
  `st: 0` y pulseras sin ningún talle con stock no se arman (`leeDatos` de armar3d.js; filtro de `DATA` en oreja3d.js, a mano). Los talles sin stock de una
  pulsera que tiene otros siguen como "Sin stock" (no se eligen). Si la tienda rechaza algo al agregarlo (se agotó después), desaparece en ese momento
  (`agota` / `agotaTalle`; en aritos `agota`). Prueba: `node herramientas/armador/pruebas/stock.mjs` (15 ✔).
  Datos actualizados ese día contra la tienda: charms con `sincroniza_charms.mjs --precios --agotar-ausentes` (Baby girl 1; **Mickey Shine y Huella crystal
  ya no existen**); pulseras a mano (Heart cristales 19 cm sin stock, Cierre de rosa 19 cm: 4, **Cierre árbol family ya no existe**); aritos a mano
  (**Tres circonios y nácar y Moño listón ya no existen**). **El stock de los armadores es una foto del día**: re-sincronizar antes de subir y cada tanto.
- **Checkout con la paleta completa** (checkout.scss.tpl): botones y etiquetas rosas con letra BLANCA, y los tokens del `:root` (acento, texto, fondo,
  botones, etiquetas, cabecera y pie) con la paleta en vez de los colores del admin. Es un .tpl: solo se ve al publicar.
""")

parche('PENDIENTES.md', [
    ("""197. [ ] ¿La cinta "Hasta 50% off" del cartel (rosa con letra negra, no es un botón) también con letra blanca? Preguntarle al usuario.""",
     """197. [x] ¿La cinta "Hasta 50% off" del cartel (rosa con letra negra, no es un botón) también con letra blanca? → Sí, ya está blanca (paginas.css 17 b)."""),
], al_final="""199. [x] (2026-11-15) Carrito (lateral y página): "Te faltan $X para tener envío gratis" + "Envío gratis en compras desde $150.000".
200. [x] (2026-11-15) Armadores: lo sin stock no aparece (charms, pulseras, aritos); stock actualizado; pulsera de entrada con Painter y Stitch; póster nuevo.
201. [x] (2026-11-15) Checkout: botones y etiquetas rosas con letra blanca y tokens con la paleta (checkout.scss.tpl, solo se ve al publicar).
202. [ ] Cartel del hero: dice "Hasta 50% off" escrito a mano, pero hoy el descuento máximo en el inicio es 20% (también en "No los dejes escapar").
     Corregirlo o calcularlo de los productos (como la franja SALE de Ofertas) antes de publicar.
203. [ ] Envío gratis desde $150.000: Tiendanube no informa ningún envío gratis con mínimo (Lima no muestra su barra). Confirmar en el panel que se aplique.
204. [ ] Sello "Más vendido ★": lo llevan TODAS las tarjetas de "Los más elegidos" (los destacados que se eligen en el panel), no sale de ventas reales.
205. [ ] Cuotas: la barra de anuncios y el cartel de WhatsApp dicen "3 y 6 cuotas sin interés"; las tarjetas de los armadores, "3 cuotas" (dato
     de los productos). Confirmar con Panthera cuál es la real.
206. [ ] Antes de subir: re-sincronizar el stock de los armadores (charms con sincroniza_charms.mjs; pulseras y aritos a mano) y bajar un respaldo nuevo
     (`npm run bajar`): el de tienda-original-ftp-2026-11-08 es de hace una semana.
207. [ ] "Seguinos en redes", "Conocenos" y los bloques de los listados usan videos hechos con Kling (IA); confirmar que el plan de Kling permita uso comercial.
""")
print('ok')
