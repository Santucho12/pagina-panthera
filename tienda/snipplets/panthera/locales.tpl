{# Panthera — "Nuestros locales" (2026-11-10): cuatro tarjetas grandes con lo que busca quien quiere ir al local: cómo llegar a
   cada dirección (abre Google Maps), WhatsApp e Instagram. Diseño D18 del artefacto de ideas.
   Las direcciones salen de la página de Contacto de la tienda (store.address): "Av. Alberto Pedro Cabrera 2153, Bahía Blanca -
   Dorrego 286, Monte Hermoso". NO hay horarios cargados en la tienda: en vez de inventarlos, la bajada manda a consultarlos
   por WhatsApp. Cuando Panthera pase los horarios (y fotos del local), se agregan acá.
   ⚠️ Preparado en local: NO subido todavía. #}
{% set pnt_ig = store.instagram ?: 'https://instagram.com/panthera.ok' %}
{% set pnt_wa = store.whatsapp ?: 'https://wa.me/5492915661062' %}
{% set pnt_locales = [
    { ciudad: 'Bahía Blanca', calle: 'Av. Alberto Pedro Cabrera 2153', mapa: 'https://www.google.com/maps/search/?api=1&query=Av.%20Alberto%20Pedro%20Cabrera%202153%2C%20Bah%C3%ADa%20Blanca', estilo: 'negro' },
    { ciudad: 'Monte Hermoso', calle: 'Dorrego 286', mapa: 'https://www.google.com/maps/search/?api=1&query=Dorrego%20286%2C%20Monte%20Hermoso', estilo: 'rosa' }
] %}

<section class="pnt-s pnt-lo" id="nuestros-locales" aria-labelledby="pnt-lo-t">
    <div class="pnt-s-caja">
        <header class="pnt-s-cab pnt-rv">
            <div>
                <p class="pnt-s-eb">Nuestros locales</p>
                <h2 class="pnt-s-titulo" id="pnt-lo-t">Vení a conocernos</h2>
            </div>
            <p class="pnt-s-bajada">Estamos en Bahía Blanca y en Monte Hermoso. Escribinos por WhatsApp para consultar los horarios.</p>
        </header>

        <div class="pnt-lo-grid">
            {% for l in pnt_locales %}
                <a class="pnt-lo-tile pnt-lo-tile--{{ l.estilo }} pnt-rv" style="--pnt-rv-demora: {{ loop.index0 * 90 }}ms" href="{{ l.mapa }}" target="_blank" rel="noopener">
                    <span class="pnt-lo-arriba">
                        <svg class="pnt-lo-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
                        <span class="pnt-lo-flecha" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></span>
                    </span>
                    <span class="pnt-lo-abajo">
                        <h3 class="pnt-lo-t">{{ l.ciudad }}</h3>
                        <span class="pnt-lo-s">{{ l.calle }}</span>
                        <span class="pnt-lo-cta">Cómo llegar</span>
                    </span>
                </a>
            {% endfor %}

            <a class="pnt-lo-tile pnt-lo-tile--blanco pnt-rv" style="--pnt-rv-demora: 180ms" href="{{ pnt_wa }}" target="_blank" rel="noopener">
                <span class="pnt-lo-arriba">
                    <svg class="pnt-lo-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5l1.2-3.6A7.5 7.5 0 1 1 8.4 18.6z"/><path d="M9 10.5h6M9 13.5h4"/></svg>
                    <span class="pnt-lo-flecha" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></span>
                </span>
                <span class="pnt-lo-abajo">
                    <h3 class="pnt-lo-t">WhatsApp</h3>
                    <span class="pnt-lo-s">Horarios, consultas y pedidos</span>
                    <span class="pnt-lo-cta">Escribinos</span>
                </span>
            </a>

            <a class="pnt-lo-tile pnt-lo-tile--dorado pnt-rv" style="--pnt-rv-demora: 270ms" href="{{ pnt_ig }}" target="_blank" rel="noopener">
                <span class="pnt-lo-arriba">
                    <svg class="pnt-lo-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r=".6" fill="currentColor"/></svg>
                    <span class="pnt-lo-flecha" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></span>
                </span>
                <span class="pnt-lo-abajo">
                    <h3 class="pnt-lo-t">Instagram</h3>
                    <span class="pnt-lo-s">@panthera.ok</span>
                    <span class="pnt-lo-cta">Seguinos</span>
                </span>
            </a>
        </div>
    </div>
</section>
