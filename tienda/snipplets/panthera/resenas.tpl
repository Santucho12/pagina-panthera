{# Panthera (2026-11-12): franja de reseñas reales en la ficha de producto, como la de BS23. Se cargan en el admin (Diseño del tema > Reseñas de clientes).
   Sin ninguna reseña con texto no se imprime nada. marca.js (sección 14) calcula el promedio y arma las flechas. ⚠️ Sin subir: en la vista previa local las reseñas son DE MUESTRA y las arma marca.js. #}
{% set bs_res_hay = false %}
{% for i in 1..8 %}
    {% if attribute(settings, "resena_#{i}_texto") %}
        {% set bs_res_hay = true %}
    {% endif %}
{% endfor %}
{% if bs_res_hay %}
    <section class="pnt-res" aria-label="{{ settings.resenas_titulo ?: 'Lo que dicen nuestros clientes' }}">
        <div class="pnt-res-cab">
            <h2 class="pnt-res-titulo">{{ settings.resenas_titulo ?: 'Lo que dicen nuestros clientes' }}</h2>
            <p class="pnt-res-promedio" hidden></p>
        </div>
        <div class="pnt-res-ventana">
            <ul class="pnt-res-pista">
                {% for i in 1..8 %}
                    {% set bs_res_texto = attribute(settings, "resena_#{i}_texto") %}
                    {% if bs_res_texto %}
                        {% set bs_res_estrellas = attribute(settings, "resena_#{i}_estrellas") %}
                        {% set bs_res_foto = "resena_#{i}_image.jpg" | has_custom_image %}
                        <li class="pnt-res-item"{% if bs_res_estrellas and bs_res_estrellas != 'none' %} data-estrellas="{{ bs_res_estrellas }}"{% endif %}>
                            {% if bs_res_foto %}
                                <img class="pnt-res-foto lazyload" src="{{ 'images/empty-placeholder.png' | static_url }}" data-src="{{ "resena_#{i}_image.jpg" | static_url | settings_image_url('large') }}" alt="" width="64" height="78">
                            {% endif %}
                            <div class="pnt-res-cuerpo">
                                {% if bs_res_estrellas and bs_res_estrellas != 'none' %}
                                    <span class="pnt-res-estrellas" aria-label="{{ bs_res_estrellas }} de 5 estrellas">{% for e in 1..5 %}<i{% if e > bs_res_estrellas %} class="pnt-res-vacia"{% endif %}>★</i>{% endfor %}</span>
                                {% endif %}
                                <p class="pnt-res-texto">{{ bs_res_texto }}</p>
                                {% set bs_res_nombre = attribute(settings, "resena_#{i}_nombre") %}
                                {% set bs_res_detalle = attribute(settings, "resena_#{i}_detalle") %}
                                {% if bs_res_nombre or bs_res_detalle %}
                                    <p class="pnt-res-autor">{{ bs_res_nombre }}{% if bs_res_nombre and bs_res_detalle %} · {% endif %}{{ bs_res_detalle }}</p>
                                {% endif %}
                            </div>
                        </li>
                    {% endif %}
                {% endfor %}
            </ul>
        </div>
    </section>
{% endif %}
