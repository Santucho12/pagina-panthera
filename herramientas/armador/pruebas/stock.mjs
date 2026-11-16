// Stock en los dos armadores: node herramientas/armador/pruebas/stock.mjs
// (2026-11-15, pedido: "si un arito o pulsera o charm no está disponible (no hay stock), no debe aparecer")
// 1) Lo que armar.tpl / oreja.tpl marcan sin stock no se ve: ni tarjeta, ni pulsera, ni de entrada; los contadores coinciden.
// 2) Si la tienda rechaza algo al agregarlo (se agotó después de la última sincronización), desaparece en ese momento: un charm, un talle
//    (pasa al siguiente con stock), una pulsera que se queda sin talles (sale de la lista) y un arito.
// (2026-11-16, pedido: "siempre tiene que aparecer como mínimo 3 charms por defecto y 2 aritos por defecto… si se vende alguno, reemplazarlo")
// 3) De entrada hay siempre 3 charms y 2 aritos con stock; si los pedidos se agotan (acá: anotados como rechazados en este navegador), se
//    reemplazan por otros del mismo tema y el póster viejo no se muestra (el que corresponde sí).
// Los POST a /comprar/ se interceptan (el carrito real no se toca): contestan {"success":false} para las variantes de FALLA.
import { createRequire } from 'module';
import { CHROME, PREVIEW, espera, irASeccion, esperaListo, enA3 } from './comun.mjs';
const require = createRequire(import.meta.url);
const puppeteer = require('../../../node_modules/puppeteer-core');

const FALLA = new Set();     // variantes que la "tienda" rechaza
const res = [];
const ok = (nombre, cond, extra) => { res.push((cond ? 'OK   ' : 'FALLA') + ' ' + nombre + (extra !== undefined && extra !== '' ? ' · ' + extra : '')); };
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
const errores = [];
// una pestaña nueva, con el localStorage limpio (o con algo ya anotado como rechazado: agotados = ['a3:pain', 'or:estr'])
async function pestana(query, agotados = []) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)));
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    const u = r.url();
    if (/\/__(recarga|version)/.test(u)) return r.abort();
    if (r.method() === 'POST' && u.includes('/comprar')) {
      const v = new URLSearchParams(r.postData() || '').get('variant_id');
      return r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: !FALLA.has(v) }) });
    }
    if (r.isNavigationRequest() && r.frame() === page.mainFrame() && u.includes('/comprar')) return r.respond({ status: 204, body: '' });
    r.continue();
  });
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.evaluateOnNewDocument((agotados) => {
    try { const t = {}; agotados.forEach((k) => { t[k] = Date.now(); }); if (agotados.length) localStorage.setItem('pnt-agotados-v1', JSON.stringify(t)); } catch (e) {}
    window.pntCarrito = { abrir() {} };     // que "Agregar" no abra el carrito lateral (no hace falta acá)
  }, agotados);
  await page.goto(PREVIEW + '?' + query, { waitUntil: 'domcontentloaded', timeout: 120000 });
  return { page, ctx };
}
const enOr = (page, fn, ...args) => page.evaluate((src, args) => {
  const raiz = document.querySelector('[data-pnt-or]').shadowRoot;
  return (new Function('raiz', 'args', 'return (' + src + ')(raiz, ...args)'))(raiz, args);
}, fn.toString(), args);
const irAOreja = (page) => page.evaluate(() => { const h = document.querySelector('[data-pnt-or]'); const y = h.getBoundingClientRect().top + window.scrollY - 40; if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); } window.scrollTo(0, y); });
const entrada = (page) => page.evaluate(() => ({ a3: document.querySelector('[data-pnt-a3]').getAttribute('data-entrada'), a3poster: document.querySelector('[data-pnt-a3]').getAttribute('data-poster-de'),
  or: document.querySelector('[data-pnt-or]').getAttribute('data-entrada'), orposter: document.querySelector('[data-pnt-or]').getAttribute('data-poster-de') }));
const datosA3 = (page) => enA3(page, (raiz) => {
  const lis = [...raiz.querySelectorAll('[data-a3-charms] li')];
  const de = {}; lis.forEach((li) => { de[li.dataset.k] = { cat: li.dataset.cat, tipo: li.dataset.tipo, st: +li.dataset.st }; });
  return de;
});
const datosOr = (page) => enOr(page, (raiz) => {
  const de = {}; [...raiz.querySelectorAll('[data-or-aros] li')].forEach((li) => { de[li.dataset.k] = { cat: li.dataset.cat, tipo: li.dataset.tipo, st: +li.dataset.st }; });
  return de;
});

// ═════════ 1 y 2: lo sin stock no aparece; lo rechazado desaparece ═════════
let { page, ctx } = await pestana('a3debug');
await espera(3000); await irASeccion(page); await esperaListo(page, 3000);

const a3 = await enA3(page, (raiz) => {
  const lis = (s) => [...raiz.querySelectorAll(s + ' li')];
  const charmsCon = lis('[data-a3-charms]').filter((li) => +li.dataset.st > 0).map((li) => li.dataset.k);
  const charmsSin = lis('[data-a3-charms]').filter((li) => !(+li.dataset.st > 0)).map((li) => li.dataset.k);
  const basesCon = lis('[data-a3-bases]').filter((li) => li.dataset.talles.split(';').some((t) => +t.split('|')[2] > 0)).map((li) => li.dataset.k);
  const basesSin = lis('[data-a3-bases]').filter((li) => !basesCon.includes(li.dataset.k)).map((li) => li.dataset.k);
  const cards = [...raiz.querySelectorAll('#tira .card')].map((c) => c.dataset.k);
  const bases = [...raiz.querySelectorAll('#bases .base')].map((b) => b.dataset.b);
  const todos = raiz.querySelector('#chips .chip small')?.textContent;
  const sel = window.__a3 ? window.__a3.vivos.filter((c) => !c.sale).map((c) => c.k) : null;
  return { charmsCon, charmsSin, basesCon, basesSin, cards, bases, todos, dock: raiz.getElementById('dock-s').textContent, sel };
});
ok('pulsera: charms sin stock en armar.tpl ' + a3.charmsSin.join(', '), a3.charmsSin.length > 0);
ok('pulsera: ninguna tarjeta de un charm sin stock', !a3.cards.some((k) => a3.charmsSin.includes(k)));
ok('pulsera: una tarjeta por cada charm con stock', a3.cards.length === a3.charmsCon.length, `${a3.cards.length} tarjetas · ${a3.charmsCon.length} con stock`);
ok('pulsera: el contador "Todos" y el texto de la lista coinciden', +a3.todos === a3.cards.length && a3.dock.startsWith(a3.cards.length + ' charms'), `${a3.todos} · ${a3.dock}`);
ok('pulsera: pulseras sin ningún talle con stock fuera de la lista (' + (a3.basesSin.join(', ') || 'ninguna') + ')', !a3.bases.some((k) => a3.basesSin.includes(k)) && a3.bases.length === a3.basesCon.length, a3.bases.join(','));
ok('pulsera: de entrada, 3 charms y todos con stock', a3.sel && a3.sel.length === 3 && a3.sel.every((k) => a3.charmsCon.includes(k)), a3.sel && a3.sel.join(','));
const e0 = await entrada(page);
ok('pulsera: el póster es de la pulsera de entrada de hoy', e0.a3 === e0.a3poster, `${e0.a3} · póster ${e0.a3poster}`);

const estado = () => enA3(page, (raiz) => ({
  cards: [...raiz.querySelectorAll('#tira .card')].map((c) => c.dataset.k),
  bases: [...raiz.querySelectorAll('#bases .base')].map((b) => b.dataset.b),
  base: raiz.querySelector('#bases .base[aria-pressed="true"]')?.dataset.b,
  talle: raiz.querySelector('#talles .talle[aria-pressed="true"]')?.dataset.t,
  talles: [...raiz.querySelectorAll('#talles .talle')].map((t) => t.dataset.t + (t.disabled ? ' (sin)' : '')),
  sel: window.__a3 ? window.__a3.vivos.filter((c) => !c.sale).map((c) => c.k) : null,
  toast: raiz.getElementById('toast-t').textContent,
  todos: raiz.querySelector('#chips .chip small')?.textContent
}));
const agregar = async () => { await enA3(page, (raiz) => raiz.getElementById('cta').click()); await espera(4500); };
const variante = (k) => enA3(page, (raiz, k) => raiz.querySelector('[data-a3-charms] li[data-k="' + k + '"]').dataset.v, k);
const varTalle = (b, t) => enA3(page, (raiz, b, t) => raiz.querySelector('[data-a3-bases] li[data-k="' + b + '"]').dataset.talles.split(';').map((x) => x.split('|')).find((x) => x[0] === t)[1], b, t);

// a) un charm que la tienda rechaza: sale de la pulsera y de la lista (y queda anotado en el navegador)
await enA3(page, (raiz) => raiz.querySelector('.card[data-k="jaz"]').click()); await espera(1500);
FALLA.add(await variante('jaz'));
await agregar();
let e = await estado();
ok('pulsera: el charm rechazado (Jazmín) sale de la lista y de la pulsera', !e.cards.includes('jaz') && !e.sel.includes('jaz') && /Jazmín/.test(e.toast), `${e.toast} · ${e.sel}`);
ok('pulsera: los contadores bajan uno', +e.todos === a3.cards.length - 1, e.todos);
ok('pulsera: queda anotado en el navegador (12 h)', await page.evaluate(() => /"a3:jaz"/.test(localStorage.getItem('pnt-agotados-v1') || '')));

// b) un talle rechazado: queda "Sin stock" y pasa al siguiente con stock (Crystal 19 cm → 20 cm)
await enA3(page, (raiz) => raiz.querySelector('.base[data-b="crys"]').click()); await espera(3000);
await enA3(page, (raiz) => raiz.querySelector('.talle[data-t="19 cm"]').click()); await espera(1200);
FALLA.add(await varTalle('crys', '19 cm'));
await agregar();
e = await estado();
ok('pulsera: talle rechazado → "Sin stock" y pasa a otro con stock', e.base === 'crys' && e.talles.includes('19 cm (sin)') && e.talle && e.talle !== '19 cm' && /otro talle/.test(e.toast), `${e.talles.join(', ')} · elegido ${e.talle} · ${e.toast}`);

// c) una pulsera que se queda sin talles (Broche de cristales circulares: solo 19 cm) sale de la lista y se elige otra
await enA3(page, (raiz) => raiz.querySelector('.base[data-b="circ"]').click()); await espera(3000);
FALLA.add(await varTalle('circ', '19 cm'));
await agregar();
e = await estado();
ok('pulsera: sin ningún talle → la pulsera sale de la lista y queda otra elegida', !e.bases.includes('circ') && e.base && e.base !== 'circ' && /otra pulsera/.test(e.toast), `${e.bases.join(',')} · elegida ${e.base} · ${e.toast}`);

// ── Armá tu oreja ──
await irAOreja(page); await espera(5000);
const or = await enOr(page, (raiz) => {
  const lis = [...raiz.querySelectorAll('[data-or-aros] li')];
  return { con: lis.filter((li) => +li.dataset.st > 0).map((li) => li.dataset.k), sin: lis.filter((li) => !(+li.dataset.st > 0)).map((li) => li.dataset.k),
    cards: [...raiz.querySelectorAll('#tira .card')].map((c) => c.dataset.k), dock: raiz.getElementById('dock-s').textContent };
});
ok('oreja: aritos sin stock en oreja.tpl ' + or.sin.join(', '), or.sin.length > 0);
ok('oreja: ninguna tarjeta de un arito sin stock', !or.cards.some((k) => or.sin.includes(k)));
ok('oreja: una tarjeta por cada arito con stock', or.cards.length === or.con.length && or.dock.startsWith(or.cards.length + ' aros'), `${or.cards.length} tarjetas · ${or.con.length} con stock`);
const ent0 = (e0.or || '').split(',').filter(Boolean);
ok('oreja: de entrada, 2 aritos y todos con stock', ent0.length === 2 && ent0.every((x) => or.con.includes(x.split(':')[1])), e0.or);
ok('oreja: el póster es de los aritos de entrada de hoy', e0.or === e0.orposter, `${e0.or} · póster ${e0.orposter}`);
// un arito rechazado sale de la oreja y de la lista
const kOr = or.cards.find((k) => !ent0.some((x) => x.endsWith(':' + k)));
await enOr(page, (raiz, k) => raiz.querySelector('.card[data-k="' + k + '"]').click(), kOr); await espera(1500);
FALLA.add(await enOr(page, (raiz, k) => raiz.querySelector('[data-or-aros] li[data-k="' + k + '"]').dataset.v, kOr));
await enOr(page, (raiz) => raiz.getElementById('cta').click()); await espera(4500);
const or2 = await enOr(page, (raiz) => ({ cards: [...raiz.querySelectorAll('#tira .card')].map((c) => c.dataset.k), toast: raiz.getElementById('toast-t').textContent }));
ok('oreja: el arito rechazado sale de la lista', !or2.cards.includes(kOr) && or2.cards.length === or.cards.length - 1 && /No pudimos agregar/.test(or2.toast), `${kOr} · ${or2.toast}`);
await ctx.close();

// ═════════ 3: siempre 3 charms y 2 aritos de entrada, aunque se agoten los pedidos ═════════
const DEMORA = 'a3debug&a3demora=25000&ordebug&ordemora=25000';      // el 3D tarda: se ve si aparece el póster
// control: con todo en stock, el póster aparece
({ page, ctx } = await pestana(DEMORA));
await espera(3000); await irASeccion(page); await espera(2500);
ok('póster de la pulsera: aparece si el 3D tarda (control)', await enA3(page, (raiz) => raiz.getElementById('cargando').classList.contains('con-poster')));
await irAOreja(page); await espera(2500);
ok('póster de la oreja: aparece si el 3D tarda (control)', await enOr(page, (raiz) => raiz.getElementById('cargando').classList.contains('con-poster')));
await ctx.close();

// los pedidos se agotaron: Painter (charm) y Estrellita rose (arito) anotados como rechazados en este navegador
({ page, ctx } = await pestana(DEMORA, ['a3:pain', 'or:estr']));
await espera(3000); await irASeccion(page); await espera(2500);
const e1 = await entrada(page), dA3 = await datosA3(page), dOr = await datosOr(page);
const ch1 = (e1.a3 || '').split('|')[2].split(',').filter(Boolean);
const nuevo = ch1.find((k) => !['pain', 'mick', 'stit'].includes(k));
ok('pulsera: con Painter agotado siguen siendo 3 charms de entrada', ch1.length === 3 && !ch1.includes('pain') && ch1.every((k) => dA3[k] && dA3[k].st > 0), e1.a3);
ok('pulsera: el reemplazo de Painter es del mismo tema y forma (' + dA3.pain.cat + ', ' + (dA3.pain.tipo === 'd' ? 'colgante' : 'cuenta') + ')',
  ch1[0] === nuevo && dA3[nuevo] && dA3[nuevo].cat === dA3.pain.cat && dA3[nuevo].tipo === dA3.pain.tipo, nuevo + ' ' + JSON.stringify(dA3[nuevo]));
ok('pulsera: el póster viejo (con Painter) no se muestra', !(await enA3(page, (raiz) => raiz.getElementById('cargando').classList.contains('con-poster'))));
const sel1 = await enA3(page, (raiz) => [...raiz.querySelectorAll('#lista li [data-quitar]')].map((b) => b.dataset.quitar));
ok('pulsera: la combinación de entrada es esa (lista y total)', sel1.join() === ch1.join(), sel1.join());
await irAOreja(page); await espera(2500);
const ar1 = (e1.or || '').split(',').filter(Boolean).map((x) => x.split(':'));
const nuevoAr = ar1.map((x) => x[1]).find((k) => k !== 'estr' && k !== 'chag');
ok('oreja: con Estrellita rose agotada siguen siendo 2 aritos de entrada', ar1.length === 2 && !ar1.some((x) => x[1] === 'estr') && ar1.every((x) => dOr[x[1]] && dOr[x[1]].st > 0 && dOr[x[1]].tipo !== 'cuff'), e1.or);
ok('oreja: el reemplazo va en el mismo lugar (1.er arito) y es del mismo tema (' + dOr.estr.cat + ')', ar1[0] && ar1[0][0] === 'l1' && ar1[0][1] === nuevoAr && dOr[nuevoAr].cat === dOr.estr.cat, nuevoAr + ' ' + JSON.stringify(dOr[nuevoAr]));
ok('oreja: el póster viejo (con Estrellita rose) no se muestra', !(await enOr(page, (raiz) => raiz.getElementById('cargando').classList.contains('con-poster'))));
await ctx.close();

ok('sin errores de JavaScript', !errores.length, errores.join(' | '));
console.log(res.join('\n'));
console.log(res.filter((r) => r.startsWith('FALLA')).length ? '\nHay fallas' : '\nTodo OK');
await browser.close();
process.exit(0);
