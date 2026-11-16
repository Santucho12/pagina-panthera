// Auditoría del enhebrado (2026-11-12): qué agujero detectó la escena en la foto de CADA charm. node herramientas/armador/pruebas/agujeros.mjs
// Lista los que quedaron sin agujero detectado y no están marcados a mano (hueco: 'no' en armar.tpl): en esos la cadena no pasa
// por el agujero del aro (como le pasaba al Painter: su ag apuntaba al borde del agujero y no al centro). Guarda agujeros.json.
import fs from 'fs';
import path from 'path';
import { abrir, irASeccion, esperaListo, espera, AQUI } from './comun.mjs';
const { browser, page } = await abrir({ ancho: 1536, alto: 730, dpr: 1, query: 'a3debug' });
await page.waitForSelector('[data-pnt-a3]', { timeout: 60000 });
await espera(9000); await irASeccion(page); await esperaListo(page, 3000);
const r = await page.evaluate(async () => {
  const raiz = document.querySelector('[data-pnt-a3]').shadowRoot;
  const datos = [...raiz.querySelectorAll('[data-a3-charms] li')].map((li) => ({ k: li.dataset.k, n: li.dataset.n, tipo: li.dataset.tipo, ag: +li.dataset.ag, fijo: li.dataset.hueco || '' }));
  datos.forEach((d) => window.__a3.api.precarga(d.k));
  for (let i = 0; i < 240; i++) { await new Promise((r) => setTimeout(r, 250)); if (datos.every((d) => window.__a3.tex[d.k] && window.__a3.tex[d.k].medido)) break; }
  return datos.map((d) => { const t = window.__a3.tex[d.k] || {}; return { ...d, medido: !!t.medido, cx: t.cx, aw: t.aw, hueco: t.hueco || null }; });
});
fs.writeFileSync(path.join(AQUI, 'capturas', 'agujeros.json'), JSON.stringify(r, null, 1));
const f = (v) => v == null ? '—' : v.toFixed(3);
console.log('medidos: ' + r.filter((x) => x.medido).length + ' de ' + r.length);
for (const tipo of ['d', 'c']) {
  const sin = r.filter((x) => x.tipo === tipo && !x.hueco && x.fijo !== 'no');
  console.log('\n' + (tipo === 'd' ? 'COLGANTES' : 'CUENTAS') + ' sin agujero detectado (y sin "hueco: no"): ' + sin.length);
  sin.forEach((x) => console.log('  ' + x.k.padEnd(5) + x.n.padEnd(34) + ' ag ' + f(x.ag) + '  fijo "' + x.fijo + '"'));
}
const lejos = r.filter((x) => x.hueco && x.hueco.cy != null && Math.abs(x.hueco.cy - x.ag) > 0.05);
console.log('\ncon agujero detectado lejos de su ag (más de 0,05): ' + lejos.length);
lejos.forEach((x) => console.log('  ' + x.k.padEnd(5) + x.n.padEnd(34) + ' ag ' + f(x.ag) + ' · agujero cy ' + f(x.hueco.cy) + ' · tipo ' + x.tipo));
await browser.close(); process.exit(0);
