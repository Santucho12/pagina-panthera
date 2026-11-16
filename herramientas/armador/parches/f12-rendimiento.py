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


# ── A. cartel de WhatsApp: no mide la pantalla en cada cuadro de scroll ──
c(r"""        window.addEventListener('scroll', function () {
            if (cerrado || esperandoCuadro) { return; }
            esperandoCuadro = true;
            requestAnimationFrame(revisar);
        }, { passive: true });""", r"""        /* (2026-11-14, "se ve lento y trabado": era lo que más tiempo se llevaba al bajar, ~4,6 s en 8 s de scroll). Antes, en CADA cuadro de
           scroll: ubicar() y tapa() medían el botón, el globo y todos los [data-wa-evitar] (getBoundingClientRect: fuerza el cálculo de
           estilos y diseño de lo pendiente). Ahora solo se mira si algo lo tapa cuando el globo está abierto o esperando para abrirse, y
           a lo sumo una vez cada 220 ms. Con el globo cerrado entre mensaje y mensaje no hace nada: abrir() ya mide al abrirse. */
        window.addEventListener('scroll', function () {
            if (cerrado || esperandoCuadro) { return; }
            if (!pendiente && !wrap.classList.contains('is-open')) { return; }
            esperandoCuadro = true;
            setTimeout(function () { requestAnimationFrame(revisar); }, 220);
        }, { passive: true });""")

# ── B. entradas al bajar: primero se LEE todo, después se ESCRIBE (antes: leer, escribir, leer, escribir… = un cálculo de diseño por elemento) ──
c(r"""        var ancho = window.innerWidth, n = 0, fin = 0;
        lista.forEach(function (o) {
            var r = o.el.getBoundingClientRect();
            var aLaVista""", r"""        var ancho = window.innerWidth, n = 0, fin = 0;
        // (2026-11-14) se leen TODAS las medidas juntas y recién después se escribe: antes cada elemento leía (forzando el diseño de todo lo
        // pendiente) justo después de que el anterior había escrito su --pnt-ap-d; en secciones con 30 tarjetas eran 30 diseños completos
        var rects = lista.map(function (o) { return o.el.getBoundingClientRect(); });
        lista.forEach(function (o, i) {
            var r = rects[i];
            var aLaVista""")

# ── C. barra de arriba: el corte se mide una vez (no en cada evento de scroll) y el evento va por cuadro ──
c(r"""        function actualizar() {
            var y = window.pageYOffset || root.scrollTop || 0;
            var slider = document.body.classList.contains('template-home') && document.querySelector('.js-home-slider, [data-store="home-slider"], .section-slider');
            var corte = window.innerWidth <= 767 ? 15 : (slider ? slider.offsetHeight * 0.4 : 50);""", r"""        var corteGuardado = null;      // (2026-11-14) offsetHeight del slider en cada evento de scroll forzaba el diseño: se mide una vez (y al cambiar el tamaño / cargar)
        function actualizar() {
            var y = window.pageYOffset || root.scrollTop || 0;
            if (corteGuardado === null) {
                var slider = document.body.classList.contains('template-home') && document.querySelector('.js-home-slider, [data-store="home-slider"], .section-slider');
                corteGuardado = window.innerWidth <= 767 ? 15 : (slider ? slider.offsetHeight * 0.4 : 50);
            }
            var corte = corteGuardado;""")
c(r"""        window.addEventListener('scroll', actualizar, { passive: true });
        window.addEventListener('resize', actualizar);
        actualizar();""", r"""        var actualizando = false;
        window.addEventListener('scroll', function () { if (!actualizando) { actualizando = true; requestAnimationFrame(function () { actualizando = false; actualizar(); }); } }, { passive: true });
        window.addEventListener('resize', function () { corteGuardado = null; actualizar(); });
        window.addEventListener('load', function () { corteGuardado = null; setTimeout(function () { corteGuardado = null; }, 1500); });
        actualizar();""")

# ── D. parallax del cartel: el alto del hero se guarda ──
c(r"""        function parallax() {
            pendiente = false;
            var alto = caja.offsetHeight || 1;""", r"""        var altoGuardado = 0;       // (2026-11-14) caja.offsetHeight en cada cuadro de scroll forzaba el diseño: se guarda y se mide de nuevo al cambiar el tamaño / cargar
        function parallax() {
            pendiente = false;
            var alto = altoGuardado || (altoGuardado = caja.offsetHeight || 1);""")
c(r"""        window.addEventListener('resize', parallax);
        parallax();""", r"""        window.addEventListener('resize', function () { altoGuardado = 0; parallax(); });
        window.addEventListener('load', function () { altoGuardado = 0; setTimeout(function () { altoGuardado = 0; }, 1500); });
        parallax();""")

io.open(p, 'w', encoding='utf8', newline='').write(s)
print('ok')
