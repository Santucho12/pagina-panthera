{# Panthera — "Cómo cuidar tu plata" (rediseño 2026-11-10: versión V1 del artefacto de acordeones, elegida por el usuario sobre una
   referencia de "tips" con acordeón). Arriba: título y bajada. A la izquierda: foto de pulseras de plata (static/panthera/banners/pulseras.webp)
   A la derecha: los cinco cuidados en acordeón, uno abierto a la vez (secciones.js, sección 3)
   (2026-11-10: se sacaron el botón "Ver todos los cuidados" y el aviso de cobre/acero, pedido del usuario).
   Sin JS se ven todos abiertos.
   Contenido: sale de la página "Cuidados" de la tienda (evitar agua, cremas y perfumes; sacárselas para el deporte y para
   dormir; guardarlas secas en su bolsita o cajita) + el paño suave. Los charms de Panthera son de "plata 925 natural" (así
   dice la ficha de cada producto). No se prometen garantías ni plazos.
   ⚠️ Preparado en local: NO subido todavía. #}
{% set pnt_cuidados = [
    { titulo: 'Guardalas secas y separadas', texto: 'En su bolsita o cajita, sin que se rocen con otras piezas.' },
    { titulo: 'Primero el perfume', texto: 'Cremas, perfumes y maquillaje antes; las joyas, al final.' },
    { titulo: 'Lejos del agua', texto: 'Sacátelas para bañarte, ir a la pileta o meterte al mar.' },
    { titulo: 'Sacátelas para entrenar y dormir', texto: 'La transpiración y el roce las desgastan.' },
    { titulo: 'Un paño suave', texto: 'Pasales un paño suave y seco para devolverles el brillo.' }
] %}

<section class="pnt-s pnt-cu" id="cuidar-tu-plata" aria-labelledby="pnt-cu-t" data-pnt-cuidar>
    <div class="pnt-s-caja">
        {# Cabecera igual a la de "Armá tu pulsera" (pedido 2026-11-10): título en mayúsculas en una línea y una frase chica abajo #}
        <header class="pnt-cu-cab pnt-rv">
            <div>
                <h2 class="pnt-s-titulo" id="pnt-cu-t">Cómo cuidar tu plata</h2>
                <p class="pnt-cu-sub">Cinco cuidados simples para que tus joyas de plata 925 conserven su brillo.</p>
            </div>
        </header>
        <div class="pnt-cu-grid">
            <div class="pnt-cu-izq">
                <div class="pnt-cu-foto pnt-rv" style="--pnt-rv-demora: 80ms">
                    <img src="{{ 'panthera/banners/pulseras.webp' | static_url }}" alt="Pulseras de plata con charms" width="900" height="450" loading="lazy" decoding="async">
                </div>
            </div>

            <div class="pnt-cu-der">
                <ol class="pnt-cu-lista">
                    {% for c in pnt_cuidados %}
                        <li class="pnt-cu-item pnt-rv{% if loop.first %} is-open{% endif %}" style="--pnt-rv-demora: {{ loop.index0 * 70 }}ms">
                            <h3 class="pnt-cu-h">
                                <button class="pnt-cu-btn" type="button" id="pnt-cu-b{{ loop.index0 }}" aria-controls="pnt-cu-r{{ loop.index0 }}" aria-expanded="{% if loop.first %}true{% else %}false{% endif %}">
                                    <span class="pnt-cu-n">Cuidado {{ loop.index }}</span>
                                    <span class="pnt-cu-t">{{ c.titulo }}</span>
                                    <span class="pnt-cu-flecha" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6"/></svg></span>
                                </button>
                            </h3>
                            <div class="pnt-cu-resp" id="pnt-cu-r{{ loop.index0 }}" role="region" aria-labelledby="pnt-cu-b{{ loop.index0 }}">
                                <div class="pnt-cu-resp-in"><p>{{ c.texto }}</p></div>
                            </div>
                        </li>
                    {% endfor %}
                </ol>
            </div>
        </div>
    </div>
</section>
