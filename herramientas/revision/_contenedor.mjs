export default async (p, h) => { await h.espera(7000);
  return p.evaluate(() => { const c = document.querySelector('.js-home-sections-container'); const cs = getComputedStyle(c); const out = { contenedor: [cs.display, cs.flexDirection, cs.paddingTop, cs.paddingBottom], hijos: [] };
    [...c.children].forEach((e) => { const s = getComputedStyle(e); out.hijos.push((e.className + '').slice(0, 42) + ' · mt ' + s.marginTop + ' mb ' + s.marginBottom + ' pos ' + s.position + ' disp ' + s.display); });
    const hdr = document.querySelector('.js-head-main'); out.header = hdr ? [getComputedStyle(hdr).position, Math.round(hdr.getBoundingClientRect().height)] : null;
    out.barraLima = [...document.querySelectorAll('.js-adbar, .section-adbar, .adbar, [data-store="adbar"]')].map((e) => (e.className + '').slice(0, 40) + ' h' + Math.round(e.getBoundingClientRect().height) + ' ' + getComputedStyle(e).display);
    return out; }); };
