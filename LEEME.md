# Panthera — rediseño de la tienda Tiendanube

> ## ⛔ NO SE SUBE NADA POR FTP
> **Por ahora no se sube nada a Tiendanube.** Panthera todavía no dio el permiso para actualizar
> la tienda. Todo se trabaja y se prueba en local. **No se sube ningún cambio hasta que den el OK.**
>
> - **Regla (2026-11-09): nunca subir nada por FTP.** Antes de cualquier subida, pedir el OK y, aunque lo den,
>   volver a preguntar "¿Estás seguro? Subir sería publicarlo en la tienda real". Subir sin eso sería un error.
> - `npm run subir` está bloqueado a propósito: solo muestra este aviso.
> - **No usar** `npx tiendanube theme ftp push` ni `npx tiendanube theme ftp watch`: los dos publican
>   al instante en la tienda real (watch sube cada archivo apenas se guarda).
> - Como seguro extra, las credenciales están solo en `.ftp-panthera.nuvem` (raíz), no dentro de
>   `tienda/` ni del backup: un push escrito a mano ahí adentro falla.

## Datos
- Tienda: https://pantherajoyeria.com.ar (también pantherajoyeria.mitiendanube.com)
- Tema: **Lima** (Tiendanube)
- FTP: ftp.tiendanube.com · usuario `pantherajoyeria` (contraseña en `.ftp-panthera.nuvem`)

## Carpetas
| Carpeta | Para qué |
|---|---|
| `tienda/` | **Donde trabajamos.** El tema completo bajado por FTP (lo que algún día se va a subir). |
| `tienda/static/panthera/` | La estética nueva: `marca.css` y `marca.js`. |
| `tienda-original-ftp-2026-11-08/` | Backup intacto del tema tal como estaba publicado el 2026-11-08. No se toca. |
| `index.html`, `main.js`, `public/` | Demo de diseño previa (Vite, 2026-10-25): `npm run demo`. |

## Comandos
| Comando | Qué hace | ¿Toca la tienda? |
|---|---|---|
| `npm run dev` | La tienda real en http://localhost:5700 con nuestros archivos locales encima. Recarga sola al guardar; si cambia `tienda-local.mjs` se reinicia solo. No se cae por errores: dejalo abierto. | No |
| `npm run diferencias` | Lista qué cambiaría en la tienda si se subiera `tienda/`. | No (solo mira) |
| `npm run bajar` | Baja el tema publicado a una carpeta nueva `tienda-backup-ftp-AAAA-MM-DD`. | No (solo lee) |
| `npm run subir` | **Bloqueado** hasta tener el OK. | No |
| `npm run demo` | La demo Vite de la raíz. | No |

Si el preview muestra **"HTTP ERROR 431"**: son cookies acumuladas en "localhost" (Chrome las comparte entre todos
los proyectos y puertos). Desde el 2026-11-09 el preview acepta encabezados grandes y a la tienda le pasa solo sus
cookies, así que no debería volver a pasar; si pasa, entrar a http://localhost:5700/__limpiar-cookies (las vacía y
vuelve al inicio).

## Qué se ve en local y qué no
- **Se ve al guardar:** todo lo de `tienda/static/` (CSS, JS, imágenes, videos). `panthera/marca.css`
  va al final del `<head>` (le gana al de Lima) y `marca.js` al final del `<body>`, igual que en
  `layouts/layout.tpl`. También `snipplets/panthera/intro.tpl` y `redes.tpl`: el preview los renderiza con Twig y los pone
  donde los incluye `layout.tpl` (la intro apenas abre el `<body>`, redes antes del footer; los dos solo en el inicio). Desde el
  2026-11-10 también `armar.tpl`, `disney.tpl`, `cuidar.tpl` y `locales.tpl` (las cuatro secciones nuevas, antes de redes).
- **No se ve hasta subir:** los `.tpl` y `.scss.tpl` (layout, plantillas, snipplets, estilos de Lima),
  porque los compila Tiendanube. Mientras no haya permiso, el rediseño conviene hacerlo en
  `static/panthera/`; los cambios de `.tpl` se pueden ir preparando, pero no se pueden ver.
- Checkout y panel de admin redirigen a la tienda real (no funcionan en localhost).

## Paleta (acordada con el cliente el 2026-11-09)
| Rol | Variable | Color |
|---|---|---|
| **Principal: rosa** | `--pnt-rosa` | `#F4ACC4` |
| Rosa del hover (solo en :hover) | `--pnt-rosa-hover` | `#F29AB7` |
| **Secundario: dorado** (más intenso desde el 2026-11-09; antes `#E7CD90`) | `--pnt-dorado` | `#EEC049` |
| Dorado del hover (solo en :hover) | `--pnt-dorado-hover` | `#EAB838` |
| Dorado del logo (apenas más cerca de su dorado original `#E9CE91`) | `--pnt-dorado-logo` | `#EDC45F` |
| Dorado de las estrellas de las reseñas (apenas más cerca de `#F5B301` de BS23) | `--pnt-dorado-estrellas` | `#F0BC33` |
| Rosa del precio con transferencia de "Los más elegidos" (más intenso, para que se note) | `--pnt-rosa-precio` | `#EE779F` |
| Fondo | `--pnt-blanco` | `#FFFFFF` |
| Textos (títulos, links, íconos) | `--pnt-texto` | `#000000` negro |
| Subtítulos y detalles | `--pnt-gris` | `#4D4D4D` gris |

No se usa ningún otro color. El azul marino, el celeste y el gris de texto que tiene configurados la tienda
(Lima) se pisan en las secciones 5 y 8 de `marca.css`.

## Rediseño hecho (en local)
| Pieza | Referencia | Dónde |
|---|---|---|
| Franja de beneficios en movimiento (rosa) | indumentariasignos.com | `marca.js` (toma los textos de la barra de anuncios del admin) + `marca.css` |
| Navbar isla (ancho completo → píldora de vidrio al bajar) | indumentariasignos.com | `marca.js` + `marca.css` |
| Footer rosa con logo grande animado | bs23.mitiendanube.com | `marca.css` + `marca.js` |
| "Seguinos en redes" con historias | bs23.mitiendanube.com | `snipplets/panthera/redes.tpl` + `marca.css` + `marca.js` |
| Intro cinematográfica del inicio (velo borroso + logo que se revela) | demo de Panthera (= intro v4 de Signos) | `snipplets/panthera/intro.tpl` + `marca.js` + `marca.css` |
| Banners de categorías arriba de "Los más elegidos": Disney + Aritos, Pulseras y Charms (2 × 2), con "Ver colección →" al pasar el mouse (solo computadora) | pedido del cliente | `marca.js` (sección 7) + `marca.css` (sección 9) + fotos en `static/panthera/banners/` (Disney va con la foto sin texto, `disney.webp`, y el texto en HTML) |
| Cartel de WhatsApp (globo de chat arriba del botón, solo computadora): vidrio esmerilado, hora en los mensajes y barra "Escribí un mensaje" | indumentariasignos.com | `marca.js` (sección 5, mensajes según la página) + `marca.css` (sección 6) |
| **Tipografía**: títulos en Archivo bold apretada (toda la tienda, desde el 2026-11-10; solo el texto de los banners de categorías sigue en Libre Baskerville, la que eligió el cliente el 2026-11-09), sin punto final; todo lo demás en Outfit, la letra de las tarjetas de BS23 | pedido del cliente | `marca.css` (sección 0: `--pnt-letra`, `--pnt-titulo`, `--pnt-titulo-general`, `--pnt-fuente`) + las fuentes en `layouts/layout.tpl` |
| **Cuatro secciones nuevas del inicio** (2026-11-10), después de "No los dejes escapar": **Armá tu pulsera** (elegís talle y tildás charms; "Agregar al carrito" pone todo junto en el carrito y lleva a él; total en vivo), **Colecciones Disney** (un arco por personaje con su pieza y precio), **Cómo cuidar tu plata** (sello 925 que gira + cinco cuidados + link a la página Cuidados) y **Nuestros locales** (Bahía Blanca y Monte Hermoso con "Cómo llegar", WhatsApp e Instagram) | artefacto de ideas (A20, B2, C1+C5, D18) | `snipplets/panthera/{armar,disney,cuidar,locales}.tpl` + `static/panthera/secciones.css` y `secciones.js` |
| "LOS MÁS ELEGIDOS" como "Los más vendidos." de BS23: título grande en mayúsculas, "Deslizá para ver más →" en una línea y en gris clarito + puntitos en rosa (en celular, flecha y puntitos), tarjeta alta con sello "★ Más elegido", descuento en rosa, bolsita (el botón Comprar de Lima: agrega y lleva al carrito, porque la tienda no tiene el "carrito de compras rápidas") y precio con transferencia en rosa; estrellas doradas **DE MUESTRA** (0 a 10 opiniones por producto) que **solo aparecen en el preview local** — en la tienda real no se muestran; si Panthera instala una app de reseñas, se conectan las reales; carrusel infinito de a 4 en compu con media 5.ª asomando (tarjetas apenas más chicas que BS23; 3 en tablet, 2 en celular), que avanza solo. Con pocos productos destacados se repiten (hoy 3 × 3). Las piezas anchas (pulseras) se achican solas para entrar enteras en la foto alta. **"NO LOS DEJES ESCAPAR"** usa la misma estética y el mismo código (`MV_SECCIONES` en marca.js), sin sello (son ofertas: no sabemos si son los más vendidos) y con su "Ver todos →" como botón abajo del carrusel | bs23.mitiendanube.com (código en `../Pagina web BS23/tienda-rio`) | `marca.js` (sección 8) + `marca.css` (sección 10) |

- **Secciones nuevas del inicio: qué hay que actualizar a mano.** Los productos (ids, talles, stock, precios y fotos) de `armar.tpl` y
  `disney.tpl` están escritos en el `.tpl` al 2026-11-10: el tema no puede pedirle a la tienda "este producto" desde el inicio. Si
  cambia un precio o se agota un talle, editarlo ahí (el carrito siempre cobra el precio real; si algo no tiene stock, la sección
  avisa y agrega el resto). `locales.tpl` usa las direcciones de la página de Contacto de la tienda y **no tiene horarios ni fotos**
  (no hay datos): cuando Panthera los pase, se agregan. `cuidar.tpl` usa los consejos de la página Cuidados de la tienda.
- **"Armá tu pulsera" es un armador 3D** (desde el 2026-11-10; pulido el 2026-11-11): `armar.tpl` + `armar3d.js`/`armar3d.css`
  (interfaz, datos y carrito) + `armar3d-escena.js` (la escena; usa three.js 0.187.0 de jsDelivr, que se pide recién cuando la sección
  se acerca) + fotos en `static/panthera/arma/` (tarjetas, HD con relieve, contornos y el póster que se ve si el 3D tarda o falla).
  Cómo sumar un charm y el banco de pruebas (funciones, capturas, rendimiento…): `herramientas/armador/LEEME.md`.
- Para probar "Agregar al carrito" en el preview hace falta un navegador normal (la tienda rechaza el POST a `/comprar/` si el
  User-Agent dice "HeadlessChrome"); agrega a un carrito real y anónimo: vaciarlo después.
- **Scroll suave y pesado (Lenis)** en toda la tienda, vertical y lateral (pedido 2026-11-10): `static/panthera/lenis.min.js` + `scroll.js` (copiados de BS23). En celular queda el scroll nativo. Sobre los carruseles, el trackpad o Shift + rueda pasan de a una tarjeta. Se carga en `layout.tpl` y en el preview.
- Las animaciones corren aunque Windows tenga apagados los efectos de animación (como en Signos y BS23).
- Las imágenes de `static/panthera/redes/` son de muestra (banners y productos): cambiarlas por posteos o
  reels reales. Para usar un video en una historia, agregarle `video: 'archivo.mp4'` en `redes.tpl`.
  **El celular de "Seguinos en redes" muestra siempre el mismo video** (todos los círculos, también "Novedades"):
  `static/panthera/redes/video-redes.mp4`. Para cambiarlo, reemplazar ese archivo por un mp4 vertical de 720×1280 sin audio
  (los de Kling vienen en 1080×1920 con audio y pesan ~9 MB; se bajan con `ffmpeg -i entrada.mp4 -an -vf scale=720:1280 -r 24 -c:v libx264 -crf 24 -preset slow -movflags +faststart video-redes.mp4`).
  **El círculo "Novedades" tiene su propio video** (pedido 2026-11-11): el mismo clip recortado cuadrado (200×200, ~77 KB), **derecho**,
  solo, mudo y en bucle mientras se ve: `redes/video-redes-circulo.mp4` (+ su foto fija `video-redes-circulo.webp`, el primer cuadro). Se hizo con
  `ffmpeg -i original.mp4 -an -vf "crop=1080:1080:0:300,scale=200:200:flags=lanczos" -r 24 -c:v libx264 -crf 27 -preset slow -movflags +faststart video-redes-circulo.mp4`
  (el recorte deja afuera la marca de agua de Kling; agregando `,reverse` al filtro se reproduce al revés: se probó y el usuario se arrepintió, esa versión
  quedó en `respaldos/2026-11-11-video-redes/`). Cualquier otro círculo puede tener el suyo agregándole `video_circulo` e `img_circulo` en `redes.tpl`.
  Las versiones anteriores están en `respaldos/2026-11-11-video-redes/`.
  **La historia "Disney" tiene su propio video en el celular** (pedido 2026-11-11: el último de Descargas, el hecho en Kling con el prompt base):
  `redes/video-disney.mp4` (el aro de Minnie con un acercamiento lento; 720×1280, sin audio, ~0,6 MB; su primer cuadro es la foto del círculo,
  `historia-1.webp`). Se conecta con la clave `video` de ese círculo en `redes.tpl`; los círculos que no la tienen usan `video-redes.mp4`.
  Adentro del círculo de Disney se reproduce el mismo video en un clip de 200×200 (`video-disney-circulo.mp4`, recorte fijo cerrado sobre Minnie).
  **La historia "Aritos" también tiene su propio video** (pedido 2026-11-11, el último de Descargas): `redes/video-aritos.mp4` (oreja con tres aritos y un
  moño rosa con perla negra; 720×1280, sin audio, ~1,2 MB), con su clip de círculo `video-aritos-circulo.mp4` (200×200, ~60 KB), que **sigue al moño**
  porque se mueve de lado a lado: se hace con `python herramientas/armador/clip_circulo_sigue.py entrada.mp4 salida.mp4 --recorte 560 --y 730`
  (necesita opencv-python, numpy, scipy y ffmpeg). La foto del celular de esa historia (`historia-2.webp`) es el primer cuadro del video; la anterior quedó en
  `respaldos/2026-11-11-video-redes/historia-2-anterior.webp`. Hoy tienen video en el círculo: Disney, Novedades y Aritos; los demás círculos siguen con su foto.
- `layouts/layout.tpl` ya carga las fuentes (Outfit y Libre Baskerville), `marca.css`, `marca.js` y `redes.tpl` (preparado, sin subir).

## Cuando Panthera dé el OK (no antes)
1. Correr `npm run bajar` para tener un backup de lo publicado justo antes de subir.
2. `npm run diferencias` y revisar la lista.
3. Recién ahí armar `subir.mjs` (como el de BS23) y subir.
