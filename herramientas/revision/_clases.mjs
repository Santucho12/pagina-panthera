// ¿Qué clases cambian en <html> y <body> mientras se baja? (cada cambio puede obligar a recalcular todos los estilos)
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const modo = process.argv[2] || 'compu'; const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
await p.setViewport(modo === 'celu' ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.evaluateOnNewDocument(() => { window.__cl = {}; window.__on = false;
  const ver = (t, nombre) => { let ant = t.className; new MutationObserver(() => { if (!window.__on) { ant = t.className; return; } const a = new Set(ant.split(/\s+/)), n = new Set(t.className.split(/\s+/)); const dif = [...n].filter((x) => !a.has(x)).map((x) => '+' + x).concat([...a].filter((x) => !n.has(x)).map((x) => '-' + x)); ant = t.className; dif.forEach((d) => { const k = nombre + ' ' + d; window.__cl[k] = (window.__cl[k] || 0) + 1; }); }).observe(t, { attributes: true, attributeFilter: ['class'] }); };
  document.addEventListener('DOMContentLoaded', () => { ver(document.documentElement, 'html'); ver(document.body, 'body'); }); });
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await espera(9000);
await p.evaluate(() => { window.__on = true; }); await p.mouse.move(600, 400);
for (let i = 0; i < 28; i++) { await p.mouse.wheel({ deltaY: 320 }); await espera(130); }
console.log('CAMBIOS DE CLASE MIENTRAS SE BAJA:', JSON.stringify(await p.evaluate(() => window.__cl)));
await b.close(); process.exit(0);
