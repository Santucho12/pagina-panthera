{# Panthera — "Armá tu oreja" en 3D (2026-11-11). Elegís cuántos agujeros tenés en el lóbulo (1 a 3) y el ear cuff, sumás aros
   solitarios y los ves puestos en una oreja; "Agregar al carrito" pone cada aro en el carrito (un POST a /comprar/ por aro, como el
   armador de pulseras). Es el prototipo de herramientas/oreja/ pasado a la tienda (lo genera herramientas/oreja/construye_tienda.py:
   si se rehace desde ahí, los cambios a mano de este archivo se pisan). La interfaz está en static/panthera/oreja3d.js y los estilos
   en oreja3d.css (adentro del componente, en su Shadow DOM: Lima no los toca). La escena 3D, en oreja3d-escena.js (data-escena: la
   pide oreja3d.js recién cerca de la sección, con three.js 0.187.0, el mismo del armador de pulseras).
   La oreja es una foto (panthera/oreja/foto-oreja.webp + su máscara); la argolla de cada aro es 3D (medida en su foto: arg) y el
   dije es la foto del producto (panthera/oreja/aros-hd/). Ver herramientas/oreja/LEEME.md.

   ⚠️ Los datos de abajo (ids, variantes, precios, stock) son los de la tienda real al 2026-11-11 y están escritos a mano: el tema no
   puede pedirle a la tienda "este producto en particular" desde el inicio. Si cambia un precio o el stock, actualizarlo acá.
   El carrito SIEMPRE cobra el precio real (esto es solo lo que se muestra).
   - p = precio, a = precio de antes (tachado), st = stock (1 = "Última"), tipo = 'aro' o 'cuff'.
   - asp, ag, cx, alto: la foto recortada del aro (ancho/alto, el agujero, el centro y el tamaño en 3D).
   - arg: la argolla medida en la foto (arriba, abajo, corte del dije, x del cuello, grosor, metal, pavé).

   ⚠️ Preparado en local: NO subido. #}
{% set pnt_or_aros = [
    { k: 'espm', n: 'Espada Mulan', cat: 'Disney', id: 355731968, v: 1559429174, p: 17680, a: 22100, st: 4, tipo: 'aro', asp: 0.1695, ag: 0.0285, cx: 0.5107, alto: 2.775, url: '/productos/espada-mulan-3059-12vva/', arg: '0.0,0.3845,0.3845,0.5088,0.24,oro,0' },
    { k: 'jaul', n: 'Jaulita Mulan', cat: 'Disney', id: 364280486, v: 1587239944, p: 17680, a: 22100, st: 2, tipo: 'aro', asp: 0.292, ag: 0.0287, cx: 0.5115, alto: 2.762, url: '/productos/jaulita-de-mulan-3058-11tzx/', arg: '0.0,0.4336,0.4336,0.4882,0.24,oro,0' },
    { k: 'mush', n: 'Mushu', cat: 'Disney', id: 355734597, v: 1559436453, p: 17680, a: 22100, st: 3, tipo: 'aro', asp: 0.2834, ag: 0.0298, cx: 0.4997, alto: 2.659, url: '/productos/mushu-mulan-3060-dz8m9/', arg: '0.0,0.4252,0.4252,0.5,0.24,oro,0' },
    { k: 'pein', n: 'Peineta Mulan', cat: 'Disney', id: 353877887, v: 1553772008, p: 17680, a: 22100, st: 4, tipo: 'aro', asp: 0.466, ag: 0.0325, cx: 0.496, alto: 2.435, url: '/productos/peineta-mulan-3057-1lqpd/', arg: '0.0,0.5066,0.5066,0.488,0.24,oro,0' },
    { k: 'arco', n: 'Arco y flecha Valiente', cat: 'Disney', id: 364281141, v: 1587242413, p: 19840, a: 24800, st: 1, tipo: 'aro', asp: 0.5441, ag: 0.0335, cx: 0.4554, alto: 2.362, url: '/productos/arco-y-flecha-valiente-3020-1h01g/', arg: '0.0,0.4569,0.4569,0.4472,0.176,oro,0' },
    { k: 'flec', n: 'Flecha Valiente', cat: 'Disney', id: 364280930, v: 1587241290, p: 19840, a: 24800, st: 1, tipo: 'aro', asp: 0.4727, ag: 0.0305, cx: 0.5009, alto: 2.596, url: '/productos/flecha-valiente-3022-13x1v/', arg: '0.0,0.4361,0.4361,0.4927,0.164,oro,0' },
    { k: 'neni', n: 'Nenito Valiente', cat: 'Disney', id: 364280755, v: 1587240830, p: 19840, a: 24800, st: 6, tipo: 'aro', asp: 0.2544, ag: 0.0279, cx: 0.5158, alto: 2.835, url: '/productos/nenito-de-valiente-3019-1dkjk/', arg: '0.0,0.4185,0.4185,0.4884,0.24,oro,0' },
    { k: 'lilo', n: 'Lilo', cat: 'Disney', id: 374455760, v: 1619854047, p: 20160, a: 25200, st: 1, tipo: 'aro', asp: 0.3277, ag: 0.0378, cx: 0.4881, alto: 2.095, url: '/productos/lilo-4063-1hpvi/', arg: '0.0,0.5726,0.5726,0.466,0.165,oro,0' },
    { k: 'trap', n: 'Muñeca de Lilo', cat: 'Disney', id: 374455108, v: 1619851273, p: 20160, a: 25200, st: 2, tipo: 'aro', asp: 0.276, ag: 0.0368, cx: 0.4785, alto: 2.15, url: '/productos/muneca-de-trapo-de-lilo-4060-zmgt5/', arg: '0.0,0.5509,0.5509,0.4446,0.165,oro,0' },
    { k: 'reno', n: 'Reno Frozen', cat: 'Disney', id: 353873856, v: 1553759825, p: 19840, a: 24800, st: 8, tipo: 'aro', asp: 0.3647, ag: 0.0339, cx: 0.4949, alto: 2.339, url: '/productos/reno-frozen-3381-w6zg5/', arg: '0.0,0.5085,0.5085,0.4797,0.24,oro,0' },
    { k: 'hadr', n: 'Hada Aurora rosa', cat: 'Disney', id: 353879321, v: 1553776064, p: 20000, a: 25000, st: 2, tipo: 'aro', asp: 0.3277, ag: 0.0255, cx: 0.52, alto: 3.111, url: '/productos/hada-aurora-rosa-3280-1mnbt/', arg: '0.0,0.4124,0.4124,0.5091,0.24,oro,0' },
    { k: 'hadv', n: 'Hada Aurora verde', cat: 'Disney', id: 353879537, v: 1553776807, p: 20000, a: 25000, st: 2, tipo: 'aro', asp: 0.327, ag: 0.0254, cx: 0.519, alto: 3.124, url: '/productos/hada-aurora-verde-3282-1ltbv/', arg: '0.0,0.4165,0.4165,0.5092,0.24,oro,0' },
    { k: 'dona', n: 'Donald', cat: 'Disney', id: 117692907, v: 453785729, p: 19920, a: 24900, st: 8, tipo: 'aro', asp: 0.4184, ag: 0.0132, cx: 0.3508, alto: 2.767, url: '/productos/donald-599/', arg: '0.0,0.4724,0.4724,0.4841,0.127,oro,0' },
    { k: 'mono', n: 'Monito Aladdin', cat: 'Disney', id: 364282161, v: 1587245642, p: 19840, a: 24800, st: 9, tipo: 'aro', asp: 0.4058, ag: 0.0318, cx: 0.4797, alto: 2.493, url: '/productos/monito-aladdin-3376-12c0e/', arg: '0.0,0.4038,0.4038,0.4717,0.175,oro,0' },
    { k: 'carr', n: 'Carroza Cenicienta', cat: 'Disney', id: 225472172, v: 993650617, p: 20160, a: 25200, st: 1, tipo: 'aro', asp: 0.6965, ag: 0.012, cx: 0.5016, alto: 2.3, url: '/productos/carroza-cenicienta-2376/', arg: '0.0,0.0,0.0,0.4905,0.24,oro,0' },
    { k: 'zapa', n: 'Zapato Cenicienta', cat: 'Disney', id: 225471266, v: 993646298, p: 17760, a: 22200, st: 2, tipo: 'aro', asp: 0.2441, ag: 0.012, cx: 0.2763, alto: 2.1, url: '/productos/zapato-cenicienta-2375/', arg: '0.001,0.457,0.457,0.368,0.24,oro,0' },
    { k: 'moon', n: 'Moon gold', cat: 'Cielo', id: 358700415, v: 1568868557, p: 21520, a: 26900, st: 2, tipo: 'aro', asp: 0.2547, ag: 0.0311, cx: 0.5158, alto: 2.547, url: '/productos/moon-gold-4015-27xfq/', arg: '0.0,0.4501,0.4501,0.5252,0.217,oro,0' },
    { k: 'rayo', n: 'Rayito gold', cat: 'Cielo', id: 358701199, v: 1568871075, p: 21520, a: 26900, st: 1, tipo: 'aro', asp: 0.1923, ag: 0.0275, cx: 0.4137, alto: 2.878, url: '/productos/rayito-gold-4014-uedb8/', arg: '0.0,0.3935,0.3935,0.4282,0.24,oro,0' },
    { k: 'star', n: 'Star', cat: 'Cielo', id: 353873408, v: 1553758610, p: 19840, a: 24800, st: 3, tipo: 'aro', asp: 0.177, ag: 0.0298, cx: 0.5409, alto: 2.656, url: '/productos/star-2851-1xvav/', arg: '0.0,0.4462,0.4462,0.4971,0.24,oro,0' },
    { k: 'estr', n: 'Estrellita rose', cat: 'Cielo', id: 57595452, v: 166016218, p: 17760, a: 22200, st: 1, tipo: 'aro', asp: 0.3697, ag: 0.0126, cx: 0.5477, alto: 2.653, url: '/productos/estrellita-rose-056/', arg: '0.0,0.5321,0.5321,0.4932,0.24,oro,0' },
    { k: 'esci', n: 'Estrella con circonio', cat: 'Cielo', id: 364271942, v: 1587200936, p: 17680, a: 22100, st: 1, tipo: 'aro', asp: 0.4098, ag: 0.0293, cx: 0.5261, alto: 2.704, url: '/productos/estrella-con-circonio-y-circulo-1730-1thzq/', arg: '0.0,0.4324,0.4324,0.5,0.24,oro,0' },
    { k: 'cohe', n: 'Cohete de cristal', cat: 'Cielo', id: 95769920, v: 364822280, p: 19920, a: 24900, st: 2, tipo: 'aro', asp: 0.2066, ag: 0.0131, cx: 0.5046, alto: 2.636, url: '/productos/cohete-de-cristal-058/', arg: '0.0,0.5745,0.5745,0.5149,0.24,oro,1' },
    { k: 'satu', n: 'Saturn', cat: 'Cielo', id: 353871843, v: 1553753513, p: 17680, a: 22100, st: 2, tipo: 'aro', asp: 0.5953, ag: 0.0287, cx: 0.4794, alto: 2.756, url: '/productos/saturn-3864-1nds3/', arg: '0.0,0.6056,0.6056,0.5069,0.141,oro,0' },
    { k: 'apol', n: 'Aro Apolo', cat: 'Cielo', id: 57467505, v: 165274911, p: 24960, a: 31200, st: 7, tipo: 'aro', asp: 0.2532, ag: 0.0127, cx: 0.6248, alto: 3.297, url: '/productos/aro-apolo-015/', arg: '0.0,0.424,0.424,0.4784,0.24,oro,1' },
    { k: 'musi', n: 'Music', cat: 'Cielo', id: 95767709, v: 364814836, p: 17760, a: 22200, st: 2, tipo: 'aro', asp: 0.2077, ag: 0.0191, cx: 0.3835, alto: 2.827, url: '/productos/music-049/', arg: '0.0,0.5571,0.5571,0.4668,0.141,oro,0' },
    { k: 'quee', n: 'Argollita Queen', cat: 'Brillos', id: 358697178, v: 1568859987, p: 19840, a: 24800, st: 1, tipo: 'aro', asp: 0.2825, ag: 0.0351, cx: 0.4948, alto: 2.258, url: '/productos/argollita-queen-2315-1rf97/', arg: '0.0,0.4902,0.4902,0.4686,0.169,oro,0' },
    { k: 'alas', n: 'Circonio con alas', cat: 'Brillos', id: 364157944, v: 1586930829, p: 19200, a: 24000, st: 2, tipo: 'aro', asp: 0.2696, ag: 0.0253, cx: 0.508, alto: 3.126, url: '/productos/circonio-rectangular-con-alas-colgante-4008-11x0v/', arg: '0.0,0.3756,0.3756,0.4963,0.24,oro,0' },
    { k: 'tres', n: 'Tres circonios y nácar', cat: 'Brillos', id: 364279438, v: 1587234379, p: 21520, a: 26900, st: 0, tipo: 'aro', asp: 0.2676, ag: 0.0429, cx: 0.5011, alto: 1.847, url: '/productos/argollita-colgante-tres-circonios-y-shine-nacar-gold-3994-yzk2w/', arg: '0.0,0.6808,0.6808,0.5088,0.159,oro,0' },
    { k: 'libe', n: 'Libélula de cristal', cat: 'Brillos', id: 364165446, v: 1586948970, p: 19840, a: 24800, st: 1, tipo: 'aro', asp: 0.3612, ag: 0.0278, cx: 0.491, alto: 2.853, url: '/productos/argollitas-gold-con-libelula-cristal-colgante-3704-1u17l/', arg: '0.0,0.395,0.395,0.4821,0.24,oro,0' },
    { k: 'ojo', n: 'Ojo cristal azul', cat: 'Brillos', id: 364148211, v: 1586897245, p: 21520, a: 26900, st: 1, tipo: 'aro', asp: 0.4696, ag: 0.0344, cx: 0.4972, alto: 2.302, url: '/productos/ojo-cristal-azul-4017-1ojut/', arg: '0.0,0.4441,0.4441,0.4708,0.17,oro,0' },
    { k: 'flor', n: 'Flor turquesa', cat: 'Brillos', id: 355734361, v: 1559435931, p: 17680, a: 22100, st: 2, tipo: 'aro', asp: 0.3792, ag: 0.0347, cx: 0.4917, alto: 2.279, url: '/productos/flor-turquesa-2387-gtb4i/', arg: '0.0,0.5208,0.5208,0.4896,0.24,oro,0' },
    { k: 'swep', n: 'Sweet purple', cat: 'Brillos', id: 125497855, v: 489444585, p: 27760, a: 34700, st: 2, tipo: 'aro', asp: 0.4735, ag: 0.013, cx: 0.516, alto: 3.393, url: '/productos/sweet-purple-1032/', arg: '0.0,0.3924,0.3924,0.5433,0.24,oro,1' },
    { k: 'love', n: 'Love', cat: 'Clásicos', id: 353864766, v: 1553731265, p: 17600, a: 22000, st: 2, tipo: 'aro', asp: 0.253, ag: 0.0241, cx: 0.4929, alto: 3.287, url: '/productos/love-3949-1kcow/', arg: '0.0,0.3691,0.3691,0.4805,0.24,oro,0' },
    { k: 'powe', n: 'Power love', cat: 'Clásicos', id: 353866386, v: 1553736313, p: 17600, a: 22000, st: 1, tipo: 'aro', asp: 0.22, ag: 0.024, cx: 0.5011, alto: 3.294, url: '/productos/power-love-3951-1ys7d/', arg: '0.0,0.3851,0.3851,0.4531,0.24,oro,0' },
    { k: 'lazo', n: 'Moño listón', cat: 'Clásicos', id: 364274856, v: 1587218476, p: 19200, a: 24000, st: 0, tipo: 'aro', asp: 0.5075, ag: 0.0304, cx: 0.4992, alto: 2.601, url: '/productos/argollita-mono-liston-sin-circonios-4010-1mfss/', arg: '0.0,0.4364,0.4364,0.4892,0.202,oro,0' },
    { k: 'ancl', n: 'Ancla gold', cat: 'Clásicos', id: 358696483, v: 1568858129, p: 19200, a: 24000, st: 4, tipo: 'aro', asp: 0.4006, ag: 0.0243, cx: 0.5077, alto: 3.262, url: '/productos/ancla-gold-3990-dqf4k/', arg: '0.0,0.3526,0.3526,0.5075,0.24,oro,0' },
    { k: 'plan', n: 'Plane silver', cat: 'Plateados', id: 172317443, v: 655043778, p: 17760, a: 22200, st: 2, tipo: 'aro', asp: 0.3789, ag: 0.0134, cx: 0.5808, alto: 2.68, url: '/productos/plane-silver-2133/', arg: '0.001,0.5352,0.5352,0.5129,0.24,plata,0' },
    { k: 'boli', n: 'Bolita silver', cat: 'Plateados', id: 172312970, v: 655009246, p: 13680, a: 17100, st: 1, tipo: 'aro', asp: 0.3015, ag: 0.0108, cx: 0.6158, alto: 2.305, url: '/productos/bolita-silver-744/', arg: '0.0012,0.5293,0.5293,0.4733,0.24,plata,0' },
    { k: 'sire', n: 'Cola de sirena', cat: 'Plateados', id: 353887442, v: 1553800931, p: 19840, a: 24800, st: 1, tipo: 'aro', asp: 0.2783, ag: 0.012, cx: 0.4319, alto: 2.4, url: '/productos/cola-de-sirena-3884-15mg6/', arg: '0.001,0.4854,0.4854,0.5246,0.149,plata,0' },
    { k: 'torn', n: 'Crystal tornasol', cat: 'Plateados', id: 353888508, v: 1553803362, p: 19840, a: 24800, st: 6, tipo: 'aro', asp: 0.3579, ag: 0.012, cx: 0.406, alto: 2.2, url: '/productos/crystal-tornasol-3876-mi958/', arg: '0.0011,0.4843,0.4843,0.5,0.162,plata,0' },
    { k: 'apo2', n: 'Aro Apolo 2.0', cat: 'Cielo', id: 353876182, v: 1553767348, p: 20080, a: 25100, st: 7, tipo: 'aro', asp: 0.202, ag: 0.0214, cx: 0.4538, alto: 2.6, url: '/productos/apolo-2-0-2794-gsfvl/', arg: '0.0022,0.4872,0.4872,0.4533,0.24,oro,1' },
    { k: 'chag', n: 'Argollita cadena gold', cat: 'Brillos', id: 364275086, v: 1587219944, p: 17680, a: 22100, st: 2, tipo: 'aro', asp: 0.1608, ag: 0.0275, cx: 0.5078, alto: 2.883, url: '/productos/argollita-colgante-chain-gold-3540-1bbqq/', arg: '0.0,0.4251,0.4251,0.4449,0.24,oro,0' },
    { k: 'cdos', n: 'Colgante dos circonios y shine', cat: 'Brillos', id: 364277547, v: 1587229863, p: 21520, a: 26900, st: 1, tipo: 'aro', asp: 0.1807, ag: 0.0311, cx: 0.5005, alto: 2.545, url: '/productos/argollita-colgante-con-dos-circonios-colgante-y-shine-al-final-3995-1iit2/', arg: '0.0,0.4746,0.4746,0.5081,0.152,oro,0' },
    { k: 'anci', n: 'Argollita con ancla', cat: 'Plateados', id: 223058629, v: 981871397, p: 16640, a: 20800, st: 3, tipo: 'aro', asp: 0.4141, ag: 0.012, cx: 0.5715, alto: 2.3, url: '/productos/argollita-con-ancla-silver-3082/', arg: '0.001,0.5078,0.5078,0.4976,0.24,plata,1' },
    { k: 'cueb', n: 'Cuernito blue', cat: 'Clásicos', id: 57596167, v: 166019319, p: 19920, a: 24900, st: 1, tipo: 'aro', asp: 0.2207, ag: 0.0135, cx: 0.4572, alto: 2.714, url: '/productos/aro-cuernito-blue-024/', arg: '0.001,0.6592,0.6592,0.5398,0.24,oro,1' },
    { k: 'cueg', n: 'Cuernito green', cat: 'Clásicos', id: 57470646, v: 165289692, p: 19920, a: 24900, st: 6, tipo: 'aro', asp: 0.3955, ag: 0.0128, cx: 0.5825, alto: 2.758, url: '/productos/aro-cuernito-green-022/', arg: '0.001,0.501,0.501,0.5136,0.24,oro,1' },
    { k: 'avio', n: 'Aro Plane', cat: 'Clásicos', id: 57600423, v: 166032326, p: 17760, a: 22200, st: 12, tipo: 'aro', asp: 0.3242, ag: 0.012, cx: 0.276, alto: 2.35, url: '/productos/aro-plane-019/', arg: '0.001,0.4941,0.4941,0.55,0.24,oro,0' },
    { k: 'arsk', n: 'Aro Sky', cat: 'Cielo', id: 60485706, v: 180682146, p: 17760, a: 22200, st: 1, tipo: 'aro', asp: 0.3193, ag: 0.013, cx: 0.4952, alto: 2.68, url: '/productos/aro-sky-044/', arg: '0.002,0.585,0.585,0.4801,0.24,oro,0' },
    { k: 'vele', n: 'Velero Moana', cat: 'Disney', id: 210765628, v: 881348042, p: 17760, a: 22200, st: 1, tipo: 'aro', asp: 0.3779, ag: 0.012, cx: 0.3725, alto: 2.1, url: '/productos/aro-velero-moana-2386/', arg: '0.001,0.5498,0.5498,0.4328,0.24,oro,0' },
    { k: 'cact', n: 'Cactus de cristal', cat: 'Brillos', id: 117697895, v: 453817830, p: 17760, a: 22200, st: 1, tipo: 'aro', asp: 0.3064, ag: 0.0276, cx: 0.5736, alto: 2.872, url: '/productos/cactus-de-cristal-1143/', arg: '0.0,0.4858,0.4858,0.5291,0.24,oro,0' },
    { k: 'casi', n: 'Casiopea corazón', cat: 'Cielo', id: 364009891, v: 1586462508, p: 19200, a: 24000, st: 1, tipo: 'aro', asp: 0.4258, ag: 0.0332, cx: 0.5491, alto: 2.384, url: '/productos/casiopea-corazon-3991-ier45/', arg: '0.0,0.4326,0.4326,0.5482,0.176,oro,0' },
    { k: 'chai', n: 'Chains', cat: 'Clásicos', id: 353872782, v: 1553756474, p: 22000, a: 27500, st: 4, tipo: 'aro', asp: 0.1357, ag: 0.017, cx: 0.4862, alto: 3.289, url: '/productos/chains-3525-98mlj/', arg: '0.0,0.25,0.25,0.4712,0.24,oro,0' },
    { k: 'chan', n: 'Chanchito Moana', cat: 'Disney', id: 216200902, v: 946375973, p: 17760, a: 22200, st: 1, tipo: 'aro', asp: 0.3691, ag: 0.012, cx: 0.2108, alto: 2.45, url: '/productos/chanchito-moana-2385/', arg: '0.001,0.4717,0.4717,0.5344,0.24,oro,0' },
    { k: 'coco', n: 'Cocodrilo Tiana', cat: 'Disney', id: 225476016, v: 993663592, p: 17760, a: 22200, st: 13, tipo: 'aro', asp: 0.3281, ag: 0.012, cx: 0.5015, alto: 2.335, url: '/productos/cocodrilo-la-princesa-y-el-sapo-2381/', arg: '0.001,0.4961,0.4961,0.6042,0.174,oro,0' },
    { k: 'coh2', n: 'Cohete de cristal 2', cat: 'Cielo', id: 216201079, v: 946376632, p: 20160, a: 25200, st: 1, tipo: 'aro', asp: 0.1143, ag: 0.012, cx: 0.5185, alto: 2.9, url: '/productos/cohete-de-cristal-2794/', arg: '0.001,0.457,0.457,0.4744,0.24,oro,1' },
    { k: 'emoj', n: 'Emoji enamorado', cat: 'Plateados', id: 223060525, v: 981877630, p: 18000, a: 22500, st: 1, tipo: 'aro', asp: 0.4023, ag: 0.012, cx: 0.4897, alto: 2.2, url: '/productos/emoji-enamorado-silver-3010/', arg: '0.001,0.5342,0.5342,0.6274,0.189,plata,1' },
    { k: 'emot', n: 'Emoticon con estrellitas', cat: 'Brillos', id: 117698384, v: 453825421, p: 20800, a: 26000, st: 1, tipo: 'aro', asp: 0.4189, ag: 0.0148, cx: 0.4262, alto: 2.384, url: '/productos/emoticon-con-estrellitas-955/', arg: '0.0059,0.5576,0.5576,0.4499,0.24,oro,1' },
    { k: 'espi', n: 'Espiral multicolor', cat: 'Brillos', id: 210711182, v: 881044642, p: 19920, a: 24900, st: 1, tipo: 'aro', asp: 0.4141, ag: 0.012, cx: 0.3984, alto: 3.0, url: '/productos/espiral-multicolor-2793/', arg: '0.001,0.3398,0.3398,0.4139,0.24,oro,0' },
    { k: 'gall', n: 'Gallo Moana', cat: 'Disney', id: 216200579, v: 946374143, p: 17760, a: 22200, st: 2, tipo: 'aro', asp: 0.3076, ag: 0.012, cx: 0.0955, alto: 2.8, url: '/productos/gallo-moana-2384/', arg: '0.001,0.4102,0.4102,0.5333,0.24,oro,0' },
    { k: 'garf', n: 'Garfio', cat: 'Disney', id: 210716056, v: 881064948, p: 14080, a: 17600, st: 3, tipo: 'aro', asp: 0.2646, ag: 0.012, cx: 0.159, alto: 2.25, url: '/productos/garfio-2388/', arg: '0.001,0.5137,0.5137,0.4705,0.24,oro,0' },
    { k: 'icec', n: 'Ice cream silver', cat: 'Plateados', id: 223061075, v: 981879846, p: 18000, a: 22500, st: 1, tipo: 'aro', asp: 0.2381, ag: 0.012, cx: 0.5458, alto: 2.865, url: '/productos/ice-cream-silver-3006/', arg: '0.001,0.4495,0.4495,0.6234,0.24,plata,0' },
    { k: 'luci', n: 'Luciérnaga Tiana', cat: 'Disney', id: 216199979, v: 946371741, p: 20080, a: 25100, st: 1, tipo: 'aro', asp: 0.3867, ag: 0.012, cx: 0.0964, alto: 2.5, url: '/productos/luciernaga-la-princesa-y-el-sapo-2380/', arg: '0.0,0.4609,0.4609,0.3965,0.24,oro,0' },
    { k: 'mont', n: 'Montaña rusa', cat: 'Disney', id: 204442256, v: 851508242, p: 19920, a: 24900, st: 4, tipo: 'aro', asp: 0.5195, ag: 0.0155, cx: 0.493, alto: 2.479, url: '/productos/montana-rusa-2514/', arg: '0.002,0.5693,0.5693,0.5479,0.24,oro,0' },
    { k: 'perc', n: 'Percy', cat: 'Disney', id: 225477408, v: 993668663, p: 20080, a: 25100, st: 1, tipo: 'aro', asp: 0.2783, ag: 0.012, cx: 0.3947, alto: 2.146, url: '/productos/percy-de-pocahontas-3064/', arg: '0.001,0.4756,0.4756,0.5632,0.169,oro,0' },
    { k: 'rato', n: 'Ratón Cenicienta', cat: 'Disney', id: 225473884, v: 993655844, p: 17760, a: 22200, st: 16, tipo: 'aro', asp: 0.2812, ag: 0.012, cx: 0.3929, alto: 2.1, url: '/productos/raton-cenicienta-2378/', arg: '0.001,0.5469,0.5469,0.4444,0.138,oro,0' },
    { k: 'sat2', n: 'Saturn silver', cat: 'Plateados', id: 353893560, v: 1553816182, p: 17680, a: 22100, st: 1, tipo: 'aro', asp: 0.6574, ag: 0.012, cx: 0.4532, alto: 2.2, url: '/productos/saturn-silver-1580-1tau8/', arg: '0.0,0.5221,0.5221,0.5019,0.186,plata,0' },
    { k: 'swhi', n: 'Sweet white', cat: 'Brillos', id: 117698140, v: 453821556, p: 27760, a: 34700, st: 1, tipo: 'aro', asp: 0.4609, ag: 0.0114, cx: 0.5429, alto: 3.576, url: '/productos/sweet-white-1033/', arg: '0.0,0.543,0.543,0.4852,0.24,oro,1' },
    { k: 'tene', n: 'Tenedor', cat: 'Disney', id: 210722948, v: 881103143, p: 17760, a: 22200, st: 11, tipo: 'aro', asp: 0.4521, ag: 0.012, cx: 0.0878, alto: 2.5, url: '/productos/tenedor-2374/', arg: '0.001,0.458,0.458,0.5032,0.24,oro,0' },
    { k: 'cmin', n: 'Ear cuff Moño Minnie', cat: 'Ear cuffs', me: 'oro', id: 173863918, v: 662674662, p: 17760, a: 22200, st: 1, tipo: 'cuff', asp: 1.7338, ag: 0.5, cx: 0.5, alto: 0.62, url: '/productos/mono-minnie-20961/', arg: '' },
    { k: 'cshi', n: 'Ear cuff Shine silver', cat: 'Ear cuffs', me: 'plata', id: 60423257, v: 180339875, p: 19120, a: 23900, st: 2, tipo: 'cuff', asp: 0.9754, ag: 0.5, cx: 0.5, alto: 0.95, url: '/productos/aro-ear-cuff-bellatrix-silver-395/', arg: '' }
] %}

<section class="pnt-s pnt-a3 pnt-or" id="armar-oreja" aria-labelledby="pnt-or-t" data-wa-evitar>
    <div class="pnt-s-caja">
        {# Cabecera igual a la de "Armá tu pulsera" #}
        <header class="pnt-a3-cab pnt-rv">
            <h2 class="pnt-s-titulo" id="pnt-or-t">Armá tu combinación de aritos</h2>
            <p class="pnt-a3-sub">Elegí cuántos aritos, combinalos y mirá cómo quedan puestos antes de comprar.</p>
        </header>
        <div class="pnt-or-host" data-pnt-or data-poster-de="l1:estr,l2:chag" data-carrito="{{ store.cart_url ?: '/comprar/' }}" data-three="{{ 'panthera/three/three-0.187.0.module.js' | static_url }}" data-escena="{{ 'panthera/oreja3d-escena.js' | static_url }}?v=20261115c" data-contornos="{{ 'panthera/oreja/contornos.js' | static_url }}?v=20261112b" data-foto-url="{{ 'panthera/oreja/foto-oreja.webp' | static_url }}?v=20261112b" data-foto-mascara="{{ 'panthera/oreja/foto-mascara.png' | static_url }}?v=20261112b" data-ejemplo="l1:estr,l2:chag" data-foto='{"w":2558,"h":2460,"escala":0.005669144981412639,"foco":[2000,1430],"alto":1860,"focoM":[1480,1292],"altoM":1000,"focoCel":[1380,1120],"altoCel":2020,"agujeros":{"l1":[1660,1384],"l2":[1492,1380],"l3":[1328,1332],"cuff":[1072,820]},"lado":1,"cuffGiro":0.05,"bordeCuff":[1006,820],"luz":[-1.3,2.6,6.5],"entorno":{"pelo":"#4d3123","cara":"#bc7f64","cuello":"#9a654a"}}'>
            <template>
<link rel="stylesheet" href="{{ 'panthera/oreja3d.css' | static_url }}?v=20261116j">
<ul hidden data-or-aros>
{% for c in pnt_or_aros %}<li data-k="{{ c.k }}" data-n="{{ c.n }}" data-cat="{{ c.cat }}" data-me="{{ c.me }}" data-id="{{ c.id }}" data-v="{{ c.v }}" data-p="{{ c.p }}" data-a="{{ c.a }}" data-st="{{ c.st }}" data-tipo="{{ c.tipo }}" data-asp="{{ c.asp }}" data-ag="{{ c.ag }}" data-cx="{{ c.cx }}" data-alto="{{ c.alto }}" data-url="{{ c.url }}" data-arg="{{ c.arg }}" data-img="{{ ('panthera/oreja/aros/' ~ c.k ~ '.webp') | static_url }}" data-hd="{{ ('panthera/oreja/aros-hd/' ~ c.k ~ '.webp') | static_url }}" data-hdn="{{ ('panthera/oreja/aros-hd/' ~ c.k ~ '-n.webp') | static_url }}"></li>
{% endfor %}</ul>
<div class="app">
  <section class="stage" id="stage" aria-label="Vista 3D de tu oreja">
    <canvas id="c" aria-hidden="true"></canvas>
    <div class="cargando" id="cargando"><picture>{# (2026-11-14) en celular el escenario ahora es apaisado (pegado arriba, 40 % de alto): usa el mismo póster que la compu; el de celular (poster-m, parado) dejaba franjas a los costados #}<img class="poster" src="{{ 'panthera/oreja/poster.webp' | static_url }}?v=20261115c" alt="" decoding="async" loading="lazy"></picture><i></i><p>Preparando tu oreja…</p></div>
    <p class="vacio" id="vacio" hidden>Tocá un aro (o arrastralo) para sumarlo</p>
    <div class="etiqueta" id="etiqueta" hidden></div>
    <p class="medida" id="medida" aria-live="polite"></p>
    <div class="cuenta"><b id="cuenta">0</b><span id="cuenta-l">piezas</span></div>
    <div class="st-pie"><p class="hint" id="hint"></p></div>
    <div class="total" aria-live="polite">
      <p class="t-cab" id="t-lbl"></p>
      <span class="p-linea"></span>
      <p class="p-lista" id="t-lista"></p>
      <p class="p-transf"><b id="t-tr"></b><span>Con transferencia</span></p>
      <p class="p-cuotas"><svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg><span>3 cuotas sin interés de <span id="t-cuota"></span></span></p>
      <button type="button" class="cta" id="cta"><span id="cta-t">Agregar al carrito</span><svg class="bolsa" viewBox="0 0 565 512" aria-hidden="true"><path d="M528.22,422.85l-37.53-230.4c-6.05-37.16-38.15-64.45-75.8-64.45h-4.65C410.24,57.31,352.93,0,282.24,0S154.24,57.31,154.24,128h-4.65c-37.65,0-69.75,27.29-75.8,64.45l-37.53,230.4c-7.610,46.73,28.46,89.15,75.8,89.15H452.42c47.34,0,83.42-42.42,75.8-89.15ZM282.24,51.2c42.42,0,76.8,34.38,76.8,76.8H205.44c0-42.42,34.38-76.8,76.8-76.8Zm170.18,409.6H112.05c-15.78,0-27.8-14.14-25.27-29.72l37.53-230.4c2.020-12.39,12.72-21.48,25.27-21.48h4.65v51.2h51.2v-51.2h153.6v51.2h51.2v-51.2h4.65c12.55,0,23.25,9.1,25.27,21.48l37.53,230.4c2.540,15.58-9.48,29.72-25.27,29.72Z"/></svg></button>
    </div>
    <div class="nogl" id="nogl" hidden><p>Tu navegador no muestra 3D. Igual podés elegir aros y ver el total.</p></div>
    <div class="lupa" id="lupa" hidden role="dialog" aria-labelledby="lupa-n">
      <button type="button" class="lupa-x" id="lupa-x" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <p class="lupa-t" id="lupa-t">De cerca</p>
      <p class="lupa-n" id="lupa-n"></p>
      <p class="lupa-d" id="lupa-d"></p>
      <div class="lupa-p" id="lupa-p"></div>
      <button type="button" class="lupa-sacar" id="lupa-sacar">Sacar de la oreja</button>
    </div>
  </section>
  <section class="dock" aria-labelledby="dock-t">
    <div class="dock-cab">
      <div><h2 id="dock-t"><i class="dock-n" aria-hidden="true">2</i><span class="dock-tm">Sumá tus aritos</span><span class="dock-td">Sumá tus aros</span></h2><p id="dock-s"></p></div>
      <div class="filtro" id="filtro">
        <button type="button" class="filtro-b" id="filtro-b" aria-haspopup="true" aria-expanded="false" aria-controls="chips"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M6 10h8M8.5 15h3"/></svg><span id="filtro-t">Filtrar</span></button>
        <div class="chips" id="chips" role="group" aria-label="Filtrar por tema" hidden></div>
      </div>
    </div>
    <div class="tira-caja">
      <button type="button" class="flecha izq" id="t-izq" aria-label="Aros anteriores"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="tira" id="tira"></div>
      <button type="button" class="flecha der" id="t-der" aria-label="Más aros"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
  </section>
  <aside class="panel" aria-label="Tu oreja">
    <section class="paso hecho"><h3><i>1</i>¿Cuántos aritos tenés?</h3><div class="talles" id="huecos"></div></section>
    <section class="paso" id="paso2"><h3><i><span class="dock-td">2</span><span class="dock-tm">3</span></i>Tu combinación</h3><ol class="lista" id="lista"></ol></section>
    <div class="total-ranura" id="total-ranura"></div>
  </aside>
</div>
<div class="fantasma" id="fantasma" hidden><img alt=""></div>
<div class="toast" id="toast" role="status" aria-live="polite"><span id="toast-t"></span><button type="button" id="toast-b" hidden>Deshacer</button></div>
<div class="barra" id="barra"><div class="barra-p"><span class="p-lista">Ahora <b id="b-total"></b></span><span class="p-transf"><b id="b-tr"></b><span>Con transferencia</span></span></div><button type="button" class="cta" id="b-cta" aria-label="Agregar al carrito"><svg class="bolsa" viewBox="0 0 565 512" aria-hidden="true"><path d="M528.22,422.85l-37.53-230.4c-6.05-37.16-38.15-64.45-75.8-64.45h-4.65C410.24,57.31,352.93,0,282.24,0S154.24,57.31,154.24,128h-4.65c-37.65,0-69.75,27.29-75.8,64.45l-37.53,230.4c-7.610,46.73,28.46,89.15,75.8,89.15H452.42c47.34,0,83.42-42.42,75.8-89.15ZM282.24,51.2c42.42,0,76.8,34.38,76.8,76.8H205.44c0-42.42,34.38-76.8,76.8-76.8Zm170.18,409.6H112.05c-15.78,0-27.8-14.14-25.27-29.72l37.53-230.4c2.020-12.39,12.72-21.48,25.27-21.48h4.65v51.2h51.2v-51.2h153.6v51.2h51.2v-51.2h4.65c12.55,0,23.25,9.1,25.27,21.48l37.53,230.4c2.540,15.58-9.48,29.72-25.27,29.72Z"/></svg><span>Agregar</span></button></div>
            </template>
        </div>
    </div>
</section>
