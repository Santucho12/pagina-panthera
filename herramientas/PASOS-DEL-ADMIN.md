# Pasos para hacer en el admin de Tiendanube al publicar

Cosas que **no se pueden cambiar desde los archivos del tema** (se hacen a mano en el panel de Panthera) y que completan el rediseño.
Armado el 2026-11-12. Nada de esto está hecho: el admin no se tocó.

## 1. Direcciones de categorías con números (ítem 76)
Productos → Categorías → editar la categoría → campo **"URL"**.

| Categoría (hoy) | Dirección actual | Dirección sugerida |
|---|---|---|
| Aros dorados · Pares | `/todos-los-productos/aros/dorados/pares2/` | `.../aros/dorados/pares-dorados/` |
| Aros dorados · Solitarios | `/todos-los-productos/aros/dorados/solitarios1/` | `.../aros/dorados/solitarios-dorados/` |
| Aros plateados · Pares | `/todos-los-productos/aros/plateados/pares3/` | `.../aros/plateados/pares-plateados/` |
| Aros plateados · Solitarios | `/todos-los-productos/aros/plateados/solitarios2/` | `.../aros/plateados/solitarios-plateados/` |
| Collares (la repetida) | `/todos-los-productos/collares1/` | Ver el punto 2 |

- El número se agregó porque el nombre ("pares", "solitarios") ya existía en otra categoría. Con el nombre completo ya no choca.
- **Antes de cambiarlas**: los links viejos que alguien haya compartido (Instagram, WhatsApp) dejan de andar. Conviene hacerlo antes de lanzar, no después.
- En el código del tema no hay ningún link a estas direcciones (se revisó), así que no hay nada más que actualizar.

## 2. Menú y categorías repetidas
Tienda online → Menús (y Productos → Categorías).
- **"Collares" aparece dos veces** (`/collares/` y `/collares1/`) con **los mismos 7 productos**. Dejar una sola: borrar la categoría `collares1` o sacarla del menú.
  Hoy el tema la oculta por código (`marca.js`, sección 10); al arreglarlo en el admin ese parche queda sin efecto, no molesta.
- "CREALO VOS MISMA" está escrito en mayúsculas en el menú: escribirlo "Crealo vos misma" (hoy también lo corrige el tema).
- Hay dos "Disney": `Charms/Dijes → Disney` (13 productos) y `Disney` / `Disney Lovers` (41). Son categorías distintas y están bien; solo conviene que se entienda cuál es cuál (por ejemplo "Disney" y "Todo Disney").

## 3. Orden por defecto de las categorías
Hoy la tienda ordena por "Más vendidos" y el tema fuerza "Novedades" recargando la página una vez (`marca.js`, sección de listados).
Para evitar esa recarga: en el admin, Diseño del tema → **orden por defecto** de los productos → "Más nuevo primero", y sacar el parche.

## 4. Compra rápida
Diseño del tema → **"Compra rápida"** → apagar. El tema ya manda esas tarjetas a la ficha del producto, pero apagándola ni se carga.

## 5. Checkout y mails (ítem 75)
- **Checkout**: el tema trae `static/checkout.scss.tpl` ya preparado con la paleta (rosa `#F4ACC4`, texto negro, fondo blanco, botones rosa). Funciona solo si el plan permite estilizar el checkout
  (`store.allows_checkout_styling`). Se ve recién al publicar.
- **Logo del checkout**: Configuración → Checkout (o Diseño) → subir el logo de Panthera.
- **Mails a clientes** (pedido recibido, enviado, etc.): Configuración → Notificaciones/Emails → logo y color. Solo se puede cambiar lo que ese panel permite (logo y color del botón: usar `#F4ACC4`).
- **Colores del admin del tema** (Diseño → Colores): hoy tienen el azul marino y celeste de Lima. El tema los pisa por código, pero conviene dejarlos en la paleta de Panthera (rosa `#F4ACC4`, dorado `#EEC049`, negro y blanco) por si algo del checkout o de los mails los usa.

## 6. Otras cosas ya anotadas en PENDIENTES.md
- Barra de anuncios: texto "Envío gratis a partir de $150.000" (el carrito lateral lee ese monto para su barra de envío).
- Banners e imágenes del inicio (ítem 19).
- Tipografías en el admin (ítem 21).

## 7. Del segundo relevamiento (2026-11-12, ítems 103 a 115 de PENDIENTES.md)
- **Apagar los comentarios de Facebook** de la ficha (Diseño → Detalle de producto): están prendidos y no se ven.
- **Favicon nuevo** (ícono de la pestaña) con la marca y en la paleta: hoy es el símbolo viejo de 2021.
- **Imagen para compartir** (1200×630, con la marca) y **texto de Google** (título y descripción de la tienda, SEO): hoy salen el logo
  transparente chiquito y una descripción automática con categorías que ya no existen.
- **Envío gratis**: unificar el monto (la franja dice $150.000; el medio de envío "sin cargo en Bahía Blanca" dice $90.000).
- **Dirección del local**: el punto de retiro dice "Sarmiento 2153" y Contacto "Av. Alberto Pedro Cabrera 2153": dejar una sola.
- Tildes en los nombres de los medios de envío ("Envios a todo el pais").
- Antes de prender cualquier sección u opción nueva del tema (testimonios, video, barra superior, imagen de categoría, SKU, etc.),
  avisar: no tienen el diseño nuevo (ítem 103).
