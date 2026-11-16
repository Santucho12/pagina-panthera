// ⚠️  NO SE SUBE NADA POR FTP HASTA QUE PANTHERA DÉ EL OK (ver LEEME.md).
//
// Tienda real de Panthera en localhost (npm run dev). Cada página viene de Tiendanube (tema Lima)
// y el preview le agrega/cambia los archivos locales de tienda/static:
//   - tienda/static/panthera/marca.css y marca.js: la estética nueva, en TODAS las páginas.
//     Se agregan al final del <body>, así le ganan a los CSS de Lima.
//   - Cualquier otro archivo de tienda/static (CSS, JS, imágenes, videos) que la página pida por su
//     nombre se sirve desde local.
// Los .tpl y .scss.tpl los compila Tiendanube: un cambio en ellos se ve recién al subirlo
// (y hoy NO se sube nada). Por eso el rediseño va, mientras tanto, en static/panthera/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { exec } from 'node:child_process';
import Twig from 'twig';

const TIENDA = 'https://pantherajoyeria.com.ar';
const OTROS_DOMINIOS = ['https://pantherajoyeria.mitiendanube.com', 'https://www.pantherajoyeria.com.ar'];
const TEMA = path.join(import.meta.dirname, 'tienda');
const ESTATICOS = path.join(TEMA, 'static');
const PUERTO = Number(process.env.PORT) || 5700;
const LOCAL = `http://localhost:${PUERTO}`;
// Cambia en cada arranque: si la pestaña ve otro valor al reconectarse, recarga sola
const ARRANQUE = String(Date.now());
// (2026-11-14) La fecha de guardado de ESTE archivo. node --watch reinicia el preview también cuando el archivo solo se LEE (en este
// Windows leerlo avisa "cambió"): si el preview se reinició con el mismo código, las pestañas abiertas no tienen por qué recargarse.
let CODIGO = ARRANQUE;
try { CODIGO = String(fs.statSync(import.meta.filename).mtimeMs); } catch { /* sin la fecha: como antes, recarga en cada arranque */ }

// El preview NO se tiene que caer nunca: un error se anota en la consola y sigue andando.
process.on('uncaughtException', (error) => console.error(`Error (el preview sigue andando): ${error.stack || error.message}`));
process.on('unhandledRejection', (error) => console.error(`Error (el preview sigue andando): ${error?.stack || error}`));

const TIPOS = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.otf': 'font/otf',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
};

// Archivos del tema en la CDN: .../stores/001/276/084/themes/lima/<archivo> o .../twig/static/<archivo>
const ASSET_TEMA = /(?:https?:)?\/\/[a-z0-9.-]+\/(?:stores\/\d+\/\d+\/\d+\/themes\/[a-z0-9_-]+\/(?:static\/)?|templates\/\d+\/\d+\/\d+\/twig\/static\/)([^"'\s?)]+)(\?[^"'\s)]*)?/gi;
const SIN_COPIAR = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'set-cookie',
    'strict-transport-security', 'content-security-policy', 'x-frame-options', 'cache-control', 'expires', 'etag', 'last-modified']);
const SOLO_EN_LA_TIENDA = /^\/(checkout|admin)/;

const RECARGA = `<script>
/* Recarga sola al guardar. ANTES cada pestaña dejaba abierta una conexión (EventSource en /__recarga) y Chrome deja solo 6 por dirección,
   compartidas entre TODAS las pestañas: con 6 pestañas de localhost abiertas, las páginas nuevas (y el marco del carrito lateral) quedaban
   cargando para siempre (reproducido con Playwright el 2026-11-12). AHORA cada pestaña pregunta cada segundo, con un pedido corto que termina
   enseguida, si hubo cambios (/__version); no queda ninguna conexión abierta. Solo pregunta la pestaña que se está viendo. */
var pntArr = null, pntVer = null, pntCod = null;
/* La recarga espera a que la persona deje de scrollear/tocar/escribir 1,5 s (pedido 2026-11-12: "a veces cuando scrolleo se recarga
   sola la página": eran los cambios guardados mientras bajaba). Mientras espera, un cartelito abajo avisa que hay cambios. */
var pntUso = 0, pntPend = false;
['wheel', 'scroll', 'touchmove', 'keydown', 'pointerdown'].forEach(function (t) { addEventListener(t, function () { pntUso = Date.now(); }, { passive: true, capture: true }); });
function pntRecargar() {
    pntPend = true;
    var av = document.getElementById('pnt-recarga-aviso');
    if (!av && document.body) { av = document.createElement('div'); av.id = 'pnt-recarga-aviso'; av.textContent = 'Hay cambios: se actualiza cuando dejes de scrollear'; av.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483647;padding:7px 14px;border-radius:999px;background:rgba(0,0,0,.78);color:#fff;font:600 12px/1.2 system-ui,sans-serif;pointer-events:none'; document.body.appendChild(av); }
    (function esperar() { if (Date.now() - pntUso < 1500) { setTimeout(esperar, 300); return; } location.reload(); })();
}
function pntPreguntar() {
    if (document.hidden || pntPend) { return; }
    fetch('/__version', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (v) {
        if (pntArr === null) { pntArr = v.a; pntVer = v.v; pntCod = v.c; return; }
        if (v.c !== pntCod) { pntRecargar(); return; }              // el preview se reinició con OTRO código
        if (v.a !== pntArr) { pntArr = v.a; pntVer = v.v; return; }  // se reinició con el mismo código (2026-11-14): no hace falta recargar
        if (v.v === pntVer) { return; }
        pntVer = v.v;
        if (v.t !== 'css') { pntRecargar(); return; }               // cambió algo que pide recargar
        pntCambiarCss();
    }).catch(function () { /* el preview se está reiniciando: se vuelve a preguntar */ });
}
/* Cambio de CSS sin titileo (pedido 2026-11-12: "cuando scrolleo empieza a dar saltos y titilar"). ANTES se le cambiaba el href a la hoja
   y, mientras bajaba la nueva, la página quedaba unos milisegundos sin estilos: todo se reacomodaba y saltaba (pasaba cada vez que se
   guardaba un .css, también desde otra sesión, aunque la persona estuviera scrolleando). AHORA espera a que deje de scrollear y carga la
   hoja nueva AL LADO de la vieja; la vieja se saca recién cuando la nueva terminó de cargar. */
function pntCambiarCss() {
    if (Date.now() - pntUso < 1500) { clearTimeout(pntCambiarCss.t); pntCambiarCss.t = setTimeout(pntCambiarCss, 400); return; }
    document.querySelectorAll('link[rel="stylesheet"][href*="/__tema/"]:not([data-pnt-saliendo])').forEach(function (vieja) {
        var nueva = vieja.cloneNode();
        nueva.href = vieja.href.split('?')[0] + '?t=' + Date.now();
        vieja.setAttribute('data-pnt-saliendo', '');
        nueva.onload = nueva.onerror = function () { vieja.remove(); };
        vieja.after(nueva);
    });
}
setInterval(pntPreguntar, 1000);
document.addEventListener('visibilitychange', pntPreguntar);
pntPreguntar();
</script>`;

// Vista de prueba de la página "tienda cerrada con contraseña" (templates/password.tpl): es un .tpl, no se compila en local. Abriendo
// http://localhost:5700/account/login/?pnt-vista=contrasena se arma una maqueta con la misma estructura (logo arriba, mensaje, campo y pie) para
// ver cómo queda con marca.css. Solo existe en el preview local (2026-11-12).
const VISTA_CONTRASENA = `<script>
(function () {
    document.documentElement.classList.remove('pnt-nav', 'pnt-nav-abajo');
    document.body.className = 'template-password';
    document.querySelectorAll('.pnt-barra, .js-head-main, .js-adbar, .page-header, .account-page, #pnt-local').forEach(function (e) { e.remove(); });
    var logo = document.querySelector('.logo-img') ? document.querySelector('.logo-img').outerHTML : '<span class="h3">PANTHERA</span>';
    var f = document.createElement('div');
    f.innerHTML =
        '<header class="head-main"><div class="container"><div class="row justify-content-md-center"><div class="col-md-8 text-center"><div class="my-2">' + logo + '</div></div></div></div></header>' +
        '<section class="section-password py-5"><div class="container"><div class="row justify-content-md-center"><div class="col-md-8 text-center">' +
        '<h2 class="mt-2 mb-5">Estamos preparando algo nuevo</h2>' +
        '<form id="password-form" class="js-form form"><div class="form-group"><label class="form-label" for="password">Contraseña de acceso</label>' +
        '<input type="password" class="form-control" name="password" /></div><input type="submit" class="btn btn-primary btn-block" value="Desbloquear" /></form>' +
        '</div></div></div></section>';
    var primero = document.querySelector('footer');
    while (f.firstChild) { document.body.insertBefore(f.firstChild, primero); }
})();
</script>`;

const CARTEL_LOCAL = ``;   // cartel "LOCAL · sin subir" sacado a pedido del usuario (2026-11-12)

function existeLocal(ruta) {
    return path.extname(ruta) in TIPOS && fs.existsSync(path.join(ESTATICOS, ruta));
}

// (2026-11-15) Para verla desde el celular (misma Wi-Fi): el preview escucha en toda la red y los links se reescriben a la dirección
// con la que se entró (http://192.168.x.x:5700), no siempre a localhost. Solo se aceptan localhost y direcciones de red privada.
// (2026-11-16) También detrás de la "Web preview" de Google Cloud Shell (https://5700-cs-….cloudshell.dev), para verla desde el celular sin compu.
function localDe(req) {
    const host = String(req.headers.host || '');
    if (/^[a-z0-9.-]+\.cloudshell\.dev$/i.test(host)) { return `https://${host}`; }
    return /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(host) ? `http://${host}` : LOCAL;
}
function enLaRed() {
    return Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => `http://${i.address}:${PUERTO}`);
}

function reescribir(texto, LOCAL) {
    texto = texto.replace(ASSET_TEMA, (url, ruta) => (existeLocal(decodeURIComponent(ruta)) ? `/__tema/${ruta}` : url));
    for (const dominio of [TIENDA, ...OTROS_DOMINIOS]) {
        const escapado = (u) => u.replaceAll('/', '\\/');
        texto = texto.replaceAll(dominio, LOCAL).replaceAll(escapado(dominio), escapado(LOCAL))
            .replaceAll(escapado(dominio).replace(':', '\\u003A'), escapado(LOCAL).replace(':', '\\u003A'));
    }
    return texto;
}

function limpiarCookie(cookie) {
    return cookie.replace(/;\s*domain=[^;]*/i, '').replace(/;\s*secure/i, '').replace(/;\s*samesite=none/i, '; SameSite=Lax');
}

// Cookies: Chrome junta en "localhost" las de todos los proyectos y puertos (más las que copia la tienda y las de
// estadísticas). Con el tiempo pasaban los 16 KB que Node acepta por defecto y el preview daba "HTTP ERROR 431"
// (2026-11-09). Ahora: el servidor acepta encabezados grandes, a la tienda solo se le pasan sus cookies (sin las de
// estadísticas de terceros) hasta 8 KB, y localhost:PUERTO/__limpiar-cookies vacía las acumuladas.
// (2026-11-16) Volvió el "HTTP ERROR 431": las cookies de localhost pasaron los 256 KB. Chrome junta ahí las de TODOS los proyectos locales
// (en este equipo también corre, por ejemplo, un Next.js en el puerto 3210) y nunca manda más de ~180 por sitio de hasta 4 KB cada una
// (~720 KB): con 2 MB el preview acepta siempre el pedido (a la tienda le siguen llegando solo sus cookies, hasta 8 KB). Si pasan los 32 KB,
// revisarCookies anota una vez por minuto, en la consola y en %TEMP%\panthera-preview-cookies-PUERTO.txt, cuánto pesan y cuáles son las más
// grandes (solo los nombres). Para vaciarlas: localhost:PUERTO/__limpiar-cookies (vacía las de TODOS los proyectos de localhost).
const MAX_ENCABEZADOS = 2 * 1024 * 1024;
const COOKIES_MUCHAS = 32 * 1024;
let avisoCookies = 0;
function revisarCookies(req) {
    const cookie = req.headers.cookie || '';
    if (cookie.length < COOKIES_MUCHAS || Date.now() - avisoCookies < 60000) { return; }
    avisoCookies = Date.now();
    const lista = cookie.split(/;\s*/).filter(Boolean).map((c) => ({ n: c.split('=')[0], b: c.length }));
    const grandes = [...lista].sort((a, b) => b.b - a.b).slice(0, 10).map((c) => `${c.n} (${(c.b / 1024).toFixed(1)} KB)`).join(', ');
    const linea = `Cookies de localhost: ${Math.round(cookie.length / 1024)} KB en ${lista.length} cookies. Las más grandes: ${grandes}. Para vaciarlas: ${LOCAL}/__limpiar-cookies`;
    console.log(linea);
    try { fs.writeFileSync(path.join(os.tmpdir(), `panthera-preview-cookies-${PUERTO}.txt`), `${new Date().toISOString()} ${linea}\n`); } catch { /* no importa */ }
}
const COOKIES_AJENAS = /^(_ga|_gid|_gat|_gcl|_fbp|_fbc|_hj|_clck|_clsk|_tt|_pin|_uet|__utm|_scid|ajs_|mp_|amp_|_hp2|_vwo|cto_|__hs|hubspot|_dc_gtm|__kla)/i;
// (2026-11-12) "Agregar al carrito" de los armadores llevaba a un carrito vacío: Chrome manda las cookies más viejas adelante y
// la del carrito (store_cart_session_<tienda>, recién creada) quedaba al final; con muchas cookies de otros proyectos en
// localhost, el tope de 8 KB la dejaba afuera y cada pedido armaba un carrito nuevo. Ahora van primero las de esta tienda (las
// de Tiendanube: store_*, más las que terminan con su número) y nunca las de otra tienda (el preview de BS23 también usa localhost).
const ID_TIENDA = '1276084';
const DE_TIENDANUBE = /^(store_|home_no_cache$|__cf_bm$|stickystate$)/;
function cookiesParaLaTienda(cookie) {
    if (!cookie) { return ''; }
    const primero = [];
    const despues = [];
    for (const c of cookie.split(/;\s*/)) {
        const nombre = c.split('=')[0];
        if (!c || COOKIES_AJENAS.test(nombre)) { continue; }
        const numero = nombre.match(/_(\d{5,})$/);
        if (numero && numero[1] !== ID_TIENDA) { continue; }
        (numero || DE_TIENDANUBE.test(nombre) ? primero : despues).push(c);
    }
    const quedan = [];
    let total = 0;
    for (const c of [...primero, ...despues]) {
        if (total + c.length + 2 > 8192) { continue; }
        quedan.push(c);
        total += c.length + 2;
    }
    return quedan.join('; ');
}
function limpiarCookies(req, res) {
    const nombres = new Set((req.headers.cookie || '').split(/;\s*/).map((c) => c.split('=')[0]).filter(Boolean));
    const vencidas = [...nombres].map((n) => `${n}=; Max-Age=0; Path=/`);
    res.writeHead(302, { Location: '/', 'Cache-Control': 'no-store', ...(vencidas.length ? { 'Set-Cookie': vencidas } : {}) }).end();
}

// Estética de Panthera en todas las páginas, en el mismo lugar donde la carga layouts/layout.tpl:
// fuente y marca.css al final del <head> (le ganan al CSS de Lima), marca.js al final del <body>
const FUENTES = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap">';   // Libre Baskerville: solo banners de categorías // Montserrat (2026-11-12): la carga marca.css con @font-face; antes Outfit + Libre Baskerville + Archivo
// (2026-11-12) Listados en "Novedades": la recarga con sort_by se hace apenas llega el <body> (antes la hacía marca.js con la página
// entera ya bajada y se veía la página a medio armar). Mismo código que layouts/layout.tpl.
const ORDEN_TEMPRANO = `<script>if(!/[?&]sort_by=/.test(location.search)&&!(window.self!==window.top&&/[?&]pnt-panel=1/.test(location.search))){document.documentElement.style.visibility='hidden';location.replace(location.pathname+(location.search?location.search+'&':'?')+'sort_by=created-descending'+location.hash);}if(/[?&]ofertas(&|=|$)/.test(location.search)||location.pathname==='/ofertas/'||location.pathname==='/ofertas'){document.documentElement.classList.add('pnt-pag-ofertas');}</script>`;   // + marca la página de Ofertas desde el primer cuadro (2026-11-12)
function agregarMarca(html, enPanel, vista) {   // enPanel: el marco del carrito lateral (?pnt-panel=1) no abre la conexión de recarga ni lleva el cartel
    const css = (fs.existsSync(path.join(ESTATICOS, 'panthera', 'marca.css')) ? FUENTES + '<link rel="stylesheet" href="/__tema/panthera/marca.css">' : '')
        + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'secciones.css')) ? '<link rel="stylesheet" href="/__tema/panthera/secciones.css">' : '')
        + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'paginas.css')) ? '<link rel="stylesheet" href="/__tema/panthera/paginas.css">' : '');   // arreglos de páginas internas (2026-11-12)   // secciones nuevas del inicio (2026-11-10)
    const js = (fs.existsSync(path.join(ESTATICOS, 'panthera', 'lenis.min.js')) ? '<script src="/__tema/panthera/lenis.min.js" defer></script><script src="/__tema/panthera/scroll.js" defer></script>' : '') + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'marca.js')) ? '<script src="/__tema/panthera/marca.js" defer></script>' : '')
        + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'secciones.js')) ? '<script src="/__tema/panthera/secciones.js" defer></script>' : '')
        + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'paginas.js')) ? '<script src="/__tema/panthera/paginas.js" defer></script>' : '')
        + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'armar3d.js')) ? '<script src="/__tema/panthera/armar3d.js" defer></script>' : '')    // armador 3D (solo actúa si está la sección)
        + (fs.existsSync(path.join(ESTATICOS, 'panthera', 'oreja3d.js')) ? '<script src="/__tema/panthera/oreja3d.js" defer></script>' : '');   // Armá tu oreja (2026-11-11; ídem)
    const cabeza = html.indexOf('</head>');
    if (cabeza !== -1) { html = html.slice(0, cabeza) + css + html.slice(cabeza); }
    const cuerpo = /<body[^>]*template-category[^>]*>/.exec(html);   // ORDEN_TEMPRANO: igual que en layout.tpl
    if (cuerpo) { html = html.slice(0, cuerpo.index + cuerpo[0].length) + ORDEN_TEMPRANO + html.slice(cuerpo.index + cuerpo[0].length); }
    const fin = html.lastIndexOf('</body>');
    if (fin === -1) { return html; }
    return html.slice(0, fin) + js + (enPanel ? '' : RECARGA + CARTEL_LOCAL) + (vista ? VISTA_CONTRASENA : '') + html.slice(fin);
}

// Snipplets nuevos de Panthera que la tienda publicada todavía no tiene: el preview los renderiza con
// Twig y los pone donde los incluye layout.tpl. Los datos de la tienda (redes) salen del HTML publicado.
Twig.cache(false);
Twig.extendFilter('static_url', (v) => '/__tema/' + String(v).split('/').map(encodeURIComponent).join('/'));
// Orden: las cuatro secciones nuevas (2026-11-10) van antes de redes y las dos antes del footer, así quedan en este orden:
// Armá tu pulsera, Colecciones Disney, Cómo cuidar tu plata, Nuestros locales, Seguinos en redes, footer
const SNIPPLETS = [
    // Intro cinematográfica (intro.tpl) QUITADA por pedido del usuario (2026-11-12): para volver a ponerla, descomentar esta línea y la de layout.tpl
    // { plantilla: 'snipplets/panthera/intro.tpl', soloHome: true, despuesDe: /<body[^>]*>/ },
    { plantilla: 'snipplets/panthera/disney.tpl', soloHome: true, antesDe: '<footer class="js-footer' },
    { plantilla: 'snipplets/panthera/armar.tpl', soloHome: true, antesDe: '<footer class="js-footer' },
    { plantilla: 'snipplets/panthera/oreja.tpl', soloHome: true, antesDe: '<footer class="js-footer' },   // Armá tu oreja (2026-11-11): justo debajo de Armá tu pulsera (pedido del usuario)
    { plantilla: 'snipplets/panthera/cuidar.tpl', soloHome: true, antesDe: '<footer class="js-footer' },
    // "Vení a conocernos" (locales.tpl) oculta por ahora (pedido 2026-11-10): para volver a mostrarla, descomentar esta línea y la de layout.tpl
    // { plantilla: 'snipplets/panthera/locales.tpl', soloHome: true, antesDe: '<footer class="js-footer' },
    { plantilla: 'snipplets/panthera/conocenos.tpl', soloHome: true, antesDe: '<footer class="js-footer' },   // Conocenos (2026-11-11): anteúltima, arriba de Seguinos en redes (pedido del usuario)
    { plantilla: 'snipplets/panthera/redes.tpl', soloHome: true, antesDe: '<footer class="js-footer' },
    // Ficha de producto (2026-11-12): "Cómo cuidar tu plata" entre las reseñas y los productos relacionados (las reseñas las arma marca.js en la vista previa)
    { plantilla: 'snipplets/panthera/cuidar.tpl', soloProducto: true, antesDe: '<section id="related-products"' }
];

function datosTienda(html) {
    const red = (nombre) => (new RegExp(`href="([^"]*${nombre}[^"]*)"[^>]*class="social-icon|class="social-icon[^"]*"[^>]*href="([^"]*${nombre}[^"]*)"`).exec(html) || []).slice(1).find(Boolean) || '';
    const whatsapp = (/href="(https?:\/\/wa\.me\/\d+)[^"]*"/.exec(html) || [])[1] || '';   // el botón flotante de WhatsApp
    return { store: { instagram: red('instagram'), tiktok: red('tiktok'), facebook: red('facebook'), whatsapp, cart_url: '/comprar/' } };
}

function agregarSnipplets(html, esHome, esProducto) {
    for (const s of SNIPPLETS) {
        if (s.soloHome && !esHome) { continue; }
        if (s.soloProducto && !esProducto) { continue; }
        let lugar = -1;
        if (s.antesDe) { lugar = html.indexOf(s.antesDe); }
        if (s.despuesDe) { const m = s.despuesDe.exec(html); lugar = m ? m.index + m[0].length : -1; }
        if (lugar === -1) { continue; }
        try {
            const fuente = fs.readFileSync(path.join(TEMA, s.plantilla), 'utf8');
            const salida = Twig.twig({ data: fuente, autoescape: true, rethrow: true }).render(datosTienda(html));
            html = html.slice(0, lugar) + salida + html.slice(lugar);
        } catch (error) {
            console.log(`Aviso: ${s.plantilla} no se pudo renderizar: ${error.message}`);
        }
    }
    return html;
}

function servirTema(req, res) {
    try {
        servirArchivo(req, res);
    } catch (error) {
        // Pasa si el archivo se está guardando justo en ese momento: se responde vacío y listo
        console.error(`${req.url}: ${error.message}`);
        if (!res.headersSent) { res.writeHead(503).end(); } else { res.end(); }
    }
}

function enviar(archivo, res, opciones) {
    fs.createReadStream(archivo, opciones).on('error', () => res.end()).pipe(res);
}

function servirArchivo(req, res) {
    const ruta = decodeURIComponent(req.url.slice('/__tema/'.length).split('?')[0]);
    const archivo = path.join(ESTATICOS, ruta);
    if (!archivo.startsWith(ESTATICOS + path.sep) || !existeLocal(ruta)) {
        res.writeHead(404).end();
        return;
    }
    const tipo = TIPOS[path.extname(ruta)];
    const est = fs.statSync(archivo);
    const tamano = est.size;
    /* (2026-11-14) ANTES todo se servía con 'Cache-Control: no-store': en cada carga el navegador volvía a bajar TODO (CSS y JS de la
       tienda, fotos de charms y aros, videos de varios MB) y la página tardaba en abrir. Ahora 'no-cache' + ETag: el navegador pregunta
       siempre, y si el archivo no cambió contesta 304 al instante; si se guardó uno nuevo, lo baja (los cambios se siguen viendo al
       momento). */
    const etag = `"${tamano.toString(36)}-${Math.round(est.mtimeMs).toString(36)}"`;
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag, 'Cache-Control': 'no-cache' }).end(); return; }
    const rango = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (rango) {
        const inicio = rango[1] ? Number(rango[1]) : 0;
        const fin = rango[2] ? Math.min(Number(rango[2]), tamano - 1) : tamano - 1;
        res.writeHead(206, { 'Content-Type': tipo, 'Content-Length': fin - inicio + 1, 'Content-Range': `bytes ${inicio}-${fin}/${tamano}`, 'Accept-Ranges': 'bytes', ETag: etag, 'Cache-Control': 'no-cache' });
        enviar(archivo, res, { start: inicio, end: fin });
        return;
    }
    res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': tamano, 'Accept-Ranges': 'bytes', ETag: etag, 'Cache-Control': 'no-cache' });
    enviar(archivo, res);
}

async function traerDeLaTienda(req, res) {
    // Checkout y panel no funcionan fuera de su dominio
    if (SOLO_EN_LA_TIENDA.test(req.url)) {
        res.writeHead(302, { Location: TIENDA + req.url }).end();
        return;
    }

    const LOCAL = localDe(req);   // tapa a la constante: la dirección con la que entró este pedido (compu o celular)
    const headers = { ...req.headers };
    for (const h of ['host', 'connection', 'content-length', 'accept-encoding', 'if-none-match', 'if-modified-since']) {
        delete headers[h];
    }
    if (headers.origin) { headers.origin = TIENDA; }
    if (headers.referer) { headers.referer = headers.referer.replace(LOCAL, TIENDA); }
    // Sin esta cookie, Cloudflare puede entregar un home viejo
    headers.cookie = [cookiesParaLaTienda(headers.cookie), 'home_no_cache=1'].filter(Boolean).join('; ');

    const conCuerpo = !['GET', 'HEAD'].includes(req.method);
    const cuerpo = conCuerpo ? Buffer.concat(await Array.fromAsync(req)) : undefined;
    // (2026-11-15) Si la tienda no contesta (un corte de la red, una demora de Cloudflare), se reintenta dos veces antes de rendirse:
    // un solo pedido fallido dejaba la página negra de "No se pudo traer la página de Tiendanube" (502). Los POST (carrito) no se repiten.
    let respuesta;
    for (let intento = 1; ; intento++) {
        try {
            respuesta = await fetch(TIENDA + req.url, { method: req.method, headers, body: cuerpo, redirect: 'manual', signal: AbortSignal.timeout(30000) });
            if (respuesta.status < 500 || conCuerpo || intento >= 3) { break; }
            await respuesta.body?.cancel().catch(() => {});   // error momentáneo de la tienda (5xx): se pide de nuevo
        } catch (error) {
            if (conCuerpo || intento >= 3) { throw error; }
            console.error(`${req.method} ${req.url}: ${error.message} (reintento ${intento})`);
        }
        await new Promise((r) => setTimeout(r, 600 * intento));
    }

    const salida = { 'cache-control': 'no-store' };
    respuesta.headers.forEach((valor, nombre) => {
        if (!SIN_COPIAR.has(nombre)) { salida[nombre] = valor; }
    });
    const cookies = respuesta.headers.getSetCookie().map(limpiarCookie);
    if (cookies.length) { salida['set-cookie'] = cookies; }
    if (salida.location && !salida.location.includes('/checkout')) {
        for (const dominio of [TIENDA, ...OTROS_DOMINIOS]) { salida.location = salida.location.replace(dominio, LOCAL); }
    }

    const tipo = respuesta.headers.get('content-type') || '';
    if (!/text\/html|json|javascript/.test(tipo)) {
        res.writeHead(respuesta.status, salida).end(Buffer.from(await respuesta.arrayBuffer()));
        return;
    }

    let texto = reescribir(await respuesta.text(), LOCAL);
    if (tipo.includes('text/html')) {
        texto = agregarSnipplets(texto, /<body[^>]*template-home/.test(texto), /<body[^>]*template-product/.test(texto));
        texto = agregarMarca(texto, /[?&]pnt-panel=1/.test(req.url), /[?&]pnt-vista=contrasena/.test(req.url));
    }
    res.writeHead(respuesta.status, salida).end(texto);
}

// (2026-11-15) Si la tienda no contestó ni con los reintentos: la vista previa espera y prueba de nuevo sola (antes quedaba una página negra)
const PAGINA_REINTENTO = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reintentando…</title><style>html,body{height:100%;margin:0;background:#fff;color:#4D4D4D;font:15px/1.5 system-ui,sans-serif}
body{display:flex;align-items:center;justify-content:center;text-align:center;padding:0 20px}b{display:block;color:#000;font-size:17px;margin-bottom:4px}
i{display:block;width:28px;height:28px;margin:0 auto 14px;border:3px solid #F4ACC4;border-right-color:transparent;border-radius:50%;animation:g 0.9s linear infinite}
@keyframes g{to{transform:rotate(360deg)}}</style></head><body><div><i></i><b>La tienda tardó en responder</b>Vuelvo a intentar en unos segundos…</div>
<script>setTimeout(function(){location.reload()},2500)</script></body></html>`;

const pestanas = new Set();
let ULTIMO = 'recargar';   // tipo del último cambio ('css' o 'recargar')
let VERSION = 0;   // cuántas veces avisó de un cambio: una pestaña que estaba oculta lo compara al volver a verse

function escucharRecarga(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
    res.write(`retry: 1000\ndata: arranque:${ARRANQUE}:${VERSION}\n\n`);
    pestanas.add(res);
    req.on('close', () => pestanas.delete(res));
}

// En Windows fs.watch también avisa cuando un archivo solo se lee: cuenta si cambió la fecha
// (2026-11-14) La PRIMERA noticia de cada archivo desde que arrancó el preview no tenía fecha anterior con qué comparar y contaba
// como cambio: la página se recargaba sola la primera vez que se servía cada archivo (al sumar un charm nuevo en el armador, al
// entrar a una página no vista…). Comprobado: en este equipo leer un archivo dispara 'change' sin tocar su fecha. Ahora la primera
// noticia cuenta solo si el archivo se guardó recién, se creó/renombró ('rename') o se borró.
const fechas = new Map();
function cambioDeVerdad(archivo, evento) {
    let fecha = 0;
    try { fecha = fs.statSync(path.join(TEMA, archivo)).mtimeMs; } catch { /* se borró: cuenta */ }
    if (!fechas.has(archivo)) {
        fechas.set(archivo, fecha);
        return fecha === 0 || evento === 'rename' || Date.now() - fecha < 5000;
    }
    if (fechas.get(archivo) === fecha) { return false; }
    fechas.set(archivo, fecha);
    return true;
}

let espera;
const cambios = new Set();
fs.watch(TEMA, { recursive: true }, (evento, archivo) => {
    if (!archivo || archivo.startsWith('.') || !path.extname(archivo) || !cambioDeVerdad(archivo, evento)) { return; }
    cambios.add(archivo);
    clearTimeout(espera);
    espera = setTimeout(() => {
        const lista = [...cambios];
        cambios.clear();
        const enLocal = new Set(SNIPPLETS.map((s) => s.plantilla.replaceAll('/', path.sep)));
        const compilados = lista.filter((a) => a.endsWith('.tpl') && !enLocal.has(a));
        const visibles = lista.filter((a) => !compilados.includes(a));
        compilados.forEach((a) => console.log(`Cambió ${a}: lo compila Tiendanube, se vería recién al subirlo (y todavía NO se sube nada).`));
        if (!visibles.length) { return; }
        const aviso = visibles.every((a) => a.endsWith('.css')) ? 'css' : 'recargar';
        VERSION++;
        ULTIMO = aviso;
        pestanas.forEach((res) => res.write(`data: ${aviso}\n\n`));
    }, 150);
}).on('error', (error) => console.error(`Aviso del vigilante de archivos (el preview sigue andando): ${error.message}`));

// npm run dev usa node --watch: si cambia este archivo, el preview se reinicia solo y la pestaña recarga.
// El navegador se abre solo la primera vez, no en cada reinicio.
function primerArranque() {
    const marca = path.join(os.tmpdir(), `panthera-preview-${PUERTO}.txt`);
    let anterior = '';
    try { anterior = fs.readFileSync(marca, 'utf8'); } catch { /* primera vez */ }
    try { fs.writeFileSync(marca, String(process.ppid)); } catch { /* no importa */ }
    return anterior !== String(process.ppid);
}

http.createServer({ maxHeaderSize: MAX_ENCABEZADOS }, (req, res) => {
    revisarCookies(req);
    if (req.url === '/__recarga') { escucharRecarga(req, res); return; }
    if (req.url.startsWith('/__version')) { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify({ a: ARRANQUE, c: CODIGO, v: VERSION, t: ULTIMO })); return; }
    if (req.url === '/__limpiar-cookies') { limpiarCookies(req, res); return; }
    if (req.url.startsWith('/__tema/')) { servirTema(req, res); return; }
    traerDeLaTienda(req, res).catch((error) => {
        console.error(`${req.method} ${req.url}: ${error.message}`);
        // Una página (no una foto o un script): en vez del texto suelto sobre negro, una página blanca que se vuelve a pedir sola
        const pagina = req.method === 'GET' && /text\/html/.test(req.headers.accept || '');
        if (!res.headersSent) { res.writeHead(502, { 'Content-Type': (pagina ? 'text/html' : 'text/plain') + '; charset=utf-8', 'Cache-Control': 'no-store' }); }
        res.end(pagina ? PAGINA_REINTENTO : 'No se pudo traer la página de Tiendanube.');
    });
}).listen(PUERTO, () => {
    console.log(`Tienda real de Panthera en ${LOCAL}`);
    enLaRed().forEach((u) => console.log(`Desde el celular (misma Wi-Fi): ${u}`));
    console.log('Se ve al guardar: tienda/static/ (panthera/marca.css, marca.js, secciones.css, secciones.js, imágenes) y snipplets/panthera/ (intro, armar, disney, cuidar, locales, redes).');
    console.log('⚠️  Todo queda en local: NO se sube nada a Tiendanube hasta que Panthera dé el OK.');
    if (!process.env.SIN_NAVEGADOR && primerArranque()) { exec(`start "" ${LOCAL}`); }
}).on('error', (error) => {
    if (error.code !== 'EADDRINUSE') { throw error; }
    console.error(`El puerto ${PUERTO} está ocupado: cerrá el otro servidor (Ctrl+C) y volvé a correr npm run dev.`);
    process.exit(1);
});
