// Como lo ve una persona: Chrome CON ventana, tamaño de pantalla real, sin frenar el procesador, caché vacío.
//   node herramientas/revision/scroll-real.mjs [compu|celu] [etiqueta] [ruta]
// Mide: carga (primer pintado, LCP, load), y al bajar con la rueda a ritmo humano: cuadros (tiempo y peor), tramos con pausas largas,
// y en cada parada lo que se ve VACÍO: fotos de la pantalla que todavía no cargaron y piezas escondidas por la animación de entrada.
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const modo = process.argv[2] || 'compu', et = process.argv[3] || 'real', ruta = process.argv[4] || '/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const ven = process.env.OCULTO ? 'new' : false;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: ven, userDataDir: path.join(process.env.TEMP, 'pnt-scroll-real-' + Date.now()),
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--window-size=' + (modo === 'celu' ? '420,950' : '1560,880'), '--window-position=20,20'] });
const p = (await b.pages())[0] || await b.newPage();
await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
if (modo === 'celu') await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }); else await p.setViewport({ width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await p.evaluateOnNewDocument(() => { window.__f = []; window.__lcp = 0; window.__lt = [];
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__lcp = Math.round(e.startTime); })).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); } catch (e) {}
  let t0 = 0; (function f(t) { if (t0) window.__f.push([Math.round(t), +(t - t0).toFixed(1), Math.round(scrollY)]); t0 = t; requestAnimationFrame(f); })(0); });
const T0 = Date.now();
await p.goto('http://localhost:5700' + ruta, { waitUntil: 'domcontentloaded', timeout: 120000 });
const tDom = Date.now() - T0;
await p.waitForFunction(() => document.readyState === 'complete', { timeout: 60000 }).catch(() => {});
const tLoad = Date.now() - T0;
const carga = await p.evaluate(() => { const fp = performance.getEntriesByType('paint'); const o = {}; fp.forEach((e) => { o[e.name] = Math.round(e.startTime); }); const n = performance.getEntriesByType('navigation')[0]; return { primer_pintado: o['first-paint'], primer_contenido: o['first-contentful-paint'], lcp: window.__lcp, html_ms: Math.round(n.responseEnd), dom_ms: Math.round(n.domContentLoadedEventEnd), tareas_largas_ms: window.__lt.slice(), recursos: performance.getEntriesByType('resource').length, MB: +(performance.getEntriesByType('resource').reduce((a, e) => a + (e.transferSize || 0), 0) / 1048576).toFixed(1) }; });
await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
await espera(modo === 'celu' ? 6000 : 5000);                  // que termine la intro, como cuando una persona mira un momento
if (process.env.INYECTA) { await p.addStyleTag({ content: process.env.INYECTA }); await espera(800); }
const s = await p.target().createCDPSession(); await s.send('Performance.enable'); const met = async () => { const { metrics } = await s.send('Performance.getMetrics'); const o = {}; metrics.forEach((m) => { o[m.name] = m.value; }); return o; }; const m0 = await met();
const alto = await p.evaluate(() => document.documentElement.scrollHeight);
const vacio = () => p.evaluate(() => {
  const vh = innerHeight, out = { fotos: 0, sin_cargar: 0, escondidas: 0, escondidas_area: 0 };
  document.querySelectorAll('img').forEach((i) => { const r = i.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh && r.width > 40 && r.height > 40 && getComputedStyle(i).display !== 'none') { out.fotos++; if (!i.complete || i.naturalWidth === 0) out.sin_cargar++; } });
  document.querySelectorAll('.pnt-ap-el, .pnt-rv, [data-pnt-an]').forEach((e) => { const r = e.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh && r.width > 40) { const o = +getComputedStyle(e).opacity; if (o < 0.5) { out.escondidas++; out.escondidas_area += Math.round(r.width * Math.min(r.bottom, vh) / 1000 - 0); } } });
  return out; });
await p.evaluate(() => { window.__f.length = 0; window.__lt.length = 0; });      // desde acá, solo el scroll (la carga ya se midió aparte)
await p.mouse.move(modo === 'celu' ? 200 : 700, 400);
const pasos = []; let y = 0; const paso = modo === 'celu' ? 260 : 300, cada = 120;     // ~2.500 px/s: bajar leyendo rápido
const tS = Date.now();
while (y < alto - 800) {
  await p.mouse.wheel({ deltaY: paso }); y += paso; await espera(cada);
  if (Math.round((y / paso)) % 6 === 0) pasos.push({ y, ...(await vacio()) });      // cada ~1,8 s mira lo que se ve en ese instante (sin frenar)
}
const tBajar = Date.now() - tS; const m1 = await met(); const trabajo = { tarea_ms: Math.round((m1.TaskDuration - m0.TaskDuration) * 1000), estilos_ms: Math.round((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000), diseno_ms: Math.round((m1.LayoutDuration - m0.LayoutDuration) * 1000), js_ms: Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000) };
const r = await p.evaluate(() => ({ f: window.__f, lt: window.__lt }));
const dts = r.f.map((x) => x[1]).filter((x) => x < 2000);
const prom = dts.reduce((a, c) => a + c, 0) / dts.length;
const pausas = r.f.filter((x) => x[1] > 100).length;
const res = { modo, alto, trabajo, carga: { ...carga, dom_total_ms: tDom, load_total_ms: tLoad }, scroll: { segundos: +(tBajar / 1000).toFixed(1), ms_prom: +prom.toFixed(1), fps: +(1000 / prom).toFixed(1), peor_ms: Math.round(Math.max(...dts)), cuadros_mas_de_33ms: dts.filter((x) => x > 33).length, cuadros_mas_de_50ms: dts.filter((x) => x > 50).length, cuadros_mas_de_100ms: pausas, total_cuadros: dts.length, tareas_largas: r.lt.length, suma_tareas_largas_ms: r.lt.reduce((a, c) => a + c, 0) }, vacio: pasos };
fs.mkdirSync(path.join(AQUI, '..', '..', 'revision-responsive', 'rendimiento'), { recursive: true });
fs.writeFileSync(path.join(AQUI, '..', '..', 'revision-responsive', 'rendimiento', 'real-' + et + '-' + modo + '.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify({ ...res, vacio: undefined }));
console.log('ZONAS VACÍAS AL BAJAR (y · fotos a la vista · sin cargar · piezas escondidas por la animación):');
pasos.forEach((s) => console.log('  ' + String(s.y).padStart(6) + '   fotos ' + String(s.fotos).padStart(2) + '   sin cargar ' + String(s.sin_cargar).padStart(2) + '   escondidas ' + String(s.escondidas).padStart(2)));
await b.close(); process.exit(0);
