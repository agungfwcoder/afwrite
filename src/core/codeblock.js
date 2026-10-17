// Blok kode <pre><code>.
//
// Di dalam blok kode, isi selalu teks polos dalam satu node teks. Penyuntingan dilakukan
// langsung pada teks (bukan execCommand) karena perilaku Enter/Tab bawaan browser di <pre>
// berbeda-beda; undo tetap aman karena editor memakai riwayatnya sendiri.
//
// Baris kosong terakhir di <pre> tidak terlihat oleh browser, jadi saat kursor berada di
// akhir, editor menambahkan satu "\n" cadangan. Output (sanitize) membuang "\n" di akhir.

import { codeText } from './sanitize.js';
import { closestInRoot, getRange, placeCaretAtEnd, restoreSelection } from './selection.js';

const INDENT = '  ';

export const inCodeBlock = (root) => closestInRoot(root, 'pre');

// Pastikan setiap <pre> berisi tepat satu <code> dengan satu node teks.
export function normalizeCodeBlocks(root) {
  root.querySelectorAll(':scope > pre').forEach((pre) => {
    let code = pre.querySelector(':scope > code');
    const valid = code && pre.childNodes.length === 1 && [...code.childNodes].every((n) => n.nodeType === Node.TEXT_NODE);
    if (valid) {
      if (code.childNodes.length !== 1) {
        code.normalize();
        if (!code.firstChild) code.append(document.createTextNode('\n'));
      }
      return;
    }
    const text = codeText(pre);
    code = document.createElement('code');
    code.append(document.createTextNode(text || '\n'));
    pre.replaceChildren(code);
  });
}

function codeOffsets(code) {
  const range = getRange();
  const measure = (container, offset) => {
    const r = document.createRange();
    r.setStart(code, 0);
    r.setEnd(container, offset);
    return r.toString().length;
  };
  return { start: measure(range.startContainer, range.startOffset), end: measure(range.endContainer, range.endOffset) };
}

function setCodeText(code, text, caret) {
  // "\n" cadangan agar baris terakhir yang kosong tetap terlihat.
  if (caret === text.length && text.endsWith('\n')) text += '\n';
  if (!text) text = '\n';
  code.textContent = text;
  const range = document.createRange();
  range.setStart(code.firstChild, Math.min(caret, code.firstChild.length));
  range.collapse(true);
  restoreSelection(range);
}

// Ganti teks dari start..end dengan `insert`, lalu kursor setelah sisipan.
export function replaceInCode(code, insert) {
  const { start, end } = codeOffsets(code);
  const text = code.textContent;
  setCodeText(code, text.slice(0, start) + insert + text.slice(end), start + insert.length);
}

function newParagraphAfter(node) {
  const p = document.createElement('p');
  p.append(document.createElement('br'));
  node.after(p);
  const range = document.createRange();
  range.setStart(p, 0);
  range.collapse(true);
  restoreSelection(range);
  return p;
}

// Keyboard di dalam blok kode. Mengembalikan true jika ditangani.
export function handleCodeKey(editor, e) {
  const pre = inCodeBlock(editor.el);
  if (!pre || e.ctrlKey || e.metaKey || e.altKey) return false;
  const code = pre.querySelector('code');
  const text = code.textContent;
  const { start, end } = codeOffsets(code);
  const content = text.replace(/\n$/, ''); // tanpa "\n" cadangan
  const atEnd = start >= content.length;

  if (e.key === 'Enter') {
    e.preventDefault();
    // Enter di baris kosong terakhir -> keluar dari blok kode.
    if (atEnd && start === end && content.endsWith('\n')) {
      code.textContent = content.slice(0, -1) || '\n';
      newParagraphAfter(pre);
    } else {
      replaceInCode(code, '\n');
    }
    return true;
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    if (!e.shiftKey) {
      replaceInCode(code, INDENT);
    } else {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const remove = text.slice(lineStart, lineStart + INDENT.length).match(/^ */)[0].length;
      if (remove) setCodeText(code, text.slice(0, lineStart) + text.slice(lineStart + remove), Math.max(lineStart, start - remove));
    }
    return true;
  }

  // Backspace di blok kode kosong -> jadi paragraf biasa.
  if (e.key === 'Backspace' && !content && start === 0 && end === 0) {
    e.preventDefault();
    const p = document.createElement('p');
    p.append(document.createElement('br'));
    pre.replaceWith(p);
    placeCaretAtEnd(p);
    return true;
  }

  // Panah bawah di baris terakhir blok kode yang menjadi blok terakhir -> paragraf baru.
  if (e.key === 'ArrowDown' && !pre.nextElementSibling && !content.slice(start).includes('\n')) {
    e.preventDefault();
    newParagraphAfter(pre);
    return true;
  }

  return false;
}

// Perintah: jadikan blok saat ini kode, atau kembalikan kode menjadi paragraf.
export function toggleCodeBlock(editor) {
  const root = editor.el;
  const pre = inCodeBlock(root);

  if (pre) {
    const lines = codeText(pre).split('\n');
    const paragraphs = lines.map((line) => {
      const p = document.createElement('p');
      if (line) p.textContent = line;
      else p.append(document.createElement('br'));
      return p;
    });
    pre.replaceWith(...paragraphs);
    placeCaretAtEnd(paragraphs[paragraphs.length - 1]);
    return;
  }

  const block = closestInRoot(root, 'p, h2, h3, blockquote');
  if (!block || block.parentNode !== root) return;

  const text = codeText(block);
  const newPre = document.createElement('pre');
  const code = document.createElement('code');
  code.append(document.createTextNode(text + '\n'));
  newPre.append(code);
  block.replaceWith(newPre);

  const range = document.createRange();
  range.setStart(code.firstChild, text.length);
  range.collapse(true);
  restoreSelection(range);
}
