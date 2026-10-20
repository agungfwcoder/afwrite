import { describe, expect, test } from 'vitest';
import { slugify } from '../src/core/slug.js';

describe('slugify', () => {
  test.each([
    ['Catatan untuk Tim Redaksi', 'catatan-untuk-tim-redaksi'],
    ['  Café Pagi, Ayo!  ', 'cafe-pagi-ayo'],
    ["Don't Panic", 'dont-panic'],
    ['Rilis 2.1 — CDN & npm', 'rilis-2-1-cdn-npm'],
    ['Ünïcödé çàñ', 'unicode-can'],
    ['---', ''],
    ['', ''],
    [null, ''],
    ['مرحبا 你好', ''],
    ['Halo مرحبا dunia', 'halo-dunia'],
  ])('%j -> %j', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  test('dipotong di batas kata', () => {
    expect(slugify('satu dua tiga empat', { maxLength: 12 })).toBe('satu-dua');
    expect(slugify('abcdefghijklmnop', { maxLength: 5 })).toBe('abcde');
    expect(slugify('a'.repeat(100)).length).toBe(80);
  });
});
