// La columna de compra de la ficha: qué cambia de alto durante la carga
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
import fs from 'fs'; import path from 'path';
const modo = process.argv[2] || 'compu', ruta = process.argv[3] || '/productos/pulsera-silver-flower-454/'; const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = path.join(process.env.TEMP, 'pnt-ficha-' + Date.now());
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', userDataDir: perfil, args: ['--no-sandbox', '--enable-gpu'] });
const p = await b.newPage(); await p.setViewport(modo === 'celu' ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.evaluateOnNewDocument(() => { window.__l = []; let ult = '';
  (function f() { if (document.body) { const q = (s) => document.querySelector(s); const h = (e) => e ? Math.round(e.getBoundingClientRect().height) + '@' + Math.round(e.getBoundingClientRect().top) : '-';
    const fila = ['titulo=' + h(q('.js-product-name, h1')), 'precioLima=' + h(q('.price-container, .js-price-container')), 'pntFp=' + h(q('.pnt-fp')), 'form=' + h(q('.js-product-form')), 'env=' + h(q('.pnt-fp-env')), 'calc=' + h(q('.product-shipping-calculator, .js-shipping-calculator')), 'desc=' + h(q('.pnt-acc'))].join(' ');
    if (fila !== ult) { ult = fila; window.__l.push(Math.round(performance.now()) + ' ms  ' + fila); } }
    if (performance.now() < 8000) requestAnimationFrame(f); })(); });
await p.goto('http://localhost:5700' + ruta, { waitUntil: 'domcontentloaded', timeout: 120000 }); await espera(8000);
(await p.evaluate(() => window.__l)).forEach((x) => console.log(x));
await b.close(); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {}
process.exit(0);
