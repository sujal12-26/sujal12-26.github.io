import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWordOpacity, morphWord } from './textMorph';

test('morphWord returns exact endpoints at progress 0 and 1', () => {
  assert.equal(morphWord('SUJAL', 'PORTFOLIO', 0), 'SUJAL');
  assert.equal(morphWord('SUJAL', 'PORTFOLIO', 1), 'PORTFOLIO');
  assert.equal(morphWord('ADITHYA', 'PORTFOLIO', 0), 'ADITHYA');
  assert.equal(morphWord('ADITHYA', 'PORTFOLIO', 1), 'PORTFOLIO');
});

test('morphWord progressively resolves prefix characters toward PORTFOLIO', () => {
  const mid = morphWord('SUJAL', 'PORTFOLIO', 0.45);
  assert.equal(mid.startsWith('PORT'), true);
  assert.equal(mid.length >= 5 && mid.length <= 9, true);

  const late = morphWord('SUJAL', 'PORTFOLIO', 0.8);
  assert.equal(late.startsWith('PORTFOL'), true);
});

test('computeWordOpacity illuminates words monotonically with scroll progress', () => {
  const firstStart = computeWordOpacity(0, 20, 0);
  const firstAfter = computeWordOpacity(0, 20, 0.2);
  const lastStart = computeWordOpacity(19, 20, 0.1);
  const lastEnd = computeWordOpacity(19, 20, 1);

  assert.equal(firstStart, 0.22);
  assert.equal(firstAfter, 1);
  assert.equal(lastStart, 0.22);
  assert.equal(lastEnd, 1);
});
