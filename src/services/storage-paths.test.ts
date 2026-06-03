import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildArchiveFilename,
  buildObjectBrowserEntries,
  formatObjectContentType,
  getUploadObjectKey,
} from './storage-paths.ts';

test('getUploadObjectKey preserves folder-relative upload paths', () => {
  const file = {
    name: 'readme.txt',
    webkitRelativePath: 'docs/nested/readme.txt',
  } as File;

  assert.equal(getUploadObjectKey(file), 'docs/nested/readme.txt');
});

test('getUploadObjectKey falls back to file name for single-file uploads', () => {
  const file = {
    name: 'readme.txt',
    webkitRelativePath: '',
  } as File;

  assert.equal(getUploadObjectKey(file), 'readme.txt');
});

test('buildObjectBrowserEntries groups immediate folders and files by prefix', () => {
  const entries = buildObjectBrowserEntries(
    [
      {
        name: 'docs/readme.txt',
        content_type: 'text/plain',
        size_bytes: 10,
        last_modified: '2026-05-01T00:00:00Z',
      },
      {
        name: 'docs/nested/a.txt',
        content_type: 'text/plain',
        size_bytes: 20,
        last_modified: '2026-05-02T00:00:00Z',
      },
      {
        name: 'root.txt',
        content_type: 'text/plain',
        size_bytes: 5,
        last_modified: '2026-05-03T00:00:00Z',
      },
    ],
    '',
  );

  assert.deepEqual(
    entries.map((entry) => ({
      kind: entry.kind,
      name: entry.name,
      prefix: entry.kind === 'folder' ? entry.prefix : undefined,
      sizeBytes: entry.kind === 'folder' ? entry.sizeBytes : entry.object.size_bytes,
      objectCount: entry.kind === 'folder' ? entry.objectCount : undefined,
    })),
    [
      {
        kind: 'folder',
        name: 'docs',
        prefix: 'docs/',
        sizeBytes: 30,
        objectCount: 2,
      },
      {
        kind: 'file',
        name: 'root.txt',
        prefix: undefined,
        sizeBytes: 5,
        objectCount: undefined,
      },
    ],
  );
});

test('buildObjectBrowserEntries shows nested entries inside the selected prefix', () => {
  const entries = buildObjectBrowserEntries(
    [
      {
        name: 'docs/readme.txt',
        content_type: 'text/plain',
        size_bytes: 10,
        last_modified: '2026-05-01T00:00:00Z',
      },
      {
        name: 'docs/nested/a.txt',
        content_type: 'text/plain',
        size_bytes: 20,
        last_modified: '2026-05-02T00:00:00Z',
      },
    ],
    'docs/',
  );

  assert.deepEqual(
    entries.map((entry) => ({
      kind: entry.kind,
      name: entry.name,
      prefix: entry.kind === 'folder' ? entry.prefix : undefined,
    })),
    [
      {
        kind: 'folder',
        name: 'nested',
        prefix: 'docs/nested/',
      },
      {
        kind: 'file',
        name: 'readme.txt',
        prefix: undefined,
      },
    ],
  );
});

test('buildArchiveFilename names folder downloads after the last prefix segment', () => {
  assert.equal(buildArchiveFilename('docs/nested/', 'container-a'), 'nested.zip');
  assert.equal(buildArchiveFilename('', 'container-a'), 'container-a.zip');
});

test('formatObjectContentType normalizes malformed html charset for display', () => {
  assert.equal(
    formatObjectContentType('text/html; charset=utf-8\u201d'),
    'text/html; charset=utf-8',
  );
  assert.equal(formatObjectContentType('text/html; charset=utf8'), 'text/html; charset=utf-8');
  assert.equal(formatObjectContentType(''), '-');
});
