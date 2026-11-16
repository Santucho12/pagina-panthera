{# Panthera — "Colecciones Disney" (2026-11-10): un arco por personaje, cada uno con su pieza, su precio y el link a la
   página del producto. Diseño B2 del artefacto de ideas. "Ver toda la colección" lleva a la categoría Disney.
   ⚠️ Los productos, fotos y precios están escritos a mano (al 2026-11-10): el tema no puede pedir "este producto" desde el
   inicio. Si cambia un precio, actualizarlo acá (la página del producto siempre muestra el real).
   Fotos: las de cada producto en la CDN de la tienda (los charms van sobre fondo de color con mix-blend-mode: multiply; el
   aro de Tiana es una foto puesta, 'foto: true', y llena el arco).
   ⚠️ Preparado en local: NO subido todavía. #}
{% set pnt_cdn = 'https://acdn-us.mitiendanube.com/stores/001/276/084/products/' %}
{% set pnt_disney = [
    { personaje: 'Tiana', producto: 'Cocodrilo · La princesa y el Sapo', url: '/productos/cocodrilo-la-princesa-y-el-sapo-2381/', foto: '2381-1-983de48ce319b9865c17235661953233', fondo: 'foto', precio: '$17.760', transf: '$12.432' },
    { personaje: 'Cenicienta', producto: 'Princesa Cenicienta', url: '/productos/princesa-cenicienta-2392/', foto: '2392-1-de16c8962932bfebb517234743924684', fondo: 'foto', precio: '', transf: '' },
    { personaje: 'Cenicienta', producto: 'Carroza Cenicienta', url: '/productos/carroza-cenicienta-2376/', foto: '2376-1-77ec3c1cc3e746e3eb17235648284654', fondo: 'foto', precio: '$20.160', transf: '' },
    { personaje: 'Minnie', producto: 'Minnie chain', url: '/productos/minnie-chain-2043/', foto: 'minnie-chain-da119d982f1d0de64c17139973752401', fondo: 'foto', precio: '$30.160', transf: '$21.112' },
    { personaje: 'Cenicienta', producto: 'Zapato Cenicienta', url: '/productos/zapato-cenicienta-2375/', foto: '2375-1-9591d2dc786308e69517235643527427', fondo: 'foto', precio: '$17.760', transf: '' },
] %}

<section class="pnt-s pnt-di" id="colecciones-disney" aria-labelledby="pnt-di-t">
    {# Título a la izquierda (a 20px del borde, como "Los más elegidos") y el botón a la derecha, los dos pegados al carrusel (pedido 2026-11-10) #}
    <header class="pnt-di-cab pnt-rv">
        <div class="pnt-di-tit">
            <h2 class="pnt-s-titulo" id="pnt-di-t">Mundo Disney</h2>
            <p class="pnt-di-sub">Charms y aros de Mickey, Minnie, Jazmín y Tiana para llevar siempre con vos.</p>
        </div>
        <span class="pnt-di-btncaja"><a class="pnt-s-btn" href="/todos-los-productos/disney-lovers/">Ver toda la colección <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></span>
    </header>

    {# Cinta de fotos rectangulares que se corre sola hacia la izquierda sin parar, como "Último drop" de BS23: la lista va 3 veces
       (las copias son aria-hidden) y la pista se corre un tercio, así vuelve al inicio sin que se note. #}
    <div class="pnt-di-cinta">
        <div class="pnt-di-pista">
            {% for tanda in 1..3 %}
            <ul class="pnt-di-lista"{% if tanda == 1 %} aria-label="Personajes Disney"{% else %} aria-hidden="true"{% endif %}>
                {% for d in pnt_disney %}
                    <li class="pnt-di-li">
                        <a class="pnt-di-item" href="{{ d.url }}"{% if tanda != 1 %} tabindex="-1"{% endif %}>
                            <span class="pnt-di-foto pnt-di-foto--{{ d.fondo }}">
                                {# (2026-11-15) con srcset: la tarjeta mide hasta ~600 px y bajaba siempre la de 1024 (130 KB; la de 640 pesa 62 KB). Aparecían vacías ~1,7 s #}
                                <img src="{{ pnt_cdn ~ d.foto }}-640-0.webp"
                                    srcset="{{ pnt_cdn ~ d.foto }}-480-0.webp 480w, {{ pnt_cdn ~ d.foto }}-640-0.webp 640w, {{ pnt_cdn ~ d.foto }}-1024-1024.webp 1024w"
                                    sizes="(max-width: 767px) 222px, min(27.8vw, 598px)"
                                    alt="{{ d.producto }}" width="480" height="480" loading="lazy" decoding="async">
                            </span>
                        </a>
                    </li>
                {% endfor %}
            </ul>
            {% endfor %}
        </div>
    </div>

</section>
