/* Scroll suave y pesado (Lenis) en TODA la tienda, vertical y lateral (pedido 2026-11-10).
   Copiado de BS23 (static/bs23/scroll.js) y adaptado a Panthera.
   - Vertical: rueda, trackpad, teclado y links internos (#id) con inercia; en celulares y tablets queda el scroll nativo.
   - Lateral: sobre los carruseles ("Los más elegidos" y ofertas) el trackpad o Shift + rueda los mueven libre y continuo,
     siguiendo el gesto (desde el 2026-11-12; antes pasaban de a una tarjeta).
   Se frena mientras corre la intro y mientras hay un panel abierto (menú, carrito, buscador: overflow-none en <body>). */
(function () {
    'use strict';
    if (typeof window.Lenis === 'undefined' || window.lenis) { return; }
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 767) { return; }

    var root = document.documentElement;
    var lenis = null;
    lenis = new window.Lenis({
        lerp: 0.065,           // lerp bajo = más inercia (más pesado). Antes 0.05; "apenas más rápido" (pedido 2026-11-12)
        wheelMultiplier: 0.95, // antes 0.85: cada ruedita avanza un poco más

        smoothWheel: true,
        syncTouch: false,
        // Lo que tiene su propio scroll (paneles, buscador, carrito) scrollea solo
        prevent: function (nodo) {
            return !!(nodo.closest && nodo.closest('.modal, [data-lenis-prevent], .js-search-suggest, .search-suggest, .js-cart-notification, .nav-list-panel'));
        },
        // Tope de velocidad: el destino nunca se adelanta más de TOPE px a lo que se ve (como en BS23 y Signos)
        virtualScroll: function (d) {
            if (!lenis) { return; }
            var tipo = d.event && d.event.type;
            if (tipo !== 'wheel' && tipo !== 'touchend') { return; }
            var tope = Math.min(window.innerHeight * 0.65, 600);
            var adelanto = lenis.targetScroll - lenis.animatedScroll;
            var nuevo = adelanto + d.deltaY;
            if (nuevo > tope) { d.deltaY = Math.max(tope - adelanto, 0); }
            else if (nuevo < -tope) { d.deltaY = Math.min(-tope - adelanto, 0); }
        }
    });
    window.lenis = lenis;

    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    function sincronizar() {
        var quieto = root.classList.contains('pnt-intro-on') || root.classList.contains('pnt-intro-run') ||
            (document.body && document.body.classList.contains('overflow-none'));
        if (quieto) { lenis.stop(); } else { lenis.start(); }
    }
    sincronizar();
    new MutationObserver(sincronizar).observe(root, { attributes: true, attributeFilter: ['class'] });
    if (document.body) { new MutationObserver(sincronizar).observe(document.body, { attributes: true, attributeFilter: ['class'] }); }

    document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) { return; }
        var id = a.getAttribute('href'), destino = null;
        try { destino = id.length > 1 ? document.querySelector(id) : null; } catch (err) { return; }
        if (!destino) { return; }
        e.preventDefault();
        lenis.scrollTo(destino, { duration: 1.5 });
    });

    document.addEventListener('keydown', function (e) {
        if (lenis.isStopped || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) { return; }
        var t = e.target;
        if (t && t.closest && t.closest('input, textarea, select, button, [contenteditable], .modal')) { return; }
        var pagina = window.innerHeight * 0.85;
        var paso = { ArrowDown: 130, ArrowUp: -130, PageDown: pagina, PageUp: -pagina, ' ': e.shiftKey ? -pagina : pagina }[e.key];
        var destino;
        if (e.key === 'Home') { destino = 0; } else if (e.key === 'End') { destino = lenis.limit; }
        else if (paso) { destino = lenis.targetScroll + paso; } else { return; }
        e.preventDefault();
        lenis.scrollTo(destino);
    });

    // Lateral: trackpad o Shift + rueda sobre un carrusel lo mueven LIBRE y continuo, siguiendo el gesto (pedido 2026-11-12: "se scrollean
    // de a 1? no quiero eso"; antes pasaba de a una tarjeta). Suavizado con el mismo lerp que Lenis; el loop infinito de Swiper se
    // reacomoda solo (loopFix) sin que se note. No se encaja en ninguna tarjeta al soltar.
    var mov = new Map();   // swiper -> { objetivo, anim }
    function mover(sw, st) {
        var t = sw.translate + (st.objetivo - sw.translate) * 0.22;
        if (Math.abs(st.objetivo - t) < 0.5) { t = st.objetivo; }
        sw.setTranslate(t);
        sw.updateProgress();
        sw.updateActiveIndex();
        sw.updateSlidesClasses();
        if (sw.params.loop) {
            var antes = sw.translate;
            sw.loopFix();
            st.objetivo += sw.translate - antes;           // si el loop saltó de copia, el destino salta igual
        }
        if (sw.translate === st.objetivo) { st.anim = 0; return; }
        st.anim = requestAnimationFrame(function () { mover(sw, st); });
    }
    document.addEventListener('wheel', function (e) {
        var caja = e.target.closest && e.target.closest('.pnt-mv-swiper');
        if (!caja) { return; }
        var dx = e.deltaX, dy = e.deltaY;
        if (e.shiftKey && !dx) { dx = dy; dy = 0; }
        if (!dx || Math.abs(dx) < Math.abs(dy)) { return; }   // la rueda vertical sigue bajando la página
        e.preventDefault();
        e.stopPropagation();
        var sw = caja.swiper;
        if (!sw) { return; }
        if (e.deltaMode === 1) { dx *= 40; }                  // ruedas que cuentan en líneas
        if (sw.autoplay && sw.autoplay.running) { sw.autoplay.stop(); }
        var st = mov.get(sw);
        if (!st) { st = { objetivo: sw.translate, anim: 0 }; mov.set(sw, st); }
        if (!st.anim) { st.objetivo = sw.translate; sw.setTransition(0); }
        st.objetivo -= dx;
        if (!sw.params.loop) { st.objetivo = Math.min(sw.minTranslate(), Math.max(sw.maxTranslate(), st.objetivo)); }
        if (!st.anim) { st.anim = requestAnimationFrame(function () { mover(sw, st); }); }
    }, { passive: false, capture: true });
})();
