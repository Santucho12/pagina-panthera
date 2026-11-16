// Capturas fijas del armador para comparar antes/después: node herramientas/armador/pruebas/capturas.mjs <etiqueta> [query]
// Deja las imágenes en herramientas/armador/pruebas/capturas/<etiqueta>/:
//   d-ejemplo (compu 1600×900 a 2×, la base de ejemplo con sus 3 charms) · d-vit-<base> (la vitrina de cada base, a mitad del giro)
//   d-8charms (ejemplo + 5 charms más) · t-ejemplo (tablet 1024×768 a 2×) · m-ejemplo (celular 390×844 a 3×)
// [query] se suma a la URL (ej. "a3debug&a3env=room&a3tm=agx") para comparar variantes.
import path from 'path';
import fs from 'fs';
import { abrir, irASeccion, esperaListo, capturaEscenario, clicBase, clicCharm, espera, AQUI, BASES } from './comun.mjs';

const etiqueta = process.argv[2] || 'prueba';
const query = process.argv[3] || '';
const solo = (process.argv[4] || 'd,v,8,t,m').split(',');
const DIR = path.join(AQUI, 'capturas', etiqueta);
fs.mkdirSync(DIR, { recursive: true });
const log = [];

if (solo.includes('d') || solo.includes('v') || solo.includes('8')) {
  const { browser, page, avisos } = await abrir({ query });
  await espera(3000); await irASeccion(page); await esperaListo(page, 5200);
  if (solo.includes('d')) log.push(['d-ejemplo', await capturaEscenario(page, path.join(DIR, 'd-ejemplo.png'))]);
  if (solo.includes('v')) {
    for (const b of BASES.slice(1).concat(['silv'])) {
      await clicBase(page, b); await espera(1350);
      await capturaEscenario(page, path.join(DIR, 'd-vit-' + b + '.png'));
      await espera(3200);
    }
  }
  if (solo.includes('8')) {
    for (const k of ['stit', 'vali', 'rosa', 'cora', 'ceni']) { await clicCharm(page, k); await espera(420); }
    await espera(2600);
    await capturaEscenario(page, path.join(DIR, 'd-8charms.png'));
    await capturaEscenario(page, path.join(DIR, 'd-8charms-todo.png'), { todo: true });
  }
  log.push(['avisos compu', avisos.slice(0, 12)]);
  await browser.close();
}
if (solo.includes('t')) {
  const { browser, page, avisos } = await abrir({ ancho: 1024, alto: 768, dpr: 2, query });
  await espera(3000); await irASeccion(page); await esperaListo(page, 5200);
  await capturaEscenario(page, path.join(DIR, 't-ejemplo.png'));
  log.push(['avisos tablet', avisos.slice(0, 8)]);
  await browser.close();
}
if (solo.includes('m')) {
  const { browser, page, avisos } = await abrir({ ancho: 390, alto: 844, dpr: 3, celular: true, query });
  await espera(3000); await irASeccion(page); await esperaListo(page, 5200);
  await capturaEscenario(page, path.join(DIR, 'm-ejemplo.png'));
  log.push(['avisos celular', avisos.slice(0, 8)]);
  await browser.close();
}
fs.writeFileSync(path.join(DIR, 'registro.json'), JSON.stringify(log, null, 1));
console.log('capturas en', DIR);
for (const [k, v] of log) if (String(k).startsWith('avisos')) console.log(k, v.length ? v : 'ninguno');
process.exit(0);
