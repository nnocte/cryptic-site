// server.mjs — Minimal static server with clean URL support
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const PUBLIC = join(__dirname, 'public');
const PORT = process.env.PORT || 4000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

function serve(req, res) {
  let url = new URL(req.url, `http://${req.headers.host}`).pathname;

  // Normalize: remove trailing slash for lookup, but not for root
  if (url !== '/' && url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  let filePath = join(PUBLIC, url);

  // Try exact file, then index.html, then 404
  const tryPaths = [filePath, join(filePath, 'index.html')];
  if (!extname(filePath)) {
    tryPaths.unshift(filePath + '.html');
  }

  for (const p of tryPaths) {
    try {
      if (existsSync(p) && statSync(p).isFile()) {
        const ext = extname(p) || '.html';
        const mime = MIME[ext] || 'application/octet-stream';
        const content = readFileSync(p);
        res.writeHead(200, { 'Content-Type': mime });
        res.end(content);
        return;
      }
    } catch {}
  }

  // 404 — silent, cryptic. No friendly message.
  const notFound = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><title>—</title><style>body{background:#0e0d0c;color:#6b6763;font-family:ui-monospace,monospace;font-size:13px;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}div{max-width:28rem;text-align:center}</style></head><body><div><p>nothing here</p></div></body></html>`;
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(notFound);
}

const srv = createServer(serve);
srv.listen(PORT, () => {
  console.log(`\n  cryptic puzzle-network running at http://localhost:${PORT}/\n`);
});
