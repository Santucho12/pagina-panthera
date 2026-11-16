// Sincroniza "Armá tu pulsera" con la categoría de charms de la tienda (2026-11-14, pedido del usuario: "automatizar la carga de charms").
//
//   node herramientas/armador/sincroniza_charms.mjs                 → INFORME (solo lectura): charms nuevos, precios/stock que cambiaron y
//                                                                      charms del armador que ya no están en la categoría
//   node herramientas/armador/sincroniza_charms.mjs --precios       → además actualiza p (precio), a (precio anterior) y st (stock) en armar.tpl
//   node herramientas/armador/sincroniza_charms.mjs --nuevos        → además suma los charms nuevos: baja sus fotos, los recorta (recorte.py:
//                                                                      liviana + HD + relieve + contorno), los copia a tienda/static/panthera/arma/
//                                                                      y agrega su fila a armar.tpl
//   --agotar-ausentes → los charms cuya página YA NO EXISTE en la tienda se marcan sin stock (st: 0) para que no se puedan agregar
//   Opciones: --categoria=/todos-los-productos/charms-panthera/   --base=http://localhost:5700 (por defecto el preview si está, si no la tienda)
//             --sin-ia (no escalar con Real-ESRGAN las fotos chicas)
//
// Solo LEE la tienda (GET de páginas públicas, como el preview): no escribe nada en Tiendanube ni sube nada (CLAUDE.md: nada por FTP).
// Lo que no se puede saber solo y queda para mirar a ojo: el tipo ('c' cuenta o 'd' colgante), la altura del agujero (ag) y el tamaño en el
// 3D (alto) salen de la forma de la foto (valores típicos); después de sumar hay que mirar los charms nuevos de cerca:
//   node herramientas/armador/pruebas/enhebrado.mjs sync k1,k2,…   (y, si el agujero se detecta mal, `hueco` en armar.tpl; ver LEEME.md).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const AQUI = import.meta.dirname;
const RAIZ = path.resolve(AQUI, '..', '..');
const TPL = path.join(RAIZ, 'tienda', 'snipplets', 'panthera', 'armar.tpl');
const ARMA = path.join(RAIZ, 'tienda', 'static', 'panthera', 'arma');
const arg = (n, d) => { const a = process.argv.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
const flag = (n) => process.argv.includes('--' + n);
const CATEGORIA = arg('categoria', '/todos-los-productos/charms-panthera/');
const UA = { 'User-Agent': 'Mozilla/5.0' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const rutaDe = (u) => (u.endsWith('/') ? u : u + '/');

// ── de dónde se lee ──
async function elegirBase() {
  const pedida = arg('base', '');
  if (pedida) return pedida.replace(/\/$/, '');
  try { const r = await fetch('http://localhost:5700/__version', { signal: AbortSignal.timeout(2500) }); if (r.ok) return 'http://localhost:5700'; } catch { /* sin preview */ }
  return 'https://pantherajoyeria.com.ar';
}
const BASE = await elegirBase();
async function pagina(ruta, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(BASE + ruta, { headers: UA, signal: AbortSignal.timeout(45000) });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch { /* se reintenta */ }
    await espera(800 * (i + 1));
  }
  return null;
}

// ── lo que ya tiene el armador (armar.tpl) ──
const tpl = fs.readFileSync(TPL, 'utf8');
const EOL = tpl.includes('\r\n') ? '\r\n' : '\n';
const lineas = tpl.split(EOL);
const iIni = lineas.findIndex((l) => l.includes('{% set pnt_a3_charms = ['));
if (iIni < 0) throw new Error('no encontré la lista pnt_a3_charms en armar.tpl');
let iFin = iIni + 1; while (iFin < lineas.length && !/^\s*\]\s*%\}/.test(lineas[iFin])) iFin++;
const filas = [];
for (let i = iIni + 1; i < iFin; i++) {
  const l = lineas[i], m = /\{ k: '(\w+)'/.exec(l); if (!m) continue;
  const num = (n) => { const x = new RegExp('\\b' + n + ': (\\d+)').exec(l); return x ? +x[1] : null; };
  filas.push({ i, k: m[1], id: num('id'), v: num('v'), p: num('p'), a: num('a'), st: num('st'), url: (/url: '([^']+)'/.exec(l) || [])[1] || '', n: (/n: '([^']*)'/.exec(l) || [])[1] || '' });
}
console.log(`Armador: ${filas.length} charms en armar.tpl · leyendo ${BASE}${CATEGORIA}`);

// ── la categoría de la tienda ──
const urlsCategoria = [];
for (let n = 1; n <= 12; n++) {
  const html = await pagina(CATEGORIA + '?page=' + n);
  if (!html) break;
  const antes = urlsCategoria.length;
  for (const bloque of html.split('js-item-product').slice(1)) {
    const m = /href="(?:https?:\/\/[^"\/]+)?(\/productos\/[^"?#]+\/?)/.exec(bloque);
    if (m) { const u = m[1].endsWith('/') ? m[1] : m[1] + '/'; if (!urlsCategoria.includes(u)) urlsCategoria.push(u); }
  }
  if (urlsCategoria.length === antes) break;      // una página sin productos nuevos: se terminó
}
console.log(`Categoría: ${urlsCategoria.length} productos`);

// ── datos de cada producto (id, variante, precio, anterior, stock, nombre, foto) ──
const decodifica = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
async function producto(ruta) {
  const html = await pagina(ruta); if (!html) return null;
  // un producto borrado u oculto devuelve la página de "no encontrado" con código 200 (y los productos sugeridos adentro): solo vale la que se arma como ficha
  if (!/<body[^>]*template-product/.test(html)) return null;
  const id = +((/name="add_to_cart" value="(\d+)"/.exec(html) || [])[1] || 0);
  const mv = /data-variants="([^"]*)"/.exec(html); if (!id || !mv) return null;
  let vs; try { vs = JSON.parse(decodifica(mv[1])); } catch { return null; }
  const v = vs.find((x) => x.is_visible !== false) || vs[0];
  const nombre = decodifica(((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html) || [])[1] || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim().replace(/\s+-\s+[\w]+$/, '');
  const og = (/og:image" content="([^"]*)"/.exec(html) || [])[1] || '';
  return { ruta, id, v: v.id, p: v.price_number, a: v.compare_at_price_number || v.price_number, st: v.available === false ? 0 : (v.stock == null ? 99 : v.stock), nombre, og, variantes: vs.length };
}
async function conCupo(lista, n, f) {          // n pedidos a la vez
  const out = new Array(lista.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < lista.length) { const k = i++; out[k] = await f(lista[k], k); } }));
  return out;
}
let datos = (await conCupo(urlsCategoria, 4, producto)).filter(Boolean);
// los que no se pudieron leer se reintentan de a uno (la tienda a veces tarda o corta)
const sinLeer = urlsCategoria.filter((u) => !datos.some((d) => d.ruta === u));
for (const u of sinLeer) { await espera(1500); const d = await producto(u); if (d) datos.push(d); }
const noLeidos = urlsCategoria.filter((u) => !datos.some((d) => d.ruta === u));
console.log(`Leídos: ${datos.length} de ${urlsCategoria.length}` + (noLeidos.length ? ` · NO se pudieron leer: ${noLeidos.join(', ')}` : ''));

let tocoTpl = false;
// ── comparación ──
const porId = new Map(filas.map((f) => [f.id, f]));
const idsTienda = new Set(datos.map((d) => d.id));
const nuevos = datos.filter((d) => !porId.has(d.id) && !filas.some((f) => rutaDe(f.url) === d.ruta));
const cambios = [];
for (const d of datos) {
  const f = porId.get(d.id); if (!f) continue;
  const dif = []; if (f.p !== d.p) dif.push(`precio ${f.p} → ${d.p}`); if (f.a !== d.a) dif.push(`anterior ${f.a} → ${d.a}`); if (f.st !== d.st) dif.push(`stock ${f.st} → ${d.st}`); if (f.v !== d.v) dif.push(`variante ${f.v} → ${d.v} (¡cambió el id de la variante: el carrito fallaría!)`);
  if (dif.length) cambios.push({ f, d, dif });
}
const ausentes = filas.filter((f) => !idsTienda.has(f.id) && !urlsCategoria.includes(rutaDe(f.url)));   // ni su id ni su link están en la categoría

console.log('\n── PRECIOS / STOCK ──');
if (!cambios.length) console.log('Sin cambios: todo igual que en la tienda.');
cambios.forEach(({ f, dif }) => console.log(`  ${f.k.padEnd(5)} ${f.n.padEnd(30)} ${dif.join(' · ')}`));
console.log('\n── CHARMS QUE YA NO ESTÁN EN LA CATEGORÍA ──');
if (!ausentes.length) console.log('Ninguno.');
for (const f of ausentes) {      // ¿sigue a la venta aunque ya no esté en esta categoría?
  const d = await producto(rutaDe(f.url));
  const estado = !d ? 'su página ya NO EXISTE en la tienda (borrado u oculto): el carrito fallaría' + (flag('agotar-ausentes') ? ' → se marca SIN STOCK en el armador' : ' (con --agotar-ausentes se marca sin stock)')
    : `sigue a la venta: $${d.p} · stock ${d.st}` + (d.v !== f.v ? ` · ¡su variante cambió (${f.v} → ${d.v}): el carrito fallaría!` : '') + (d.p !== f.p || d.st !== f.st ? ` (en el armador: $${f.p} · stock ${f.st})` : ' (igual que en el armador)') + ' — solo cambió de categoría';
  console.log(`  ${f.k.padEnd(5)} ${f.n.padEnd(26)} ${estado}`);
}
if (flag('agotar-ausentes')) {
  for (const f of ausentes) { if (f.st !== 0 && !(await producto(rutaDe(f.url)))) { lineas[f.i] = lineas[f.i].replace(/\bst: \d+/, 'st: 0'); tocoTpl = true; } }
}
console.log('\n── CHARMS NUEVOS ──');
if (!nuevos.length) console.log('Ninguno.');

// ── claves y filas de los nuevos ──
const usadas = new Set(filas.map((f) => f.k));
const SIN = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'con', 'en', 'charm', 'dije', 'colgante', 'para', 'por', 'un', 'una', 'a', 'o', 'silver', 'gold']);
const plano = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
function clave(nombre) {
  const pal = plano(nombre).split(/\s+/).filter((w) => w && !SIN.has(w)); const w1 = pal[0] || 'cha', w2 = pal[1] || 'x';
  const cands = [w1.slice(0, 4), (w1.slice(0, 3) + w2[0]), w1.slice(0, 3) + '2', w1.slice(0, 2) + w2.slice(0, 2)];
  for (const c of cands) if (c.length >= 3 && !usadas.has(c)) { usadas.add(c); return c; }
  for (let i = 2; i < 99; i++) { const c = w1.slice(0, 3) + i; if (!usadas.has(c)) { usadas.add(c); return c; } }
}
function categoriaDe(nombre) {
  const n = plano(nombre);
  if (/mickey|minnie|stitch|lilo|disney|mulan|valiente|aladd|jazmin|frozen|elsa|olaf|buzz|woody|toy story|bella|bestia|ariel|sirena|rapunzel|pooh|winnie|dumbo|bambi|marie|cenicienta|aurora|blancanieves|simba|moana|vaiana|encanto|coco|pixar|tinker|hada|peter pan|pinocho|mufasa|nemo|dory|cars|rayo/.test(n)) return 'Disney';
  if (/viaj|valija|maleta|avion|globo|mundo|brujula|aventura|adventure|mapa|travel|ruedas|timon|ancla/.test(n)) return 'Viajes';
  if (/coraz|amor|famil|mama|papa|hij|abuel|bebe|love|forever|home|casa|hogar/.test(n)) return 'Amor y familia';
  if (/estrell|luna|sol |cielo|brill|circon|galax|star|moon|sun|cristal|diamante/.test(n)) return 'Brillos y cielo';
  return 'Varios';
}
const filaNueva = (d, k, asp) => {
  const colgante = asp < 0.75;      // una foto alta y angosta es un colgante (cuelga de su aro); una más ancha, una cuenta (la cadena la atraviesa)
  const alto = colgante ? Math.min(1.15, Math.max(0.75, +(0.55 + 0.6 / Math.max(0.01, asp * 2.2)).toFixed(2))) : +(asp > 1.2 ? 0.45 : 0.5).toFixed(2);
  return `    { k: '${k}', n: '${d.nombre.replace(/'/g, '’')}', cat: '${categoriaDe(d.nombre)}', id: ${d.id}, v: ${d.v}, p: ${d.p}, a: ${d.a}, st: ${d.st}, tipo: '${colgante ? 'd' : 'c'}', ag: ${colgante ? 0.17 : 0.5}, alto: ${alto}, asp: ${asp}, url: '${d.ruta}' }`;
};
for (const d of nuevos) { d.k = clave(d.nombre); console.log(`  ${d.k.padEnd(5)} ${d.nombre} · $${d.p} (antes $${d.a}) · stock ${d.st} · ${d.ruta}`); }

// ── aplicar ──
if (flag('precios') && cambios.length) {
  for (const { f, d } of cambios) {
    let l = lineas[f.i];
    l = l.replace(/\bp: \d+/, 'p: ' + d.p).replace(/\ba: \d+/, 'a: ' + d.a).replace(/\bst: \d+/, 'st: ' + d.st);
    if (f.v !== d.v) l = l.replace(/\bv: \d+/, 'v: ' + d.v);
    lineas[f.i] = l;
  }
  tocoTpl = true; console.log(`\n✔ Precios y stock actualizados en armar.tpl (${cambios.length} charms).`);
} else if (cambios.length) console.log('\n(Para aplicar los precios y el stock: --precios)');

if (flag('nuevos') && nuevos.length) {
  const SALIDA = path.join(AQUI, 'salida', 'sync-' + new Date().toISOString().slice(0, 10));
  fs.mkdirSync(path.join(SALIDA, 'charms'), { recursive: true }); fs.mkdirSync(path.join(SALIDA, 'charms-hd'), { recursive: true });
  // recorte.py suma los contornos nuevos a un contornos.js que busca en la carpeta de salida: se le deja el de la tienda para no perder los de siempre
  const cont = path.join(ARMA, 'contornos.js'); if (fs.existsSync(cont)) fs.copyFileSync(cont, path.join(SALIDA, 'contornos.js'));
  const fuentesRuta = path.join(AQUI, 'fuentes.json'); const fuentes = JSON.parse(fs.readFileSync(fuentesRuta, 'utf8'));
  const bajar = async (url, dest) => { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60000) }); if (!r.ok) throw new Error(r.status + ' ' + url); fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); };
  const buenos = [];
  for (const d of nuevos) {
    const raiz = d.og.replace(/^http:/, 'https:').replace(/-\d+-\d+\.(webp|jpg|png)$/, '');
    if (!raiz) { console.log(`  ✘ ${d.k}: sin foto (og:image)`); continue; }
    try {
      await bajar(raiz + '-640-0.webp', path.join(AQUI, 'im_hd', d.k + '.webp'));
      await bajar(raiz + '-1024-1024.webp', path.join(AQUI, 'im_1024', d.k + '.webp'));
      fuentes[d.k] = raiz; buenos.push(d); console.log(`  ↓ ${d.k}: fotos bajadas`);
    } catch (e) { console.log(`  ✘ ${d.k}: no pude bajar la foto (${e.message})`); }
  }
  fs.writeFileSync(fuentesRuta, JSON.stringify(fuentes, null, 1) + '\n');
  if (buenos.length) {
    // ¿alguna foto chica? (menos de ~700 px de alto) → Real-ESRGAN local, salvo --sin-ia
    const chicas = [];
    if (!flag('sin-ia')) {
      const q = spawnSync('python', ['-I', '-c', 'import sys\nfrom PIL import Image\nfor k in sys.argv[1:]:\n    print(k, Image.open("im_1024/" + k + ".webp").height)', ...buenos.map((d) => d.k)], { cwd: AQUI, encoding: 'utf8' });
      (q.stdout || '').trim().split('\n').forEach((l) => { const [k, h] = l.split(' '); if (+h && +h < 700) chicas.push(k); });
    }
    const correr = (ks, extra) => spawnSync('python', ['recorte.py', ks.join(','), '--liviana', ...extra], { cwd: AQUI, env: { ...process.env, PNT_SALIDA_ARMA: SALIDA }, stdio: 'inherit' });
    const grandes = buenos.map((d) => d.k).filter((k) => !chicas.includes(k));
    if (grandes.length) correr(grandes, []);
    if (chicas.length) { console.log('  Fotos chicas (Real-ESRGAN):', chicas.join(', ')); correr(chicas, ['--ia']); }
    // copiar a la tienda (los archivos nuevos hacen que el preview recargue la página una vez)
    const asp = JSON.parse(fs.readFileSync(path.join(AQUI, 'rgba_aspectos.json'), 'utf8'));
    const nuevasFilas = [];
    for (const d of buenos) {
      // la foto liviana de la tarjeta la deja recorte.py en im_rgba/ (la HD, el relieve y el contorno, en la carpeta de salida)
      const liviana = path.join(AQUI, 'im_rgba', d.k + '.webp');
      const arch = [[liviana, path.join(ARMA, 'charms', d.k + '.webp')], [path.join(SALIDA, 'charms-hd', d.k + '.webp'), path.join(ARMA, 'charms-hd', d.k + '.webp')], [path.join(SALIDA, 'charms-hd', d.k + '-n.webp'), path.join(ARMA, 'charms-hd', d.k + '-n.webp')]];
      if (!arch.every(([o]) => fs.existsSync(o))) { console.log(`  ✘ ${d.k}: el recorte no dejó todos los archivos (se omite)`); continue; }
      arch.forEach(([o, dest]) => fs.copyFileSync(o, dest));
      nuevasFilas.push(filaNueva(d, d.k, asp[d.k] || 0.9));
    }
    fs.copyFileSync(path.join(SALIDA, 'contornos.js'), cont);
    if (nuevasFilas.length) {
      const ult = iFin - 1; while (!/\{ k: '/.test(lineas[ult])) { /* no pasa: hay filas */ break; }
      let u = iFin - 1; while (u > iIni && !/\{ k: '/.test(lineas[u])) u--;
      if (!lineas[u].trimEnd().endsWith(',')) lineas[u] = lineas[u].replace(/\s*$/, ',');
      nuevasFilas.forEach((f, j) => { lineas.splice(u + 1 + j, 0, f + (j < nuevasFilas.length - 1 ? ',' : '')); });
      tocoTpl = true;
      console.log(`\n✔ ${nuevasFilas.length} charms sumados a armar.tpl y copiados a tienda/static/panthera/arma/.`);
      console.log('  MIRALOS DE CERCA antes de dar nada por bueno (el tipo, la altura del agujero y el tamaño salen de la forma de la foto):');
      console.log('  node herramientas/armador/pruebas/enhebrado.mjs sync ' + buenos.map((d) => d.k).join(','));
      console.log('  node herramientas/armador/pruebas/funciones.mjs');
    }
  }
} else if (nuevos.length) console.log('\n(Para sumar los nuevos al armador: --nuevos)');

if (tocoTpl) fs.writeFileSync(TPL, lineas.join(EOL));
if (!flag('precios') && !flag('nuevos')) console.log('\nInforme solo de lectura: no se cambió nada.');
