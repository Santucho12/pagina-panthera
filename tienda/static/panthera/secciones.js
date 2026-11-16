/* Panthera: lo que se mueve en las secciones nuevas del inicio (2026-11-10). El HTML y los datos están en
   snipplets/panthera/disney.tpl, cuidar.tpl y locales.tpl; los estilos, en secciones.css.
     1. Aparecer al bajar (todas) ........ .pnt-rv + IntersectionObserver
     3. "Cómo cuidar tu plata" ........... acordeón de cuidados, uno abierto a la vez
     4. "Conocenos" ...................... el video del local: se carga cerca y se reproduce solo mientras se ve
     5. Turnos del 3D .................... window.PNT_3D: los dos armadores arman su escena antes de llegar, de a una y en pasos chicos
   "Armá tu pulsera" (la 2) ahora es el armador 3D y tiene su propio archivo: armar3d.js (con armar3d.css y armar.tpl).
   ⚠️ No se sube por FTP hasta que Panthera dé el OK. */
(function () {
    'use strict';

    var $ = function (raiz, sel) { return raiz.querySelector(sel); };
    var $$ = function (raiz, sel) { return Array.prototype.slice.call(raiz.querySelectorAll(sel)); };

    /* ---- 1. Aparecer al bajar ---- */
    function aparecer() {
        var nodos = $$(document, '.pnt-rv');
        if (!nodos.length || !('IntersectionObserver' in window)) { return; }   // sin esto no se esconde nada
        document.documentElement.classList.add('pnt-sj');
        var vigia = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (!e.isIntersecting) { return; }
                e.target.classList.add('is-in');
                vigia.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px 18% 0px', threshold: 0 });
        nodos.forEach(function (n) { vigia.observe(n); });
    }

    /* ---- 3. Cómo cuidar tu plata: acordeón, uno abierto a la vez (tocar el abierto lo cierra) ---- */
    function cuidar(raiz) {
        var items = $$(raiz, '.pnt-cu-item');
        raiz.classList.add('is-js');
        items.forEach(function (li, i) {
            $(li, '.pnt-cu-btn').addEventListener('click', function () {
                var abrir = !li.classList.contains('is-open');
                items.forEach(function (otro, j) {
                    var abierto = abrir && j === i;
                    otro.classList.toggle('is-open', abierto);
                    $(otro, '.pnt-cu-btn').setAttribute('aria-expanded', abierto ? 'true' : 'false');
                });
            });
        });
    }

    /* ---- 4. Conocenos: el video del local se pide cuando la sección se acerca y se reproduce solo mientras se ve ---- */
    function conocenos(raiz) {
        var v = $(raiz, '.pnt-co-video');
        if (!v) { return; }
        v.muted = true;
        function cargar() { if (!v.getAttribute('src') && v.getAttribute('data-src')) { v.src = v.getAttribute('data-src'); } }
        function play() { cargar(); var p = v.play(); if (p && p.catch) { p.catch(function () {}); } }
        if (!('IntersectionObserver' in window)) { play(); return; }
        new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) { if (e.isIntersecting) { cargar(); } });
        }, { rootMargin: '600px 0px' }).observe(v);
        new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) { if (e.isIntersecting) { play(); } else { v.pause(); } });
        }, { threshold: 0.25 }).observe(v);
    }

    /* ---- 5. Turnos del 3D (2026-11-12): lo comparten los dos armadores (pulsera y aritos) para no trabar la página ----
       Antes cada armador armaba su escena recién al llegar a la sección y los dos a la vez: la página se frenaba ~0,5 s justo
       cuando se la estaba mirando (crear el contexto WebGL de uno esperaba 150 ms a que la placa terminara de compilar los
       shaders del otro), se veía la foto fija y a los 3–4 s recién aparecía el 3D. Ahora:
       - temprano(fn): avisa cuando conviene ADELANTAR el armado: terminada la intro del inicio, con la pestaña a la vista.
         Así, al llegar a la sección el 3D ya está listo. (Con ahorro de datos o conexión 2G no se adelanta nada.)
       - obra(dist, fn): las escenas se arman DE A UNA; primero la que está más cerca de la pantalla.
       - respiro(urgente): para cortar el trabajo en pasos chicos: se cumple después de que se dibuje un cuadro; mientras la
         página se desplaza deja pasar más cuadros entre paso y paso (salvo que sea urgente: la sección ya se ve).
       - calma(maxMs): se cumple cuando la página lleva un rato quieta (o a lo sumo en maxMs).
       - quieta(): ms desde el último scroll. */
    window.PNT_3D = window.PNT_3D || (function () {
        var ultimo = 0;
        window.addEventListener('scroll', function () { ultimo = performance.now(); }, { passive: true });
        function quieta() { return performance.now() - ultimo; }

        // después de un cuadro: rAF y, enseguida, una tarea aparte (así el paso no le saca tiempo al cuadro que se está armando)
        var canal = null, enEspera = [];
        if (window.MessageChannel) {
            canal = new MessageChannel();
            canal.port1.onmessage = function () { var f = enEspera.shift(); if (f) { f(); } };
        }
        function despuesDelCuadro(f) {
            var hecho = false;
            var una = function () { if (!hecho) { hecho = true; f(); } };
            requestAnimationFrame(function () {
                if (canal) { enEspera.push(una); canal.port2.postMessage(0); } else { setTimeout(una, 0); }
            });
            setTimeout(una, 400);      // pestaña en segundo plano: requestAnimationFrame no corre
        }
        function respiro(urgente) {
            return new Promise(function (ok) {
                var saltos = urgente ? 0 : (quieta() < 160 ? 2 : 0);
                (function sig() { despuesDelCuadro(function () { if (saltos-- > 0) { sig(); } else { ok(); } }); })();
            });
        }
        function calma(maxMs) {
            var desde = performance.now();
            return new Promise(function (ok) {
                (function mira() {
                    var q = quieta();
                    if (q >= 220 || performance.now() - desde >= (maxMs || 0)) { ok(); return; }
                    setTimeout(mira, Math.min(230 - q, 120));
                })();
            });
        }

        // de a una obra por vez; al quedar libre, sigue la que esté más cerca de la pantalla
        var fila = [], ocupada = false;
        function sigue() {
            if (ocupada || !fila.length) { return; }
            var cual = 0, mejor = Infinity;
            fila.forEach(function (o, j) { var d = 1e9; try { d = o.dist(); } catch (e) {} if (d < mejor) { mejor = d; cual = j; } });
            var o = fila.splice(cual, 1)[0];
            ocupada = true;
            var fin = function () { if (!o) { return; } var ok = o.ok; o = null; ocupada = false; ok(); sigue(); };
            var p = null;
            try { p = o.fn(); } catch (e) {}
            if (p && p.then) { p.then(fin, fin); } else { fin(); }
            setTimeout(fin, 15000);    // seguro: una obra que no avisa no frena a la otra para siempre
        }
        function obra(dist, fn) {
            return new Promise(function (ok) { fila.push({ dist: dist, fn: fn, ok: ok }); sigue(); });
        }

        // el momento de adelantar: terminó la intro del inicio (el velo), la pestaña se ve y la página ya cargó (o pasaron 6 s)
        var tempranos = [], yaTemprano = false, mirando = false;
        function ahorra() {
            var c = navigator.connection;
            return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
        }
        function conIntro() {
            var c = document.documentElement.classList;
            return c.contains('pnt-intro-on') || c.contains('pnt-intro-lock') || c.contains('pnt-intro-run');
        }
        function miraTemprano() {
            if (yaTemprano) { return; }
            var cargada = document.readyState === 'complete' || performance.now() > 6000;
            if (!cargada || conIntro() || document.hidden) { setTimeout(miraTemprano, 200); return; }
            yaTemprano = true;
            setTimeout(function () { tempranos.splice(0).forEach(function (f) { try { f(); } catch (e) {} }); }, 300);
        }
        function temprano(fn) {
            if (ahorra()) { return; }
            if (yaTemprano) { setTimeout(fn, 0); return; }
            tempranos.push(fn);
            if (!mirando) { mirando = true; miraTemprano(); }
        }

        return { quieta: quieta, respiro: respiro, calma: calma, obra: obra, temprano: temprano, ahorra: ahorra };
    })();

    function iniciar() {
        aparecer();
        $$(document, '[data-pnt-cuidar]').forEach(cuidar);
        $$(document, '[data-pnt-conocenos]').forEach(conocenos);
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})();

/* (2026-11-14, "se ve todo lento y trabado") La cinta de "Mundo Disney" (una tira de ~10.000 px) corría sin parar aunque no se viera. Ahora se
   pausa cuando sale de la pantalla (y vuelve sola al acercarse). */
(function () {
    function pausaCinta() {
        var pista = document.querySelector('.pnt-di-pista');
        if (!pista || !('IntersectionObserver' in window)) { return; }
        new IntersectionObserver(function (es) {
            pista.style.setProperty('animation-play-state', es[es.length - 1].isIntersecting ? 'running' : 'paused', 'important');
        }, { rootMargin: '300px 0px' }).observe(pista);
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', pausaCinta); } else { pausaCinta(); }
})();

/* (2026-11-14) La luz que cruza los botones corre solo mientras el botón está en pantalla (ver paginas.css). */
(function () {
    var SEL = '.pnt-di-cab .pnt-s-btn, .pnt-hero-cartel-btn, .pnt-s-btn.pnt-co-btn, .pnt-rh-btn', io = null;
    function engancha() {
        var lista = document.querySelectorAll(SEL);
        if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(lista, function (b) { b.classList.add('pnt-luz-on'); }); return; }
        if (!io) { io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('pnt-luz-on', e.isIntersecting); }); }, { rootMargin: '60px' }); }
        Array.prototype.forEach.call(lista, function (b) { if (!b.__luz) { b.__luz = 1; io.observe(b); } });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', engancha); } else { engancha(); }
    window.addEventListener('load', engancha); setTimeout(engancha, 2500); setTimeout(engancha, 6000);      // los que arma marca.js después (el cartel del hero)
})();

/* (2026-11-14) Pausa (clase .pnt-fuera, ver paginas.css) de las animaciones infinitas de lo que no se ve en pantalla. */
(function () {
    var SEL = '.pnt-barra, .pnt-desliza-txt, .pnt-co-pin, [data-pnt-or], [data-pnt-a3]', io = null;
    function engancha() {
        if (!('IntersectionObserver' in window)) { return; }
        if (!io) { io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('pnt-fuera', !e.isIntersecting); }); }, { rootMargin: '40px' }); }
        Array.prototype.forEach.call(document.querySelectorAll(SEL), function (b) { if (!b.__fuera) { b.__fuera = 1; io.observe(b); } });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', engancha); } else { engancha(); }
    window.addEventListener('load', engancha); setTimeout(engancha, 2500); setTimeout(engancha, 6000);
})();

/* (2026-11-15) Celular: avisa cuándo el escenario 3D de cada armador está PEGADO arriba (sticky): el armador recibe la clase .pnt-pegado y su CSS tapa
   con blanco lo que pasaría entre la barra de navegación y el escenario. Una sola medida por cuadro, y solo mientras el armador está cerca. */
(function () {
    var mq = window.matchMedia ? window.matchMedia('(max-width: 699px)') : { matches: false };
    var lista = [], pend = false;
    function poner(o, on) { if (o.on !== on) { o.on = on; o.h.classList.toggle('pnt-pegado', on); } }
    // (2026-11-16, pedido: "cuando el 3D queda fijo arriba, que la navbar se oculte, así puede ir más arriba y queda más lugar abajo") El escenario
    // se pega casi al borde (--pega, paginas.css 21 e) y, mientras llega o está pegado, <html> lleva .pnt-3d-arriba: la barra rosa y la isla de
    // navegación suben y se esconden. Vuelven apenas el escenario se despega (al terminar el armador) o al subir de nuevo por encima.
    var root = document.documentElement, arribaAntes = false;
    function revisar() {
        pend = false;
        var arriba = false;
        lista.forEach(function (o) {
            if (!mq.matches || !o.cerca) { poner(o, false); return; }
            if (o.top == null) { o.top = parseFloat(getComputedStyle(o.st).top) || 104; }
            var t = o.st.getBoundingClientRect().top;
            poner(o, Math.abs(t - o.top) < 1.5);
            if (t <= 112 && t >= o.top - 30) { arriba = true; }      // llegando a la barra o pegado (y no despegándose hacia arriba)
        });
        if (arriba !== arribaAntes) { arribaAntes = arriba; root.classList.toggle('pnt-3d-arriba', arriba); }
    }
    function pedir() { if (!pend) { pend = true; requestAnimationFrame(revisar); } }
    function preparar() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-pnt-a3], [data-pnt-or]'), function (h) {
            if (h.__pntPega || !h.shadowRoot) { return; }
            var st = h.shadowRoot.getElementById('stage'); if (!st) { return; }
            var o = h.__pntPega = { h: h, st: st, cerca: false, on: false, top: null }; lista.push(o);
            if ('IntersectionObserver' in window) { new IntersectionObserver(function (es) { o.cerca = es[es.length - 1].isIntersecting; pedir(); }).observe(h); } else { o.cerca = true; }
        });
    }
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', function () { lista.forEach(function (o) { o.top = null; }); pedir(); });
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', preparar); } else { preparar(); }
    window.addEventListener('load', preparar); setTimeout(preparar, 2500); setTimeout(preparar, 6000);      // los armadores arman su shadow DOM con sus scripts (defer)
})();
