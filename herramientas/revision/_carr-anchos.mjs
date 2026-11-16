import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
for (const w of [360, 414, 450, 500, 600, 700, 767]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:5700/', { waitUntil: 'load', timeout: 120000 }); await espera(7000);
  const r = await p.evaluate(() => [...document.querySelectorAll('[data-store="home-products-featured"], [data-store="home-products-sale"]')].map((s) => { const sw = s.querySelector('.pnt-mv-swiper'); const x = sw && sw.swiper; const vis = [...s.querySelectorAll('.swiper-slide')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 4 && r.left < innerWidth - 4; }); return (x ? x.params.slidesPerView : 'SIN SWIPER') + ' por vista · tarjetas a la vista ' + vis.length + ' de ' + Math.round(vis[0] ? vis[0].getBoundingClientRect().width : 0) + ' px'; }));
  console.log(String(w).padStart(4), 'px →', r.join('  |  ')); await p.close();
}
await b.close(); process.exit(0);
