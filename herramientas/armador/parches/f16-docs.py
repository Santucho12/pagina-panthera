# (2026-11-16) CLAUDE.md y PENDIENTES.md: siempre 3 charms y 2 aritos de entrada (se reemplazan solos los que se agotan) — ítem 208.
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
    ("""    **Desde el 2026-11-15: Painter y Stitch** (Mickey Shine ya no existe en la tienda; lo sin stock no se muestra, ver "Pedidos de la noche").
    Si cambian, regenerar el póster (`node herramientas/armador/pruebas/poster.mjs`; regenerado el 2026-11-15 con Painter y Stitch).""",
     """    **Desde el 2026-11-16: SIEMPRE 3 charms de entrada** (pedido: "siempre tiene que aparecer como mínimo 3 charms por defecto"): los pedidos
    con stock y, en el lugar de cada uno agotado, otro elegido solo. Hoy: Painter, **Mickey y Minnie reversible** (en lugar de Mickey Shine, que
    ya no existe) y Stitch. Ver "Pedidos de la noche del 2026-11-15". El póster se regenera con `node herramientas/armador/pruebas/poster.mjs`
    (regenerado el 2026-11-16 con esos tres; anota `data-poster-de` en armar.tpl)."""),
    ("""- **Checkout con la paleta completa** (checkout.scss.tpl): botones y etiquetas rosas con letra BLANCA, y los tokens del `:root` (acento, texto, fondo,
  botones, etiquetas, cabecera y pie) con la paleta en vez de los colores del admin. Es un .tpl: solo se ve al publicar.""",
     """- **Checkout con la paleta completa** (checkout.scss.tpl): botones y etiquetas rosas con letra BLANCA, y los tokens del `:root` (acento, texto, fondo,
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
  (lee la combinación de entrada de la página: `data-entrada`)."""),
])

parche('PENDIENTES.md', [], al_final="""208. [x] (2026-11-16) Siempre 3 charms y 2 aritos de entrada: los que se agotan se reemplazan solos (mismo tema, el de más stock); póster nuevo
     (Painter, Mickey y Minnie reversible, Stitch) y el póster viejo no se muestra si la combinación de entrada cambió.
""")
print('ok')
