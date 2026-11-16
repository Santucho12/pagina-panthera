// ¿La segunda sección sube por encima del hero? Capturas a distintas alturas de scroll. node _hero-cubre.mjs <compu|celu> <etiqueta>
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const [modo, et] = process.argv.slice(2);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
const celu = modo === 'celu', W = celu ? 390 : 1440, H = celu ? 844 : 900;
if (celu) { await p.setViewport({ width: W, height: H, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'); }
else await p.setViewport({ width: W, height: H });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.goto('http://localhost:5700/', { waitUntil: 'networkidle2', timeout: 90000 }); await espera(5000);
await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
const info = await p.evaluate(() => [...document.querySelector('.js-home-sections-container').children].slice(0, 6).map((s) => { const cs = getComputedStyle(s); return (s.className || s.tagName).toString().slice(0, 50) + ' | order ' + cs.order + ' | ' + cs.position + ' z' + cs.zIndex + ' | bg ' + cs.backgroundColor; }));
console.log(info.join('\n'));
const fotos = [];
for (const f of [0, 0.25, 0.5, 0.75, 1.0]) {
  const y = Math.round(H * f);
  await p.evaluate((y) => { if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); }, y);
  await espera(500);
  const f2 = `revision-responsive/_hero-${et}-${Math.round(f * 100)}.png`; await p.screenshot({ path: f2 }); fotos.push(f2);
}
await b.close();
console.log(fotos.join(' '));
process.exit(0);
