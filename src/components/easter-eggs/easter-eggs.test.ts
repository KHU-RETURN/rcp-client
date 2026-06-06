import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveEasterEggInput } from './easter-eggs.ts';

test('resolveEasterEggInput reveals the platform egg for rcp and return sequences', () => {
  let buffer = '';

  for (const key of 'rcp') {
    const next = resolveEasterEggInput(buffer, key);
    buffer = next.buffer;
  }

  assert.equal(resolveEasterEggInput('', 'r').egg, undefined);

  const platformEgg = resolveEasterEggInput('rc', 'p').egg;
  assert.equal(platformEgg?.id, 'platform');
  assert.equal(platformEgg.animation, 'return-unfold');
  assert.equal(platformEgg.title, 'RETURN MODE: ON');
  assert.deepEqual(platformEgg.lines, [
    'billing: still 0 won',
    'region: khu-return',
    'boot: 커피 한 모금 뒤 완료',
  ]);

  buffer = '';
  for (const key of 'return') {
    const next = resolveEasterEggInput(buffer, key);
    buffer = next.buffer;
  }

  assert.equal(resolveEasterEggInput('retur', 'n').egg?.id, 'platform');
});

test('resolveEasterEggInput keeps only the searchable suffix and ignores control keys', () => {
  const ignored = resolveEasterEggInput('retur', 'Shift');

  assert.equal(ignored.buffer, 'retur');
  assert.equal(ignored.egg, undefined);

  const overflow = resolveEasterEggInput('x'.repeat(40), 'n');

  assert.equal(overflow.buffer.length <= 24, true);
});
