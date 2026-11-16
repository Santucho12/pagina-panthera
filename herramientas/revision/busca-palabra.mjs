// Busca una palabra en el texto VISIBLE de la tienda local (también adentro de los Shadow DOM de los armadores y en los atributos
// que se leen: alt, title, aria-label, placeholder). Recorre el inicio, listados, páginas y las fichas de los primeros productos
// de una categoría. node herramientas/revision/busca-palabra.mjs <palabra> [categoría para las fichas, ej. aros]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('../../node_modules/puppeteer-core');
const PALABRA = (process.argv[2] || 'agujer').toLowerCase();
const CAT = process.argv[3] || 'aros';
const B = 'http://localhost:5700';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const p = await browser.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.setRequestInterception(true);
p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
async function revisar(ruta, intento = 1) {
  try { return await revisarUnaVez(ruta); } catch (e) {
    if (intento >= 3) return { hallazgos: ['(no se pudo leer: ' + e.message.slice(0, 80) + ')'], url: ruta };
    await espera(1500); return revisar(ruta, intento + 1);   // la página se recargó sola (orden "Novedades"): de nuevo
  }
}
async function revisarUnaVez(ruta) {
  await p.goto(B + ruta, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  await espera(2500);
  // bajar para que se armen las secciones que aparecen al llegar
  const alto = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 700) { await p.evaluate((y) => { if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }, y); await espera(120); }
  await espera(1500);
  return p.evaluate((palabra) => {
    const hallazgos = [];
    const mirar = (raiz, donde) => {
      const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = caminante.nextNode())) {
        const t = n.textContent; if (!t || !t.toLowerCase().includes(palabra)) continue;
        const el = n.parentElement; if (!el || el.closest('script, style, noscript, template')) continue;
        hallazgos.push(donde + ' texto: «' + t.trim().replace(/\s+/g, ' ').slice(0, 140) + '» (' + el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + ')');
      }
      raiz.querySelectorAll('[alt],[title],[aria-label],[placeholder]').forEach((el) => {
        ['alt', 'title', 'aria-label', 'placeholder'].forEach((a) => { const v = el.getAttribute(a); if (v && v.toLowerCase().includes(palabra)) hallazgos.push(donde + ' ' + a + ': «' + v.slice(0, 120) + '»'); });
      });
      raiz.querySelectorAll('*').forEach((el) => { if (el.shadowRoot) mirar(el.shadowRoot, donde + ' (adentro de ' + el.tagName.toLowerCase() + ')'); });
    };
    mirar(document.body, 'página');
    return { hallazgos, url: location.pathname + location.search };
  }, PALABRA);
}
const ORDEN = '?sort_by=created-descending';   // con el orden ya puesto, la categoría no se recarga sola
const rutas = ['/', '/todos-los-productos/' + CAT + '/' + ORDEN, '/todos-los-productos/' + ORDEN, '/productos/' + ORDEN, '/cuidados/', '/envios/', '/politica-de-cambios-garantias-devoluciones/', '/contacto/'];
let total = 0;
for (const r of rutas) {
  const { hallazgos, url } = await revisar(r);
  console.log((hallazgos.length ? 'APARECE ' : 'limpio  ') + url + (hallazgos.length ? '\n   ' + hallazgos.join('\n   ') : ''));
  total += hallazgos.length;
}
// Fichas: los primeros 8 productos de la categoría
await p.goto(B + '/todos-los-productos/' + CAT + '/' + ORDEN, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
await espera(2000);
const fichas = await p.evaluate(() => [...new Set([...document.querySelectorAll('.js-item-product a[href*="/productos/"]')].map((a) => a.pathname))].slice(0, 8));
for (const f of fichas) {
  const { hallazgos, url } = await revisar(f);
  console.log((hallazgos.length ? 'APARECE ' : 'limpio  ') + url + (hallazgos.length ? '\n   ' + hallazgos.join('\n   ') : ''));
  total += hallazgos.length;
}
console.log('\nTotal: ' + total + ' apariciones de "' + PALABRA + '"');
await browser.close();
