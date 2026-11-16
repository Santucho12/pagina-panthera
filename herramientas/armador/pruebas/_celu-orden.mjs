// Celular: el orden de los pasos y la altura del 3D. node _celu-orden.mjs <a3|or> <etiqueta>
import path from 'path'; import { abrir, espera, AQUI } from './comun.mjs';
const cual = process.argv[2], et = process.argv[3], SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]';
const { browser, page } = await abrir({ ancho: 390, alto: 844, dpr: 2, celular: true, query: 'a3debug&ordebug' });
await espera(3500); await page.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
const ir = (dy) => page.evaluate((sel, dy) => { const st = document.querySelector(sel); const y = st.getBoundingClientRect().top + scrollY - 104 + dy; if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); } scrollTo(0, y); }, SEL, dy);
for (let i = 0; i < 60; i++) { await ir(0); if (await page.evaluate((sel) => { const c = document.querySelector(sel).shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); }, SEL)) break; await espera(500); }
await espera(3500);
const orden = await page.evaluate((sel) => { const r = document.querySelector(sel).shadowRoot; const q = (s) => { const e = r.querySelector(s); return e && !e.hidden ? Math.round(e.getBoundingClientRect().top + scrollY) : null; }; return { stage_alto: Math.round(r.getElementById('stage').getBoundingClientRect().height), paso1: q('.panel > .paso:first-child'), paso2: q('#paso2'), dock: q('.dock'), paso3: q('#paso3'), total: q('.total-ranura .total') }; }, SEL);
console.log(JSON.stringify(orden));
for (const [n, dy] of [[1, 0], [2, 330], [3, 760]]) { await ir(dy); await espera(900); await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '-' + n + '.png') }); }
await page.evaluate((sel) => { const r = document.querySelector(sel).shadowRoot; const b = r.querySelector('.card .mas, .card'); if (b) b.click(); const q = r.querySelector('[data-quitar]'); if (q) q.click(); }, SEL); await espera(900);
await ir(500); await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '-toast.png') });
await browser.close(); process.exit(0);
