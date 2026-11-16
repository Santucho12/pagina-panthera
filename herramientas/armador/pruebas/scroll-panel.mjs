// Rueda sobre la columna derecha (panel) y la de charms del armador: la página no tiene que saltar ni ir y volver (arreglo 2026-11-12).
// node herramientas/armador/pruebas/scroll-panel.mjs
import { abrir, irASeccion, esperaListo, espera } from './comun.mjs';
const { browser, page } = await abrir({ query: 'a3debug', ancho: 1850, alto: 560, dpr: 1 });
await espera(3000); await irASeccion(page); await esperaListo(page, 4200);
await page.evaluate(() => { window.lenis && window.lenis.start(); });
let fallas = 0;
for (const [nombre, sel] of [['panel', '.panel'], ['charms', '#tira']]) {
  for (const dir of [1, -1]) {
    await page.evaluate(() => window.lenis && window.lenis.stop()); await irASeccion(page); await page.evaluate((d, s) => { const el = document.querySelector('[data-pnt-a3]').shadowRoot.querySelector(s); el.scrollTop = d > 0 ? 0 : el.scrollHeight; window.lenis.start(); }, dir, sel); await espera(400);
    const c = await page.evaluate((s) => { const r = document.querySelector('[data-pnt-a3]').shadowRoot.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 300) }; }, sel);
    await page.mouse.move(c.x, c.y);
    await page.evaluate((s) => { window.__m = []; const el = document.querySelector('[data-pnt-a3]').shadowRoot.querySelector(s);
      (function f() { window.__m.push([window.scrollY, el.scrollTop]); if (window.__m.length < 400) requestAnimationFrame(f); })(); }, sel);
    for (let i = 0; i < 45; i++) { await page.mouse.wheel({ deltaY: 120 * dir }); await espera(35); }
    await espera(2500);
    const m = await page.evaluate(() => window.__m);
    let maxPaso = 0, vueltas = 0, signo = 0;
    for (let i = 1; i < m.length; i++) { const d = m[i][0] - m[i - 1][0]; maxPaso = Math.max(maxPaso, Math.abs(d)); const s = Math.sign(d); if (s && signo && s !== signo) vueltas++; if (s) signo = s; }
    const bien = maxPaso < 140 && vueltas === 0;
    if (!bien) fallas++;
    console.log((bien ? 'OK   ' : 'FALLA') + ` ${nombre} ${dir > 0 ? 'abajo' : 'arriba'}: columna ${m[0][1]}→${m[m.length - 1][1]}, página ${m[0][0]}→${m[m.length - 1][0]}, paso máx ${maxPaso.toFixed(0)} px, cambios de sentido ${vueltas}`);
  }
}
await browser.close();
console.log(fallas ? fallas + ' mal' : 'todo bien');
