# Para Panthera: cambios que se hacen en el panel de Tiendanube

Estos puntos no se pueden resolver desde el diseño de la tienda: se cambian en el panel de Tiendanube o los tiene que confirmar Panthera.
Al lado de cada uno está el número de la lista de pendientes (PENDIENTES.md). Preparado el 12/11/2026.

## Datos confirmados (12/11/2026): corregir en el panel

**113 · Envío gratis: es desde $150.000** (lo que dicen la franja y la ficha). Corregir el texto del medio de envío, que dice
"Envíos sin cargo solo en Bahía Blanca compras mayores a $90.000".

**114 · La dirección es Av. Alberto Pedro Cabrera 2153** (como Contacto, "Conocenos" y el pie). Corregir el punto de retiro, que dice
"Bahía Blanca Plaza Shopping - Sarmiento 2153, Palos Verdes".

## Textos para cargar en el panel

**110 · Texto de Google y de los links compartidos** (Configuración → SEO / Información de la tienda):
- Título: **Panthera Universe · Charms, pulseras y aros en Bahía Blanca**
- Descripción (hasta 160 caracteres): **Charms, pulseras, aros, collares y anillos, con la colección Disney. Envíos a todo el país y locales en
  Bahía Blanca y Monte Hermoso. 3 y 6 cuotas sin interés.**

  Hoy dice "Comprá productos de PANTHERA por internet. Tenemos aros pulseras… dijes trepadores tobilleras alhajeros collares secret…",
  con categorías que ya no están.

**115 · Medios de envío sin tildes** (Configuración → Medios de envío):
- "Envios a todo el pais" → **Envíos a todo el país**
- "Envíos solo en Bahía Blanca": está bien.
- Punto de retiro: "Panthera Universe - Bahia Blanca Plaza Shopping - …, Palos verdes, Bahia Blanca, Buenos Aires" →
  **Panthera Universe - Bahía Blanca Plaza Shopping - …, Palos Verdes, Bahía Blanca, Buenos Aires** (con la dirección Av. Alberto Pedro Cabrera 2153).

## Archivos para subir en el panel

**108 · Ícono de la pestaña** (Diseño → Configuración → Favicon): `tienda/static/panthera/iconos/favicon-512.png`
(círculo rosa con una "P" blanca y la estrellita dorada del logo). El tema ya lo pone solo, también el ícono para guardar la tienda
en la pantalla del iPhone; subirlo en el panel hace que aparezca igual en las partes que arma Tiendanube (checkout).

**109 · Imagen al compartir un link** (Configuración → SEO, imagen para redes): `tienda/static/panthera/iconos/compartir-1200x630.jpg`
(el logo dorado sobre blanco con manchas rosas y "Charms, pulseras y aros · Bahía Blanca"). El tema ya la pone en todas las páginas
menos en las fichas (ahí va la foto del producto).

## Opciones del panel

**99 · Nombres con número de código** ("Casiopea corazon - 3991"). **Decidido: sí, limpiarlos.** El diseño ya lo esconde en la ficha, la pestaña del navegador,
el carrito y el buscador, pero el **checkout y los mails** los arma Tiendanube y ahí sigue apareciendo. Lo de fondo es limpiar los
nombres en el panel (Productos) y pasar el número al campo **SKU**.

**104 · Comentarios de Facebook en la ficha**: la opción está prendida (Diseño → Detalle de producto) pero no muestra nada. **Decidido: apagarla.**
(El diseño ya no le deja lugar.)

**112 · "Creado con Tiendanube"** en el pie: **decidido: se deja.**

**107 · Sellos del pie** (Data Fiscal de ARCA, sello propio): no hay ninguno cargado. Si se cargan (Diseño → Pie de página → Sellos),
el diseño ya les da lugar centrado en el pie.

**105 · Guía de talles**: **decidido: no hace falta.**

**103 · Opciones del panel que agregarían piezas sin diseño** (visto, ok). Hoy están apagadas y **no tienen el diseño de Panthera**: si se prenden,
salen con la cara del tema original. Antes de prender alguna, avisar para diseñarla:
- Inicio: testimonios, marcas, video, mensaje de bienvenida, banners informativos o de servicios, producto principal, categorías
  destacadas, módulos de imagen y texto, popup de newsletter, feed de Instagram.
- Encabezado: barra superior (cuenta + menú secundario), banners informativos, idioma/moneda.
- Categorías: imagen y descripción de la categoría.
- Listados: "fotos en carrusel en cada producto".
- Ficha: código SKU visible, link a guía de talles.
- Carrito: monto mínimo de compra.
