# (2026-11-15) Las pruebas de "ordenar" en celular: el desplegable "Ordenar" ahora está ADENTRO del panel de "Filtrar" (paginas.js 16).
import io
p = 'herramientas/revision/pruebas-46-115.mjs'
s = io.open(p, encoding='utf8', newline='').read()
e = '\r\n' if '\r\n' in s else '\n'


def c(a, b, n=1):
    global s
    a = a.replace('\n', e)
    b = b.replace('\n', e)
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)


c("""const visible = (p, sel) =>""", """// (2026-11-15) Abre el orden: en compu el desplegable "Ordenar"; en celular el panel de "Filtrar", que tiene "Ordenar por" adentro (paginas.js 16).
// Devuelve qué se abrió ('menu' | 'panel') o false; la opción se toca después con OPCION_ORDEN[lo que se abrió].
const OPCION_ORDEN = { menu: '.pnt-orden-op', panel: '.pnt-fo-op' };
async function abrirOrden(p) {
  if (await visible(p, '.pnt-orden-btn')) { await tocar(p, '.pnt-orden-btn'); await espera(700); return (await visible(p, '.pnt-orden-menu')) ? 'menu' : false; }
  await tocar(p, '.pnt-filtrar-btn'); await espera(1300);
  return (await visible(p, '.pnt-fo-ops')) ? 'panel' : false;
}
const visible = (p, sel) =>""")
c("""        await tocar(p, '.pnt-orden-btn'); await espera(700);
        const menu = await visible(p, '.pnt-orden-menu');
        await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, '.pnt-orden-op', new RegExp(txt))]); await listo(p); await espera(2500);""",
  """        const menu = await abrirOrden(p);
        await Promise.all([p.waitForNavigation({ timeout: 20000 }).catch(() => {}), tocar(p, OPCION_ORDEN[menu] || '.pnt-orden-op', new RegExp(txt))]); await listo(p); await espera(2500);""")
c("""      await tocar(p, '.pnt-orden-btn'); await espera(700);
      await tocar(p, '.pnt-orden-op', /menor precio/); await espera(4500);""",
  """      { const abierto = await abrirOrden(p); await tocar(p, OPCION_ORDEN[abierto] || '.pnt-orden-op', /menor precio/); } await espera(4500);""")
c("""      await tocar(p, '.pnt-orden-btn'); await espera(700);
      await tocar(p, '.pnt-orden-op', /mayor precio/); await espera(4500);""",
  """      { const abierto = await abrirOrden(p); await tocar(p, OPCION_ORDEN[abierto] || '.pnt-orden-op', /mayor precio/); } await espera(4500);""")
io.open(p, 'w', encoding='utf8', newline='').write(s)
print('ok')
