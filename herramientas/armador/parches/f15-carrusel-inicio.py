# (2026-11-15) Carruseles del inicio ("Los más elegidos" y "Ofertas") armados solo por marca.js: se ataja el createSwiper de Lima.
# Pedido: "en mobile no veo el carrusel de más vendidos y de ofertas, solo veo 1, no 2 por fila".
import io
p = 'tienda/static/panthera/marca.js'
s = io.open(p, encoding='utf8', newline='').read()
e = '\r\n' if '\r\n' in s else '\n'


def c(a, b):
    global s
    a = a.replace('\n', e)
    b = b.replace('\n', e)
    assert s.count(a) == 1, (s.count(a), a[:90])
    s = s.replace(a, b)


# 1) atajar el pedido de Lima
c("""          titulo: [/^no los dejes escapar\\.?$/i, 'No los dejes escapar'], nombre: 'ofertas' }
    ];
""", """          titulo: [/^no los dejes escapar\\.?$/i, 'No los dejes escapar'], nombre: 'ofertas' }
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
""")

# 2) portada de Ofertas aparte (se pone antes de armar el carrusel)
c("""    function mvCarrusel(seccion, caja, cfg) {
        var cont = seccion.querySelector('.pnt-mv-swiper');
        var grilla = cont && cont.querySelector('.swiper-wrapper');
        if (!grilla || typeof Swiper === 'undefined') { return false; }
        if (grilla.getAttribute('data-pnt-carrusel')) { return true; }
        var previo = window[cfg.global];
        if (!previo) { return false; }                          // Lima todavía no armó el suyo
        grilla.setAttribute('data-pnt-carrusel', '1');
        previo.destroy(true, true);

        // "Ofertas": primera tarjeta roja con el descuento máximo y el enlace a todas las ofertas (como BS23)
        if (cfg.ofertas && !grilla.querySelector('.pnt-mv-portada')) {""", """    // "Ofertas": primera tarjeta roja con el descuento máximo y el enlace a todas las ofertas (como BS23). (2026-11-15) Se pone apenas se prepara la
    // sección, antes de armar el carrusel: así las tarjetas no se corren un lugar cuando el carrusel arranca.
    function mvPortada(seccion, cfg) {
        var grilla = seccion.querySelector('.pnt-mv-swiper .swiper-wrapper');
        if (cfg.ofertas && grilla && !grilla.querySelector('.pnt-mv-portada')) {""")
c("""            slide.appendChild(portada);
            grilla.insertBefore(slide, grilla.firstChild);
        }
        var originales""", """            slide.appendChild(portada);
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
        var originales""")

# 3) marcar el nuestro y devolverle a Lima su carrusel
c("""        window[cfg.global] = sw;

        // Se frena con el mouse encima""", """        window[cfg.global] = sw;
        sw.pntNuestro = true;
        cont.classList.add('pnt-sw-listo');          // paginas.css 16 f: desde acá las medidas las pone Swiper
        if (Object.prototype.hasOwnProperty.call(MV_PEDIDOS, cfg.global)) {
            var deLima = MV_PEDIDOS[cfg.global];
            delete MV_PEDIDOS[cfg.global];
            if (deLima) { try { deLima(sw); } catch (err) { /* lo de Lima no frena el carrusel */ } }
        }

        // Se frena con el mouse encima""")

# 4) portada enseguida, carrusel enseguida (y avisar si falla)
c("""            mvVerTodos(seccion);
            [].forEach.call(seccion.querySelectorAll('.js-item-product'), mvTarjeta);""", """            mvVerTodos(seccion);
            [].forEach.call(seccion.querySelectorAll('.js-item-product'), mvTarjeta);
            mvPortada(seccion, cfg);""")
c("""            setTimeout(function () {
                var t = setInterval(function () {
                    intentos++;
                    var listo = false;
                    try { listo = mvCarrusel(seccion, caja, cfg); } catch (e) { listo = true; }
                    if (listo || intentos > 40) { clearInterval(t); }
                }, 250);
            }, orden * 1400);""", """            // (2026-11-15) con el pedido de Lima atajado se arma enseguida (el de "Ofertas", 0,7 s después: cada uno lleva su rato de procesador)
            var intentar = function () {
                try { return mvCarrusel(seccion, caja, cfg); } catch (e) { if (window.console) { console.warn('[pnt] carrusel ' + cfg.clave + ':', e); } return true; }
            };
            setTimeout(function () {
                if (intentar()) { return; }
                var t = setInterval(function () {
                    intentos++;
                    if (intentar() || intentos > 40) { clearInterval(t); }
                }, 250);
            }, orden * (MV_ATAJADO ? 700 : 1400));""")

io.open(p, 'w', encoding='utf8', newline='').write(s)
print('ok')
