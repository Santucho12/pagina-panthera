# (2026-11-16) CLAUDE.md y PENDIENTES.md: la categoría Ofertas de verdad y los carruseles del inicio sin tarjetas repetidas (ítems 209, 213–215).
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


parche('CLAUDE.md', [], al_final="""
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
""")

parche('PENDIENTES.md', [
    ("""209. [ ] Categoría "Ofertas" real (en vez de la página armada con código):""",
     """209. [~] (2026-11-16: creada OCULTA con Silver Flower y el código listo; falta hacerla visible) Categoría "Ofertas" real (en vez de la página armada con código):"""),
    ("""210. [ ] "No los dejes escapar" tiene 4 productos y también repite tarjetas: elegir 6 o más en el panel ("Productos en oferta").""",
     """210. [x] (2026-11-16) "No los dejes escapar" ya no repite tarjetas y muestra los productos de la categoría Ofertas (cuando sea visible)."""),
], al_final="""213. [ ] Hacer VISIBLE la categoría Ofertas (oculta, Tiendanube no muestra su página): panel → Productos → Categorías, o permitirlo en el MCP.
214. [ ] "Los más elegidos": marcar 7 destacados más en el panel (lista en CLAUDE.md, "Ofertas = la categoría…"). El Chrome no tenía la sesión de Tiendanube.
215. [x] (2026-11-16) Carruseles del inicio sin tarjetas repetidas; con pocas avanzan y vuelven al principio; si entran todas, quietos y sin "Deslizá".
""")
print('ok')
