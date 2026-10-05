// Local preview of dist/ with the same clean URLs Vercel serves: `node serve.mjs`
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 4321;
const types = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', json: 'application/json', xml: 'application/xml', txt: 'text/plain', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif' };

http.createServer((req, res) => {
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
