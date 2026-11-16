// ¿Qué pesa al cargar el inicio? tiempos, pedidos y tamaños
export default async (p, h) => p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const r = performance.getEntriesByType('resource');
  const por = {}; r.forEach((e) => { const t = e.initiatorType + (/\.mp4/.test(e.name) ? ':video' : ''); (por[t] = por[t] || [0, 0])[0]++; por[t][1] += e.transferSize || 0; });
  const lentos = r.filter((e) => e.duration > 900).sort((a, b) => b.duration - a.duration).slice(0, 8).map((e) => [Math.round(e.duration), Math.round((e.transferSize || 0) / 1024) + 'KB', e.name.replace(/^https?:\/\/[^/]+/, '').slice(0, 70)]);
  return { html_ms: Math.round(n.responseEnd), dom_ms: Math.round(n.domContentLoadedEventEnd), load_ms: Math.round(n.loadEventEnd), pedidos: r.length, MB: +(r.reduce((a, e) => a + (e.transferSize || 0), 0) / 1048576).toFixed(1), por, lentos }; });
