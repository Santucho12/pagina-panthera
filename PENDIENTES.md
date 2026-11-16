# Panthera — Pendientes de la tienda

> ⛔ **NO SE SUBE NADA POR FTP hasta que Panthera dé el OK.** Todo queda en local.

Actualizado: 2026-11-12

## Preparación
1. [x] Bajar el tema completo por FTP (226 archivos, tema Lima) → `tienda/` + backup `tienda-original-ftp-2026-11-08/`
2. [x] Preview local de la tienda real (`npm run dev`, puerto 5700)
3. [ ] **Esperar el OK de Panthera para subir.** Hasta entonces, nada por FTP.

## Rediseño
4. [x] Franja de beneficios + navbar isla como Signos (2026-11-09)
5. [x] Footer como BS23, con el logo animado (2026-11-09)
6. [x] Sección "Seguinos en redes" como BS23 (2026-11-09)
7. [ ] Cambiar las historias de muestra (`static/panthera/redes/`) por posteos/reels reales de @panthera.ok y @panthera.universe
8. [x] Panel del menú (hamburguesa) rediseñado como BS23 (2026-11-12, ver ítem 47)
9. [x] El logo dorado se leía poco (tenía un halo blanco): resuelto el 2026-11-09/10, el logo se pinta con máscara CSS en su dorado propio `#EDC45F` (sin halo) y los banners del inicio ya no son rosa (son fotos)
10. [x] Paleta: solo dorado y rosa (+ un tono más oscuro de cada uno, solo para hover) (2026-11-09)
11. [x] Paleta dorado + rosa acordada con el cliente el 2026-11-09 (ver CLAUDE.md). Al publicar, ver si conviene cambiarla también en el admin (ítem 19)
12. [x] Cartel de WhatsApp con el diseño de Signos (vidrio, hora, barra "Escribí un mensaje") y la paleta de Panthera (2026-11-09)
13. [ ] Revisar con Panthera los mensajes del cartel de WhatsApp (marca.js, sección 5)
14. [x] El botón flotante de WhatsApp queda **verde de WhatsApp**, igual que el cartel (decidido por el usuario el 2026-11-09; se probó la cabecera en rosa y pidió volver al verde)
15. [x] Intro cinematográfica en el inicio de la tienda (la de la demo) (2026-11-09). **Quitada el 2026-11-12** a pedido del usuario: ahora el hero tiene el cartel de vidrio del 5.º aniversario
16. [x] Ya no aplica: la intro se quitó el 2026-11-12 (ítem 15)
17. [x] Banners del inicio: arriba de "Los más elegidos"; "Ofertas" → Aritos, + Pulseras y Charms (2026-11-09)
18. [ ] Fotos de Aritos y Charms: salen del video de la demo (1024 px, hecho con IA). Cambiarlas por fotos reales de Panthera en buena resolución (static/panthera/banners/, formato 2:1)
19. [ ] Al publicar: en el admin, poner los banners y el orden del inicio así de una (hoy lo hace marca.js)
20. [x] Tipografía: títulos en **Archivo** bold apretada (desde el 2026-11-10), texto de los banners de categorías en **Libre Baskerville** y todo lo demás en **Outfit**, como BS23 (antes Cormorant Garamond)
21. [ ] Al publicar: ver si Outfit, Archivo y Libre Baskerville están entre las tipografías del admin del tema; si no, quedan cargadas por `layouts/layout.tpl` y `marca.css`. El checkout y los mails de Tiendanube no usan los archivos del tema: ver qué se puede cambiar desde el admin
22. [x] Ya no aplica: Cormorant (la letra fina) ya no se usa; los títulos son Archivo bold (ítem 20)
23. [ ] Banner de Disney: hoy usa una foto sin texto (`banners/disney.webp`) hecha borrando el texto de la imagen del admin; pedirle a Panthera la foto original sin texto
24. [ ] En el celular los banners de categorías van sin el botón "Ver colección" (chocaba con el texto de Disney): decidir si se deja así
25. [x] Cuatro secciones nuevas del inicio: Armá tu pulsera, Colecciones Disney, Cómo cuidar tu plata y Nuestros locales (2026-11-10). El cliente no eligió los diseños del artefacto: se usaron A20, B2, C1+C5 y D18; cambiar si prefiere otros
26. [ ] Nuestros locales: pedir a Panthera los **horarios** de Bahía Blanca y Monte Hermoso y **fotos del local** (hoy solo hay las dos direcciones de la página de Contacto)
27. [ ] Armá tu pulsera / Colecciones Disney: los precios, el stock (varios charms tienen 1 unidad; el talle 17 cm está sin stock) y las fotos están escritos a mano en `armar.tpl` y `disney.tpl`. Revisarlos antes de publicar y decidir cómo mantenerlos (por ejemplo, etiquetar los productos y leerlos desde el tema)
28. [ ] Armá tu pulsera: ¿un precio especial por llevar la pulsera + charms juntos? Sería una promoción en el admin de Tiendanube (no se puede desde el tema); no se hizo
29. [ ] Cómo cuidar tu plata: Panthera debería revisar los cinco consejos (salen de su página Cuidados + "un paño suave") y ver si quiere agregar cómo limpiar la plata 925 oscurecida
30. [ ] La página Cuidados de la tienda habla de cobre y acero con baño de oro y plata, pero no de la plata 925 natural de los charms: completarla en el admin
31. [x] Armá tu pulsera pasó a ser el **armador 3D** (2026-11-10): 7 bases con su cierre, 27 charms, talles reales y carrito real (pulsera + charms). Probado en la vista previa con el carrito interceptado (no se tocó el carrito de la tienda)
32. [ ] Armá tu pulsera: las tarjetas dicen **3 cuotas sin interés** (el dato de los productos), pero la franja de arriba dice "3 y 6 cuotas sin interés": confirmar con Panthera cuál vale
33. [x] Armá tu pulsera: cómo arranca. Lo decidió el usuario el 2026-11-11/12: la Silver Flower elegida en 18 cm (siempre viene un talle marcado) y 3 charms ya agregados (Painter, Mickey Shine y Stitch), sin el cartel de "combinación de ejemplo" y sin "Tu combinación" a la vista (un charm se saca tocando su tarjeta otra vez o en la lupa). Además: el paso 1 dice "La pulsera", la nota del carrito se avisa al agregar, el total es más compacto y la pulsera va más arriba y a la izquierda
34. [x] Armá tu pulsera: **están todos los charms/dijes** (2026-11-11, pedido del usuario): los 62 de la categoría Charms/Dijes de la tienda (27 de antes + 35 sumados), recortados con IA local, con su foto HD, relieve y contorno, y revisados uno por uno en la pulsera (que la cadena pase por su agujero). Arreglos a mano: la Luciérnaga usa la 2.ª foto de la tienda (la 1.ª era de costado) y Travel lover tiene el agujero de su aro marcado a mano (`hueco` en `armar.tpl`)
34b. [ ] Armá tu pulsera: los charms que entren a la tienda después se suman a mano (foto recortada + datos en `armar.tpl`) y hay que volver a publicar; ver `herramientas/armador/LEEME.md`. Decidir si conviene automatizarlo (script que lea la tienda y prepare todo) y si los precios/stock deben actualizarse en vivo
35. [ ] Seguinos en redes: el video del celular (`static/panthera/redes/video-redes.mp4`) es desde el 2026-11-11 el de Kling más nuevo de Descargas (aritos, collar, pulsera con charms y anillos). **Trae la marca de agua "KlingAI 4.0"** abajo a la derecha (se ve chiquita al lado del @usuario): bajar la versión sin marca desde la cuenta de Kling (si el plan lo permite) y reemplazar el archivo, o decidir si se deja. No se retocó. Todos los círculos (también "Novedades") muestran este mismo video, salvo "Disney" (`video-disney.mp4`, aro de Minnie) y "Aritos" (`video-aritos.mp4`, oreja con tres aritos y moño rosa), que tienen el suyo: los tres hechos en Kling y los tres con la marca de agua; el anterior quedó en `respaldos/2026-11-11-video-redes/`. El círculo "Novedades" tiene además su propio clip chiquito, derecho (`video-redes-circulo.mp4`, recortado: sin marca de agua; se probó al revés y se volvió atrás); si se cambia el video, rehacerlo con el comando de LEEME.md
36. [x] Armá tu pulsera: **pulido premium del 3D** (2026-11-11): luz de estudio, plata y cadena nuevas, cierres y cristales con detalle, charms con volumen y foto HD, movimientos con resortes, lupa al tocar un charm o el cierre, póster si el 3D tarda o falla, arranque sin trabar la página. Probado en la vista previa (18 pruebas de funciones, sin CDN, rendimiento, descarga, 8 anchos); el carrito real no se tocó
37. [ ] Armá tu pulsera: las fotos de la tienda son chicas para la lupa (la pieza ocupa poco del cuadro), así que las fotos HD del 3D se escalaron con IA en esta compu (Real-ESRGAN): primero 9 (ange, bruj, buzz, cora, estr, glob, minn, moon, rued) y el 2026-11-11 las otras 17 (adve, broc, ceni, fam, flor, gato, home, jaz, jess, mick, minp, mmb, mom, rosa, stit, vali, wood). Pedirle a Panthera las fotos originales en alta (sobre todo **estr** y **glob**, las más chicas) para reemplazarlas
38. [ ] Armá tu pulsera: three.js (el motor 3D) viene de jsDelivr, un CDN externo. Si se cae, queda el póster y todo lo demás anda (elegir charms, total, carrito). Más adelante se puede alojar three en la tienda
39. [ ] Armá tu pulsera: si cambian los charms de entrada (hoy Painter, Mickey Shine y Stitch, `DE_ENTRADA` en armar3d.js) o la pulsera de entrada, regenerar el póster: `node herramientas/armador/pruebas/poster.mjs` (regenerado el 2026-11-12)
40. [x] Armá tu pulsera: en compu de 1280–1440 px, el cartel de WhatsApp de la tienda tapaba la parte de abajo del panel del armador. Resuelto el 2026-11-11: el cartel no se abre mientras un armador (pulsera u oreja) está a la vista (`data-wa-evitar` en las dos secciones)
41. [ ] El inicio en celular: con la CPU emulada 4× más lenta, a un tercio de la página va a ~20 fps (antes del armador; el armador solo va a ~40). Revisar aparte qué secciones pesan (carruseles, videos, intro)
42. [ ] **Armá tu oreja** (2026-11-11): prototipo 3D en un artefacto (los enlaces publicados ya no andan: borrados o de otras cuentas; si hace falta, se publica uno nuevo desde `herramientas/oreja/artefacto/`), hecho como el armador de pulseras: "¿cuántos agujeros tenés?" (1–3 en el lóbulo) + ear cuff, 40 aros solitarios y los 2 ear cuffs de la tienda recortados con IA local, carrito simulado. **Versión realista** (el usuario la vio "falsa" con la versión anterior): la oreja es la **foto que mandó el usuario** (`herramientas/oreja/fotos/oreja-ia.png`); la argolla de cada aro es **3D** (medidas y metal sacados de su foto), casi de canto y atravesando el lóbulo, como en las fotos de Panthera con el aro puesto; el dije es la foto del producto colgando; luz y colores de la foto, sombras suaves; el cuff de cristales abraza el borde del hélix. **Desde el 2026-11-11 está en la tienda LOCAL** (sección del inicio justo debajo de "Armá tu pulsera", con carrito real; **no subida**): `oreja.tpl` + `oreja3d.js/css/-escena.js` + `static/panthera/oreja/`, generados con `herramientas/oreja/construye_tienda.py` (ver su LEEME y CLAUDE.md). Pulido: encuadre de compu pegado al borde derecho de la foto (los aros quedan lejos del total; se probó espejar la foto y el usuario no lo quiso), dijes con movimiento más natural; como el armador de pulseras (2026-11-11), arranca con 2 aros puestos (Tres circonios y Moon gold), sin cartel de ejemplo ni nota fija, y con el total compacto. Falta: confirmar con Panthera el material y las **medidas reales** de los aros (hoy el tamaño sale de las fotos), pedir fotos en alta, y que **Panthera apruebe la foto de la oreja** (es la que mandó el usuario)
43. [ ] Armá tu oreja: los precios, el stock y las fotos de los 68 aros están escritos a mano en `oreja.tpl` (como en el armador de pulseras). Revisarlos antes de publicar. La tienda tiene 73 solitarios y el armador muestra 40: sumar los otros con `herramientas/oreja/` (recorte, medida de la argolla, construye y construye_tienda)
44. [ ] El inicio tiene ahora dos secciones 3D (pulsera y oreja). Cada una carga three.js y dibuja solo cuando está cerca o a la vista, pero conviene medir el rendimiento del inicio en un celular real antes de publicar (ver ítem 41)
45. [x] **"Agregar al carrito" de los armadores llegaba a un carrito vacío en localhost** (2026-11-12). No era el armador: el preview le pasa a la tienda hasta 8 KB de cookies, Chrome comparte las de localhost entre todos los proyectos y la del carrito (la más nueva) quedaba afuera. Arreglado en `tienda-local.mjs`: primero las cookies de Panthera, nunca las de otra tienda. En la tienda publicada no pasa (ahí no hay proxy). (El preview de BS23 pasa todas las cookies, sin tope: ahí no pasa)

---

# Relevamiento estético de toda la tienda (2026-11-12)
Mismo criterio que el listado de BS23: todas las páginas y piezas que tiene la tienda, para que no se escape nada del
rediseño. Hecho con el sitemap (26 páginas + 2.262 productos), el código del tema y capturas del preview local en compu
(1440 px) y celular (390 px). Hoy **el inicio, la franja, la navbar, el footer y el cartel de WhatsApp ya están
rediseñados**; las páginas internas solo heredan la letra y los colores generales de `marca.css`, el resto es Lima.

## Navbar y menú
46. [x] Franja de beneficios + navbar isla (ítem 4)
47. [x] **Panel del menú (hamburguesa)** como el de BS23 (2026-11-12): fondo blanco, categorías grandes, flecha **blanca** de los
    submenús en un **círculo rosa** (en BS23 era gris/negro), fondo de atrás **desenfocado**, submenú con título chico espaciado y que se abre encima del
    menú (Lima lo abría en la otra punta de la pantalla), pie "Iniciar sesión | Crear cuenta". `marca.css` sección 12
48. [x] Menú arreglado (2026-11-12, `marca.js` sección 10): "Crealo vos misma" en minúsculas y "Collares" de
    `/collares1/` (categoría duplicada: los mismos 7 productos que `/collares/`) ya no aparece (en "Todos los productos" ya
    estaba "Collares y Colgantes"). Los dos "Disney" quedan: son categorías distintas y bien puestas ("Disney" =
    `/disney-lovers/`, todo lo de Disney; "Charms/Dijes → Disney" = solo los charms de Disney). **Es un parche del tema:
    al publicar, hacer el mismo cambio en el admin (Tienda online → Menús) y ver si se borra la categoría `/collares1/`**
49. [x] Buscador como el de BS23 (2026-11-12): la pastilla de compu ahora abre el panel lateral (como en el celular)
    con "Buscar" grande, campo en píldora, **lupa y flecha de volver blancas en círculos rosas**, accesos "Explorá" con las
    categorías del menú, y sugerencias en mini tarjetas (foto nítida, nombre en mayúsculas, precio grande, cuotas abajo)
    con "Ver todos los resultados" en píldora rosa. `marca.css` sección 12 + `marca.js` sección 10

## Páginas
50. [x] **Listado de categoría y "Todos los productos"** como BS23 (2026-11-12): las mismas tarjetas de "Los más elegidos"
    (`marca.js` → `listados()` reusa `mvTarjeta`, también las que carga el scroll infinito), **bolsita negra** con la bolsa blanca
    (desde el 2026-11-12 es negra en todos lados: inicio, listados, búsqueda y 404; antes era rosa en los listados), título grande, migas chicas, "Filtrar" y "Ordenar" en píldoras que se
    ponen rosas al pasar el mouse, grilla a todo el ancho (4 en compu, 3 en tablet, 2 en celular). `marca.css` sección 13.
    **"Ordenar" y "Filtrar" iguales a BS23** (`marca.js` sección 11): "Ordenar: **Más vendidos** ⌄" abre un desplegable con íconos (Novedades,
    Más vendidos, Menor precio, Mayor precio, A – Z, Z – A; la elegida en rosa suave) y "Filtrar" lleva el ícono de controles. Más aire entre
    filas. **Info de las tarjetas** (nombre, reseñas, precios, cuotas) centrada y del ancho exacto de la foto, apenas más chica (sección 17)
51. [x] **Ficha de producto como la de BS23** (2026-11-12, `marca.css` sección 22 + `marca.js` sección 14): fotos redondeadas con miniaturas, columna de información **fija al bajar** en compu, nombre en
    mayúsculas, estrellas con el puntaje, "-20%" y precio con el valor con transferencia grande en rosa, cuotas, "Envío gratis superando $150.000" (el monto sale de la barra de anuncios), talle/modelo en
    píldoras (el elegido en rosa), cantidad en píldora, **"Agregar al carrito" rosa**, medios de pago y envío entre líneas. Abajo, en este orden: **descripción en dos columnas → reseñas → "Cómo cuidar tu plata" →
    "Te va a interesar"** (antes "Productos similares", con las tarjetas de los listados). Probada con 2 productos (una foto y varias fotos con 11 modelos) en 6 anchos, sin desbordes. Respaldo: `respaldos/2026-11-12-antes-de-la-ficha/`
    **⚠️ Las reseñas de la vista previa son DE MUESTRA** (inventadas, solo en `localhost`, de 4 a 7 por producto): en la tienda publicada no se inventa nada. Para que aparezcan reseñas reales: admin → Diseño del tema
    → **"Reseñas de clientes"** (hasta 8, con texto, nombre, detalle, estrellas y foto; si no hay ninguna, la franja no aparece, y **"Cómo cuidar tu plata" sí**). `settings.txt`, `snipplets/panthera/resenas.tpl` y `templates/product.tpl`
    son .tpl: **no se ven hasta publicar**; el orden y las reseñas de muestra se ven solo en local
52. [x] **Descripciones de los productos** (2026-11-12): el texto de cada producto viene del admin con colores propios (marrón dorado, beige, rojo, verde, grises). `marca.js` lo reordena en dos columnas con los
    estilos de la marca: "Descripción" + ficha técnica (filas) | "Sobre Panthera" + botón "Seguinos en Instagram". **Se sacan de la ficha**: los separadores ✦, el bloque "Miranos en Instagram" (íconos de video que no
    llevaban a nada), "Cuidá tus joyas Panthera" (lo reemplaza "Cómo cuidar tu plata") y "Envíos y atención". El texto original queda en la página, escondido; para volver a mostrarlo, sacar la regla `.pnt-desc-lista`.
    **Contenido para revisar con Panthera**: la Silver Flower dice "Material base: Cobre" y "Baño de plata", pero el texto dice plata 925
53. [x] **Carrito**: vacío listo (tarjeta rosa suave con la bolsa, "Tu carrito está vacío" y botón rosa "Ver productos →", ya no sale el
    aviso celeste). **Con productos: estilo preparado pero sin ver** (hace falta un carrito con productos: filas con borde fino, fotos
    redondeadas, cantidad en píldora, totales en tarjeta rosa suave, "Iniciar compra" en rosa). Revisarlo con capturas apenas se pueda.
    `marca.css` secciones 14 y 15
54. [x] Búsqueda con resultados: mismas tarjetas y grilla que el listado (ítem 50)
55. [x] Búsqueda sin resultados: título "Resultados de búsqueda" y tarjeta con el mensaje, accesos a las categorías del menú y botón
    rosa "Ver todos los productos" (como BS23). `marca.js` → `paginas()`
56. [x] Contacto: título centrado, los datos (WhatsApp y direcciones) como filas con ícono y el formulario en tarjeta con botón rosa
    "Enviar". El número de WhatsApp ya se ve como "+54 9 291 566-1062" (`paginas.js`, 2026-11-12); en el admin sigue cargado todo junto. `marca.css` sección 14
57. [x] Páginas de texto (Cuidados, Envíos, Política de cambios): título grande a la izquierda (fijo al bajar) y texto a la derecha,
    sin el formato pegado del admin (se sacan los estilos en línea). **No se armó el acordeón de preguntas de BS23**: esos textos no
    son preguntas y respuestas. `marca.js` → `paginas()` + `marca.css` sección 14
58. [x] Página 404: número gigante, "Esta página no existe", botones rosa "Volver al inicio" y "Ver productos →", y abajo los
    productos sugeridos con las tarjetas nuevas
59. [x] Mi cuenta → Iniciar sesión: título centrado en mayúsculas, formulario en tarjeta, campos redondeados rosa muy suave y botón
    **rosa** (ya no dorado lleno). `marca.css` sección 14
60. [x] Mi cuenta → Crear cuenta y "Olvidé mi contraseña": la misma tarjeta y botón rosa que el inicio de sesión
61. [x] Mi cuenta → pedidos, detalle de un pedido, datos, direcciones, nueva contraseña: **estilo preparado pero sin ver** (hace
    falta una cuenta con pedidos): títulos grandes, tarjetas con borde fino, formularios en tarjeta, botones rosa. `marca.css` sección 15
62. [x] Tienda cerrada con contraseña: **preparado pero sin ver en la tienda real** (la página es otro documento): `password.tpl`
    ahora carga `marca.css` y `marca.css` sección 15 le da logo arriba, mensaje grande y el campo en tarjeta con botón rosa. Probado
    solo con una maqueta en local. Es un `.tpl`: se ve recién al publicar
63. [x] Blog: la tienda no lo usa (`/blog/` da 404), no hace falta

## Piezas sueltas
64. [x] **Compra rápida: ELIMINADA** (pedido 2026-11-12). Las bolsitas de las tarjetas con talles o variantes llevan directo a la ficha del producto; las de productos simples siguen
    agregando y abriendo el carrito lateral (`marca.js` sección 13). El estilo de la ventana (`marca.css` sección 20) queda de respaldo. **Al publicar: apagar la opción en el admin
    (Diseño del tema → "Compra rápida")**, para que ni siquiera se cargue
65. [x] Aviso al agregar un producto: ahora se abre el **carrito lateral** (ítem 79)
66. [x] **Panel de filtros** (2026-11-12): cabecera "FILTROS" espaciada con la cruz rosa, categorías en filas con flechita, casillas con tilde rosa, precio en
    píldoras y "Aplicar" rosa, y los filtros activos como píldoras. Fondo desenfocado. Revisar el celular
67. [x] **Etiquetas** ("-20%", "Sin stock", "Envío gratis"): píldoras; la de descuento en rosa y "Sin stock" en gris. "Sin stock" **sin ver** (no hay producto agotado)
68. [x] **Aviso de cookies**: tarjeta de vidrio flotante abajo a la izquierda con botón rosa "Entendido" (en celular deja libre el botón de WhatsApp)
69. [x] **Avisos del sistema**: tarjetas suaves con borde a la izquierda (rosa; los de error en gris oscuro). **Sin ver** los de formularios con error
70. [x] **Carga infinita y "Ver más productos"**: estilo preparado (ruedita rosa y botón rosa) pero **sin ver**: en la vista previa local no carga más productos
    (muestra 48 y no pide más), así que hay que revisarlo con la tienda publicada
71. [x] **Migas de pan**: letra de 13 px y en la ficha en un solo renglón con puntos suspensivos si es largo
72. [x] Páginas cortas (carrito, búsqueda vacía): **queda una franja blanca debajo del footer** (el footer no llega al
    final de la pantalla)
73. [x] Popup del newsletter: la tienda no lo tiene activado
74. [x] Cartel y botón de WhatsApp (ítem 12)

## Fuera del tema (no se cambian desde los archivos)
75. [x] **Checkout y mails** (2026-11-12): `static/checkout.scss.tpl` quedó con la paleta de Panthera (rosa `#F4ACC4`, texto negro, fondo blanco, botones rosa, esquinas de 14 px); original en `respaldos/2026-11-12-antes-del-checkout/`. **Es un .tpl: no se ve hasta publicar**, y solo si el plan permite estilizar el checkout. Los mails y el logo del checkout se cambian en el admin: pasos en `herramientas/PASOS-DEL-ADMIN.md`
76. [x] **Direcciones de categorías con números**: no se arreglan desde el tema. Armé la guía con las 5 direcciones y las nuevas sugeridas en `herramientas/PASOS-DEL-ADMIN.md` (hacerlo en el admin **antes de lanzar**). En el código no hay links a esas direcciones
## Revisión final (como en BS23)
77. [x] **Casos vacíos y límite** (2026-11-12): categoría sin productos → tarjeta con "No hay productos con esos filtros", categorías, "Borrar filtros" y "Ver todos" (y la cruz del filtro aplicado arreglada); botón **"Sin stock"** gris y deshabilitado, bolsita apagada y variante agotada tachada; producto con **11 variantes** (collar de letras) sin desbordes. **Un producto totalmente agotado no existe hoy en la tienda: el estilo "Sin stock" no se pudo ver con uno real**
78. [x] **Recorrida final** (2026-11-12, Chrome real con Playwright): 18 páginas en 11 anchos (320 a 1920 px): sin errores de JavaScript, sin imágenes rotas y **sin desborde lateral en celular (320, 360, 390, 414), tablet ni compu**. Capturas de página completa en 390 px y 1440 px revisadas una por una. Ver ítem 88
## Agregado el 2026-11-12 (pedidos durante el trabajo)
79. [x] **Carrito lateral como BS23**: al tocar la bolsa de arriba o al agregar un producto (tarjetas, compra rápida, ficha y los dos
    armadores 3D) el carrito se abre en un panel a la derecha, con lo de atrás desenfocado, en vez de llevar a `/comprar/`. `marca.js` sección
    12 + `marca.css` sección 16. Es un panel propio con la página del carrito adentro (reusa cantidades, quitar, envío e "Iniciar compra");
    se apaga solo si la tienda activa su carrito lateral nativo. **Estética de BS23** (pedido 2026-11-12): título "CARRITO DE COMPRAS" espaciado con cruz simple, productos con foto redondeada,
    nombre en mayúsculas, cantidad en píldora, precio a la derecha y tachito, **barra de envío gratis** (el monto sale de la barra de anuncios),
    "Medios de envío", subtotal/envío/total grande y **"Iniciar compra" rosa** (`marca.css` sección 19). Probado en compu con 1 producto real
    (carrito de prueba, vaciado después); falta ver varios productos, un cupón y el cálculo de envío, y el celular con productos. Si algo falla al agregar (sin stock, sin conexión), sigue yendo a `/comprar/` como antes.
    **Alternativa de la tienda**: en el admin → Diseño del tema → "Carrito de compras rápidas" se puede activar el carrito lateral de Lima
    (hoy apagado); en ese caso habría que darle a su panel (`#modal-cart`) el estilo de esta página
80. [x] **Carga sin saltos**: antes de armarse el diseño nuevo se veía la tienda cruda de Lima (lupa y carrito viejos, barra rosa con flechas,
    "Filtrar / Ordenar" subrayados, tarjetas viejas). Ahora esas piezas quedan ocultas hasta que su versión nueva está lista (`marca.css`
    sección 18; red de seguridad a los 8 s). Grabado cuadro a cuadro con red lenta: primero la página en blanco con el título y después todo
    ya con el diseño nuevo. Queda por revisar en otras páginas (inicio, ficha de producto)
81. [x] El error `applySortBy is not defined` **pasa también en la tienda real publicada** (es de la tienda, no nuestro). "Ordenar" ya no depende de ese código: va directo a la dirección con el orden
82. [x] **Listados, retoques del 2026-11-12**: el orden por defecto es **Novedades** (la tienda trae "Más vendidos": al entrar a una categoría sin
    orden se vuelve a cargar con `sort_by=created-descending`; el que elige otro orden queda con el suyo); info de las tarjetas **a la izquierda**
    y del ancho de la foto (no centrada), nombre 14 px / precio 29 px; más distancia entre filas (~60 px); el bloque título + Ordenar/Filtrar apenas
    más abajo. **Ojo:** al entrar a una categoría hay una recarga de más por el orden (en la tienda publicada se evita cambiando el orden por
    defecto de cada categoría en el admin)
83. [x] **Navbar que "se veía otra cosa" al cargar**: al aparecer animaba 0,85 s desde una barra blanca con borde hasta la isla; ahora aparece directo
    en su estado final (`marca.css` + `marca.js`, clase `pnt-listo`). Y el buscador de la navbar queda **transparente (vidrio) en estado isla**
84. [x] **Páginas de texto con la estética de "Cómo cuidar tu plata"**: Cuidados y Política de cambios van con título + foto de pulseras a la izquierda y
    **acordeón** a la derecha (cada título en negrita del texto es un ítem; los textos no se tocan; los títulos todo en mayúsculas pasan a mayúscula
    inicial). **Envíos** va con fichas "etiqueta: valor" y el aviso IMPORTANTE en rosa suave. `marca.js` (`acordeonPagina`, `fichas`) + `marca.css`
85. [x] **La vista previa local ya no se cuelga con muchas pestañas**: dejaba una conexión abierta por pestaña (Chrome permite 6 por dirección); ahora
    pregunta cada segundo con pedidos cortos (`tienda-local.mjs`, `/__version`). Reproducido y verificado con Playwright (`playwright-core` en la
    carpeta de pruebas, no en el proyecto)
86. [x] **Vista previa de la página con contraseña** (62): abrir http://localhost:5700/account/login/?pnt-vista=contrasena arma una maqueta con la misma estructura de
    `password.tpl` (solo en la vista previa local, no se sube). Es lo más cercano a verla: la real se ve al publicar
87. [x] **Una página propia por categoría de productos** (pedido 2026-11-12): se hizo una portada distinta para Charms, Pulseras, Aros,
    Collares, Disney y Anillos y **se descartó el mismo día**: el usuario pidió sacarlas ("no quiero estos iniciales arriba del todo,
    quitalos... menos en ofertas"). Quedan apagadas (`PORTADAS_ACTIVAS = false` en marca.js, sin la reserva de lugar del script temprano;
    respaldo en `respaldos/2026-11-12-antes-de-sacar-portada-anillos/`). La página de Ofertas mantiene su franja "SALE". No volver a
    prenderlas sin que el usuario lo pida
88. [x] **Revisión responsive completa (2026-11-12)**: en celular se encontró y arregló que **la página se ensanchaba** (la insignia fija de Google reCAPTCHA sobresalía por la derecha y la navbar quedaba cortada), un desborde de 5 px en los listados y la búsqueda (grilla), textos de 8 a 9 px (ahora mínimo 10 px), el hueco entre el título y "Ordenar/Filtrar" en celular, "Ordenar: Noveda…" cortado, en tablet (768 a 1023 px) la píldora "BUSCAR" que se encimaba con el logo (pasa a la lupa) y el logo del pie gigante. `marca.css` sección 21
89. [x] **Portada en ventanas bajas**: la tarjeta "5.º aniversario" podía quedar pisando la navbar si la portada medía menos que la tarjeta; ahora la portada nunca es más baja que tarjeta + navbar y la tarjeta se achica en ventanas de menos de 760 px de alto
90. [x] Ficha de producto: hecha (ítems 51 y 52).

91. ✅ **Animaciones al scrollear en todo el sitio** (pedido 2026-11-12: "animaciones y transiciones a todo mientras escrolleo, que sean premium"; aclaró que se refiere a cómo va apareciendo todo en las secciones). El inicio ya las tenía (marca.js sección 13 / marca.css 18). Se sumó **marca.js sección 15 + marca.css sección 23** para el resto: categorías, búsqueda, ficha de producto (foto, datos, descripción, reseñas, cuidados, "Te va a interesar"), páginas de texto, contacto, cuenta, 404 y pie. Mismo ritmo y curva que el inicio, **sin desenfoque** (pedido anterior), escalonado 80 ms por orden de pantalla; al terminar se sacan las marcas (no pisa hover). Red de seguridad: nada queda escondido (revisión al scrollear, cada 0,7 s y a los 3,5 s). Verificado en Chrome real a 1440 y 390 px en 9 tipos de página: 0 piezas escondidas al final, sin scroll horizontal, sin errores JS. Respaldo: `respaldos/2026-11-12-antes-de-animaciones/`. Local, sin subir.

---

# Segundo relevamiento (2026-11-12, noche)
Rehecho desde cero para ver si faltaba algo. Fuentes: las plantillas de Lima (`templates/` y los ~160 snipplets), las opciones del
admin del tema (`config/settings.txt`), el HTML real (meta, scripts de terceros, sellos), el sitemap (5 páginas + `/productos/` + 21
categorías + 1.131 productos) y capturas de estados escondidos (desplegables, ventanas, foto ampliada, variantes de color).

## Hecho en esta revisión
92. [x] **Páginas internas** (`static/panthera/paginas.css` y `paginas.js`, aparte de marca.* para no chocar con otra sesión): títulos de
    página en MAYÚSCULAS al tamaño de "INICIAR SESIÓN" (carrito, búsqueda, categorías, 404…; no el inicio ni la ficha), "Botón de
    arrepentimiento" como título de esa página, WhatsApp de Contacto formateado, "Novedades" entero en celular, pie de celular (aire
    debajo de Contacto y redes sin recuadro gris), 404 con los sugeridos en tercios. "Conocenos" con el título más chico.
    Revisión automática de toda la tienda: `herramientas/revision/recorrido.mjs`; estados de la ficha: `estados-ficha.mjs`

## Piezas que existen y todavía no tienen el diseño nuevo
93. [x] **Ficha → "Medios de envío"** con un código postal calculado: viñetas comunes, "Envío a domicilio" / "Retirar por" en gris
    chiquito, precios con centavos ($9.900,00), "Gratis" sin destacar, "Cambiar CP" y "Ver más opciones de retiro" sueltos. Pasarlo a
    filas como el resto de la ficha. La misma calculadora va en el carrito (si está prendida en el admin)
    **→ Hecho 2026-11-12: filas sin viñetas, rótulos espaciados, precios sin centavos, "Gratis" en píldora rosa, "Cambiar CP" en píldora (marca.css 29).**
94. [x] **Ficha → "Medios de pago"**: el desplegable dice "3 x $31.440,00 sin interés" (con centavos y otro formato que el precio de
    arriba) y "Ver más detalles" subrayado. La **ventana "Medios de pago"** tiene la cabecera gris de Lima, título fino, pestañas
    "Pagos personalizados 30% OFF" (dorado lleno) / "Mercado Pago", totales con centavos y "Volver al producto" subrayado. La pestaña
    de Mercado Pago (cuotas por banco y tarjeta) no se vio
    **→ Hecho 2026-11-12: "3 cuotas sin interés de $X" con el ícono de tarjeta, "30% OFF" en rosa, botón "Ver todos los medios de pago"; ventana con cabecera blanca, pestañas en píldora rosa, cajas con borde rosa y sin centavos.**
95. [x] **Ficha → foto ampliada** (al tocar la foto): se abre chica en el medio, con fondo gris y sin flechas ni contador. En la prueba
    quedó a mitad de la animación: revisarlo en Chrome normal y darle fondo claro desenfocado, flechas rosas y contador
    **→ Hecho 2026-11-12: la tienda usa Fancybox 4 (clases fancybox__*): fondo blanco desenfocado, flechas y cruz rosas, contador con la marca.**
96. [x] **Ventana "¡Descuento exclusivo!"** (venta cruzada de Tiendanube, `#js-cross-selling-modal`; se abre al agregar al carrito un
    producto con una promoción de venta cruzada en el admin). Hecha el 2026-11-12 (`paginas.css` sección 5) con la estética de la compra
    rápida: tarjeta blanca redondeada y centrada en compu (hoja de abajo en celular), cabecera espaciada, cruz rosa, foto sobre gris claro
    con la píldora del descuento, nombre en mayúsculas, precio tachado + precio exclusivo grande en rosa, talle en píldora y "Agregar al
    carrito" rosa. Queda por encima del carrito lateral. **Probada con contenido de ejemplo** (`herramientas/revision/prueba-avisos.mjs`):
    el contenido real lo arma Tiendanube y no hay ninguna promoción armada para verlo de verdad
97. [x] **Aviso "Seguí acá tu última compra"** (`.js-notification-status-page`): Lima lo ponía ADENTRO de la navbar como barra de todo el
    ancho. Hecho el 2026-11-12: `paginas.js` lo saca de la navbar y `paginas.css` (sección 6) lo muestra como píldora de vidrio flotante
    abajo al centro (en celular a la izquierda, sin tapar WhatsApp), con un paquetito rosa y la cruz. Probado inyectando el mismo marcado
    de Tiendanube (`prueba-avisos.mjs`): se ve, se cierra con la cruz y Lima recuerda no mostrarlo más. Real: solo después de una compra
98. [x] **Etiquetas de promociones** (2x1, 3x2, "% en la 2.ª unidad", de Promociones del admin): las tarjetas nuevas solo muestran el
    "-X%" de la oferta (`mvTarjeta` lee `.js-offer-label`). Si Panthera arma una promoción, su etiqueta no aparecería: leerla también y
    darle su píldora
    **→ Hecho 2026-11-12: mvTarjeta lee la etiqueta de promoción (.label-accent sin js-offer-label) y la pone en una píldora rosa intensa debajo del "-X%". Sin promoción armada para verlo de verdad.**
99. [x] **Nombres con código interno**: los productos se llaman "Nombre - 1234" (los 48 revisados). Las tarjetas lo esconden (cortan
    desde " - "), pero **la ficha** ("CASIOPEA CORAZON - 3991"), la pestaña del navegador, el buscador, el carrito, el checkout y los
    mails lo muestran. Decidir: esconderlo en todo el tema o limpiar los nombres en el admin (y pasar el número al SKU)
    **→ Tema hecho 2026-11-12: sin " - 1234" en la ficha, la pestaña, el carrito y el buscador. Checkout y mails: → Panthera (PARA-PANTHERA.md). Decidido: sí, limpiar los nombres en el admin y pasar el número al SKU.**
100. [x] **Variantes de color** (ej. Casiopea corazón: Amarillo, Rosa, Rojo…): píldoras con un punto de color, pero no dice cuál es.
    Sumar el nombre del color elegido. El punto "Rosa" es lila (#E998FF): esos colores los pone Tiendanube
    **→ Hecho 2026-11-12: "Color: Amarillo" al lado del rótulo, se actualiza al elegir.**
101. [x] **El cartel de WhatsApp tapa la columna de la ficha** en compu (medios de envío y pago, a la altura del botón). Que no se abra
    sobre la ficha o que espere, como ya hace con los armadores (`data-wa-evitar`)
    **→ Hecho 2026-11-12: la columna de la ficha lleva data-wa-evitar y el cartel vuelve a buscar qué no tapar cada vez (antes se quedaba con la lista del arranque).**
102. [x] **Verificación de Cloudflare** ("Verifique que es un ser humano", en contacto, registro y contraseña): en las capturas sale
    **oscura** (gris oscuro con letra blanca). La pone Tiendanube; probar si se le puede pedir el tema claro
    **→ Hecho 2026-11-12: se le agrega theme 'light' a turnstile.render() (marca.js, al final). Verificado con el sistema en modo oscuro.**

## Opciones del admin que agregarían piezas sin diseño
(Los ítems marcados "→ Panthera" están explicados, con los textos listos, en **PARA-PANTHERA.md**.)
103. [x] Hoy no aparecen y **no tienen diseño nuestro**; si Panthera las prende, salen con la cara de Lima. **Inicio**: testimonios,
    marcas, video, mensaje de bienvenida, banners informativos/de servicios, producto principal, categorías destacadas, módulos de
    imagen y texto, popup de newsletter, feed de Instagram. **Encabezado**: barra superior (cuenta + menú secundario), banners
    informativos, idioma/moneda. **Categorías**: imagen y descripción de la categoría (Lima pone un banner de 185 px arriba del
    listado; sirve para el ítem 87). **Listado**: "fotos en carrusel en cada producto". **Ficha**: código SKU, link a guía de talles.
    **Carrito**: monto mínimo de compra. Avisarle a Panthera o diseñarlas antes
    **→ Visto, ok.**
104. [x] **Comentarios de Facebook en la ficha: la opción está PRENDIDA** en el admin (el espacio está en la página) pero no se ve
    (0 px). Apagarla (Diseño → Detalle de producto)
    **→ Tema hecho (no ocupa lugar); decidido: apagarla en el admin → Panthera.**
105. [x] **Guía de talles** (pulseras de 17 a 20 cm, anillos): no existe. Si se hace, va como página de texto con nuestro diseño (tabla de
    medidas + cómo medir la muñeca o el dedo) y se enlaza desde la ficha con `size_guide_url`
    **→ Decidido: no hace falta.**
106. [x] **Logos de medios de pago y envío del pie**: están ocultos por el tema (`marca.css`, `.footer-payments-shipping-logos`).
    Decidir si se muestran (dan confianza), con el diseño de la marca
    **→ Hecho 2026-11-12: los logos se muestran centrados en fichas blancas (y se cargan: eran de carga diferida y su fila estaba escondida).**
107. [x] **Sellos del pie**: no hay ninguno cargado (tampoco el QR de Data Fiscal de ARCA/AFIP). Si Panthera lo agrega (Pie de
    página → sellos), darle lugar en el pie
    **→ CSS listo para cuando se carguen; → Panthera.**

## Lo que se ve fuera de la página
108. [x] **Ícono de la pestaña (favicon)**: es un símbolo viejo de 2021 (remolino con estrellas) en un rosa que no es el de la paleta.
    Hacer uno con la marca (por ejemplo la estrella o una "P" del logo en dorado #EDC45F) y subirlo en el admin. Tampoco hay ícono
    para celular (apple-touch-icon): al guardar la tienda en la pantalla de inicio del iPhone sale una captura
    **→ Hecho 2026-11-12: herramientas/iconos/genera.mjs → tienda/static/panthera/iconos/ (favicon 32/192/512 y apple-touch-icon) y layout.tpl. Subirlo también en el admin: → Panthera.**
109. [x] **Imagen al compartir un link** (WhatsApp, Instagram, Facebook): es el logo dorado sobre fondo transparente (576×231), que en
    WhatsApp se ve chico y casi no se lee. Hacer una de 1200×630 con la marca y subirla en el admin (la de cada producto es su foto)
    **→ Hecho 2026-11-12: iconos/compartir-1200x630.jpg y og:image en layout.tpl (menos en la ficha). Subirla también en el admin: → Panthera.**
110. [→ Panthera] **Texto de Google y de los links compartidos**: título "Tienda Online de PANTHERA" y la descripción automática ("Comprá
    productos de PANTHERA por internet. Tenemos aros pulseras… dijes trepadores tobilleras alhajeros collares secret…", con
    categorías que ya no están). Escribirlos en el admin (SEO)
111. [x] **Detalles del navegador** (se pueden hacer desde el tema): color del **texto seleccionado** (hoy el celeste del sistema →
    rosa); **autocompletado** de Chrome (los campos se ponen celestes al autocompletar el mail → dejar el rosa muy suave); **destello
    al tocar** en Android (rectángulo celeste/gris → transparente); `color-scheme: light` y `theme-color`, para que el modo oscuro
    forzado de algunos celulares no invierta los colores y la barra del navegador acompañe
    **→ Hecho 2026-11-12: selección rosa, autocompletado rosa suave, sin destello al tocar, color-scheme light y theme-color (marca.css 29 + layout.tpl).**
112. [x] "creado con Tiendanube" en el pie: se puede sacar solo en algunos planes. Ver el de Panthera
    **→ Decidido: se deja.**

## Datos que no coinciden (contenido, para Panthera)
113. [→ Panthera] **Envío gratis**: la franja y la ficha dicen "a partir de $150.000", pero el medio de envío dice "Envíos sin cargo solo en
    Bahía Blanca compras mayores a $90.000". Unificar
    **→ Decidido: $150.000. Se corrige en el admin el texto de $90.000.**
114. [→ Panthera] **Dirección del local**: el punto de retiro de Tiendanube dice "Bahía Blanca Plaza Shopping - **Sarmiento 2153**, Palos
    Verdes", y Contacto, "Conocenos" y el pie dicen "**Av. Alberto Pedro Cabrera 2153**". Confirmar cuál va (ver CLAUDE.md, "Conocenos")
    **→ Decidido: Av. Alberto Pedro Cabrera 2153. Se corrige el punto de retiro en el admin.**
115. [→ Panthera] Textos de los medios de envío sin tildes ("Envios a todo el pais"): corregirlos en el admin

## Sigue sin verse (ya anotado arriba)
Carrito con productos, cupón, calculadora y retiro (53, 79) · cuenta con sesión iniciada (61) · página con contraseña (62) ·
checkout, "gracias por tu compra" y seguimiento del pedido (75) · "Sin stock" en un producto agotado (77) · "Ver más productos" (70) ·
mensajes de error y de formularios enviados (69) · franja blanca bajo el pie en páginas cortas (72)
**→ Visto el 2026-11-13 (revisión de abajo):** carrito con producto (página y lateral, compu y celu), calculadora de envío con CP y con CP
inválido, "Ver más productos" (49 → 97 tarjetas), error del login, pestaña Mercado Pago y franja bajo el pie (no hay: el pie llega abajo).
Siguen sin verse: cupón, cuenta con sesión, checkout con el .tpl publicado, "Sin stock" real.

# Revisión ítem por ítem 46–115 (2026-11-13)
Pedido: *"analizá con detenimiento todo en pendientes del 46 al 115 y vé viéndolo en la página … una foto de cada uno guardada en una
carpeta"*. Script: `herramientas/revision/items-46-115.mjs <carpeta> [números]` (Chrome real, compu 1440 y celu 390; agrega UN charm al
carrito de la sesión de prueba y lo vacía al final). Fotos: **`revision-pendientes-46-115/`** (una o más por ítem, nombre = número;
`_informe.txt` con lo medido). Ítems que no son una pieza de la página (75 .tpl, 76, 103, 105, 110) llevan una ficha con lo verificado.
Arreglos hechos en esta revisión (casi todos en `paginas.css` sección 7 y `paginas.js` 4–5; local, sin subir):
116. [x] (46) Hero: en pantallas donde el video entra entero (1440×900, 1920×1080) se veía la marca de agua "KlingAI 4.0": video agrandado 16 % desde arriba a la izquierda (marca.css)
117. [x] (48, 66) "Collares" duplicado seguía en el submenú "Todos los productos" y en el panel de Filtros: el arreglo no veía los links con `?sort_by=` (marca.js `arreglaMenu`)
118. [x] (49) Buscador en iPhone: la lupa rosa quedaba afuera de la píldora (Lima achica los campos al 75 % en iOS); y sugerencias sin ",00"
119. [x] (50) Celular: 54 px entre el título del listado y "Novedades / Filtrar" → ~22
120. [x] (51) "Te va a interesar": nombre y estrellas lado a lado (el nombre se partía en 3–4 renglones) → igual que los listados
121. [x] (52) Descripciones simples: "✦ Calidad y estilo… ✦" sin los ✦ y como frase gris
122. [x] (53/79) Carrito con productos: sin ",00" y sin el "tachado + -20%" repetido dos veces por producto (página y carrito lateral)
123. [x] (55, 58) "Quizás te interesen…" (404 y búsqueda vacía) en MAYÚSCULAS como los demás títulos de sección
124. [x] (56) Contacto: una fila por local ("Bahía Blanca · Av. Alberto Pedro Cabrera 2153" / "Monte Hermoso · Dorrego 286"), antes las dos pegadas; teléfono al mismo tamaño
125. [x] (57) Envíos con la misma disposición que Cuidados y Política (título arriba + foto de pulseras | fichas); antes media pantalla vacía (marca.js `conFoto`)
126. [x] (66) "FILTROS" alineado con la cruz rosa
127. [x] (69) Error de los formularios de la cuenta ("Estos datos no son correctos…") salía en el rojo de Lima → tarjeta gris de los avisos
128. [x] (70, 93, 94) Botones rosas con letra blanca → negra, como los demás: "Ver más productos", "OK" del envío, pestaña elegida y "Volver al producto" de Medios de pago
129. [x] (75) checkout.scss.tpl: el verde de Lima (#aac67b) de la cabecera en celular → rosa suave. Los rojos de los errores de pago ($base-red, .alert-danger-bagged, .general-error) también → gris #4D4D4D con borde rosa (pedido del usuario 2026-11-13: "75 si, modificalos"); respaldo en respaldos/checkout.scss.tpl.2026-11-13-antes-de-rojos
130. [x] (77) Filtro de precio aplicado con puntos de miles ("$999.999 a $9.999.999")
131. [x] (80/91) Al entrar a un listado el título se veía en minúsculas y más grande mientras animaba y después saltaba a MAYÚSCULAS (la regla excluía la clase `pnt-an-in`)
132. [x] (87) Página de Ofertas: 4 por fila, sin espacio entre columnas ni filas (sus tarjetas van en `.pnt-ofertas-grilla`) → 5 por fila como los listados
133. [x] (93) Horario del punto de retiro con sangría de lista → alineado
134. [x] (95) Foto ampliada: las flechas eran de Lima, blancas sobre blanco (invisibles) → círculos rosas
135. [x] (106) Celular: logos del pie 7 + 7 + 1 suelto → 5 por fila
136. [x] (109) Imagen para compartir: el logo en el dorado del sitio (#EDC45F, con máscara) en vez de la foto original más pálida (`herramientas/iconos/genera.mjs`)
137. [ ] (93/113) La opción "Envíos sin cargo … mayores a $90.000" llega de Tiendanube sin precio ni "Gratis": se arregla con el texto del admin (113)


# Revisión a fondo 46–115, segunda vuelta (2026-11-13): probando cada cosa en compu y celular
Pruebas: `herramientas/revision/pruebas-46-115.mjs <carpeta> <grupos>` (menu, buscador, listado, ficha, carrito, contacto, textos, cuenta,
cookies, whatsapp, pie, ofertas, enlaces, paginas, anchos, animaciones; correr DE A UNO: la máquina se queda sin memoria). Fotos y
`_pruebas.txt` en `revision-46-115-a-fondo/`. Arreglos (paginas.css sección 8 y paginas.js 6–8, local, sin subir):
138. [x] Escape cierra menú, buscador, filtros y la ventana de medios de pago (Lima no lo hacía)
139. [x] Cartel de WhatsApp: no aparece detrás de ventanas abiertas ni encima del desplegable "Ordenar" (tapaba "Menor precio" y abría
     WhatsApp), de las flechas de reseñas / "Te va a interesar" / "Cómo cuidar" ni del resumen del carrito; en celular el botón ya abre el chat con el saludo
140. [x] Ficha: modelo agotado → "Sin stock" gris (era rosa); sin "0 en stock" ni "1 en stock" repetido con "¡es el último!"
141. [x] Ficha: línea de "Medios de envío" pareja; "OK" del envío con letra negra; en celular desplegables y campo del CP alineados
142. [x] Nombres de tarjetas en 2 renglones como máximo con "…" (las filas quedaban desparejas) y nombre entero al pasar el mouse
143. [x] Carrito (página y lateral): calculadora igual a la de la ficha, circulito rosa en la opción de envío elegida (antes no se veía cuál),
     totales sin espacio ("$ 134.940" → "$134.940"); ventana de medios de pago igual ("$ 36.400")
144. [x] Filtros: títulos parejos (Categorías, Color, Talle, Modelo, Precio)
145. [x] Contacto, arrepentimiento, newsletter, Crear cuenta y Olvidé mi contraseña: campos obligatorios (no se mandan vacíos)
146. [x] Letra de 10 px en celular para "AÑOS", "Ahorrás" y "Dentro del shopping"
147. [x] Cinta "Hasta 50% off" del cartel en celular: de 6,5 a 8 px (lo máximo que entra), con la cinta un poco más adentro de la esquina
148. [x] Pestañas del navegador parejas: sin "- 4034" aunque el producto tenga título SEO propio; páginas de texto y "Cambiar contraseña"
     como "Nombre - PANTHERA" (lo que lee Google sigue saliendo del admin: ítem 110)
149. [x] "¡No te lo pierdas, es el último!" rosa también en los productos sin talles/modelos (salía gris oscuro)
150. [x] Verificado en esta vuelta (compu y celular, con clics reales): menú y sus 3 niveles, buscador, orden y filtros, "Ver más", ficha
     completa (miniaturas, modelos, agotado, cantidad, desplegables, pagos, envío con CP bueno/malo/"Cambiar CP", foto ampliada, reseñas,
     "Te va a interesar"), carrito (lateral y página: agregar, +, −, borrar, envío, opción de envío, vaciado), contacto, textos, 404, cuenta,
     cookies, WhatsApp, pie (links y redes: Facebook, Instagram, TikTok y Pinterest abren), Ofertas, 103 links internos, 19 páginas sin
     errores ni imágenes rotas, sin desborde en 320–1920 px, animaciones que terminan de aparecer, avisos 96/97 y sin la palabra prohibida.

# Revisión responsive y de clics en todos los tamaños (2026-11-14)
Diez anchos (320, 375, 414, 600, 768, 1024, 1180, 1366, 1536, 1920) con detectores automáticos (`herramientas/revision/responsive.mjs` +
`hojas.py`) y pruebas de clics también en laptop 1366×657, tablet parada y acostada y celular acostado (`pruebas-46-115.mjs`, `MODOS=`).
Fotos, hojas y resultados en `revision-responsive/` (lista completa en `revision-responsive/_hallazgos.md`). Arreglos en paginas.css 9,
paginas.js 7e, 9 y 10, y al final de armar3d.css / oreja3d.css.
151. [x] Logo del pie gigante (~700 px) entre 1024 y 1100 px (iPad acostado, compus chicas) → mismo tope de 340 px que en tablet
152. [x] iPhone: el campo del newsletter quedaba al 75 % del ancho, con letra de 10,5 px, y Safari hacía zoom al tocarlo → 16 px, entero
153. [x] Tablet parada (768–1023): pie en 4 columnas con el newsletter de 139 px → newsletter arriba a todo el ancho y 3 columnas abajo
154. [x] Carruseles del inicio: nombres de 3 renglones en tablet corrían el precio → 2 renglones con "…" (nombre entero con el mouse)
155. [x] Menos de 360 px: "Más vendido ★" y "-20%" se pisaban 19 px → el "-20%" va abajo del sello
156. [x] Menos de 360 px: "Pulseras"/"Charms" de los banners se salían 4 px; "Ver todas", "Ir a Instagram" y "AGREGAR AL CARRITO" de los
     dos armadores en 2 renglones → todo en 1 (oreja3d.css se genera con construye_tienda.py: si se regenera, repetir su última regla)
157. [x] Cartel de WhatsApp: "En línea" 9,5 px y la hora 8,5 px → 10,5 y 10 px
158. [x] "Mundo Disney" en celular: la tira corre sola y sus fotos se pedían recién al entrar en pantalla (cuadros grises) → se piden
     todas cuando la sección se acerca
159. [x] La tarjeta roja "Ofertas · Hasta −20% · Ver todas" llevaba a "Todos los productos" → a Ofertas (mismo link que el botón del cartel)
160. [x] Notebook 1366×657: el cartel de WhatsApp tapaba los puntitos de "Los más elegidos" (el toque le llegaba al cartel) → espera
     escondido también sobre los puntitos, los "Ver todos" de los carruseles y "Ver toda la colección"; y sobre "Ordenar"/"Filtrar" de
     los listados (en esa notebook tapaba "Ordenar" de Ofertas y no se podía ordenar)
161. [ ] Para Panthera: "Los más elegidos" tiene solo 3 productos destacados (en compu, con 4 por vista, se ve uno repetido): marcar más
162. [x] Lupa entre 768 y 1023 px (celular acostado, iPad parado de 820/834 px): Lima, si la pantalla mide más de 768 px, le saca a la
     lupa la apertura del panel y despliega su buscador flotante de compu → aparecía un campo blanco suelto encima de la barra, sin
     sugerencias ni forma de cerrarlo, y el panel no se abría (a 768 justo sí abría, pero el foco iba al campo flotante). Ahora la lupa
     abre el panel con el campo listo para escribir, como en el celular y como la pastilla de compu (paginas.js 11)
163. [x] Celular acostado (pantallas de menos de 500 px de alto): el botón de WhatsApp (62 px) tapaba "Filtrar", el aviso de cookies
     ocupaba casi un tercio de la pantalla y los listados arrancaban a la mitad (72 px de aire bajo la barra) → botón de 48 px, aviso en
     una fila de 54 px y 22 px de aire (en celular parado, tablet y compu queda todo como estaba)
164. [x] Ficha en tablet parada (768–991): la columna de compra quedaba de ~230 px (nombre en 5 renglones, modelos de a uno, descripción
     de ~20 letras por renglón, "AGREGAR AL CARRITO" partido) → foto y compra mitad y mitad, y el botón en una línea
165. [x] Carrito (página) de 768 a 1199 px: el precio unitario quedaba ENCIMA del "+" de la cantidad (al tocarlo no sumaba; el tachito
     también fallaba) y en tablet parada "Medios de envío" quedaba en una columna de 170 px → sin la columna de precio unitario ni la
     cabecera, cantidad con su ancho y precio al lado; en tablet parada todo en una columna como en el celular
166. [x] Celular acostado: la franja rosa y la isla tapaban el 29 % de la pantalla todo el tiempo → al bajar la franja se va para arriba y
     la isla sube y se achica (16 %); arriba de todo queda como siempre
167. [x] Al girar el celular (abierto acostado y puesto parado), cada scroll en un listado tiraba "offsetCategories is not defined" (error de
     Lima: la define solo si la página se cargó con menos de 768 px) → función vacía de respaldo (paginas.js 12)
168. [x] Letra mínima de 10 px en todos los tamaños (2026-11-14): tarjetas de los dos armadores (nombre 9,5, "Con transferencia" y
     "Última" 7,5, "-20%" a 8, stock del talle 9,5, "1.er arito" 8,5, cabecera del total 9,5), y en tablet/compu "Más vendido" (8,1),
     "Ahorrás" (8,5–9,1) y "Con transferencia" de las grillas de 5 (8,5; sigue en un renglón desde 1280 px) y los datos de "Conocenos" a 320 px (9,5). Reglas al final de
     armar3d.css / oreja3d.css (repetirlas si se regenera oreja3d.css) y de paginas.css. Queda a propósito: la cinta "Hasta 50% off"
     del cartel (8–8,7 px; más grande no entra). "NUEVA COLECCIÓN encima de Disney" del detector es falso: no se tocan en la foto.
169. [x] Revisión final de anchos (2026-11-14), las 27 páginas en 10 anchos + celular acostado (`revision-responsive/final2/`): arreglados
     "VER TODOS LOS PRODUCTOS" partido a 320 px (búsqueda vacía, paginas.css) y el " - 3293" en el producto de las reseñas (marca.js).
     Falsos avisos del detector (vistos en la foto): "404" sobre el título, "NUEVA COLECCIÓN" sobre "Disney", la inicial de la reseña
     (tarjetas escondidas del carrusel). Fotos borrosas = fotos chicas de la tienda (para Panthera). La ficha de prueba
     `/productos/anillo-flowers/` ya no existe (da 404): cambiarla en responsive.mjs si se quiere esa ficha.
170. [x] Pruebas de los armadores: pulsera 21/21 y aritos 8/8. Se actualizó la prueba vieja "lleva a /comprar/" → "abre el carrito lateral".

# Para hacer luego (anotado a pedido del usuario, 2026-11-14)
171. [x] (2026-11-14, `herramientas/armador/sincroniza_charms.mjs`) Automatizar la carga de charms nuevos en "Armá tu pulsera": un script que lea la categoría Charms/Dijes de la tienda, recorte
     la foto (recorte.py v3: HD, relieve y contorno) y prepare los datos de `armar.tpl`, y ver si precios y stock pueden leerse en vivo (ítem 34b)
172. [ ] (2026-11-14: en curso, ver 180) Rendimiento del inicio en celular: con la CPU emulada 4× más lenta va a ~20 fps a un tercio de la página. Medir qué sección pesa
     (carruseles, videos, intro, los dos 3D) y aliviarla; después confirmarlo en un celular real (ítems 41 y 44)
173. [x] (2026-11-14, con respaldo de jsDelivr) Alojar three.js (0.187.0) dentro de la tienda (`static/panthera/`) en vez de pedirlo a jsDelivr, así el 3D no depende de un
     servidor externo (ítem 38)
174. [x] Realismo de los dos armadores (2026-11-14, ver CLAUDE.md "Realismo de los dos armadores"): aritos a escala real y con el tono de
     su foto, 3D pegado en celular, sombra bajo la pulsera, charm que entra por el cierre y se desliza, giro que queda donde se suelta,
     arito que llega de frente, escenario más ancho, encuadre de la oreja sin el total encima. Pruebas: pulsera 21/21, aritos 8/8.
175. [x] Vista previa: la página se recargaba sola al pedir cada archivo por primera vez (Windows avisa "cambió" al leer). Arreglado.
176. [ ] Realismo (2.ª vuelta hecha: charm que no se da vuelta al enhebrarse, aros afilados y más finos), lo que queda: (a) una muñeca o exhibidor para la pulsera (hace falta una foto o modelo); (b) fotos en alta de Panthera
     para dijes y charms; (c) que Panthera confirme las medidas reales de las argollas (hoy 1,2 cm como tope, estimado); (d) probarlo
     en un celular de verdad (el pegado y la fluidez); (e) si se regenera oreja3d-escena.js/.css con construye_tienda.py, repetir los parches.
177. [x] Enhebrado de los 62 charms revisado uno por uno en la pulsera (2026-11-15; 20 cuentas + 42 colgantes, fotos en
     `herramientas/armador/pruebas/capturas/enhebrado/r14c|r14d|r14e`): todos bien; el único mal era "Home happy place" (corregido a mano).
178. [x] Lentitud / "se ve blanco al bajar" (2026-11-14): video del cartel de 13,6 a 3,1 MB, entradas al bajar más tempranas y más rápidas. La causa
     principal en la compu del usuario es la memoria (2 GB libres de 14). Falta medirlo en un celular real.

179. [ ] **Aros de par en "Armá tu oreja"** (decisión del usuario 2026-11-14): los 33 aros que se venden de a par se suman como UNA pieza en
     la oreja (el otro va del otro lado), con un cartel que diga que es un **par y vienen 2**; el precio es el del par (lo que cobra la
     tienda). Falta: recortar las fotos (herramientas/oreja), cargarlos en oreja.tpl y mostrar el cartel en tarjeta, lupa, lista y total.
180. [ ] Rendimiento del inicio (2026-11-14): hecho el video del cartel (3,1 MB y 0,7 MB en celular), vigías de scroll limitados, animaciones infinitas
     fuera de pantalla pausadas, pulso de WhatsApp y luz de botones sin box-shadow/left, caché por ETag en la vista previa (antes `no-store`).
     Con el procesador 4× más lento: trabajo del hilo principal de ~20 a ~16 s y de 33 a ~42 cuadros/s. Falta: bajar el recálculo de estilos
     (hoja de ~310 KB y ~17.000 nodos), peso de los carruseles y del 3D al arrancar; medir en un celular real.
181. [ ] Rendimiento, lo que sigue (2026-11-15). Real (Chrome con ventana, compu): scroll ~45 cuadros/s; carga con 13 tareas largas = 2,8 s. Culpable de la carga:
     Swiper `updateSlides` (1,3–1,7 s, en `mvCarrusel`, marca.js ~1128) + `mvAlinear`/`abajo` (~0,5 s): cada `css()` fuerza un recálculo de ~5.700 elementos
     (49 veces). Ideas: armar los carruseles de a uno cuando se acercan (IntersectionObserver) o en reposo, y leer todo antes de escribir. Herramientas:
     herramientas/revision/{scroll-real,traza-carga,traza-inicio,rendimiento-inicio}.mjs. Hecho hoy: getBoundingClientRect de 10 s a 1 s (WhatsApp `tapa`, `mostrar`, nav, parallax).
182. [x] Hero de celular (2026-11-15): sin la foto de abajo, video vertical de Kling (hero/video-hero-m.mp4, sin marca de agua), a pantalla completa y sin parallax.

183. [x] (2026-11-15) Causa real de la lentitud: `body:has(...)` (2 reglas) recalculaba los estilos de toda la página en cada cuadro → reemplazadas por clases en <html>.
     Tramo del hero 35 → 58 fps, página entera 58 fps, carga con 0,66 s de tareas largas. 181 queda casi resuelto (revisar en un celular real).
184. [x] (2026-11-15) Banners de categorías sin animación de entrada; botón del hero "Ver ofertas"; hero de celular a pantalla completa (100dvh); pulsera y oreja más cerca en celular.

185. [x] (2026-11-15) Carga sin saltos y fotos a tiempo (ver CLAUDE.md "Carga sin saltos"): CLS del inicio 0,13 → 0, de la ficha 0,034 → 0, del celular 0,08 → ≤ 0,015;
     fotos de productos pedidas a 1,5 pantallas (la tienda las pedía ya adentro); banners de 1,85 a 0,77 MB; el 3D aparece al entrar; hero de iPhone a pantalla completa.
186. [ ] Mirar en el iPhone (con la vista previa por la red local) que el hero llegue hasta abajo detrás de la barra de Safari y que el cartel no quede tapado.

187. [x] (2026-11-15) Vista previa con 502 ("No se pudo traer la página de Tiendanube"): reintentos y página que se recarga sola (tienda-local.mjs).
188. [x] (2026-11-15) Celular: la pulsera apenas más abajo en el 3D (0,14 → 0,12).
189. [x] (2026-11-15) Celular: "Seguir en Instagram | Seguir en TikTok" en una fila.
190. [x] (2026-11-15) Celular: carruseles del inicio con 1 tarjeta por fila mientras cargaba (celular lento) → createSwiper de Lima atajado + tamaño final por CSS.
191. [x] (2026-11-15) Armá tu pulsera en celular: "Deslizá" junto a "Filtrar" y junto a "La pulsera" (la lista de pulseras pasa a ser una tira).
192. [x] (2026-11-15) Ofertas en celular: aire entre la franja SALE y el botón.
193. [x] (2026-11-15) Listados en celular: un solo botón "Filtrar" a la derecha, con "Ordenar por" adentro del panel.
194. [x] (2026-11-15) Hero: la sección siguiente sube tapándolo también en celular (como BS23); el video se frena tapado.
195. [x] (2026-11-15) Botones con fondo rosa: letra blanca en toda la tienda (cambia la convención del 2026-11-13).
196. [x] (2026-11-15) Celular: banners de categorías con la mitad de espacio en blanco y fotos más grandes.
197. [x] ¿La cinta "Hasta 50% off" del cartel (rosa con letra negra, no es un botón) también con letra blanca? → Sí, ya está blanca (paginas.css 17 b).
198. [ ] "Seguinos en redes": en los videos de los celulares se ve la marca de agua "KlingAI 4.0" abajo a la derecha (visto en celular el 2026-11-15).
199. [x] (2026-11-15) Carrito (lateral y página): "Te faltan $X para tener envío gratis" + "Envío gratis en compras desde $150.000".
200. [x] (2026-11-15) Armadores: lo sin stock no aparece (charms, pulseras, aritos); stock actualizado; pulsera de entrada con Painter y Stitch; póster nuevo.
201. [x] (2026-11-15) Checkout: botones y etiquetas rosas con letra blanca y tokens con la paleta (checkout.scss.tpl, solo se ve al publicar).
202. [ ] Cartel del hero: dice "Hasta 50% off" escrito a mano, pero hoy el descuento máximo en el inicio es 20% (también en "No los dejes escapar").
     Corregirlo o calcularlo de los productos (como la franja SALE de Ofertas) antes de publicar.
203. [ ] Envío gratis desde $150.000: (leído con el MCP el 2026-11-16) lo hacen métodos de envío "sin cargo" (por eso Lima no muestra su barra), no una
     promoción. Uno se llama "Envíos sin cargo solo en Bahía Blanca compras mayores a $90.000" (con $126.480 en Bahía Blanca no apareció: el monto real
     sería otro): corregir el nombre y confirmar los montos en el panel. Hay una promoción vieja de envío gratis con mínimo $8.000, no activa: borrarla.
204. [ ] Sello "Más vendido ★": lo llevan TODAS las tarjetas de "Los más elegidos" (los destacados que se eligen en el panel), no sale de ventas reales.
     Hoy son 3 (Jazmín, The Moon, Broche Mickey y Minnie) y ninguno está entre los más vendidos con stock (MCP, 2026-11-16): Princesa Cenicienta,
     Baby boy, Baby girl, Luciérnaga Especial, Valija rosa, Adventure, Estrellita rose, Aro cuernito green, Stitch… Elegir 6 o más de esos en el panel
     (Diseño → Organizar productos → destacados): el carrusel deja de repetir tarjetas (marca.js repite solo con menos de 6) y el sello pasa a ser cierto.
205. [ ] Cuotas: la barra de anuncios y el cartel de WhatsApp dicen "3 y 6 cuotas sin interés"; las tarjetas de los armadores, "3 cuotas" (dato
     de los productos). Confirmar con Panthera cuál es la real.
206. [ ] Antes de subir: re-sincronizar el stock de los armadores (charms con sincroniza_charms.mjs; pulseras y aritos a mano) y bajar un respaldo nuevo
     (`npm run bajar`): el de tienda-original-ftp-2026-11-08 es de hace una semana.
207. [ ] "Seguinos en redes", "Conocenos" y los bloques de los listados usan videos hechos con Kling (IA); confirmar que el plan de Kling permita uso comercial.
208. [x] (2026-11-16) Siempre 3 charms y 2 aritos de entrada: los que se agotan se reemplazan solos (mismo tema, el de más stock); póster nuevo
     (Painter, Mickey y Minnie reversible, Stitch) y el póster viejo no se muestra si la combinación de entrada cambió.
209. [~] (2026-11-16: creada OCULTA con Silver Flower y el código listo; falta hacerla visible) Categoría "Ofertas" real (en vez de la página armada con código): crearla OCULTA (la dirección anda; no sale en el menú de la tienda de
     hoy) con los productos de "No los dejes escapar"; al subir el tema, apuntar `OFERTAS_URL` y el botón del hero a ella, borrar el armado de marca.js y
     mostrarla en el menú. No puede ser "todo lo que tiene descuento": los 1.130 productos visibles tienen precio promocional. Necesita el OK de
     Panthera (se puede hacer con el MCP). Ya existe una categoría oculta con un nombre raro ("Aros Pulseras … SECRET SALE"): renombrarla o borrarla en el panel.
210. [x] (2026-11-16) "No los dejes escapar" ya no repite tarjetas y muestra los productos de la categoría Ofertas (cuando sea visible).
211. [ ] Punto de retiro: los dos dicen "Sarmiento 2153" (panel → Envíos → puntos de retiro); la dirección confirmada es Av. Alberto Pedro Cabrera 2153.
212. [ ] Categorías repetidas: "Collares" y "Collares y Colgantes" (marca.js saca la repetida del menú); "Crealo vos misma" del menú apunta a "Dijes
     gold para cadenas" (marca.js lo desvía al armador): en el panel (Navegación) se puede apuntar a /#armar-pulsera y borrar el desvío.
213. [ ] Hacer VISIBLE la categoría Ofertas (oculta, Tiendanube no muestra su página): panel → Productos → Categorías, o permitirlo en el MCP.
214. [ ] "Los más elegidos": marcar 7 destacados más en el panel (lista en CLAUDE.md, "Ofertas = la categoría…"). El Chrome no tenía la sesión de Tiendanube.
215. [x] (2026-11-16) Carruseles del inicio sin tarjetas repetidas; con pocas avanzan y vuelven al principio; si entran todas, quietos y sin "Deslizá".
