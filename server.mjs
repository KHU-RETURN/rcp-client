import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 4173);
const defaultApiTarget = new URL(process.env.RCP_API_TARGET || 'http://127.0.0.1:8080');
const defaultDistDir = path.join(__dirname, 'dist');

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

export function createFrontendServer({
  apiTarget = defaultApiTarget,
  distDir = defaultDistDir,
} = {}) {
  const target = new URL(apiTarget);

  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

      if (requestUrl.pathname.startsWith('/api/')) {
        await proxyApi(req, res, requestUrl, target);
        return;
      }

      await serveStatic(res, requestUrl.pathname, distDir);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({ error: error instanceof Error ? error.message : 'internal server error' }),
      );
    }
  });
}

if (process.argv[1] === __filename) {
  const server = createFrontendServer();
  server.listen(port, () => {
    console.log(`RCP frontend server running at http://127.0.0.1:${port}`);
    console.log(`Proxying /api requests to ${defaultApiTarget.origin}`);
  });
}

async function proxyApi(req, res, requestUrl, apiTarget) {
  const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, apiTarget);
  const body = hasRequestBody(req.method) ? req : undefined;

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
    delete headers.connection;

    res.writeHead(upstream.status, headers);
    if (!upstream.body) {
      res.end();
      return;
    }
    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error instanceof Error ? error : undefined);
      return;
    }
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        error: `proxy failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      }),
    );
  }
}

function hasRequestBody(method) {
  return method !== 'GET' && method !== 'HEAD';
}

function filterProxyHeaders(headers) {
  const nextHeaders = { ...headers };
  delete nextHeaders.host;
  delete nextHeaders.connection;
  delete nextHeaders['content-length'];
  delete nextHeaders['transfer-encoding'];
  return nextHeaders;
}

async function serveStatic(res, pathname, distDir) {
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
  const content = await fs.readFile(filePath);

  // Vite bakes env vars at build time; no runtime injection needed for the built app.

  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}
