import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareResponseFileDownload } from './downloads.ts';

function streamFromTextChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

test('prepareResponseFileDownload opens picker before response is available', async () => {
  let blobCalled = false;
  let closed = false;
  const events: string[] = [];
  const writes: string[] = [];
  const response = new Response(streamFromTextChunks(['hello ', 'world']));
  Object.defineProperty(response, 'blob', {
    value: () => {
      blobCalled = true;
      throw new Error('blob should not be called for stream downloads');
    },
  });

  const download = prepareResponseFileDownload('hello.txt', {
    showSaveFilePicker: async (options) => {
      events.push('picker');
      assert.equal(options.suggestedName, 'hello.txt');
      return {
        createWritable: async () => ({
          write: async (chunk) => {
            writes.push(new TextDecoder().decode(chunk));
          },
          close: async () => {
            closed = true;
          },
          abort: async () => {},
        }),
      };
    },
    createObjectURL: () => {
      throw new Error('object URL should not be used for stream downloads');
    },
    revokeObjectURL: () => {},
    createAnchor: () => {
      throw new Error('anchor should not be used for stream downloads');
    },
    appendAnchor: () => {},
  });
  events.push('fetch');

  await download.ready;
  const mode = await download.save(response);

  assert.deepEqual(events.slice(0, 2), ['picker', 'fetch']);
  assert.equal(mode, 'stream');
  assert.equal(blobCalled, false);
  assert.equal(closed, true);
  assert.deepEqual(writes, ['hello ', 'world']);
});

test('prepareResponseFileDownload falls back to blob download when streaming is unavailable', async () => {
  let clicked = false;
  let removed = false;
  let revokedUrl = '';
  let capturedBlob: Blob | null = null;
  const response = new Response('fallback');

  const download = prepareResponseFileDownload('fallback.txt', {
    createObjectURL: (blob) => {
      capturedBlob = blob;
      return 'blob:test';
    },
    revokeObjectURL: (url) => {
      revokedUrl = url;
    },
    createAnchor: () => ({
      href: '',
      download: '',
      click: () => {
        clicked = true;
      },
      remove: () => {
        removed = true;
      },
    }),
    appendAnchor: (anchor) => {
      assert.equal(anchor.href, 'blob:test');
      assert.equal(anchor.download, 'fallback.txt');
    },
  });

  await download.ready;
  const mode = await download.save(response);

  assert.equal(mode, 'blob');
  assert.equal(await capturedBlob?.text(), 'fallback');
  assert.equal(clicked, true);
  assert.equal(removed, true);
  assert.equal(revokedUrl, 'blob:test');
});

test('prepareResponseFileDownload falls back to blob when picker cannot open', async () => {
  let clicked = false;
  const response = new Response('fallback after picker error');

  const download = prepareResponseFileDownload('fallback.txt', {
    showSaveFilePicker: () => {
      throw new DOMException('blocked', 'SecurityError');
    },
    createObjectURL: () => 'blob:test',
    revokeObjectURL: () => {},
    createAnchor: () => ({
      href: '',
      download: '',
      click: () => {
        clicked = true;
      },
      remove: () => {},
    }),
    appendAnchor: () => {},
  });

  await download.ready;
  const mode = await download.save(response);

  assert.equal(mode, 'blob');
  assert.equal(clicked, true);
});
