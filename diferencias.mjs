// ⚠️  NO SE SUBE NADA POR FTP HASTA QUE PANTHERA DÉ EL OK (ver LEEME.md).
//
// npm run diferencias: muestra qué cambiaría en la tienda si se subiera tienda/ (solo mira, no sube nada).
import path from 'node:path';
import { ftp, RAIZ } from './ftp-lib.mjs';

console.log('Comparando tienda/ con lo que está publicado en Tiendanube (solo lectura)...');
const r = ftp('diff', path.join(RAIZ, 'tienda'), ['--json']);
if (r.status !== 0) { process.exit(r.status ?? 1); }
const { added: nuevos, modified: cambiados, deleted: borrados } = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));

if (![...nuevos, ...cambiados, ...borrados].length) {
    console.log('Sin diferencias: tienda/ es igual a lo publicado.');
    process.exit(0);
}
const listar = (titulo, lista) => { if (lista.length) { console.log(`\n${titulo}:\n${lista.map((f) => `  ${f}`).join('\n')}`); } };
listar('Archivos nuevos (no están en la tienda)', nuevos);
listar('Archivos modificados', cambiados);
listar('Están en la tienda pero no en tienda/', borrados);
console.log('\nEstos cambios quedan en local. NO se suben hasta que Panthera dé el OK.');
