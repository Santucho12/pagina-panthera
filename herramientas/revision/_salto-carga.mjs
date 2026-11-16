// Qué cambia de alto durante la carga del inicio (para el salto de "Los más elegidos"): cada cuadro, alto y posición de las secciones de arriba
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
import fs from 'fs'; import path from 'path';
const modo = process.argv[2] || 'compu'; const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = path.join(process.env.TEMP, 'pnt-salto-' + Date.now());
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', userDataDir: perfil, args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.setViewport(modo === 'celu' ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.evaluateOnNewDocument(() => { window.__l = []; let ult = '';
  (function f() { const q = (s) => document.querySelector(s); const h = (e) => e ? Math.round(e.getBoundingClientRect().height) : '-'; const t = (e) => e ? Math.round(e.getBoundingClientRect().top + scrollY) : '-';
    if (document.body) { const fila = ['hero=' + h(q('.section-slider-home')), 'heroV=' + h(q('.pnt-hero-v')), 'sliderLima=' + h(q('.js-home-main-slider-container')), 'sliderMovil=' + h(q('.js-home-mobile-slider-visibility')), 'banners=' + h(q('.section-banners-home')) + '@' + t(q('.section-banners-home')), 'feat=' + t(q('.js-section-products-featured')) + '/' + h(q('.js-section-products-featured')), 'clases=' + ['pnt-hero-video', 'pnt-nav', 'pnt-ap'].filter((c) => document.documentElement.classList.contains(c)).join('+')].join(' ');
      if (fila !== ult) { ult = fila; window.__l.push(Math.round(performance.now()) + ' ms  ' + fila); } }
    if (performance.now() < 9000) requestAnimationFrame(f); })(); });
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await espera(9500);
(await p.evaluate(() => window.__l)).forEach((x) => console.log(x));
const cls = await p.evaluate(() => new Promise((ok) => { const out = []; new PerformanceObserver((l) => { l.getEntries().forEach((e) => out.push(Math.round(e.startTime) + ' ms CLS ' + e.value.toFixed(4) + ' ' + (e.sources || []).map((s) => (s.node && s.node.className ? (s.node.className + '').slice(0, 40) : '?') + ' dy=' + Math.round(s.currentRect.y - s.previousRect.y)).join(' | '))); ok(out); }).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => ok(out), 300); }));
cls.forEach((x) => console.log(x));
await b.close(); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {}
process.exit(0);
