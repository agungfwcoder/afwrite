import { describe, expect, test } from 'vitest';
import { sanitize } from '../src/core/sanitize.js';
import { normalizeImageSrc, parseEmbed } from '../src/core/embed.js';
import { normalizeImageDescriptor } from '../src/core/media.js';

const YT = '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="YouTube" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>';

describe('gambar', () => {
  test.each([
    ['<img src="https://a.com/x.png" alt=" Foto ">', '<figure><img src="https://a.com/x.png" alt="Foto"></figure>'],
    ['<p>teks <img src="https://a.com/x.png"> lanjut</p>', '<p>teks</p><figure><img src="https://a.com/x.png" alt=""></figure><p>lanjut</p>'],
    ['<figure><img src="/img/a.jpg"><figcaption>  Keterangan <b>foto</b> </figcaption></figure>', '<figure><img src="/img/a.jpg" alt=""><figcaption>Keterangan <b>foto</b></figcaption></figure>'],
    ['<figure data-size="full" class="x"><img src="https://a.com/x.png"></figure>', '<figure data-size="full"><img src="https://a.com/x.png" alt=""></figure>'],
    ['<figure data-size="raksasa"><img src="https://a.com/x.png"></figure>', '<figure><img src="https://a.com/x.png" alt=""></figure>'],
    ['<figure><figcaption>tanpa gambar</figcaption></figure>', '<p>tanpa gambar</p>'],
    ['<a href="https://a.com"><img src="https://a.com/x.png"></a>', '<figure><img src="https://a.com/x.png" alt=""></figure>'],
    ['<ul><li>a<img src="https://a.com/x.png"></li></ul>', '<ul><li>a</li></ul>'],
    ['<img src="javascript:alert(1)">', ''],
    ['<img src="data:image/svg+xml;base64,PHN2Zz4=">', ''],
    ['<img src="file:///C:/foto.png">', ''],
    ['<img src="x" onerror="alert(1)">', ''],
    ['<img src="https://a.com/x.png" onload="alert(1)" style="width:9px" width="9">', '<figure><img src="https://a.com/x.png" alt=""></figure>'],
    ['<picture><source srcset="a.webp"><img src="https://a.com/x.jpg"></picture>', '<figure><img src="https://a.com/x.jpg" alt=""></figure>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });

  test('data:image diizinkan/ditolak sesuai opsi', () => {
    const html = '<img src="data:image/png;base64,iVBORw0KGgo=">';
    expect(sanitize(html)).toBe('<figure><img src="data:image/png;base64,iVBORw0KGgo=" alt=""></figure>');
    expect(sanitize(html, { allowDataImages: false })).toBe('');
  });
});

describe('embed video', () => {
  test.each([
    ['<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" onload="x()"></iframe>', `<figure data-embed="youtube">${YT}</figure>`],
    ['<iframe src="https://evil.com/embed/dQw4w9WgXcQ"></iframe>', ''],
    ['<iframe src="javascript:alert(1)"></iframe>', ''],
    ['<iframe srcdoc="<script>alert(1)</script>"></iframe>', ''],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });

  test.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1', 'youtube'],
    ['https://youtu.be/dQw4w9WgXcQ', 'youtube'],
    ['youtube.com/shorts/dQw4w9WgXcQ', 'youtube'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube'],
    ['https://vimeo.com/76979871', 'vimeo'],
    ['https://player.vimeo.com/video/76979871', 'vimeo'],
    ['https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ', null],
    ['https://www.youtube.com/watch?v=bad"id', null],
    ['https://example.com', null],
    ['bukan url', null],
  ])('parseEmbed(%j)', (url, provider) => {
    expect(parseEmbed(url)?.provider ?? null).toBe(provider);
  });
});

describe('pemisah', () => {
  test.each([
    ['<p>a</p><hr class="x"><p>b</p>', '<p>a</p><hr><p>b</p>'],
    ['<blockquote>a<hr>b</blockquote>', '<blockquote>a<br>b</blockquote>'],
  ])('%s', (input, expected) => {
    expect(sanitize(input)).toBe(expected);
  });
});

describe('normalizeImageSrc', () => {
  test.each([
    ['https://a.com/x.png', 'https://a.com/x.png'],
    ['//cdn.com/x.png', 'https://cdn.com/x.png'],
    ['/uploads/x.png', '/uploads/x.png'],
    ['blob:https://a.com/123', null],
    ['data:image/jpeg;base64,/9j/4AAQ', 'data:image/jpeg;base64,/9j/4AAQ'],
    ['data:text/html;base64,PHNjcmlwdD4=', null],
  ])('%j', (src, expected) => {
    expect(normalizeImageSrc(src)).toBe(expected);
  });
});

describe('normalizeImageDescriptor (gambar dari galeri)', () => {
  test('src + mediaId', () => {
    expect(normalizeImageDescriptor({ src: '/storage/a.jpg', mediaId: '12' })).toEqual({ src: '/storage/a.jpg', alt: '', mediaId: '12', size: null });
  });
  test('alt di-trim, size & media_id', () => {
    expect(normalizeImageDescriptor({ src: 'https://a.com/x.png', alt: ' Foto ', media_id: 7, size: 'wide' })).toEqual({ src: 'https://a.com/x.png', alt: 'Foto', mediaId: '7', size: 'wide' });
  });
  test.each([['12a'], [-1], ['1.5'], [{}]])('mediaId bukan digit (%j) -> null', (mediaId) => {
    expect(normalizeImageDescriptor({ src: '/a.jpg', mediaId }).mediaId).toBeNull();
  });
  test('size tidak dikenal -> default', () => {
    expect(normalizeImageDescriptor({ src: '/a.jpg', size: 'raksasa' }).size).toBeNull();
  });
  test.each([['javascript:alert(1)'], ['data:image/svg+xml;base64,PHN2Zz4='], [''], [42]])('src berbahaya/kosong (%j) -> null', (src) => {
    expect(normalizeImageDescriptor({ src })).toBeNull();
  });
  test('data: ditolak saat allowData false', () => {
    const src = 'data:image/png;base64,iVBORw0KGgo=';
    expect(normalizeImageDescriptor({ src }).src).toBe(src);
    expect(normalizeImageDescriptor({ src }, { allowData: false })).toBeNull();
  });
  test('bukan objek -> null', () => {
    expect(normalizeImageDescriptor(null)).toBeNull();
    expect(normalizeImageDescriptor('/a.jpg')).toBeNull();
  });
});
