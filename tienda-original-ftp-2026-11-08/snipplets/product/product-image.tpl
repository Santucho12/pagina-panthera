{% if home_main_product %}
	{% set has_multiple_slides = product.media_count > 1 %}
{% else %}
	{% set has_multiple_slides = product.media_count > 1 or product.video_url %}
{% endif %}

{{ component('nubesdk-slot', { type: "before_product_detail_image" }) }}

<div class="row" data-store="product-image-{{ product.id }}"> 
	{% if has_multiple_slides %}
		<div class="col-12 col-md-2{% if home_main_product %} d-none d-md-block{% endif %} order-last order-md-0 pr-0 pr-md-3">
			<div class="js-swiper-product-thumbs swiper-product-thumb mb-3"> 
				<div class="swiper-wrapper">
					{% for media in product.media %}
						<div class="swiper-slide w-auto">
							{% include 'snipplets/product/product-image-thumbs.tpl' %}
						</div>
					{% endfor %}
					{% if not home_main_product %}
						{# Video thumb #}
						<div class="swiper-slide w-auto">
							{% include 'snipplets/product/product-video.tpl' with {thumb: true} %}
						</div>
					{% endif %}
				</div>
			</div>
			<div class="js-swiper-product-thumb-controls text-center d-none d-md-block">
				<div class="js-swiper-product-thumbs-prev swiper-button-prev swiper-product-thumb-control d-inline-block svg-circle svg-icon-text">{% include "snipplets/svg/chevron-up.tpl" with {svg_custom_class: "icon-inline icon-lg"} %}</div>
				<div class="js-swiper-product-thumbs-next swiper-button-next swiper-product-thumb-control d-inline-block svg-circle svg-icon-text ml-2">{% include "snipplets/svg/chevron-down.tpl" with {svg_custom_class: "icon-inline icon-lg"} %}</div>
			</div>
		</div>
	{% endif %}
	{% if product.media_count > 0 %}
		<div class="product-image-container {% if has_multiple_slides %}col-12 col-md-10{% else %}col-12{% endif %}">
			<div class="js-swiper-product swiper-container mb-3" data-product-images-amount="{{ product.media_count }}">

				{{ component('nubesdk-slot', { type: "product_detail_image" }) }}

				{% include 'snipplets/labels.tpl' with {'product_detail': true, 'shipping': true} %}
				<div class="swiper-wrapper">
					{% for media in product.media %}
						{% if media.isImage %}
						 <div class="swiper-slide js-product-slide slider-slide" data-image="{{media.id}}" data-image-position="{{loop.index0}}">
							{% if home_main_product %}
								<div class="js-product-slide-link d-block position-relative" style="padding-bottom: {{ media.dimensions['height'] / media.dimensions['width'] * 100}}%;">
							{% else %}
								<a href="{{ media | product_image_url('4k') }}" data-fancybox="product-gallery" class="js-product-slide-link d-block position-relative" style="padding-bottom: {{ media.dimensions['height'] / media.dimensions['width'] * 100}}%;">
							{% endif %}
								
								{% set apply_lazy_load = home_main_product or not loop.first %}

								{% if apply_lazy_load %}
									{% set product_image_src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' %}
								{% else %}
									{% set product_image_src = media | product_image_url('large') %}
								{% endif %}
							
								<img 
									{% if not apply_lazy_load %}fetchpriority="high"{% endif %}
									{% if apply_lazy_load %}data-{% endif %}src="{{ product_image_src }}"
									{% if apply_lazy_load %}data-{% endif %}srcset='{{  media | product_image_url('large') }} 480w, {{  media | product_image_url('huge') }} 640w, {{  media | product_image_url('original') }} 1024w, {{  media | product_image_url('1080p') }} 1920w, {{  media | product_image_url('1440p') }} 2560w, {{  media | product_image_url('4k') }} 3840w' 
									class="js-product-slide-img product-slider-image img-absolute img-absolute-centered {% if apply_lazy_load %}lazyautosizes lazyload{% endif %}" 
									{% if apply_lazy_load %}data-sizes="auto"{% endif %}
									{% if media.dimensions.width and media.dimensions.height %}width="{{ media.dimensions.width }}" height="{{ media.dimensions.height }}"{% endif %}
									{% if media.alt %}alt="{{media.alt}}"{% endif %} />
							{% if home_main_product %}
								</div>
							{% else %}
								</a>
							{% endif %}
						</div>
						{% else %}
							{% include 'snipplets/product/product-video.tpl' with {video_id: media.next_video, product_native_video: true, home_main_product: home_main_product} %}
						{% endif %}
					{% endfor %}
					{% if not home_main_product %}
						{% include 'snipplets/product/product-video.tpl' with {video_id: 'yt'} %}
					{% endif %}
				</div>
			</div>
			{% if home_main_product %}
				<div class="d-block d-md-none">
					<div class="js-swiper-product-pagination swiper-pagination"></div>
				</div>
			{% endif %}
		</div>
	{% endif %}
</div>

{{ component('nubesdk-slot', { type: "after_product_detail_image" }) }}