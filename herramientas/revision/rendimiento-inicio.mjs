// Rendimiento del inicio bajando con la rueda, como una persona: node herramientas/revision/rendimiento-inicio.mjs <celu|compu> [cpu] [etiqueta]
// Por cada tramo de la página: ms por cuadro (promedio y peor), tareas largas, videos andando y elementos con desenfoque a la vista.
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const modo = process.argv[2] || 'celu', cpu = +(process.argv[3] || 4), et = process.argv[4] || 'base';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
if (modo === 'celu') await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
else await p.setViewport({ width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const s = await p.target().createCDPSession(); if (cpu > 1) await s.send('Emulation.setCPUThrottlingRate', { rate: cpu });
await p.evaluateOnNewDocument(() => { window.__f = []; window.__lt = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ entryTypes: ['longtask'] }); } catch (e) {} let t0 = 0; (function f(t) { if (t0) window.__f.push([Math.round(t), +(t - t0).toFixed(1), Math.round(scrollY)]); t0 = t; requestAnimationFrame(f); })(0); });
await s.send('Performance.enable');
const met = async () => { const { metrics } = await s.send('Performance.getMetrics'); const o = {}; metrics.forEach((m) => { o[m.name] = m.value; }); return o; };
const t0 = Date.now();
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await espera(2500); await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
await espera(7000);                                                   // que termine la intro
const alto = await p.evaluate(() => document.documentElement.scrollHeight);
await p.evaluate(() => { window.__f.length = 0; window.__lt.length = 0; });
const m0 = await met();
const puntos = [];
for (let y = 0; y < alto; y += 420) {
  await p.mouse.move(200, 400); await p.mouse.wheel({ deltaY: 420 });
  await espera(750);
  puntos.push(await p.evaluate(() => { const v = [...document.querySelectorAll('video')].filter((x) => !x.paused && x.getBoundingClientRect().bottom > 0 && x.getBoundingClientRect().top < innerHeight).length;
    let bl = 0; document.querySelectorAll('body *').forEach((e) => { const r = e.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight && r.width > 30) { const c = getComputedStyle(e); if ((c.backdropFilter && c.backdropFilter !== 'none') || (c.filter && c.filter !== 'none')) bl++; } });
    return { y: Math.round(scrollY), videos: v, desenfoques: bl }; }));
}
const m1 = await met(); const cpuMs = (k) => Math.round((m1[k] - m0[k]) * 1000);
const trabajo = { tarea_ms: cpuMs('TaskDuration'), js_ms: cpuMs('ScriptDuration'), estilos_ms: cpuMs('RecalcStyleDuration'), diseno_ms: cpuMs('LayoutDuration'), nodos: Math.round(m1.Nodes), listeners: Math.round(m1.JSEventListeners), heap_MB: +(m1.JSHeapUsedSize / 1048576).toFixed(0) };
const r = await p.evaluate(() => ({ f: window.__f, lt: window.__lt }));
const filas = [];
for (const pt of puntos) {
  const f = r.f.filter((x) => Math.abs(x[2] - pt.y) < 230).map((x) => x[1]).filter((x) => x < 1000);
  const prom = f.length ? f.reduce((a, c) => a + c, 0) / f.length : 0, peor = f.length ? Math.max(...f) : 0;
  filas.push({ y: pt.y, cuadros: f.length, ms: +prom.toFixed(1), peor: Math.round(peor), videos: pt.videos, desenf: pt.desenfoques });
}
const tot = r.f.map((x) => x[1]).filter((x) => x < 1000);
const res = { modo, cpu, alto, trabajo, ms_prom: +(tot.reduce((a, c) => a + c, 0) / tot.length).toFixed(1), fps: +(1000 / (tot.reduce((a, c) => a + c, 0) / tot.length)).toFixed(1), cuadros_mas_de_50ms: tot.filter((x) => x > 50).length, tareas_largas: r.lt.length, suma_tareas_ms: r.lt.reduce((a, c) => a + c[1], 0), tramos: filas };
fs.mkdirSync(path.join(AQUI, '..', '..', 'revision-responsive', 'rendimiento'), { recursive: true });
fs.writeFileSync(path.join(AQUI, '..', '..', 'revision-responsive', 'rendimiento', et + '-' + modo + '.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify({ ...res, tramos: undefined }));
if (process.env.SIN_TRAMOS) { await b.close(); process.exit(0); }
for (const f of filas) console.log(String(f.y).padStart(6), String(f.ms).padStart(6) + ' ms', ('peor ' + f.peor).padStart(10), ' videos', f.videos, ' desenfoques', f.desenf);
await b.close(); process.exit(0);
