# Panthera — rediseño de la tienda Tiendanube (tema Lima)

## ⛔ REGLA PRINCIPAL: NUNCA SUBIR NADA POR FTP
Panthera todavía no dio permiso para actualizar la tienda. **No subir nada a Tiendanube.**
Regla del usuario (2026-11-09): *"NUNCA SUBAS NADA VIA FTP. Anotalo como regla que me tiene que pedir el OK y que si
estoy seguro porque sería un error"*. Antes de CUALQUIER subida:
1. Pedirle al usuario el OK explícito.
2. Aunque diga que sí, volver a preguntar: **"¿Estás seguro? Subir sería publicarlo en la tienda real"**, y esperar
   un sí claro. Nunca subir por iniciativa propia ni como parte de otra tarea.
Esto incluye:
- No correr `npx tiendanube theme ftp push` ni `npx tiendanube theme ftp watch` (publican al instante).
- No desbloquear `subir.mjs` ni agregar otro script que suba.
- No volver a poner `.nuvem` dentro de `tienda/` ni de los backups.
- No cambiar nada de la tienda por el MCP de Tiendanube (productos, categorías, etc.) sin pedirlo.
Solo se permiten lecturas: `npm run diferencias` (diff) y `npm run bajar` (pull a carpeta nueva).

**Workflow de GitHub "Publicar tienda por FTP"** (`.github/workflows/publicar-tienda.yml`, creado el 2026-11-16 con el OK del usuario,
para trabajar desde el celular): solo corre A MANO desde Actions. Modo `probar` = baja respaldo + lista lo que cambiaría (no toca la
tienda); modo `publicar` = respaldo + sube lo cambiado de `tienda/` (sin borrar nada) y exige escribir `PUBLICAR`. Credenciales en los
secretos `FTP_SERVER`, `FTP_USER`, `FTP_PASSWORD` (nunca en el repo). La regla de arriba sigue: antes de decirle al usuario que lo
ejecute en modo `publicar`, pedir el OK y volver a preguntar "¿Estás seguro?". Nunca dispararlo por iniciativa propia.

## Cómo se trabaja
Ver LEEME.md. Resumen: `tienda/` es el tema bajado por FTP; `npm run dev` muestra la tienda real en
localhost:5700 con `tienda/static/` encima (marca.css/marca.js de `static/panthera/` en todas las páginas).
Los `.tpl` no se ven en local hasta subirlos. `tienda-original-ftp-2026-11-08/` es el backup intacto.
Mismo flujo que `../Pagina web BS23` (ahí sí se sube; acá no).

## 🎨 Paleta (acordada con el cliente el 2026-11-09) — NO usar ningún otro color
- **Principal: rosa `#F4ACC4`** · hover `#F29AB7` (el hover SOLO dentro de reglas :hover)
- **Secundario: dorado `#EEC049`** · hover `#EAB838` (ídem). Desde el 2026-11-09 (pedido del usuario): un poco más
  intenso, a mitad de camino entre el anterior `#E7CD90` y el dorado de las estrellas de BS23 `#F5B301`.
  Dos dorados puntuales que pidió el usuario, sacados de este (no usarlos para otra cosa):
  **logo `#EDC45F`** (`--pnt-dorado-logo`: apenas más cerca de su dorado original `#E9CE91`; marca.js sección 9 lo
  pinta con máscara CSS) y **estrellas de las reseñas `#F0BC33`** (`--pnt-dorado-estrellas`: apenas más cerca de `#F5B301`).
  El dorado del logo también lo usa el sello "★ Más elegido" de las tarjetas (con letra blanca), pedido del usuario.
- **Fondo: blanco `#FFFFFF`**
- **Textos en negro `#000000`**; subtítulos y detalles en gris `#4D4D4D`
- **Rosa del precio (pedido el 2026-11-09):** el precio con transferencia y "CON TRANSFERENCIA" de las tarjetas de
  "Los más elegidos" (sección 10 de `marca.css`) van en un rosa más intenso, **`#EE779F`** (`--pnt-rosa-precio`: mismo
  tono que el rosa de la marca, más saturado y oscuro), para que se noten: en el rosa principal y en el del hover
  quedaban muy apagados. Solo para ese precio. No "arreglarlo" de vuelta al rosa principal.
- **Excepción del rojo (pedida el 2026-11-09):** la sección "No los dejes escapar" usa el rojo de BS23 `#E60000` (título con "Precio lista" tachado, "Deslizá" y puntitos, etiqueta de descuento, "Ahorrás $X" de cada tarjeta y primera tarjeta "Ofertas"), como la sección Ofertas de BS23. Solo ahí; está al final de `marca.css`.
  Desde el 2026-11-12 también en la **ficha de un producto de la categoría "Ofertas"** (pedido: "este producto está en ofertas, debería tener la estética roja"): ver "Ficha de producto" más abajo.
- **Excepción de Instagram (pedida el 2026-11-10):** los aros de las historias de "Seguinos en redes" usan el degradado de Instagram (rosa-rojo `#F5385E` → naranja `#FF8A1F` → amarillo `#FFC81A`), como las de BS23. Solo ahí (sección 4 de `marca.css`).
- **Excepción de WhatsApp (pedida el 2026-11-09):** el botón flotante y el cartel de WhatsApp (sección 6 de `marca.css`)
  usan los verdes de WhatsApp como Signos/BS23 (#25D366, cabecera #075E54, respuesta verde claro, tildes azules).
  Se probó la cabecera en rosa y el usuario pidió volver al verde.

Tokens al principio de `tienda/static/panthera/marca.css` (--pnt-rosa, --pnt-dorado, --pnt-*-hover, --pnt-blanco,
--pnt-texto, --pnt-gris). Nunca inventar tonos. Al copiar algo de Signos o BS23, traducir sus colores a estos.

## 🔤 Tipografía (desde el 2026-11-12: MONTSERRAT en toda la tienda) — NO usar ninguna otra
- Pedido del usuario (2026-11-12): *"usá Montserrat extra bold en casi toda la web, menos en lo que tenga que ir con letra finita"*.
- Una sola familia, `Pnt Montserrat` (`@font-face` al principio de `marca.css`, Montserrat variable de fonts.gstatic.com): de 100 a 500 se dibuja
  en su peso real (la letra fina) y **todo lo que pide 600 o más se dibuja en ExtraBold 800**. Por eso alcanza con el peso de cada regla: lo
  que era negrita es extra bold y lo fino queda fino. `--pnt-letra` y `--pnt-titulo-general` apuntan a ella.
- **Única excepción: el texto grande de los banners de categorías** (Disney, Aritos, Pulseras, Charms) sigue en **Libre Baskerville**
  (`--pnt-titulo`, peso 500). Se pasó a Montserrat y el usuario pidió volver ("en categorías volvé a la tipografía de antes", 2026-11-12).
  Se carga aparte (link de Google Fonts en `layout.tpl` y en `FUENTES` de `tienda-local.mjs`). El rótulo chico "COLECCIÓN" va en Montserrat.
- Los nombres bajo los círculos de "Seguinos en redes" van en 590 (semibold), apenas menos gruesos (pedido 2026-11-12).
- **Fino a propósito:** el número de la calificación ("4,8", en tarjetas, ficha y reseñas: siempre fino, pedido 2026-11-12), bajadas y subtítulos grises, textos y descripciones, el precio tachado, las cuotas, los links del footer, los campos,
  el aviso de cookies y el chat de WhatsApp. **Extra bold:** títulos, botones, precios, nombres de producto, menú, etiquetas, banners (marca.css sección 20).
- Lima usa las clases `.h1/.h3/.h6` también en PRECIOS: los títulos se eligen por etiqueta (h1 a h6), no por esas clases.
- Antes: títulos en Archivo, banners en Libre Baskerville y el resto en Outfit (respaldo en `respaldos/2026-11-12-antes-de-montserrat/`).
  Probado y descartado (2026-11-12): toda la web en Libre Baskerville.

## 🏠 Secciones nuevas del inicio (2026-11-10): Armá tu pulsera · Colecciones Disney · Cómo cuidar tu plata · Nuestros locales
Van después de "No los dejes escapar" y antes de "Seguinos en redes". Archivos: `snipplets/panthera/{armar,disney,cuidar,locales}.tpl`
(el preview los renderiza como a intro/redes; `tienda-local.mjs` → `SNIPPLETS`), `static/panthera/secciones.css` y `secciones.js`;
`layouts/layout.tpl` ya los incluye (preparado, sin subir). Diseños elegidos del artefacto de ideas: A20, B2, D18. "Cómo cuidar tu plata" se rehízo el 2026-11-10 sobre una referencia que pasó el usuario (sección de tips con acordeón): quedó la V1 del artefacto de acordeones: título + foto de pulseras (banners/pulseras.webp) a la izquierda y acordeón "Cuidado 1…5" a la derecha, uno abierto a la vez (secciones.js, sección 3). Ajustes pedidos: sección más baja sin achicar la foto, acordeón con transiciones suaves (0.7s, curva --pnt-suave). Cabecera igual a la de "Armá tu pulsera" (título en mayúsculas en una línea + frase chica, arriba a todo el ancho); en compu la foto copia el alto del acordeón (filas compactas). Sin botón "Ver todos los cuidados" ni aviso de cobre/acero (los pidió sacar). Ancho: "Cómo cuidar" más angosta que los carruseles (margen clamp(20px, 8vw, 160px), pedido dos veces; 10px en celu, igual que ellos); "Armá tu pulsera" va a TODO el ancho como "Los más elegidos" (pedido del usuario, ver más abajo). Ojo: este Windows pide movimiento reducido; por eso el acordeón NO tiene regla `prefers-reduced-motion` (si no, no anima).
- **Los productos, precios, stock y fotos están escritos a mano en cada `.tpl`** (el tema no puede pedir "este producto" desde el
  inicio). Si cambia un precio o un stock, actualizarlo ahí. Nunca inventar datos: las direcciones de "Nuestros locales" salen de la
  página de Contacto de la tienda y los consejos de "Cómo cuidar tu plata" de la página Cuidados. **No hay horarios ni fotos del local.**
- "Armá tu pulsera" es el **armador 3D** (2026-11-10; reemplazó a la ficha A20, que quedó en `respaldos/2026-11-10-armar-a20/`):
  `armar.tpl` (marcado + datos reales escritos a mano: ids, variantes de cada talle, precios, stock) + `static/panthera/armar3d.js` y
  `armar3d.css` (van adentro de un Shadow DOM: Lima no los toca y no tocan la tienda) + fotos en `static/panthera/arma/` (charms
  recortados sin fondo y bases). Desde el 2026-11-11 (pulido premium, por fases: plan en `~/.claude/plans/frolicking-launching-locket.md`,
  respaldo de antes en `respaldos/2026-11-11-armador-antes-de-pulir/`) **la escena 3D vive en `static/panthera/armar3d-escena.js`**
  (`data-escena` en `armar.tpl`) y usa **three.js 0.187.0 de jsDelivr (`+esm`, import dinámico)**; las dos cosas se piden recién
  cuando la sección se acerca; fuera de pantalla no dibuja. `armar3d.js` quedó con interfaz, datos y carrito. Banco de pruebas
  (capturas, videos, rendimiento, funciones, descarga, llegada) en `herramientas/armador/pruebas/`; con `?a3debug` la escena deja `window.__a3`.
  Lo que quedó del pulido (2026-11-11): luz de estudio propia → PMREM + tone mapping Neutral, plata física, cadena snake en shader,
  sombra de contacto suave, cristales con shader de gema, charms **con volumen** (contorno extruido: `arma/contornos.js`) y **foto HD +
  relieve** a demanda (`arma/charms-hd/<k>.webp` y `<k>-n.webp`, por `data-hd`/`data-hdn` en `armar.tpl`; 9 escaladas con Real-ESRGAN
  local), movimientos con resortes (tabla `MOV` en la escena), **lupa** al tocar un charm o el cierre (con "Sacar"), y **póster**
  (`arma/poster.webp` / `poster-m.webp`: la pulsera de ejemplo; se ve si el 3D tarda o falla; si cambia el ejemplo, regenerarlo con
  `pruebas/poster.mjs`). Arranque sin trabar: la escena se arma con la página quieta (si se puede, antes de llegar), los shaders se
  compilan en segundo plano (`compileAsync`) y los cierres de las otras bases se arman en ratos libres. Las fotos de las tarjetas
  bajan de a las que se ven (`data-src`). Detalle (2026-11-11, segunda vuelta): el canto de cada charm toma el color de su foto y es
  redondeado (contorno suavizado), la cadena se oscurece donde entra a cada pieza, y en las piezas con agujero (cuentas y **aros de
  los colgantes**: su `ag` es el centro del agujero del aro) **el agujero de la foto se abre** y se ve la cadena pasando por
  adentro: los colgantes van delante de la cadena por la línea de la cámara (que sigue entera por detrás) y en las cuentas la
  cadena se oculta pasado el agujero (si no, en las de los costados cruzaba la cara). **Calibrado:** cada pieza sube o baja sola
  para que el centro de su agujero quede justo sobre la cadena (pedido del usuario: "arreglalos en todos"); revisar los 27 con
  `pruebas/enhebrado.mjs`. **Sólidos:** cada charm ocupa en la cadena al menos su ancho real (`reparte`); antes, con muchos, se
  metían uno dentro del otro y se veían los dos a la vez. Los colgantes vecinos van apenas escalonados en profundidad (`capa`). El agujero se detecta solo; si se detecta mal, `hueco: 'no'` o
  `hueco: 'cx,cy,rx,ry'` en `armar.tpl` (hoy: Adventure, Brújula y Rueda sin agujero; Mickey manitos a mano). **La cadena nunca se
  deforma**: se probó hundirla en los agujeros y con varios charms la pulsera se veía abollada (el usuario: "se ve deforme"); se
  sacó. No se hicieron aros 3D: 14 de los 18 tienen grabados, esmalte o piedras que se perderían.
  Estética de "Los más elegidos" (tarjetas, "Ahora $X", transferencia en rosa, cuotas). Cuotas: **3 sin interés** (es el dato de los
  productos; el cartel de arriba dice "3 y 6": confirmar con Panthera). El CDN de la tienda manda `Access-Control-Allow-Origin: *`
  (WebGL lo necesita para usar las fotos).
- **Más simple (pedidos del usuario, 2026-11-11)** — no deshacer:
  - Al entrar: **la pulsera Silver Flower elegida**, **el talle marcado por defecto (el primero con stock; pedido del usuario 2026-11-11, reemplaza a "sin marcar")** y **3 charms ya agregados** (Painter,
    Mickey Shine y Stitch, `DE_ENTRADA` en armar3d.js; talle 18 cm, `TALLE_DE_ENTRADA`). **Sin el cartel "Arrancamos con una combinación de ejemplo"**.
    **Desde el 2026-11-16: SIEMPRE 3 charms de entrada** (pedido: "siempre tiene que aparecer como mínimo 3 charms por defecto"): los pedidos
    con stock y, en el lugar de cada uno agotado, otro elegido solo. Hoy: Painter, **Mickey y Minnie reversible** (en lugar de Mickey Shine, que
    ya no existe) y Stitch. Ver "Pedidos de la noche del 2026-11-15". El póster se regenera con `node herramientas/armador/pruebas/poster.mjs`
    (regenerado el 2026-11-16 con esos tres; anota `data-poster-de` en armar.tpl).
  - El paso 1 se llama **"La pulsera"** (no "La base"); los pasos se numeran solos (contador CSS). **"Tu combinación" no se muestra**
    (pedido del usuario: "oculta esto"): un charm se saca tocando su tarjeta otra vez o en la lupa ("Sacar de la pulsera").
  - **Sin la nota fija** "Al agregar, la pulsera en tu talle y cada charm entran juntos a tu carrito": eso se avisa recién al tocar
    "Agregar al carrito" (toast). Si falta el talle, "Agregar" lo pide y su número late en rosa.
  - **El total de compu es más chico y compacto** (sin línea, letra más chica, botón más bajo) y **la pulsera va más arriba y más a
    la izquierda** (armar3d-escena.js, `focoObj`).
  - Respaldo de antes: `respaldos/2026-11-11-armadores-antes-de-simplificar/`. Lo mismo se aplicó a "Armá tu oreja": 2 aros de
    entrada, sin cartel ni nota, total compacto.
- "Agregar al carrito" pone la pulsera (con su talle) y cada charm con un POST a `/comprar/` por producto (`add_to_cart_enhanced=1` +
  `X-Requested-With: XMLHttpRequest`) y después lleva al carrito (`/comprar/`: esta tienda no tiene carrito lateral). Para probarlo sin
  tocar el carrito real: interceptar esos POST con Puppeteer (`setRequestInterception`) y contestar `{"success":true}`. Si se prueba de
  verdad: **vaciarlo siempre al terminar**; con User-Agent "HeadlessChrome" la tienda rechaza el POST (403): usar `setUserAgent`.
  Para sacar un ítem: POST `/cart/update/` con `quantity[<id del ítem>]=0` (lo que hace `LS.removeItem`).
  **Carrito vacío en localhost (arreglado 2026-11-12):** Chrome comparte las cookies de localhost entre todos los proyectos y puertos
  y el preview le pasa a la tienda hasta 8 KB; la cookie del carrito (`store_cart_session_1276084`, la más nueva) quedaba última y se
  cortaba → cada "Agregar" armaba un carrito nuevo y `/comprar/` llegaba vacío. `tienda-local.mjs` (`cookiesParaLaTienda`) ahora
  pasa primero las de esta tienda (`store_*`, las que terminan en `_1276084`) y nunca las de otra (el preview de BS23 también usa
  localhost). "Iniciar compra" anda desde localhost: va a `nube.com/checkout/v3/session-relay/<carrito>/<token>`.
- Disposición (pedidos del usuario, 2026-11-10): **a todo el ancho como "Los más elegidos"** (20 px a cada lado, 10 en el celular) y
  **poca altura**: en compu (≥1280 px), 3 columnas a una sola altura (charms | pulsera | base, talle y combinación; los costados se
  desplazan por dentro con `data-lenis-prevent`) y el **total (precios + "Agregar al carrito") flota ABAJO A LA DERECHA del escenario**
  (el usuario lo pidió ahí; `armar3d.js` → `ubicaTotal`) y **la pulsera sube un poco** en el 3D para no chocar con esa tarjeta; en
  tablet (700–1279), pulsera + panel (con el total fijo abajo del panel) y los charms en una tira abajo; en celular, apilado con barra
  fija del total. El contador "N charms" quedó arriba a la izquierda del escenario. **Cabecera igual a la de "Mundo Disney" y "Los más
  elegidos"** (título en mayúsculas al mismo tamaño + una frase chica en gris; `.pnt-a3-cab` en `secciones.css`); va afuera del 3D
  (adentro se pisaba con la pulsera). **Sin cursor propio, sin botón de pausa y sin "Reducir movimiento"** (el usuario los pidió sacar).
- **Scroll de las columnas (arreglo 2026-11-12, "el scroll se vuela y salta", sobre todo en la columna derecha):** `scrollInterno()` en
  `armar3d.js` y `oreja3d.js` pone `data-lenis-prevent` SOLO mientras la columna de verdad se desplaza; en el tope (o si no tiene nada
  que desplazar, como el panel derecho casi siempre) lo saca y la página la mueve Lenis. Antes era fijo y la rueda movía la página
  con el scroll nativo (saltos de 120 px por ruedita) peleándose con Lenis. Prueba: `herramientas/armador/pruebas/scroll-panel.mjs`.
- **Charms nuevos: NO aparecen solos** en el armador (datos y foto recortada están a mano). Guía paso a paso y script de recorte en
  `herramientas/armador/` (fuera de `tienda/`, no se sube): desde el 2026-11-11 `recorte.py` (v3) deja también la foto HD, el relieve y
  el contorno de cada charm. **Desde el 2026-11-11 el armador muestra los 62 charms/dijes** de la categoría Charms/Dijes de la tienda
  (todos los de ese día; pedido del usuario: "no están todos los charms/dijes"). Si son varios, recortar con `PNT_SALIDA_ARMA` (una
  carpeta aparte) y copiar todo junto al final: cada archivo nuevo en `tienda/` hace recargar la página del preview.
- El Windows de este equipo tiene apagados los "Efectos de animación": Chrome les pide "movimiento reducido" a las páginas. Desde el
  2026-11-11 **el armador anima siempre**, como el resto de la tienda (pedido del usuario; ya no existe `pnt-animar`). En las pruebas
  con Puppeteer igual conviene emular `prefers-reduced-motion: no-preference`.
- El conector MCP de Tiendanube: hasta el 2026-11-15 apuntaba a la tienda de **BS23**. **Desde el 2026-11-16 (el usuario lo reconectó con /mcp)
  apunta a la de Panthera** (verificado: "Painter - 471"). Puede volver a cambiar: verificarlo antes de usarlo. Leer está bien; **escribir (categorías,
  productos, promociones…) solo si el usuario lo pide**, y nunca las herramientas de temas (eso es publicar). Lo que el MCP no puede: las secciones
  "Productos destacados" y "Productos en oferta" del inicio se eligen en el panel (`/admin/themes/settings/product_order/`), y no hay herramientas
  para el menú, los puntos de retiro, los métodos de envío ni el SKU.
- **El cartel de WhatsApp no se abre encima de los armadores** (2026-11-11): sus secciones llevan `data-wa-evitar` (marca.js sección 5
  espera a que no estén debajo). Antes, en compu de 1280–1440 px tapaba el panel del armador de pulseras.
- **"Conocenos"** (2026-11-11, pedido del usuario: "replica la section de bs23"): **anteúltima, arriba de "Seguinos en redes"**.
  Archivos: `snipplets/panthera/conocenos.tpl`, sección E de `secciones.css` y sección 4 de `secciones.js`; está incluida en `layout.tpl`
  y en `SNIPPLETS` de `tienda-local.mjs`. Es la sección "Nuestro local" de BS23 (`../Pagina web BS23/tienda-rio`, clases `.locales-*`)
  con los colores y las letras de Panthera: video del local en 4:5 con la dirección encima y un pin rosa que abre Google Maps, título
  "Conocenos", botones "Cómo llegar" y WhatsApp, y una fila de datos (Bahía Blanca · Horario · WhatsApp). El horario "10:00 a 21:00 hs"
  lo pasó el usuario el 2026-11-11 (sin días: no se agregan; ver el comentario en conocenos.tpl). El video (`static/panthera/conocenos/video-local.mp4`, 720×900, sin audio, y su póster
  `poster-local.webp`) es el de Kling "cómo llegar" recortado a 4:5, para dejar afuera la marca de agua, y cortado antes de la bolsa,
  que traía "viajes.inolvidables" escrito. Se reproduce solo mientras se ve. **Dirección CONFIRMADA (2026-11-12): Av. Alberto
  Pedro Cabrera 2153** (la que usan Contacto, "Conocenos" y el pie). El punto de retiro del admin dice "Sarmiento 2153": lo corrige Panthera.

## ✨ Entradas tipo Apple en el inicio (pedido 2026-11-12)
marca.js sección 13 + marca.css sección 18: al cargar, la navbar baja pieza por pieza y el texto del cartel del aniversario
sube línea por línea; al bajar, cada sección muestra sus piezas escalonadas (90 ms) subiendo con desenfoque que se aclara.
El escondido depende de la sección (`.pnt-ap-sec` / `.pnt-ap-vista`), no de cada tarjeta: los carruseles clonan tarjetas y si
no quedaban invisibles. Los armadores 3D entran sin escala ni desenfoque (`pnt-ap-liso`). Los `.pnt-rv` usan el mismo estilo.
- **El cartel del aniversario "se pone de pie"** (idea 8 del artefacto "Entradas del cartel 5 años", 2026-11-12): arranca acostado en
  perspectiva y se levanta desde la base (`pnt-cartel-pie`, `rotate: x` suelto; perspectiva en `.pnt-hero-v`). **Solo en el hero**: se
  aplicó a todas las secciones del inicio y el usuario se arrepintió ("solo en el hero"). No volver a extenderlo.

## ⚡ Carga fluida y enhebrado de los dos armadores (pedidos del usuario, 2026-11-12) — no deshacer
Pedido: *"tarda en cargar, la animación se ve trabada y parece que aparece primero fija y luego se vuelve a cargar, no me gusta"* (en
"Armá tu pulsera" y en "Armá tu combinación de aritos"). Causa: la escena 3D se armaba recién al llegar (con el scroll suave, ya parado
en la sección), las dos a la vez (la página se trababa ~0,5 s) y la foto fija (fondo blanco, otra posición) no coincidía con el 3D.
Ahora (`secciones.js` sección 5 = `window.PNT_3D`; `armar3d.js` y `oreja3d.js` bloque "3D"; `*-escena.js` arranque):
- La escena se arma **ANTES de llegar**, apenas termina la intro del inicio (`PNT_3D.temprano`), **de a un armador por vez**
  (`obra`) y **en pasos chicos** (`enFila`/`respiro`: shaders, primera consulta de cada programa, texturas y fotos de los charms/aros de
  entrada de a una, con un cuadro dibujado entre paso y paso) y con un par de **cuadros de ensayo con el lienzo escondido** (`#c.ve`
  recién en el primer cuadro real). La intro arranca cuando el escenario se ve un 40 %. Resultado medido (compu 1536 px): el 3D
  aparece a los ~0,15 s de llegar (antes ~3,6 s), 60 fps, sin tareas largas (antes 550–680 ms y cuadros de hasta 300 ms).
- **Sin ruedita ni fondo blanco.** Si el 3D igual tarda (>0,9 s con el escenario a la vista) aparece el **póster**, ubicado con la misma
  cuenta de cámara que la escena (`ubicaPoster`; en aritos `vistaDe`) y el 3D lo reemplaza **en la misma pose** sin que se note
  (arranque sin intro y con los aros/charms `'quieto'`; `asoma` hace entrar el vaivén de a poco). Pósters: `pruebas/poster.mjs`
  (pulsera) y `pruebas/poster-oreja.mjs` (aritos: se capturan con el escenario de aspecto 1,46 compu / 0,89 celular y **sin recortar**).
  Si cambian los charms/aros de entrada o la foto, regenerarlos. `?a3demora=ms` / `?ordemora=ms` demoran el 3D para ver el póster.
- Pruebas: `herramientas/armador/pruebas/fluidez.mjs [a3|or] <etiqueta> [--video] [--perfil] [--celu] [--demora ms]` (baja con la
  rueda como una persona y mide cuadros, tareas largas y el póster), `funciones.mjs` (21), `herramientas/oreja/pruebas/tienda.mjs` (8).
- **Enhebrado** (pedido: *"al atravesar el dije, una parte tiene que quedar por delante de la pulsera y la otra por detrás; están
  quedando ambas por delante"*): la cadena pasa **por delante del borde por donde entra**, se mete en el agujero y queda **tapada por
  el otro lado** de la pieza. En cuentas y colgantes con agujero (`fondoDe`/`ATRAS` en `armar3d-escena.js`: la pieza va apenas detrás
  de la cadena y el agujero de la foto ya no se abre). Los datos de agujero de `armar.tpl`: `hueco:'cx,cy,rx,ry,lado'` (lado 1 = entra
  por la izquierda de la foto, −1 = por la derecha) o `'no'`; `ag` en colgantes = centro del agujero del aro. Auditar con
  `pruebas/agujeros.mjs` (hoy 0 sin revisar) y `pruebas/enhebrado.mjs`. Mickey gold y Flor rose se limpiaron con
  `herramientas/armador/limpia_blancos.py` (fleco e interior blanco del recorte).
- Respaldo de antes: `respaldos/2026-11-12-armadores-antes-de-fluidez/`.

## 🦻 Armá tu oreja (3D, 2026-11-11) — en la tienda LOCAL, no subida
Sección del inicio **justo debajo de "Armá tu pulsera"** (pedidos del usuario: "subámosla a localhost, no por FTP" y "debe ir
debajo de la de Armá tu pulsera"). Hecha como el
armador de pulseras (mismo motor, interfaz y carrito real: un POST a `/comprar/` por aro), con lo propio de la oreja: "¿Cuántos
aritos tenés?" (1–3 en el lóbulo) + ear cuff. **Nunca usar la palabra "agujero/agujeros" en un texto visible de la tienda** (pedido del
usuario 2026-11-12: "en ningún lado uses la palabra agujeros"): se dice "arito/aritos" ("1.er arito", "2 aritos") o "lugar" ("un lugar
libre"). Cambiado en la tienda y en el generador (`herramientas/oreja`); revisar con `node herramientas/revision/busca-palabra.mjs agujer`
(lee el texto visible, también dentro de los armadores). En comentarios y nombres internos del código puede seguir. Archivos: `snipplets/panthera/oreja.tpl` (datos de 68 aros + 2 ear cuffs escritos a
mano, como armar.tpl), `static/panthera/oreja3d.js`, `oreja3d.css`, `oreja3d-escena.js` y `static/panthera/oreja/`. **Se generan**
con `herramientas/oreja/construye_tienda.py` desde el prototipo de `herramientas/oreja/` (ver su LEEME): un cambio a mano en esos
archivos se pisa si se vuelve a generar. Registrada en `tienda-local.mjs` y `layout.tpl`. Con `?ordebug` la escena deja `window.__or`.
Prueba: `node herramientas/oreja/pruebas/tienda.mjs`. Lo que pidió el usuario y no hay que deshacer:
- La oreja es una **foto real** (la que mandó el usuario, `herramientas/oreja/fotos/oreja-ia.png`) en su orientación original:
  **no espejarla** ("no me gustó que espejaras la foto, volvela a su lugar"). Para que el total no tape los aros, el encuadre de
  compu va pegado al borde derecho de la foto. No volver a una oreja esculpida en 3D.
- **Aritos: de 40 a 68 (2026-11-12, "asegurate que estén disponibles todos")**: la categoría Aros de la tienda tiene 108 productos; faltaban 66: 33 solitarios y 33 **pares** (argollitas corazón, "forever silver", infladas…). Se sumaron los solitarios que se pueden recortar (28; `herramientas/oreja/recorta_aros.py` + `limpia_aros.py` + `mide_argollas.py` + `construye.py` + `actualiza_datos_tienda.py`; los de foto puesta con `ALTO_A_MANO` en construye.py: huggie de ~1,15 cm). **Quedaron afuera**: Bestia, Compromiso, Minnie chain y Bright (el recorte salió mal o pierde partes) y "argollita silver and crystal 1108" (su foto es una cajita con varios aros). **Los 33 pares NO están**: un par ocuparía un agujero y se cargaría por su precio de par; falta que el usuario confirme cómo los quiere.
- **"Super realista"**: la argolla es 3D, casi de canto, y atraviesa el lóbulo (su mitad de atrás la tapa la oreja); el dije es la
  foto del producto colgando; luz y sombras de la foto; sin estrellitas. De la argolla puesta se ve un solo lado.
- **Argolla que entra en la piel (2026-11-12, pedido: "el broche que engancha la oreja parece falso")**, en `oreja3d-escena.js`
  (a mano en la tienda; respaldo en `respaldos/2026-11-12-aritos-antes-de-argolla-real/`): la argolla va `ENTRA` (0,17) más atrás,
  en el medio del espesor del lóbulo, inclinada para que abajo vuelva adelante (sale DE la piel, no se apoya encima); **sombra de
  contacto** en el agujero (`contactoDe`, solo sobre la oreja por la máscara); el metal se apaga donde entra en la piel y en la mitad
  de atrás bajo el lóbulo; **entorno propio de joyería** para la argolla (`ENV_ARG`: el de la foto + tiras de luz) con oro más
  saturado y pulido, perfil más redondo. Los dijes siguen con el entorno de la foto. Póster de aritos regenerado.

## 🗂️ Listados en "Novedades" sin doble carga (2026-11-12)
Pedido: *"tarda en cargar la estética nuestra y carga la de Tiendanube"* al entrar a una categoría. Causa: el orden "Novedades" se
ponía recargando la página desde marca.js, que corre con la página entera ya bajada (se veía a medio armar y después recargaba).
Ahora: (1) los links a categorías (menú + todo `/todos-los-productos/`) ya llevan `?sort_by=created-descending` (marca.js, al
principio) → una sola carga; (2) si igual se entra sin orden, la recarga la hace un `<script>` al principio del `<body>`
(`layout.tpl` y `ORDEN_TEMPRANO` en `tienda-local.mjs`). La recarga vieja de marca.js queda como respaldo.

## 🛍️ Ficha de producto (pedidos 2026-11-12) — marca.css sección 24 + marca.js (sección 2 y la de la ficha)
- **La navbar y la franja rosa NO siguen** al bajar: quedan arriba de la página y se van (`html.pnt-nav-quieta`; nunca `pnt-nav-abajo`).
  La columna fija de la derecha usa `top: 28px`.
- **Precio con la estética de las tarjetas** de "Los más elegidos" (mismas clases `.pnt-mv-*` y pesos), un poco más grande
  (`precioTarjeta` en marca.js → `.pnt-fp`). Los precios de Lima quedan escondidos en su lugar y el bloque se rearma cuando cambian (talle).
  **Rojo SOLO si el producto está en una categoría "Ofertas"** (pedido: "si no está en la categoría ofertas, con la estética rosa") y
  tiene precio anterior → estética de "No los dejes escapar" (`.pnt-fp-oferta`: "Ahorrás $X" en barra roja de hasta 380 px, raya roja,
  precio con transferencia rojo, "-20%" rojo). Las categorías se leen del estado que la tienda escribe en un <script> (`EN_OFERTAS`).
  La tienda NO tiene categoría "Ofertas": para el usuario "Ofertas" = la sección **"No los dejes escapar"** del inicio
  (`home-products-sale`). La ficha baja el inicio una vez, saca los productos de esa sección y los guarda 30 min en localStorage
  (`pnt-ofertas-v1`); si el producto está ahí, rojo (2026-11-12: Silver Flower, Mickey Shine, Minnie moño rosa, Brazalete Love Gold,
  Anillo Flowers, Cocodrilo). Si no, rosa.
- **Flechas de las miniaturas**: rosas como las demás; "abajo" se apaga con la última miniatura a la vista (Lima agrega una vacía al
  final); sin flechas si entran todas.
- **La columna de datos queda ANCLADA ARRIBA**, al lado de la foto, y se va con la página al bajar: NO es sticky (pedido 2026-11-12:
  "quiero que quede anclado arriba, no seguir el scroll"). Se probaron fotos apiladas + datos fijos + reseñas en la columna de la foto
  y se descartó (era un malentendido: "fijo" = que no siga el scroll). Fotos en carrusel con miniaturas; reseñas a todo el ancho.
- **Sin migas** ("Inicio / Todos los productos / …"). Talles con el texto centrado (inline-flex).
- **"Sobre Panthera" no se muestra** y **la descripción es un desplegable más** (el primero, arriba de "Medios de pago" y "Medios de
  envío"): `.pnt-acc` en marca.js (función `descripcion`), copia del desplegable de Lima con su propio click y apertura suave.
  Respaldo de antes: `respaldos/2026-11-12-ficha-antes-de-descripcion-desplegable/`.
- **Todo al mismo ancho** (foto + datos, reseñas, "Cómo cuidar tu plata", "Te va a interesar"): `--pnt-ficha-w` = 1300 px como
  máximo, 20 px a los costados (10 en celu), medido sobre la ventana (100vw − barra de scroll `--pnt-sb`). marca.css sección 25.
- **Reseñas rearmadas**: cabecera como "Cómo cuidar" (título + estrellas parciales, número fino y cantidad), flechas ARRIBA a la derecha
  (encima de las tarjetas tapaban el texto; se esconden si entran todas), 4 tarjetas justas en compu (2 en tablet, 84 % en celu), comilla
  rosa, autor abajo con círculo rosa con la inicial. Respaldo: `respaldos/2026-11-12-ficha-antes-de-resenas-y-anchos/`.
- **Flechas A LOS COSTADOS** de las reseñas y de "Te va a interesar" (por fuera de las tarjetas, centradas; en celu no hay). Las de
  "Te va a interesar" son las de Swiper movidas a `.products-section-container` (`.pnt-rel-flechas`), con el mismo estilo que las reseñas.
- **Reseñas de muestra** (solo localhost) en rioplatense, variadas, con "hace X días". En la tienda real se ven las de verdad.
- **Descripción SIEMPRE como desplegable** (también las simples, de párrafos sueltos). **Sin "Compartir"** (`.social-share`).
- **Foto principal un 12 % más chica** dentro de su cuadro (`scale` en `.js-product-slide-link`; en la imagen se sumaba al transform
  que la centra y la corría). El cuadro toma el color del borde de la foto (`fondoFotos`), así no se ve un recuadro.
- **Lo de la derecha arranca a la altura de la foto**: sin las migas sobraban `pt-3`/`pt-2` de Lima arriba del título.
- Respaldo de antes: `respaldos/2026-11-12-ficha-antes-de-precio-tarjeta/`.

## 🧹 Páginas internas: `paginas.css` y `paginas.js` (revisión completa, 2026-11-12)
Arreglos de la revisión de todas las páginas, en archivos APARTE de marca.css/marca.js (otra sesión los edita reescribiéndolos
enteros: así no se pisan). Cargan después de marca/secciones (`layout.tpl` y `agregarMarca()` de `tienda-local.mjs`). Hoy tienen:
títulos de página en MAYÚSCULAS al tamaño de "INICIAR SESIÓN" (no inicio ni ficha), "Novedades" sin "Ordenar:" en celular, footer
de celular (aire bajo Contacto, redes sin recuadro), 404 con sugeridos en tercios, WhatsApp de Contacto formateado y título
"Botón de arrepentimiento". Revisión automática de toda la tienda: `herramientas/revision/recorrido.mjs <carpeta> [filtro]`
(capturas compu/celu + colores y letras fuera de la paleta); sonda de elementos: `sonda.mjs` (en Git Bash, `MSYS_NO_PATHCONV=1`).
"Conocenos": título más chico (clamp(42px, 5vw, 80px); celular 36px), pedido 2026-11-12.
También: la ventana **"¡Descuento exclusivo!"** de la venta cruzada (`#js-cross-selling-modal`, sección 5) y el aviso **"Seguí acá tu
última compra"** (`.js-notification-status-page`, sección 6: paginas.js lo saca de la navbar, donde Lima lo ponía y rompía la isla).
Las dos aparecen solo en casos reales (promoción de venta cruzada / compra reciente): se prueban con `herramientas/revision/prueba-avisos.mjs`.
El segundo relevamiento de la tienda (ítems 92 a 115) está en PENDIENTES.md; los de la ficha (93 a 101) los toma la otra sesión.
**Revisión ítem por ítem 46–115 (2026-11-13):** fotos en `revision-pendientes-46-115/` con `herramientas/revision/items-46-115.mjs
<carpeta> [números]`; arreglos en `paginas.css` sección 7, `paginas.js` 4–5 y unos pocos en marca.css/marca.js (ítems 116–137 de
PENDIENTES.md). ~~Convención de ese día: botones rosas con letra negra.~~ **Desde el 2026-11-15 TODOS los botones con fondo rosa llevan
letra BLANCA** (pedido del usuario: "quiero que los botones con bgc rosa tengan la letra en lugar de en color negro en color blanco"; paginas.css
16 b y b2, `.filtro-b.activo` de los armadores). Revisar con `node herramientas/revision/botones-rosas.mjs` (busca fondo rosa + letra oscura en
compu y celular, también en los armadores; `PAGINAS=/a,/b` elige páginas). Quedan con letra negra solo etiquetas que no son botones (la cinta
"Hasta 50% off" del cartel) y etiquetas escondidas de Lima.
En Git Bash, las sondas con rutas tipo `/account/...` necesitan `MSYS_NO_PATHCONV=1`.
**Segunda vuelta, probando todo (2026-11-13):** `herramientas/revision/pruebas-46-115.mjs <carpeta> <grupo>` hace clics reales en compu y
celular y deja ✔/✘ en `_pruebas.txt` (grupos: menu, buscador, listado, ficha, carrito, contacto, textos, cuenta, cookies, whatsapp, pie,
ofertas, enlaces, paginas, anchos, animaciones; `PAGINAS=a,b` elige páginas). **Correr de a un grupo y en primer plano**: dos Chrome a la
vez dejaron la máquina sin memoria. Avisa "⚠ [toque] … TAPADO por …" si algo tapa lo que se toca (así salió que el cartel de WhatsApp
tapaba "Ordenar" y las flechas de las reseñas). Sonda suelta: `herramientas/revision/_paso.mjs <compu|celu> <ruta> <archivo.mjs>`.
Arreglos en `paginas.css` sección 8 y `paginas.js` 6–8 (ítems 138–150 de PENDIENTES.md): Escape cierra las ventanas de Lima; el cartel
de WhatsApp espera escondido si hay una ventana o el desplegable "Ordenar" abiertos o si tapa algo con `[data-wa-evitar]` (paginas.js
marca flechas de reseñas/carruseles y botones de "Cómo cuidar", y lo revisa cada 0,4 s mientras está abierto); en celular el botón de
WhatsApp lleva el saludo; nombres de tarjetas en 2 renglones con "…"; carrito con la calculadora de la ficha y circulito rosa en la
opción de envío elegida; campos obligatorios en contacto/newsletter/registro.
**Responsive y clics en todos los tamaños (2026-11-14, ítems 151–161 de PENDIENTES.md):** `herramientas/revision/responsive.mjs <carpeta>
[páginas] [anchos]` recorre cada página en 10 anchos (320 a 1920) con detectores (desborde, piezas afuera, textos cortados o encimados,
botones tapados, toques chicos, letra < 10 px, campos < 16 px en iPhone, fotos deformadas o borrosas midiendo el archivo real, rótulos de
botón partidos, barras fijas) y saca la página entera; `hojas.py <carpeta> [página]` arma hojas para mirarlas. `pruebas-46-115.mjs` suma
tamaños con `MODOS=` (compu, celu, laptop 1366×657, tablet 768×1024, tabletH 1024×768, apaisado 844×390) y el grupo `inicio` (video,
franja, carruseles: solos, puntitos, arrastrar/deslizar y tarjeta; tarjeta roja → Ofertas; armadores; Disney; "Cómo cuidar"; "Conocenos";
redes). **`VER=1`** (en las pruebas, `_paso.mjs` y `responsive.mjs`): Chrome con la ventana a la vista y un cartelito que dice cada paso y su
✔/✘ (pedido del usuario: "¿puedo ver lo que estás haciendo?"). Ojo en las pruebas: los carruseles del inicio avanzan solos (frenar el
autoplay antes de elegir una tarjeta), el primer link de cada tarjeta de Lima mide 0×0 (tocar uno que se vea), el video del cartel dura
6 s y se repite. Arreglos en paginas.css 9, paginas.js 7e/9/10 y la última regla de armar3d.css y oreja3d.css (iPhone: el campo del
newsletter con 16 px; logo del pie con tope hasta 1100 px; pie de tablet parada con el newsletter arriba; < 360 px: etiquetas, banners y
botones; Disney pide sus fotos antes; la tarjeta roja de Ofertas va a Ofertas; el cartel de WhatsApp no tapa los puntitos). Después
(ítems 162–167): **la lupa de 768 a 1023 px abre el panel del buscador** (Lima, desde 769 px, le pone su buscador flotante de compu: un campo
suelto sobre la barra; paginas.js 11 lo intercepta en la captura); **ficha de 768–991 mitad y mitad**; **carrito (página) de 768–1199 sin
la columna de precio unitario** (tapaba el "+"; ojo: .cart-item-quantity está en la columna Y en la píldora) y en 768–991 en una columna;
**celular acostado (≤ 500/540 px de alto)**: botón de WhatsApp de 48 px, aviso de cookies en una fila, 22 px sobre el título de los listados
y al bajar la franja se esconde y la isla se achica; `window.offsetCategories` vacía de respaldo (error de Lima al girar el celular).
En las pruebas con ventana (`VER=1`): si se minimiza, Chrome deja de dibujar y los toques no llegan (se traba): se restaura sola; si se
cierra, la tanda se corta ("Connection closed").

## 🏷️ Ofertas, listados y carrito lateral (pedidos 2026-11-12) — marca.js (al final) + marca.css secciones 26–27
- **Página "Ofertas"** (la tienda NO tiene esa categoría y no se crea sin permiso de Panthera): `/todos-los-productos/?ofertas&sort_by=created-descending`
  muestra SOLO los productos de "No los dejes escapar" (se bajan del inicio), en rojo, con la **franja roja "SALE"** de BS23 ("Hasta X% off" y
  "+X% extra en transferencia" calculados de esos productos). **Ordenar y Filtrar funcionan** (orden: se ordena en la página; filtros: se
  cruzan con el listado filtrado de la tienda). "Ofertas" va PRIMERO en el menú de la hamburguesa, **sin rojo** (pedido). El botón
  "Ofertas" del cartel del hero lleva ahí. Cuando exista la categoría real: cambiar `OFERTAS_URL` y el link del hero, y borrar el armado.
- **5 productos por fila en compu en TODO** menos los carruseles del inicio (≥1100 px; tablet 3, celular 2): listados, búsqueda, Ofertas y "Te va a interesar" de la ficha (su Swiper pasa a 5 por vista desde marca.js, `data-pnt-cinco`).
- **Listados: "Ver más productos"** en vez de las flechas "2 / 5" (snipplets/grid/pagination.tpl): trae la página siguiente sin salir.
- **Bloques entre productos cada 3 filas** en "Todos los productos" y sus categorías (copia de bloques.js de BS23 con la marca de Panthera):
  1 beneficios (30 % OFF con transferencia —calculado de los precios—, cuotas y envío de la barra de anuncios, WhatsApp), 2 "Armá tu pulsera"
  (póster del armador → /#armar-pulsera), 3 video de pulseras de "Seguinos en redes" (→ Pulseras), 4 video principal de redes (→ Instagram),
  5 "Cuidá tu plata" (→ /cuidados/). Solo datos reales. No en Ofertas ni en la búsqueda. **SOLO ROSA Y BLANCO, sin negro** (pedido): fondo
  rosa con letras blancas o fondo blanco con borde rosa y títulos en el rosa intenso. Se sacaron "Visitanos" (foto del local) y la frase
  (pedido: "este quitalo y poné algún video de redes" / "este video tampoco"). Videos verticales en tarjeta alta, solo mientras se ven
  (pósters `redes/video-*-poster.webp`); al de redes se le agranda el cuadro para dejar afuera la marca de agua de Kling.
- **Cada categoría con sus propios bloques** (pedido 2026-11-12: "en collares los videos de redes de collares, en pulseras el de pulseras…"):
  Charms (video de charms + "Armá tu pulsera"), Pulseras (video de pulseras + armador), Collares (video de collares), Anillos (video de redes,
  que muestra anillos: no hay uno propio), Aros (video de aritos + "Armá tu oreja"), Disney (video de Disney + armador); todas con
  beneficios y "Cuidá tu plata". El botón del video va a Instagram. Categorías cortas: bloque cada 2 filas (o cada fila) y, si entran
  menos de dos, uno al final. Pósters `redes/video-*-poster.webp`; a todos los videos (Kling) se les agranda el cuadro para sacar la marca de agua.
- **"Crealo vos misma"** (menú y pie; en la tienda apunta a "Dijes gold para cadenas") → `/#armar-pulsera`: en el inicio cierra el menú y
  baja suave; desde otra página llega al inicio y baja sola.
- **Ofertas sin demora visible**: `html.pnt-pag-ofertas` se pone en el script temprano del <body> (layout.tpl y ORDEN_TEMPRANO de
  tienda-local.mjs) y marca.css esconde los productos de "Todos" desde el primer cuadro; la franja SALE sale enseguida y hay tarjetas de
  espera; la lista de ofertas se guarda 30 min en localStorage (`pnt-ofertas-items-v1`, también la guarda la ficha). 1.ª vez ~3 s, después ~1,8 s.
- **Carrito lateral trabado (arreglado)**: la barra "Envío gratis" del carrito se reescribía a sí misma sin fin (MutationObserver sobre todo
  el carrito) y congelaba la página al tocar + / − o al cargar. Ahora escribe solo si cambia y vigila solo el subtotal. Los armadores abren
  el carrito lateral a los 0,9 s de agregar (oreja3d.js a mano: repetirlo si se regenera con construye_tienda.py).
- **Portadas por categoría (PENDIENTES 87): hechas y DESCARTADAS** (2026-11-12, el usuario: "no quiero estos iniciales arriba del todo,
  quitalos… menos en ofertas"). El código sigue en marca.js ("Portada propia por categoría", `PORTADAS_ACTIVAS = false`) y marca.css
  sección 28, apagado; respaldo de antes en `respaldos/2026-11-12-antes-de-portadas-categorias/`. No prenderlas sin pedido. Ofertas
  conserva su franja SALE.
- **Grillas de 5: tarjetas apenas más chicas y 36 px entre ellas** (antes 20; desde 1280 px, que es desde donde van 5 por fila: con 1100 px
  el precio se partía). "Te va a interesar": `spaceBetween` 36. Precio con transferencia y cuotas apenas más chicos para que entren en una línea.

## ✅ PENDIENTES 93–115 (2026-11-12) — marca.js (al final) + marca.css sección 29 + layout.tpl (<head>)
- Ficha: **envíos** en filas (sin viñetas, sin centavos, "Gratis" en píldora; ojo: Lima hace flotar el contenido de cada opción → `float:none`),
  **pagos** ("3 cuotas sin interés de $X" con ícono, "30% OFF" en rosa, botón "Ver todos los medios de pago"; ventana con la marca, sin
  centavos), **foto ampliada** (la tienda usa **Fancybox 4**: clases `fancybox__*`; fondo claro desenfocado, flechas y cruz rosas),
  **"Color: Amarillo"** al elegir color, **nombres sin " - 1234"** (ficha, pestaña, carrito, buscador), cartel de WhatsApp que no tapa la
  ficha (el cartel ahora busca `[data-wa-evitar]` cada vez), sin comentarios de Facebook.
- Tarjetas: **etiqueta de promociones** (2x1, 3x2…) en píldora rosa intensa (`.pnt-mv-promo`).
- Pie: **logos de pagos y envíos** visibles en fichas blancas (se cargan directo: eran diferidos). Sellos con lugar si se cargan.
- **Cloudflare** en modo claro: se le agrega `theme:'light'` a `turnstile.render()`.
- **Íconos** (`herramientas/iconos/genera.mjs` → `tienda/static/panthera/iconos/`: favicon rosa con "P" blanca y estrella dorada, apple-touch-icon,
  `compartir-1200x630.jpg`) puestos en layout.tpl (og:image ANTES de head_content y menos en la ficha; íconos DESPUÉS). Detalles del navegador:
  selección rosa, autocompletado rosa suave, sin destello al tocar, `color-scheme: light`, `theme-color` rosa.
- Lo que va en el panel de Tiendanube (SEO, tildes de envíos, envío gratis $150.000 vs $90.000, dirección Cabrera vs Sarmiento, subir
  favicon e imagen, nombres/SKU, comentarios FB, "creado con Tiendanube", guía de talles, opciones sin diseño): **PARA-PANTHERA.md**.
- **Decisiones del usuario sobre PARA-PANTHERA (2026-11-12):** envío gratis desde **$150.000** (se corrige en el admin el texto de $90.000);
  dirección **Av. Alberto Pedro Cabrera 2153**; **sí** limpiar los nombres y pasar el número al SKU (99) y **sí** apagar los comentarios
  de Facebook (104), los dos en el admin; **no** sacar "creado con Tiendanube" (112); **no** hace falta guía de talles (105); 103 ok.

## 💎 Realismo de los dos armadores (pedido 2026-11-14: "hacerlo más real todavía… realizá todo") — no deshacer
Análisis con capturas y tiras de movimiento (`herramientas/armador/pruebas/realismo.mjs <vista|a3|or|celu|a3mov|ormov>`, `mira.mjs`,
`_pegado.mjs`; salen en `pruebas/capturas/realismo/`). Parches aplicados (quedan como registro en `herramientas/armador/parches/`).
Respaldo de antes: `respaldos/2026-11-14-armadores-antes-de-realismo/` (incluye los pósters).
- **Aritos a escala real** (`oreja3d-escena.js`, a mano: repetir si se regenera con construye_tienda.py): la oreja de la foto mide ~6,1 cm
  (1 unidad = 1 cm); la pieza entera se achica (`fe`) para que la argolla mida 1,2 cm como mucho; argolla más fina (1,1–2 mm × 0,8–1,1 mm),
  más de canto (`ABRE` 0,11–0,19), menos espejo, y **con el tono de la argolla de SU foto** (`tonoDeLaFoto`; material propio por aro).
  El arito llega **de frente** (no en arco desde arriba). Encuadre de compu: `"foco":[2000,1430],"alto":1860` en `data-foto` de oreja.tpl
  (el total ya no tapa los dijes y se ve la oreja entera).
- **Celular: el 3D queda pegado** debajo de la barra (sticky, `top: 104px`, 40 % del alto) en los dos armadores (última regla de
  armar3d.css / oreja3d.css; `.app{overflow:clip}`). En aritos el celular usa el póster de compu (el escenario ahora es apaisado).
- **Pulsera**: **vuelve la sombra de contacto** (se había sacado el 2026-11-11 a pedido; el 2026-11-14 el usuario aprobó ponerla: "flota
  en el vacío"), más difusa. **El charm se enhebra por la punta de la cadena, junto al cierre, y baja deslizándose** a su lugar
  (`MOV.vueloCierre/entraCierre/enhebraK`, `ch.enhebra`). **El giro queda donde se suelta** (`giroU`, sin tope; `alFrente()` lo vuelve al
  sumar un charm, cambiar de pulsera, en el festejo o con doble clic). **La cadena sigue sin deformarse** (regla anterior del usuario).
- **Compu: escenario más ancho** (columnas `clamp(290px,21vw,370px)` y `clamp(316px,22vw,370px)`). El alto no se tocó ("poca altura").
- Fotos: los 68 aros y los 62 charms ya tienen foto HD; más nitidez solo con fotos en alta de Panthera.
- **Vista previa (tienda-local.mjs): ya no recarga sola.** En este Windows *leer* un archivo dispara `fs.watch` (cambia el "último acceso");
  la primera noticia de cada archivo contaba como cambio → la página se recargaba al pedir cada archivo por primera vez (por ejemplo la
  foto de un charm nuevo) y borraba lo armado. Ahora la primera noticia cuenta solo si se guardó recién / se creó / se borró, y un
  reinicio del preview con el mismo código (`c` en `/__version`) no recarga las pestañas. Las pruebas cortan `/__version` además de `/__recarga`.
- **Segunda vuelta (2026-11-14, pedidos del usuario):** (1) *"entran de una forma y a la mitad del recorrido se giran… deberían entrar al
  revés para que al final lleguen de frente"* → mientras baja enhebrado (`ch.enhebra`) el charm va fijo a la cadena con la cara hacia
  AFUERA de la pulsera (`orientaCharm(..., rigido)`, `ch.frente`): entra de espaldas junto al cierre, pasa de canto y llega de frente, sin
  darse vuelta de golpe. No volver a orientarlo hacia la cámara durante el recorrido. En reposo los charms miran más de frente (0,76; era
  0,55: en los costados se veía el canto como una plancha). (2) *"los aritos se siguen viendo irreales, mejorá los recortes…"* → fotos HD
  afiladas y con el borde más firme (`herramientas/oreja/afila_hd.py`, parte de los originales del respaldo: repetirlo si entran aros
  nuevos), argollas todavía más finas y casi de canto (`ABRE` 0,05–0,09; ancho ≤ 1,6 mm), sombra sobre el cuello más leve (0,15).
- **Tercera vuelta (2026-11-14):** se probó llevar el charm siempre de frente mientras baja y el usuario lo rechazó: **"sí quiero que gire… que
  ingrese dado vuelta y cuando sigue el camino de la pulsera se gira solo, pero bien enhebrado"**. Queda FIJO a la cadena (de espaldas → gira → de frente). "Home happy place" (corazón con casita) estaba **mal enhebrado**: su foto es de tres cuartos y el
  agujero se detectaba en una ventana negra → a mano en armar.tpl: `hueco: '0.156,0.564,0.085,0.17,1'`. Puede haber otras cuentas con foto
  de tres cuartos en el mismo caso: revisarlas una por una mirando la pulsera (agujeros.mjs solo dice si encontró un agujero, no si es el bueno).

## 🐢 Lentitud y "se ve blanco al bajar" (pedido 2026-11-14)
- **Video del cartel del inicio:** pesaba 13,6 MB (6 s a 18 Mbps) → 3,1 MB (x264 crf 25, misma resolución, sin diferencia visible; original en
  `respaldos/2026-11-14-video-hero-original/`). El inicio baja de 19 MB a ~8,5 MB.
- **Entradas al bajar:** arrancan un 18 % ANTES de que la sección asome (era 6–12 % después: al bajar rápido se veía el hueco blanco) y se ven
  antes (opacidad 0,5 s, movimiento 0,9 s; paginas.css). Tres vigías: marca.js (2) y secciones.js.
- En la compu del usuario la causa principal es la memoria: ~2 GB libres de 14 con Chrome usando 4 GB; el sistema llegó a cerrar la vista
  previa dos veces. No correr dos Chrome de prueba a la vez y borrar los perfiles temporales de Puppeteer.

## 🔁 Charms nuevos automáticos y three.js propio (pedidos 2026-11-14, "hacelo")
- **`herramientas/armador/sincroniza_charms.mjs`** (guía en `herramientas/armador/LEEME.md`): informe de solo lectura (nuevos / precios y stock /
  ausentes) y, con `--precios`, `--nuevos` y `--agotar-ausentes`, actualiza `armar.tpl` y suma los charms nuevos solo (fotos, recorte,
  contorno, fila). Probado de punta a punta sacando y volviendo a sumar a Woody. Hay que mirar los nuevos de cerca (tipo/agujero/tamaño
  son estimados). Hallazgos del 2026-11-14: **"Huella crystal" ya no existe en la tienda** (marcado sin stock en el armador, `st: 0`) y
  "Broche Mickey y Minnie" bajó a stock 1.
- **three.js 0.187.0 alojado en la tienda**: `static/panthera/three/three-0.187.0.module.js` (736 KB, el mismo `+esm` de jsDelivr, sin
  dependencias); `data-three` en armar.tpl y oreja.tpl; armar3d.js / oreja3d.js lo importan de ahí y **caen a jsDelivr si no cargara**
  (`importaThree`). Al subir el tema: confirmar que Tiendanube acepta un .js de ese tamaño; si no, el respaldo de jsDelivr lo cubre.
- **El pedido del par de aros** (decisión 2026-11-14): "que se coloque solo 1 en la oreja porque el otro iría del otro lado, pero que diga
  que es un par y vienen 2". Pendiente de hacer (ver PENDIENTES 179).

## 📱 Armadores en celular (pedidos del usuario 2026-11-15)
- **El 3D ocupa menos altura**: `clamp(190px, 28vh, 250px)` (era 40 vh, ~337 px); sigue pegado debajo de la barra (sticky).
- **Orden de los pasos** (`.panel{display:contents}` + `order`, última regla de armar3d.css / oreja3d.css): **pulsera** = 1 La pulsera → 2 Tu talle →
  charms → Tu combinación → total. **Aritos** = 1 ¿Cuántos aritos tenés? → elegir los aritos (la lista) → 2 Tu combinación → total.
- **Aviso "Deshacer"**: era una bola negra con el texto partido (con `left:50%` el navegador lo achicaba a la mitad del ancho). Ahora `width:max-content`,
  esquinas de tarjeta y por encima del botón de WhatsApp (`bottom:122px`).
- Compu y tablet no cambian (todo dentro de `@media (max-width:699px)`).

## 🚀 Fluidez: la causa real de los tirones (2026-11-15) — NO volver a poner `:has()` anclado en body/html
- **`body:has(...)` hacía recalcular los estilos de TODA la página (~5.800 elementos, 40–80 ms) en casi cada cuadro**: con `:has()` anclado en `body`, cualquier
  cambio (una animación, un hover, un scroll) invalida el subárbol entero. Había dos: `body:has(.pnt-sinres)` y `body:has(.pnt-orden.is-abierto)`. Ahora son
  clases en `<html>` que pone el JS (`pnt-hay-sinres`, `pnt-orden-abierto`; marca.js). Resultado medido en Chrome real (compu): tramo del hero **35 → 58 cuadros/s**,
  página entera **~45 → 58**, tareas largas de la carga **2,7 s → 0,66 s**; celular: 56 y 49 cuadros/s. Si hace falta un `:has()`, anclarlo en un elemento chico, nunca en body/html/section grandes.
- Herramientas: `herramientas/revision/scroll-hero.mjs` (el tramo del hero con variantes que apagan una cosa por vez), `scroll-real.mjs` (página entera, Chrome con ventana),
  `traza-inicio.mjs` (con `HASTA=1300 PASO=90`: qué invalidó cada recálculo grande), `traza-carga.mjs`. Probado y descartado: `content-visibility`, cambios de clase de Lenis.
- También hoy: banners de categorías sin animación de entrada (pedido); botón del hero "Ver ofertas"; hero de celular a `100dvh`; 3D más cerca en celular
  (`distCam(asp, movil)` en armar3d.js; `focoM`/`altoM` en el `data-foto` de oreja.tpl).

## 🌊 Carga sin saltos y fotos a tiempo (2026-11-15, pedido: "que el scroll vaya suave sin saltos, nada se trabe, fotos/productos/videos carguen siempre y rápido")
Herramienta: `herramientas/revision/analisis-fluidez.mjs <compu|celu> <ruta> <etiqueta> [frio|tibio]` (Chrome real, SIN interceptar pedidos para que funcione
el caché; mide cuadros, saltos (CLS) con qué se corrió, fotos/videos vacíos al entrar a la vista y peso). En Git Bash: `MSYS_NO_PATHCONV=1`. Celular: toques
reales (`Input.dispatchTouchEvent`; `synthesizeScrollGesture` NO mueve la página). Respaldo de antes: `respaldos/2026-11-15-antes-de-carga-sin-saltos/`.
- **Primer cuadro ya en su forma final** (paginas.css 13): en el inicio se veía el de Tiendanube ~0,3 s y saltaba 580 px (CLS 0,13 → 0). El slider de Lima
  no se muestra nunca, el lugar del hero se reserva con su póster (como fondo, ubicado igual que el video), los banners se ordenan por CSS (`order`, el
  contenedor es flex) con su alto final reservado, la barra de navegación espera invisible hasta ser isla (`html.pnt-nav`, respaldo a los 2,5 s).
- **Ficha**: la columna de compra (`[data-store^="product-info-"]`) espera invisible a estar rearmada (`html.pnt-ficha-armada`, marca.js; tope 0,9 s; respaldo
  CSS 2,5 s): saltaba 120 px + 50 si era oferta. La lista de ofertas la guarda el inicio (paginas.js 14) y la ficha usa una lista vieja al instante (antes bajaba
  el inicio entero, ~900 KB).
- **Fotos de productos** (paginas.js 13): Lima les pone `data-expand="-10"` (se pedían ya ADENTRO de la pantalla) → se cambia a 1,5 pantallas, SOLO a las fotos
  con tamaño (la 2.ª foto escondida de cada tarjeta mide 0×0 y con alcance grande se bajaban todas y ocupaban los 8 lugares de carga de lazysizes). Las tarjetas
  que esperan su entrada usan opacidad 0,001 (con 0 lazysizes no carga sus fotos). Disney con srcset (480/640/1024; antes siempre 1024) y pedido a 1.800 px.
- **Banners** reducidos (aritos 1600, disney 1400, pulseras 1400, charms 1300 px de ancho: de 1.852 a 767 KB; originales en el respaldo).
- **Armadores**: el 3D arranca con el escenario visible al 2 % (era 40 %: caja vacía al llegar); fotos de las tarjetas apenas carga el inicio; entran solo con
  fundido (con `translate` el ancestro ataba la barra fija del total y al terminar la animación saltaba: CLS 0,08 en celular); barra del total de celular
  siempre armada y entrando con transform, sin backdrop-filter.
- **Celular** (pedidos del mismo día, con capturas del iPhone): hero a `100lvh` (con `dvh` asomaba la sección siguiente detrás de la barra translúcida de Safari;
  el cartel sube `100lvh - 100svh` para no quedar debajo de la barra); franja blanca entre la barra de navegación y el 3D mientras está pegado (secciones.js →
  `.pnt-pegado`); cartel "de cerca" compacto (~125 px, "Sacar" a la derecha); pulsera y oreja más cerca (`distCam` celular 3,6 · 0,12 · 1,32; pulsera sube 0,11;
  oreja `focoM [1480,1292]`, `altoM 1080`; contador "N piezas" a la derecha); "Mundo Disney" con subtítulo 11,5 px y botón chico a la derecha.
- Medido (Chrome real): inicio compu 58–59 cuadros/s y CLS 0; celular 57 y CLS ≤ 0,015; lista y ficha sin fotos vacías salvo la primera fila (descarga del CDN).
- **Después, el mismo día (pedidos del usuario):** el 3D de celular vuelve a ser más alto (`clamp(230px,34vh,320px)`, ~287 px: "me arrepentí del recorte") con la
  pulsera un poco más arriba en el encuadre (0,14); el hero de celular mide **60 px más que la pantalla** (`calc(100lvh + 60px)`: en el iPhone del usuario
  `100lvh` solo seguía dejando asomar la sección siguiente) y el cartel sube lo mismo (`calc(100lvh - 100svh + 76px)`).
- **Hero de compu: la sección que sube se nota** (pregunta del usuario: "¿estás seguro de que sube la segunda sección en lugar de bajar? no está tan claro"): el video
  y el cartel quedan QUIETOS (ya no hay parallax de traslado; solo se oscurece) y los banners suben con esquinas redondeadas de 30 px y sombra en su borde.
- **Celular:** dedo apoyado en un banner de categoría = el hover (foto 106 % y velo más claro; paginas.js 15, `.pnt-toque`; se apaga si el dedo se desliza);
  "Mundo Disney" más compacto (cabecera de 146 a 91 px; el botón queda 2 px debajo del párrafo).
- **Alto del 3D en celular: `clamp(280px, 46vh, 420px)`** (última regla de armar3d.css / oreja3d.css). OJO: en el iPhone `vh` descuenta las barras de Safari
  (pantalla útil ~745 px): con 34 vh quedaban ~253 px y se cortaban los charms. Probar con `herramientas/armador/pruebas/_alto-iphone.mjs` (390×745).

## 📲 Pedidos de la tarde del 2026-11-15 (celular sobre todo) — paginas.css 16, paginas.js 16, marca.js, armadores
- **Hero tapado por la sección siguiente también en celular** (pedido: "tanto en mobile como en desktop… la segunda sección tiene que subir, como en
  BS23"): el hero vuelve a ser sticky en celular (paginas.css 16 c; la mañana lo había dejado "relative" al pedir sacar el parallax). Sigue SIN parallax en
  celular: el video no se mueve ni se oscurece. Los banners suben con esquinas de 22 px y sombra. **El video se frena cuando el hero queda tapado**
  (`tapado` en marca.js: un hero sticky siempre "se ve" para el IntersectionObserver y seguía andando detrás de toda la página). En compu, si la ventana
  es más baja que el hero, el hero se pega un poco más arriba (como BS23) para que el cartel se vea antes de taparse.
- **Carruseles "Los más elegidos" y "Ofertas": 1 tarjeta por fila en un celular lento** (pedido: "en mobile solo veo 1, no 2 por fila"). Causa: hasta que
  Lima armaba su carrusel (espera a jQuery y a los scripts de Tiendanube: segundos en un celular lento) cada tarjeta medía el ancho entero (lo que Swiper
  pone por defecto); después Lima ponía 2,25 y marca.js 2,04. Ahora marca.js **ataja `createSwiper` de Lima** para `.js-swiper-featured` y
  `.js-swiper-sale` (`MV_ATAJADO`, `MV_PEDIDOS`: Lima recibe nuestro carrusel en su callback) y arma el nuestro apenas está la página (el de Ofertas 0,7 s
  después); la tarjeta roja de Ofertas se pone antes (`mvPortada`); paginas.css 16 f da a las tarjetas su tamaño final desde el primer cuadro (2,04 / 3,15 /
  4,31 por vista, mismos espacios) hasta que el carrusel está armado (`.pnt-sw-listo`). Medido con CPU ×6 (`herramientas/revision/_carr-lento.mjs`): nunca
  pasa por 1 por fila ni cambia de tamaño. Si `createSwiper` no existiera, queda el camino viejo (esperar el de Lima, destruirlo, armar el nuestro).
- **Listados en celular: un solo botón "Filtrar", a la derecha**; "Ordenar por" (6 opciones en píldoras, la elegida rosa con letra blanca) va arriba de
  todo ADENTRO del panel de filtros (paginas.js 16, `html.pnt-orden-en-filtros`; cada píldora toca la opción del desplegable de marca.js). En compu y
  tablet sigue el desplegable. Si la página no tiene panel de filtros, el desplegable sigue en celular. En Ofertas, 18 px entre la franja SALE y el botón.
  Las pruebas de ordenar (`pruebas-46-115.mjs`, `abrirOrden`) usan el desplegable o el panel según lo que se vea.
- **Armá tu pulsera en celular**: "Deslizá → ▬•••" (como en "Los más elegidos") en la fila de "Filtrar" de los charms y al lado de "1 La pulsera";
  **la lista de pulseras es una tira que se desliza** (antes 2 filas de 4 fijas; ~3,5 a la vista). armar3d.js `desliza()` (los puntitos siguen la tira;
  se esconde si entra todo); los puntitos son `span` (con `i` tomaban el estilo del número del paso). La pulsera bajó apenas en el 3D de celular
  (`0.14 → 0.12` en armar3d-escena.js ×3 y `ubicaPoster` de armar3d.js; pedido: "apenas más abajo, apenas solamente").
- **Banners de categorías en celular**: la mitad de espacio en blanco (8 px por fuera y 6 entre fotos; antes 15 y 11) y fotos más altas (Disney cuadrada,
  Aritos 2:1,2, Pulseras/Charms 3:4,3); el lugar reservado del primer cuadro se recalculó (paginas.css 16 d).
- **"Seguir en Instagram | Seguir en TikTok" en una fila en celular** (desde 375 px; más angosto dicen "Instagram | TikTok": `.pnt-rh-seguir` en redes.tpl).
- **Vista previa: "No se pudo traer la página de Tiendanube" (502)** — fue un corte momentáneo. `tienda-local.mjs` ahora reintenta 2 veces los GET (no los
  POST del carrito) con 30 s de tope, y si igual falla una página muestra una pantalla blanca "La tienda tardó en responder" que se recarga sola a los 2,5 s.

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
- **SIEMPRE 3 charms y 2 aritos de entrada** (2026-11-16, pedido: "siempre tiene que aparecer como mínimo 3 charms por defecto y 2 aritos por
  defecto. En caso de que se venda alguno de los que estaban por defecto, reemplazarlo por otros"): los pedidos (`PEDIDOS_DE_ENTRADA` en armar3d.js:
  Painter, Mickey Shine, Stitch; `data-ejemplo` de oreja.tpl: Estrellita rose y Argollita cadena gold) que tengan stock y, en el lugar de cada uno que
  no, otro con stock elegido solo: charms del mismo tema y forma (cuenta/colgante), si no del mismo tema, si no de la misma forma; aritos del mismo
  tema (nunca un ear cuff en el lóbulo); entre esos, el de más unidades. Hoy: Painter, **Mickey y Minnie reversible** (por Mickey Shine) y Stitch;
  aritos sin cambios. Lo que la tienda rechaza al agregarlo queda anotado **12 h en ese navegador** (localStorage `pnt-agotados-v1`): al volver a
  entrar no aparece y, si era de entrada, se reemplaza. **Póster:** el .tpl anota con qué combinación se sacó (`data-poster-de`, lo escriben
  `pruebas/poster.mjs` y `pruebas/poster-oreja.mjs`); si la de entrada de hoy es otra (`data-entrada`), el póster no se muestra (`posterVale`).
  Cuando un reemplazo cambie la de entrada (al sincronizar el stock), regenerar el póster. Prueba: `pruebas/stock.mjs` (28 ✔) y `funciones.mjs`
  (lee la combinación de entrada de la página: `data-entrada`).
- **Vista previa: "HTTP ERROR 431" otra vez (2026-11-16)**: las cookies de `localhost` (las comparten TODOS los proyectos locales y puertos) pasaron
  los 256 KB que aceptaba el preview. tienda-local.mjs ahora acepta hasta 2 MB (Chrome manda como mucho ~720 KB por sitio) y, si pasan los 32 KB, anota
  en la consola y en `%TEMP%\panthera-preview-cookies-5700.txt` cuáles pesan más (solo los nombres). Vaciarlas: `localhost:5700/__limpiar-cookies`
  (también desloguea de los otros proyectos locales). Nuestro código no escribe cookies.

## 🏷️ Ofertas = la categoría "Ofertas" de la tienda y carruseles sin repetir (2026-11-16)
- **Categoría creada con el MCP** (pedido: "creá la categoría Ofertas y agregá uno solo para probar… que tenga la estética que tiene hoy la categoría
  falsa… y que el carrusel de ofertas de inicio muestre lo que hay en la categoría"): "Ofertas", en la raíz, **OCULTA**, con **Pulsera Silver Flower**
  de prueba. Su dirección es `/ofertas/` (`PNT_OFERTAS` al principio de marca.js). **Tiendanube no muestra la página de una categoría oculta** (da
  "no encontrada" con código 200, aunque el MCP diga que "la dirección anda"); hacerla visible lo frenó el modo automático: lo decide el usuario
  (panel → Productos → Categorías, o un permiso para `update_category_visibility`).
- **Código (anda solo en cuanto la categoría sea visible):** la página `/ofertas/` tiene la estética de la página armada (franja SALE con "Hasta X% off" y
  "+X% extra en transferencia" de sus productos; tarjetas rojas: `listados()` las envuelve en `.pnt-ofertas-grilla[data-store=home-products-sale]`;
  `html.pnt-pag-ofertas` desde el primer cuadro por ORDEN_TEMPRANO de layout.tpl / tienda-local.mjs); Ordenar, Filtrar y "Ver más" son los de la
  tienda. **"No los dejes escapar" muestra los productos de la categoría** (`mvDeOfertas`: baja `/ofertas/` y reemplaza las tarjetas que eligió el panel;
  mientras no anda, quedan las del panel; sin productos, la sección no se muestra). Menú, botón del cartel, tarjeta roja y "Ver todos" → `/ofertas/`; la
  dirección vieja `/todos-los-productos/?ofertas` redirige ahí. **La ficha va en rojo si el producto está en la categoría** (`EN_OFERTAS`, del estado
  de la tienda; ya no baja el inicio). Se borró la página armada (`ofertasDelInicio`, `pnt-ofertas-items-v1`, paginas.js 14). Prueba:
  `node herramientas/revision/_ofertas-cat.mjs [compu|celu]` y el grupo `ofertas` de pruebas-46-115.mjs (ya apunta a la categoría).
- **Carruseles del inicio SIN tarjetas repetidas** (pedido: "no quiero que se repitan"): ya no se copian (antes 3 → 3 × 3). Con 6 o más dan la vuelta;
  con menos avanzan solos y vuelven al principio (`rewind`); si entran todas quedan quietos y sin "Deslizá" (`watchOverflow`/`isLocked`). Sin vuelta,
  los puntitos siguen la posición (`sw.progress`). Las pruebas del inicio miden posición (tarjeta activa + desplazamiento): 38 ✔.
- **"Los más elegidos" con 10 productos:** el usuario eligió marcarlos como destacados en el panel (Diseño → Organizar productos; el MCP no llega) desde
  su Chrome. Propuestos (más vendidos con stock ≥ 2): Baby boy, Aro cuernito green, Argollitas corazón medium, Zapato Cenicienta, Mom (con corazón
  nácar rosa), Home happy place y Aro plane, sumados a Jazmín, The Moon y Broche Mickey y Minnie. Pendiente: el Chrome no tenía la sesión de Tiendanube.

## 📱 Pedidos del 2026-11-16 (desde el celular, sin vista previa: NO probados en la tienda) — paginas.js 0, paginas.css 20–21, marca.js
- **Alto FIJO en celular** (pedido: "la altura de las secciones en mobile debería ser fija… cuando aparece la barra del navegador se achica y cuando
  desaparece se agranda"): paginas.js sección 0 mide UNA vez `--pnt-alto-l` (100lvh), `--pnt-alto-s` (100svh) y `--pnt-vh` (1vh) en píxeles y los
  vuelve a medir solo si cambia el ANCHO (girar). paginas.css 20 los usa para el hero (+160 px), el cartel y el lugar de los armadores; la última
  regla de `armar3d.css` y `oreja3d.css` usa `var(--pnt-vh,1vh)*46` para el 3D (oreja3d.css a mano: repetirlo si se regenera con construye_tienda.py).
- **"No los dejes escapar" = LITERALMENTE la categoría Ofertas**: `home-featured-products.tpl` arma la sección aunque el panel no tenga productos
  "en oferta", y `mvDeOfertas` ya NO deja las del panel: si la categoría no se puede leer (oculta), tarda > 5 s o está vacía, la sección se esconde.
  **La categoría tiene que estar VISIBLE** en el panel para que se vea algo. Si la tienda no trae la sección (sin productos "en oferta" en el panel; y
  la vista previa no usa los .tpl), `mvSeccionOfertas` la arma copiando la estructura de "Los más elegidos" justo debajo.
- **Carruseles del inicio con el dedo**: en pantallas táctiles arrastre libre con inercia (`freeMode` + `freeModeSticky`, speed 450; Swiper 6.3.2) y el
  avance automático se frena mientras el dedo está apoyado (vuelve 2,5 s después). En compu igual que antes.
- **Mundo Disney más compacto en celular** (paginas.css 21 a) y **sin la historia de Collares en celular** (21 b, por su aria-label).
- **3D más nítido en celular** (pedido: "en mobile los charms, la pulsera y los aritos se ven con mucha menos calidad que en la compu"): `dprDe()` en
  `armar3d-escena.js` y `oreja3d-escena.js` (a mano: repetirlo si se regenera la oreja): con el escenario de < 700 px el piso es 2 píxeles por punto y el
  nivel alto usa 3 (antes tope 2 y bajaba a 1,5 / 1,25 con cualquier cuadro lento del scroll). En compu igual.
- **Celular, más pedidos del 2026-11-16** (paginas.css 21 c–f, secciones.js): WhatsApp a 28 px del borde y cartel del aniversario 20 px más arriba;
  Mundo Disney en 20 s; **mientras el 3D de un armador llega o está pegado arriba, la barra rosa y la isla se esconden** (`html.pnt-3d-arriba`,
  secciones.js) y el escenario se pega a 8 px del borde (`--pega`); "Cómo cuidar tu plata" con letras más chicas.
- **Filtro por metal en los dos armadores** (pedido 2026-11-16: "que también se pueda filtrar por dorado o plateado"): en el panel de "Filtrar", debajo
  de los temas, la fila "Metal" (Todos / Plateado / Dorado), combinable con el tema (`aplicaFiltros`, chips con `data-m`; tarjetas con `data-me`).
  Charms: `me: 'oro'` en armar.tpl (sin `me` = plateado); sacado de las fotos: Flor rose cristal (rose gold), Travel lover, Árbol gold y Mickey gold.
  Aritos: el metal de la argolla de `arg` (oro/plata) y `me` a mano en los ear cuffs (Moño Minnie oro, Shine silver plata). oreja.tpl/oreja3d.* a mano:
  repetirlo si se regenera con construye_tienda.py. Charms nuevos (sincroniza_charms.mjs): si son dorados, agregarles `me: 'oro'`.
