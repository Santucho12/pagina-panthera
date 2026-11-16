export default async (p, h) => { await h.espera(6000);
  const info = (y) => p.evaluate((y) => { window.scrollTo(0, y); return new Promise((ok) => setTimeout(() => { const out = { y: scrollY, videos: [], blur: [] };
    document.querySelectorAll('video').forEach((v) => { const r = v.getBoundingClientRect(); out.videos.push([v.paused ? 'pausa' : 'anda', Math.round(r.width) + 'x' + Math.round(r.height), Math.round(r.top), v.videoWidth + 'x' + v.videoHeight, (v.currentSrc || '').split('/').pop().slice(0, 34), v.closest('section') ? (v.closest('section').className + '').slice(0, 30) : '']); });
    document.querySelectorAll('body *').forEach((e) => { const c = getComputedStyle(e); const f = (c.backdropFilter && c.backdropFilter !== 'none') ? c.backdropFilter : ((c.filter && c.filter !== 'none') ? c.filter : ''); if (f) { const r = e.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight && r.width > 30) out.blur.push([(e.className + '').slice(0, 34), f.slice(0, 22), Math.round(r.width) + 'x' + Math.round(r.height)]); } });
    ok(out); }, 900)); }, y);
  const r = {}; r.arriba = await info(0); r.redes = await info(8000); return r; };
