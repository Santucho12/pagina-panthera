import io
p = 'herramientas/armador/sincroniza_charms.mjs'
s = io.open(p, encoding='utf8', newline='').read()


def c(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80])
    s = s.replace(a, b)


c(r"""  const html = await pagina(ruta); if (!html) return null;
  const id = +""", r"""  const html = await pagina(ruta); if (!html) return null;
  // un producto borrado u oculto devuelve la página de "no encontrado" con código 200 (y los productos sugeridos adentro): solo vale la que se arma como ficha
  if (!/<body[^>]*template-product/.test(html)) return null;
  const id = +""")
c(r"""const estado = !d ? 'su página ya NO existe (¿se borró? sacarlo del armador a mano)'""",
  r"""const estado = !d ? 'su página ya NO EXISTE en la tienda (borrado u oculto): el carrito fallaría' + (flag('agotar-ausentes') ? ' → se marca SIN STOCK en el armador' : ' (con --agotar-ausentes se marca sin stock)')""")
c(r"""console.log('\n── CHARMS NUEVOS ──');""", r"""if (flag('agotar-ausentes')) {
  for (const f of ausentes) { if (f.st !== 0 && !(await producto(rutaDe(f.url)))) { lineas[f.i] = lineas[f.i].replace(/\bst: \d+/, 'st: 0'); tocoTpl = true; } }
}
console.log('\n── CHARMS NUEVOS ──');""")
c(r"""// ── aplicar ──
let tocoTpl = false;""", r"""// ── aplicar ──""")
c(r"""// ── comparación ──""", r"""let tocoTpl = false;
// ── comparación ──""")
c(r"""//   Opciones: --categoria=""", r"""//   --agotar-ausentes → los charms cuya página YA NO EXISTE en la tienda se marcan sin stock (st: 0) para que no se puedan agregar
//   Opciones: --categoria=""")
io.open(p, 'w', encoding='utf8', newline='').write(s)
print('ok')
