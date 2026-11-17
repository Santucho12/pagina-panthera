{# Panthera — "Armá tu pulsera" en 3D (2026-11-10). Elegís la base (cada una con su cierre), el talle y los charms, y la ves armada
   en 3D; "Agregar al carrito" pone la pulsera (en tu talle) y cada charm juntos en el carrito. Es el armador del artefacto "El riel"
   (vista pulsera) pasado a la tienda: la lógica está en static/panthera/armar3d.js y los estilos en armar3d.css (van adentro del
   componente, en su Shadow DOM, así Lima no los toca). La escena 3D está en static/panthera/armar3d-escena.js (data-escena: la
   pide armar3d.js recién cerca de la sección, con three.js 0.187.0). Fotos: static/panthera/arma/charms (recortadas sin fondo) y arma/bases.

   ⚠️ Los datos de abajo (ids, variantes, precios, stock) son los de la tienda real al 2026-11-10 y están escritos a mano: el tema no
   puede pedirle a la tienda "este producto en particular" desde el inicio. Si cambia un precio o el stock, actualizarlo acá.
   El carrito SIEMPRE cobra el precio real (esto es solo lo que se muestra). Cómo sacar los datos de otro producto: abrir su página;
   el id está en <input name="add_to_cart"> y el id de cada talle (variante), en data-variants.
   - p = precio, a = precio de antes (tachado), st = stock (1 = "Última"; 0 = sin stock, el talle aparece tachado).
   - Charms: tipo 'c' = de cuenta (la cadena lo atraviesa por el medio) o 'd' = colgante; ag = altura del agujero (fracción desde
     arriba de la foto recortada; en los colgantes, el centro del agujero de su aro); alto = tamaño en 3D; asp = ancho/alto de la
     foto. Si se cambia una foto, recalcular asp. hueco (opcional): el 3D busca solo el agujero que se ve en la foto;
     la cadena pasa por DELANTE del borde por donde entra, se mete en el agujero y queda tapada por el otro lado de la pieza
     (2026-11-12). Si lo encuentra mal: 'no' = sin agujero a la vista (la cadena pasa por detrás de la pieza);
     'cx,cy,rx,ry' lo fija a mano (centro y radios del agujero en fracciones de la foto) y 'cx,cy,rx,ry,lado' dice además de
     qué lado entra la cadena (1: por la izquierda de la foto; -1: por la derecha; es el lado del aro que se ve de frente).
     Para revisar todos: node herramientas/armador/pruebas/agujeros.mjs (lista los que quedaron sin agujero) y enhebrado.mjs.
     Cada charm tiene además su foto en alta y su relieve (arma/charms-hd/) y su contorno (arma/contornos.js): los genera
     herramientas/armador/recorte.py (ver su LEEME). El 3D los usa para darle volumen; las tarjetas usan la foto liviana.
   - Bases: cierre = el modelo 3D del cierre (flor, corazon, barril, circulos, arbol, rosa, rigida); rad = grosor de la cadena.

   ⚠️ Preparado en local: NO subido. #}
{% set pnt_a3_bases = [
    { k: 'hart', n: 'Heart cristales', id: 229441882, url: '/productos/pulsera-heart-cristales-3163/', p: 94320, a: 117900, cierre: 'corazon', desc: 'Cierre de corazón con cristales', rad: 0.062,
      talles: [{ t: '17 cm', v: 1011717499, st: 0 }, { t: '18 cm', v: 1011717500, st: 0 }, { t: '19 cm', v: 1333665671, st: 0 }, { t: '20 cm', v: 1333665680, st: 0 }, { t: '21 cm', v: 1333665689, st: 1 }] },
    { k: 'crys', n: 'Crystal', id: 229442340, url: '/productos/pulsera-crystal-456/', p: 94320, a: 117900, cierre: 'barril', desc: 'Cierre de barril con cristales', rad: 0.062,
      talles: [{ t: '17 cm', v: 1126371830, st: 0 }, { t: '18 cm', v: 1011719192, st: 0 }, { t: '19 cm', v: 1011719190, st: 2 }, { t: '20 cm', v: 1126371836, st: 1 }, { t: '21 cm', v: 1333670274, st: 1 }] },
    { k: 'circ', n: 'Broche de cristales circulares', id: 229444911, url: '/productos/pulsera-broche-de-cristales-circulares-3136/', p: 94320, a: 117900, cierre: 'circulos', desc: 'Cierre redondo con anillos de cristales', rad: 0.054,
      talles: [{ t: '17 cm', v: 1011735983, st: 0 }, { t: '18 cm', v: 1011735984, st: 0 }, { t: '19 cm', v: 1011735985, st: 1 }] },
    { k: 'silv', n: 'Silver Flower', id: 253322375, url: '/productos/pulsera-silver-flower-454/', p: 94320, a: 117900, cierre: 'flor', desc: 'Cierre redondo esmaltado con flor', rad: 0.062,
      talles: [{ t: '17 cm', v: 1472532222, st: 0 }, { t: '18 cm', v: 1472532219, st: 1 }, { t: '19 cm', v: 1472532221, st: 3 }] },
    { k: 'arbo', n: 'Cierre árbol family', id: 127010328, url: '/productos/pulsera-cierre-arbol-family-19-cm-1499/', p: 94320, a: 117900, cierre: 'arbol', desc: 'Cierre de corazón con el árbol de la familia', rad: 0.062,
      talles: [{ t: '18 cm', v: 1511896752, st: 0 }, { t: '19 cm', v: 1511896754, st: 0 }, { t: '20 cm', v: 1540958128, st: 0 }, { t: '21 cm', v: 1540958131, st: 0 }] },
    { k: 'rosb', n: 'Cierre de rosa', id: 339464352, url: '/productos/pulsera-cierre-de-rosa-3901-1b3ws/', p: 94320, a: 117900, cierre: 'rosa', desc: 'Cierre en forma de rosa', rad: 0.062,
      talles: [{ t: '17 cm', v: 1508699622, st: 0 }, { t: '18 cm', v: 1508699623, st: 0 }, { t: '19 cm', v: 1508699624, st: 4 }] },
    { k: 'rigi', n: 'Rígida broche de circonios azules', id: 339456487, url: '/productos/pulsera-broche-de-circonios-azules-q6cim/', p: 94320, a: 117900, cierre: 'rigida', desc: 'Rígida, con cierre de cristales azules', rad: 0.05,
      talles: [{ t: '18 cm', v: 1508669179, st: 1 }, { t: '19 cm', v: 1508669180, st: 0 }] }
] %}
{# 2026-11-16: me: 'oro' = charm dorado (filtro por metal del armador; sin me = plateado). Sacado de las fotos: Flor rose cristal (rose gold), Travel lover, Árbol gold y Mickey gold. #}
{# 2026-11-11: se sumaron los 35 charms/dijes que faltaban (62 en total, todos los de la categoría Charms/Dijes de la tienda ese día) #}
{% set pnt_a3_charms = [
    { k: 'vali', n: 'Valija rosa', cat: 'Viajes', me: 'oro', id: 129656252, v: 507888073, p: 68160, a: 85200, st: 1, tipo: 'c', ag: 0.5583, alto: 0.4532, asp: 0.9547, url: '/productos/valija-rosa-love-traels-1537/', hueco: 'no' },
    { k: 'adve', n: 'Adventure', cat: 'Viajes', id: 95732339, v: 364652442, p: 72880, a: 91100, st: 1, tipo: 'd', ag: 0.1825, alto: 0.9863, asp: 0.4554, url: '/productos/adventure-816/', hueco: 'no' },
    { k: 'stit', n: 'Stitch', cat: 'Disney', id: 168374749, v: 636613295, p: 68160, a: 85200, st: 1, tipo: 'c', ag: 0.4921, alto: 0.5072, asp: 0.761, url: '/productos/stitch-1806/' },
    { k: 'mmb', n: 'Mickey manitos', cat: 'Disney', id: 168376469, v: 636621706, p: 77760, a: 97200, st: 1, tipo: 'd', ag: 0.209, alto: 0.7842, asp: 0.6009, url: '/productos/mickey-manitos-blancas-2199/', hueco: '0.45,0.209,0.055,0.1035' },
    { k: 'mom', n: 'Mom', cat: 'Amor y familia', id: 173334738, v: 660102566, p: 68160, a: 85200, st: 3, tipo: 'd', ag: 0.221, alto: 0.8352, asp: 0.4812, url: '/productos/mom-con-corazon-nacar-rosa-1545/' },
    { k: 'home', n: 'Home happy place', cat: 'Amor y familia', id: 138273485, v: 536659306, p: 68160, a: 85200, st: 4, tipo: 'c', ag: 0.4667, alto: 0.4731, asp: 1.0688, url: '/productos/home-happy-place-1826/', hueco: '0.156,0.564,0.085,0.17,1' },
    { k: 'broc', n: 'Broche Mickey y Minnie', cat: 'Disney', id: 168465036, v: 637087476, p: 72880, a: 91100, st: 1, tipo: 'c', ag: 0.4973, alto: 0.4054, asp: 0.936, url: '/productos/broche-minnie-mickey-2196/' },
    { k: 'cora', n: 'Corazón red & silver', cat: 'Amor y familia', id: 173333360, v: 660096873, p: 68160, a: 85200, st: 6, tipo: 'd', ag: 0.198, alto: 0.8481, asp: 0.4978, url: '/productos/corazon-red-and-silver-1519/' },
    { k: 'wood', n: 'Woody', cat: 'Disney', id: 149138013, v: 571511556, p: 71520, a: 89400, st: 1, tipo: 'd', ag: 0.163, alto: 1.15, asp: 0.2821, url: '/productos/woody-1934/' },
    { k: 'jess', n: 'Jessie', cat: 'Disney', id: 209884900, v: 876361534, p: 71520, a: 89400, st: 1, tipo: 'd', ag: 0.15, alto: 1.1387, asp: 0.2937, url: '/productos/jessie-1933/', hueco: '0.336,0.15,0.06,0.078,1' },
    { k: 'ange', n: 'Angelito celeste', cat: 'Amor y familia', id: 173473022, v: 660772310, p: 65920, a: 82400, st: 1, tipo: 'c', ag: 0.4744, alto: 0.436, asp: 1.1393, url: '/productos/angelito-celeste-1975/' },
    { k: 'buzz', n: 'Buzz Lightyear', cat: 'Disney', id: 149152220, v: 571539890, p: 71520, a: 89400, st: 1, tipo: 'd', ag: 0.161, alto: 0.9831, asp: 0.4138, url: '/productos/buzz-lightyear-1932/' },
    { k: 'flor', n: 'Flor rose cristal', cat: 'Brillos y cielo', me: 'oro', id: 363804266, v: 1585855381, p: 69760, a: 87200, st: 2, tipo: 'd', ag: 0.153, alto: 0.7481, asp: 0.5581, url: '/productos/flor-rose-cristal-y-violeta-2426-90y16/', hueco: '0.5,0.153,0.155,0.09,1' },
    { k: 'rosa', n: 'Super rosa crystal', cat: 'Brillos y cielo', id: 363800372, v: 1585842951, p: 81600, a: 102000, st: 2, tipo: 'c', ag: 0.5065, alto: 0.4936, asp: 0.9677, url: '/productos/super-rosa-crystal-3545-z6y2n/', hueco: 'no' },
    { k: 'fam', n: 'Family forever', cat: 'Amor y familia', id: 363797957, v: 1585834719, p: 66960, a: 83700, st: 9, tipo: 'c', ag: 0.5054, alto: 0.4749, asp: 1.0396, url: '/productos/family-forever-cristal-3293-gjvco/' },
    { k: 'ceni', n: 'Cenicienta', cat: 'Disney', id: 363772724, v: 1585768576, p: 78480, a: 98100, st: 4, tipo: 'd', ag: 0.163, alto: 1.0152, asp: 0.3333, url: '/productos/princesa-cenicienta-con-vestido-magico-3291-m6c3x/' },
    { k: 'minp', n: 'Minnie patinadora', cat: 'Disney', id: 363768392, v: 1585756706, p: 77760, a: 97200, st: 1, tipo: 'd', ag: 0.175, alto: 1.1, asp: 0.2958, url: '/productos/minnie-patinadora-3774-1lhip/' },
    { k: 'gato', n: 'Gato de Alicia', cat: 'Disney', id: 363718658, v: 1585614772, p: 71280, a: 89100, st: 1, tipo: 'c', ag: 0.4887, alto: 0.529, asp: 0.7384, url: '/productos/gato-de-alicia-3961-z9ugb/' },
    { k: 'mone', n: 'Moneda sun', cat: 'Brillos y cielo', id: 363718149, v: 1585613760, p: 69760, a: 87200, st: 1, tipo: 'd', ag: 0.185, alto: 0.84, asp: 0.5178, url: '/productos/moneda-sun-3759-7izic/' },
    { k: 'estr', n: 'Estrellita pink', cat: 'Brillos y cielo', id: 356629270, v: 1562399117, p: 53680, a: 67100, st: 1, tipo: 'd', ag: 0.212, alto: 0.625, asp: 0.6, url: '/productos/estrellita-pink-mini-1553-93kgi/' },
    { k: 'glob', n: 'Globo aerostático', cat: 'Viajes', id: 356615834, v: 1562367366, p: 68160, a: 85200, st: 1, tipo: 'd', ag: 0.2845, alto: 0.6959, asp: 0.6316, url: '/productos/globo-aerostatico-red-and-white-1541-1jve3/' },
    { k: 'bruj', n: 'Brújula', cat: 'Viajes', id: 340282263, v: 1512008788, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.120, alto: 0.8475, asp: 0.5912, url: '/productos/brujula-3943-14yv6/', hueco: 'no' },
    { k: 'rued', n: 'Rueda zodiacal', cat: 'Brillos y cielo', id: 340281034, v: 1512005850, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.160, alto: 0.8444, asp: 0.7057, url: '/productos/rueda-zodiacal-3929-24vst/', hueco: 'no' },
    { k: 'jaz', n: 'Jazmín', cat: 'Disney', id: 168376007, v: 636619051, p: 71520, a: 89400, st: 1, tipo: 'd', ag: 0.161, alto: 1.1346, asp: 0.2593, url: '/productos/jazmin-1940/' },
    { k: 'moon', n: 'The Moon', cat: 'Brillos y cielo', id: 297821903, v: 1329356713, p: 76800, a: 96000, st: 1, tipo: 'd', ag: 0.175, alto: 0.9726, asp: 0.493, url: '/productos/the-moon-3695/', hueco: '0.458,0.175,0.025,0.09,-1' },
    { k: 'mick', n: 'Mickey Shine', cat: 'Disney', id: 321472178, v: 1424916310, p: 77760, a: 97200, st: 0, tipo: 'c', ag: 0.5047, alto: 0.4755, asp: 0.9711, url: '/productos/mickey-shine-2420-1c6la/' },
    { k: 'minn', n: 'Minnie moño rosa', cat: 'Disney', id: 321471199, v: 1424913170, p: 77760, a: 97200, st: 2, tipo: 'd', ag: 0.144, alto: 0.8482, asp: 0.5, url: '/productos/silueta-de-minnie-con-mono-rosa-shine-3819-1jl18/' },
    { k: 'bboy', n: 'Baby boy', cat: 'Amor y familia', id: 95668727, v: 364366708, p: 66160, a: 82700, st: 4, tipo: 'c', ag: 0.5, alto: 0.56, asp: 0.625, url: '/productos/baby-boy-490/', hueco: '0.123,0.486,0.087,0.128,1' },
    { k: 'bgir', n: 'Baby girl', cat: 'Amor y familia', id: 95668801, v: 364367095, p: 58800, a: 73500, st: 1, tipo: 'c', ag: 0.55, alto: 0.56, asp: 1.2151, url: '/productos/baby-girl-489/', hueco: 'no' },
    { k: 'luci', n: 'Luciérnaga', cat: 'Amor y familia', id: 173231618, v: 659482590, p: 69840, a: 87300, st: 1, tipo: 'd', ag: 0.17, alto: 1.05, asp: 0.7829, url: '/productos/luciernaga-especial-830/', hueco: 'no' },
    { k: 'huel', n: 'Huella crystal', cat: 'Amor y familia', id: 95731568, v: 364648179, p: 66160, a: 82700, st: 0, tipo: 'c', ag: 0.5, alto: 0.46, asp: 1.2926, url: '/productos/huella-crystal-494/', hueco: '0.171,0.5,0.1,0.2,1' },
    { k: 'magi', n: 'Magic', cat: 'Brillos y cielo', id: 95731697, v: 364649196, p: 66160, a: 82700, st: 1, tipo: 'd', ag: 0.247, alto: 0.92, asp: 0.8778, url: '/productos/magic-485/' },
    { k: 'pain', n: 'Painter', cat: 'Varios', id: 95734365, v: 364662907, p: 66160, a: 82700, st: 1, tipo: 'd', ag: 0.186, alto: 0.95, asp: 0.4184, url: '/productos/painter-471/' },
    { k: 'fmly', n: 'Family', cat: 'Amor y familia', id: 95733698, v: 364659118, p: 63360, a: 79200, st: 1, tipo: 'd', ag: 0.202, alto: 1.0, asp: 0.471, url: '/productos/family-475/' },
    { k: 'hcri', n: 'Huellita de cristal', cat: 'Amor y familia', id: 216878798, v: 949255173, p: 66160, a: 82700, st: 1, tipo: 'd', ag: 0.13, alto: 0.95, asp: 0.4459, url: '/productos/huellita-de-cristal-3544/' },
    { k: 'dama', n: 'Dama y el vagabundo', cat: 'Disney', id: 173447216, v: 660658754, p: 68160, a: 85200, st: 2, tipo: 'd', ag: 0.13, alto: 0.98, asp: 0.5126, url: '/productos/dama-y-el-vagabundo-1805/' },
    { k: 'frie', n: 'Friends', cat: 'Amor y familia', id: 117872332, v: 454629348, p: 68160, a: 85200, st: 1, tipo: 'd', ag: 0.13, alto: 0.95, asp: 0.6914, url: '/productos/friends-818/', hueco: 'no' },
    { k: 'mcol', n: 'Cadena de seguridad Mickey', cat: 'Disney', id: 209049854, v: 872951359, p: 85440, a: 106800, st: 2, tipo: 'd', ag: 0.15, alto: 1.15, asp: 0.7458, url: '/productos/mickey-colgando-2421/', hueco: 'no' },
    { k: 'pali', n: 'Palito silver', cat: 'Varios', id: 102391504, v: 392938162, p: 58800, a: 73500, st: 1, tipo: 'c', ag: 0.5, alto: 0.42, asp: 0.4857, url: '/productos/palito-silver-527/', hueco: 'no' },
    { k: 'mmce', n: 'Mickey y Minnie corazón', cat: 'Disney', id: 168376819, v: 636623875, p: 77760, a: 97200, st: 1, tipo: 'd', ag: 0.15, alto: 1.0, asp: 0.6816, url: '/productos/mickey-and-minnie-corazon-esmaltado-2203/' },
    { k: 'drea', n: 'Dreams', cat: 'Brillos y cielo', id: 209885408, v: 876363464, p: 67440, a: 84300, st: 2, tipo: 'c', ag: 0.36, alto: 0.62, asp: 0.8168, url: '/productos/dreams-2759/' },
    { k: 'rayi', n: 'Rayito yellow', cat: 'Brillos y cielo', id: 363820947, v: 1585895858, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.12, alto: 0.78, asp: 0.251, url: '/productos/rayito-yellow-mini-3944-1dolf/' },
    { k: 'cesp', n: 'Corazón esmaltado pink', cat: 'Amor y familia', id: 363819461, v: 1585891532, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.1, alto: 0.86, asp: 0.7218, url: '/productos/corazon-esmaltado-pink-3922-1mast/', hueco: 'no' },
    { k: 'ruea', n: 'Around the world', cat: 'Viajes', id: 363806433, v: 1585861425, p: 71040, a: 88800, st: 1, tipo: 'c', ag: 0.35, alto: 0.47, asp: 0.9966, url: '/productos/ruedita-arround-the-world-3651-1ay9l/' },
    { k: 'vaqu', n: 'Vaquita de San Antonio', cat: 'Varios', id: 363782492, v: 1585793608, p: 68160, a: 85200, st: 2, tipo: 'd', ag: 0.13, alto: 0.9, asp: 0.4303, url: '/productos/vaquita-de-san-antonio-silver-roja-860-id6ht/' },
    { k: 'trav', n: 'Travel lover', cat: 'Viajes', me: 'oro', id: 363757082, v: 1585727691, p: 68160, a: 85200, st: 1, tipo: 'd', ag: 0.187, alto: 1.05, asp: 0.7387, url: '/productos/travel-lover-avion-maleta-planetario-gold-3941-w4i0b/', hueco: '0.505,0.187,0.062,0.11' },
    { k: 'demo', n: 'Demogorgon', cat: 'Varios', id: 363717127, v: 1585611844, p: 78720, a: 98400, st: 1, tipo: 'd', ag: 0.19, alto: 1.0, asp: 0.7064, url: '/productos/demogorgon-3891-1ru1x/', hueco: '0.565,0.19,0.012,0.08,-1' },
    { k: 'arbo', n: 'Árbol gold', cat: 'Amor y familia', id: 356631150, v: 1562404103, p: 58720, a: 73400, st: 3, tipo: 'd', ag: 0.208, alto: 0.62, asp: 0.474, url: '/productos/arbol-gold-con-circonios-3346-pqj1v/' },
    { k: 'cpin', n: 'Corazón pink mini', cat: 'Amor y familia', id: 356628942, v: 1562398413, p: 53680, a: 67100, st: 1, tipo: 'd', ag: 0.176, alto: 0.6, asp: 0.522, url: '/productos/corazon-pink-mini-ms35c/' },
    { k: 'bstr', n: 'Broche blue star', cat: 'Brillos y cielo', id: 356606983, v: 1562344639, p: 69760, a: 87200, st: 1, tipo: 'c', ag: 0.5, alto: 0.42, asp: 1.048, url: '/productos/broche-de-seguridad-blue-star-1003-1w4i1/' },
    { k: 'mmre', n: 'Mickey y Minnie reversible', cat: 'Disney', id: 356602760, v: 1562334034, p: 72800, a: 91000, st: 2, tipo: 'c', ag: 0.5, alto: 0.48, asp: 1.0041, url: '/productos/mickey-y-minnie-corazon-reversible-813-12cqg/' },
    { k: 'lmul', n: 'Love multicolor', cat: 'Amor y familia', id: 340281189, v: 1512006360, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.12, alto: 0.82, asp: 0.6208, url: '/productos/love-multicolor-big-3945-1f12q/', hueco: '0.433,0.12,0.037,0.085,1' },
    { k: 'efug', n: 'Estrella fugaz', cat: 'Brillos y cielo', id: 340279309, v: 1512000154, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.17, alto: 0.65, asp: 0.5132, url: '/productos/estrella-fugaz-mini-3938-1bj8u/', hueco: '0.44,0.17,0.065,0.105,1' },
    { k: 'medi', n: 'Medalla infinito', cat: 'Amor y familia', id: 340278329, v: 1511996738, p: 59520, a: 74400, st: 1, tipo: 'd', ag: 0.171, alto: 0.95, asp: 0.6452, url: '/productos/medalla-infinito-3930-smbru/' },
    { k: 'solr', n: 'Sol reluciente', cat: 'Brillos y cielo', id: 340273327, v: 1511982310, p: 53680, a: 67100, st: 1, tipo: 'd', ag: 0.185, alto: 0.62, asp: 0.5235, url: '/productos/sol-reluciente-mini-1550-1re64/', hueco: '0.42,0.185,0.075,0.115,1' },
    { k: 'timo', n: 'Timón y Pumba', cat: 'Disney', id: 338537447, v: 1504619480, p: 105600, a: 132000, st: 2, tipo: 'd', ag: 0.18, alto: 0.95, asp: 0.7443, url: '/productos/timon-y-pumba-3768-j56m9/', hueco: 'no' },
    { k: 'cmic', n: 'Mickey gold', cat: 'Disney', me: 'oro', id: 321469353, v: 1424907840, p: 72000, a: 90000, st: 3, tipo: 'd', ag: 0.18, alto: 0.8, asp: 0.5333, url: '/productos/contorno-mickey-gold-3698-1k42t/', hueco: '0.49,0.18,0.06,0.085,-1' },
    { k: 'clov', n: 'Love silver', cat: 'Amor y familia', id: 321458131, v: 1424874890, p: 73440, a: 91800, st: 1, tipo: 'c', ag: 0.5, alto: 0.5, asp: 1.1739, url: '/productos/contorno-love-silver-1820-uvgcy/', hueco: '0.15,0.47,0.05,0.15,1' },
    { k: 'ping', n: 'Pingüino', cat: 'Varios', id: 321062471, v: 1423019123, p: 68160, a: 85200, st: 1, tipo: 'c', ag: 0.52, alto: 0.62, asp: 0.6641, url: '/productos/pinguino-3823-7ju9l/' },
    { k: 'drca', n: 'Color dream catcher', cat: 'Brillos y cielo', id: 267390559, v: 1186454914, p: 61360, a: 76700, st: 1, tipo: 'd', ag: 0.1, alto: 1.1, asp: 0.4933, url: '/productos/color-dream-catcher-4741/', hueco: 'no' },
    { k: 'dgal', n: 'Dona galaxia', cat: 'Brillos y cielo', id: 173226541, v: 659450501, p: 80640, a: 100800, st: 2, tipo: 'c', ag: 0.5, alto: 0.48, asp: 0.8754, url: '/productos/dona-galaxia-845/' },
    { k: 'strs', n: 'Stars', cat: 'Brillos y cielo', id: 117879415, v: 454654101, p: 72880, a: 91100, st: 1, tipo: 'd', ag: 0.15, alto: 0.95, asp: 0.8319, url: '/productos/stars-850/' }
] %}

{# data-wa-evitar (2026-11-11): el cartel de WhatsApp de la tienda no se abre encima del armador (en compu tapaba el panel) #}
<section class="pnt-s pnt-a3" id="armar-pulsera" aria-labelledby="pnt-a3-t" data-wa-evitar>
    <div class="pnt-s-caja">
        {# Cabecera igual a la de "Mundo Disney" y "Los más elegidos" (pedido 2026-11-10): título en mayúsculas y una frase chica abajo.
           Va afuera del 3D (adentro se pisaba con la pulsera). #}
        <header class="pnt-a3-cab pnt-rv">
            <h2 class="pnt-s-titulo" id="pnt-a3-t">Armá tu pulsera</h2>
            <p class="pnt-a3-sub">Tu historia, charm a charm: elegí la pulsera y el talle, sumá charms y mirala armada antes de comprar.</p>
        </header>
        <div class="pnt-a3-host" data-pnt-a3 data-poster-de="silv|18 cm|pain,mmre,stit" data-carrito="{{ store.cart_url ?: '/comprar/' }}" data-three="{{ 'panthera/three/three-0.187.0.module.js' | static_url }}" data-escena="{{ 'panthera/armar3d-escena.js' | static_url }}?v=20261116j" data-contornos="{{ 'panthera/arma/contornos.js' | static_url }}?v=20261112b">
            <template>
<link rel="stylesheet" href="{{ 'panthera/armar3d.css' | static_url }}?v=20261116j">
<ul hidden data-a3-bases>
{% for b in pnt_a3_bases %}<li data-k="{{ b.k }}" data-n="{{ b.n }}" data-id="{{ b.id }}" data-p="{{ b.p }}" data-a="{{ b.a }}" data-cierre="{{ b.cierre }}" data-desc="{{ b.desc }}" data-rad="{{ b.rad }}" data-url="{{ b.url }}" data-img="{{ ('panthera/arma/bases/' ~ b.k ~ '.webp') | static_url }}" data-talles="{% for t in b.talles %}{{ t.t }}|{{ t.v }}|{{ t.st }}{% if not loop.last %};{% endif %}{% endfor %}"></li>
{% endfor %}</ul>
<ul hidden data-a3-charms>
{% for c in pnt_a3_charms %}<li data-k="{{ c.k }}" data-n="{{ c.n }}" data-cat="{{ c.cat }}" data-me="{{ c.me }}" data-id="{{ c.id }}" data-v="{{ c.v }}" data-p="{{ c.p }}" data-a="{{ c.a }}" data-st="{{ c.st }}" data-tipo="{{ c.tipo }}" data-ag="{{ c.ag }}" data-alto="{{ c.alto }}" data-asp="{{ c.asp }}" data-hueco="{{ c.hueco }}" data-url="{{ c.url }}" data-img="{{ ('panthera/arma/charms/' ~ c.k ~ '.webp') | static_url }}" data-hd="{{ ('panthera/arma/charms-hd/' ~ c.k ~ '.webp') | static_url }}" data-hdn="{{ ('panthera/arma/charms-hd/' ~ c.k ~ '-n.webp') | static_url }}"></li>
{% endfor %}</ul>
<div class="app">
  <section class="stage" id="stage" aria-label="Vista 3D de tu pulsera">
    <canvas id="c" aria-hidden="true"></canvas>
    <div class="cargando" id="cargando">
      <picture><source media="(max-width: 699px)" srcset="{{ 'panthera/arma/poster-m.webp' | static_url }}?v=20261116k"><img class="poster" src="{{ 'panthera/arma/poster.webp' | static_url }}?v=20261116k" alt="" decoding="async" loading="lazy"></picture>
      <i></i><p>Preparando tu pulsera…</p>
    </div>
    <p class="vacio" id="vacio" hidden>Tocá un charm (o arrastralo) para sumarlo</p>
    <div class="etiqueta" id="etiqueta" hidden></div>
    <div class="vitrina" id="vitrina" aria-live="polite"><img alt=""><div><b></b><span></span></div></div>
    <p class="medida" id="medida" aria-live="polite"></p>
    <div class="cuenta"><b id="cuenta">0</b><span id="cuenta-l">charms</span></div>
    <div class="st-pie"><p class="hint" id="hint"></p></div>
    <div class="total" aria-live="polite">
      <p class="t-cab" id="t-lbl"></p>
      <span class="p-linea"></span>
      <p class="p-lista" id="t-lista"></p>
      <p class="p-transf"><b id="t-tr"></b><span>Con transferencia</span></p>
      <p class="p-cuotas"><svg viewBox="0 0 20 14" aria-hidden="true"><rect x=".75" y=".75" width="18.5" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="3.6" width="18" height="2.2" fill="currentColor"/></svg><span>3 cuotas sin interés de <span id="t-cuota"></span></span></p>
      <button type="button" class="cta" id="cta"><span id="cta-t">Agregar al carrito</span><svg class="bolsa" viewBox="0 0 565 512" aria-hidden="true"><path d="M528.22,422.85l-37.53-230.4c-6.05-37.16-38.15-64.45-75.8-64.45h-4.65C410.24,57.31,352.93,0,282.24,0S154.24,57.31,154.24,128h-4.65c-37.65,0-69.75,27.29-75.8,64.45l-37.53,230.4c-7.61,46.73,28.46,89.15,75.8,89.15H452.42c47.34,0,83.42-42.42,75.8-89.15ZM282.24,51.2c42.42,0,76.8,34.38,76.8,76.8H205.44c0-42.42,34.38-76.8,76.8-76.8Zm170.18,409.6H112.05c-15.78,0-27.8-14.14-25.27-29.72l37.53-230.4c2.02-12.39,12.72-21.48,25.27-21.48h4.65v51.2h51.2v-51.2h153.6v51.2h51.2v-51.2h4.65c12.55,0,23.25,9.1,25.27,21.48l37.53,230.4c2.54,15.58-9.48,29.72-25.27,29.72Z"/></svg></button>
    </div>
    <div class="nogl" id="nogl" hidden><p>Tu navegador no muestra 3D. Igual podés elegir charms y ver el total.</p></div>
    <div class="lupa" id="lupa" hidden role="dialog" aria-labelledby="lupa-n">
      <button type="button" class="lupa-x" id="lupa-x" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <p class="lupa-t" id="lupa-t">De cerca</p>
      <p class="lupa-n" id="lupa-n"></p>
      <p class="lupa-d" id="lupa-d"></p>
      <div class="lupa-p" id="lupa-p"></div>
      <button type="button" class="lupa-sacar" id="lupa-sacar">Sacar de la pulsera</button>
    </div>
  </section>

  <section class="dock" aria-labelledby="dock-t">
    <div class="dock-cab">
      <div><h2 id="dock-t"><i class="dock-n" aria-hidden="true">3</i>Elegí tus charms</h2><p id="dock-s"></p></div>
      <div class="filtro" id="filtro">
        <button type="button" class="filtro-b" id="filtro-b" aria-haspopup="true" aria-expanded="false" aria-controls="chips"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M6 10h8M8.5 15h3"/></svg><span id="filtro-t">Filtrar</span></button>
        <div class="chips" id="chips" role="group" aria-label="Filtrar por tema" hidden></div>
      </div>
      <span class="desliza" id="desliza-ch" aria-hidden="true" hidden><span class="desliza-t">Deslizá<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="desliza-p"></span></span>{# (2026-11-15) celular: "Deslizá" en la fila de "Filtrar" (armar3d.js → desliza) #}
    </div>
    <div class="tira-caja">
      <button type="button" class="flecha izq" id="t-izq" aria-label="Charms anteriores"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="tira" id="tira"></div>
      <button type="button" class="flecha der" id="t-der" aria-label="Más charms"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
  </section>

  <aside class="panel" aria-label="Tu pulsera">
    <section class="paso" id="paso1"><h3><i></i>La pulsera<span class="desliza" id="desliza-ba" aria-hidden="true" hidden><span class="desliza-t">Deslizá<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="desliza-p"></span></span></h3><div class="bases" id="bases"></div><p class="base-n" id="base-n" hidden></p><p class="base-d" id="base-d" hidden></p><p class="base-s" id="base-s" hidden></p></section>
    <section class="paso" id="paso2" hidden><h3><i></i>Tu talle</h3><div class="talles" id="talles"></div><p class="guia">Es el largo de la pulsera. Medí tu muñeca y sumale 2 cm (guía orientativa).</p></section>
    <section class="paso" id="paso3" hidden><h3><i></i>Tu combinación</h3><ol class="lista" id="lista"></ol><p class="orden" id="orden">De izquierda a derecha, como quedan en la pulsera.</p><p class="vacia" id="vacia">Todavía no sumaste charms: tocalos en la lista o arrastralos a la pulsera.</p></section>
    <div class="total-ranura" id="total-ranura"></div>
  </aside>
</div>
<div class="fantasma" id="fantasma" hidden><img alt=""></div>
<div class="toast" id="toast" role="status" aria-live="polite"><span id="toast-t"></span><button type="button" id="toast-b" hidden>Deshacer</button></div>
<div class="barra" id="barra"><div class="barra-p"><span class="p-lista">Ahora <b id="b-total"></b></span><span class="p-transf"><b id="b-tr"></b><span>Con transferencia</span></span></div><button type="button" class="cta" id="b-cta" aria-label="Agregar al carrito"><svg class="bolsa" viewBox="0 0 565 512" aria-hidden="true"><path d="M528.22,422.85l-37.53-230.4c-6.05-37.16-38.15-64.45-75.8-64.45h-4.65C410.24,57.31,352.93,0,282.24,0S154.24,57.31,154.24,128h-4.65c-37.65,0-69.75,27.29-75.8,64.45l-37.53,230.4c-7.61,46.73,28.46,89.15,75.8,89.15H452.42c47.34,0,83.42-42.42,75.8-89.15ZM282.24,51.2c42.42,0,76.8,34.38,76.8,76.8H205.44c0-42.42,34.38-76.8,76.8-76.8Zm170.18,409.6H112.05c-15.78,0-27.8-14.14-25.27-29.72l37.53-230.4c2.02-12.39,12.72-21.48,25.27-21.48h4.65v51.2h51.2v-51.2h153.6v51.2h51.2v-51.2h4.65c12.55,0,23.25,9.1,25.27,21.48l37.53,230.4c2.54,15.58-9.48,29.72-25.27,29.72Z"/></svg><span>Agregar</span></button></div>
            </template>
        </div>
    </div>
</section>
