// Llegada a la sección (para revisar que el 3D no trabe la página): node herramientas/armador/pruebas/llegada.mjs [compu|celu] [golpe|pausa]
// Llegada a la sección: (a) de golpe (como las pruebas) y (b) bajando, con una pausa a 700 px antes de la sección.
// Mide las tareas largas desde que llega, si se vio el póster y cuándo arrancó el 3D.
import { abrir, espera } from './comun.mjs';
const celu = process.argv[2] === 'celu', modo = process.argv[3] || 'pausa';
const { browser, page } = await abrir({ ancho: celu ? 390 : 1600, alto: celu ? 844 : 900, dpr: celu ? 3 : 2, celular: celu, cpu: celu ? 4 : 1, query: 'a3debug' });
await page.evaluateOnNewDocument(() => { window.__lt = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) {} });
await page.reload({ waitUntil: 'domcontentloaded' });
await espera(9000);
const ir = (dy) => page.evaluate((dy) => { const st = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('stage'); const y = st.getBoundingClientRect().top + scrollY - 40 + dy; if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); } window.scrollTo(0, y); }, dy);
if (modo === 'pausa') { for (let i = 0; i < 8; i++) { await ir(-700 - 844); await espera(300); } await espera(3500); }
const t0 = await page.evaluate(() => performance.now());
for (let i = 0; i < 6; i++) { await ir(0); await espera(150); }
await espera(5000);
const r = await page.evaluate((t0) => ({ lt: window.__lt.filter((x) => x[0] > t0 - 50), tiempos: window.__a3 && window.__a3.tiempos, poster: document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('cargando').classList.contains('con-poster') }), t0);
const s = r.lt.reduce((a, x) => a + x[1], 0), m = r.lt.reduce((a, x) => Math.max(a, x[1]), 0);
console.log((celu ? 'celu' : 'compu') + ' · ' + modo + ' · póster: ' + (r.poster ? 'sí' : 'no') + ' · tiempos ' + JSON.stringify(r.tiempos) + ' · al llegar: ' + r.lt.length + ' tareas largas, suma ' + s + ' ms, peor ' + m + ' ms');
await browser.close(); process.exit(0);
