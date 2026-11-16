// Íconos y la imagen para compartir de Panthera (PENDIENTES 108 y 109). Se dibujan en HTML y se sacan con Puppeteer.
// Uso: node herramientas/iconos/genera.mjs  → deja los archivos en tienda/static/panthera/iconos/
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
const DEST = path.resolve('tienda/static/panthera/iconos');
fs.mkdirSync(DEST, { recursive: true });
const LOGO = 'https://acdn-us.mitiendanube.com/stores/001/276/084/themes/common/logo-1917594456-1632678005-17c3d6d93e6f8f6df218afc58873b1f61632678005-480-0.webp';
const FUENTES = '<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&family=Montserrat:wght@400;800&display=swap" rel="stylesheet">';

// Ícono: círculo rosa de la marca con una "P" blanca en Libre Baskerville (la letra de los banners) y la estrellita dorada del logo
const icono = (lado) => `<!doctype html><html><head>${FUENTES}<style>
html,body{margin:0;width:${lado}px;height:${lado}px;background:transparent}
.c{width:${lado}px;height:${lado}px;border-radius:50%;background:#F4ACC4;display:grid;place-items:center;position:relative;overflow:hidden}
.p{font-family:'Libre Baskerville',serif;color:#fff;font-size:${Math.round(lado * 0.62)}px;line-height:1;transform:translate(${Math.round(lado * 0.02)}px,${Math.round(lado * 0.04)}px)}
.e{position:absolute;right:${Math.round(lado * 0.2)}px;top:${Math.round(lado * 0.16)}px;color:#EDC45F;font-size:${Math.round(lado * 0.24)}px;line-height:1}
</style></head><body><div class="c"><span class="p">P</span><span class="e">✦</span></div></body></html>`;

// Imagen para compartir 1200×630: blanco con manchas rosas suaves (como el pie), el logo dorado y una línea con datos reales
const compartir = `<!doctype html><html><head>${FUENTES}<style>
html,body{margin:0;width:1200px;height:630px;background:#fff;overflow:hidden;font-family:'Montserrat',sans-serif}
.f{position:absolute;inset:0;background:radial-gradient(420px 320px at 12% 18%,rgba(244,172,196,.55),transparent 70%),radial-gradient(460px 340px at 92% 88%,rgba(244,172,196,.6),transparent 70%),radial-gradient(300px 220px at 85% 10%,rgba(237,196,95,.25),transparent 70%)}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px}
.c .logo{width:620px;height:249px;background:#EDC45F;-webkit-mask:url(${LOGO}) center/contain no-repeat;mask:url(${LOGO}) center/contain no-repeat}   /* (2026-11-13) mismo dorado que el logo del sitio (--pnt-dorado-logo, máscara como marca.js sección 9); antes la foto original, más pálida */
.t{color:#4D4D4D;font-size:26px;font-weight:800;letter-spacing:.32em;text-transform:uppercase}
.b{position:absolute;left:0;right:0;bottom:0;height:16px;background:#F4ACC4}
</style></head><body><div class="f"></div><div class="c"><div class="logo"></div><div class="t">Charms, pulseras y aros · Bahía Blanca</div></div><div class="b"></div></body></html>`;

const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
async function sacar(html, w, h, archivo, transparente) {
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'load', timeout: 90000 }); await new Promise(r => setTimeout(r, 600));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(DEST, archivo), omitBackground: !!transparente, type: archivo.endsWith('.jpg') ? 'jpeg' : 'png', quality: archivo.endsWith('.jpg') ? 90 : undefined });
  console.log('ok', archivo);
}
for (const [lado, nombre] of [[32, 'favicon-32.png'], [192, 'favicon-192.png'], [512, 'favicon-512.png']]) await sacar(icono(lado), lado, lado, nombre, true);
// el de iPhone va sin transparencia (iOS pone negro lo transparente): fondo rosa a todo el cuadro
await sacar(icono(180).replace('border-radius:50%', 'border-radius:0'), 180, 180, 'apple-touch-icon.png', false);
await sacar(compartir, 1200, 630, 'compartir-1200x630.jpg', false);
await b.close();
