import Lenis from 'lenis';
import { gsap } from 'gsap';

const root = document.documentElement;

// ============ SCROLL SUAVE (Lenis), igual que en BS23 ============
// Pesado y con inercia. Queda quieto mientras corre la intro (intro-lock), con el menú
// lateral abierto (menu-lock) y mientras las etapas esperan arriba de todo (etapas-lock).
// La rueda, el dedo, el teclado y los links internos (#seccion) bajan con la misma suavidad.
let lenis = null;
lenis = new Lenis({
  lerp: 0.05,           // lerp bajo = más inercia (más pesado)
  wheelMultiplier: 0.5, // cada golpe de rueda baja la mitad de lo normal (más lento)
  smoothWheel: true,
  syncTouch: true,      // en el celular también: el dedo arrastra con la misma inercia
  syncTouchLerp: 0.05,
  touchMultiplier: 0.75,
  // Tope de velocidad: el destino del scroll nunca se adelanta más de TOPE px a lo que
  // se ve en pantalla, por más fuerte que se gire la rueda o se deslice el trackpad
  virtualScroll(d) {
    if (!lenis) return;
    const tipo = d.event && d.event.type;
    if (tipo !== 'wheel' && tipo !== 'touchend') return;
    const tope = Math.min(innerHeight * 0.4, 360);
    const adelanto = lenis.targetScroll - lenis.animatedScroll;
    const nuevo = adelanto + d.deltaY;
    if (nuevo > tope) d.deltaY = Math.max(tope - adelanto, 0);
    else if (nuevo < -tope) d.deltaY = Math.min(-tope - adelanto, 0);
  },
});

// Un solo reloj para Lenis y GSAP: así el scroll y las animaciones van en el mismo cuadro
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

function sincronizar() {
  const quieto = ['intro-lock', 'menu-lock', 'etapas-lock'].some((c) => root.classList.contains(c));
  if (quieto) lenis.stop();
  else lenis.start();
}
sincronizar();
new MutationObserver(sincronizar).observe(root, { attributes: true, attributeFilter: ['class'] });

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const destino = id.length > 1 ? document.querySelector(id) : null;
  if (!destino) return;
  e.preventDefault();
  lenis.scrollTo(destino, { duration: 1.5, offset: -60 });
});

// El teclado (flechas, espacio, re pág/av pág, inicio/fin) baja con la misma inercia que la rueda
document.addEventListener('keydown', (e) => {
  if (lenis.isStopped || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest && e.target.closest('input, textarea, select, button, [contenteditable]')) return;
  const pagina = innerHeight * 0.85;
  const paso = { ArrowDown: 100, ArrowUp: -100, PageDown: pagina, PageUp: -pagina, ' ': e.shiftKey ? -pagina : pagina }[e.key];
  let destino;
  if (e.key === 'Home') destino = 0;
  else if (e.key === 'End') destino = lenis.limit;
  else if (paso) destino = lenis.targetScroll + paso;
  else return;
  e.preventDefault();
  lenis.scrollTo(destino);
});

// ============ HERO = ETAPAS (aros, collares, pulseras, anillos) ============
// Arriba de todo la página queda quieta. Cada gesto hacia abajo (rueda, dedo o teclado)
// reproduce el tramo del video hasta la etapa siguiente, a su ritmo, y muestra su info;
// hacia arriba vuelve a la anterior con la copia invertida del video. Después de anillos,
// el próximo gesto suelta la página y baja a la colección. Al volver arriba de todo, las
// etapas retoman el control donde quedaron.
const FPS = 24;
const ULTIMO = 96;                  // último cuadro del video (son 97)
const CORTES = [0, 14, 45, 72, 96]; // dónde frena el video: portada, aros, collares, pulseras, anillos
const ETAPAS = [                    // cuadros en los que se ve cada etapa (para mostrar su info a tiempo)
  { desde: 0, hasta: 14 },  // aros
  { desde: 29, hasta: 45 }, // collares
  { desde: 53, hasta: 72 }, // pulseras
  { desde: 81, hasta: 96 }, // anillos
];

const vAdelante = document.getElementById('videoAdelante');
const vAtras = document.getElementById('videoAtras');
const paneles = [...document.querySelectorAll('.etapa')];
const pasos = [...document.querySelectorAll('.paso')];
let etapa = 0;        // 0 = portada (logo); 1 a 4 = aros, collares, pulseras, anillos
let animando = false;
let pendiente = 0;    // gesto que llegó mientras corría el video: se hace apenas termina
let retenido = false; // la página espera arriba de todo y el scroll pasa de etapa
let seFue = false;    // ya bajó lo suficiente como para que volver arriba la retenga de nuevo

// Lleva el video a un cuadro exacto (al medio del cuadro, para no caer en el borde).
// Si el video no responde (no cargó o el navegador no lo puede leer) sigue igual a los 1,5 s
function ubicar(v, f) {
  return new Promise((resolver) => {
    let hecho = false;
    const ok = () => { if (!hecho) { hecho = true; resolver(); } };
    const t = Math.min((f + 0.5) / FPS, (v.duration || 99) - 0.001);
    if (v.error || Math.abs(v.currentTime - t) < 0.002) { ok(); return; }
    v.addEventListener('seeked', ok, { once: true });
    setTimeout(ok, 1500);
    v.currentTime = t;
  });
}

function mostrar(v) {
  vAdelante.classList.toggle('visible', v === vAdelante);
  vAtras.classList.toggle('visible', v === vAtras);
}

// Reproduce el video a velocidad normal y lo frena justo en el cuadro f
function correrHasta(v, f) {
  return new Promise((ok) => {
    let terminado = false;
    const fin = () => {
      if (terminado) return;
      terminado = true;
      v.pause();
      ubicar(v, f).then(ok);
    };
    const mirar = (cuadro) => (cuadro >= f ? fin() : seguir());
    const seguir = () => {
      if (terminado) return;
      if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback((_, meta) => mirar(Math.round(meta.mediaTime * FPS)));
      else requestAnimationFrame(() => mirar(Math.round(v.currentTime * FPS)));
    };
    v.addEventListener('ended', fin, { once: true });
    v.play().then(seguir, fin);
  });
}

// Portada (logo, botones e indicador) ↔ etapas (sombra de la izquierda y barra de abajo)
function portada(ver) {
  gsap.to('.cine-in', { autoAlpha: ver ? 1 : 0, y: ver ? 0 : -60, duration: ver ? 0.9 : 0.6, ease: ver ? 'power2.out' : 'power1.in', overwrite: true });
  gsap.to('.cine-overlay', { opacity: ver ? 1 : 0, duration: 0.8, overwrite: true });
  gsap.to('.etapas-sombra', { opacity: ver ? 0 : 1, duration: 0.8, overwrite: true });
  gsap.to('.etapas-pasos', { autoAlpha: ver ? 0 : 1, duration: 0.6, delay: ver ? 0 : 0.3, overwrite: true });
  gsap.to('.desliza-w', { autoAlpha: ver ? 1 : 0, duration: 0.5, overwrite: true });
}

// La info entra de a partes: número, nombre (se revela de izquierda a derecha), texto, características y botón
function entrarInfo(n) {
  const panel = paneles[n - 1];
  const [num, texto, ...resto] = panel.querySelectorAll('.e-a');
  const titulo = panel.querySelector('.etapa-tit');
  gsap.killTweensOf([num, texto, titulo, ...resto]);
  gsap.timeline()
    .fromTo(num, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
    .set(titulo, { autoAlpha: 1, y: 0, '--rx': '-25%' }, 0.1)
    .to(titulo, { '--rx': '125%', duration: 1, ease: 'power1.inOut' }, 0.1)
    .fromTo(texto, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.45)
    .fromTo(resto, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.65);
}

function salirInfo(n) {
  const piezas = paneles[n - 1].querySelectorAll('.e-a, .etapa-tit');
  gsap.killTweensOf(piezas);
  gsap.to(piezas, { autoAlpha: 0, y: -20, duration: 0.35, stagger: 0.03, ease: 'power1.in' });
}

// Barra de abajo: se llenan las etapas vistas y la actual queda marcada
function marcarBarra(destino, dur) {
  pasos.forEach((p, k) => {
    const cambia = k === destino - 1 || k === destino;
    gsap.to(p.querySelector('b'), { scaleX: k < destino ? 1 : 0, duration: cambia ? Math.max(dur, 0.4) : 0.3, ease: 'power1.inOut', overwrite: true });
    p.classList.toggle('activo', k === destino - 1);
  });
}

function irA(destino) {
  const desde = etapa;
  const adelante = destino > desde;
  const fDesde = CORTES[desde];
  const fHasta = CORTES[destino];
  const dur = Math.abs(fHasta - fDesde) / FPS;
  etapa = destino;
  animando = true;

  // Se va lo que estaba y entra lo nuevo cuando el video ya muestra la etapa
  if (desde === 0) portada(false);
  else salirInfo(desde);
  if (destino === 0) {
    gsap.delayedCall(Math.max(dur - 0.35, 0), () => portada(true));
  } else {
    const e = ETAPAS[destino - 1];
    const enPantalla = adelante ? (e.desde + 1 - fDesde) / FPS : (fDesde - (e.hasta + 1)) / FPS;
    gsap.delayedCall(Math.max(enPantalla, desde === 0 ? 0.35 : 0), () => entrarInfo(destino));
  }
  marcarBarra(destino, dur);

  const video = adelante
    ? correrHasta(vAdelante, fHasta)
    : ubicar(vAtras, ULTIMO - fDesde)
      .then(() => { mostrar(vAtras); return correrHasta(vAtras, ULTIMO - fHasta); })
      .then(() => ubicar(vAdelante, fHasta))
      .then(() => mostrar(vAdelante));
  // Seguro: pase lo que pase con el video, la etapa nunca queda trabada
  const tope = new Promise((ok) => setTimeout(ok, dur * 1000 + 3000));

  Promise.race([video, tope]).then(() => {
    animando = false;
    if (pendiente) {
      const p = pendiente;
      pendiente = 0;
      if (p > 0) bajar(); else subir();
    }
  });
}

function retener() {
  retenido = true;
  root.classList.add('etapas-lock');
}

function liberar() {
  retenido = false;
  seFue = false;
  root.classList.remove('etapas-lock');
  lenis.start();
}

function bajar() {
  if (!retenido) return;
  if (animando) { pendiente = 1; return; }
  if (etapa < CORTES.length - 1) {
    irA(etapa + 1);
  } else {
    // Después de anillos se suelta la página y baja a la colección
    liberar();
    lenis.scrollTo('#coleccion', { duration: 1.6, offset: -60 });
  }
}

function subir() {
  if (!retenido) return;
  if (animando) { pendiente = -1; return; }
  if (etapa > 0) irA(etapa - 1);
}

function alScrollear() {
  const y = scrollY;
  if (retenido) {
    // Algo movió la página igual (un link, el foco): se suelta sin esperar
    if (y > 2) liberar();
    return;
  }
  if (y > innerHeight * 0.3) { seFue = true; return; }
  // Arriba de todo otra vez: las etapas retoman el control donde quedaron
  if (y < 1 && seFue) { seFue = false; retener(); }
}
addEventListener('scroll', alScrollear, { passive: true });
lenis.on('scroll', alScrollear);

// Mientras la página espera, la rueda, el dedo y el teclado no la mueven: pasan de etapa.
// Un gesto es una tanda seguida de eventos (la inercia del trackpad incluida): cuenta una sola vez.
const enMenu = (e) => e.target.closest && e.target.closest('[data-lenis-prevent]');
let ultimaRueda = 0;
addEventListener('wheel', (e) => {
  const ahora = performance.now();
  const nuevoGesto = ahora - ultimaRueda > 200;
  ultimaRueda = ahora;
  if (!retenido || e.ctrlKey || enMenu(e)) return; // ctrl + rueda es el zoom del navegador
  e.preventDefault();
  if (!nuevoGesto || Math.abs(e.deltaY) < 4) return;
  if (e.deltaY > 0) bajar(); else subir();
}, { passive: false });

let dedo = null;
addEventListener('touchstart', (e) => { dedo = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => {
  // Durante la intro el dedo no mueve la página
  if (root.classList.contains('intro-lock')) { if (e.cancelable) e.preventDefault(); return; }
  if (!retenido || e.touches.length > 1 || enMenu(e)) return; // con dos dedos es zoom
  if (e.cancelable) e.preventDefault();
  if (dedo === null) return;
  const d = dedo - e.touches[0].clientY;
  if (Math.abs(d) > 30) {
    dedo = null;
    if (d > 0) bajar(); else subir();
  }
}, { passive: false });

addEventListener('keydown', (e) => {
  if (!retenido || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest && e.target.closest('input, textarea, select, button, [contenteditable]')) return;
  const abajo = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
  const arriba = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
  if (!abajo && !arriba) return;
  e.preventDefault();
  if (e.repeat) return; // tecla apretada: un solo paso
  if (abajo) bajar(); else subir();
});

// Un link a otra sección suelta la página en el acto (escucha antes que el scroll suave)
document.addEventListener('click', (e) => {
  if (!retenido) return;
  const a = e.target.closest('a[href^="#"]');
  if (a && a.getAttribute('href').length > 1) liberar();
}, true);

// ============ INTRO (mismos tiempos que static/js/intro.js de Signos) ============
const REVELADO = 1200; // barrido del logo
const PAUSA = 80;      // pausa breve antes de aclarar
const SALIDA = 500;    // el velo se quita a mitad de su fundido, igual que en Signos
const velo = document.getElementById('intro');

let arrancado = false;
function arrancar() {
  if (arrancado) return;
  arrancado = true;
  root.classList.add('intro-run');
  setTimeout(salir, REVELADO + PAUSA);
}

function salir() {
  velo.classList.add('is-exiting');

  // El resto del hero entra con suavidad
  setTimeout(() => {
    root.classList.add('hero-in');
    root.classList.remove('intro-on');
  }, 100);

  // Se libera la intro: arriba de todo, las etapas toman el control del scroll
  setTimeout(() => {
    root.classList.remove('intro-lock', 'intro-run');
    velo.remove();
    if (scrollY < 1) retener();
    vAtras.preload = 'auto';
    vAtras.load();
  }, SALIDA + 50);

  // Recién cuando terminó la entrada de los botones y del indicador de scroll
  setTimeout(() => root.classList.remove('hero-in'), 2600);
}

// Arranca con el logo, el primer cuadro del video y la tipografía listos
const logo = document.getElementById('introLogo');
const videoListo = new Promise((ok) => {
  if (vAdelante.readyState >= 2) ok();
  else { vAdelante.addEventListener('loadeddata', ok, { once: true }); vAdelante.addEventListener('error', ok, { once: true }); }
});
Promise.all([logo.decode(), videoListo, document.fonts.load('500 12px Outfit')]).then(arrancar, arrancar);
setTimeout(arrancar, 1200);

// ============ BARRA DE BENEFICIOS (va repetida para que el loop no corte) ============
const BENEFICIOS = ['3x2 en toda la tienda', 'Envío gratis desde $150.000', 'Plata 925 y baño de oro'];
document.getElementById('pista').innerHTML =
  Array(4).fill(BENEFICIOS).flat().map((b) => `<span>${b}</span>`).join('');

// ============ NAVBAR: se vuelve isla al bajar el 40% de la primera pantalla (en celular, apenas se scrollea) ============
// Si la isla pasa por encima de una sección oscura ([data-oscuro]) cambia a vidrio oscuro con texto blanco
const hdr = document.getElementById('hdr');
const oscuras = document.querySelectorAll('[data-oscuro]');
function isla() {
  const corte = innerWidth <= 767 ? 15 : innerHeight * 0.4;
  hdr.classList.toggle('island', scrollY > corte);

  const r = hdr.getBoundingClientRect();
  const medio = r.top + r.height / 2;
  let oscuro = false;
  oscuras.forEach((s) => {
    const b = s.getBoundingClientRect();
    if (b.top <= medio && b.bottom >= medio) oscuro = true;
  });
  hdr.classList.toggle('oscura', oscuro);
}
addEventListener('scroll', isla, { passive: true });
addEventListener('resize', isla);
lenis.on('scroll', isla);
isla();

// ============ MENÚ LATERAL ============
const drawer = document.getElementById('drawer');
const abrir = () => { drawer.classList.add('open'); root.classList.add('menu-lock'); };
const cerrar = () => { drawer.classList.remove('open'); root.classList.remove('menu-lock'); };
document.getElementById('burger').addEventListener('click', abrir);
document.getElementById('close').addEventListener('click', cerrar);
document.getElementById('dim').addEventListener('click', cerrar);
