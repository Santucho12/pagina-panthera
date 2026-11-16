// Enhebrado de los 27 charms: node herramientas/armador/pruebas/enhebrado.mjs <etiqueta>
// Cada charm de cerca (lupa) y la pulsera entera de cada tanda, en capturas/enhebrado/<etiqueta>/. Sirve para revisar que la cadena
// pase por el agujero de cada pieza a la altura justa (después de sumar charms o cambiar fotos, ag o hueco en armar.tpl).
import path from 'path';
import { abrir, irASeccion, esperaListo, espera, clicCharm, capturaEscenario, AQUI } from './comun.mjs';
const et = process.argv[2] || 'v1';
const DIR = path.join(AQUI, 'capturas', 'enhebrado', et);
// (2026-11-11) con una lista de claves como 2.º argumento ("k1,k2,…") revisa esas, de a 6 por pulsera
const pedidas = (process.argv[3] || '').split(',').filter(Boolean);
const tandas = pedidas.length ? Array.from({ length: Math.ceil(pedidas.length / 6) }, (_, i) => pedidas.slice(i * 6, i * 6 + 6))
  : [['vali', 'adve', 'stit', 'mmb', 'mom', 'home'], ['broc', 'cora', 'wood', 'jess', 'ange', 'buzz'], ['flor', 'rosa', 'fam', 'ceni', 'minp', 'gato'], ['mone', 'estr', 'glob', 'bruj', 'rued', 'minn']];
for (let i = 0; i < tandas.length; i++) {
  const { browser, page, avisos } = await abrir({ ancho: 1440, alto: 900, dpr: 2, query: 'a3debug' });
  await page.waitForSelector('[data-pnt-a3]', { timeout: 60000 });
  await espera(3000); await irASeccion(page); await esperaListo(page, 6000); await espera(2500);
  for (const k of tandas[i]) { await clicCharm(page, k); await espera(1300); }
  await espera(5000);
  await capturaEscenario(page, path.join(DIR, 'pulsera-' + (i + 1) + '.png'));
  const lista = (i === 0 && !pedidas.length ? ['jaz', 'moon', 'stit']   /* era mick: Mickey Shine ya no está en la tienda (2026-11-15) */ : []).concat(tandas[i]);
  for (const k of lista) { await page.evaluate((k) => window.__a3.lupa(k), k); await espera(2300); await capturaEscenario(page, path.join(DIR, 'lupa-' + k + '.png')); }
  console.log('tanda', i + 1, avisos.length ? avisos : 'ok');
  await browser.close();
}
process.exit(0);
