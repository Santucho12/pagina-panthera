export default async (p, h) => { await h.espera(9000);
  const info = await p.evaluate(() => { const sec = document.querySelector('.section-slider-home'); const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
    const hijos = [...sec.children].map((c) => (c.tagName + '.' + (c.className + '').slice(0, 40) + ' ' + JSON.stringify(r(c)) + ' vis=' + getComputedStyle(c).visibility + ' disp=' + getComputedStyle(c).display));
    const imgs = [...sec.querySelectorAll('img')].map((i) => (i.className + '').slice(0, 30) + ' ' + JSON.stringify(r(i)) + ' vis=' + getComputedStyle(i).visibility + ' op=' + getComputedStyle(i).opacity + ' src=' + (i.currentSrc || i.src || '').slice(-40));
    return { sec: r(sec), hijos, imgs, video: r(sec.querySelector('video')), poster: sec.querySelector('video') && sec.querySelector('video').poster.slice(-30) }; });
  await p.screenshot({ path: 'revision-responsive/hero-m-antes.png' }); return info; };
