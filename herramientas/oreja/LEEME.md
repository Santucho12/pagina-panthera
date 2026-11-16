# Armá tu oreja — 3D (2026-11-11)

Idea n.º 18 de las 25 secciones nuevas del inicio. Funciona como "Armá tu pulsera": misma interfaz (tarjetas, lupa, toasts con
"Deshacer", arrastrar, total con transferencia y cuotas, barra fija en el celular) y el mismo motor 3D (PMREM, foto + canto de cada
pieza con volumen, resortes, póster). Lo propio de la oreja: "¿Cuántos agujeros tenés?" (1, 2 o 3 en el lóbulo) + el ear cuff (sin
perforación, sobre el hélix), y "Tu combinación" por agujero.

- **Está en la tienda LOCAL** (desde 2026-11-11, pedido del usuario: "subámosla a localhost, no por FTP"): sección del inicio
  justo debajo de "Armá tu pulsera" (pedido del usuario). **No subida.** Ver "En la tienda" más abajo.
- También es un **artefacto** (prototipo): el enlace está en `PENDIENTES.md` (ítem 42). Si se cambia de cuenta con `/login`, el
  artefacto de la otra cuenta deja de estar disponible y hay que publicar uno nuevo.
- El mismo `oreja.js` sirve para los dos: con `data-carrito` (la tienda) el carrito es real (un POST a `/comprar/` por aro); sin él
  (el prototipo), se simula.
- Datos (ids, variantes, precios, stock) de la tienda real al 2026-11-11, escritos a mano (`construye.py` → `artefacto/index.html`;
  en la tienda, `oreja.tpl`).
- Piezas: los aros solitarios de la tienda + los 2 ear cuffs (40 + 2 hasta el 2026-11-11; el 2026-11-12 se sumaron los que
  faltaban, pedido del usuario: "hacé lo mismo con los aritos"). Temas: Disney, Cielo, Brillos, Clásicos, Plateados, Ear cuffs.
  No está "argollita silver and crystal - 1108": su foto es una cajita con varios aros y no se puede recortar uno solo.
  **Estado al 2026-11-12: 68 aros + 2 cuffs en la tienda local.** Se sumaron 28 solitarios (apo2, chag, cdos, anci, cueb, cueg, avio, arsk,
  vele, cact, casi, chai, chan, coco, coh2, emoj, emot, espi, gall, garf, icec, luci, mont, perc, rato, sat2, swhi, tene). Afuera quedaron
  Bestia (best), Compromiso (comp), Minnie chain (mchi) y Bright (brig): el recorte salió mal o pierde partes (hay que recortarlos a mano o
  pedir mejores fotos). **Los 33 PARES de la tienda (argollitas corazón, forever silver, infladas…) no están**: se venden de a dos; falta
  decidir cómo se cargan (un par en un agujero, con su precio de par).
  Receta usada para sumar: `SELECCION` (recorta_aros.py) y `NOMBRES`/`SELECCION_NOMBRE` (construye.py) → `python recorta_aros.py k1,k2` →
  `limpia_aros.py k` si queda la varilla del exhibidor (`FINO=30` para apo2) → bajar las fotos de 640 a `f640/NN.webp` (NN = posición en
  aros.json, solo los de tipo `estudio`) → `python mide640.py && python mide_argollas.py` → revisar los cortes (`argollas-a-mano.json`: `abajo`/`corte`
  y `metal`; `PAVE` en mide_argollas.py) → los de foto puesta (`oreja`) llevan `ALTO_A_MANO` (alto = 1,15 / alto de la argolla) →
  `python construye.py && python actualiza_datos_tienda.py`. Combinaciones de prueba: `node muestra-aros.mjs "k1,k2,k3,cshi;…"`.

## En la tienda (local, 2026-11-11)
**Desde el 2026-11-12 la interfaz se retoca a mano en la tienda** (otra sesión, con el usuario: título "Armá tu combinación de
aritos", filtro como botón, "¿Cuántos aritos tenés?", desplazamiento suave de la lista, tarjetas más chicas). Para sumar o cambiar
aros, usar **`python construye.py && python actualiza_datos_tienda.py`**: solo reemplaza la lista de aros de `oreja.tpl`
(`{% set pnt_or_aros %}`) y copia las fotos y contornos que cambiaron; no toca `oreja3d.js/.css/-escena.js` ni el resto del tpl.
`construye_tienda.py` (todo de nuevo) ahora se frena si en la tienda hay cambios más nuevos que el prototipo (`--pisar` para pisar).
`python construye.py && python construye_tienda.py` escribe (y pisa):
- `tienda/snipplets/panthera/oreja.tpl`: la sección (cabecera como "Armá tu pulsera", `data-wa-evitar` para que el cartel de
  WhatsApp no se abra encima) con los datos de cada aro en un arreglo Twig editable a mano, y el componente (Shadow DOM);
- `tienda/static/panthera/oreja3d.js` (= `artefacto/oreja.js`), `oreja3d.css` (= `oreja.css`), `oreja3d-escena.js`
  (= `escena-foto.js`) y `tienda/static/panthera/oreja/` (fotos de los aros, la oreja, su máscara, pósters, contornos).
Ya registrados (no hace falta repetirlo): `tienda-local.mjs` (`SNIPPLETS` y el `<script>` de oreja3d.js) y `layouts/layout.tpl`
(el snipplet justo después de `armar.tpl` y el script en el inicio), y `.pnt-or-host` en `secciones.css`.
Prueba sobre el preview (localhost:5700, carrito interceptado): `node herramientas/oreja/pruebas/tienda.mjs <etiqueta>` (8 chequeos:
carga, ejemplo, un POST por pieza con producto y variante, ida al carrito, WhatsApp, barra del celular; capturas en compu
1440/1280/1920 y celular en `pruebas/capturas/<etiqueta>/`).

## La oreja: la foto que eligió el usuario (`fotos/oreja-ia.png`, desde 2026-11-11)
Oreja derecha de perfil, pelo castaño atrás, luz suave de frente, piel del cuello debajo del lóbulo (lugar para los dijes) y una
marquita de agujero en el lóbulo (ahí va el 1.er agujero). La mandó el usuario el 2026-11-11 (antes había pedido un prompt para
generar una con IA: `prompt-foto-oreja.md`). Va **en su orientación original**: se probó espejarla (para alejar los aros de la
tarjeta del total, que a 1280 px tapaba el del 1.er agujero) y el usuario no lo quiso ("volvela a su lugar"; `ESPEJO = False`).
En cambio, el encuadre de compu (`foco`) apunta más allá del borde derecho de la foto: la escena lo frena en el borde, así los aros
quedan lo más a la izquierda posible en cualquier ancho (probado en 1280, 1440 y 1920).
`foto_oreja.py` la prepara:
- la agranda ×2 con Real-ESRGAN (×4 y a la mitad, mezclada con un 25 % de la original agrandada común para que la piel no quede
  plástica): la oreja pasa de ~540 a ~1080 px y aguanta la lupa (la primera vez tarda ~4 min; queda en `tmp/oreja-ia-x2.png`);
- la **máscara de la oreja** (`artefacto/foto-mascara.png`): el polígono `OREJA`, marcado sobre los bordes medidos con perfiles de
  luz (el hélix contra el pelo y el borde de abajo del lóbulo contra la sombra del cuello);
- `artefacto/foto-oreja.json`: escala (la oreja mide 6,1 unidades), agujeros (a ~7 mm entre sí, a lo ancho del lóbulo), encuadres
  de compu y celular, de qué lado está la cara (`lado`), de dónde viene la luz (`luz`), el borde del hélix en el cuff
  (`bordeCuff`) y los colores de alrededor (pelo, cara, cuello) para la luz que reflejan los aros.
Para otra foto: cambiar `FOTO`, `OREJA`, `AGUJEROS`, los encuadres y `ALTO_OREJA`, y correr `python foto_oreja.py && python construye.py`.
La versión anterior (foto de Unsplash, la argolla de la foto partida al medio) quedó en `version-foto-unsplash/`.

## Realismo (2026-11-11, pedido del usuario: "los aritos se ven muy falsos... quiero que sea super realista")
En las fotos de Panthera con el aro puesto, la argolla se ve **casi de canto**: un óvalo angosto que sale del agujero y cuelga casi
entero por debajo del lóbulo; el dije cuelga de frente. En las fotos de producto la argolla se ve de 3/4, con su cara de adentro
blanca. Por eso la escena (`artefacto/escena-foto.js`) separa cada aro en dos:
- **La argolla es 3D** (un torno con perfil de huggie): `mide_argollas.py` mide en cada foto dónde termina la argolla y empieza el
  dije (`corte`), su alto (el diámetro), su grosor y el metal (oro, plata), y marca el pavé → `argollas.json` (+ correcciones a mano
  en `argollas-a-mano.json`: carroza, cohete, love; sirena y tornasol son plateados según la tienda). Hoja de control:
  `python mide_argollas.py` → `control-argollas.jpg`. Va casi de canto (`ABRE` por agujero) y **atraviesa el lóbulo**: un plano
  invisible con la forma de la oreja (la máscara) solo escribe profundidad, y tapa todo lo que queda detrás de la oreja (la mitad de
  atrás de la argolla). Debajo del borde del lóbulo se ve entera. Con pavé: piedras talla brillante por la cara de afuera.
- **El dije es la foto del producto** del cuello para abajo (la argolla de la foto se descarta en el shader y en la sombra), con
  volumen, colgando del fondo de la argolla: péndulo propio (la argolla gira poco; el dije, libre).
- **Luz de la foto**, no de estudio: entorno armado con la ventana (arriba a la izquierda), la cara, el pelo, el fondo claro y el
  cuello (colores sacados de la foto). Los dijes se igualan (menos saturación, brillos más suaves, grano de la foto).
- **Sombras suaves** (PCF; con VSM no salían): sobre la oreja (pegadas) y sobre el cuello (más atrás: corridas). El cuadro de la
  sombra se arma solo alrededor de los agujeros.
- **Ear cuffs**: el de moño (cmin) es su foto, y lo que cae fuera de la oreja (por detrás del borde) no se ve; el de cristales
  (cshi) es un anillo 3D con pavé, acostado, que abraza el borde del hélix (`CUFF_3D`).
- Sin estrellitas ni barridos de luz (solo al tocar "Agregar al carrito"). Una foto no gira: al arrastrar, los aros se hamacan.
- **Movimiento** (pulido 2026-11-11): un dije de ~2 cm colgado de una argolla oscila rápido y poco, no como un péndulo largo
  (`MOV.pendulo` 52, amortiguación 2,6); al llegar volando gira menos.
- **Más simple** (2026-11-11, como el armador de pulseras): arranca con 2 aros puestos (`EJEMPLO` en construye.py: Tres circonios
  y Moon gold), sin el cartel de "combinación de ejemplo" ni la nota fija (lo de que se venden por unidad se avisa al agregar al
  carrito); "Tu combinación" se esconde sin aros; el total de compu es compacto.

## La oreja 3D anterior (`oreja3d/`, `version-oreja-3d/`), por si sirve
Escultura en el rosa de la marca, terminación de terciopelo (como los exhibidores de aros). `oreja.py` la modela como relieve
(hélix enrollado, antihélix con sus ramas, concha, trago, antitrago, lóbulo) recortado por la silueta con bordes redondeados (SDF) →
marching cubes; guarda la sombra de los huecos (oclusión) en el 4.º byte de las normales. `SX` = ancho (1,22: "más ancha", pedido
2026-11-11) y `AGUJEROS` = dónde van los agujeros (repartidos a lo ancho del lóbulo, como en una oreja real).
```
python oreja.py vista     # vista rápida del relieve (vista.png)
python oreja.py malla     # volumen → marching cubes (crudo_*.f32/u32)
python oreja.py extra     # oclusión + agujeros.json (copiar sus valores a AG en artefacto/oreja-escena.js)
npm i meshoptimizer@0.21.0 && node simplifica.mjs 24000   # → oreja.bin (24 mil triángulos, cuantizada)
python -c "import base64;open('../artefacto/oreja-malla.txt','w').write(base64.b64encode(open('oreja.bin','rb').read()).decode())"
```
(Los artefactos no sirven `.bin`: la malla va en base64 en un `.txt`; el loader acepta los dos.)

## Los aros
Las fotos de la tienda **no tienen fondo blanco**: casi todas cuelgan de un exhibidor de acrílico sobre gris rosado, y algunas están
puestas en la oreja. `recorta_aros.py`: recorte con IA local (rembg, isnet-general-use) en dos pasadas; la segunda sobre el aro
agrandado ×4 con Real-ESRGAN (`-t 128`, desde la foto de 640) → `artefacto/aros/` (tarjetas) y `artefacto/aros-hd/` (foto HD +
relieve). `retoca.py` corta los restos del exhibidor arriba del aro dorado. `mide640.py` mide el alto en la foto original (las de
estudio tienen el mismo encuadre): `construye.py` usa eso cuando el ancho del aro de arriba se midió mal. Fotos puestas en la oreja:
el tamaño sale del alto de su argolla (`ARG_OREJA` = 1,06 en la escena, lo que mide en las cuatro primeras); a mano solo carroza,
zapato, sirena, tornasol y los cuffs (`ALTO_A_MANO`).
Si un recorte sale mal (2026-11-12):
- la IA no encuentra el aro en la foto (foto puesta, "best"): `CAJA_A_MANO` en recorta_aros.py (x0, y0, x1, y1 en fracciones);
- se pierden partes colgadas de un aro de unión muy fino ("brig", las letras BRIGHT): `SIN_ABRIR`;
- queda la varilla de acrílico del exhibidor cruzando el aro ("apo2", "brig"): `python limpia_aros.py clave1,clave2`.
`recorta_aros.py` corre con prioridad baja (si no, el navegador se pone lento mientras recorta).
```
python recorta_aros.py clave1,clave2     # ~40 s por aro (no correr con otra cosa pesada: la máquina anda justa de memoria)
python retoca.py clave1,clave2           # solo dorados de estudio
python mide640.py && python mide_argollas.py && python construye.py   # → artefacto/index.html, contornos-aros.js y _prueba.html
python control.py control.jpg 12         # hoja de control de los recortes
```
Para sumar un aro: agregarlo a `SELECCION` (recorta_aros.py) y a `NOMBRES`/`SELECCION_NOMBRE` (construye.py), y revisar su línea
en `control-argollas.jpg` (si el corte cae mal, corregirlo en `argollas-a-mano.json`).

## Pruebas (cada script levanta su propio servidor y lo cierra al terminar)
```
node prueba-unica.mjs q1 1440 900 "" lupa    # captura del escenario y de la lupa (q1 390 844 cel: celular)
node muestra-aros.mjs "plan,boli,torn,cshi"  # cambia los aros de la escena (1.º,2.º,3.º,cuff) y saca una captura por combinación
node funciones.mjs                           # 14 pruebas: agujeros, deshacer, mover, cuff, arrastrar, carrito
node poster.mjs                              # póster (compu y celular) → convertir a webp
```
Ojo con el disco: Puppeteer deja perfiles temporales en `%TEMP%\puppeteer_dev_chrome_profile-*` (el 2026-11-11 había 848 MB).
Borrarlos después de las pruebas (con Chrome de pruebas cerrado).

## Pendiente si Panthera lo quiere en la tienda
- Pasarlo a la tienda como el armador de pulseras (snipplet + Shadow DOM + three.js de jsDelivr) y el carrito real.
- Confirmar con Panthera el material de los aros (no se dice en la página), sus medidas reales (el tamaño sale de las fotos) y si
  conviene recortar los otros 33 solitarios.
- Las fotos son chicas para la lupa: se escalaron con Real-ESRGAN; mejor pedir fotos en alta.
