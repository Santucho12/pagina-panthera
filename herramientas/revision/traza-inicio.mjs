// Dónde se va el tiempo del procesador al bajar el inicio (traza de Chrome + perfil de JS): node herramientas/revision/traza-inicio.mjs <celu|compu> [cpu]
import { createRequire } from 'module';
const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const modo = process.argv[2] || 'celu', cpu = +(process.argv[3] || 4);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
if (modo === 'celu') await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }); else await p.setViewport({ width: 1536, height: 730, deviceScaleFactor: 1.25 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const s = await p.target().createCDPSession(); if (cpu > 1) await s.send('Emulation.setCPUThrottlingRate', { rate: cpu });
await p.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await espera(2500); await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove())); await espera(7000);
const alto = await p.evaluate(() => document.documentElement.scrollHeight);
// agregado al vuelo (sin guardar la traza entera: la memoria de esta compu no da)
const sum = {}, hilos = {}; const NOMBRES = new Set(['UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize', 'Commit', 'UpdateLayer', 'HitTest', 'FunctionCall', 'EvaluateScript', 'V8.Compile', 'RunTask', 'FireAnimationFrame', 'TimerFire', 'EventDispatch', 'IntersectionObserverController::computeIntersections', 'ParseHTML', 'ResourceFinish', 'ImageDecodeTask', 'Decode LazyPixelRef', 'ScheduleStyleRecalculation', 'StyleRecalcInvalidationTracking', 'UpdateLayoutTree', 'RunMicrotasks', 'v8.callFunction', 'MinorGC', 'MajorGC', 'V8.GC_SCAVENGER', 'Animation', 'CompositeLayers', 'Raster', 'GPUTask']);
const largos = [];
const evInv = [], evBig = [];
const inval = {}, recalc = { n: 0, suma: 0, grandes: 0, max: 0 };
s.on('Tracing.dataCollected', ({ value }) => { for (const e of value) {
  if (e.ph === 'X' && e.dur > 25000 && e.name !== 'RunTask') largos.push([Math.round(e.dur / 1000), e.name, e.pid + ':' + e.tid, Math.round(e.ts / 1000) % 100000, JSON.stringify(e.args && e.args.data ? (e.args.data.url || e.args.data.functionName || e.args.data.type || e.args.data.elementCount || '') : '').slice(0, 70)]);
  if ((e.name === 'StyleRecalcInvalidationTracking' || e.name === 'StyleInvalidatorInvalidationTracking' || e.name === 'ScheduleStyleInvalidationTracking') && e.args && e.args.data) { const d = e.args.data; evInv.push([e.ts, e.name.replace('InvalidationTracking', '').replace('Style', ''), d.reason || d.invalidatedSelectorId || '', (d.nodeName || '') + (d.selectorPart || ''), (d.changedClass || d.changedAttribute || d.changedId || d.invalidationSet || '').toString().slice(0, 40)]); }
  if (e.name === 'UpdateLayoutTree' && e.ph === 'X' && e.args && e.args.elementCount > 3000) evBig.push([e.ts, e.dur, e.args.elementCount]);
  if (e.name === 'UpdateLayoutTree' && e.ph === 'X' && e.args && e.args.elementCount != null) { recalc.n++; recalc.suma += e.args.elementCount; if (e.args.elementCount > 1500) recalc.grandes++; recalc.max = Math.max(recalc.max, e.args.elementCount); }
  if ((e.name === 'StyleRecalcInvalidationTracking' || e.name === 'ScheduleStyleRecalculation') && e.args && e.args.data) { const d = e.args.data, st = (d.stackTrace && d.stackTrace[0]) || {}; const k = (d.reason || e.name) + ' · ' + (d.nodeName || '') + (d.invalidationSet ? '' : '') + ' · ' + (st.functionName || '') + ' ' + String(st.url || '').split('/').slice(-1) + ':' + (st.lineNumber || ''); inval[k] = (inval[k] || 0) + 1; } if (e.ph === 'M' && e.name === 'thread_name') hilos[e.pid + ':' + e.tid] = e.args.name; else if (e.ph === 'X' && e.dur && NOMBRES.has(e.name)) { const k = e.pid + ':' + e.tid + '|' + e.name; const o = sum[k] || (sum[k] = [0, 0]); o[0] += e.dur; o[1]++; } } });
const fin = new Promise((ok) => s.once('Tracing.tracingComplete', ok));
await s.send('Profiler.enable'); await s.send('Profiler.setSamplingInterval', { interval: 800 });
await s.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking', transferMode: 'ReportEvents' });
await s.send('Profiler.start');
for (let y = 0; y < (+process.env.HASTA || alto); y += (+process.env.PASO || 420)) { await p.mouse.move(200, 400); await p.mouse.wheel({ deltaY: 420 }); await espera(750); }
const { profile } = await s.send('Profiler.stop');
await s.send('Tracing.end'); await fin;
// tiempo por nombre, solo del hilo principal del renderizador
const principal = Object.keys(hilos).filter((k) => hilos[k] === 'CrRendererMain');
const por = {}; for (const k of Object.keys(sum)) { const [t, n] = k.split('|'); if (!principal.includes(t)) continue; por[n] = [Math.round(sum[k][0] / 1000), sum[k][1]]; }
console.log('HILO PRINCIPAL (ms · veces; los anidados se pisan):'); Object.entries(por).sort((a, c) => c[1][0] - a[1][0]).slice(0, 18).forEach(([n, [ms, v]]) => console.log('  ' + n.padEnd(52) + String(ms).padStart(7) + ' ms ' + String(v).padStart(7) + ' veces'));
console.log('RECÁLCULOS DE ESTILO:', JSON.stringify({ ...recalc, prom: Math.round(recalc.suma / Math.max(1, recalc.n)) }));
console.log('QUÉ LOS INVALIDA (veces · motivo · nodo · función):'); Object.entries(inval).sort((a, c) => c[1] - a[1]).slice(0, 14).forEach(([k, n]) => console.log('  ' + String(n).padStart(6) + '  ' + k.slice(0, 150)));
console.log('EVENTOS MÁS LARGOS (> 25 ms) EN EL HILO PRINCIPAL (ms · evento · url/dato):'); largos.filter((l) => principal.includes(l[2])).sort((a, c) => c[0] - a[0]).slice(0, 26).forEach((l) => console.log('  ' + String(l[0]).padStart(5) + '  ' + l[1].padEnd(28) + l[4]));
{ const por = {}; evBig.forEach(([ts]) => { const cercanos = evInv.filter((x) => x[0] <= ts && x[0] > ts - 30000); const claves = new Set(cercanos.map((x) => x[1] + ' · ' + x[2] + ' · ' + x[3] + ' · ' + x[4])); claves.forEach((k) => { por[k] = (por[k] || 0) + 1; }); });
console.log('RECÁLCULOS GRANDES (>3000): ' + evBig.length + ' · qué invalidó en los 30 ms anteriores a cada uno (veces):'); Object.entries(por).sort((a, c) => c[1] - a[1]).slice(0, 14).forEach(([k, n]) => console.log('  ' + String(n).padStart(4) + '  ' + k.slice(0, 150))); }
// perfil de JS: tiempo propio por función
const dt = profile.timeDeltas, nodos = new Map(profile.nodes.map((n) => [n.id, n])); const self = {};
profile.samples.forEach((id, i) => { const n = nodos.get(id); const cf = n.callFrame; const k = (cf.functionName || '(anónima)') + ' · ' + (cf.url || '').split('/').slice(-2).join('/') + ':' + cf.lineNumber; self[k] = (self[k] || 0) + (dt[i] || 0); });
console.log('JS — tiempo propio por función (ms):'); Object.entries(self).sort((a, c) => c[1] - a[1]).slice(0, 16).forEach(([k, us]) => console.log('  ' + String(Math.round(us / 1000)).padStart(6) + '  ' + k.slice(0, 120)));
// quién llama a las funciones nativas caras (getBoundingClientRect, elementsFromPoint, getComputedStyle…): el padre en el árbol de llamadas
const padre = new Map(); profile.nodes.forEach((n) => (n.children || []).forEach((c) => padre.set(c, n.id)));
const nativas = /^(getBoundingClientRect|elementsFromPoint|getComputedStyle|offsetHeight|offsetWidth|scrollTo|getClientRects|matches|closest|querySelectorAll)$/; const quien = {};
profile.samples.forEach((id, i) => { const n = nodos.get(id); if (!nativas.test(n.callFrame.functionName)) return; let q = padre.get(id), hop = 0, nn = q && nodos.get(q); while (nn && (!nn.callFrame.functionName || nn.callFrame.functionName === '(anonymous)') && hop < 3) { nn = nodos.get(padre.get(nn.id)); hop++; } const cf = (nn && nn.callFrame) || {}; const k = n.callFrame.functionName + ' ← ' + (cf.functionName || '(anónima)') + ' · ' + String(cf.url || '').split('/').slice(-2).join('/') + ':' + cf.lineNumber; quien[k] = (quien[k] || 0) + (dt[i] || 0); });
console.log('QUIÉN LLAMA A LAS NATIVAS CARAS (ms):'); Object.entries(quien).sort((a, c) => c[1] - a[1]).slice(0, 14).forEach(([k, us]) => console.log('  ' + String(Math.round(us / 1000)).padStart(6) + '  ' + k.slice(0, 130)));
const padre2 = new Map(); profile.nodes.forEach((n) => (n.children || []).forEach((c) => padre2.set(c, n.id))); const incl = {};
profile.samples.forEach((id, i) => { const vistos = new Set(); for (let q = id; q; q = padre2.get(q)) { const cf = nodos.get(q).callFrame; if (!cf.functionName || !/panthera|linkedstore|vanilla|:9716/.test(String(cf.url))) continue; const k = cf.functionName + ' · ' + String(cf.url || '').replace(/^https?:\/\/[^/]+\//, '').slice(-40) + ':' + cf.lineNumber; if (vistos.has(k)) continue; vistos.add(k); incl[k] = (incl[k] || 0) + (dt[i] || 0); } });
console.log('INCLUSIVO — función con todo lo que llama (ms):'); Object.entries(incl).sort((a, c) => c[1] - a[1]).slice(0, 18).forEach(([k, us]) => console.log('  ' + String(Math.round(us / 1000)).padStart(6) + '  ' + k.slice(0, 112)));
await b.close(); process.exit(0);
