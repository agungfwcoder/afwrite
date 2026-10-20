// Format tambahan (opsi `formats`): garis bawah, coret, warna teks, stabilo, dan perataan.
//
//   underline  <u>
//   strike     <s>
//   color      <span style="color: #e11d48">                 hanya warna dari palet `colors`
//   highlight  <mark style="background-color: #fef08a">      hanya warna dari palet `highlights`
//   align      <p class="afw-align-center">, juga <h2>-<h6>  center | right | justify
//
// Bawaan: semua aktif, kecuali di mode artikel (opsi title) yang tetap polos ala Medium.
// Warna disimpan dalam satu format (#rrggbb huruf kecil) agar HTML sebelum simpan dan
// sesudah dimuat ulang identik.

export const FORMATS = ['underline', 'strike', 'color', 'highlight', 'align'];
export const ALIGNS = ['center', 'right', 'justify'];

export const DEFAULT_COLORS = ['#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#9333ea', '#71717a'];
export const DEFAULT_HIGHLIGHTS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'];

// true/undefined = bawaan, false = tidak ada, array = pilihan sendiri.
export function normalizeFormats(value, title = false) {
  if (value === true || value == null) return title ? [] : [...FORMATS];
  if (!Array.isArray(value)) return [];
  return FORMATS.filter((f) => value.includes(f));
}

// '#ABC', '#aabbcc', 'rgb(170, 187, 204)' -> '#aabbcc'. Selain itu (nama warna, transparan) -> null.
export function normalizeColor(value) {
  const v = String(value ?? '').trim().toLowerCase();
  let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) return `#${m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]}`;
  m = v.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(1|1\.0+|0?\.\d+|0)\s*)?\)$/);
  if (!m || (m[4] !== undefined && Number(m[4]) < 1)) return null;
  const rgb = m.slice(1, 4).map(Number);
  return rgb.every((n) => n <= 255) ? `#${rgb.map((n) => n.toString(16).padStart(2, '0')).join('')}` : null;
}

export function normalizePalette(list, fallback) {
  const colors = (Array.isArray(list) ? list : fallback).map(normalizeColor).filter(Boolean);
  return [...new Set(colors)];
}

// Nilai satu properti dari atribut style (tanpa bergantung pada parser CSS browser).
export function styleValue(style, prop) {
  const m = String(style || '').match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return m ? m[1].trim().replace(/\s*!important$/i, '') : '';
}

// Perataan blok dari class afwrite, class Quill (ql-align-*), style text-align, atau atribut align.
export function alignOf(el) {
  for (const cls of el.classList || []) {
    const m = cls.match(/^(?:afw|ql)-align-(center|right|justify)$/);
    if (m) return m[1];
  }
  const value = (styleValue(el.getAttribute('style'), 'text-align') || el.getAttribute('align') || '').toLowerCase();
  return ALIGNS.includes(value) ? value : null;
}
