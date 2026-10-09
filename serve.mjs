// Local preview of dist/ with the same clean URLs Vercel serves: `node serve.mjs`
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 4321;
const types = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', json: 'application/json', xml: 'application/xml', txt: 'text/plain', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', mp4: 'video/mp4' };

const memory = new Map();
const photos = new Map();
const previewEnv = {
  ARC_TESTER_KEYS: [process.env.ARC_TESTER_KEYS, 'ARC7-K2MQ-9XTD-4HPL'].filter(Boolean).join(','),
  ARC_PUSH: { get: async k => memory.get(k) ?? null, put: async (k, v) => { memory.set(k, v); } },
  // just enough of R2 for the proof photo backup
  ARC_PHOTOS: {
    put: async (k, body, opts = {}) => { photos.set(k, { body, customMetadata: opts.customMetadata || {} }); },
    get: async k => photos.get(k) || null,
    delete: async keys => { [].concat(keys).forEach(k => photos.delete(k)); },
    list: async ({ prefix }) => ({ objects: [...photos].filter(([k]) => k.startsWith(prefix)).map(([key, o]) => ({ key, customMetadata: o.customMetadata })), truncated: false }),
  },
};

http.createServer(async (req, res) => {
  // the licence check runs as a server function when deployed; mimic it here
  if (req.url.split('?')[0] === '/api/arc-verify') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const { verifyLicense } = await import('./api/arc-verify.js');
    const out = req.method === 'POST' ? await verifyLicense(JSON.parse(raw || '{}').key) : { status: 405, body: { ok: false } };
    res.writeHead(out.status, { 'Content-Type': types.json, 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(out.body));
  }
  // Arc Tracker backups: the same code the Worker runs, with storage kept in memory while this runs.
  // The preview sample key counts as a member here.
  if (req.url.split('?')[0] === '/api/arc-sync') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const { handleSync } = await import('./api/arc-sync.js');
    const out = await handleSync(new Request('http://localhost/api/arc-sync', { method: req.method, body: req.method === 'POST' ? raw : undefined }), previewEnv);
    res.writeHead(out.status, { 'Content-Type': types.json, 'Cache-Control': 'no-store' });
    return res.end(await out.text());
  }
  if (req.url.split('?')[0].startsWith('/api/arc-photos')) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { handlePhotos } = await import('./api/arc-photos.js');
    const pathname = req.url.split('?')[0];
    const out = await handlePhotos(new Request('http://localhost' + pathname, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }), previewEnv, pathname);
    res.writeHead(out.status, { 'Content-Type': out.headers.get('Content-Type') || types.json, 'Cache-Control': 'no-store' });
    return res.end(Buffer.from(await out.arrayBuffer()));
  }
  const url = decodeURIComponent(req.url.split('?')[0]);
  const base = path.join('dist', path.normalize(url).replace(/^(\.\.[\\/])+/, ''));
  const file = [base, base + '.html', path.join(base, 'index.html')].find(f => fs.existsSync(f) && fs.statSync(f).isFile());
  if (!file) {
    res.writeHead(404, { 'Content-Type': types.html });
    return res.end(fs.readFileSync('dist/404.html'));
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file).slice(1)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
