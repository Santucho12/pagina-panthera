// Un charm mientras se enhebra, cuadro por cuadro y de cerca: node _canto.mjs <k> <etiqueta>
import path from 'path'; import fs from 'fs'; import { abrir, espera, irASeccion, esperaListo, clicCharm, AQUI } from './comun.mjs';
const k = process.argv[2] || 'home', et = process.argv[3] || 'canto';
const { browser, page } = await abrir({ ancho: 1536, alto: 730, dpr: 2, query: 'a3debug' });
const cdp = await page.target().createCDPSession();
await espera(3000); await irASeccion(page); await esperaListo(page, 4000);
const clip = await page.evaluate(() => { const r = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.left + scrollX, y: Math.max(0, r.top) + scrollY, width: r.width, height: Math.min(r.bottom, innerHeight) - Math.max(0, r.top), scale: 1 }; });
await page.evaluate(() => window.__a3.relojManual(true));
await clicCharm(page, k);
const fs2 = [];
for (let i = 0; i < 70; i++) { await page.evaluate(() => window.__a3.avanza(1 / 30)); if ([14, 20, 26, 32, 38, 46, 56, 68].includes(i)) { const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip }); const f = path.join(AQUI, 'capturas', 'realismo', et + '-' + i + '.png'); fs.writeFileSync(f, Buffer.from(data, 'base64')); fs2.push(f); } }
console.log(fs2.length); await browser.close(); process.exit(0);
