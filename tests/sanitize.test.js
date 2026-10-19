import { describe, expect, test } from 'vitest';
import { sanitize, textToHtml } from '../src/core/sanitize.js';
import { normalizeUrl } from '../src/core/url.js';

describe('keamanan (XSS)', () => {
  test.each([
    ['<img src=x onerror=alert(1)>', ''],
    ['<a href="javascript:alert(1)">klik</a>', '<p>klik</p>'],
    ['<a href=" java&#x09;script:alert(1)">x</a>', '<p>x</p>'],
    ['<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>', '<p>x</p>'],
    ['<p onclick="x()" x-init="y()" @click="z" style="color:red" class="c" id="i">a</p>', '<p>a</p>'],
    ['<svg><script>alert(1)</script></svg>', ''],
    ['<math><mi xlink:href="javascript:alert(1)">x</mi></math>', ''],
    ['<iframe src="https://evil.test"></iframe>', ''],
    ['<p>a<script>alert(1)</script>b</p>', '<p>ab</p>'],
    ['<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>', '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'],
    ['<form><input value="x"><button>kirim</button></form>', ''],
    ['<style>body{display:none}</style><p>a</p>', '<p>a</p>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });
});

describe('struktur', () => {
  test.each([
    ['Teks lepas', '<p>Teks lepas</p>'],
    ['<div>a</div><div>b</div>', '<p>a</p><p>b</p>'],
    ['<div><p>a</p><p>b</p></div>', '<p>a</p><p>b</p>'],
    ['<p>a<ul><li>b</li></ul></p>', '<p>a</p><ul><li>b</li></ul>'],
    ['<b><p>a</p><p>b</p></b>', '<p><b>a</b></p><p><b>b</b></p>'],
    ['<ul><li>a</li><ul><li>b</li></ul></ul>', '<ul><li>a<ul><li>b</li></ul></li></ul>'],
    ['<ul><li><p>x</p></li></ul>', '<ul><li>x</li></ul>'],
    ['<blockquote><p>a</p><p>b</p></blockquote>', '<blockquote>a<br>b</blockquote>'],
    ['<h1>A</h1><h4>B</h4>', '<h2>A</h2><h3>B</h3>'],
    ['<h2><b>A</b></h2>', '<h2>A</h2>'],
    ['<strong>s</strong> <em>e</em>', '<p><b>s</b> <i>e</i></p>'],
    ['<span style="font-weight:bold">b</span><span style="font-style: italic">i</span>', '<p><b>b</b><i>i</i></p>'],
    ['<table><tr><td>a</td><td>b</td></tr><tr><td>c</td></tr></table>', '<p>a b</p><p>c</p>'],
    ['<a href="example.com">x</a>', '<p><a href="https://example.com">x</a></p>'],
    ['<p>a<hr>b</p>', '<p>a</p><hr><p>b</p>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });
});

describe('perapian', () => {
  test.each([
    ['', ''],
    ['<p><br></p>', ''],
    ['<p><b>a</b><b>b</b></p>', '<p><b>ab</b></p>'],
    ['<p><b><b>x</b></b></p>', '<p><b>x</b></p>'],
    ['<p>  a   b&nbsp;&nbsp;c  </p>', '<p>a b c</p>'],
    ['<p><br></p><p>x<br></p><p><br><br>y<br><br><br>z</p>', '<p>x</p><p>y<br>z</p>'],
    ['<p><b> </b>a</p>', '<p>a</p>'],
    ['<p>a<b></b></p>', '<p>a</p>'],
    ['<p>a <b>b</b> c</p>', '<p>a <b>b</b> c</p>'],
    ['<p>a​b</p>', '<p>ab</p>'],
  ])('%j', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });

  test('hasil editor sendiri tidak berubah', () => {
    const html = '<h2>Judul</h2><p>Teks <b>tebal</b>, <i>miring</i>, <a href="https://a.com">link</a>.</p><blockquote>Kutipan</blockquote><ul><li>satu</li><li>dua<ol><li>a</li></ol></li></ul>';
    expect(sanitize(html)).toBe(html);
  });
});

describe('paste dari aplikasi lain', () => {
  test('Google Docs', () => {
    const html = '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc"><h1 dir="ltr" style="line-height:1.38;margin-top:20pt;"><span style="font-size:20pt;font-family:Arial;color:#000000;font-weight:400;">Judul Dokumen</span></h1><p dir="ltr" style="line-height:1.38;"><span style="font-size:11pt;font-family:Arial;font-weight:400;">Teks biasa </span><span style="font-size:11pt;font-family:Arial;font-weight:700;">tebal</span><span style="font-size:11pt;font-weight:400;font-style:italic;"> miring</span></p><ul style="margin-top:0;"><li dir="ltr" style="list-style-type:disc;"><p dir="ltr" role="presentation"><span style="font-weight:400;">Item satu</span></p></li><li dir="ltr"><p dir="ltr" role="presentation"><span>Item dua</span></p></li></ul><br><p dir="ltr"><a href="https://example.com" style="text-decoration:none;"><span style="color:#1155cc;text-decoration:underline;">tautan</span></a></p></b>';
    expect(sanitize(html)).toBe(
      '<h2>Judul Dokumen</h2><p>Teks biasa <b>tebal</b><i> miring</i></p><ul><li>Item satu</li><li>Item dua</li></ul><p><a href="https://example.com">tautan</a></p>',
    );
  });

  test('Microsoft Word', () => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta name=Generator content="Microsoft Word 15"><style>p.MsoNormal{margin:0}</style></head><body lang=EN-US><!--StartFragment--><p class=MsoNormal><b><span lang=EN-US style='font-size:14.0pt;mso-bidi-font-family:Calibri'>Laporan<o:p></o:p></span></b></p><p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span lang=EN-US>Poin pertama<o:p></o:p></span></p><p class=MsoNormal><i>Catatan</i>&nbsp;akhir<o:p>&nbsp;</o:p></p><!--EndFragment--></body></html>`;
    expect(sanitize(html)).toBe('<p><b>Laporan</b></p><p>Poin pertama</p><p><i>Catatan</i> akhir</p>');
  });

  test('halaman web dengan layout', () => {
    const html = '<nav><a href="/">Beranda</a></nav><article class="post"><header><h1 class="title">Artikel</h1></header><div class="body"><p>Isi <span class="hl">penting</span>.</p><figure><img src="a.jpg"><figcaption>Keterangan</figcaption></figure></div></article>';
    expect(sanitize(html)).toBe('<p><a href="/">Beranda</a></p><h2>Artikel</h2><p>Isi penting.</p><p>Keterangan</p>');
  });
});

describe('textToHtml', () => {
  test('paragraf dan baris baru', () => {
    expect(textToHtml('a\nb\n\nc')).toBe('<p>a<br>b</p><p>c</p>');
    expect(textToHtml('a\r\n\r\n\r\nb')).toBe('<p>a</p><p>b</p>');
  });
  test('karakter HTML di-escape', () => {
    expect(textToHtml('<b>x</b> & "y"')).toBe('<p>&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;</p>');
  });
  test('kosong', () => {
    expect(textToHtml('  \n ')).toBe('');
  });
});

describe('normalizeUrl', () => {
  test.each([
    ['example.com', 'https://example.com'],
    ['https://a.com/x?y=1', 'https://a.com/x?y=1'],
    ['mailto:a@b.com', 'mailto:a@b.com'],
    ['/halaman', '/halaman'],
    ['#bagian', '#bagian'],
    ['localhost:3000', 'https://localhost:3000'],
    ['javascript:alert(1)', null],
    ['JaVaScRiPt:alert(1)', null],
    ['java\tscript:alert(1)', null],
    [' \u0001javascript:alert(1)', null],
    ['data:text/html,x', null],
    ['vbscript:x', null],
    ['', null],
  ])('%j', (input, expected) => {
    expect(normalizeUrl(input)).toBe(expected);
  });
});

describe('blok kode', () => {
  test.each([
    ['<pre><code>const a = 1;\n  if (a) {\n    go();\n  }</code></pre>', '<pre><code>const a = 1;\n  if (a) {\n    go();\n  }</code></pre>'],
    ['<pre class="x"><span style="color:red">let</span> x = <b>1</b>\n\n</pre>', '<pre><code>let x = 1</code></pre>'],
    ['<pre>baris 1<br>baris 2</pre>', '<pre><code>baris 1\nbaris 2</code></pre>'],
    ['<pre><code>&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>', '<pre><code>&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>'],
    ['<pre>   </pre>', ''],
    ['<p>a<pre>kode</pre>b</p>', '<p>a</p><pre><code>kode</code></pre><p>b</p>'],
    ['<ul><li>a<pre>x\ny</pre></li></ul>', '<ul><li>a<br><code>x y</code></li></ul>'],
  ])('%j', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });
});

describe('opsi headings', () => {
  const all = '<h1>1</h1><h2>2</h2><h3>3</h3><h4>4</h4><h5>5</h5><h6>6</h6>';
  test.each([
    [undefined, '<h2>1</h2><h2>2</h2><h3>3</h3><h3>4</h3><h3>5</h3><h3>6</h3>'],
    [[2, 3, 4, 5, 6], '<h2>1</h2><h2>2</h2><h3>3</h3><h4>4</h4><h5>5</h5><h6>6</h6>'],
    [[2, 4], '<h2>1</h2><h2>2</h2><h2>3</h2><h4>4</h4><h4>5</h4><h4>6</h4>'],
    [[3, 5], '<h3>1</h3><h3>2</h3><h3>3</h3><h3>4</h3><h5>5</h5><h5>6</h5>'],
    [[9, 'x', 1], '<h2>1</h2><h2>2</h2><h3>3</h3><h3>4</h3><h3>5</h3><h3>6</h3>'],
  ])('%j', (headings, expected) => {
    expect(sanitize(all, { headings })).toBe(expected);
  });

  test('<b> di dalam judul level berapa pun dibuang', () => {
    expect(sanitize('<h5><b>x</b></h5>', { headings: [5] })).toBe('<h5>x</h5>');
  });
});

describe('opsi title (mode artikel)', () => {
  test.each([
    ['<h1>A</h1><p class="afw-subtitle">B</p><p>c</p>', '<h1>A</h1><p class="afw-subtitle">B</p><p>c</p>'],
    ['<h1>A <b>tebal</b><br>baris</h1>', '<h1>A tebal baris</h1>'],
    ['<h1>A</h1><p class="afw-subtitle">B <i>m</i> <a href="https://a.com">l</a></p>', '<h1>A</h1><p class="afw-subtitle">B m <a href="https://a.com">l</a></p>'],
    ['<p>x</p><h1>A</h1>', '<p>x</p><h2>A</h2>'],
    ['<h1>A</h1><p>x</p><p class="afw-subtitle">B</p>', '<h1>A</h1><p>x</p><p>B</p>'],
    ['<p class="afw-subtitle">B</p>', '<p>B</p>'],
    ['<p class="lain afw-subtitle" onclick="x()">B</p>', '<p>B</p>'],
  ])('%j', (input, expected) => {
    expect(sanitize(input, { title: true })).toBe(expected);
  });

  test('tanpa opsi title: h1 -> h2, class subjudul dibuang', () => {
    expect(sanitize('<h1>A</h1><p class="afw-subtitle">B</p>')).toBe('<h2>A</h2><p>B</p>');
  });
});
