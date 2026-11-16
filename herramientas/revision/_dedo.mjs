import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const cdp = await p.target().createCDPSession();
for (const [nombre, url] of [['página simple', 'data:text/html,<body style="margin:0"><div style="height:5000px;background:linear-gradient(red,blue)"></div>'], ['inicio', 'http://localhost:5700/']]) {
  await p.goto(url, { waitUntil: 'load', timeout: 120000 }); await espera(nombre === 'inicio' ? 7000 : 500);
  const bajo = await p.evaluate(() => { const e = document.elementFromPoint(195, 600); const out = []; for (let n = e; n && n !== document.documentElement; n = n.parentElement) { const t = getComputedStyle(n).touchAction; if (t !== 'auto') out.push((n.tagName + '.' + (n.className + '').slice(0, 30)) + ' touch-action:' + t); } return { el: e ? e.tagName + '.' + (e.className + '').slice(0, 40) : null, touch: out, overflowHtml: getComputedStyle(document.documentElement).overflowY, overflowBody: getComputedStyle(document.body).overflowY }; });
  const y0 = await p.evaluate(() => scrollY);
  await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 600, yDistance: -600, speed: 1800, gestureSourceType: 'touch' }); await espera(800);
  const y1 = await p.evaluate(() => scrollY);
  console.log(nombre, '· scrollY', y0, '→', y1, '·', JSON.stringify(bajo));
}
await b.close(); process.exit(0);
