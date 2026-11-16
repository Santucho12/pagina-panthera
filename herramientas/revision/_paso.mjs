// node herramientas/revision/_paso.mjs <compu|celu> <ruta> <archivo.mjs> [captura.jpg]
// El archivo exporta `default async (p, h) => resultado`; h = { espera, tocar, B }. Imprime el resultado en JSON.
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const [modo, ruta, archivo, captura] = process.argv.slice(2);
const B = 'http://localhost:5700';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.VER ? false : 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', ...(process.env.VER ? ['--window-position=0,0', '--window-size=1536,816'] : [])] });   // VER=1: ventana a la vista
const p = await b.newPage();
const errores = [];
p.on('pageerror', (e) => errores.push(String(e.message).split('\n')[0].slice(0, 160)));
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));   // sin la recarga sola de la vista previa
if (modo === 'celu') { await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'); }
else { await p.setViewport({ width: 1440, height: 900 }); await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'); }
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.goto(B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => console.log('goto:', e.message));
await espera(3500);
await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
async function tocar(sel, re) {
  const h = await p.evaluateHandle((sel, src) => { const re = src ? new RegExp(src, 'i') : null; return [...document.querySelectorAll(sel)].find((e) => (e.offsetWidth || e.offsetHeight) && (!re || re.test((e.textContent || e.value || '').trim()))); }, sel, re ? re.source : null);
  const el = h.asElement(); if (!el) return false;
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await espera(400);
  if (modo === 'celu') await el.tap(); else await el.click();
  return true;
}
// Con VER=1: cartelito abajo a la izquierda que dice qué está haciendo (no se puede tocar: no molesta a la prueba)
async function cartel(t) {
  if (!process.env.VER) return;
  await p.evaluate((t) => { let c = document.getElementById('pnt-revision-cartel'); if (!c) { c = document.createElement('div'); c.id = 'pnt-revision-cartel'; c.setAttribute('data-revision-ignora', ''); c.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;max-width:min(560px,90vw);padding:9px 14px;border-radius:10px;background:rgba(0,0,0,.85);color:#fff;font:600 14px/1.35 system-ui,sans-serif;pointer-events:none;box-shadow:0 4px 18px rgba(0,0,0,.3)'; document.documentElement.appendChild(c); } c.textContent = t; }, t).catch(() => {});
}
const mod = await import(pathToFileURL(archivo).href);
let r;
try { r = await mod.default(p, { espera, tocar, B, modo, cartel }); } catch (e) { r = 'ERROR ' + e.message; }
console.log(JSON.stringify(r, null, 1));
if (errores.length) console.log('errores JS:', errores);
if (captura) await p.screenshot({ path: captura, type: 'jpeg', quality: 80 });
if (process.env.VER) { await cartel('Listo. La ventana se cierra en unos segundos…'); await espera(+(process.env.VER_FIN || 8000)); }
await b.close();
