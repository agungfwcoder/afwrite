import { describe, expect, test } from 'vitest';
import { fromJSON, toJSON } from '../src/core/model.js';
import { sanitize } from '../src/core/sanitize.js';

const text = (value, ...marks) => ({ type: 'text', ...(marks.length && { marks }), text: value });

describe('toJSON', () => {
  test('paragraf dengan format', () => {
    const doc = toJSON('<p>Halo <b>dunia <i>indah</i></b> <a href="https://a.com">link</a></p>');
    expect(doc).toEqual({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          text('Halo '),
          text('dunia ', { type: 'bold' }),
          text('indah', { type: 'bold' }, { type: 'italic' }),
          text(' '),
          text('link', { type: 'link', attrs: { href: 'https://a.com' } }),
        ],
      }],
    });
  });

  test('semua jenis blok', () => {
    const doc = toJSON(
      '<h2>J</h2><h3>S</h3><blockquote>a<br>b</blockquote>' +
      '<ul><li>satu<ol><li>a</li></ol></li><li>dua</li></ul>' +
      '<pre><code>x = 1\ny = 2</code></pre><hr>' +
      '<figure data-size="wide"><img src="https://a.com/x.png" alt="Foto"><figcaption>Ket tebal</figcaption></figure>' +
      '<figure data-embed="youtube"><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe></figure>',
    );
    const item = (...content) => ({ type: 'listItem', content });
    const paragraph = (value) => ({ type: 'paragraph', content: [text(value)] });
    expect(doc.content).toEqual([
      { type: 'heading', attrs: { level: 2 }, content: [text('J')] },
      { type: 'heading', attrs: { level: 3 }, content: [text('S')] },
      { type: 'blockquote', content: [text('a'), { type: 'hardBreak' }, text('b')] },
      { type: 'bulletList', content: [
        item(paragraph('satu'), { type: 'orderedList', attrs: { start: 1, type: null }, content: [item(paragraph('a'))] }),
        item(paragraph('dua')),
      ] },
      { type: 'codeBlock', attrs: { language: null }, content: [text('x = 1\ny = 2')] },
      { type: 'horizontalRule' },
      { type: 'image', attrs: { src: 'https://a.com/x.png', alt: 'Foto', size: 'wide', uploading: null }, content: [text('Ket tebal')] },
      { type: 'embed', attrs: { provider: 'youtube', id: 'dQw4w9WgXcQ', size: null } },
    ]);
  });

  test('level judul mengikuti opsi headings', () => {
    expect(toJSON('<h4>a</h4>').content[0].attrs.level).toBe(3);
    expect(toJSON('<h4>a</h4>', { headings: [2, 3, 4] }).content[0].attrs.level).toBe(4);
    const doc = { type: 'doc', content: [{ type: 'heading', attrs: { level: 6 }, content: [text('x')] }] };
    expect(fromJSON(doc)).toBe('<h3>x</h3>');
    expect(fromJSON(doc, { headings: [2, 6] })).toBe('<h6>x</h6>');
  });

  test('kosong', () => {
    expect(toJSON('')).toEqual({ type: 'doc', content: [] });
    expect(toJSON('<p></p>')).toEqual({ type: 'doc', content: [] });
  });

  test('HTML berbahaya disanitasi dulu', () => {
    expect(toJSON('<p onclick="x()">a<script>b</script></p><img src="javascript:x">').content).toEqual([
      { type: 'paragraph', content: [text('a')] },
    ]);
  });
});

describe('round trip HTML -> JSON -> HTML', () => {
  test.each([
    '<h2>Judul</h2><p>Teks <b>tebal</b>, <i>miring</i>, <code>kode</code>, dan <a href="https://a.com">link</a>.</p>',
    '<blockquote>Baris satu<br>Baris dua</blockquote>',
    '<ul><li>satu<ul><li>a</li><li>b</li></ul></li><li>dua</li></ul><ol><li>x</li></ol>',
    '<pre><code>function f() {\n  return 1;\n}</code></pre>',
    '<figure data-size="full"><img src="/x.png" alt="Alt"><figcaption>Keterangan</figcaption></figure><hr><p>akhir</p>',
    '<figure data-embed="vimeo"><iframe src="https://player.vimeo.com/video/76979871" title="Vimeo" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></figure>',
  ])('%s', (html) => {
    const clean = sanitize(html);
    expect(fromJSON(toJSON(clean))).toBe(clean);
  });

  test('link membungkus format lain', () => {
    expect(fromJSON(toJSON('<p><b><a href="https://a.com">x</a></b></p>'))).toBe('<p><a href="https://a.com"><b>x</b></a></p>');
  });
});

describe('fromJSON dengan input tak dipercaya', () => {
  test('link & gambar berbahaya dibuang', () => {
    const html = fromJSON({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [text('klik', { type: 'link', attrs: { href: 'javascript:alert(1)' } })] },
        { type: 'image', attrs: { src: 'javascript:alert(1)' } },
        { type: 'embed', attrs: { provider: 'youtube', id: '"><script>' } },
        { type: 'paragraph', content: [text('<script>alert(1)</script>')] },
      ],
    });
    expect(html).toBe('<p>klik</p><p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  test('input rusak tidak melempar error', () => {
    expect(fromJSON(null)).toBe('');
    expect(fromJSON({ type: 'doc' })).toBe('');
    expect(fromJSON({
      type: 'doc',
      content: [null, { type: 'aneh' }, { type: 'bulletList', content: 'x' }, { type: 'paragraph', content: [text('abc', { type: 'tebal' }), { type: 'text' }] }],
    })).toBe('<p>abc</p>');
  });
});
