import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
import fs from 'fs'; import path from 'path';
const espera = (ms) => new Promise((r) => setTimeout(r, ms)); const perfil = path.join(process.env.TEMP, 'pnt-ofc-' + Date.now());
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', userDataDir: perfil, args: ['--no-sandbox'] });
try {
  const p = await b.newPage(); await p.setViewport({ width: 1366, height: 700 });
  await p.goto('http://localhost:5700/', { waitUntil: 'load', timeout: 120000 }); await espera(4000);
  console.log('inicio guardó:', await p.evaluate(() => { const g = JSON.parse(localStorage.getItem('pnt-ofertas-v1') || 'null'); return g ? g.u.length + ' productos' : 'nada'; }));
  for (const [nombre, ruta, espRojo] of [['ficha que NO es oferta', '/productos/painter-471/', false], ['ficha que SÍ es oferta', '/productos/pulsera-silver-flower-454/', true]]) {
    await p.goto('http://localhost:5700' + ruta, { waitUntil: 'load', timeout: 120000 }); await espera(3500);
    const r = await p.evaluate(() => ({ bajoInicio: performance.getEntriesByType('resource').some((e) => /^https?:\/\/localhost:5700\/(\?.*)?$/.test(e.name)), rojo: !!document.querySelector('.pnt-fp-oferta'), armada: document.documentElement.classList.contains('pnt-ficha-armada') }));
    console.log(nombre + ':', JSON.stringify(r), r.rojo === espRojo ? '✔ color correcto' : '✘ color incorrecto');
  }
} finally { await b.close(); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {} }
process.exit(0);
