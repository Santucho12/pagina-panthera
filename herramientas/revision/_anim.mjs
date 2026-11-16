export default async (p, h) => { await h.espera(9000);
  return p.evaluate(() => { const out = {}; document.getAnimations().forEach((a) => { const t = a.effect && a.effect.target; if (!t) return; const pse = a.effect.pseudoElement || ''; const c = (t.className && t.className.baseVal !== undefined ? t.className.baseVal : (t.className + '')).slice(0, 40);
      const k = (a.animationName || a.transitionProperty || 'transición') + ' → ' + t.tagName + '.' + c + pse; const r = t.getBoundingClientRect(); const o = out[k] || (out[k] = { n: 0, estado: a.playState, y: Math.round(r.top + scrollY) }); o.n++; });
    return Object.entries(out).sort((a, b) => b[1].n - a[1].n).slice(0, 22).map(([k, v]) => v.n + '×  ' + k + '  [' + v.estado + ', y=' + v.y + ']'); }); };
