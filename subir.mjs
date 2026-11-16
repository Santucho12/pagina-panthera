// ⛔ SUBIDA BLOQUEADA ⛔
//
// Por ahora NO se sube nada a Tiendanube por FTP: Panthera todavía no dio el permiso para
// actualizar la tienda. Todo se trabaja en local (tienda/) y se ve con npm run dev.
//
// Cuando den el OK por escrito, recién ahí se arma la subida (como subir.mjs de BS23:
// diff, lista de lo que se sube, backup previo con npm run bajar y push).
// Hasta entonces este script solo avisa y no hace nada.

console.error(`
  ⛔ SUBIDA BLOQUEADA

  Todavía no tenemos permiso de Panthera para actualizar la tienda de Tiendanube.
  No se sube nada por FTP hasta que den el OK.

  Para ver qué cambiaría (sin subir): npm run diferencias
`);
process.exit(1);
