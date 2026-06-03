import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateUploadProgress } from './storage-progress.ts';

test('calculateUploadProgress returns total percent across multiple files', () => {
  const files = [{ size: 100 }, { size: 300 }] as File[];

  assert.deepEqual(calculateUploadProgress(files, 1, 50), {
    loadedBytes: 150,
    totalBytes: 400,
    percent: 38,
    currentFileIndex: 1,
    fileCount: 2,
  });
});

test('calculateUploadProgress clamps progress to 100 percent', () => {
  const files = [{ size: 100 }, { size: 200 }] as File[];

  assert.deepEqual(calculateUploadProgress(files, 1, 250), {
    loadedBytes: 300,
    totalBytes: 300,
    percent: 100,
    currentFileIndex: 1,
    fileCount: 2,
  });
});

test('calculateUploadProgress handles zero-byte uploads', () => {
  const files = [{ size: 0 }] as File[];

  assert.deepEqual(calculateUploadProgress(files, 0, 0), {
    loadedBytes: 0,
    totalBytes: 0,
    percent: 0,
    currentFileIndex: 0,
    fileCount: 1,
  });
});
