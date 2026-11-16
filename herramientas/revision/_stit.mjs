export default async (p, h) => { await h.espera(9000);
  return p.evaluate(() => { const r = document.querySelector('[data-pnt-a3]').shadowRoot; const out = [];
    r.querySelectorAll('.card').forEach((c, i) => { if (i > 6) return; const im = c.querySelector('.card-f img'); out.push(c.dataset.k + ': ' + (im ? (im.getAttribute('src') ? 'src ok' : 'SIN src') + ' · data-src ' + (im.dataset.src ? 'sí' : 'no') + ' · complete ' + im.complete + ' · nw ' + im.naturalWidth + ' · clases ' + im.className + ' · op ' + getComputedStyle(im).opacity + ' · loading ' + im.loading : 'sin img')); });
    return out; }); };
