// Cuts the blue lightning bolt out of the Kaminari logo (dropping the white K) and saves it as
// public/assets/kaminari-bolt.png. Needs ffmpeg on PATH. Safe to re-run.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ff = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { windowsHide: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bolt-'));
const svg = fs.readFileSync('public/assets/kaminari-mark.svg', 'utf8');
fs.writeFileSync(path.join(tmp, 'logo.png'), Buffer.from(svg.match(/base64,([^"]+)"/)[1], 'base64'));

const S = 2001;
ff(['-i', path.join(tmp, 'logo.png'), '-f', 'rawvideo', '-pix_fmt', 'rgba', path.join(tmp, 'logo.raw')]);
const px = fs.readFileSync(path.join(tmp, 'logo.raw'));

// keep a pixel by how blue it is: the bolt is strongly blue, the K is white (no colour), so it drops out
let x0 = S, y0 = S, x1 = 0, y1 = 0;
for (let i = 0; i < S * S; i++) {
  const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], a = px[i * 4 + 3];
  const blueness = Math.max(0, Math.min(1, (b - r - 30) / 60));
  const alpha = Math.round(a * blueness);
  px[i * 4 + 3] = alpha;
  if (alpha > 40) { const x = i % S, y = (i / S) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
}
const pad = 6; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
const w = x1 - x0 + 1, h = y1 - y0 + 1;
fs.writeFileSync(path.join(tmp, 'cut.raw'), px);
ff(['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${S}x${S}`, '-i', path.join(tmp, 'cut.raw'),
  '-vf', `crop=${w}:${h}:${x0}:${y0},scale=-2:256:flags=lanczos`, 'public/assets/kaminari-bolt.png']);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`bolt: ${w}x${h} cut from the logo -> public/assets/kaminari-bolt.png`);
