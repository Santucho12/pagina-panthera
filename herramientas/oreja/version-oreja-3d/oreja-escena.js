/* Panthera — "Armá tu oreja": la ESCENA 3D (prototipo, 2026-11-11). Es el motor de "Armá tu pulsera" (armar3d-escena.js) llevado a
   una oreja: la misma luz de estudio, los mismos materiales de foto y canto, resortes, lupa, destellos y barrido de luz.
   - La oreja es una escultura (como los exhibidores de joyería) en el rosa de la marca: malla propia (oreja.bin, ~24 mil triángulos,
     con la sombra de sus huecos calculada de antemano) y su propio estudio CLARO; los aros usan el estudio oscuro, que les da brillo.
   - Cada aro es su foto recortada, extruida desde su contorno (con el hueco del aro), colgada de su agujero: la parte de arriba
     del aro entra al lóbulo y el resto cuelga con la gravedad y se hamaca (péndulo en dos ejes) cuando la oreja gira.
   - Los aros proyectan una sombra suave sobre la oreja (solo ellos: es barata).
   Devuelve la API que usa la interfaz (oreja.js). */
(function () {
'use strict';
window.PNT_OR_ESCENA = function (THREE, X) {
  var $ = X.$, st = X.st, AR = X.AR, fmt = X.fmt;
  var DBG = X.debug || {};
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

  /* ═════════ Luz: el estudio de joyería del armador (para el metal) y uno claro para la oreja ═════════ */
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
  function estudioClaro() {      // la oreja: un softbox grande arriba a la izquierda, relleno suave a la derecha y techo
    var s = new THREE.Scene(); s.background = new THREE.Color(0.70, 0.67, 0.69);
    function panel(w, h, k, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    panel(14, 10, 3.2, -5, 8, 7); panel(10, 8, 1.2, 8, 2, 6); panel(16, 6, 0.9, 0, 10, -4);
    var piso = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.45, 0.47) }));
    piso.rotation.x = -Math.PI / 2; piso.position.y = -5; s.add(piso);
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
  var T0 = performance.now(), tiempos = {}, envClaro = null;
  // Los dos entornos: los materiales del PMREM se compilan en segundo plano antes de armarlos (como en el armador: así no traba)
  var listoEntorno = (function () {
    var pmrem = new THREE.PMREMGenerator(renderer), ent = estudio(), ent2 = estudioClaro(), previo = Promise.resolve(), rc = null;
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
      envClaro = pmrem.fromScene(ent2, 0.04).texture;
      matOreja.envMap = envClaro; matOreja.needsUpdate = true;
      pmrem.dispose();
      [ent, ent2].forEach(function (s) { s.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); });
      tiempos.entorno = Math.round(performance.now() - T0);
    });
  })();
  var clave = new THREE.DirectionalLight(0xffffff, 1.2); clave.position.set(-3.5, 6, 6); scene.add(clave);
  var brillo = new THREE.PointLight(0xfff3f7, 1.2, 0, 0); scene.add(brillo);
  // la sombra de los aros sobre la oreja: una luz con mapa de sombras que solo los aros proyectan
  var sol = new THREE.DirectionalLight(0xffffff, 0.75); sol.position.set(-2.4, 4.2, 7.5); sol.target.position.set(-0.5, -2.2, 0);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.015; sol.shadow.radius = 5;
  var sc = sol.shadow.camera; sc.left = -3.2; sc.right = 3.2; sc.top = 3.2; sc.bottom = -4.6; sc.near = 1; sc.far = 18;
  scene.add(sol); scene.add(sol.target);

  /* ═════════ La oreja ═════════ */
  var ROSA = new THREE.Color('#F4ACC4');
  // terciopelo rosa, como los exhibidores de aros de las joyerías; el relieve lo marca la sombra de sus huecos
  var matOreja = new THREE.MeshPhysicalMaterial({ color: ROSA, vertexColors: true, roughness: 0.75, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color('#FFFFFF'),
    envMapIntensity: 1.2, emissive: ROSA, emissiveIntensity: 0.08 });
  var AO_EXP = 1.9;
  var oreja = new THREE.Group(); scene.add(oreja);          // gira (arrastrando) y flota
  var pose = new THREE.Group(); pose.rotation.z = -0.12; oreja.add(pose);   // la oreja apenas inclinada hacia atrás, como en la cabeza
  var malla = null;
  // la malla viene en binario (.bin) o en base64 dentro de un .txt (los artefactos no sirven .bin)
  var listaMalla = fetch(X.malla).then(function (r) {
    if (!r.ok) throw new Error('malla de la oreja: ' + r.status);
    if (!/\.txt(\?|$)/.test(X.malla)) return r.arrayBuffer();
    return r.text().then(function (t) { var s = atob(t.trim()), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; });
  }).then(function (buf) {
    var dv = new DataView(buf), nV = dv.getUint32(4, true), nT = dv.getUint32(8, true), mn = [], mx = [];
    for (var k = 0; k < 3; k++) { mn.push(dv.getFloat32(12 + k * 4, true)); mx.push(dv.getFloat32(24 + k * 4, true)); }
    var o = 36, P = new Int16Array(buf, o, nV * 3); o += nV * 6; var Q = new Int8Array(buf, o, nV * 4); o += nV * 4; var I = new Uint16Array(buf, o, nT * 3);
    var pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3);
    for (var i = 0; i < nV; i++) {
      var ao = Math.pow((Q[i * 4 + 3] + 127) / 254, AO_EXP);
      for (k = 0; k < 3; k++) { pos[i * 3 + k] = mn[k] + (P[i * 3 + k] + 32768) / 65535 * (mx[k] - mn[k]); nor[i * 3 + k] = Q[i * 4 + k] / 127; col[i * 3 + k] = ao; }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(I, 1)); g.computeBoundingSphere();
    malla = new THREE.Mesh(g, matOreja); malla.receiveShadow = true; pose.add(malla);
    tiempos.malla = Math.round(performance.now() - T0);
  });

  /* ═════════ Los agujeros: tres en el lóbulo (del 1.º al 3.º, subiendo hacia atrás) y el lugar del ear cuff, sobre el hélix ═════════ */
  var AG = {      // repartidos a lo ancho del lóbulo, como en una oreja real (pedido 2026-11-11: "se ven muy juntos los aritos")
    l1: { p: [0.30, -2.30, 0.263], n: [0.2063, -0.146, 0.9675], nombre: '1.er agujero' },
    l2: { p: [-0.44, -2.22, 0.34], n: [0.0, -0.0041, 1.0], nombre: '2.º agujero' },
    l3: { p: [-1.14, -1.96, 0.3295], n: [-0.1779, -0.0339, 0.9835], nombre: '3.er agujero' },
    cuff: { p: [-1.96, 0.48, 0.2078], n: [0.35, 0.05, 0.935], nombre: 'Ear cuff' }   // (sobre la ladera interna del hélix: la normal real mira de costado; el aro del lugar mira más al frente)
  };
  var IDS = ['l1', 'l2', 'l3', 'cuff'];
  var zz = new THREE.Vector3(0, 0, 1);
  var matPunto = new THREE.MeshBasicMaterial({ color: 0x5a3a44, toneMapped: false });
  var geoPunto = new THREE.CircleGeometry(0.028, 20), geoAnillo = new THREE.TorusGeometry(0.13, 0.013, 10, 56), geoToque = new THREE.SphereGeometry(0.3, 10, 8);
  var matToque = new THREE.MeshBasicMaterial({ visible: false });
  IDS.forEach(function (id, i) {
    var a = AG[id], q = new THREE.Quaternion().setFromUnitVectors(zz, new THREE.Vector3().fromArray(a.n).normalize());
    var g = new THREE.Group(); g.position.fromArray(a.p); g.quaternion.copy(q); pose.add(g);
    var esCuff = id === 'cuff';
    var punto = new THREE.Mesh(geoPunto, matPunto); punto.position.z = 0.006; if (!esCuff) g.add(punto);
    var mat = new THREE.MeshBasicMaterial({ color: esCuff ? 0xEEC049 : 0xF4ACC4, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    var anillo = new THREE.Mesh(esCuff ? new THREE.TorusGeometry(0.3, 0.016, 10, 72) : geoAnillo, mat); anillo.position.z = 0.03; g.add(anillo);
    var toque = new THREE.Mesh(geoToque, matToque); toque.userData.agujero = id; if (esCuff) toque.scale.setScalar(1.4); g.add(toque);
    a.g = g; a.punto = punto; a.anillo = anillo; a.toque = toque; a.vis = 0; a.res = 0; a.act = 0; a.idx = i;
  });
  function visibleAg(id) { return id === 'cuff' || +id.slice(1) <= st.huecos; }

  /* ═════════ Destellos (los del armador: pocos, blancos, de cuatro puntas) ═════════ */
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
  // brillos de las piedras y el metal: cada tanto, en uno de los puntos más claros de la foto de un aro que mira a la cámara
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

  /* ═════════ Aros con volumen (como los charms del armador) ═════════ */
  var CONT = window.PNT_OR_CONTORNOS || {}, cargaTex = new THREE.TextureLoader(), TEX = {}, HD = {};
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
  function texturaHD(k) {
    var c = AR[k]; if (!c.hd) return null;
    if (!HD[k]) {
      var h = HD[k] = { usos: 0, foto: null, normal: null };
      cargaTex.load(c.hd, function (t) {
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
        if (HD[k] !== h) { t.dispose(); return; }
        h.foto = t; h.claros = claros(t.image); avisaHD(k);
      });
      if (c.hdn) cargaTex.load(c.hdn, function (t) { t.anisotropy = ANISO; if (HD[k] === h) { h.normal = t; avisaHD(k); } else t.dispose(); });
    }
    HD[k].usos++; return HD[k];
  }
  var lienzoMide = null;
  function claros(im) {        // los puntos más claros (piedras, filos) de la foto: ahí aparecen los destellos
    try {
      var h = 96, w = Math.max(8, Math.round(im.width * h / im.height));
      var cc = lienzoMide || (lienzoMide = document.createElement('canvas')); cc.width = w; cc.height = h;
      var g = cc.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
      var d = g.getImageData(0, 0, w, h).data, lista = [];
      for (var y = Math.round(h * 0.12); y < h; y += 2) for (var x = 0; x < w; x += 2) {
        var o = (y * w + x) * 4; if (d[o + 3] < 220) continue;
        var l = d[o] * 0.3 + d[o + 1] * 0.59 + d[o + 2] * 0.11; if (l > 238) lista.push([x / w, y / h, l]);
      }
      lista.sort(function (a, b) { return b[2] - a[2]; });
      return lista.slice(0, 10);
    } catch (e) { return []; }
  }
  function avisaHD(k) { var a = aros[k]; if (a && a.matFoto) ponHD(a); }
  function ponHD(a) {
    var h = HD[a.k], m = a.matFoto; if (!h || !m) return;
    if (h.foto && m.map !== h.foto) { m.map = h.foto; m.needsUpdate = true; a.matCanto.map = h.foto; a.matCanto.needsUpdate = true; a.claros = h.claros; }
    if (h.normal && m.normalMap !== h.normal) { m.normalMap = h.normal; m.normalScale.set(1, 1); m.needsUpdate = true; }
  }
  function sueltaHD(k) { var h = HD[k]; if (!h) return; if (--h.usos <= 0) { if (h.foto) h.foto.dispose(); if (h.normal) h.normal.dispose(); delete HD[k]; } }
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
  function matFotoDe(tex) {
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 1, roughness: 0.2, alphaTest: 0.5, alphaToCoverage: true, toneMapped: false });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uBaseFoto = FOTO_U.uBaseFoto; sh.uniforms.uBrilloFoto = FOTO_U.uBrilloFoto; sh.uniforms.uVelo = FOTO_U.uVelo; sh.uniforms.uBarrido = m.userData.barrido;
      sh.fragmentShader = 'uniform float uBaseFoto;\nuniform float uBrilloFoto;\nuniform float uVelo;\nuniform float uBarrido;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', FOTO_FRAG + '\n#include <opaque_fragment>');
    };
    m.userData.barrido = { value: -1 };
    m.customProgramCacheKey = function () { return 'pnt-or-foto'; };
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
  function cantoDe(tex, ancho, alto) {
    var m = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.15 });
    m.userData.tap = { value: new THREE.Vector2(0.018 / Math.max(ancho || 0.3, 0.05), 0.018 / Math.max(alto || 0.5, 0.05)) };
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uTap = m.userData.tap; sh.uniforms.uOscuro = { value: 0.82 };
      sh.fragmentShader = 'uniform vec2 uTap;\nuniform float uOscuro;\n' + sh.fragmentShader.replace('#include <map_fragment>', CANTO_FRAG);
    };
    m.customProgramCacheKey = function () { return 'pnt-or-canto'; };
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
  // la pieza: el contorno extruido (con el hueco del aro), con la foto en sus caras y el canto biselado. El origen es el agujero:
  // el centro del aro de arriba (cx) a la altura ag de la foto
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
      esc: 0.001, semilla: Math.random() * 10, pre: new THREE.Vector3(), velX: 0, claros: null, z: 0 };
    var geo = geoAro(c, ancho, alto);
    if (!geo) { geo = new THREE.PlaneGeometry(ancho, alto); geo.translate((0.5 - c.cx) * ancho, (c.ag - 0.5) * alto, 0); }
    a.geo = geo;
    a.matFoto = matFotoDe(tex); a.matCanto = cantoDe(tex, ancho, alto);
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

  /* ═════════ Cámara y calidad ═════════ */
  function medir() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = camera.aspect < 1 ? 36 : 30; camera.updateProjectionMatrix();
  }
  function aplicaNivel() { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, NIVELES[iNivel].dpr)); medir(); }
  new ResizeObserver(medir).observe(stage); aplicaNivel();
  var ALTO_VISTA = 9.6, ANCHO_VISTA = 6.8;     // la oreja es más ancha (pedido 2026-11-11)
  function distCam() { var th = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); return Math.max((ALTO_VISTA / 2) / th, (ANCHO_VISTA / 2) / (th * camera.aspect)); }
  var ritmo = 16.7, lento = 0, rapido = 0, ultimoCambio = 0;
  function vigilaRitmo(ms, ahora) {
    ritmo += (ms - ritmo) * 0.08;
    if (ahora - ultimoCambio < 2500) return;
    if (ritmo > 22 && iNivel > 0) { lento += ms; if (lento > 1800) { iNivel--; aplicaNivel(); ultimoCambio = ahora; lento = 0; } } else lento = 0;
    if (ritmo < 17.6 && iNivel < techo) { rapido += ms; if (rapido > 9000) { iNivel++; aplicaNivel(); ultimoCambio = ahora; rapido = 0; } } else rapido = 0;
  }

  /* ═════════ Interacción: girar arrastrando (tope elástico, inercia), tocar un aro (lupa) o un agujero (elegirlo) ═════════ */
  var MOV = {
    giro: 14, giroAmort: 0.86, giroFestejo: 7, giroSuelto: 1.4, inercia: 0.6,
    pose: -0.14,                       // la oreja en reposo casi de frente (como en las fotos de aros), apenas girada: se ve su volumen
    reposo: 0.07, reposoVel: 0.23,     // en reposo: un vaivén mínimo
    vuelo: 0.95,                       // segundos del vuelo desde la tarjeta hasta el agujero
    inclina: 0.3,                      // el aro sale del lóbulo apenas hacia adelante (si no, quedaría metido en la oreja)
    pendulo: 15, penduloAmort: 1.7, empuje: 0.03,
    barrido: 7.5, barridoDur: 1.5,
    camara: 2.4, zoomLupa: 0.5, zoomCuff: 0.42,
    intro: 1.3
  };
  var rotY = MOV.pose - 0.9, rotV = 0, centro = MOV.pose, agarre = null, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), sobre = null, sobreAg = null;
  var inercia = 0, crudo = rotY, lupa = null, lupaT = 0, saltar = false, zoom = 1, foco = new THREE.Vector3(-0.3, -1.3, 0), focoObj = new THREE.Vector3(), parX = 0, parY = 0, objX = 0, objY = 0;
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
    var t = tocado(e);
    agarre = { x: e.clientX, x0: e.clientX, y0: e.clientY, t: t, movio: false };
    crudo = rotY; inercia = 0;
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('agarra');
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!agarre) { var t = tocado(e); sobre = t && t.aro || null; sobreAg = t && t.ag || null; canvas.classList.toggle('sobre', !!t); return; }
    var dx = e.clientX - agarre.x; agarre.x = e.clientX;
    if (Math.hypot(e.clientX - agarre.x0, e.clientY - agarre.y0) > 6) agarre.movio = true;
    if (!agarre.movio) return;
    var antes = rotY;
    crudo += dx * 0.0065;
    var d = crudo - centro, ad = Math.abs(d), lim = ad < 0.75 ? ad : Math.min(1.2, 0.75 + (ad - 0.75) * 0.35);
    rotY = centro + (d < 0 ? -lim : lim);
    rotV = rotV * 0.5 + (rotY - antes) * 30;
  });
  function suelta() {
    if (!agarre) return;
    var a = agarre; agarre = null; canvas.classList.remove('agarra');
    if (a.movio) { inercia = MOV.inercia; return; }
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

  // dónde está cada agujero en la pantalla (para soltar una tarjeta arrastrada sobre el más cercano)
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
  var anc = new THREE.Vector3(), nrm = new THREE.Vector3(), qOreja = new THREE.Quaternion(), eY = new THREE.Euler();
  function anclaje(a, out) {        // el agujero en el mundo, apenas adentro del lóbulo (la parte de arriba del aro entra a la oreja)
    var ag = AG[a.hueco];
    out.fromArray(ag.p); nrm.fromArray(ag.n);
    out.addScaledVector(nrm, a.hueco === 'cuff' ? 0.3 : -0.035 - 0.01 * ag.idx);     // el cuff apoya encima del hélix
    return pose.localToWorld(out);
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
  var tiempo = 0, festejo = 0, primero = true, intro = 0, andando = true, tPrev = 0, rotVantes = 0, subida = 1, subV = 0;
  var sinIntro = !!(X.sinIntro && X.sinIntro());
  var qCam = new THREE.Quaternion(), qTmp = new THREE.Quaternion(), cX = new THREE.Vector3(), cY = new THREE.Vector3(), cZ = new THREE.Vector3(), cM = new THREE.Matrix4();
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
    var girandoAMano = agarre && agarre.movio;
    if (festejo > 0) festejo = Math.max(0, festejo - dt);
    if (lupa) lupaT += dt;
    if (inercia > 0) inercia = Math.max(0, inercia - dt);
    // la oreja: vuelve a su pose con un resorte; en el festejo hace un "no" suave (los aros se hamacan)
    if (!girandoAMano) {
      var quieta = !lupa && festejo <= 0;
      var meta = centro + Math.sin(tiempo * MOV.reposoVel) * MOV.reposo * (quieta ? 1 : 0.3);
      if (festejo > 0) meta += Math.sin((2.4 - festejo) * 5.2) * 0.38 * Math.min(1, festejo / 0.6);
      if (lupa && lupa.hueco === 'cuff') meta += 0.35;          // el cuff está atrás: la oreja se gira un poco para mostrarlo
      var kr = festejo > 0 ? MOV.giroFestejo * 3 : (inercia > 0 ? MOV.giroSuelto : MOV.giro);
      rotV += ((meta - rotY) * kr - rotV * 2 * Math.sqrt(kr) * (inercia > 0 ? 0.25 : MOV.giroAmort)) * dt; rotY += rotV * dt;
    }
    var rotA = (rotV - rotVantes) / Math.max(dt, 1e-3); rotVantes = rotV;
    // al empezar, la oreja sube desde un poco más abajo con un resorte
    var subObj = intro > 0 ? 0 : 1; subV += ((subObj - subida) * 30 - subV * 2 * 0.82 * Math.sqrt(30)) * dt; subida += subV * dt;
    oreja.rotation.y = rotY;
    oreja.position.y = -0.55 * subida + Math.sin(tiempo * 0.6) * 0.012;
    oreja.scale.setScalar(1 - 0.06 * subida);
    // cámara: con el mouse, un paralaje suave; en la lupa se acerca al aro
    // en la lupa, el aro ocupa más o menos la mitad del alto (los aros miden de 1,3 a 3,6: el zoom depende de cada uno)
    var zLupa = lupa ? (lupa.hueco === 'cuff' ? MOV.zoomCuff : Math.max(0.3, Math.min(0.72, lupa.alto / (ALTO_VISTA * 0.56)))) : 1;
    zoom += (zLupa - zoom) * Math.min(1, dt * MOV.camara);
    focoObj.set(-0.3, -1.3, 0);
    var flota = X.totalFlota(), vis = 2 * distCam() * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (flota) focoObj.x += vis * camera.aspect * 0.06;           // la oreja un poco a la izquierda: abajo a la derecha está el total
    if (lupa && !lupa.sale) {
      focoObj.copy(lupa.piv.position); focoObj.y -= lupa.alto * 0.42;
      if (flota) { focoObj.x += vis * camera.aspect * 0.11 * zoom; focoObj.y += vis * 0.03 * zoom; } else focoObj.y -= vis * 0.12 * zoom;
    }
    foco.lerp(focoObj, Math.min(1, dt * MOV.camara));
    var mano = agarre || lupa ? 0 : 1;
    parX += (objX * 0.3 * mano - parX) * Math.min(1, dt * 2.2); parY += (objY * 0.16 * mano - parY) * Math.min(1, dt * 2.2);
    camera.position.set(foco.x + parX, foco.y + 0.5 - parY, foco.z + distCam() * zoom);
    camera.lookAt(foco);
    brillo.position.set(Math.sin(tiempo * 0.6) * 3.2 - 0.5, 0.5, Math.cos(tiempo * 0.6) * 3.2 + 2.5);
    oreja.updateMatrixWorld(true);
    caraCamara(qCam);
    pose.getWorldQuaternion(qOreja); eY.setFromQuaternion(qOreja, 'YXZ');

    // los agujeros: aparecen en la intro; el elegido late; los ocupados se esconden (los tapa el aro)
    var t0 = MOV.intro * 0.45;
    IDS.forEach(function (id, i) {
      var a = AG[id], ver = visibleAg(id) && (intro >= 1 || tiempo > t0 + i * 0.14) ? 1 : 0, ocupado = !!st.pos[id];
      a.vis += (ver - a.vis) * Math.min(1, dt * 7);
      var act = st.activo === id && !ocupado ? 1 : 0, res = resaltado === id || sobreAg === id ? 1 : 0;
      a.act += (act - a.act) * Math.min(1, dt * 8); a.res += (res - a.res) * Math.min(1, dt * 10);
      var late = a.act * (0.5 + 0.5 * Math.sin(tiempo * 4.2));
      a.anillo.scale.setScalar(Math.max(0.001, a.vis * (1 + 0.16 * late + 0.35 * a.res)));
      a.anillo.material.opacity = a.vis * (ocupado ? 0 : 0.42 + 0.4 * a.act + 0.4 * a.res);
      a.anillo.visible = a.anillo.material.opacity > 0.01;
      a.punto.visible = a.vis > 0.02 && !ocupado; a.punto.scale.setScalar(Math.max(0.001, a.vis));
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
        if (a.sale.op <= 0 || p.position.y < -9) { liberaAro(a); vivos.splice(vi, 1); continue; }
      } else {
        if (a.mueve) {     // cambió de agujero: viaja en un arco corto
          a.mueve.u = Math.min(1, a.mueve.u + dt / 0.55);
          var em = a.mueve.u < 0.5 ? 2 * a.mueve.u * a.mueve.u : 1 - Math.pow(-2 * a.mueve.u + 2, 2) / 2;
          anc.lerpVectors(a.mueve.de, anc, em); anc.z += Math.sin(em * Math.PI) * 0.6;
          if (a.mueve.u >= 1) { a.mueve = null; a.om += 1.6; }
        }
        a.hov += ((sobre === a && !agarre ? 1 : 0) - a.hov) * Math.min(1, dt * 9);
        p.position.copy(anc);
        // cuelga con la gravedad: mira a la cámara a medias y sigue el giro de la oreja a medias
        qTmp.setFromEuler(eY.set(0, eY.y, 0, 'YXZ')); p.quaternion.copy(qTmp).slerp(qCam, 0.5);
        var enLupa = lupa === a;
        a.lupa += ((enLupa ? 1 : 0) - a.lupa) * Math.min(1, dt * 3);
        if (a.lupa > 0.001) p.rotateY(Math.sin(lupaT * 0.8) * 0.5 * a.lupa);
        // péndulo de costado: con la aceleración del agujero (cuando la oreja gira) y del giro
        var vx = (anc.x - a.pre.x) / Math.max(dt, 1e-3), acel = (vx - a.velX) / Math.max(dt, 1e-3); a.velX = vx;
        var esCuff = c.tipo === 'cuff';
        if (!esCuff) {
          a.om += (-MOV.pendulo * a.th - MOV.penduloAmort * a.om - acel * MOV.empuje) * dt;
          a.th = Math.max(-0.7, Math.min(0.7, a.th + a.om * dt)); if (Math.abs(a.th) >= 0.7) a.om *= -0.3;
          a.ov += (-13 * a.ph - 1.8 * a.ov + rotA * 0.03) * dt;
          a.ph = Math.max(-0.45, Math.min(0.45, a.ph + a.ov * dt));
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

    // etiqueta: el aro (o el agujero libre) bajo el mouse
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
    mueve: function (k, hueco) {      // un aro que ya está puesto pasa a otro agujero
      var a = aros[k]; if (!a || a.hueco === hueco) return;
      oreja.updateMatrixWorld(true); var de = anclaje(a, new THREE.Vector3());
      a.hueco = hueco; a.mueve = { de: de, u: 0 };
    },
    resalta: function (cx, cy, k) { resaltado = cx == null ? null : masCerca(cx, cy, k); return resaltado; },
    huecos: function () { vivos.forEach(function (o) { o.om += (Math.random() - 0.5) * 0.8; }); },
    cierraLupa: function () { cierraLupa(); },
    precarga: function (k) { if (AR[k]) textura(k); },
    festejo: function () {
      festejo = 2.4; barridoT = 0; vivos.forEach(function (o, i) { o.barrido = 0; o.om += 2.2; setTimeout(function () { if (!o.sale) destello(o.piv.position.clone().add(new THREE.Vector3(0, -o.alto * 0.4, 0.1)), 9, o.ancho); }, 200 + i * 120); });
    },
    despierta: function () { if (!andando && !relojManual) { andando = true; saltaDelta = true; tPrev = 0; requestAnimationFrame(cuadro); } }
  };

  /* Arranque: con la malla y los dos entornos listos se compila todo en segundo plano y recién ahí se dibuja (como el armador) */
  function asienta() { renderer.info.programs.forEach(function (p) { try { p.getUniforms(); p.getAttributes(); } catch (e) {} }); }
  function cuandoQuieta(f) { var q = X.quieta ? X.quieta() : 1e9; if (q < 200) setTimeout(function () { cuandoQuieta(f); }, 210 - q); else f(); }
  var maniqui = (function () {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
    var px = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); px.colorSpace = THREE.SRGBColorSpace; px.needsUpdate = true;
    var nx = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); nx.needsUpdate = true;
    var chica = matFotoDe(px), hd = matFotoDe(px); hd.normalMap = nx;
    var g = new THREE.Group();
    [chica, hd, cantoDe(px)].forEach(function (m) { var o = new THREE.Mesh(geo, m); o.castShadow = true; g.add(o); });
    return g;
  })();
  var compilado = false, quiereEmpezar = false, empezo = false, fallo = false;
  Promise.all([listoEntorno, listaMalla]).then(function () {
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
    if (sinIntro) { intro = 1; subida = 0; rotY = centro; }
    requestAnimationFrame(cuadro);
    var rapido = sinIntro;
    var ya = IDS.filter(function (id) { return st.pos[id]; });
    if (ya.length) { ya.forEach(function (id, i) { setTimeout(function () { var k = st.pos[id]; if (k && !aros[k]) api.agregar(k, null, id, rapido); }, (rapido ? 0 : 1100) + i * 230); }); }
    else X.ejemplo(function (k, id, i) { setTimeout(function () { X.ponEjemplo(k, id, rapido); }, (rapido ? 0 : 1250) + i * 280); });
    setTimeout(function () { st.intro = false; X.pintaResumen(); }, rapido ? 50 : 2600);
  }

  /* ═════════ Pruebas (solo con ?ordebug) ═════════ */
  if (X.debug) {
    window.__or = {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera, api: api, vivos: vivos, tiempos: tiempos, MOV: MOV, AG: AG, matOreja: matOreja, FOTO_U: FOTO_U,
      relojManual: function (si) { relojManual = !!si; if (!si) { andando = false; api.despierta(); } },
      avanza: function (seg, n) { for (var i = 0; i < (n || 1); i++) paso(seg || 1 / 30); },
      lupa: function (k) { if (aros[k]) abreLupa(aros[k]); else cierraLupa(); },
      gira: function (r) { centro = MOV.pose + (r || 0); },
      poster: function () { brillos.forEach(function (b) { b.vida = 0; b.sp.visible = false; }); barridoT = -1; barridoLuz.intensity = 0; esperaG = 1e9; paso(1 / 30); return renderer.domElement.toDataURL('image/png'); }
    };
  }
  return api;
};
})();
