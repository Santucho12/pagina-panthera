{# Panthera — intro cinematográfica del inicio (la de la demo de Panthera, que es la INTRO v4 de Signos).
   Va apenas abre el <body> para que el velo esté desde el primer cuadro: la página arranca desenfocada,
   el logo + "Nueva colección" se revelan de izquierda a derecha, el fondo se enfoca y entran la franja,
   la navbar y WhatsApp. marca.js pone el logo (el mismo del header) y maneja los tiempos.
   Seguro: si el JS no corre, a los 5 s la intro se quita sola y la página queda usable.
   ⚠️ Preparado en local: NO subido todavía. #}
<script>
    (function () {
        var r = document.documentElement;
        r.classList.add('pnt-intro-on', 'pnt-intro-lock');
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        window.scrollTo(0, 0);
        // Mientras dura la intro la página no se mueve, pero la barra de scroll sigue visible: se frenan la rueda, el táctil y el
        // teclado, y si alguien arrastra la barra se vuelve arriba.
        var trabada = function () { return r.classList.contains('pnt-intro-lock'); };
        var frena = function (e) { if (trabada() && e.cancelable) { e.preventDefault(); } };
        window.addEventListener('wheel', frena, { passive: false });
        window.addEventListener('touchmove', frena, { passive: false });
        window.addEventListener('keydown', function (e) { if (trabada() && /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(e.key)) { e.preventDefault(); } });
        window.addEventListener('scroll', function () { if (trabada() && window.pageYOffset) { window.scrollTo(0, 0); } }, { passive: true });
        window.__pntIntroSeguro = setTimeout(function () {
            r.classList.remove('pnt-intro-on', 'pnt-intro-lock', 'pnt-intro-run');
            var v = document.getElementById('pnt-intro');
            if (v) { v.remove(); }
        }, 5000);
    })();
</script>
<div class="pnt-intro" id="pnt-intro" aria-hidden="true">
    <div class="pnt-intro-marca">
        <span class="pnt-intro-logo"></span>
        {# 5.º aniversario (pedido 2026-11-12): reemplaza a "Nueva colección". Para volver a lo de antes: <span class="pnt-intro-tag">Nueva colección</span> y sacar pnt-intro-cinco #}
        <span class="pnt-intro-tag">Cumplimos</span>
        <span class="pnt-intro-cinco"><b>5</b><i>Años</i></span>
    </div>
</div>
