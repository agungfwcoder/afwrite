import { describe, expect, test } from 'vitest';
import { fromJSON, toJSON } from '../src/core/model.js';
import { sanitize } from '../src/core/sanitize.js';

describe('toJSON', () => {
  test('paragraf dengan format', () => {
    const doc = toJSON('<p>Halo <b>dunia <i>indah</i></b> <a href="https://a.com">link</a></p>');
    expect(doc).toEqual({
      type: 'doc',
      version: 1,
      blocks: [{
        type: 'paragraph',
        text: 'Halo dunia indah link',
        marks: [
          { type: 'bold', start: 5, end: 16 },
          { type: 'italic', start: 11, end: 16 },
          { type: 'link', start: 17, end: 21, href: 'https://a.com' },
        ],
      }],
    });
  });

  test('semua jenis blok', () => {
    const doc = toJSON(
      '<h2>J</h2><h3>S</h3><blockquote>a<br>b</blockquote>' +
      '<ul><li>satu<ol><li>a</li></ol></li><li>dua</li></ul>' +
      '<pre><code>x = 1\ny = 2</code></pre><hr>' +
      '<figure data-size="wide"><img src="https://a.com/x.png" alt="Foto"><figcaption>Ket <b>tebal</b></figcaption></figure>' +
      '<figure data-embed="youtube"><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe></figure>',
    );
    expect(doc.blocks).toEqual([
      { type: 'heading', level: 2, text: 'J', marks: [] },
      { type: 'heading', level: 3, text: 'S', marks: [] },
      { type: 'quote', text: 'a\nb', marks: [] },
      { type: 'list', style: 'bullet', items: [
        { text: 'satu', marks: [], children: { style: 'ordered', items: [{ text: 'a', marks: [] }] } },
        { text: 'dua', marks: [] },
      ] },
      { type: 'code', text: 'x = 1\ny = 2' },
      { type: 'divider' },
      { type: 'image', src: 'https://a.com/x.png', alt: 'Foto', size: 'wide', caption: { text: 'Ket tebal', marks: [{ type: 'bold', start: 4, end: 9 }] } },
      { type: 'embed', provider: 'youtube', id: 'dQw4w9WgXcQ' },
    ]);
  });

  test('mark sejenis yang bersebelahan digabung', () => {
    expect(toJSON('<p><b>ab</b><b>cd</b></p>').blocks[0].marks).toEqual([{ type: 'bold', start: 0, end: 4 }]);
  });

  test('HTML berbahaya disanitasi dulu', () => {
    expect(toJSON('<p onclick="x()">a<script>b</script></p><img src="javascript:x">').blocks).toEqual([
      { type: 'paragraph', text: 'a', marks: [] },
    ]);
  });
});

describe('round trip HTML -> JSON -> HTML', () => {
  test.each([
    '<h2>Judul</h2><p>Teks <b>tebal</b>, <i>miring</i>, <code>kode</code>, dan <a href="https://a.com">link</a>.</p>',
    '<p><a href="https://a.com"><b>tebal <i>dan miring</i></b></a> biasa</p>',
    '<blockquote>Baris satu<br>Baris dua</blockquote>',
    '<ul><li>satu<ul><li>a</li><li>b</li></ul></li><li>dua</li></ul><ol><li>x</li></ol>',
    '<pre><code>function f() {\n  return 1;\n}</code></pre>',
    '<figure data-size="full"><img src="/x.png" alt="Alt"><figcaption>Keterangan</figcaption></figure><hr><p>akhir</p>',
    '<figure data-embed="vimeo"><iframe src="https://player.vimeo.com/video/76979871" title="Vimeo" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></figure>',
  ])('%s', (html) => {
    const clean = sanitize(html);
    expect(fromJSON(toJSON(clean))).toBe(clean);
  });

  test('urutan format dinormalkan', () => {
    expect(fromJSON(toJSON('<p><i><b>x</b></i></p>'))).toBe('<p><b><i>x</i></b></p>');
  });
});

describe('fromJSON dengan input tak dipercaya', () => {
  test('link & gambar berbahaya dibuang', () => {
    const html = fromJSON({
      blocks: [
        { type: 'paragraph', text: 'klik', marks: [{ type: 'link', start: 0, end: 4, href: 'javascript:alert(1)' }] },
        { type: 'image', src: 'javascript:alert(1)' },
        { type: 'embed', provider: 'youtube', id: '"><script>' },
        { type: 'paragraph', text: '<script>alert(1)</script>', marks: [] },
      ],
    });
    expect(html).toBe('<p>klik</p><p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  test('input rusak tidak melempar error', () => {
    expect(fromJSON(null)).toBe('');
    expect(fromJSON({ blocks: [null, { type: 'aneh' }, { type: 'list', items: 'x' }, { type: 'paragraph', marks: [{ type: 'bold', start: 5, end: 1 }], text: 'abc' }] })).toBe('<p>abc</p>');
  });
});
