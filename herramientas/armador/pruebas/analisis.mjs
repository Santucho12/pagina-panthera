// Análisis (2026-11-11): la sección entera del armador en compu y celular, y una secuencia de uso (sumar un charm, la lupa)
import path from 'path';
import { abrir, irASeccion, esperaListo, capturaEscenario, clicCharm, espera, AQUI } from './comun.mjs';
const DIR = path.join(AQUI, 'capturas', 'analisis-1111');
for (const [n, w, h, cel] of [['sec-compu', 1440, 900, false], ['sec-cel', 390, 844, true]]) {
  const { browser, page, avisos } = await abrir({ ancho: w, alto: h, dpr: 1, celular: cel });
  try {
    await espera(2500); await irASeccion(page); await esperaListo(page, 4000);
    await capturaEscenario(page, path.join(DIR, n + '.png'), { todo: true });
    if (!cel) {
      await clicCharm(page, 'stit'); await espera(380); await capturaEscenario(page, path.join(DIR, n + '-vuelo.png'));
      await espera(2400); await capturaEscenario(page, path.join(DIR, n + '-sumado.png'));
    }
    console.log(n, avisos.length ? avisos.join(' | ') : 'sin avisos');
  } finally { await browser.close(); }
}
