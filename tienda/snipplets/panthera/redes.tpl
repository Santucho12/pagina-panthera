{# Panthera — "Seguinos en redes", estilo historias (como la sección de redes de BS23).
   Círculos con aro de color a la izquierda, titular y botones; a la derecha un celular con la historia grande.
   Al tocar un círculo cambia la historia; cuando termina pasa sola a la siguiente (marca.js).
   El celular muestra el video del círculo que está activo. Por defecto TODOS usan el mismo, también "Novedades":
   static/panthera/redes/video-redes.mp4. Desde el 2026-11-11 es el video de Kling con aritos, collar, pulsera con charms y anillos
   (pedido del usuario: el último de Descargas); el montaje de WhatsApp anterior quedó en respaldos/2026-11-11-video-redes/.
   Se bajó de 1080×1920 y 8,7 MB a 720×1280, sin audio y ~1,2 MB (ffmpeg, h264 CRF 24).
   "Disney" tiene el suyo (clave video en la lista de abajo): video-disney.mp4, el aro de Minnie con un acercamiento lento, hecho en Kling
   con el prompt base (pedido 2026-11-11: el último de Descargas va en Disney); mismo tratamiento, ~0,6 MB. Su primer cuadro es la foto
   del celular (historia-1.webp), así que no hay salto cuando arranca. Y el MISMO video se reproduce adentro del círculo de Disney
   (video_circulo): recorte cuadrado cerrado sobre Minnie (840 px desde x=100, y=560 del cuadro de 1080×1920), 200×200, ~45 KB; deja
   afuera las franjas borrosas y la marca de agua.
   "Aritos" también tiene el suyo (pedido 2026-11-11, el último de Descargas): video-aritos.mp4, la oreja con tres aritos y un moño rosa con
   perla negra, ~1,2 MB. Su foto del celular (historia-2.webp) es el primer cuadro del video (la anterior quedó en respaldos), y adentro del
   círculo se reproduce un clip de 200×200 (~60 KB) que SIGUE al moño, con un recorte de 560 px y la trayectoria suavizada, porque el moño se
   mueve de lado a lado y un recorte fijo lo achicaba. Se hizo con herramientas/armador/clip_circulo_sigue.py.
   Para darle uno propio a otro círculo, agregarle la clave video (mp4 vertical
   720×1280, sin audio) y, si querés, el clip chiquito del aro con video_circulo e img_circulo (ver abajo).
   Los círculos (historia-N.webp) cambian la foto, el nombre y el link de la red.
   ⚠️ Los videos de Kling traen la marca de agua "KlingAI 4.0" abajo a la derecha (no se retocó; ver PENDIENTES).
   ⚠️ Preparado en local: NO subido todavía. #}
{% set pnt_ig = store.instagram ?: 'https://instagram.com/panthera.ok' %}
{% set pnt_tk = store.tiktok ?: 'https://www.tiktok.com/@panthera.universe' %}
{# Los círculos se ven en este orden: Disney, Novedades, Aritos, Charms, Pulseras, Collares. En el CELULAR solo se reproducen los que tienen la clave orden, siempre en ese orden y empezando por orden 1: Novedades, Disney, Charms, Aritos (pedido 2026-11-11). Pulseras y Collares no entran en la reproducción. #}
{% set pnt_historias = [
    { orden: 2, img: 'historia-1.webp', nombre: 'Disney', red: 'TikTok', video: 'video-disney.mp4', video_circulo: 'video-disney-circulo.mp4', img_circulo: 'video-disney-circulo.webp' },
    { orden: 1, img: 'historia-6.webp', nombre: 'Novedades', red: 'TikTok', video_circulo: 'video-redes-circulo.mp4', img_circulo: 'video-redes-circulo.webp' },
    { orden: 4, img: 'historia-2.webp', nombre: 'Aritos', red: 'Instagram', video: 'video-aritos.mp4', video_circulo: 'video-aritos-circulo.mp4', img_circulo: 'video-aritos-circulo.webp' },
    { orden: 3, img: 'historia-3.webp', nombre: 'Charms', red: 'TikTok', video: 'video-charms.mp4', video_circulo: 'video-charms-circulo.mp4', img_circulo: 'video-charms-circulo.webp' },
    { img: 'historia-4.webp', nombre: 'Pulseras', red: 'Instagram', video: 'video-pulseras.mp4', video_circulo: 'video-pulseras-circulo.mp4', img_circulo: 'video-pulseras-circulo.webp' },
    { img: 'historia-5.webp', nombre: 'Collares', red: 'Instagram', video: 'video-collares.mp4', video_circulo: 'video-collares-circulo.mp4', img_circulo: 'video-collares-circulo.webp' }
] %}

<section class="pnt-redes" id="redes" aria-label="Seguinos en redes">
    <div class="pnt-redes-caja">
        <div class="pnt-rh-panel">
            <div class="pnt-rh-texto">
                <div class="pnt-rh-circulos" role="tablist" aria-label="Historias de Instagram y TikTok">
                    {% for h in pnt_historias %}
                        {% set pnt_url = h.red == 'TikTok' ? pnt_tk : pnt_ig %}
                        <button type="button" class="pnt-rh-circ" role="tab"{% if h.orden %} data-orden="{{ h.orden }}"{% endif %}
                            aria-selected="false" aria-label="{{ h.red }}: {{ h.nombre }}"
                            data-img="{{ ('panthera/redes/' ~ h.img) | static_url }}"
                            data-video="{{ ('panthera/redes/' ~ (h.video ?: 'video-redes.mp4')) | static_url }}"
                            data-red="{{ h.red }}" data-usuario="{{ h.red == 'TikTok' ? '@panthera.universe' : '@panthera.ok' }}" data-url="{{ pnt_url }}">
                            <span class="pnt-rh-aro"><img src="{{ ('panthera/redes/' ~ (h.img_circulo ?: h.img)) | static_url }}" alt="" loading="lazy" decoding="async" width="160" height="160">
                                {# Círculo con video propio (pedido 2026-11-11: "Novedades" con el mismo video, reproduciéndose): el mismo video recortado
                                   cuadrado y chiquito (200×200, ~77 KB), DERECHO. Se probó al revés y el usuario se arrepintió el mismo día; esa versión quedó
                                   en respaldos/2026-11-11-video-redes/ (video-redes-circulo-reves). img_circulo = su primer cuadro, para que no haya salto cuando
                                   el video arranca. marca.js lo reproduce solo, mudo y en bucle mientras se ve; si no carga, queda esa foto. #}
                                {% if h.video_circulo %}<video class="pnt-rh-circ-video" src="{{ ('panthera/redes/' ~ h.video_circulo) | static_url }}" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video>{% endif %}
                            </span>
                            <span class="pnt-rh-nombre">{{ h.nombre }}</span>
                        </button>
                    {% endfor %}
                </div>
                <h2 class="pnt-rh-titulo">Seguinos en redes</h2>{# sin punto, como los demás títulos (2026-11-09) #}
                <p class="pnt-rh-bajada">Charms nuevos, lanzamientos y promos, todos los días.</p>
                <div class="pnt-rh-botones">
                    <a class="pnt-rh-btn" href="{{ pnt_ig }}" target="_blank" rel="noopener"><svg class="pnt-rh-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg><span><span class="pnt-rh-seguir">Seguir en </span>Instagram</span></a>
                    <a class="pnt-rh-btn pnt-rh-btn--borde" href="{{ pnt_tk }}" target="_blank" rel="noopener"><svg class="pnt-rh-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.2 3c.35 2.5 1.9 4.1 4.3 4.3v3.1c-1.55 0-2.95-.5-4.3-1.4v6.2c0 3.3-2.6 5.8-5.8 5.8S4.5 18.5 4.5 15.3s2.6-5.7 5.9-5.7c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 0 0-.9-.2c-1.4 0-2.6 1.1-2.6 2.6s1.2 2.6 2.6 2.6 2.7-1.1 2.7-2.8V3h3.2z"/></svg><span><span class="pnt-rh-seguir">Seguir en </span>TikTok</span></a>
                </div>
            </div>
            <a class="pnt-rh-grande" href="{{ pnt_ig }}" target="_blank" rel="noopener" aria-label="Ver el perfil de Panthera">
                <img class="pnt-rh-foto" src="{{ ('panthera/redes/' ~ pnt_historias[0].img) | static_url }}" alt="" loading="lazy" decoding="async">
                <video class="pnt-rh-video" muted playsinline preload="none" hidden></video>
                <span class="pnt-rh-barra"><i></i></span>
                <span class="pnt-rh-chip">@panthera.ok · Instagram</span>
            </a>
        </div>
    </div>
</section>
