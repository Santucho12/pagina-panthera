// Simplifica la malla cruda de la oreja (meshoptimizer: colapso de aristas con error cuadrático) y la guarda cuantizada:
// oreja.bin = cabecera (magia 'ORJ1', nV, nT, caja mín/máx) + posiciones int16×3 + normales int8×4 + índices uint16×3.
import fs from 'fs';
import { MeshoptSimplifier } from 'meshoptimizer';
await MeshoptSimplifier.ready;
const V = new Float32Array(fs.readFileSync('crudo_v.f32').buffer.slice(0));
const N = new Float32Array(fs.readFileSync('crudo_n.f32').buffer.slice(0));
const F = new Uint32Array(fs.readFileSync('crudo_f.u32').buffer.slice(0));
const AO = fs.existsSync('crudo_ao.f32') ? new Float32Array(fs.readFileSync('crudo_ao.f32').buffer.slice(0)) : null;
const META = +(process.argv[2] || 26000);
const [idx, err] = MeshoptSimplifier.simplify(F, V, 3, META * 3, 0.0008, ['LockBorder']);
// compacta: solo los vértices usados
const mapa = new Int32Array(V.length / 3).fill(-1); let n = 0;
for (const i of idx) if (mapa[i] < 0) mapa[i] = n++;
const v = new Float32Array(n * 3), nn = new Float32Array(n * 3), ao = new Float32Array(n).fill(1);
for (let i = 0; i < mapa.length; i++) if (mapa[i] >= 0) { v.set(V.subarray(i * 3, i * 3 + 3), mapa[i] * 3); nn.set(N.subarray(i * 3, i * 3 + 3), mapa[i] * 3); if (AO) ao[mapa[i]] = AO[i]; }
const ix = Uint32Array.from(idx, (i) => mapa[i]);
if (n > 65535) throw new Error('demasiados vértices: ' + n);
const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v[i * 3 + k]); mx[k] = Math.max(mx[k], v[i * 3 + k]); }
const cab = Buffer.alloc(4 + 8 + 24); cab.write('ORJ1', 0); cab.writeUInt32LE(n, 4); cab.writeUInt32LE(ix.length / 3, 8);
for (let k = 0; k < 3; k++) { cab.writeFloatLE(mn[k], 12 + k * 4); cab.writeFloatLE(mx[k], 24 + k * 4); }
const P = new Int16Array(n * 3), Q = new Int8Array(n * 4);
for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) {
  P[i * 3 + k] = Math.round(((v[i * 3 + k] - mn[k]) / (mx[k] - mn[k])) * 65535 - 32768);
  Q[i * 4 + k] = Math.round(Math.max(-1, Math.min(1, nn[i * 3 + k])) * 127);
  if (k === 2) Q[i * 4 + 3] = Math.round(ao[i] * 254 - 127);    // la oclusión va en el 4.º byte de la normal
}
const I16 = Uint16Array.from(ix);
fs.writeFileSync('oreja.bin', Buffer.concat([cab, Buffer.from(P.buffer), Buffer.from(Q.buffer), Buffer.from(I16.buffer)]));
console.log('triángulos', ix.length / 3, 'vértices', n, 'error', err.toFixed(5), 'bytes', fs.statSync('oreja.bin').size);
