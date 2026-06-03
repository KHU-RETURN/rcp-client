import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';

import { createFrontendServer } from './server.mjs';

test('proxy streams upstream response before it completes', async () => {
  let finishUpstream;
  const upstreamCanFinish = new Promise((resolve) => {
    finishUpstream = resolve;
  });

  const upstream = http.createServer(async (req, res) => {
    assert.equal(req.url, '/api/storage/download');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.write('first');
    await upstreamCanFinish;
    res.end('second');
  });

  const upstreamUrl = await listen(upstream);
  const proxy = createFrontendServer({ apiTarget: upstreamUrl });
  const proxyUrl = await listen(proxy);

  try {
    const response = await request(proxyUrl, '/api/storage/download');
    const firstChunk = await withTimeout(response.nextChunk, 1_000);

    assert.equal(firstChunk.toString(), 'first');
    finishUpstream();

    const body = await response.done;
    assert.equal(body.toString(), 'firstsecond');
  } finally {
    finishUpstream();
    await close(proxy);
    await close(upstream);
  }
});

test('proxy streams request body before client upload completes', async () => {
  let finishClientUpload;
  const clientCanFinishUpload = new Promise((resolve) => {
    finishClientUpload = resolve;
  });

  const upstream = http.createServer(async (req, res) => {
    assert.equal(req.method, 'POST');
    assert.equal(req.url, '/api/storage/upload');

    req.once('data', (chunk) => {
      assert.equal(chunk.toString(), 'first');
      finishClientUpload();
    });
    req.on('end', () => {
      res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('created');
    });
  });

  const upstreamUrl = await listen(upstream);
  const proxy = createFrontendServer({ apiTarget: upstreamUrl });
  const proxyUrl = await listen(proxy);

  try {
    const response = await withTimeout(
      postInChunks(proxyUrl, '/api/storage/upload', clientCanFinishUpload),
      1_000,
    );
    assert.equal(response.statusCode, 201);
    assert.equal(response.body, 'created');
  } finally {
    finishClientUpload();
    await close(proxy);
    await close(upstream);
  }
});

async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return new URL(`http://127.0.0.1:${address.port}`);
}

async function close(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function request(baseUrl, pathname) {
  return await new Promise((resolve, reject) => {
    const req = http.get(new URL(pathname, baseUrl), (res) => {
      let resolveNextChunk;
      const nextChunk = new Promise((resolveChunk) => {
        resolveNextChunk = resolveChunk;
      });
      const chunks = [];
      const done = new Promise((resolveDone) => {
        res.on('end', () => {
          resolveDone(Buffer.concat(chunks));
        });
      });
      res.on('data', (chunk) => {
        if (chunks.length === 0) {
          resolveNextChunk(chunk);
        }
        chunks.push(chunk);
      });
      resolve({ nextChunk, done });
    });
    req.on('error', reject);
  });
}

async function postInChunks(baseUrl, pathname, canFinishUpload) {
  return await new Promise((resolve, reject) => {
    const req = http.request(
      new URL(pathname, baseUrl),
      { method: 'POST', headers: { 'Content-Type': 'text/plain' } },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: Buffer.concat(chunks).toString(),
          });
        });
      },
    );

    req.on('error', reject);
    req.write('first');
    withTimeout(canFinishUpload, 1_000).then(() => req.end('second'), reject);
  });
}

async function withTimeout(promise, ms) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('timed out waiting for stream chunk')), ms);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
