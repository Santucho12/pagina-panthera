{# /* Style tokens */ #}

:root {

  {#/*============================================================================
    #Fonts
  ==============================================================================*/#}

  {# Font families #}

  --heading-font: {{ settings.font_headings | raw }};
  --body-font: {{ settings.font_rest | raw }};

  {# Font sizes #}

  {% set heading_size = settings.headings_size %}

  --h1: {{ heading_size }}px;
  --h1-huge: {{ heading_size + 12 }}px;
  --h1-huge-md: {{ heading_size + 26 }}px;
  --h2: {{ heading_size - 4 }}px;
  --h3: {{ heading_size - 8 }}px;
  --h4: {{ heading_size - 10 }}px;
  --h5: {{ heading_size - 12 }}px;
  --h6: {{ heading_size - 14 }}px;

  {% set font_rest_size = settings.font_rest_size %}

  --font-hugest: {{ font_rest_size + 14 }}px;
  --font-huge: {{ font_rest_size + 10 }}px;
  --font-largest: {{ font_rest_size + 6 }}px;
  --font-large: {{ font_rest_size + 4 }}px;
  --font-big: {{ font_rest_size + 2 }}px;
  --font-base: {{ font_rest_size }}px;
  --font-small: {{ font_rest_size - 2 }}px;
  --font-smallest: {{ font_rest_size - 4 }}px;

  {# Titles weight #}

  {% set title_weight = settings.headings_bold ? '700' : '400' %}

  --title-font-weight: {{ title_weight }};

}