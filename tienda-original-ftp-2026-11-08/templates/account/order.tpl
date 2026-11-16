{{ component('nubesdk-slot', { type: "before_account_order_header" }) }}

{% embed "snipplets/page-header.tpl" with {container: true} %}
    {% block page_header_text %}{{ 'Orden #{1}' | translate(order.number) }}{% endblock page_header_text %}
{% endembed %}

{{ component('nubesdk-slot', { type: "after_account_order_header" }) }}

<section class="account-page">
    <div class="container" data-store="account-order-detail-{{ order.id }}">

        {{ component('nubesdk-slot', { type: "before_account_content" }) }}

        {{ component('nubesdk-slot', { type: "before_account_order_detail" }) }}

        {% if cancel_error == 'in_review' or (cancel_success and order.status != 'cancelled') %}
            {% if cancel_error == 'in_review' and store.cancel_review_time %}
                {% if store.cancel_review_time_unit == 'hours' %}
                    {% set cancel_review_message = 'La tienda tiene hasta {1} hs para revisarla. Te avisaremos el resultado por email a {2}.' | translate(store.cancel_review_time, customer.email) %}
                {% else %}
                    {% set cancel_review_message = 'La tienda tiene hasta {1} días para revisarla. Te avisaremos el resultado por email a {2}.' | translate(store.cancel_review_time, customer.email) %}
                {% endif %}
            {% else %}
                {% set cancel_review_message = 'Te avisaremos el resultado por email a {1}.' | translate(customer.email) %}
            {% endif %}
            <div class="alert alert-info mb-3">
                <span class="font-weight-bold">{{ 'Tu solicitud de cancelación está siendo revisada' | translate }}</span>
                <p class="mt-1 mb-0">{{ cancel_review_message }}</p>
            </div>
        {% endif %}
    	<div class="row">
            <div class="col-md-4">
                <div class="mb-4">
                    {% if log_entry %}
                        <h4>{{ 'Estado actual del envío' | translate }}:</h4>{{ log_entry }}
                    {% endif %}
                    <div>{{ 'Detalles' | translate }}</div>
                    <div class="divider my-3"></div>
                    <p class="font-small">
                        {% include "snipplets/svg/calendar.tpl" with {svg_custom_class: "icon-inline mr-1 icon-w svg-icon-text"} %} {{'Fecha' | translate}}: <strong>{{ order.date | i18n_date('%d/%m/%Y') }}</strong> 
                    </p>
                    <p class="font-small">
                        {% include "snipplets/svg/info-circle.tpl" with {svg_custom_class: "icon-inline mr-1 icon-w svg-icon-text"} %} {{'Estado' | translate}}: <strong>{{ (order.status == 'open'? 'Abierta' : (order.status == 'closed'? 'Cerrada' : (order.status == 'cancellation_pending'? 'Cancelación pendiente' : 'Cancelada'))) | translate }}</strong>
                    </p>
                    <p class="font-small">
                        {% include "snipplets/svg/credit-card.tpl" with {svg_custom_class: "icon-inline mr-1 icon-w svg-icon-text"} %} {{'Pago' | translate}}: <strong>{{ (order.payment_status == 'pending'? 'Pendiente' : (order.payment_status == 'authorized'? 'Autorizado' : (order.payment_status == 'paid'? 'Pagado' : (order.payment_status == 'voided'? 'Cancelado' : (order.payment_status == 'refunded'? 'Reintegrado' : 'Abandonado'))))) | translate }} </strong>
                    </p>
                    <p class="font-small">
                        {% include "snipplets/svg/usd-circle.tpl" with {svg_custom_class: "icon-inline mr-1 icon-w svg-icon-text"} %} {{'Medio de pago' | translate}}: <strong>{{ order.payment_name }}</strong>
                    </p>

                    {% if order.address %}
                        <p class="font-small">
                            {% include "snipplets/svg/truck.tpl" with {svg_custom_class: "icon-inline mr-1 icon-w svg-icon-text"} %} {{'Envío' | translate}}: <strong>{{ (order.shipping_status == 'fulfilled'? 'Enviado' : (order.shipping_status == 'delivered'? 'Entregado' : 'No enviado')) | translate }}</strong>
                        </p>
                        <p class="font-small"> 
                            {% include "snipplets/svg/map-marker-alt.tpl" with {svg_custom_class: "icon-inline mr-1 icon-w svg-icon-text"} %} <strong>{{ 'Dirección de envío' | translate }}:</strong>
                            <span class="d-block d-block mt-1 pl-4">
                                {{ order.address | format_address }}
                            </span>
                        </p>
                    {% endif %}
                    {{ component('cancel-order-modal', {
                        close_custom_icon: include('snipplets/svg/times.tpl', { svg_custom_class: 'icon-inline' }),
                        select_custom_icon: include('snipplets/svg/chevron-down.tpl', { svg_custom_class: 'icon-inline' }),
                        classes: {
                            open_modal_button: 'btn btn-secondary btn-small mt-2',
                            header: 'd-flex align-items-center',
                            close_button: 'ml-auto mr-0',
                            modal_title: 'h4',
                            modal: 'modal-centered-small modal-centered',
                            message: 'mb-2',
                            warning: 'mb-3',
                            label: 'form-label',
                            actions: 'text-right mt-3',
                            back_button: 'btn btn-link mr-3',
                            confirm_button: 'btn btn-primary btn-medium',
                            field: 'position-relative',
                            select: 'w-100',
                            select_icon: 'mt-2'
                        }
                    }) }}
                </div>
            </div>
            <div class="col-md-8">

                {{ component('nubesdk-slot', { type: "before_account_order_items" }) }}

                <div class="d-lg-none d-md-block mb-4">{{ 'Productos' | translate }}</div>
                <div class="d-none d-md-block">
                    <div class="row">
                        <div class="col-6">
                            <p>{{ 'Producto' | translate }}</p>
                        </div>
                        <div class="col-2 text-center">
                            <p>{{ 'Precio' | translate }}</p>
                        </div>
                        <div class="col-2 text-center">
                            <p>{{ 'Cantidad' | translate }}</p>
                        </div>
                        <div class="col-2 text-center">
                            <p>{{ 'Total' | translate }}</p>
                        </div>
                    </div>
                </div>
                <div class="order-detail">
                    {% for item in order.items %}
                        <div class="order-item">
                            <div class="row align-items-center">
                                <div class="col-7 col-md-6">
                                    <div class="row align-items-center">
                                        <div class="col-4 col-md-3 pr-0">
                                            <div class="card-img-square-container">
                                                {{ item.featured_image | product_image_url("small") | img_tag(item.featured_image.alt, {class: 'd-block card-img-square'}) }} 
                                            </div>
                                        </div>
                                        <div class="col-8 col-md-9">
                                            <p>
                                                {{ item.name }} <span class="d-inline-block d-md-none text-center">x{{ item.quantity }}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-2 d-none d-md-block text-center">
                                    <p>
                                        {{ item.unit_price | money }}
                                    </p>
                                </div>
                                <div class="col-2 d-none d-md-block text-center">
                                    <p>
                                        {{ item.quantity }}
                                    </p>
                                </div>
                                <div class="col-5 col-md-2 text-center">
                                    <p>
                                        {{ item.subtotal | money }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    {% endfor %}

                    {{ component('nubesdk-slot', { type: "after_account_order_items" }) }}

                    {% if order.show_shipping_price %}
                        <p class="mt-3">
                            <strong class="font-small">{{ 'Costo de envío ({1})' | translate(order.shipping_name) }}:</strong>
                            {% if order.shipping == 0  %}
                                {{ 'Gratis' | translate }}
                            {% else %}
                                {{ order.shipping | money_long }}
                            {% endif %}
                        </p>
                    {% else %}
                        <p class="mt-3">
                            <strong class="font-small">{{ 'Costo de envío ({1})' | translate(order.shipping_name) }}:</strong>
                            {{ 'A convenir' | translate }}
                        </p>
                    {% endif %}
                    {% if order.discount %}
                        <p class="mt-3">
                           <strong class="font-small">{{ 'Descuento ({1})' | translate(order.coupon) }}:</strong>
                            - {{ order.discount | money }}
                        </p>
                    {% endif %}
                    {% if order.shipping or order.discount %}
                        <p class="mt-3">
                            <strong class="font-small">{{ 'Subtotal' | translate }}:</strong>
                            {{ order.subtotal | money }}
                        </p>
                    {% endif %}  
                    <h3 class="font-huge">{{ 'Total' | translate }}: {{ order.total | money }}</h3>
                    {% if order.pending %}
                        <a class="btn btn-primary mt-2 d-block col col-md-4" href="{{ order.checkout_url | add_param('ref', 'orders_details') }}" target="_blank">{{ 'Realizar el pago' | translate }}</a>
                    {% endif %}
                </div>
            </div>
    	</div>

        {{ component('nubesdk-slot', { type: "after_account_order_detail" }) }}

        {{ component('nubesdk-slot', { type: "after_account_content" }) }}

    </div>
</section>