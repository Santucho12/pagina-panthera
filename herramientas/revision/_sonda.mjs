// node _sonda.mjs <ruta> <celu|compu> "<js que devuelve algo>"
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const [ruta, modo, js] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
if (modo === 'celu') { await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'); }
else { await p.setViewport({ width: 1440, height: 900 }); await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'); }
await p.goto('http://localhost:5700' + ruta, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => console.log('goto:', e.message));
await new Promise((r) => setTimeout(r, 3500));
console.log(JSON.stringify(await p.evaluate(js), null, 1));
await b.close();
