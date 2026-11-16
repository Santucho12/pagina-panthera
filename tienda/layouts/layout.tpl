<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" xmlns:og="http://opengraphprotocol.org/schema/" lang="{% for language in languages %}{% if language.active %}{{ language.lang }}{% endif %}{% endfor %}">
    <head>
        <link rel="preconnect" href="{{ store_resource_hints }}" />
        <link rel="dns-prefetch" href="{{ store_resource_hints }}" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        {# Libre Baskerville solo para el texto de los banners de categorías (2026-11-12) #}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{{ page_title }}</title>
        <meta name="description" content="{{ page_description }}" />
        <link rel="preload" as="style" href="{{ [settings.font_headings, settings.font_rest] | google_fonts_url('400,700') }}" />
        <link rel="preload" href="{{ 'css/style-colors.scss.tpl' | static_url }}" as="style" />

        {# Preload LCP home, category and product page elements #}

        {% snipplet 'preload-images.tpl' %}

        {{ component('social-meta') }}

        {#/*============================================================================
            #CSS and fonts
        ==============================================================================*/#}

        {# Critical CSS needed to show first elements of store while CSS async is loading #}

        <style>
            {# Font families #}

            {{ component(
                'fonts',{
                    font_weights: '400,700',
                    font_settings: 'settings.font_headings, settings.font_rest'
                })
            }}

            {# General CSS Tokens #}

            {% include "static/css/style-tokens.tpl" %}

            {# Critical CSS #}

            {% include "static/css/style-critical.tpl" %}
        </style>

        {# Colors and fonts used from settings.txt and defined on theme customization #}

        {{ 'css/style-colors.scss.tpl' | static_url | static_inline }}

        {# Load async styling not mandatory for first meaningfull paint #}

        <link rel="stylesheet" href="{{ 'css/style-async.scss.tpl' | static_url }}" media="print" onload="this.media='all'">

        {# Loads custom CSS added from Advanced Settings on the admin´s theme customization screen #}

        <style>
            {{ settings.css_code | raw }}
        </style>

        {#/*============================================================================
            #Javascript: Needed before HTML loads
        ==============================================================================*/#}

        {# Defines if async JS will be used by using script_tag(true) #}

        {% set async_js = true %}

        {# Defines the usage of jquery loaded below, if nojquery = true is deleted it will fallback to jquery 1.5 #}

        {% set nojquery = true %}

        {# Jquery async by adding script_tag(true) #}

        {% if load_jquery %}

            {{ '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js' | script_tag(true) }}

        {% endif %}

        {# Panthera (2026-11-12, PENDIENTES 109): imagen para compartir el link (WhatsApp, Instagram, Facebook) en todas las páginas menos la
           ficha (ahí va la foto del producto). Va ANTES de lo de Tiendanube porque las redes toman la primera. Lo ideal es subirla también
           en el admin (iconos/compartir-1200x630.jpg). #}
        {% if template != 'product' %}
        <meta property="og:image" content="https:{{ 'panthera/iconos/compartir-1200x630.jpg' | static_url }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        {% endif %}

        {# Loads private Tiendanube JS #}

        {% head_content %}

        {# Panthera (2026-11-12, PENDIENTES 108 y 111): ícono de la pestaña y del celular con la marca (van DESPUÉS de los de Tiendanube para
           ganarles), y la barra del navegador del celular en el rosa de la marca, siempre en modo claro #}
        <link rel="icon" type="image/png" sizes="32x32" href="{{ 'panthera/iconos/favicon-32.png' | static_url }}">
        <link rel="icon" type="image/png" sizes="192x192" href="{{ 'panthera/iconos/favicon-192.png' | static_url }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ 'panthera/iconos/apple-touch-icon.png' | static_url }}">
        <meta name="theme-color" content="#F4ACC4">
        <meta name="color-scheme" content="light">

        {# Structured data to provide information for Google about the page content #}

        {{ component('structured-data-organization') }}
        {{ component('structured-data') }}

        {# Panthera: estética nueva (franja de beneficios, navbar isla, footer y sección de redes).
           Va al final del head para ganarle al CSS de Lima. ⚠️ Preparado en local: NO subido todavía. #}
        {% set panthera_v = '20261116l' %}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        {# Montserrat (2026-11-12): la carga marca.css con @font-face desde fonts.gstatic.com; antes Outfit + Libre Baskerville + Archivo #}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="{{ 'panthera/marca.css' | static_url }}?v={{ panthera_v }}" />
        {# Panthera: estilos de las cuatro secciones nuevas del inicio (Armá tu pulsera, Colecciones Disney, Cómo cuidar tu plata, Nuestros locales) #}
        <link rel="stylesheet" href="{{ 'panthera/secciones.css' | static_url }}?v={{ panthera_v }}" />
        {# Panthera: arreglos de las páginas internas (revisión completa, 2026-11-12) #}
        <link rel="stylesheet" href="{{ 'panthera/paginas.css' | static_url }}?v={{ panthera_v }}" />

    </head>
    <body class="{% if customer %}customer-logged-in{% endif %} template-{{ template | replace('.', '-') }}">
        {# Panthera (2026-11-12): los listados arrancan en "Novedades". La recarga con sort_by se hace acá, apenas llega el <body>, y no
           en marca.js (que corre recién con la página entera: se veía la página a medio armar antes de recargar). Mismo código en tienda-local.mjs (ORDEN_TEMPRANO). #}
        {% if template == 'category' %}
        <script>if(!/[?&]sort_by=/.test(location.search)&&!(window.self!==window.top&&/[?&]pnt-panel=1/.test(location.search))){document.documentElement.style.visibility='hidden';location.replace(location.pathname+(location.search?location.search+'&':'?')+'sort_by=created-descending'+location.hash);}if(/[?&]ofertas(&|=|$)/.test(location.search)||location.pathname==='/ofertas/'||location.pathname==='/ofertas'){document.documentElement.classList.add('pnt-pag-ofertas');}</script>
        {# (2026-11-12) la página de Ofertas (?ofertas) se marca acá, apenas llega el <body>: así marca.css esconde los productos de
           "Todos los productos" desde el primer cuadro (antes se veían hasta que marca.js ponía las ofertas) #}
        {% endif %}

        {# Panthera: intro cinematográfica QUITADA por pedido del usuario (2026-11-12). Para volver a ponerla (va primero para tapar desde el primer cuadro):
        {% if template == 'home' %}
            {% snipplet "panthera/intro.tpl" %}
        {% endif %} #}

        {{ component('nubesdk-slot', { type: "before_main_content" }) }}

        {# Facebook comments on product page #}

        {% if template == 'product' %}

            {# Facebook comment box JS #}
            {% if settings.show_product_fb_comment_box %}
                {{ fb_js }}
            {% endif %}

            {# Pinterest share button JS #}
            {{ pin_js }}

        {% endif %}

        {# Back to admin bar #}

        {{back_to_admin}}

        {# Header = Advertising + Nav + Logo + Search + Ajax Cart #}

        {% snipplet "header/header.tpl" %}

        {# Page content #}

        {% template_content %}

        {# Quickshop modal #}

        {% snipplet "grid/quick-shop.tpl" %}

        {# WhatsApp chat button #}

        {% snipplet "whatsapp-chat.tpl" %}

        {# Panthera: secciones nuevas del inicio, en este orden (después de "No los dejes escapar" y antes de "Seguinos en redes"):
           Armá tu pulsera, Colecciones Disney, Cómo cuidar tu plata y Nuestros locales (2026-11-10), y después "Seguinos en redes"
           (estilo BS23). Solo en el inicio. ⚠️ Preparado en local: NO subido todavía. #}

        {% if template == 'home' %}
            {% snipplet "panthera/disney.tpl" %}
            {% snipplet "panthera/armar.tpl" %}
            {# "Armá tu oreja" en 3D (2026-11-11): justo debajo de "Armá tu pulsera" (pedido del usuario) #}
            {% snipplet "panthera/oreja.tpl" %}
            {% snipplet "panthera/cuidar.tpl" %}
            {# "Vení a conocernos" oculta por ahora (pedido 2026-11-10): para mostrarla, agregar acá el snipplet panthera/locales.tpl (igual que los de arriba) #}
            {# "Conocenos" (2026-11-11): réplica de "Nuestro local" de BS23 con el video del local; anteúltima, arriba de redes (pedido del usuario) #}
            {% snipplet "panthera/conocenos.tpl" %}
            {% snipplet "panthera/redes.tpl" %}
        {% endif %}

        {# Footer #}

        {% snipplet "footer/footer.tpl" %}

        {% if cart.free_shipping.cart_has_free_shipping or cart.free_shipping.min_price_free_shipping.min_price %}

            {# Minimum used for free shipping progress messages. Located on header so it can be accesed everywhere with shipping calculator active or inactive #}

            <span class="js-ship-free-min hidden" data-pricemin="{{ cart.free_shipping.min_price_free_shipping.min_price_raw }}"></span>
            <span class="js-free-shipping-config hidden" data-config="{{ cart.free_shipping.allFreeConfigurations }}"></span>
            <span class="js-cart-subtotal hidden" data-priceraw="{{ cart.subtotal }}"></span>
            <span class="js-cart-discount hidden" data-priceraw="{{ cart.promotional_discount_amount }}"></span>
        {% endif %}

        {#/*============================================================================
            #Javascript: Needed after HTML loads
        ==============================================================================*/#}

        {# Javascript used in the store #}

        <script type="text/javascript">

            {# Libraries that do NOT depend on other libraries, e.g: Jquery #}

            {% include "static/js/external-no-dependencies.js.tpl" %}

            {# LS.ready.then function waits to Jquery and private Tiendanube JS to be loaded before executing what´s inside #}

            LS.ready.then(function(){

                {# Libraries that requires Jquery to work #}

                {% include "static/js/external.js.tpl" %}

                {# Specific store JS functions: product variants, cart, shipping, etc #}

                {% include "static/js/store.js.tpl" %}
            });
        </script>

        {# Google reCAPTCHA on register page #}

        {% if template == 'account.register' %}
            {% if not store.hasContactFormsRecaptcha() %}
                {{ '//www.google.com/recaptcha/api.js' | script_tag(true) }}
            {% endif %}
            <script type="text/javascript">
                var recaptchaCallback = function() {
                    jQueryNuvem('.js-recaptcha-button').prop('disabled', false);
                };
            </script>
        {% endif %}

        {# Google survey JS for Tiendanube Survey #}

        {{ component('google-survey') }}

        {# Store external codes added from admin #}

        {% if store.assorted_js %}
            <script>
                LS.ready.then(function() {
                    var trackingCode = jQueryNuvem.parseHTML('{{ store.assorted_js| escape("js") }}', document, true);
                    jQueryNuvem('body').append(trackingCode);
                });
            </script>
        {% endif %}

        {# Panthera: franja de beneficios, navbar isla, footer y redes #}
        {# Scroll suave y pesado (Lenis), vertical y lateral #}
        <script src="{{ 'panthera/lenis.min.js' | static_url }}" defer></script>
        <script src="{{ 'panthera/scroll.js' | static_url }}?v={{ panthera_v }}" defer></script>
        <script src="{{ 'panthera/marca.js' | static_url }}?v={{ panthera_v }}" defer></script>
        {# Panthera: lo que se mueve en las secciones nuevas del inicio (aparecer al bajar y el acordeón de cuidados) #}
        <script src="{{ 'panthera/secciones.js' | static_url }}?v={{ panthera_v }}" defer></script>
        <script src="{{ 'panthera/paginas.js' | static_url }}?v={{ panthera_v }}" defer></script>
        {% if template == 'home' %}
            {# Panthera: "Armá tu pulsera" en 3D (three.js se pide recién cuando la sección se acerca) #}
            <script src="{{ 'panthera/armar3d.js' | static_url }}?v={{ panthera_v }}" defer></script>
            {# Panthera: "Armá tu oreja" en 3D (igual: three.js y la escena se piden recién cerca de la sección) #}
            <script src="{{ 'panthera/oreja3d.js' | static_url }}?v=20261116l" defer></script>
        {% endif %}
    </body>
</html>
