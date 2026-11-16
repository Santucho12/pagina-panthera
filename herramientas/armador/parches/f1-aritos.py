import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/oreja3d-escena.js', [
("""  var matsArgolla = {};
  function matArgolla(metal) {
    metal = METAL[metal] ? metal : 'oro';
    if (!matsArgolla[metal]) {
      var m = new THREE.MeshPhysicalMaterial({ color: METAL[metal], metalness: 1, roughness: metal === 'plata' ? 0.08 : 0.1, envMapIntensity: 1.05, envMap: ENV_ARG });""",
"""  var matsArgolla = {};
  function matArgolla(metal, propio) {
    metal = METAL[metal] ? metal : 'oro';
    if (propio || !matsArgolla[metal]) {
      // (2026-11-14, realismo) un poco menos espejo: el dije es una foto, más suave, y al lado la argolla parecía de otro metal
      var m = new THREE.MeshPhysicalMaterial({ color: METAL[metal].clone(), metalness: 1, roughness: metal === 'plata' ? 0.14 : 0.19, envMapIntensity: 0.98, envMap: ENV_ARG });"""),
("""      m.customProgramCacheKey = function () { return 'pnt-or-arg2'; };
      matsArgolla[metal] = m;
    }
    return matsArgolla[metal];
  }""",
"""      m.customProgramCacheKey = function () { return 'pnt-or-arg2'; };
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
  }"""),
("""      D = Math.max(0.85, Math.min(1.75, D));
      var w = Math.max(0.11, Math.min(0.26, (g ? g.banda : 0.24) * D * 0.82)), t = Math.max(0.08, Math.min(0.15, w * 0.55 + 0.02));
      a.D = D; a.w = w; a.t = t;
      a.geoA = geoArgolla(D, w, t);
      var arg = new THREE.Mesh(a.geoA, matArgolla(g ? g.metal : 'oro'));
      arg.castShadow = true; arg.renderOrder = 2; arg.userData.aro = a;""",
"""      D = Math.max(0.85, Math.min(1.75, D));
      /* (2026-11-14, realismo) A ESCALA REAL: la oreja de la foto mide ~6,1 cm (1 unidad = 1 cm) y una argollita de estas, 1,1–1,2 cm.
         Los altos que salieron de las fotos daban argollas de hasta 1,75 cm: se veían enormes en el lóbulo. La pieza entera (argolla
         + dije) se achica hasta que la argolla mida 1,2 cm como mucho (fe); el dije conserva su proporción con ella. Y la argolla
         es más fina: 1,1–2 mm de ancho (era hasta 2,6) y 0,8–1,1 mm de espesor (era hasta 1,5). */
      var fe = D > 1.2 ? Math.max(0.7, 1.2 / D) : 1;
      D *= fe; a.fe = fe; a.alto = alto * fe; a.ancho = ancho * fe;
      var w = Math.max(0.11, Math.min(0.2, (g ? g.banda : 0.24) * D * 0.78)), t = Math.max(0.08, Math.min(0.11, w * 0.5 + 0.015));
      a.D = D; a.w = w; a.t = t;
      a.geoA = geoArgolla(D, w, t);
      var arg = new THREE.Mesh(a.geoA, matArgolla(g ? g.metal : 'oro', true));
      arg.userData.propia = true; a.matArg = arg.material; tonoDeLaFoto(a, g, tex);
      arg.castShadow = true; arg.renderOrder = 2; arg.userData.aro = a;"""),
("""      var dije = new THREE.Group(); dije.position.set(0, -(D - t), 0.03); col.add(dije); a.dije = dije;""",
 """      var dije = new THREE.Group(); dije.position.set(0, -(D - t), 0.03); dije.scale.setScalar(fe); col.add(dije); a.dije = dije;"""),
("""    [a.matFoto, a.matCanto, a.matProf].forEach(function (m) { if (m) m.dispose(); });""",
 """    [a.matFoto, a.matCanto, a.matProf, a.matArg].forEach(function (m) { if (m) m.dispose(); });"""),
("var ABRE = { l1: 0.22, l2: 0.17, l3: 0.27 };", "var ABRE = { l1: 0.15, l2: 0.11, l3: 0.19 };"),
])
