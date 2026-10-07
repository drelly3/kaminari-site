// Hero still, built as "page background + light":
//  - rain-free median of the GIF's dark frames
//  - the light is split into thin bright BOLTS and the broad HAZE between them
//  - bolts stay bright; haze is smoothed and turned right down so the art melts into the page
//  - everything is coloured with the site accent
import fs from 'node:fs';
const [dir, BOLT = '1.5', HAZE = '0.3', BLOOM = '0.5'] = process.argv.slice(2).map((v, i) => (i ? +v : v));
const W = 960, H = 704, F = W * H * 3;
const PAGE = [11, 11, 15], ACC = [0, 192, 249];
const buf = fs.readFileSync(dir + '/dark.raw'), N = buf.length / F;
const base = new Uint8Array(F), tmp = new Uint8Array(N);
for (let i = 0; i < F; i++) { for (let k = 0; k < N; k++) tmp[k] = buf[k * F + i]; tmp.sort(); base[i] = tmp[N >> 1]; }
const med = c => { const v = []; for (let y = 80; y < 620; y += 3) for (let x = 20; x < 300; x += 3) v.push(base[(y * W + x) * 3 + c]); v.sort((a, b) => a - b); return v[v.length >> 1]; };
const bp = [0, 1, 2].map(med);
const T = new Float32Array(W * H);
for (let p = 0; p < W * H; p++) {
  let t = 0;
  for (let c = 1; c < 3; c++) t = Math.max(t, (base[p * 3 + c] - bp[c] - 5) / (235 - bp[c]));
  T[p] = Math.max(0, t);
}
// separable box blur, run 3x for a smooth (gaussian-like) result
function blur(src, r) {
  let a = Float32Array.from(src), b = new Float32Array(W * H);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < H; y++) { let s = 0, n = 0;
      for (let x = -r; x < W; x++) { const add = x + r, sub = x - r - 1;
        if (add < W) { s += a[y * W + add]; n++; } if (sub >= 0) { s -= a[y * W + sub]; n--; }
        if (x >= 0) b[y * W + x] = s / n; } }
    for (let x = 0; x < W; x++) { let s = 0, n = 0;
      for (let y = -r; y < H; y++) { const add = y + r, sub = y - r - 1;
        if (add < H) { s += b[add * W + x]; n++; } if (sub >= 0) { s -= b[sub * W + x]; n--; }
        if (y >= 0) a[y * W + x] = s / n; } }
  }
  return a;
}
const haze = blur(T, 14);
const bolts = new Float32Array(W * H);
for (let p = 0; p < W * H; p++) bolts[p] = Math.max(0, T[p] - haze[p] * 1.15);
const bloom = blur(bolts, 5);
const softGlow = blur(T, 6);
const out = new Uint8Array(F);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = y * W + x;
  // ease the light out toward the top, bottom and right edges so nothing ends in a line
  const edge = Math.min(1, x / 40, (W - 1 - x) / 110, y / 90, (H - 1 - y) / 110);
  const fall = edge * edge * (3 - 2 * edge);
  // the rim of light along the top of the hair and the front of the face: fade it into the page
  const ss = (v, a, b) => { const k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
  const head = 0; // head-area softening disabled: keep the rim light as approved
  // ...by swapping the hard-edged rim for a soft, smooth glow, so the head still reads without an outline
  const sharp = Math.pow(bolts[p], 0.7) * BOLT + bloom[p] * BLOOM * 4 + haze[p] * HAZE;
  const soft = softGlow[p] * 2.1;
  const t = Math.min(1, (sharp + (soft - sharp) * head) * (0.25 + 0.75 * fall));
  for (let c = 0; c < 3; c++)
    out[p * 3 + c] = t < 0.75 ? PAGE[c] + (ACC[c] - PAGE[c]) * (t / 0.75) : ACC[c] + (255 - ACC[c]) * ((t - 0.75) / 0.25);
}
fs.writeFileSync(dir + '/hero.raw', out);
console.log('ok', { BOLT, HAZE, BLOOM });
