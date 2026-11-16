// Diagnóstico (2026-11-11, "cuando agrego charms en la pulsera se recarga la página"): abre el inicio del preview SIN bloquear
// /__recarga, suma charms tocando las tarjetas (y en el celular, también con la barra) y anota cada navegación o recarga, los
// mensajes del preview (/__recarga) y los errores. El carrito real no se toca (los POST a /comprar/ se interceptan).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('../../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [nombre, w, h, cel] of [['compu', 1440, 900, false], ['celular', 390, 844, true]]) {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
  const p = await b.newPage(), eventos = [];
  const t0 = Date.now(), t = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  p.on('framenavigated', (f) => { if (f === p.mainFrame()) eventos.push(t() + ' NAVEGA ' + f.url()); });
  p.on('console', (m) => { const x = m.text(); if (m.type() === 'error' || x.includes('recarga') || x.includes('PNT')) eventos.push(t() + ' consola ' + m.type() + ': ' + x.slice(0, 160)); });
  p.on('pageerror', (e) => eventos.push(t() + ' ERROR ' + String(e).slice(0, 200)));
  await p.setRequestInterception(true);
  p.on('request', (r) => {
    const u = r.url();
    if (r.method() === 'POST' && u.includes('/comprar')) { eventos.push(t() + ' POST /comprar/ (interceptado)'); return r.respond({ status: 200, contentType: 'application/json', body: '{"success":true}' }); }
    if (r.isNavigationRequest() && r.frame() === p.mainFrame() && u.includes('/comprar')) { eventos.push(t() + ' iría al carrito (cortado)'); return r.respond({ status: 204, body: '' }); }
    r.continue();
  });
  // los mensajes del preview por /__recarga (EventSource): se espían desde la página
  await p.evaluateOnNewDocument(() => {
    const ES = window.EventSource;
    window.EventSource = function (u) { const es = new ES(u); es.addEventListener('message', (e) => console.log('PNT recarga dice: ' + e.data)); return es; };
    window.EventSource.prototype = ES.prototype;
    addEventListener('beforeunload', () => console.log('PNT se va la página (beforeunload)'));
  });
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: cel, hasTouch: cel });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.goto('http://localhost:5700/?a3debug', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await espera(3000);
  const ir = () => p.evaluate(() => { const st = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('stage'); const y = st.getBoundingClientRect().top + scrollY - 40; if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); } scrollTo(0, y); });
  for (let i = 0; i < 40; i++) { await ir(); const ok = await p.evaluate(() => document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('cargando').classList.contains('listo')); if (ok) break; await espera(500); }
  await espera(3000);
  eventos.push(t() + ' --- empiezo a sumar charms');
  for (const k of ['stit', 'vali', 'ange', 'rosa']) {
    // un toque de verdad (mouse/touch) sobre la tarjeta, como la persona
    const r = await p.evaluate((k) => { const c = document.querySelector('[data-pnt-a3]').shadowRoot.querySelector('.card[data-k="' + k + '"]'); c.scrollIntoView({ block: 'center', inline: 'center' }); const q = c.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.width / 2 }; }, k);
    await espera(400);
    if (cel) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y);
    await espera(1800);
    const sel = await p.evaluate(() => [...document.querySelector('[data-pnt-a3]').shadowRoot.querySelectorAll('#lista li [data-quitar]')].map((x) => x.dataset.quitar).join(',')).catch(() => '(la página se fue)');
    eventos.push(t() + ' sumé ' + k + ' → lista: ' + sel);
  }
  await espera(2000);
  console.log('\n== ' + nombre + '\n' + eventos.join('\n'));
  await b.close();
}
