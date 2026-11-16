import { createRequire } from 'module'; const require = createRequire(import.meta.url); const puppeteer = require('../../node_modules/puppeteer-core');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [nombre, html] of [['página vacía alta (solo texto)', '<body style="margin:0"><div style="height:9000px;background:linear-gradient(#fff,#fcd)"></div>'], ['con una foto grande y un video del hero', '<body style="margin:0"><video src="http://localhost:5700/__tema/panthera/hero/video-hero.mp4" muted loop autoplay playsinline style="width:100%;height:730px;object-fit:cover;position:sticky;top:0"></video><div style="height:9000px;background:linear-gradient(#fff,#fcd);position:relative;z-index:2"></div>']]) {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, userDataDir: process.env.TEMP + '/pnt-techo-' + Date.now(), args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--window-size=1560,880'] });
  const p = (await b.pages())[0]; await p.setViewport({ width: 1536, height: 730, deviceScaleFactor: 1.25 });
  await p.goto('http://localhost:5700/robots.txt'); await p.setContent(html);
  await p.evaluate(() => { window.__f = []; let t0 = 0; (function f(t) { if (t0) window.__f.push(+(t - t0).toFixed(1)); t0 = t; requestAnimationFrame(f); })(0); });
  await espera(2500); await p.evaluate(() => { window.__f.length = 0; }); await p.mouse.move(700, 400);
  for (let i = 0; i < 22; i++) { await p.mouse.wheel({ deltaY: 55 }); await espera(45); } await espera(700);
  const f = (await p.evaluate(() => window.__f)).filter((x) => x < 1500); const prom = f.reduce((a, c) => a + c, 0) / f.length;
  console.log(nombre.padEnd(42), (1000 / prom).toFixed(1), 'fps · prom', prom.toFixed(1), 'ms · peor', Math.round(Math.max(...f)), 'ms · >33ms:', f.filter((x) => x > 33).length, 'de', f.length);
  await b.close();
}
process.exit(0);
