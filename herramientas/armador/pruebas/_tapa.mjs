// Celular: la franja blanca sobre el escenario pegado. node _tapa.mjs <a3|or> <etiqueta>
import path from 'path'; import { abrir, espera, AQUI } from './comun.mjs';
const cual = process.argv[2], et = process.argv[3], SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]';
const { browser, page } = await abrir({ ancho: 390, alto: 844, dpr: 2, celular: true, query: '' });
await espera(3500); await page.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
const ir = (dy) => page.evaluate((sel, dy) => { const h = document.querySelector(sel); const y = h.getBoundingClientRect().top + scrollY + dy; scrollTo(0, y); }, SEL, dy);
await ir(-300); await espera(5000);
for (const [n, dy] of [[1, -250], [2, 60], [3, 700]]) {
  await ir(dy); await espera(900);
  const r = await page.evaluate((sel) => { const h = document.querySelector(sel), st = h.shadowRoot.getElementById('stage'); return { pegado: h.classList.contains('pnt-pegado'), stageTop: Math.round(st.getBoundingClientRect().top) }; }, SEL);
  console.log('paso', n, JSON.stringify(r));
  const sy = await page.evaluate(() => scrollY); await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '-' + n + '.png'), clip: { x: 0, y: sy, width: 390, height: 420 } });
}
await browser.close(); process.exit(0);
