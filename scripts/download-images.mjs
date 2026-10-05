// Downloads every image in migration/image-map.json (+ site assets) into public/. Safe to re-run: skips files that exist.
import fs from 'node:fs';
import path from 'node:path';

const map = JSON.parse(fs.readFileSync('migration/image-map.json', 'utf8'));
const W = 'https://cdn.prod.website-files.com/698a1be64aec68356fde103c/';
const B = 'https://cdn.prod.website-files.com/698a1be64aec68356fde105a/';
const siteAssets = {
  [W + '698ad3688a7632a83e3455ec_Kaminari%20Logo%20White.svg']: '/assets/kaminari-logo-white.svg',
  [W + '698b4026c630da5735207ac3_Kaminari%20Fevicon.jpg']: '/favicon.jpg',
  [W + '698b4029cccb7862d4668a3e_Kaminari%20Apple%20Touch.jpg']: '/apple-touch-icon.jpg',
  [W + '698b4033d62dec5de442e7e3_Kaminari%20OG%20Image.jpg']: '/assets/og-image.jpg',
  [W + '698ad368bf7b0070e1b88ef6_kaminari_hero_desktop.png']: '/assets/hero-desktop.png',
  [W + '698ad368d8763780c561f5fe_kaminari_hero_mobile.avif']: '/assets/hero-mobile.avif',
  [W + '698ad3686a880302d5458dc3_CTA%20BG.avif']: '/assets/cta-bg.avif',
  [W + '698a1be64aec68356fde1046_web-clip.png']: '/assets/post-default.png',
  [B + '698b236ce8200f69b850b3ac_Will%20O%27Neal.png']: '/assets/team/will-oneal.png',
  [B + '698b2355e289b5e2118c5881_Andrel%20Neptune.png']: '/assets/team/andrel-neptune.png',
  [B + '698b226ec97c64c12d59805b_Devin%20Morris.png']: '/assets/team/devin-morris.png',
};
const jobs = Object.entries({ ...map, ...siteAssets });
const failed = [];
let done = 0, bytes = 0;

async function fetchOne([url, local]) {
  const dest = path.join('public', local);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { bytes += fs.statSync(dest).size; return; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      bytes += buf.length;
      return;
    } catch (e) {
      if (attempt === 3) failed.push({ url, local, error: String(e.message || e) });
      else await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) { await fetchOne(queue.shift()); if (++done % 100 === 0) console.log(`${done}/${jobs.length}`); }
}));
fs.writeFileSync('migration/image-failures.json', JSON.stringify(failed, null, 2));
console.log(`done: ${jobs.length - failed.length} ok, ${failed.length} failed, ${(bytes / 1048576).toFixed(1)} MB`);
