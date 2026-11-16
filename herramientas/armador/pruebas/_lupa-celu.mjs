// Celular: el cartel de "verlo de cerca" con el escenario pegado. node _lupa-celu.mjs <a3|or> <k> <etiqueta>
import path from 'path'; import { abrir, espera, AQUI } from './comun.mjs';
const cual = process.argv[2], k = process.argv[3], et = process.argv[4], SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]', H = cual === 'a3' ? '__a3' : '__or';
const { browser, page } = await abrir({ ancho: 390, alto: 844, dpr: 2, celular: true, query: cual === 'a3' ? 'a3debug' : 'ordebug' });
await espera(3500); await page.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
const ir = (dy) => page.evaluate((sel, dy) => { const h = document.querySelector(sel); scrollTo(0, h.getBoundingClientRect().top + scrollY + dy); }, SEL, dy);
await ir(-300); await espera(5000); await ir(120); await espera(2500);
await page.evaluate((h, k) => window[h] && window[h].lupa(k), H, k); await espera(1800);
const r = await page.evaluate((sel) => { const s = document.querySelector(sel).shadowRoot, l = s.getElementById('lupa').getBoundingClientRect(), st = s.getElementById('stage').getBoundingClientRect(); return { lupa: [Math.round(l.top), Math.round(l.height)], stage: [Math.round(st.top), Math.round(st.height)], entra: l.top >= st.top - 0.5 }; }, SEL);
console.log(JSON.stringify(r));
const sy = await page.evaluate(() => scrollY); await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '.png'), clip: { x: 0, y: sy, width: 390, height: 420 } });
await browser.close(); process.exit(0);
