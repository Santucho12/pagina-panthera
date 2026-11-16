// El 3D de celular con la altura útil de un iPhone (390×745: Safari descuenta sus barras). node _alto-iphone.mjs <a3|or> <etiqueta> [k1,k2]
import path from 'path'; import { abrir, espera, AQUI } from './comun.mjs';
const cual = process.argv[2], et = process.argv[3], extra = (process.argv[4] || '').split(',').filter(Boolean), SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]';
const { browser, page } = await abrir({ ancho: 390, alto: 745, dpr: 2, celular: true, query: '' });
await espera(3500); await page.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
const ir = (dy) => page.evaluate((sel, dy) => { const h = document.querySelector(sel); scrollTo(0, h.getBoundingClientRect().top + scrollY + dy); }, SEL, dy);
await ir(-300); await espera(5000);
for (const k of extra) { await page.evaluate((sel, k) => { const c = document.querySelector(sel).shadowRoot.querySelector('.card[data-k="' + k + '"]'); if (c) c.click(); }, SEL, k); await espera(900); }
await ir(60); await espera(3500);
const r = await page.evaluate((sel) => { const st = document.querySelector(sel).shadowRoot.getElementById('stage').getBoundingClientRect(); return { stage: [Math.round(st.top), Math.round(st.height), Math.round(st.width)] }; }, SEL);
console.log(JSON.stringify(r));
const sy = await page.evaluate(() => scrollY); await page.screenshot({ path: path.join(AQUI, 'capturas', 'realismo', et + '.png'), clip: { x: 0, y: sy, width: 390, height: 520 } });
await browser.close(); process.exit(0);
