// Análisis de realismo de los DOS armadores (2026-11-14, pedido del usuario: "necesitamos hacerlo más real todavía… analizalo,
// abrí Chrome y miralo: dimensiones, por qué no se ve real, errores, qué hay que hacer").
//   node herramientas/armador/pruebas/realismo.mjs <etapa> [etiqueta]
// Etapas (de a una: cada una abre su Chrome): vista (lo que ve el usuario, 1536×730 a 1,25) · a3 (pulsera, detalle a 2× y tiras
// de movimiento con reloj fijo) · or (aritos, ídem) · celu (390×844 a 3×). Salida: capturas/<etiqueta>/ (por defecto realismo).
// Las tiras (tira-*.jpg) se arman con Python (PIL) al final de cada etapa. El carrito no se toca (los POST se interceptan).
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { abrir, irASeccion, esperaListo, espera, clicBase, clicCharm, enA3, AQUI } from './comun.mjs';

const etapa = process.argv[2] || 'vista';
const DIR = path.join(AQUI, 'capturas', process.argv[3] || 'realismo');
fs.mkdirSync(DIR, { recursive: true });
const sale = (n) => path.join(DIR, n);

// ── ayudas comunes a los dos armadores ──
const SEL = { a3: '[data-pnt-a3]', or: '[data-pnt-or]' };
async function irA(page, cual, arriba = 150) {
  for (let i = 0; i < 50; i++) {
    const top = await page.evaluate((sel, arriba) => {
      const h = document.querySelector(sel); if (!h) return 1e9;
      const st = h.shadowRoot.getElementById('stage');
      const y = st.getBoundingClientRect().top + window.scrollY - arriba;
      if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
      window.scrollTo(0, y);
      return st.getBoundingClientRect().top;
    }, SEL[cual], arriba);
    if (Math.abs(top - arriba) < 4) return true;
    await espera(300);
  }
  return false;
}
async function listo(page, cual, extra = 4500) {
  const ya = () => page.evaluate((sel) => { const r = document.querySelector(sel); const c = r && r.shadowRoot && r.shadowRoot.getElementById('cargando'); return !!(c && c.classList.contains('listo')); }, SEL[cual]);
  for (let i = 0; i < 120 && !(await ya()); i++) { await irA(page, cual); await espera(500); }
  for (let t = 0; t < extra; t += 500) { await irA(page, cual); await espera(500); }
}
const enRaiz = (page, cual, fn, ...args) => page.evaluate((sel, src, args) => {
  const raiz = document.querySelector(sel).shadowRoot; return (new Function('raiz', 'args', 'return (' + src + ')(raiz, ...args)'))(raiz, args);
}, SEL[cual], fn.toString(), args);
async function cajaEscenario(page, cual) {
  return page.evaluate((sel) => {
    const r = document.querySelector(sel).shadowRoot.getElementById('stage').getBoundingClientRect();
    const y = Math.max(0, r.top), alto = Math.min(r.bottom, innerHeight) - y;
    return { x: Math.max(0, r.left) + scrollX, y: y + scrollY, width: Math.min(r.width, innerWidth), height: alto };
  }, SEL[cual]);
}
async function fotoEscenario(page, cdp, cual, archivo, escala) {
  const clip = { ...(await cajaEscenario(page, cual)), scale: escala || 2 };
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip });
  fs.writeFileSync(sale(archivo), Buffer.from(data, 'base64'));
  return clip;
}
// Tira de movimiento con RELOJ FIJO: la escena avanza 1/30 s por cuadro; se guarda 1 de cada `cada` cuadros y Python arma la hoja
async function tira(page, cdp, cual, nombre, cuadros, cada, hacer, durante) {
  const hook = cual === 'a3' ? '__a3' : '__or';
  const tmp = sale('_t-' + nombre); fs.mkdirSync(tmp, { recursive: true });
  await irA(page, cual);
  const clip = { ...(await cajaEscenario(page, cual)), scale: 1 };
  await page.evaluate((h) => window[h].relojManual(true), hook);
  if (hacer) await hacer();
  const lista = [];
  for (let i = 0; i < cuadros; i++) {
    if (durante) await durante(i);
    await page.evaluate((h) => window[h].avanza(1 / 30), hook);
    if (i % cada === 0) {
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: false, clip });
      const f = path.join(tmp, 'c' + String(i).padStart(4, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(data, 'base64'));
      lista.push([f, Math.round((i + 1) * 1000 / 30)]);
    }
  }
  await page.evaluate((h) => window[h].relojManual(false), hook);
  fs.writeFileSync(path.join(tmp, 'lista.json'), JSON.stringify(lista));
  try { execFileSync('python', [path.join(AQUI, 'tira.py'), tmp, sale('tira-' + nombre + '.jpg'), '5'], { stdio: 'inherit' }); } catch (e) { console.log('tira', nombre, 'falló:', String(e).slice(0, 120)); }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('tira', nombre, lista.length, 'cuadros');
  await espera(300);
}
const cierraCookies = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find((x) => /entendido|aceptar/i.test(x.textContent || '')); if (b) b.click(); });

// ═════════ vista: lo que ve el usuario en su ventana (1536×730 a DPR 1,25) ═════════
if (etapa === 'vista') {
  const { browser, page, avisos } = await abrir({ ancho: 1536, alto: 730, dpr: 1.25, query: 'a3debug&ordebug' });
  await espera(3000); await cierraCookies(page);
  for (const cual of ['a3', 'or']) {
    await irA(page, cual); await listo(page, cual);
    await page.screenshot({ path: sale('vista-' + cual + '.png') });
    // con la cabecera de la sección a la vista (como se llega bajando)
    await page.evaluate((sel) => {
      const sec = document.querySelector(sel).closest('section') || document.querySelector(sel);
      const y = sec.getBoundingClientRect().top + window.scrollY - 96;
      if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
      window.scrollTo(0, y);
    }, SEL[cual]);
    await espera(900);
    await page.screenshot({ path: sale('vista-' + cual + '-cab.png') });
    const med = await page.evaluate((sel) => {
      const h = document.querySelector(sel), r = h.shadowRoot, q = (id) => { const e = r.getElementById(id); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
      const sec = (h.closest('section') || h).getBoundingClientRect();
      return { ventana: [innerWidth, innerHeight], seccion: [Math.round(sec.width), Math.round(sec.height)], host: [Math.round(h.getBoundingClientRect().width), Math.round(h.getBoundingClientRect().height)], stage: q('stage'), canvas: q('c'), tira: q('tira'), total: q('total') || q('total-ranura'), dprCanvas: r.getElementById('c').width / r.getElementById('c').getBoundingClientRect().width };
    }, SEL[cual]);
    console.log(cual, JSON.stringify(med));
  }
  console.log('avisos:', avisos.length ? avisos.slice(0, 10) : 'ninguno');
  await browser.close(); process.exit(0);
}

// ═════════ a3: la pulsera en detalle ═════════
if (etapa === 'a3') {
  const { browser, page, avisos } = await abrir({ ancho: 1600, alto: 900, dpr: 2, query: 'a3debug' });
  const cdp = await page.target().createCDPSession();
  await espera(3000); await cierraCookies(page); await irASeccion(page); await esperaListo(page, 4500);
  const c0 = await fotoEscenario(page, cdp, 'a3', 'a3-01-ejemplo.png');
  console.log('escenario', JSON.stringify(c0));
  // datos de la escena: medidas de cada pieza en unidades del 3D y en pantalla
  const datos = await page.evaluate(() => {
    const a = window.__a3, T = a.THREE, v = new T.Vector3(), caja = new T.Box3();
    const cam = a.camera, cv = a.renderer.domElement.getBoundingClientRect();
    const px = (p) => { v.copy(p).project(cam); return [Math.round((v.x + 1) / 2 * cv.width), Math.round((1 - v.y) / 2 * cv.height)]; };
    const piezas = a.vivos.map((c) => { caja.setFromObject(c.col || c.g || c.obj || c.grupo || c.mesh); const s = caja.getSize(new T.Vector3()); return { k: c.k, tam: [+s.x.toFixed(3), +s.y.toFixed(3), +s.z.toFixed(3)], en: px(caja.getCenter(new T.Vector3())) }; });
    return { fov: cam.fov, pos: cam.position.toArray().map((n) => +n.toFixed(2)), canvas: [Math.round(cv.width), Math.round(cv.height)], piezas, claves: Object.keys(a.vivos[0] || {}).slice(0, 60) };
  }).catch((e) => ({ error: String(e).slice(0, 300) }));
  console.log('datos', JSON.stringify(datos));
  await tira(page, cdp, 'a3', 'a3-intro', 80, 4, () => page.evaluate(() => window.__a3.repiteIntro()));
  await tira(page, cdp, 'a3', 'a3-reposo', 150, 10);
  await tira(page, cdp, 'a3', 'a3-sumar-colgante', 60, 3, () => clicCharm(page, 'jaz'));
  await tira(page, cdp, 'a3', 'a3-sumar-cuenta', 60, 3, () => clicCharm(page, 'vali'));
  await tira(page, cdp, 'a3', 'a3-sacar', 45, 3, () => clicCharm(page, 'vali'));
  // girar arrastrando: el mouse cruza el escenario en 12 cuadros y suelta; después se ve la inercia
  const cj = await cajaEscenario(page, 'a3'), sy = await page.evaluate(() => scrollY);
  const mx = cj.x + cj.width * 0.45, my = cj.y - sy + cj.height * 0.42;
  await tira(page, cdp, 'a3', 'a3-giro', 75, 3, async () => { await page.mouse.move(mx - 160, my); await page.mouse.down(); }, async (i) => {
    if (i < 12) await page.mouse.move(mx - 160 + (i + 1) * 30, my + i * 2); else if (i === 12) await page.mouse.up();
  });
  await espera(1500);
  await tira(page, cdp, 'a3', 'a3-lupa', 75, 5, () => page.evaluate(() => window.__a3.lupa('stit')));
  await fotoEscenario(page, cdp, 'a3', 'a3-03-lupa-mick.png');
  await page.evaluate(() => window.__a3.lupa('jaz')); await espera(1800);
  await fotoEscenario(page, cdp, 'a3', 'a3-03-lupa-jaz.png');
  await page.evaluate(() => window.__a3.lupa('cierre')); await espera(1800);
  await fotoEscenario(page, cdp, 'a3', 'a3-04-lupa-cierre.png');
  await page.evaluate(() => window.__a3.lupa(null)); await espera(1200);
  for (const k of ['adve', 'moon', 'cora', 'minn']) { await clicCharm(page, k).catch(() => {}); await espera(900); }
  await espera(2500);
  await fotoEscenario(page, cdp, 'a3', 'a3-02-8charms.png');
  await tira(page, cdp, 'a3', 'a3-base', 100, 5, () => clicBase(page, 'crys'));
  await espera(2500);
  await fotoEscenario(page, cdp, 'a3', 'a3-05-base-crystal.png');
  await clicBase(page, 'rigi'); await espera(4500);
  await fotoEscenario(page, cdp, 'a3', 'a3-06-base-rigida.png');
  console.log('avisos:', avisos.length ? avisos.slice(0, 10) : 'ninguno');
  await browser.close(); process.exit(0);
}

// ═════════ or: los aritos en detalle ═════════
if (etapa === 'or') {
  const { browser, page, avisos } = await abrir({ ancho: 1600, alto: 900, dpr: 2, query: 'ordebug' });
  const cdp = await page.target().createCDPSession();
  await espera(3000); await cierraCookies(page); await irA(page, 'or'); await listo(page, 'or');
  const c0 = await fotoEscenario(page, cdp, 'or', 'or-01-ejemplo.png');
  console.log('escenario', JSON.stringify(c0));
  const datos = await page.evaluate(() => {
    const a = window.__or, cam = a.camera, cv = a.renderer.domElement.getBoundingClientRect();
    return { fov: cam.fov, pos: cam.position.toArray().map((n) => +n.toFixed(2)), canvas: [Math.round(cv.width), Math.round(cv.height)], vivos: a.vivos.map((o) => o.k), MOV: a.MOV, AG: JSON.parse(JSON.stringify(a.AG, (k, v) => (v && v.isObject3D) || (v && v.isVector3 && false) ? undefined : v)) };
  }).catch((e) => ({ error: String(e).slice(0, 300) }));
  console.log('datos', JSON.stringify(datos).slice(0, 3000));
  await tira(page, cdp, 'or', 'or-reposo', 150, 10);
  await tira(page, cdp, 'or', 'or-hamaca', 75, 3, () => page.evaluate(() => window.__or.hamaca(1)));
  // sumar un tercer arito (la primera tarjeta de aro que no esté puesta) y un ear cuff
  const tercero = await enRaiz(page, 'or', (raiz) => { const c = [...raiz.querySelectorAll('.card')].find((x) => x.getAttribute('aria-pressed') !== 'true' && x.dataset.cat !== 'Ear cuffs' && !x.hidden); return c ? c.dataset.k : null; });
  console.log('tercero', tercero);
  await tira(page, cdp, 'or', 'or-sumar', 75, 3, () => enRaiz(page, 'or', (raiz, k) => raiz.querySelector('.card[data-k="' + k + '"]').click(), tercero));
  await tira(page, cdp, 'or', 'or-sumar-cuff', 75, 3, () => enRaiz(page, 'or', (raiz) => raiz.querySelector('.card[data-k="cshi"]').click()));
  await espera(2500);
  await fotoEscenario(page, cdp, 'or', 'or-02-completa.png');
  await tira(page, cdp, 'or', 'or-lupa', 75, 5, () => page.evaluate(() => window.__or.lupa('estr')));
  await fotoEscenario(page, cdp, 'or', 'or-03-lupa-estr.png');
  await page.evaluate(() => window.__or.lupa('chag')); await espera(1800);
  await fotoEscenario(page, cdp, 'or', 'or-03-lupa-chag.png');
  await page.evaluate(() => window.__or.lupa('cshi')); await espera(1800);
  await fotoEscenario(page, cdp, 'or', 'or-04-lupa-cuff.png');
  await page.evaluate(() => window.__or.lupa(null)); await espera(1200);
  // de 3 aritos a 1 (se sacan dos) y la vista sola
  await tira(page, cdp, 'or', 'or-sacar', 60, 3, () => enRaiz(page, 'or', (raiz, k) => raiz.querySelector('.card[data-k="' + k + '"]').click(), tercero));
  console.log('avisos:', avisos.length ? avisos.slice(0, 10) : 'ninguno');
  await browser.close(); process.exit(0);
}

// ═════════ celu: los dos en el celular (390×844 a 3×) ═════════
if (etapa === 'celu') {
  const { browser, page, avisos } = await abrir({ ancho: 390, alto: 844, dpr: 3, celular: true, query: 'a3debug&ordebug' });
  await espera(3500); await cierraCookies(page);
  for (const cual of ['a3', 'or']) {
    await irA(page, cual, 70); await listo(page, cual);
    const alto = await page.evaluate((sel) => (document.querySelector(sel).closest('section') || document.querySelector(sel)).getBoundingClientRect().height, SEL[cual]);
    const pasos = Math.min(5, Math.ceil((alto + 100) / 620));
    for (let i = 0; i < pasos; i++) {
      await page.evaluate((sel, dy) => {
        const sec = document.querySelector(sel).closest('section') || document.querySelector(sel);
        const y = sec.getBoundingClientRect().top + window.scrollY - 70 + dy;
        if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
        window.scrollTo(0, y);
      }, SEL[cual], i * 620);
      await espera(1100);
      await page.screenshot({ path: sale('celu-' + cual + '-' + (i + 1) + '.png') });
    }
    console.log(cual, 'alto de la sección en celular:', Math.round(alto), 'px ·', pasos, 'pantallas');
  }
  console.log('avisos:', avisos.length ? avisos.slice(0, 10) : 'ninguno');
  await browser.close(); process.exit(0);
}
// ═════════ a3mov / ormov: solo las tiras de movimiento (después de un cambio) ═════════
if (etapa === 'a3mov') {
  const { browser, page, avisos } = await abrir({ ancho: 1536, alto: 730, dpr: 1.25, query: 'a3debug' });
  const cdp = await page.target().createCDPSession();
  await espera(3000); await cierraCookies(page); await irA(page, 'a3', 150); await listo(page, 'a3');
  await tira(page, cdp, 'a3', 'mov-a3-sumar-colgante', 66, 3, () => clicCharm(page, 'jaz'));
  await tira(page, cdp, 'a3', 'mov-a3-sumar-cuenta', 66, 3, () => clicCharm(page, 'vali'));
  const cj = await cajaEscenario(page, 'a3'), sy = await page.evaluate(() => scrollY);
  const mx = cj.x + cj.width * 0.45, my = cj.y - sy + cj.height * 0.42;
  await tira(page, cdp, 'a3', 'mov-a3-giro', 120, 6, async () => { await page.mouse.move(mx - 160, my); await page.mouse.down(); }, async (i) => {
    if (i < 12) await page.mouse.move(mx - 160 + (i + 1) * 30, my + i * 2); else if (i === 12) await page.mouse.up();
  });
  console.log('avisos:', avisos.length ? avisos.slice(0, 10) : 'ninguno');
  await browser.close(); process.exit(0);
}
if (etapa === 'ormov') {
  const { browser, page, avisos } = await abrir({ ancho: 1536, alto: 730, dpr: 1.25, query: 'ordebug' });
  const cdp = await page.target().createCDPSession();
  await espera(3000); await cierraCookies(page); await irA(page, 'or', 150); await listo(page, 'or');
  await tira(page, cdp, 'or', 'mov-or-sumar', 60, 3, () => enRaiz(page, 'or', (raiz) => raiz.querySelector('.card[data-k="espm"]').click()));
  await tira(page, cdp, 'or', 'mov-or-sacar', 45, 3, () => enRaiz(page, 'or', (raiz) => raiz.querySelector('.card[data-k="espm"]').click()));
  console.log('avisos:', avisos.length ? avisos.slice(0, 10) : 'ninguno');
  await browser.close(); process.exit(0);
}
console.log('etapa desconocida:', etapa);
process.exit(1);
