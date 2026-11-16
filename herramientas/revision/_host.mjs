export default async (p, h) => { await h.espera(7000);
  const mira = () => p.evaluate(() => { const out = []; let n = document.querySelector('[data-pnt-a3]').shadowRoot.getElementById('barra');
    while (n) { if (n.nodeType === 1) { const s = getComputedStyle(n); const raro = ['transform', 'translate', 'scale', 'filter', 'perspective', 'contain', 'willChange', 'backdropFilter', 'containerType'].filter((k) => s[k] && !['none', 'normal', 'auto', 'matrix(1, 0, 0, 1, 0, 0)'].includes(s[k])).map((k) => k + '=' + s[k]); if (raro.length) out.push(n.tagName + '.' + (n.className + '').slice(0, 30) + ' → ' + raro.join(' ; ')); }
      n = n.parentNode || (n.host); if (n && n.nodeType === 11) n = n.host; } return out; });
  await p.evaluate(() => { scrollTo(0, document.querySelector('[data-pnt-a3]').getBoundingClientRect().top + scrollY - 1200); }); await h.espera(1000); const a = await mira();
  await p.evaluate(() => { scrollTo(0, document.querySelector('[data-pnt-a3]').getBoundingClientRect().top + scrollY - 500); }); await h.espera(2500); const b = await mira();
  return { antes: a, despues: b }; };
