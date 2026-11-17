{# Panthera — "Conocenos" (2026-11-11, pedido del usuario: "replica la section de bs23"): la sección "Nuestro local" de BS23
   (../Pagina web BS23/tienda-rio/snipplets/bs23/secciones.tpl y static/bs23/secciones.css) con la paleta y las letras de Panthera.
   A la izquierda, el video del local con la dirección encima y el pin (abre Google Maps); a la derecha, título grande, texto y
   botones; abajo, una fila con los dos locales y el WhatsApp. En el celular: título, video, botones y datos, uno abajo del otro.
   Video: el de Kling "cómo llegar" (Descargas, 2026-11-11), recortado a 4:5 (así queda afuera la marca de agua de Kling) y cortado
   antes de la bolsa (traía "viajes.inolvidables" escrito encima). Se reproduce solo mientras se ve (secciones.js, sección 4).
   Datos: los de la página de Contacto de la tienda (igual que locales.tpl). NO hay horarios cargados: no se inventan, se consultan
   por WhatsApp. Que el local está dentro del shopping lo dijo el usuario (2026-11-11; "a mano izquierda" se sacó a pedido el 2026-11-16).
   ⚠️ Preparado en local: NO subido todavía. #}
{% set pnt_co_wa = store.whatsapp ?: 'https://wa.me/5492915661062' %}
{% set pnt_co_mapa_bb = 'https://www.google.com/maps/search/?api=1&query=Av.%20Alberto%20Pedro%20Cabrera%202153%2C%20Bah%C3%ADa%20Blanca' %}

<section class="pnt-s pnt-co" id="conocenos" aria-labelledby="pnt-co-t" data-pnt-conocenos>
    <div class="pnt-co-caja">
        <div class="pnt-co-fila">
            <a class="pnt-co-local pnt-rv" href="{{ pnt_co_mapa_bb }}" target="_blank" rel="noopener" aria-label="Cómo llegar al local de Bahía Blanca (abre Google Maps)">
                <span class="pnt-co-media">
                    <video class="pnt-co-video" muted loop playsinline preload="none" width="720" height="900" aria-hidden="true"
                        poster="{{ 'panthera/conocenos/poster-local.webp' | static_url }}"
                        data-src="{{ 'panthera/conocenos/video-local.mp4' | static_url }}"></video>
                    <span class="pnt-co-cab">
                        <span class="pnt-co-ciudad">Bahía Blanca</span>
                        <span class="pnt-co-dir">Av. Alberto Pedro Cabrera 2153</span>
                        <span class="pnt-co-linea"></span>
                        <span class="pnt-co-nota"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5V20"/></svg><span>Dentro del shopping</span></span>
                    </span>
                    <span class="pnt-co-pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 22s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
                </span>
            </a>
            <div class="pnt-co-info">
                {# (2026-11-17) el título pasó a "Visitanos": se saca el rótulo de arriba para no repetirlo #}
                <h2 class="pnt-co-titulo pnt-rv" id="pnt-co-t" style="--pnt-rv-demora: 140ms">Visitanos</h2>
                <p class="pnt-co-texto pnt-rv" style="--pnt-rv-demora: 200ms">Estamos dentro del shopping. Mirá el video y vení a conocer Panthera en persona.</p>
                <div class="pnt-co-botones pnt-rv" style="--pnt-rv-demora: 260ms">
                    <a class="pnt-s-btn pnt-co-btn" href="{{ pnt_co_mapa_bb }}" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
                        Cómo llegar
                    </a>
                    <a class="pnt-s-btn pnt-co-btn pnt-co-btn--borde" href="{{ pnt_co_wa }}" target="_blank" rel="noopener"><span><span class="pnt-co-largo">Escribinos por </span>WhatsApp</span></a>
                </div>
            </div>
        </div>
        <div class="pnt-co-datos pnt-rv" style="--pnt-rv-demora: 120ms" data-wa-evitar>
            <a class="pnt-co-dato" href="{{ pnt_co_mapa_bb }}" target="_blank" rel="noopener"><span class="pnt-co-rotulo">Bahía Blanca</span><b class="pnt-co-valor">Av. Alberto Pedro Cabrera 2153</b><span class="pnt-co-sub">Dentro del shopping</span></a>
            {# Horario pasado por el usuario (2026-11-11): de 10 a 21 hs. No dijo los días: no se agregan #}
            <div class="pnt-co-dato"><span class="pnt-co-rotulo">Horario</span><b class="pnt-co-valor">10:00 a 21:00 hs</b><span class="pnt-co-sub">Horario de atención</span></div>
            <a class="pnt-co-dato" href="{{ pnt_co_wa }}" target="_blank" rel="noopener"><span class="pnt-co-rotulo">WhatsApp</span><b class="pnt-co-valor">291 566-1062</b><span class="pnt-co-sub">Escribinos tu consulta</span></a>
        </div>
    </div>
</section>
