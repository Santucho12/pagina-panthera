# (2026-11-16) El MCP de Tiendanube ahora apunta a la tienda de Panthera: CLAUDE.md y PENDIENTES.md con lo que se leyó (solo lectura).
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
    ("""- El conector MCP de Tiendanube de este equipo está conectado a la tienda de **BS23**, no a la de Panthera: no usarlo para datos de Panthera.""",
     """- El conector MCP de Tiendanube: hasta el 2026-11-15 apuntaba a la tienda de **BS23**. **Desde el 2026-11-16 (el usuario lo reconectó con /mcp)
  apunta a la de Panthera** (verificado: "Painter - 471"). Puede volver a cambiar: verificarlo antes de usarlo. Leer está bien; **escribir (categorías,
  productos, promociones…) solo si el usuario lo pide**, y nunca las herramientas de temas (eso es publicar). Lo que el MCP no puede: las secciones
  "Productos destacados" y "Productos en oferta" del inicio se eligen en el panel (`/admin/themes/settings/product_order/`), y no hay herramientas
  para el menú, los puntos de retiro, los métodos de envío ni el SKU."""),
])

parche('PENDIENTES.md', [
    ("""203. [ ] Envío gratis desde $150.000: Tiendanube no informa ningún envío gratis con mínimo (Lima no muestra su barra). Confirmar en el panel que se aplique.""",
     """203. [ ] Envío gratis desde $150.000: (leído con el MCP el 2026-11-16) lo hacen métodos de envío "sin cargo" (por eso Lima no muestra su barra), no una
     promoción. Uno se llama "Envíos sin cargo solo en Bahía Blanca compras mayores a $90.000" (con $126.480 en Bahía Blanca no apareció: el monto real
     sería otro): corregir el nombre y confirmar los montos en el panel. Hay una promoción vieja de envío gratis con mínimo $8.000, no activa: borrarla."""),
    ("""204. [ ] Sello "Más vendido ★": lo llevan TODAS las tarjetas de "Los más elegidos" (los destacados que se eligen en el panel), no sale de ventas reales.""",
     """204. [ ] Sello "Más vendido ★": lo llevan TODAS las tarjetas de "Los más elegidos" (los destacados que se eligen en el panel), no sale de ventas reales.
     Hoy son 3 (Jazmín, The Moon, Broche Mickey y Minnie) y ninguno está entre los más vendidos con stock (MCP, 2026-11-16): Princesa Cenicienta,
     Baby boy, Baby girl, Luciérnaga Especial, Valija rosa, Adventure, Estrellita rose, Aro cuernito green, Stitch… Elegir 6 o más de esos en el panel
     (Diseño → Organizar productos → destacados): el carrusel deja de repetir tarjetas (marca.js repite solo con menos de 6) y el sello pasa a ser cierto."""),
], al_final="""209. [ ] Categoría "Ofertas" real (en vez de la página armada con código): crearla OCULTA (la dirección anda; no sale en el menú de la tienda de
     hoy) con los productos de "No los dejes escapar"; al subir el tema, apuntar `OFERTAS_URL` y el botón del hero a ella, borrar el armado de marca.js y
     mostrarla en el menú. No puede ser "todo lo que tiene descuento": los 1.130 productos visibles tienen precio promocional. Necesita el OK de
     Panthera (se puede hacer con el MCP). Ya existe una categoría oculta con un nombre raro ("Aros Pulseras … SECRET SALE"): renombrarla o borrarla en el panel.
210. [ ] "No los dejes escapar" tiene 4 productos y también repite tarjetas: elegir 6 o más en el panel ("Productos en oferta").
211. [ ] Punto de retiro: los dos dicen "Sarmiento 2153" (panel → Envíos → puntos de retiro); la dirección confirmada es Av. Alberto Pedro Cabrera 2153.
212. [ ] Categorías repetidas: "Collares" y "Collares y Colgantes" (marca.js saca la repetida del menú); "Crealo vos misma" del menú apunta a "Dijes
     gold para cadenas" (marca.js lo desvía al armador): en el panel (Navegación) se puede apuntar a /#armar-pulsera y borrar el desvío.
""")
print('ok')
