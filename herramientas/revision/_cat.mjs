export default async (p, h) => { await h.espera(8000);
  await p.evaluate(() => { const s = document.querySelector('.pnt-banners'); if (window.lenis) window.lenis.stop(); scrollTo(0, s.getBoundingClientRect().top + scrollY - 200); });
  const r = []; for (const ms of [0, 250, 700]) { await h.espera(ms ? ms : 80); r.push(await p.evaluate(() => { const s = document.querySelector('.pnt-banners'); const bs = [...s.querySelectorAll('.pnt-banner')]; return { clases: (s.className + '').replace(/section-banners-home|pnt-banners/g, '').trim(), opac: bs.map((b) => getComputedStyle(b).opacity).join(','), clip: [...s.querySelectorAll('.textbanner-image')].map((x) => getComputedStyle(x).clipPath).join('|').slice(0, 40), ap: s.querySelectorAll('.pnt-ap-el').length }; })); }
  return r; };
