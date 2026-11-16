# (2026-11-15) CLAUDE.md y PENDIENTES.md con los pedidos de la tarde (ítems 187–196).
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
    ("""PENDIENTES.md). Convención que salió de ahí: **botones de texto rosas llevan letra NEGRA** (las píldoras "-20%", flechas y cruces en
círculo rosa siguen blancas). **Excepción pedida por el usuario (marca.css sección 21): los botones rosas del inicio con la luz que los
cruza ("Ofertas" del cartel, "Ver toda la colección", "Cómo llegar | WhatsApp", "Instagram | TikTok") van con letra BLANCA: no pasarlos a negro.**""",
     """PENDIENTES.md). ~~Convención de ese día: botones rosas con letra negra.~~ **Desde el 2026-11-15 TODOS los botones con fondo rosa llevan
letra BLANCA** (pedido del usuario: "quiero que los botones con bgc rosa tengan la letra en lugar de en color negro en color blanco"; paginas.css
16 b y b2, `.filtro-b.activo` de los armadores). Revisar con `node herramientas/revision/botones-rosas.mjs` (busca fondo rosa + letra oscura en
compu y celular, también en los armadores; `PAGINAS=/a,/b` elige páginas). Quedan con letra negra solo etiquetas que no son botones (la cinta
"Hasta 50% off" del cartel) y etiquetas escondidas de Lima."""),
], al_final="""
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
""")

parche('PENDIENTES.md', [], al_final="""
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
197. [ ] ¿La cinta "Hasta 50% off" del cartel (rosa con letra negra, no es un botón) también con letra blanca? Preguntarle al usuario.
198. [ ] "Seguinos en redes": en los videos de los celulares se ve la marca de agua "KlingAI 4.0" abajo a la derecha (visto en celular el 2026-11-15).
""")
print('ok')
