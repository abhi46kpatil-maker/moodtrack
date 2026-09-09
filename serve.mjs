// serve.mjs — Dependency-free Node static web server
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};

const server = createServer(async (req, res) => {
  try {
    const rawUrl = req.url.split('?')[0];
    const decodedUrl = decodeURIComponent(rawUrl);
    const relativePath = decodedUrl === '/' ? '/index.html' : decodedUrl;
    const safePath = normalize(join(root, relativePath));

    if (!safePath.startsWith(root)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('403 Forbidden');
      return;
    }

    const ext = extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const data = await readFile(safePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('404 Not Found');
  }
});

const PORT = Number(process.env.PORT) || 8123;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`Terranova static server running at http://${HOST}:${PORT}`);
});
