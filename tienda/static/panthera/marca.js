// Panthera: comportamiento nuevo sobre el tema Lima de Tiendanube.
// Lo carga layouts/layout.tpl (y, mientras no se suba, el preview local: npm run dev).
// ⚠️ No se sube por FTP hasta que Panthera dé el OK.
//
//  1. Franja de beneficios (como Signos): negra, fija arriba de todo y en movimiento continuo.
//     Los textos salen de la barra de anuncios de Lima (admin → Diseño → Barra de anuncios).
//  2. Navbar isla (como Signos): a todo el ancho y transparente arriba; al bajar se encoge en una
//     píldora de vidrio. Hamburguesa + buscador en pastilla a la izquierda, logo al centro,
//     carrito y cuenta a la derecha. El menú de categorías vive en el panel de la hamburguesa.
//  3. Footer (como BS23): agrega el logo grande de cierre, que se descubre al verse.
//  4. "Seguinos en redes" (snipplets/panthera/redes.tpl): historias que pasan solas.
//  5. Cartel de WhatsApp (como BS23): globo de chat arriba del botón flotante, solo en computadora.
//  6. Intro cinematográfica del inicio (la de la demo de Panthera = INTRO v4 de Signos).
//  7. Banners de categorías del inicio: arriba de "Los más elegidos"; Disney + Aritos, Pulseras y Charms.
//  8. "Los más elegidos" como "Los más vendidos." de BS23: título grande, "Deslizá" + puntitos, tarjetas con
//     sello, bolsita y precio con transferencia; carrusel infinito de a 4 en compu que avanza solo.
//     La misma estética en "No los dejes escapar." (MV_SECCIONES), sin sello y con "Ver todos →" abajo.
//  9. El logo pintado con su dorado (--pnt-dorado-logo), usando la imagen del logo como máscara.

// (2026-11-16, pedido: "creá la categoría Ofertas… que tenga la estética que tiene hoy la categoría falsa… y que el carrusel de ofertas del inicio
// muestre lo que hay en la categoría Ofertas") Ofertas = la categoría "Ofertas" de la tienda (creada el 2026-11-16 con el MCP; su dirección es
// /ofertas/). Antes era una página armada con código en /todos-los-productos/?ofertas con los productos de "No los dejes escapar"; esa dirección
// ahora lleva a la categoría. ⚠️ Mientras la categoría esté OCULTA, Tiendanube no muestra su página ("no encontrada"): el carrusel del inicio
// sigue con los productos que eligió el panel para la sección, y el menú / el cartel llevan a una página que todavía no anda.
var PNT_OFERTAS = window.PNT_OFERTAS = {
    ruta: '/ofertas/',
    url: '/ofertas/?sort_by=created-descending',     // con el orden ya puesto: así la página no se recarga (ver ORDEN_TEMPRANO)
    es: function () { return !!document.body && document.body.classList.contains('template-category') && /^\/ofertas\/?$/.test(location.pathname); }
};

(function () {
    'use strict';
    if (window.__pantheraMarca) { return; }
    window.__pantheraMarca = true;

    // Las animaciones corren siempre, también con "reducir movimiento" del sistema (igual que Signos y BS23)
    var root = document.documentElement;
    // Dentro del panel lateral del carrito (el marco que abre la sección 12): la página muestra solo el carrito (marca.css, sección 16)
    var EN_PANEL = window.self !== window.top && /[?&]pnt-panel=1/.test(location.search);
    if (EN_PANEL) { root.classList.add('pnt-en-panel'); }
    // Los listados de categoría arrancan ordenados por "Novedades" (pedido 2026-11-12). La tienda trae por defecto el orden de "Más vendidos",
    // así que no alcanza con mostrarlo: si la dirección no trae un orden, se vuelve a cargar con sort_by=created-descending (sin dejar
    // una entrada de más en el historial). El que elige otro orden queda con el suyo.
    if (!EN_PANEL && document.body.classList.contains('template-category') && !/[?&]sort_by=/.test(location.search)) {
        root.style.visibility = 'hidden';
        location.replace(location.pathname + (location.search ? location.search + '&' : '?') + 'sort_by=created-descending' + location.hash);
        return;
    }
    // (2026-11-12, "tarda en cargar la estética nuestra y carga la de Tiendanube") La recarga de arriba ahora la hace antes un <script>
    // al principio del <body> (layout.tpl / tienda-local.mjs), pero igual eran dos cargas. Para que no haya ninguna: los links a
    // categorías (las del menú y todo lo que cuelga de /todos-los-productos/) ya llevan el orden "Novedades".
    (function () {
        var cats = {};
        Array.prototype.forEach.call(document.querySelectorAll('a.nav-list-link[href]'), function (a) {
            if (a.host === location.host && a.pathname !== '/' && !/^\/cuidados\//.test(a.pathname)) { cats[a.pathname] = 1; }
        });
        function conOrden(a) {
            if (!a || !a.href || /^(#|javascript:)/i.test(a.getAttribute('href') || '') || a.host !== location.host || /[?&]sort_by=/.test(a.search)) { return; }
            if (!(cats[a.pathname] || /^\/todos-los-productos\//.test(a.pathname))) { return; }
            a.search = (a.search ? a.search + '&' : '?') + 'sort_by=created-descending';
        }
        Array.prototype.forEach.call(document.querySelectorAll('a[href]'), conOrden);
        ['pointerdown', 'click', 'auxclick', 'keydown'].forEach(function (tipo) {   // links que se agregan después (banners, menús armados por JS)
            document.addEventListener(tipo, function (e) { conOrden(e.target && e.target.closest ? e.target.closest('a[href]') : null); }, true);
        });
    })();
    // Carpeta de static/panthera en la CDN (o en el preview): la misma de este archivo
    var CARPETA = ((document.currentScript && document.currentScript.src) || '').split('?')[0].replace(/marca\.js$/, '');
    var BENEFICIOS_DE_RESPALDO = ['3 y 6 cuotas sin interés', 'Envío gratis a partir de $150.000'];

    var ICONO_BUSCAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.25"></circle><path d="M15.25 15.25L20 20"></path></svg>';   // los mismos de BS23 (bs23-search), pedido 2026-11-10
    var ICONO_CUENTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.25" r="3.75"></circle><path d="M4.75 20c.85-3.55 3.75-5.5 7.25-5.5s6.4 1.95 7.25 5.5"></path></svg>';   // los mismos de BS23 (bs23-user), pedido 2026-11-10
    var ICONO_BOLSA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.25 8.5h13.5l-.95 10.45a2 2 0 0 1-2 1.8h-7.6a2 2 0 0 1-2-1.8L5.25 8.5z"></path><path d="M8.75 11V7.25a3.25 3.25 0 0 1 6.5 0V11"></path></svg>';   // los mismos de BS23 (bs23-bag), pedido 2026-11-10
    var ICONO_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';

    /* ── 1. Franja de beneficios ─────────────────────────────────────────── */
    function franja() {
        if (document.querySelector('.pnt-barra')) { return; }
        var textos = [];
        document.querySelectorAll('.js-adbar .swiper-slide:not(.swiper-slide-duplicate)').forEach(function (s) {
            var t = s.textContent.replace(/\s+/g, ' ').trim();
            if (t && textos.indexOf(t) === -1) { textos.push(t); }
        });
        if (!textos.length) { textos = BENEFICIOS_DE_RESPALDO; }
        // Con pocos textos se repiten hasta llenar media vuelta; la pista va dos veces para que el loop no corte
        var mitad = [];
        while (mitad.length < 4) { mitad = mitad.concat(textos); }
        var barra = document.createElement('div');
        barra.className = 'pnt-barra';
        barra.setAttribute('role', 'region');
        barra.setAttribute('aria-label', 'Beneficios');
        var pista = document.createElement('div');
        pista.className = 'pnt-barra-pista';
        mitad.concat(mitad).forEach(function (txt, i) {
            var s = document.createElement('span');
            s.textContent = txt;
            if (i >= textos.length) { s.setAttribute('aria-hidden', 'true'); }
            pista.appendChild(s);
        });
        barra.appendChild(pista);
        document.body.insertBefore(barra, document.body.firstChild);
    }

    /* ── 2. Navbar isla ──────────────────────────────────────────────────── */
    function navbar() {
        var header = document.querySelector('.js-head-main');
        if (!header || header.querySelector('.pnt-buscar')) { return; }
        var fila = header.querySelector('.container-fluid > .row');

        // Hamburguesa: el ícono de Lima se cambia por tres líneas finas
        var hamb = header.querySelector('[data-toggle="#nav-hamburger"]');
        if (hamb) { hamb.innerHTML = ICONO_MENU; hamb.classList.add('pnt-icono'); }

        // Buscador en pastilla: abre el buscador que ya trae la tienda
        var botonBuscar = header.querySelector('.js-search-button');
        if (botonBuscar && fila) {
            botonBuscar.innerHTML = ICONO_BUSCAR;
            botonBuscar.classList.add('pnt-icono');
            var pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'pnt-buscar';
            pill.setAttribute('aria-label', 'Buscar');
            pill.innerHTML = '<span>Buscar</span>' + ICONO_BUSCAR;
            // Como BS23 (pedido 2026-11-12): en compu también abre el panel lateral del buscador (#nav-search)
            // en vez del campo flotante de Lima. Si el panel no está, queda lo de antes.
            pill.addEventListener('click', function () {
                var panel = document.getElementById('nav-search');
                if (panel && typeof window.modalOpen === 'function') {
                    window.modalOpen('#nav-search');
                    setTimeout(function () { var i = panel.querySelector('.js-search-input'); if (i) { i.focus(); } }, 60);
                } else {
                    botonBuscar.click();
                }
            });
            var colBuscar = botonBuscar.closest('.col-utility');
            (colBuscar || fila).appendChild(pill);
        }

        // Carrito: bolsa fina con el número adentro (como Signos)
        var carrito = header.querySelector('.cart-summary > a');
        if (carrito) {
            var viejo = carrito.querySelector('svg');
            if (viejo) {
                var span = document.createElement('span');
                span.className = 'pnt-bolsa';
                span.innerHTML = ICONO_BOLSA;
                viejo.replaceWith(span);
            }
            carrito.classList.add('pnt-carrito');
        }

        // Cuenta: Lima no la tiene en el header; va al lado del carrito
        var colCarrito = header.querySelector('.col-utility-cart .utilities-container');
        if (colCarrito && !header.querySelector('.pnt-cuenta')) {
            var cuenta = document.createElement('a');
            cuenta.className = 'pnt-cuenta pnt-icono';
            cuenta.href = '/account/';
            cuenta.setAttribute('aria-label', 'Mi cuenta');
            cuenta.innerHTML = ICONO_CUENTA;
            colCarrito.insertBefore(cuenta, colCarrito.firstChild);   // cuenta y después carrito, como BS23
        }

        root.classList.add('pnt-nav');
        // En la ficha de producto la navbar (y la franja rosa) quedan arriba de la página y se van al bajar: no siguen ni se
        // encogen en píldora (pedido 2026-11-12: "en detalles del producto la navbar debe quedar arriba, no seguirnos")
        var QUIETA = document.body.classList.contains('template-product');
        if (QUIETA) { root.classList.add('pnt-nav-quieta'); }
        // Al aparecer, el header NO debe animarse desde el estado de Lima (barra blanca con borde) hacia la isla: tiene transiciones de 0,85 s y,
        // con la página cargando, se veía otra cosa durante más de un segundo. Las transiciones se activan recién dos cuadros después.
        requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('pnt-listo'); }); });

        // Al bajar se encoge en píldora: en el inicio pasado el 40 % del slider, en el resto apenas se scrollea
        var bajando = null;
        var corteGuardado = null;      // (2026-11-14) offsetHeight del slider en cada evento de scroll forzaba el diseño: se mide una vez (y al cambiar el tamaño / cargar)
        function actualizar() {
            var y = window.pageYOffset || root.scrollTop || 0;
            if (corteGuardado === null) {
                var slider = document.body.classList.contains('template-home') && document.querySelector('.js-home-slider, [data-store="home-slider"], .section-slider');
                corteGuardado = window.innerWidth <= 767 ? 15 : (slider ? slider.offsetHeight * 0.4 : 50);
            }
            var corte = corteGuardado;
            var abajo = !QUIETA && y > corte;
            if (abajo !== bajando) {
                bajando = abajo;
                root.classList.toggle('pnt-nav-abajo', abajo);
            }
            /* (2026-11-14, "se ve todo lento y trabado") Esto corría en CADA cuadro de scroll y es caro: elementsFromPoint (prueba de
               impacto de toda la página), getBoundingClientRect (fuerza el diseño) y getComputedStyle de cada ancestro. Ahora a lo sumo
               una vez cada 160 ms; el color del buscador se actualiza igual (cambia de a pocos píxeles de scroll). */
            if (!fondoPedido && Math.abs(y - fondoY) > 40) { fondoPedido = true; fondoY = y; setTimeout(function () { requestAnimationFrame(fondoDelBuscador); }, Math.max(0, 160 - (performance.now() - fondoUlt))); }   // y solo si el scroll se movió de verdad (> 40 px)
        }
        // Buscador blanco translúcido mientras detrás hay foto o video; negro (estética de la referencia) solo cuando detrás hay
        // fondo blanco (pedido 2026-11-12). Se mira qué hay de verdad debajo del buscador, salteando la navbar.
        var fondoPedido = false, fondoUlt = 0, fondoY = -9999;
        function esFoto(el) {
            for (var n = el; n && n !== document.body; n = n.parentElement) {
                if (/^(IMG|VIDEO|PICTURE|CANVAS|IFRAME)$/.test(n.tagName)) { return true; }
                if (n.matches && n.matches('[data-store="home-slider"], .pnt-banner, .pnt-hero-v')) { return true; }
                var cs = getComputedStyle(n);
                if (cs.backgroundImage && cs.backgroundImage !== 'none' && cs.backgroundImage.indexOf('url(') > -1) { return true; }
                var c = cs.backgroundColor.match(/[\d.]+/g);
                if (c && (c.length < 4 || +c[3] > 0.5)) { return +c[0] + +c[1] + +c[2] < 600; }   // fondo pintado: oscuro = como foto
            }
            return false;
        }
        function fondoDelBuscador() {
            fondoPedido = false; fondoUlt = performance.now();
            var buscar = document.querySelector('.pnt-buscar');
            if (!buscar || !buscar.offsetWidth || !document.elementsFromPoint) { root.classList.add('pnt-nav-claro'); return; }
            var r = buscar.getBoundingClientRect();
            var debajo = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).filter(function (el) {
                return el !== root && el !== document.body && !el.closest('.js-head-main, .head-main, header');
            })[0];
            root.classList.toggle('pnt-nav-claro', !debajo || !esFoto(debajo));
        }
        var actualizando = false;
        window.addEventListener('scroll', function () { if (!actualizando) { actualizando = true; requestAnimationFrame(function () { actualizando = false; actualizar(); }); } }, { passive: true });
        window.addEventListener('resize', function () { corteGuardado = null; actualizar(); });
        window.addEventListener('load', function () { corteGuardado = null; setTimeout(function () { corteGuardado = null; }, 1500); });
        actualizar();
    }

    /* ── 3. Footer: logo grande de cierre, animado como el de BS23 ──────────
       El footer es rosa y el logo dorado no se vería encima: se dibuja en negro, como los textos.
       Dos capas SVG del mismo logo, pintadas con un filtro (sirve para cualquier imagen del logo):
       el relleno (toda la forma) y el contorno (solo el borde).
       Al verse el pie: se dibuja el contorno, pasa el pincel con el relleno y el contorno se va. */
    var COLOR_LOGO = '#EDC45F'; // dorado del logo (--pnt-dorado-logo), pedido 2026-11-11: el logo del pie en el mismo dorado que el de arriba (antes negro)

    function capaLogo(src, ancho, alto, clase, soloBorde) {
        var ns = 'http://www.w3.org/2000/svg';
        var id = 'pnt-logo-' + clase;
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', clase);
        svg.setAttribute('viewBox', '0 0 ' + ancho + ' ' + alto);
        svg.setAttribute('aria-hidden', 'true');
        // Forma = el canal alfa del logo; borde = la forma menos la misma forma "achicada" 1.6 unidades
        svg.innerHTML = '<defs><filter id="' + id + '" x="-2%" y="-2%" width="104%" height="104%">'
            + (soloBorde
                ? '<feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="adentro"/>'
                  + '<feComposite in="SourceAlpha" in2="adentro" operator="out" result="forma"/>'
                : '<feComponentTransfer in="SourceAlpha" result="forma"/>')
            + '<feFlood flood-color="' + COLOR_LOGO + '"/>'
            + '<feComposite in2="forma" operator="in"/>'
            + '</filter></defs>';
        var imagen = document.createElementNS(ns, 'image');
        imagen.setAttribute('href', src);
        imagen.setAttribute('width', ancho);
        imagen.setAttribute('height', alto);
        imagen.setAttribute('filter', 'url(#' + id + ')');
        svg.appendChild(imagen);
        return svg;
    }

    function pie() {
        var footer = document.querySelector('footer.js-footer');
        var logo = document.querySelector('.js-head-main .logo-img');
        var filaLegal = footer && footer.querySelector('.footer-legal .row');
        if (!footer || !logo || !filaLegal || footer.querySelector('.pnt-pie-logo')) { return; }
        var src = logo.currentSrc || logo.src;
        var ancho = Number(logo.getAttribute('width')) || logo.naturalWidth || 576;
        var alto = Number(logo.getAttribute('height')) || logo.naturalHeight || 231;

        var caja = document.createElement('div');
        caja.className = 'pnt-pie-logo';
        caja.setAttribute('role', 'img');
        caja.setAttribute('aria-label', logo.alt || 'Panthera');
        caja.appendChild(capaLogo(src, ancho, alto, 'pnt-pie-relleno', false));
        caja.appendChild(capaLogo(src, ancho, alto, 'pnt-pie-trazo', true));
        filaLegal.insertBefore(caja, filaLegal.firstChild);
        footer.classList.add('pnt-pie');
        contactoPie(footer);

        if (!('IntersectionObserver' in window)) { caja.classList.add('is-visto'); return; }
        var obs = new IntersectionObserver(function (e) {
            if (e[0].isIntersecting) { caja.classList.add('is-visto'); obs.disconnect(); }
        }, { threshold: 0.5 });
        obs.observe(caja);
    }

    /* Columna "Contacto" del footer (pedido 2026-11-11): WhatsApp y mail. El número sale del que ya usa la tienda (página de Contacto y
       botón de WhatsApp: 5492915661062). El mail lo pasó el usuario el 2026-11-11 (EMAIL_TIENDA). */
    var WA_NUMERO = '5492915661062';
    var EMAIL_TIENDA = 'contacto@panthera.com';   // dado por el usuario el 2026-11-11 ("contactoarrobapanthera.com"); antes se había puesto panthera@gmail.com
    function contactoPie(footer) {
        var fila = footer.querySelector('.container > .row:first-child');
        if (!fila || fila.querySelector('.pnt-pie-contacto')) { return; }
        var col = document.createElement('div');
        col.className = 'col-12 col-md pnt-pie-contacto';
        var html = '<div class="h4 font-big">Contacto</div>'
            + '<a class="pnt-pie-ct" href="https://wa.me/' + WA_NUMERO + '" target="_blank" rel="noopener">'
            + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'
            + '<span>+54 9 291 566-1062</span></a>';
        if (EMAIL_TIENDA) {
            html += '<a class="pnt-pie-ct" href="mailto:' + EMAIL_TIENDA + '">'
                + '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 7.5 12 13.5l8.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                + '<span>' + EMAIL_TIENDA + '</span></a>';
        }
        col.innerHTML = html;
        fila.appendChild(col);
    }

    /* ── 4. Seguinos en redes: historias ─────────────────────────────────── */
    function redes() {
        var seccion = document.querySelector('.pnt-redes');
        var grande = seccion && seccion.querySelector('.pnt-rh-grande');
        if (!grande) { return; }
        var foto = grande.querySelector('.pnt-rh-foto');
        var video = grande.querySelector('.pnt-rh-video');
        var barra = grande.querySelector('.pnt-rh-barra i');
        var chip = grande.querySelector('.pnt-rh-chip');
        var circulos = [].slice.call(seccion.querySelectorAll('.pnt-rh-circ'));
        var DURACION_FOTO = 5000;
        var actual = 0;
        var visible = false;
        var inicio = 0;
        var cuadro = 0;

        // Reproducción en el celular: solo los círculos con data-orden, siempre en ese orden y desde el 1 (pedido 2026-11-11). Sin data-orden en ninguno, van todos.
        var secuencia = circulos.filter(function (c) { return c.dataset.orden; }).sort(function (a, b) { return a.dataset.orden - b.dataset.orden; });
        if (!secuencia.length) { secuencia = circulos.slice(); }
        function siguiente() { ir(circulos.indexOf(secuencia[(secuencia.indexOf(circulos[actual]) + 1) % secuencia.length])); }

        // Avance de la barra: con video sigue al video; con foto, 5 segundos
        function avanzar(t) {
            var p;
            if (!video.hidden) {
                p = video.duration ? video.currentTime / video.duration : 0;
            } else {
                if (!inicio) { inicio = t; }
                p = Math.min((t - inicio) / DURACION_FOTO, 1);
                if (p >= 1) { siguiente(); return; }
            }
            barra.style.transform = 'scaleX(' + p + ')';
            if (visible) { cuadro = requestAnimationFrame(avanzar); }
        }

        function arrancar() {
            cancelAnimationFrame(cuadro);
            inicio = 0;
            if (!visible) { return; }
            if (!video.hidden) {
                video.muted = true;
                var pr = video.play();
                if (pr && pr.catch) { pr.catch(function () {}); }
            }
            cuadro = requestAnimationFrame(avanzar);
        }

        function ir(i) {
            actual = (i + circulos.length) % circulos.length;
            var c = circulos[actual];
            circulos.forEach(function (x) {
                x.classList.toggle('is-activo', x === c);
                x.setAttribute('aria-selected', x === c ? 'true' : 'false');
            });
            foto.src = c.dataset.img;
            if (c.dataset.video) {
                video.poster = c.dataset.img;
                video.src = c.dataset.video;
                video.hidden = false;
                video.load();
            } else {
                video.pause();
                video.removeAttribute('src');
                video.hidden = true;
            }
            grande.href = c.dataset.url;
            chip.textContent = c.dataset.usuario + ' · ' + c.dataset.red;
            barra.style.transform = 'scaleX(0)';
            grande.classList.remove('is-cambio');
            void grande.offsetWidth;
            grande.classList.add('is-cambio');
            arrancar();
        }

        circulos.forEach(function (c, i) { c.addEventListener('click', function () { if (secuencia.indexOf(c) > -1) { ir(i); } }); });

        // Círculos con video propio ("Novedades", pedido 2026-11-11): se reproducen solos, mudos y en bucle mientras los círculos están
        // a la vista y la pestaña visible (así no gastan batería fuera de pantalla). Aparecen con un fundido cuando ya están andando; si el
        // video no carga, queda la foto del círculo. NO se frenan por "movimiento reducido": en esta tienda las animaciones corren siempre.
        var minis = [].slice.call(seccion.querySelectorAll('.pnt-rh-circ-video'));
        if (minis.length) {
            var minisVisibles = false;
            var minisEstado = function () {
                minis.forEach(function (v) {
                    if (minisVisibles && !document.hidden) {
                        v.muted = true;
                        var pr = v.play();
                        if (pr && pr.catch) { pr.catch(function () {}); }
                    } else {
                        v.pause();
                    }
                });
            };
            minis.forEach(function (v) {
                v.addEventListener('playing', function () { v.classList.add('is-reproduce'); });
                v.addEventListener('error', function () { v.classList.remove('is-reproduce'); v.hidden = true; });
            });
            var filaCirculos = seccion.querySelector('.pnt-rh-circulos') || seccion;
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(function (e) { minisVisibles = e[0].isIntersecting; minisEstado(); }, { threshold: 0.2 }).observe(filaCirculos);
            } else { minisVisibles = true; minisEstado(); }
            document.addEventListener('visibilitychange', minisEstado);
        }

        video.addEventListener('ended', siguiente);
        ir(circulos.indexOf(secuencia[0]));   // la primera historia también es video desde el arranque (antes empezaba con la imagen)
        // Si un video no carga (archivo que falta o formato que el navegador no lee), la historia sigue con su imagen
        video.addEventListener('error', function () { video.pause(); video.removeAttribute('src'); video.hidden = true; });

        // Solo corre mientras la sección está en pantalla y la pestaña visible
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (e) {
                visible = e[0].isIntersecting && !document.hidden;
                if (visible) { arrancar(); } else { cancelAnimationFrame(cuadro); video.pause(); }
            }, { threshold: 0.35 }).observe(grande);
        }
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { visible = false; cancelAnimationFrame(cuadro); video.pause(); }
        });
    }

    /* ── 5. Cartel de WhatsApp (como BS23, que lo copió de Signos) ─────────
       Solo en computadora. Un globo con forma de chat arriba del botón flotante: aparece a los 10 s,
       queda 15 s, descansa 15 s y vuelve con el mensaje siguiente. Cada mensaje abre WhatsApp con un
       texto ya escrito acorde. Si se cierra a mano no vuelve hasta recargar. Nunca tapa el footer.
       Diseño de Signos (vidrio esmerilado, hora en los mensajes y barra "Escribí un mensaje") con la paleta
       de Panthera: cabecera dorada, respuesta rosa, textos en negro y gris. */
    var WA_SALUDO = '¡Hola! Te escribo desde la web de Panthera. ';

    function waMensajeBoton() {
        var b = document.body.classList;
        if (b.contains('template-product')) {
            var t = document.querySelector('h1');
            return WA_SALUDO + 'Quería consultar por: ' + (t ? t.textContent.trim() : 'un producto') + ' (' + location.href + ')';
        }
        if (b.contains('template-category')) { return WA_SALUDO + 'Quería consultar por los productos de esta categoría.'; }
        if (b.contains('template-cart')) { return WA_SALUDO + 'Tengo una consulta con mi pedido.'; }
        return WA_SALUDO + 'Quería hacerles una consulta.';
    }

    // Lo que dice el globo según la página. titulo + texto: el mensaje de Panthera · envio: lo que queda escrito en WhatsApp
    function waMensajes() {
        var b = document.body.classList;
        if (b.contains('template-product')) {
            return [
                { titulo: '¿Te gustó esta pieza?', texto: 'Te confirmamos el stock y te ayudamos con lo que necesites al toque.', envio: waMensajeBoton() },
                { titulo: '¿Es para regalo?', texto: 'Contanos para quién es y te ayudamos a elegir.', envio: waMensajeBoton() + ' Es para regalo, ¿me ayudan?' }
            ];
        }
        if (b.contains('template-cart')) {
            return [{ titulo: '¡Ya casi es tuyo!', texto: '¿Te ayudamos a terminar el pedido o tenés alguna duda con el envío?', envio: WA_SALUDO + 'Quiero comprar y necesito ayuda para terminar mi pedido.' }];
        }
        return [
            { titulo: '¡Hola! 👋', texto: '¿Buscás algo en especial? Escribinos y te ayudamos a elegir.', envio: WA_SALUDO + 'Quiero comprar, ¿me ayudan a elegir?' },
            { titulo: '¿Armás tu pulsera?', texto: 'Te ayudamos a elegir los charms que combinan.', envio: WA_SALUDO + 'Quiero armar una pulsera con charms, ¿me ayudan?' },
            { titulo: '¿Buscás un regalo?', texto: 'Contanos para quién es y te recomendamos.', envio: WA_SALUDO + 'Quiero comprar un regalo, ¿me recomiendan?' },
            { titulo: 'Envío gratis desde $150.000', texto: 'Y 3 y 6 cuotas sin interés. Hacé tu pedido por acá.', envio: WA_SALUDO + 'Quiero comprar, ¿me pasan info del envío?' }
        ];
    }

    function waHora() {
        return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    function whatsapp() {
        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1025) { return; }
        var btn = document.querySelector('.btn-whatsapp');
        if (!btn || document.querySelector('.wa-globo')) { return; }
        var base = (btn.getAttribute('href') || '').split('?')[0];
        if (!base) { return; }
        btn.setAttribute('href', base + '?text=' + encodeURIComponent(waMensajeBoton()));

        var logo = document.querySelector('.js-head-main .logo-img');
        var wrap = document.createElement('div');
        wrap.className = 'wa-globo';
        wrap.innerHTML =
            '<div class="wa-head">' +
                '<span class="wa-avatar"><img alt="" aria-hidden="true"></span>' +
                '<span class="wa-id">' +
                    '<span class="wa-nombre"></span>' +
                    '<span class="wa-estado"><i></i><span class="wa-estado-texto"></span></span>' +
                '</span>' +
                '<button type="button" class="wa-cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
            '</div>' +
            '<a class="wa-cuerpo" target="_blank" rel="noopener">' +
                '<span class="wa-msg wa-entra">' +
                    '<b class="wa-titulo"></b>' +
                    '<span class="wa-texto"></span>' +
                    '<span class="wa-hora wa-hora-entra"></span>' +
                '</span>' +
                '<span class="wa-msg wa-sale">' +
                    '<span class="wa-cta"></span>' +
                    '<span class="wa-hora wa-hora-sale">' +
                        '<span class="wa-hora-txt"></span>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 13 3.5 3.5L13 9"/><path d="m11 16 1 1 7.5-7.5"/></svg>' +
                    '</span>' +
                '</span>' +
                '<span class="wa-escribir">' +
                    '<span class="wa-placeholder"></span>' +
                    '<span class="wa-enviar"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg></span>' +
                '</span>' +
            '</a>';

        // Los textos se escriben como texto, no como HTML
        if (logo) { wrap.querySelector('.wa-avatar img').src = logo.currentSrc || logo.src; }
        wrap.querySelector('.wa-nombre').textContent = 'Panthera';
        wrap.querySelector('.wa-estado-texto').textContent = 'En línea';
        wrap.querySelector('.wa-cta').textContent = 'Quiero comprar';
        wrap.querySelector('.wa-placeholder').textContent = 'Escribí un mensaje';
        var cerrar = wrap.querySelector('.wa-cerrar');
        cerrar.setAttribute('aria-label', 'Cerrar mensaje');
        var cuerpo = wrap.querySelector('.wa-cuerpo');

        var lista = waMensajes();
        var turno = 0;
        // La hora de los dos mensajes es la de cuando aparece el globo
        function ponerHora() {
            var h = waHora();
            wrap.querySelector('.wa-hora-entra').textContent = h;
            wrap.querySelector('.wa-hora-txt').textContent = h;
        }
        function poner() {
            var m = lista[turno % lista.length];
            turno++;
            wrap.querySelector('.wa-titulo').textContent = m.titulo;
            wrap.querySelector('.wa-texto').textContent = m.texto;
            cuerpo.setAttribute('href', base + '?text=' + encodeURIComponent(m.envio));
            ponerHora();
        }
        poner();
        document.body.appendChild(wrap);

        // Siempre justo arriba del botón (Lima lo sube mientras está el aviso de cookies)
        function ubicar() {
            var r = btn.getBoundingClientRect();
            if (!r.width) { return; }
            wrap.style.right = Math.max(window.innerWidth - r.right - 4, 8) + 'px';
            wrap.style.bottom = (window.innerHeight - r.top + 14) + 'px';
        }

        var timers = [];
        var cerrado = false;
        var pendiente = false;

        // No tapa el footer (ni lo marcado con [data-wa-evitar]): si le toca aparecer encima, espera
        function tapa() {
            // se busca cada vez: la columna de la ficha se marca después de que arranca esto (PENDIENTES 101)
            var evitar = document.querySelectorAll('[data-wa-evitar], footer.js-footer');
            var g = wrap.getBoundingClientRect();
            for (var i = 0; i < evitar.length; i++) {
                var r = evitar[i].getBoundingClientRect();
                if (r.bottom > g.top && r.top < g.bottom && r.right > g.left && r.left < g.right) { return true; }
            }
            return false;
        }

        function abrir() {
            if (cerrado) { return; }
            ubicar();
            if (tapa()) { pendiente = true; return; }
            pendiente = false;
            ponerHora();
            wrap.classList.add('is-open');
            timers.push(setTimeout(ocultar, 15000));
        }

        function ocultar() {
            if (cerrado) { return; }
            wrap.classList.remove('is-open');
            // el mensaje cambia ya escondido (después del fundido de salida), nunca a la vista
            timers.push(setTimeout(poner, 1200));
            timers.push(setTimeout(abrir, 15000));
        }

        var esperandoCuadro = false;
        function revisar() {
            esperandoCuadro = false;
            if (cerrado) { return; }
            ubicar();
            if (pendiente && !tapa()) {
                abrir();
            } else if (wrap.classList.contains('is-open') && tapa()) {
                timers.forEach(clearTimeout);
                wrap.classList.remove('is-open');
                pendiente = true;
            }
        }
        /* (2026-11-14, "se ve lento y trabado": era lo que más tiempo se llevaba al bajar, ~4,6 s en 8 s de scroll). Antes, en CADA cuadro de
           scroll: ubicar() y tapa() medían el botón, el globo y todos los [data-wa-evitar] (getBoundingClientRect: fuerza el cálculo de
           estilos y diseño de lo pendiente). Ahora solo se mira si algo lo tapa cuando el globo está abierto o esperando para abrirse, y
           a lo sumo una vez cada 220 ms. Con el globo cerrado entre mensaje y mensaje no hace nada: abrir() ya mide al abrirse. */
        window.addEventListener('scroll', function () {
            if (cerrado || esperandoCuadro) { return; }
            if (!pendiente && !wrap.classList.contains('is-open')) { return; }
            esperandoCuadro = true;
            setTimeout(function () { requestAnimationFrame(revisar); }, 220);
        }, { passive: true });
        window.addEventListener('resize', ubicar);

        // Cierre manual o al tocarlo: no vuelve a aparecer en esta visita
        function cerrarDelTodo() {
            cerrado = true;
            wrap.classList.remove('is-open');
            timers.forEach(clearTimeout);
        }
        cerrar.addEventListener('click', cerrarDelTodo);
        cuerpo.addEventListener('click', cerrarDelTodo);

        ubicar();
        timers.push(setTimeout(abrir, 10000));
    }

    /* ── 6. Intro cinematográfica del inicio (la de la demo = INTRO v4 de Signos) ─────────
       El velo lo pone snipplets/panthera/intro.tpl desde el primer cuadro. Acá: se le pone el logo del
       header, se espera a que el logo y la tipografía estén listos (o 1,2 s como mucho) y corre la
       secuencia con los mismos tiempos que la demo: revelado 1,2 s · pausa 80 ms · el velo se funde en 1 s
       y entran la franja, la navbar y WhatsApp. */
    function intro() {
        var velo = document.getElementById('pnt-intro');
        if (!velo) { return; }
        // marca.js tomó el control: el seguro de 5 s del snipplet ya no hace falta
        clearTimeout(window.__pntIntroSeguro);

        var logo = document.querySelector('.js-head-main .logo-img');
        var img = document.createElement('img');
        img.alt = '';
        if (logo) { img.src = logo.currentSrc || logo.src; }
        velo.querySelector('.pnt-intro-logo').appendChild(img);

        var REVELADO = 1200;
        var PAUSA = 1300;     // con el 5.º aniversario (2026-11-12): el logo se revela (1,2 s), el 5 cuenta de 1 a 5 y se queda un rato (antes la pausa era de 80 ms)
        var arrancado = false;
        // El 5 cuenta de 1 a 5 (cada número entra subiendo y se aclara) y el 5 cae con un leve rebote y un brillo
        var cinco = velo.querySelector('.pnt-intro-cinco');
        var num = cinco && cinco.querySelector('b');
        if (num) { num.textContent = '1'; }
        function cuenta() {
            if (!num) { return; }
            for (var n = 1; n <= 5; n++) {
                (function (n) {
                    setTimeout(function () {
                        num.textContent = String(n);
                        num.classList.remove('is-tick');
                        void num.offsetWidth;
                        num.classList.add('is-tick');
                        if (n === 5) { cinco.classList.add('is-aterriza'); }
                    }, 750 + (n - 1) * 170);
                })(n);
            }
        }

        function salir() {
            velo.classList.add('is-saliendo');      // el velo se desenfoca hacia nitidez, y el video del hero arranca (heroVideo mira esta clase)
            setTimeout(function () {      // vuelve la barra de scroll (la página se ajusta ~15 px) bajo el velo todavía muy desenfocado
                root.classList.remove('pnt-intro-lock');
                window.scrollTo(0, 0);
            }, 150);
            setTimeout(function () {
                root.classList.add('pnt-intro-entra');
                root.classList.remove('pnt-intro-on', 'pnt-intro-run');
            }, 400);
            setTimeout(function () { velo.remove(); }, 1500);
            setTimeout(function () { root.classList.remove('pnt-intro-entra'); }, 3000);
        }

        function arrancar() {
            if (arrancado) { return; }
            arrancado = true;
            root.classList.add('pnt-intro-run');
            cuenta();
            setTimeout(salir, REVELADO + PAUSA);
        }

        var listos = [];
        if (img.decode) { listos.push(img.decode().catch(function () {})); }
        if (document.fonts && document.fonts.load) { listos.push(document.fonts.load('800 12px "Pnt Montserrat"').catch(function () {})); }
        Promise.all(listos).then(arrancar, arrancar);
        setTimeout(arrancar, 1200);
    }

    /* ── 7. Banners de categorías del inicio ─────────────────────────────────
       Los banners de Lima ("Banners de novedades" del admin) traen el texto dibujado en la imagen.
       - La sección sube arriba de "Los más elegidos".
       - Queda "Nueva colección Disney" (el 1.º, con el link del admin pero con la foto sin texto y el texto
         en HTML); el 2.º ("Ofertas") pasa a Aritos y se suman Pulseras y Charms, armados como mosaico.
         Fotos en static/panthera/banners, texto encima en HTML con la tipografía de la tienda. */
    /* Distribución: la propuesta 01 "Mosaico editorial" del artefacto «Categorías Panthera» (elegida el 2026-11-09):
       Disney grande a la izquierda (dos filas), Aritos ancho arriba a la derecha, Pulseras y Charms abajo.
       Texto abajo a la izquierda en blanco (rótulo chico + título), entrada en cortina; el hover es el de siempre. */
    var BANNERS_NUEVOS = [
        { texto: 'Aritos', clase: 'aritos', img: 'banners/aritos.webp', url: '/todos-los-productos/aros/' },
        { texto: 'Pulseras', clase: 'pulseras', img: 'banners/pulseras.webp', url: '/todos-los-productos/pulseras/' },
        { texto: 'Charms', clase: 'charms', img: 'banners/charms.webp', url: '/todos-los-productos/charms-panthera/' }
    ];

    // Cambia la foto del banner (se sacan los atributos de carga diferida de Lima)
    function ponerFoto(col, archivo, alt) {
        var fade = col.querySelector('.placeholder-fade');
        if (fade) { fade.remove(); }
        var img = col.querySelector('img');
        if (!img) { return; }
        ['data-src', 'data-srcset', 'data-sizes', 'srcset', 'sizes', 'data-expand'].forEach(function (n) { img.removeAttribute(n); });
        img.className = 'textbanner-image-effect img-fluid d-block w-100 pnt-banner-img';
        img.src = CARPETA + archivo;
        img.alt = alt;
        img.loading = 'lazy';
    }

    // El texto del banner es HTML con la tipografía de la tienda: un rótulo chico (Outfit) y el título (Cormorant)
    function ponerTexto(col, rotulo, titulo) {
        var caja = col.querySelector('.textbanner-image') || col.querySelector('a');
        var t = document.createElement('span');
        t.className = 'pnt-banner-texto';
        var eb = document.createElement('span');
        eb.className = 'pnt-banner-eb';
        eb.textContent = rotulo;
        var tit = document.createElement('span');
        tit.className = 'pnt-banner-tit';
        tit.textContent = titulo;
        t.appendChild(eb);   // rótulo de arriba ("Colección" / "Nueva colección"): se sacó y se volvió a poner el 2026-11-09
        t.appendChild(tit);
        caja.appendChild(t);
    }

    function armarBanner(col, b) {
        col.classList.add('pnt-banner', 'pnt-banner--' + b.clase);
        var a = col.querySelector('a');
        if (a) { a.href = b.url; a.setAttribute('aria-label', b.texto); }
        ponerFoto(col, b.img, b.texto);
        ponerTexto(col, 'Colección', b.texto);
    }

    // Disney: el banner del admin trae el texto dibujado en la imagen y no se le puede cambiar la tipografía.
    // Se usa la misma foto sin el texto (banners/disney.webp, ya con su velo rosa) y el texto va en HTML.
    // El link y la categoría a la que lleva siguen siendo los del admin.
    function armarDisney(col) {
        col.classList.add('pnt-banner', 'pnt-banner--disney');
        var a = col.querySelector('a');
        if (a) { a.setAttribute('aria-label', 'Nueva colección Disney'); }
        ponerFoto(col, 'banners/disney.webp', 'Nueva colección Disney');
        ponerTexto(col, 'Nueva colección', 'Disney');
    }

    // "VER COLECCIÓN →": aparece al pasar el mouse por el banner (igual que las categorías de BS23).
    // Va debajo del título, dentro del bloque de texto, para no pisarlo.
    function agregarVerColeccion(col) {
        var caja = col.querySelector('.pnt-banner-texto') || col.querySelector('.textbanner-image') || col.querySelector('a');
        if (!caja || caja.querySelector('.pnt-banner-ver')) { return; }
        var v = document.createElement('span');
        v.className = 'pnt-banner-ver';
        v.innerHTML = 'Ver productos <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h12M10 4l4 4-4 4"/></svg>';
        caja.appendChild(v);
    }

    function bannersInicio() {
        var seccion = document.querySelector('[data-store="home-banner-news"]');
        if (!seccion || seccion.querySelector('.pnt-banner')) { return; }

        // Arriba de "Los más elegidos"
        var destacados = document.querySelector('[data-store="home-products-featured"]');
        if (destacados && destacados.parentNode) { destacados.parentNode.insertBefore(seccion, destacados); }

        var fila = seccion.querySelector('.js-banner-row');
        var cols = fila ? fila.querySelectorAll('.js-banner') : [];
        if (cols.length < 2 || !CARPETA) { return; }
        var molde = cols[0].cloneNode(true);
        armarDisney(cols[0]);
        cols[1].remove();
        BANNERS_NUEVOS.forEach(function (b) {
            var col = molde.cloneNode(true);
            armarBanner(col, b);
            fila.appendChild(col);
        });
        seccion.querySelectorAll('.banner-container').forEach(agregarVerColeccion);
        // Sin la entrada "fade-in-up" de Lima: estos banners entran con la cortina de abajo
        seccion.querySelectorAll('[data-transition]').forEach(function (el) { el.removeAttribute('data-transition'); });
        seccion.classList.add('pnt-banners');
        cortinaBanners(seccion);
    }

    // Entrada en cortina: al aparecer en pantalla, cada foto se descubre de abajo hacia arriba (una tras otra)
    // mientras se acomoda su zoom. Después se sacan las clases y queda todo como siempre.
    function cortinaBanners(seccion) {
        return;      // (2026-11-15, pedido del usuario: "quitá la animación de entrada que tienen las categorías cuando aparecen") sin cortina: los banners se ven enteros desde el principio
        if (!('IntersectionObserver' in window)) { return; }
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
        seccion.querySelectorAll('.pnt-banner').forEach(function (b, i) { b.style.setProperty('--pnt-dl', (i * 120) + 'ms'); });
        seccion.classList.add('pnt-cortina');
        var io = new IntersectionObserver(function (entradas) {
            if (!entradas.some(function (e) { return e.isIntersecting; })) { return; }
            io.disconnect();
            void seccion.offsetWidth;
            seccion.classList.add('pnt-cortina-in');
            setTimeout(function () { seccion.classList.remove('pnt-cortina', 'pnt-cortina-in'); }, 2800);
        }, { threshold: 0.15 });
        io.observe(seccion);
    }

    /* ── 8. "Los más elegidos" como "Los más vendidos." de BS23 ──────────────────────────────
       Referencia: bs23.mitiendanube.com. Código de origen en ../Pagina web BS23/tienda-rio:
       snipplets/bs23/secciones.tpl (#ofertas, tarjeta .prod--mv), static/bs23/secciones.css y el "Deslizá" de
       static/bs23/home.js. Estilos en la sección 10 de marca.css, con la paleta y la tipografía de Panthera
       (título en Marcellus, la letra más parecida a la del logo; textos y precios en Outfit, como las tarjetas de BS23).
       - Título grande "Los más elegidos." y a la derecha "Deslizá para ver más →" con un puntito por producto.
       - Tarjeta: foto alta con esquinas redondeadas, sello "★ Más elegido", el descuento en rosa y la bolsita
         negra, que es el mismo botón "Comprar" de Lima y hace lo mismo que hacía (hoy agrega y lleva al carrito,
         porque la tienda no tiene activado el "carrito de compras rápidas"; con productos con variantes abre la
         compra rápida). Debajo: nombre en mayúsculas, precio de lista, precio con transferencia grande y cuotas.
         Los precios salen de lo que ya trae la tarjeta de Lima. Las estrellas son DE MUESTRA y solo se ven en el
         preview local (ver mvResenas): en la tienda real no aparecen.
       - Carrusel infinito que avanza solo (se frena con el mouse encima o fuera de pantalla). Con pocos productos
         se repiten (hoy 3 × 3 = 9, a pedido) para que la vuelta no se corte. */
    var MV_SELLO = 'Más vendido ★';
    /* Reseñas DE MUESTRA, como las de BS23 (pedido del cliente, para mostrar el diseño): pocas, de 0 a 10 por
       producto; con 0 no hay renglón de estrellas. Cada producto tiene siempre la misma cantidad (sale de su número).
       ⚠️ SOLO en el preview local (localhost): en la tienda real no aparecen, porque serían opiniones que no existen.
       Si Panthera instala una app de reseñas, acá se conectan las reales. */
    var MV_MUESTRA = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    function mvResenas(item) {
        if (!MV_MUESTRA) { return null; }
        var idp = parseInt(item.getAttribute('data-product-id'), 10) || 0;
        var n = idp % 11;
        if (!n || idp % 5 === 0) { return null; }   // algunos sin reseñas (pedido 2026-11-10): los ids que terminan en 0 o 5
        // Promedio de muestra entre 4,2 y 5,0 (no todos con 5 estrellas; pedido 2026-11-10): sale del id del producto,
        // así cada uno conserva el suyo. La última estrella se llena en proporción (4,6 = 4 y 6/10).
        var id = parseInt(item.getAttribute('data-product-id'), 10) || 0;
        var prom = 4.2 + (((id * 7) + 3) % 9) / 10;
        var r = mvNodo('span', 'pnt-mv-estrellas');
        r.setAttribute('aria-hidden', 'true');
        var base = mvNodo('span', 'pnt-mv-stars', '★★★★★');
        var llena = mvNodo('span', 'pnt-mv-stars-on', '★★★★★');
        llena.style.width = (prom / 5 * 100).toFixed(1) + '%';
        base.appendChild(llena);
        r.appendChild(base);
        r.appendChild(mvNodo('b', 'pnt-mv-prom', prom.toFixed(1).replace('.', ',')));   // "4,5" en negrita, como en la referencia
        r.appendChild(document.createTextNode('(' + n + ')'));
        return r;
    }
    var MV_FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    // Flecha de los botones "Ver todas" / "Ver todos": la misma flecha de arriba (intacta) dentro de una caja que se ensancha
    // al pasar el mouse, más un tramo de línea que aparece solo en el hover para rellenar lo que la flecha se corrió. Así la
    // flecha se extiende y el botón crece lo mismo que ella (estilos en marca.css, "Flecha que se extiende")
    var MV_FLECHA_EXT = '<span class="pnt-flecha-ext" aria-hidden="true"><svg class="pnt-flecha-linea"><line x1="0.5625" y1="7.5" x2="100%" y2="7.5" stroke-width="1.125"/></svg>' + MV_FLECHA + '</span>';
    var MV_TARJETA = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg>';

    function mvTexto(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
    function mvPrecio(t) { return t.replace(/,00$/, ''); }          // "$71.520,00" → "$71.520", como BS23
    function mvOculto(el) { return !el || el.style.display === 'none'; }
    // "$89.400" → 89400 · "$1.234,50" → 1234.5 (formato argentino) y de vuelta, para calcular el "Ahorrás"
    function mvNum(t) { return parseFloat(String(t).replace(/[^\d,]/g, '').replace(',', '.')) || 0; }
    function mvPlata(n) {
        var e = Math.floor(n), c = Math.round((n - e) * 100);
        if (c === 100) { e++; c = 0; }
        return '$' + String(e).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (c ? ',' + (c < 10 ? '0' : '') + c : '');
    }
    // Sello / descuento: la píldora conserva su tamaño de siempre (lo marca el texto "fantasma" al tamaño original) y
    // el texto visible, más chico o más grande, va centrado encima. Así cambia solo la tipografía (pedido 2026-11-09)
    function mvPildora(clase, texto) {
        var n = mvNodo('span', clase);
        n.appendChild(mvNodo('span', 'pnt-mv-fantasma', texto));
        var letra = mvNodo('span', 'pnt-mv-letra');
        if (/ ★$/.test(texto)) {
            // la estrella va aparte para pintarla en el dorado de la paleta
            letra.appendChild(document.createTextNode(texto.slice(0, -2) + ' '));
            letra.appendChild(mvNodo('span', 'pnt-mv-est', '★'));
        } else { letra.textContent = texto; }
        n.appendChild(letra);
        return n;
    }

    function mvNodo(tag, clase, texto) {
        var n = document.createElement(tag);
        if (clase) { n.className = clase; }
        if (texto) { n.textContent = texto; }
        return n;
    }

    /* Encuadre de cada foto. La foto de la tarjeta es más alta que ancha (la proporción de BS23) y las de Panthera
       son cuadradas: se recortan los costados. Con un charm no se nota, pero una pulsera quedaba cortada.
       Se mira la versión de 50px de la foto (la CDN de Tiendanube la deja leer) y, si el fondo es liso y la pieza
       no entra a lo ancho, la foto se achica lo justo para que entre entera; lo que sobra arriba y abajo se
       completa con el mismo fondo de la foto (blanco, o el gris claro de estudio de algunas). Fotos con modelo o
       con ambiente (fondo no liso) quedan recortadas como en BS23. */
    var MV_ALTO = 440 / 318;         // alto / ancho de la foto en la tarjeta (.js-item-image-padding en marca.css)
    var MV_AIRE = 0.88;              // la pieza ocupa como mucho el 88 % del ancho
    var mvEncuadres = {};

    function mvMiniatura(img) {
        var m = (img.getAttribute('data-srcset') || img.getAttribute('srcset') || '').match(/(\S+)\s+50w/);
        if (!m) { return ''; }
        return m[1].indexOf('//') === 0 ? 'https:' + m[1] : m[1];
    }

    function mvMedirFoto(url, listo) {
        var im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = function () {
            try {
                var w = im.naturalWidth, h = im.naturalHeight;
                if (!w || !h) { return; }
                var cv = document.createElement('canvas');
                cv.width = w;
                cv.height = h;
                var cx = cv.getContext('2d');
                cx.drawImage(im, 0, 0);
                var d = cx.getImageData(0, 0, w, h).data;
                var dif = function (i, c) { return Math.max(Math.abs(d[i] - c[0]), Math.abs(d[i + 1] - c[1]), Math.abs(d[i + 2] - c[2])); };
                // Fondo: el promedio del borde (2px); es liso si casi todo el borde se parece a ese promedio
                var borde = [], suma = [0, 0, 0], x, y, i;
                for (y = 0; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        if (x > 1 && y > 1 && x < w - 2 && y < h - 2) { continue; }
                        i = (y * w + x) * 4;
                        borde.push(i);
                        suma[0] += d[i]; suma[1] += d[i + 1]; suma[2] += d[i + 2];
                    }
                }
                var fondo = suma.map(function (s) { return Math.round(s / borde.length); });
                var raros = borde.filter(function (j) { return dif(j, fondo) > 18; }).length;
                if (raros > borde.length * 0.06) { return; }
                // Ancho de la pieza: de la primera a la última columna con algo distinto del fondo
                var x0 = w, x1 = -1;
                for (y = 0; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        if (dif((y * w + x) * 4, fondo) > 28) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
                    }
                }
                if (x1 >= x0) { listo({ ancho: (x1 - x0 + 1) / w, proporcion: w / h, fondo: fondo }); }
            } catch (e) { /* sin permiso para leer la foto: queda como en BS23 */ }
        };
        im.src = url;
    }

    function mvEncuadre(item, img) {
        var id = item.getAttribute('data-product-id');
        var url = img && id ? mvMiniatura(img) : '';
        if (!url || mvEncuadres[id]) { return; }
        mvEncuadres[id] = true;
        mvMedirFoto(url, function (f) {
            // Con object-fit: contain la foto entra justa; "cubrir" es agrandarla kCubrir veces
            var c = Math.min(1 / f.proporcion, MV_ALTO);              // escala de "contain" (caja de 1 × MV_ALTO)
            var kCubrir = Math.max(1 / f.proporcion, MV_ALTO) / c;
            var kEntra = MV_AIRE / (f.ancho * f.proporcion * c);        // la pieza ocupa MV_AIRE del ancho
            if (kEntra >= kCubrir) { return; }                         // entra igual: queda como en BS23
            var zoom = Math.max(1, kEntra).toFixed(3);
            var blanco = f.fondo[0] >= 248 && f.fondo[1] >= 248 && f.fondo[2] >= 248;
            // A todas las tarjetas de ese producto (también las repetidas y las copias del carrusel)
            [].forEach.call(document.querySelectorAll('.pnt-mv-card[data-product-id="' + id + '"]'), function (card) {
                var foto = card.querySelector('img.js-item-image');
                var caja = card.querySelector('.product-item-image-container');
                if (!foto || !caja) { return; }
                foto.setAttribute('data-pnt-zoom', zoom);
                foto.style.setProperty('--pnt-zoom', zoom);
                if (!blanco) { caja.style.setProperty('--pnt-mv-fondo', 'rgb(' + f.fondo.join(',') + ')'); }
            });
        });
    }

    // "Ahora $X": la palabra en gris y el precio en negro (pedido 2026-11-09)
    function mvAhora(precio) {
        var n = mvNodo('span', 'pnt-mv-ahora', 'Ahora ');
        n.appendChild(mvNodo('span', 'pnt-mv-ahora-precio', precio));
        return n;
    }

    function mvTarjeta(item) {
        if (item.classList.contains('pnt-mv-card')) { return; }
        var media = item.querySelector('.product-item-image-container');
        var link = item.querySelector('.item-description .item-link');
        if (!media || !link) { return; }
        item.classList.add('pnt-mv-card');

        // Sobre la foto: sello, descuento y la bolsita (el botón de Lima, que sigue dentro de su tarjeta)
        // El sello va solo en la sección que lo tiene (MV_SECCIONES[].sello): en "No los dejes escapar" no, porque
        // son productos en oferta y no sabemos si son los más vendidos (como las tarjetas de Ofertas de BS23)
        var deSeccion = item.closest('[data-store^="home-products-"]');
        var sello = MV_SECCIONES.filter(function (c) { return deSeccion && deSeccion.getAttribute('data-store') === c.store; })
            .map(function (c) { return c.sello; })[0];
        var esOferta = MV_SECCIONES.some(function (c) { return c.ofertas && deSeccion && deSeccion.getAttribute('data-store') === c.store; });
        if (sello) { media.appendChild(mvPildora('pnt-mv-sello', sello)); }   // idea 02 del artefacto de sellos: pastilla blanca con sombra
        var oferta = item.querySelector('.js-offer-label');
        var pct = mvOculto(oferta) ? '' : mvTexto(oferta.querySelector('.js-offer-percentage'));
        if (pct) { media.appendChild(mvPildora('pnt-mv-off', '-' + pct + '%')); }
        // Promociones del admin (2x1, 3x2, "% en la 2.ª unidad"): la tienda las pinta con las mismas clases que la oferta pero sin
        // .js-offer-label. Su texto va en una píldora propia debajo del "-X%" (PENDIENTES 98, 2026-11-12)
        var promo = [].filter.call(item.querySelectorAll('.label.label-accent:not(.js-offer-label)'), function (l) { return !mvOculto(l) && mvTexto(l); })[0];
        if (promo) { media.appendChild(mvPildora('pnt-mv-promo', mvTexto(promo).replace(/\s+/g, ' '))); }
        var acciones = item.querySelector('.item-actions');
        if (acciones) { media.appendChild(acciones); }

        // La foto se ve más alta que en Lima: que el navegador elija una versión acorde, y encuadrarla
        var img = media.querySelector('img.js-item-image');
        if (img) { img.setAttribute('sizes', '(max-width: 767px) 62vw, (max-width: 1099px) 42vw, 26vw'); }
        mvEncuadre(item, img);

        // Debajo de la foto
        var precio = mvPrecio(mvTexto(item.querySelector('.js-price-display')));
        var comp = item.querySelector('.js-compare-price-display');
        var antes = mvOculto(comp) ? '' : mvPrecio(mvTexto(comp));
        var transfCaja = item.querySelector('.js-payment-discount-price-product-container');
        var transf = mvOculto(transfCaja) ? '' : mvPrecio(mvTexto(transfCaja.querySelector('.js-payment-discount-price-product')));
        var cuotasCaja = item.querySelector('.js-max-installments-container');
        var nCuotas = mvOculto(cuotasCaja) ? '' : mvTexto(cuotasCaja.querySelector('.js-installment-amount'));
        var valorCuota = nCuotas ? mvPrecio(mvTexto(cuotasCaja.querySelector('.js-installment-price'))) : '';
        var sinInteres = !!(cuotasCaja && cuotasCaja.querySelector('.installment-no-interest'));

        var info = mvNodo('span', 'pnt-mv-info');
        // Nombre con las reseñas a su derecha, una línea que divide y los precios en una caja rosa clara (pedido 2026-11-10;
        // idea 15 del artefacto de tarjetas). Las cuotas quedan debajo, afuera de la caja.
        // (La clase es pnt-mv-encab y no pnt-mv-cab: esa es la de la cabecera de la sección, con el título y el "Deslizá".)
        // Se muestra el nombre sin el " - 3695" del final (el guion y lo que sigue; pedido 2026-11-10).
        var cab = mvNodo('span', 'pnt-mv-encab');
        cab.appendChild(mvNodo('span', 'pnt-mv-nombre', mvTexto(item.querySelector('.js-item-name')).replace(/\s+[-–—]\s+.*$/, '')));
        var resenas = mvResenas(item);
        if (resenas) { cab.appendChild(resenas); }
        info.appendChild(cab);
        info.appendChild(mvNodo('span', 'pnt-mv-linea'));
        var caja = mvNodo('span', 'pnt-mv-caja');
        info.appendChild(caja);
        var grande = transf || precio;
        // En "Ofertas" (como BS23): arriba "Ahorrás $X" (el precio anterior menos lo que se paga) y debajo el anterior tachado
        var ahorro = '';
        if (esOferta && antes && grande) { var dif = mvNum(antes) - mvNum(grande); if (dif > 0) { ahorro = mvPlata(dif); } }
        if (ahorro) {
            var filaAhorro = mvNodo('span', 'pnt-mv-ahorro');
            filaAhorro.appendChild(mvNodo('small', '', 'Ahorrás'));
            filaAhorro.appendChild(document.createTextNode(ahorro));
            caja.appendChild(filaAhorro);
            var soloAntes = mvNodo('span', 'pnt-mv-lista');
            soloAntes.appendChild(mvNodo('s', '', antes));
            if (transf && precio) { soloAntes.appendChild(mvAhora(precio)); }   // "Antes $X · Ahora $Y" (pedido 2026-11-09; antes decía "$X $Y lista")
            caja.appendChild(soloAntes);
        } else if (antes || (transf && precio)) {
            // Precio de lista (y, si hay oferta, el anterior tachado). Con transferencia va grande abajo
            var lista = mvNodo('span', 'pnt-mv-lista');
            if (antes) { lista.appendChild(mvNodo('s', '', antes)); }
            if (transf && precio) { if (antes) { lista.appendChild(mvAhora(precio)); } else { lista.appendChild(document.createTextNode(precio + ' lista')); } }   // "Antes $X · Ahora $Y" (pedido 2026-11-09)
            caja.appendChild(lista);
        }
        if (grande) {
            var fila = mvNodo('span', 'pnt-mv-transf');
            fila.appendChild(mvNodo('b', '', grande));
            if (transf) { fila.appendChild(mvNodo('span', '', 'Con transferencia')); }
            caja.appendChild(fila);
        }
        if (!caja.childNodes.length) { caja.remove(); }
        if (nCuotas && valorCuota) {
            var cuotas = mvNodo('span', 'pnt-mv-cuotas');
            cuotas.innerHTML = MV_TARJETA;
            var txt = mvNodo('span');
            txt.appendChild(mvNodo('b', '', nCuotas + ' cuotas' + (sinInteres ? ' sin interés' : '')));
            txt.appendChild(document.createTextNode(' de ' + valorCuota));
            cuotas.appendChild(txt);
            info.appendChild(cuotas);
        }
        link.appendChild(info);
    }

    window.__pntTarjeta = mvTarjeta;   // la ficha de producto lo usa para las tarjetas de "Te va a interesar"

    /* Las dos secciones de productos del inicio llevan esta estética: "Los más elegidos" y "No los dejes escapar"
       (pedido 2026-11-09: "replicá la estética del carrusel y las cards en No los dejes escapar").
       clave = la palabra de las clases de Lima (.js-products-<clave>-title, .js-swiper-<clave>…);
       global = donde Lima guarda su Swiper. Las demoras distintas evitan que los dos carruseles se muevan a la par. */
    var MV_SECCIONES = [
        { store: 'home-products-featured', clave: 'featured', global: 'productsFeaturedSwiper', demora: 3500, sello: MV_SELLO,
          titulo: [/^los m[aá]s elegidos\.?$/i, 'Los más elegidos'], nombre: 'los más elegidos' },          // sin punto (pedido 2026-11-09)
        { store: 'home-products-sale', clave: 'sale', global: 'productsSaleSwiper', demora: 4100, sello: null, ofertas: true,
          titulo: [/^no los dejes escapar\.?$/i, 'No los dejes escapar'], nombre: 'ofertas' }
    ];

    // (2026-11-15, pedido: "en mobile no veo el carrusel de más vendidos y de ofertas, solo veo 1, no 2 por fila") Estos dos carruseles los arma SOLO
    // marca.js. Antes Lima armaba el suyo (2,25 por vista) y marca.js lo destruía y armaba el nuestro (2,04): en un celular lento, hasta que Lima arrancaba
    // (espera a jQuery y a los scripts de Tiendanube, varios segundos) las tarjetas se veían a todo el ancho (1 por fila) y después cambiaban de tamaño dos
    // veces. Ahora el pedido de Lima (createSwiper) para estos dos se ataja y el nuestro se arma apenas está la página; paginas.css (16 f) deja las tarjetas
    // en su tamaño final desde el primer cuadro. Si createSwiper no existiera, queda lo de antes (esperar el de Lima, destruirlo y armar el nuestro).
    var MV_ATAJADO = false, MV_PEDIDOS = {};
    (function () {
        var orig = window.createSwiper;
        if (typeof orig !== 'function' || !document.querySelector('[data-store="home-slider"]')) { return; }
        var propios = {};
        MV_SECCIONES.forEach(function (c) { propios['.js-swiper-' + c.clave] = c.global; });
        window.createSwiper = function (sel, params, cb) {
            var g = propios[sel];
            if (!g) { return orig.apply(this, arguments); }
            var sw = window[g];
            if (sw && sw.pntNuestro) { if (cb) { cb(sw); } } else { MV_PEDIDOS[g] = cb || null; }   // Lima recibe el nuestro (guarda la variable global)
        };
        MV_ATAJADO = true;
    })();

    // Clases propias sobre las de Lima, para que el CSS (sección 10) sirva igual en las dos secciones
    function mvMarcar(seccion, cfg) {
        var marcas = { 'container': 'pnt-mv-cont', 'grid-container': 'pnt-mv-gridcont', 'controls-container': 'pnt-mv-cab',
                       'title': 'pnt-mv-titulo', 'controls': 'pnt-mv-flechas', 'link-container': 'pnt-mv-vertodos' };
        Object.keys(marcas).forEach(function (k) {
            var el = seccion.querySelector('.js-products-' + cfg.clave + '-' + k);
            if (el) { el.classList.add(marcas[k]); }
        });
        var swiper = seccion.querySelector('.js-swiper-' + cfg.clave);
        if (swiper) { swiper.classList.add('pnt-mv-swiper'); }
    }

    // "Ver todos" de Lima (si la sección lo tiene): sale de la cabecera y va abajo del carrusel como botón,
    // así la cabecera queda igual en las dos secciones (título + "Deslizá")
    function mvVerTodos(seccion) {
        var cont = seccion.querySelector('.pnt-mv-vertodos');
        var link = cont && cont.querySelector('a[href]');
        var abajo = seccion.querySelector('.pnt-mv-gridcont') || seccion.querySelector('.pnt-mv-swiper');
        if (!link || mvOculto(cont) || !abajo || seccion.querySelector('.pnt-mv-mas')) { return; }
        var caja = mvNodo('div', 'pnt-mv-mas');
        seccion.setAttribute('data-pnt-vertodos', link.getAttribute('href'));
        var a = mvNodo('a', 'pnt-mv-mas-btn', mvTexto(link) || 'Ver todos');
        a.href = link.getAttribute('href');
        a.insertAdjacentHTML('beforeend', MV_FLECHA_EXT);
        caja.appendChild(a);
        abajo.appendChild(caja);
    }

    function mvCabecera(seccion, cfg) {
        var fila = seccion.querySelector('.pnt-mv-cab');
        var titulo = seccion.querySelector('.pnt-mv-titulo');
        if (!fila || !titulo) { return null; }
        if (cfg.titulo[0].test(mvTexto(titulo))) {
            if (cfg.ofertas) { titulo.innerHTML = '<s class="pnt-mv-tachado">Precio antes</s> <span class="pnt-mv-sub">Ofertas</span>'; }   // era "Precio lista Ofertas" (como BS23); cambiado a "Precio antes Ofertas" el 2026-11-09
            else { titulo.textContent = cfg.titulo[1]; }
        }
        var caja = fila.querySelector('.pnt-desliza');
        if (caja) { return caja; }
        caja = mvNodo('div', 'pnt-desliza');
        caja.hidden = true;
        caja.setAttribute('role', 'group');
        caja.setAttribute('aria-label', 'Desplazar ' + cfg.nombre);
        caja.innerHTML = '<span class="pnt-desliza-txt" aria-hidden="true"><span>Deslizá<span class="pnt-desliza-mas"> para ver más</span></span>' + MV_FLECHA + '</span><div class="pnt-desliza-puntos"></div>';
        fila.appendChild(caja);
        return caja;
    }

    // "Deslizá" en la misma fila que el título y apoyado en su línea de base (igual que home.js de BS23)
    function mvAlinear(seccion, caja) {
        var titulo = seccion.querySelector('.pnt-mv-titulo');
        var puntos = caja.querySelector('.pnt-desliza-puntos');
        caja.style.transform = '';
        caja.classList.remove('is-justo');
        if (caja.hidden || !titulo) { return; }
        var abajo = function () { return caja.getBoundingClientRect().top >= titulo.getBoundingClientRect().bottom - 1; };
        if (abajo()) {
            caja.classList.add('is-justo');                     // celular angosto: sin la palabra "Deslizá"
            if (abajo()) { caja.classList.remove('is-justo'); }
        }
        if (abajo()) { return; }
        var marca = document.createElement('span');
        marca.style.cssText = 'display:inline-block;width:0;height:0;';
        titulo.appendChild(marca);
        var dy = marca.getBoundingClientRect().top - puntos.getBoundingClientRect().bottom;
        titulo.removeChild(marca);
        if (Math.abs(dy) > 0.3 && Math.abs(dy) < 40) { caja.style.transform = 'translateY(' + dy.toFixed(2) + 'px)'; }
    }

    // "Ofertas": primera tarjeta roja con el descuento máximo y el enlace a todas las ofertas (como BS23). (2026-11-15) Se pone apenas se prepara la
    // sección, antes de armar el carrusel: así las tarjetas no se corren un lugar cuando el carrusel arranca.
    function mvPortada(seccion, cfg) {
        var grilla = seccion.querySelector('.pnt-mv-swiper .swiper-wrapper');
        if (cfg.ofertas && grilla && !grilla.querySelector('.pnt-mv-portada')) {
            var max = 0;
            [].forEach.call(seccion.querySelectorAll('.js-offer-percentage'), function (e) { max = Math.max(max, parseInt(e.textContent, 10) || 0); });
            var slide = mvNodo('div', 'swiper-slide');
            var portada = mvNodo('a', 'pnt-mv-portada');
            portada.href = PNT_OFERTAS.url;      // (2026-11-16) la categoría Ofertas (antes el "Ver todos" de Lima)
            portada.appendChild(mvNodo('span', 'pnt-mv-portada-ojo', 'Ofertas'));
            var gr = mvNodo('b', 'pnt-mv-portada-tit');
            gr.innerHTML = 'Hasta<br>−' + (max || 20) + '%';
            portada.appendChild(gr);
            var btn = mvNodo('span', 'pnt-mv-portada-btn', 'Ver todas');
            btn.insertAdjacentHTML('beforeend', MV_FLECHA_EXT);
            portada.appendChild(btn);
            slide.appendChild(portada);
            grilla.insertBefore(slide, grilla.firstChild);
        }
    }

    function mvCarrusel(seccion, caja, cfg) {
        var cont = seccion.querySelector('.pnt-mv-swiper');
        var grilla = cont && cont.querySelector('.swiper-wrapper');
        if (!grilla || typeof Swiper === 'undefined') { return false; }
        if (grilla.getAttribute('data-pnt-carrusel')) { return true; }
        var previo = window[cfg.global];
        if (!previo && !MV_ATAJADO) { return false; }           // Lima todavía no armó el suyo (solo si no se pudo atajar su pedido)
        grilla.setAttribute('data-pnt-carrusel', '1');
        if (previo && !previo.pntNuestro) { previo.destroy(true, true); }
        mvPortada(seccion, cfg);
        var originales = [].filter.call(grilla.children, function (s) {
            return s.classList.contains('swiper-slide') && !s.classList.contains('swiper-slide-duplicate');
        });
        var N = originales.length;
        if (N < 2) { return true; }
        originales.forEach(function (s) { var it = s.querySelector('.js-item-product'); if (it) { mvTarjeta(it); } });

        // (2026-11-16, pedido: "no quiero que se repitan") Ya no se copian tarjetas (antes, con pocos productos, 3 → 3 × 3). Con 6 o más da la
        // vuelta como siempre; con menos sigue avanzando solo, y al llegar a la última vuelve a la primera (rewind). Si entran todas, queda
        // quieto y sin "Deslizá" (watchOverflow → sw.isLocked).
        var vueltas = 1, enRonda = N >= 6;

        var sw = new Swiper(cont, {
            loop: enRonda,
            rewind: !enRonda,
            watchOverflow: true,
            speed: 900,   // más lento y pesado (2026-11-10)
            grabCursor: true,
            slidesPerView: 2.04,                                  // celular: cada tarjeta ≈ 47% del ancho (BS23)
            spaceBetween: 18,                                     // separación entre tarjetas (era 10; más aire, 2026-11-09)
            breakpoints: {
                768: { slidesPerView: 3.15, spaceBetween: 32 },    // tablet: 3 y se asoma la 4.ª
                1100: { slidesPerView: 4.31, spaceBetween: 48 }   // compu: 4 enteras y se asoma un poquito la 5.ª (en 1920px: tarjetas de ~405px y 38px entre ellas)
            },
            autoplay: { delay: cfg.demora, disableOnInteraction: false }
        });
        window[cfg.global] = sw;
        sw.pntNuestro = true;
        cont.classList.add('pnt-sw-listo');          // paginas.css 16 f: desde acá las medidas las pone Swiper
        if (Object.prototype.hasOwnProperty.call(MV_PEDIDOS, cfg.global)) {
            var deLima = MV_PEDIDOS[cfg.global];
            delete MV_PEDIDOS[cfg.global];
            if (deLima) { try { deLima(sw); } catch (err) { /* lo de Lima no frena el carrusel */ } }
        }

        // Se frena con el mouse encima y cuando la sección no se ve
        var encima = false, visible = true;
        function autoplay() {
            if (!sw.autoplay || sw.isLocked) { return; }      // (2026-11-16) si entran todas, no hay a dónde avanzar
            if (encima || !visible) { sw.autoplay.stop(); } else if (!sw.autoplay.running) { sw.autoplay.start(); }
        }
        cont.addEventListener('mouseenter', function () { encima = true; autoplay(); });
        cont.addEventListener('mouseleave', function () { encima = false; autoplay(); });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (e) { visible = e[0].isIntersecting; autoplay(); }, { threshold: 0.25 }).observe(cont);
        }

        // Puntitos: uno por producto (hasta 10); el activo se estira. "Deslizá" se apaga al primer arrastre
        if (caja) {
            var puntos = caja.querySelector('.pnt-desliza-puntos');
            var T = N * vueltas;                 // slides reales del carrusel (con las repetidas)
            // (2026-11-16) Sin vuelta (menos de 6 tarjetas) los puntitos siguen la POSICIÓN (sw.progress, de 0 a 1), no la tarjeta activa: con
            // pocas tarjetas el carrusel se corre menos de una tarjeta entera y Swiper no cambia la activa. Un puntito por posición (hasta 4).
            var conVuelta = !!sw.params.loop;
            var nPuntos = conVuelta ? Math.min(T, 4) : Math.max(1, Math.min(sw.snapGrid.length, 4));        // 4 puntitos en los dos carruseles (pedido 2026-11-09)
            var actual = conVuelta ? function () { return Math.round((sw.realIndex % T) * nPuntos / T - 0.5); }
                : function () { var pr = isFinite(sw.progress) ? Math.min(1, Math.max(0, sw.progress)) : 0; return Math.round(pr * (nPuntos - 1)); };
            var marcar = function () {
                var i = actual();
                [].forEach.call(puntos.children, function (b, k) {
                    b.classList.toggle('is-activo', k === i);
                    b.setAttribute('aria-current', k === i ? 'true' : 'false');
                });
            };
            var aProducto = function (k) { return Math.round(k * T / nPuntos); };
            for (var k = 0; k < nPuntos; k++) {
                var b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('aria-label', 'Parte ' + (k + 1) + ' de ' + nPuntos);
                b.addEventListener('click', (function (dot) {
                    return function () {
                        caja.classList.add('is-usado');
                        if (!conVuelta) {      // (2026-11-16) sin vuelta: a la posición de ese puntito (slidesPerGroup 1: el número de tarjeta es el de la posición)
                            sw.slideTo(Math.round((nPuntos > 1 ? dot / (nPuntos - 1) : 0) * (sw.snapGrid.length - 1)));
                            return;
                        }
                        var d = aProducto(dot) - (sw.realIndex % T);
                        if (d > T / 2) { d -= T; }
                        if (d < -T / 2) { d += T; }
                        if (!d) { return; }
                        sw.loopFix();
                        sw.slideTo(sw.activeIndex + d);
                    };
                })(k));
                puntos.appendChild(b);
            }
            sw.on('slideChange', marcar);
            if (!conVuelta) { sw.on('progress', marcar); }      // sin vuelta, la posición puede cambiar sin cambiar la tarjeta activa
            sw.on('sliderMove', function () { caja.classList.add('is-usado'); });
            // (2026-11-16) si entran todas las tarjetas (pocas ofertas o destacados), no hay nada que deslizar: sin "Deslizá" ni puntitos
            var trabado = function () { caja.hidden = !!sw.isLocked; };
            sw.on('lock', trabado); sw.on('unlock', trabado);
            trabado();
            marcar();
            var alinear = function () { mvAlinear(seccion, caja); };
            alinear();
            if (window.ResizeObserver) { new ResizeObserver(alinear).observe(seccion); } else { window.addEventListener('resize', alinear); }
            if (document.fonts && document.fonts.ready) { document.fonts.ready.then(alinear); }
            window.addEventListener('load', alinear);
        }
        return true;
    }

    // (2026-11-16, pedido: "en el carrusel de ofertas de inicio se muestre lo que hay en la categoría Ofertas") Las tarjetas de "No los dejes
    // escapar" salen de la categoría Ofertas: se baja su página (PNT_OFERTAS.url) y sus productos reemplazan a los que eligió el panel para la
    // sección (Diseño → Organizar productos), con el formato de una tarjeta de carrusel del inicio. Mientras llega, la sección no muestra
    // tarjetas (así no se ven las de antes y después otras). Si la categoría no anda (oculta: Tiendanube da "no encontrada") o tarda más de 5 s,
    // quedan las de la sección. Sin productos en la categoría, la sección no se muestra.
    function mvDeOfertas(seccion, listo) {
        var grilla = seccion.querySelector('.swiper-wrapper');
        if (!grilla || !window.fetch || !window.DOMParser) { listo(); return; }
        var hecho = false;
        var fin = function () {
            if (hecho) { return; }
            hecho = true; seccion.classList.remove('pnt-of-cargando'); listo();
            if (window.lazySizes && window.lazySizes.loader) { window.lazySizes.loader.checkElems(); }
        };
        seccion.classList.add('pnt-of-cargando');
        setTimeout(fin, 5000);
        fetch(PNT_OFERTAS.url, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
            if (hecho) { return; }
            var doc = new DOMParser().parseFromString(html, 'text/html');
            if (!doc.body || !doc.body.classList.contains('template-category')) { fin(); return; }     // la categoría todavía no anda
            var items = [], vistos = {};
            [].forEach.call(doc.querySelectorAll('.js-product-table .js-item-product'), function (it) {
                var id = it.getAttribute('data-product-id');
                if (!id || vistos[id]) { return; }
                vistos[id] = true; items.push(it);
            });
            if (!items.length) { seccion.hidden = true; fin(); return; }      // sin ofertas, sin sección
            grilla.innerHTML = '';
            items.forEach(function (it) {
                var n = document.importNode(it, true);
                n.className = 'js-item-product item-product js-item-slide p-0 col-grid';     // como las tarjetas de los carruseles de Lima
                n.removeAttribute('style');
                var info = n.querySelector('.js-item-info-container'); if (info) { info.classList.add('m-0'); }
                var slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.appendChild(n);
                grilla.appendChild(slide);
            });
            fin();
        }).catch(fin);
    }

    // "Los más elegidos" y "No los dejes escapar" (MV_SECCIONES)
    function masElegidos() {
        MV_SECCIONES.forEach(function (cfg, orden) {
            var seccion = document.querySelector('[data-store="' + cfg.store + '"]');
            if (!seccion || seccion.classList.contains('pnt-mv')) { return; }
            seccion.classList.add('pnt-mv');
            mvMarcar(seccion, cfg);
            var caja = mvCabecera(seccion, cfg);
            mvVerTodos(seccion);
            if (cfg.ofertas) {      // (2026-11-16) su "Ver todos" lleva a la categoría Ofertas
                seccion.setAttribute('data-pnt-vertodos', PNT_OFERTAS.url);
                [].forEach.call(seccion.querySelectorAll('a.pnt-mv-mas-btn'), function (a) { a.href = PNT_OFERTAS.url; });
                mvDeOfertas(seccion, function () { mvArmar(seccion, caja, cfg, orden); });
            } else {
                mvArmar(seccion, caja, cfg, orden);
            }
        });
    }
    function mvArmar(seccion, caja, cfg, orden) {
            [].forEach.call(seccion.querySelectorAll('.js-item-product'), mvTarjeta);
            mvPortada(seccion, cfg);
            // El carrusel: se espera a que Lima arme el suyo (lo crea con un setTimeout) y se rehace
            var intentos = 0;
            // (2026-11-15, "se ve lento y trabado") Armar un carrusel (destruir el de Lima y crear el nuestro) lleva ~0,8 s de procesador: los dos
            // juntos eran un bloque de 1,7 s con la página congelada. Ahora el segundo arranca 1,4 s después del primero.
            // (2026-11-15) con el pedido de Lima atajado se arma enseguida (el de "Ofertas", 0,7 s después: cada uno lleva su rato de procesador)
            var intentar = function () {
                try { return mvCarrusel(seccion, caja, cfg); } catch (e) { if (window.console) { console.warn('[pnt] carrusel ' + cfg.clave + ':', e); } return true; }
            };
            setTimeout(function () {
                if (intentar()) { return; }
                var t = setInterval(function () {
                    intentos++;
                    if (intentar() || intentos > 40) { clearInterval(t); }
                }, 250);
            }, orden * (MV_ATAJADO ? 700 : 1400));
    }

    /* ── Listados (categorías y búsqueda): las mismas tarjetas de "Los más elegidos" (pedido 2026-11-12, ítem 50) ──
       Se reusa mvTarjeta. El scroll infinito de la tienda agrega tarjetas nuevas al final: se vigilan y se marcan también.
       El diseño (título grande, píldoras de Ordenar/Filtrar, grilla a todo el ancho) está en marca.css, sección 13. */
    function listados() {
        var cl = document.body.classList;
        if (!cl.contains('template-category') && !cl.contains('template-search')) { return; }
        var grilla = document.querySelector('.js-product-table');
        // (2026-11-16) Categoría Ofertas: las tarjetas van dentro de un envoltorio invisible (display: contents) con el data-store de "No los dejes
        // escapar", así mvTarjeta las arma rojas, como la página de Ofertas armada con código hasta ese día. También las que suma "Ver más".
        // marca.css esconde las tarjetas sueltas de esta página hasta que están adentro (html.pnt-pag-ofertas, sin ver un instante las rosas).
        var ofertas = grilla && PNT_OFERTAS.es();
        function envolver() {
            var env = grilla.querySelector(':scope > .pnt-ofertas-grilla');
            var sueltas = grilla.querySelectorAll(':scope > .js-item-product');
            if (!sueltas.length) { return; }
            if (!env) { env = document.createElement('div'); env.className = 'pnt-ofertas-grilla'; env.setAttribute('data-store', 'home-products-sale'); grilla.insertBefore(env, grilla.firstChild); }
            [].forEach.call(sueltas, function (it) { env.appendChild(it); });
        }
        function marcar() {
            if (ofertas) { envolver(); }
            [].forEach.call(document.querySelectorAll('.category-body .js-item-product, .js-product-table .js-item-product'), mvTarjeta);
        }
        marcar();
        if (grilla) {
            var t;
            new MutationObserver(function () { clearTimeout(t); t = setTimeout(marcar, 60); }).observe(grilla, { childList: true });
        }
    }

    /* ── Páginas con diseño propio (pedido 2026-11-12, ítems 53 a 58 de PENDIENTES.md): como BS23, con botones rosas ──
       Búsqueda sin resultados, carrito vacío, 404 y páginas de texto (Cuidados, Envíos…). El diseño está en marca.css, sección 14. */
    function boton(texto, href, borde) {
        var a = mvNodo('a', 'pnt-btn' + (borde ? ' pnt-btn--borde' : ''), texto);
        a.href = href;
        return a;
    }
    function chips() {
        var caja = mvNodo('div', 'pnt-explora-chips');
        // Se rellena un instante después: este archivo corre antes de que se defina la lista de categorías (más abajo)
        setTimeout(function () {
            (window.__pntCategorias ? window.__pntCategorias() : []).slice(0, 9).forEach(function (l) {
                var a = mvNodo('a', '', l.t);
                a.href = l.href;
                caja.appendChild(a);
            });
        }, 0);
        return caja;
    }
    /* Página "Cuidados": la estética de "Cómo cuidar tu plata" del inicio (pedido 2026-11-12): título y foto de pulseras a la izquierda y
       acordeón a la derecha (uno abierto a la vez: lo mueve secciones.js). Los ítems salen del texto de la página: cada renglón que es solo un
       título en negrita ("Productos de cobre bañados en oro y plata:") abre un ítem y los párrafos que le siguen son su respuesta. Nada se
       inventa ni se cambia. Si el texto no tiene esa forma (menos de 2 títulos), devuelve false y queda el diseño común de las páginas de texto. */
    function acordeonPagina(etiqueta) {
        var cont = document.querySelector('.user-content');
        var caja = cont && cont.querySelector('.container');
        var cab = document.querySelector('.page-header');
        if (!cont || !caja || !cab) { return false; }
        var parrafos = [].slice.call(caja.querySelectorAll('p, ul, ol')).filter(function (p) { return p.textContent.replace(/\u00a0/g, ' ').trim(); });
        function esTitulo(p) {
            var t = p.textContent.replace(/\u00a0/g, ' ').trim();
            var neg = [].slice.call(p.querySelectorAll('strong, b')).map(function (x) { return x.textContent; }).join('').replace(/\u00a0/g, ' ').trim();
            return t.length < 90 && neg.length > 0 && t.replace(/[:\s]+$/, '') === neg.replace(/[:\s]+$/, '');
        }
        var items = [], actual = null;
        parrafos.forEach(function (p) {
            if (p.tagName === 'P' && esTitulo(p)) { actual = { titulo: p.textContent.replace(/\u00a0/g, ' ').replace(/[:\s]+$/, '').trim(), textos: [] }; items.push(actual); }
            else if (actual && p.tagName === 'P') { actual.textos.push(p.textContent.replace(/\u00a0/g, ' ').trim()); }
            else if (actual) {   // una lista: sus renglones quedan como lista dentro de la respuesta
                actual.textos.push({ lista: [].slice.call(p.querySelectorAll('li')).map(function (li) { return li.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); }).filter(Boolean) });
            }
        });
        items = items.filter(function (i) { return i.textos.length; });
        if (items.length < 2) { return false; }

        var titulo = (cab.querySelector('h1') || {}).textContent;
        var sec = mvNodo('section', 'pnt-s pnt-cu pnt-cu-pagina');
        sec.setAttribute('data-pnt-cuidar', '');
        sec.setAttribute('aria-labelledby', 'pnt-cu-t');
        var interno = mvNodo('div', 'pnt-s-caja');
        var encab = mvNodo('header', 'pnt-cu-cab pnt-rv');
        var h2 = mvNodo('h2', 'pnt-s-titulo', (titulo || 'Cuidados').trim());
        h2.id = 'pnt-cu-t';
        encab.appendChild(mvNodo('div')).appendChild(h2);
        interno.appendChild(encab);
        var grilla = mvNodo('div', 'pnt-cu-grid');
        var izq = mvNodo('div', 'pnt-cu-izq');
        var foto = mvNodo('div', 'pnt-cu-foto pnt-rv');
        var img = document.createElement('img');
        img.src = CARPETA + 'banners/pulseras.webp';
        img.alt = 'Pulseras de plata con charms';
        img.width = 900; img.height = 450; img.decoding = 'async';
        foto.appendChild(img);
        izq.appendChild(foto);
        var der = mvNodo('div', 'pnt-cu-der');
        var ol = mvNodo('ol', 'pnt-cu-lista');
        items.forEach(function (it, i) {
            var li = mvNodo('li', 'pnt-cu-item pnt-rv' + (i === 0 ? ' is-open' : ''));
            li.style.setProperty('--pnt-rv-demora', (i * 70) + 'ms');
            var h3 = mvNodo('h3', 'pnt-cu-h');
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'pnt-cu-btn'; b.id = 'pnt-cu-b' + i;
            b.setAttribute('aria-controls', 'pnt-cu-r' + i); b.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
            b.appendChild(mvNodo('span', 'pnt-cu-n', etiqueta + ' ' + (i + 1)));
            // un título escrito todo en mayúsculas se pasa a mayúscula inicial (para que no grite); el nombre de la marca conserva la suya
            var tit = it.titulo === it.titulo.toUpperCase() && it.titulo.length > 3
                ? it.titulo.toLowerCase().replace(/^./, function (c) { return c.toUpperCase(); }).replace(/panthera/gi, 'Panthera') : it.titulo;
            b.appendChild(mvNodo('span', 'pnt-cu-t', tit));
            var fl = mvNodo('span', 'pnt-cu-flecha');
            fl.setAttribute('aria-hidden', 'true');
            fl.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6"/></svg>';
            b.appendChild(fl);
            h3.appendChild(b);
            var r = mvNodo('div', 'pnt-cu-resp');
            r.id = 'pnt-cu-r' + i; r.setAttribute('role', 'region'); r.setAttribute('aria-labelledby', 'pnt-cu-b' + i);
            var rin = mvNodo('div', 'pnt-cu-resp-in');
            it.textos.forEach(function (t) {
                if (typeof t === 'string') { rin.appendChild(mvNodo('p', '', t)); return; }
                var ul = mvNodo('ul', 'pnt-cu-pl');
                t.lista.forEach(function (x) { ul.appendChild(mvNodo('li', '', x)); });
                rin.appendChild(ul);
            });
            r.appendChild(rin);
            li.appendChild(h3);
            li.appendChild(r);
            ol.appendChild(li);
        });
        der.appendChild(ol);
        grilla.appendChild(izq);
        grilla.appendChild(der);
        interno.appendChild(grilla);
        sec.appendChild(interno);
        cont.parentNode.insertBefore(sec, cont);
        cont.style.display = 'none';      // el texto original queda en la página, escondido
        cab.style.display = 'none';
        return true;
    }

    /* Páginas de texto con pares "Etiqueta: valor" (Envíos): cada par pasa a una ficha con la etiqueta chica espaciada y el valor grande; la
       frase suelta de arriba queda como bajada y un renglón que empieza con "IMPORTANTE" va destacado en rosa suave. No se cambia el texto. */
    function fichas(caja) {
        var ps = [].slice.call(caja.querySelectorAll('.row p'));
        var datos = ps.map(function (p) {
            var t = p.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
            var m = /^([^:]{2,40}):\s*(.*)$/.exec(t);
            return m ? { etq: m[1].trim(), valor: m[2].trim().replace(/^./, function (c) { return c.toUpperCase(); }) } : { texto: t };
        });
        if (datos.filter(function (d) { return d.etq; }).length < 2) { return false; }
        var lista = mvNodo('div', 'pnt-pag-fichas');
        datos.forEach(function (d) {
            if (!d.etq) { if (d.texto) { lista.appendChild(mvNodo('p', 'pnt-pag-lead', d.texto)); } return; }
            var f = mvNodo('div', 'pnt-pag-ficha' + (/^(importante|atenci[oó]n|ojo)/i.test(d.etq) ? ' pnt-pag-ficha--aviso' : ''));
            f.appendChild(mvNodo('span', 'pnt-pag-etq', d.etq));
            if (d.valor) { f.appendChild(mvNodo('span', 'pnt-pag-val', d.valor)); }
            lista.appendChild(f);
        });
        ps[0].parentNode.insertBefore(lista, ps[0]);
        ps.forEach(function (p) { p.remove(); });
        return true;
    }

    /* (Revisión 2026-11-13) Envíos con la misma disposición que Cuidados y Política de cambios: título arriba a todo el ancho y, abajo,
       la foto de pulseras a la izquierda y las fichas a la derecha (antes: título chico a la izquierda y media pantalla vacía). */
    function conFoto(caja, cab, cont) {
        var lista = caja.querySelector('.pnt-pag-fichas');
        if (!lista) { return; }
        var sec = mvNodo('section', 'pnt-s pnt-cu pnt-cu-pagina pnt-cu-fichas');
        var interno = mvNodo('div', 'pnt-s-caja');
        var encab = mvNodo('header', 'pnt-cu-cab pnt-rv');
        encab.appendChild(mvNodo('div')).appendChild(mvNodo('h2', 'pnt-s-titulo', ((cab.querySelector('h1') || {}).textContent || 'Envíos').trim()));
        interno.appendChild(encab);
        var grilla = mvNodo('div', 'pnt-cu-grid');
        var izq = mvNodo('div', 'pnt-cu-izq'), foto = mvNodo('div', 'pnt-cu-foto pnt-rv'), img = document.createElement('img');
        img.src = CARPETA + 'banners/pulseras.webp'; img.alt = 'Pulseras de plata con charms'; img.width = 900; img.height = 450; img.decoding = 'async';
        foto.appendChild(img); izq.appendChild(foto);
        var der = mvNodo('div', 'pnt-cu-der pnt-rv');
        der.appendChild(lista);
        grilla.appendChild(izq); grilla.appendChild(der);
        interno.appendChild(grilla); sec.appendChild(interno);
        cont.parentNode.insertBefore(sec, cont);
        cont.style.display = 'none';
    }

    function paginas() {
        var cl = document.body.classList;

        // Búsqueda sin resultados: tarjeta con el mensaje, accesos a las categorías y el botón de todos los productos
        if (cl.contains('template-search') && !document.querySelector('.js-product-table .js-item-product')) {
            var h1 = document.querySelector('.page-header h1');
            var cuerpo = document.querySelector('.category-body');
            if (h1 && cuerpo && !document.querySelector('.pnt-sinres')) {
                var termino = h1.querySelector('span') ? h1.querySelector('span').textContent.replace(/^["“”\s]+|["“”\s]+$/g, '') : '';
                h1.textContent = 'Resultados de búsqueda';
                document.documentElement.classList.add('pnt-hay-sinres');      // (2026-11-15) reemplaza a body:has(.pnt-sinres) del CSS: ese selector hacía recalcular TODA la página en cada cambio
                var card = mvNodo('div', 'pnt-card-msg pnt-sinres');
                card.appendChild(mvNodo('h2', '', termino ? 'No encontramos resultados para “' + termino + '”' : 'No encontramos resultados'));
                card.appendChild(mvNodo('p', '', 'Probá con otra palabra o mirá una de estas categorías.'));
                card.appendChild(chips());
                card.appendChild(boton('Ver todos los productos', '/todos-los-productos/'));
                var cont = cuerpo.querySelector('.container');
                if (cont) { cont.textContent = ''; cont.appendChild(card); }
                // "Quizás te interesen los siguientes productos" (como en la página 404, pedido 2026-11-12): los 4 más vendidos de la tienda, con las
                // tarjetas de los listados. Se piden a la tienda (no hay otra forma de saber qué productos mostrar desde esta página).
                if (cont && window.fetch) {
                    fetch('/todos-los-productos/?sort_by=best-selling', { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
                        var d = new DOMParser().parseFromString(html, 'text/html');
                        var tarjetas = [].slice.call(d.querySelectorAll('.js-product-table .js-item-product')).slice(0, 4);
                        if (!tarjetas.length || !cont.isConnected || cont.querySelector('.pnt-sug')) { return; }
                        var sec = mvNodo('section', 'pnt-sug');
                        sec.id = 'page-error';   // las tarjetas de los sugeridos ya se estilan así en la 404 (marca.css, sección 17)
                        sec.appendChild(mvNodo('h3', '', 'Quizás te interesen los siguientes productos'));
                        var fila = mvNodo('div', 'row');
                        tarjetas.forEach(function (c) { fila.appendChild(document.importNode(c, true)); });
                        sec.appendChild(fila);
                        cont.appendChild(sec);
                        [].forEach.call(fila.querySelectorAll('.js-item-product'), mvTarjeta);
                        [].forEach.call(fila.querySelectorAll('.js-item-product'), function (c) { c.classList.add('is-inViewport'); c.removeAttribute('data-transition'); });
                    }).catch(function () { /* sin conexión: queda solo el mensaje */ });
                }
            }
        }

        // Categoría sin productos (por ejemplo con filtros que no dejan nada): la misma tarjeta que la búsqueda sin resultados, con el botón para borrar los filtros
        var msg = cl.contains('template-category') && document.querySelector('[data-component="filter.message"]');
        if (msg && !document.querySelector('.pnt-catvacia')) {
            var tcat = mvNodo('div', 'pnt-card-msg pnt-catvacia');
            var hayFiltros = /[?&](min_price|max_price|mpf|variant|sort_by|[a-z_]+\[)/.test(location.search) || !!document.querySelector('.js-remove-all-filters');
            tcat.appendChild(mvNodo('h2', '', hayFiltros ? 'No hay productos con esos filtros' : 'Todavía no hay productos acá'));
            tcat.appendChild(mvNodo('p', '', hayFiltros ? 'Probá sacando algún filtro o mirá una de estas categorías.' : 'Mirá una de estas categorías mientras tanto.'));
            tcat.appendChild(chips());
            var bots2 = mvNodo('div', 'pnt-404-bot');
            if (hayFiltros) { bots2.appendChild(boton('Borrar filtros', location.pathname)); }
            bots2.appendChild(boton('Ver todos los productos', '/todos-los-productos/', hayFiltros));
            tcat.appendChild(bots2);
            var filaMsg = msg.closest('.row') || msg;
            filaMsg.parentNode.replaceChild(tcat, filaMsg);
            msg.style.display = 'none';
        }

        // Carrito vacío: tarjeta con la bolsa, el mensaje y el botón para ir a los productos
        var vacio = cl.contains('template-cart') && document.querySelector('form[data-store="cart-form"] .alert-info');
        if (vacio && !document.querySelector('.pnt-vacio')) {
            var f = vacio.closest('form');
            var t = mvNodo('div', 'pnt-card-msg pnt-vacio');
            t.innerHTML = '<svg viewBox="0 0 565 512" aria-hidden="true"><path fill="currentColor" d="M528.22,422.85l-37.53-230.4c-6.05-37.16-38.15-64.45-75.8-64.45h-4.65C410.24,57.31,352.93,0,282.24,0S154.24,57.31,154.24,128h-4.65c-37.65,0-69.75,27.29-75.8,64.45l-37.53,230.4c-7.61,46.73,28.46,89.15,75.8,89.15H452.42c47.34,0,83.42-42.42,75.8-89.15ZM282.24,51.2c42.42,0,76.8,34.38,76.8,76.8H205.44c0-42.42,34.38-76.8,76.8-76.8Zm170.18,409.6H112.05c-15.78,0-27.8-14.14-25.27-29.72l37.53-230.4c2.02-12.39,12.72-21.48,25.27-21.48h4.65v51.2h51.2v-51.2h153.6v51.2h51.2v-51.2h4.65c12.55,0,23.25,9.1,25.27,21.48l37.53,230.4c2.54,15.58-9.48,29.72-25.27,29.72Z"/></svg>';
            t.appendChild(mvNodo('h2', '', 'Tu carrito está vacío'));
            t.appendChild(mvNodo('p', '', 'Todavía no agregaste productos. Mirá lo último de Panthera y armá tu pedido.'));
            t.appendChild(boton('Ver productos →', '/todos-los-productos/'));
            f.insertBefore(t, f.firstChild);
            f.classList.add('pnt-vacio-on');
        }

        // 404: número gigante, mensaje y dos botones; abajo siguen los productos sugeridos de la tienda
        if (cl.contains('template-404') && !document.querySelector('.pnt-404')) {
            var cab = document.querySelector('.page-header');
            var b = mvNodo('section', 'pnt-404');
            var cc = mvNodo('div', 'pnt-404-in');
            cc.appendChild(mvNodo('span', 'pnt-404-num', '404'));
            cc.appendChild(mvNodo('h2', '', 'Esta página no existe'));
            cc.appendChild(mvNodo('p', '', 'Puede que el link esté mal escrito o que la página ya no esté. Volvé al inicio o mirá los productos.'));
            var bots = mvNodo('div', 'pnt-404-bot');
            bots.appendChild(boton('Volver al inicio', '/'));
            bots.appendChild(boton('Ver productos →', '/todos-los-productos/', true));
            cc.appendChild(bots);
            b.appendChild(cc);
            if (cab) { cab.parentNode.insertBefore(b, cab); }
            [].forEach.call(document.querySelectorAll('#page-error .js-item-product'), mvTarjeta);
        }

        // Páginas de texto: el título a la izquierda (fijo al bajar) y el texto a la derecha, sin el formato pegado del admin
        if (cl.contains('template-page') && /\/cuidados\/?$/.test(location.pathname) && acordeonPagina('Cuidado')) { return; }
        if (cl.contains('template-page') && /\/politica/.test(location.pathname) && acordeonPagina('Punto')) { return; }
        if (cl.contains('template-page') && !document.querySelector('.pnt-pag')) {
            var cab2 = document.querySelector('.page-header');
            var cont2 = document.querySelector('.user-content');
            var caja = cont2 && cont2.querySelector('.container');
            if (cab2 && caja) {
                caja.querySelectorAll('[style]').forEach(function (el) { el.removeAttribute('style'); });
                caja.querySelectorAll('p').forEach(function (p) {
                    if (!p.textContent.replace(/\u00a0/g, ' ').trim() && !p.querySelector('img,iframe,video')) { p.remove(); }
                });
                cont2.classList.add('pnt-pag');
                caja.insertBefore(cab2, caja.firstChild);
                if (fichas(caja)) { conFoto(caja, cab2, cont2); }
            }
        }
    }

    /* Barra de envío gratis del carrito (como la de BS23). El monto sale del texto de la barra de anuncios de la tienda
       ("Envío gratis a partir de $150.000"); si no lo encuentra, no se muestra. Se actualiza sola al cambiar el subtotal.
       (2026-11-15, pedido: "en el carrito me debe decir cuánto me falta para llegar al envío gratis, además de decirme cuál es el monto del
       envío gratis") Arriba, cuánto falta ("Te faltan $23.520 para tener envío gratis"; alcanzado: "¡Ya tenés envío gratis!") y abajo, el monto
       ("Envío gratis en compras desde $150.000"). Va en el carrito lateral (debajo de los productos) y, desde ese día, también en la PÁGINA del
       carrito, arriba del resumen (subtotal, total e "Iniciar compra"); antes estaba solo en el lateral. Con el carrito vacío no se ve. */
    function barraEnvio() {
        var tope = 0;
        var anuncios = document.querySelector('.js-adbar');
        var m = anuncios && /env[ií]o\s+gratis[^$]*\$\s*([\d.]+)/i.exec(anuncios.textContent.replace(/\s+/g, ' '));
        if (m) { tope = parseInt(m[1].replace(/\./g, ''), 10) || 0; }
        var lista = document.querySelector('.js-ajax-cart-list');
        var resumen = EN_PANEL ? null : document.querySelector('#cart-sticky-summary .cart-totals-container');
        if (!tope || !(EN_PANEL ? lista : resumen) || document.querySelector('.pnt-envio-gratis')) { return; }
        var caja = document.createElement('div');
        caja.className = 'pnt-envio-gratis';
        caja.setAttribute('aria-live', 'polite');   // los lectores de pantalla avisan cuando cambia lo que falta
        caja.innerHTML = '<p><span class="pnt-envio-txt"><b></b><small></small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="16.5" cy="17.5" r="1.7"/></svg></p><div class="pnt-envio-pista"><i></i></div>';
        if (EN_PANEL) { lista.parentNode.insertBefore(caja, lista.nextSibling); } else { resumen.parentNode.insertBefore(caja, resumen); }
        // "$150.000": los miles con punto, sin depender de toLocaleString (algunos celulares viejos no traen el formato de Argentina)
        var plata = function (n) { return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
        caja.querySelector('small').textContent = 'Envío gratis en compras desde ' + plata(tope);
        // (2026-11-12, "el carrito se traba") Solo escribe si algo cambió: escribir el mismo texto también es un cambio y, como el
        // vigilante miraba todo el carrito (barra incluida), se llamaba a sí mismo sin fin y congelaba la página al tocar + / −.
        function pintar() {
            var st = document.querySelector('.js-cart-subtotal');
            var sub = st ? parseFloat(st.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0 : 0;
            var falta = Math.max(0, Math.ceil(tope - sub));
            var estado = sub > 0 ? (falta ? 'falta-' + falta : 'listo') : 'vacio';
            if (caja.getAttribute('data-estado') !== estado) {
                caja.setAttribute('data-estado', estado);
                caja.hidden = estado === 'vacio';
                caja.classList.toggle('pnt-envio-listo', estado === 'listo');
                var titulo = caja.querySelector('b');
                titulo.textContent = '';
                if (falta) {
                    var monto = document.createElement('strong');
                    monto.textContent = plata(falta);
                    titulo.appendChild(document.createTextNode('Te faltan '));
                    titulo.appendChild(monto);
                    titulo.appendChild(document.createTextNode(' para tener envío gratis'));
                } else {
                    titulo.textContent = '¡Ya tenés envío gratis!';
                }
            }
            var ancho = Math.min(100, Math.round(sub / tope * 100)) + '%';
            var barra = caja.querySelector('i');
            if (barra.style.width !== ancho) { barra.style.width = ancho; }
        }
        pintar();
        var st0 = document.querySelector('.js-cart-subtotal');
        if (st0) {
            // se vigila solo el subtotal (Lima lo reescribe al cambiar cantidades); si Lima reemplaza el nodo, se vuelve a enganchar
            var vigila = function () {
                var st = document.querySelector('.js-cart-subtotal'); if (!st) { return; }
                obs.disconnect(); obs.observe(st, { childList: true, subtree: true, characterData: true });
                if (st.parentNode) { obs.observe(st.parentNode, { childList: true }); }
            };
            var obs = new MutationObserver(function () { pintar(); vigila(); });
            vigila();
        }
    }

    /* "Medios de envío" del carrito viene ABIERTO (pedido 2026-11-12). La tienda lo trae plegado y lo abre con su propio script, que se engancha un
       poco después de cargar: se toca el encabezado hasta que el contenido se ve (como máximo ~6 s). Si el cliente lo cierra después, queda cerrado. */
    function abrirEnvios() {
        var toggle = document.querySelector('#cart-shipping-container .js-accordion-toggle');
        var contenido = document.querySelector('#cart-shipping-container .js-accordion-content');
        if (!toggle || !contenido) { return; }
        var intentos = 0;
        var t = setInterval(function () {
            intentos++;
            if (contenido.offsetHeight > 0 || intentos > 15) { clearInterval(t); return; }
            toggle.click();
        }, 400);
    }

    /* ── 9. El logo en su dorado ─────────────────────────────────────────────
       El logo de la tienda es una imagen (dorado plano #E9CE91). Para que tenga el dorado nuevo
       (--pnt-dorado-logo: el de la paleta, más intenso desde el 2026-11-09, apenas acercado al original) se pinta
       con ese color usando la imagen como máscara (CSS en la sección 2 de marca.css). Acá solo se pasa la dirección
       de la imagen y se activa. */
    function logoDorado() {
        var logo = document.querySelector('.js-head-main .logo-img');
        var src = logo && (logo.getAttribute('src') || '');
        if (!src) { return; }
        src = src.indexOf('//') === 0 ? 'https:' + src : src.replace(/^http:/, 'https:');
        root.style.setProperty('--pnt-logo-src', 'url("' + src.replace(/"/g, '%22') + '")');
        root.classList.add('pnt-logo-dorado');
    }

    /* ── Hero con video de fondo (pedido 2026-11-12) ────────────────────────
       En el inicio, el video (static/panthera/hero/video-hero.mp4, Kling, sin sonido) reemplaza a las imágenes del slider de arriba.
       El slider original NO se borra: se oculta con una clase (html.pnt-hero-video) y vuelve sacándola. La dirección del video sale
       de la misma carpeta de este script. El video espera al póster y solo se reproduce mientras se ve. */
    function heroVideo() {
        var seccion = document.querySelector('.section-slider-home');
        if (!seccion || !document.body.classList.contains('template-home') || seccion.querySelector('.pnt-hero-v')) { return; }
        var sc = document.querySelector('script[src*="panthera/marca"]');
        if (!sc) { return; }
        var base = sc.src.replace(/marca\.js.*$/, '') + 'hero/';
        var caja = document.createElement('div');
        caja.className = 'pnt-hero-v';
        // (2026-11-14) En celular va una versión de 960×540 (~1 MB): el cartel se ve en una caja de ~450 px de ancho y decodificar el
        // 1920×1080 (3 MB) cada cuadro era de lo más pesado de la página
        var movilHero = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
        // (2026-11-15, pedido del usuario) en celular va OTRO video, vertical (el de Kling con aritos, collar, pulsera y anillos, 720×1200 sin la marca
        // de agua ni el audio, ~1 MB) con su propio póster
        caja.innerHTML = '<video muted loop playsinline preload="auto" poster="' + base + (movilHero ? 'video-hero-m.webp' : 'video-hero.webp') + '" aria-hidden="true">'
            + '<source src="' + base + (movilHero ? 'video-hero-m.mp4' : 'video-hero.mp4') + '" type="video/mp4"></video>';
        // Cartel del 5.º aniversario (pedido 2026-11-12): tarjeta de vidrio translúcida semiblanca, abajo a la izquierda del hero
        // (reemplaza al sello dorado giratorio, que no gustó). Para sacarlo, borrar este bloque.
        var cartel = document.createElement('div');
        cartel.className = 'pnt-hero-cartel';
        // Diseño 20 del artefacto "Cartel de vidrio 5.º aniversario" (elegido 2026-11-12) con el botón rosa "Ofertas", sin flecha:
        // baja a "No los dejes escapar" (las ofertas del inicio; la tienda no tiene una categoría de ofertas).
        // (2026-11-12) el 5 va una sola vez (el grande): el título dice solo "aniversario"; y la cinta rosa "Hasta 50% off" en la esquina, como en el artefacto
        cartel.innerHTML = '<span class="pnt-hero-cartel-cinta" aria-hidden="true">Hasta <b>50%</b> off</span>'
            + '<span class="pnt-hero-cartel-n" aria-hidden="true">5<em>años</em></span>'
            + '<span class="pnt-hero-cartel-t"><small>Panthera</small><b>Aniversario</b><i>Gracias por estos cinco años</i>'
            + '<span class="pnt-hero-cartel-of"><span class="pnt-hero-cartel-btncaja"><a class="pnt-hero-cartel-btn" href="' + PNT_OFERTAS.url + '">Ver ofertas</a></span>'
            // "Hasta 50% off" rediseñado (pedido 2026-11-12): dos renglones, "HASTA" chiquito arriba y "50% OFF" grande, con una línea fina que lo separa del botón
            + '</span></span>';   // (2026-11-12) el "Hasta 50% off" de al lado del botón se pasó a la cinta de la esquina
        // (2026-11-12) "Ofertas" lleva a la página de Ofertas (sección "Página de Ofertas" al final de este archivo), ya no baja al carrusel
        caja.appendChild(cartel);
        var oscuro = document.createElement('div');
        oscuro.className = 'pnt-hero-oscuro';
        oscuro.setAttribute('aria-hidden', 'true');
        caja.appendChild(oscuro);
        seccion.insertBefore(caja, seccion.firstChild);
        document.documentElement.classList.add('pnt-hero-video');
        // Parallax + oscurecido al scrollear (pedido 2026-11-12): el video baja más lento que la página y se oscurece
        // hasta que la sección siguiente lo tapa. p va de 0 (arriba) a 1 (una altura del hero scrolleada).
        var vid = caja.querySelector('video');
        var pendiente = false, tapado = false;
        var altoGuardado = 0;       // (2026-11-14) caja.offsetHeight en cada cuadro de scroll forzaba el diseño: se guarda y se mide de nuevo al cambiar el tamaño / cargar
        function parallax() {
            pendiente = false;
            // (2026-11-15, pedido del usuario) en celular el hero NO tiene parallax (ni video que se mueve, ni oscurecido, ni cartel que sube), pero SÍ queda
            // fijo detrás y la sección de abajo sube tapándolo, como en BS23 (pedido del mismo día: "tanto en mobile como en desktop"). Acá solo se mide cuánto se tapó.
            var alto = altoGuardado || (altoGuardado = caja.offsetHeight || 1);
            var p = Math.min(Math.max((window.pageYOffset || 0) / alto, 0), 1);
            // (2026-11-15, "no está tan claro que la segunda sección sube por encima del hero") el video queda QUIETO: si se movía hacia arriba (parallax)
            // parecía un scroll común. La sección que sube lleva esquinas redondeadas y sombra (paginas.css) y el hero se oscurece debajo.
            // (antes: vid.style.transform = 'translate3d(0,' + (-p * 25).toFixed(2) + '%,0)';)
            if (!movilHero) { oscuro.style.opacity = (p * 0.95).toFixed(3); }
            if ((p >= 0.98) !== tapado) {
                tapado = p >= 0.98; caja.classList.toggle('pnt-hero-tapado', tapado);   // tapado por la página: el cartel deja de flotar
                // (2026-11-15) y el video se frena: como el hero es sticky, para el IntersectionObserver siempre "se ve" y seguía andando detrás de toda la página
                if (tapado) { vid.pause(); } else if (v) { actualizaVideo(); }
            }
            // el cartel del aniversario sube un poco al scrollear, más rápido que el video (parallax, pedido 2026-11-12).
            // Va en "translate" (no en "transform") para no pisar la animación de flotar.
            // el cartel tampoco se mueve: la sección que sube lo tapa de abajo hacia arriba (antes subía más rápido que la página)
        }
        window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(parallax); } }, { passive: true });
        window.addEventListener('resize', function () { altoGuardado = 0; parallax(); });
        window.addEventListener('load', function () { altoGuardado = 0; setTimeout(function () { altoGuardado = 0; }, 1500); });
        parallax();
        // El alto del hero se mide: lo que queda de pantalla desde donde empieza (bajo la barra rosa), sin pasar de la proporción 16:9 del video.
        // (Con un cálculo en CSS quedaba una franja de la sección de abajo; midiendo, el video llena justo lo que se ve.)
        function ajustaAlto() {
            // El hero es sticky: si se mide estando más abajo (llega "load" o un resize después de scrollear), su rect queda pegado
            // arriba y daba un "arriba" de miles de px → el hero se achicaba a la mitad (pedido 2026-11-12: "se ve recortado al volver
            // a subir"). Se mide sin el sticky un instante: su lugar real en la página.
            var posAntes = seccion.style.position;
            seccion.style.position = 'relative';
            var arriba = caja.getBoundingClientRect().top + (window.pageYOffset || 0);
            seccion.style.position = posAntes;
            var h = Math.min(caja.clientWidth * 9 / 16, window.innerHeight - arriba);
            // Nunca más baja que la tarjeta del aniversario + la navbar (120 px) + aire: en ventanas bajas la tarjeta se montaba sobre la navbar (2026-11-12)
            var minimo = cartel ? cartel.offsetHeight + 190 : 320;
            caja.style.height = Math.max(320, minimo, Math.round(h)) + 'px';
            // (2026-11-15, como BS23) en ventanas más bajas que el hero, el hero se pega un poco más arriba: así se ve entero (con el cartel) antes de que lo tapen.
            // En celular no: su alto es a propósito más alto que la pantalla (la barra de Safari) y el cartel ya está ubicado para eso.
            seccion.style.top = window.innerWidth >= 768 ? Math.min(0, Math.round(window.innerHeight - seccion.offsetHeight)) + 'px' : '';
            altoGuardado = 0;
        }
        ajustaAlto();
        window.__pntAjustaHero = ajustaAlto;      // iniciar() lo vuelve a llamar apenas el menú queda fijo (antes se medía con el menú de Lima todavía en el flujo y el hero quedaba ~200 px más bajo)
        window.addEventListener('resize', ajustaAlto);
        window.addEventListener('load', ajustaAlto);
        var v = caja.querySelector('video');
        v.muted = true;
        v.defaultPlaybackRate = 1.06;
        v.playbackRate = 1.06;
        v.addEventListener('loadedmetadata', function () { v.playbackRate = 1.06; });
        // El video NO arranca hasta que termina la intro cinematográfica (pedido 2026-11-12): mientras el velo #pnt-intro está
        // en pantalla queda quieto en el póster; arranca cuando el velo se va (marca.js lo quita al terminar su fundido).
        // Arranca justo cuando la intro termina su parte cinematográfica y el velo empieza a aclararse (clase is-saliendo): así
        // no hay un hueco con el video quieto después de la intro (antes tardaba medio segundo). Para que arranque al instante, el video se
        // baja completo de antemano (preload="auto") y se decodifica el primer cuadro mientras la intro está en pantalla.
        var visible = true;
        var velo = document.getElementById('pnt-intro');
        function introTermino() { return !velo || !velo.isConnected || velo.classList.contains('is-saliendo'); }
        function actualizaVideo() {
            if (visible && !tapado && introTermino()) { v.play().catch(function () {}); } else if (!visible || tapado) { v.pause(); }
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (e) { visible = e[0].isIntersecting; actualizaVideo(); }, { threshold: 0.1 }).observe(caja);
        }
        if (velo && !introTermino()) {
            var mo = new MutationObserver(function () { if (introTermino()) { mo.disconnect(); actualizaVideo(); } });
            mo.observe(velo, { attributes: true, attributeFilter: ['class'] });
            mo.observe(document.body, { childList: true });
        }
        actualizaVideo();
    }

    function iniciar() {
        if (EN_PANEL) {
            // En el panel del carrito solo hace falta el carrito vacío rediseñado y que los links salgan del marco
            var base = document.createElement('base');
            base.target = '_top';
            document.head.appendChild(base);
            paginas();
            barraEnvio();
            abrirEnvios();
            return;
        }
        logoDorado();
        heroVideo();
        intro();
        bannersInicio();
        masElegidos();
        listados();
        paginas();
        if (document.body.classList.contains('template-cart')) { abrirEnvios(); barraEnvio(); }   // barraEnvio en la página del carrito: 2026-11-15
        franja();
        navbar();
        if (window.__pntAjustaHero) { window.__pntAjustaHero(); }
        pie();
        redes();
        whatsapp();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();

/* ── 10. Menú y buscador como BS23 (pedidos 2026-11-12, ítems 47, 48 y 49 de PENDIENTES.md) ──────────────
   - Menú: "CREALO VOS MISMA" en minúsculas y "Collares" de /collares1/ (categoría duplicada: los mismos productos
     que /collares/) lleva a /collares/; si en la misma lista ya está "Collares y Colgantes", se saca el repetido.
     Es un parche visual: lo correcto es cambiarlo en el admin (Tienda online → Menús) al publicar.
   - Buscador: accesos "Explorá" con las categorías del menú, cuotas en otro renglón y fotos nítidas en las sugerencias.
   El diseño está en marca.css, sección 12. */
(function () {
    'use strict';

    function cambiaTexto(a, de, a2) {
        a.childNodes.forEach(function (n) {
            if (n.nodeType === 3 && de.test(n.textContent)) { n.textContent = n.textContent.replace(de, a2); }
        });
    }

    function arreglaMenu() {
        document.querySelectorAll('a').forEach(function (a) {
            if (/^\s*CREALO VOS MISMA\s*$/.test(a.textContent)) { cambiaTexto(a, /CREALO VOS MISMA/, 'Crealo vos misma'); }
        });
        document.querySelectorAll('a[href*="/collares1/"]').forEach(function (a) {
            var li = a.closest('li');
            var lista = li && li.parentElement;
            // (2026-11-13) en el submenú el link no es hijo directo del <li> (va dentro de otra caja): se mira el primer link de cada <li> hermano
            var otro = lista && Array.prototype.some.call(lista.children, function (li2) {
                var b = li2 !== li && li2.querySelector('a[href]');
                return b && b !== a && /\/collares\/?(\?|#|$)/.test(b.getAttribute('href'));   // los links ya pueden llevar ?sort_by=…
            });
            if (otro) { li.remove(); } else { a.setAttribute('href', a.getAttribute('href').replace('/collares1/', '/collares/')); }
        });
    }

    // Categorías de primer nivel del menú (las que tienen submenú usan su "Ver todo en…"). Las usan "Explorá" y la búsqueda sin resultados
    function categoriasDelMenu() {
        var menu = document.querySelector('#nav-hamburger .nav-primary > .nav-list');
        var links = [];
        if (!menu) { return links; }
        menu.querySelectorAll(':scope > li').forEach(function (li) {
            var a = li.querySelector(':scope > a.nav-list-link');
            if (!a) { return; }
            var t = '';
            a.childNodes.forEach(function (n) { if (n.nodeType === 3) { t += n.textContent; } });
            t = t.replace(/\s+/g, ' ').trim();
            var href = a.getAttribute('href');
            if (!href || href === '#') {
                var todo = li.querySelector('.nav-list-panel > li:first-of-type > a[href]');
                href = todo && todo.getAttribute('href');
            }
            if (!t || !href || href === '#' || /^(todos los productos|cuidados)$/i.test(t)) { return; }
            links.push({ t: t, href: href });
        });
        return links;
    }
    window.__pntCategorias = categoriasDelMenu;

    // Accesos "Explorá" del buscador
    function explora() {
        var cuerpo = document.querySelector('#nav-search .modal-body');
        if (!cuerpo || cuerpo.querySelector('.pnt-explora')) { return; }
        var links = categoriasDelMenu();
        if (!links.length) { return; }
        var bloque = document.createElement('div');
        bloque.className = 'pnt-explora';
        bloque.innerHTML = '<h3>Explorá</h3><div class="pnt-explora-chips"></div>';
        var chips = bloque.querySelector('.pnt-explora-chips');
        links.slice(0, 9).forEach(function (l) {
            var a = document.createElement('a');
            a.href = l.href;
            a.textContent = l.t;
            chips.appendChild(a);
        });
        cuerpo.appendChild(bloque);
    }

    // Sugerencias: foto de 480 px (la tienda manda la "tiny") y las cuotas sin la barra "|", en su renglón
    function nitida(img) {
        ['src', 'data-src', 'srcset', 'data-srcset'].forEach(function (at) {
            var v = img.getAttribute(at);
            if (!v) { return; }
            var n = v.replace(/-(\d+)-(\d+)\.(webp|jpe?g|png)/gi, function (m, w, h, ext) { return parseInt(w, 10) < 480 ? '-480-0.' + ext : m; });
            if (n !== v) { img.setAttribute(at, n); }
        });
    }
    function sugerencias() {
        document.querySelectorAll('.search-suggest-image:not([data-pnt])').forEach(function (img) { img.setAttribute('data-pnt', '1'); nitida(img); });
        document.querySelectorAll('.search-suggest-text > p:not(.search-suggest-name) > span:not([data-pnt])').forEach(function (s) {
            s.setAttribute('data-pnt', '1');
            s.classList.add('pnt-sug-cuotas');
            cambiaTexto(s, /^\s*\|\s*/, '');
        });
        // (2026-11-13) precios sin ",00", como en las tarjetas y la ficha
        document.querySelectorAll('.search-suggest-text > p:not(.search-suggest-name):not([data-pnt-pr])').forEach(function (pr) {
            pr.setAttribute('data-pnt-pr', '1');
            var w = document.createTreeWalker(pr, NodeFilter.SHOW_TEXT), n;
            while ((n = w.nextNode())) { if (/\$\s?[\d.]+,00\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/(\$\s?[\d.]+),00\b/g, '$1'); } }
        });
        var panel = document.getElementById('nav-search');
        if (panel) { panel.classList.toggle('pnt-con-resultados', !!panel.querySelector('.search-suggest-item')); }
    }

    function iniciar() {
        arreglaMenu();
        explora();
        var t;
        var mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(sugerencias, 40); });
        document.querySelectorAll('.js-search-suggest').forEach(function (c) { mo.observe(c, { childList: true, subtree: true }); });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})();


/* ── 11. "Ordenar" y "Filtrar" como BS23 (pedido 2026-11-12, ítem 50 de PENDIENTES.md) ─────────────────────
   Dos píldoras arriba a la derecha de los listados: "Ordenar: Más vendidos ⌄" (desplegable propio con íconos) y "Filtrar" (abre el
   panel de filtros de la tienda). El orden lo sigue haciendo la tienda: el desplegable toca los mismos enlaces del "Ordenar" de Lima
   (#sort-by, .js-apply-sort), que queda escondido pero en su lugar. Diseño en marca.css, sección 13. */
(function () {
    'use strict';
    var cl = document.body.classList;
    if (!cl.contains('template-category') && !cl.contains('template-search')) { return; }
    function listos() { cl.add('pnt-controles-listos'); }   // marca.css (sección 18) esconde los controles de Lima hasta este momento
    setTimeout(listos, 8000);   // red de seguridad: si algo falla, los controles de Lima se muestran igual
    var ctrl = document.querySelector('.js-category-controls');
    if (!ctrl || ctrl.querySelector('.pnt-controles')) { listos(); return; }
    // sin productos (categoría vacía o búsqueda sin resultados) no tiene sentido ordenar ni filtrar
    if (!document.querySelector('.js-product-table .js-item-product')) { listos(); return; }
    var btnF = ctrl.querySelector('[data-toggle="#nav-filters"]');
    var enlaces = [].slice.call(document.querySelectorAll('#sort-by .js-apply-sort'));
    if (!btnF && !enlaces.length) { listos(); return; }

    var ICON = {
        estrella: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.6l-5.1 2.6 1-5.6-4.1-4 5.7-.8L12 3.6z"/>',
        arriba: '<path d="M12 19V5M6 11l6-6 6 6"/>',
        abajo: '<path d="M12 5v14M6 13l6 6 6-6"/>',
        lineas: '<path d="M4 7h16M4 12h11M4 17h6"/>',
        check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
        chevron: '<path d="M6 9l6 6 6-6"/>',
        filtro: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
    };
    function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }
    var OPCIONES = [
        ['created-descending', 'Novedades', 'estrella'],
        ['best-selling', 'Más vendidos', 'arriba'],
        ['price-ascending', 'Menor precio', 'abajo'],
        ['price-descending', 'Mayor precio', 'arriba'],
        ['alpha-ascending', 'A – Z', 'lineas'],
        ['alpha-descending', 'Z – A', 'lineas']
    ];

    var wrap = document.createElement('div');
    wrap.className = 'pnt-controles';

    if (enlaces.length) {
        var enlace = {};
        enlaces.forEach(function (a) { enlace[a.getAttribute('data-sort-value')] = a; });
        var lista = OPCIONES.filter(function (o) { return enlace[o[0]]; });
        var actual = new URLSearchParams(location.search).get('sort_by') || 'created-descending';   // Novedades: el orden por defecto (ver el comienzo de este archivo)
        var orden = document.createElement('div');
        orden.className = 'pnt-orden';
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'pnt-pildora pnt-orden-btn';
        boton.setAttribute('aria-haspopup', 'listbox');
        boton.setAttribute('aria-expanded', 'false');
        var etq = lista.filter(function (o) { return o[0] === actual; })[0];
        boton.innerHTML = '<span><span class="pnt-orden-pre">Ordenar' + (etq ? ': ' : '') + '</span>' + (etq ? '<b>' + etq[1] + '</b>' : '') + '</span>' + svg('chevron');
        var menu = document.createElement('ul');
        menu.className = 'pnt-orden-menu';
        menu.setAttribute('role', 'listbox');
        menu.setAttribute('aria-label', 'Ordenar por');
        function cerrar() { orden.classList.remove('is-abierto'); document.documentElement.classList.remove('pnt-orden-abierto'); boton.setAttribute('aria-expanded', 'false'); }
        lista.forEach(function (o) {
            var li = document.createElement('li');
            var b = document.createElement('button');
            var activa = o[0] === actual;
            b.type = 'button';
            b.setAttribute('role', 'option');
            b.setAttribute('aria-selected', activa ? 'true' : 'false');
            b.className = 'pnt-orden-op' + (activa ? ' is-activa' : '');
            b.innerHTML = svg(o[2]) + '<span>' + o[1] + '</span>' + (activa ? svg('check') : '');
            b.addEventListener('click', function () {
                cerrar();
                if (!activa) {
                    // se va directo a la dirección con el orden (así no depende del código de la tienda, que tira "applySortBy is not defined": pasa también en la tienda publicada)
                    var q = new URLSearchParams(location.search); q.set('sort_by', o[0]); q.delete('page');
                    location.href = location.pathname + '?' + q.toString();
                }
            });
            li.appendChild(b);
            menu.appendChild(li);
        });
        boton.addEventListener('click', function (e) {
            e.stopPropagation();
            var abierto = orden.classList.toggle('is-abierto');
            document.documentElement.classList.toggle('pnt-orden-abierto', abierto);      // (2026-11-15) reemplaza a body:has(.pnt-orden.is-abierto)
            boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });
        document.addEventListener('click', function (e) { if (!orden.contains(e.target)) { cerrar(); } });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cerrar(); } });
        orden.appendChild(boton);
        orden.appendChild(menu);
        wrap.appendChild(orden);
    }

    if (btnF) {
        btnF.classList.add('pnt-pildora', 'pnt-filtrar-btn');
        btnF.innerHTML = svg('filtro') + '<span>Filtrar</span>';
        wrap.appendChild(btnF);
    }

    var fila = ctrl.querySelector('.category-controls-row') || ctrl.querySelector('.row') || ctrl;
    var col = document.createElement('div');
    col.className = 'pnt-controles-col';
    col.appendChild(wrap);
    fila.appendChild(col);
    document.body.classList.add('pnt-con-controles');
    listos();
})();


/* ── 12. Carrito lateral, como BS23 (pedido 2026-11-12) ──────────────────────────────────────────────────────
   Al tocar el carrito de arriba o al agregar un producto, el carrito se abre en un panel a la derecha en vez de llevar a /comprar/.
   Esta tienda tiene apagada la opción "Carrito de compras rápidas" del admin, así que el panel es propio: un marco con la página
   /comprar/?pnt-panel=1 (marca.css sección 16 le saca el header y el pie), que reusa todo el carrito real (cantidades, quitar, envío,
   "Iniciar compra"). Si la tienda activa su carrito lateral (#modal-cart), este panel no se usa. */
(function () {
    'use strict';
    if (window.self !== window.top) { return; }
    if (document.body.classList.contains('template-cart') || document.getElementById('modal-cart')) { return; }
    var root = document.documentElement;
    var panel = null, marco = null, abierto = false;

    function sincroniza() {
        // El número de la bolsa de arriba se pone al día con lo que dice el carrito
        try {
            var n = marco.contentDocument.querySelector('.js-cart-widget-amount');
            if (n) { [].forEach.call(document.querySelectorAll('.js-cart-widget-amount'), function (x) { x.textContent = n.textContent; }); }
        } catch (e) { /* otro origen: no pasa */ }
    }
    function armar() {
        if (panel) { return; }
        panel = document.createElement('div');
        panel.className = 'pnt-cp';
        panel.setAttribute('data-lenis-prevent', '');
        panel.innerHTML = '<div class="pnt-cp-velo"></div>' +
            '<aside class="pnt-cp-panel" role="dialog" aria-modal="true" aria-label="Carrito">' +
            '<div class="pnt-cp-cab"><span>Carrito de compras</span><button type="button" class="pnt-cp-cerrar" aria-label="Cerrar el carrito"></button></div>' +
            '<div class="pnt-cp-cuerpo"><iframe class="pnt-cp-marco" title="Carrito"></iframe><span class="pnt-cp-carga" aria-hidden="true"></span><p class="pnt-cp-lento">El carrito está tardando en cargar. <a href="/comprar/">Ver el carrito completo →</a></p></div>' +
            '</aside>';
        document.body.appendChild(panel);
        marco = panel.querySelector('iframe');
        panel.querySelector('.pnt-cp-velo').addEventListener('click', cerrar);
        panel.querySelector('.pnt-cp-cerrar').addEventListener('click', cerrar);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && abierto) { cerrar(); } });
        marco.addEventListener('load', function () { mostrar(); sincroniza(); });
    }
    // El panel se muestra apenas el carrito del marco está armado, sin esperar al evento "load" (que espera también a los scripts de
    // terceros: si uno tarda, el círculo giraba para siempre). Si nada aparece en 6 s, se muestra igual.
    var espera = null;
    function mostrar() {
        clearInterval(espera);
        if (panel) { panel.classList.remove('is-cargando', 'is-lento'); }
        sincroniza();
    }
    function vigilar() {
        clearInterval(espera);
        var inicio = Date.now();
        espera = setInterval(function () {
            var listo = false;
            try {
                var d = marco.contentDocument;
                if (d && d.location && /pnt-panel=1/.test(d.location.search) && d.documentElement) {
                    // el modo "solo carrito" se pone desde afuera, apenas existe el documento: no hace falta esperar a marca.js del marco
                    d.documentElement.classList.add('pnt-en-panel');
                    // el carrito ya está en el documento Y es visible: la tienda lo esconde (visibility:hidden) hasta que carga su hoja de
                    // estilos secundaria; si el panel se mostrara antes, saldría en blanco
                    var oculto = d.querySelector('#shoppingCartPage .visible-when-content-ready');
                    listo = !!d.querySelector('#cart-sticky-summary, .alert-info') && (!oculto || d.defaultView.getComputedStyle(oculto).visibility !== 'hidden');
                }
            } catch (e) { listo = true; }
            if (Date.now() - inicio > 4000 && panel) { panel.classList.add('is-lento'); }   // sale el aviso con el link al carrito completo
            if (!listo && Date.now() - inicio > 12000) {
                // última red de seguridad: se fuerza a mostrar el contenido aunque la hoja secundaria de la tienda no haya llegado
                try { marco.contentDocument.documentElement.classList.add('pnt-forzado'); } catch (e) { /* nada */ }
                listo = true;
            }
            if (listo) { mostrar(); }
        }, 100);
    }
    function abrir() {
        armar();
        panel.classList.remove('is-lento');
        panel.classList.add('is-cargando');
        marco.src = '/comprar/?pnt-panel=1&_=' + Date.now();
        vigilar();
        void panel.offsetWidth;
        panel.classList.add('is-abierto');
        abierto = true;
        root.classList.add('pnt-cp-abierto');
    }
    function cerrar() {
        if (!panel) { return; }
        panel.classList.remove('is-abierto');
        abierto = false;
        root.classList.remove('pnt-cp-abierto');
    }
    window.pntCarrito = { abrir: abrir, cerrar: cerrar };

    // 1) La bolsa de arriba (y cualquier link al carrito dentro del header)
    document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href]') : null;
        if (!a || !a.closest('.js-head-main, .cart-summary')) { return; }
        if (!/\/comprar\/?(\?|$)/.test(a.getAttribute('href') || '')) { return; }
        e.preventDefault();
        abrir();
    }, true);

    // 2) Agregar al carrito (tarjetas, compra rápida, ficha): se agrega sin salir de la página y se abre el panel.
    //    Lima deja que el formulario siga hasta /comprar/; acá se frena ese salto. Si algo falla (sin stock, sin conexión), se deja ir como antes.
    function restaurar(f) {
        var boton = f.querySelector('.js-addtocart:not(.js-addtocart-placeholder)');
        var ph = f.querySelector('.js-addtocart-placeholder');
        var ad = f.querySelector('.js-addtocart-adding');
        var tx = f.querySelector('.js-addtocart-text');
        if (ad) { ad.classList.remove('active'); }
        if (tx) { tx.style.display = ''; tx.style.opacity = ''; }
        if (ph) { ph.removeAttribute('style'); ph.style.display = 'none'; }
        if (boton) { boton.style.display = ''; }
    }
    document.addEventListener('submit', function (e) {
        var f = e.target;
        if (!f || f.tagName !== 'FORM' || e.defaultPrevented) { return; }
        if (!/\/comprar\/?$/.test(f.getAttribute('action') || '') || !f.querySelector('[name="add_to_cart"]')) { return; }
        e.preventDefault();
        var fd = new FormData(f);
        fd.set('add_to_cart_enhanced', '1');
        var irSinPanel = function () { restaurar(f); HTMLFormElement.prototype.submit.call(f); };
        fetch(f.getAttribute('action'), { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(function (r) { return r.json().catch(function () { return null; }); })
            .then(function (j) {
                if (j && j.success === false) { irSinPanel(); return; }
                restaurar(f);
                abrir();
            })
            .catch(irSinPanel);
    });
})();


/* ── 13. Entradas tipo Apple en el inicio (pedido 2026-11-12: "animaciones tipo Apple a todo el inicio y que todo vaya
   cargando/apareciendo de forma escalonada"). Estilos: marca.css sección 18.
   - Al cargar: la navbar baja pieza por pieza y el texto del cartel del aniversario sube línea por línea (html.pnt-ap-carga).
   - Al bajar: cada sección, cuando entra en pantalla, muestra sus piezas de a una (título primero, después tarjetas de izquierda
     a derecha), cada una 90 ms después de la anterior. Las tarjetas fuera de pantalla (carruseles) no esperan.
   - Al terminar se sacan las clases: las piezas quedan exactamente como antes (sin filtros ni escalas encima).
   - Los banners de categorías ya tienen su cortina (sección 7); solo se suman acá si la cortina no corre. ── */
(function () {
    'use strict';
    var root = document.documentElement;
    var PASO = 90, TOPE = 900;
    // La entrada de la navbar se pide ya (antes del primer cuadro) para que no se vea un instante quieta y después anime
    var ES_INICIO = !!document.querySelector('[data-store="home-slider"]');
    if (ES_INICIO) { root.classList.add('pnt-ap-carga'); setTimeout(function () { root.classList.remove('pnt-ap-carga'); }, 3500); }

    // Qué se anima de cada sección, en orden. 'liso' = sin escala ni desenfoque (los armadores 3D: no tocar su lienzo).
    var PIEZAS = [
        // (2026-11-15) los banners de categorías (Disney, Aritos, Pulseras, Charms) ya no tienen animación de entrada
        ['.js-section-products-featured, .js-section-products-sale', ['.pnt-mv-cont > .row:first-child > *', '.pnt-mv-card']],
        ['.pnt-di', ['.pnt-di-lista > li']],
        ['.pnt-a3', ['liso:.pnt-a3-host, .pnt-or-host']],
        ['.pnt-cu', ['.pnt-cu-grid > *:not(:has(.pnt-rv)):not(.pnt-rv)']],
        ['.pnt-co', ['.pnt-co-fila > *:not(:has(.pnt-rv)):not(.pnt-rv)']],
        ['.pnt-redes', ['.pnt-rh-texto > *', '.pnt-rh-panel > *:not(.pnt-rh-texto)']],
        ['footer.pnt-pie', ['.container > .row.mb-4 > *', '.footer-legal .row > *']]
    ];

    function preparar(sec, sels) {
        var lista = [];
        sels.forEach(function (s) {
            var liso = s.indexOf('liso:') === 0;
            if (liso) { s = s.slice(5); }
            Array.prototype.forEach.call(sec.querySelectorAll(s), function (el) {
                if (el.closest('.pnt-rv')) { return; }   // ya entra con su .pnt-rv
                if (lista.some(function (o) { return o.el === el || o.el.contains(el) || el.contains(o.el); })) { return; }
                lista.push({ el: el, liso: liso });
            });
        });
        lista.forEach(function (o) { o.el.classList.add('pnt-ap-el'); if (o.liso) { o.el.classList.add('pnt-ap-liso'); } });
        if (lista.length) { sec.classList.add('pnt-ap-sec'); }
        return lista;
    }

    // Se vuelve a buscar en la sección: los carruseles clonan tarjetas (con la marca puesta) después de prepararlas
    function marcadas(sec) {
        return Array.prototype.map.call(sec.querySelectorAll('.pnt-ap-el'), function (el) { return { el: el }; });
    }

    function mostrar(sec) {
        var lista = marcadas(sec);
        var ancho = window.innerWidth, n = 0, fin = 0;
        // (2026-11-14) se leen TODAS las medidas juntas y recién después se escribe: antes cada elemento leía (forzando el diseño de todo lo
        // pendiente) justo después de que el anterior había escrito su --pnt-ap-d; en secciones con 30 tarjetas eran 30 diseños completos
        var rects = lista.map(function (o) { return o.el.getBoundingClientRect(); });
        lista.forEach(function (o, i) {
            var r = rects[i];
            var aLaVista = r.right > 0 && r.left < ancho && r.width > 0;
            var d = aLaVista ? Math.min(n++ * PASO, TOPE) : 0;
            o.el.style.setProperty('--pnt-ap-d', d + 'ms');
            fin = Math.max(fin, d);
        });
        requestAnimationFrame(function () { sec.classList.add('pnt-ap-vista'); });
        setTimeout(function () {
            marcadas(sec).forEach(function (o) { o.el.classList.remove('pnt-ap-el', 'pnt-ap-liso'); o.el.style.removeProperty('--pnt-ap-d'); });
        }, fin + 1500);
    }

    function iniciar() {
        if (!document.querySelector('[data-store="home-slider"]') || !('IntersectionObserver' in window)) { return; }
        root.classList.add('pnt-ap');
        PIEZAS.forEach(function (p) {
            Array.prototype.forEach.call(document.querySelectorAll(p[0]), function (sec) {
                var lista = preparar(sec, p[1]);
                if (!lista.length) { return; }
                var io = new IntersectionObserver(function (es) {
                    if (!es.some(function (e) { return e.isIntersecting; })) { return; }
                    io.disconnect();
                    mostrar(sec);
                }, { rootMargin: '0px 0px 18% 0px', threshold: 0 }); /* (2026-11-14, pedido: "scrolleo y se ve todo blanco hasta que van apareciendo") la entrada arranca un poco ANTES de que la sección asome (antes esperaba a que estuviera 6-12 % adentro: al bajar rápido se veía el hueco blanco) */
                io.observe(sec);
            });
        });
    }

    // Después de que las otras secciones de marca.js y secciones.js armaron su HTML
    function arrancar() { setTimeout(iniciar, 0); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})();

/* ── 13. Sin compra rápida (pedido 2026-11-12) ───────────────────────────────────────────────────────────
   Las tarjetas con talles o variantes abrían una ventana de "compra rápida". Ahora su bolsita lleva directo a la ficha del producto, donde se
   elige el talle. Las tarjetas de productos simples siguen agregando al carrito (que abre el panel lateral). Se frena el clic antes de que lo
   tome la tienda. Al publicar conviene apagar la opción en el admin (Diseño → "Compra rápida") y esto queda de respaldo. */
document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a.js-quickshop-modal-open') : null;
    if (!a) { return; }
    var tarjeta = a.closest('.js-item-product');
    var enlace = tarjeta && tarjeta.querySelector('.item-link[href], a.js-item-link[href], .item-description a[href]');
    if (!enlace) { return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    window.location.href = enlace.getAttribute('href');
}, true);


/* ── 14. Ficha de producto como la de BS23 (pedido 2026-11-12, ítems 51 y 52 de PENDIENTES.md) ─────────────────────────
   Lo que no se puede con solo CSS:
   - Reseñas: la sección .pnt-res sale de snipplets/panthera/resenas.tpl (reseñas reales cargadas en el admin). En la vista previa local
     (localhost) no hay ninguna cargada y se arman reseñas DE MUESTRA para ver el diseño; en la tienda publicada NO se inventa nada.
     Acá se calculan el promedio y las flechas, y el puntaje con estrellas debajo del nombre.
   - Descripción: el texto de cada producto viene con estilos y colores propios del admin. Se reordena en dos columnas (descripción + ficha
     técnica | sobre Panthera) con los estilos de la marca. Se sacan los separadores ✦, el bloque "Miranos en Instagram" (íconos de video
     falsos) y "Cuidá tus joyas" (lo cubre la sección nueva). El texto original queda en la página, escondido.
   - "Envío gratis superando $X" debajo del precio (el monto sale de la barra de anuncios) y el "-20%" dentro del bloque de precio.
   - El título de los relacionados pasa a "Te va a interesar" y sus tarjetas son las de los listados. */
(function () {
    'use strict';
    if (!document.body.classList.contains('template-product') || (window.self !== window.top)) { return; }

    var MUESTRA = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    // Reseñas DE MUESTRA (solo en localhost, ver MUESTRA): escritas como las escribe la gente acá, en rioplatense, con largos y tonos
    // distintos (pedido 2026-11-12: "más reales, en español rioplatense"). En la tienda real se muestran las reseñas de verdad.
    var TEXTOS = [
        [5, 'Me encantó!! Es más linda en persona que en las fotos. Ya la estoy usando todos los días'],
        [5, 'Se la regalé a mi novia para el aniversario y quedó chocha. Vino en una cajita re linda, no hizo falta envolverla.'],
        [4, 'Muy linda, buena calidad. Le saco una estrella porque el envío tardó un par de días más de lo que decía, pero llegó perfecta.'],
        [5, 'Es la segunda vez que les compro y nada que decir. Súper atentos por WhatsApp, me ayudaron a elegir el talle.'],
        [5, 'Hermosaaa 😍'],
        [5, 'La compré en el local del shopping y después volví por otra. Las chicas re buena onda.'],
        [5, 'Tenía miedo de que fuera chiquita pero es justo como en la foto. La uso con las otras y queda divina.'],
        [4, 'Linda y prolija. Yo la hubiese querido un toque más grande, pero eso es gusto mío. La recomiendo igual.'],
        [5, 'Pagué con transferencia, con el descuento sale re bien. Me llegó a Monte Hermoso en 3 días.'],
        [5, 'Me la regalaron para mi cumple y no me la saco más. Ya le pasé la página a todas mis amigas jaja'],
        [5, 'Re conforme con la compra. Bien empaquetado, con la bolsita para guardarla y una notita escrita a mano 💕'],
        [5, 'excelente calidad, ni se nota que la uso hace meses. la limpio con el paño como dicen y queda como nueva'],
        [4, 'Muy bonita. Al principio no me convencía el tamaño pero ya me acostumbré y me encanta.'],
        [5, 'Compré para mí y para mi hermana, las dos re contentas. Llegó todo bien y rápido a Bahía.'],
        [5, 'Divina, tal cual la foto. Me respondieron todas las dudas al toque antes de comprar.'],
        [5, 'Ya perdí la cuenta de cuántas cosas les compré 🙈 nunca me fallaron.'],
        [5, 'La quería hace un montón y la agarré en oferta. Lo mejor que hice, brilla un montón.'],
        [4, 'Está buenísima, solo que el cierre al principio cuesta un poco. Después le agarrás la mano.'],
        [5, 'Primera compra online y re bien. Tenía mis dudas pero me llegó todo perfecto y con seguimiento.'],
        [5, 'Un regalo hermoso para el día de la madre. Mi vieja la usa todos los días.'],
        [5, 'muy linda y delicada, combina con todo'],
        [5, 'Me la probé en el local y me la llevé puesta. Ahora quiero los aritos que hacen juego jaja'],
        [5, 'Calidad 10/10. Tengo piel sensible y no me hizo nada.'],
        [4, 'Muy linda! Tardaron un poquito en contestarme el mensaje pero después súper bien todo.']
    ];
    var NOMBRES = ['Cami R.', 'Sofía M.', 'Agus', 'Flor B.', 'Lu Pereyra', 'Valen G.', 'Meli', 'Juli A.', 'Cande', 'Pau S.', 'Mica', 'Rochi',
                   'Brenda', 'Antonella F.', 'Gime', 'Lucía C.', 'Nati', 'Maru', 'Jose', 'Carla D.'];
    var CUANDO = ['hace 3 días', 'hace 5 días', 'hace 1 semana', 'hace 2 semanas', 'hace 3 semanas', 'hace 1 mes', 'hace 2 meses', 'hace 3 meses'];
    function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) >>> 0; } return h; }
    function nodo(tag, clase, texto) { var e = document.createElement(tag); if (clase) { e.className = clase; } if (texto != null) { e.textContent = texto; } return e; }
    function estrellas(n) { var s = ''; for (var e = 1; e <= 5; e++) { s += '<i' + (e > n ? ' class="pnt-res-vacia"' : '') + '>★</i>'; } return s; }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    var ficha = document.getElementById('single-product');
    var nombreProd = (document.querySelector('.js-product-name') || {}).textContent || 'Panthera';
    nombreProd = nombreProd.replace(/\s+/g, ' ').trim();
    var semilla = hash((ficha && ficha.getAttribute('data-store') || '') + nombreProd);

    /* ── Reseñas ── */
    function resenasDeMuestra() {
        if (!MUESTRA || document.querySelector('.pnt-res')) { return null; }
        var cuantas = 4 + (semilla % 4);               // de 4 a 7
        var ini = semilla % TEXTOS.length, items = '';
        for (var k = 0; k < cuantas; k++) {
            var t = TEXTOS[(ini + k * 5) % TEXTOS.length];
            var nom = NOMBRES[(semilla + k * 3) % NOMBRES.length];
            items += '<li class="pnt-res-item" data-estrellas="' + t[0] + '"><div class="pnt-res-cuerpo"><span class="pnt-res-estrellas" aria-label="' + t[0] + ' de 5 estrellas">' + estrellas(t[0]) + '</span><p class="pnt-res-texto">' + esc(t[1]) + '</p><p class="pnt-res-autor">' + esc(nom) + ' · ' + esc(nombreProd) + ' · ' + CUANDO[Math.min(CUANDO.length - 1, (semilla % 3) + k)] + '</p></div></li>';
        }
        var sec = nodo('section', 'pnt-res pnt-res-muestra');
        sec.setAttribute('aria-label', 'Lo que dicen nuestros clientes');
        sec.innerHTML = '<div class="pnt-res-cab"><h2 class="pnt-res-titulo">Lo que dicen nuestros clientes</h2><p class="pnt-res-promedio" hidden></p></div><div class="pnt-res-ventana"><ul class="pnt-res-pista">' + items + '</ul></div>';
        var antes = document.getElementById('cuidar-tu-plata') || document.getElementById('related-products');
        if (!antes || !antes.parentNode) { return null; }
        antes.parentNode.insertBefore(sec, antes);
        return sec;
    }
    function armarResenas() {
        var sec = document.querySelector('.pnt-res') || resenasDeMuestra();
        if (!sec || sec.getAttribute('data-listo')) { return null; }
        sec.setAttribute('data-listo', '1');
        sec.id = 'resenas';
        var items = [].slice.call(sec.querySelectorAll('.pnt-res-item'));
        var notas = items.map(function (li) { return parseFloat(li.getAttribute('data-estrellas')); }).filter(function (n) { return n > 0; });
        var prom = notas.length ? notas.reduce(function (a, b) { return a + b; }, 0) / notas.length : 0;
        var pr = sec.querySelector('.pnt-res-promedio');
        if (pr && notas.length) {
            // (2026-11-12) estrellas con el promedio parcial + número fino + cantidad, como bajada del título
            var pct = Math.max(0, Math.min(100, prom / 5 * 100)).toFixed(1);
            pr.innerHTML = '<span class="pnt-res-prom-est" aria-hidden="true">★★★★★<span style="width:' + pct + '%">★★★★★</span></span>'
                + '<span class="pnt-res-prom-num">' + prom.toFixed(1).replace('.', ',') + '</span>'
                + '<span class="pnt-res-prom-cant">· ' + items.length + (items.length === 1 ? ' reseña' : ' reseñas') + '</span>';
            pr.hidden = false;
        }
        // (2026-11-12) pie de cada tarjeta: círculo con la inicial + nombre + producto
        items.forEach(function (li) {
            var au = li.querySelector('.pnt-res-autor');
            if (!au || li.querySelector('.pnt-res-pie')) { return; }
            var partes = au.textContent.split(' · ');
            var nom = partes.shift().trim(), prod = partes.map(function (p) { return p.replace(/\s+[-–—]\s+\d+\s*$/, '').trim(); }).join(' · ');
            var pie = nodo('div', 'pnt-res-pie');
            pie.appendChild(nodo('span', 'pnt-res-ini', (nom.charAt(0) || '★').toUpperCase()));
            var q = nodo('span', 'pnt-res-quien'); q.appendChild(nodo('b', '', nom)); if (prod) { q.appendChild(nodo('small', '', prod)); }
            pie.appendChild(q);
            au.parentNode.replaceChild(pie, au);
        });
        var ventana = sec.querySelector('.pnt-res-ventana');
        var marco = nodo('div', 'pnt-res-marco');
        ventana.parentNode.insertBefore(marco, ventana);
        marco.appendChild(ventana);
        // (2026-11-12) las flechas van A LOS COSTADOS de las tarjetas, por fuera (pedido: "las flechas deben ir a los costados de las
        // reseñas"); encima de las tarjetas tapaban el texto
        var cab = sec.querySelector('.pnt-res-cab');
        var textos = nodo('div', 'pnt-res-cab-txt');
        while (cab.firstChild) { textos.appendChild(cab.firstChild); }
        cab.appendChild(textos);
        var flechas = nodo('div', 'pnt-res-flechas');
        marco.appendChild(flechas);
        function flecha(dir) {
            var b = nodo('button', 'pnt-res-flecha pnt-res-flecha--' + (dir < 0 ? 'izq' : 'der'));
            b.type = 'button';
            b.setAttribute('aria-label', dir < 0 ? 'Reseñas anteriores' : 'Reseñas siguientes');
            b.addEventListener('click', function () { var li = ventana.querySelector('.pnt-res-item'); var paso = li ? li.offsetWidth + 16 : 300; ventana.scrollBy({ left: dir * paso, behavior: 'smooth' }); });
            flechas.appendChild(b);
        }
        flecha(-1); flecha(1);
        function chequea() { sec.classList.toggle('pnt-res-sin-flechas', ventana.scrollWidth <= ventana.clientWidth + 4); }
        chequea(); window.addEventListener('resize', chequea); window.addEventListener('load', chequea);
        return { prom: prom, total: items.length };
    }

    /* ── Estrellas bajo el nombre ── */
    function puntaje(r) {
        var h1 = document.querySelector('.js-product-name');
        if (!h1 || !r || !r.total || document.querySelector('.pnt-ficha-estrellas')) { return; }
        var a = nodo('a', 'pnt-ficha-estrellas');
        a.href = '#resenas';
        a.innerHTML = '<span class="pnt-res-estrellas">' + estrellas(Math.round(r.prom)) + '</span><span><b>' + r.prom.toFixed(1).replace('.', ',') + '</b> (' + r.total + ')</span>';
        a.addEventListener('click', function (e) { var d = document.getElementById('resenas'); if (!d) { return; } e.preventDefault(); var y = d.getBoundingClientRect().top + (window.pageYOffset || 0) - 100; if (window.lenis) { window.lenis.scrollTo(y, { duration: 1.4 }); } else { window.scrollTo({ top: y, behavior: 'smooth' }); } });
        h1.parentNode.insertBefore(a, h1.nextSibling);
    }

    /* ── Precio con la estética de las tarjetas de "Los más elegidos" (pedido 2026-11-12: "los mismos grosores y estéticas que el
       carrusel de más vendidos y el de ofertas"). Si el producto tiene precio anterior está EN OFERTA y va con la estética roja de
       "No los dejes escapar" ("Ahorrás $X", raya roja, precio con transferencia en rojo, "-20%" rojo). Los precios de Lima quedan
       escondidos en su lugar (los cambia al elegir otro talle) y este bloque se rearma cada vez que cambian. ── */
    var ICONO_TARJETA = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg>';
    function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
    function oculto(el) { return !el || el.style.display === 'none' || !txt(el); }
    function plataCorta(t) { return t.replace(/,00$/, ''); }
    function num(t) { return parseFloat(String(t).replace(/[^\d,]/g, '').replace(',', '.')) || 0; }
    function plata(n) {
        var e = Math.floor(n), c = Math.round((n - e) * 100);
        if (c === 100) { e++; c = 0; }
        return '$' + String(e).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (c ? ',' + (c < 10 ? '0' : '') + c : '');
    }
    // ¿El producto está en la categoría "Ofertas"? (pedido 2026-11-12: "si el producto no está en la categoría ofertas no debe aparecer
    // con esta estética sino con la rosa"). Las categorías del producto vienen en el estado que la tienda escribe en un <script>
    // ("categories": [{ "id": …, "name": … }]); se toma el primero, que es el del producto de la ficha.
    var EN_OFERTAS = (function () {
        var re = /"categories":\s*(\[[^\]]*\])/;
        for (var i = 0; i < document.scripts.length; i++) {
            var m = re.exec(document.scripts[i].textContent || '');
            if (!m) { continue; }
            try { return JSON.parse(m[1]).some(function (c) { return /ofert/i.test(c && c.name || ''); }); } catch (e) { return false; }
        }
        return false;
    })();
    // (2026-11-16) Desde que existe la categoría Ofertas, "en Ofertas" es estar en esa categoría (EN_OFERTAS, arriba). Antes, como no existía,
    // la ficha bajaba el inicio (~900 KB) para ver si el producto estaba en "No los dejes escapar": eso se sacó.
    var miSlug = (location.pathname.match(/\/productos\/([^\/]+)/) || [])[1] || '';
    function precioTarjeta(envoltura, cont) {
        var pr = cont.querySelector('.js-price-display'), cp = cont.querySelector('.js-compare-price-display');
        var tc = cont.querySelector('.js-payment-discount-price-product-container');
        var cuo = envoltura.querySelector('.js-max-installments-container');
        var precio = oculto(pr) ? '' : plataCorta(txt(pr));
        var antes = oculto(cp) ? '' : plataCorta(txt(cp));
        var transf = (!tc || tc.style.display === 'none') ? '' : plataCorta(txt(tc.querySelector('.js-payment-discount-price-product')));
        var nC = cuo && cuo.style.display !== 'none' ? txt(cuo.querySelector('.js-installment-amount')) : '';
        var vC = nC ? plataCorta(txt(cuo.querySelector('.js-installment-price'))) : '';
        var sinInt = !!(cuo && cuo.querySelector('.installment-no-interest'));
        var grande = transf || precio;
        var oferta = EN_OFERTAS && !!(antes && grande && num(antes) > num(grande));   // si no: estética rosa de "Los más elegidos", sin "Ahorrás"
        var firma = [precio, antes, transf, nC, vC, sinInt].join('|');
        var b = envoltura.querySelector('.pnt-fp');
        if (b && b.getAttribute('data-firma') === firma) { return; }
        if (!b) { b = nodo('div', 'pnt-fp'); cont.parentNode.insertBefore(b, cont); }
        b.setAttribute('data-firma', firma);
        envoltura.classList.toggle('pnt-fp-oferta', oferta);
        b.innerHTML = '';
        var caja = nodo('div', 'pnt-mv-caja');
        if (oferta) {
            var ah = nodo('span', 'pnt-mv-ahorro'); ah.appendChild(nodo('small', '', 'Ahorrás')); ah.appendChild(document.createTextNode(plata(num(antes) - num(grande))));
            caja.appendChild(ah);
        }
        if (antes || (transf && precio)) {
            var l = nodo('span', 'pnt-mv-lista');
            if (antes) { l.appendChild(nodo('s', '', antes)); }
            if (transf && precio) {
                if (antes) { var a = nodo('span', 'pnt-mv-ahora', 'Ahora '); a.appendChild(nodo('span', 'pnt-mv-ahora-precio', precio)); l.appendChild(a); }
                else { l.appendChild(document.createTextNode(precio + ' lista')); }
            }
            caja.appendChild(l);
        }
        if (grande) {
            var f = nodo('span', 'pnt-mv-transf'); f.appendChild(nodo('b', '', grande));
            if (transf) { f.appendChild(nodo('span', '', 'Con transferencia')); }
            caja.appendChild(f);
        }
        b.appendChild(caja);
        if (nC && vC) {
            var c = nodo('span', 'pnt-mv-cuotas'); c.innerHTML = ICONO_TARJETA;
            var t = nodo('span'); t.appendChild(nodo('b', '', nC + ' cuotas' + (sinInt ? ' sin interés' : ''))); t.appendChild(document.createTextNode(' de ' + vC));
            c.appendChild(t); b.appendChild(c);
        }
    }

    /* ── Precio: "-20%" adentro y envío gratis abajo ── */
    function precio() {
        var cont = document.querySelector('.js-price-container');
        if (!cont || cont.getAttribute('data-pnt')) { return; }
        cont.setAttribute('data-pnt', '1');
        var of = document.querySelector('.js-offer-label .js-offer-percentage');
        if (of && of.textContent.trim()) { cont.parentNode.insertBefore(nodo('span', 'pnt-ficha-etiqueta', '-' + of.textContent.trim() + '%'), cont); }
        var env = cont.parentNode;
        env.classList.add('pnt-fp-env');
        precioTarjeta(env, cont);
        var pend = null;
        new MutationObserver(function () { clearTimeout(pend); pend = setTimeout(function () { precioTarjeta(env, cont); }, 30); })
            .observe(env, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style'] });
        var anuncio = document.querySelector('.js-adbar');
        var m = anuncio && /env[ií]o\s+gratis[^$]*\$\s*([\d.]+)/i.exec(anuncio.textContent.replace(/\s+/g, ' '));
        if (m) {
            var l = nodo('p', 'pnt-envio-linea');
            l.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="16.5" cy="17.5" r="1.7"/></svg><span><b>Envío gratis</b> superando los $' + m[1] + '</span>';
            var tras = cont.parentNode; tras.parentNode.insertBefore(l, tras.nextSibling);
        }
    }

    /* ── Descripción en dos columnas ── */
    function descripcion() {
        var cont = document.getElementById('product-description');
        // Descripciones con el formato de Panthera (un <div> con bloques) o simples (párrafos sueltos, como "Baby Girl"): en las dos
        // va como desplegable (pedido 2026-11-12: "las descripciones siempre como un desplegable arriba de medios de pago")
        var caja = cont && (cont.querySelector('.user-content > div') || cont.querySelector('.user-content'));
        if (!caja || cont.getAttribute('data-pnt')) { return; }
        var simple = caja.classList.contains('user-content');
        var norm = function (t) { return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); };
        var bloques = [].slice.call(caja.children);
        var intro = [], tabla = null, sobre = [], instagram = '';
        var etiqueta = function (el) { var p = el.querySelector && el.querySelector('p'); return p && /uppercase/i.test(p.getAttribute('style') || '') ? norm(p.textContent).toLowerCase() : ''; };
        bloques.forEach(function (b) {
            var tag = b.tagName, et = etiqueta(b), txt = norm(b.textContent);
            if (/^[✦\s]+$/.test(txt)) { return; }
            if (/^H[1-6]$/.test(tag) && /^descripci[oó]n$/i.test(txt)) { return; }   // el título "Descripción": ya lo dice el desplegable
            if (tag === 'P') { if (txt) { intro.push(b); } return; }
            if (simple) { if (txt) { intro.push(b); } return; }   // listas, títulos, etc. de una descripción simple: tal cual
            if (/ficha del producto/.test(et) && b.querySelector('table')) { tabla = b; return; }
            if (/sobre panthera/.test(et)) { sobre = [].slice.call(b.querySelectorAll('p')).slice(1); return; }
            if (/instagram/.test(et)) { var a = b.querySelector('a[href*="instagram"]'); if (a) { instagram = a.getAttribute('href'); } return; }
            // "Cuidá tus joyas Panthera" y cualquier otro bloque: no se muestra (lo cubre la sección "Cómo cuidar tu plata")
        });
        if (!intro.length && !tabla && !sobre.length) { return; }
        cont.setAttribute('data-pnt', '1');
        if (!intro.length && !tabla) { cont.classList.add('pnt-desc-lista'); return; }   // solo traía "Sobre Panthera": no se muestra nada
        var sec = nodo('section', 'pnt-desc');
        var izq = nodo('div'), der = nodo('div');
        izq.appendChild(nodo('h2', '', 'Descripción'));
        intro.forEach(function (p, i) {
            if (p.tagName !== 'P') { izq.appendChild(p.cloneNode(true)); return; }
            // (2026-11-13) "✦ Calidad y estilo para cada ocasión ✦": sin los ✦ y como frase suave (gris), igual que "Sumale tus charms…"
            var t = norm(p.textContent), adorno = /✦/.test(t);
            if (adorno) { t = norm(t.replace(/✦/g, '')); }
            izq.appendChild(nodo('p', (i && !simple) || adorno ? 'pnt-desc-suave' : '', t));
        });
        if (tabla) {
            var dl = document.createElement('dl');
            [].forEach.call(tabla.querySelectorAll('tr'), function (tr) {
                var td = tr.querySelectorAll('td'); if (td.length < 2) { return; }
                var f = document.createElement('div'); f.appendChild(nodo('dt', '', norm(td[0].textContent))); f.appendChild(nodo('dd', '', norm(td[1].textContent))); dl.appendChild(f);
            });
            izq.appendChild(dl);
        }
        if (sobre.length) {
            der.appendChild(nodo('h2', '', 'Sobre Panthera'));
            sobre.forEach(function (p) { der.appendChild(nodo('p', '', norm(p.textContent))); });
            if (instagram) { var ig = nodo('a', 'pnt-btn pnt-btn--borde', 'Seguinos en Instagram →'); ig.href = instagram; ig.target = '_blank'; ig.rel = 'noopener'; der.appendChild(ig); }
        }
        // (2026-11-12) "Sobre Panthera" no se muestra y la descripción va como un desplegable más, el primero, arriba de "Medios de
        // pago" y "Medios de envío" (pedidos: "ocultá el sobre Panthera" / "la descripción debe ser un desplegable más de estos").
        // Se copia el desplegable de la tienda pero con su propio click (el de Lima se engancha a .js-accordion-toggle).
        void der;
        var hermano = document.querySelector('.template-product .js-product-form .js-accordion-container.accordion');
        var molde = hermano && hermano.querySelector('.js-accordion-toggle');
        if (!hermano || !molde) { sec.appendChild(izq); cont.parentNode.insertBefore(sec, cont); }
        else {
            var acc = nodo('div', 'js-accordion-container accordion px-3 col-12 pnt-acc');
            var tog = molde.cloneNode(true);
            tog.className = 'pnt-acc-toggle py-3 row';
            tog.setAttribute('role', 'button');
            tog.setAttribute('aria-expanded', 'false');
            tog.querySelector('.h5').textContent = 'Descripción';
            var ins = tog.querySelector('.js-accordion-toggle-inactive'), act = tog.querySelector('.js-accordion-toggle-active');
            if (ins) { ins.style.display = ''; } if (act) { act.style.display = 'none'; }
            var cuerpo = nodo('div', 'pnt-acc-cuerpo');
            var interior = nodo('div', 'pnt-desc pnt-acc-desc');
            izq.removeChild(izq.firstChild);   // sin el título "Descripción": ya lo dice el desplegable
            while (izq.firstChild) { interior.appendChild(izq.firstChild); }
            cuerpo.appendChild(interior);
            acc.appendChild(tog); acc.appendChild(cuerpo);
            var antesDe = hermano.previousElementSibling && hermano.previousElementSibling.classList.contains('js-nubesdk-slot') ? hermano.previousElementSibling : hermano;
            antesDe.parentNode.insertBefore(acc, antesDe);
            tog.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                var abrir = !acc.classList.contains('pnt-acc-abierto');
                acc.classList.toggle('pnt-acc-abierto', abrir);
                tog.setAttribute('aria-expanded', abrir ? 'true' : 'false');
                if (ins) { ins.style.display = abrir ? 'none' : ''; } if (act) { act.style.display = abrir ? '' : 'none'; }
            });
        }
        cont.style.display = 'none';
        cont.classList.add('pnt-desc-lista');
    }

    /* ── Relacionados: "Te va a interesar" y tarjetas de los listados ── */
    function relacionados() {
        var t = document.querySelector('.section-products-related .products-section-title');
        if (t) { t.textContent = 'Te va a interesar'; }
        // Flechas a los costados del carrusel, como en las reseñas (pedido 2026-11-12: "lo mismo acá"). Swiper las sigue usando: se mueven
        // los mismos elementos (no se copian) a la caja del carrusel.
        var caja = document.querySelector('.section-products-related .products-section-container');
        if (caja && !caja.classList.contains('pnt-rel-flechas')) {
            var pr = document.querySelector('.section-products-related .js-swiper-related-prev');
            var nx = document.querySelector('.section-products-related .js-swiper-related-next');
            if (pr && nx) { caja.classList.add('pnt-rel-flechas'); caja.appendChild(pr); caja.appendChild(nx); }
        }
        // las flechas a la altura de la mitad de la foto
        var foto = caja && caja.querySelector('.js-item-product .product-item-image-container, .js-item-product img');
        if (caja && foto && foto.offsetHeight) { caja.style.setProperty('--pnt-rel-mitad', Math.round(foto.offsetHeight / 2) + 'px'); }
        [].forEach.call(document.querySelectorAll('.section-products-related .js-item-product'), mvTarjetaFicha);
        // 5 por fila en compu, como en los listados (pedido 2026-11-12: "en todos 5 productos por fila, menos en los carruseles del inicio")
        var rel = document.querySelector('.js-swiper-related'), sw = rel && rel.swiper;
        if (sw && sw.params && !rel.getAttribute('data-pnt-cinco')) {
            rel.setAttribute('data-pnt-cinco', '1');
            var bp = sw.params.breakpoints || {};
            bp[1280] = { slidesPerView: 5, spaceBetween: 36 };
            sw.params.breakpoints = bp;
            var ajusta = function () {
                var n = window.innerWidth >= 1280 ? 5 : window.innerWidth >= 768 ? 4 : sw.params.slidesPerView;
                if (sw.params.slidesPerView !== n) { sw.params.slidesPerView = n; }
                sw.params.spaceBetween = window.innerWidth >= 1280 ? 36 : 20;   // 5 por vista: apenas más chicas y más separadas (2026-11-12)
                if (sw.currentBreakpoint !== undefined && sw.setBreakpoint) { sw.currentBreakpoint = null; try { sw.setBreakpoint(); } catch (e) { /* versión vieja */ } }
                sw.update();
            };
            ajusta(); window.addEventListener('resize', ajusta);
        }
    }

    // ancho de la barra de scroll, para que todo mida lo mismo con 100vw (marca.css sección 25)
    function barraScroll() { document.documentElement.style.setProperty('--pnt-sb', Math.max(0, window.innerWidth - document.documentElement.clientWidth) + 'px'); }
    barraScroll(); window.addEventListener('resize', barraScroll);
    // Cada cuadro de foto toma el color del borde de su foto (la foto va un 12 % más chica dentro del cuadro: marca.css). El CDN de la
    // tienda manda Access-Control-Allow-Origin: *, así que se puede leer el color.
    function fondoFotos() {
        [].forEach.call(document.querySelectorAll('.js-product-slide'), function (slide) {
            var img = slide.querySelector('img'); if (!img || slide.getAttribute('data-pnt-fondo')) { return; }
            var src = img.currentSrc || img.getAttribute('src') || ''; if (!src || /placeholder/.test(src)) { return; }   // todavía sin cargar (lazy): se reintenta al cargar
            slide.setAttribute('data-pnt-fondo', '1');
            var im = new Image(); im.crossOrigin = 'anonymous';
            im.onload = function () {
                try {
                    var c = document.createElement('canvas'); c.width = c.height = 40;
                    var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, 40, 40);
                    var d = x.getImageData(1, 1, 1, 1).data, e = x.getImageData(38, 38, 1, 1).data;
                    var col = 'rgb(' + Math.round((d[0] + e[0]) / 2) + ',' + Math.round((d[1] + e[1]) / 2) + ',' + Math.round((d[2] + e[2]) / 2) + ')';
                    if (d[3] > 200) { slide.style.setProperty('background', col, 'important'); }
                } catch (err) { /* sin permiso para leerla: queda el gris */ }
            };
            im.src = src.indexOf('//') === 0 ? 'https:' + src : src;
        });
    }
    // Flechas de las miniaturas (2026-11-12: "es la última y me sigue apareciendo la flechita para ir para abajo"): Lima agrega una
    // miniatura vacía al final y Swiper cree que queda algo. "Abajo" se apaga cuando la última miniatura de verdad ya se ve entera;
    // "arriba", cuando se ve la primera. Si entran todas, no hay flechas.
    function flechasMiniaturas() {
        var cont = document.querySelector('.js-swiper-product-thumbs');
        var ctr = document.querySelector('.js-swiper-product-thumb-controls');
        if (!cont || !ctr || ctr.getAttribute('data-pnt')) { return; }
        ctr.setAttribute('data-pnt', '1');
        var prev = ctr.querySelector('.js-swiper-product-thumbs-prev'), next = ctr.querySelector('.js-swiper-product-thumbs-next');
        function revisa() {
            var th = cont.querySelectorAll('.js-product-thumb'); if (!th.length) { return; }
            var c = cont.getBoundingClientRect(), pri = th[0].getBoundingClientRect(), ult = th[th.length - 1].getBoundingClientRect();
            var hayArriba = pri.top < c.top - 1, hayAbajo = ult.bottom > c.bottom + 1;
            if (prev) { prev.classList.toggle('pnt-apagada', !hayArriba); }
            if (next) { next.classList.toggle('pnt-apagada', !hayAbajo); }
            ctr.classList.toggle('pnt-sin-flechas', !hayArriba && !hayAbajo);
        }
        var sw = cont.swiper;
        if (sw && sw.on) { sw.on('setTranslate', revisa); sw.on('transitionEnd', revisa); sw.on('resize', revisa); }
        [prev, next].forEach(function (b) { if (b) { b.addEventListener('click', function () { setTimeout(revisa, 50); setTimeout(revisa, 450); }, true); } });
        // si "abajo" está apagada, el click no hace nada (Swiper igual movería hasta la miniatura vacía)
        if (next) { next.addEventListener('click', function (e) { if (next.classList.contains('pnt-apagada')) { e.stopImmediatePropagation(); e.preventDefault(); } }, true); }
        window.addEventListener('resize', revisa); window.addEventListener('load', revisa);
        revisa(); setTimeout(revisa, 800);
    }
    /* (2026-11-15, "que no se vean saltos") La columna de compra (título, precio, talles, envíos) espera invisible a estar rearmada: antes se veía la
       de Tiendanube ~0,5 s y después saltaba 120 px (precio de tarjeta, envíos en filas, descripción en desplegable) y otros 50 px si era oferta.
       paginas.css la esconde hasta html.pnt-ficha-armada (y la muestra igual a los 2,5 s si esto no corriera). Tope: 0,9 s. */
    var fichaEspera = false;
    function fichaArmada() { document.documentElement.classList.add('pnt-ficha-armada'); }
    function iniciar() {
        barraScroll();
        flechasMiniaturas(); setTimeout(flechasMiniaturas, 1200);
        fondoFotos(); setTimeout(fondoFotos, 1500);
        document.addEventListener('lazyloaded', function () { setTimeout(fondoFotos, 50); });   // fotos apiladas: cargan al acercarse
        precio();
        descripcion();
        puntaje(armarResenas());
        relacionados();
        requestAnimationFrame(function () { setTimeout(function () { if (!fichaEspera) { fichaArmada(); } }, 120); });
        setTimeout(fichaArmada, 900);
        // el carrusel de relacionados de la tienda se arma un poco después de cargar: se vuelve a pasar por las tarjetas
        var n = 0, t = setInterval(function () { relacionados(); if (++n > 12) { clearInterval(t); } }, 500);
    }
    function mvTarjetaFicha(el) { if (window.__pntTarjeta) { window.__pntTarjeta(el); } }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})();


/* ── 15. Entradas al bajar en TODO el sitio menos el inicio (pedido 2026-11-12: "animaciones y transiciones a todo mientras
   escrolleo, que sean premium"; el inicio ya tiene las suyas en la sección 13). Estilos: marca.css sección 23.
   - Cada pieza (título, controles, tarjetas, foto y datos de la ficha, textos, formularios, pie) aparece al entrar en pantalla:
     fundido + subida + escala mínima, con la misma curva larga que el inicio y SIN desenfoque (pedido: "lo que aparece está desenfocado").
   - Las que entran juntas se escalonan 80 ms por orden de pantalla (arriba→abajo, izquierda→derecha), con tope.
   - Lo que ya quedó arriba de la pantalla no se esconde. Contenido que se arma después (carga infinita, reseñas) se registra solo.
   - Al terminar se sacan las marcas y los estilos: la pieza queda como antes (no pisa hover ni transiciones propias).
   - Red de seguridad: lo que quedó a la vista sin mostrarse (saltos de scroll, anclas) se muestra solo; a los 3,5 s se muestra todo lo visible. ── */
(function () {
    'use strict';
    if (window.self !== window.top || document.querySelector('[data-store="home-slider"]') || !('IntersectionObserver' in window)) { return; }
    var root = document.documentElement, cuerpo = document.body;
    var PASO = 80, TOPE = 480;

    // [selector, tipo]  tipo: sube (por defecto) | tarjeta | foto | lado
    var LISTA = [
        ['.page-header h1, .page-header .h1', 'sube'],
        ['.category-controls', 'sube'],
        ['.js-product-table .js-item-product', 'tarjeta'],
        ['.template-product .product-image-container', 'foto'],
        ['.template-product .section-single-product .col > *', 'sube'],
        ['.template-product .pnt-desc > *', 'sube'],
        ['.template-product .pnt-res', 'sube'],
        ['.template-product .pnt-cu > *', 'sube'],
        ['#related-products .products-section-title-container, #related-products > .container > h2', 'sube'],
        ['.template-page .user-content > *', 'sube'],
        ['.template-contact form, .template-contact .contact-info > *, .template-contact .contact-form', 'sube'],
        ['.template-account .account-page form, .template-account .account-page > *', 'sube'],
        ['.template-404 .container > *, .pnt-vacio, .pnt-sug .js-item-product', 'sube'],
        ['footer.pnt-pie .container > .row.mb-4 > *, footer.pnt-pie .footer-legal .row > *', 'sube']
    ];
    var EXCLUIR = '.js-head-main, .pnt-barra, .js-modal, .pnt-cp, .swiper-slide, .pnt-rv, .pnt-a3, .pnt-or, .labels, .hidden, .js-nubesdk-slot';

    var hecho = typeof WeakSet === 'function' ? new WeakSet() : { add: function () {}, has: function () { return false; } };
    var mostrando = [], enCola = false;

    function terminar(el) {
        el.removeAttribute('data-pnt-an');
        el.classList.remove('pnt-an-in');
        el.style.removeProperty('--pnt-d');
    }

    // Todo lo que entró en el mismo momento se muestra en orden de pantalla, 80 ms entre una y otra
    function vaciar() {
        enCola = false;
        var lote = mostrando; mostrando = [];
        lote.sort(function (a, b) {
            var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
            return (Math.round(ra.top / 24) - Math.round(rb.top / 24)) || (ra.left - rb.left);
        });
        lote.forEach(function (el, i) {
            el.style.setProperty('--pnt-d', Math.min(i * PASO, TOPE) + 'ms');
            el.classList.add('pnt-an-in');
            setTimeout(function () { terminar(el); }, Math.min(i * PASO, TOPE) + 1700);
        });
    }
    function mostrar(el) {
        if (el.classList.contains('pnt-an-in') || mostrando.indexOf(el) !== -1) { return; }
        io.unobserve(el);
        mostrando.push(el);
        if (!enCola) { enCola = true; requestAnimationFrame(vaciar); }
    }

    var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { mostrar(e.target); } });
    }, { rootMargin: '0px 0px 18% 0px', threshold: 0 });

    function registrar() {
        var nuevos = [];
        LISTA.forEach(function (par) {
            Array.prototype.forEach.call(document.querySelectorAll(par[0]), function (el) {
                if (hecho.has(el) || el.hasAttribute('data-pnt-an')) { return; }
                if (el.closest(EXCLUIR) || el.matches(EXCLUIR)) { hecho.add(el); return; }
                var r = el.getBoundingClientRect();
                if (r.bottom < 0 || r.width === 0 || r.height === 0) { if (r.bottom < 0) { hecho.add(el); } return; }   // ya pasó por arriba, o está oculto
                var pos = getComputedStyle(el).position;
                if (pos === 'fixed' || pos === 'sticky') { hecho.add(el); return; }
                // si ya hay otra pieza marcada dentro o fuera de esta, no se anima dos veces
                if (nuevos.some(function (o) { return o.contains(el) || el.contains(o); }) || el.closest('[data-pnt-an]') || el.querySelector('[data-pnt-an]')) { hecho.add(el); return; }
                hecho.add(el);
                el.setAttribute('data-pnt-an', par[1]);
                el.removeAttribute('data-transition');   // la entrada simple de Lima (fade-in-up) la reemplaza esta
                nuevos.push(el);
            });
        });
        if (!nuevos.length) { return; }
        root.classList.add('pnt-an');
        nuevos.forEach(function (el) { io.observe(el); });
    }

    var pend = false;
    function revelarVisibles(limite) {
        pend = false;
        Array.prototype.forEach.call(document.querySelectorAll('[data-pnt-an]:not(.pnt-an-in)'), function (el) {
            if (el.getBoundingClientRect().top < limite()) { mostrar(el); }
        });
    }
    window.addEventListener('scroll', function () {
        // (2026-11-14) a lo sumo una vez cada 140 ms: mide cada elemento pendiente (fuerza el diseño) y antes lo hacía en cada cuadro
        if (!pend) { pend = true; setTimeout(function () { requestAnimationFrame(function () { revelarVisibles(function () { return window.innerHeight * 0.96; }); }); }, 140); }
    }, { passive: true });
    setTimeout(function () { revelarVisibles(function () { return window.innerHeight; }); }, 3500);
    // Si el largo de la página cambia sin que nadie scrollee (fotos que cargan, contenido que se arma), lo que quedó a la vista igual se muestra
    var ronda = setInterval(function () {
        if (!document.querySelector('[data-pnt-an]')) { return; }
        revelarVisibles(function () { return window.innerHeight * 0.96; });
    }, 700);
    setTimeout(function () { clearInterval(ronda); }, 120000);

    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(registrar, 180); }).observe(cuerpo, { childList: true, subtree: true });

    // Después de que el resto de marca.js armó su HTML
    function arrancar() { setTimeout(registrar, 0); setTimeout(registrar, 900); setTimeout(registrar, 2600); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})();

/* ── Ofertas (pedido 2026-11-16: "creá la categoría Ofertas… que tenga la estética que tiene hoy la categoría falsa") ─────────────────
   Ofertas es la categoría "Ofertas" de la tienda (PNT_OFERTAS, al principio del archivo). Hasta el 2026-11-16 era una página armada con código
   (/todos-los-productos/?ofertas, con los productos de "No los dejes escapar" bajados del inicio): esa dirección ahora lleva a la categoría.
   La categoría conserva aquella estética: franja roja "SALE" con "Hasta X% off" y "+X% extra en transferencia" (calculados de sus productos),
   tarjetas rojas como las de "No los dejes escapar" (listados() las envuelve) y sin migas, banner ni descripción. Ordenar, Filtrar y "Ver más
   productos" son los de la tienda. "Ofertas" va primero en el menú de la hamburguesa. ── */
// Fila de paginación de los listados de Lima (snipplets/grid/pagination.tpl): flechas en círculo + "2 / 5". Sin clase propia.
function filaPaginacion(doc) {
    var filas = (doc || document).querySelectorAll('.row.justify-content-center.align-items-center');
    for (var i = 0; i < filas.length; i++) { if (filas[i].querySelector('.svg-circle') && /\d+\s*\/\s*\d+/.test(filas[i].textContent)) { return filas[i]; } }
    return null;
}
function siguienteDe(fila) {
    var links = fila.querySelectorAll('a.svg-circle');
    var sig = links[links.length - 1];
    return sig && sig.getAttribute('href') ? sig.getAttribute('href') : '';
}
(function () {
    'use strict';
    var OFERTAS_URL = PNT_OFERTAS.url;   // (2026-11-16) la categoría Ofertas, con el orden ya puesto: así no se recarga

    // Menú: "Ofertas" primero, con el mismo color que las demás (sin rojo: pedido 2026-11-12)
    function menu() {
        var lista = document.querySelector('#nav-hamburger .nav-primary > .nav-list');
        if (!lista || lista.querySelector('.pnt-menu-ofertas')) { return; }
        var li = document.createElement('li');
        li.className = 'nav-item pnt-menu-ofertas';
        li.innerHTML = '<a class="nav-list-link position-relative" href="' + OFERTAS_URL + '">Ofertas</a>';
        lista.insertBefore(li, lista.firstChild);
    }

    // % de descuento de una tarjeta (la etiqueta "-20%") y % extra con transferencia (precio vs. precio con transferencia)
    function numero(t) { return parseFloat(String(t || '').replace(/[^\d,]/g, '').replace(',', '.')) || 0; }
    function datosDe(it) {
        var pct = numero((it.querySelector('.js-offer-percentage') || {}).textContent);
        var pr = numero((it.querySelector('.js-price-display') || {}).textContent);
        var tr = numero((it.querySelector('.js-payment-discount-price-product') || {}).textContent);
        return { pct: pct, transf: pr && tr && tr < pr ? Math.round((1 - tr / pr) * 100) : 0, precio: tr || pr,
                 nombre: ((it.querySelector('.js-item-name') || {}).textContent || '').trim().toLowerCase() };
    }

    // La página
    function pagina() {
        // la dirección de la página armada con código (hasta el 2026-11-16) lleva a la categoría, con el orden y los filtros que traía
        if (/^\/todos-los-productos\/?$/.test(location.pathname) && new URLSearchParams(location.search).has('ofertas')) {
            var q = new URLSearchParams(location.search);
            q.delete('ofertas');
            if (!q.has('sort_by')) { q.set('sort_by', 'created-descending'); }
            location.replace(PNT_OFERTAS.ruta + '?' + q.toString() + location.hash);
            return;
        }
        if (!PNT_OFERTAS.es()) { return; }
        var tabla = document.querySelector('.js-product-table');
        if (!tabla) { return; }
        document.documentElement.classList.add('pnt-pag-ofertas');
        franjaSale([].slice.call(tabla.querySelectorAll('.js-item-product')));
        // "Ver más productos" suma tarjetas: la franja se recalcula con todas
        var t = null;
        new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { franjaSale([].slice.call(tabla.querySelectorAll('.js-item-product'))); }, 120); })
            .observe(tabla, { childList: true, subtree: true });
    }

    // Franja roja "SALE" arriba del listado, como la de Ofertas de BS23 (pedido 2026-11-12). "Hasta X% off" y "+X% extra en
    // transferencia" salen de los productos en oferta (sus etiquetas y sus precios); no se inventa nada.
    function franjaSale(items) {
        var banda = document.querySelector('.pnt-sale');
        if (!banda) {
            banda = document.createElement('section');
            banda.className = 'pnt-sale';
            banda.innerHTML = '<div class="pnt-sale-in"><span class="pnt-sale-txt" aria-hidden="true">SALE</span><span class="pnt-sale-dato"></span></div>';
            var controles = document.querySelector('.js-category-controls');
            var ancla = controles || document.querySelector('.js-product-table');
            if (ancla && ancla.parentNode) { ancla.parentNode.insertBefore(banda, ancla); }
            document.documentElement.classList.add('pnt-con-sale');
        }
        if (!items) { return; }
        var max = 0, transf = 0;
        items.forEach(function (it) { var d = datosDe(it); max = Math.max(max, d.pct); transf = Math.max(transf, d.transf); });
        banda.querySelector('.pnt-sale-dato').innerHTML = (max ? '<b>Hasta ' + max + '% off</b>' : '') + (transf ? '<span>+' + transf + '% extra en transferencia</span>' : '');
    }

    function arrancar() { menu(); pagina(); setTimeout(menu, 1000); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})();

/* ── Listados: "Ver más productos" en vez de "2 / 5" (pedido 2026-11-12: "botón de ver más productos, no esto") ───────────────
   La tienda pagina con flechas y "N / M" (snipplets/grid/pagination.tpl). El botón trae la página siguiente y suma sus tarjetas
   debajo, sin salir. Cuando no hay más, desaparece. ── */
(function () {
    'use strict';
    var cl = document.body.classList;
    if (!(cl.contains('template-category') || cl.contains('template-search'))) { return; }
    function arrancar() {
        var tabla = document.querySelector('.js-product-table');
        var fila = filaPaginacion();
        if (!tabla || !fila) { return; }      // (2026-11-16) también en Ofertas: es una categoría de verdad, con sus páginas
        var sig = siguienteDe(fila);
        if (!sig) { fila.style.display = 'none'; return; }
        var caja = document.createElement('div');
        caja.className = 'pnt-ver-mas';
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pnt-ver-mas-btn';
        b.innerHTML = '<span>Ver más productos</span>';
        caja.appendChild(b);
        fila.parentNode.insertBefore(caja, fila);
        fila.style.display = 'none';
        b.addEventListener('click', function () {
            if (!sig || b.disabled) { return; }
            b.disabled = true; b.classList.add('is-cargando');
            fetch(sig, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (h) {
                var d = new DOMParser().parseFromString(h, 'text/html');
                var nuevos = [];
                [].forEach.call(d.querySelectorAll('.js-product-table .js-item-product'), function (it) {
                    var id = it.getAttribute('data-product-id');
                    if (id && tabla.querySelector('.js-item-product[data-product-id="' + id + '"]')) { return; }
                    var n = document.importNode(it, true); tabla.appendChild(n); nuevos.push(n);
                });
                nuevos.forEach(function (el) { if (window.__pntTarjeta) { window.__pntTarjeta(el); } });
                if (window.lazySizes && window.lazySizes.loader) { window.lazySizes.loader.checkElems(); }
                var f = filaPaginacion(d);
                sig = f ? siguienteDe(f) : '';
                b.disabled = false; b.classList.remove('is-cargando');
                if (!sig) { caja.remove(); }
            }).catch(function () { b.disabled = false; b.classList.remove('is-cargando'); location.href = sig; });
        });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})();

/* ── Bloques entre productos, como en BS23 (pedido 2026-11-12: "en ver todos los productos que cada 3 filas aparezcan los
   beneficios, videos, etc."). Copia de bloques.js de BS23 con la marca de Panthera y SOLO datos reales de la tienda:
   1 beneficios (descuento con transferencia calculado de los precios, cuotas y envío gratis de la barra de anuncios, WhatsApp),
   2 "Armá tu pulsera" (foto y texto), 3 banner "Conocenos" (Bahía Blanca · Monte Hermoso, las direcciones de Contacto),
   4 frase (de "Sobre Panthera") y 5 "Cómo cuidar tu plata" (foto y texto invertido); después vuelve a empezar.
   Se recalcula al cambiar el ancho y cuando "Ver más productos" suma tarjetas, así siempre cae entre filas completas.
   Solo en "Todos los productos" y sus categorías; no en Ofertas ni en la búsqueda. ── */
(function () {
    'use strict';
    if (!document.body.classList.contains('template-category') || !/^\/todos-los-productos\//.test(location.pathname)) { return; }
    if (PNT_OFERTAS.es()) { return; }      // (2026-11-16) en Ofertas no van bloques
    var tabla = document.querySelector('.js-product-table');
    if (!tabla) { return; }
    var sc = document.querySelector('script[src*="panthera/marca"]');
    var CARPETA = sc ? sc.src.split('?')[0].replace(/marca\.js$/, '') : '';
    var FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICONOS = [
        '<path d="M19 5L5 19M7.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>',
        '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
        '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7zM6.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>',
        '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'
    ];
    function nodo(tag, cls, txt) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (txt) { e.textContent = txt; } return e; }
    function numero(t) { return parseFloat(String(t || '').replace(/[^\d,]/g, '').replace(',', '.')) || 0; }

    // Datos reales: % con transferencia (de las tarjetas del listado), cuotas y envío (de la barra de anuncios)
    function beneficiosReales() {
        var transf = 0;
        [].some.call(tabla.querySelectorAll('.js-item-product'), function (it) {
            var pr = numero((it.querySelector('.js-price-display') || {}).textContent);
            var tr = numero((it.querySelector('.js-payment-discount-price-product') || {}).textContent);
            if (pr && tr && tr < pr) { transf = Math.round((1 - tr / pr) * 100); return true; }
            return false;
        });
        var barra = ((document.querySelector('.js-adbar') || {}).textContent || '').replace(/\s+/g, ' ');
        var cuotas = /(\d+\s*y\s*\d+|\d+)\s*cuotas\s*sin\s*inter[eé]s/i.exec(barra);
        var envio = /env[ií]o\s+gratis[^$]*\$\s*([\d.]+)/i.exec(barra);
        var lista = [];
        if (transf) { lista.push({ t: transf + '% OFF', x: 'Pagando con transferencia' }); }
        if (cuotas) { lista.push({ t: cuotas[1].replace(/\s+/g, ' ') + ' cuotas', x: 'Sin interés' }); }
        if (envio) { lista.push({ t: 'Envío gratis', x: 'Superando los $' + envio[1] }); }
        lista.push({ t: 'Atención por WhatsApp', x: 'Escribinos con cualquier duda' });
        return lista;
    }
    var ICONO_DE = function (t) { return /OFF/.test(t) ? 0 : /cuotas/.test(t) ? 1 : /Env/.test(t) ? 2 : 3; };

    // Bloques de "Todos los productos"
    var IG = 'https://instagram.com/panthera.ok';
    var B = {
        benef: { n: 1, tipo: 'benef' },
        armar: { n: 2, tipo: 'split', img: 'arma/poster.webp', etiqueta: 'Armá tu pulsera', titulo: 'Creala vos', texto: 'Elegí la pulsera, sumá tus charms y mirala en 3D antes de comprar.', boton: 'Armar la mía', url: '/#armar-pulsera' },
        oreja: { n: 7, tipo: 'split', img: 'oreja/poster.webp', etiqueta: 'Armá tu oreja', titulo: 'Combiná tus aros', texto: 'Elegí cuántos aritos, combinalos y mirá cómo quedan puestos antes de comprar.', boton: 'Armar la mía', url: '/#armar-oreja' },
        cuidar: { n: 5, tipo: 'split der', img: 'banners/pulseras.webp', etiqueta: 'Cuidados', titulo: 'Cuidá tu plata', texto: 'Cinco cuidados simples para que tus joyas de plata 925 conserven su brillo.', boton: 'Ver los cuidados', url: '/cuidados/' },
        // (2026-11-12) "Visitanos" y la frase se cambiaron por videos de "Seguinos en redes" (pedido del usuario)
        vPulseras: { n: 3, tipo: 'video', video: 'redes/video-pulseras.mp4', img: 'redes/video-pulseras-poster.webp', etiqueta: 'Pulseras', titulo: 'Encontrá la tuya', texto: 'Pulseras de plata para sumar tus charms y armar tu combinación.', boton: 'Ver pulseras', url: '/todos-los-productos/pulseras/' },
        vRedes: { n: 4, tipo: 'video der', video: 'redes/video-redes.mp4', img: 'redes/video-redes-poster.webp', etiqueta: 'Seguinos en redes', titulo: 'Panthera en Instagram', texto: 'Novedades, combinaciones y lanzamientos antes que nadie.', boton: 'Ir a Instagram', url: IG, afuera: true }
    };
    // Video de redes de la misma categoría (pedido 2026-11-12: "en collares los videos de redes de collares, en pulseras el de pulseras…")
    function vCat(n, archivo, etiqueta, titulo, texto) {
        return { n: n, tipo: 'video', video: 'redes/' + archivo + '.mp4', img: 'redes/' + archivo + '-poster.webp', etiqueta: etiqueta, titulo: titulo, texto: texto, boton: 'Ver en Instagram', url: IG, afuera: true };
    }
    var ruta = location.pathname;
    var BLOQUES =
        /\/(disney-lovers|charms-panthera\/disney)\//.test(ruta) ? [B.benef, vCat(8, 'video-disney', 'Mundo Disney', 'Tu personaje favorito', 'Charms Disney de plata para sumar a tu pulsera.'), B.armar, B.cuidar] :
        /\/charms-panthera\//.test(ruta) ? [B.benef, vCat(9, 'video-charms', 'Charms', 'Sumá tu historia', 'Charms de plata 925 para armar tu pulsera a tu manera.'), B.armar, B.cuidar] :
        /\/pulseras\//.test(ruta) ? [B.benef, vCat(10, 'video-pulseras', 'Pulseras', 'Encontrá la tuya', 'Pulseras de plata para sumar tus charms y armar tu combinación.'), B.armar, B.cuidar] :
        /\/collares1?\//.test(ruta) ? [B.benef, vCat(11, 'video-collares', 'Collares', 'Para todos los días', 'Collares y colgantes para combinar con todo.'), B.cuidar] :
        /\/anillos\//.test(ruta) ? [B.benef, vCat(12, 'video-redes', 'Anillos', 'Combinalos como quieras', 'Anillos, aros, collares y pulseras: mirá cómo los combinamos.'), B.cuidar] :
        /\/aros\//.test(ruta) ? [B.benef, vCat(13, 'video-aritos', 'Aros', 'Para cada estilo', 'Argollas, colgantes y ear cuffs para combinar como quieras.'), B.oreja, B.cuidar] :
        [B.benef, B.armar, B.vPulseras, B.vRedes, B.cuidar];

    function armar(b) {
        var raiz = nodo('div', 'pnt-bl ' + b.tipo.split(' ').map(function (t) { return 'pnt-bl--' + t; }).join(' '));
        raiz.setAttribute('data-bloque', b.n);
        var dentro = nodo('div', 'pnt-bl-in');
        raiz.appendChild(dentro);
        if (b.tipo === 'benef') {
            var ul = nodo('ul', 'pnt-ben');
            beneficiosReales().forEach(function (it) {
                var li = nodo('li', 'pnt-ben-it');
                var ic = nodo('span', 'pnt-ben-ic');
                ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONOS[ICONO_DE(it.t)] + '</svg>';
                li.appendChild(ic); li.appendChild(nodo('b', 'pnt-ben-t', it.t)); li.appendChild(nodo('span', 'pnt-ben-x', it.x));
                ul.appendChild(li);
            });
            dentro.appendChild(ul);
            return raiz;
        }
        if (b.video && CARPETA) {
            // video vertical en una tarjeta alta: muteado, en bucle, solo mientras se ve
            var fv = nodo('div', 'pnt-bl-foto pnt-bl-video');
            var v = document.createElement('video');
            v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.preload = 'none';
            v.poster = CARPETA + b.img; v.src = CARPETA + b.video; v.setAttribute('aria-hidden', 'true');
            fv.appendChild(v); dentro.appendChild(fv);
            if (window.IntersectionObserver) {
                new IntersectionObserver(function (es) {
                    es.forEach(function (e) { if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) { pr.catch(function () {}); } } else { v.pause(); } });
                }, { threshold: 0.3 }).observe(v);
            }
        } else if (b.img && CARPETA) {
            var foto = nodo('div', 'pnt-bl-foto');
            var im = document.createElement('img'); im.src = CARPETA + b.img; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
            foto.appendChild(im); dentro.appendChild(foto);
        }
        var tx = nodo('div', 'pnt-bl-txt');
        if (b.etiqueta) { tx.appendChild(nodo('span', 'pnt-bl-et', b.etiqueta)); }
        if (b.titulo) { tx.appendChild(nodo('h3', 'pnt-bl-tit', b.titulo)); }
        if (b.texto) { tx.appendChild(nodo('p', 'pnt-bl-tx', b.texto)); }
        if (b.boton && b.url) { var a = nodo('a', 'pnt-bl-btn'); a.href = b.url; if (b.afuera) { a.target = '_blank'; a.rel = 'noopener'; } a.appendChild(document.createTextNode(b.boton)); a.insertAdjacentHTML('beforeend', FLECHA); tx.appendChild(a); }
        dentro.appendChild(tx);
        return raiz;
    }

    var firma = '', ocupado = false;
    function colocar() {
        if (ocupado) { return; }
        var cards = [].filter.call(tabla.children, function (c) { return c.classList.contains('js-item-product'); });
        if (!cards.length) { return; }
        var top0 = cards[0].offsetTop, cols = 0;
        while (cols < cards.length && cards[cols].offsetTop === top0) { cols++; }
        if (cols < 1 || (cols === cards.length && cards.length > 6)) { return; }
        var hayMas = !!document.querySelector('.pnt-ver-mas');
        // cada 3 filas; en las categorías cortas (pocas filas), más seguido, para que también tengan su contenido (2026-11-12)
        var filas = Math.ceil(cards.length / cols);
        var paso = (hayMas || filas >= 6) ? 3 : filas >= 3 ? 2 : 1;
        var plan = [], fila = 0, k = 0;
        while (true) {
            fila += paso;
            var pos = fila * cols;
            if (pos > cards.length || (pos === cards.length && !hayMas)) { break; }
            plan.push({ despues: pos - 1, b: BLOQUES[k % BLOQUES.length] });
            k++;
        }
        // si entraron menos de dos bloques y no hay más páginas, uno más al final del listado
        if (!hayMas && plan.length < 2 && cards.length) { plan.push({ despues: cards.length - 1, b: BLOQUES[k % BLOQUES.length] }); }
        var nueva = plan.map(function (p) { return p.despues + ':' + p.b.n; }).join(',') + '|' + cols;
        if (nueva === firma) { return; }
        ocupado = true;
        [].slice.call(tabla.children).forEach(function (c) { if (c.classList && c.classList.contains('pnt-bl')) { tabla.removeChild(c); } });
        plan.forEach(function (p) { tabla.insertBefore(armar(p.b), cards[p.despues].nextSibling); });
        firma = nueva;
        setTimeout(function () { ocupado = false; }, 0);
    }
    var t;
    function luego() { clearTimeout(t); t = setTimeout(colocar, 150); }
    window.addEventListener('resize', luego);
    window.addEventListener('load', luego);
    new MutationObserver(function () { if (!ocupado) { luego(); } }).observe(tabla, { childList: true });
    luego();
})();

/* ── "Crealo vos misma" (menú y pie) va al armador de pulseras del inicio (pedido 2026-11-12). En la tienda apunta a la categoría
   "Dijes gold para cadenas"; acá se cambia el link a /#armar-pulsera. En el inicio cierra el menú y baja suave; desde otra página,
   el inicio baja solo a la sección al llegar (también después de la intro). ── */
(function () {
    'use strict';
    var DESTINO = '/#armar-pulsera';
    function seccion() { return document.getElementById('armar-pulsera'); }
    function bajar(suave) {
        var s = seccion(); if (!s) { return; }
        var y = s.getBoundingClientRect().top + (window.pageYOffset || 0) - 90;
        if (window.lenis) { window.lenis.scrollTo(y, suave ? { duration: 1.4 } : { immediate: true, force: true }); } else { window.scrollTo({ top: y, behavior: suave ? 'smooth' : 'auto' }); }
    }
    function links() {
        [].forEach.call(document.querySelectorAll('a.nav-list-link, a.footer-menu-link'), function (a) {
            if (!/^\s*cre[aá]lo vos misma\s*$/i.test(a.textContent) || a.getAttribute('data-pnt-crealo')) { return; }
            a.setAttribute('data-pnt-crealo', '1');
            a.setAttribute('href', DESTINO);
            a.addEventListener('click', function (e) {
                if (!seccion()) { return; }   // fuera del inicio: el link lleva al inicio y baja al llegar
                e.preventDefault(); e.stopPropagation();
                var cerrar = document.querySelector('#nav-hamburger .js-modal-close');
                if (a.closest('#nav-hamburger') && cerrar) { cerrar.click(); }
                setTimeout(function () { bajar(true); }, a.closest('#nav-hamburger') ? 350 : 0);
                if (history.replaceState) { history.replaceState(null, '', '#armar-pulsera'); }
            }, true);
        });
    }
    function alLlegar() {
        if (location.hash !== '#armar-pulsera' || !seccion()) { return; }
        // la intro del inicio y las fotos cambian el alto de la página: se ubica varias veces mientras se acomoda
        [300, 1200, 2600].forEach(function (ms) { setTimeout(function () { bajar(false); }, ms); });
    }
    function arrancar() { links(); setTimeout(links, 1000); alLlegar(); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})();

/* ── Portada propia por categoría (PENDIENTES 87, 2026-11-12): arriba del listado, un diseño distinto para cada una, con material real
   (fotos de los banners del inicio y videos de "Seguinos en redes"). Solo rosa y blanco; el título grande en Libre Baskerville, como los
   banners de categorías del inicio. Charms: partida con foto · Pulseras: foto a todo el ancho con velo rosa · Aros y Collares: video de
   fondo · Disney: partida invertida · Anillos: franja rosa. La cantidad de productos sale de la tienda (LS.productsCount).
   El lugar se reserva desde el primer cuadro (html.pnt-port-espera, script temprano de layout.tpl / tienda-local.mjs). ── */
(function () {
    'use strict';
    var root = document.documentElement;
    // QUITADAS a pedido del usuario (2026-11-12: "no quiero estos iniciales arriba del todo, quitalos... menos en ofertas"): ninguna
    // categoría lleva portada. La franja "SALE" de Ofertas es aparte y sigue. Para volver a mostrarlas: true acá y la reserva de
    // lugar del script temprano (layout.tpl y ORDEN_TEMPRANO de tienda-local.mjs; respaldo en respaldos/2026-11-12-antes-de-sacar-portada-anillos/).
    var PORTADAS_ACTIVAS = false;
    if (!PORTADAS_ACTIVAS) { root.classList.remove('pnt-port-espera'); return; }
    if (!document.body.classList.contains('template-category') || PNT_OFERTAS.es()) { root.classList.remove('pnt-port-espera'); return; }
    var r = location.pathname;
    var IG = 'https://instagram.com/panthera.ok';
    var P =
        /\/(disney-lovers|charms-panthera\/disney)\//.test(r) ? { v: 'partida der', foto: 'banners/disney.webp', et: 'Colección', t: 'Mundo Disney', x: 'Tus personajes favoritos en plata, para sumar a tu pulsera.', b: 'Armá tu pulsera', u: '/#armar-pulsera' } :
        /\/charms-panthera\//.test(r) ? { v: 'partida', foto: 'banners/charms.webp', et: 'Colección', t: 'Charms', x: 'Charms de plata 925 para contar tu historia en tu pulsera.', b: 'Armá tu pulsera', u: '/#armar-pulsera' } :
        /\/pulseras\//.test(r) ? { v: 'foto', foto: 'banners/pulseras.webp', et: 'Colección', t: 'Pulseras', x: 'La base de tu combinación: elegila y sumale tus charms.', b: 'Armá tu pulsera', u: '/#armar-pulsera' } :
        /\/aros\//.test(r) ? { v: 'video', video: 'redes/video-aritos.mp4', foto: 'redes/video-aritos-poster.webp', et: 'Colección', t: 'Aros', x: 'Argollas, colgantes y ear cuffs para combinar como quieras.', b: 'Armá tu oreja', u: '/#armar-oreja' } :
        /\/collares1?\//.test(r) ? { v: 'video', video: 'redes/video-collares.mp4', foto: 'redes/video-collares-poster.webp', et: 'Colección', t: 'Collares', x: 'Collares y colgantes para combinar con todo.', b: 'Seguinos en Instagram', u: IG, afuera: true } :
        /\/anillos\//.test(r) ? { v: 'franja', et: 'Colección', t: 'Anillos', x: 'Anillos de plata para todos los días.' } :
        null;
    if (!P) { root.classList.remove('pnt-port-espera'); return; }
    var sc = document.querySelector('script[src*="panthera/marca"]');
    var CARPETA = sc ? sc.src.split('?')[0].replace(/marca\.js$/, '') : '';
    var cant = (window.LS && window.LS.productsCount) || 0;
    if (!cant) { [].some.call(document.scripts, function (s) { var m = /productsCount\s*=\s*(\d+)/.exec(s.textContent || ''); if (m) { cant = +m[1]; return true; } return false; }); }
    function nodo(tag, cls, txt) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (txt) { e.textContent = txt; } return e; }

    var sec = nodo('section', 'pnt-port ' + P.v.split(' ').map(function (v) { return 'pnt-port--' + v; }).join(' '));
    var dentro = nodo('div', 'pnt-port-in');
    sec.appendChild(dentro);
    if (P.video && CARPETA) {
        var fv = nodo('div', 'pnt-port-media');
        var v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
        v.poster = CARPETA + P.foto; v.src = CARPETA + P.video;
        fv.appendChild(v); dentro.appendChild(fv);
        var pr = v.play(); if (pr && pr.catch) { pr.catch(function () {}); }
    } else if (P.foto && CARPETA) {
        var fm = nodo('div', 'pnt-port-media');
        var im = document.createElement('img'); im.src = CARPETA + P.foto; im.alt = ''; im.decoding = 'async';
        fm.appendChild(im); dentro.appendChild(fm);
    }
    var tx = nodo('div', 'pnt-port-txt');
    tx.appendChild(nodo('span', 'pnt-port-et', P.et));
    tx.appendChild(nodo('h1', 'pnt-port-tit', P.t));
    tx.appendChild(nodo('p', 'pnt-port-x', P.x));
    var pie = nodo('div', 'pnt-port-pie');
    if (cant) { pie.appendChild(nodo('span', 'pnt-port-cant', cant + (cant === 1 ? ' producto' : ' productos'))); }
    if (P.b && P.u) {
        var a = nodo('a', 'pnt-port-btn', P.b); a.href = P.u;
        if (P.afuera) { a.target = '_blank'; a.rel = 'noopener'; }
        pie.appendChild(a);
    }
    tx.appendChild(pie);
    dentro.appendChild(tx);

    // Franja (sin foto propia, hoy Anillos): a la derecha, las fotos de los tres primeros productos del listado
    if (P.v === 'franja') {
        var fotos = [].slice.call(document.querySelectorAll('.js-product-table .js-item-product img.js-item-image')).slice(0, 3);
        if (fotos.length) {
            var tira = nodo('div', 'pnt-port-tira');
            fotos.forEach(function (f) {
                var src = f.getAttribute('data-srcset') || f.getAttribute('srcset') || f.getAttribute('data-src') || f.getAttribute('src') || '';
                var m = /(\S+)\s+640w/.exec(src) || /(\S+)\s+480w/.exec(src); src = m ? m[1] : src.split(/[\s,]/)[0];
                if (!src || /placeholder/.test(src)) { return; }
                var c = nodo('span', 'pnt-port-tira-it'); var i2 = document.createElement('img'); i2.src = src; i2.alt = ''; i2.decoding = 'async'; c.appendChild(i2); tira.appendChild(c);
            });
            if (tira.children.length) { dentro.appendChild(tira); sec.classList.add('pnt-port--con-tira'); }
        }
    }
    var controles = document.querySelector('.js-category-controls');
    var ancla = controles || document.querySelector('.js-product-table');
    if (!ancla || !ancla.parentNode) { root.classList.remove('pnt-port-espera'); return; }
    ancla.parentNode.insertBefore(sec, ancla);
    root.classList.add('pnt-con-portada');
    root.classList.remove('pnt-port-espera');
})();

/* ── PENDIENTES 93–101 y 111 (2026-11-12) ──────────────────────────────────────────────────────────────────────────────────────
   99  Nombres sin el código interno ("Casiopea corazon - 3991" → "Casiopea corazon"): ficha, pestaña del navegador, carrito y buscador.
       (Checkout y mails los arma Tiendanube: ahí sigue; lo de fondo es limpiar los nombres en el admin.)
   93  Medios de envío: precios sin ",00" y "Gratis" destacado (el diseño en marca.css sección 29).
   94  Medios de pago: cuotas en el mismo formato que el precio ("3 cuotas sin interés de $6.400"), "30% OFF" destacado, "Ver más
       detalles" como botón, y la ventana "Medios de pago" sin centavos.
   100 Variantes de color: "Color: Amarillo" (el nombre del color elegido, al lado del rótulo).
   101 El cartel de WhatsApp no se abre encima de la columna de la ficha (data-wa-evitar, como los armadores).
   111 color-scheme claro y theme-color para la barra del navegador del celular. ── */
(function () {
    'use strict';
    var CODIGO = /\s+[-–—]\s+\d{2,6}(?:\s*[-–—]\s*\w+)?\s*$/;   // " - 3991" al final del nombre

    // 111: barra del navegador del color de la marca y modo claro (también va en layout.tpl; acá para la vista previa)
    function meta(nombre, valor) {
        var m = document.querySelector('meta[name="' + nombre + '"]');
        if (!m) { m = document.createElement('meta'); m.setAttribute('name', nombre); document.head.appendChild(m); }
        if (m.getAttribute('content') !== valor) { m.setAttribute('content', valor); }
    }
    meta('theme-color', '#F4ACC4');
    meta('color-scheme', 'light');

    // 99
    function sinCodigoTexto(t) { return t.replace(CODIGO, ''); }
    function limpiaNombre(el) {
        if (!el || el.getAttribute('data-pnt-sc') === '1') { return; }
        // el último nodo de texto con contenido (el buscador marca la búsqueda con <strong> adentro del nombre)
        var nodos = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        while (w.nextNode()) { if (w.currentNode.nodeValue.trim()) { nodos.push(w.currentNode); } }
        var ult = nodos[nodos.length - 1];
        if (ult && CODIGO.test(ult.nodeValue)) { ult.nodeValue = sinCodigoTexto(ult.nodeValue); }
        el.setAttribute('data-pnt-sc', '1');
    }
    var SEL_NOMBRES = '.js-product-name, [data-component="line-item.name"], [data-component="line-item.name"] a, .js-search-suggest a, .search-suggest-name, .js-cart-item-name';
    function nombres() {
        [].forEach.call(document.querySelectorAll(SEL_NOMBRES), function (el) {
            // los contenedores con un link adentro se limpian por el link
            if (!el.matches('a') && el.querySelector('a')) { return; }
            limpiaNombre(el);
        });
        if (CODIGO.test(document.title.split(' - Comprar')[0])) {
            document.title = document.title.replace(/^(.*?)\s+[-–—]\s+\d{2,6}(\s+[-–—]\s+Comprar)/, '$1$2');
        }
    }

    // Precios sin centavos dentro de un bloque (solo si cambia algo: escribir el mismo texto también dispara a los vigilantes)
    function sinCentavos(raiz) {
        if (!raiz) { return; }
        var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null), n;
        while ((n = w.nextNode())) {
            if (/\$\s?[\d.]+,00\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/(\$\s?[\d.]+),00\b/g, '$1'); }
        }
    }

    // 93: "Gratis" destacado
    function envios(raiz) {
        if (!raiz) { return; }
        sinCentavos(raiz);
        [].forEach.call(raiz.querySelectorAll('[data-component="option.price"]'), function (p) {
            var gratis = /^\s*gratis\s*$/i.test(p.textContent);
            if (p.classList.contains('pnt-gratis') !== gratis) { p.classList.toggle('pnt-gratis', gratis); }
        });
    }

    // 94: cuotas como el resto de la ficha + descuento destacado + botón
    var ICONO = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg>';
    function pagos(caja) {
        if (!caja) { return; }
        var cuo = caja.querySelector('.js-max-installments');
        var n = cuo && (cuo.querySelector('.js-installment-amount') || {}).textContent;
        var v = cuo && (cuo.querySelector('.js-installment-price') || {}).textContent;
        var sinInt = !!caja.querySelector('.installment-no-interest');   // la marca está en la línea de adentro, no en la caja
        var linea = caja.querySelector('.pnt-pago-cuotas');
        var txt = n && v ? '<b>' + n.trim() + ' cuotas' + (sinInt ? ' sin interés' : '') + '</b> de ' + v.trim().replace(/,00$/, '') : '';
        if (txt) {
            if (!linea) { linea = document.createElement('div'); linea.className = 'pnt-pago-cuotas col-12'; cuo.parentNode.insertBefore(linea, cuo); }
            if (linea.getAttribute('data-txt') !== txt) { linea.setAttribute('data-txt', txt); linea.innerHTML = ICONO + '<span>' + txt + '</span>'; }
        }
        var desc = caja.querySelector('.js-product-discount-container .text-accent');
        if (desc && !desc.getAttribute('data-pnt')) {
            var m = /(\d+)\s*%/.exec(desc.textContent);
            if (m) { desc.textContent = m[1] + '% OFF'; desc.setAttribute('data-pnt', '1'); }
        }
        var btn = caja.querySelector('#btn-installments .d-table');
        if (btn && btn.textContent.trim() !== 'Ver todos los medios de pago') { btn.textContent = 'Ver todos los medios de pago'; }
        sinCentavos(caja);
    }

    // 100: "Color: Amarillo"
    function colores() {
        [].forEach.call(document.querySelectorAll('.js-color-variants-container'), function (g) {
            var rot = [].filter.call(g.querySelectorAll('label.form-label'), function (l) { return l.offsetParent || !l.closest('.d-none'); })[0];
            var sel = g.querySelector('.btn-variant.selected');
            if (!rot || !sel) { return; }
            var base = rot.getAttribute('data-pnt-base') || rot.textContent.trim().replace(/:.*$/, '');
            rot.setAttribute('data-pnt-base', base);
            var color = sel.getAttribute('title') || sel.getAttribute('data-option') || '';
            if (rot.getAttribute('data-pnt-color') !== color) { rot.setAttribute('data-pnt-color', color); rot.innerHTML = base + ': <b>' + color + '</b>'; }
        });
    }

    var pend = false;
    function todo() {
        pend = false;
        nombres();
        envios(document.querySelector('#product-shipping-container .js-shipping-calculator-response'));
        envios(document.querySelector('#cart-shipping-container .js-shipping-calculator-response'));
        pagos(document.querySelector('.js-product-payments-container'));
        sinCentavos(document.getElementById('installments-modal'));
        colores();
    }
    function luego() { if (!pend) { pend = true; setTimeout(todo, 80); } }
    function arrancar() {
        // 106: los logos de pagos y envíos del pie son de carga diferida y su fila estaba escondida: se cargan directo
        [].forEach.call(document.querySelectorAll('footer .footer-payments-shipping-logos img[data-src]'), function (im) {
            if (/placeholder/.test(im.getAttribute('src') || '')) { im.src = im.getAttribute('data-src'); im.classList.remove('lazyload'); }
        });
        // 101
        var col = document.querySelector('.template-product .section-single-product > .col');
        if (col) { col.setAttribute('data-wa-evitar', ''); }
        todo();
        // solo cambios de contenido (no de clases: las animaciones y carruseles las cambian todo el tiempo). Lo que esto escribe solo
        // cambia si hace falta, así que no entra en un bucle.
        new MutationObserver(luego).observe(document.body, { childList: true, subtree: true });
        document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.btn-variant')) { setTimeout(colores, 60); } }, true);
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})();

/* ── PENDIENTES 102: la verificación de Cloudflare ("Verifique que es un ser humano") sale oscura cuando el sistema está en modo oscuro.
   La arma Tiendanube con turnstile.render() (render=explicit, onTurnstileLoad): se le agrega theme 'light' a esa llamada. ── */
(function () {
    'use strict';
    function parchar() {
        var t = window.turnstile;
        if (!t || t.__pntClaro || typeof t.render !== 'function') { return !!(t && t.__pntClaro); }
        var orig = t.render;
        t.render = function (el, op) { var o = {}; for (var k in (op || {})) { o[k] = op[k]; } o.theme = 'light'; return orig.call(this, el, o); };
        t.__pntClaro = true;
        return true;
    }
    if (!parchar()) {
        var previa = window.onTurnstileLoad;
        window.onTurnstileLoad = function () { parchar(); return typeof previa === 'function' ? previa.apply(this, arguments) : undefined; };
        var vueltas = 0, iv = setInterval(function () { if (parchar() || ++vueltas > 100) { clearInterval(iv); } }, 50);
    }
})();

/* ── PENDIENTES 108: ícono de la pestaña con la marca. En la tienda lo pone layout.tpl; esto es para la vista previa local (y por si
   Tiendanube agrega el suyo después: el nuestro queda último y gana). ── */
(function () {
    'use strict';
    var sc = document.querySelector('script[src*="panthera/marca"]');
    var CARPETA = sc ? sc.src.split('?')[0].replace(/marca\.js$/, '') : '';
    if (!CARPETA || document.querySelector('link[data-pnt-icono]')) { return; }
    [['icon', '32x32', 'favicon-32.png'], ['icon', '192x192', 'favicon-192.png'], ['apple-touch-icon', '180x180', 'apple-touch-icon.png']].forEach(function (d) {
        var l = document.createElement('link');
        l.rel = d[0]; l.sizes = d[1]; l.href = CARPETA + 'iconos/' + d[2]; l.setAttribute('data-pnt-icono', '');
        if (d[0] === 'icon') { l.type = 'image/png'; }
        document.head.appendChild(l);
    });
})();
