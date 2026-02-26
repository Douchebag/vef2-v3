import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slug.js';

test('slugify converts title to slug', () => {
  assert.equal(slugify('Halló Heimur!'), 'hallo-heimur');
});

test('slugify collapses repeated spaces and dashes', () => {
  assert.equal(slugify('  A   --  B  '), 'a-b');
});