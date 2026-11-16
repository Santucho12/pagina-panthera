import sys; sys.path.insert(0, 'herramientas/armador/parches')
from parche import parche
parche('tienda/static/panthera/armar3d.js', [
("function distCam(asp) { var th = Math.tan(fovDe(asp) * Math.PI / 360); return Math.max(6, (1.5 * 1.06 + (asp < 1 ? 0.5 : 0.9)) / (th * asp), 2.15 / th); }",
 "// (2026-11-15, pedido: \"en mobile acercá la pulsera\") movil = el escenario de celular (apaisado y bajo): se acerca la cámara (alto visible 3,2 en vez de 4,3 unidades) y\n// se achica el margen de los costados: la pulsera pasa de ocupar el 46 % del ancho a ~64 %\nfunction distCam(asp, movil) { var th = Math.tan(fovDe(asp) * Math.PI / 360), m = !!movil && asp >= 1; return Math.max(m ? 4.3 : 6, (1.5 * 1.06 + (asp < 1 ? 0.5 : (m ? 0.35 : 0.9))) / (th * asp), (m ? 1.6 : 2.15) / th); }"),
("distCam(a0) * Math.tan(fovDe(a0) * Math.PI / 360)) / (distCam(a) * Math.tan(fovDe(a) * Math.PI / 360))",
 "distCam(a0) * Math.tan(fovDe(a0) * Math.PI / 360)) / (distCam(a, W < 700) * Math.tan(fovDe(a) * Math.PI / 360))"),
])
parche('tienda/static/panthera/armar3d-escena.js', [
("if (X.distCam) return X.distCam(camera.aspect);", "if (X.distCam) return X.distCam(camera.aspect, stage.clientWidth < 700);"),
])
parche('tienda/static/panthera/oreja3d-escena.js', [
("""    var asp = camera.aspect, cel = asp < 0.9, quiere = (cel ? F.altoCel : F.alto) * ESC;""",
 """    // (2026-11-15, pedido: "en mobile acercá la oreja para ver de más cerca los aritos") escenario de celular apaisado y bajo: más zoom (altoM)
    var asp = camera.aspect, cel = asp < 0.9, mov = !cel && F.altoM && stage.clientWidth < 700, quiere = (cel ? F.altoCel : (mov ? F.altoM : F.alto)) * ESC;"""),
("  function focoBase(out) { var cel = camera.aspect < 0.9, f = cel ? F.focoCel : F.foco; return aMundo(f[0], f[1], out); }",
 "  function focoBase(out) { var cel = camera.aspect < 0.9, mov = !cel && F.focoM && stage.clientWidth < 700, f = cel ? F.focoCel : (mov ? F.focoM : F.foco); return aMundo(f[0], f[1], out); }"),
])
parche('tienda/static/panthera/oreja3d.js', [
("""function vistaDe(asp) {
  var f = CTX.foto; if (!f) return null;
  var E = f.escala, cel = asp < 0.9, ANCHO = f.w * E, ALTO = f.h * E;
  var H = Math.min((cel ? f.altoCel : f.alto) * E, ANCHO * 0.995 / asp, ALTO * 0.995);
  var fb = cel ? f.focoCel : f.foco, cx0 = f.foco[0], cy0 = f.foco[1];""",
"""function vistaDe(asp, movil) {
  var f = CTX.foto; if (!f) return null;
  var E = f.escala, cel = asp < 0.9, mov = !!movil && !cel && !!f.altoM, ANCHO = f.w * E, ALTO = f.h * E;
  var H = Math.min((cel ? f.altoCel : (mov ? f.altoM : f.alto)) * E, ANCHO * 0.995 / asp, ALTO * 0.995);
  var fb = cel ? f.focoCel : (mov ? f.focoM : f.foco), cx0 = f.foco[0], cy0 = f.foco[1];"""),
("v = vistaDe(W / Hs)", "v = vistaDe(W / Hs, W < 700)"),
])
