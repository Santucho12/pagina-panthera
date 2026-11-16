// ⚠️  NO SE SUBE NADA POR FTP HASTA QUE PANTHERA DÉ EL OK (ver LEEME.md).
//
// npm run bajar: descarga el tema publicado a una carpeta NUEVA tienda-backup-ftp-AAAA-MM-DD[-n]
// (solo lectura sobre la tienda). No toca tienda/, donde trabajamos.
import fs from 'node:fs';
import path from 'node:path';
import { ftp, RAIZ } from './ftp-lib.mjs';

const hoy = new Date().toISOString().slice(0, 10);
let carpeta = path.join(RAIZ, `tienda-backup-ftp-${hoy}`);
for (let n = 2; fs.existsSync(carpeta); n++) { carpeta = path.join(RAIZ, `tienda-backup-ftp-${hoy}-${n}`); }

console.log(`Bajando el tema publicado a ${path.basename(carpeta)}/ ...`);
const r = ftp('pull', carpeta);
if (r.status !== 0) { process.exit(r.status ?? 1); }
console.log(`Listo: ${path.basename(carpeta)}/`);
