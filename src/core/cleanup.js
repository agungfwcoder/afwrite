// Pembersihan langsung (in-place) di dalam editor yang sedang diketik.
//
// Browser sering menyisipkan markup sendiri, misalnya Chrome membuat
// <span style="font-size: ...; font-weight: 700"> saat dua paragraf digabung dengan
// Backspace, atau <div> saat Enter di posisi tertentu. Fungsi ini membersihkannya tanpa
// mengganti node teks, sehingga posisi kursor bisa dikembalikan.
//
// Berbeda dengan sanitize() yang membangun ulang seluruh HTML (dipakai untuk output),
// fungsi ini hanya melakukan perbaikan kecil yang aman dilakukan saat mengetik.

import { normalizeUrl } from './url.js';
import { rememberSelection, restoreRemembered } from './selection.js';

const ALLOWED = new Set(['P', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'B', 'I', 'A', 'CODE', 'BR']);
const RENAME = { STRONG: 'B', EM: 'I', H1: 'H2', H4: 'H3', H5: 'H3', H6: 'H3' };
const DROP = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE']);
const BLOCKS = 'p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, div';

function isDirty(el) {
  if (!ALLOWED.has(el.tagName)) return true;
  for (const attr of el.attributes) {
    if (!(el.tagName === 'A' && attr.name === 'href')) return true;
  }
  return false;
}

function unwrap(el) {
  el.replaceWith(...el.childNodes);
}

function rename(el, tagName) {
  const replacement = document.createElement(tagName);
  if (el.tagName === 'A' || tagName === 'A') {
    const href = el.getAttribute('href');
    if (href) replacement.setAttribute('href', href);
  }
  replacement.append(...el.childNodes);
  el.replaceWith(replacement);
  return replacement;
}

// Mengembalikan true jika ada yang diubah.
export function cleanLive(root) {
  const dirty = [...root.querySelectorAll('*')].filter(isDirty);
  if (!dirty.length) return false;

  const saved = rememberSelection();

  dirty.forEach((el) => {
    if (!el.isConnected) return;
    const tag = el.tagName;

    if (DROP.has(tag)) return el.remove();

    // Atribut: hanya <a href> yang valid yang dipertahankan.
    [...el.attributes].forEach((attr) => {
      if (!(tag === 'A' && attr.name === 'href')) el.removeAttribute(attr.name);
    });
    if (tag === 'A' && !normalizeUrl(el.getAttribute('href'))) return unwrap(el);

    if (RENAME[tag]) return rename(el, RENAME[tag]);

    if (tag === 'DIV') {
      // <div> langsung di bawah editor tanpa blok di dalamnya = paragraf.
      return el.parentNode === root && !el.querySelector(BLOCKS) ? rename(el, 'P') : unwrap(el);
    }

    if (!ALLOWED.has(tag)) unwrap(el); // span, font, u, ...
  });

  restoreRemembered(saved, root);
  return true;
}
