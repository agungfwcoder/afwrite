// Shortcut markdown saat mengetik.
//
// Di awal paragraf (diikuti spasi):
//   # atau ##  -> Judul      ###  -> Subjudul    >  -> Kutipan
//   - * +      -> Daftar berpoin                1. -> Daftar bernomor
//   ---        -> Pemisah
//
// Di dalam teks:
//   **tebal**   *miring*   _miring_   `kode`

import { closestInRoot, getRange, restoreSelection } from './selection.js';
import { escapeHtml } from './sanitize.js';

const BLOCK_RULES = [
  { marker: /^#{1,2}$/, command: 'h2' },
  { marker: /^###$/, command: 'h3' },
  { marker: /^>$/, command: 'quote' },
  { marker: /^[-*+]$/, command: 'ul' },
  { marker: /^\d+[.)]$/, command: 'ol' },
  { marker: /^(-{3,}|\*{3,}|_{3,})$/, command: 'hr' },
];

const INLINE_RULES = [
  { pattern: /\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/, delim: 2, tag: 'b', command: 'bold' },
  { pattern: /(?:^|[^*\w])\*([^*\s](?:[^*]*[^*\s])?)\*$/, delim: 1, tag: 'i', command: 'italic' },
  { pattern: /(?:^|[^_\w])_([^_\s](?:[^_]*[^_\s])?)_$/, delim: 1, tag: 'i', command: 'italic' },
  { pattern: /`([^`]+)`$/, delim: 1, tag: 'code' },
];

// Dipanggil setelah spasi diketik. Mengembalikan true jika shortcut dijalankan.
export function applyBlockShortcut(editor) {
  const range = getRange();
  if (!range || !range.collapsed) return false;

  const block = closestInRoot(editor.el, 'p');
  if (!block || block.closest('li, blockquote')) return false;

  const before = document.createRange();
  before.setStart(block, 0);
  before.setEnd(range.startContainer, range.startOffset);

  const match = before.toString().match(/^(\S+)[\s ]$/);
  const rule = match && BLOCK_RULES.find((r) => r.marker.test(match[1]));
  if (!rule) return false;

  restoreSelection(before);
  document.execCommand('delete');
  editor.exec(rule.command);
  return true;
}

// Dipanggil setelah karakter penutup (* _ `) diketik.
export function applyInlineShortcut(editor, char) {
  if (!['*', '_', '`'].includes(char)) return false;

  const range = getRange();
  if (!range || !range.collapsed) return false;

  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE || node.parentElement.closest('code')) return false;

  const text = node.data.slice(0, range.startOffset);

  for (const rule of INLINE_RULES) {
    const match = text.match(rule.pattern);
    if (!match) continue;

    const inner = match[1];
    const start = text.length - inner.length - rule.delim * 2;
    const target = document.createRange();
    target.setStart(node, start);
    target.setEnd(node, range.startOffset);
    restoreSelection(target);

    // Zero-width space setelah <code> agar ketikan berikutnya keluar dari kode;
    // karakter ini dibuang lagi oleh sanitize() di output.
    const suffix = rule.tag === 'code' ? '​' : '';
    document.execCommand('insertHTML', false, `<${rule.tag}>${escapeHtml(inner)}</${rule.tag}>${suffix}`);

    // Matikan format untuk ketikan berikutnya (tebal/miring tidak "menular").
    if (rule.command && document.queryCommandState(rule.command)) {
      document.execCommand(rule.command);
    }
    return true;
  }
  return false;
}
