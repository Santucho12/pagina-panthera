{# Check if store has free shipping without regions or categories #}

{% set has_free_shipping = cart.free_shipping.cart_has_free_shipping or cart.free_shipping.min_price_free_shipping.min_price %}
{% set has_free_shipping_bar = has_free_shipping and cart.free_shipping.min_price_free_shipping.min_price_raw > 0 %}

{% set gift_progress_parameters = {
  show_check: false,
  progress_bar_classes: {
    container: 'progress-bar',
    title_container: 'progress-bar-title-container',
    title: 'progress-bar-title text-accent',
    subtitle: 'progress-bar-subtitle',
    track: 'bar-progress',
    fill: 'bar-progress-active transition-soft',
  }
} %}

{% if cart_page %}
  <div class="d-block d-md-none">
{% endif %}
    {{ component('gift-promotion-progress', gift_progress_parameters) }}
{% if cart_page %}
  </div>
{% endif %}

{% set price_without_taxes_container_classes = "row opacity-50 pb-2" %}
{% set price_without_taxes_label_classes = "col-auto" %}
{% set price_without_taxes_price_classes = "col text-right" %}

{% if has_free_shipping_bar %}

  {# includes free shipping progress bar: only if store has free shipping with a minimum #}

  {% if cart_page %}
    <div class="d-block d-md-none">
  {% endif %}
      {% include "snipplets/shipping/shipping-free-rest.tpl" %}
  {% if cart_page %}
    </div>
  {% endif %}

{% endif %}

{# Define conditions to show shipping calculator and store branches on cart #}

{% set show_calculator_on_cart = settings.shipping_calculator_cart_page and store.has_shipping %}
{% set show_cart_fulfillment = settings.shipping_calculator_cart_page and (store.has_shipping or store.branches) %}

{% if cart_page %}

  {# Cart page subtotal #}

  <div id="cart-sticky-summary" class="position-sticky-md card p-3 p-md-4">
    <div class="d-none d-md-block">
      {{ component('gift-promotion-progress', gift_progress_parameters) }}
    </div>

    {% if has_free_shipping_bar %}
      {# includes free shipping progress bar: only if store has free shipping with a minimum #}

      <div class="d-none d-md-block">
        {% include "snipplets/shipping/shipping-free-rest.tpl" %}
      </div>
    {% endif %}

   
{% else %}



  {# Cart fulfillment #}
  {% include "snipplets/shipping/cart-fulfillment.tpl" %}
{% endif %}

    {% if settings.cart_coupon %}
      <div class="js-visible-on-cart-filled divider my-0" {% if cart.items_count == 0 %}style="display:none;"{% endif %}>
        {{ component('coupon-input', {
          svg_sprites: false,
          toggle_inactive_custom_icon: include('snipplets/svg/plus.tpl', {svg_custom_class: 'icon-inline svg-icon-text'}),
          toggle_active_custom_icon: include('snipplets/svg/minus.tpl', {svg_custom_class: 'icon-inline svg-icon-text'}),
          spinner_custom_icon: include('snipplets/svg/spinner-third.tpl', {svg_custom_class: 'icon-inline icon-spin svg-icon-text'}),
          container_classes: {
            toggle: 'd-flex align-items-center justify-content-between w-100 py-3',
            toggle_icon: 'icon-inline svg-icon-text',
            toggle_label: 'd-flex align-items-center',
            label: 'h5 font-big',
            actions: 'mb-4',
            applied_row: 'd-flex align-items-center justify-content-between',
            applied_code: 'mr-4 font-small align-bottom',
            remove_button: 'btn btn-secondary btn-small',
            form: 'mb-0',
            input_wrapper: 'd-flex',
            input: 'form-control form-control-rounded form-control-small flex-fill',
            apply_button: 'btn btn-secondary flex-shrink-0 ml-2 btn-medium px-4',
            spinner_icon: 'icon-inline icon-spin svg-icon-text',
            spinner: 'ml-2',
            error: 'alert alert-danger mb-0 mt-2',
          }
        }) }}
      </div>
    {% endif %}

   {# Cart totals: subtotal, promos, coupon discount, shipping cost, total, payment/installments #}
   {{ component('cart-totals', {
        shipping_enabled: show_calculator_on_cart,
        shipping_discount_row_enabled: true,
        payment_discount_price_enabled: settings.payment_discount_price,
        installments_enabled: not settings.payment_discount_price,
        totals_divider: false,
        container_classes: {
          main_container: 'my-4',
          totals: 'no-gutters',
        },
        text_classes: {
          subtotals_row: 'd-grid grid-1-auto ' ~ (cart_page ? 'px-0'),
          subtotal: 'row no-gutters font-big mb-0 ' ~ (cart_page ? 'h5'),
          subtotal_label: 'col-auto ' ~ (cart_page ? 'pl-md-0'),
          subtotal_price: 'col text-right ' ~ (cart_page ? 'pl-md-0'),
          price_without_taxes: price_without_taxes_container_classes,
          price_without_taxes_label: price_without_taxes_label_classes,
          price_without_taxes_price: price_without_taxes_price_classes,
          discounts_row: 'row no-gutters py-1 ' ~ (cart_page ? 'mb-2' : 'd-grid grid-1-auto'),
          shipping_costs: 'js-fulfillment-info js-shipping-cost-table h6 font-body row no-gutters py-1',
          shipping_costs_label: 'col-auto pl-md-0',
          shipping_costs_price: 'col text-right opacity-40 pr-md-0',
          shipping_costs_calculating: 'col text-right opacity-40 pr-md-0',
          shipping_costs_empty: 'col text-right opacity-40 pr-md-0',
          total: 'row no-gutters h2 font-huge mb-2',
          total_label: 'col-auto ' ~ (cart_page ? 'pl-md-0'),
          total_price: 'col text-right ' ~ (cart_page ? 'pr-md-0'),
          payment_discount_and_installments: 'col-12 ' ~ (cart_page ? 'pr-md-0'),
          payment_discount_price: 'font-small text-right',
          installments: 'font-small text-right',
          discounts_label: 'col pr-3 ' ~ (cart_page ? 'pl-md-0'),
          discounts_price: 'col-auto text-right text-accent ' ~ (cart_page ? 'pr-md-0'),
          shipping_discount_row: 'row mb-2 ' ~ (cart_page ? 'no-gutters'),
          shipping_discount_label: 'col-auto text-uppercase ' ~ (cart_page ? 'pl-md-0'),
          shipping_discount_price: 'col text-right pr-md-0',
        },
      }) 
    }}

    {{ component('nubesdk-slot', { type: "before_go_to_checkout" }) }}

    <div class="js-visible-on-cart-filled container-fluid" {% if cart.items_count == 0 %}style="display:none;"{% endif %}>

      {# Cart page and popup CTA Module #}

      {% set has_validation_messages = cart.checkout_enabled_validation_messages | length > 0 %}
      {% set should_show_checkout_button = cart.checkout_enabled and not has_validation_messages %}

      {% if cart_page %}

        {# Cart page CTA and minimum alert: Needs to be present or absence on DOM to work correctly with minimum price feature #}
        <div class="row mb-3">
          <input id="go-to-checkout" class="btn btn-primary btn-block" {{ not should_show_checkout_button ? 'style="display:none"' }} type="submit" name="go_to_checkout" value="{{ 'Iniciar Compra' | translate }}"/>
        </div>

        <div class="row">
          {# Cart alert messages #}
          {{ component(
            'checkout-enabled-validation-messages', {
              alert_classes: 'alert alert-warning mb-4',
              cart_minimum_value: settings.cart_minimum_value
            })
          }}
        </div>

      {% else %}

        {# Cart popup CTA and minimum alert #}

        <div class="js-ajax-cart-submit row mb-3" {{ not should_show_checkout_button ? 'style="display:none"' }} id="ajax-cart-submit-div" >
          <input class="btn btn-primary btn-block" type="submit" name="go_to_checkout" value="{{ 'Iniciar Compra' | translate }}" data-component="cart.checkout-button"/>
        </div>
        <div class="row">
          {# Cart alert messages #}
          {{ component(
            'checkout-enabled-validation-messages', {
              alert_classes: 'alert alert-warning mb-4',
              cart_minimum_value: settings.cart_minimum_value
            })
          }}
        </div>

      {% endif %}

      {# Cart panel continue buying link #}

      {% if settings.continue_buying %}
        <div class="row mb-2">
          <div class="text-center w-100">
            <a href="{% if cart_page %}{{ store.products_url }}{% else %}#{% endif %}" class="{% if not cart_page %}js-modal-close js-fullscreen-modal-close{% endif %} btn-link">{{ 'Ver más productos' | translate }}</a>
          </div>
        </div>
      {% endif %}
    </div>

    {{ component('nubesdk-slot', { type: "after_go_to_checkout" }) }}

{% if cart_page %}
  {# End of sticky module #}
  </div>
{% endif %}
