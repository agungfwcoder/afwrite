import { createDocument, getHTMLFromFragment, getSchema, Mark } from '@tiptap/core';
import { describe, expect, test } from 'vitest';
import { normalizeColor, normalizeFormats } from '../src/core/formats.js';
import { normalizeUpload } from '../src/core/media.js';
import { sanitize } from '../src/core/sanitize.js';
import { createExtensions, withTitle } from '../src/core/schema.js';
import { PASTE_SAMPLES } from '../demo/paste-samples.js';

// Jalur yang sama dengan Editor: setHTML (sanitize -> parse ProseMirror) lalu getHTML (serialize -> sanitize).
function loader(opts = {}, extensions = []) {
  const schema = getSchema([...createExtensions({ headings: opts.headings || [2, 3], title: opts.title, formats: normalizeFormats(opts.formats, opts.title) }), ...extensions]);
  return (html) => {
    const doc = createDocument(withTitle(sanitize(html, opts) || '<p></p>', opts.title), schema);
    return sanitize(getHTMLFromFragment(doc.content, schema), opts);
  };
}
const load = loader();

describe('opsi formats', () => {
  test('bawaan: semua aktif, mode artikel: tidak ada', () => {
    expect(normalizeFormats()).toEqual(['underline', 'strike', 'color', 'highlight', 'align']);
    expect(normalizeFormats(undefined, true)).toEqual([]);
    expect(normalizeFormats(true, true)).toEqual([]);
    expect(normalizeFormats(['align', 'x', 'underline'])).toEqual(['underline', 'align']);
    expect(normalizeFormats(false)).toEqual([]);
  });

  test('mode artikel tetap polos ala Medium', () => {
    const html = '<h1>J</h1><p class="afw-align-center"><u>a</u> <s>b</s> <span style="color: #e11d48">c</span> <mark>d</mark></p>';
    expect(sanitize(html, { title: true })).toBe('<h1>J</h1><p>a b c d</p>');
  });

  test('format yang dimatikan dibuang', () => {
    expect(sanitize('<p class="ql-align-center"><u>a</u><s>b</s></p>', { formats: ['strike'] })).toBe('<p>a<s>b</s></p>');
  });
});

describe('garis bawah & coret', () => {
  test.each([
    ['<p><u>a</u> <ins>b</ins></p>', '<p><u>a</u> <u>b</u></p>'],
    ['<p><s>a</s> <strike>b</strike> <del>c</del></p>', '<p><s>a</s> <s>b</s> <s>c</s></p>'],
    ['<p><span style="text-decoration: underline line-through">x</span></p>', '<p><s><u>x</u></s></p>'],
    ['<p><u><u>x</u></u></p>', '<p><u>x</u></p>'],
    // Gaya link dari Google Docs/Word bukan format penulis.
    ['<p><a href="https://a.com"><u>x</u></a></p>', '<p><a href="https://a.com">x</a></p>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });
});

describe('warna & stabilo', () => {
  test('normalizeColor', () => {
    expect(normalizeColor('#E11D48')).toBe('#e11d48');
    expect(normalizeColor('#abc')).toBe('#aabbcc');
    expect(normalizeColor('rgb(254, 240, 138)')).toBe('#fef08a');
    expect(normalizeColor('rgba(254,240,138,1)')).toBe('#fef08a');
    expect(normalizeColor('rgba(254,240,138,0.5)')).toBe(null);
    expect(normalizeColor('red')).toBe(null);
    expect(normalizeColor('transparent')).toBe(null);
    expect(normalizeColor('#e11d48;background:url(x)')).toBe(null);
  });

  test.each([
    // Satu format penulisan (hex), apa pun bentuk masukannya.
    ['<p><span style="color: rgb(225, 29, 72);">a</span></p>', '<p><span style="color: #e11d48">a</span></p>'],
    ['<p><span style="color:#E11D48;">a</span></p>', '<p><span style="color: #e11d48">a</span></p>'],
    ['<p><font color="#2563eb">a</font></p>', '<p><span style="color: #2563eb">a</span></p>'],
    ['<p><mark style="background-color: rgb(254, 240, 138)">a</mark></p>', '<p><mark style="background-color: #fef08a">a</mark></p>'],
    // Tiptap Highlight (multicolor) menulis data-color.
    ['<p><mark data-color="#bbf7d0" style="background-color: #bbf7d0; color: inherit">a</mark></p>', '<p><mark style="background-color: #bbf7d0">a</mark></p>'],
    ['<p><span style="background-color:#fef08a">a</span></p>', '<p><mark style="background-color: #fef08a">a</mark></p>'],
    // Di luar palet: warna teks dibuang, stabilo jadi <mark> polos.
    ['<p><span style="color:#000000">a</span></p>', '<p>a</p>'],
    ['<p><mark style="background-color:#123456">a</mark></p>', '<p><mark>a</mark></p>'],
    ['<p><span style="color:red">a</span></p>', '<p>a</p>'],
    // Tidak ada style lain yang ikut.
    ['<p><span style="color:#e11d48;font-size:40px;position:fixed">a</span></p>', '<p><span style="color: #e11d48">a</span></p>'],
    ['<p style="color:#e11d48">a</p>', '<p>a</p>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });

  test('palet sendiri', () => {
    expect(sanitize('<p><span style="color:#000">a</span></p>', { colors: ['#000000'] })).toBe('<p><span style="color: #000000">a</span></p>');
    expect(sanitize('<p><span style="color:#e11d48">a</span></p>', { colors: ['#000000'] })).toBe('<p>a</p>');
  });

  test('Google Docs: warna hitam bawaan & latar transparan tidak ikut', () => {
    const html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:700;">x</span></p>';
    expect(sanitize(html)).toBe('<p><b>x</b></p>');
  });
});

describe('perataan', () => {
  test.each([
    ['<p class="afw-align-center">a</p>', '<p class="afw-align-center">a</p>'],
    // Konten lama Quill / CMS.
    ['<p class="ql-align-right">a</p>', '<p class="afw-align-right">a</p>'],
    ['<h2 class="ql-align-justify">a</h2>', '<h2 class="afw-align-justify">a</h2>'],
    ['<p style="text-align: center">a</p>', '<p class="afw-align-center">a</p>'],
    ['<p align="right">a</p>', '<p class="afw-align-right">a</p>'],
    ['<div style="text-align:center">a</div>', '<p class="afw-align-center">a</p>'],
    ['<p style="text-align: left">a</p><p class="ql-align-left">b</p>', '<p>a</p><p>b</p>'],
    ['<p class="afw-align-evil">a</p>', '<p>a</p>'],
    // Hanya paragraf & judul; list dan kutipan tidak.
    ['<ul><li class="ql-align-center">a</li></ul><blockquote style="text-align:center">b</blockquote>', '<ul><li>a</li></ul><blockquote>b</blockquote>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });
});

describe('data-media-id (ID media library)', () => {
  test.each([
    ['<img src="/storage/a.jpg" data-media-id="42">', '<figure><img src="/storage/a.jpg" alt="" data-media-id="42"></figure>'],
    ['<figure><img src="/storage/a.jpg" alt="" data-media-id="42"><figcaption>Gambar 1</figcaption></figure>', '<figure><img src="/storage/a.jpg" alt="" data-media-id="42"><figcaption>Gambar 1</figcaption></figure>'],
    ['<img src="/a.jpg" data-media-id="x onerror">', '<figure><img src="/a.jpg" alt=""></figure>'],
    ['<img src="/a.jpg" data-media-id="42&quot; onerror=&quot;x">', '<figure><img src="/a.jpg" alt=""></figure>'],
    ['<img src="/a.jpg" data-media-id="">', '<figure><img src="/a.jpg" alt=""></figure>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
    expect(load(input)).toBe(expected);
  });

  test('hasil upload: string atau { url, mediaId, alt }', () => {
    expect(normalizeUpload('/a.jpg')).toEqual({ url: '/a.jpg', mediaId: null, alt: '' });
    expect(normalizeUpload({ url: '/a.jpg', mediaId: 42 })).toEqual({ url: '/a.jpg', mediaId: '42', alt: '' });
    expect(normalizeUpload({ url: '/a.jpg', media_id: '7', alt: ' Foto ' })).toEqual({ url: '/a.jpg', mediaId: '7', alt: 'Foto' });
    expect(normalizeUpload({ url: '/a.jpg', mediaId: 'x' }).mediaId).toBe(null);
    expect(normalizeUpload(null).url).toBe('');
  });
});

describe('whitelist tambahan (allowTags, allowAttributes, allowClasses)', () => {
  const opts = { allowTags: ['sup', 'script', 'img', 'b'], allowAttributes: { sup: ['data-note', 'onclick', 'style', 'href'], a: ['target', 'rel'] }, allowClasses: ['catatan', 'afw-x'] };

  test('tag & atribut tambahan lolos, yang berbahaya tidak', () => {
    expect(sanitize('<p>x<sup data-note="1" onclick="a()" style="color:red" class="catatan lain" href="javascript:x">2</sup></p>', opts))
      .toBe('<p>x<sup data-note="1" class="catatan">2</sup></p>');
    expect(sanitize('<p><script>x</script>a</p>', opts)).toBe('<p>a</p>');
    expect(sanitize('<p><a href="https://a.com" target="_blank" rel="nofollow" onclick="x">a</a></p>', opts))
      .toBe('<p><a href="https://a.com" target="_blank" rel="nofollow">a</a></p>');
    expect(sanitize('<p class="catatan afw-x">a</p>', opts)).toBe('<p class="catatan">a</p>');
  });

  test('tanpa opsi: tidak ada yang lolos', () => {
    expect(sanitize('<p class="catatan">x<sup>2</sup> <a href="https://a.com" target="_blank">a</a></p>'))
      .toBe('<p>x2 <a href="https://a.com">a</a></p>');
  });

  test('extension mark sendiri lolos round-trip', () => {
    const Sup = Mark.create({ name: 'sup', parseHTML: () => [{ tag: 'sup' }], renderHTML: () => ['sup', 0] });
    const custom = loader({ allowTags: ['sup'] }, [Sup]);
    const html = '<p>E = mc<sup>2</sup></p>';
    expect(custom(html)).toBe(html);
    expect(custom(custom(html))).toBe(html);
  });
});

// C3: getHTML(setHTML(x)) === getHTML(setHTML(getHTML(setHTML(x)))).
describe('round-trip idempoten', () => {
  const fixtures = {
    'judul, list bersarang, kutipan, kode': '<h2>Judul</h2><h3>Sub</h3><ul><li>satu<ul><li>a</li><li>b<ol><li>i</li></ol></li></ul></li><li>dua</li></ul><blockquote>Kutipan<br>baris dua</blockquote><pre><code>function f() {\n  return 1;\n}\n\nf();</code></pre>',
    'link dengan target/rel': '<p><a href="https://a.com" target="_blank" rel="nofollow noopener">link</a></p>',
    'figure + caption + media-id + size': '<figure data-size="wide"><img src="/storage/a.jpg" alt="Foto" data-media-id="42"><figcaption>Gambar 1</figcaption></figure><p>teks</p>',
    'embed video': '<figure data-embed="youtube"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe><figcaption>Video</figcaption></figure>',
    'karakter khusus': '<p>&amp; &lt; &gt; " — é ñ 😀 &nbsp;spasi</p>',
    'format tambahan (B1-B3)': '<h2 class="ql-align-center">Tengah</h2><p class="afw-align-justify">Rata <u>garis</u> <s>coret</s> <span style="color: rgb(37, 99, 235)">biru</span> <mark style="background-color:#fef08a">stabilo</mark> <b><u><span style="color:#e11d48">semua</span></u></b></p>',
    'strong/em dari konten lama': '<p><strong>tebal</strong> <em>miring</em></p>',
    'paste Google Docs': PASTE_SAMPLES.gdocs.html,
    'paste Word': PASTE_SAMPLES.word.html,
    'HTML berbahaya': PASTE_SAMPLES.evil.html,
  };

  test.each(Object.entries(fixtures))('%s', (name, html) => {
    const once = load(html);
    expect(once).not.toBe('');
    expect(load(once)).toBe(once);
  });

  test('output editor sendiri tidak berubah sama sekali', () => {
    const html = '<h2 class="afw-align-center">Judul</h2><p>Teks <b>tebal</b> <u>garis</u> <s>coret</s> <span style="color: #e11d48">merah</span> <mark style="background-color: #fef08a">stabilo</mark> <mark>polos</mark> <a href="https://a.com">link</a></p><figure><img src="/a.jpg" alt="" data-media-id="42"><figcaption>Gambar 1</figcaption></figure><p class="afw-align-right">kanan</p>';
    expect(sanitize(html)).toBe(html);
    expect(load(html)).toBe(html);
  });

  test('mode artikel', () => {
    const article = loader({ title: true });
    const html = '<figure><img src="/a.jpg" alt="" data-media-id="7"></figure><h1>Judul</h1><p class="afw-subtitle">Sub <a href="https://a.com">link</a></p><p>Isi</p>';
    expect(article(html)).toBe(html);
  });

  test('hasil sanitasi server (HTMLPurifier) dimuat ulang -> getHTML sama', () => {
    // Penulisan khas HTMLPurifier: style tanpa spasi + titik koma, <br />, entitas.
    const purified = '<p class="afw-align-center"><span style="color:#e11d48;">a</span> <mark style="background-color:#fef08a;">b</mark><br />c &amp; d</p>';
    expect(load(purified)).toBe('<p class="afw-align-center"><span style="color: #e11d48">a</span> <mark style="background-color: #fef08a">b</mark><br>c &amp; d</p>');
  });
});
