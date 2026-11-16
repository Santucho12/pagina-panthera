// ¿El escenario queda pegado en el celular al bajar por la lista? node _pegado.mjs <a3|or> <etiqueta>
import path from 'path'; import { abrir, espera, AQUI } from './comun.mjs';
const cual = process.argv[2], et = process.argv[3], SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]';
const { browser, page } = await abrir({ ancho: 390, alto: 844, dpr: 2, celular: true, query: 'a3debug&ordebug' });
await espera(3500);
await page.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
const ir = (dy) => page.evaluate((sel, dy) => { const st = document.querySelector(sel); const y = st.getBoundingClientRect().top + scrollY - 104 + dy; if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); } scrollTo(0, y); }, SEL, dy);
for (let i = 0; i < 60; i++) { await ir(0); if (await page.evaluate((sel) => { const c = document.querySelector(sel).shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); }, SEL)) break; await espera(500); }
await espera(4000);
for (const [n, dy] of [[1, 0], [2, 420], [3, 1100]]) {
  await ir(dy); await espera(900);
  const r = await page.evaluate((sel) => { const s = document.querySelector(sel).shadowRoot.getElementById('stage').getBoundingClientRect(); return [Math.round(s.top), Math.round(s.height)]; }, SEL);
  console.log('bajando', dy, '→ escenario arriba en', r[0], 'px, alto', r[1]);
  await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '-' + n + '.png') });
}
if (process.argv[4]) { await page.evaluate((sel, k) => { document.querySelector(sel).shadowRoot.querySelector('.card[data-k="' + k + '"]').click(); }, SEL, process.argv[4]); await espera(3000); await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '-4.png') }); }
await browser.close(); process.exit(0);
