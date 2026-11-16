import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/marca.js', [
("""        if (!EN_OFERTAS && miSlug) {
            productosDeOfertas(function (lista) {
                if (lista.indexOf(miSlug) < 0) { return; }
                EN_OFERTAS = true;
                var b = env.querySelector('.pnt-fp'); if (b) { b.removeAttribute('data-firma'); }
                precioTarjeta(env, cont);
            });
        }""",
"""        if (!EN_OFERTAS && miSlug) {
            fichaEspera = true;      // (2026-11-15) la columna de compra espera a saber si va en rojo (si no, el precio crecía 50 px después de verse)
            productosDeOfertas(function (lista) {
                if (lista.indexOf(miSlug) >= 0) {
                    EN_OFERTAS = true;
                    var b = env.querySelector('.pnt-fp'); if (b) { b.removeAttribute('data-firma'); }
                    precioTarjeta(env, cont);
                }
                fichaEspera = false; requestAnimationFrame(fichaArmada);
            });
        }"""),
("""    function iniciar() {
        barraScroll();""",
"""    /* (2026-11-15, "que no se vean saltos") La columna de compra (título, precio, talles, envíos) espera invisible a estar rearmada: antes se veía la
       de Tiendanube ~0,5 s y después saltaba 120 px (precio de tarjeta, envíos en filas, descripción en desplegable) y otros 50 px si era oferta.
       paginas.css la esconde hasta html.pnt-ficha-armada (y la muestra igual a los 2,5 s si esto no corriera). Tope: 0,9 s. */
    var fichaEspera = false;
    function fichaArmada() { document.documentElement.classList.add('pnt-ficha-armada'); }
    function iniciar() {
        barraScroll();"""),
("""        relacionados();
        // el carrusel de relacionados de la tienda se arma un poco después de cargar: se vuelve a pasar por las tarjetas""",
"""        relacionados();
        requestAnimationFrame(function () { setTimeout(function () { if (!fichaEspera) { fichaArmada(); } }, 120); });
        setTimeout(fichaArmada, 900);
        // el carrusel de relacionados de la tienda se arma un poco después de cargar: se vuelve a pasar por las tarjetas"""),
])
