/* Panthera — "Armá tu pulsera": la ESCENA 3D (2026-11-11, pulido premium). La pide armar3d.js recién cuando la sección está cerca,
   junto con three.js 0.187.0 (módulo ES de jsDelivr), y la llama con three y el contexto del armador (datos, estado y funciones de
   la interfaz). Devuelve la API que usa la interfaz: agregar, quitar, reordenar, cambiaBase, talle, festejo, despierta.
   - Luz: un estudio de joyería armado en escena (softbox, tiras de luz y banderas negras) → PMREM, con brillos HDR: los filos de
     la plata llegan al blanco puro y las banderas le dan el contraste de foto de estudio.
   - Plata 925 física (MeshPhysicalMaterial) con micro-variación de rugosidad. La cadena es UN solo tubo: el radio de la pulsera
     (talle) y el del tubo son uniforms del shader, y el dibujo de la snake (placas encastradas, apenas onduladas) se hace en el
     shader con paso fijo en largo real y filtrado (fwidth) para que no haga moiré. La rígida usa el mismo tubo, liso y pulido.
   - Topes con rosca y cuellos a los lados del cierre, como en las fotos de las pulseras.
   - Sombra de contacto suave (la técnica del ejemplo webgl_shadow_contact de three) en vez de un mapa de sombras.
   - Calidad adaptativa: tres niveles (DPR y resolución de la sombra) que bajan o suben solos según el tiempo de cada cuadro.
   - Con ?a3debug en la URL: variantes (a3env=room, a3tm=agx|aces, a3piso=reflejo, a3nivel=bajo|medio|alto, a3quieto=1) y
     window.__a3 para las pruebas (herramientas/armador/pruebas/). Sin ese parámetro no cambia nada.
   ⚠️ Preparado en local: NO subido (CLAUDE.md). */
(function () {
'use strict';
window.PNT_A3_ESCENA = function (THREE, X) {
  var $ = X.$, st = X.st, CH = X.CH, BA = X.BA, DATA = X.DATA, MAX = X.MAX, fmt = X.fmt, cm = X.cm;
  var REDUCE = !!X.REDUCE, DBG = X.debug || {};
  var stage = $('stage'), canvas = $('c');

  /* ═════════ Motor ═════════ */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  var TONOS = { neutral: THREE.NeutralToneMapping, agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping };
  renderer.toneMapping = TONOS[DBG.tm] || THREE.NeutralToneMapping;
  renderer.toneMappingExposure = DBG.tm === 'aces' ? 1.1 : 1;
  renderer.setClearColor(0x000000, 0);
  var ANISO = renderer.capabilities.getMaxAnisotropy();
  /* (2026-11-16, pedido: "en mobile, en 3D, los charms, la pulsera y los aritos se ven con mucha menos calidad que en la computadora") En el celular el
     escenario es chico (~390 × 300 px) pero la pantalla tiene 3 píxeles por punto: con el tope de 2 (y bajando a 1,5 o 1,25 apenas el scroll del celular
     hacía un cuadro lento, cosa que pasa siempre al deslizar) se dibujaba a la mitad o menos de la nitidez de la pantalla. En el celular el piso es 2 y
     el nivel alto usa la pantalla entera (3). En compu no cambia. */
  function dprDe(d) { return stage.clientWidth < 700 ? (d >= 2 ? 3 : 2) : d; }
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  var CAPA_SOMBRA = 1, CAPA_SOMBRA_PROPIA = 2;     // 1: proyecta sombra con el material común · 2: con su propio material

  // Calidad: bajo / medio / alto. Arranca en alto (también en celulares: a DPR 1,5 las fotos se ven blandas); si los cuadros
  // tardan, baja sola de a un nivel
  var NIVELES = [{ n: 'bajo', dpr: 1.25, sombra: 256 }, { n: 'medio', dpr: 1.5, sombra: 384 }, { n: 'alto', dpr: 2, sombra: 512 }];
  var iNivel = { bajo: 0, medio: 1, alto: 2 }[DBG.nivel];
  if (iNivel === undefined) iNivel = 2;
  var techo = iNivel;

  /* ═════════ Luz: estudio de joyería → PMREM ═════════ */
  function estudio() {
    var s = new THREE.Scene();
    s.background = new THREE.Color(0.035, 0.035, 0.038);                // estudio oscuro: donde no hay paneles la plata refleja negro
    function panel(w, h, col, k, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); return m;
    }
    var mesa = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(0.42) }));
    mesa.rotation.x = -Math.PI / 2; mesa.position.y = -3.4; s.add(mesa);  // mesa clara: la panza de la plata refleja gris claro
    panel(12, 6, 0xffffff, 4.2, 0, 10, 1.5);       // softbox grande de arriba: el brillo de arriba de la cadena
    panel(9, 2.6, 0xffffff, 2.2, 0, 3.4, 11);      // difusor alto del frente (detrás de la cámara)
    panel(9, 1.4, 0xffffff, 1.3, 0, -0.6, 11.5);   // difusor bajo del frente
    panel(1.2, 13, 0xffffff, 9, -9, 1.5, 3);       // tira izquierda: el filo de luz a lo largo de la cadena
    panel(1.2, 13, 0xffffff, 7, 9, 1.5, -1);       // tira derecha
    panel(5, 3, 0xffffff, 2.4, 0, 4, -12);         // contraluz
    panel(3.2, 16, 0x000000, 1, -4.6, 1, 10.2);    // banderas negras: las líneas oscuras que le dan contraste a la plata
    panel(3.2, 16, 0x000000, 1, 5.2, 1, 9.6);
    // aro de luz alrededor de la cámara (como el ring light de la fotografía de joyería): las piedras que miran de frente brillan
    var aro = new THREE.Mesh(new THREE.RingGeometry(0.55, 2.6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(2.4), side: THREE.DoubleSide }));
    aro.position.set(0, 1.6, 12.5); aro.lookAt(0, 0, 0); s.add(aro);
    panel(4, 3, 0xF4ACC4, 0.5, -9, -1, 6);         // rebotes muy sutiles de la marca
    panel(3, 3, 0xEEC049, 0.35, 9, -1.5, 5);
    return s;
  }
  /* Arranque sin trabar la página: compilar un shader (sobre todo en Windows) congela la página hasta que termina; al llegar a la
     sección eran ~2 s. Ahora todos se compilan en segundo plano (renderer.compileAsync, con KHR_parallel_shader_compile) y recién
     después se dibuja el primer cuadro (mientras tanto se ve la capa de carga o el póster). compila() devuelve una promesa;
     enTextura: con los mismos parámetros que al dibujar en una textura (sin tone mapping, color lineal). */
  var rtCompila = new THREE.WebGLRenderTarget(4, 4);
  function compila(obj, cam, enTextura, escena) {
    if (!renderer.compileAsync) return Promise.resolve();
    var antes = renderer.getRenderTarget(), p;
    renderer.setRenderTarget(enTextura ? rtCompila : null);
    try { p = renderer.compileAsync(obj, cam, escena || null); } catch (e) { p = Promise.resolve(); }
    renderer.setRenderTarget(antes);
    return p.catch(function () {});
  }
  /* En pasos chicos (2026-11-12): aun compilando en segundo plano, CREAR los programas (armar su código y mandarlo a la placa)
     llevaba ~130 ms de un tirón, y la primera consulta de cada uno (getUniforms) y la subida de cada textura esperan a la placa.
     Ahora va de a uno por paso, dejando dibujar un cuadro entre uno y otro (X.respiro: secciones.js → PNT_3D): la página no se
     traba aunque se la esté desplazando. urge(): la sección ya se ve, no hay que dejar pasar cuadros de más. */
  var respiro = X.respiro || function () { return new Promise(function (ok) { setTimeout(ok, 0); }); };
  var calma = X.calma || function () { return Promise.resolve(); };
  function urge() { return !!(X.urgente && X.urgente()); }
  function enFila(lista, f, tope) {      // f(x) para cada uno, en tandas de pocos ms (tope) con un cuadro de respiro entre tanda y tanda
    var i = 0; tope = tope || 5;
    return new Promise(function (ok) {
      (function tanda() {
        var t0 = performance.now();
        while (i < lista.length && performance.now() - t0 < tope) { try { f(lista[i]); } catch (e) {} i++; }
        respiro(urge()).then(i < lista.length ? tanda : ok);
      })();
    });
  }
  function partesDe(obj) {         // una malla por cada combinación distinta de materiales y forma (cada una es un programa)
    var l = [], vistos = {};
    obj.traverse(function (o) {
      if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite) || !o.material) return;
      var k = [].concat(o.material).map(function (m) { return m.uuid; }).join('|') + (o.isInstancedMesh ? '|i' + (o.instanceColor ? 'c' : '') : '') +
        '|' + (o.geometry ? Object.keys(o.geometry.attributes).sort().join(',') : '');
      if (!vistos[k]) { vistos[k] = 1; l.push(o); }
    });
    return l;
  }
  function compilaPartes(obj, cam, enTextura, escena) {
    var ps = [];
    return enFila(partesDe(obj), function (o) { ps.push(compila(o, cam, enTextura, escena || (obj.isScene ? obj : null))); })
      .then(function () { return Promise.all(ps); });
  }
  function asientaDeAPoco() {      // la primera consulta de cada programa espera a la placa: de a uno
    return enFila(renderer.info.programs.filter(function (p) { return !p.__pntListo; }), function (p) {
      p.__pntListo = true; try { p.getUniforms(); p.getAttributes(); } catch (e) {}
    });
  }
  function texturasDe(obj) {
    var l = [];
    function suma(t) { if (t && t.isTexture && !t.isRenderTargetTexture && l.indexOf(t) < 0) l.push(t); }
    obj.traverse(function (o) {
      if (!o.material) return;
      [].concat(o.material).forEach(function (m) {
        for (var c in m) { if (m[c] && m[c].isTexture) suma(m[c]); }
        var u = m.uniforms; if (u) for (var n in u) { if (u[n] && u[n].value && u[n].value.isTexture) suma(u[n].value); }
      });
    });
    return l;
  }
  function subeTexturas(lista) { return enFila(lista, function (t) { try { renderer.initTexture(t); } catch (e) {} }); }
  var T0 = performance.now(), tiempos = {};
  // El entorno: los materiales del PMREM se crean sin dibujar (API interna de three 0.187, que está fijo) y se compilan junto con los
  // del estudio; recién entonces se arma (si algo de eso falla, se arma igual, como antes)
  var listoEntorno = (function () {
    var pmrem = new THREE.PMREMGenerator(renderer);
    var room = DBG.env === 'room' && X.addons && X.addons.RoomEnvironment;
    var ent = room ? new X.addons.RoomEnvironment() : estudio(), sigma = room ? 0.04 : 0.02, previo = Promise.resolve(), rc = null;
    try {
      rc = pmrem._renderCube; pmrem._renderCube = function () {};
      pmrem._setSize(256); var t = pmrem._allocateTarget(); pmrem._getSourceTarget(true);
      pmrem._blur(t, sigma); pmrem._applyPMREM(t);
      pmrem._renderCube = rc; rc = null; t.dispose();
      var g = new THREE.Group(), caja = pmrem._boxMesh.geometry;
      [pmrem._blurMaterial, pmrem._ggxMaterial, pmrem._integrationMaterial].forEach(function (m) { if (m) g.add(new THREE.Mesh(caja, m)); });
      ent.traverse(function (o) { if (o.isMesh) g.add(new THREE.Mesh(o.geometry, o.material)); });
      previo = compila(g, pmrem._cubeCamera.children[0], true);
    } catch (e) { if (rc) pmrem._renderCube = rc; }
    return previo.then(function () {
      scene.environment = pmrem.fromScene(ent, sigma).texture;
      pmrem.dispose();
      ent.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      tiempos.entorno = Math.round(performance.now() - T0);
    });
  })();
  var clave = new THREE.DirectionalLight(0xffffff, 1.5); clave.position.set(2.6, 6.5, 4.5); scene.add(clave);   // punto de brillo nítido
  var brillo = new THREE.PointLight(0xfff3f7, 1.4, 0, 0); scene.add(brillo);                                  // brillo que da vueltas

  /* ═════════ Plata 925 ═════════ */
  function texRuido() {    // rugosidad con micro-variación (ruido suave que se repite sin costuras): la plata real no es perfecta
    var n = 128, c = document.createElement('canvas'); c.width = c.height = n;
    var g = c.getContext('2d'), im = g.createImageData(n, n);
    function capa(celdas) {
      var v = []; for (var i = 0; i < celdas * celdas; i++) v.push(Math.random());
      return function (x, y) {
        var fx = x / n * celdas, fy = y / n * celdas, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        var x1 = (x0 + 1) % celdas, y1 = (y0 + 1) % celdas;
        var a = v[y0 * celdas + x0], b = v[y0 * celdas + x1], c2 = v[y1 * celdas + x0], d = v[y1 * celdas + x1];
        return a + (b - a) * tx + (c2 - a) * ty + (a - b - c2 + d) * tx * ty;
      };
    }
    var c1 = capa(6), c3 = capa(18);
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var v = 0.62 * c1(x, y) + 0.38 * c3(x, y), k = (y * n + x) * 4, val = Math.round(255 * (0.72 + 0.28 * v));
      im.data[k] = im.data[k + 1] = im.data[k + 2] = val; im.data[k + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t;
  }
  var ruido = texRuido(); ruido.repeat.set(2, 2);
  var COLOR_PLATA = 0xF3F1EB;
  var plata = new THREE.MeshPhysicalMaterial({ color: COLOR_PLATA, metalness: 1, roughness: 0.1, roughnessMap: ruido });
  var pulsera = new THREE.Group(); scene.add(pulsera);

  /* ═════════ Cadena: un solo tubo, deformado en el shader ═════════
     Cada vértice guarda su ángulo alrededor de la pulsera (θ) y alrededor del tubo (φ); el shader arma la posición con el radio
     de la pulsera (uR, cambia con el talle) y el del tubo (uRad). uIntro dibuja la cadena desde el frente hacia el cierre y
     uHuecos la saca adentro de los charms de cuenta. */
  var R0 = 1.5, R = R0, Robj = R0, Rvel = 0;
  var RAD = 0.062, RADobj = 0.062;
  /* uContactos: la cadena se oscurece suave donde entra a cada pieza (sombra de contacto). La cadena NUNCA se deforma: se probó
     hundirla hacia atrás en los agujeros (2026-11-11) y con varios charms la pulsera se veía abollada; quedó un aro perfecto. */
  var U = { uR: { value: R0 }, uRad: { value: RAD }, uIntro: { value: 0 }, uPaso: { value: 0.05 }, uSnake: { value: 1 }, uHuecos: { value: [] }, uNHuecos: { value: 0 },
    uContactos: { value: [] }, uNContactos: { value: 0 } };
  for (var hi = 0; hi < 16; hi++) { U.uHuecos.value.push(new THREE.Vector2(-1, -1)); U.uContactos.value.push(new THREE.Vector4()); }
  var VERT_PARS = 'attribute vec2 aCirc;\nuniform float uR;\nuniform float uRad;\nuniform float uIntro;\nuniform vec2 uHuecos[16];\nuniform int uNHuecos;\n' +
    'float escalaCadena(float t) {\n' +
    '  float ap = 1.0;\n' +
    '  if (uIntro < 1.0) { float dc = abs(t - 0.5) * 2.0; float v = clamp((uIntro * 1.35 - dc) / 0.3, 0.0, 1.0); ap = v * v * (3.0 - 2.0 * v); }\n' +
    '  for (int k = 0; k < 16; k++) { if (k >= uNHuecos) break; if (t > uHuecos[k].x && t < uHuecos[k].y) ap = 0.0; }\n' +
    '  return ap;\n' +
    '}\n';
  var VERT_POS = 'float cTh = aCirc.x;\nfloat cPh = aCirc.y;\nvec3 cRad = vec3(sin(cTh), 0.0, cos(cTh));\n' +
    'vec3 cOff = cRad * cos(cPh) + vec3(0.0, 1.0, 0.0) * sin(cPh);\n' +
    'vec3 transformed = cRad * uR + cOff * uRad * escalaCadena(cTh / 6.283185307);\n';
  var FRAG_CONTACTO = [
    'float aoC = 1.0;',
    'for (int k = 0; k < 16; k++) {',
    '  if (k >= uNContactos) break;',
    '  vec4 cc = uContactos[k];',
    '  float dC = max(cc.x - vCirc.x, vCirc.x - cc.y);',
    '  aoC = min(aoC, 1.0 - cc.z * (1.0 - smoothstep(0.0, abs(cc.w), dC)));',
    '  if (cc.w > 0.0) aoC = min(aoC, mix(0.14, 1.0, smoothstep(-0.004, 0.02, dC)));',     // (con corte) el extremo, casi negro: se lee como la cadena entrando a la pieza
    '}',
    'outgoingLight *= aoC;'
  ].join('\n');
  // la snake, como en las fotos: placas redondeadas cuyo borde da la vuelta al tubo en "S" (de frente se ve en diagonal, como
  // una soga), con un surco oscuro entre placa y placa. Cada placa se inclina según la dirección real de su borde, así el brillo
  // recorre las placas al girar. Cuando una placa mide menos de ~3 px el dibujo se apaga (sin moiré) y la plata queda un poco
  // más mate, como la cadena real vista de lejos.
  var FRAG_SNAKE = [
    '{',
    '  float pU = vCirc.x / uPaso + 0.9 * sin(vCirc.y);',
    '  float pW = fwidth(pU);',
    '  float filtro = (1.0 - smoothstep(0.2, 0.45, pW)) * uSnake;',
    '  float f = fract(pU);',
    '  vec3 cT = normalize(tbn[0]), cB = normalize(tbn[1]);',
    '  vec3 gdir = normalize(cT / uPaso + cB * (0.9 * cos(vCirc.y) / max(uRad, 0.001)));',
    '  float bomba = cos(3.14159 * clamp(f / 0.88, 0.0, 1.0));',
    '  float escalon = smoothstep(0.88, 0.97, f) * (1.0 - smoothstep(0.97, 1.0, f));',
    '  normal = normalize(normal - gdir * (bomba * 0.55 - escalon * 1.4) * filtro);',
    '  diffuseColor.rgb *= (1.0 - 0.72 * escalon * filtro) * (1.0 - 0.13 * uSnake * (1.0 - filtro));',
    '  roughnessFactor = min(1.0, roughnessFactor + 0.05 * uSnake * (1.0 - filtro));',
    '}'
  ].join('\n');
  function geoCadena(nL, nR) {
    var pos = [], nor = [], uv = [], circ = [], idx = [];
    for (var i = 0; i <= nL; i++) {
      var th = i / nL * Math.PI * 2, sx = Math.sin(th), cz = Math.cos(th);
      for (var j = 0; j <= nR; j++) {
        var ph = j / nR * Math.PI * 2, co = Math.cos(ph), si = Math.sin(ph);
        pos.push(sx * (1 + 0.06 * co), 0.06 * si, cz * (1 + 0.06 * co)); nor.push(sx * co, si, cz * co);
        uv.push(i / nL * 40, j / nR); circ.push(th, ph);
      }
    }
    for (i = 0; i < nL; i++) for (j = 0; j < nR; j++) { var a = i * (nR + 1) + j, b = a + nR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    var g = new THREE.BufferGeometry(); g.setIndex(idx);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('aCirc', new THREE.Float32BufferAttribute(circ, 2));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2.4);
    return g;
  }
  var matCadena = new THREE.MeshPhysicalMaterial({ color: COLOR_PLATA, metalness: 1, roughness: 0.13, roughnessMap: ruido, anisotropy: 0.5 });
  matCadena.onBeforeCompile = function (sh) {
    for (var k in U) sh.uniforms[k] = U[k];
    sh.vertexShader = VERT_PARS + 'varying vec2 vCirc;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(sin(aCirc.x) * cos(aCirc.y), sin(aCirc.y), cos(aCirc.x) * cos(aCirc.y));')
      .replace('#include <begin_vertex>', VERT_POS + 'vCirc = vec2(cTh * uR, cPh);');
    sh.fragmentShader = 'uniform float uPaso;\nuniform float uSnake;\nuniform float uRad;\nuniform vec4 uContactos[16];\nuniform int uNContactos;\nvarying vec2 vCirc;\n' + sh.fragmentShader
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + FRAG_SNAKE)
      .replace('#include <opaque_fragment>', FRAG_CONTACTO + '\n#include <opaque_fragment>');
  };
  matCadena.customProgramCacheKey = function () { return 'pnt-cadena'; };
  var geoC = geoCadena(720, 20);
  var cadena = new THREE.Mesh(geoC, matCadena); cadena.frustumCulled = false; pulsera.add(cadena);

  /* ═════════ Sombra de contacto (como el ejemplo webgl_shadow_contact de three) ═════════
     Una cámara ortográfica mira desde el piso hacia arriba y dibuja lo que proyecta sombra, más oscuro cuanto más cerca del piso;
     se difumina dos veces y se muestra en un plano. Se rehace en cada cuadro (cuesta menos de 1 ms). */
  var PISO_Y = -2.0, ANCHO_SOMBRA = 4.6, ALTO_SOMBRA = 2.4;    // solo proyecta lo que está a menos de 2,4 del piso: la parte de adelante y los charms
  var OSCURIDAD = { value: 1.35 };
  var REEMPLAZO = ['gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'];
  function matProfundidad(op, clave) {
    var m = new THREE.MeshDepthMaterial(op); m.depthTest = false; m.depthWrite = false;
    m.onBeforeCompile = function (sh) { sh.uniforms.darkness = OSCURIDAD; sh.fragmentShader = 'uniform float darkness;\n' + sh.fragmentShader.replace(REEMPLAZO[0], REEMPLAZO[1]); };
    m.customProgramCacheKey = function () { return 'pnt-sombra-' + (clave || 'comun'); };
    return m;
  }
  var matSombra = matProfundidad();
  var matSombraCadena = matProfundidad(null, 'cadena');
  matSombraCadena.onBeforeCompile = function (sh) {
    for (var k in U) sh.uniforms[k] = U[k];
    sh.uniforms.darkness = OSCURIDAD;
    sh.vertexShader = VERT_PARS + sh.vertexShader.replace('#include <begin_vertex>', VERT_POS);
    sh.fragmentShader = 'uniform float darkness;\n' + sh.fragmentShader.replace(REEMPLAZO[0], REEMPLAZO[1]);
  };
  var cadenaSombra = new THREE.Mesh(geoC, matSombraCadena); cadenaSombra.layers.set(CAPA_SOMBRA_PROPIA); cadenaSombra.frustumCulled = false; pulsera.add(cadenaSombra);
  var sombra = { grupo: new THREE.Group(), rt: null, rt2: null, res: 0 };
  sombra.grupo.position.y = PISO_Y; scene.add(sombra.grupo);
  sombra.cam = new THREE.OrthographicCamera(-ANCHO_SOMBRA / 2, ANCHO_SOMBRA / 2, ANCHO_SOMBRA / 2, -ANCHO_SOMBRA / 2, 0, ALTO_SOMBRA);
  sombra.cam.rotation.x = Math.PI / 2; sombra.grupo.add(sombra.cam);
  sombra.mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.36, depthWrite: false, toneMapped: false });   // (2026-11-14) más suave y difusa: la pulsera está suspendida, la sombra es una mancha blanda
  sombra.plano = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_SOMBRA, ANCHO_SOMBRA).rotateX(Math.PI / 2), sombra.mat);
  sombra.plano.renderOrder = 1; sombra.plano.scale.y = -1; sombra.grupo.add(sombra.plano);
  // (2026-11-11 se había sacado a pedido; 2026-11-14 vuelve, también a pedido: "flota en el vacío" → sombra de contacto suave. Para sacarla: false)
  sombra.plano.visible = true;
  var difusion = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2() } },
    vertexShader: 'varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D tDiffuse;\nuniform vec2 dir;\nvarying vec2 vUv;\nvoid main() {\n' +
      '  vec4 s = texture2D(tDiffuse, vUv) * 0.2270270270;\n' +
      '  s += texture2D(tDiffuse, vUv + dir * 1.3846153846) * 0.3162162162; s += texture2D(tDiffuse, vUv - dir * 1.3846153846) * 0.3162162162;\n' +
      '  s += texture2D(tDiffuse, vUv + dir * 3.2307692308) * 0.0702702703; s += texture2D(tDiffuse, vUv - dir * 3.2307692308) * 0.0702702703;\n' +
      '  gl_FragColor = s;\n}',
    depthTest: false, depthWrite: false
  });
  var escenaPlana = new THREE.Scene(), camPlana = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  escenaPlana.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), difusion));
  function preparaSombra(res) {
    if (sombra.res === res) return;
    if (sombra.rt) { sombra.rt.dispose(); sombra.rt2.dispose(); }
    sombra.rt = new THREE.WebGLRenderTarget(res, res); sombra.rt.texture.generateMipmaps = false;
    sombra.rt2 = new THREE.WebGLRenderTarget(res, res); sombra.rt2.texture.generateMipmaps = false;
    sombra.mat.map = sombra.rt.texture; sombra.mat.needsUpdate = true; sombra.res = res;
  }
  function difumina(desde, hacia, dx, dy) { difusion.uniforms.tDiffuse.value = desde.texture; difusion.uniforms.dir.value.set(dx, dy); renderer.setRenderTarget(hacia); renderer.render(escenaPlana, camPlana); }
  function pintaSombra() {
    if (!sombra.plano.visible) return;
    var ac = renderer.autoClear;
    renderer.setRenderTarget(sombra.rt); renderer.clear();
    scene.overrideMaterial = matSombra; sombra.cam.layers.set(CAPA_SOMBRA); renderer.render(scene, sombra.cam);
    scene.overrideMaterial = null; sombra.cam.layers.set(CAPA_SOMBRA_PROPIA); renderer.autoClear = false; renderer.render(scene, sombra.cam); renderer.autoClear = ac;
    var p = 1 / sombra.res;
    difumina(sombra.rt, sombra.rt2, p * 5.0, 0); difumina(sombra.rt2, sombra.rt, 0, p * 5.0);
    difumina(sombra.rt, sombra.rt2, p * 2.4, 0); difumina(sombra.rt2, sombra.rt, 0, p * 2.4);
    difumina(sombra.rt, sombra.rt2, p * 1.0, 0); difumina(sombra.rt2, sombra.rt, 0, p * 1.0);
    renderer.setRenderTarget(null);
  }
  // variante "vidriera" (solo para comparar, ?a3debug&a3piso=reflejo): piso blanco con reflejo que se desvanece
  var reflejo = null;
  if (DBG.piso === 'reflejo' && X.addons && X.addons.Reflector) {
    reflejo = new X.addons.Reflector(new THREE.PlaneGeometry(9, 9), { textureWidth: 1024, textureHeight: 1024, clipBias: 0.003, color: 0xffffff, shader: {
      name: 'PntReflejo',
      uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: 'uniform mat4 textureMatrix;\nvarying vec4 vUvR;\nvarying vec2 vLoc;\nvoid main() { vUvR = textureMatrix * vec4(position, 1.0); vLoc = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse;\nvarying vec4 vUvR;\nvarying vec2 vLoc;\nvoid main() {\n  vec4 b = texture2DProj(tDiffuse, vUvR);\n  float fade = 1.0 - smoothstep(0.6, 3.4, length(vLoc));\n  gl_FragColor = vec4(b.rgb, b.a * fade * 0.3);\n  #include <tonemapping_fragment>\n  #include <colorspace_fragment>\n}'
    } });
    reflejo.material.transparent = true; reflejo.material.depthWrite = false;
    reflejo.rotation.x = -Math.PI / 2; reflejo.position.y = PISO_Y + 0.6; scene.add(reflejo);
    sombra.plano.visible = false;
  }

  /* ═════════ Recorrido y orientación sobre la cadena (en el espacio de la pulsera) ═════════ */
  var ease = function (v) { return v * v * (3 - 2 * v); };
  var sinIntro = !!(X.sinIntro && X.sinIntro());     // venimos del póster: la pulsera ya se vio armada
  var intro = REDUCE || sinIntro ? 1 : 0;
  function camino(t, out) {   // la pulsera: un círculo de radio R (t = 0 es el cierre; t = 0,5, el frente)
    var ph = (((t % 1) + 1) % 1) * Math.PI * 2;
    return out.set(R * Math.sin(ph), 0, R * Math.cos(ph));
  }
  var pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3(), mt = new THREE.Matrix4();
  var bX = new THREE.Vector3(), bY = new THREE.Vector3(), bZ = new THREE.Vector3(), bM = new THREE.Matrix4(), camLoc = new THREE.Vector3();
  function orienta(obj, t) {        // X = la cadena, Z = hacia afuera, Y = arriba
    camino(t - 0.0015, pA); camino(t + 0.0015, pB); bX.subVectors(pB, pA).normalize();
    camino(t, pC); obj.position.copy(pC);
    bZ.set(pC.x, 0, pC.z).normalize();
    bZ.addScaledVector(bX, -bZ.dot(bX)).normalize();
    bY.crossVectors(bZ, bX);
    if (bY.y < 0) { bX.negate(); bY.crossVectors(bZ, bX); }
    bM.makeBasis(bX, bY, bZ); obj.quaternion.setFromRotationMatrix(bM);
  }
  function orientaCierre(obj, t) {  // el cierre gira alrededor de la cadena y muestra su cara a la cámara (como en las fotos)
    camino(t - 0.0015, pA); camino(t + 0.0015, pB); bX.subVectors(pB, pA).normalize();
    camino(t, pC); obj.position.copy(pC);
    camLoc.copy(camera.position); pulsera.worldToLocal(camLoc);
    bZ.subVectors(camLoc, pC); bZ.addScaledVector(bX, -bZ.dot(bX)).normalize();
    bY.crossVectors(bZ, bX);
    if (bY.y < 0) { bX.negate(); bY.crossVectors(bZ, bX); }
    bM.makeBasis(bX, bY, bZ); obj.quaternion.setFromRotationMatrix(bM);
  }
  function capaSombra(gq) { gq.traverse(function (o) { if (o.isMesh) o.layers.enable(CAPA_SOMBRA); }); return gq; }

  /* ═════════ Texturas pintadas para las caras de los cierres ═════════ */
  function lienzo(n) { var c = document.createElement('canvas'); c.width = c.height = n; return c; }
  function texDe(c, rep) { var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
  function esmalteNegro(g, cx, cy, r) {
    var gg = g.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r);
    gg.addColorStop(0, '#2c2b2e'); gg.addColorStop(1, '#070707'); g.fillStyle = gg; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  }
  function aroPlata(g, cx, cy, r, ancho) {
    var gg = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r); gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.5, '#a9a9b0'); gg.addColorStop(1, '#f0f0f3');
    g.strokeStyle = gg; g.lineWidth = ancho; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  }
  function caraFlor() {      // Silver Flower: esmalte negro con flores de cerezo (los cristales van aparte, en 3D)
    var c = lienzo(1024), g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = '#c9c9cf'; g.fillRect(0, 0, 512, 512);
    esmalteNegro(g, 256, 256, 238); aroPlata(g, 256, 256, 214, 24);
    g.strokeStyle = '#cfcfd6'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(96, 372); g.quadraticCurveTo(220, 330, 300, 392); g.stroke();
    g.beginPath(); g.moveTo(190, 352); g.quadraticCurveTo(170, 392, 186, 420); g.stroke();
    function flor(cx, cy, rr, giro, tono) {
      for (var i = 0; i < 5; i++) {
        g.save(); g.translate(cx, cy); g.rotate(giro + i / 5 * Math.PI * 2);
        var pg = g.createLinearGradient(0, 0, 0, -rr); pg.addColorStop(0, tono); pg.addColorStop(0.5, '#F4ACC4'); pg.addColorStop(1, '#fff6f9');
        g.fillStyle = pg; g.beginPath(); g.moveTo(0, 0);
        g.bezierCurveTo(-rr * 0.64, -rr * 0.3, -rr * 0.52, -rr * 0.98, -rr * 0.13, -rr); g.lineTo(0, -rr * 0.86); g.lineTo(rr * 0.13, -rr);
        g.bezierCurveTo(rr * 0.52, -rr * 0.98, rr * 0.64, -rr * 0.3, 0, 0); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(2, rr * 0.04); g.stroke();
        g.strokeStyle = 'rgba(205,95,140,.5)'; g.lineWidth = Math.max(1.2, rr * 0.022); g.beginPath(); g.moveTo(0, -rr * 0.14); g.lineTo(0, -rr * 0.66); g.stroke();
        g.restore();
      }
    }
    flor(206, 226, 122, -0.25, '#e27aa1'); flor(354, 318, 74, 0.45, '#e98cae'); flor(336, 142, 56, 0.95, '#ef9fbc');
    return texDe(c);
  }
  function caraCirculos() {  // Círculos: anillos de esmalte negro y de plata (los cristales y la piedra del centro van en 3D)
    var c = lienzo(1024), g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = '#c9c9cf'; g.fillRect(0, 0, 512, 512);
    esmalteNegro(g, 256, 256, 242); aroPlata(g, 256, 256, 228, 12); aroPlata(g, 256, 256, 196, 34);
    aroPlata(g, 256, 256, 166, 9); esmalteNegro(g, 256, 256, 158); aroPlata(g, 256, 256, 128, 28);
    aroPlata(g, 256, 256, 100, 9); esmalteNegro(g, 256, 256, 93); aroPlata(g, 256, 256, 50, 16);
    return texDe(c);
  }
  function caraArbol() {     // Árbol de la familia: esmalte negro y un árbol de plata; las hojas son cristales en 3D
    var c = lienzo(1024), g = c.getContext('2d'), hojas = []; g.scale(2, 2);
    g.fillStyle = '#0a0a0b'; g.fillRect(0, 0, 512, 512);
    var pl = g.createLinearGradient(0, 0, 512, 512); pl.addColorStop(0, '#ffffff'); pl.addColorStop(0.5, '#b8b8bf'); pl.addColorStop(1, '#ededf1');
    g.strokeStyle = pl; g.lineCap = 'round';
    function rama(x0, y0, ang, largo, ancho, nivel) {
      var x1 = x0 + Math.cos(ang) * largo, y1 = y0 + Math.sin(ang) * largo;
      g.lineWidth = ancho; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      if (nivel > 0) { rama(x1, y1, ang - 0.5, largo * 0.72, ancho * 0.68, nivel - 1); rama(x1, y1, ang + 0.45, largo * 0.7, ancho * 0.68, nivel - 1); }
      else hojas.push([x1, y1]);
    }
    rama(256, 470, -Math.PI / 2, 120, 30, 4);
    g.lineWidth = 12; [[-0.6, 70], [0.5, 80], [-0.2, 60], [0.15, 55]].forEach(function (r) { g.beginPath(); g.moveTo(256, 452); g.quadraticCurveTo(256 + r[1] * 0.5, 470, 256 + r[1] * Math.sin(r[0]) * 1.4, 500); g.stroke(); });
    return { tex: texDe(c), hojas: hojas };
  }
  function uvPlano(geo) {    // UVs de 0 a 1 según la caja (para pintar la cara de las formas planas)
    geo.computeBoundingBox(); var bb = geo.boundingBox, p = geo.attributes.position, uv = geo.attributes.uv;
    for (var i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
    uv.needsUpdate = true; return geo;
  }
  function esmalte(map, relieve) {   // esmalte con laca; con relieve, lo claro de la cara (la plata) queda apenas más alto
    return new THREE.MeshPhysicalMaterial({ map: map, bumpMap: relieve ? map : null, bumpScale: relieve || 1, metalness: 0.15, roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.06 });
  }
  var engarce = new THREE.MeshPhysicalMaterial({ color: 0x8E8E96, metalness: 1, roughness: 0.38, roughnessMap: ruido });   // el metal entre las piedras (queda en sombra)

  /* ═════════ Cristales ═════════
     Talla brillante simplificada (mesa octogonal, corona de 24 facetas y pabellón de 16) con un material de gema propio: al reflejo
     del estudio se le suma una refracción falsa (el rayo entra por la faceta y vuelve hacia la cámara) muestreada con un índice
     distinto para rojo, verde y azul. Cada faceta se ve clara u oscura según lo que "mira" del estudio (el brillo de la pavé) y en los
     bordes aparece el fuego de colores. No usa la pasada de transmisión de three (con 300 piedras costaba +9 ms por cuadro). Las de
     color toman el color de cada piedra (azules de la rígida, dorados de la flor). */
  var GEMA_FRAG = [
    '#if defined( ENVMAP_TYPE_CUBE_UV )',
    '{',
    '  vec3 gV = normalize(vViewPosition), gN = normalize(normal), gI = -gV;',
    '  float gNV = clamp(dot(gN, gV), 0.0, 1.0);',
    '  vec3 tR = refract(gI, gN, 1.0 / (uIor - uFuego)), tG = refract(gI, gN, 1.0 / uIor), tB = refract(gI, gN, 1.0 / (uIor + uFuego));',
    '  vec3 dR = dot(tR, tR) > 0.0 ? reflect(tR, gN) : reflect(gI, gN);',
    '  vec3 dG = dot(tG, tG) > 0.0 ? reflect(tG, gN) : reflect(gI, gN);',
    '  vec3 dB = dot(tB, tB) > 0.0 ? reflect(tB, gN) : reflect(gI, gN);',
    '  vec3 fuego = vec3(',
    '    textureCubeUV(envMap, envMapRotation * inverseTransformDirection(dR, viewMatrix), 0.0).r,',
    '    textureCubeUV(envMap, envMapRotation * inverseTransformDirection(dG, viewMatrix), 0.0).g,',
    '    textureCubeUV(envMap, envMapRotation * inverseTransformDirection(dB, viewMatrix), 0.0).b);',
    '  float gF = 0.13 + 0.87 * pow(1.0 - gNV, 5.0);',
    '  outgoingLight = outgoingLight * gF * 1.15 + (fuego * uBrillo + 0.07) * diffuseColor.rgb * (1.0 - gF) * envMapIntensity;',
    '}',
    '#endif'
  ].join('\n');
  function matGema(brillo) {
    var m = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.02, flatShading: true });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uIor = { value: 2.15 }; sh.uniforms.uFuego = { value: 0.075 }; sh.uniforms.uBrillo = { value: brillo };
      sh.fragmentShader = 'uniform float uIor;\nuniform float uFuego;\nuniform float uBrillo;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', GEMA_FRAG + '\n#include <opaque_fragment>');
    };
    m.customProgramCacheKey = function () { return 'pnt-gema'; };
    return m;
  }
  var gema = matGema(2.4);
  function geoBrillante() {   // radio 1 en la cintura; la corona asoma sobre la superficie y el pabellón queda adentro del metal
    var v = [], idx = [], add = function (x, y, z) { v.push(x, y, z); return v.length / 3 - 1; };
    var H = 0.32, RT = 0.56, PUNTA = -0.82, centro = add(0, 0, H), mesa = [], cint = [], i;
    for (i = 0; i < 8; i++) mesa.push(add(Math.cos(i / 8 * Math.PI * 2) * RT, Math.sin(i / 8 * Math.PI * 2) * RT, H));
    for (i = 0; i < 16; i++) cint.push(add(Math.cos((i + 0.5) / 16 * Math.PI * 2), Math.sin((i + 0.5) / 16 * Math.PI * 2), 0));
    var culet = add(0, 0, PUNTA);
    for (i = 0; i < 8; i++) {
      var m0 = mesa[i], m1 = mesa[(i + 1) % 8], c0 = cint[2 * i], c1 = cint[2 * i + 1], c2 = cint[(2 * i + 2) % 16];
      idx.push(centro, m0, m1, m0, c0, c1, m0, c1, m1, m1, c1, c2);
    }
    for (i = 0; i < 16; i++) idx.push(culet, cint[(i + 1) % 16], cint[i]);
    var g = new THREE.BufferGeometry(); g.setIndex(idx); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g = g.toNonIndexed(); g.translate(0, 0, 0.1); g.computeVertexNormals(); return g;
  }
  var GEMA = geoBrillante();
  function gemas(lista, colores) {   // lista: [x, y, z, radio, nx, ny, nz] en el marco del cierre
    var im = new THREE.InstancedMesh(GEMA, gema, lista.length), mm = new THREE.Matrix4(), qq = new THREE.Quaternion(), giro = new THREE.Quaternion(),
      zz = new THREE.Vector3(0, 0, 1), nn = new THREE.Vector3(), pp = new THREE.Vector3(), ss = new THREE.Vector3(), col = new THREE.Color();
    lista.forEach(function (q, i) {
      nn.set(q[4], q[5], q[6]).normalize(); qq.setFromUnitVectors(zz, nn); giro.setFromAxisAngle(zz, Math.random() * Math.PI); qq.multiply(giro);
      mm.compose(pp.set(q[0], q[1], q[2]), qq, ss.setScalar(q[3])); im.setMatrixAt(i, mm);
      if (colores) im.setColorAt(i, col.set(colores[i % colores.length]));
    });
    im.userData.esGema = true; return im;
  }
  var GRANO = new THREE.IcosahedronGeometry(1, 1);
  function granos(lista, mat) {     // granitos de plata: lista [x, y, z, radio]
    var im = new THREE.InstancedMesh(GRANO, mat || plata, lista.length), mm = new THREE.Matrix4(), pp = new THREE.Vector3(), qq = new THREE.Quaternion(), ss = new THREE.Vector3();
    lista.forEach(function (q, i) { mm.compose(pp.set(q[0], q[1], q[2]), qq, ss.setScalar(q[3])); im.setMatrixAt(i, mm); });
    return im;
  }
  var COPA = (function () { var g = new THREE.CylinderGeometry(1, 0.8, 0.6, 20, 1, true); g.rotateX(Math.PI / 2); return g; })();
  function copas(lista) {           // el engaste de cada piedra suelta (un aro de plata alrededor): lista como la de gemas
    var im = new THREE.InstancedMesh(COPA, plata, lista.length), mm = new THREE.Matrix4(), qq = new THREE.Quaternion(), zz = new THREE.Vector3(0, 0, 1), nn = new THREE.Vector3(), pp = new THREE.Vector3(), ss = new THREE.Vector3();
    lista.forEach(function (q, i) { nn.set(q[4], q[5], q[6]).normalize(); qq.setFromUnitVectors(zz, nn); mm.compose(pp.set(q[0], q[1], q[2]), qq, ss.set(q[3] * 1.2, q[3] * 1.2, q[3] * 0.55)); im.setMatrixAt(i, mm); });
    return im;
  }
  // Pavé: piedras en panal sobre una superficie (mapea(u, v) → { p, n }) y un granito de plata en cada hueco entre piedras vecinas
  function pave(centros, r, mapea, dentroUV) {
    var piedras = [], gr = [], vistos = {}, m;
    centros.forEach(function (q) {
      m = mapea(q[0], q[1]); var rr = r * (0.92 + Math.random() * 0.12), j = 0.11;   // cada piedra apenas inclinada distinto: no brillan todas a la vez
      piedras.push([m.p.x + m.n.x * r * 0.08, m.p.y + m.n.y * r * 0.08, m.p.z + m.n.z * r * 0.08, rr, m.n.x + (Math.random() - 0.5) * j, m.n.y + (Math.random() - 0.5) * j, m.n.z + (Math.random() - 0.5) * j]);
      for (var k = 0; k < 6; k++) {
        var a = (k + 0.5) / 6 * Math.PI * 2, u = q[0] + Math.cos(a) * r * 1.17, v = q[1] + Math.sin(a) * r * 1.17;
        var clave = Math.round(u / (r * 0.6)) + ',' + Math.round(v / (r * 0.6));
        if (vistos[clave] || (dentroUV && !dentroUV(u, v))) continue; vistos[clave] = 1;
        m = mapea(u, v); gr.push([m.p.x + m.n.x * r * 0.2, m.p.y + m.n.y * r * 0.2, m.p.z + m.n.z * r * 0.2, r * 0.3]);
      }
    });
    return { piedras: piedras, granos: gr };
  }
  function panal(x0, x1, y0, y1, r, ok) {   // centros de un panal (cada fila corrida medio paso) dentro de un rectángulo
    var l = [], dx = r * 2.14, dy = r * 1.86;
    for (var y = y0, f = 0; y <= y1 + 1e-9; y += dy, f++) for (var x = x0 + (f % 2) * dx / 2; x <= x1 + 1e-9; x += dx) if (!ok || ok(x, y)) l.push([x, y]);
    return l;
  }
  function anilloGemas(n, rr, r, z) { var l = []; for (var i = 0; i < n; i++) { var a = (i + 0.5) / n * Math.PI * 2; l.push([Math.cos(a) * rr, Math.sin(a) * rr, z, r, 0, 0, 1]); } return l; }
  function dentro(pts, x, y) { var c = false; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var a = pts[i], b = pts[j]; if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; }
  function distBorde(pts, x, y) {
    var d = 1e9;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = pts[i], b = pts[j], ex = b.x - a.x, ey = b.y - a.y, u = Math.max(0, Math.min(1, ((x - a.x) * ex + (y - a.y) * ey) / (ex * ex + ey * ey || 1)));
      d = Math.min(d, Math.hypot(a.x + ex * u - x, a.y + ey * u - y));
    }
    return d;
  }

  /* ═════════ Los siete cierres (en su marco: X = la cadena, Y = arriba, Z = la cara, que mira a la cámara) ═════════
     Comparados con las fotos de cada producto (herramientas/armador/referencias/). */
  function lathe(puntos, seg) { return new THREE.LatheGeometry(puntos.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), seg || 48); }
  var KF = 0.165 / 256;      // de píxel de la cara pintada (512) a unidades 3D, en los cierres redondos
  function disco(cara) {
    var gq = new THREE.Group();
    gq.add(new THREE.Mesh(lathe([[0, -0.1], [0.07, -0.096], [0.13, -0.085], [0.175, -0.065], [0.2, -0.035], [0.206, 0], [0.205, 0.025], [0.19, 0.06], [0.16, 0.075], [0, 0.075]], 72).rotateX(Math.PI / 2), plata));
    var f = new THREE.Mesh(new THREE.CircleGeometry(0.165, 72), esmalte(cara, 1.4)); f.position.z = 0.0765; gq.add(f);
    var bisel = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.011, 14, 72), plata); bisel.position.z = 0.075; gq.add(bisel);
    return gq;
  }
  function corazonForma(s) {
    var h = new THREE.Shape();
    h.moveTo(0, -0.13 * s);
    h.bezierCurveTo(-0.03 * s, -0.095 * s, -0.16 * s, -0.03 * s, -0.16 * s, 0.045 * s);
    h.bezierCurveTo(-0.16 * s, 0.115 * s, -0.09 * s, 0.155 * s, -0.045 * s, 0.145 * s);
    h.bezierCurveTo(-0.018 * s, 0.138 * s, 0, 0.118 * s, 0, 0.1 * s);
    h.bezierCurveTo(0, 0.118 * s, 0.018 * s, 0.138 * s, 0.045 * s, 0.145 * s);
    h.bezierCurveTo(0.09 * s, 0.155 * s, 0.16 * s, 0.115 * s, 0.16 * s, 0.045 * s);
    h.bezierCurveTo(0.16 * s, -0.03 * s, 0.03 * s, -0.095 * s, 0, -0.13 * s);
    return h;
  }
  function contorno(forma, n, dy) {   // puntos del contorno (sin repetir el primero al final), corridos dy
    var pts = forma.getSpacedPoints(n); if (pts.length > 1 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts.pop();
    return pts.map(function (p) { return new THREE.Vector2(p.x, p.y + (dy || 0)); });
  }
  function corazon(caraMat) {
    var gq = new THREE.Group();
    var geo = new THREE.ExtrudeGeometry(corazonForma(1.2), { depth: 0.09, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.022, bevelSegments: 8, curveSegments: 64 });
    geo.translate(0, -0.012, -0.045);
    gq.add(new THREE.Mesh(geo, plata));
    var caraGeo = uvPlano(new THREE.ShapeGeometry(corazonForma(1.06), 64));
    var cara = new THREE.Mesh(caraGeo, caraMat); cara.position.set(0, -0.012, 0.0745); gq.add(cara);
    gq.userData.bb = caraGeo.boundingBox;
    return gq;
  }
  // Cúpula sobre un contorno: anillos desde el centro hasta el borde, con alto √(1 − s²) (el corazón pavé es abombado)
  function polarDe(pts, cx, cy) {     // radio del contorno según el ángulo, para saber qué tan lejos del borde está un punto
    var l = pts.map(function (p) { return [Math.atan2(p.y - cy, p.x - cx), Math.hypot(p.x - cx, p.y - cy)]; }).sort(function (a, b) { return a[0] - b[0]; });
    return function (x, y) {
      var a = Math.atan2(y - cy, x - cx), i = 0; while (i < l.length && l[i][0] < a) i++;
      var p0 = l[(i - 1 + l.length) % l.length], p1 = l[i % l.length], a0 = p0[0], a1 = p1[0], aa = a;
      if (a1 < a0) a1 += Math.PI * 2; if (aa < a0) aa += Math.PI * 2;
      return p0[1] + (p1[1] - p0[1]) * (a1 - a0 > 1e-6 ? (aa - a0) / (a1 - a0) : 0);
    };
  }
  function cupula(pts, cx, cy, z0, alto, mat) {
    var NR = 18, NA = pts.length, pos = [], idx = [], i, j;
    for (j = 0; j <= NR; j++) {
      var s = j / NR, z = z0 + alto * Math.sqrt(Math.max(0, 1 - s * s));
      for (i = 0; i < NA; i++) pos.push(cx + (pts[i].x - cx) * s, cy + (pts[i].y - cy) * s, z);
    }
    var horario = THREE.ShapeUtils.isClockWise(pts);
    for (j = 0; j < NR; j++) for (i = 0; i < NA; i++) {
      var a = j * NA + i, b = j * NA + (i + 1) % NA, c = (j + 1) * NA + i, d = (j + 1) * NA + (i + 1) % NA;
      if (horario) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
    }
    var g = new THREE.BufferGeometry(); g.setIndex(idx); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }
  function corazonPave() {   // Heart: corazón abombado, todo cubierto de piedras con sus granitos de plata (como en la foto)
    var gq = new THREE.Group();
    var geo = new THREE.ExtrudeGeometry(corazonForma(1.2), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.022, bevelSegments: 8, curveSegments: 64 });
    geo.translate(0, -0.012, -0.05); gq.add(new THREE.Mesh(geo, plata));            // el cuerpo: su frente queda en z = 0,03
    var pts = contorno(corazonForma(1.13), 120, -0.012), cx = 0, cy = -0.006, Z0 = 0.03, A = 0.055, radio = polarDe(pts, cx, cy);
    gq.add(cupula(pts, cx, cy, Z0, A, engarce));
    function altura(x, y) { var s = Math.min(1, Math.hypot(x - cx, y - cy) / Math.max(1e-6, radio(x, y))); return Z0 + A * Math.sqrt(Math.max(0, 1 - s * s)); }
    function mapea(x, y) {
      var e = 0.0015, zx = (altura(x + e, y) - altura(x - e, y)) / (2 * e), zy = (altura(x, y + e) - altura(x, y - e)) / (2 * e);
      return { p: new THREE.Vector3(x, y, altura(x, y)), n: new THREE.Vector3(-zx, -zy, 1).normalize() };
    }
    var r = 0.0118;
    var centros = panal(-0.2, 0.2, -0.17, 0.2, r, function (x, y) { return dentro(pts, x, y) && distBorde(pts, x, y) > r * 0.95; });
    var pv = pave(centros, r, mapea, function (u, v) { return dentro(pts, u, v) && distBorde(pts, u, v) > r * 0.35; });
    gq.add(gemas(pv.piedras)); gq.add(granos(pv.granos));
    return gq;
  }
  function corazonArbol() {  // Árbol: corazón de esmalte negro con el árbol de plata en relieve, pocas hojas de cristal y el borde de granitos
    var ca = caraArbol(), gq = corazon(esmalte(ca.tex, 1.6)), bb = gq.userData.bb, pts = corazonForma(1.06).getPoints(90), l = [];
    var paso = Math.max(1, Math.floor(ca.hojas.length / 8));
    ca.hojas.forEach(function (h, i) {
      if (i % paso) return;
      var x = bb.min.x + h[0] / 512 * (bb.max.x - bb.min.x), y = bb.min.y + (1 - h[1] / 512) * (bb.max.y - bb.min.y);
      if (dentro(pts, x, y) && distBorde(pts, x, y) > 0.014) l.push([x, y - 0.012, 0.0745, 0.0115, 0, 0, 1]);
    });
    gq.add(gemas(l));
    gq.add(granos(contorno(corazonForma(1.0), 104, -0.012).map(function (p) { return [p.x, p.y, 0.077, 0.0042]; })));
    return gq;
  }
  function barril(map, largo, radio) {
    var gq = new THREE.Group(), l = largo / 2, r = radio;
    var geo = lathe([[0, -l], [r * 0.7, -l], [r * 0.9, -l + 0.015], [r, -l + 0.04], [r, l - 0.04], [r * 0.9, l - 0.015], [r * 0.7, l], [0, l]], 64).rotateZ(-Math.PI / 2);
    gq.add(new THREE.Mesh(geo, map ? new THREE.MeshPhysicalMaterial({ map: map, metalness: 0.55, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04 }) : plata));
    [-l + 0.035, l - 0.035].forEach(function (xx) { var a = new THREE.Mesh(new THREE.TorusGeometry(r + 0.004, 0.011, 14, 56), plata); a.rotation.y = Math.PI / 2; a.position.x = xx; gq.add(a); });
    return gq;
  }
  function cajaRedondeada(a, rc) {
    var s = new THREE.Shape();
    s.moveTo(-a + rc, -a); s.lineTo(a - rc, -a); s.quadraticCurveTo(a, -a, a, -a + rc); s.lineTo(a, a - rc); s.quadraticCurveTo(a, a, a - rc, a);
    s.lineTo(-a + rc, a); s.quadraticCurveTo(-a, a, -a, a - rc); s.lineTo(-a, -a + rc); s.quadraticCurveTo(-a, -a, -a + rc, -a);
    return s;
  }
  function barrilPave() {    // Crystal: como en la foto, una caja de cantos redondeados cubierta de pavé en sus cuatro caras
    var gq = new THREE.Group(), L = 0.34, a = 0.122, rc = 0.04, bev = 0.016;
    var geo = new THREE.ExtrudeGeometry(cajaRedondeada(a - bev, rc), { depth: L - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 10 });
    geo.translate(0, 0, -(L - 2 * bev) / 2); geo.rotateY(Math.PI / 2);           // la sección queda en Y-Z y el largo a lo largo de la cadena
    gq.add(new THREE.Mesh(geo, plata));
    var r = 0.0122, x0 = -L / 2 + 0.032, x1 = L / 2 - 0.032, w0 = -a + rc * 0.95, w1 = a - rc * 0.95, piedras = [], gr = [];
    var caras = [
      function (x, w) { return { p: new THREE.Vector3(x, w, a), n: new THREE.Vector3(0, 0, 1) }; },
      function (x, w) { return { p: new THREE.Vector3(x, a, -w), n: new THREE.Vector3(0, 1, 0) }; },
      function (x, w) { return { p: new THREE.Vector3(x, -w, -a), n: new THREE.Vector3(0, 0, -1) }; },
      function (x, w) { return { p: new THREE.Vector3(x, -a, w), n: new THREE.Vector3(0, -1, 0) }; }
    ];
    var centros = panal(x0, x1, w0, w1, r), enCara = function (u, v) { return u > x0 - r * 0.5 && u < x1 + r * 0.5 && v > w0 - r * 0.5 && v < w1 + r * 0.5; };
    caras.forEach(function (mapea) { var pv = pave(centros, r, mapea, enCara); piedras = piedras.concat(pv.piedras); gr = gr.concat(pv.granos); });
    gq.add(gemas(piedras)); gq.add(granos(gr));
    return gq;
  }
  function barrilRigida() {  // la rígida: barril de plata con piedras celestes, azules y blancas de distintos tamaños, cada una en su engaste
    var gq = barril(null, 0.32, 0.115), l = [], intentos = 0;
    while (l.length < 64 && intentos++ < 5000) {
      var r = 0.0105 + Math.random() * 0.0125, xx = -0.115 + r + Math.random() * (0.23 - 2 * r), a = Math.random() * Math.PI * 2, libre = true;
      for (var j = 0; j < l.length && libre; j++) { var da = Math.abs(l[j][8] - a); da = Math.min(da, Math.PI * 2 - da) * 0.115; if (Math.hypot(l[j][7] - xx, da) < (l[j][3] + r) * 1.22) libre = false; }
      if (libre) l.push([xx, Math.cos(a) * 0.113, Math.sin(a) * 0.113, r, 0, Math.cos(a), Math.sin(a), xx, a]);
    }
    gq.add(copas(l)); gq.add(gemas(l, [0xA6D8FF, 0x5EA9F2, 0xffffff, 0x3F84DC, 0xCBEAFF, 0x7EC2F7, 0xE6F6FF]));   // celestes, azules y blancas, como en la foto
    return gq;
  }
  // Rosa: pétalos gruesos y pulidos en espiral (cada uno corrido el ángulo de oro), que se abren hacia afuera y enrollan el borde;
  // más oscuros abajo (la sombra entre pétalos), como en la foto
  function petaloRosa(r0, crece, abre, h, a0, dA, rizo, panza) {
    // u: a lo largo del pétalo (gira y se aleja del centro: la espiral); v: de la base al borde (se abre y el borde se enrolla)
    var NU = 26, NV = 14, pos = [], col = [], idx = [], i, j;
    for (j = 0; j <= NV; j++) {
      var v = j / NV, lab = Math.max(0, (v - 0.66) / 0.34);
      for (i = 0; i <= NU; i++) {
        var u = i / NU, a = a0 + dA * u, lomo = Math.pow(Math.sin(u * Math.PI), 0.5);
        var r = r0 + crece * u + abre * v * v + (panza || 0) * lomo * v + rizo * lab * lab * lomo;   // la panza: el pétalo se abomba en el medio (borde festoneado)
        var z = h * (0.35 + 0.65 * lomo) * v - rizo * 0.9 * lab * lab * lab * lomo;
        pos.push(Math.cos(a) * r, Math.sin(a) * r, z);
        var ao = 0.22 + 0.78 * Math.pow(v, 0.7); col.push(ao, ao, ao);
      }
    }
    for (j = 0; j < NV; j++) for (i = 0; i < NU; i++) { var p0 = j * (NU + 1) + i, p1 = p0 + 1, p2 = p0 + NU + 1, p3 = p2 + 1; idx.push(p0, p1, p2, p1, p3, p2); }
    var g = new THREE.BufferGeometry(); g.setIndex(idx);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  function rosa() {          // Rosa: once pétalos gruesos y pulidos en espiral (cada uno corrido el ángulo de oro), con sombra entre pétalos
    var gq = new THREE.Group();
    var matR = new THREE.MeshPhysicalMaterial({ color: COLOR_PLATA, metalness: 1, roughness: 0.08, roughnessMap: ruido, vertexColors: true, side: THREE.DoubleSide });
    gq.add(new THREE.Mesh(lathe([[0, -0.1], [0.08, -0.096], [0.14, -0.083], [0.18, -0.06], [0.195, -0.03], [0.198, 0], [0.19, 0.012], [0, 0.012]], 64).rotateX(Math.PI / 2), plata));
    var N = 11;
    for (var k = 0; k < N; k++) {
      var f = k / (N - 1);
      gq.add(new THREE.Mesh(petaloRosa(0.008 + 0.1 * f, 0.02 + 0.024 * f, 0.008 + 0.026 * f, 0.135 - 0.068 * f, k * 2.39996, 2.6 + 0.8 * f, 0.012 + 0.02 * f, 0.004 + 0.02 * f), matR));
    }
    var boton = new THREE.Mesh(new THREE.SphereGeometry(0.016, 24, 16), plata); boton.position.z = 0.112; boton.scale.set(1, 1, 0.7); gq.add(boton);
    return gq;
  }
  var CIERRES = {
    flor: function () {
      var gq = disco(caraFlor());
      gq.add(gemas(anilloGemas(32, 214 * KF, 0.0094, 0.0765)));
      gq.add(gemas([[206, 226, 0.0135], [354, 318, 0.0095], [336, 142, 0.008]].map(function (c) { return [(c[0] - 256) * KF, (256 - c[1]) * KF, 0.0765, c[2], 0, 0, 1]; }), [0xF6D77A]));
      return gq;
    },
    circulos: function () {    // como en la foto: aros de pavé, esmalte negro y una piedra grande redonda en el centro, con cuatro garras
      var gq = disco(caraCirculos());
      gq.add(gemas(anilloGemas(34, 196 * KF, 0.0104, 0.0765).concat(anilloGemas(26, 128 * KF, 0.0088, 0.0765))));
      gq.add(gemas([[0, 0, 0.078, 0.048, 0, 0, 1]]));
      gq.add(granos([45, 135, 225, 315].map(function (g) { var a = g * Math.PI / 180; return [Math.cos(a) * 0.049, Math.sin(a) * 0.049, 0.09, 0.0085]; })));
      return gq;
    },
    corazon: corazonPave,
    arbol: corazonArbol,
    barril: barrilPave,
    rosa: rosa,
    rigida: barrilRigida
  };
  var MEDIO_ANCHO = { flor: 0.206, circulos: 0.206, corazon: 0.21, arbol: 0.21, barril: 0.17, rosa: 0.2, rigida: 0.16 };   // a lo largo de la cadena
  var cierres = {}, cierreObj = null;
  function cierreDe(tipo) {
    if (!cierres[tipo]) {
      var gq = capaSombra(CIERRES[tipo]()); gq.userData.esc = 0; gq.userData.tipo = tipo; gq.userData.hw = MEDIO_ANCHO[tipo];
      gq.userData.todasGemas = []; gq.traverse(function (o) { if (o.userData && o.userData.esGema) gq.userData.todasGemas.push(o); });
      gq.scale.setScalar(0.001); pulsera.add(gq); cierres[tipo] = gq;
    }
    return cierres[tipo];
  }
  var ESC_CIERRE = 1.3;

  /* Topes con rosca (los dos de la snake) y cuellos a los lados del cierre, como en las fotos. Perfiles en unidades del radio de
     la cadena (se escalan con RAD); el eje del torneado queda a lo largo de la cadena (X). */
  // la rosca: cuatro filetes anchos (a este tamaño se leen como en la foto; más finos parpadean)
  var perfilTope = [[0, -1.42], [1.02, -1.42], [1.2, -1.37], [1.3, -1.24]];
  for (var pi = 0; pi <= 48; pi++) { var yy = -1.1 + pi / 48 * 2.2, cresta = 0.5 + 0.5 * Math.cos((yy + 1.1) / 0.55 * Math.PI * 2); perfilTope.push([1.24 + 0.07 * cresta, yy]); }
  perfilTope.push([1.3, 1.24], [1.2, 1.37], [1.02, 1.42], [0, 1.42]);
  var geoTope = lathe(perfilTope, 40).rotateZ(-Math.PI / 2);
  var roscas = [0.25, 0.75].map(function (t) { var r = new THREE.Mesh(geoTope, plata); r.userData.t = t; r.layers.enable(CAPA_SOMBRA); pulsera.add(r); return r; });
  // cuello: liso del lado del cierre y con tres anillos en relieve del lado de la cadena, como en las fotos (el izquierdo va espejado)
  var perfilCuello = [[0, -1.6], [1.2, -1.6], [1.42, -1.54], [1.5, -1.4], [1.5, 0.12]];
  [0.32, 0.74, 1.16].forEach(function (y0) { perfilCuello.push([1.5, y0 - 0.11], [1.39, y0 - 0.04], [1.39, y0 + 0.04], [1.5, y0 + 0.11]); });
  perfilCuello.push([1.5, 1.42], [1.42, 1.54], [1.2, 1.6], [0, 1.6]);
  var geoCuello = lathe(perfilCuello, 40).rotateZ(-Math.PI / 2);
  var cuellos = [0, 1].map(function (i) { var g = new THREE.Group(), m = new THREE.Mesh(geoCuello, plata); if (!i) m.rotation.z = Math.PI; m.layers.enable(CAPA_SOMBRA); g.add(m); pulsera.add(g); return g; });
  var roscaEsc = 1, roscaObj = 1, cuelloEsc = 1, hwAct = 0.206;

  function ubicaPiezas(dt) {
    var ap = intro < 1 ? Math.max(0, (intro - 0.75) / 0.25) : 1; ap = ap * (1 + Math.sin(ap * Math.PI) * 0.35);
    Object.keys(cierres).forEach(function (k) {
      var gq = cierres[k], obj = gq === cierreObj ? 1 : 0;
      gq.userData.esc += (obj - gq.userData.esc) * Math.min(1, dt * (obj ? 5.5 : 12));
      var e = gq.userData.esc, s = obj ? e * (1 + Math.sin(e * Math.PI) * 0.08) : e;
      gq.visible = e > 0.004; gq.scale.setScalar(Math.max(0.001, s * ap * ESC_CIERRE));
      if (gq.visible) { orientaCierre(gq, 0.0005); var vuelta = (1 - e) * (1 - e); if (vuelta > 0.0001) gq.rotateY((obj ? 1 : -1) * vuelta * Math.PI * 1.25); }
    });
    roscaEsc += (roscaObj - roscaEsc) * Math.min(1, dt * 6);
    roscas.forEach(function (r) { orienta(r, r.userData.t); r.scale.setScalar(Math.max(0.0001, roscaEsc * ap * RAD)); r.visible = roscaEsc > 0.01; });
    var hwObj = cierreObj ? cierreObj.userData.hw : 0.206, cObj = cierreObj && cierreObj.userData.tipo !== 'rigida' ? 1 : 0;
    hwAct += (hwObj - hwAct) * Math.min(1, dt * 6); cuelloEsc += (cObj - cuelloEsc) * Math.min(1, dt * 7);
    var d = (hwAct * ESC_CIERRE + 1.5 * RAD) / (2 * Math.PI * R);
    cuellos.forEach(function (cu, i) { orienta(cu, 0.0005 + (i ? d : -d)); cu.scale.setScalar(Math.max(0.0001, cuelloEsc * ap * RAD)); cu.visible = cuelloEsc * ap > 0.01; });
  }

  /* ═════════ Destellos ═════════
     Pocos, blancos, de 4 puntas (una estrella fina, como el brillo de una foto de joyería) y solo donde la luz pega de verdad: en
     cada cuadro se prueban algunas facetas de los cristales del cierre y aparece un destello cuando el reflejo de la cámara apunta a
     una luz del estudio; cada tanto, también en un filo de la cadena. Sin confeti ni puntitos sueltos. */
  function texEstrella() {
    var n = 128, c = document.createElement('canvas'); c.width = c.height = n; var g = c.getContext('2d');
    var rg = g.createRadialGradient(64, 64, 0, 64, 64, 26); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(255,255,255,.5)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, n, n);
    function rayo(ang, largo, ancho, alfa) {
      g.save(); g.translate(64, 64); g.rotate(ang);
      var lg = g.createLinearGradient(-largo, 0, largo, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,' + alfa + ')'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(-largo, 0); g.lineTo(0, -ancho); g.lineTo(largo, 0); g.lineTo(0, ancho); g.closePath(); g.fill(); g.restore();
    }
    rayo(0, 64, 3, 1); rayo(Math.PI / 2, 64, 3, 1); rayo(Math.PI / 4, 30, 1.5, 0.5); rayo(-Math.PI / 4, 30, 1.5, 0.5);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  var estrella = texEstrella(), brillos = [], proxB = 0, wp = new THREE.Vector3();
  for (var bi = 0; bi < 24; bi++) {
    var spB = new THREE.Sprite(new THREE.SpriteMaterial({ map: estrella, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }));
    spB.visible = false; spB.renderOrder = 5; scene.add(spB); brillos.push({ sp: spB, vida: 0, dur: 0.5, tam: 0.1, giro: 0 });
  }
  var cuentaBrillos = 0;
  function brilla(pos, tam, dur) {
    cuentaBrillos++;
    var c = brillos[proxB++ % brillos.length];
    c.sp.position.copy(pos); c.sp.visible = true; c.vida = 1; c.dur = dur || (0.45 + Math.random() * 0.3); c.tam = tam; c.giro = (Math.random() - 0.5) * 0.5;
    c.sp.material.rotation = (Math.random() - 0.5) * 0.25;
  }
  function destello(pos, cant) {   // al llegar un charm, al cambiar la base o al festejar: unos pocos destellos alrededor, de a uno
    var n = Math.max(1, Math.min(5, Math.round((cant || 9) / 9))), base = pos.clone();
    for (var i = 0; i < n; i++) (function (i) {
      setTimeout(function () { brilla(wp.set((Math.random() - 0.5) * 0.24, (Math.random() - 0.3) * 0.2, (Math.random() - 0.5) * 0.12).add(base).clone(), 0.08 + Math.random() * 0.08); }, i * 90);
    })(i);
  }
  var gM = new THREE.Matrix4(), gP = new THREE.Vector3(), gQ = new THREE.Quaternion(), gS = new THREE.Vector3(), gN = new THREE.Vector3(), gV = new THREE.Vector3(),
    gR = new THREE.Vector3(), gL1 = new THREE.Vector3(), gL2 = new THREE.Vector3(0.1, 1, 0.2).normalize(), gH = new THREE.Vector3(), gT = new THREE.Vector3();
  var esperaG = 0.6, esperaC = 1.4;
  function brillosVivos() { var n = 0; for (var i = 0; i < brillos.length; i++) if (brillos[i].vida > 0) n++; return n; }
  function buscaBrillos(dt) {
    if (intro < 1) return;
    esperaG -= dt; esperaC -= dt;
    if (brillosVivos() >= 4) return;
    gL1.copy(clave.position).normalize();
    var lista = cierreObj && cierreObj.visible && cierreObj.userData.esc > 0.9 ? cierreObj.userData.todasGemas : null;
    if (esperaG <= 0 && lista && lista.length) {
      for (var n = 0; n < 14; n++) {
        var im = lista[(Math.random() * lista.length) | 0], i = (Math.random() * im.count) | 0;
        im.getMatrixAt(i, gM); gM.premultiply(im.matrixWorld); gM.decompose(gP, gQ, gS);
        gN.set((Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.1, 1).normalize().applyQuaternion(gQ);   // una faceta de la corona
        gV.subVectors(camera.position, gP).normalize();
        if (gN.dot(gV) < 0.15) continue;
        gR.copy(gV).negate().reflect(gN);
        var al = Math.max(gR.dot(gL1), gR.dot(gL2));
        if (al > 0.965) { brilla(gP.addScaledVector(gV, 0.03).clone(), 0.04 + gS.x * 3, 0.3 + Math.random() * 0.3); esperaG = 0.06 + Math.random() * 0.28; break; }
      }
    }
    if (esperaC <= 0) {     // de vez en cuando, un filo de la cadena (donde su curva refleja la luz de arriba hacia la cámara)
      esperaC = 0.9 + Math.random() * 1.6;
      var t = 0.5 + (Math.random() - 0.5) * 0.42; camino(t, gP); pulsera.localToWorld(gP);
      camino(t + 0.002, gT); pulsera.localToWorld(gT); gT.sub(gP).normalize();
      gV.subVectors(camera.position, gP).normalize(); gH.addVectors(gV, gL1).normalize();
      gH.addScaledVector(gT, -gH.dot(gT));
      if (gH.length() > 0.85) { gH.normalize(); brilla(gP.addScaledVector(gH, RAD).addScaledVector(gV, 0.03).clone(), 0.07, 0.42); }
    }
  }
  function animaBrillos(dt) {
    for (var i = 0; i < brillos.length; i++) {
      var c = brillos[i]; if (c.vida <= 0) continue;
      c.vida -= dt / c.dur;
      var f = c.vida > 0 ? Math.min(1, (1 - c.vida) * 5) * Math.pow(Math.max(0, c.vida), 0.7) : 0;   // sube rápido y se apaga despacio
      c.sp.material.opacity = f; c.sp.scale.setScalar(c.tam * (0.35 + 0.65 * f)); c.sp.material.rotation += c.giro * dt;
      if (c.vida <= 0) c.sp.visible = false;
    }
  }

  /* ═════════ Charms con volumen ═════════
     Cada charm es una pieza extruida desde el contorno de su foto (arma/contornos.js, lo calcula herramientas/armador/recorte.py):
     la foto adelante (y espejada atrás) y un canto de plata biselado alrededor. Su material deja la foto tal cual y le suma los
     reflejos del estudio según su mapa de relieve, más en la plata que en el esmalte: al girar la pulsera, el brillo recorre el
     charm. La foto en alta y el relieve se piden recién cuando el charm entra a la pulsera (mientras tanto, la de la tarjeta) y se
     liberan cuando sale. La cadena pasa a la altura del agujero real (cuentas por el agujero que muestra su foto, colgantes por su
     aro); cuelgan con la gravedad y giran con la pulsera. Si falta el contorno, el charm se arma como antes: capas apiladas. */
  var TEX = {}, cargaImg = new THREE.ImageLoader();
  // ya = hace falta ahora (el charm está entrando a la pulsera): la foto se mide apenas llega. Sin ya (las fotos de las tarjetas,
  // que se adelantan), la medida espera su turno en una fila lenta (2026-11-12: medir todas juntas al cargar eran ~115 ms trabados).
  function textura(k, ya) {
    var tx = TEX[k];
    if (!tx) {
      var sil = new THREE.CanvasTexture(document.createElement('canvas')), foto = new THREE.Texture();
      foto.colorSpace = sil.colorSpace = THREE.SRGBColorSpace; foto.anisotropy = sil.anisotropy = ANISO;
      tx = TEX[k] = { foto: foto, sil: sil, ya: !!ya, im: null, medido: false, lista: null };
      tx.lista = new Promise(function (ok) {
        (function pide(intento) {
          var url = CH[k].img + (intento ? (CH[k].img.indexOf('?') < 0 ? '?' : '&') + 'r=' + intento : '');
          cargaImg.load(url, function (im) {
            foto.image = im; foto.needsUpdate = true; tx.im = im;
            if (!CONT[k]) {     // la silueta gris solo la usan los charms sin contorno (capas apiladas)
              var c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
              var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, c.height);
              gr.addColorStop(0, '#d9d9de'); gr.addColorStop(0.5, '#a9a9b0'); gr.addColorStop(1, '#7e7e86');
              g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-in'; g.drawImage(im, 0, 0);
              sil.image = c; sil.needsUpdate = true;
            }
            if (tx.ya) { mideAgujero(k, im); tx.medido = true; } else mideLuego(k);
            ok();
          }, undefined, function () { if (intento < 5) setTimeout(function () { pide(intento + 1); }, 600 * (intento + 1)); else ok(); });
        })(0);
      });
    } else if (ya && !tx.medido) {
      tx.ya = true;
      if (tx.im) { mideAgujero(k, tx.im); tx.medido = true; }
    }
    return tx;
  }
  // La fila lenta: una foto por vez, ya decodificada (fuera del hilo de la página) y con la página quieta
  var porMedir = [], midiendo = false;
  function mideLuego(k) { porMedir.push(k); if (!midiendo) { midiendo = true; sigueMidiendo(); } }
  function sigueMidiendo() {
    var k = porMedir.shift();
    if (k === undefined) { midiendo = false; return; }
    var tx = TEX[k];
    if (!tx || tx.medido || !tx.im) { sigueMidiendo(); return; }
    var deco = tx.im.decode ? tx.im.decode().catch(function () {}) : Promise.resolve();
    deco.then(function () { return calma(4000); }).then(function () { return respiro(false); }).then(function () {
      if (!tx.medido) { mideAgujero(k, tx.im); tx.medido = true; }
      setTimeout(sigueMidiendo, 40);
    });
  }
  // En la fila del agujero (ag) de la foto: dónde empieza y termina la pieza (el aro de los colgantes, el cuerpo de las cuentas).
  // Con eso la pieza se centra en la cadena (el aro no siempre está en el medio de la foto) y el hueco de la cadena coincide con ella.
  // (un solo lienzo, de lectura rápida: con uno acelerado por la placa de video, cada getImageData frenaba la página ~40 ms)
  var lienzoMide = null;
  function mideAgujero(k, im) {
    try {
      var h = Math.min(256, im.height), w = Math.max(1, Math.round(im.width * h / im.height));
      var cc = lienzoMide || (lienzoMide = document.createElement('canvas')); cc.width = w; cc.height = h;
      var gg = cc.getContext('2d', { willReadFrequently: true }); gg.drawImage(im, 0, 0, w, h);
      var y = Math.min(h - 1, Math.max(0, Math.round(CH[k].ag * h))), fila = gg.getImageData(0, y, w, 1).data, tramos = [], en = false, x0 = 0;
      for (var x = 0; x <= w; x++) { var a = x < w ? fila[x * 4 + 3] : 0; if (a > 128 && !en) { en = true; x0 = x; } else if (a <= 128 && en) { en = false; tramos.push([x0, x - 1]); } }
      var mejor = null, dist = 1e9;
      tramos.forEach(function (t) { var d = Math.abs((t[0] + t[1]) / 2 - w / 2) - (t[1] - t[0]) / 2; if (d < dist) { dist = d; mejor = t; } });
      if (mejor) { TEX[k].cx = (mejor[0] + mejor[1] + 1) / 2 / w; TEX[k].aw = (mejor[1] - mejor[0] + 1) / w; }
      // Las cuentas: las fotos de la tienda son de tres cuartos y el agujero se ve como una mancha muy oscura que entra desde un
      // borde (medido: los agujeros tienen luminancia media 4–28; el contorno y los huecos de una pavé, 43–74). Ahí entra la cadena.
      if (mejor) {     // (también en los colgantes: el agujero de su aro)
        var fil = Math.max(1, Math.round(h * 0.015)), ya = Math.max(0, y - fil), yb = Math.min(h - 1, y + fil), nF = yb - ya + 1;
        var bloque = gg.getImageData(0, ya, w, nF).data, lum = new Float32Array(w), alf = new Float32Array(w);
        for (var fy = 0; fy < nF; fy++) for (var fx = 0; fx < w; fx++) { var o = (fy * w + fx) * 4; lum[fx] += (bloque[o] * 0.299 + bloque[o + 1] * 0.587 + bloque[o + 2] * 0.114) / nF; alf[fx] += bloque[o + 3] / nF; }
        var bx0 = mejor[0], bx1 = mejor[1], an = bx1 - bx0 + 1, hueco = null, colg = CH[k].tipo !== 'c';
        // colgantes: su fila (ag) es el centro del agujero del aro, que adentro es gris oscuro y puede estar más lejos del borde
        var hasta = colg ? 0.6 : 0.3, umbral = colg ? 95 : 78, media = colg ? 75 : 40, puntaje = -1;
        [[bx0, 1], [bx1, -1]].some(function (lado) {          // desde cada borde hacia adentro, hasta el 30 % del ancho (60 % en los aros)
          var A = -1, B = -1, suma = 0, fin = lado[0] + lado[1] * Math.round(an * hasta);
          for (var x = lado[0]; lado[1] > 0 ? x <= fin : x >= fin; x += lado[1]) {
            var osc = alf[x] > 128 && lum[x] < umbral;
            if (osc) { if (A < 0) { A = x; suma = 0; } B = x; suma += lum[x]; }
            if ((!osc || x === fin) && A >= 0) {
              var nn = Math.abs(B - A) + 1;
              if (nn >= an * 0.03 && suma / nn < media) {
                var cand = { lado: lado[1], c: (Math.min(A, B) + Math.max(A, B) + 1) / 2 / w, a: nn / w };
                if (!colg) { hueco = cand; return true; }          // cuentas: el primero desde el borde (como siempre)
                var pj = nn * (media - suma / nn);                  // aros: la mancha más grande y oscura (no un grabado o una garra)
                if (pj > puntaje) { puntaje = pj; hueco = cand; }
              }
              A = -1;
            }
          }
          return false;
        });
        if (hueco) {
          // el alto del agujero: por la columna de su centro, hacia arriba y hacia abajo mientras siga oscuro (tolera 2 px claros:
          // el brillo de la pared de adentro). Con eso se recorta un óvalo como el de la foto.
          var hx = Math.min(w - 1, Math.max(0, Math.round(hueco.c * w))), col = gg.getImageData(hx, 0, 1, h).data;
          var oscuroEn = function (yy) { var o = yy * 4; return col[o + 3] > 128 && (col[o] * 0.299 + col[o + 1] * 0.587 + col[o + 2] * 0.114) < umbral + 25; };
          var arriba = y, abajo = y, falla = 0, yy;
          for (yy = y - 1; yy >= 0 && falla < 3; yy--) { if (oscuroEn(yy)) { arriba = yy; falla = 0; } else falla++; }
          for (falla = 0, yy = y + 1; yy < h && falla < 3; yy++) { if (oscuroEn(yy)) { abajo = yy; falla = 0; } else falla++; }
          var rxPx = hueco.a * w / 2, ryPx = Math.max(rxPx * 0.6, Math.min(rxPx * 3, (abajo - arriba + 1) / 2));
          hueco.cy = (arriba + abajo + 1) / 2 / h; hueco.ry = ryPx / h; hueco.rx = rxPx / w;
        }
        // a mano (armar.tpl): 'no' = sin agujero a la vista (lo que se encontró era un grabado o una sombra); 'cx,cy,rx,ry' = este;
        // 'cx,cy,rx,ry,lado' = este, y de qué lado le entra la cadena (1: por la izquierda de la foto; -1: por la derecha). Es el lado
        // del aro que se ve de frente: ese borde queda detrás de la cadena y el otro la tapa. Sin lado: el más cercano al agujero.
        var fijo = String(CH[k].hueco || '');
        if (fijo === 'no') hueco = null;
        else if (fijo) {
          var q = fijo.split(',').map(Number);
          if (q.length >= 4 && q.slice(0, 4).every(isFinite)) hueco = { lado: q[4] ? (q[4] > 0 ? 1 : -1) : (q[0] < 0.5 ? 1 : -1), c: q[0], a: q[2] * 2, cy: q[1], rx: q[2], ry: q[3] };
        }
        if (hueco && fijo) {      // a mano: un aro con el interior transparente son dos tramos en esa fila (uno a cada lado del agujero): la pieza va de uno al otro
          var hx0 = (hueco.c - hueco.rx) * w - w * 0.12, hx1 = (hueco.c + hueco.rx) * w + w * 0.12, u0 = 1e9, u1 = -1;
          tramos.forEach(function (t) { if (t[1] >= hx0 && t[0] <= hx1) { u0 = Math.min(u0, t[0]); u1 = Math.max(u1, t[1]); } });
          if (u1 >= 0) { bx0 = u0; bx1 = u1; TEX[k].cx = (bx0 + bx1 + 1) / 2 / w; TEX[k].aw = (bx1 - bx0 + 1) / w; }
        }
        TEX[k].hueco = hueco; TEX[k].lejos = hueco ? (hueco.lado > 0 ? (bx1 + 1) / w : bx0 / w) : null;
      }
    } catch (e) {}
  }
  // Se adelantan solo las fotos de las tarjetas que ya bajaron (armar3d.js avisa con api.precarga cuando baja otra); un charm que
  // entra a la pulsera sin eso la pide al armarse. Antes se pedían las 27 de entrada.
  Array.prototype.forEach.call(X.raiz.querySelectorAll('.card[data-k] .card-f img[src]'), function (im) {
    var k = im.closest('.card').dataset.k; if (CH[k]) textura(k);
  });

  var CONT = window.PNT_A3_CONTORNOS || {}, HD = {}, cargaTex = new THREE.TextureLoader();
  function texturaHD(k) {      // foto en alta + relieve, compartidos y contados: se liberan cuando ningún charm los usa
    var c = CH[k]; if (!c.hd) return null;
    if (!HD[k]) {
      var h = HD[k] = { usos: 0, foto: null, normal: null, lista: null };
      // (la foto se decodifica fuera del hilo de la página antes de avisar: así subirla a la placa no la decodifica de golpe)
      var deco = function (t) { var im = t.image; return im && im.decode ? im.decode().catch(function () {}) : Promise.resolve(); };
      var pf = new Promise(function (ok) {
        cargaTex.load(c.hd, function (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; deco(t).then(function () { if (HD[k] === h) { h.foto = t; avisaHD(k); } else t.dispose(); ok(); }); }, undefined, function () { ok(); });
      });
      var pn = !c.hdn ? Promise.resolve() : new Promise(function (ok) {
        cargaTex.load(c.hdn, function (t) { t.anisotropy = ANISO; deco(t).then(function () { if (HD[k] === h) { h.normal = t; avisaHD(k); } else t.dispose(); ok(); }); }, undefined, function () { ok(); });
      });
      h.lista = Promise.all([pf, pn]);
    }
    HD[k].usos++; return HD[k];
  }
  /* Los charms de entrada quedan listos ANTES de mostrar nada (2026-11-12): la foto de la tarjeta ya medida, la foto en alta y su
     relieve ya subidos a la placa y la pieza ya extruida. Así, cuando caen en la intro (o aparecen puestos, si se vio el póster),
     no hay nada que cargar ni que trabe. La referencia de más a sus fotos en alta se suelta después de arrancar (sueltaCalentados). */
  var geoLista = {}, calentados = [];
  function precalienta(k) {
    var c = CH[k]; if (!c) return Promise.resolve();
    var tx = textura(k, true), h = texturaHD(k);
    if (h) calentados.push(k);
    return Promise.all([tx.lista, h ? h.lista : null]).then(function () { return respiro(urge()); }).then(function () {
      if (!geoLista[k] && !charms[k]) { var g = geoCharm(c, c.alto * c.asp, c.alto); if (g) geoLista[k] = g; }
      return subeTexturas([tx.foto].concat(h ? [h.foto, h.normal] : []).filter(function (t) { return t && t.image; }));
    });
  }
  function sueltaCalentados() {
    calentados.splice(0).forEach(sueltaHD);
    Object.keys(geoLista).forEach(function (k) { geoLista[k].dispose(); delete geoLista[k]; });
  }
  function avisaHD(k) { var ch = charms[k]; if (ch && ch.matFoto) ponHD(ch); }
  function ponHD(ch) {
    var h = HD[ch.k], m = ch.matFoto; if (!h || !m) return;
    if (h.foto && m.map !== h.foto) { m.map = h.foto; m.needsUpdate = true; if (ch.matCanto) { ch.matCanto.map = h.foto; ch.matCanto.needsUpdate = true; } }
    if (h.normal && m.normalMap !== h.normal) { m.normalMap = h.normal; m.normalScale.set(1, 1); m.needsUpdate = true; }
  }
  function sueltaHD(k) { var h = HD[k]; if (!h) return; if (--h.usos <= 0) { if (h.foto) h.foto.dispose(); if (h.normal) h.normal.dispose(); delete HD[k]; } }
  // la foto, intacta, más los reflejos del estudio (con metalness 1 los reflejos toman el color de la foto: la plata clara refleja,
  // los grabados oscuros no). Menos reflejo donde hay color (esmalte)
  var FOTO_FRAG = [
    '{',
    '  vec3 foto = diffuseColor.rgb;',
    '  float fMx = max(foto.r, max(foto.g, foto.b)), fMn = min(foto.r, min(foto.g, foto.b));',
    '  float plataF = 1.0 - smoothstep(0.16, 0.45, (fMx - fMn) / max(fMx, 1e-3));',
    '  outgoingLight = foto * uBaseFoto + max(totalSpecular - uVelo, vec3(0.0)) * uBrilloFoto * mix(0.3, 1.0, plataF);',   // solo los brillos fuertes: sin velo sobre la foto
    '  if (uBarrido > -0.5) {',                                                    // al llegar a la pulsera, una franja de luz lo recorre en diagonal
    '    float bnd = exp(-pow((vMapUv.x * 0.7 + (1.0 - vMapUv.y) * 0.6 - uBarrido * 1.7 + 0.25) * 7.0, 2.0));',
    '    outgoingLight += vec3(bnd * 0.6 * mix(0.35, 1.0, plataF));',
    '  }',
    '}'
  ].join('\n');
  var FOTO_U = { uBaseFoto: { value: 0.97 }, uBrilloFoto: { value: 0.55 }, uVelo: { value: 0.2 } };   // compartidos por todos los charms
  function matFotoDe(tex) {
    // sin tone mapping: la foto sale exacta, como en la tienda (los brillos que se suman se recortan en blanco)
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 1, roughness: 0.2, alphaTest: 0.5, alphaToCoverage: true, toneMapped: false });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uBaseFoto = FOTO_U.uBaseFoto; sh.uniforms.uBrilloFoto = FOTO_U.uBrilloFoto; sh.uniforms.uVelo = FOTO_U.uVelo; sh.uniforms.uBarrido = m.userData.barrido;
      sh.uniforms.uHueco = m.userData.hueco;
      sh.fragmentShader = 'uniform float uBaseFoto;\nuniform float uBrilloFoto;\nuniform float uVelo;\nuniform float uBarrido;\nuniform vec4 uHueco;\n' + sh.fragmentShader
        // el agujero de la foto queda abierto (con borde suave): por ahí se ve la cadena que pasa por adentro de la pieza
        .replace('#include <map_fragment>', '#include <map_fragment>\nif (uHueco.z > 0.0) { vec2 dH = (vMapUv - uHueco.xy) / uHueco.zw; diffuseColor.a *= smoothstep(0.78, 1.0, dot(dH, dH)); }')
        .replace('#include <opaque_fragment>', FOTO_FRAG + '\n#include <opaque_fragment>');
    };
    m.userData.barrido = { value: -1 };
    m.userData.hueco = { value: new THREE.Vector4(0, 0, 0, 0) };
    m.customProgramCacheKey = function () { return 'pnt-foto'; };
    return m;
  }
  /* El canto (el costado de la pieza): toma el color de la foto en ese punto (rosa en las orejas de Stitch, oscuro donde la pieza
     es oscura), apenas en sombra, con reflejos de metal. El color sale de un promedio de la foto alrededor del borde, pesado por su
     transparencia: así no se mezcla con el fondo. Antes era una banda gris clara igual para todos (parecía un sticker recortado). */
  var CANTO_FRAG = [
    '#ifdef USE_MAP',
    '  vec3 cAcc = vec3(0.0); float cW = 0.0;',
    '  for (int i = 0; i < 9; i++) {',
    '    vec4 s = texture2D(map, vMapUv + vec2(float(i - (i / 3) * 3) - 1.0, float(i / 3) - 1.0) * uTap);',
    '    cAcc += s.rgb * s.a; cW += s.a;',
    '  }',
    '  diffuseColor.rgb *= (cW > 0.05 ? cAcc / cW : vec3(0.7)) * uOscuro;',
    '#endif'
  ].join('\n');
  function cantoDe(tex, ancho, alto) {
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.15 });
    m.userData.tap = { value: new THREE.Vector2(0.018 / Math.max(ancho || 0.3, 0.05), 0.018 / Math.max(alto || 0.5, 0.05)) };
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uTap = m.userData.tap; sh.uniforms.uOscuro = { value: 0.82 };
      sh.fragmentShader = 'uniform vec2 uTap;\nuniform float uOscuro;\n' + sh.fragmentShader.replace('#include <map_fragment>', CANTO_FRAG);
    };
    m.customProgramCacheKey = function () { return 'pnt-canto'; };
    return m;
  }
  // Chaikin: el contorno pasa de polígono a curva (de cerca se veían las facetas del borde)
  function suaviza(pts, n) {
    for (var it = 0; it < n; it++) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        out.push(new THREE.Vector2(a.x * 0.75 + b.x * 0.25, a.y * 0.75 + b.y * 0.25), new THREE.Vector2(a.x * 0.25 + b.x * 0.75, a.y * 0.25 + b.y * 0.75));
      }
      pts = out;
    }
    return pts;
  }
  // normales suaves en el costado (el canto se ve redondeado, no en facetas); las caras con la foto quedan planas
  function suavizaCanto(g) {
    var gr = g.groups[1]; if (!gr) return;
    var pos = g.attributes.position, nor = g.attributes.normal, acc = {}, i, k, a;
    function clave(j) { return Math.round(pos.getX(j) * 2e4) + ',' + Math.round(pos.getY(j) * 2e4) + ',' + Math.round(pos.getZ(j) * 2e4); }
    for (i = gr.start; i < gr.start + gr.count; i++) { k = clave(i); a = acc[k] || (acc[k] = [0, 0, 0]); a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i); }
    for (i = gr.start; i < gr.start + gr.count; i++) { a = acc[clave(i)]; var l = Math.hypot(a[0], a[1], a[2]) || 1; nor.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    nor.needsUpdate = true;
  }
  function geoCharm(c, ancho, alto) {   // la pieza: el contorno extruido, con la foto en sus caras y el canto biselado
    var arr = CONT[c.k]; if (!arr || arr.length < 6) return null;
    var pts = [];
    for (var i = 0; i < arr.length; i += 2) pts.push(new THREE.Vector2((arr[i] - 0.5) * ancho, (c.ag - arr[i + 1]) * alto));
    pts = suaviza(pts, 2);
    if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
    // las cuentas, gruesas: la cadena (radio 0,062) pasa entera por adentro
    var grosor = c.tipo === 'c' ? 0.14 : 0.06, bev = grosor * 0.3, cuerpo = Math.max(0.002, grosor - 2 * bev);
    function uvDe(v, j) { return new THREE.Vector2(v[j * 3] / ancho + 0.5, 1 - c.ag + v[j * 3 + 1] / alto); }
    var uv = {
      generateTopUV: function (g, v, a, b, d) { return [uvDe(v, a), uvDe(v, b), uvDe(v, d)]; },
      generateSideWallUV: function (g, v, a, b, d, e) { return [uvDe(v, a), uvDe(v, b), uvDe(v, d), uvDe(v, e)]; }   // el costado mira la foto en su borde
    };
    var g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: cuerpo, bevelEnabled: true, bevelThickness: bev, bevelSize: Math.min(0.009, ancho * 0.022), bevelSegments: 4, curveSegments: 1, UVGenerator: uv });
    suavizaCanto(g);
    g.translate(0, 0, -cuerpo / 2);
    return g;
  }

  var charms = {}, vivos = [];
  function crearCharm(k) {
    var c = CH[k], tx = textura(k, true), tex = tx.foto;
    var piv = new THREE.Group(); scene.add(piv);
    var col = new THREE.Group(); piv.add(col);
    var ch = { k: k, piv: piv, col: col, dy: 0, t: 0.5, tObj: 0.5, tv: 0, th: 0, om: 0, ph: 0, ov: 0, tope: 0.8, lupa: 0, barrido: -1, giro: 0, vol: null, sale: null, pre: new THREE.Vector3(), velX: 0, esc: 0.001, semilla: Math.random() * 10, malla: null, cuenta: c.tipo === 'c', alza: 0, hov: 0, golpe: 0 };
    var alto = c.alto, ancho = alto * c.asp; ch.ancho = ancho; ch.listo = true;
    var geoV = geoLista[k] || geoCharm(c, ancho, alto); delete geoLista[k];
    if (geoV) {                     // con volumen
      ch.geo = geoV; ch.dx = 0; ch.extruida = true;
      charms[k] = ch;               // (antes de pedir la foto en alta: si ya estaba cargada, se aplica enseguida)
      ch.matFoto = matFotoDe(tex); ch.matCanto = cantoDe(tex, ancho, alto);
      var malla = new THREE.Mesh(geoV, [ch.matFoto, ch.matCanto]);
      malla.userData.ch = ch; malla.renderOrder = 2; malla.layers.enable(CAPA_SOMBRA); col.add(malla); ch.malla = malla;
      centraCharm(ch);
      if (texturaHD(k)) ponHD(ch);
      vivos.push(ch); return ch;
    }
    var geo = new THREE.PlaneGeometry(ancho, alto); geo.translate(0, c.ag * alto - alto / 2, 0); ch.geo = geo; ch.dx = 0;
    centraCharm(ch);
    var T = ch.cuenta ? 0.088 : 0.07, NL = ch.cuenta ? 15 : 11;
    for (var i = 0; i < NL; i++) {
      var f = i / (NL - 1), frente = i === 0, atras = i === NL - 1;
      var mat = new THREE.MeshBasicMaterial({ map: frente || atras ? tex : tx.sil, transparent: frente, alphaTest: frente ? 0.03 : 0.5, side: THREE.DoubleSide, toneMapped: false,
        color: frente ? 0xffffff : (atras ? new THREE.Color().setScalar(0.6) : new THREE.Color().setScalar(0.86 + 0.14 * Math.sin(f * Math.PI))) });
      var capa = new THREE.Mesh(geo, mat);
      capa.position.z = T - f * 2 * T;
      if (!frente) capa.scale.setScalar(0.988 + 0.012 * Math.sin(f * Math.PI));
      if (frente) {
        capa.renderOrder = 2; capa.userData.ch = ch; ch.malla = capa;
        var gem = new THREE.Mesh(geo, matProfundidad({ map: tex, alphaTest: 0.5 }, 'foto')); gem.layers.set(CAPA_SOMBRA_PROPIA); capa.add(gem); ch.gemelo = gem;
      }
      col.add(capa);
    }
    charms[k] = ch; vivos.push(ch); return ch;
  }
  // Centra la pieza en la cadena según la medida de su foto (mideAgujero) y fija el hueco de la cadena. Si la foto todavía no
  // terminó de cargar, queda centrada en la foto y se vuelve a intentar en cada cuadro hasta que llegue la medida.
  function centraCharm(ch) {
    var tx = TEX[ch.k], ancho = ch.ancho, listo = tx && tx.cx != null;
    var cx = listo ? tx.cx : 0.5, aw = listo ? tx.aw : (ch.cuenta ? 0.8 : 0.14);
    var dx = -(cx - 0.5) * ancho;
    if (dx !== ch.dx) { ch.geo.translate(dx - ch.dx, 0, 0); ch.dx = dx; }
    ch.huecoMedio = aw * ancho * 0.5 * (ch.cuenta ? 0.92 : 0.8);             // la cadena se oculta solo adentro de la pieza
    ch.cx = cx; ch.agujero = listo ? tx.hueco : null; ch.lejos = listo ? tx.lejos : null;
    // Con agujero a la vista (cuentas y aros de colgante): la pieza va apenas detrás de la cadena, que pasa por delante del borde
    // por donde entra, se mete en el agujero de la foto y queda tapada por el otro lado de la pieza (ver ATRAS y actualizaCadena).
    ch.pasante = !!ch.agujero && !!ch.matFoto;
    // calibrado: la pieza sube o baja para que el centro de su agujero quede justo sobre la cadena (en varias el agujero de la foto
    // estaba más arriba o más abajo que la línea ag: la cadena pasaba por encima o por debajo del agujero)
    var dy = ch.pasante && ch.agujero.cy != null ? (ch.agujero.cy - CH[ch.k].ag) * CH[ch.k].alto : 0;
    if (dy !== ch.dy) { ch.geo.translate(0, dy - ch.dy, 0); ch.dy = dy; }
    ch.col.position.z = 0;
    if (ch.matFoto) {
      var hh = ch.agujero, hv = ch.matFoto.userData.hueco.value;
      hv.set(0, 0, 0, 0);      // (el agujero de la foto ya no se abre: la cadena pasa por delante y entra en él; ver ATRAS)
    }
    ch.centrado = listo;
  }
  function liberaCharm(ch) {   // al terminar de salir: afuera de la escena y se liberan geometría, materiales y la foto en alta
    scene.remove(ch.piv);
    ch.piv.traverse(function (o) { if (o.isMesh && o.material) [].concat(o.material).forEach(function (m) { m.dispose(); }); });
    if (ch.geo) ch.geo.dispose();
    if (ch.extruida) sueltaHD(ch.k);
  }
  /* Reparto en la cadena: cada charm ocupa al menos su ancho real (las cuentas, lo que miden a la altura de la cadena; los
     colgantes, buena parte de su dije). Antes iban a distancias iguales sin mirar el ancho: con muchos, las piezas anchas quedaban
     más juntas de lo que miden y se metían una dentro de la otra (se veían las dos a la vez, "transparentes"). Con pocos, se
     separan como siempre. Si no entran ni en el 70 % de la vuelta (el cierre queda libre), se juntan y quedan escalonadas en
     profundidad (capa), así la de adelante tapa entera a la de atrás. */
  function pasoCharm(n) { return Math.min(0.064 * R0 / R, 0.42 / Math.max(n - 1, 1)); }
  function anchoEnCadena(k) {
    var c = CH[k], ch = charms[k], tx = TEX[k], ancho = ch ? ch.ancho : c.alto * c.asp;
    var aw = tx && tx.aw ? tx.aw : (c.tipo === 'c' ? 0.85 : 0.3);
    var w = ancho * aw;
    if (c.tipo !== 'c') w = Math.max(w, ancho * 0.6);
    return w + 0.035;
  }
  function reparte() {
    var n = st.sel.length; if (!n) return;
    var largo = 2 * Math.PI * R, pref = pasoCharm(n) * largo;
    var lugares = st.sel.map(function (k) { return Math.max(anchoEnCadena(k), pref); });
    var total = lugares.reduce(function (a, b) { return a + b; }, 0) - (lugares[0] + lugares[n - 1]) / 2 + (n === 1 ? lugares[0] : 0);
    var junta = Math.min(1, 0.7 * largo / Math.max(total, 1e-6));
    var pos = -total * junta / 2;
    st.sel.forEach(function (k, i) {
      if (i > 0) pos += (lugares[i - 1] + lugares[i]) / 2 * junta;
      var ch = charms[k]; if (!ch) return;
      ch.tObj = 0.5 + (n === 1 ? 0 : pos / largo);
      ch.capa = junta < 0.999 ? (i % 2 ? 1 : -1) * 0.09 : (ch.cuenta ? 0 : (i % 2 ? 1 : -1) * 0.03);
    });
  }
  var hEje = new THREE.Vector3(), hA = new THREE.Vector3(), hB = new THREE.Vector3();
  /* Colgantes con agujero a la vista (2026-11-12, pedido del usuario: "al atravesar el dije tiene que quedar una parte del dije por
     delante de la pulsera, pero la otra por detrás. Están quedando ambas por delante"). Antes iban enteros DELANTE de la cadena, que
     se veía solo por el agujero abierto de la foto: los dos bordes del aro la tapaban. En las fotos el aro se ve de tres cuartos:
     la cadena viene de frente por el lado del agujero (ese borde del aro queda DETRÁS de ella), entra al agujero y sale por atrás
     (el otro lado del aro la TAPA). Ahora el colgante va apenas detrás de la cadena por la línea de la cámara (sin moverse en la
     pantalla): la cadena pasa por delante del borde por donde entra y del agujero, que queda como en la foto (oscuro por dentro), y
     se corta en el borde de adentro del agujero (actualizaCadena), así el otro lado del aro la tapa. Los vecinos escalonados (capa)
     se corren solo hacia atrás, para que ninguno vuelva a tapar la cadena. */
  /* Lo mismo en las cuentas (mismo día: "acá pasa lo mismo", con Mickey): son gruesas y la cadena iba por adentro, así que el borde
     por donde entra también la tapaba y solo se la veía por el agujero abierto. Ahora van detrás de la cadena lo que mide su medio
     grosor, y el agujero de la foto ya no se abre en ninguna pieza: la cadena pasa por delante y se mete en él. */
  var ATRAS = 0.045, ATRAS_CUENTA = 0.085;
  function fondoDe(ch) { var cp = ch.capa || 0; return ch.pasante ? -(ch.cuenta ? ATRAS_CUENTA : ATRAS) + cp - Math.abs(cp) : cp; }
  var CONTACTO = { fuerza: 0.36, ancho: 0.065 };      // sombra de contacto de la cadena junto a cada pieza (unidades del mundo)
  function actualizaCadena() {   // uniforms de la cadena: radio, grosor, intro, los huecos adentro de las piezas y el contacto
    U.uR.value = R; U.uRad.value = RAD; U.uIntro.value = intro;
    var n = 0, largoT = 2 * Math.PI * R;
    for (var i = 0; i < vivos.length && n < 16; i++) {
      var c = vivos[i];
      if (c.sale || c.vol || !c.listo || c.alza) continue;
      var medio = c.huecoMedio * c.esc / largoT, ta = c.t - medio, tb = c.t + medio, corte = true;
      if (c.pasante) {
        // con agujero a la vista (cuentas y aros de colgante): la cadena pasa POR DELANTE del borde por donde entra (ver ATRAS), se
        // mete en el agujero y se oculta desde su borde de adentro hasta pasar el otro borde de la pieza: un lado queda detrás de la
        // cadena y el otro la tapa, como una pieza enhebrada de verdad
        hEje.set(1, 0, 0).applyQuaternion(c.piv.quaternion);
        camino(c.t - 0.001, hA); camino(c.t + 0.001, hB); pulsera.localToWorld(hA); pulsera.localToWorld(hB); hB.sub(hA).normalize();
        var kx = c.ancho * c.esc * hEje.dot(hB) / largoT, h = c.agujero;
        var t0 = c.t + (h.c + h.lado * h.rx * 0.84 - c.cx) * kx, t1 = c.t + (c.lejos + h.lado * 0.02 - c.cx) * kx;
        ta = Math.min(t0, t1); tb = Math.max(t0, t1);
      }
      U.uHuecos.value[n].set(corte ? ta : -2, corte ? tb : -1);
      U.uContactos.value[n].set(ta * largoT, tb * largoT, CONTACTO.fuerza, corte ? CONTACTO.ancho : -CONTACTO.ancho);
      n++;
    }
    U.uNHuecos.value = n; U.uNContactos.value = n;
  }

  /* ═════════ Cámara y calidad ═════════ */
  function medir() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 40 : 30;
    camera.updateProjectionMatrix();
  }
  function aplicaNivel() {
    var n = NIVELES[iNivel];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprDe(n.dpr)));
    medir(); preparaSombra(n.sombra);
  }
  new ResizeObserver(medir).observe(stage); aplicaNivel();
  function distCam() {
    if (X.distCam) return X.distCam(camera.aspect, stage.clientWidth < 700);      // (la misma cuenta ubica el póster en armar3d.js: una sola fuente)
    var th = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), asp = camera.aspect;
    return Math.max(6, (R0 * 1.06 + (asp < 1 ? 0.5 : 0.9)) / (th * asp), 2.15 / th);
  }
  // Si los cuadros tardan (menos de ~45 fps sostenidos) baja un nivel; si sobra (casi 60 fps varios segundos) vuelve a subir
  var ritmo = 16.7, lento = 0, rapido = 0, ultimoCambio = 0;
  function vigilaRitmo(ms, ahora) {
    if (DBG.nivel) return;
    ritmo += (ms - ritmo) * 0.08;
    if (ahora - ultimoCambio < 2500) return;
    if (ritmo > 22 && iNivel > 0) { lento += ms; if (lento > 1800) { iNivel--; aplicaNivel(); ultimoCambio = ahora; lento = 0; } } else lento = 0;
    if (ritmo < 17.6 && iNivel < techo) { rapido += ms; if (rapido > 9000) { iNivel++; aplicaNivel(); ultimoCambio = ahora; rapido = 0; } } else rapido = 0;
  }

  /* ═════════ Interacción: girar arrastrando (inercia al soltar, tope elástico), tocar un charm o el cierre para verlo de cerca ═════════ */
  var vitrina = 0, cambioEn = 0, basePend = null, zoom = 1, foco = new THREE.Vector3(), focoObj = new THREE.Vector3(), parX = 0, parY = 0, objX = 0, objY = 0;
  var rotY = Math.PI, rotV = 0, centro = Math.PI, extraObj = 0, agarre = null, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), sobre = null;
  var inercia = 0, crudo = Math.PI, lupa = null, lupaT = 0, saltar = false;
  /* (2026-11-14, realismo) El giro QUEDA donde se suelta (giroU): antes tenía un tope elástico de ~1,15 rad y a los 2 s volvía sola
     al frente, así que no se podía dejar de costado ni ver el cierre o la parte de atrás. Vuelve al frente sola cuando hace falta
     ver lo que pasa adelante (al sumar un charm, al cambiar de pulsera, en el festejo) o con doble clic / doble toque. */
  var giroU = 0;
  function alFrente() { centro += Math.round(giroU / (Math.PI * 2)) * Math.PI * 2; giroU = 0; }
  var FINO = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  function aNdc(cxp, cyp) { var r = canvas.getBoundingClientRect(); ndc.set(((cxp - r.left) / r.width) * 2 - 1, -((cyp - r.top) / r.height) * 2 + 1); }
  function tocado(e) {
    aNdc(e.clientX, e.clientY); ray.setFromCamera(ndc, camera);
    var mallas = vivos.filter(function (c) { return c.malla && !c.sale && !c.vol; }).map(function (c) { return c.malla; });
    var h = ray.intersectObjects(mallas, false); return h.length ? h[0].object.userData.ch : null;
  }
  function tocaCierre(e) {
    if (!cierreObj || !cierreObj.visible) return false;
    aNdc(e.clientX, e.clientY); ray.setFromCamera(ndc, camera);
    return ray.intersectObject(cierreObj, true).length > 0;
  }
  canvas.addEventListener('pointerdown', function (e) {
    saltar = true;                                       // si la intro todavía corre, termina ya
    var ch = tocado(e);
    agarre = { x: e.clientX, x0: e.clientX, y0: e.clientY, ch: ch, cierre: !ch && tocaCierre(e), movio: false };
    crudo = rotY; inercia = 0;
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('agarra');
  });
  canvas.addEventListener('dblclick', function () { if (!lupa) alFrente(); });
  canvas.addEventListener('pointermove', function (e) {
    if (!agarre) { sobre = tocado(e); canvas.classList.toggle('sobre', !!sobre); return; }
    var dx = e.clientX - agarre.x; agarre.x = e.clientX;
    if (Math.hypot(e.clientX - agarre.x0, e.clientY - agarre.y0) > 6) agarre.movio = true;
    if (!agarre.movio) return;
    var antes = rotY, eje = centro + extraObj;
    crudo += dx * 0.0065;                                // (2026-11-14) gira libre, sin tope: queda donde se la suelta
    rotY = crudo;
    rotV = rotV * 0.5 + (rotY - antes) * 30;
  });
  function suelta() {
    if (!agarre) return;
    var a = agarre; agarre = null; canvas.classList.remove('agarra');
    if (a.movio) { inercia = MOV.inercia; if (!lupa) giroU = rotY + Math.max(-0.5, Math.min(0.5, rotV * 0.16)) - (centro + extraObj); return; }   // se deja llevar un momento y se queda ahí
    if (a.ch) abreLupa({ ch: a.ch });                     // tocar un charm o el cierre: verlo de cerca
    else if (a.cierre) abreLupa({ cierre: true });
    else if (lupa) cierraLupa();
  }
  function abreLupa(l) {
    lupa = l; lupaT = 0; sobre = null; canvas.classList.remove('sobre');
    if (l.ch) { var t = l.ch.tObj; extraLupa = cercano(-t * Math.PI * 2 - centro, rotY - centro); }
    else extraLupa = cercano(Math.PI, rotY - centro);     // el cierre (t = 0) al frente
    X.muestraLupa(l.ch ? { k: l.ch.k } : { cierre: true });
  }
  function cierraLupa() { if (!lupa) return; lupa = null; extraLupa = 0; X.muestraLupa(null); }
  function cercano(a, ref) { while (a - ref > Math.PI) a -= Math.PI * 2; while (a - ref < -Math.PI) a += Math.PI * 2; return a; }   // el mismo ángulo, el más cerca de ref
  var extraLupa = 0;
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lupa) cierraLupa(); });
  canvas.addEventListener('pointerup', suelta); canvas.addEventListener('pointercancel', suelta);
  canvas.addEventListener('pointerleave', function () { sobre = null; canvas.classList.remove('sobre'); });
  window.addEventListener('pointermove', function (e) {
    if (FINO) { var rs = stage.getBoundingClientRect(); objX = Math.max(-1, Math.min(1, ((e.clientX - rs.left) / rs.width) * 2 - 1)); objY = Math.max(-1, Math.min(1, ((e.clientY - rs.top) / rs.height) * 2 - 1)); }
  }, { passive: true });

  var etq = $('etiqueta'), vP = new THREE.Vector3();
  function puntoDesde(el) {
    var r = el.getBoundingClientRect(), rc = canvas.getBoundingClientRect();
    ndc.set(((r.left + r.width / 2 - rc.left) / rc.width) * 2 - 1, -((r.top + r.height / 2 - rc.top) / rc.height) * 2 + 1);
    ndc.x = Math.max(-1.4, Math.min(1.4, ndc.x)); ndc.y = Math.max(-1.9, Math.min(1.3, ndc.y));
    ray.setFromCamera(ndc, camera);
    return ray.ray.at(camera.position.length() * 0.42, new THREE.Vector3());
  }
  var anc = new THREE.Vector3(), haciaCam = new THREE.Vector3(), cX = new THREE.Vector3(), cY = new THREE.Vector3(), cZ = new THREE.Vector3(), cM = new THREE.Matrix4(), qFin = new THREE.Quaternion(), qTmp = new THREE.Quaternion();
  function anclaje(t, out) { camino(t, out); return pulsera.localToWorld(out); }
  /* (2026-11-14, pedido del usuario: "entran de una forma y cuando llegan a la mitad del recorrido se giran… deberían entrar al
     revés para que al final lleguen de frente") Mientras el charm baja enhebrado desde el cierre (rigido) va fijo a la cadena, con
     la cara hacia AFUERA de la pulsera: atrás se lo ve de espaldas, de costado de canto y adelante llega de frente, girando con la
     cadena sin saltos. Antes su cara se daba vuelta de golpe al cruzar el costado (para mirar siempre a la cámara). En reposo
     sigue como antes. ch.frente: cuánto mira a la cámara (1 de frente, −1 de espaldas). */
  var oCen = new THREE.Vector3(), oRad = new THREE.Vector3();
  function orientaCharm(ch, t, out, rigido) {     // X = la cadena (en el mundo), Y = arriba (gravedad), Z = hacia el lado de la cámara
    camino(t - 0.0015, pA); camino(t + 0.0015, pB); pulsera.localToWorld(pA); pulsera.localToWorld(pB);
    cX.subVectors(pB, pA).normalize();
    cY.set(0, 1, 0).addScaledVector(cX, -cX.y).normalize();
    cZ.crossVectors(cX, cY);
    if (rigido) { pulsera.getWorldPosition(oCen); oRad.addVectors(pA, pB).multiplyScalar(0.5).sub(oCen); if (cZ.dot(oRad) < 0) { cX.negate(); cZ.negate(); } }
    else if (cZ.dot(haciaCam) < 0) { cX.negate(); cZ.negate(); }
    if (ch) ch.frente = cZ.dot(haciaCam);
    cM.makeBasis(cX, cY, cZ); return out.setFromRotationMatrix(cM);
  }
  // Cuánto hay que girar una cuenta sobre su propio plano para que su agujero (el eje horizontal de la foto) quede a lo largo de
  // la cadena: la cadena se proyecta sobre el plano de la foto y se mide el ángulo (el más chico: da igual hacia qué lado apunte)
  var rT = new THREE.Vector3(), rX = new THREE.Vector3(), rZ = new THREE.Vector3(), rC = new THREE.Vector3();
  function giroCuenta(p, t) {
    camino(t - 0.001, rT); camino(t + 0.001, rC); pulsera.localToWorld(rT); pulsera.localToWorld(rC); rT.subVectors(rC, rT).normalize();
    rZ.set(0, 0, 1).applyQuaternion(p.quaternion); rX.set(1, 0, 0).applyQuaternion(p.quaternion);
    rT.addScaledVector(rZ, -rT.dot(rZ)); if (rT.lengthSq() < 1e-6) return 0; rT.normalize();
    var ang = Math.atan2(rC.crossVectors(rX, rT).dot(rZ), rX.dot(rT));
    if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;
    return ang;
  }
  function caraCamara(out) { cX.set(1, 0, 0).applyQuaternion(camera.quaternion); cY.set(0, 1, 0); cZ.crossVectors(cX, cY); cM.makeBasis(cX, cY, cZ); return out.setFromRotationMatrix(cM); }

  /* ═════════ Movimiento ═════════
     Todo se mueve con resortes amortiguados (sin rebote de juguete) y todos los valores están en esta tabla. */
  var MOV = {
    giro: 15, giroAmort: 0.86,          // la pulsera vuelve a su pose (rigidez y amortiguación relativa: 1 = sin rebote)
    giroFestejo: 6, giroSuelto: 1.4,    // la vuelta del festejo es lenta; al soltar después de arrastrar, primero se deja llevar
    inercia: 0.6,                       // segundos que se deja llevar al soltar
    talle: 70, talleAmort: 0.8,         // el radio al cambiar el talle
    deslizar: 46, deslizarAmort: 0.92,  // un charm que se corre por la cadena (al enhebrarse, al reordenar, cuando se corren los vecinos)
    vuelo: 0.9, enhebra: 0.075,         // segundos del vuelo desde la tarjeta y cuánto se desliza por la cadena (en vueltas) hasta su lugar
    vueloCierre: 0.62, entraCierre: 0.075, enhebraK: 13,   // (2026-11-14) entra junto al cierre (a esa fracción de vuelta) y baja deslizándose, más despacio
    reposo: 0.08, reposoVel: 0.23,      // en reposo: un giro mínimo (radianes) y su velocidad
    barrido: 7.5, barridoDur: 1.5,      // cada cuántos segundos pasa un barrido de luz por la plata, y cuánto dura
    camara: 2.4, zoomVitrina: 0.8, zoomLupa: 0.42,
    intro: 0.55, introCam: 0.8
  };
  // el barrido de luz: una luz de arriba que cruza la pulsera de izquierda a derecha (el brillo recorre la plata y los cristales)
  var barridoLuz = new THREE.DirectionalLight(0xffffff, 0); barridoLuz.position.set(-6, 4.5, 3.5); scene.add(barridoLuz);
  var barridoT = -1, proxBarrido = 0.35;
  function animaBarrido(dt, quieto) {
    if (barridoT < 0) { proxBarrido -= dt; if (proxBarrido <= 0 && quieto) barridoT = 0; return; }
    barridoT += dt / MOV.barridoDur;
    var u = Math.min(1, barridoT), f = Math.sin(u * Math.PI);
    barridoLuz.position.set(-7 + 14 * u, 4.5, 3.5); barridoLuz.intensity = 3.4 * f * f;
    if (barridoT >= 1) { barridoT = -1; barridoLuz.intensity = 0; proxBarrido = MOV.barrido * (0.8 + Math.random() * 0.4); }
  }

  /* ═════════ Cuadro a cuadro ═════════ */
  var timer = new THREE.Timer(), saltaDelta = true, relojManual = false;
  var asoma = 1;      // 0 → 1: el vaivén propio de cada colgante entra de a poco al arrancar sin intro (igual al póster en el primer cuadro)
  var tiempo = 0, festejo = 0, primero = true, sacudon = 0, introChispa = REDUCE || sinIntro, andando = true, tPrev = 0, ieCam = REDUCE || sinIntro ? 1 : 0, rotVantes = 0;
  var ensayo = false;   // cuadros de prueba (antes de arrancar): se dibujan con el lienzo escondido y no cuentan como el primero
  function pinta() { pintaSombra(); renderer.setRenderTarget(null); renderer.render(scene, camera); }
  function cuadro(ts) {
    if (relojManual) return;
    if (!X.enVista()) { andando = false; return; }        // fuera de pantalla no se dibuja (despierta() lo vuelve a arrancar)
    timer.update(ts);
    var dt = saltaDelta ? 1 / 60 : Math.min(timer.getDelta(), 0.05); saltaDelta = false;
    if (tPrev) vigilaRitmo(ts - tPrev, ts); tPrev = ts;
    paso(dt);
    requestAnimationFrame(cuadro);
  }
  function paso(dt) {
    tiempo += dt; if (asoma < 1) asoma = Math.min(1, asoma + dt / 1.6);
    if (saltar && intro < 1) { intro = 1; ieCam = 1; }    // tocaron el escenario: la intro termina ya
    saltar = false;
    if (intro < 1) {
      intro = Math.min(1, intro + dt / MOV.intro);
      if (!introChispa && intro > 0.9 && cierreObj) { introChispa = true; pulsera.updateMatrixWorld(true); destello(pulsera.localToWorld(camino(0.0005, new THREE.Vector3())), 26, 1); }
    }
    ieCam = Math.min(1, ieCam + dt / MOV.introCam);
    // talle: el radio sigue a un resorte; el grosor de la cadena, suave
    if (REDUCE) { R = Robj; Rvel = 0; } else { Rvel += ((Robj - R) * MOV.talle - Rvel * 2 * MOV.talleAmort * Math.sqrt(MOV.talle)) * dt; R += Rvel * dt; }
    RAD += (RADobj - RAD) * Math.min(1, dt * (REDUCE ? 30 : 5));
    var girandoAMano = agarre && agarre.movio;
    var calma = REDUCE || st.pausa || DBG.quieto ? 0 : 1;
    if (festejo > 0) festejo = Math.max(0, festejo - dt);
    // vidriera: al elegir otra pulsera, media vuelta para mostrar el cierre de frente; ahí cambia; después completa la vuelta
    if (cambioEn > 0) { cambioEn -= dt; if (cambioEn <= 0) ponBase(basePend, true); }
    if (vitrina > 0) { vitrina -= dt; if (vitrina <= 0) { centro += Math.PI * 2; extraObj = 0; } }
    if (lupa) lupaT += dt;
    if (inercia > 0) inercia = Math.max(0, inercia - dt);
    if (!girandoAMano) {
      var quieta = vitrina <= 0 && !lupa && festejo <= 0;
      var meta = centro + extraObj + (lupa ? extraLupa : giroU) + Math.sin(tiempo * MOV.reposoVel) * MOV.reposo * calma * (quieta ? 1 : 0.3);
      if (REDUCE) { rotY = meta; rotV = 0; }
      else {
        var kr = festejo > 0 ? MOV.giroFestejo : (inercia > 0 ? MOV.giroSuelto : MOV.giro);
        rotV += ((meta - rotY) * kr - rotV * 2 * Math.sqrt(kr) * (inercia > 0 ? 0.25 : MOV.giroAmort)) * dt; rotY += rotV * dt;
      }
    }
    var rotA = (rotV - rotVantes) / Math.max(dt, 1e-3); rotVantes = rotV;     // aceleración del giro: hamaca los colgantes hacia afuera
    sacudon = Math.max(0, sacudon - dt * 2.4);
    animaBarrido(dt, !agarre && !lupa && vitrina <= 0 && intro >= 1);
    pulsera.rotation.y = rotY;
    pulsera.rotation.x = 0.47 + Math.sin(tiempo * 0.4) * 0.008 * calma;
    pulsera.position.y = 0.1 + Math.sin(tiempo * 0.6) * 0.008 * calma + Math.sin(sacudon * 16) * sacudon * 0.035;
    // cámara: entra desde un poco más lejos y arriba; en la vidriera se acerca al cierre y en la lupa a la pieza; con el mouse, un paralaje suave
    var ie = REDUCE ? 1 : ease(ieCam);
    zoom += ((lupa ? MOV.zoomLupa : (vitrina > 0 ? MOV.zoomVitrina : 1)) - zoom) * Math.min(1, dt * MOV.camara);
    focoObj.set(0, 0, 0);
    if (lupa && lupa.ch && !lupa.ch.sale) { focoObj.copy(lupa.ch.piv.position).multiplyScalar(0.8); focoObj.y += (CH[lupa.ch.k].ag - 0.5) * CH[lupa.ch.k].alto * -0.6; }
    else if ((lupa || vitrina > 0) && cierreObj) { pulsera.updateMatrixWorld(true); pulsera.localToWorld(focoObj.copy(cierreObj.position)).multiplyScalar(lupa ? 0.85 : 0.42); }
    var vis = 2 * distCam() * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));    // alto visible a la distancia de la pulsera
    var flota = X.totalFlota(), afuera = lupa ? 0.35 : 1;
    focoObj.y -= vis * (flota ? 0.13 : (stage.clientWidth < 700 ? 0.12 : 0.05)) * afuera;   // (2026-11-15) celular: 0,12 (era 0,14; pedido: "la pulsera apenas más abajo en el espacio 3D")                              // la pulsera sube (pedidos 2026-11-10 y 2026-11-11: "más arriba")
    // (centrada horizontalmente, pedido 2026-11-11: ya no se corre a la izquierda)
    if (false) focoObj.x += vis * camera.aspect * (stage.clientWidth < 800 ? 0.09 : 0.06) * afuera;   // y a la izquierda: abajo a la derecha está el total
    // en la lupa la pieza queda lejos de su tarjeta: a la izquierda y abajo en compu (la tarjeta va arriba a la derecha), arriba en celular
    if (lupa) { focoObj.x += vis * camera.aspect * (flota ? 0.12 : 0) * zoom; focoObj.y += vis * (flota ? 0.06 : -0.13) * zoom; }
    foco.lerp(focoObj, Math.min(1, dt * MOV.camara));
    var mano = agarre || lupa || REDUCE || DBG.quieto ? 0 : 1;
    parX += (objX * 0.34 * mano - parX) * Math.min(1, dt * 2.2); parY += (objY * 0.18 * mano - parY) * Math.min(1, dt * 2.2);
    camera.position.set(foco.x + parX, foco.y + 0.92 - parY + 0.6 * (1 - ie), foco.z + distCam() * zoom * (1 + 0.16 * (1 - ie)));
    camera.lookAt(foco);
    brillo.position.set(Math.sin(tiempo * 0.6) * 3.2, 2.4, Math.cos(tiempo * 0.6) * 3.2 + 1);
    pulsera.updateMatrixWorld(true); ubicaPiezas(dt); pulsera.updateMatrixWorld(true);

    for (var vi = vivos.length - 1; vi >= 0; vi--) {
      var ch = vivos[vi], p = ch.piv;
      if (!ch.centrado) centraCharm(ch);
      if (!ch.vol) {                                     // se desliza por la cadena (recién enhebrado: más despacio, se lo ve bajar)
        var kd = ch.enhebra ? MOV.enhebraK : MOV.deslizar;
        ch.tv += ((ch.tObj - ch.t) * kd - ch.tv * 2 * (ch.enhebra ? 1 : MOV.deslizarAmort) * Math.sqrt(kd)) * dt; ch.t += ch.tv * dt;
        if (ch.enhebra && Math.abs(ch.tObj - ch.t) < 0.006) ch.enhebra = false;
      }
      anclaje(ch.t, anc);
      haciaCam.subVectors(camera.position, anc).normalize();
      if (ch.alza) anc.addScaledVector(haciaCam, 0.3).y += 0.06;
      if (ch.vol) {
        ch.vol.u = Math.min(1, ch.vol.u + dt / ch.vol.dur);
        var e = 1 - Math.pow(1 - ch.vol.u, 3), a0 = ch.vol.de, c0 = ch.vol.ctrl, ie2 = 1 - e;
        p.position.set(ie2 * ie2 * a0.x + 2 * ie2 * e * c0.x + e * e * anc.x, ie2 * ie2 * a0.y + 2 * ie2 * e * c0.y + e * e * anc.y, ie2 * ie2 * a0.z + 2 * ie2 * e * c0.z + e * e * anc.z);
        orientaCharm(ch, ch.t, qFin, !!ch.enhebra); caraCamara(qTmp); if (!ch.enhebra) qFin.slerp(qTmp, 0.55); p.quaternion.copy(qTmp).slerp(qFin, e);   // (enhebrado: llega ya fijo a la cadena, de espaldas)
        if (ch.cuenta) { ch.giro = giroCuenta(p, ch.t) * e; p.rotateZ(ch.giro); }
        ch.esc = 0.45 + 0.55 * e; ch.col.rotation.z = ie2 * ie2 * 2.2 * ch.vol.giro;
        if (ch.vol.u >= 1) { ch.vol = null; ch.om = ch.cuenta ? 0.8 : 2.4; ch.golpe = 1; sacudon = Math.max(sacudon, 0.2); destello(anc, 18, 1); if (ch.matFoto) ch.barrido = 0; }
      } else if (ch.sale) {
        ch.sale.vy -= 9.5 * dt; p.position.y += ch.sale.vy * dt; p.position.x += ch.sale.vx * dt; p.position.z += ch.sale.vz * dt;
        p.rotateX(ch.sale.gx * dt); p.rotateZ(ch.sale.gz * dt);
        ch.sale.op -= dt * 1.5;
        ch.col.children.forEach(function (capa) { [].concat(capa.material).forEach(function (m) { m.transparent = true; m.opacity = Math.max(0, ch.sale.op); }); });
        if (ch.gemelo) ch.gemelo.visible = ch.sale.op > 0.55;
        if (ch.sale.op <= 0 || p.position.y < -5) { liberaCharm(ch); vivos.splice(vi, 1); continue; }
      } else {
        ch.hov += ((sobre === ch && !agarre ? 1 : 0) - ch.hov) * Math.min(1, dt * 9);
        // (todo por la línea de la cámara: cambia quién tapa a quién sin mover la pieza en la pantalla)
        p.position.copy(anc).addScaledVector(haciaCam, (ch.pasante ? 0 : 0.08 * ch.hov) + fondoDe(ch) * ch.esc);
        /* (2026-11-14, pedido del usuario, confirmado dos veces: "sí quiero que gire… que ingrese dado vuelta y cuando sigue el camino
           de la pulsera se gira solo, pero bien enhebrado") Mientras baja enhebrado va FIJO a la cadena, con la cara hacia afuera de
           la pulsera: entra de espaldas junto al cierre, gira con la cadena y llega de frente. No dejarlo siempre de frente. */
        orientaCharm(ch, ch.t, p.quaternion, !!ch.enhebra); caraCamara(qTmp);
        var fr = 1; if (ch.enhebra) { fr = Math.max(0, Math.min(1, (ch.frente - 0.05) / 0.6)); fr = fr * fr * (3 - 2 * fr); }   // de espaldas o de canto: sin torcerlo hacia la cámara
        p.quaternion.slerp(qTmp, (0.76 + 0.12 * ch.hov) * fr);
        if (ch.cuenta) { ch.giro += (giroCuenta(p, ch.t) - ch.giro) * Math.min(1, dt * 10); p.rotateZ(ch.giro); }   // enhebrada: su agujero sigue a la cadena
        var enLupa = lupa && lupa.ch === ch;
        ch.lupa += ((enLupa ? 1 : 0) - ch.lupa) * Math.min(1, dt * 3);
        if (ch.lupa > 0.001) p.rotateY(Math.sin(lupaT * 0.8) * 0.5 * ch.lupa);              // en la lupa gira despacio y muestra su volumen
        // péndulo: se hamaca con la aceleración de la cadena a lo largo de su recorrido
        var vx = (anc.x - ch.pre.x) * cX.x + (anc.y - ch.pre.y) * cX.y + (anc.z - ch.pre.z) * cX.z; vx /= Math.max(dt, 1e-3);
        var acel = (vx - ch.velX) / Math.max(dt, 1e-3); ch.velX = vx;
        var rig = ch.cuenta ? 70 : 16, amort = ch.cuenta ? 10 : 2.1;
        ch.om += (-rig * ch.th - amort * ch.om - acel * (ch.cuenta ? 0.006 : 0.022)) * dt;
        var tope = ch.cuenta ? 0.3 : ch.tope;                // no se atraviesan: el vaivén se limita según la distancia al vecino
        ch.th = Math.max(-tope, Math.min(tope, ch.th + ch.om * dt)); if (Math.abs(ch.th) >= tope) ch.om *= -0.3;
        // segundo eje: hacia adelante y atrás, con la aceleración del giro de la pulsera (se abren al girar y vuelven)
        ch.ov += (-(ch.cuenta ? 80 : 13) * ch.ph - (ch.cuenta ? 12 : 1.8) * ch.ov + rotA * (ch.cuenta ? 0.002 : 0.03)) * dt;
        ch.ph = Math.max(-0.45, Math.min(0.45, ch.ph + ch.ov * dt));
        ch.col.rotation.z = ch.th + (calma && !ch.cuenta ? Math.sin(tiempo * 1.1 + ch.semilla) * 0.02 * asoma : 0);
        ch.col.rotation.x = ch.ph;
        if (ch.golpe > 0) { ch.golpe = Math.max(0, ch.golpe - dt * 3); var gs = Math.sin(ch.golpe * Math.PI) * ch.golpe; ch.col.scale.set(1 + 0.08 * gs, 1 - 0.1 * gs, 1); }
        else if (ch.col.scale.y !== 1) ch.col.scale.set(1, 1, 1);
      }
      ch.pre.copy(anc);
      if (ch.barrido >= 0 && ch.matFoto) { ch.barrido += dt / 0.65; ch.matFoto.userData.barrido.value = ch.barrido; if (ch.barrido > 1.3) { ch.barrido = -1; ch.matFoto.userData.barrido.value = -1; } }
      var metaE = ch.sale || ch.vol ? ch.esc : (sobre === ch ? 1.07 : 1) * (ch.alza ? 1.1 : 1) * (1 + 0.12 * ch.lupa);
      if (!ch.vol && !ch.sale) ch.esc += (metaE - ch.esc) * Math.min(1, dt * 10);
      p.scale.setScalar(Math.max(0.001, ch.esc));
    }

    topesVaiven();
    actualizaCadena();
    buscaBrillos(dt); animaBrillos(dt);

    // etiqueta del charm bajo el mouse
    if (sobre && !agarre && !lupa && !sobre.sale && !sobre.vol) {
      vP.copy(sobre.piv.position); vP.y += CH[sobre.k].alto * CH[sobre.k].ag + 0.08; vP.project(camera);
      etq.style.left = ((vP.x + 1) / 2 * stage.clientWidth) + 'px'; etq.style.top = ((1 - vP.y) / 2 * stage.clientHeight) + 'px';
      var c2 = CH[sobre.k];
      if (etq.dataset.k !== sobre.k) { etq.dataset.k = sobre.k; etq.innerHTML = '<b>' + c2.n + '</b>' + fmt(c2.p) + ' · <small>tocá para verlo de cerca</small>'; }
      etq.hidden = false;
    } else if (!etq.hidden) { etq.hidden = true; etq.dataset.k = ''; }

    pinta();
    if (primero && !ensayo) { primero = false; canvas.classList.add('ve'); $('cargando').classList.add('listo'); X.pintaResumen(); }
  }
  // Vaivén de los colgantes: cuánto se pueden hamacar sin chocar con el vecino (según la distancia por la cadena y sus anchos)
  function topesVaiven() {
    var l = vivos.filter(function (c) { return !c.sale && !c.vol && !c.cuenta; }).sort(function (a, b) { return a.t - b.t; }), largo = 2 * Math.PI * R;
    l.forEach(function (c, i) {
      var h = CH[c.k].alto * (1 - CH[c.k].ag) * 0.9, libre = 1e9;
      [l[i - 1], l[i + 1]].forEach(function (v) { if (v) libre = Math.min(libre, Math.abs(v.t - c.t) * largo - (v.ancho + c.ancho) * 0.38); });
      c.tope = Math.max(0.08, Math.min(0.8, libre / Math.max(h, 0.1)));
    });
  }

  function ponBase(k, conEfecto) {
    var b = BA[k], rigida = b.cierre === 'rigida';
    cierreObj = cierreDe(b.cierre);
    RADobj = b.rad; roscaObj = rigida ? 0 : 1;
    U.uSnake.value = rigida ? 0 : 1; matCadena.roughness = rigida ? 0.07 : 0.13; matCadena.anisotropy = rigida ? 0.12 : 0.5;
    if (conEfecto) { pulsera.updateMatrixWorld(true); var pc = pulsera.localToWorld(camino(0.0005, new THREE.Vector3())); destello(pc, 40, 1); sacudon = 0.22; }
  }
  var api = {
    agregar: function (k, desde, yaPuesto) {
      var viejo = charms[k]; if (viejo && !viejo.sale) return;
      var ch = crearCharm(k);
      reparte();
      var de = desde ? puntoDesde(desde) : new THREE.Vector3((Math.random() - 0.5) * 2, 2.6, 1.5);
      var tA = ch.tObj - MOV.enhebra, tB = ch.tObj + MOV.enhebra, wA = anclaje(tA, new THREE.Vector3()), wB = anclaje(tB, new THREE.Vector3());
      ch.t = wA.distanceTo(de) < wB.distanceTo(de) ? tA : tB; ch.tv = 0;     // se enhebra del lado de donde viene y después se desliza
      /* (2026-11-14, realismo) Como en la realidad: el charm se ENHEBRA por la punta de la cadena, al lado del cierre, y baja
         deslizándose hasta su lugar (antes aparecía volando sobre su lugar, atravesando a los que ya estaban). Entra por la punta
         más cercana a su lugar: el último de la fila, por el final. La pulsera vuelve al frente para que se vea. */
      var porCierre = !yaPuesto && !REDUCE;
      if (porCierre) {
        var iSel = st.sel.indexOf(k), fin = iSel < 0 || iSel >= (st.sel.length - 1) / 2;
        ch.t = fin ? 1 - MOV.entraCierre : MOV.entraCierre; ch.enhebra = true;
        if (!lupa) alFrente();
      }
      anclaje(ch.t, anc);
      ch.piv.position.copy(de);
      var ctrl = de.clone().lerp(anc, 0.5); ctrl.y += 1.2;
      if (yaPuesto === 'quieto') {       // ya puesto y en reposo: sin vuelo, golpe, destello ni barrido (el 3D reemplaza al póster sin que se note)
        ch.t = ch.tObj; ch.tv = 0; ch.vol = null; ch.esc = 1; anclaje(ch.t, anc); ch.piv.position.copy(anc); ch.pre.copy(anc);
        return;
      }
      ch.vol = { de: de, ctrl: ctrl, u: REDUCE || yaPuesto ? 1 : 0, dur: porCierre ? MOV.vueloCierre : MOV.vuelo, giro: Math.random() < 0.5 ? -1 : 1 };
      if (yaPuesto) { ch.t = ch.tObj; ch.esc = 1; }
      ch.esc = 0.45; ch.pre.copy(anc);
      vivos.forEach(function (o) { if (o !== ch && !o.sale) o.om += (Math.random() - 0.5) * 1.5; });
    },
    quitar: function (k) {
      var ch = charms[k]; if (!ch) return; delete charms[k];
      if (lupa && lupa.ch === ch) cierraLupa();
      ch.vol = null; ch.sale = { vy: 1.6, vx: (Math.random() - 0.5) * 0.8, vz: 0.6, gx: (Math.random() - 0.5) * 3, gz: (Math.random() - 0.5) * 4, op: 1.25 };
      reparte();
    },
    reordenar: function () { reparte(); vivos.forEach(function (o) { o.om += 0.8; }); },
    cierraLupa: function () { cierraLupa(); },
    precarga: function (k) { if (CH[k]) textura(k); },
    cambiaBase: function () {
      if (REDUCE) { ponBase(st.base || X.baseVista, true); return; }
      basePend = st.base || X.baseVista;
      if (vitrina > 0) cambioEn = Math.max(cambioEn, 0.02);          // ya está mostrando el cierre: cambia enseguida
      else { alFrente(); extraObj = Math.PI; cambioEn = 0.5; }     // media vuelta: el cierre viene al frente y ahí cambia
      vitrina = 2.7;
    },
    talle: function (c) {
      Robj = R0 * c / 19; reparte(); sacudon = 0.15;
      vivos.forEach(function (o) { o.om += (Math.random() - 0.5) * 1.2; });
    },
    festejo: function () {
      alFrente(); festejo = REDUCE ? 0 : 2.4; if (!REDUCE) centro += Math.PI * 2;     // una vuelta lenta, destellos y el barrido de luz
      vivos.forEach(function (o, i) { o.om += 2; setTimeout(function () { if (!o.sale) destello(o.piv.position, 9, 1); }, 200 + i * 110); });
      barridoT = 0;
    },
    despierta: function () { if (!andando && !relojManual) { andando = true; saltaDelta = true; tPrev = 0; requestAnimationFrame(cuadro); } },
    cursorTexto: function () {}
  };

  /* Compilación previa (ver compila()): la escena tal como arranca, los materiales de los charms (con la foto chica y con la HD +
     relieve, en una geometría de muestra: así el primer charm y la primera foto HD no traban) y la pasada de la sombra (que dibuja
     con su propio material, sin luces, en una textura). */
  function compilaSombra(obj) {
    var g1 = new THREE.Group(), g2 = new THREE.Group(), vistos = {};
    obj.traverse(function (o) {
      if (!o.isMesh) return;
      if (o.layers.isEnabled(CAPA_SOMBRA)) {
        var k = (o.isInstancedMesh ? 'i' : 'm') + (o.instanceColor ? 'c' : '');
        if (!vistos[k]) { vistos[k] = 1; var p = o.isInstancedMesh ? new THREE.InstancedMesh(o.geometry, matSombra, 1) : new THREE.Mesh(o.geometry, matSombra); if (o.instanceColor) p.instanceColor = o.instanceColor; g1.add(p); }
      }
      if (o.layers.isEnabled(CAPA_SOMBRA_PROPIA)) g2.add(new THREE.Mesh(o.geometry, o.material));
    });
    var capas = sombra.cam.layers.mask, r = [];
    sombra.cam.layers.set(CAPA_SOMBRA); r.push(compila(g1, sombra.cam, true, scene));
    sombra.cam.layers.set(CAPA_SOMBRA_PROPIA); r.push(compila(g2, sombra.cam, true, scene));
    sombra.cam.layers.mask = capas;
    return Promise.all(r);
  }
  var maniqui = (function () {      // se guarda: si se liberaran, three borraría esos shaders
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
    var px = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); px.colorSpace = THREE.SRGBColorSpace; px.needsUpdate = true;
    var nx = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); nx.needsUpdate = true;
    var chica = matFotoDe(px), hd = matFotoDe(px); hd.normalMap = nx;
    var g = new THREE.Group();
    [chica, hd, cantoDe(px)].forEach(function (m) { var o = new THREE.Mesh(geo, m); o.layers.enable(CAPA_SOMBRA); g.add(o); });
    return g;
  })();
  function sinEsperarMas(p, ms) { return Promise.race([p, new Promise(function (ok) { setTimeout(ok, ms); })]); }

  /* Los cierres de las otras bases se arman de a uno en los ratos libres (y se compilan y suben sus texturas): al cambiar de base ya
     están listos. Si alguien cambia antes, ese cierre se arma en el momento, como antes.
     (2026-11-12) Cada cierre va en pasos chicos y solo en un rato libre de verdad (la página quieta y nadie tocando la pulsera):
     antes, armar uno y hacer la primera consulta de sus programas trababa ~120 ms cada vez, a los pocos segundos de llegar, con la
     pulsera a la vista. Devuelve una promesa: armar3d.js lo pide después de la escena de los aritos (api.extras). */
  function ratoLibre() {
    return calma(6000).then(function () {
      var ocupada = agarre || lupa || vitrina > 0 || festejo > 0 || (empezo && intro < 1) || vivos.some(function (c) { return c.vol || c.sale; });
      if (ocupada) return new Promise(function (ok) { setTimeout(ok, 500); }).then(ratoLibre);
    });
  }
  var cierresPedidos = null;
  function prearmaCierres() {
    if (cierresPedidos) return cierresPedidos;
    var tipos = Object.keys(CIERRES);
    cierresPedidos = new Promise(function (fin) {
      (function sig() {
        var t = tipos.shift(); if (!t) { tiempos.cierres = Math.round(performance.now() - T0); fin(); return; }
        if (cierres[t]) { sig(); return; }
        ratoLibre().then(function () { return respiro(false); }).then(function () {
          if (cierres[t]) return;
          var gq = cierreDe(t);
          return respiro(false).then(function () { return compilaPartes(gq, camera, false, scene); })
            .then(function () { return compilaSombra(gq); })
            .then(ratoLibre).then(asientaDeAPoco)
            .then(function () { return subeTexturas(texturasDe(gq)); });
        }).then(function () { setTimeout(sig, 80); }, function () { setTimeout(sig, 80); });
      })();
    });
    return cierresPedidos;
  }
  api.extras = prearmaCierres;

  // Arranque: la cadena se dibuja desde el frente hacia el cierre, el cierre aparece con un destello y caen tres charms de ejemplo
  ponBase(st.base || X.baseVista, false); Robj = R = R0 * cm(st.talle) / 19;      // (sin pulsera elegida: la de muestra; sin talle: 19 cm)
  actualizaCadena();
  /* armar3d.js arma la escena ANTES de que se vea (2026-11-12: apenas termina la intro del inicio). Acá se deja todo listo, en pasos
     chicos y sin dibujar nada a la vista: se compilan los shaders (de a uno), se hace la primera consulta de cada programa (que
     espera a la placa), se suben las texturas, se dejan listos los charms de entrada y se dibuja un cuadro de ensayo con el lienzo
     escondido (la pulsera completa y una pieza de muestra con los materiales de los charms: la primera vez que la placa dibuja con
     cada programa también tarda). Recién entonces la escena está "lista" (api.lista); el primer cuadro y la intro esperan a
     api.empieza(), que llega cuando el escenario se ve. */
  var compilado = false, quiereEmpezar = false, empezo = false;
  function cuadroDeEnsayo() {
    var i0 = intro, c0 = ieCam;
    ensayo = true; intro = 1; ieCam = 1; scene.add(maniqui);
    try { paso(0); } catch (e) {}
    scene.remove(maniqui); intro = i0; ieCam = c0; ensayo = false;
  }
  var calienta = sinEsperarMas(Promise.all(st.sel.slice(0, MAX).map(precalienta)), 4000);     // (las fotos se piden ya, en paralelo)
  api.lista = listoEntorno.then(function () { return respiro(urge()); }).then(function () {
    return sinEsperarMas(compilaPartes(scene, camera)
      .then(function () { return compilaPartes(maniqui, camera, false, scene); })
      .then(function () { return compilaSombra(scene); })
      .then(function () { return compilaSombra(maniqui); })
      .then(function () { return compilaPartes(escenaPlana, camPlana, true); }), 8000);
  }).then(function () {
    tiempos.compilado = Math.round(performance.now() - T0);
    return asientaDeAPoco();
  }).then(function () { return subeTexturas(texturasDe(scene)); })
    .then(function () { return calienta; })
    .then(function () { return respiro(urge()); })
    .then(function () { cuadroDeEnsayo(); return respiro(urge()); })
    .then(function () { cuadroDeEnsayo(); return respiro(urge()); })
    .then(null, function (e) { try { console.warn('Armá tu pulsera: preparación incompleta', e); } catch (x) {} })
    .then(function () {
      tiempos.asentado = Math.round(performance.now() - T0);
      compilado = true; if (quiereEmpezar) arranque();
    });
  api.empieza = function () { quiereEmpezar = true; if (compilado) arranque(); };
  api.estaLista = function () { return compilado; };
  function arranque() {
    if (empezo) return; empezo = true; tiempos.empezo = Math.round(performance.now() - T0);
    // si mientras se preparaba apareció el póster, la pulsera arranca ya armada y en reposo (sin intro), en la misma pose que la
    // foto: el 3D la reemplaza sin que se note y recién ahí empieza a moverse
    sinIntro = !!(X.sinIntro && X.sinIntro());
    // el encuadre arranca en su lugar (antes arrancaba centrado y la pulsera subía sola durante ~2 s)
    var vis0 = 2 * distCam() * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    foco.set(0, -vis0 * (X.totalFlota() ? 0.13 : (stage.clientWidth < 700 ? 0.12 : 0.05)), 0);
    if (sinIntro) { intro = 1; introChispa = true; ieCam = 1; asoma = 0; tiempo = 0; }
    requestAnimationFrame(cuadro);
    // si ya eligió charms antes de que cargara el 3D, aparecen esos
    var rapido = REDUCE || sinIntro;
    if (rapido) {
      st.sel.forEach(function (k) { api.agregar(k, null, sinIntro ? 'quieto' : true); });
      if (sinIntro) vivos.forEach(function (c) { c.t = c.tObj; c.tv = 0; });      // cada uno en su lugar definitivo
    } else st.sel.forEach(function (k, i) { setTimeout(function () { if (st.sel.indexOf(k) > -1) api.agregar(k, null, false); }, 450 + i * 110); });
    // (sin charms de ejemplo desde 2026-11-11: la pulsera arranca sola y "Tu combinación" aparece con el primer charm)
    setTimeout(function () { st.intro = false; X.pintaResumen(); }, rapido ? 50 : 1300);
    setTimeout(sueltaCalentados, 6000);
    if (!X.obra) setTimeout(prearmaCierres, rapido ? 1500 : 3500);     // (sin turnos compartidos: como antes, después de la intro)
  }

  /* ═════════ Hook de pruebas (solo con ?a3debug) ═════════ */
  if (X.debug) {
    var px = new Uint8Array(4), gl = renderer.getContext();
    var medirAhora = function () {
      for (var i = 0; i < 6; i++) pinta();
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      var t0 = performance.now();
      for (i = 0; i < 30; i++) { pinta(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
      return +((performance.now() - t0) / 30).toFixed(2);
    };
    window.__a3 = {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera, api: api, tex: TEX, vivos: vivos, tiempos: tiempos,
      cierresArmados: function () { return Object.keys(cierres); },
      destellos: function () { return cuentaBrillos; },
      relojManual: function (si) { relojManual = !!si; if (!si) { andando = false; api.despierta(); } },
      avanza: function (seg, n) { for (var i = 0; i < (n || 1); i++) paso(seg || 1 / 30); },
      repiteIntro: function () { intro = 0; ieCam = 0; introChispa = false; tiempo = 0; barridoT = -1; proxBarrido = 0.35; },
      lupa: function (k) { if (k === 'cierre') abreLupa({ cierre: true }); else if (charms[k]) abreLupa({ ch: charms[k] }); else cierraLupa(); },
      barrido: function () { barridoT = 0; },
      poster: function () {      // la pose del primer cuadro cuando el 3D reemplaza a la foto: tiempo 0, colgantes en reposo, encuadre en su lugar
        brillos.forEach(function (b) { b.vida = 0; b.sp.visible = false; }); barridoT = -1; barridoLuz.intensity = 0; esperaG = esperaC = 1e9;
        vivos.forEach(function (c) { c.t = c.tObj; c.tv = 0; c.th = c.om = c.ph = c.ov = 0; c.golpe = 0; c.hov = 0; c.barrido = -1; if (c.matFoto) c.matFoto.userData.barrido.value = -1; c.col.scale.set(1, 1, 1); });
        tiempo = 0; asoma = 0; rotY = centro; rotV = 0; parX = parY = 0; sacudon = 0; zoom = 1;
        var v0 = 2 * distCam() * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); foco.set(0, -v0 * (X.totalFlota() ? 0.13 : (stage.clientWidth < 700 ? 0.12 : 0.05)), 0);
        paso(1 / 60); return renderer.domElement.toDataURL('image/png');
      },
      foto: FOTO_U,
      tonos: function (t) { renderer.toneMapping = { neutral: THREE.NeutralToneMapping, agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, no: THREE.NoToneMapping }[t]; scene.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { m.needsUpdate = true; }); }); },
      nivel: function () { return NIVELES[iNivel].n; },
      medir: function () {           // ms por cuadro del 3D solo (sombra + escena), en cada nivel de calidad
        var r = {}, antes = iNivel;
        for (var i = 0; i < NIVELES.length; i++) { iNivel = i; aplicaNivel(); r[NIVELES[i].n] = medirAhora(); }
        iNivel = antes; aplicaNivel(); r.info = { triangulos: renderer.info.render.triangles, llamadas: renderer.info.render.calls };
        return r;
      },
      memoria: function (n) {        // suma y saca n charms de a uno y compara geometrías y texturas antes y después
        var antes = { geometrias: renderer.info.memory.geometries, texturas: renderer.info.memory.textures };
        var ks = DATA.charms.map(function (c) { return c.k; }).filter(function (k) { return st.sel.indexOf(k) < 0; });
        var lista = []; for (var i = 0; i < n; i++) lista.push(ks[i % ks.length]);
        return new Promise(function (ok) {
          var j = 0;
          (function paso() {
            if (j >= lista.length) { setTimeout(function () { ok({ antes: antes, despues: { geometrias: renderer.info.memory.geometries, texturas: renderer.info.memory.textures }, probados: lista.length, vivos: vivos.length }); }, 3500); return; }
            var k = lista[j++]; X.agregar(k);
            setTimeout(function () { X.quitar(k, false); setTimeout(paso, 150); }, 500);
          })();
        });
      }
    };
  }
  return api;
};
})();
