// Análisis de fluidez y carga, como lo vive una persona (2026-11-15, pedido: "que el scroll vaya suave sin saltos, que nada se trabe, que las fotos,
// productos y videos carguen siempre y rápido").
//   node herramientas/revision/analisis-fluidez.mjs <compu|celu> <ruta> <etiqueta> [frio|tibio]
//     frio  = primera visita (caché vacío)   ·   tibio = segunda visita (la misma página otra vez, con el caché del navegador)
//   OCULTO=1 → sin ventana. VEL=lento|normal|rapido (velocidad del scroll; por defecto normal ≈ 1.800 px/s).
// SIN interceptar pedidos: con la intercepción de Puppeteer el navegador NO usa su caché (las pruebas anteriores bajaban todo cada vez).
// Mide, mientras carga y mientras se baja hasta el final:
//   · cuadros (rAF): ms por cuadro, peores, cuántos pasan de 33/50/100 ms; tareas largas
//   · saltos (layout shift / CLS) con QUÉ se corrió y dónde
//   · fotos y videos: cuánto tiempo estuvo cada uno A LA VISTA y todavía vacío (sin cargar o invisible por su fundido)
//   · red: pedidos, MB por tipo, los más pesados y las fotos mucho más grandes de lo que se muestran
// Deja el JSON completo en revision-responsive/fluidez/<etiqueta>-<modo>-<cache>.json
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const modo = process.argv[2] || 'compu', ruta = process.argv[3] || '/', et = process.argv[4] || 'base', cache = process.argv[5] || 'frio';
const VEL = { lento: [60, 70], normal: [100, 55], rapido: [160, 45] }[process.env.VEL || 'normal'];      // [px por tick de rueda, ms entre ticks]
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = path.join(process.env.TEMP, 'pnt-fluidez-' + Date.now());
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.OCULTO ? 'new' : false, userDataDir: perfil,
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--window-size=' + (modo === 'celu' ? '430,960' : '1560,880'), '--window-position=10,10'] });
try {
  const p = (await b.pages())[0] || await b.newPage();
  if (modo === 'celu') await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  else await p.setViewport({ width: 1536, height: 730, deviceScaleFactor: 1.25 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const cdp = await p.target().createCDPSession();
  await p.evaluateOnNewDocument(() => {
    const T = () => Math.round(performance.now());
    const W = window.__m = { f: [], lt: [], cls: [], lcp: [], media: new Map(), fase: 'carga' };
    let t0 = 0; (function f(t) { if (t0) W.f.push([Math.round(t), +(t - t0).toFixed(1), Math.round(scrollY), W.fase]); t0 = t; requestAnimationFrame(f); })(0);
    const desc = (n) => { if (!n || !n.tagName) return '?'; const sec = n.closest && n.closest('section, footer, header, [data-store], .pnt-hero-v'); const c = (x) => (x && x.className && x.className.baseVal === undefined ? (x.className + '') : '').trim().split(/\s+/).slice(0, 3).join('.'); return n.tagName.toLowerCase() + (c(n) ? '.' + c(n) : '') + (sec && sec !== n ? '  @' + (sec.getAttribute('data-store') || sec.tagName.toLowerCase() + '.' + c(sec)) : ''); };
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => W.lt.push([Math.round(e.startTime), Math.round(e.duration), W.fase]))).observe({ entryTypes: ['longtask'] }); } catch (e) {}
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.hadRecentInput) return; W.cls.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), fase: W.fase, y: Math.round(scrollY), src: (e.sources || []).slice(0, 3).map((s) => ({ n: s.node ? desc(s.node.nodeType === 3 ? s.node.parentElement : s.node) + (s.node.getRootNode && s.node.getRootNode() !== document ? ' [en ' + desc(s.node.getRootNode().host) + ']' : '') : '(nodo ya no existe)', dy: Math.round((s.currentRect.y - s.previousRect.y)), dh: Math.round(s.currentRect.height - s.previousRect.height), antes: [Math.round(s.previousRect.x), Math.round(s.previousRect.y), Math.round(s.previousRect.width), Math.round(s.previousRect.height)], despues: [Math.round(s.currentRect.x), Math.round(s.currentRect.y), Math.round(s.currentRect.width), Math.round(s.currentRect.height)] })) }); })).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => W.lcp.push({ t: Math.round(e.startTime), el: desc(e.element), url: (e.url || '').split('/').pop().slice(0, 60) }))).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
    // fotos y videos: cuándo entran a la vista y cuándo se ven de verdad (cargados y opacos)
    const listo = (el) => { if (el.tagName === 'VIDEO') return el.readyState >= 2 || !!el.poster; if (!el.complete || el.naturalWidth <= 2) return false; const cs = getComputedStyle(el); return +cs.opacity > 0.5 && cs.visibility !== 'hidden'; };
    const ver = (el) => { let m = W.media.get(el); if (!m) { m = { el, d: desc(el), src: (el.currentSrc || el.getAttribute('data-src') || el.src || '').split('/').pop().slice(0, 70), vis: false, desde: 0, blanco: 0, entradas: 0, enBlanco: 0, maxBlanco: 0 }; W.media.set(el, m); } return m; };
    const io = new IntersectionObserver((es) => es.forEach((e) => { const m = ver(e.target); const padreOculto = e.target.parentElement && e.target.parentElement.checkVisibility && !e.target.parentElement.checkVisibility({ opacityProperty: true, visibilityProperty: true });   // escondido a propósito por su contenedor (póster detrás del 3D, lupa cerrada): no es una foto a la vista
      if (e.isIntersecting && !padreOculto && e.intersectionRatio >= 0.15 && e.boundingClientRect.width >= 40 && e.boundingClientRect.height >= 40) { if (!m.vis) { m.vis = true; m.entradas++; if (!listo(e.target)) { m.desde = T(); m.enBlanco++; } else m.desde = 0; } } else if (m.vis && (!e.isIntersecting || e.intersectionRatio < 0.15)) { if (m.desde) { const d = T() - m.desde; m.blanco += d; m.maxBlanco = Math.max(m.maxBlanco, d); m.desde = 0; } m.vis = false; } }), { threshold: [0, 0.15, 0.5, 1] });
    const obs = (el) => { if (el.__pntObs) return; el.__pntObs = 1; io.observe(el); };
    const ocultoPorPadre = (el) => el.parentElement && el.parentElement.checkVisibility && !el.parentElement.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    W.revisa = () => { W.media.forEach((m) => { if (m.vis && m.desde && (listo(m.el) || ocultoPorPadre(m.el))) { const d = T() - m.desde; m.blanco += d; m.maxBlanco = Math.max(m.maxBlanco, d); m.desde = 0; m.src = (m.el.currentSrc || m.el.src || '').split('/').pop().slice(0, 70); } }); };
    setInterval(W.revisa, 50);
    const todos = () => document.querySelectorAll('img, video').forEach(obs);      // todas: el tamaño se filtra cuando entran a la vista (las fotos diferidas miden 0 al principio)
    const sombras = () => document.querySelectorAll('[data-pnt-a3], [data-pnt-or]').forEach((h) => { if (h.shadowRoot) h.shadowRoot.querySelectorAll('img').forEach(obs); });
    setInterval(sombras, 1500);
    document.addEventListener('DOMContentLoaded', () => { todos(); new MutationObserver(() => { if (!W.mt) W.mt = setTimeout(() => { W.mt = 0; todos(); }, 300); }).observe(document.body, { childList: true, subtree: true }); });
  });
  if (cache === 'tibio') {     // una visita antes para llenar el caché del navegador
    await p.goto('http://localhost:5700' + ruta, { waitUntil: 'load', timeout: 120000 }).catch(() => {});
    await espera(4000);
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
    await espera(2500);
  }
  const T0 = Date.now();
  await p.goto('http://localhost:5700' + ruta, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => document.readyState === 'complete', { timeout: 90000 }).catch(() => {});
  const tLoad = Date.now() - T0;
  await p.evaluate(() => document.querySelectorAll('.js-notification-cookie-banner').forEach((e) => e.remove()));
  await espera(modo === 'celu' ? 6500 : 5500);              // mirar la primera pantalla un momento (y que termine la intro)
  const carga = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0], fp = {}; performance.getEntriesByType('paint').forEach((e) => { fp[e.name] = Math.round(e.startTime); }); return { html_ms: Math.round(n.responseEnd), dom_ms: Math.round(n.domContentLoadedEventEnd), load_ms: Math.round(n.loadEventEnd), fcp: fp['first-contentful-paint'], lcp: window.__m.lcp.slice(-1)[0] || null }; });
  carga.load_total_ms = tLoad;
  await p.evaluate(() => { window.__m.fase = 'scroll'; window.__m.revisa(); });
  const alto = await p.evaluate(() => document.documentElement.scrollHeight);
  const tS = Date.now();
  if (modo === 'celu') {        // dedo: gestos de deslizar reales (scroll del navegador, con inercia)
    // (synthesizeScrollGesture no mueve la página en este Chrome: se usan toques de verdad, paso a paso, y el navegador sigue solo con su inercia)
    const deslizar = async (dist, ms) => { const x = 195, y0 = 680, pasos = Math.max(4, Math.round(ms / 16)); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] }); for (let i = 1; i <= pasos; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - dist * i / pasos }] }); await espera(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    for (let i = 0; i < 120; i++) { await deslizar(460, 150); await espera(300); if (await p.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 5)) break; }
  } else {
    await p.mouse.move(760, 420);
    for (let i = 0; i < 400; i++) { await p.mouse.wheel({ deltaY: VEL[0] }); await espera(VEL[1]); if (i % 10 === 9 && await p.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 5)) break; }
  }
  await espera(1500);
  const tScroll = Date.now() - tS;
  const yFinal = await p.evaluate(() => Math.round(scrollY)), yMax = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await p.evaluate(() => { window.__m.revisa(); window.__m.fase = 'fin'; });
  const r = await p.evaluate(() => {
    const W = window.__m, f = W.f.filter((x) => x[3] === 'scroll' && x[1] < 3000).map((x) => x[1]);
    const prom = f.reduce((a, c) => a + c, 0) / Math.max(1, f.length);
    const media = [...W.media.values()].filter((m) => m.entradas > 0);
    if (media.some((m) => m.vis && m.desde)) media.forEach((m) => { if (m.vis && m.desde) { m.blanco += Math.round(performance.now()) - m.desde; m.pendiente = true; } });
    const blancas = media.filter((m) => m.blanco > 0).sort((a, c) => c.blanco - a.blanco);
    const res = performance.getEntriesByType('resource');
    const tipo = (e) => /\.(mp4|webm)(\?|$)/.test(e.name) ? 'video' : /\.(webp|jpe?g|png|gif|avif|svg)(\?|$)/.test(e.name) || e.initiatorType === 'img' ? 'imagen' : /\.css(\?|$)/.test(e.name) || e.initiatorType === 'link' && /css/.test(e.name) ? 'css' : /\.m?js(\?|$)/.test(e.name) || e.initiatorType === 'script' ? 'js' : /font|woff/.test(e.name) ? 'fuente' : 'otro';
    const porTipo = {}; res.forEach((e) => { const k = tipo(e); const o = porTipo[k] || (porTipo[k] = { n: 0, KB: 0 }); o.n++; o.KB += Math.round((e.transferSize || 0) / 1024); });
    const pesados = res.filter((e) => e.transferSize > 150000).sort((a, c) => c.transferSize - a.transferSize).slice(0, 10).map((e) => Math.round(e.transferSize / 1024) + ' KB ' + Math.round(e.duration) + ' ms ' + e.name.replace(/^https?:\/\/[^/]+/, '').slice(0, 80));
    const dpr = devicePixelRatio, grandes = [];
    document.querySelectorAll('img').forEach((i) => { const w = i.getBoundingClientRect().width; if (i.complete && i.naturalWidth > 2 && w > 30 && i.naturalWidth > w * dpr * 2.2) grandes.push(Math.round(i.naturalWidth) + ' px para ' + Math.round(w * dpr) + ' px · ' + (i.currentSrc || i.src).split('/').pop().slice(0, 60)); });
    const cls = (fase) => +W.cls.filter((c) => c.fase === fase).reduce((a, c) => a + c.v, 0).toFixed(3);
    const fuentesCls = {}; W.cls.forEach((c) => c.src.forEach((s) => { const k = c.fase + ' · t ' + c.t + ' · y ' + c.y + ' · ' + s.n + ' (dy ' + s.dy + ', dh ' + s.dh + ' · ' + JSON.stringify(s.antes) + '→' + JSON.stringify(s.despues) + ')'; fuentesCls[k] = (fuentesCls[k] || 0) + c.v; }));
    return {
      scroll: { ms_prom: +prom.toFixed(1), fps: +(1000 / prom).toFixed(1), peor: Math.round(Math.max(0, ...f)), m33: f.filter((x) => x > 33).length, m50: f.filter((x) => x > 50).length, m100: f.filter((x) => x > 100).length, cuadros: f.length,
        tareas_largas: W.lt.filter((x) => x[2] === 'scroll').length, tareas_ms: W.lt.filter((x) => x[2] === 'scroll').reduce((a, c) => a + c[1], 0) },
      carga_tareas: { n: W.lt.filter((x) => x[2] === 'carga').length, ms: W.lt.filter((x) => x[2] === 'carga').reduce((a, c) => a + c[1], 0), mayor: Math.max(0, ...W.lt.filter((x) => x[2] === 'carga').map((x) => x[1])) },
      saltos: { cls_carga: cls('carga'), cls_scroll: cls('scroll'), n: W.cls.length, top: Object.entries(fuentesCls).sort((a, c) => c[1] - a[1]).slice(0, 10).map(([k, v]) => v.toFixed(4) + '  ' + k) },
      media: { vistas: media.length, en_blanco: blancas.length, ms_total: blancas.reduce((a, m) => a + m.blanco, 0), peores: blancas.slice(0, 14).map((m) => m.blanco + ' ms' + (m.pendiente ? ' (nunca cargó)' : '') + ' · ' + m.d.slice(0, 75) + ' · ' + m.src) },
      red: { pedidos: res.length, MB: +(res.reduce((a, e) => a + (e.transferSize || 0), 0) / 1048576).toFixed(1), porTipo, pesados, fotos_grandes: grandes.slice(0, 10), n_fotos_grandes: grandes.length }
    };
  });
  const out = { modo, ruta, cache, alto, yFinal, yMax, carga, scroll_s: +(tScroll / 1000).toFixed(1), ...r };
  fs.mkdirSync(path.join(AQUI, '..', '..', 'revision-responsive', 'fluidez'), { recursive: true });
  fs.writeFileSync(path.join(AQUI, '..', '..', 'revision-responsive', 'fluidez', `${et}-${modo}-${cache}.json`), JSON.stringify(out, null, 1));
  const s = out.scroll, c = out.carga;
  console.log(`== ${ruta} · ${modo} · ${cache} · bajó hasta ${yFinal} de ${yMax} px en ${out.scroll_s} s`);
  console.log(`CARGA  html ${c.html_ms} ms · primer contenido ${c.fcp} ms · LCP ${c.lcp ? c.lcp.t + ' ms (' + c.lcp.el.slice(0, 50) + ')' : '-'} · load ${c.load_ms} ms · tareas largas ${out.carga_tareas.n} = ${out.carga_tareas.ms} ms (mayor ${out.carga_tareas.mayor})`);
  console.log(`SCROLL ${s.fps} cuadros/s · prom ${s.ms_prom} ms · peor ${s.peor} ms · >33: ${s.m33} · >50: ${s.m50} · >100: ${s.m100} (de ${s.cuadros}) · tareas largas ${s.tareas_largas} = ${s.tareas_ms} ms`);
  console.log(`SALTOS CLS carga ${out.saltos.cls_carga} · CLS scroll ${out.saltos.cls_scroll} (${out.saltos.n} saltos)`); out.saltos.top.forEach((x) => console.log('   ' + x));
  console.log(`FOTOS/VIDEOS a la vista: ${out.media.vistas} · aparecieron vacíos: ${out.media.en_blanco} · tiempo total vacío ${out.media.ms_total} ms`); out.media.peores.forEach((x) => console.log('   ' + x));
  console.log(`RED ${out.red.pedidos} pedidos · ${out.red.MB} MB · ` + Object.entries(out.red.porTipo).map(([k, v]) => k + ' ' + v.n + '/' + v.KB + 'KB').join(' · ')); out.red.pesados.forEach((x) => console.log('   ' + x));
  if (out.red.n_fotos_grandes) { console.log(`FOTOS MUCHO MÁS GRANDES QUE LO QUE SE MUESTRA: ${out.red.n_fotos_grandes}`); out.red.fotos_grandes.slice(0, 6).forEach((x) => console.log('   ' + x)); }
} finally {
  await b.close();
  try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {}
}
process.exit(0);
