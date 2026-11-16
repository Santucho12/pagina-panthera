// Recorrido de UX (2026-11-11): la sección entera de cada armador en compu (1440) y en celular (pantallas sucesivas), para revisar
// lo que ve una clienta nueva. Corre sobre el preview (localhost:5700); el carrito no se toca. Uso: node recorrido.mjs [etiqueta]
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const puppeteer = require('../../../node_modules/puppeteer-core');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(AQUI, 'capturas', process.argv[2] || 'recorrido');
fs.mkdirSync(DIR, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const ARMADORES = [['pulsera', '[data-pnt-a3]'], ['oreja', '[data-pnt-or]']];
for (const [ancho, alto, cel] of [[1440, 900, false], [390, 844, true]]) {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (r) => { const u = r.url(); if (/\/__(recarga|version)/.test(u)) return r.abort(); if (r.method() === 'POST' && u.includes('/comprar')) return r.respond({ status: 200, contentType: 'application/json', body: '{"success":true}' }); r.continue(); });
    await page.setViewport({ width: ancho, height: alto, deviceScaleFactor: 1, isMobile: cel, hasTouch: cel });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.goto('http://localhost:5700/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await espera(3000);
    // cerrar el aviso de cookies si está (tapa la parte de abajo en el celular)
    await page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find((x) => /entendido/i.test(x.textContent || '')); if (b) b.click(); });
    for (const [nombre, sel] of ARMADORES) {
      // ir a la sección y esperar el 3D
      const ir = (dy) => page.evaluate((sel, dy) => {
        const sec = document.querySelector(sel).closest('section');
        const y = sec.getBoundingClientRect().top + window.scrollY - 110 + dy;
        if (window.lenis) { window.lenis.stop(); window.lenis.scrollTo(y, { immediate: true, force: true }); }
        window.scrollTo(0, y); return sec.getBoundingClientRect().height;
      }, sel, dy);
      let altoSec = await ir(0);
      for (let i = 0; i < 60; i++) { await ir(0); const ok = await page.evaluate((sel) => document.querySelector(sel).shadowRoot.getElementById('cargando').classList.contains('listo'), sel); if (ok) break; await espera(500); }
      await espera(4500);
      const pasos = cel ? Math.ceil((altoSec + 120) / (alto - 200)) : 1;
      for (let i = 0; i < pasos; i++) {
        await ir(i * (alto - 200)); await espera(700);
        await page.screenshot({ path: path.join(DIR, (cel ? 'cel' : 'compu') + '-' + nombre + '-' + (i + 1) + '.png') });
      }
    }
  } finally { await browser.close(); }
}
console.log('listo:', fs.readdirSync(DIR).join(' '));
