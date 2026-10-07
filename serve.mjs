// Local preview of dist/ with the same clean URLs Vercel serves: `node serve.mjs`
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 4321;
const types = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', json: 'application/json', xml: 'application/xml', txt: 'text/plain', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', mp4: 'video/mp4' };

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
