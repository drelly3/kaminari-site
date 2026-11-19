// Read-only check before any deploy or rollback of the Anime Mindset Worker. It changes nothing.
//
//   node animemindset-site/deploy/stage-check.mjs [--expect-live <version id>]
//   (behind an HTTPS proxy that adds the API credentials, as in Claude's sandbox: NODE_USE_ENV_PROXY=1 node ...)
//
// 1. Source is fresh: fetches origin and fails if any remote branch has animemindset-site/ commits this checkout
//    lacks, or if deploy/worker.generated.js is not exactly what build-worker.mjs produces from the files here.
//    So a deploy or rollback is always built from the newest source, keeping any newer owner changes.
// 2. Live state: prints the Worker's current deployment (version, time, source) and its bindings and triggers.
//    With --expect-live, fails if the live version is not the one reviewed (someone deployed since).
// 3. The production tracker Worker still has its storage and cron (names only; no values are read).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const problems = [];
const say = (ok, msg) => { console.log((ok ? 'ok    ' : 'STOP  ') + msg); if (!ok) problems.push(msg); };

// 1. source
git('fetch', '--quiet', 'origin');
const refs = git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin').split('\n').filter(r => r && r !== 'origin/HEAD' && r !== 'origin');
for (const ref of refs) {
  const missing = git('log', '--format=%h %s', `HEAD..${ref}`, '--', 'animemindset-site');
  say(!missing, `no newer animemindset-site commits on ${ref}${missing ? ':\n        ' + missing.split('\n').join('\n        ') : ''}`);
}
const generated = path.join(HERE, 'worker.generated.js');
const before = fs.readFileSync(generated);
execFileSync('node', [path.join(HERE, 'build-worker.mjs')], { cwd: ROOT, stdio: 'ignore' });
const after = fs.readFileSync(generated);
say(before.equals(after), 'worker.generated.js matches the site files in this checkout');
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'animemindset-site'], { cwd: ROOT, encoding: 'utf8' }).trimEnd();
say(!dirty, `animemindset-site has no uncommitted changes${dirty ? ':\n        ' + dirty.split('\n').join('\n        ') : ''}`);

// 2./3. live state (read-only API calls)
const CF = 'https://api.cloudflare.com/client/v4';
const headers = process.env.CLOUDFLARE_API_TOKEN ? { Authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN } : {};
const get = async p => { const r = await (await fetch(CF + p, { headers })).json(); if (!r.success) throw new Error(p + ': ' + JSON.stringify(r.errors)); return r.result; };
try {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID || (await get('/accounts'))[0].id;
  const dep = (await get(`/accounts/${account}/workers/scripts/animemindset-preview/deployments`)).deployments[0];
  const live = dep.versions[0].version_id;
  console.log(`live  animemindset-preview ${live} deployed ${dep.created_on} via ${dep.source}`);
  const exp = process.argv.indexOf('--expect-live');
  if (exp > 0) say(live === process.argv[exp + 1], `live version is the reviewed one (${process.argv[exp + 1]})`);
  const am = await get(`/accounts/${account}/workers/scripts/animemindset-preview/settings`);
  console.log(`live  animemindset-preview bindings: ${am.bindings.map(b => b.type + ':' + b.name).join(', ') || 'none'}`);
  const amCron = (await get(`/accounts/${account}/workers/scripts/animemindset-preview/schedules`)).schedules;
  say(amCron.length === 0, 'animemindset-preview has no cron (reminders stay on kaminari-site)');
  const ks = await get(`/accounts/${account}/workers/scripts/kaminari-site/settings`);
  const names = ks.bindings.map(b => b.name);
  say(['ARC_PUSH', 'ARC_PHOTOS', 'VAPID_PUBLIC_KEY'].every(n => names.includes(n)), 'kaminari-site still holds the tracker records (ARC_PUSH, ARC_PHOTOS) and push key');
  const ksCron = (await get(`/accounts/${account}/workers/scripts/kaminari-site/schedules`)).schedules.map(s => s.cron);
  say(ksCron.length > 0, `kaminari-site runs the reminder cron (${ksCron.join(', ')})`);
} catch (e) {
  say(false, 'could not read live state: ' + e.message);
}

console.log(problems.length ? `\n${problems.length} problem(s): do not deploy or roll back from this checkout yet.` : '\nSource is fresh and live state is as expected.');
process.exit(problems.length ? 1 : 0);
