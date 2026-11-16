/* Panthera — "Armá tu oreja": la ESCENA (prototipo, 2026-11-11, tercera versión: "super realista").
   Pedidos del usuario: "usar la oreja de una mujer real", "de la argolla puesta solo se ve un lado" y "los aritos se ven muy
   falsos... quiero que sea super realista". En las fotos de Panthera con el aro puesto, la argolla se ve CASI DE CANTO: un óvalo
   angosto que sale del agujero y cuelga casi entero por debajo del lóbulo; el dije cuelga de frente. Por eso:
   - La oreja es una FOTO (foto-oreja.webp) y su máscara (foto-mascara.png: dónde hay oreja).
   - La ARGOLLA es 3D de verdad (no la foto del producto, que la muestra de 3/4 con su cara de adentro): un aro con el perfil de
     una argolla huggie (medidas sacadas de la foto de cada aro), de metal (oro, plata), casi de canto, que ATRAVIESA el lóbulo: un
     plano invisible con la forma de la oreja tapa lo que queda detrás de ella (la mitad de atrás de la argolla), y debajo del borde
     del lóbulo se ve entera. Con cristales donde la argolla los tiene (pavé).
   - El DIJE es la foto del producto (recortada del cuello para abajo), con volumen, y cuelga del fondo de la argolla (péndulo).
   - Luz: la de la FOTO (entorno armado con la piel, el pelo y una ventana arriba a la izquierda), no la del estudio: el oro refleja
     lo que hay alrededor. Los dijes se igualan a la foto (saturación, brillos, grano).
   - Sombras suaves: sobre la oreja (pegadas al aro) y sobre el cuello (más atrás: corridas y más difusas).
   - El ear cuff abraza el borde de la oreja: lo que pasa por detrás del borde no se ve.
   - Una foto no gira: al arrastrar, los aros se hamacan; con el mouse, un paralaje suave.
   Devuelve la misma API que la escena anterior (oreja.js casi no cambia: lee data-arg con las medidas de la argolla). */
(function () {
'use strict';
window.PNT_OR_ESCENA = function (THREE, X) {
  var $ = X.$, st = X.st, AR = X.AR, fmt = X.fmt;
  var DBG = X.debug || {}, F = X.foto;
  var stage = $('stage'), canvas = $('c');

  /* ═════════ Motor ═════════ */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!DBG.poster });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;     // (con VSM, en esta escena no salían)
  var ANISO = renderer.capabilities.getMaxAnisotropy();
  /* (2026-11-16, pedido: "en mobile, en 3D, los charms, la pulsera y los aritos se ven con mucha menos calidad que en la computadora") En el celular el
     escenario es chico (~390 × 300 px) pero la pantalla tiene 3 píxeles por punto: con el tope de 2 (y bajando a 1,5 o 1,25 apenas el scroll del celular
     hacía un cuadro lento, cosa que pasa siempre al deslizar) se dibujaba a la mitad o menos de la nitidez de la pantalla. En el celular el piso es 2 y
     el nivel alto usa la pantalla entera (3). En compu no cambia. */
  function dprDe(d) { return stage.clientWidth < 700 ? (d >= 2 ? 3 : 2) : d; }
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  var NIVELES = [{ n: 'bajo', dpr: 1.25 }, { n: 'medio', dpr: 1.5 }, { n: 'alto', dpr: 2 }];
  var iNivel = 2, techo = 2;

  /* ═════════ La foto: de píxeles a la escena ═════════ */
  var ESC = F.escala, CX = F.foco[0], CY = F.foco[1], LADO = F.lado || 1;
  function aMundo(px, py, out) { return (out || new THREE.Vector3()).set((px - CX) * ESC, -(py - CY) * ESC, 0); }
  var FOTO_MIN_X = -CX * ESC, FOTO_MAX_X = (F.w - CX) * ESC, FOTO_MAX_Y = CY * ESC, FOTO_MIN_Y = -(F.h - CY) * ESC;
  var ANCHO_FOTO = FOTO_MAX_X - FOTO_MIN_X, ALTO_FOTO = FOTO_MAX_Y - FOTO_MIN_Y;
  var cargaTex = new THREE.TextureLoader();
  var listoFoto = new Promise(function (ok, mal) {
    cargaTex.load(F.url, function (t) {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
      // (decodificada fuera del hilo de la página antes de usarla: subir a la placa 6 megapíxeles sin decodificar la traba)
      var im = t.image; (im && im.decode ? im.decode().catch(function () {}) : Promise.resolve()).then(function () { ok(t); });
    }, undefined, function () { mal(new Error('no cargó la foto')); });
  });
  var U_FOTO = { value: new THREE.Vector4(FOTO_MIN_X, FOTO_MIN_Y, 1 / ANCHO_FOTO, 1 / ALTO_FOTO) };
  var U_MASC = { value: null }, U_GRANO = { value: 0.016 };
  var listoMasc = new Promise(function (ok) {
    if (!F.mascara) { ok(); return; }
    cargaTex.load(F.mascara, function (t) { t.colorSpace = THREE.NoColorSpace; U_MASC.value = t; ok(); }, undefined, function () { ok(); });
  });
  var fondo = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_FOTO, ALTO_FOTO), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, depthWrite: false, depthTest: false }));
  fondo.position.set((FOTO_MIN_X + FOTO_MAX_X) / 2, (FOTO_MIN_Y + FOTO_MAX_Y) / 2, 0); fondo.renderOrder = -2; scene.add(fondo);
  // la oreja tapa lo que pasa por detrás de ella (la mitad de atrás de cada argolla): un plano invisible que solo escribe
  // profundidad donde hay oreja. Así la argolla atraviesa el lóbulo como en la realidad, y debajo del borde se ve entera.
  // (con la prueba de profundidad apagada WebGL tampoco la escribe: va prendida y siempre pasa)
  var tapa = new THREE.Mesh(fondo.geometry, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, depthTest: true, depthFunc: THREE.AlwaysDepth, alphaTest: 0.5 }));
  tapa.position.copy(fondo.position); tapa.renderOrder = -1.5; tapa.visible = false; scene.add(tapa);
  // las sombras de los aros: sobre la oreja (en su plano: pegadas) y sobre el cuello/pelo (más atrás: corridas y más difusas)
  var noProyecta = new THREE.MeshDepthMaterial();
  noProyecta.onBeforeCompile = function (sh) { sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() {\n\tdiscard;'); };
  noProyecta.customProgramCacheKey = function () { return 'pnt-or-noproy'; };
  var PROY = ['vec3 dP = vMundoR - cameraPosition; vec2 pP = cameraPosition.xy + dP.xy * (-cameraPosition.z / dP.z);',
    'float mP = texture2D(uMasc, (pP - uFoto.xy) * uFoto.zw).g;'].join('\n');
  function receptor(z, adentro, opac) {
    var m = new THREE.ShadowMaterial({ opacity: opac, depthWrite: false });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uMasc = U_MASC; sh.uniforms.uFoto = U_FOTO;
      sh.vertexShader = 'varying vec3 vMundoR;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n\tvMundoR = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform sampler2D uMasc;\nuniform vec4 uFoto;\nvarying vec3 vMundoR;\n' + sh.fragmentShader.replace('#include <tonemapping_fragment>',
        '{\n' + PROY + '\ngl_FragColor.a *= ' + (adentro ? 'mP' : '(1.0 - mP)') + ';\n}\n#include <tonemapping_fragment>');
    };
    m.customProgramCacheKey = function () { return 'pnt-or-sombra' + (adentro ? 1 : 0); };
    var r = new THREE.Mesh(fondo.geometry, m); r.position.set(fondo.position.x, fondo.position.y, z);
    r.receiveShadow = true; r.customDepthMaterial = noProyecta; r.renderOrder = -1; r.visible = false; scene.add(r);
    return r;
  }
  var sombraOreja = receptor(0.0005, true, 0.26), sombraFondo = receptor(-0.65, false, 0.15);   // (2026-11-14) la del cuello más leve: se veía como una mancha sucia junto a los dijes

  /* ═════════ Luz: el entorno de la FOTO → PMREM (los aros reflejan la piel, el pelo y la ventana; la foto es una foto) ═════════ */
  var LUZ = new THREE.Vector3().fromArray(F.luz || [-1.6, 3, 6.5]);
  function entornoFoto() {
    var s = new THREE.Scene();
    s.background = new THREE.Color(0.05, 0.04, 0.04);
    var cv = document.createElement('canvas'); cv.width = 4; cv.height = 128;
    var g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#dcd6d0'); gr.addColorStop(0.34, '#bba395'); gr.addColorStop(0.5, '#8e7062'); gr.addColorStop(0.66, '#4e3d35'); gr.addColorStop(1, '#1d1714');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
    var tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    s.add(new THREE.Mesh(new THREE.SphereGeometry(40, 24, 16), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide })));
    function panel(w, h, col, k, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); return m;
    }
    var l = LUZ.clone().normalize(), E = F.entorno || {};
    function col(c, def) { return new THREE.Color(c || def); }
    panel(12, 9, 0xfff4ec, 2.7, l.x * 13, l.y * 13, l.z * 13);           // la ventana de la foto (de ahí viene su luz)
    panel(7, 10, 0xfff8f2, 1.3, 8, 1.5, 10);                              // una segunda claridad, adelante a la derecha
    panel(9, 12, col(E.cara, '#c98a6e'), 1.0, LADO * 12, -1, 2);          // la cara (piel) del lado de la cara
    panel(8, 13, col(E.pelo, '#4d3123'), 0.9, -LADO * 11, 0, -5);         // el pelo, del otro lado y atrás
    panel(8, 10, 0xe8e6e4, 0.85, -LADO * 11, 3, 6);                       // el fondo claro del estudio, adelante del pelo
    panel(18, 12, col(E.cuello, '#9a654a'), 0.75, 0, -1, -12);            // atrás: la piel del cuello
    panel(14, 5, 0xb08a7a, 0.45, 0, -9, 6);                               // abajo adelante: el hombro
    return s;
  }
  var ENV_ARG = null;
  function tiras(ent) {
    var l = [];
    function tira(w, h, k, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfffaf4).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); l.push(m);
    }
    tira(1.6, 16, 5.5, -LADO * 7, 3, 10);      // una tira alta adelante, del lado de la ventana: el brillo largo de la cara de la argolla
    tira(1.0, 14, 3.2, LADO * 9, 1, 7);        // otra más fina del otro lado: el filo del canto
    tira(14, 1.2, 2.4, 0, 11, 4);              // una de arriba: la luz que corre por la curva
    return l;
  }
  var rtCompila = new THREE.WebGLRenderTarget(4, 4);
  function compila(obj, cam, enTextura, escena) {
    if (!renderer.compileAsync) return Promise.resolve();
    var antes = renderer.getRenderTarget(), p;
    renderer.setRenderTarget(enTextura ? rtCompila : null);
    try { p = renderer.compileAsync(obj, cam, escena || null); } catch (e) { p = Promise.resolve(); }
    renderer.setRenderTarget(antes);
    return p.catch(function () {});
  }
  /* En pasos chicos (2026-11-12, como la escena de pulseras): crear los programas, la primera consulta de cada uno (que espera a
     la placa) y la subida de cada textura van de a poco, dejando dibujar un cuadro entre tanda y tanda (X.respiro: secciones.js →
     PNT_3D): la página no se traba aunque se la esté desplazando. urge(): el escenario ya se ve, no hay que dejar pasar cuadros. */
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
  function sinEsperarMas(p, ms) { return Promise.race([p, new Promise(function (ok) { setTimeout(ok, ms); })]); }
  var T0 = performance.now(), tiempos = {};
  var listoEntorno = (function () {
    var pmrem = new THREE.PMREMGenerator(renderer), ent = entornoFoto(), previo = Promise.resolve(), rc = null;
    try {
      rc = pmrem._renderCube; pmrem._renderCube = function () {};
      pmrem._setSize(256); var t = pmrem._allocateTarget(); pmrem._getSourceTarget(true);
      pmrem._blur(t, 0.02); pmrem._applyPMREM(t);
      pmrem._renderCube = rc; rc = null; t.dispose();
      var g = new THREE.Group(), caja = pmrem._boxMesh.geometry;
      [pmrem._blurMaterial, pmrem._ggxMaterial, pmrem._integrationMaterial].forEach(function (m) { if (m) g.add(new THREE.Mesh(caja, m)); });
      ent.traverse(function (o) { if (o.isMesh) g.add(new THREE.Mesh(o.geometry, o.material)); });
      previo = compila(g, pmrem._cubeCamera.children[0], true);
    } catch (e) { if (rc) pmrem._renderCube = rc; }
    return previo.then(function () {
      scene.environment = pmrem.fromScene(ent, 0.03).texture;
      // la argolla (2026-11-12, "parece falso"): con el entorno de la piel quedaba un dorado opaco, casi oliva. Una argolla pulida
      // en una foto de joyería tiene brillos finos y nítidos (tiras de luz) contra reflejos oscuros: su propio entorno, el mismo de
      // la foto más tres tiras claras. Los dijes siguen con el de la foto.
      tiras(ent).forEach(function (m) { ent.add(m); });
      ENV_ARG = pmrem.fromScene(ent, 0.012).texture;
      Object.keys(matsArgolla).forEach(function (k) { matsArgolla[k].envMap = ENV_ARG; matsArgolla[k].needsUpdate = true; });
      pmrem.dispose(); ent.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
      tiempos.entorno = Math.round(performance.now() - T0);
    });
  })();
  // la luz de la foto (la misma dirección que la ventana): ilumina el relieve de los dijes y da las sombras
  // el cuadro de la sombra: alrededor de los agujeros (los dijes cuelgan hasta ~3,8 por debajo)
  var xs = [], ys = [];
  Object.keys(F.agujeros).forEach(function (id) { var v = aMundo(F.agujeros[id][0], F.agujeros[id][1]); xs.push(v.x); ys.push(v.y); });
  var bx0 = Math.min.apply(null, xs) - 1.4, bx1 = Math.max.apply(null, xs) + 1.4, by0 = Math.min.apply(null, ys) - 3.8, by1 = Math.max.apply(null, ys) + 1;
  var SOL_OBJ = new THREE.Vector3((bx0 + bx1) / 2, (by0 + by1) / 2, 0), MITAD = Math.max(bx1 - bx0, by1 - by0) * 0.55;
  var sol = new THREE.DirectionalLight(0xfff4ec, 0.85); sol.position.copy(SOL_OBJ).add(LUZ); sol.target.position.copy(SOL_OBJ);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.005; sol.shadow.radius = 12;
  var sc = sol.shadow.camera; sc.left = -MITAD; sc.right = MITAD; sc.top = MITAD; sc.bottom = -MITAD; sc.near = 1; sc.far = 20;
  scene.add(sol); scene.add(sol.target);

  /* ═════════ Los agujeros (sobre la foto) ═════════ */
  var NOMBRES = { l1: '1.er arito', l2: '2.º arito', l3: '3.er arito', cuff: 'Ear cuff' };
  var IDS = ['l1', 'l2', 'l3', 'cuff'], AG = {};
  var ABRE = { l1: 0.07, l2: 0.05, l3: 0.09 };           // (2026-11-14, 2.ª vuelta) casi de canto del todo: abierta se veía como un gancho en "J", grueso           // cuánto se abre cada argolla (desde de canto): cada una cuelga apenas distinta
  var oreja = new THREE.Group(); scene.add(oreja);
  // el agujero: un hundido chiquito y rojizo (como en las fotos con el aro puesto); libre se marca un poco más
  var texHoyo = (function () {
    var n = 64, c = document.createElement('canvas'); c.width = c.height = n; var g = c.getContext('2d');
    var rg = g.createRadialGradient(32, 30, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(60,22,28,0.95)'); rg.addColorStop(0.28, 'rgba(110,40,45,0.55)'); rg.addColorStop(0.62, 'rgba(150,70,70,0.14)'); rg.addColorStop(1, 'rgba(150,70,70,0)');
    g.fillStyle = rg; g.fillRect(0, 0, n, n);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  var matPunto = new THREE.MeshBasicMaterial({ map: texHoyo, transparent: true, opacity: 0.9, depthTest: true, depthWrite: false, toneMapped: false });
  var matPuntoOcupado = new THREE.MeshBasicMaterial({ map: texHoyo, transparent: true, opacity: 0.75, depthTest: true, depthWrite: false, toneMapped: false });
  var geoPunto = new THREE.PlaneGeometry(0.085, 0.07), geoToque = new THREE.SphereGeometry(0.3, 10, 8), matToque = new THREE.MeshBasicMaterial({ visible: false });
  IDS.forEach(function (id, i) {
    var esCuff = id === 'cuff', g = new THREE.Group(); aMundo(F.agujeros[id][0], F.agujeros[id][1], g.position); oreja.add(g);
    var punto = new THREE.Mesh(geoPunto, matPunto); punto.position.z = 0.001; punto.renderOrder = 0.5; if (!esCuff) g.add(punto);
    var mat = new THREE.MeshBasicMaterial({ color: esCuff ? 0xEEC049 : 0xF4ACC4, transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false });
    var anillo = new THREE.Mesh(esCuff ? new THREE.TorusGeometry(0.3, 0.016, 10, 72) : new THREE.TorusGeometry(0.12, 0.013, 10, 56), mat); anillo.renderOrder = 1; g.add(anillo);
    var toque = new THREE.Mesh(geoToque, matToque); toque.userData.agujero = id; if (esCuff) toque.scale.setScalar(1.4); g.add(toque);
    AG[id] = { g: g, punto: punto, anillo: anillo, toque: toque, vis: 0, res: 0, act: 0, idx: i, nombre: NOMBRES[id], abre: ABRE[id] || 0.38 };
  });
  function visibleAg(id) { return id === 'cuff' || +id.slice(1) <= st.huecos; }

  /* ═════════ Destellos: solo en el festejo (comprar). En la oreja no hay estrellitas: el brillo lo da el metal ═════════ */
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
  var estrella = texEstrella(), brillos = [], proxB = 0, wp = new THREE.Vector3(), cuentaBrillos = 0;
  for (var bi = 0; bi < 16; bi++) {
    var spB = new THREE.Sprite(new THREE.SpriteMaterial({ map: estrella, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false, opacity: 0, toneMapped: false }));
    spB.visible = false; spB.renderOrder = 5; scene.add(spB); brillos.push({ sp: spB, vida: 0, dur: 0.5, tam: 0.1, giro: 0 });
  }
  function brilla(pos, tam, dur) {
    cuentaBrillos++;
    var c = brillos[proxB++ % brillos.length];
    c.sp.position.copy(pos); c.sp.visible = true; c.vida = 1; c.dur = dur || (0.45 + Math.random() * 0.3); c.tam = tam; c.giro = (Math.random() - 0.5) * 0.5;
    c.sp.material.rotation = (Math.random() - 0.5) * 0.25;
  }
  function destello(pos, cant, radio) {
    var n = Math.max(1, Math.min(5, Math.round((cant || 9) / 9))), base = pos.clone(), r = radio || 0.3;
    for (var i = 0; i < n; i++) (function (i) {
      setTimeout(function () { brilla(wp.set((Math.random() - 0.5) * r, (Math.random() - 0.5) * r, 0.1 + Math.random() * 0.1).add(base).clone(), 0.1 + Math.random() * 0.08); }, i * 90);
    })(i);
  }
  function animaBrillos(dt) {
    for (var i = 0; i < brillos.length; i++) {
      var c = brillos[i]; if (c.vida <= 0) continue;
      c.vida -= dt / c.dur;
      var f = c.vida > 0 ? Math.min(1, (1 - c.vida) * 5) * Math.pow(Math.max(0, c.vida), 0.7) : 0;
      c.sp.material.opacity = f; c.sp.scale.setScalar(c.tam * (0.35 + 0.65 * f)); c.sp.material.rotation += c.giro * dt;
      if (c.vida <= 0) c.sp.visible = false;
    }
  }

  /* ═════════ Los aros: argolla 3D + dije de la foto (con volumen, como los charms del armador) ═════════ */
  var CONT = window.PNT_OR_CONTORNOS || {}, TEX = {}, HD = {};
  function textura(k) {
    if (!TEX[k]) {
      var t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
      t.userData.lista = new Promise(function (ok) {
        (function pide(intento) {
          new THREE.ImageLoader().load(AR[k].img + (intento ? '?r=' + intento : ''), function (im) { t.image = im; t.needsUpdate = true; ok(); },
            undefined, function () { if (intento < 4) setTimeout(function () { pide(intento + 1); }, 600 * (intento + 1)); else ok(); });
        })(0);
      });
      TEX[k] = t;
    }
    return TEX[k];
  }
  function texturaHD(k) {
    var c = AR[k]; if (!c.hd) return null;
    if (!HD[k]) {
      var h = HD[k] = { usos: 0, foto: null, normal: null, lista: null };
      // (cada foto se decodifica fuera del hilo de la página antes de avisar: así subirla a la placa no la decodifica de golpe)
      var deco = function (t) { var im = t.image; return im && im.decode ? im.decode().catch(function () {}) : Promise.resolve(); };
      var pf = new Promise(function (ok) {
        cargaTex.load(c.hd, function (t) {
          t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
          deco(t).then(function () { if (HD[k] !== h) t.dispose(); else { h.foto = t; avisaHD(k); } ok(); });
        }, undefined, function () { ok(); });
      });
      var pn = !c.hdn ? Promise.resolve() : new Promise(function (ok) {
        cargaTex.load(c.hdn, function (t) { t.anisotropy = ANISO; deco(t).then(function () { if (HD[k] === h) { h.normal = t; avisaHD(k); } else t.dispose(); ok(); }); }, undefined, function () { ok(); });
      });
      h.lista = Promise.all([pf, pn]);
    }
    HD[k].usos++; return HD[k];
  }
  function avisaHD(k) { var a = aros[k]; if (a && a.matFoto) ponHD(a); }
  function ponHD(a) {
    var h = HD[a.k], m = a.matFoto; if (!h || !m) return;
    if (h.foto && m.map !== h.foto) {
      m.map = h.foto; m.needsUpdate = true; a.matCanto.map = h.foto; a.matCanto.needsUpdate = true;
      if (a.matProf) { a.matProf.map = h.foto; a.matProf.needsUpdate = true; }
    }
    if (h.normal && m.normalMap !== h.normal) { m.normalMap = h.normal; m.normalScale.set(1, 1); m.needsUpdate = true; }
  }
  function sueltaHD(k) { var h = HD[k]; if (!h) return; if (--h.usos <= 0) { if (h.foto) h.foto.dispose(); if (h.normal) h.normal.dispose(); delete HD[k]; } }

  // el grano de la foto (los aros no pueden verse más limpios que la piel)
  function conGrano(sh) {
    sh.uniforms.uGrano = U_GRANO;
    sh.fragmentShader = 'uniform float uGrano;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
      '#include <dithering_fragment>\n\tgl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uGrano;');
  }
  // el dije: de la foto queda del cuello para abajo (la argolla de la foto se descarta); el cuff: lo que cae fuera de la oreja
  // (por detrás del borde) no se ve
  var VERT_MUNDO = ['#include <project_vertex>', 'vMundoR = (modelMatrix * vec4(transformed, 1.0)).xyz;'].join('\n');
  var FRAG_CORTE = [
    '#include <alphatest_fragment>',
    '#ifdef USE_MAP',
    'if (1.0 - vMapUv.y < uCorte) discard;',
    '#endif',
    'if (uCuff > 0.5) {',
    PROY,
    '  if (mP < 0.5) discard;',
    '}'
  ].join('\n');
  function conCorte(sh, a) {
    sh.uniforms.uCorte = a.uCorte; sh.uniforms.uCuff = a.uCuff; sh.uniforms.uMasc = U_MASC; sh.uniforms.uFoto = U_FOTO;
    sh.vertexShader = 'varying vec3 vMundoR;\n' + sh.vertexShader.replace('#include <project_vertex>', VERT_MUNDO);
    sh.fragmentShader = 'uniform float uCorte;\nuniform float uCuff;\nuniform sampler2D uMasc;\nuniform vec4 uFoto;\nvarying vec3 vMundoR;\n' +
      sh.fragmentShader.replace('#include <alphatest_fragment>', FRAG_CORTE);
  }
  // la foto del dije, igualada a la foto de la oreja: algo menos saturada, brillos de estudio más suaves, apenas más cálida
  var FOTO_FRAG = [
    '{',
    '  vec3 foto = diffuseColor.rgb;',
    '  float fL = dot(foto, vec3(0.2126, 0.7152, 0.0722));',
    '  foto = mix(vec3(fL), foto, uSatFoto) * uExpoFoto;',
    '  vec3 kq = max(foto - 0.5, 0.0); foto = foto - kq + kq / (1.0 + kq * 1.6);',
    '  foto *= uTinteFoto;',
    '  float fMx = max(foto.r, max(foto.g, foto.b)), fMn = min(foto.r, min(foto.g, foto.b));',
    '  float plataF = 1.0 - smoothstep(0.16, 0.45, (fMx - fMn) / max(fMx, 1e-3));',
    '  float oroF = smoothstep(0.18, 0.5, (fMx - fMn) / max(fMx, 1e-3)) * step(foto.b, foto.r);',
    '  outgoingLight = foto * uBaseFoto + max(totalSpecular - uVelo, vec3(0.0)) * uBrilloFoto * mix(0.3, 1.0, max(plataF, oroF * 0.8));',
    '  if (uBarrido > -0.5) {',
    '    float bnd = exp(-pow((vMapUv.x * 0.7 + (1.0 - vMapUv.y) * 0.6 - uBarrido * 1.7 + 0.25) * 7.0, 2.0));',
    '    outgoingLight += vec3(bnd * 0.45 * mix(0.35, 1.0, max(plataF, oroF)));',
    '  }',
    '}'
  ].join('\n');
  var FOTO_U = { uBaseFoto: { value: 0.98 }, uBrilloFoto: { value: 0.45 }, uVelo: { value: 0.12 }, uSatFoto: { value: 0.88 }, uExpoFoto: { value: 0.88 },
    uTinteFoto: { value: new THREE.Color(1.0, 0.965, 0.95) } };
  function matFotoDe(tex, a) {
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 1, roughness: 0.24, alphaTest: 0.5, alphaToCoverage: true, toneMapped: false });
    m.onBeforeCompile = function (sh) {
      for (var u in FOTO_U) sh.uniforms[u] = FOTO_U[u];
      sh.uniforms.uBarrido = m.userData.barrido;
      conCorte(sh, a); conGrano(sh);
      sh.fragmentShader = 'uniform float uBaseFoto;\nuniform float uBrilloFoto;\nuniform float uVelo;\nuniform float uSatFoto;\nuniform float uExpoFoto;\nuniform vec3 uTinteFoto;\nuniform float uBarrido;\n' +
        sh.fragmentShader.replace('#include <opaque_fragment>', FOTO_FRAG + '\n#include <opaque_fragment>');
    };
    m.userData.barrido = { value: -1 };
    m.customProgramCacheKey = function () { return 'pnt-or-foto4'; };
    return m;
  }
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
  function cantoDe(tex, ancho, alto, a) {
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.9, roughness: 0.3, envMapIntensity: 1 });
    m.userData.tap = { value: new THREE.Vector2(0.018 / Math.max(ancho || 0.3, 0.05), 0.018 / Math.max(alto || 0.5, 0.05)) };
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uTap = m.userData.tap; sh.uniforms.uOscuro = { value: 0.8 };
      conCorte(sh, a); conGrano(sh);
      sh.fragmentShader = 'uniform vec2 uTap;\nuniform float uOscuro;\n' + sh.fragmentShader.replace('#include <map_fragment>', CANTO_FRAG);
    };
    m.customProgramCacheKey = function () { return 'pnt-or-canto4'; };
    return m;
  }
  // la sombra del dije: con el mismo corte (sin la argolla de la foto)
  function profDe(tex, a) {
    var m = new THREE.MeshDepthMaterial({ map: tex, alphaTest: 0.5 });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uCorte = a.uCorte;
      sh.fragmentShader = 'uniform float uCorte;\n' + sh.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n#ifdef USE_MAP\n\tif (1.0 - vMapUv.y < uCorte) discard;\n#endif');
    };
    m.customProgramCacheKey = function () { return 'pnt-or-prof'; };
    return m;
  }
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
  function suavizaCanto(g) {
    var gr = g.groups[1]; if (!gr) return;
    var pos = g.attributes.position, nor = g.attributes.normal, acc = {}, i, k, a;
    function clave_(j) { return Math.round(pos.getX(j) * 2e4) + ',' + Math.round(pos.getY(j) * 2e4) + ',' + Math.round(pos.getZ(j) * 2e4); }
    for (i = gr.start; i < gr.start + gr.count; i++) { k = clave_(i); a = acc[k] || (acc[k] = [0, 0, 0]); a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i); }
    for (i = gr.start; i < gr.start + gr.count; i++) { a = acc[clave_(i)]; var l = Math.hypot(a[0], a[1], a[2]) || 1; nor.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    nor.needsUpdate = true;
  }
  function geoAro(c, ancho, alto) {
    var lista = CONT[c.k]; if (!lista || !lista[0] || lista[0].length < 6) return null;
    function pts(arr) { var p = []; for (var i = 0; i < arr.length; i += 2) p.push(new THREE.Vector2((arr[i] - c.cx) * ancho, (c.ag - arr[i + 1]) * alto)); return suaviza(p, 2); }
    var ext = pts(lista[0]); if (THREE.ShapeUtils.isClockWise(ext)) ext.reverse();
    var forma = new THREE.Shape(ext);
    lista.slice(1).forEach(function (h) { var hp = pts(h); if (!THREE.ShapeUtils.isClockWise(hp)) hp.reverse(); forma.holes.push(new THREE.Path(hp)); });
    var grosor = c.tipo === 'cuff' ? 0.07 : 0.06, bev = grosor * 0.3, cuerpo = Math.max(0.002, grosor - 2 * bev);
    function uvDe(v, j) { return new THREE.Vector2(v[j * 3] / ancho + c.cx, 1 - c.ag + v[j * 3 + 1] / alto); }
    var uv = {
      generateTopUV: function (g, v, a, b, d) { return [uvDe(v, a), uvDe(v, b), uvDe(v, d)]; },
      generateSideWallUV: function (g, v, a, b, d, e) { return [uvDe(v, a), uvDe(v, b), uvDe(v, d), uvDe(v, e)]; }
    };
    var g = new THREE.ExtrudeGeometry(forma, { depth: cuerpo, bevelEnabled: true, bevelThickness: bev, bevelSize: Math.min(0.008, ancho * 0.02), bevelSegments: 3, curveSegments: 1, UVGenerator: uv });
    suavizaCanto(g); g.translate(0, 0, -cuerpo / 2);
    return g;
  }
  /* La argolla huggie en 3D: un aro (torno) con perfil de rectángulo redondeado: D de diámetro de afuera, w de ancho (a lo largo de
     su eje) y t de espesor. Se arma con el eje en z (de frente) y el punto de arriba en el origen (ahí está el agujero). */
  function geoArgolla(D, w, t, centrado) {
    var Rc = D / 2 - t / 2, rr = Math.min(t, w) * 0.49, ro = Rc + t / 2, ri = Rc - t / 2, ya = w / 2, n = 5, pts = [];
    function arco(cx, cy, a0, a1) { for (var i = 0; i <= n; i++) { var u = a0 + (a1 - a0) * i / n; pts.push(new THREE.Vector2(cx + rr * Math.cos(u), cy + rr * Math.sin(u))); } }
    pts.push(new THREE.Vector2(ro, 0));                                  // mitad de la cara de afuera (ahí cierra el perfil, sin quiebre)
    arco(ro - rr, ya - rr, 0, Math.PI / 2);
    arco(ri + rr, ya - rr, Math.PI / 2, Math.PI);
    arco(ri + rr, -ya + rr, Math.PI, Math.PI * 1.5);
    arco(ro - rr, -ya + rr, Math.PI * 1.5, Math.PI * 2);
    pts.push(new THREE.Vector2(ro, 0));
    var g = new THREE.LatheGeometry(pts, 120);
    if (!centrado) { g.rotateX(Math.PI / 2); g.translate(0, -Rc, 0); }   // (centrado: el anillo acostado, eje vertical, para el cuff)
    return g;
  }
  var METAL = { oro: new THREE.Color(1.0, 0.74, 0.3), plata: new THREE.Color(0.93, 0.92, 0.89), rosa: new THREE.Color(0.98, 0.7, 0.6) };
  var matsArgolla = {};
  function matArgolla(metal, propio) {
    metal = METAL[metal] ? metal : 'oro';
    if (propio || !matsArgolla[metal]) {
      // (2026-11-14, realismo) un poco menos espejo: el dije es una foto, más suave, y al lado la argolla parecía de otro metal
      var m = new THREE.MeshPhysicalMaterial({ color: METAL[metal].clone(), metalness: 1, roughness: metal === 'plata' ? 0.14 : 0.19, envMapIntensity: 0.98, envMap: ENV_ARG });
      // donde entra en la piel el metal se apaga (el agujero no le deja ver la luz): cerca del plano de la oreja y solo sobre la
      // oreja (máscara); debajo del lóbulo la argolla queda entera y con su brillo, salvo la mitad de atrás, a la sombra del lóbulo
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uMasc = U_MASC; sh.uniforms.uFoto = U_FOTO;
        sh.vertexShader = 'varying vec3 vMundoR;\n' + sh.vertexShader.replace('#include <project_vertex>', VERT_MUNDO);
        sh.fragmentShader = 'uniform sampler2D uMasc;\nuniform vec4 uFoto;\nvarying vec3 vMundoR;\n' + sh.fragmentShader.replace('#include <opaque_fragment>',
          '{ float mE = texture2D(uMasc, (vMundoR.xy - uFoto.xy) * uFoto.zw).g;\n' +
          '  outgoingLight *= mix(1.0, mix(0.2, 1.0, smoothstep(0.0, 0.3, vMundoR.z)), mE);\n' +
          '  outgoingLight *= mix(0.5, 1.0, smoothstep(-0.4, 0.02, vMundoR.z)); }\n#include <opaque_fragment>');
        conGrano(sh);
      };
      m.customProgramCacheKey = function () { return 'pnt-or-arg2'; };
      if (propio) return m;
      matsArgolla[metal] = m;
    }
    return matsArgolla[metal];
  }
  /* (2026-11-14, realismo) El metal de la argolla 3D toma el tono de la argolla de la FOTO del producto (la franja de arriba de la
     foto, entre g.arriba y g.abajo): antes todas eran el mismo oro saturado y al lado de su dije parecían otra pieza. Se promedian
     los píxeles de brillo medio (ni el destello ni la sombra) y se lleva el color a pleno, que es lo que espera un metal. */
  function tonoDeLaFoto(a, g, tex) {
    if (!tex || !tex.userData.lista) return;
    tex.userData.lista.then(function () {
      var im = tex.image; if (!im || !im.width || !a.arg || a.sale) return;
      try {
        var n = 56, cv = document.createElement('canvas'); cv.width = cv.height = n;
        var x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, n, n);
        var y0 = Math.max(0, Math.floor((g ? g.arriba : 0) * n)), y1 = Math.min(n, Math.max(y0 + 3, Math.ceil((g && g.abajo > g.arriba ? g.abajo : 0.4) * n)));
        var d = x.getImageData(0, y0, n, y1 - y0).data, px = [];
        for (var i = 0; i < d.length; i += 4) if (d[i + 3] > 210) px.push([0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2], d[i], d[i + 1], d[i + 2]]);
        if (px.length < 12) return;
        px.sort(function (p, q) { return p[0] - q[0]; });
        var r = 0, v = 0, b = 0, m = 0;
        for (i = Math.floor(px.length * 0.45); i < Math.floor(px.length * 0.88); i++) { r += px[i][1]; v += px[i][2]; b += px[i][3]; m++; }
        if (!m) return;
        var col = new THREE.Color().setRGB(r / m / 255, v / m / 255, b / m / 255, THREE.SRGBColorSpace);
        var mx = Math.max(col.r, col.g, col.b, 1e-3); col.multiplyScalar(0.96 / mx);
        a.arg.material.color.lerp(col, 0.82);
      } catch (e) { /* sin permiso para leer la foto: queda el tono del metal */ }
    });
  }
  // pavé: cristales chiquitos por la cara de afuera (menos abajo, donde cuelga el dije y cierra la argolla)
  var geoPiedra = null, matPiedra = null;
  function pave(D, w, t, c0, c1, centrado) {
    if (!geoPiedra) {
      geoPiedra = new THREE.CylinderGeometry(0.3, 0.5, 0.26, 8); geoPiedra.translate(0, 0.13, 0);   // la corona de un brillante: mesa y facetas
      matPiedra = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f6, metalness: 0, roughness: 0.03, ior: 2.15, specularIntensity: 1, envMapIntensity: 2.4, iridescence: 0.5, iridescenceIOR: 1.6 });
      matPiedra.onBeforeCompile = function (sh) { conGrano(sh); };
      matPiedra.customProgramCacheKey = function () { return 'pnt-or-piedra'; };
    }
    var Rc = D / 2 - t / 2, ro = Rc + t / 2, s = Math.min(w * 0.5, 0.13);
    var n = Math.max(8, Math.round((c1 - c0) * ro / (s * 1.02)));
    var inst = new THREE.InstancedMesh(geoPiedra, matPiedra, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), arriba = new THREE.Vector3(0, 1, 0),
      nr = new THREE.Vector3(), p = new THREE.Vector3(), esc = new THREE.Vector3(s, s, s);
    for (var i = 0; i < n; i++) {
      var ph = c0 + (c1 - c0) * (i + 0.5) / n;
      nr.set(Math.sin(ph), 0, Math.cos(ph));                              // en el marco del torno: el anillo acostado (eje y)
      p.copy(nr).multiplyScalar(ro - s * 0.04);
      q.setFromUnitVectors(arriba, nr); m4.compose(p, q, esc); inst.setMatrixAt(i, m4);
    }
    inst.castShadow = false;
    if (centrado) return inst;
    var gr = new THREE.Group(); gr.rotation.x = Math.PI / 2; gr.position.y = -Rc; gr.add(inst); gr.userData.inst = inst;   // como la geometría de la argolla
    return gr;
  }
  // la sombra de contacto donde la argolla entra en la piel: la oclusión del agujero (la piel se oscurece alrededor del metal,
  // un poco más hacia abajo y hacia el lado contrario a la ventana). Solo sobre la oreja (máscara), nunca sobre el cuello.
  var ENTRA = 0.17;
  var texContacto = (function () {
    var c = document.createElement('canvas'); c.width = 64; c.height = 128; var g = c.getContext('2d');
    g.save(); g.scale(1, 2);
    var rg = g.createRadialGradient(32, 22, 0, 32, 26, 32);
    rg.addColorStop(0, 'rgba(50,18,14,0.92)'); rg.addColorStop(0.3, 'rgba(62,24,18,0.62)'); rg.addColorStop(0.62, 'rgba(85,36,28,0.2)'); rg.addColorStop(1, 'rgba(90,40,32,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64); g.restore();
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  var geoContacto = new THREE.PlaneGeometry(1, 1);
  function contactoDe(w) {
    var m = new THREE.MeshBasicMaterial({ map: texContacto, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uMasc = U_MASC; sh.uniforms.uFoto = U_FOTO;
      sh.vertexShader = 'varying vec3 vMundoR;\n' + sh.vertexShader.replace('#include <project_vertex>', VERT_MUNDO);
      sh.fragmentShader = 'uniform sampler2D uMasc;\nuniform vec4 uFoto;\nvarying vec3 vMundoR;\n' + sh.fragmentShader.replace('#include <opaque_fragment>',
        'diffuseColor.a *= texture2D(uMasc, (vMundoR.xy - uFoto.xy) * uFoto.zw).g;\n#include <opaque_fragment>');
    };
    m.customProgramCacheKey = function () { return 'pnt-or-contacto'; };
    var o = new THREE.Mesh(geoContacto, m);
    var an = Math.max(0.36, w * 3.2), al = 0.42;      // corrida hacia el lado contrario a la ventana (de ahí viene la luz)
    o.scale.set(an, al, 1); o.position.set(-Math.sign(LUZ.x || -1) * 0.05, -al * 0.26, 0.002); o.renderOrder = 1.5;
    return o;
  }
  var aros = {}, vivos = [], CUFF_GIRO = F.cuffGiro || 0;
  // ear cuffs que son un anillo (no un moño): van en 3D, acostados, abrazando el borde del hélix; de frente se ve la banda que lo
  // cruza, del lado de atrás queda tapado por la oreja y apenas asoma pasando el borde
  var CUFF_3D = { cshi: { D: 0.78, w: 0.2, t: 0.1, metal: 'plata', pave: true } };
  function crearAro(k, hueco) {
    var c = AR[k], tex = textura(k), esCuff = c.tipo === 'cuff';
    var piv = new THREE.Group(); scene.add(piv);
    var col = new THREE.Group(); piv.add(col);
    var alto = c.alto, ancho = alto * c.asp;
    var a = { k: k, hueco: hueco, piv: piv, col: col, alto: alto, ancho: ancho, th: 0, om: 0, thD: 0, omD: 0, ph: 0, ov: 0, vol: null, sale: null, lupa: 0, hov: 0,
      barrido: -1, esc: 0.001, semilla: Math.random() * 10, pre: new THREE.Vector3(), velX: 0, uCorte: { value: 0 }, uCuff: { value: esCuff ? 1 : 0 }, mallas: [] };
    var g = c.arg;
    if (!esCuff) {
      var D = g && g.abajo - g.arriba > 0.05 ? (g.abajo - g.arriba) * alto : 1.15;
      D = Math.max(0.85, Math.min(1.75, D));
      /* (2026-11-14, realismo) A ESCALA REAL: la oreja de la foto mide ~6,1 cm (1 unidad = 1 cm) y una argollita de estas, 1,1–1,2 cm.
         Los altos que salieron de las fotos daban argollas de hasta 1,75 cm: se veían enormes en el lóbulo. La pieza entera (argolla
         + dije) se achica hasta que la argolla mida 1,2 cm como mucho (fe); el dije conserva su proporción con ella. Y la argolla
         es más fina: 1,1–2 mm de ancho (era hasta 2,6) y 0,8–1,1 mm de espesor (era hasta 1,5). */
      var fe = D > 1.2 ? Math.max(0.7, 1.2 / D) : 1;
      D *= fe; a.fe = fe; a.alto = alto * fe; a.ancho = ancho * fe;
      var w = Math.max(0.1, Math.min(0.16, (g ? g.banda : 0.24) * D * 0.62)), t = Math.max(0.075, Math.min(0.1, w * 0.5 + 0.015));
      a.D = D; a.w = w; a.t = t;
      a.geoA = geoArgolla(D, w, t);
      var arg = new THREE.Mesh(a.geoA, matArgolla(g ? g.metal : 'oro', true));
      arg.userData.propia = true; a.matArg = arg.material; tonoDeLaFoto(a, g, tex);
      arg.castShadow = true; arg.renderOrder = 2; arg.userData.aro = a;
      arg.rotation.y = -LADO * (Math.PI / 2 - (AG[hueco] ? AG[hueco].abre : 0.38));   // casi de canto: la mitad de adelante, del lado de la cara
      // ENTRA en el lóbulo (2026-11-12, "el broche que engancha la oreja parece falso"): antes la punta de arriba quedaba apoyada
      // sobre la piel, con su tapa redonda a la vista. El agujero está en el medio del espesor del lóbulo: la argolla va un poco
      // más atrás y se inclina para que abajo vuelva adelante; así sale DE la piel, con el corte donde la tapa la oculta.
      arg.position.z = -ENTRA; arg.rotation.x = -Math.atan(ENTRA / (D - t * 0.5));
      col.add(arg); a.arg = arg; a.mallas.push(arg);
      a.contacto = contactoDe(w); piv.add(a.contacto);
      if (g && g.pave) { a.pave = pave(D, w, t, 0.6, Math.PI * 2 - 0.6); arg.add(a.pave); }       // sin piedras abajo (cuelga el dije, cierra)
      a.uCorte.value = g ? g.corte : 0;
      // el dije cuelga del fondo de la argolla, de frente (con un giro chiquito propio de cada uno)
      var dije = new THREE.Group(); dije.position.set(0, -(D - t), 0.03); dije.scale.setScalar(fe); col.add(dije); a.dije = dije;
      a.giroD = (Math.random() - 0.5) * 0.36;
    }
    var c3 = esCuff && CUFF_3D[k];
    if (c3) {
      a.geoA = geoArgolla(c3.D, c3.w, c3.t, true);
      var anillo = new THREE.Mesh(a.geoA, matArgolla(c3.metal)); anillo.castShadow = true; anillo.renderOrder = 2; anillo.userData.aro = a;
      // su centro, adentro del pliegue del hélix: un poco hacia adentro del borde y un poco hacia atrás
      if (F.bordeCuff) { var bc = aMundo(F.bordeCuff[0], F.bordeCuff[1]), ac = aMundo(F.agujeros.cuff[0], F.agujeros.cuff[1]); anillo.position.set(bc.x - ac.x + LADO * 0.13, bc.y - ac.y, -0.16); }
      col.add(anillo); a.arg = anillo; a.malla = anillo; a.mallas.push(anillo);
      if (c3.pave) { a.pave = pave(c3.D, c3.w, c3.t, -1.9, 1.9, true); anillo.add(a.pave); }
      aros[k] = a; vivos.push(a);
      return a;
    }
    var geo = geoLista[k] || geoAro(c, ancho, alto); delete geoLista[k];
    if (!geo) { geo = new THREE.PlaneGeometry(ancho, alto); geo.translate((0.5 - c.cx) * ancho, (c.ag - 0.5) * alto, 0); }
    a.geo = geo;
    a.matFoto = matFotoDe(tex, a); a.matCanto = cantoDe(tex, ancho, alto, a);
    var m = new THREE.Mesh(geo, geo.groups && geo.groups.length > 1 ? [a.matFoto, a.matCanto] : a.matFoto);
    m.castShadow = true; m.userData.aro = a; m.renderOrder = 2;
    if (!esCuff) {
      a.matProf = profDe(tex, a); m.customDepthMaterial = a.matProf;
      var cxc = g ? g.cxCorte : c.cx, yc = g ? g.corte : c.ag;
      m.position.set(-(cxc - c.cx) * ancho, -(c.ag - yc) * alto - a.t * 0.5, 0);     // el cuello del dije, justo debajo de la argolla
      a.dije.add(m);
    } else {
      col.add(m);
    }
    a.malla = m; a.mallas.push(m);
    aros[k] = a; vivos.push(a);
    if (texturaHD(k)) ponHD(a);
    return a;
  }
  function liberaAro(a) {
    scene.remove(a.piv);
    [a.matFoto, a.matCanto, a.matProf, a.matArg].forEach(function (m) { if (m) m.dispose(); });
    if (a.geo) a.geo.dispose(); if (a.geoA) a.geoA.dispose(); if (a.contacto) a.contacto.material.dispose();
    if (a.pave) { var pi = a.pave.isInstancedMesh ? a.pave : a.pave.userData.inst; if (pi) pi.dispose(); }
    sueltaHD(a.k);
  }
  function opacidad(a, op) {
    a.piv.traverse(function (o) {
      if (!o.isMesh) return;
      [].concat(o.material).forEach(function (m) {
        if (o === a.arg || o.isInstancedMesh) {            // las compartidas: se clonan una vez para poder apagarlas
          if (!o.userData.propia) { o.material = m = m.clone(); o.userData.propia = true; }
        }
        m.transparent = true; m.opacity = op;
      });
    });
  }

  /* ═════════ Cámara: encuadre sobre la foto (nunca se ve más allá de su borde) ═════════ */
  function medir() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function aplicaNivel() { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprDe(NIVELES[iNivel].dpr))); medir(); }
  new ResizeObserver(medir).observe(stage); aplicaNivel();
  function altoVista() {      // alto visible en el plano de la foto (sin zoom)
    // (2026-11-15, pedido: "en mobile acercá la oreja para ver de más cerca los aritos") escenario de celular apaisado y bajo: más zoom (altoM)
    var asp = camera.aspect, cel = asp < 0.9, mov = !cel && F.altoM && stage.clientWidth < 700, quiere = (cel ? F.altoCel : (mov ? F.altoM : F.alto)) * ESC;
    return Math.min(quiere, ANCHO_FOTO * 0.995 / asp, ALTO_FOTO * 0.995);
  }
  function focoBase(out) { var cel = camera.aspect < 0.9, mov = !cel && F.focoM && stage.clientWidth < 700, f = cel ? F.focoCel : (mov ? F.focoM : F.foco); return aMundo(f[0], f[1], out); }
  function encierra(v, H) {   // que la vista (alto H) no se salga de la foto
    var hw = H * camera.aspect / 2, hh = H / 2;
    v.x = Math.max(FOTO_MIN_X + hw, Math.min(FOTO_MAX_X - hw, v.x)); v.y = Math.max(FOTO_MIN_Y + hh, Math.min(FOTO_MAX_Y - hh, v.y));
    return v;
  }
  var ritmo = 16.7, lento = 0, rapido = 0, ultimoCambio = 0;
  function vigilaRitmo(ms, ahora) {
    ritmo += (ms - ritmo) * 0.08;
    if (ahora - ultimoCambio < 2500) return;
    if (ritmo > 22 && iNivel > 0) { lento += ms; if (lento > 1800) { iNivel--; aplicaNivel(); ultimoCambio = ahora; lento = 0; } } else lento = 0;
    if (ritmo < 17.6 && iNivel < techo) { rapido += ms; if (rapido > 9000) { iNivel++; aplicaNivel(); ultimoCambio = ahora; rapido = 0; } } else rapido = 0;
  }

  /* ═════════ Interacción: arrastrar hamaca los aros; tocar un aro (lupa) o un agujero libre (elegirlo) ═════════ */
  var MOV = {
    vuelo: 0.85, inclina: 0.06,
    argolla: 38, argollaAmort: 5,             // la argolla gira poco alrededor del agujero (la sostiene el lóbulo)
    pendulo: 52, penduloAmort: 2.6,           // el dije cuelga libre del fondo de la argolla: corto, oscila rápido y poco
    empuje: 0.03, hamaca: 0.024,
    barridoDur: 1.5,
    camara: 2.4, zoomCuff: 0.42,
    intro: 0.65
  };
  var agarre = null, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), sobre = null, sobreAg = null;
  var lupa = null, lupaT = 0, saltar = false, zoom = 1, foco = new THREE.Vector3(), focoObj = new THREE.Vector3(), parX = 0, parY = 0, objX = 0, objY = 0, empuje = 0;
  var FINO = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  function aNdc(cx, cy) { var r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); }
  function tocado(e) {
    aNdc(e.clientX, e.clientY); ray.setFromCamera(ndc, camera);
    var ms = []; vivos.forEach(function (a) { if (!a.sale && !a.vol) ms = ms.concat(a.mallas); });
    var h = ray.intersectObjects(ms, false); if (h.length) return { aro: h[0].object.userData.aro };
    var ts = IDS.filter(function (id) { return visibleAg(id) && !st.pos[id]; }).map(function (id) { return AG[id].toque; });
    h = ray.intersectObjects(ts, false); if (h.length) return { ag: h[0].object.userData.agujero };
    return null;
  }
  function hamaca(a, dx) { a.om += dx * MOV.hamaca * 0.3 * (0.8 + 0.4 * Math.random()); a.omD += dx * MOV.hamaca * (0.8 + 0.4 * Math.random()); }
  canvas.addEventListener('pointerdown', function (e) {
    saltar = true;
    agarre = { x: e.clientX, x0: e.clientX, y0: e.clientY, t: tocado(e), movio: false };
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('agarra');
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!agarre) { var t = tocado(e); sobre = t && t.aro || null; sobreAg = t && t.ag || null; canvas.classList.toggle('sobre', !!t); return; }
    var dx = e.clientX - agarre.x; agarre.x = e.clientX;
    if (Math.hypot(e.clientX - agarre.x0, e.clientY - agarre.y0) > 6) agarre.movio = true;
    if (!agarre.movio) return;
    empuje += dx;                                         // arrastrar: los aros se hamacan para ese lado
    vivos.forEach(function (a) { if (!a.sale && !a.vol && AR[a.k].tipo !== 'cuff') hamaca(a, dx); });
  });
  function suelta() {
    if (!agarre) return;
    var a = agarre; agarre = null; canvas.classList.remove('agarra');
    if (a.movio) return;
    if (a.t && a.t.aro) abreLupa(a.t.aro);
    else if (a.t && a.t.ag) { cierraLupa(); X.activa(a.t.ag); }
    else if (lupa) cierraLupa();
  }
  function abreLupa(a) { lupa = a; lupaT = 0; sobre = null; canvas.classList.remove('sobre'); X.muestraLupa({ k: a.k, hueco: a.hueco }); }
  function cierraLupa() { if (!lupa) return; lupa = null; X.muestraLupa(null); }
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lupa) cierraLupa(); });
  canvas.addEventListener('pointerup', suelta); canvas.addEventListener('pointercancel', suelta);
  canvas.addEventListener('pointerleave', function () { sobre = null; sobreAg = null; canvas.classList.remove('sobre'); });
  window.addEventListener('pointermove', function (e) {
    if (FINO) { var rs = stage.getBoundingClientRect(); objX = Math.max(-1, Math.min(1, ((e.clientX - rs.left) / rs.width) * 2 - 1)); objY = Math.max(-1, Math.min(1, ((e.clientY - rs.top) / rs.height) * 2 - 1)); }
  }, { passive: true });

  var vS = new THREE.Vector3(), resaltado = null;
  function enPantalla(id) { AG[id].g.getWorldPosition(vS); vS.project(camera); var r = canvas.getBoundingClientRect(); return { x: r.left + (vS.x + 1) / 2 * r.width, y: r.top + (1 - vS.y) / 2 * r.height }; }
  function masCerca(cx, cy, k) {
    var c = AR[k], mejor = null, dist = 1e9;
    IDS.forEach(function (id) {
      if (!visibleAg(id) || (c && (c.tipo === 'cuff') !== (id === 'cuff'))) return;
      var p = enPantalla(id), d = Math.hypot(p.x - cx, p.y - cy); if (d < dist) { dist = d; mejor = id; }
    });
    var r = canvas.getBoundingClientRect(), dentro = cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;
    return dentro ? mejor : null;
  }
  var etq = $('etiqueta'), vP = new THREE.Vector3();
  function puntoDesde(el) {
    var r = el.getBoundingClientRect(), rc = canvas.getBoundingClientRect();
    ndc.set(((r.left + r.width / 2 - rc.left) / rc.width) * 2 - 1, -((r.top + r.height / 2 - rc.top) / rc.height) * 2 + 1);
    ndc.x = Math.max(-1.4, Math.min(1.4, ndc.x)); ndc.y = Math.max(-1.9, Math.min(1.3, ndc.y));
    ray.setFromCamera(ndc, camera);
    return ray.ray.at(camera.position.length() * 0.42, new THREE.Vector3());
  }
  var anc = new THREE.Vector3();
  function anclaje(a, out) {        // el agujero en la foto: la argolla pasa justo por ahí (el cuff, apenas adelante del borde)
    AG[a.hueco].g.getWorldPosition(out); out.z = a.hueco === 'cuff' ? 0.06 : 0;
    return out;
  }

  /* ═════════ Barrido de luz: solo en el festejo ═════════ */
  var barridoLuz = new THREE.DirectionalLight(0xffffff, 0); barridoLuz.position.set(-6, 4.5, 3.5); scene.add(barridoLuz);
  var barridoT = -1;
  function animaBarrido(dt) {
    if (barridoT < 0) return;
    barridoT += dt / MOV.barridoDur;
    var u = Math.min(1, barridoT), f = Math.sin(u * Math.PI);
    barridoLuz.position.set(-7 + 14 * u, 4.5, 3.5); barridoLuz.intensity = 2.2 * f * f;
    if (barridoT >= 1) { barridoT = -1; barridoLuz.intensity = 0; }
  }

  /* ═════════ Cuadro a cuadro ═════════ */
  var timer = new THREE.Timer(), saltaDelta = true, relojManual = false;
  var asoma = 1;      // 0 → 1: el vaivén propio de cada aro entra de a poco al arrancar sin intro (igual al póster en el primer cuadro)
  var tiempo = 0, festejo = 0, primero = true, intro = 0, andando = true, tPrev = 0;
  var sinIntro = !!(X.sinIntro && X.sinIntro());
  var qCam = new THREE.Quaternion(), cX = new THREE.Vector3(), cY = new THREE.Vector3(), cZ = new THREE.Vector3(), cM = new THREE.Matrix4();
  function caraCamara(out) { cX.set(1, 0, 0).applyQuaternion(camera.quaternion); cY.set(0, 1, 0); cZ.crossVectors(cX, cY); cM.makeBasis(cX, cY, cZ); return out.setFromRotationMatrix(cM); }
  var ensayo = false;   // cuadros de ensayo (antes de arrancar): se dibujan con el lienzo escondido y no cuentan como el primero
  function pinta() { renderer.setRenderTarget(null); renderer.render(scene, camera); }
  function cuadro(ts) {
    if (relojManual) return;
    if (!X.enVista()) { andando = false; return; }
    timer.update(ts);
    var dt = saltaDelta ? 1 / 60 : Math.min(timer.getDelta(), 0.05); saltaDelta = false;
    if (tPrev) vigilaRitmo(ts - tPrev, ts); tPrev = ts;
    paso(dt);
    requestAnimationFrame(cuadro);
  }
  function paso(dt) {
    tiempo += dt; if (asoma < 1) asoma = Math.min(1, asoma + dt / 1.6);
    if (saltar && intro < 1) intro = 1;
    saltar = false;
    if (intro < 1) intro = Math.min(1, intro + dt / MOV.intro);
    if (festejo > 0) festejo = Math.max(0, festejo - dt);
    if (lupa) lupaT += dt;
    empuje *= Math.pow(0.02, dt);
    // cámara: entra apenas desde más lejos; en la lupa se acerca al aro; con el mouse, un paralaje suave. Siempre adentro de la foto
    var H = altoVista();
    var zLupa = lupa ? (lupa.hueco === 'cuff' ? MOV.zoomCuff : Math.max(0.3, Math.min(0.72, lupa.alto / (H * 0.56)))) : 1;
    zoom += (zLupa - zoom) * Math.min(1, dt * MOV.camara);
    focoBase(focoObj);
    var flota = X.totalFlota();
    if (lupa && !lupa.sale) {
      focoObj.copy(lupa.piv.position); focoObj.y -= lupa.alto * 0.42;
      if (flota) { focoObj.x += H * camera.aspect * 0.11 * zoom; focoObj.y += H * 0.03 * zoom; } else focoObj.y -= H * 0.12 * zoom;
    }
    foco.lerp(focoObj, Math.min(1, dt * MOV.camara));
    var mano = agarre || lupa ? 0 : 1;
    parX += (objX * 0.16 * mano - parX) * Math.min(1, dt * 2.2); parY += (objY * 0.1 * mano - parY) * Math.min(1, dt * 2.2);
    var Hz = H * zoom, mira = encierra(new THREE.Vector3(foco.x + parX, foco.y - parY, 0), Hz);
    var dist = (Hz / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(mira.x, mira.y, dist); camera.lookAt(mira.x, mira.y, 0);
    oreja.updateMatrixWorld(true);
    caraCamara(qCam);

    // los agujeros: aparecen en la intro; el elegido late; el ocupado queda como un hundido donde entra la argolla
    var t0 = MOV.intro * 0.45;
    IDS.forEach(function (id, i) {
      var ag = AG[id], ver = visibleAg(id) && (intro >= 1 || tiempo > t0 + i * 0.14) ? 1 : 0, ocupado = !!st.pos[id];
      ag.vis += (ver - ag.vis) * Math.min(1, dt * 7);
      var act = st.activo === id && !ocupado ? 1 : 0, res = resaltado === id || sobreAg === id ? 1 : 0;
      ag.act += (act - ag.act) * Math.min(1, dt * 8); ag.res += (res - ag.res) * Math.min(1, dt * 10);
      var late = ag.act * (0.5 + 0.5 * Math.sin(tiempo * 4.2));
      ag.anillo.scale.setScalar(Math.max(0.001, ag.vis * (1 + 0.16 * late + 0.35 * ag.res)));
      ag.anillo.material.opacity = ag.vis * (ocupado ? 0 : 0.55 + 0.35 * ag.act + 0.3 * ag.res);
      ag.anillo.visible = ag.anillo.material.opacity > 0.01;
      ag.punto.visible = ag.vis > 0.02 && id !== 'cuff'; ag.punto.scale.setScalar(Math.max(0.001, ag.vis));
      ag.punto.material = ocupado ? matPuntoOcupado : matPunto;
    });

    for (var vi = vivos.length - 1; vi >= 0; vi--) {
      var a = vivos[vi], p = a.piv, c = AR[a.k], esCuff = c.tipo === 'cuff';
      anclaje(a, anc);
      if (a.vol) {
        a.vol.u = Math.min(1, a.vol.u + dt / a.vol.dur);
        var e = 1 - Math.pow(1 - a.vol.u, 3), a0 = a.vol.de, c0 = a.vol.ctrl, ie2 = 1 - e;
        p.position.set(ie2 * ie2 * a0.x + 2 * ie2 * e * c0.x + e * e * anc.x, ie2 * ie2 * a0.y + 2 * ie2 * e * c0.y + e * e * anc.y, ie2 * ie2 * a0.z + 2 * ie2 * e * c0.z + e * e * anc.z);
        p.quaternion.copy(qCam);
        a.esc = 0.45 + 0.55 * e; a.col.rotation.z = ie2 * ie2 * 0.3 * a.vol.giro + (esCuff ? CUFF_GIRO * e : 0); a.col.rotation.x = 0;
        if (a.vol.u >= 1) {
          a.vol = null;
          if (!esCuff) { a.om = 0.5 * (Math.random() < 0.5 ? -1 : 1); a.omD = 1.5 * (Math.random() < 0.5 ? -1 : 1); }
          vivos.forEach(function (o) { if (o !== a && !o.sale && AR[o.k].tipo !== 'cuff') o.omD += (Math.random() - 0.5) * 0.6; });
        }
      } else if (a.sale) {
        a.sale.vy -= 9.5 * dt; p.position.y += a.sale.vy * dt; p.position.x += a.sale.vx * dt; p.position.z += a.sale.vz * dt;
        p.rotateX(a.sale.gx * dt); p.rotateZ(a.sale.gz * dt);
        a.sale.op -= dt * 1.5;
        opacidad(a, Math.max(0, a.sale.op));
        if (a.sale.op <= 0 || p.position.y < -12) { liberaAro(a); vivos.splice(vi, 1); continue; }
      } else {
        if (a.mueve) {
          a.mueve.u = Math.min(1, a.mueve.u + dt / 0.55);
          var em = a.mueve.u < 0.5 ? 2 * a.mueve.u * a.mueve.u : 1 - Math.pow(-2 * a.mueve.u + 2, 2) / 2;
          anc.lerpVectors(a.mueve.de, anc, em); anc.z += Math.sin(em * Math.PI) * 0.6;
          if (a.mueve.u >= 1) { a.mueve = null; a.omD += 0.9; }
        }
        a.hov += ((sobre === a && !agarre ? 1 : 0) - a.hov) * Math.min(1, dt * 9);
        p.position.copy(anc);
        p.quaternion.copy(qCam);
        var enLupa = lupa === a;
        a.lupa += ((enLupa ? 1 : 0) - a.lupa) * Math.min(1, dt * 3);
        if (!esCuff) {
          var vx = (anc.x - a.pre.x) / Math.max(dt, 1e-3), acel = (vx - a.velX) / Math.max(dt, 1e-3); a.velX = vx;
          // la argolla: gira poco alrededor del agujero
          a.om += (-MOV.argolla * a.th - MOV.argollaAmort * a.om - acel * MOV.empuje * 0.25) * dt;
          a.th = Math.max(-0.3, Math.min(0.3, a.th + a.om * dt));
          // el dije: péndulo colgado del fondo de la argolla (thD es su ángulo en el mundo)
          a.omD += (-MOV.pendulo * a.thD - MOV.penduloAmort * a.omD - acel * MOV.empuje) * dt;
          a.thD = Math.max(-0.8, Math.min(0.8, a.thD + a.omD * dt)); if (Math.abs(a.thD) >= 0.8) a.omD *= -0.3;
          a.ov += (-13 * a.ph - 1.8 * a.ov) * dt;
          a.ph = Math.max(-0.1, Math.min(0.4, a.ph + a.ov * dt));
          a.col.rotation.z = a.th + Math.sin(tiempo * 0.9 + a.semilla) * 0.006 * asoma; a.col.rotation.x = 0;
          a.dije.rotation.z = a.thD - a.th + Math.sin(tiempo * 1.2 + a.semilla) * 0.02 * asoma;
          a.dije.rotation.x = -MOV.inclina + a.ph;
          a.dije.rotation.y = a.giroD + Math.sin(lupaT * 0.8) * 0.45 * a.lupa;     // en la lupa, el dije gira despacio y muestra su volumen
          var abre = -LADO * (Math.PI / 2 - AG[a.hueco].abre);                    // si cambia de agujero, se acomoda a ese
          if (a.arg) a.arg.rotation.y += (abre - a.arg.rotation.y) * Math.min(1, dt * 6);
        } else { a.col.rotation.z = CUFF_GIRO; a.col.rotation.x = 0; a.th = a.om = 0; }
        if (a.col.scale.y !== 1) a.col.scale.set(1, 1, 1);
      }
      a.pre.copy(anc);
      if (a.contacto) {      // la sombra del agujero: solo con la argolla puesta (no mientras vuela, se muda o se va)
        var mc = a.contacto.material, oc = !a.vol && !a.sale && !a.mueve ? 0.85 : 0;
        if (!a.contactoVisto) { a.contactoVisto = true; if (!a.vol) mc.opacity = oc; }     // puesto 'quieto' (póster): ya está
        mc.opacity += (oc - mc.opacity) * Math.min(1, dt * (oc ? 5 : 14)); a.contacto.visible = mc.opacity > 0.01;
      }
      if (a.barrido >= 0 && a.matFoto) { a.barrido += dt / 0.65; a.matFoto.userData.barrido.value = a.barrido; if (a.barrido > 1.3) { a.barrido = -1; a.matFoto.userData.barrido.value = -1; } }
      var metaE = a.sale || a.vol ? a.esc : (sobre === a ? 1.025 : 1);
      if (!a.vol && !a.sale) a.esc += (metaE - a.esc) * Math.min(1, dt * 10);
      p.scale.setScalar(Math.max(0.001, a.esc));
    }
    animaBarrido(dt);
    animaBrillos(dt);

    if ((sobre || sobreAg) && !agarre && !lupa) {
      var txt, clave_;
      if (sobre && !sobre.sale && !sobre.vol) { vP.copy(sobre.piv.position); vP.y += 0.12; clave_ = 'a' + sobre.k; txt = '<b>' + AR[sobre.k].n + '</b>' + fmt(AR[sobre.k].p) + ' · <small>tocá para verlo de cerca</small>'; }
      else if (sobreAg) { AG[sobreAg].g.getWorldPosition(vP); vP.y += 0.25; clave_ = 'g' + sobreAg; txt = '<b>' + AG[sobreAg].nombre + '</b><small>' + (sobreAg === 'cuff' ? 'Sin perforación · tocá para elegir un cuff' : 'Libre · tocá para elegirlo') + '</small>'; }
      if (txt) {
        vP.project(camera);
        etq.style.left = ((vP.x + 1) / 2 * stage.clientWidth) + 'px'; etq.style.top = ((1 - vP.y) / 2 * stage.clientHeight) + 'px';
        if (etq.dataset.k !== clave_) { etq.dataset.k = clave_; etq.innerHTML = txt; }
        etq.hidden = false;
      }
    } else if (!etq.hidden) { etq.hidden = true; etq.dataset.k = ''; }

    pinta();
    if (primero && !ensayo) { primero = false; canvas.classList.add('ve'); $('cargando').classList.add('listo'); X.pintaResumen(); }
  }

  var api = {
    agregar: function (k, desde, hueco, yaPuesto) {
      var viejo = aros[k]; if (viejo && !viejo.sale) { api.mueve(k, hueco); return; }
      var a = crearAro(k, hueco);
      oreja.updateMatrixWorld(true);
      var de = desde ? puntoDesde(desde) : new THREE.Vector3((Math.random() - 0.5) * 2, 2.6, 2);
      anclaje(a, anc);
      if (yaPuesto === 'quieto') {      // ya puesto y en reposo (el 3D reemplaza al póster): sin vuelo ni vaivén
        a.esc = 1; a.piv.position.copy(anc); a.pre.copy(anc); return;
      }
      a.piv.position.copy(de);
      // (2026-11-14, realismo) llega DE FRENTE: pasa por delante del lóbulo (hacia la cámara) y recién ahí entra a su lugar, como
      // cuando uno se pone un arito. Antes hacía un arco por arriba y caía de costado, girando.
      var ctrl = anc.clone(); ctrl.z += 2.6; ctrl.y += 0.35; ctrl.x += (de.x - anc.x) * 0.12;
      a.vol = { de: de, ctrl: ctrl, u: yaPuesto ? 1 : 0, dur: MOV.vuelo, giro: Math.random() < 0.5 ? -1 : 1 };
      a.esc = yaPuesto ? 1 : 0.45; a.pre.copy(anc);
    },
    quitar: function (k) {
      var a = aros[k]; if (!a) return; delete aros[k];
      if (lupa === a) cierraLupa();
      a.vol = null; a.mueve = null; a.sale = { vy: 1.2, vx: (Math.random() - 0.5) * 0.8, vz: 0.9, gx: (Math.random() - 0.5) * 3, gz: (Math.random() - 0.5) * 4, op: 1.25 };
    },
    mueve: function (k, hueco) {
      var a = aros[k]; if (!a || a.hueco === hueco) return;
      var de = anclaje(a, new THREE.Vector3());
      a.hueco = hueco; a.mueve = { de: de, u: 0 };
    },
    resalta: function (cx, cy, k) { resaltado = cx == null ? null : masCerca(cx, cy, k); return resaltado; },
    huecos: function () { vivos.forEach(function (o) { if (AR[o.k].tipo !== 'cuff') o.omD += (Math.random() - 0.5) * 0.8; }); },
    cierraLupa: function () { cierraLupa(); },
    precarga: function (k) { if (AR[k]) textura(k); },
    festejo: function () {
      festejo = 2.4; barridoT = 0;
      vivos.forEach(function (o, i) {
        o.barrido = 0; if (AR[o.k].tipo !== 'cuff') o.omD += (i % 2 ? -1 : 1) * 1.6;
        setTimeout(function () { if (!o.sale) destello(o.piv.position.clone().add(new THREE.Vector3(0, -o.alto * 0.4, 0.1)), 9, o.ancho); }, 200 + i * 120);
      });
    },
    despierta: function () { if (!andando && !relojManual) { andando = true; saltaDelta = true; tPrev = 0; requestAnimationFrame(cuadro); } }
  };

  var maniqui = (function () {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
    var px = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); px.colorSpace = THREE.SRGBColorSpace; px.needsUpdate = true;
    var nx = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); nx.needsUpdate = true;
    var falso = { uCorte: { value: 0 }, uCuff: { value: 0 } };
    var chica = matFotoDe(px, falso), hd = matFotoDe(px, falso); hd.normalMap = nx;
    var g = new THREE.Group();
    [chica, hd, cantoDe(px, 1, 1, falso), matArgolla('oro')].forEach(function (m) { var o = new THREE.Mesh(geo, m); o.castShadow = true; o.customDepthMaterial = profDe(px, falso); g.add(o); });
    pave(1, 0.25, 0.12, 0, 1, true); g.add(new THREE.Mesh(geo, matPiedra));
    return g;
  })();
  /* Arranque (2026-11-12, como la escena de pulseras): oreja3d.js arma la escena ANTES de que se vea (apenas termina la intro del
     inicio), de a un armador por vez y en pasos chicos. Acá se deja todo listo sin dibujar nada a la vista: la foto de la oreja y su
     máscara decodificadas y subidas a la placa, los shaders compilados (de a uno), la primera consulta de cada programa hecha, los
     aros de ejemplo con su foto y su forma ya listas y un par de cuadros de ensayo con el lienzo escondido (la primera vez que la
     placa dibuja con cada programa también tarda). Recién entonces la escena está "lista" (api.lista); el primer cuadro y la intro
     esperan a api.empieza(), que llega cuando el escenario se ve. */
  var compilado = false, quiereEmpezar = false, empezo = false, fallo = false;
  var geoLista = {}, calentados = [];
  function precalienta(k) {      // la foto del aro (y su foto en alta y relieve) y su forma, listas antes de que entre
    var c = AR[k]; if (!c) return Promise.resolve();
    var t = textura(k), h = HD[k] || null;      // (ya pedidas arriba)
    return Promise.all([t.userData.lista, h ? h.lista : null]).then(function () { return respiro(urge()); }).then(function () {
      if (!geoLista[k] && !aros[k]) { var g = geoAro(c, c.alto * c.asp, c.alto); if (g) geoLista[k] = g; }
      return subeTexturas([t, h && h.foto, h && h.normal].filter(function (x) { return x && x.image; }));
    });
  }
  function sueltaCalentados() {      // ya entraron los de ejemplo: se suelta la referencia de más a sus fotos en alta
    calentados.splice(0).forEach(sueltaHD);
    Object.keys(geoLista).forEach(function (k) { geoLista[k].dispose(); delete geoLista[k]; });
  }
  function cuadroDeEnsayo() {
    var i0 = intro;
    ensayo = true; intro = 1; scene.add(maniqui);
    try { paso(0); } catch (e) {}
    scene.remove(maniqui); intro = i0; ensayo = false;
  }
  var previos = IDS.filter(function (id) { return st.pos[id]; }).map(function (id) { return st.pos[id]; });
  if (!previos.length) X.ejemplo(function (k) { previos.push(k); });
  previos.forEach(function (k) { if (AR[k]) { textura(k); if (texturaHD(k)) calentados.push(k); } });      // las fotos se piden ya, en paralelo (la referencia de más se suelta en sueltaCalentados)
  var calienta = sinEsperarMas(previos.reduce(function (p, k) { return p.then(function () { return precalienta(k); }); }, Promise.resolve()), 6000);
  api.lista = Promise.all([listoEntorno, listoFoto, listoMasc]).then(function (r) {
    fondo.material.map = r[1]; fondo.material.needsUpdate = true;
    if (U_MASC.value) {
      tapa.material.alphaMap = U_MASC.value; tapa.material.needsUpdate = true; tapa.visible = true;
      sombraOreja.visible = true; sombraFondo.visible = true;
    }
    tiempos.foto = Math.round(performance.now() - T0);
    return respiro(urge());
  }).then(function () {
    scene.add(maniqui);
    return sinEsperarMas(compilaPartes(scene, camera), 8000);
  }).then(function () {
    scene.remove(maniqui);
    tiempos.compilado = Math.round(performance.now() - T0);
    return asientaDeAPoco();
  }).then(function () { return subeTexturas(texturasDe(scene)); })      // la foto de la oreja (6 megapíxeles) y su máscara
    .then(function () { return calienta; })
    .then(function () { return calma(urge() ? 0 : 2500); })
    .then(function () { cuadroDeEnsayo(); return respiro(urge()); })
    .then(function () { cuadroDeEnsayo(); return respiro(urge()); })
    .then(null, function (e) { fallo = true; console.warn('Armá tu oreja: sin 3D', e); X.sinTresD(); })
    .then(function () {
      tiempos.asentado = Math.round(performance.now() - T0);
      if (!fallo) { compilado = true; if (quiereEmpezar) arranque(); }
    });
  api.empieza = function () { quiereEmpezar = true; if (compilado) arranque(); };
  api.estaLista = function () { return compilado; };
  function arranque() {
    if (empezo || fallo) return; empezo = true; tiempos.empezo = Math.round(performance.now() - T0);
    // si mientras se preparaba apareció el póster, los aros arrancan ya puestos y en reposo (sin intro), en la misma pose que la foto:
    // el 3D la reemplaza sin que se note y recién ahí empieza a moverse
    sinIntro = !!(X.sinIntro && X.sinIntro());
    var rapido = sinIntro, ya = IDS.filter(function (id) { return st.pos[id]; });
    if (ya.length) ya.forEach(function (id, i) { var k = st.pos[id]; if (k && !aros[k]) { if (rapido) api.agregar(k, null, id, 'quieto'); else setTimeout(function () { if (st.pos[id] === k && !aros[k]) api.agregar(k, null, id, false); }, 450 + i * 110); } });
    else X.ejemplo(function (k, id, i) { if (rapido) X.ponEjemplo(k, id, 'quieto'); else setTimeout(function () { X.ponEjemplo(k, id, false); }, 500 + i * 130); });
    if (sinIntro) {
      intro = 1; zoom = 1; asoma = 0; tiempo = 0;
      IDS.forEach(function (id) { var ag = AG[id]; ag.vis = visibleAg(id) ? 1 : 0; ag.act = st.activo === id && !st.pos[id] ? 1 : 0; });
    }
    focoBase(foco);
    requestAnimationFrame(cuadro);
    setTimeout(function () { st.intro = false; X.pintaResumen(); }, rapido ? 50 : 1300);
    setTimeout(sueltaCalentados, 6000);
  }

  if (X.debug) {
    window.__or = {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera, api: api, vivos: vivos, tiempos: tiempos, MOV: MOV, AG: AG, FOTO_U: FOTO_U, METAL: METAL,
      sol: sol, U_GRANO: U_GRANO, sombras: [sombraOreja, sombraFondo], tapa: tapa,
      relojManual: function (si) { relojManual = !!si; if (!si) { andando = false; api.despierta(); } },
      avanza: function (seg, n) { for (var i = 0; i < (n || 1); i++) paso(seg || 1 / 30); },
      lupa: function (k) { if (aros[k]) abreLupa(aros[k]); else cierraLupa(); },
      hamaca: function (dx) { vivos.forEach(function (a) { if (!a.sale && !a.vol && AR[a.k].tipo !== 'cuff') hamaca(a, dx); }); },
      poster: function () {      // la pose del primer cuadro cuando el 3D reemplaza a la foto: tiempo 0, aros en reposo, agujeros a la vista, encuadre en su lugar
        brillos.forEach(function (b) { b.vida = 0; b.sp.visible = false; }); barridoT = -1; barridoLuz.intensity = 0;
        vivos.forEach(function (a) { a.th = a.om = a.thD = a.omD = a.ph = a.ov = 0; a.barrido = -1; a.hov = 0; a.lupa = 0; a.esc = 1; a.vol = null; });
        tiempo = 0; asoma = 0; intro = 1; zoom = 1; parX = parY = 0; empuje = 0; lupa = null; sobre = null; sobreAg = null;
        IDS.forEach(function (id) { var ag = AG[id]; ag.vis = visibleAg(id) ? 1 : 0; ag.act = st.activo === id && !st.pos[id] ? 1 : 0; ag.res = 0; });
        focoBase(foco); paso(1 / 60); return renderer.domElement.toDataURL('image/png');
      }
    };
  }
  return api;
};
})();
