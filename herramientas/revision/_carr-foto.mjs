import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
for (const [n, t] of [['rapido', 1500], ['tarde', 8000]]) {
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await espera(t);
  for (const sec of ['featured', 'sale']) {
    await p.evaluate((sec) => { const s = document.querySelector('[data-store="home-products-' + sec + '"]'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 110); }, sec); await espera(700);
    const sy = await p.evaluate(() => scrollY); await p.screenshot({ path: 'revision-responsive/carr-' + n + '-' + sec + '.png', clip: { x: 0, y: sy, width: 390, height: 640 } });
  }
  await p.close();
}
await b.close(); process.exit(0);
