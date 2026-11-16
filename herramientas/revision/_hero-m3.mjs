export default async (p, h) => { await h.espera(8000);
  await p.evaluate(() => { const v = document.querySelector('.pnt-hero-v video'); v.pause(); });
  for (const t of [0.2, 1.4, 2.7, 3.8]) { await p.evaluate((t) => { document.querySelector('.pnt-hero-v video').currentTime = t; }, t); await h.espera(900); await p.screenshot({ path: 'revision-responsive/hm-' + t + '.png', clip: { x: 0, y: 0, width: 390, height: 360 } }); }
  return await p.evaluate(() => { const v = document.querySelector('.pnt-hero-v video'); return [v.currentSrc.split('/').pop(), v.videoWidth + 'x' + v.videoHeight, v.poster.split('/').pop(), getComputedStyle(v).scale, getComputedStyle(v).objectPosition]; }); };
