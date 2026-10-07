// Re-encodes heavy blog images in public/media as WebP (animated GIFs become animated WebP) and
// updates every reference in src/content/blog. Keeps a file as-is when re-encoding doesn't save at least 15%.
// Needs ffmpeg on PATH. Safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const MEDIA = 'public/media', BLOG = 'src/content/blog';
const MAX_W = 1600, GIF_MAX_W = 720, MIN_BYTES = 120 * 1024;
const run = args => new Promise(res => execFile('ffmpeg', ['-v', 'error', '-y', ...args], { windowsHide: true }, err => res(!err)));

const files = fs.readdirSync(MEDIA).filter(f => /\.(jpe?g|png|gif)$/i.test(f) && fs.statSync(path.join(MEDIA, f)).size >= MIN_BYTES);
const renamed = {};
let before = 0, after = 0, converted = 0;

async function one(f) {
  const src = path.join(MEDIA, f), size = fs.statSync(src).size;
  const out = path.join(MEDIA, f.replace(/\.[^.]+$/, '') + '.webp');
  if (fs.existsSync(out)) return; // an image with this id is already WebP
  const isGif = /\.gif$/i.test(f);
  const ok = await run(isGif
    ? ['-i', src, '-vf', `scale='min(${GIF_MAX_W},iw)':-2:flags=lanczos`, '-c:v', 'libwebp_anim', '-lossless', '0', '-q:v', '68', '-loop', '0', '-an', out]
    : ['-i', src, '-vf', `scale='min(${MAX_W},iw)':-2:flags=lanczos`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', out]);
  const newSize = ok && fs.existsSync(out) ? fs.statSync(out).size : 0;
  if (!newSize || newSize > size * 0.85) { if (fs.existsSync(out)) fs.unlinkSync(out); return; }
  fs.unlinkSync(src);
  renamed['/media/' + f] = '/media/' + path.basename(out);
  before += size; after += newSize; converted++;
}

const queue = [...files];
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await one(queue.shift()); }));

let touched = 0;
for (const f of fs.readdirSync(BLOG)) {
  const p = path.join(BLOG, f), old = fs.readFileSync(p, 'utf8');
  const next = old.replace(/\/media\/[0-9a-f]+\.(?:jpe?g|png|gif)/gi, m => renamed[m] || m);
  if (next !== old) { fs.writeFileSync(p, next); touched++; }
}
console.log(`candidates ${files.length}, converted ${converted}, ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB, content files updated ${touched}`);
