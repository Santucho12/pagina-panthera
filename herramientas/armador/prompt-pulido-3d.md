# Prompt: pulido premium de "Armá tu pulsera" (armador 3D)

Quiero llevar la sección "Armá tu pulsera" del inicio a nivel de configurador de joyería de lujo: plata que brille como en una
foto de estudio, cristales que destellen, cadena y charms con detalle real y máxima nitidez, y movimientos con peso y suavidad.
Pulí la estética, el 3D, las animaciones y los movimientos, sin cambiar lo que ya aprobé (ver "Qué no se toca").

Leé completos `tienda/static/panthera/armar3d.js` (todo el 3D está en `crear3D()`: entorno, `armaCadena`, `CIERRES`, `gemas`,
destellos, `crearCharm`, `cuadro`), `armar3d.css`, `tienda/snipplets/panthera/armar.tpl` y `herramientas/armador/` (LEEME y
recorte.py). Después entrá en modo plan y mostrame el plan antes de tocar código.

## Cómo está hoy (revisado con capturas a 2×)
- Motor: three.js r128 de cdnjs, ACES, sombras PCFSoft de 2048, y los reflejos salen de un "estudio" pintado en un canvas de
  1024×512 sin HDR: los brillos nunca pasan del blanco, por eso la plata se ve gris y apagada.
- Cadena snake: 300 anillos torneados con aire entre sí → parece un resorte y hace moiré en la parte de atrás. La rígida
  (anillos superpuestos) todavía muestra rayas.
- Cristales (pavé del corazón, barril Crystal, rígida, flor): cilindros de 8 caras con material de espejo metálico → se ven como
  puntitos grises y negros (un rallador); no destellan.
- Cierre de rosa: los pétalos parecen arcilla o plástico mate.
- Charms: fotos recortadas de las de 640 px de la tienda (quedan de 81 a 471 px de ancho; `estr` y `glob`, ~135 px de alto) en
  planos sin luz (`MeshBasicMaterial`, `toneMapped: false`) con 11 a 15 capas apiladas para simular grosor → parecen stickers,
  con un contorno gris corrido de un lado, y no reaccionan a la luz al girar.
- Al lado de los charms de cuenta (ej. Mickey) se ve la cadena cortada: el hueco no coincide con la silueta.
- Sombra en el piso: un aro gris enorme y duro, con manchas de los charms, que la tarjeta del total corta.
- Brillos: confeti de estrellitas rosa/dorado/gris al cambiar la base y puntitos sueltos que sobre blanco parecen polvo.
- Al sacar un charm no se liberan sus geometrías ni materiales (pierde memoria con el uso).
- En mi PC, Windows tiene apagados los efectos de animación → Chrome pide movimiento reducido → el armador se ve casi quieto
  (salvo con `localStorage pnt-animar=1`); el resto de la tienda anima igual.

## Qué no se toca
- Disposición: a todo el ancho (20 px por lado, 10 en celular) y poca altura; en compu, 3 columnas a una sola altura (charms |
  pulsera | base, talle y combinación; los costados se desplazan por dentro), el total flotando abajo a la derecha del escenario
  y la pulsera un poco más arriba para no chocarlo; tablet y celular como están. La cabecera sigue afuera del 3D, igual a la de
  "Mundo Disney" y "Los más elegidos".
- Sin cursor propio, sin botón de pausa y sin chip de "Reducir movimiento / Ver con animaciones".
- Tarjetas y precios con la estética de "Los más elegidos" (Ahora $X con el tachado rosa, transferencia en `--pnt-rosa-precio`,
  cuotas con tarjetita, sello "Última", descuento rosa, botón negro).
- Paleta y tipografía de CLAUDE.md: la interfaz solo con los tokens `--pnt-*`; títulos en Archivo, todo lo demás en Outfit. En
  el 3D, plata, esmaltes y cristales fieles al producto real (no se pintan con la paleta); las luces, blancas y neutras, con
  como mucho un rebote rosa/dorado muy sutil como hoy.
- Funcionamiento: carrito real (un POST a `/comprar/` por producto y después al carrito), datos escritos a mano en `armar.tpl`
  (no inventes precios, stock ni fotos), Shadow DOM, three se pide recién cerca de la sección y no se dibuja fuera de pantalla,
  vitrina al cambiar la base (media vuelta + zoom al cierre), el talle cambia el radio, arrastrar charms a la pulsera, "Deshacer".
- ⛔ Nada por FTP ni por el MCP de Tiendanube (está conectado a BS23).

## Qué quiero (por área)

### 1. Motor, luz y definición
- Pasar three.js a una versión moderna fijada (hoy la última es 0.187.0) como módulo ES con `import()` dinámico desde jsDelivr
  `+esm`: el núcleo y los addons de la misma versión, así comparten una sola instancia (cdnjs tiene solo el núcleo; la CSP de
  la tienda no restringe scripts). Seguí la guía de migración (`colorSpace` en vez de `encoding`, luces en unidades físicas,
  etc.). Si no conviene, explicame por qué antes de seguir en r128.
- Entorno HDR de estudio de joyería armado en escena con PMREM: softbox arriba, tiras de luz a los costados y banderas negras
  (el contraste blanco/negro es lo que hace brillar la plata y los cristales). Compararlo con `RoomEnvironment`.
- Tone mapping: comparar Neutral (Khronos PBR Neutral, pensado para producto), AgX y el ACES actual. El fondo tiene que seguir
  blanco puro y los esmaltes fieles a las fotos.
- Antialias de verdad (MSAA o SMAA), bloom muy sutil solo en los brillos fuertes y DPR hasta 2. Ojo: el canvas es transparente
  sobre el fondo del CSS; el post-proceso tiene que respetar esa transparencia.
- Calidad adaptativa (alta / media / baja) según la GPU y los fps medidos: DPR, bloom, sombras, facetas.

### 2. Plata y cadenas
- Plata 925 pulida creíble: `MeshPhysicalMaterial`, color apenas cálido, rugosidad baja con una micro-variación para que no
  parezca de computadora, y anisotropía en la cadena (el brillo estirado a lo largo, como en las fotos).
- Snake de verdad: placas apretadas que se encastran, sin el aire oscuro del resorte; surcos finos y parejos con mapa normal y
  mipmaps para que no haga moiré. El paso de los surcos tiene que quedar igual al cambiar el talle.
- Los dos topes, fieles a las fotos de las bases (si se ven con rosca, con filete de rosca). La rígida, un tubo pulido liso,
  sin rayas.
- La cadena continua: sin cortes visibles al lado de los charms de cuenta.

### 3. Cierres (las 7 bases) y cristales
- Cada cierre reconocible al lado de su foto (`static/panthera/arma/bases/` y las fotos de 1024 px de cada producto en la
  tienda, solo como referencia): biseles redondeados que agarren la luz, esmalte con laca (clearcoat), caras pintadas a
  1024–2048 px.
- Rehacer la rosa (pétalos finos con el borde enrollado, más vueltas, sombra entre pétalos, plata pulida) y los pavé (piedras
  talla brillante engarzadas, con granitos de plata entre ellas).
- Cristales de verdad: geometría talla brillante simplificada y un material con fuego y destellos. Comparar
  `MeshPhysicalMaterial` (transmission, ior ≈ 2,15, dispersion) contra un shader de gema propio más barato y quedarse con el
  que mejor se vea a tamaño real sin bajar los fps. Los azules de la rígida, azules; los dorados de la flor, dorados.
- Destellos: en vez de confeti, pocos destellos blancos de 4 puntas que nazcan donde la luz pega de verdad (cristales y filos),
  con un bloom suave. Nada de puntitos sueltos.

### 4. Charms
- Fotos en alta: volver a recortar desde la versión de 1024 px del CDN (`…-1024-1024.webp`; la URL sale de la página de cada
  producto, `url` en `armar.tpl`). Hoy se usó la de 640. Las HD se piden recién cuando el charm entra a la pulsera; las
  tarjetas siguen con las livianas. Recalculá `asp` y `ag` si cambia el recorte y verificá que la cadena pase por el agujero.
- Estos 9 tienen la foto original chica y la de 1024 no les suma: `ange`, `bruj`, `buzz`, `cora`, `estr`, `glob`, `minn`,
  `moon` y `rued` (`moon` es uno de los tres del ejemplo). Proponeme qué hacer (pedirle fotos a Panthera o escalarlas con IA);
  preguntame antes de usar un servicio externo.
- Volumen real: en vez de las capas apiladas, una pieza extruida desde el contorno del recorte (el contorno lo calcula
  `recorte.py` y queda guardado), con canto de plata biselado y la foto adelante; sombras correctas.
- Que reaccionen a la luz sin perder la fidelidad de la foto: mapa normal (desde el contorno más el detalle de la foto) y una
  máscara de metal / esmalte, para que los brillos se muevan sobre la plata del charm cuando gira la pulsera. Bordes limpios
  (alpha to coverage), sin halos ni contornos grises.
- Actualizar `herramientas/armador/` (recorte.py y LEEME) para que sumar un charm nuevo siga siendo cuestión de minutos.
- Opcional, solo con mi OK (cuesta plata y sube fotos a un servicio externo): un piloto con 2 charms pasados a 3D con IA
  (imagen → modelo) para compararlo con lo anterior.

### 5. Escena
- Sombra de contacto suave y chica debajo de la pulsera (como el ejemplo `webgl_shadow_contact` de three) en vez del aro gris;
  que la tarjeta del total no la corte. Mostrame también una variante con piso blanco y un reflejo que se desvanece (tipo
  vidriera), y elijo.
- El fondo blanco con el halo rosa de hoy, refinado y sin bandas.

### 6. Movimiento (con peso; nada de rebote de juguete)
- Un solo lenguaje de movimiento: resortes amortiguados (críticos o casi), 0,5 a 0,9 s en la cámara, curvas suaves, todo
  definido en un solo lugar.
- Intro: mientras se dibuja la cadena, un barrido de luz recorre la plata; corta (2 s como mucho) y se corta si toco algo.
- Sumar un charm: sale de la foto de su tarjeta, viaja en arco, se enhebra deslizándose por la cadena hasta su lugar, los
  vecinos se corren con resorte, la cadena se mece apenas y un brillo recorre el charm al llegar.
- Sacar y reordenar: al sacarlo se levanta y se va con física; al reordenar, se deslizan por la cadena.
- Colgantes: péndulo en dos ejes con la inercia del giro; que se choquen entre sí sin atravesarse.
- Girar arrastrando: inercia y frenado naturales; al soltar vuelve suave a la pose de frente.
- En reposo: un giro mínimo y cada tanto un barrido de luz sobre la plata, en vez de balanceo constante.
- Cambio de base y de talle: la misma idea de hoy, con la curva nueva y sin rebotes exagerados.
- "Agregar al carrito": festejo elegante (vuelta lenta + destellos), sin confeti.
- Proponeme (no lo hagas sin mi OK) una forma de ver un charm o el cierre de cerca: un zoom de inspección.
- Movimiento reducido: preguntame al principio si quiero que anime siempre, como el resto de la tienda.

### 7. Interfaz (pulido fino, misma estructura)
- Mientras carga el 3D: un póster liviano de la pulsera de ejemplo, igual al primer cuadro del 3D, que se funde con la escena
  en vivo (en vez de la ruedita).
- Microinteracciones con el mismo lenguaje que el 3D (tarjetas, chips, bases, talles, el total al cambiar).
- Espaciados, alineaciones y jerarquía revisados en 1920, 1600, 1440, 1280, 1024, 768, 390 y 360 px.
- Si te sirven, usá las skills `emil-design-eng` e `impeccable` como criterio para animación y pulido.

### 8. Rendimiento y prolijidad
- Compu: fluido (≥ 55 fps) en este equipo, que tiene una Radeon integrada (buena vara de compu común), a 1600×900 con DPR 2.
  Celular emulado (390×844, DPR 3, CPU 4× más lenta; es una aproximación): ≥ 30 fps con el nivel de calidad que corresponda.
- Descarga extra antes de interactuar ≤ ~1,5 MB (las texturas HD, a demanda).
- `dispose()` de todo lo que sale: después de sumar y sacar 30 charms, `renderer.info.memory` vuelve a lo de antes.
- Consola sin errores. Si WebGL o el CDN fallan, la sección sigue andando (póster + elegir charms + total + carrito).
- Código ordenado y comentado en castellano, como está.

## Cómo trabajar
1. Respaldo primero: copiá `armar3d.js`, `armar3d.css`, `armar.tpl` y `static/panthera/arma/` a
   `respaldos/2026-11-11-armador-antes-de-pulir/`. Otra sesión de Claude puede estar editando el proyecto: releé cada archivo
   antes de tocarlo. No apagues el preview (localhost:5700).
2. Línea de base: capturas "antes" en los mismos encuadres que vas a usar para el "después", y fps actuales.
3. Por fases, mostrándome antes/después y esperando mi OK al terminar cada una: (1) motor, luz, plata y cadena · (2) cierres y
   cristales · (3) charms · (4) movimiento · (5) interfaz, rendimiento, celular y documentación. Para las decisiones de look
   (entorno, tone mapping, cuánto brillo, sombra o reflejo) mostrame 2 o 3 variantes lado a lado.
4. Pruebas con Puppeteer sobre el preview (`puppeteer-core` está en node_modules; Chrome del sistema en
   `C:/Program Files/Google/Chrome/Application/chrome.exe`):
   - Flags `--enable-gpu --ignore-gpu-blocklist --use-angle=d3d11`; emular `prefers-reduced-motion: no-preference`.
   - Bloquear `/__recarga` y contestar `{"success":true}` a los POST a `/comprar/` (el carrito real no se toca).
   - La página usa Lenis: para ir a la sección, `lenis.stop()` y `lenis.scrollTo(y, { immediate: true, force: true })`. La
     captura de elemento del canvas sale en blanco: capturá la ventana (`captureBeyondViewport: false`) y recortá.
   - Encuadres fijos a 2×: la base de ejemplo con sus 3 charms, la vitrina de cada una de las 7 bases, 8 charms, tablet y
     celular.
   - Movimiento: secuencias de cuadros (o GIF/MP4) de la intro, sumar, sacar, reordenar, cambio de base, talle y "Agregar al
     carrito", para revisar tiempos y curvas.
   - Medir fps y memoria.
5. Al terminar: actualizá CLAUDE.md (parte del armador), LEEME.md, PENDIENTES.md y `herramientas/armador/LEEME.md` (versión de
   three, cómo se generan las fotos HD y los contornos, niveles de calidad), y dame un resumen con capturas antes/después y lo
   que quede pendiente.

## Terminado es
- Al lado de las fotos de los productos, la plata, la cadena, los cierres y los charms se ven del mismo nivel: nada de resorte,
  puntitos grises, plástico, stickers ni polvo.
- Nítido a 2× en todos los encuadres de prueba, sin moiré ni bordes serruchados.
- Movimientos suaves, con peso y coherentes entre sí; fluido en compu y en celular dentro del presupuesto.
- Todo lo de "Qué no se toca" sigue igual y el carrito sigue funcionando (probado con la intercepción).
