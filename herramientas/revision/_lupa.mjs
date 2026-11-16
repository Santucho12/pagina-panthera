export default async (p, h) => { const ir = () => p.evaluate(() => { const st = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage'); const y = st.getBoundingClientRect().top + scrollY - 150; if (window.lenis) window.lenis.stop(); scrollTo(0, y); }); await ir(); await h.espera(9000); await ir();
  await p.evaluate(() => window.__or && window.__or.lupa('estr')); await h.espera(2500);
  const c = await p.evaluate(() => { const r = document.querySelector('[data-pnt-or]').shadowRoot.getElementById('stage').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: Math.min(r.bottom, innerHeight) - r.top }; });
  await p.screenshot({ path: 'herramientas/armador/pruebas/capturas/realismo/r4-lupa.png', clip: c }); return !!c; };
