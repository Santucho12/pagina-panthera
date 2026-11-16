import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/marca.js', [
("""    function productosDeOfertas(listo) {
        var CLAVE = 'pnt-ofertas-v1', ahora = Date.now();
        try { var g = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (g && ahora - g.t < 30 * 60 * 1000) { listo(g.u); return; } } catch (e) { /* sin almacenamiento */ }
        var guardadas = ofertasGuardadas();
        if (guardadas) { listo(guardadas.map(function (h) { var m = /\/productos\/([^\/"?#]+)\//.exec(h); return m ? m[1] : ''; })); return; }
        fetch('/', { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {""",
"""    function productosDeOfertas(listo) {
        var CLAVE = 'pnt-ofertas-v1', ahora = Date.now(), g = null;
        try { g = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { /* sin almacenamiento */ }
        if (g && g.u && ahora - g.t < 30 * 60 * 1000) { listo(g.u); return; }
        var guardadas = ofertasGuardadas();
        if (guardadas) { listo(guardadas.map(function (h) { var m = /\/productos\/([^\/"?#]+)\//.exec(h); return m ? m[1] : ''; })); return; }
        // (2026-11-15) una lista vieja se usa igual, al instante, y se renueva después con la página ya cargada: bajar el inicio son ~900 KB
        // y antes la ficha lo esperaba (competía con las fotos del producto). El inicio también guarda la lista cuando se lo visita (paginas.js).
        if (g && g.u) { listo(g.u); listo = function () {}; var renueva = function () { setTimeout(function () { productosDeOfertasRed(CLAVE, ahora, listo); }, 2500); }; if (document.readyState === 'complete') { renueva(); } else { window.addEventListener('load', renueva); } return; }
        productosDeOfertasRed(CLAVE, ahora, listo);
    }
    function productosDeOfertasRed(CLAVE, ahora, listo) {
        fetch('/', { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {"""),
])
