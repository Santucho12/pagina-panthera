// Por qué una animación NO va a la placa gráfica: node _anim-razon.mjs [celu|compu]
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const modo = process.argv[2] || 'compu'; const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
await p.setViewport(modo === 'celu' ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const s = await p.target().createCDPSession(); const ev = {};
s.on('Tracing.dataCollected', ({ value }) => value.forEach((e) => { if (e.name === 'Animation' && e.args && e.args.data && e.args.data.compositeFailed !== undefined) { const d = e.args.data; const k = (d.displayName || d.id) + ' · ' + (d.nodeName || '').slice(0, 40) + ' · fallo=' + d.compositeFailed + ' · ' + (d.unsupportedProperties || []).join(','); ev[k] = (ev[k] || 0) + 1; } }));
const fin = new Promise((ok) => s.once('Tracing.tracingComplete', ok));
await s.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await espera(9000);
await p.mouse.move(600, 400); for (let i = 0; i < 10; i++) { await p.mouse.wheel({ deltaY: 500 }); await espera(300); }
await s.send('Tracing.end'); await fin;
console.log('ANIMACIONES CON compositeFailed (bits: 1=propiedad no compuesta, 2=otra animación en el elemento no compuesta, 4=transform que depende del tamaño, 8=efecto de visibilidad, 16=animación con "left/top" etc.…):');
Object.entries(ev).sort((a, c) => c[1] - a[1]).slice(0, 25).forEach(([k, n]) => console.log('  ' + String(n).padStart(4) + '  ' + k));
await b.close(); process.exit(0);
