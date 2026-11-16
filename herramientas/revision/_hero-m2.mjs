export default async (p, h) => { await h.espera(9000);
  const r = await p.evaluate(() => { const sec = document.querySelector('.section-slider-home'); const sig = sec.nextElementSibling && sec.nextElementSibling.nextElementSibling; const b = sec.getBoundingClientRect(); return { seccion: [Math.round(b.top), Math.round(b.height)], siguiente: sig ? [(sig.className + '').slice(0, 40), Math.round(sig.getBoundingClientRect().top)] : null, alto_doc: document.documentElement.scrollHeight }; });
  await p.screenshot({ path: 'revision-responsive/hero-m-despues.png' });
  await p.evaluate(() => scrollTo(0, 260)); await h.espera(1500); await p.screenshot({ path: 'revision-responsive/hero-m-despues-2.png' }); return r; };
