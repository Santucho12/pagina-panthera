// Cuánto baja el armador hasta quedar listo, sin tocar nada: node herramientas/armador/pruebas/descarga.mjs
// Agrupa por tipo (three, escena, contornos, fotos HD, fotos de las tarjetas, póster) en compu y en celular.
// Ojo: el preview local sirve todo con "no-store", así que una foto que piden la tarjeta y el 3D cuenta dos veces; en la tienda la
// segunda sale de la caché del navegador.
import { abrir, irASeccion, esperaListo, espera } from './comun.mjs';

for (const [nombre, op] of [['compu 1600×900', { ancho: 1600, alto: 900, dpr: 2 }], ['celular 390×844', { ancho: 390, alto: 844, dpr: 3, celular: true }]]) {
  const { browser, page } = await abrir({ ...op, query: '' });
  const cdp = await page.target().createCDPSession(); await cdp.send('Network.enable');
  const urls = new Map(), tam = new Map();
  cdp.on('Network.responseReceived', (e) => urls.set(e.requestId, e.response.url));
  cdp.on('Network.loadingFinished', (e) => tam.set(e.requestId, e.encodedDataLength));
  await espera(3000); await irASeccion(page); await esperaListo(page, 6000); await espera(3000);
  const grupos = {};
  for (const [id, u] of urls) {
    const g = /jsdelivr/.test(u) ? 'three (jsDelivr)' : /armar3d-escena/.test(u) ? 'escena' : /contornos/.test(u) ? 'contornos'
      : /charms-hd/.test(u) ? 'fotos HD de la pulsera' : /arma\/charms\//.test(u) ? 'fotos de las tarjetas' : /arma\/poster/.test(u) ? 'póster'
      : /arma\/bases\//.test(u) ? 'fotos de las bases' : /armar3d\.(js|css)/.test(u) ? 'armar3d.js/css' : null;
    if (!g) continue;
    (grupos[g] = grupos[g] || { kb: 0, archivos: 0 }); grupos[g].kb += (tam.get(id) || 0) / 1024; grupos[g].archivos++;
  }
  let total = 0; for (const g in grupos) { grupos[g].kb = Math.round(grupos[g].kb); total += grupos[g].kb; }
  console.log(nombre, JSON.stringify(grupos), '→ total', total, 'KB');
  await browser.close();
}
process.exit(0);
