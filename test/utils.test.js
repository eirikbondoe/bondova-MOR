import test from 'node:test';
import assert from 'node:assert/strict';

import { sha256Hex, stableStringify } from '../src/lib/utils.js';

test('stableStringify sorts object keys consistently', () => {
  const left = stableStringify({ b: 2, a: 1, nested: { y: 2, x: 1 } });
  const right = stableStringify({ nested: { x: 1, y: 2 }, a: 1, b: 2 });

  assert.equal(left, right);
});

test('sha256Hex returns deterministic hashes', () => {
  assert.equal(sha256Hex('bondova'), sha256Hex('bondova'));
  assert.notEqual(sha256Hex('bondova'), sha256Hex('mor'));
});
