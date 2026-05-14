import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 4173);
const apiTarget = new URL(process.env.RCP_API_TARGET || 'http://127.0.0.1:8080');
const distDir = path.join(__dirname, 'dist');

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (requestUrl.pathname.startsWith('/api/')) {
      await proxyApi(req, res, requestUrl);
      return;
    }

    await serveStatic(res, requestUrl.pathname);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'internal server error' }));
  }
});

server.listen(port, () => {
  console.log(`RCP frontend server running at http://127.0.0.1:${port}`);
  console.log(`Proxying /api requests to ${apiTarget.origin}`);
});

async function proxyApi(req, res, requestUrl) {
  const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, apiTarget);
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: filterProxyHeaders(req.headers),
      body: body,
      duplex: 'half',
    });

    const headers = Object.fromEntries(upstream.headers.entries());
    delete headers['content-encoding'];
    delete headers['transfer-encoding'];
    delete headers['connection'];

    res.writeHead(upstream.status, headers);
    const arrayBuffer = await upstream.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: `proxy failed: ${error instanceof Error ? error.message : 'unknown error'}` }));
  }
}

function filterProxyHeaders(headers) {
  const nextHeaders = { ...headers };
  delete nextHeaders.host;
  delete nextHeaders.connection;
  delete nextHeaders['content-length'];
  return nextHeaders;
}

async function serveStatic(res, pathname) {
  const normalized = pathname === '/' ? '/login' : pathname;
  const looksLikeAsset = path.extname(normalized).length > 0;

  if (!looksLikeAsset) {
    await sendFile(res, path.join(distDir, 'index.html'));
    return;
  }

  const safePath = path.normalize(path.join(distDir, pathname));
  if (!safePath.startsWith(distDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(safePath);
    if (stat.isDirectory()) {
      await sendFile(res, path.join(safePath, 'index.html'));
      return;
    }
    await sendFile(res, safePath);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

async function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(ext) || 'application/octet-stream';
  let content = await fs.readFile(filePath);

  // Vite bakes env vars at build time; no runtime injection needed for the built app.

  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}
