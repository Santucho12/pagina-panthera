// Los carruseles del inicio en WebKit (el motor de Safari / iPhone), con el Playwright de otro proyecto (solo lectura). node webkit-carrusel.mjs [etiqueta]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { webkit, devices } = require('C:/Users/AMDRYZEN7/Desktop/Trabajos Freelance/App repuestos de auto/node_modules/playwright');
const et = process.argv[2] || 'webkit';
const b = await webkit.launch();
const ctx = await b.newContext({ ...devices['iPhone 14'] });
const p = await ctx.newPage(); const errores = [];
p.on('pageerror', (e) => errores.push(String(e.message).slice(0, 200)));
await p.goto('http://localhost:5700/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const cont = document.querySelector('.js-home-sections-container');
  return { contenedor: cont ? [getComputedStyle(cont).display, Math.round(cont.getBoundingClientRect().width)] : null, docAncho: document.documentElement.scrollWidth, vw: innerWidth,
    carruseles: [...document.querySelectorAll('[data-store="home-products-featured"], [data-store="home-products-sale"]')].map((s) => { const sw = s.querySelector('.pnt-mv-swiper'); const w = sw && sw.swiper; const sl = [...s.querySelectorAll('.swiper-slide')].filter((x) => x.getBoundingClientRect().width > 0).slice(0, 3);
      return { sec: s.getAttribute('data-store'), anchoSeccion: Math.round(s.getBoundingClientRect().width), anchoSwiper: sw ? Math.round(sw.getBoundingClientRect().width) : null, porVista: w ? w.params.slidesPerView : null, tarjetas: sl.map((x) => Math.round(x.getBoundingClientRect().width)) }; }) };
});
console.log(JSON.stringify(r)); console.log('errores:', errores.slice(0, 6));
const y = await p.evaluate(() => { const s = document.querySelector('[data-store="home-products-featured"]'); return Math.round(s.getBoundingClientRect().top + scrollY - 80); });
await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(1200);
await p.screenshot({ path: 'revision-responsive/' + et + '.png' });
await b.close(); process.exit(0);
