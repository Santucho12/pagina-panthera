/* Panthera — "Armá tu oreja": la ESCENA (prototipo, 2026-11-11, segunda versión). Pedido del usuario: "usar la oreja de una mujer
   real, no esa oreja falsa" y "si tenés un arito puesto, de la argolla solo se ve un lado, no los dos".
   - La oreja es una FOTO real (foto-oreja.webp; Sam Badmaeva en Unsplash, licencia libre): un plano de fondo, sin luces.
   - Los aros siguen en 3D como los charms del armador de pulseras: su foto recortada extruida (con el hueco del aro), la luz de
     estudio (PMREM), el canto con el color de la foto, foto HD + relieve, péndulo con resortes, destellos, barrido, lupa.
   - La argolla puesta: el lado de ATRÁS de cada argolla (se detecta solo en su foto: el arco más fino al costado del hueco) se
     esconde donde queda sobre el lóbulo (foto-lobulo.png); debajo del borde del lóbulo se ve, como en la realidad.
   - Cada aro proyecta una sombra suave sobre la piel (un plano que solo recibe sombras, encima de la foto).
   - Una foto no gira: al arrastrar, los aros se hamacan; con el mouse, un paralaje suave.
   Devuelve la misma API que la escena anterior (oreja.js no cambia). */
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
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  var ANISO = renderer.capabilities.getMaxAnisotropy();
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  var NIVELES = [{ n: 'bajo', dpr: 1.25 }, { n: 'medio', dpr: 1.5 }, { n: 'alto', dpr: 2 }];
  var iNivel = 2, techo = 2;

  /* ═════════ La foto: de píxeles a la escena ═════════ */
  var ESC = F.escala, CX = F.foco[0], CY = F.foco[1];
  function aMundo(px, py, out) { return (out || new THREE.Vector3()).set((px - CX) * ESC, -(py - CY) * ESC, 0); }
  var FOTO_MIN_X = -CX * ESC, FOTO_MAX_X = (F.w - CX) * ESC, FOTO_MAX_Y = CY * ESC, FOTO_MIN_Y = -(F.h - CY) * ESC;
  var ANCHO_FOTO = FOTO_MAX_X - FOTO_MIN_X, ALTO_FOTO = FOTO_MAX_Y - FOTO_MIN_Y;
  var cargaTex = new THREE.TextureLoader();
  var listoFoto = new Promise(function (ok, mal) {
    cargaTex.load(F.url, function (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; ok(t); }, undefined, function () { mal(new Error('no cargó la foto')); });
  });
  var U_FOTO = { value: new THREE.Vector4(FOTO_MIN_X, FOTO_MIN_Y, 1 / ANCHO_FOTO, 1 / ALTO_FOTO) };
  var U_LOBULO = { value: null };
  var listoLobulo = new Promise(function (ok) {
    cargaTex.load(F.lobulo, function (t) { t.colorSpace = THREE.NoColorSpace; U_LOBULO.value = t; ok(); }, undefined, function () { ok(); });
  });
  var fondo = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_FOTO, ALTO_FOTO), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, depthWrite: false, depthTest: false }));
  fondo.position.set((FOTO_MIN_X + FOTO_MAX_X) / 2, (FOTO_MIN_Y + FOTO_MAX_Y) / 2, 0); fondo.renderOrder = -2; scene.add(fondo);
  // la sombra de los aros sobre la piel: un plano igual a la foto que solo dibuja sombra
  var recibe = new THREE.Mesh(fondo.geometry, new THREE.ShadowMaterial({ opacity: 0.32, depthWrite: false, depthTest: false }));
  recibe.position.copy(fondo.position); recibe.renderOrder = -1; recibe.receiveShadow = true; scene.add(recibe);

  /* ═════════ Luz: el estudio de joyería del armador → PMREM (solo los aros lo usan: la foto es una foto) ═════════ */
  function estudio() {
    var s = new THREE.Scene();
    s.background = new THREE.Color(0.035, 0.035, 0.038);
    function panel(w, h, col, k, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); return m;
    }
    var mesa = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(0.42) }));
    mesa.rotation.x = -Math.PI / 2; mesa.position.y = -3.4; s.add(mesa);
    panel(12, 6, 0xffffff, 4.2, 0, 10, 1.5); panel(9, 2.6, 0xffffff, 2.2, 0, 3.4, 11); panel(9, 1.4, 0xffffff, 1.3, 0, -0.6, 11.5);
    panel(1.2, 13, 0xffffff, 9, -9, 1.5, 3); panel(1.2, 13, 0xffffff, 7, 9, 1.5, -1); panel(5, 3, 0xffffff, 2.4, 0, 4, -12);
    panel(3.2, 16, 0x000000, 1, -4.6, 1, 10.2); panel(3.2, 16, 0x000000, 1, 5.2, 1, 9.6);
    var aro = new THREE.Mesh(new THREE.RingGeometry(0.55, 2.6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(2.4), side: THREE.DoubleSide }));
    aro.position.set(0, 1.6, 12.5); aro.lookAt(0, 0, 0); s.add(aro);
    panel(4, 3, 0xF4ACC4, 0.5, -9, -1, 6); panel(3, 3, 0xEEC049, 0.35, 9, -1.5, 5);
    return s;
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
  var T0 = performance.now(), tiempos = {};
  var listoEntorno = (function () {
    var pmrem = new THREE.PMREMGenerator(renderer), ent = estudio(), previo = Promise.resolve(), rc = null;
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
      scene.environment = pmrem.fromScene(ent, 0.02).texture;
      pmrem.dispose(); ent.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      tiempos.entorno = Math.round(performance.now() - T0);
    });
  })();
  var clave = new THREE.DirectionalLight(0xffffff, 1.2); clave.position.set(-3.5, 6, 6); scene.add(clave);
  var brillo = new THREE.PointLight(0xfff3f7, 1.2, 0, 0); scene.add(brillo);
  // la luz de la foto viene de arriba a la izquierda: de ahí sale la sombra de los aros sobre la piel
  var sol = new THREE.DirectionalLight(0xffffff, 0.7); sol.position.set(-2.2, 3.2, 6.5); sol.target.position.set(0, -1, 0);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.01; sol.shadow.radius = 6;
  var sc = sol.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -5; sc.near = 1; sc.far = 18;
  scene.add(sol); scene.add(sol.target);

  /* ═════════ Los agujeros (sobre la foto) ═════════ */
  var NOMBRES = { l1: '1.er agujero', l2: '2.º agujero', l3: '3.er agujero', cuff: 'Ear cuff' };
  var IDS = ['l1', 'l2', 'l3', 'cuff'], AG = {};
  var oreja = new THREE.Group(); scene.add(oreja);
  var matPunto = new THREE.MeshBasicMaterial({ color: 0x4a2c33, transparent: true, opacity: 0.55, depthTest: false, depthWrite: false, toneMapped: false });
  var matPuntoOcupado = new THREE.MeshBasicMaterial({ color: 0x3a2228, transparent: true, opacity: 0.32, depthTest: false, depthWrite: false, toneMapped: false });
  var geoPunto = new THREE.CircleGeometry(0.022, 20), geoToque = new THREE.SphereGeometry(0.3, 10, 8), matToque = new THREE.MeshBasicMaterial({ visible: false });
  IDS.forEach(function (id, i) {
    var esCuff = id === 'cuff', g = new THREE.Group(); aMundo(F.agujeros[id][0], F.agujeros[id][1], g.position); oreja.add(g);
    var punto = new THREE.Mesh(geoPunto, matPunto); punto.renderOrder = 1; if (!esCuff) g.add(punto);
    var mat = new THREE.MeshBasicMaterial({ color: esCuff ? 0xEEC049 : 0xF4ACC4, transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false });
    var anillo = new THREE.Mesh(esCuff ? new THREE.TorusGeometry(0.3, 0.016, 10, 72) : new THREE.TorusGeometry(0.12, 0.013, 10, 56), mat); anillo.renderOrder = 1; g.add(anillo);
    var toque = new THREE.Mesh(geoToque, matToque); toque.userData.agujero = id; if (esCuff) toque.scale.setScalar(1.4); g.add(toque);
    AG[id] = { g: g, punto: punto, anillo: anillo, toque: toque, vis: 0, res: 0, act: 0, idx: i, nombre: NOMBRES[id] };
  });
  function visibleAg(id) { return id === 'cuff' || +id.slice(1) <= st.huecos; }

  /* ═════════ Destellos (los del armador) ═════════ */
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
  for (var bi = 0; bi < 24; bi++) {
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
      setTimeout(function () { brilla(wp.set((Math.random() - 0.5) * r, (Math.random() - 0.5) * r, 0.1 + Math.random() * 0.1).add(base).clone(), 0.12 + Math.random() * 0.1); }, i * 90);
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
  var esperaG = 1.2, bL = new THREE.Vector3();
  function buscaBrillos(dt) {
    if (intro < 1 || lupa) return;
    esperaG -= dt; if (esperaG > 0) return;
    esperaG = 0.5 + Math.random() * 1.3;
    var cands = vivos.filter(function (a) { return !a.sale && !a.vol && a.claros && a.claros.length; });
    if (!cands.length) return;
    var a = cands[(Math.random() * cands.length) | 0], c = a.claros[(Math.random() * a.claros.length) | 0];
    bL.set((c[0] - AR[a.k].cx) * a.ancho, (AR[a.k].ag - c[1]) * a.alto, 0.05);
    a.malla.localToWorld(bL);
    brilla(bL.clone(), 0.09 + Math.random() * 0.07, 0.35 + Math.random() * 0.3);
  }

  /* ═════════ Aros con volumen (como los charms del armador) + el lado de atrás de la argolla ═════════ */
  var CONT = window.PNT_OR_CONTORNOS || {}, TEX = {}, HD = {};
  function textura(k) {
    if (!TEX[k]) {
      var t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
      (function pide(intento) {
        new THREE.ImageLoader().load(AR[k].img + (intento ? '?r=' + intento : ''), function (im) { t.image = im; t.needsUpdate = true; },
          undefined, function () { if (intento < 4) setTimeout(function () { pide(intento + 1); }, 600 * (intento + 1)); });
      })(0);
      TEX[k] = t;
    }
    return TEX[k];
  }
  var lienzoMide = null;
  function lienzo(im, h) {
    var w = Math.max(8, Math.round(im.width * h / im.height));
    var cc = lienzoMide || (lienzoMide = document.createElement('canvas')); cc.width = w; cc.height = h;
    var g = cc.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
    return { w: w, h: h, d: g.getImageData(0, 0, w, h).data };
  }
  function claros(im) {        // los puntos más claros (piedras, filos) de la foto: ahí aparecen los destellos
    try {
      var L = lienzo(im, 96), w = L.w, h = L.h, d = L.d, lista = [];
      for (var y = Math.round(h * 0.12); y < h; y += 2) for (var x = 0; x < w; x += 2) {
        var o = (y * w + x) * 4; if (d[o + 3] < 220) continue;
        var l = d[o] * 0.3 + d[o + 1] * 0.59 + d[o + 2] * 0.11; if (l > 238) lista.push([x / w, y / h, l]);
      }
      lista.sort(function (a, b) { return b[2] - a[2]; });
      return lista.slice(0, 10);
    } catch (e) { return []; }
  }
  /* El lado de atrás de la argolla, medido en su foto. La argolla puesta se ve casi de canto: de adelante se ve una mitad (una "C"
     que baja del agujero) y la otra mitad queda detrás del lóbulo. En la foto del producto se ve entera, así que se parte al medio:
     se busca su hueco (filas donde la columna del centro del aro es transparente), su borde de abajo (hueco + el grosor de la pared)
     y se esconde la mitad de atrás (la más fina) de la argolla entera. Devuelve una máscara (255 = se ve; 0 = mitad de atrás). */
  function mascaraArco(im, c) {
    try {
      var L = lienzo(im, 240), w = L.w, h = L.h, d = L.d, lim = Math.round(h * 0.55);
      var alfa = function (x, y) { return d[(y * w + Math.max(0, Math.min(w - 1, x))) * 4 + 3]; };
      var arriba = 0; while (arriba < h * 0.2 && !(function () { for (var x = 0; x < w; x++) if (alfa(x, arriba) > 110) return true; return false; })()) arriba++;
      var hueco = null, cxp = Math.round(c.cx * w);
      [0, -0.06, 0.06, -0.12, 0.12].some(function (dx) {       // la columna del centro (o una apenas corrida, si ahí hay un brillo)
        var col = cxp + Math.round(dx * w), mejor = null, cur = null;
        for (var y = arriba; y < lim; y++) {
          var a = Math.max(alfa(col - 1, y), alfa(col, y), alfa(col + 1, y));
          if (a < 70) { if (!cur) cur = [y, y]; else cur[1] = y; }
          else if (cur) { if (!mejor || cur[1] - cur[0] > mejor[1] - mejor[0]) mejor = cur; cur = null; }
        }
        if (cur && (!mejor || cur[1] - cur[0] > mejor[1] - mejor[0])) mejor = cur;
        if (mejor && mejor[1] - mejor[0] >= h * 0.03 && mejor[0] - arriba < h * 0.18) { hueco = mejor; cxp = col; return true; }
        return false;
      });
      var x, y, fondo, y0, y1;
      if (hueco) { var pared = Math.max(2, hueco[0] - arriba); fondo = Math.min(h - 1, hueco[1] + Math.round(pared * 1.1)); y0 = hueco[0]; y1 = hueco[1]; }
      else {
        // sin hueco a la vista (se ve la cara de adentro del aro): el alto de la argolla sale de su ancho (en estas fotos, ~1,55 veces)
        var ancho = 0;
        for (y = Math.round(arriba + h * 0.04); y <= Math.round(arriba + h * 0.12); y++) {
          var p0 = -1, p1 = -1; for (x = 0; x < w; x++) if (alfa(x, y) > 110) { if (p0 < 0) p0 = x; p1 = x; }
          if (p0 >= 0) ancho = Math.max(ancho, p1 - p0 + 1);
        }
        if (ancho < w * 0.12) return null;
        fondo = Math.min(Math.round(h * 0.5), Math.round(arriba + ancho * 1.55)); y0 = Math.round(arriba + (fondo - arriba) * 0.2); y1 = Math.round(arriba + (fondo - arriba) * 0.8);
      }
      var sl = 0, sr = 0;
      for (y = y0; y <= y1; y++) for (x = 0; x < w; x++) if (alfa(x, y) > 110) { if (x < cxp) sl++; else sr++; }
      // todas las argollas de la oreja muestran la misma mitad (la de adelante hacia la cara, a la derecha): se ve parejo, como en una
      // oreja de verdad. (sl/sr quedan medidos por si alguna foto viene espejada)
      var atrasIzq = true, m = new Uint8Array(w * h).fill(255);
      for (y = 0; y <= fondo; y++) {
        var fila = (h - 1 - y) * w;                            // en la textura, la fila 0 es la de abajo
        for (x = 0; x < w; x++) if (atrasIzq ? x < cxp : x > cxp) m[fila + x] = 0;
      }
      var tex = new THREE.DataTexture(m, w, h, THREE.RedFormat, THREE.UnsignedByteType);
      tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
      tex.userData = { atrasIzq: atrasIzq, fondo: fondo / h, centro: cxp / w };
      return tex;
    } catch (e) { return null; }
  }
  function texturaHD(k) {
    var c = AR[k]; if (!c.hd) return null;
    if (!HD[k]) {
      var h = HD[k] = { usos: 0, foto: null, normal: null, mascara: null };
      cargaTex.load(c.hd, function (t) {
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
        if (HD[k] !== h) { t.dispose(); return; }
        h.foto = t; h.claros = claros(t.image); if (c.tipo !== 'cuff') h.mascara = mascaraArco(t.image, c); avisaHD(k);
      });
      if (c.hdn) cargaTex.load(c.hdn, function (t) { t.anisotropy = ANISO; if (HD[k] === h) { h.normal = t; avisaHD(k); } else t.dispose(); });
    }
    HD[k].usos++; return HD[k];
  }
  function avisaHD(k) { var a = aros[k]; if (a && a.matFoto) ponHD(a); }
  function ponHD(a) {
    var h = HD[a.k], m = a.matFoto; if (!h || !m) return;
    if (h.foto && m.map !== h.foto) { m.map = h.foto; m.needsUpdate = true; a.matCanto.map = h.foto; a.matCanto.needsUpdate = true; a.claros = h.claros; }
    if (h.normal && m.normalMap !== h.normal) { m.normalMap = h.normal; m.normalScale.set(1, 1); m.needsUpdate = true; }
    if (h.mascara && a.uMascara.value !== h.mascara) { a.uMascara.value = h.mascara; a.uUsa.value = 1; }
  }
  function sueltaHD(k) { var h = HD[k]; if (!h) return; if (--h.usos <= 0) { if (h.foto) h.foto.dispose(); if (h.normal) h.normal.dispose(); if (h.mascara) h.mascara.dispose(); delete HD[k]; } }
  // el lado de atrás de la argolla, adentro del lóbulo: se descarta (la foto del lóbulo queda adelante)
  var VERT_MUNDO = ['#include <project_vertex>', 'vMundoOr = (modelMatrix * vec4(transformed, 1.0)).xyz;'].join('\n');
  var FRAG_ATRAS = [
    '#include <alphatest_fragment>',
    '#ifdef USE_MAP',
    'if (uUsaMascara > 0.5) {',
    '  float atras = 1.0 - texture2D(uMascara, vMapUv).r;',
    '  float lob = texture2D(uLobulo, (vMundoOr.xy - uFoto.xy) * uFoto.zw).r;',
    '  if (atras > 0.5 && lob > 0.5) discard;',
    '}',
    '#endif'
  ].join('\n');
  function conAtras(sh, a) {
    sh.uniforms.uMascara = a.uMascara; sh.uniforms.uUsaMascara = a.uUsa; sh.uniforms.uLobulo = U_LOBULO; sh.uniforms.uFoto = U_FOTO;
    sh.vertexShader = 'varying vec3 vMundoOr;\n' + sh.vertexShader.replace('#include <project_vertex>', VERT_MUNDO);
    sh.fragmentShader = 'uniform sampler2D uMascara;\nuniform float uUsaMascara;\nuniform sampler2D uLobulo;\nuniform vec4 uFoto;\nvarying vec3 vMundoOr;\n' +
      sh.fragmentShader.replace('#include <alphatest_fragment>', FRAG_ATRAS);
  }
  var FOTO_FRAG = [
    '{',
    '  vec3 foto = diffuseColor.rgb;',
    '  float fMx = max(foto.r, max(foto.g, foto.b)), fMn = min(foto.r, min(foto.g, foto.b));',
    '  float plataF = 1.0 - smoothstep(0.16, 0.45, (fMx - fMn) / max(fMx, 1e-3));',
    '  float oroF = smoothstep(0.18, 0.5, (fMx - fMn) / max(fMx, 1e-3)) * step(foto.b, foto.r);',
    '  outgoingLight = foto * uBaseFoto + max(totalSpecular - uVelo, vec3(0.0)) * uBrilloFoto * mix(0.3, 1.0, max(plataF, oroF * 0.8));',
    '  if (uBarrido > -0.5) {',
    '    float bnd = exp(-pow((vMapUv.x * 0.7 + (1.0 - vMapUv.y) * 0.6 - uBarrido * 1.7 + 0.25) * 7.0, 2.0));',
    '    outgoingLight += vec3(bnd * 0.6 * mix(0.35, 1.0, max(plataF, oroF)));',
    '  }',
    '}'
  ].join('\n');
  var FOTO_U = { uBaseFoto: { value: 0.97 }, uBrilloFoto: { value: 0.55 }, uVelo: { value: 0.2 } };
  function matFotoDe(tex, a) {
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 1, roughness: 0.2, alphaTest: 0.5, alphaToCoverage: true, toneMapped: false });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uBaseFoto = FOTO_U.uBaseFoto; sh.uniforms.uBrilloFoto = FOTO_U.uBrilloFoto; sh.uniforms.uVelo = FOTO_U.uVelo; sh.uniforms.uBarrido = m.userData.barrido;
      conAtras(sh, a);
      sh.fragmentShader = 'uniform float uBaseFoto;\nuniform float uBrilloFoto;\nuniform float uVelo;\nuniform float uBarrido;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', FOTO_FRAG + '\n#include <opaque_fragment>');
    };
    m.userData.barrido = { value: -1 };
    m.customProgramCacheKey = function () { return 'pnt-or-foto3'; };
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
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.15 });
    m.userData.tap = { value: new THREE.Vector2(0.018 / Math.max(ancho || 0.3, 0.05), 0.018 / Math.max(alto || 0.5, 0.05)) };
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uTap = m.userData.tap; sh.uniforms.uOscuro = { value: 0.82 };
      conAtras(sh, a);
      sh.fragmentShader = 'uniform vec2 uTap;\nuniform float uOscuro;\n' + sh.fragmentShader.replace('#include <map_fragment>', CANTO_FRAG);
    };
    m.customProgramCacheKey = function () { return 'pnt-or-canto3'; };
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
    var grosor = c.tipo === 'cuff' ? 0.07 : 0.055, bev = grosor * 0.3, cuerpo = Math.max(0.002, grosor - 2 * bev);
    function uvDe(v, j) { return new THREE.Vector2(v[j * 3] / ancho + c.cx, 1 - c.ag + v[j * 3 + 1] / alto); }
    var uv = {
      generateTopUV: function (g, v, a, b, d) { return [uvDe(v, a), uvDe(v, b), uvDe(v, d)]; },
      generateSideWallUV: function (g, v, a, b, d, e) { return [uvDe(v, a), uvDe(v, b), uvDe(v, d), uvDe(v, e)]; }
    };
    var g = new THREE.ExtrudeGeometry(forma, { depth: cuerpo, bevelEnabled: true, bevelThickness: bev, bevelSize: Math.min(0.008, ancho * 0.02), bevelSegments: 3, curveSegments: 1, UVGenerator: uv });
    suavizaCanto(g); g.translate(0, 0, -cuerpo / 2);
    return g;
  }
  var aros = {}, vivos = [];
  function crearAro(k, hueco) {
    var c = AR[k], tex = textura(k);
    var piv = new THREE.Group(); scene.add(piv);
    var col = new THREE.Group(); piv.add(col);
    var alto = c.alto, ancho = alto * c.asp;
    var a = { k: k, hueco: hueco, piv: piv, col: col, alto: alto, ancho: ancho, th: 0, om: 0, ph: 0, ov: 0, vol: null, sale: null, lupa: 0, hov: 0, golpe: 0, barrido: -1,
      esc: 0.001, semilla: Math.random() * 10, pre: new THREE.Vector3(), velX: 0, claros: null, uMascara: { value: null }, uUsa: { value: 0 } };
    var geo = geoAro(c, ancho, alto);
    if (!geo) { geo = new THREE.PlaneGeometry(ancho, alto); geo.translate((0.5 - c.cx) * ancho, (c.ag - 0.5) * alto, 0); }
    a.geo = geo;
    a.matFoto = matFotoDe(tex, a); a.matCanto = cantoDe(tex, ancho, alto, a);
    var m = new THREE.Mesh(geo, geo.groups && geo.groups.length > 1 ? [a.matFoto, a.matCanto] : a.matFoto);
    m.castShadow = true; m.userData.aro = a; m.renderOrder = 2; col.add(m); a.malla = m;
    aros[k] = a; vivos.push(a);
    if (texturaHD(k)) ponHD(a);
    return a;
  }
  function liberaAro(a) {
    scene.remove(a.piv);
    a.piv.traverse(function (o) { if (o.isMesh && o.material) [].concat(o.material).forEach(function (m) { m.dispose(); }); });
    if (a.geo) a.geo.dispose();
    sueltaHD(a.k);
  }

  /* ═════════ Cámara: encuadre sobre la foto (nunca se ve más allá de su borde) ═════════ */
  function medir() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function aplicaNivel() { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, NIVELES[iNivel].dpr)); medir(); }
  new ResizeObserver(medir).observe(stage); aplicaNivel();
  function altoVista() {      // alto visible en el plano de la foto (sin zoom)
    var asp = camera.aspect, cel = asp < 0.9, quiere = (cel ? F.altoCel : F.alto) * ESC;
    return Math.min(quiere, ANCHO_FOTO * 0.995 / asp, ALTO_FOTO * 0.995);
  }
  function focoBase(out) { var cel = camera.aspect < 0.9, f = cel ? F.focoCel : F.foco; return aMundo(f[0], f[1], out); }
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
    vuelo: 0.95, inclina: 0.12,
    pendulo: 15, penduloAmort: 1.7, empuje: 0.03, hamaca: 0.016,
    barrido: 7.5, barridoDur: 1.5,
    camara: 2.4, zoomCuff: 0.42,
    intro: 1.3
  };
  var agarre = null, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), sobre = null, sobreAg = null;
  var lupa = null, lupaT = 0, saltar = false, zoom = 1.08, foco = new THREE.Vector3(), focoObj = new THREE.Vector3(), parX = 0, parY = 0, objX = 0, objY = 0, empuje = 0;
  var FINO = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  function aNdc(cx, cy) { var r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); }
  function tocado(e) {
    aNdc(e.clientX, e.clientY); ray.setFromCamera(ndc, camera);
    var ms = vivos.filter(function (a) { return a.malla && !a.sale && !a.vol; }).map(function (a) { return a.malla; });
    var h = ray.intersectObjects(ms, false); if (h.length) return { aro: h[0].object.userData.aro };
    var ts = IDS.filter(function (id) { return visibleAg(id) && !st.pos[id]; }).map(function (id) { return AG[id].toque; });
    h = ray.intersectObjects(ts, false); if (h.length) return { ag: h[0].object.userData.agujero };
    return null;
  }
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
    vivos.forEach(function (a) { if (!a.sale && !a.vol && AR[a.k].tipo !== 'cuff') a.om += dx * MOV.hamaca * (0.8 + 0.4 * Math.random()); });
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
  function anclaje(a, out) {        // el agujero en la foto, apenas adelante (el aro cuelga sobre la piel)
    AG[a.hueco].g.getWorldPosition(out); out.z = a.hueco === 'cuff' ? 0.08 : 0.04 + 0.012 * AG[a.hueco].idx;
    return out;
  }

  /* ═════════ Barrido de luz (como en el armador) ═════════ */
  var barridoLuz = new THREE.DirectionalLight(0xffffff, 0); barridoLuz.position.set(-6, 4.5, 3.5); scene.add(barridoLuz);
  var barridoT = -1, proxBarrido = 2.5;
  function animaBarrido(dt, quieto) {
    if (barridoT < 0) { proxBarrido -= dt; if (proxBarrido <= 0 && quieto) { barridoT = 0; vivos.forEach(function (a) { if (!a.sale && !a.vol) a.barrido = 0; }); } return; }
    barridoT += dt / MOV.barridoDur;
    var u = Math.min(1, barridoT), f = Math.sin(u * Math.PI);
    barridoLuz.position.set(-7 + 14 * u, 4.5, 3.5); barridoLuz.intensity = 2.6 * f * f;
    if (barridoT >= 1) { barridoT = -1; barridoLuz.intensity = 0; proxBarrido = MOV.barrido * (0.8 + Math.random() * 0.4); }
  }

  /* ═════════ Cuadro a cuadro ═════════ */
  var timer = new THREE.Timer(), saltaDelta = true, relojManual = false;
  var tiempo = 0, festejo = 0, primero = true, intro = 0, andando = true, tPrev = 0;
  var sinIntro = !!(X.sinIntro && X.sinIntro());
  var qCam = new THREE.Quaternion(), cX = new THREE.Vector3(), cY = new THREE.Vector3(), cZ = new THREE.Vector3(), cM = new THREE.Matrix4();
  function caraCamara(out) { cX.set(1, 0, 0).applyQuaternion(camera.quaternion); cY.set(0, 1, 0); cZ.crossVectors(cX, cY); cM.makeBasis(cX, cY, cZ); return out.setFromRotationMatrix(cM); }
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
    tiempo += dt;
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
    var flota = X.totalFlota();                          // (el encuadre de compu ya deja la oreja a la izquierda: abajo a la derecha está el total)
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
    brillo.position.set(Math.sin(tiempo * 0.6) * 3.2 - 0.5, 0.5, Math.cos(tiempo * 0.6) * 3.2 + 2.5);
    oreja.updateMatrixWorld(true);
    caraCamara(qCam);

    // los agujeros: aparecen en la intro; el elegido late; los ocupados se esconden (los tapa el aro)
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
      // el agujero: libre, un punto marcado; ocupado, una sombrita suave donde la argolla entra a la piel
      ag.punto.visible = ag.vis > 0.02 && id !== 'cuff'; ag.punto.scale.setScalar(Math.max(0.001, ag.vis * (ocupado ? 1.25 : 1)));
      ag.punto.material = ocupado ? matPuntoOcupado : matPunto;
    });

    for (var vi = vivos.length - 1; vi >= 0; vi--) {
      var a = vivos[vi], p = a.piv, c = AR[a.k];
      anclaje(a, anc);
      if (a.vol) {
        a.vol.u = Math.min(1, a.vol.u + dt / a.vol.dur);
        var e = 1 - Math.pow(1 - a.vol.u, 3), a0 = a.vol.de, c0 = a.vol.ctrl, ie2 = 1 - e;
        p.position.set(ie2 * ie2 * a0.x + 2 * ie2 * e * c0.x + e * e * anc.x, ie2 * ie2 * a0.y + 2 * ie2 * e * c0.y + e * e * anc.y, ie2 * ie2 * a0.z + 2 * ie2 * e * c0.z + e * e * anc.z);
        p.quaternion.copy(qCam);
        a.esc = 0.45 + 0.55 * e; a.col.rotation.z = ie2 * ie2 * 2.2 * a.vol.giro; a.col.rotation.x = -MOV.inclina * e;
        if (a.vol.u >= 1) {
          a.vol = null; a.om = 2.6 * (Math.random() < 0.5 ? -1 : 1); a.golpe = 1; a.barrido = 0;
          destello(anc.clone().add(new THREE.Vector3(0, -a.alto * 0.45, 0.15)), 18, a.ancho * 0.8);
          vivos.forEach(function (o) { if (o !== a && !o.sale) o.om += (Math.random() - 0.5) * 1.2; });
        }
      } else if (a.sale) {
        a.sale.vy -= 9.5 * dt; p.position.y += a.sale.vy * dt; p.position.x += a.sale.vx * dt; p.position.z += a.sale.vz * dt;
        p.rotateX(a.sale.gx * dt); p.rotateZ(a.sale.gz * dt);
        a.sale.op -= dt * 1.5;
        [].concat(a.malla.material).forEach(function (m) { m.transparent = true; m.opacity = Math.max(0, a.sale.op); });
        if (a.sale.op <= 0 || p.position.y < -12) { liberaAro(a); vivos.splice(vi, 1); continue; }
      } else {
        if (a.mueve) {
          a.mueve.u = Math.min(1, a.mueve.u + dt / 0.55);
          var em = a.mueve.u < 0.5 ? 2 * a.mueve.u * a.mueve.u : 1 - Math.pow(-2 * a.mueve.u + 2, 2) / 2;
          anc.lerpVectors(a.mueve.de, anc, em); anc.z += Math.sin(em * Math.PI) * 0.6;
          if (a.mueve.u >= 1) { a.mueve = null; a.om += 1.6; }
        }
        a.hov += ((sobre === a && !agarre ? 1 : 0) - a.hov) * Math.min(1, dt * 9);
        p.position.copy(anc);
        p.quaternion.copy(qCam);
        var enLupa = lupa === a;
        a.lupa += ((enLupa ? 1 : 0) - a.lupa) * Math.min(1, dt * 3);
        if (a.lupa > 0.001) p.rotateY(Math.sin(lupaT * 0.8) * 0.5 * a.lupa);
        var esCuff = c.tipo === 'cuff';
        if (!esCuff) {
          var vx = (anc.x - a.pre.x) / Math.max(dt, 1e-3), acel = (vx - a.velX) / Math.max(dt, 1e-3); a.velX = vx;
          a.om += (-MOV.pendulo * a.th - MOV.penduloAmort * a.om - acel * MOV.empuje) * dt;
          a.th = Math.max(-0.7, Math.min(0.7, a.th + a.om * dt)); if (Math.abs(a.th) >= 0.7) a.om *= -0.3;
          a.ov += (-13 * a.ph - 1.8 * a.ov) * dt;
          a.ph = Math.max(-0.1, Math.min(0.4, a.ph + a.ov * dt));
          a.col.rotation.z = a.th + Math.sin(tiempo * 1.1 + a.semilla) * 0.025;
          a.col.rotation.x = -MOV.inclina + a.ph;
        } else { a.col.rotation.z = 0; a.col.rotation.x = 0; a.th = a.om = 0; }
        if (a.golpe > 0) { a.golpe = Math.max(0, a.golpe - dt * 3); var gs = Math.sin(a.golpe * Math.PI) * a.golpe; a.col.scale.set(1 + 0.08 * gs, 1 - 0.1 * gs, 1); }
        else if (a.col.scale.y !== 1) a.col.scale.set(1, 1, 1);
      }
      a.pre.copy(anc);
      if (a.barrido >= 0 && a.matFoto) { a.barrido += dt / 0.65; a.matFoto.userData.barrido.value = a.barrido; if (a.barrido > 1.3) { a.barrido = -1; a.matFoto.userData.barrido.value = -1; } }
      var metaE = a.sale || a.vol ? a.esc : (sobre === a ? 1.06 : 1) * (1 + 0.1 * a.lupa);
      if (!a.vol && !a.sale) a.esc += (metaE - a.esc) * Math.min(1, dt * 10);
      p.scale.setScalar(Math.max(0.001, a.esc));
    }
    animaBarrido(dt, !agarre && !lupa && intro >= 1);
    buscaBrillos(dt); animaBrillos(dt);

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
    if (primero) { primero = false; $('cargando').classList.add('listo'); X.pintaResumen(); }
  }

  var api = {
    agregar: function (k, desde, hueco, yaPuesto) {
      var viejo = aros[k]; if (viejo && !viejo.sale) { api.mueve(k, hueco); return; }
      var a = crearAro(k, hueco);
      oreja.updateMatrixWorld(true);
      var de = desde ? puntoDesde(desde) : new THREE.Vector3((Math.random() - 0.5) * 2, 2.6, 2);
      anclaje(a, anc); a.piv.position.copy(de);
      var ctrl = de.clone().lerp(anc, 0.5); ctrl.y += 1.4; ctrl.z += 1;
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
    huecos: function () { vivos.forEach(function (o) { o.om += (Math.random() - 0.5) * 0.8; }); },
    cierraLupa: function () { cierraLupa(); },
    precarga: function (k) { if (AR[k]) textura(k); },
    festejo: function () {
      festejo = 2.4; barridoT = 0;
      vivos.forEach(function (o, i) { o.barrido = 0; o.om += (i % 2 ? -1 : 1) * 3; setTimeout(function () { if (!o.sale) destello(o.piv.position.clone().add(new THREE.Vector3(0, -o.alto * 0.4, 0.1)), 9, o.ancho); }, 200 + i * 120); });
    },
    despierta: function () { if (!andando && !relojManual) { andando = true; saltaDelta = true; tPrev = 0; requestAnimationFrame(cuadro); } }
  };

  /* Arranque: con la foto, la máscara del lóbulo y la luz listas, se compila todo en segundo plano y recién ahí se dibuja */
  function asienta() { renderer.info.programs.forEach(function (p) { try { p.getUniforms(); p.getAttributes(); } catch (e) {} }); }
  function cuandoQuieta(f) { var q = X.quieta ? X.quieta() : 1e9; if (q < 200) setTimeout(function () { cuandoQuieta(f); }, 210 - q); else f(); }
  var maniqui = (function () {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
    var px = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); px.colorSpace = THREE.SRGBColorSpace; px.needsUpdate = true;
    var nx = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); nx.needsUpdate = true;
    var falso = { uMascara: { value: px }, uUsa: { value: 0 } };
    var chica = matFotoDe(px, falso), hd = matFotoDe(px, falso); hd.normalMap = nx;
    var g = new THREE.Group();
    [chica, hd, cantoDe(px, 1, 1, falso)].forEach(function (m) { var o = new THREE.Mesh(geo, m); o.castShadow = true; g.add(o); });
    return g;
  })();
  var compilado = false, quiereEmpezar = false, empezo = false, fallo = false;
  Promise.all([listoEntorno, listoFoto, listoLobulo]).then(function (r) {
    fondo.material.map = r[1]; fondo.material.needsUpdate = true;
    tiempos.foto = Math.round(performance.now() - T0);
    scene.add(maniqui);
    return Promise.race([compila(scene, camera), new Promise(function (ok) { setTimeout(ok, 8000); })]);
  }).then(function () {
    scene.remove(maniqui);
    tiempos.compilado = Math.round(performance.now() - T0);
    cuandoQuieta(function () { asienta(); compilado = true; if (quiereEmpezar) arranque(); });
  }).catch(function (e) { fallo = true; console.warn('Armá tu oreja: sin 3D', e); X.sinTresD(); });
  api.empieza = function () { quiereEmpezar = true; if (compilado) arranque(); };
  function arranque() {
    if (empezo || fallo) return; empezo = true; tiempos.empezo = Math.round(performance.now() - T0);
    sinIntro = !!(X.sinIntro && X.sinIntro());
    if (sinIntro) { intro = 1; zoom = 1; }
    focoBase(foco);
    requestAnimationFrame(cuadro);
    var rapido = sinIntro;
    var ya = IDS.filter(function (id) { return st.pos[id]; });
    if (ya.length) { ya.forEach(function (id, i) { setTimeout(function () { var k = st.pos[id]; if (k && !aros[k]) api.agregar(k, null, id, rapido); }, (rapido ? 0 : 1100) + i * 230); }); }
    else X.ejemplo(function (k, id, i) { setTimeout(function () { X.ponEjemplo(k, id, rapido); }, (rapido ? 0 : 1250) + i * 280); });
    setTimeout(function () { st.intro = false; X.pintaResumen(); }, rapido ? 50 : 2600);
  }

  if (X.debug) {
    window.__or = {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera, api: api, vivos: vivos, tiempos: tiempos, MOV: MOV, AG: AG, FOTO_U: FOTO_U,
      relojManual: function (si) { relojManual = !!si; if (!si) { andando = false; api.despierta(); } },
      avanza: function (seg, n) { for (var i = 0; i < (n || 1); i++) paso(seg || 1 / 30); },
      lupa: function (k) { if (aros[k]) abreLupa(aros[k]); else cierraLupa(); },
      hamaca: function (dx) { vivos.forEach(function (a) { if (!a.sale && !a.vol && AR[a.k].tipo !== 'cuff') a.om += dx * MOV.hamaca; }); },
      poster: function () { brillos.forEach(function (b) { b.vida = 0; b.sp.visible = false; }); barridoT = -1; barridoLuz.intensity = 0; esperaG = 1e9; paso(1 / 30); return renderer.domElement.toDataURL('image/png'); }
    };
  }
  return api;
};
})();
