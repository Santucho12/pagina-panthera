// Prueba de funciones del armador (para cada fase): node herramientas/armador/pruebas/funciones.mjs [query] [--sin-cdn]
// Sumar con la tarjeta, sacar desde "Tu combinación", Deshacer, mover, cambiar base y talle, girar arrastrando, tocar un charm en
// el 3D, arrastrar una tarjeta al escenario y "Agregar al carrito" (los POST se interceptan: el carrito real no se toca).
// Con --sin-cdn corta jsDelivr: la sección tiene que seguir andando sin 3D (elegir charms, total y carrito).
import { abrir, irASeccion, esperaListo, espera, enA3, clicBase, clicCharm, clicTalle } from './comun.mjs';
// Los charms y el talle de entrada salen de la página: data-entrada del armador ("silv|18 cm|pain,mmre,stit"). Desde el 2026-11-16 armar3d.js
// los elige solo: siempre 3 con stock (los pedidos, Painter, Mickey Shine y Stitch, y en el lugar de los que se agotaron, otros).
let DE_ENTRADA = [], TALLE_ENTRADA = '', PRIMERO, SEGUNDO;

const query = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'a3debug';
const sinCdn = process.argv.includes('--sin-cdn');
const { browser, page, avisos, pedidos } = await abrir({ query, sinCdn });
const res = [];
const ok = (nombre, cond, extra) => { res.push((cond ? 'OK   ' : 'FALLA') + ' ' + nombre + (extra ? ' · ' + extra : '')); };
const sel = () => enA3(page, (raiz) => Array.prototype.map.call(raiz.querySelectorAll('#lista li [data-quitar]'), (b) => b.dataset.quitar));
const cuenta = () => enA3(page, (raiz) => +raiz.getElementById('cuenta').textContent);
const vivos3d = () => page.evaluate(() => window.__a3 ? window.__a3.vivos.filter((c) => !c.sale).map((c) => c.k) : null);

await espera(3000); await irASeccion(page); await esperaListo(page, 4200);
{
  const [, talle, charms] = await page.evaluate(() => (document.querySelector('[data-pnt-a3]').getAttribute('data-entrada') || '||').split('|'));
  TALLE_ENTRADA = talle; DE_ENTRADA = (charms || '').split(',').filter(Boolean); [PRIMERO, SEGUNDO] = DE_ENTRADA;
}
ok('siempre 3 charms de entrada (2026-11-16)', DE_ENTRADA.length === 3, DE_ENTRADA.join(','));
const tresD = await enA3(page, (raiz) => raiz.getElementById('nogl').hidden);
ok(sinCdn ? 'sin CDN: aviso de "sin 3D" a la vista' : '3D cargado', sinCdn ? !tresD : tresD);
if (sinCdn) {   // sin 3D: el póster (la pulsera de ejemplo) con un aviso chico, y el mismo ejemplo en la lista
  ok('sin 3D se ve el póster', await enA3(page, (raiz) => { const c = raiz.getElementById('cargando'); return c.classList.contains('con-poster') && getComputedStyle(c).visibility === 'visible'; }));
}
// Al entrar: la pulsera Silver Flower elegida, un talle marcado y los charms de DE_ENTRADA, sin "Tu combinación" a la vista
const toastTxt = () => enA3(page, (raiz) => raiz.getElementById('toast').classList.contains('ve') ? raiz.getElementById('toast-t').textContent : '');
const ini = await sel();
ok('arranca con los charms de entrada (' + DE_ENTRADA.join(', ') + ') y sin "Tu combinación" a la vista', ini.join() === DE_ENTRADA.join() && await enA3(page, (raiz) => raiz.getElementById('paso3').hidden && !raiz.getElementById('ejemplo')), ini.join());
// (desde 2026-11-11, pedido del usuario a otra sesión: siempre viene un talle marcado, el primero con stock)
const talleIni = await enA3(page, (raiz) => { const t = raiz.querySelector('.talle[aria-pressed="true"]'); return t ? t.textContent.trim() : ''; });
ok('arranca con la pulsera elegida y un talle marcado' + (TALLE_ENTRADA ? ' (' + TALLE_ENTRADA + ')' : ''), await enA3(page, (raiz) => (raiz.querySelector('.base[aria-pressed="true"]') || {}).dataset?.b === 'silv' && !raiz.getElementById('paso2').hidden) && !!talleIni && (!TALLE_ENTRADA || talleIni.startsWith(TALLE_ENTRADA)), talleIni);
await clicCharm(page, 'jaz'); await espera(1300);
ok('sumar Jazmín', (await sel()).join() === DE_ENTRADA.concat('jaz').join(), (await sel()).join());

await clicCharm(page, 'vali'); await espera(1300);
ok('sumar con la tarjeta', (await sel()).includes('vali') && (await cuenta()) === DE_ENTRADA.length + 2);   // los de entrada + Jazmín + Valija (2026-11-15: ya no 3 fijos)
if (!sinCdn) ok('el 3D tiene el charm sumado', ((await vivos3d()) || []).includes('vali'));

await clicCharm(page, PRIMERO); await espera(700);
ok('sacar tocando su tarjeta otra vez', !(await sel()).includes(PRIMERO));
await enA3(page, (raiz) => raiz.getElementById('toast-b').click()); await espera(1300);
ok('Deshacer lo vuelve a poner', (await sel()).includes(PRIMERO));

await clicBase(page, 'crys'); await espera(3200);
ok('elegir la pulsera', await enA3(page, (raiz) => raiz.querySelector('.base[data-b="crys"]').getAttribute('aria-pressed') === 'true' && raiz.getElementById('base-n').textContent === 'Pulsera Crystal'));
ok('al cambiar de pulsera queda un talle marcado', await enA3(page, (raiz) => !raiz.getElementById('paso2').hidden && !!raiz.querySelector('.talle[aria-pressed="true"]')));
await clicTalle(page, '20 cm'); await espera(900);
ok('cambiar el talle', await enA3(page, (raiz) => raiz.getElementById('t-lbl').textContent.startsWith('Pulsera 20 cm')));

if (!sinCdn) {
  // girar arrastrando sobre el escenario (lejos de los charms: arriba a la izquierda del canvas)
  const caja = await enA3(page, (raiz) => { const r = raiz.getElementById('c').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const rot0 = await page.evaluate(() => window.__a3 && window.__a3.scene.children.find((o) => o.isGroup && o.children.length > 3).rotation.y);
  await page.mouse.move(caja.x + caja.w * 0.15, caja.y + caja.h * 0.12); await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(caja.x + caja.w * 0.15 + i * 14, caja.y + caja.h * 0.12); await espera(16); }
  const rot1 = await page.evaluate(() => window.__a3 && window.__a3.scene.children.find((o) => o.isGroup && o.children.length > 3).rotation.y);
  await page.mouse.up(); await espera(1500);
  ok('girar arrastrando', Math.abs(rot1 - rot0) > 0.15, (rot1 - rot0).toFixed(2) + ' rad');

  // tocar un charm en el 3D: busca dónde se ve el 2.º charm de entrada y hace clic ahí
  const pos = await page.evaluate((k) => {
    const a = window.__a3, ch = a.vivos.find((c) => c.k === k && !c.sale); if (!ch) return null;
    const v = ch.piv.getWorldPosition(new a.THREE.Vector3()).project(a.camera);
    const r = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('c').getBoundingClientRect();
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  }, SEGUNDO);
  if (pos) { await page.mouse.click(pos.x, pos.y); await espera(1400); }
  const lupa = () => enA3(page, (raiz) => { const l = raiz.getElementById('lupa'); return { ve: !l.hidden && l.classList.contains('ve'), n: raiz.getElementById('lupa-n').textContent, sacar: !raiz.getElementById('lupa-sacar').hidden }; });
  let L = await lupa();
  const nombre2 = await enA3(page, (raiz, k) => (raiz.querySelector('.card[data-k="' + k + '"] .card-n') || {}).textContent || '', SEGUNDO);
  ok('tocar un charm en el 3D abre la lupa', pos && L.ve && !!L.n && nombre2.trim().toLowerCase() === L.n.trim().toLowerCase() && L.sacar, L.n + ' / ' + nombre2.trim());
  await enA3(page, (raiz) => raiz.getElementById('lupa-sacar').click()); await espera(900);
  L = await lupa();
  ok('"Sacar de la pulsera" lo saca y cierra la lupa', !(await sel()).includes(SEGUNDO) && !L.ve);
  await enA3(page, (raiz) => { const b = raiz.getElementById('toast-b'); if (!b.hidden) b.click(); }); await espera(1400);
  // tocar el cierre: su lupa (sin "Sacar"); Esc la cierra
  const pc = await page.evaluate(() => {
    const a = window.__a3, g = a.scene.children.find((o) => o.isGroup && o.children.length > 3), c = g.children.find((o) => o.userData && o.userData.tipo && o.visible);
    if (!c) return null; const v = c.getWorldPosition(new a.THREE.Vector3()).project(a.camera);
    const r = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('c').getBoundingClientRect();
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  });
  if (pc) { await page.mouse.click(pc.x, pc.y); await espera(1400); }
  L = await lupa();
  ok('tocar el cierre abre su lupa', pc && L.ve && L.n.startsWith('Pulsera') && !L.sacar, L.n);
  await page.keyboard.press('Escape'); await espera(700);
  ok('Esc cierra la lupa', !(await lupa()).ve);

  // arrastrar una tarjeta hasta el escenario
  const t = await enA3(page, (raiz) => { const c = raiz.querySelector('.card[data-k="ange"]'); c.scrollIntoView({ block: 'nearest' }); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.width / 2 }; });
  const st = await enA3(page, (raiz) => { const r = raiz.getElementById('stage').getBoundingClientRect(); return { x: r.left + r.width * 0.45, y: r.top + r.height * 0.4 }; });
  await page.mouse.move(t.x, t.y); await page.mouse.down();
  for (let i = 1; i <= 15; i++) { await page.mouse.move(t.x + (st.x - t.x) * i / 15, t.y + (st.y - t.y) * i / 15); await espera(16); }
  await page.mouse.up(); await espera(1500);
  ok('arrastrar una tarjeta a la pulsera', (await sel()).includes('ange'));
}

const n = (await sel()).length;
await enA3(page, (raiz) => raiz.getElementById('cta').click()); await espera(1200);
ok('al agregar avisa que ya está en el carrito', (await toastTxt()).includes('ya están en tu carrito'), await toastTxt());
await espera(2400);
const posts = pedidos.filter((p) => p.includes('add_to_cart'));
const base = posts.find((p) => p.includes('variation'));
ok('carrito: un POST por producto (pulsera + charms)', posts.length === n + 1, posts.length + ' de ' + (n + 1));
ok('carrito: la pulsera va con talle y add_to_cart_enhanced', !!base && /variation%5B0%5D=20\+cm|variation\[0\]=20/.test(decodeURIComponent(base)) && base.includes('add_to_cart_enhanced=1'));
// (desde 2026-11-12 abre el carrito lateral en vez de ir a /comprar/)
ok('carrito: después abre el carrito lateral', pedidos.includes('ir al carrito') || await page.evaluate(() => !!document.querySelector('.is-abierto iframe[src*="pnt-panel"]')));

console.log(res.join('\n'));
console.log('avisos:', avisos.length ? avisos : 'ninguno');
await browser.close();
process.exit(res.some((r) => r.startsWith('FALLA')) ? 1 : 0);
