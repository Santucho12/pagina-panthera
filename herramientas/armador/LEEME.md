# Armá tu pulsera (3D): cómo sumar un charm nuevo

El armador **no** lee los productos de la tienda solo: sus datos están escritos a mano en
`tienda/snipplets/panthera/armar.tpl` (lista `pnt_a3_charms`) y cada charm necesita sus fotos recortadas sin fondo:
la **liviana** de la tarjeta (`tienda/static/panthera/arma/charms/<clave>.webp`), la **HD** y su **relieve** para el 3D
(`arma/charms-hd/<clave>.webp` y `<clave>-n.webp`) y su **contorno** (en `arma/contornos.js`: el 3D lo extruye y la pieza tiene
volumen). Por eso un charm que entra a la tienda **no aparece solo**: hay que sumarlo (unos minutos) y volver a publicar el tema
(con el OK de siempre, ver CLAUDE.md: NUNCA subir por FTP sin pedir permiso).
Estos archivos están afuera de `tienda/`, así que nunca se suben.

## ⚡ Automático (2026-11-14): `sincroniza_charms.mjs`
Hace solo los pasos 1 a 6 de abajo. Con el preview prendido (si no, lee la tienda directo; solo GET, no escribe nada en Tiendanube):

| Comando | Qué hace |
|---|---|
| `node herramientas/armador/sincroniza_charms.mjs` | **Informe de solo lectura**: charms nuevos en la categoría, precios y stock que cambiaron, y charms del armador que ya no están (con si su página todavía existe). |
| `… --precios` | Además actualiza precio, precio anterior y stock en `armar.tpl`. |
| `… --nuevos` | Además **suma los charms nuevos**: baja sus fotos, los recorta (liviana + HD + relieve + contorno; `--ia` solo si la foto es chica, salvo `--sin-ia`), los copia a `tienda/static/panthera/arma/` y agrega su fila a `armar.tpl`. |
| `… --agotar-ausentes` | Los charms cuya página **ya no existe** (borrados u ocultos en la tienda) se marcan sin stock (`st: 0`): si no, el carrito fallaría al agregarlos. |

- Qué NO puede saber solo: el **tipo** (`c`/`d`), la **altura del agujero** (`ag`) y el **tamaño** (`alto`) salen de la forma de la foto
  (valores típicos). En la prueba con Woody (sacado y vuelto a sumar solo) salió casi idéntico a la fila hecha a mano (`ag` 0,17 contra
  0,163). **Siempre mirar los nuevos de cerca**: `node herramientas/armador/pruebas/enhebrado.mjs sync k1,k2,…` y, si hace falta,
  `hueco` en `armar.tpl` (ver el paso 6). La categoría y la clave también se deducen del nombre: se pueden cambiar en la fila.
- Un producto borrado u oculto en Tiendanube devuelve la página "no encontrado" **con código 200**; el script solo acepta una ficha
  de verdad (`template-product`). El 2026-11-14 encontró así que **"Huella crystal" ya no existe** en la tienda.
- Después de sumar charms: `node herramientas/armador/pruebas/funciones.mjs`, y el póster no cambia (los charms de entrada son los mismos).
- Publicar sigue necesitando el OK del usuario y la confirmación doble (CLAUDE.md).

## Pasos

1. **Datos de la tienda.** Abrir la página del producto y sacar: nombre, link (`/productos/…/`), precio, precio anterior, stock,
   el **id** del producto (`<input name="add_to_cart" value="…">`) y el **id de la variante** (`data-variants`, campo `id`).
2. **Fotos.** Bajar la foto principal del CDN en dos tamaños (la clave es corta, sin espacios: `jaz`, `moon`, `mick`…):
   - 640 px → `im_hd/<clave>.webp`: `https://acdn-us.mitiendanube.com/stores/001/276/084/products/<archivo>-640-0.webp`
   - 1024 px → `im_1024/<clave>.webp`: el mismo archivo terminado en `-1024-1024.webp`
   (con `curl -A "Mozilla/5.0" …`: sin User-Agent el CDN contesta 403). Anotar de dónde salió en `fuentes.json`.
3. **Recorte.** `python recorte.py --liviana <clave>` → deja el recorte liviano (`im_rgba/<clave>.webp`), la foto HD y el relieve
   (directo en `arma/charms-hd/`) y suma el contorno a `arma/contornos.js`; también actualiza `rgba_aspectos.json` y `rgba_tam.json`.
   Necesita Python con `numpy`, `scipy`, `pillow` y `opencv-python`.
   - **Si son varios, que escriba en otra carpeta** y copiar todo junto al final: cada archivo nuevo en `tienda/` hace que el
     preview recargue la página (2026-11-11: mientras se recortaban los 35 charms nuevos, localhost se recargaba solo al
     scrollear). Con la variable `PNT_SALIDA_ARMA` el recorte escribe ahí (con `charms/`, `charms-hd/` y `contornos.js`):
     `PNT_SALIDA_ARMA=salida python recorte.py --liviana k1 k2 …` y después se copia `salida/` a `tienda/static/panthera/arma/`.
   - Si la foto de la tienda es chica (menos de ~500 px de alto útil), agregar `--ia`: la escala ×4 con **Real-ESRGAN** en esta
     compu (`realesrgan/`, no sube nada a internet) antes de recortar. Con `--vista` deja todo en `esrgan/vista/` para mirarlo antes.
     Así se hicieron ange, bruj, buzz, cora, estr, glob, minn, moon y rued (2026-11-11).
4. **Control.** `python control_recortes.py im_rgba control.png` arma una hoja con todos los recortes sobre fondo oscuro y rosa:
   mirar que no queden halos blancos ni huecos.
5. **Copiar** `im_rgba/<clave>.webp` a `tienda/static/panthera/arma/charms/<clave>.webp`.
6. **Sumar la línea** en `pnt_a3_charms` de `armar.tpl`:
   `{ k: 'clave', n: 'Nombre', cat: 'Disney', id: 123, v: 456, p: 71520, a: 89400, st: 3, tipo: 'd', ag: 0.08, alto: 1.0, asp: 0.26, url: '/productos/…/' }`
   - `cat`: una de las pestañas (Disney, Amor y familia, Viajes, Brillos y cielo, Varios).
   - `p` precio, `a` precio anterior, `st` stock (1 = sale "Última").
   - `tipo`: `'c'` charm de cuenta (la cadena lo atraviesa por el medio) o `'d'` colgante (cuelga de su aro de arriba).
   - `ag`: altura del agujero por donde pasa la cadena, como fracción del alto de la foto contando desde arriba
     (cuentas ≈ 0,47–0,55; colgantes: **el centro del agujero de su aro**, ≈ 0,12–0,22, así el aro abraza la cadena y la cadena
     entra por el agujero que se ve en la foto. Si el aro no es un aro común, como la flor o el globo, donde corresponda).
   - `alto`: tamaño en el 3D (cuentas ≈ 0,40–0,60; colgantes ≈ 0,75–1,15). `asp`: ancho ÷ alto del recorte (sale de `rgba_aspectos.json`).
   - `hueco` (opcional): el 3D busca solo el agujero que se ve en la foto y lo abre para que se vea la cadena pasando por adentro.
     Mirá el charm de cerca (tocalo: lupa): si apareció un óvalo transparente en otro lugar (entre letras, en una sombra), poné
     `hueco: 'no'`; si el agujero está pero el recorte quedó corrido, fijalo con `hueco: 'cx,cy,rx,ry'` (centro y radios en
     fracciones de la foto; ver Mickey manitos).
   - Las fotos se encuentran solas por la clave (`data-img`, `data-hd` y `data-hdn` se arman en el `{% for %}` de `armar.tpl`):
     tienen que existir las tres (`charms/<clave>.webp`, `charms-hd/<clave>.webp` y `charms-hd/<clave>-n.webp`).
7. **Probar** en http://localhost:5700 (`npm run dev`): que el charm se vea bien (con volumen y nítido de cerca: tocalo para abrir
   la lupa), que la cadena pase por su agujero y que se pueda agregar al carrito. `node pruebas/funciones.mjs` corre las pruebas
   y `node pruebas/enhebrado.mjs <etiqueta> k1,k2,…` muestra esos charms de cerca y puestos (de a 6 por pulsera).
8. **Publicar** solo con el OK del usuario y la confirmación doble.

Si a un charm le falta el contorno, igual aparece: se arma con capas, como antes. Si le falta la foto HD, usa la liviana (y la
consola avisa que no encontró el archivo).

## Precios y stock
Se ven los de la fecha en que se escribieron en `armar.tpl`. El carrito **siempre cobra el precio real**; si un charm se agotó,
al agregar el armador avisa que no tiene stock. Si cambian precios o stock, actualizar `armar.tpl` y volver a publicar.

## Banco de pruebas (`pruebas/`, con Chrome y puppeteer-core del proyecto; el preview tiene que estar prendido)
| Comando | Qué hace |
|---|---|
| `node pruebas/funciones.mjs` (y `--sin-cdn`) | 21 pruebas: cómo arranca (Silver Flower, talle marcado, 3 charms), sumar, sacar (tocando la tarjeta otra vez o en la lupa), Deshacer, base, talle, girar, lupa, arrastrar, carrito (los POST se interceptan: el carrito real no se toca). Con `--sin-cdn`, que todo ande sin 3D (póster). |
| `node pruebas/capturas.mjs <etiqueta> [query] [d,v,8,t,m]` | Capturas fijas (ejemplo, vitrina de las 7 bases, 8 charms, tablet, celular) en `pruebas/capturas/<etiqueta>/`. |
| `node pruebas/movimiento.mjs …` | Videos de cada movimiento con reloj fijo (intro, sumar, sacar, lupa, base, talle, festejo, reposo). |
| `node pruebas/rendimiento.mjs <etiqueta> a3debug` | fps, ms por cuadro del 3D en cada nivel de calidad y memoria al sumar y sacar 30 charms. |
| `node pruebas/descarga.mjs` | Cuánto baja el armador antes de que la persona toque algo (compu y celular). |
| `node pruebas/llegada.mjs [compu\|celu] [golpe\|pausa]` | Tareas largas al llegar a la sección (que el 3D no trabe la página). |
| `node pruebas/anchos.mjs <etiqueta> [anchos]` | La sección en 1920…360 px con altos de pantalla reales. |
| `node pruebas/enhebrado.mjs <etiqueta> [k1,k2,…]` | Los charms de cerca y en la pulsera: que la cadena pase por el agujero de cada uno a la altura justa. Sin lista, los 27 primeros; con lista, esos (de a 6 por pulsera). |
| `node pruebas/poster.mjs` | Regenera `arma/poster.webp` y `poster-m.webp` (hacerlo si cambia la pulsera de ejemplo). |
| `python pruebas/compara.py A B …` | Hoja de antes/después entre dos carpetas de capturas. |

## Hoy (2026-11-11)
El armador muestra **los 62 charms/dijes** de la categoría Charms/Dijes de la tienda (`/todos-los-productos/charms-panthera/`, 2
páginas): los 27 de antes + 35 sumados el 2026-11-11 (pedido del usuario: "no están todos los charms/dijes"). Cómo se hizo, por si
hay que repetirlo con los que entren después (scripts en la carpeta de trabajo de esa sesión, no en el proyecto):
1. Listar la categoría (las 2 páginas) y sacar los links que no están en `armar.tpl`.
2. De cada página de producto (por el preview, solo lectura): id, variante, precio, precio anterior, stock y foto (`og:image`).
3. Fotos a `im_hd/` y `im_1024/` (pasos 2 y 3 de arriba; las de fondo de color se pasaron a fondo blanco con rembg
   `isnet-general-use` y la original quedó como `<clave>-original.webp`). Recorte con `PNT_SALIDA_ARMA` (`--ia` en las chicas).
4. Mirar cada recorte y decidir: nombre corto, pestaña, tipo, `ag`, `alto` y `hueco: 'no'` si hace falta.
5. Sumar las líneas al final de `pnt_a3_charms` (ojo: **nada de `{# comentarios #}` adentro del arreglo**: Twig.js falla y el
   preview se saltea toda la sección; el comentario va arriba del `{% set %}`).

## Carga fluida y enhebrado (2026-11-12)
- La escena se arma ANTES de llegar, de a una y en pasos chicos (secciones.js → `PNT_3D`); el póster es la pose exacta del primer cuadro del 3D
  (`pruebas/poster.mjs`, `pruebas/poster-oreja.mjs`). Ver CLAUDE.md ("Carga fluida y enhebrado").
- `pruebas/fluidez.mjs [a3|or] etiqueta [--video] [--perfil] [--celu] [--demora ms]`: baja con la rueda y mide; con `--video` deja una tira de capturas
  en `pruebas/capturas/fluidez-<etiqueta>.jpg`; con `--perfil`, qué funciones ocupan cada tarea larga.
- `pruebas/agujeros.mjs` lista los charms sin agujero detectado y sin `hueco:` a mano; `pruebas/enhebrado.mjs <etiqueta> k1,k2,…` los captura de cerca.
- `hueco:` en armar.tpl: `'no'` | `'cx,cy,rx,ry'` | `'cx,cy,rx,ry,lado'` (lado 1 = la cadena entra por la izquierda de la foto, −1 = por la derecha).
  En colgantes, `ag` es el centro del agujero del aro (no su borde: así el aro abraza la cadena).
- `limpia_blancos.py cmic,flor [--vista]` saca el fleco blanco y el interior blanco de un recorte (solo piezas doradas/rosé: en plata se comería el brillo).
