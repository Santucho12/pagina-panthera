// Fluidez al LLEGAR a un armador bajando con la rueda, como una persona (2026-11-12, pedido del usuario: "tarda en cargar, la
// animación se ve trabada y parece que aparece primero fija y luego se vuelve a cargar").
//   node herramientas/armador/pruebas/fluidez.mjs [a3|or] [etiqueta] [--video] [--perfil] [--lento] [--celu] [--ancho N --alto N --dpr N] [--cpu N] [--espera ms] [--demora ms]
// a3 = "Armá tu pulsera" · or = "Armá tu combinación de aritos". Por defecto usa la ventana del equipo del usuario (1536×730 a
// DPR 1,25: 1920×1080 al 125 %). Mide, cuadro por cuadro: cuánto tardó cada uno, las tareas largas, y cuándo se vio la capa de
// carga, el póster y el 3D. Con --video guarda además una tira de capturas (fluidez-<etiqueta>.jpg) de lo que se vio al llegar.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { abrir, espera, AQUI } from './comun.mjs';

const arg = process.argv.slice(2);
const cual = arg[0] === 'or' ? 'or' : 'a3';
const etiqueta = arg[1] && !arg[1].startsWith('--') ? arg[1] : cual;
const op = (n, d) => { const i = arg.indexOf('--' + n); return i > -1 ? Number(arg[i + 1]) : d; };
const VIDEO = arg.includes('--video'), LENTO = arg.includes('--lento'), PERFIL = arg.includes('--perfil'), CELU = arg.includes('--celu');
const ancho = op('ancho', CELU ? 390 : 1536), alto = op('alto', CELU ? 844 : 730), dpr = op('dpr', CELU ? 3 : 1.25), cpu = op('cpu', CELU ? 4 : 1), ESPERA = op('espera', 9000);
const SEL = cual === 'or' ? '[data-pnt-or]' : '[data-pnt-a3]';
const DEBUG = cual === 'or' ? 'ordebug' : 'a3debug';

const DEMORA = op('demora', 0);      // --demora ms: el 3D tarda eso de más (para ver el póster y cómo lo reemplaza el 3D)
const { browser, page, avisos } = await abrir({ ancho, alto, dpr, cpu, celular: CELU, query: DEBUG + (DEMORA ? '&' + (cual === 'or' ? 'or' : 'a3') + 'demora=' + DEMORA : '') });
await page.evaluateOnNewDocument((SEL) => {
  const M = window.__m = { lt: [], fr: [], ev: [], sc: [], llego: 0, asomo: 0, t0: performance.timeOrigin };
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => M.lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  let antes = '';
  const paso = (t) => {
    M.fr.push(Math.round(t * 10) / 10); M.sc.push(Math.round(scrollY));
    const h = document.querySelector(SEL), r = h && h.shadowRoot, c = r && r.getElementById('cargando'), st = r && r.getElementById('stage');
    if (c) {
      const cs = getComputedStyle(c), p = c.querySelector('.poster');
      const e = [c.classList.contains('con-poster') ? 'poster' : '', c.classList.contains('listo') ? 'listo' : '', c.classList.contains('fallo') ? 'fallo' : '',
        'capa' + Math.round(parseFloat(cs.opacity) * 10), p ? 'foto' + Math.round(parseFloat(getComputedStyle(p).opacity) * 10) : ''].join(' ').replace(/ +/g, ' ').trim();
      if (e !== antes) { antes = e; M.ev.push([Math.round(t), e]); }
    }
    if (st) {
      const b = st.getBoundingClientRect(), vis = Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0)) / Math.max(1, b.height);
      if (!M.asomo && vis > 0) M.asomo = Math.round(t);
      if (!M.llego && vis >= 0.25) M.llego = Math.round(t);
    }
    requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}, SEL);
await page.reload({ waitUntil: 'domcontentloaded' });
// El perfil de CPU (si se pidió): qué funciones ocupan cada tarea larga (desde la carga: también mientras la escena se prepara)
let prof = null, profT0 = 0;
if (PERFIL) {
  prof = await page.target().createCDPSession();
  await prof.send('Profiler.enable'); await prof.send('Profiler.setSamplingInterval', { interval: 400 });
  await prof.send('Profiler.start');
  // marca para poner en hora el perfil: una función con nombre propio que ocupa 15 ms a una hora conocida de la página
  profT0 = await page.evaluate(() => { const f = function __marcaPerfil() { const t = performance.now(); while (performance.now() - t < 15) {} return t; }; return f(); });
}

await espera(ESPERA);      // la intro de la home traba el scroll

// La captura de video (si se pidió): cuadros con su hora
const cuadros = [];
let cdp = null;
if (VIDEO) {
  cdp = await page.target().createCDPSession();
  cdp.on('Page.screencastFrame', (f) => { cuadros.push([f.metadata.timestamp * 1000, f.data]); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 55, everyNthFrame: 2 });
}

// Bajar con la rueda hasta que el escenario quede arriba (como una persona: muescas de 100 px)
await page.mouse.move(Math.round(ancho / 2), Math.round(alto / 2));
const donde = () => page.evaluate((SEL) => { const h = document.querySelector(SEL), st = h && h.shadowRoot && h.shadowRoot.getElementById('stage'); return st ? Math.round(st.getBoundingClientRect().top) : null; }, SEL);
let top = await donde(), vueltas = 0;
const tBaja = Date.now();
while (top !== null && top > 90 && vueltas < 900) {
  await page.mouse.wheel({ deltaY: top < 500 ? 60 : 100 });
  await espera(LENTO ? 140 : 45);
  if (LENTO && vueltas % 12 === 11) await espera(900);       // se frena a mirar
  top = await donde(); vueltas++;
}
const bajada = Date.now() - tBaja;
await espera(9000);
if (cdp) { await cdp.send('Page.stopScreencast').catch(() => {}); }

const r = await page.evaluate((SEL, cual) => {
  const M = window.__m, h = document.querySelector(SEL), dbg = cual === 'or' ? window.__or : window.__a3;
  return { M, tiempos: dbg && dbg.tiempos ? JSON.parse(JSON.stringify(dbg.tiempos)) : null, ahora: Math.round(performance.now()), nivel: dbg && dbg.nivel ? dbg.nivel() : null,
    top: h ? Math.round(h.shadowRoot.getElementById('stage').getBoundingClientRect().top) : null };
}, SEL, cual);
const M = r.M, L = M.llego || M.asomo;
const rel = (t) => Math.round(t - L);
// cuadros entre 1,5 s antes de llegar y 8 s después
const fr = M.fr, dts = [];
for (let i = 1; i < fr.length; i++) dts.push([fr[i], fr[i] - fr[i - 1], M.sc[i] - M.sc[i - 1]]);
const tramo = (a, b) => dts.filter((d) => d[0] >= L + a && d[0] < L + b);
const resumen = (a, b) => {
  const x = tramo(a, b); if (!x.length) return 'sin cuadros';
  const ms = x.map((d) => d[1]), suma = ms.reduce((s, v) => s + v, 0), peor = Math.max(...ms);
  const n = (u) => ms.filter((v) => v > u).length;
  return `${x.length} cuadros · ${(1000 * x.length / suma).toFixed(1)} fps · >25 ms: ${n(25)} · >50 ms: ${n(50)} · >100 ms: ${n(100)} · peor ${Math.round(peor)} ms`;
};
console.log(`\n=== ${cual === 'or' ? 'Aritos' : 'Pulsera'} · ${etiqueta} · ${ancho}×${alto} @${dpr}${cpu > 1 ? ' · CPU ÷' + cpu : ''}${LENTO ? ' · lento' : ''} ===`);
console.log(`bajada: ${bajada} ms en ${vueltas} muescas · asomó en ${M.asomo} · llegó (25 % visible) en ${M.llego} · quedó a ${r.top} px · nivel ${r.nivel}`);
console.log('escena (ms desde que se armó): ' + JSON.stringify(r.tiempos));
console.log('capa de carga (ms desde la llegada): ' + M.ev.map((e) => `${rel(e[0])}: ${e[1]}`).join('  |  '));
console.log('antes de llegar (-1500…0):  ' + resumen(-1500, 0));
console.log('al llegar (0…2000):         ' + resumen(0, 2000));
console.log('después (2000…8000):        ' + resumen(2000, 8000));
const trabas = tramo(-1500, 8000).filter((d) => d[1] > 34).map((d) => `${rel(d[0])}: ${Math.round(d[1])} ms`);
console.log('cuadros de más de 34 ms: ' + (trabas.length ? trabas.join(', ') : 'ninguno'));
const lt = M.lt.filter((x) => x[0] > L - 1500 && x[0] < L + 8000);
console.log('tareas largas: ' + (lt.length ? lt.map((x) => `${rel(x[0])}: ${x[1]} ms`).join(', ') : 'ninguna') + ` · suma ${lt.reduce((s, x) => s + x[1], 0)} ms`);
// mientras la escena se preparaba (después de la intro del inicio y antes de llegar): ahí también tiene que ir fluido
const previas = M.lt.filter((x) => x[0] > 2500 && x[0] <= L - 1500);
const cuadrosPrevios = dts.filter((d) => d[0] > 2500 && d[0] <= L - 1500 && d[1] > 34);
console.log('antes (de 2,5 s a la llegada -1,5 s; hora de la página): tareas largas ' + (previas.length ? previas.map((x) => `${x[0]}: ${x[1]} ms`).join(', ') : 'ninguna') +
  ' · cuadros de más de 34 ms: ' + (cuadrosPrevios.length ? cuadrosPrevios.map((d) => `${Math.round(d[0])}: ${Math.round(d[1])} ms`).join(', ') : 'ninguno'));
if (avisos.length) console.log('avisos: ' + avisos.slice(0, 6).join(' | '));

if (prof) {
  const { profile } = await prof.send('Profiler.stop');
  fs.mkdirSync(path.join(AQUI, 'capturas'), { recursive: true });
  fs.writeFileSync(path.join(AQUI, 'capturas', 'fluidez-' + etiqueta + '.cpuprofile'), JSON.stringify(profile));
  const nodo = new Map(), padre = new Map();
  profile.nodes.forEach((n) => { nodo.set(n.id, n); (n.children || []).forEach((c) => padre.set(c, n.id)); });
  const nombre = (n) => { const f = n.callFrame, u = (f.url || '').split('/').pop().split('?')[0]; return (f.functionName || '(anónima)') + (u ? ' · ' + u + ':' + (f.lineNumber + 1) : ''); };
  // hora de cada muestra en el reloj de la página (performance.now)
  let t = 0; const crudas = profile.timeDeltas.map((d) => (t += d) / 1000);
  const im = profile.samples.findIndex((id) => nodo.get(id).callFrame.functionName === '__marcaPerfil');
  const desfase = im > -1 ? profT0 - crudas[im] : profT0; const horas = crudas.map((h) => h + desfase);
  const ventana = (a, b, cuantos) => {
    const incl = new Map(), propio = new Map(); let total = 0;
    profile.samples.forEach((id, i) => {
      if (horas[i] < a || horas[i] >= b) return;
      const dt = (profile.timeDeltas[i + 1] || 400) / 1000; const n0 = nodo.get(id);
      if (!n0 || n0.callFrame.functionName === '(idle)') return;
      total += dt; propio.set(nombre(n0), (propio.get(nombre(n0)) || 0) + dt);
      const vistos = new Set(); let x = id;
      while (x !== undefined) { const n = nodo.get(x), k = nombre(n); if (!vistos.has(k)) { vistos.add(k); incl.set(k, (incl.get(k) || 0) + dt); } x = padre.get(x); }
    });
    const top = (m) => [...m.entries()].filter((e) => !/^\(root\)/.test(e[0])).sort((x, y) => y[1] - x[1]).slice(0, cuantos).map((e) => `${Math.round(e[1])} ms ${e[0]}`);
    return { total: Math.round(total), incl: top(incl), propio: top(propio) };
  };
  const SEP = '\n    ';
  console.log('\n--- perfil: de -1500 a +8000 ms de la llegada ---');
  const g = ventana(L - 1500, L + 8000, 32);
  console.log('CPU ocupada: ' + g.total + ' ms\n  con lo que llaman (inclusive):' + SEP + g.incl.join(SEP) + '\n  propio:' + SEP + g.propio.slice(0, 18).join(SEP));
  lt.concat(previas).filter((x) => x[1] >= 50).forEach((x) => { const v = ventana(x[0] - 2, x[0] + x[1] + 2, 9); console.log('\n  tarea larga en ' + rel(x[0]) + ' (' + x[1] + ' ms):' + SEP + v.incl.join(SEP)); });
}

if (VIDEO && cuadros.length) {
  // tira: desde 0,4 s antes de llegar, un cuadro cada ~200 ms durante 6 s
  const epoca = M.t0 + L, dir = path.join(AQUI, 'capturas', 'fluidez-' + etiqueta);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const lista = [];
  for (let t = -400; t <= 6000; t += 200) {
    let mejor = null;
    for (const c of cuadros) { if (c[0] <= epoca + t + 20 && (!mejor || c[0] > mejor[0])) mejor = c; }
    if (!mejor) continue;
    const f = path.join(dir, String(t + 400).padStart(5, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(mejor[1], 'base64')); lista.push([f, t]);
  }
  fs.writeFileSync(path.join(dir, 'lista.json'), JSON.stringify(lista));
  const sale = path.join(AQUI, 'capturas', 'fluidez-' + etiqueta + '.jpg');
  try { execFileSync('python', [path.join(AQUI, 'tira.py'), dir, sale], { stdio: 'inherit' }); console.log('tira: ' + sale + ' (' + cuadros.length + ' cuadros de video)'); } catch (e) { console.log('no se pudo armar la tira: ' + e.message); }
}
await browser.close(); process.exit(0);
