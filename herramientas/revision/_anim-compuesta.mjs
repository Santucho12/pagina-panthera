// ¿Una animación de transform/translate/opacity recalcula estilos en cada cuadro (hilo principal) o la hace la placa? Página mínima, 5 casos.
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const casos = { 'transform': '@keyframes a{to{transform:translateX(60px)}}', 'translate': '@keyframes a{to{translate:60px 0}}', 'opacity': '@keyframes a{to{opacity:.3}}', 'left (referencia mala)': '@keyframes a{to{left:60px}}', 'sin animacion': '' };
for (const [nombre, kf] of Object.entries(casos)) {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
  const p = await b.newPage(); const s = await p.target().createCDPSession();
  await p.setContent(`<style>${kf} body{margin:0} #x{position:relative;width:80px;height:80px;background:#e33;${kf ? 'animation:a 1s linear infinite alternate;' : ''}}</style><div id=x></div>` + '<div>'.repeat(0));
  await espera(600); let n = 0, ms = 0; s.on('Tracing.dataCollected', ({ value }) => value.forEach((e) => { if (e.name === 'UpdateLayoutTree' && e.ph === 'X') { n++; ms += e.dur / 1000; } }));
  const fin = new Promise((ok) => s.once('Tracing.tracingComplete', ok));
  await s.send('Tracing.start', { categories: 'devtools.timeline', transferMode: 'ReportEvents' }); await espera(2500); await s.send('Tracing.end'); await fin;
  console.log(nombre.padEnd(24), 'recálculos de estilo en 2,5 s:', String(n).padStart(4), ' (' + Math.round(ms) + ' ms)'); await b.close();
}
process.exit(0);
