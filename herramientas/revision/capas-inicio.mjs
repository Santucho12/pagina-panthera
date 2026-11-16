// Cuántas capas gráficas (compositing) y de qué tamaño hay en el inicio: node herramientas/revision/capas-inicio.mjs <celu|compu>
import { createRequire } from 'module';
const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const modo = process.argv[2] || 'celu'; const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
if (modo === 'celu') await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }); else await p.setViewport({ width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const s = await p.target().createCDPSession();
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await espera(2500); await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove())); await espera(8000);
let ult = []; s.on('LayerTree.layerTreeDidChange', (e) => { ult = e.layers || []; });
await s.send('DOM.enable'); await s.send('LayerTree.enable');
for (const y of [0, 2400, 5200, 8000]) {
  await p.evaluate((y) => { if (window.lenis) window.lenis.stop(); window.scrollTo(0, y); }, y); await espera(1600);
  const capas = ult.filter((l) => l.drawsContent);
  const area = capas.reduce((a, l) => a + l.width * l.height, 0), px = (modo === 'celu' ? 9 : 1.5625);
  const grandes = [...capas].sort((a, c) => c.width * c.height - a.width * a.height).slice(0, 5).map((l) => Math.round(l.width) + 'x' + Math.round(l.height));
  console.log('y=' + y, 'capas:', ult.length, 'con contenido:', capas.length, '· área total ≈', Math.round(area * px / 1e6) + ' Mpx de textura', '· mayores:', grandes.join(' '));
}
const cuenta = await p.evaluate(() => ({ nodos: document.getElementsByTagName('*').length, pnt_ap_el: document.querySelectorAll('.pnt-ap-el').length, data_pnt_an: document.querySelectorAll('[data-pnt-an]').length, imgs: document.images.length, lazy: [...document.images].filter((i) => i.loading === 'lazy').length, svg: document.querySelectorAll('svg').length }));
console.log(JSON.stringify(cuenta));
await b.close(); process.exit(0);
