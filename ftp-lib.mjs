// ⚠️  NO SE SUBE NADA POR FTP HASTA QUE PANTHERA DÉ EL OK (ver LEEME.md).
//
// Lógica compartida de FTP. Las credenciales viven SOLO en .ftp-panthera.nuvem (raíz del proyecto),
// nunca dentro de tienda/ ni de los backups: así un `npx tiendanube theme ftp push` o `watch`
// escrito a mano dentro de esas carpetas falla por no tener credenciales, y no publica nada.
// Los scripts que necesitan el FTP (solo lectura: pull y diff) copian el archivo un momento
// a la carpeta, corren el comando y lo borran al terminar.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const RAIZ = import.meta.dirname;
export const CREDENCIALES = path.join(RAIZ, '.ftp-panthera.nuvem');

// Comandos del CLI de Tiendanube que este proyecto permite. push y watch PUBLICAN en la tienda: no están.
const PERMITIDOS = new Set(['pull', 'diff']);

export function ftp(comando, carpeta, extra = []) {
    if (!PERMITIDOS.has(comando)) {
        throw new Error(`"${comando}" no está permitido: por ahora no se sube nada a Tiendanube (ver LEEME.md).`);
    }
    if (!fs.existsSync(CREDENCIALES)) {
        throw new Error('Falta .ftp-panthera.nuvem en la raíz del proyecto.');
    }
    fs.mkdirSync(carpeta, { recursive: true });
    const destino = path.join(carpeta, '.nuvem');
    const borrar = () => { try { fs.rmSync(destino, { force: true }); } catch { /* ya no está */ } };
    process.once('SIGINT', () => { borrar(); process.exit(130); });
    fs.copyFileSync(CREDENCIALES, destino);
    try {
        return spawnSync(`npx tiendanube theme ftp ${comando} ${extra.join(' ')}`, {
            cwd: carpeta, shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']
        });
    } finally {
        borrar();
    }
}
