// Fotos rápidas de un armador para comparar antes/después: node herramientas/armador/pruebas/mira.mjs <a3|or> <etiqueta> [celu] [k1,k2…]
// Saca: <etiqueta>-1.png (como arranca) y <etiqueta>-2.png (con las piezas extra puestas), el escenario a 2×. En celu, la ventana.
import path from 'path'; import fs from 'fs';
import { abrir, espera, AQUI } from './comun.mjs';
const cual = process.argv[2] || 'or', et = process.argv[3] || 'mira', celu = process.argv.includes('celu');
const extra = (process.argv.slice(4).find((x) => x !== 'celu') || (cual === 'or' ? 'espm,cshi' : 'jaz,vali')).split(',');
const DIR = path.join(AQUI, 'capturas', 'realismo'); fs.mkdirSync(DIR, { recursive: true });
const SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]';
const { browser, page, avisos } = await abrir(celu ? { ancho: 390, alto: 844, dpr: 3, celular: true, query: 'a3debug&ordebug' } : { ancho: 1536, alto: 730, dpr: 1.25, query: 'a3debug&ordebug' });
const cdp = await page.target().createCDPSession();
const irA = async (arriba) => { for (let i = 0; i < 50; i++) { const top = await page.evaluate((sel, arriba) => { const st = document.querySelector(sel).shadowRoot.getElementById('stage'); const y = st.getBoundingClientRect().top + scrollY - arriba; if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); } scrollTo(0, y); return st.getBoundingClientRect().top; }, SEL, arriba); if (Math.abs(top - arriba) < 4) return; await espera(300); } };
const ARR = celu ? 150 : 150;      // debajo de la barra flotante, como lo ve una persona
await espera(3000);
await page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find((x) => /entendido|aceptar/i.test(x.textContent || '')); if (b) b.click(); });
for (let i = 0; i < 120; i++) { await irA(ARR); if (await page.evaluate((sel) => { const c = document.querySelector(sel).shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); }, SEL)) break; await espera(500); }
for (let t = 0; t < 4500; t += 500) { await irA(ARR); await espera(500); }
const foto = async (n) => {
  await irA(ARR); await espera(200);
  if (celu) { await page.screenshot({ path: path.join(DIR, et + '-' + n + '.png') }); return; }
  const clip = await page.evaluate((sel) => { const r = document.querySelector(sel).shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.left + scrollX, y: Math.max(0, r.top) + scrollY, width: r.width, height: Math.min(r.bottom, innerHeight) - Math.max(0, r.top) }; }, SEL);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { ...clip, scale: 2 } });
  fs.writeFileSync(path.join(DIR, et + '-' + n + '.png'), Buffer.from(data, 'base64'));
};
await foto(1);
for (const k of extra) { await page.evaluate((sel, k) => { const c = document.querySelector(sel).shadowRoot.querySelector('.card[data-k="' + k + '"]'); if (c) c.click(); }, SEL, k); await espera(900); }
await espera(3200); await foto(2);
console.log('avisos:', avisos.length ? avisos.slice(0, 6) : 'ninguno');
await browser.close(); process.exit(0);
