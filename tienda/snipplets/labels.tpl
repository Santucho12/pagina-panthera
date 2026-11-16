{% set shipping_icon = include ('snipplets/svg/truck.tpl', {svg_custom_class: 'icon-inline icon-w-24 icon-lg svg-icon-text'}) %}
{% set label_accent_classes = 'label label-accent' %}

{{ component(
  'labels', {
    defer_stock_label_text: true,
    prioritize_promotion_over_offer: true,
    promotion_and_offer_only: not shipping ? true : false,
    promotion_nxm_long_wording: false,
    offer_negative_discount_percentage: not shipping ? true : false,
    offer_percentage_wording: false,
    free_shipping_and_no_stock_only: shipping ? true : false,
    shipping_icon: true,
    shipping_custom_icon: shipping_icon,
    free_shipping_short_wording: true,
    svg_sprites: false,
    labels_classes: {
      group: (product_detail ? 'labels-product-slider ') ~ (shipping ? 'js-labels-floating-group labels-absolute'),
      promotion: label_accent_classes,
      promotion_primary_text: 'd-block',
      offer: 'js-offer-label ' ~ label_accent_classes,
      no_stock: 'js-stock-label label label-default',
    },
  })
}}