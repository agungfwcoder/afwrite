// Sanitasi HTML berbasis whitelist.
//
// Dipakai untuk: konten hasil paste/drop, setHTML(), dan output getHTML().
// Hasilnya hanya berisi tag yang dikenal editor. Atribut yang tersisa hanya:
//   <a href>                       URL divalidasi (http/https/mailto/tel/relatif)
//   <img src alt>                  src divalidasi; data:image hanya png/jpg/gif/webp/avif
//   <figure data-size data-embed>  data-size: wide | full
//   <iframe ...>                   hanya YouTube/Vimeo, src dibangun ulang dari ID video
//   <pre><code>                    blok kode: teks polos, spasi & baris baru dipertahankan
// Contoh:
//
//   sanitize('<div style="color:red">Hai <script>x()</script><span style="font-weight:700">kamu</span></div>')
//   // -> '<p>Hai <b>kamu</b></p>'
//
// PENTING: sanitasi di browser hanya menjaga kualitas & keamanan di sisi editor.
// Server tetap WAJIB menyanitasi ulang sebelum menyimpan/menampilkan, karena request
// bisa dikirim tanpa melewati editor.

import { createEmbedIframe, normalizeImageSrc, parseEmbed } from './embed.js';
import { normalizeUrl } from './url.js';

export const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'FIGURE', 'HR', 'PRE']);
const MEDIA_TAGS = new Set(['FIGURE', 'HR']);
const FIGURE_SIZES = ['wide', 'full'];
export const INLINE_TAGS = new Set(['B', 'I', 'A', 'CODE', 'BR']);
const TEXT_BLOCKS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI']);
const LISTS = new Set(['UL', 'OL']);

// Dibuang beserta seluruh isinya.
const DROP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'TEMPLATE', 'FRAME', 'FRAMESET', 'OBJECT', 'EMBED', 'APPLET',
  'META', 'LINK', 'BASE', 'TITLE', 'HEAD', 'NOSCRIPT', 'SVG', 'MATH', 'CANVAS',
  'FORM', 'INPUT', 'BUTTON', 'SELECT', 'OPTION', 'TEXTAREA', 'DIALOG',
  'SOURCE', 'VIDEO', 'AUDIO', 'TRACK',
  'O:P', // paragraf kosong dari Microsoft Word
]);

// Tag sumber -> tag hasil. Judul (H1-H6) dipetakan lewat headingTag() sesuai opsi `headings`.
const TAG_MAP = {
  P: 'P', BLOCKQUOTE: 'BLOCKQUOTE', UL: 'UL', OL: 'OL', LI: 'LI',
  B: 'B', STRONG: 'B', I: 'I', EM: 'I', CITE: 'I', DFN: 'I',
  A: 'A', CODE: 'CODE', TT: 'CODE', KBD: 'CODE', SAMP: 'CODE', BR: 'BR',
};

// Wadah blok: isinya dipertahankan, teks lepas dibungkus <p>.
const CONTAINER_TAGS = new Set([
  'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'HEADER', 'FOOTER', 'ASIDE', 'NAV',
  'ADDRESS', 'CENTER', 'DL', 'DT', 'DD', 'DETAILS', 'SUMMARY', 'TABLE', 'CAPTION',
  'THEAD', 'TBODY', 'TFOOT', 'TR', 'BODY', 'HTML',
]);

// Opsi:
//   allowDataImages (true)  izinkan <img src="data:image/...">
//   headings ([2, 3])       level judul yang dipakai; level lain diturunkan ke level aktif
//                           terdekat (H1 menjadi level terkecil yang aktif)
//   title (false)           mode artikel: <h1> pertama = judul, <p class="afw-subtitle"> tepat
//                           setelahnya = subjudul; <h1> lain diturunkan seperti biasa
let options = {};

// [4, 2, 2, 9] -> [2, 4]. Hanya level 2-6; kosong/tidak valid -> [2, 3].
export function normalizeHeadings(levels) {
  const valid = [...new Set((Array.isArray(levels) ? levels : []).map(Number))]
    .filter((n) => Number.isInteger(n) && n >= 2 && n <= 6)
    .sort((a, b) => a - b);
  return valid.length ? valid : [2, 3];
}

function headingTag(tag) {
  const levels = options.headings;
  const level = Number(tag[1]);
  const lower = levels.filter((n) => n <= level);
  return `H${lower.length ? lower[lower.length - 1] : levels[0]}`;
}

export function sanitize(html, opts = {}) {
  if (!html || !String(html).trim()) return '';
  const container = sanitizeToElement(html, opts);
  return container.innerHTML;
}

export function sanitizeToElement(html, opts = {}) {
  options = { allowDataImages: true, ...opts };
  options.headings = normalizeHeadings(opts.headings);
  options.title = !!opts.title;

  // DOMParser menghasilkan dokumen "mati": script tidak jalan, gambar tidak dimuat.
  const source = new DOMParser().parseFromString(String(html), 'text/html');
  const nodes = [...source.body.childNodes].flatMap(convert);

  const container = document.createElement('div');
  container.append(...wrapInlineRuns(nodes, 'P'));
  tidy(container);
  if (options.title) fixTitle(container);
  return container;
}

// Mode artikel: hanya <h1> paling atas yang menjadi judul (teks polos), dan subjudul hanya sah
// tepat setelahnya (teks + link). Selain itu kembali menjadi judul bagian / paragraf biasa.
function fixTitle(root) {
  const blocks = [...root.children];
  blocks.forEach((node, index) => {
    if (node.tagName === 'H1' && index !== 0) node.replaceWith(el(headingTag('H1'), {}, [...node.childNodes]));
    const isSubtitle = node.tagName === 'P' && node.classList.contains('afw-subtitle');
    if (isSubtitle && !(index === 1 && blocks[0].tagName === 'H1')) node.removeAttribute('class');
  });

  const title = root.firstElementChild?.tagName === 'H1' ? root.firstElementChild : null;
  if (!title) return;
  const plain = (node) => {
    node.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
    return node.textContent.replace(/\s+/g, ' ').trim();
  };
  title.textContent = plain(title);
  const subtitle = title.nextElementSibling;
  if (subtitle?.classList.contains('afw-subtitle')) {
    subtitle.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
    subtitle.querySelectorAll('b, i, code').forEach(unwrap);
  }
}

// ---------------------------------------------------------------------------
// Tahap 1: konversi node sumber menjadi node bersih (tag whitelist, tanpa atribut)
// ---------------------------------------------------------------------------

function convert(node) {
  if (node.nodeType === Node.TEXT_NODE) return [document.createTextNode(node.data)];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const tag = node.tagName.toUpperCase();
  const style = (node.getAttribute('style') || '').toLowerCase();

  if (DROP_TAGS.has(tag)) return [];
  if (/display\s*:\s*none/.test(style)) return [];
  if (/mso-list\s*:\s*ignore/.test(style)) return []; // simbol bullet palsu dari Word

  // Media
  if (tag === 'IMG') return imageFigure(node);
  if (tag === 'P' && options.title && node.classList.contains('afw-subtitle')) {
    return [el('P', { class: 'afw-subtitle' }, flattenToInline([...node.childNodes].flatMap(convert)))];
  }
  if (tag === 'IFRAME') {
    const embed = parseEmbed(node.getAttribute('src'));
    return embed ? [embedFigure(embed)] : [];
  }
  if (tag === 'HR') return [el('HR')];
  if (tag === 'PRE') return codeBlock(node);

  const children = [...node.childNodes].flatMap(convert);

  if (tag === 'FIGCAPTION') return [el('FIGCAPTION', {}, flattenToInline(children))];
  if (tag === 'FIGURE') return makeFigure(node, children);

  // Google Docs membungkus seluruh isi clipboard dengan <b style="font-weight:normal">.
  if (tag === 'B' && /font-weight\s*:\s*(normal|400)/.test(style)) return children;

  // Sel tabel: isi dipertahankan, dipisah spasi.
  if (tag === 'TD' || tag === 'TH') return [...children, document.createTextNode(' ')];

  const target = tag === 'H1' && options.title ? 'H1' : /^H[1-6]$/.test(tag) ? headingTag(tag) : TAG_MAP[tag] || (CONTAINER_TAGS.has(tag) ? 'P' : null);

  // Tag tak dikenal (span, font, u, ...): ambil isinya, tapi format dari style tetap dibaca.
  if (!target) {
    let out = children;
    if (/font-style\s*:\s*italic/.test(style)) out = wrapInline('I', out);
    if (/font-weight\s*:\s*(bold|bolder|[6-9]00)/.test(style)) out = wrapInline('B', out);
    return out;
  }

  if (target === 'BR') return [document.createElement('br')];

  if (target === 'A') {
    const href = normalizeUrl(node.getAttribute('href'));
    return href ? wrapInline('A', children, { href }) : children;
  }

  if (INLINE_TAGS.has(target)) return wrapInline(target, children);
  return makeBlock(target, children);
}

const isBlock = (node) => node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.tagName);
const isMedia = (node) => node.nodeType === Node.ELEMENT_NODE && MEDIA_TAGS.has(node.tagName);

// Blok kode: hanya teks. <br> (dari beberapa sumber paste) menjadi baris baru.
export function codeText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return clone.textContent.replace(/\u200b/g, '').replace(/\r\n?/g, '\n').replace(/\n+$/, '');
}

function codeBlock(node) {
  const text = codeText(node);
  return text.trim() ? [el('PRE', {}, [el('CODE', {}, [document.createTextNode(text)])])] : [];
}

function imageFigure(node) {
  const src = normalizeImageSrc(node.getAttribute('src') || node.getAttribute('data-src'), {
    allowData: options.allowDataImages,
  });
  if (!src) return [];
  const alt = (node.getAttribute('alt') || '').trim();
  return [el('FIGURE', {}, [el('IMG', { src, alt })])];
}

function embedFigure(embed) {
  return el('FIGURE', { 'data-embed': embed.provider }, [createEmbedIframe(embed)]);
}

// <figure> sumber: ambil media pertama + <figcaption>. Media lain jadi figure terpisah.
function makeFigure(node, children) {
  const figures = children.filter((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'FIGURE');
  const captions = children.filter((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'FIGCAPTION');

  if (!figures.length) {
    // Tanpa gambar/video: keterangannya saja yang dipertahankan sebagai paragraf.
    return wrapInlineRuns(captions.flatMap((c) => [...c.childNodes]), 'P');
  }

  const [figure, ...rest] = figures;
  const size = node.getAttribute('data-size');
  if (FIGURE_SIZES.includes(size)) figure.setAttribute('data-size', size);
  if (captions.length) {
    figure.append(el('FIGCAPTION', {}, captions.flatMap((c) => [...c.childNodes])));
  }
  return [figure, ...rest];
}

function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => element.setAttribute(k, v));
  element.append(...children);
  return element;
}

// Kelompokkan node inline berurutan ke dalam `tag`; node blok dibiarkan.
function wrapInlineRuns(nodes, tag) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push(el(tag, {}, run));
    run = [];
  };
  nodes.forEach((node) => {
    if (isBlock(node)) {
      flush();
      out.push(node);
    } else {
      run.push(node);
    }
  });
  flush();
  return out;
}

// Format inline. Jika isinya berisi blok (mis. <b><p>a</p><p>b</p></b>), format
// dipindah ke dalam masing-masing blok: <p><b>a</b></p><p><b>b</b></p>.
function wrapInline(tag, nodes, attrs = {}) {
  if (!nodes.some(isBlock)) return [el(tag, attrs, nodes)];

  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push(el(tag, attrs, run));
    run = [];
  };
  nodes.forEach((node) => {
    if (isBlock(node)) {
      flush();
      applyInlineInside(node, tag, attrs);
      out.push(node);
    } else {
      run.push(node);
    }
  });
  flush();
  return out;
}

function applyInlineInside(block, tag, attrs) {
  if (MEDIA_TAGS.has(block.tagName)) return; // gambar ber-link: link-nya dibuang
  if (LISTS.has(block.tagName)) {
    [...block.children].forEach((li) => applyInlineInside(li, tag, attrs));
    return;
  }
  const nodes = [...block.childNodes];
  block.replaceChildren(...wrapInline(tag, nodes.filter((n) => !isBlock(n)), attrs));
  nodes.filter(isBlock).forEach((child) => {
    applyInlineInside(child, tag, attrs);
    block.append(child);
  });
}

// Ratakan blok menjadi konten inline, tiap blok dipisah <br>.
function flattenToInline(nodes, { keepLists = false } = {}) {
  const out = [];
  let needBreak = false;

  nodes.forEach((node) => {
    // Gambar/video di dalam list atau kutipan tidak didukung; posisinya jadi pemisah baris.
    if (isMedia(node)) {
      if (out.length) needBreak = true;
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'PRE') {
      if (out.length) out.push(document.createElement('br'));
      out.push(el('CODE', {}, [node.textContent.replace(/\n/g, ' ')]));
      needBreak = true;
      return;
    }
    if (keepLists && node.nodeType === Node.ELEMENT_NODE && LISTS.has(node.tagName)) {
      out.push(node);
      needBreak = false;
      return;
    }
    if (isBlock(node)) {
      // List di dalam kutipan: tiap item menjadi satu baris.
      const inner = LISTS.has(node.tagName)
        ? [...node.children].flatMap((li, idx) => [
            ...(idx ? [document.createElement('br')] : []),
            ...flattenToInline([...li.childNodes]),
          ])
        : flattenToInline([...node.childNodes]);
      if (out.length) out.push(document.createElement('br'));
      out.push(...inner);
      needBreak = true;
      return;
    }
    if (needBreak && !(node.nodeType === Node.TEXT_NODE && !node.data.trim())) {
      out.push(document.createElement('br'));
      needBreak = false;
    }
    out.push(node);
  });
  return out;
}

function makeBlock(tag, children) {
  switch (tag) {
    case 'P':
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      // Blok di dalam paragraf/heading diangkat keluar.
      return wrapInlineRuns(children, tag);

    case 'BLOCKQUOTE':
      return [el('BLOCKQUOTE', {}, flattenToInline(children))];

    case 'LI':
      return [el('LI', {}, flattenToInline(children, { keepLists: true }))];

    case 'UL':
    case 'OL': {
      const list = el(tag);
      let inlineRun = [];
      const flushInline = () => {
        if (inlineRun.some((n) => n.nodeType !== Node.TEXT_NODE || n.data.trim())) {
          list.append(el('LI', {}, inlineRun));
        }
        inlineRun = [];
      };
      children.forEach((node) => {
        if (!isBlock(node)) return inlineRun.push(node);
        flushInline();
        if (node.tagName === 'LI') {
          list.append(node);
        } else if (LISTS.has(node.tagName)) {
          // <ul><li>a</li><ul>..</ul></ul> (tidak valid tapi umum) -> list bertingkat di li sebelumnya.
          const prev = list.lastElementChild || list.appendChild(el('LI'));
          prev.append(node);
        } else {
          list.append(el('LI', {}, flattenToInline([node])));
        }
      });
      flushInline();
      return [list];
    }

    default:
      return children;
  }
}

// ---------------------------------------------------------------------------
// Tahap 2: perapian (spasi, <br>, tag kosong, tag ganda)
// ---------------------------------------------------------------------------

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const TEXT_SELECTOR = `p, ${HEADINGS}, blockquote, li, figcaption`;

export function tidy(root) {
  unwrapRedundant(root);
  root.querySelectorAll(TEXT_SELECTOR).forEach(normalizeWhitespace);
  removeEmptyInline(root);
  root.querySelectorAll(TEXT_SELECTOR).forEach(trimBreaks);
  removeEmptyBlocks(root);
  tidyMedia(root);
  mergeAdjacent(root);
  root.normalize();
}

function unwrap(node) {
  node.replaceWith(...node.childNodes);
}

function unwrapRedundant(root) {
  // <b> di dalam <b>, <a> di dalam <a>, dst.
  ['B', 'I', 'A', 'CODE'].forEach((tag) => {
    root.querySelectorAll(`${tag} ${tag}`).forEach(unwrap);
  });
  // Heading sudah tebal; <b> di dalamnya tidak bermakna (umum dari Google Docs).
  root.querySelectorAll(HEADINGS.split(', ').map((h) => `${h} b`).join(', ')).forEach(unwrap);
}

// Node teks & <br> milik blok ini saja (list bertingkat diproses sebagai blok sendiri).
function inlineLeaves(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE && LISTS.has(node.tagName)) return NodeFilter.FILTER_REJECT;
      if (node.nodeType === Node.TEXT_NODE || node.tagName === 'BR') return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    },
  });
  const leaves = [];
  while (walker.nextNode()) leaves.push(walker.currentNode);
  return leaves;
}

function normalizeWhitespace(block) {
  const leaves = inlineLeaves(block);

  // Maju: rapatkan spasi ganda & buang spasi di awal baris.
  let afterSpace = true;
  leaves.forEach((leaf) => {
    if (leaf.nodeType !== Node.TEXT_NODE) {
      afterSpace = true;
      return;
    }
    let text = leaf.data.replace(/[\s ​﻿]+/g, (m) => (/[^​﻿]/.test(m) ? ' ' : ''));
    if (afterSpace && text.startsWith(' ')) text = text.slice(1);
    leaf.data = text;
    if (text) afterSpace = text.endsWith(' ');
  });

  // Mundur: buang spasi di akhir baris.
  let atEnd = true;
  for (let i = leaves.length - 1; i >= 0; i--) {
    const leaf = leaves[i];
    if (leaf.nodeType !== Node.TEXT_NODE) {
      atEnd = true;
      continue;
    }
    if (atEnd) leaf.data = leaf.data.replace(/ +$/, '');
    if (leaf.data) atEnd = false;
  }
}

function removeEmptyInline(root) {
  let changed = true;
  while (changed) {
    changed = false;
    root.querySelectorAll('b, i, a, code').forEach((node) => {
      if (!node.textContent && !node.querySelector('br')) {
        node.remove();
        changed = true;
      } else if (!node.textContent.trim() && !node.querySelector('br') && node.tagName !== 'A') {
        unwrap(node); // <b> </b> -> spasi biasa
        changed = true;
      }
    });
  }
}

function trimBreaks(block) {
  const leaves = inlineLeaves(block).filter((n) => n.nodeType !== Node.TEXT_NODE || n.data);
  let i = 0;
  while (i < leaves.length && leaves[i].nodeName === 'BR') leaves[i++].remove();
  let j = leaves.length - 1;
  while (j >= i && leaves[j].nodeName === 'BR') leaves[j--].remove();
  // Lebih dari satu <br> berturut-turut -> satu.
  for (let k = i + 1; k <= j; k++) {
    if (leaves[k].nodeName === 'BR' && leaves[k - 1].nodeName === 'BR') leaves[k].remove();
  }
}

function removeEmptyBlocks(root) {
  // Dari dalam ke luar, agar li kosong terhapus sebelum list induknya diperiksa.
  [...root.querySelectorAll(`${TEXT_SELECTOR}, ul, ol`)].reverse().forEach((block) => {
    const hasText = inlineLeaves(block).some((n) => n.nodeType === Node.TEXT_NODE && n.data.trim());
    const hasList = LISTS.has(block.tagName)
      ? !!block.querySelector('li')
      : !!block.querySelector('ul, ol');
    if (!hasText && !hasList) block.remove();
  });
}

// Figure & hr hanya boleh di tingkat teratas; figure wajib berisi gambar/video.
function tidyMedia(root) {
  root.querySelectorAll('figure, hr').forEach((node) => {
    if (node.parentNode !== root) return node.remove();
    if (node.tagName === 'FIGURE' && !node.querySelector(':scope > img, :scope > iframe')) node.remove();
  });
  root.querySelectorAll('img, iframe, figcaption').forEach((node) => {
    if (node.parentNode?.tagName !== 'FIGURE') node.remove();
  });
  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.parentNode !== root) pre.replaceWith(el('CODE', {}, [pre.textContent]));
  });
}

function mergeAdjacent(root) {
  root.querySelectorAll('b, i, code, a').forEach((node) => {
    if (!root.contains(node)) return; // sudah digabung ke elemen sebelumnya
    let next = node.nextSibling;
    while (
      next &&
      next.nodeType === Node.ELEMENT_NODE &&
      next.tagName === node.tagName &&
      next.getAttribute('href') === node.getAttribute('href')
    ) {
      node.append(...next.childNodes);
      next.remove();
      next = node.nextSibling;
    }
  });
}

// ---------------------------------------------------------------------------
// Teks polos -> HTML
// ---------------------------------------------------------------------------

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Baris kosong memisah paragraf, baris baru tunggal menjadi <br>.
export function textToHtml(text) {
  const normalized = String(text || '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) return '';
  return normalized
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
