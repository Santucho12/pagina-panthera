import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[390, 844], [390, 700], [360, 640], [412, 915], [820, 560]]) {
  const p = await b.newPage(); await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await espera(8500);
  const r = await p.evaluate(() => { const c = document.querySelector('.pnt-hero-v'), v = c.querySelector('video'), s = document.querySelector('.section-slider-home'), cb = c.getBoundingClientRect(), vb = v.getBoundingClientRect(), sb = s.getBoundingClientRect(), t = document.querySelector('.pnt-hero-cartel-btn'), ca = document.querySelector('.pnt-hero-cartel').getBoundingClientRect(), tb = t.getBoundingClientRect();
    return { vp: [innerWidth, innerHeight], hero: [Math.round(cb.top), Math.round(cb.bottom)], video: [Math.round(vb.top), Math.round(vb.bottom)], seccion: [Math.round(sb.top), Math.round(sb.bottom)], inlineH: c.style.height, lvh: CSS.supports('height', '100lvh'), btn: t.textContent + ' ' + Math.round(tb.width) + 'x' + Math.round(tb.height), btnDentro: tb.right <= ca.right }; });
  console.log(JSON.stringify(r)); if (w === 390 && h === 844) await p.screenshot({ path: 'revision-responsive/btn-celu.png' }); await p.close();
}
await b.close(); process.exit(0);
