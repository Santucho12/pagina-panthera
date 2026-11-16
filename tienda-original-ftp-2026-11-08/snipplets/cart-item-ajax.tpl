{{ component('nubesdk-slot', { type: "before_line_item", pick: item.id }) }}
{% set is_gift = item.is_gift %}

{% set show_kit_breakdown = item.is_kit and item.kit_components is not empty %}
{% set kit_modal_id = 'cart-kit-modal-' ~ item.id %}


<div class="js-cart-item {% if item.product.is_non_shippable %}js-cart-item-non-shippable{% else %}js-cart-item-shippable{% endif %} item cart-item row {% if cart_page %}align-items-md-center{% endif %}" data-item-id="{{ item.id }}" data-gift="{{ is_gift ? 'true' : 'false' }}" data-store="cart-item-{{ item.product.id }}" data-component="cart.line-item">
  {% set hide_compare_price_subtotal = not item.compare_at_price_subtotal or item.is_subscription_item %}
  {% set discount_percentage = item.discount_percentage %}
  {% set compare_price_block %}
    {% if is_gift %}
      <span class="price-compare font-small opacity-50 ml-0">{{ item.compare_at_price_subtotal | money }}</span>
    {% else %}
      <div class="js-cart-item-subtotal-compare-price-container" data-line-item-id="{{ item.id }}" {% if hide_compare_price_subtotal %}style="display: none"{% endif %}>
        <span class="js-cart-item-subtotal-compare-price price-compare font-small opacity-50 ml-0" data-line-item-id="{{ item.id }}" data-component="subtotal_compare_price.value" data-component-value='{{ item.compare_at_price_subtotal | money }}'>{{ item.compare_at_price_subtotal | money }}</span>
        {% if discount_percentage > 0 %}
          <span class="text-accent font-small font-weight-bold ml-1">-{{ discount_percentage }}%</span>
        {% endif %}
      </div>
    {% endif %}
  {% endset %}

  {# Cart item image #}
  <div class="cart-item-image-col {% if cart_page %}cart-item-image-col-md mr-md-3{% endif %} col-auto pl-0">
    <a href="{{ item.url }}">
      <img src="{{ item.featured_image | product_image_url('medium') }}" class="img-fluid cart-item-image {% if cart_page %}cart-item-image-md{% endif %}" />
    </a>
  </div>
  <div class="col {% if cart_page %}col-md pr-md-0{% else %}align-items-center{% endif %} pl-0 py-3">
    {{ component(
      'cart-labels', {
        group: true,
        subscription_label: true,
        hide_percentage_off_label: true,
        free_shipping_short_wording: true,
        shipping_icon: true,
        svg_sprites: false,
        custom_shipping_icon: include ('snipplets/svg/truck.tpl', {svg_custom_class: 'icon-inline icon-lg font-small mr-1'}),
        labels_classes: {
          group: 'pb-1 d-block d-md-none',
          label: 'd-inline-flex align-items-center label label-accent label-small font-smallest mr-1 mb-1',
          subscription: 'font-smallest opacity-80 mt-1 mb-2 d-block d-md-none',
        },
      })
    }}
    <div class="row {% if cart_page %}align-items-md-center{% endif %}">
      
      <div class="col {% if cart_page %}col-md-5 pr-md-3{% endif %} pr-0">

        {# Cart item name #}

        <div class="font-small mb-2 mb-md-1 {% if cart_page %}col-12 col-md-12 px-0 font-md-body{% endif %}" data-component="line-item.name">
          <a href="{{ item.url }}" data-component="name.short-name">
            {{ item.short_name }}
          </a>
          <small data-component="name.short-variant-name">{{ item.short_variant_name }}</small>

          {# Cart kit components #}
          {% if show_kit_breakdown %}
            <a href="#" data-toggle="#{{ kit_modal_id }}" class="js-modal-open btn-link font-smallest d-block mt-1" data-component="line-item.kit-breakdown-link">
              {{ "Ver contenido" | translate }}
            </a>
          {% endif %}
          
          {% if is_gift %}
            <div class="text-accent font-smallest font-weight-bold text-uppercase my-2">
              {{ "Regalo" | translate }}
            </div>
          {% endif %}
          {{ component(
            'cart-labels', {
              group: true,
              subscription_label: true,
              hide_percentage_off_label: true,
              free_shipping_short_wording: true,
              shipping_icon: true,
              svg_sprites: false,
              custom_shipping_icon: include ('snipplets/svg/truck.tpl', {svg_custom_class: 'icon-inline icon-lg font-small mr-1'}),
              labels_classes: {
                group: 'mt-2 pb-1 d-none d-md-block',
                label: 'd-inline-flex align-items-center label label-accent label-small font-smallest mr-1 mb-1',
                subscription: 'font-smallest opacity-80 mt-1 mb-2 d-none d-md-block',
              },
            })
          }}

          {% if show_kit_breakdown %}
          {% embed "snipplets/modal.tpl" with {
              item: item, 
              modal_id: kit_modal_id, 
              modal_class: 'bottom modal-centered-small modal-md-width-400px', 
              modal_position: 'center', 
              modal_transition: 'slide', 
              modal_header_title: true,
              modal_width: 'centered', 
              modal_zindex_top: true } only %}
            {% block modal_head %}
              {{ item.short_name }}
            {% endblock %}
            {% block modal_body %}
              {{ component('cart-kit-components', {
                kit_components: item.kit_components,
                kit_quantity: item.quantity,
                classes: {
                  list: 'list-unstyled mb-0',
                  item: 'row no-gutters align-items-center py-2',
                  image_wrap: 'col-auto mr-2',
                  image: 'kit-products-item-image',
                  text: 'col',
                  name: 'font-small mb-0',
                },
              }) }}
            {% endblock %}
          {% endembed %}
        {% endif %}
        </div>

        {# Cart item subtotal #}

        <div class="d-flex flex-column">
          {{ compare_price_block }}
          {% if is_gift %}
            <span class="font-big {% if cart_page %}col-12 col-md-2 px-0 text-md-center d-block d-md-none{% endif %}">{{ "Gratis" | translate }}</span>
          {% else %}
            <span class="js-cart-item-subtotal font-big {% if cart_page %}col-12 col-md-2 px-0 text-md-center d-block d-md-none{% endif %}" data-line-item-id="{{ item.id }}" data-component="subtotal.value" data-component-value={{ item.subtotal | money }}>{{ item.subtotal | money }}</span>
						{{ component('subscriptions/cart-prepaid-per-delivery', {
							container_classes: 'font-small opacity-80 mt-1 d-block ' ~ (cart_page ? 'd-md-none'),
							label_classes: 'd-inline-block'
						}) }}
          {% endif %}
        </div>
      </div>

      <div class="col-auto {% if cart_page %}col-md-7 p-0{% endif %} text-center">

        {% if cart_page %}
        <div class="row align-items-md-center">
        {% endif %}

        {# Cart item quantity controls #}

        <div class="cart-item-quantity {% if cart_page %}col-12 col-md-3 px-0 mb-2 mb-md-0 text-center{% endif %}" data-component="line-item.subtotal"> 
          {% embed "snipplets/forms/form-input.tpl" with{
            type_number: true, 
            input_value: item.quantity, 
            input_name: 'quantity[' ~ item.id ~ ']', 
            input_data_attr: 'item-id',
            input_data_val: item.id,
            input_group_custom_class: 'form-quantity cart-item-quantity small m-auto mb-0', 
            input_custom_class: 'js-cart-quantity-input text-center',
            input_label: false, input_append_content: true,
            input_disabled: is_gift,
            data_component: 'quantity.value',
            form_control_container_custom_class: 'js-cart-quantity-container col px-1'} %}
              {% block input_prepend_content %}
              <div class="row m-0 align-items-center ">
                <span class="js-cart-quantity-btn form-quantity-icon btn" onclick="LS.minusQuantity({{ item.id }}{% if not cart_page %}, true{% endif %})" data-component="quantity.minus">
                  {% include "snipplets/svg/minus.tpl" with {svg_custom_class: "icon-inline icon-w-12 icon-xs"} %}
                </span>
              {% endblock input_prepend_content %}
              {% block input_append_content %}
                
                {# Always place this spinner before the quantity input #}
          
                <span class="js-cart-input-spinner cart-item-spinner" style="display: none;">
                  {% include "snipplets/svg/spinner-third.tpl" with {svg_custom_class: "icon-inline icon-spin svg-icon-text"} %}
                </span>

                <span class="js-cart-quantity-btn form-quantity-icon btn" onclick="LS.plusQuantity({{ item.id }}{% if not cart_page %}, true{% endif %})" data-component="quantity.plus">
                  {% include "snipplets/svg/plus.tpl" with {svg_custom_class: "icon-inline icon-w-12 icon-xs"} %}
                </span>
              </div>
              {% endblock input_append_content %}
          {% endembed %}
        </div>

        {% if cart_page %}

          {# Cart item unit price #}

          {% if is_gift %}
            <span class="js-cart-item-unit-price cart-item-subtotal-short font-big col-2 col-md-4 text-center p-0 d-none d-md-flex flex-column" data-line-item-id="{{ item.id }}">
              <span class="price-compare font-small opacity-50">{{ item.compare_at_price | money }}</span>
              <span>{{ "Gratis" | translate }}</span>
            </span>
          {% else %}
            <span class="js-cart-item-unit-price cart-item-subtotal-short font-big col-2 col-md-4 text-center p-0 d-none d-md-block" data-line-item-id="{{ item.id }}">{{ item.unit_price | money }}</span>
          {% endif %}

          <div class="d-flex flex-column {% if item.is_prepaid %}col-5 col-md-4 p-0{% endif %}">
            {{ compare_price_block }}
            {% if is_gift %}
              <span class="font-big col-5 col-md-4 text-right text-md-center p-0 mt-2 mt-md-0 d-none d-md-block">{{ "Gratis" | translate }}</span>
            {% else %}
              <span class="js-cart-item-subtotal font-big {% if not item.is_prepaid %}col-5 col-md-4{% endif %} text-right text-md-center p-0 mt-2 mt-md-0 d-none d-md-block" data-line-item-id="{{ item.id }}" data-component="subtotal.value" data-component-value={{ item.subtotal | money }}>{{ item.subtotal | money }}</span>
							{{ component('subscriptions/cart-prepaid-per-delivery', {
								container_classes: 'font-small opacity-80 mt-1 text-right text-md-center p-0 d-none d-md-block',
								label_classes: 'd-inline-block'
							}) }}
            {% endif %}
          </div>

        {% endif %}

        {% if not is_gift %}
          <button type="button" class="btn btn-link mt-2 {% if cart_page %}d-block d-md-none m-auto{% endif %}" onclick="LS.removeItem({{ item.id }}{% if not cart_page %}, true{% endif %})" data-component="line-item.remove">
            {{ "Borrar" | translate }}
          </button>
        {% endif %}

        {% if cart_page %}
        </div>
        {% endif %}
      </div>

      
    </div>
  </div>

  {% if cart_page %}

    {# Cart item delete — column always renders, even for gift items: it's a flex sibling of the
       flex-grow content column, so omitting it entirely lets that column expand and reflow the
       quantity/price/subtotal grid. Hide the button visually instead of removing the column. #}
    <div class="col-auto d-none d-md-block text-center" >
      <button type="button" class="btn btn-link {% if is_gift %}invisible{% endif %}" onclick="LS.removeItem({{ item.id }}{% if not cart_page %}, true{% endif %})" data-component="line-item.remove">
        {{ "Borrar" | translate }}
      </button>
    </div>
  {% endif %}

</div>
