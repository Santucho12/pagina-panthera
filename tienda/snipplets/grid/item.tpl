{# /*============================================================================
  #Item grid
==============================================================================*/

#Properties

#Slide Item

#}

{% set slide_item = slide_item | default(false) %}

{% set columns_desktop = template == 'home' ? section_columns_desktop : settings.grid_columns_desktop %}
{% set columns_mobile = template == 'home' ? section_columns_mobile : settings.grid_columns_mobile %}

{% set item_mobile_grid_classes = columns_mobile == 1 or horizontal_item ? 'col-12' : 'col-6' %}
{% set item_desktop_grid_classes = horizontal_item ? 'col-md-4' : columns_desktop == 4 ? 'col-md-3' : columns_desktop == 5 ? 'col-md-2-4' : 'col-md-2' %}

{% set item_grid_classes = item_mobile_grid_classes ~ ' ' ~ item_desktop_grid_classes %}
{% set item_columns_classes = slide_item ? 'js-item-slide p-0' : item_grid_classes %}

{% set appear_transition = appear_transition ?? true %}

{# Item image slider #}

{% set show_image_slider = 
    (template == 'category' or template == 'search')
    and settings.product_item_slider 
    and not reduced_item
    and not slide_item
    and not has_filters
    and product.other_images
%}

{% if show_image_slider %}
    {% set slider_controls_container_class = 'item-slider-controls-container svg-circle svg-icon-text d-none d-md-block' %}
    {% set slider_control_class = 'icon-inline' %}
    {% set control_prev = include ('snipplets/svg/chevron-left.tpl', {svg_custom_class: slider_control_class}) %}
    {% set control_next = include ('snipplets/svg/chevron-right.tpl', {svg_custom_class: slider_control_class}) %}
{% endif %}

{# Secondary images #}

{% set show_secondary_image = settings.product_hover %}

{% if slide_item %}
    <div class="swiper-slide">
{% endif %}
    <div class="js-item-product item-product {{ item_columns_classes }} {% if reduced_item %}item-product-reduced{% endif %} col-grid" data-product-type="list" data-product-id="{{ product.id }}" data-store="product-item-{{ product.id }}" data-component="product-list-item" data-component-value="{{ product.id }}" {% if appear_transition %}data-transition="fade-in-up"{% endif %}>

        {% if horizontal_item %}
            {% set placeholder_btn_size = 'btn-small' %}
        {% else %}
            {% set placeholder_btn_size = 'btn-medium' %}
        {% endif %}
        <div class="js-item-info-container item{% if horizontal_item %} item-horizontal{% endif %}{% if slide_item %} m-0{% endif %}">
            {% if horizontal_item and not settings.quick_shop %}
                <div class="row">
            {% elseif settings.quick_shop and not reduced_item %}
                <div class="js-product-container js-quickshop-container{% if product.variations %} js-quickshop-has-variants{% endif %} position-relative{% if horizontal_item %} row{% endif %}" data-variants="{{ product.variants_object | json_encode }}" data-quickshop-id="quick{{ product.id }}">
            {% endif %}
            {% set product_url_with_selected_variant = has_filters ?  ( product.url | add_param('variant', product.selected_or_first_available_variant.id)) : product.url  %}

            {% set item_img_width = product.featured_image.dimensions['width'] %}
            {% set item_img_height = product.featured_image.dimensions['height'] %}
            {% set item_img_srcset = product.featured_image %}
            {% set item_img_alt = product.featured_image.alt %}
            {% set item_img_spacing = item_img_height / item_img_width * 100 %}

            {# Set how much viewport space the images will take to load correct image #}

            {% if params.preview %}
                {% set mobile_image_viewport_space = '100' %}
                {% set desktop_image_viewport_space = '25' %}
            {% else %}
                {% if columns_mobile == 2 %}
                    {% set mobile_image_viewport_space = '50' %}
                {% else %}
                    {% set mobile_image_viewport_space = '100' %}
                {% endif %}

                {% if columns_desktop == 6 %}
                    {% set desktop_image_viewport_space = '16' %}
                {% elseif columns_desktop == 5 %}
                    {% set desktop_image_viewport_space = '20' %}
                {% else %}
                    {% set desktop_image_viewport_space = '25' %}
                {% endif %}
            {% endif %}

            {% set image_classes = 'js-item-image lazyautosizes ' ~ (not image_priority_high ? 'lazyload') ~ ' fade-in img-absolute img-absolute-centered' %}
            {% set data_expand = show_image_slider ? '50' : '-10' %}

            {% set floating_elements %}
                {% if not reduced_item %}
                    {% include 'snipplets/labels.tpl' with {shipping: true} %}
                {% endif %}
            {% endset %}

            {{ component(
                'product-item-image', {
                    image_lazy: true,
                    image_lazy_js: true,
                    image_data_expand: data_expand,
                    image_secondary_data_sizes: 'auto',
                    image_sizes: '(max-width: 768px)' ~ mobile_image_viewport_space ~ 'vw, (min-width: 769px)' ~ desktop_image_viewport_space ~ 'vw',
                    secondary_image: show_secondary_image,
                    slider: show_image_slider,
                    placeholder: true,
                    image_priority_high: image_priority_high,
                    custom_content: floating_elements,
                    slider_pagination_container: true,
                    svg_sprites: false,
                    product_item_image_classes: {
                        image_container: 'item-image' ~ (columns == 1 ? ' item-image-big') ~ (show_image_slider ? ' item-image-slider') ~ (horizontal_item ? ' col-5 pr-0'),
                        image_padding_container: 'js-item-image-padding position-relative d-block ' ~ (horizontal_item ? 'h-100'),
                        image: image_classes,
                        image_featured: 'item-image-featured',
                        image_secondary: 'item-image-secondary',
                        slider_container: 'swiper-container position-absolute h-100 w-100',
                        slider_wrapper: 'swiper-wrapper',
                        slider_slide: 'swiper-slide item-image-slide',
                        slider_control_pagination_container: 'item-slider-pagination-container d-md-none ' ~ (product.images_count == 2 ? 'two-bullets'),
                        slider_control_pagination: 'swiper-pagination item-slider-pagination',
                        slider_control: 'icon-inline icon-lg',
                        slider_control_prev_container: 'swiper-button-prev ' ~ slider_controls_container_class,
                        slider_control_next_container: 'swiper-button-next ' ~ slider_controls_container_class,
                        more_images_message: 'label item-more-images-message',
                        placeholder: 'placeholder-fade',
                    },
                    custom_control_prev: control_prev,
                    custom_control_next: control_next,
                })
            }}

            {% if 
                settings.quick_shop 
                and product.available 
                and product.display_price 
                and product.variations 
                and not reduced_item 
                and not product.isSubscribable() 
            %}

                {# Hidden product form to update item image and variants: Also this is used for quickshop popup #}

                <div class="js-item-variants hidden">
                    <form class="js-product-form" method="post" action="{{ store.cart_url }}">
                        <input type="hidden" name="add_to_cart" value="{{product.id}}" />
                        {% if product.variations %}
                            {% include "snipplets/product/product-variants.tpl" with {quickshop: true} %}
                        {% endif %}
                        {% set state = store.is_catalog ? 'catalog' : (product.available ? product.display_price ? 'cart' : 'contact' : 'nostock') %}
                        {% set texts = {'cart': "Agregar al carrito", 'contact': "Consultar precio", 'nostock': "Sin stock", 'catalog': "Consultar"} %}

                        {# Add to cart CTA #}

                        {% set show_product_quantity = product.available and product.display_price %}

                        {{ component('nubesdk-slot', { type: "before_quick_buy_add_to_cart" }) }}

                        <div class="form-row">

                            {% if show_product_quantity %}
                                {% include "snipplets/product/product-quantity.tpl" %}
                            {% endif %}

                            <div class="{% if show_product_quantity %}col-8{% else %}col-12{% endif %}">

                                <input type="submit" class="js-addtocart js-prod-submit-form btn btn-primary w-100 mb-2 {{ state }}" value="{{ texts[state] | translate }}" {% if state == 'nostock' %}disabled{% endif %} />

                                {# Fake add to cart CTA visible during add to cart event #}

                                {% include 'snipplets/placeholders/button-placeholder.tpl' with {custom_class: "mb-1"} %}
                            </div>
                        </div>
                    </form>
                </div>

            {% endif %}

            {# Subscription data - calculate only is_subscription_only for the CTA button #}
            {% set is_subscription_only = product.isSubscriptionOnly() %}

            {% set show_labels = not product.has_stock or product.compare_at_price or product.hasVisiblePromotionLabel %}
            <div class="item-description{% if horizontal_item %} col-7{% if not show_labels or not settings.quick_shop %} pt-3{% endif %}{% endif %}" data-store="product-item-info-{{ product.id }}">
                <a href="{{ product_url_with_selected_variant }}" title="{{ product.name }}" aria-label="{{ product.name }}" class="item-link">
                    {% if not reduced_item %}
                        {% include 'snipplets/labels.tpl' %}
                    {% endif %}

                    {{ component('nubesdk-slot', { type: "before_product_grid_item_name" }) }}

                    <div class="js-item-name item-name mb-2" data-store="product-item-name-{{ product.id }}">{{ product.name }}</div>

                    {{ component('nubesdk-slot', { type: "after_product_grid_item_name" }) }}

                    {{ component('nubesdk-slot', { type: "before_product_grid_item_price" }) }}

                    {% if product.display_price %}
                        {% if is_subscription_only %}
                            {# Subscription only products: use subscription-price component with product_list location #}
                            {{ component('subscriptions/subscription-price', {
                                location: 'product_list',
                                subscription_classes: {
                                    container: 'item-price-container mb-1',
                                    price_compare: 'price-compare mt-1 mb-1 ml-0',
                                    price_with_subscription: 'item-price mr-1',
                                },
                            }) }}
                        {% else %}
                            {# Normal products: original price display #}
                            <div class="item-price-container mb-1" data-store="product-item-price-{{ product.id }}">
                                <span class="js-price-display item-price mr-1" data-product-price="{{ product.price }}">
                                    {{ product.price | money }}
                                </span>
                                {% if not reduced_item %}
                                    <span class="js-compare-price-display price-compare mt-1 mb-1 ml-0" {% if not product.compare_at_price or not product.display_price %}style="display:none;"{% else %}style="display:inline-block;"{% endif %}>
                                        {{ product.compare_at_price | money }}
                                    </span>
                                {% endif %}
                            </div>
                        {% endif %}
                    {% endif %}
                    
                    {{ component('nubesdk-slot', { type: "after_product_grid_item_price" }) }}

                    {% set product_can_show_installments = product.show_installments and product.display_price and product.get_max_installments.installment > 1 and settings.product_installments and not reduced_item %}

                    {% set discount_price_spacing_classes = product_can_show_installments or product.isSubscribable() ? 'mb-2' %}

                    {{ component('payment-discount-price', {
                            visibility_condition: settings.payment_discount_price and not reduced_item,
                            location: 'product',
                            container_classes: discount_price_spacing_classes ~ " mt-1 text-accent font-small",
                            text_classes: {
                                price: 'font-small',
                            },
                        }) 
                    }}
                    {% if product_can_show_installments %}
                       {{ component('installments', {'location' : 'product_item', short_wording: true, container_classes: { installment: "item-installments"}}) }}
                    {% endif %}

                    {% if not reduced_item %}

                        {% set subscription_icon = include ('snipplets/svg/returns-alt.tpl', {svg_custom_class: 'icon-inline icon-lg svg-icon-accent mr-1'}) %}
                        
                        {{ component('subscriptions/subscription-message', {
                            svg_sprites: false,
                            subscription_icon: true,
                            subscription_custom_icon: subscription_icon,
                            subscription_classes: {
                                container: 'mt-1 pt-1 text-accent font-smallest d-flex',
                            },
                        }) }}

                    {% endif %}
                </a>
                {% if
                    settings.quick_shop
                    and not product.is_kit
                    and not reduced_item
                %}
                    <div class="item-actions{% if horizontal_item %} mt-2 pt-1{% else %} mt-3{% endif %}">

                        {% set quickshop_button_classes = 'btn btn-secondary py-2 ' ~ (horizontal_item ? 'btn-small' : 'btn-medium d-block') %}

                        {% set state = store.is_catalog ? 'catalog' : (product.available ? product.display_price ? 'cart' : 'contact' : 'nostock') %}
                        {% set texts = {'cart': "Comprar", 'contact': "Consultar precio", 'nostock': "Sin stock", 'catalog': "Consultar"} %}
                        {% set quickshop_btn_text = is_subscription_only ? ('our_components.subscriptions.subscribe' | tt) : (product.variations ? 'Comprar' : texts[state]) %}

                        {% if product.available and product.display_price %}
                            
                            {% if product.isSubscribable() %}

                                {# Product with subscription will link to the product page #}

                                {% set button_title = is_subscription_only ? ('our_components.subscriptions.subscribe' | tt) ~ ' ' ~ product.name : ('Compra rápida de' | translate) ~ ' ' ~ product.name %}
                                <a  href="{{ product_url_with_selected_variant }}" class="{{ quickshop_button_classes }}" title="{{ button_title }}" aria-label="{{ button_title }}">{{ quickshop_btn_text | translate }}</a>
                            
                            {% else %}
                            
                                {% if product.variations %}

                                    {# Open quickshop popup if has variants #}

                                    <a data-toggle="#quickshop-modal" data-modal-url="modal-fullscreen-quickshop" href="#" class="js-quickshop-modal-open js-fullscreen-modal-open {% if slide_item %}js-quickshop-slide{% endif %} js-modal-open {{ quickshop_button_classes }}" title="{{ 'Compra rápida de' | translate }} {{ product.name }}" aria-label="{{ 'Compra rápida de' | translate }} {{ product.name }}" data-component="product-list-item.add-to-cart" data-component-value="{{product.id}}">{{ quickshop_btn_text | translate }}</a>
                                {% else %}
                                    <form class="js-product-form d-block" method="post" action="{{ store.cart_url }}">
                                        <input type="hidden" name="add_to_cart" value="{{product.id}}" />
                                        <input type="submit" class="js-addtocart js-prod-submit-form btn btn-secondary{% if horizontal_item %} btn-small{% else %} btn-medium w-100{% endif %} py-2 {{ state }}" value="{{ quickshop_btn_text | translate }}" {% if state == 'nostock' %}disabled{% endif %} data-component="product-list-item.add-to-cart" data-component-value="{{ product.id }}"/>

                                        {# Fake add to cart CTA visible during add to cart event #}

                                        {% include 'snipplets/placeholders/button-placeholder.tpl' with {btn_secondary: true, custom_class: placeholder_btn_size ~ " mb-1 py-2", direct_add: true} %}
                                    </form>
                                {% endif %}
                            {% endif %}
                        {% endif %}
                    </div>
                {% endif %}
            </div>
            {% if (settings.quick_shop and not reduced_item) or (horizontal_item and not settings.quick_shop) %}
                </div>{# This closes the quickshop tag #}
            {% endif %}

            {# Structured data to provide information for Google about the product content #}
            {{ component('structured-data', {'item': true}) }}
        </div>
    </div>
{% if slide_item %}
    </div>
{% endif %}