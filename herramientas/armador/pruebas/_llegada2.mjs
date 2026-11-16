// Llegada al armador bajando con la rueda (Lenis), con el 3D ya preparado: qué se ve y cuándo. node _llegada2.mjs <a3|or>
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../../node_modules/puppeteer-core');
import fs from 'fs'; import path from 'path';
const celu = process.argv.includes('celu');
const cual = process.argv[2] || 'a3', SEL = cual === 'a3' ? '[data-pnt-a3]' : '[data-pnt-or]';
const espera = (ms) => new Promise((r) => setTimeout(r, ms)); const perfil = path.join(process.env.TEMP, 'pnt-lleg-' + Date.now());
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, userDataDir: perfil, args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', celu ? '--window-size=430,960' : '--window-size=1560,880'] });
try {
  const p = (await b.pages())[0]; await p.setViewport(celu ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1536, height: 730, deviceScaleFactor: 1.25 }); const cdp = await p.target().createCDPSession();
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.goto('http://localhost:5700/?a3debug&ordebug', { waitUntil: 'load', timeout: 120000 });
  await espera(9000);
  const estado0 = await p.evaluate((sel) => { const r = document.querySelector(sel).shadowRoot; return { listo: r.getElementById('cargando').classList.contains('listo'), canvasVe: r.getElementById('c').classList.contains('ve'), tiempos: (window.__a3 && window.__a3.tiempos) || null }; }, SEL);
  console.log('a los 9 s de cargar:', JSON.stringify(estado0).slice(0, 400));
  // ir hasta 1.200 px antes de la sección y llegar con la rueda
  await p.evaluate((sel) => { const y = document.querySelector(sel).getBoundingClientRect().top + scrollY - 1500; if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); }, SEL);
  await espera(1200);
  await p.evaluate((sel) => { const r = document.querySelector(sel).shadowRoot, st = r.getElementById('stage'), t0 = performance.now(); window.__ll = []; let ult = '';
    (function f() { const b = st.getBoundingClientRect(), vis = Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0)) / b.height; const car = r.getElementById('cargando'), c = r.getElementById('c'), po = car.querySelector('.poster'), card = r.querySelector('.card[data-k="stit"] img, .card img');
      const s = 'vis ' + Math.round(vis * 100) + '% · cargando ' + (car.classList.contains('listo') ? 'listo' : 'NO') + (car.classList.contains('con-poster') ? '+poster' : '') + ' op ' + getComputedStyle(car).opacity + ' · canvas ' + (c.classList.contains('ve') ? 've' : 'oculto') + ' · poster op ' + (po ? getComputedStyle(po).opacity : '-') + ' · tarjeta ' + (card ? (card.complete && card.naturalWidth > 2 ? 'cargada' : 'vacía') + ' op ' + getComputedStyle(card).opacity : '-');
      if (s !== ult) { ult = s; window.__ll.push(Math.round(performance.now() - t0) + ' ms  ' + s); } if (performance.now() - t0 < 4000) requestAnimationFrame(f); })(); }, SEL);
  if (celu) { for (let k = 0; k < 4; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 680 }] }); for (let i = 1; i <= 9; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 680 - 460 * i / 9 }] }); await espera(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await espera(300); } }
  else { await p.mouse.move(760, 420); for (let i = 0; i < 22; i++) { await p.mouse.wheel({ deltaY: 100 }); await espera(55); } }
  await espera(2600);
  (await p.evaluate(() => window.__ll)).forEach((x) => console.log(x));
} finally { await b.close(); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {} }
process.exit(0);
