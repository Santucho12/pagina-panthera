/* PANTHERA · Arreglos de las páginas internas (revisión completa de la tienda, 2026-11-12). Archivo aparte de marca.js para no
   chocar con otra sesión que lo edita. Carga después de marca.js. */
(function () {
    'use strict';
    var body = document.body;
    if (!body) { return; }

    // 0. Alto FIJO de pantalla en celular (2026-11-16, pedido: "la altura de las secciones en mobile debería ser fija… abajo aparece algo nativo del
    //    navegador y cuando aparece se achica y cuando desaparece se agranda"). Las unidades vh/dvh/svh/lvh cambian (según el navegador: Safari,
    //    Chrome, el de Instagram) cuando su barra aparece o se esconde, y con ellas el alto del hero, de los armadores 3D, etc. Se miden UNA vez en
    //    píxeles y quedan fijas en variables CSS; se vuelven a medir solo si cambia el ANCHO (girar el celular), nunca por la barra.
    //    --pnt-alto-l = 100lvh (pantalla entera), --pnt-alto-s = 100svh (con la barra a la vista), --pnt-vh = 1vh. Las usa paginas.css (sección 20)
    //    y la última regla de armar3d.css / oreja3d.css (adentro del Shadow DOM las variables llegan igual: se heredan).
    (function () {
        var html = document.documentElement, ancho = -1;
        function mide(u) {
            var d = document.createElement('div');
            d.style.cssText = 'position:absolute;top:0;left:-9999px;width:1px;visibility:hidden;pointer-events:none;height:100' + u;
            body.appendChild(d);
            var h = d.getBoundingClientRect().height;
            body.removeChild(d);
            return h;
        }
        function sirve(u) { return !!(window.CSS && CSS.supports && CSS.supports('height', '100' + u)); }
        function fija() {
            var w = window.innerWidth;
            if (w === ancho) { return; }
            ancho = w;
            var v = mide('vh') || window.innerHeight;
            var l = sirve('lvh') ? mide('lvh') : v;
            var s = sirve('svh') ? mide('svh') : Math.min(v, window.innerHeight);
            if (!l || !s) { return; }
            if (l < s) { l = s; }
            html.style.setProperty('--pnt-alto-l', Math.round(l) + 'px');
            html.style.setProperty('--pnt-alto-s', Math.round(s) + 'px');
            html.style.setProperty('--pnt-vh', (v / 100).toFixed(2) + 'px');
            html.classList.add('pnt-alto-fijo');
        }
        fija();
        window.addEventListener('resize', fija, { passive: true });
        window.addEventListener('orientationchange', function () { setTimeout(function () { ancho = -1; fija(); }, 350); });   // por si midió a mitad del giro
    })();

    // 1. Contacto: el WhatsApp salía como "5492915661062". Se muestra como en el footer: "+54 9 291 566-1062".
    function telefono(n) {
        var m = String(n).replace(/\D/g, '').match(/^54(9)?(\d{3})(\d{3})(\d{4})$/);
        return m ? '+54 ' + (m[1] ? '9 ' : '') + m[2] + ' ' + m[3] + '-' + m[4] : '';
    }
    if (body.classList.contains('template-contact')) {
        Array.prototype.forEach.call(document.querySelectorAll('a.btn-link[href*="wa.me/"]'), function (a) {
            Array.prototype.forEach.call(a.childNodes, function (n) {
                if (n.nodeType !== 3 || !/\d{8,}/.test(n.textContent)) { return; }
                var lindo = telefono(n.textContent.trim());
                if (lindo) { n.textContent = ' ' + lindo + ' '; }
            });
        });
        // 1b. (2026-11-13) Las dos direcciones venían en una sola fila ("Av. … 2153, Bahía Blanca - Dorrego 286, Monte Hermoso"):
        //     una fila por local, con la ciudad arriba.
        Array.prototype.forEach.call(document.querySelectorAll('.footer-menu-item'), function (li) {
            if (!li.closest('.template-contact main, .template-contact section, .template-contact .container') || !li.querySelector('svg')) { return; }
            var txt = li.textContent.replace(/\s+/g, ' ').trim();
            var partes = txt.split(/\s+-\s+/);
            if (partes.length < 2 || !partes.every(function (p) { return /\d/.test(p) && /,/.test(p); })) { return; }
            var molde = li.cloneNode(true);
            partes.forEach(function (p, i) {
                var fila = i ? molde.cloneNode(true) : li;
                var c = p.lastIndexOf(','), dir = p.slice(0, c).trim(), ciudad = p.slice(c + 1).trim();
                Array.prototype.forEach.call(fila.childNodes, function (n) { if (n.nodeType === 3) { n.textContent = ''; } });
                var caja = document.createElement('span');
                caja.innerHTML = '<span class="pnt-local-ciudad"></span><span class="pnt-local-dir"></span>';
                caja.firstChild.textContent = ciudad; caja.lastChild.textContent = dir;
                fila.appendChild(caja);
                if (i) { li.parentNode.appendChild(fila); }
            });
        });
        // 2. Botón de arrepentimiento: la página se titulaba "Contacto".
        if (/[?&]order_cancellation/.test(location.search)) {
            var h1 = document.querySelector('h1');
            if (h1) { h1.textContent = 'Botón de arrepentimiento'; }
            document.title = 'Botón de arrepentimiento - PANTHERA';
        }
    }

    // 3. Aviso "Seguí acá tu última compra" (ítem 97 de PENDIENTES.md): Lima lo pone adentro del encabezado y rompía la isla de la
    //    navbar. Se lo lleva al final del <body> (sigue siendo el mismo elemento: Lima lo muestra y lo cierra igual). paginas.css lo
    //    dibuja como una píldora de vidrio flotante.
    var pedido = document.querySelector('.js-head-main .js-notification-status-page');
    if (pedido) { body.appendChild(pedido); }

    // 4. (2026-11-13) Carrito (página y carrito lateral, que es la misma página): precios sin ",00", como en las tarjetas y la ficha.
    //    Lima reescribe los montos al cambiar cantidades: se vuelve a limpiar, y solo se escribe si hay un ",00" (no se realimenta).
    if (body.classList.contains('template-cart')) {
        var limpia = function () {
            var raiz = document.getElementById('shoppingCartPage') || body;
            var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), n;
            // (2026-11-13) también "$ 134.940" → "$134.940": al calcular el envío, Lima reescribe el total y el precio con transferencia
            // con un espacio después del "$"; el resto de los precios de la tienda van pegados
            while ((n = w.nextNode())) {
                if (/\$\s?[\d.]+,00/.test(n.nodeValue) || /\$\s+\d/.test(n.nodeValue)) {
                    n.nodeValue = n.nodeValue.replace(/(\$\s?[\d.]+),00/g, '$1').replace(/\$\s+(?=\d)/g, '$');
                }
            }
        };
        limpia();
        // el cartel de WhatsApp no se abre encima del resumen con "Iniciar compra" (marca.js lo hace esperar si tapa algo con [data-wa-evitar])
        var resumen = document.getElementById('cart-sticky-summary');
        if (resumen) { resumen.setAttribute('data-wa-evitar', ''); }
        var t;
        new MutationObserver(function () { clearTimeout(t); t = setTimeout(limpia, 30); })
            .observe(document.getElementById('shoppingCartPage') || body, { childList: true, subtree: true, characterData: true });
    }

    // 5. (2026-11-13) Filtro de precio aplicado: "$999999 a $9999999" → "$999.999 a $9.999.999", como el resto de los precios
    Array.prototype.forEach.call(document.querySelectorAll('.js-remove-filter.chip'), function (c) {
        var w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT), n;
        while ((n = w.nextNode())) {
            if (/\$\d{4,}/.test(n.nodeValue)) {
                n.nodeValue = n.nodeValue.replace(/\$(\d{4,})/g, function (m, d) { return '$' + d.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); });
            }
        }
    });

    // 6. (2026-11-13, revisión a fondo) Escape cierra la ventana de Lima que esté abierta (menú, buscador, filtros, medios de pago…).
    //    Lima no lo hacía. Se usa su propio cierre: el fondo de la ventana (o su cruz), así también se cierran los submenús.
    //    El carrito lateral y la foto ampliada tienen su propio Escape.
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || e.defaultPrevented) { return; }
        if (document.documentElement.classList.contains('pnt-cp-abierto') || document.querySelector('.fancybox__container')) { return; }
        var abiertas = document.querySelectorAll('.js-modal.modal-show');
        var m = abiertas[abiertas.length - 1];
        if (!m || !m.id) { return; }
        var fondo = document.querySelector('.js-modal-overlay[data-modal-id="#' + m.id + '"]');
        var cruz = m.querySelector('.js-modal-close');
        if (fondo && fondo.offsetParent !== null) { fondo.click(); }
        else if (cruz) { cruz.click(); }
        else { return; }
        if (m.id === 'nav-hamburger' && typeof window.closeHamburgerSubpanels === 'function') { window.closeHamburgerSubpanels(); }
    });

    // 7. (2026-11-13) Ficha: con un modelo agotado, debajo de la cantidad decía "0 en stock" (o " en stock" sin número): se esconde, porque
    //    el botón ya dice "Sin stock". Con 1 también, si está el aviso "¡No te lo pierdas, es el último!" (Lima lo muestra justo con 1):
    //    decían lo mismo dos veces. Lima reescribe el número al cambiar de modelo: se vuelve a mirar cada vez (solo escribe si cambia).
    if (body.classList.contains('template-product')) {
        var stocks = document.querySelectorAll('.js-product-stock');
        var hayUltimo = Array.prototype.some.call(document.querySelectorAll('.js-product-form .text-accent'), function (e) { return /[uú]ltimo/i.test(e.textContent || ''); });
        var revisaStock = function () {
            Array.prototype.forEach.call(stocks, function (s) {
                var caja = s.parentElement;
                var n = (s.textContent || '').trim();
                var esconder = n === '' || n === '0' || (n === '1' && hayUltimo);
                if (caja && caja.classList.contains('pnt-stock-oculto') !== esconder) { caja.classList.toggle('pnt-stock-oculto', esconder); }
            });
        };
        revisaStock();
        Array.prototype.forEach.call(stocks, function (s) {
            new MutationObserver(revisaStock).observe(s, { childList: true, characterData: true, subtree: true });
        });
    }

    // 7b. (2026-11-13) Ventana "Medios de pago" de la ficha: "Total: $65.000 $ 36.400" → "$36.400" (Lima escribe el total con descuento
    //     con un espacio después del "$"; el resto de los precios van pegados). Lima reescribe montos al cambiar de modelo: se vuelve a mirar.
    var pagos = document.getElementById('installments-modal');
    if (pagos) {
        var pegaPesos = function () {
            var w = document.createTreeWalker(pagos, NodeFilter.SHOW_TEXT), n;
            while ((n = w.nextNode())) { if (/\$\s+\d/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\$\s+(?=\d)/g, '$'); } }
        };
        pegaPesos();
        var tp;
        new MutationObserver(function () { clearTimeout(tp); tp = setTimeout(pegaPesos, 40); }).observe(pagos, { childList: true, subtree: true, characterData: true });
    }

    // 7c. (2026-11-13) Contacto / Botón de arrepentimiento y newsletter del pie: ningún campo era obligatorio en la página, así que se podía
    //     mandar vacío (lo rechazaba recién la tienda, después de cargar otra página). Nombre, email y mensaje obligatorios (el teléfono
    //     no); el navegador avisa qué falta antes de enviar. El campo escondido anti-spam ("winnie-pooh") no se toca.
    Array.prototype.forEach.call(document.querySelectorAll('form.js-winnie-pooh-form [name="name"], form.js-winnie-pooh-form [name="email"], form.js-winnie-pooh-form [name="message"], footer form [type="email"][name="email"]'), function (c) {
        c.required = true;
    });
    //     Lo mismo en "Crear cuenta" (nombre, email y las dos contraseñas; el teléfono no) y "Olvidé mi contraseña" (email). El inicio de
    //     sesión ya los tenía obligatorios.
    if (/^\/account\/(register|reset)\/?$/.test(location.pathname)) {
        Array.prototype.forEach.call(document.querySelectorAll('form.js-form [name="name"], form.js-form [name="email"], form.js-form [name="password"], form.js-form [name="password_confirmation"]'), function (c) {
            if (!c.closest('footer')) { c.required = true; }
        });
    }

    // 7d. (2026-11-13) WhatsApp en celular/tablet: en compu el botón flotante abre el chat con un saludo ("¡Hola! Te escribo desde la web de
    //     Panthera. Quería consultar por: …"); marca.js lo pone junto con el cartel, que en pantallas táctiles no se usa, así que en el celular
    //     el chat se abría vacío. Mismo saludo (mismos textos que marca.js), armado también al tocarlo por si cambió el título.
    var waBtn = document.querySelector('a.btn-whatsapp');
    if (waBtn) {
        var waSaludo = function () {
            var href = waBtn.getAttribute('href') || '';
            if (!href || href.indexOf('?text=') !== -1 || !/wa\.me|whatsapp/.test(href)) { return; }
            var b = body.classList, s = '¡Hola! Te escribo desde la web de Panthera. ', msg;
            if (b.contains('template-product')) {
                var t = document.querySelector('h1');
                msg = s + 'Quería consultar por: ' + (t ? t.textContent.trim() : 'un producto') + ' (' + location.href + ')';
            } else if (b.contains('template-category')) { msg = s + 'Quería consultar por los productos de esta categoría.'; }
            else if (b.contains('template-cart')) { msg = s + 'Tengo una consulta con mi pedido.'; }
            else { msg = s + 'Quería hacerles una consulta.'; }
            waBtn.setAttribute('href', href.split('?')[0] + '?text=' + encodeURIComponent(msg));
        };
        setTimeout(waSaludo, 1500);   // después de marca.js (en compu ya lo puso: no se toca)
        waBtn.addEventListener('click', waSaludo, true);
    }

    // 7e. (2026-11-13) El cartel de WhatsApp (compu, abajo a la derecha) quedaba ENCIMA de controles que están pegados al borde derecho: la
    //     flecha de las reseñas, las de "Te va a interesar", los botones de "Cómo cuidar tu plata" y las flechas de los carruseles. Al tocarlos
    //     se abría WhatsApp. marca.js hace esperar al cartel si tapa algo con [data-wa-evitar] (lo busca cada vez): se marcan esos controles.
    //     Se crean después (marca.js / Swiper): se vuelve a marcar un par de veces.
    //     (2026-11-14) También los puntitos de los carruseles del inicio, el "Ver todos" de abajo de cada carrusel y "Ver toda la colección"
    //     de Disney: en una notebook de 1366×657 el cartel tapaba los puntitos de "Los más elegidos" y el toque le llegaba al cartel. Y los
    //     botones "Ordenar" y "Filtrar" de los listados: en esa notebook el cartel quedaba encima de "Ordenar" de Ofertas (no se podía ordenar).
    var evitarWa = function () {
        Array.prototype.forEach.call(document.querySelectorAll('.pnt-res-flecha, .pnt-rel-flechas > *, .section-products-related .swiper-button-next, .section-products-related .swiper-button-prev, .pnt-cu-item .pnt-cu-btn, .pnt-mv-flechas > *, .pnt-desliza-puntos button, .pnt-mv-mas-btn, .pnt-di .pnt-s-btn, .pnt-orden-btn, .pnt-filtrar-btn, [data-toggle="#nav-filters"]'), function (e) {
            if (!e.hasAttribute('data-wa-evitar')) { e.setAttribute('data-wa-evitar', ''); }
        });
    };
    evitarWa();
    setTimeout(evitarWa, 2500);
    setTimeout(evitarWa, 6000);
    //     marca.js revisa si tapa algo al abrirse y al mover la página, pero las secciones entran animadas (suben unos px después del scroll):
    //     una flecha podía terminar debajo del cartel ya abierto. Mientras está abierto se mira cada 0,4 s; si tapa algo marcado, se esconde
    //     (marca.js lo vuelve a intentar en su próxima vuelta y espera si sigue tapando). Con 12 px de aire.
    setInterval(function () {
        var g = document.querySelector('.wa-globo.is-open');
        if (!g) { return; }
        var a = g.getBoundingClientRect();
        var tapa = Array.prototype.some.call(document.querySelectorAll('[data-wa-evitar]'), function (e) {
            var b = e.getBoundingClientRect();
            return b.width > 0 && b.bottom > a.top - 12 && b.top < a.bottom + 12 && b.right > a.left - 12 && b.left < a.right + 12;
        });
        if (tapa) { g.classList.remove('is-open'); }
    }, 400);

    // 7f. (2026-11-13) Pestaña de la ficha sin el código interno también cuando el producto tiene un título propio cargado en el admin (SEO):
    //     "Colgante gold con inicial en circonios grande - 4034" quedaba igual (marca.js limpia solo "Nombre - 1234 - Comprar en PANTHERA").
    if (body.classList.contains('template-product')) {
        var tituloSinCodigo = function () {
            var t = document.title;
            if (/\s+[-–—]\s+\d{2,6}\s*$/.test(t)) { document.title = t.replace(/\s+[-–—]\s+\d{2,6}\s*$/, ''); }
        };
        tituloSinCodigo();
        setTimeout(tituloSinCodigo, 1500);
    }

    // 7g. (2026-11-13) Pestaña de las páginas de texto pareja con el resto ("Contacto - PANTHERA", "Carrito de Compras - PANTHERA"):
    //     venían "Cuidados", "Tienda Online de PANTHERA - Envíos" y "Política de Cambios-Garantías-Devoluciones" (títulos SEO del admin;
    //     lo que lee Google se corrige allá, ver PARA-PANTHERA.md). Se usa el título de la página.
    if (body.classList.contains('template-page')) {
        var h1p = document.querySelector('h1, .h1');
        var nombreP = h1p ? (h1p.textContent || '').trim().replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ') : '';
        if (nombreP && nombreP.length < 70) { document.title = nombreP + ' - PANTHERA'; }
    }
    //     Y si la pestaña dice solo "PANTHERA" (pasa en "Olvidé mi contraseña"), se le suma el título de la página.
    if (/^\s*PANTHERA\s*$/i.test(document.title) && !body.classList.contains('template-home')) {
        var h1q = document.querySelector('h1, .h1');
        var nombreQ = h1q ? (h1q.textContent || '').trim().replace(/\s+/g, ' ') : '';
        if (nombreQ && nombreQ.length < 70) { document.title = nombreQ + ' - PANTHERA'; }
    }

    // 8. (2026-11-13) Los nombres de las tarjetas van en 2 renglones como máximo (paginas.css): al pasar el mouse se ve el nombre entero.
    //    Las tarjetas se arman después (marca.js) y llegan más con "Ver más productos": se les pone el título cuando aparecen.
    var titulos = function () {
        Array.prototype.forEach.call(document.querySelectorAll('.pnt-mv-nombre:not([title])'), function (n) {
            var t = (n.textContent || '').trim();
            if (t) { n.setAttribute('title', t); }
        });
    };
    // 10. (2026-11-14) La tarjeta roja "Ofertas · Hasta −20% · Ver todas" de "No los dejes escapar" (y su "Ver todos", si aparece) llevaba
    //     a "Todos los productos": marca.js le pone el "Ver todos" de Lima, que es de antes de que existiera la página de Ofertas. Va al
    //     mismo lugar que el botón "Ofertas" del cartel del inicio (si cambia ese link, la tarjeta lo sigue).
    var portadaOfertas = function () {
        var botones = document.querySelectorAll('[data-store="home-products-sale"] a.pnt-mv-portada, [data-store="home-products-sale"] a.pnt-mv-mas-btn');
        if (!botones.length) { return; }
        var ref = document.querySelector('a.pnt-hero-cartel-btn[href*="ofertas"], #nav-hamburger a[href*="ofertas"]');
        var urlOfertas = (ref && ref.getAttribute('href')) || (window.PNT_OFERTAS && window.PNT_OFERTAS.url) || '/ofertas/?sort_by=created-descending';   // (2026-11-16) la categoría Ofertas
        Array.prototype.forEach.call(botones, function (b) { if (b.getAttribute('href') !== urlOfertas) { b.setAttribute('href', urlOfertas); } });
    };
    var alAparecer = function () { titulos(); portadaOfertas(); evitarWa(); };

    // 12. (2026-11-14) Lima define offsetCategories() solo si la página se cargó con menos de 768 px de ancho, pero la llama al bajar si el
    //     ancho ACTUAL es menor: al girar el celular (se abre acostado, 844 px, y se pone parado) cada scroll en un listado tiraba
    //     "offsetCategories is not defined". Si no existe, queda una vacía (si Lima la define, la suya manda).
    if (typeof window.offsetCategories === 'undefined') { window.offsetCategories = function () {}; }

    // 11. (2026-11-14) Lupa de 768 a 1023 px (tablets, celular acostado; ahí marca.css muestra la lupa sola en vez de la pastilla "Buscar"):
    //     Lima, al cargar, si la pantalla mide MÁS de 768 px le saca a la lupa la apertura del panel (#nav-search) y le pone su buscador
    //     flotante de compu: con el celular acostado o un iPad parado (820/834 px) aparecía un campo blanco suelto encima de la barra, sin
    //     sugerencias ni forma de cerrarlo, y el panel no se abría. Y a 768 justo abría el panel pero el foco iba a ese campo flotante (había
    //     que volver a tocar el campo para escribir). En ese rango la lupa abre el panel, como en el celular y como la pastilla de compu
    //     (marca.js), con el campo listo para escribir (en el mismo toque, así en iPad sale el teclado; y por las dudas, un momento después).
    var focoBuscador = function () {
        var panel = document.getElementById('nav-search');
        var campo = panel && panel.querySelector('.js-search-input');
        if (campo && panel.classList.contains('modal-show') && document.activeElement !== campo) {
            try { campo.focus({ preventScroll: true }); } catch (er) { campo.focus(); }
        }
    };
    document.addEventListener('click', function (e) {
        if (!(e.target && e.target.closest && e.target.closest('.js-search-button'))) { return; }
        var ancho = window.innerWidth;
        if (ancho >= 768 && ancho <= 1023 && typeof window.modalOpen === 'function' && document.getElementById('nav-search')) {
            e.preventDefault();
            e.stopPropagation();   // (en la captura) no llega al buscador flotante de Lima ni a su foco
            window.modalOpen('#nav-search');
        }
        focoBuscador();
        setTimeout(focoBuscador, 80);
        setTimeout(focoBuscador, 350);
    }, true);

    alAparecer();
    var tt;
    new MutationObserver(function () { clearTimeout(tt); tt = setTimeout(alAparecer, 120); }).observe(body, { childList: true, subtree: true });

    // 9. (2026-11-14) "Mundo Disney": la tira corre sola (animación CSS) y sus fotos tienen loading="lazy". Chrome mide esa distancia
    //    para arriba y para abajo, no hacia el costado: cada foto se pedía recién al entrar en pantalla y en celular pasaban cuadros grises
    //    hasta que bajaba. Cuando la sección se acerca se piden todas (son las mismas 5 fotos repetidas para que la cinta no se corte).
    var disney = document.querySelector('.pnt-di');
    if (disney) {
        var pedirDisney = function () {
            Array.prototype.forEach.call(disney.querySelectorAll('img[loading="lazy"]'), function (i) { i.loading = 'eager'; });
        };
        if ('IntersectionObserver' in window) {
            var ioDi = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { pedirDisney(); ioDi.disconnect(); } }, { rootMargin: '1800px 0px' });   // (2026-11-15) antes 900 px: bajando a ritmo normal llegaban vacías
            ioDi.observe(disney);
        } else { pedirDisney(); }
    }
})();

/* 13. (2026-11-15, pedido: "que las fotos, productos y videos carguen siempre y rápido") Fotos de productos ANTES de que se vean.
   La tienda (Lima) usa lazysizes y a las fotos de los productos les pone data-expand="-10" (se piden recién cuando ya están 10 px ADENTRO de la
   pantalla): bajando a ritmo normal, las tarjetas aparecían vacías ~0,2–0,3 s cada una (medido con
   herramientas/revision/analisis-fluidez.mjs). lazysizes acepta, foto por foto, el atributo data-expand (a cuántos px de la pantalla empezar):
   se lo ponemos a todas sus fotos (1,5 pantallas) y la tienda las pide antes, con todas sus reglas (srcset, tamaño de cada tarjeta, la foto
   chica que baja primero). También alcanza hacia los costados: las tarjetas de los carruseles que todavía no se deslizaron.
   (Primero se probó lazySizes.loader.unveil: no carga las fotos cuya versión chica todavía no bajó, que son justamente las de más abajo.) */
(function () {
    var EXP = String(Math.round(Math.max(window.innerHeight || 0, 600) * 1.5));
    var pendiente = 0;
    function marcar() {
        var nuevas = 0;
        // también las que la tienda marcó con data-expand="-10" (las fotos de los productos: se pedían recién 10 px ADENTRO de la pantalla)
        // SOLO las que se ven (tienen tamaño): cada tarjeta trae una 2.ª foto escondida (la del mouse encima) que mide 0×0 y con un alcance grande
        // quedaba siempre "en rango": se bajaban todas y ocupaban los 8 lugares de carga de lazysizes (las visibles esperaban)
        Array.prototype.forEach.call(document.querySelectorAll('img.lazyload:not([data-pnt-exp])'), function (i) {
            if (!i.offsetWidth || !i.offsetHeight) { return; }
            i.setAttribute('data-pnt-exp', ''); i.setAttribute('data-expand', EXP); nuevas++;
        });
        if (nuevas && window.lazySizes && window.lazySizes.loader && window.lazySizes.loader.checkElems) { window.lazySizes.loader.checkElems(); }
    }
    function arrancar() {
        marcar();
        new MutationObserver(function () { if (!pendiente) { pendiente = setTimeout(function () { pendiente = 0; marcar(); }, 300); } }).observe(document.body, { childList: true, subtree: true });
        // también al bajar (cada medio segundo como mucho): las fotos de un carrusel que se arma después ("Te va a interesar") miden 0 hasta que
        // el carrusel se acomoda, y eso no agrega nodos: sin esto se quedaban con el alcance de la tienda (-10 px)
        var ultimo = 0;
        window.addEventListener('scroll', function () { var t = Date.now(); if (t - ultimo > 500 && !pendiente) { ultimo = t; pendiente = setTimeout(function () { pendiente = 0; marcar(); }, 60); } }, { passive: true });
        setTimeout(marcar, 1500); setTimeout(marcar, 4000);
    }
    // recién con la página cargada (las fotos de la primera pantalla van primero)
    if (document.readyState === 'complete') { setTimeout(arrancar, 200); } else { window.addEventListener('load', function () { setTimeout(arrancar, 200); }); }
})();

/* 14. (2026-11-15) El inicio guardaba qué productos estaban en "No los dejes escapar" para la ficha. Sacado el 2026-11-16: desde que existe la
   categoría Ofertas, la ficha mira si el producto está en esa categoría (marca.js, EN_OFERTAS). */

/* 15. (2026-11-15, pedido: "en mobile, cuando pongo el dedo encima de las categorías, debería funcionar como el hover") Mientras el dedo está apoyado en
   un banner de categoría, .pnt-toque (paginas.css): la foto se agranda y el velo se aclara. Si el dedo se desliza (es un scroll) se apaga. */
(function () {
    var activo = null, x0 = 0, y0 = 0, t = 0;
    function apagar(b, ms) { clearTimeout(t); if (!b) { return; } t = setTimeout(function () { b.classList.remove('pnt-toque'); }, ms || 0); }
    document.addEventListener('touchstart', function (e) {
        var b = e.target.closest ? e.target.closest('.pnt-banner') : null;
        if (activo && activo !== b) { activo.classList.remove('pnt-toque'); }
        activo = b; if (!b) { return; }
        clearTimeout(t); b.classList.add('pnt-toque');
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
        if (!activo) { return; }
        var d = Math.abs(e.touches[0].clientX - x0) + Math.abs(e.touches[0].clientY - y0);
        if (d > 14) { activo.classList.remove('pnt-toque'); activo = null; }
    }, { passive: true });
    document.addEventListener('touchend', function () { apagar(activo, 450); activo = null; }, { passive: true });
    document.addEventListener('touchcancel', function () { apagar(activo, 0); activo = null; }, { passive: true });
})();

/* 16. (2026-11-15, pedido: "en mobile un solo botón de filtro: Novedades y Filtrar deben estar dentro, todo en uno, a la derecha")
   En el celular "Ordenar" pasa ADENTRO del panel de filtros (arriba de todo, "Ordenar por" con las opciones en píldoras) y en la página queda un solo
   botón, "Filtrar", a la derecha. Las opciones son las del desplegable de marca.js (sección 11): tocar una toca esa opción del desplegable (mismo
   enlace y misma lógica, también en Ofertas). En compu y tablet no cambia nada (paginas.css 16 e). Si la página no tiene panel de filtros, el
   desplegable de orden sigue como estaba. */
(function () {
    'use strict';
    var cl = document.body.classList;
    if (!cl.contains('template-category') && !cl.contains('template-search')) { return; }
    function armar() {
        var ops = document.querySelectorAll('.pnt-orden-op');
        var cuerpo = document.querySelector('#nav-filters .modal-body');
        if (!ops.length || !cuerpo || !document.querySelector('.pnt-filtrar-btn')) { return false; }
        if (cuerpo.querySelector('.pnt-fo')) { return true; }
        var caja = document.createElement('div');
        caja.className = 'pnt-fo';
        var titulo = document.createElement('h5');
        titulo.className = 'font-big mb-3';
        titulo.textContent = 'Ordenar por';
        var lista = document.createElement('div');
        lista.className = 'pnt-fo-ops';
        lista.setAttribute('role', 'group');
        lista.setAttribute('aria-label', 'Ordenar por');
        Array.prototype.forEach.call(ops, function (op) {
            var activa = op.classList.contains('is-activa');
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'pnt-fo-op' + (activa ? ' is-activa' : '');
            b.setAttribute('aria-pressed', activa ? 'true' : 'false');
            b.textContent = (op.querySelector('span') || op).textContent.trim();
            b.addEventListener('click', function () { if (!activa) { op.click(); } });
            lista.appendChild(b);
        });
        caja.appendChild(titulo);
        caja.appendChild(lista);
        cuerpo.insertBefore(caja, cuerpo.firstChild);
        document.documentElement.classList.add('pnt-orden-en-filtros');
        return true;
    }
    if (!armar()) {
        var n = 0;
        var t = setInterval(function () { if (armar() || ++n > 24) { clearInterval(t); } }, 250);
    }
})();

/* 17. "Crealo vos misma" en el menú de la hamburguesa (pedido 2026-11-16): arriba de Collares y con dos opciones adentro, "Combiná tus charms/dijes"
   (→ Armá tu pulsera del inicio) y "Combiná tus aritos" (→ Armá tu oreja del inicio). El ítem abre y cierra las dos opciones. En el inicio cierra
   el menú y baja suave; desde otra página va al inicio y baja al llegar (#armar-pulsera / #armar-oreja). */
(function () {
    'use strict';
    var OPCIONES = [['Combiná tus charms/dijes', 'armar-pulsera'], ['Combiná tus aritos', 'armar-oreja']];
    // (2026-11-16, "me lleva mal, tarda, hay saltos") Se baja recién cuando el menú terminó de cerrarse (mientras está abierto la página está
    // trabada y Lenis ignora el pedido), con force, más corto (0,9 s) y una corrección final sin animación si el alto de la página cambió.
    function destino(id) {
        var s = document.getElementById(id); if (!s) { return null; }
        var arriba = window.innerWidth <= 767 ? 70 : 130;       // en celular la barra se esconde al llegar al 3D
        return s.getBoundingClientRect().top + (window.pageYOffset || 0) - arriba;
    }
    function bajar(id, suave) {
        var y = destino(id); if (y === null) { return false; }
        if (window.lenis) { window.lenis.scrollTo(y, suave ? { duration: 0.9, force: true, onComplete: function () { var y2 = destino(id); if (y2 !== null && Math.abs(y2 - y) > 30) { window.lenis.scrollTo(y2, { immediate: true, force: true }); } } } : { immediate: true, force: true }); }
        else { window.scrollTo({ top: y, behavior: suave ? 'smooth' : 'auto' }); }
        return true;
    }
    function armar() {
        var nav = document.getElementById('nav-hamburger'); if (!nav) { return false; }
        var a = [].filter.call(nav.querySelectorAll('a.nav-list-link'), function (x) { return /^\s*cre[aá]lo vos misma\s*$/i.test(x.textContent); })[0];
        if (!a) { return false; }
        var li = a.closest('li'); if (!li || li.getAttribute('data-pnt-crealo2')) { return true; }
        li.setAttribute('data-pnt-crealo2', '1');
        // arriba de Collares
        var col = [].filter.call(nav.querySelectorAll('a.nav-list-link'), function (x) { return /^\s*collares\s*$/i.test(x.textContent); })[0];
        var liCol = col && col.closest('li');
        if (liCol && liCol.parentNode === li.parentNode) { li.parentNode.insertBefore(li, liCol); }
        // (2026-11-16) Orden pedido: Ofertas, Pulseras, Charms/Dijes, Aros, Crealo vos misma, Anillos, Collares, Disney y el resto como venía
        var ORDEN = [/^ofertas$/, /^pulseras$/, /^charms/, /^aros$/, /^cre[aá]lo vos misma$/, /^anillos$/, /^collares$/, /^disney$/];
        var lis = [].slice.call(li.parentNode.children), primero = lis[0];
        ORDEN.slice().reverse().forEach(function (re) {
            var it = lis.filter(function (x) { var l = x.querySelector(':scope > a.nav-list-link, :scope > .nav-list-link, a.nav-list-link'); return l && re.test(l.textContent.trim().toLowerCase()); })[0];
            if (it) { li.parentNode.insertBefore(it, li.parentNode.firstChild); }
        });
        // (2026-11-16) "Aros debería ir abajo de Pulseras y arriba de Crealo vos misma" (ya lo hace ORDEN; queda por si el nombre cambia)
        var aros = [].filter.call(nav.querySelectorAll('a.nav-list-link'), function (x) { return /^\s*aros\s*$/i.test(x.textContent); })[0];
        var liAros = aros && aros.closest('li');
        if (liAros && liAros.parentNode === li.parentNode) { li.parentNode.insertBefore(liAros, li); }
        // (2026-11-16, pedido: "Todos los productos debería ser un botón que lleve a todos los productos, no que vuelvan a aparecer las subcategorías")
        [].forEach.call(nav.querySelectorAll('li.item-with-subitems > a.js-toggle-menu-panel'), function (t) {
            if (!/^\s*todos los productos\s*$/i.test(t.textContent)) { return; }
            var p = t.parentNode.querySelector(':scope > .js-menu-panel');
            var ver = p && p.querySelector('a.nav-list-link[href]:not([href="#"])');
            var n = document.createElement('a');
            n.className = 'nav-list-link position-relative';
            n.href = (ver && ver.getAttribute('href')) || '/productos/';
            if (!/sort_by=/.test(n.getAttribute('href'))) { n.href = n.getAttribute('href') + (n.getAttribute('href').indexOf('?') < 0 ? '?' : '&') + 'sort_by=created-descending'; }
            n.textContent = 'Ver todos los productos';      // (2026-11-16) pedido: "debería decir Ver todos los productos"
            t.parentNode.replaceChild(n, t);
            if (p) { p.remove(); }
            n.parentNode.classList.remove('item-with-subitems');
        });
        // (2026-11-16, "quiero que funcione igual que las otras categorías y subcategorías") Mismo armado que los ítems de Lima con subcategorías:
        // el ítem con la flecha rosa abre un panel que entra desde la derecha, con "‹ Crealo vos misma" arriba para volver y las dos opciones.
        // Se copia el panel de otro ítem con subcategorías (su cabecera y estilos) y se le ponen los clics a mano (Lima los engancha al cargar).
        var modelo = [].filter.call(nav.querySelectorAll('li.item-with-subitems'), function (x) { return x !== li && x.querySelector(':scope > .js-menu-panel'); })[0];
        if (!modelo) { return true; }
        var linkModelo = modelo.querySelector(':scope > a.js-toggle-menu-panel');
        var b = linkModelo.cloneNode(true);
        b.className = linkModelo.className.replace(/\bselected\b/, '');
        b.setAttribute('href', '#');
        b.setAttribute('data-pnt-crealo', '1');      // (2026-11-16) así marca.js no le vuelve a poner su clic que lleva al armador de pulseras
        b.firstChild.nodeValue = a.textContent.trim();
        [].forEach.call(b.childNodes, function (n) { if (n.nodeType === 3 && n !== b.firstChild) { n.nodeValue = ''; } });
        a.parentNode.replaceChild(b, a);
        li.classList.add('item-with-subitems');
        var panel = modelo.querySelector(':scope > .js-menu-panel').cloneNode(true);
        panel.style.display = 'none'; panel.classList.remove('nav-list-panel-show');
        [].slice.call(panel.children).forEach(function (n) { if (!n.classList.contains('modal-header')) { n.remove(); } });
        var tit = panel.querySelector('.js-toggle-menu-back .col.pl-2'); if (tit) { tit.textContent = b.firstChild.nodeValue; }
        OPCIONES.forEach(function (o) {
            var it = document.createElement('li'); it.className = 'nav-item';
            var l = document.createElement('a'); l.className = 'nav-list-link position-relative'; l.href = '/#' + o[1]; l.textContent = o[0];
            l.addEventListener('click', function (e) {
                if (!document.getElementById(o[1])) { return; }
                e.preventDefault();
                var cerrar = document.querySelector('#nav-hamburger .js-modal-close'); if (cerrar) { cerrar.click(); }
                (function espera(n) { if (document.querySelector('#nav-hamburger.modal-show') && n < 20) { setTimeout(function () { espera(n + 1); }, 60); return; } setTimeout(function () { bajar(o[1], true); }, 120); })(0);
                if (history.replaceState) { history.replaceState(null, '', '#' + o[1]); }
            });
            it.appendChild(l); panel.appendChild(it);
        });
        li.appendChild(panel);
        b.addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            panel.style.display = ''; requestAnimationFrame(function () { panel.classList.add('nav-list-panel-show'); });
        }, true);
        var volver = panel.querySelector('.js-toggle-menu-back');
        if (volver) { volver.addEventListener('click', function (e) { e.preventDefault(); panel.classList.remove('nav-list-panel-show'); setTimeout(function () { panel.style.display = 'none'; }, 600); }); }
        var x = panel.querySelector('.js-toggle-menu-close');
        if (x) { x.addEventListener('click', function () { var c = [].filter.call(document.querySelectorAll('#nav-hamburger .js-modal-close'), function (k) { return !panel.contains(k); })[0]; if (c) { c.click(); } panel.classList.remove('nav-list-panel-show'); setTimeout(function () { panel.style.display = 'none'; }, 600); }); }
        return true;
    }
    if (!armar()) { var n = 0, t = setInterval(function () { if (armar() || ++n > 24) { clearInterval(t); } }, 250); }
    // al llegar desde otra página con #armar-oreja (el de la pulsera ya lo atiende marca.js)
    if (location.hash === '#armar-oreja') { [300, 1200, 2600].forEach(function (ms) { setTimeout(function () { bajar('armar-oreja', false); }, ms); }); }
})();

/* 18) (2026-11-17, "no se abren los desplegables de Cómo cuidar tu plata" en celular) El acordeón se maneja desde acá con un solo escuchador
   en captura: así no importa si el botón quedó con dos escuchadores (se abrían y cerraban en el mismo toque) o si otro script corta el clic. */
(function () {
    document.addEventListener('click', function (e) {
        var b = e.target && e.target.closest && e.target.closest('.pnt-cu-btn');
        if (!b) { return; }
        var li = b.closest('.pnt-cu-item'), raiz = b.closest('.pnt-cu');
        if (!li || !raiz) { return; }
        e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
        raiz.classList.add('is-js');
        var abrir = !li.classList.contains('is-open');
        Array.prototype.forEach.call(raiz.querySelectorAll('.pnt-cu-item'), function (o) {
            var a = abrir && o === li;
            o.classList.toggle('is-open', a);
            var ob = o.querySelector('.pnt-cu-btn'); if (ob) { ob.setAttribute('aria-expanded', a ? 'true' : 'false'); }
        });
    }, true);
})();
