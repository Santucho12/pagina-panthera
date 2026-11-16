// Recorre todas las páginas de la tienda local (compu y celular): captura de página entera + lista de colores y letras fuera de la
// paleta de Panthera. node herramientas/revision/recorrido.mjs <carpeta de salida> [filtro]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const SALIDA = process.argv[2]; const FILTRO = process.argv[3] || '';
fs.mkdirSync(SALIDA, { recursive: true });
const B = 'http://localhost:5700';
const PAGINAS = [
  ['inicio', '/'],
  ['categoria-todos', '/todos-los-productos/?sort_by=created-descending'],
  ['categoria-pulseras', '/todos-los-productos/pulseras/?sort_by=created-descending'],
  ['categoria-dijes-gold', '/dijes-gold-para-cadenas/?sort_by=created-descending'],
  ['producto-pulsera', '/productos/pulsera-silver-flower-454/'],
  ['producto-charm', '/productos/jazmin-1940/'],
  ['producto-anillo', '/productos/anillo-flowers/'],
  ['pagina-cuidados', '/cuidados/'],
  ['contacto', '/contacto/'],
  ['arrepentimiento', '/contacto/?order_cancellation_without_id=true'],
  ['busqueda', '/search/?q=mickey'],
  ['busqueda-vacia', '/search/?q=zzqqxx'],
  ['carrito', '/comprar/'],
  ['login', '/account/login/'],
  ['registro', '/account/register/'],
  ['olvide-clave', '/account/reset/'],
  ['blog', '/blog/'],
  ['404', '/esta-pagina-no-existe/'],
].filter(([n]) => n.includes(FILTRO));
const PALETA = ['#f4acc4', '#f29ab7', '#eec049', '#eab838', '#edc45f', '#f0bc33', '#ffffff', '#000000', '#4d4d4d', '#ee779f', '#e60000',
  '#25d366', '#075e54', '#f5385e', '#ff8a1f', '#ffc81a', '#0a0a0a', '#53bdeb', '#0b3b24', '#e9ce91'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const informe = [];
const MODOS = [['compu', { width: 1536, height: 864, deviceScaleFactor: 1 }], ['celu', { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }]];
for (const [modo, vp] of MODOS) {
  for (const [nombre, ruta] of PAGINAS) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
    await page.setViewport(vp);
    if (modo === 'celu') await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    try { await page.goto(B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { /* sigue */ }
    await espera(2500);
    // bajar de a poco para que aparezca todo (entradas, imágenes perezosas) y volver arriba
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < alto; y += 500) {
      await page.evaluate((y) => { if (window.lenis) { window.lenis.scrollTo(y, { immediate: true, force: true }); } else { window.scrollTo(0, y); } }, y);
      await espera(180);
    }
    await espera(1200);
    await page.evaluate(() => { if (window.lenis) { window.lenis.scrollTo(0, { immediate: true, force: true }); window.lenis.stop(); } window.scrollTo(0, 0); });
    await espera(800);
    const datos = await page.evaluate((PALETA) => {
      const hex = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        if (p.length > 3 && p[3] === 0) return null;
        return '#' + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      };
      const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      const cerca = (h) => {
        const a = rgb(h);
        if (Math.max(...a) - Math.min(...a) <= 3) return 'gris';   // grises neutros: transparencias del negro o del gris
        return PALETA.some((p) => { const b = rgb(p); return a.every((v, i) => Math.abs(v - b[i]) <= 6); });
      };
      const nom = (el) => {
        let s = el.tagName.toLowerCase();
        if (el.id) s += '#' + el.id;
        if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.');
        return s;
      };
      const quien = (el) => (el.parentElement ? nom(el.parentElement) + ' > ' : '') + nom(el);
      const colores = {}, letras = {};
      const anota = (obj, k, v) => { obj[k] = obj[k] || []; if (obj[k].length < 3) obj[k].push(v); };
      for (const el of document.querySelectorAll('body *')) {
        const esSvg = el instanceof SVGElement;
        if (esSvg && el.tagName.toLowerCase() !== 'svg' && el.tagName.toLowerCase() !== 'path') continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        const texto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        const props = [['fondo', cs.backgroundColor]];
        if (texto) props.push(['texto', cs.color]);
        if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') props.push(['borde', cs.borderTopColor]);
        if (esSvg) props.push(['icono', cs.fill && cs.fill !== 'none' ? cs.fill : cs.stroke]);
        for (const [tipo, c] of props) {
          const h = c && hex(c); if (!h || cerca(h)) continue;
          anota(colores, tipo + ' ' + h, quien(el) + (texto ? ' «' + el.textContent.trim().slice(0, 25) + '»' : ''));
        }
        if (texto && !esSvg) {
          const f = cs.fontFamily.split(',')[0].replace(/"/g, '').trim();
          if (!/^(Pnt Montserrat|Libre Baskerville)$/.test(f)) anota(letras, f, quien(el) + ' «' + el.textContent.trim().slice(0, 25) + '»');
        }
      }
      return { colores, letras, titulo: document.title, url: location.href, ancho: document.documentElement.scrollWidth, vista: innerWidth };
    }, PALETA);
    const archivo = path.join(SALIDA, modo + '-' + nombre + '.jpg');
    await page.screenshot({ path: archivo, fullPage: true, type: 'jpeg', quality: 55, captureBeyondViewport: true }).catch((e) => informe.push('captura falló ' + e.message));
    informe.push('\n=== ' + modo + ' ' + nombre + ' (' + datos.url + ') ' + datos.titulo + (datos.ancho > datos.vista + 1 ? ' · SE DESBORDA A LO ANCHO: ' + datos.ancho + ' > ' + datos.vista : ''));
    for (const [k, v] of Object.entries(datos.colores)) informe.push('  color ' + k + ': ' + v.join(' | '));
    for (const [k, v] of Object.entries(datos.letras)) informe.push('  letra ' + k + ': ' + v.join(' | '));
    await page.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(SALIDA, 'informe.txt'), informe.join('\n'));
console.log('listo: ' + path.join(SALIDA, 'informe.txt'));
