// El tramo donde la 2.ª sección sube sobre el hero (0 → ~1100 px), en un Chrome real, con variantes que apagan una cosa por vez.
//   node herramientas/revision/scroll-hero.mjs [compu|celu]      (OCULTO=1 para sin ventana)
import { createRequire } from 'module'; import path from 'path';
const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const modo = process.argv[2] || 'compu'; const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const PARCHE = { 'sin cambios de clase pnt-nav-claro en <html>': ['pnt-nav-claro'], 'sin cambios de clase lenis-scrolling': ['lenis-scrolling', 'lenis-stopped'], 'sin pnt-nav-claro/lenis/pnt-nav-abajo': ['pnt-nav-claro', 'lenis-scrolling', 'lenis-stopped', 'pnt-nav-abajo'] };
const VAR = {
  'base': '',
  'sin backdrop-filter del cartel': '.pnt-hero-cartel,.pnt-hero-cartel *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
  'sin parallax (video/cartel/oscuro quietos)': '.pnt-hero-v video{transform:none!important}.pnt-hero-cartel{translate:none!important}.pnt-hero-oscuro{display:none!important}',
  'video pausado': '',
  'sin video (oculto)': '.pnt-hero-v video{visibility:hidden!important}',
  'sin sticky del hero': 'html.pnt-hero-video .section-slider-home{position:relative!important}',
  'sin scale del video (1.16)': '.pnt-hero-v video{scale:1!important}',
  'sin transiciones de entrada (pnt-ap)': '.pnt-ap-el,.pnt-rv{transition:none!important}',
  'sin animaciones infinitas': '*,*::before,*::after{animation-iteration-count:1!important;animation-duration:.001s!important}',
  ...Object.fromEntries(Object.keys(PARCHE).map((k) => [k, ''])),
};
const filas = [];
const SOLO = (process.env.SOLO || '').split('|').filter(Boolean);
for (const [nombre, css] of Object.entries(VAR)) {
  if (SOLO.length && !SOLO.includes(nombre)) continue;
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.OCULTO ? 'new' : false, userDataDir: process.env.TEMP + '/pnt-hero-' + Date.now(), args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--window-size=1560,880'] });
  const p = (await b.pages())[0] || await b.newPage();
  await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport(modo === 'celu' ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1536, height: 730, deviceScaleFactor: 1.25 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.evaluateOnNewDocument(() => { window.__f = []; let t0 = 0; (function f(t) { if (t0) window.__f.push([+(t - t0).toFixed(1), Math.round(scrollY)]); t0 = t; requestAnimationFrame(f); })(0); });
  await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => document.readyState === 'complete', { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
  await espera(7500);
  if (css) await p.addStyleTag({ content: css });
  if (PARCHE[nombre]) await p.evaluate((ns) => { const cl = document.documentElement.classList; for (const m of ['add', 'remove', 'toggle']) { const o = cl[m].bind(cl); cl[m] = (...a) => (a.length && ns.includes(a[0]) ? (m === 'toggle' ? cl.contains(a[0]) : undefined) : o(...a)); } }, PARCHE[nombre]);
  if (nombre === 'video pausado') await p.evaluate(() => document.querySelector('.pnt-hero-v video').pause());
  await espera(800);
  await p.evaluate(() => { window.__f.length = 0; });
  await p.mouse.move(700, 400);
  const T = Date.now(); for (let i = 0; i < 22; i++) { await p.mouse.wheel({ deltaY: 55 }); await espera(45); } await espera(900);
  const raw = await p.evaluate(() => window.__f); const yFinal = raw.length ? Math.max(...raw.map((x) => x[1])) : 0; const f = raw.map((x) => x[0]).filter((x) => x < 1500);
  const prom = f.reduce((a, c) => a + c, 0) / f.length;
  filas.push({ nombre, fps: +(1000 / prom).toFixed(1), prom: +prom.toFixed(1), peor: Math.round(Math.max(...f)), m33: f.filter((x) => x > 33).length, m50: f.filter((x) => x > 50).length, n: f.length, y: yFinal });
  await b.close();
}
console.log('TRAMO DEL HERO (0→1200 px de scroll)', modo);
filas.forEach((r) => console.log('  ' + r.nombre.padEnd(44) + String(r.fps).padStart(5) + ' fps · prom ' + String(r.prom).padStart(5) + ' ms · peor ' + String(r.peor).padStart(4) + ' ms · >33ms: ' + String(r.m33).padStart(3) + ' · >50ms: ' + String(r.m50).padStart(3) + ' (de ' + r.n + ') · scrollY final ' + r.y));
process.exit(0);
