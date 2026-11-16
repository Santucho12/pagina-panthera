// Busca botones con fondo rosa y letra oscura en varias páginas (compu y celular), también dentro de los armadores (Shadow DOM).
// node herramientas/revision/botones-rosas.mjs
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const PAGINAS = (process.env.PAGINAS || '/,/todos-los-productos/?sort_by=created-descending,/todos-los-productos/?ofertas&sort_by=created-descending,/productos/cocodrilo/,/comprar/,/contacto/,/account/login/,/account/register/,/search/?q=mickey,/pagina-que-no-existe/').split(',');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const vistos = new Map();
for (const modo of ['compu', 'celu']) {
  const p = await b.newPage();
  await p.setRequestInterception(true); p.on('request', (r) => (/\/__(recarga|version)/.test(r.url()) ? r.abort() : r.continue()));
  if (modo === 'celu') { await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'); }
  else { await p.setViewport({ width: 1440, height: 900 }); await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'); }
  for (const ruta of PAGINAS) {
    try { await p.goto('http://localhost:5700' + ruta, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { console.log('goto', ruta, e.message); }
    await espera(2500);
    const r = await p.evaluate(() => {
      const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
      const esRosa = (c) => { const [r, g, b, a = 1] = rgb(c); return a > 0.6 && r > 225 && g > 100 && g < 190 && b > 140 && b < 215 && r - g > 40; };
      const oscuro = (c) => { const [r, g, b] = rgb(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b < 90; };
      const sel = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + [...e.classList].slice(0, 5).map((c) => '.' + c).join('');
      const fuera = [];
      const revisa = (raiz, donde) => {
        raiz.querySelectorAll('button, a, input[type=submit], input[type=button], [role=button], label, .btn, span, div').forEach((e) => {
          const cs = getComputedStyle(e);
          if (!esRosa(cs.backgroundColor)) return;
          const txt = (e.value || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
          if (!txt) return;
          // el color que se ve: el del propio elemento o el de su primer hijo con texto
          let colorTxt = cs.color;
          const hijo = [...e.querySelectorAll('*')].find((h) => h.childNodes.length && [...h.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
          if (hijo && ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) colorTxt = getComputedStyle(hijo).color;
          if (!oscuro(colorTxt)) return;
          const bx = e.getBoundingClientRect();
          fuera.push({ donde, sel: sel(e), txt, fondo: cs.backgroundColor, color: colorTxt, visible: bx.width > 0 && bx.height > 0 });
        });
        raiz.querySelectorAll('*').forEach((e) => { if (e.shadowRoot) revisa(e.shadowRoot, sel(e)); });
      };
      revisa(document, 'pagina');
      return fuera;
    });
    for (const x of r) { const k = x.donde + ' ' + x.sel; if (!vistos.has(k)) vistos.set(k, { ...x, en: modo + ' ' + ruta }); }
  }
  await p.close();
}
await b.close();
for (const [k, x] of vistos) console.log(`${x.visible ? '👁' : '  '} ${k}  «${x.txt}»  ${x.fondo} / ${x.color}  [${x.en}]`);
console.log('total', vistos.size);
process.exit(0);
