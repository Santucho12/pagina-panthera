export default async (p, h) => { await h.espera(7000);
  const mira = () => p.evaluate(() => { const host = document.querySelector('[data-pnt-a3]'), r = host.shadowRoot, b = r.getElementById('barra'), cs = getComputedStyle(b), br = b.getBoundingClientRect();
    const fijos = [...document.querySelectorAll('body *')].filter((e) => { const s = getComputedStyle(e); if (s.position !== 'fixed') return false; const q = e.getBoundingClientRect(); return q.height > 60 && q.bottom > innerHeight - 5 && q.width > 300; }).map((e) => (e.tagName + '.' + (e.className + '').slice(0, 40)) + ' ' + JSON.stringify([Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().height)]));
    return { hostClases: host.className, barra: { display: cs.display, vis: cs.visibility, transform: cs.transform, rect: [Math.round(br.x), Math.round(br.y), Math.round(br.width), Math.round(br.height)] }, htmlBarra: document.documentElement.classList.contains('pnt-a3-barra'), fijos }; });
  await p.evaluate(() => { const y = document.querySelector('[data-pnt-a3]').getBoundingClientRect().top + scrollY - 1200; scrollTo(0, y); }); await h.espera(1200); const a = await mira();
  await p.evaluate(() => { const y = document.querySelector('[data-pnt-a3]').getBoundingClientRect().top + scrollY - 500; scrollTo(0, y); }); await h.espera(1500); const b = await mira();
  return { antes: a, despues: b }; };
