import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMappedProperties, buildNotionPropertyValue } from '../src/lib/notion.js';

test('buildNotionPropertyValue creates title blocks with fallback', () => {
  assert.deepEqual(buildNotionPropertyValue('title', '', 'Untitled'), {
    title: [{ text: { content: 'Untitled' } }],
  });
});

test('buildMappedProperties creates sync helper fields and stable hash', () => {
  const config = {
    fieldMap: {
      Name: { source: 'name', type: 'title' },
      Tags: { source: 'tags', type: 'multi_select' },
    },
    sourceIdField: 'id',
    sourceIdProperty: 'Source ID',
    syncHashProperty: 'Sync Hash',
    titleFallback: 'Untitled',
  };

  const row = { id: 42, name: 'Alpha', tags: ['one', 'two'] };
  const result = buildMappedProperties(row, config);

  assert.equal(result.sourceId, '42');
  assert.equal(typeof result.syncHash, 'string');
  assert.equal(result.syncHash.length, 64);
  assert.deepEqual(result.properties.Name, {
    title: [{ text: { content: 'Alpha' } }],
  });
  assert.deepEqual(result.properties['Source ID'], {
    rich_text: [{ text: { content: '42' } }],
  });
});
