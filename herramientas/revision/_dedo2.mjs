import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.OCULTO ? 'new' : false, args: ['--no-sandbox', '--enable-gpu', '--window-size=430,960'] });
const p = (await b.pages())[0]; await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const cdp = await p.target().createCDPSession();
async function deslizar(dist, ms) {        // dedo de abajo hacia arriba: touchStart, ~16 ms por paso, touchEnd (con velocidad: el navegador sigue solo)
  const x = 195, y0 = 650, pasos = Math.max(4, Math.round(ms / 16));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= pasos; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - dist * i / pasos }] }); await espera(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
for (const [nombre, url] of [['página simple', 'data:text/html,<body style="margin:0"><div style="height:5000px;background:linear-gradient(red,blue)"></div>'], ['inicio', 'http://localhost:5700/']]) {
  await p.goto(url, { waitUntil: 'load', timeout: 120000 }); await espera(nombre === 'inicio' ? 7000 : 500);
  const y0 = await p.evaluate(() => scrollY); await deslizar(400, 160); await espera(1200); const y1 = await p.evaluate(() => scrollY);
  console.log(nombre, '· scrollY', y0, '→', y1);
}
await b.close(); process.exit(0);
