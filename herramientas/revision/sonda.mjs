// Sonda: imprime estructura y estilos de elementos en una página. node sonda.mjs <ruta> <celu|compu> <selector>...
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const [ruta, modo, ...sels] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
if (modo === 'celu') { await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'); }
else await p.setViewport({ width: 1536, height: 864 });
await p.goto('http://localhost:5700' + ruta, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => console.log('goto: ' + e.message));
await new Promise((r) => setTimeout(r, 2500));
for (const s of sels) {
  const out = await p.evaluate((s) => [...document.querySelectorAll(s)].slice(0, 3).map((el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { html: el.outerHTML.replace(/\s+/g, ' ').slice(0, 700), caja: [r.x, r.y, r.width, r.height].map(Math.round).join(','),
      css: ['font-size', 'margin', 'padding', 'border', 'background-color', 'text-transform', 'gap', 'display'].map((k) => k + ':' + cs.getPropertyValue(k)).join('; ') };
  }), s);
  console.log('\n### ' + s + ' (' + out.length + ')');
  out.forEach((o) => console.log(o.caja + '\n' + o.css + '\n' + o.html));
}
await b.close();
