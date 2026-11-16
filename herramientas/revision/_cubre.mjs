export default async (p, h) => { await h.espera(7000);
  const out = [];
  for (const y of [0, 260, 520]) { await p.evaluate((y) => { if (window.lenis) { window.lenis.scrollTo(y, { immediate: true, force: true }); } else { scrollTo(0, y); } }, y); await h.espera(900);
    out.push(await p.evaluate(() => { const v = document.querySelector('.pnt-hero-v video'), c = document.querySelector('.pnt-hero-cartel'), b = document.querySelector('.section-banners-home'); return { y: Math.round(scrollY), videoTop: Math.round(v.getBoundingClientRect().top), cartelTop: Math.round(c.getBoundingClientRect().top), bannersTop: Math.round(b.getBoundingClientRect().top), radio: getComputedStyle(b).borderTopLeftRadius }; }));
    await p.screenshot({ path: 'revision-responsive/cubre-' + y + '.png' }); }
  return out; };
