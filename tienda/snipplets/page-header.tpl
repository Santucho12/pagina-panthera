{# /*============================================================================
  #Page header
==============================================================================*/

#Properties

#Title

#Breadcrumbs

#}

{% set heading = heading ?? true %}

{% set category_banner = template == 'category' and ((category.images is not empty) or ("banner-products.jpg" | has_custom_image)) %}
{% set has_category_description_without_banner = template == 'category' and not category_banner and category.description %}

<section class="page-header {% if template != 'category' %}{% if template == 'home' or template == 'product' %}pt-2{% else %}pt-4{% endif %}{% endif %} {% if category_banner or (template == 'product' and settings.product_sku and product.sku) %}mb-0{% endif %} {% if has_category_description_without_banner %}mb-2 mb-md-0{% endif %}" data-store="page-title">
	{% if category_banner %}
		<div class="container px-0">
	{% elseif container %}
		<div class="container">
			<div class="row">
				<div class="col-12">
	{% endif %}
				{% include 'snipplets/breadcrumbs.tpl' %}
				{% if template == 'product' %}

					{{ component('nubesdk-slot', { type: "before_product_detail_name" }) }}

				{% endif %}
				{% if heading %}
					<h1
				{% else %}
					<div
				{% endif %}
					class="{% if template == 'product' %}js-product-name h5{% elseif not heading %}h1{% endif %} {% if not category_banner and not template == 'product' and not heading %}h2{% endif %}" 
					{% if template == "product" %}data-store="product-name-{{ product.id }}"{% endif %}>
					{% block page_header_text %}{% endblock %}
				{% if heading %}
					</h1>
				{% else %}
					</div>
				{% endif %}
				{% if template == 'product' %}

					{{ component('nubesdk-slot', { type: "after_product_detail_name" }) }}

				{% endif %}
	{% if category_banner %}
		</div>
	{% elseif container %}
				</div>
			</div>
		</div>
	{% endif %}
</section>
