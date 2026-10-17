// Daftar perintah format. Tiap perintah punya:
//   run(editor, ...args)  -> menjalankan format
//   active(editor)        -> true jika format sedang aktif di posisi kursor
//
// Termin 1 masih memakai document.execCommand (deprecated, tapi didukung semua
// browser dan otomatis masuk riwayat undo). Implementasinya bisa diganti nanti
// tanpa mengubah UI, karena UI hanya mengenal nama perintah.

import { normalizeUrl } from './url.js';
import { escapeHtml } from './sanitize.js';
import {
  getRange,
  rememberSelection,
  restoreRemembered,
  closestInRoot,
  currentBlockTag,
  saveSelection,
  restoreSelection,
  selectNode,
} from './selection.js';

const exec = (name, value = null) => document.execCommand(name, false, value);

function toggleBlock(editor, tag) {
  const isSame = tag === 'blockquote'
    ? !!closestInRoot(editor.el, 'blockquote')
    : currentBlockTag(editor.el) === tag;

  exec('formatBlock', isSame ? '<p>' : `<${tag}>`);
}

// Perintah list. Dua koreksi atas perilaku bawaan browser:
//  - Pindah UL <-> OL mengganti seluruh list, bukan hanya item di posisi kursor.
//  - Chrome kadang menaruh <ul>/<ol> di dalam <p> (HTML tidak valid) dan memindahkan
//    kursor ke awal teks; list dikeluarkan dari <p> lalu kursor dikembalikan.
function toggleList(editor, command) {
  const target = command === 'insertOrderedList' ? 'OL' : 'UL';
  const list = closestInRoot(editor.el, 'ul, ol');
  const saved = rememberSelection();

  if (list && list.tagName !== target) {
    renameElement(list, target);
  } else {
    exec(command);
    unwrapBlocksFromParagraphs(editor.el);
  }

  restoreRemembered(saved, editor.el);
}

export function renameElement(el, tagName) {
  const replacement = document.createElement(tagName);
  [...el.attributes].forEach((attr) => replacement.setAttribute(attr.name, attr.value));
  while (el.firstChild) replacement.appendChild(el.firstChild);
  el.replaceWith(replacement);
  return replacement;
}

function unwrapBlocksFromParagraphs(root) {
  root.querySelectorAll('p').forEach((p) => {
    if (!p.querySelector(':scope > ul, :scope > ol, :scope > blockquote')) return;

    let loose = null;
    [...p.childNodes].forEach((child) => {
      if (/^(UL|OL|BLOCKQUOTE)$/.test(child.nodeName)) {
        loose = null;
        p.before(child);
      } else {
        if (!loose) {
          loose = document.createElement('p');
          p.before(loose);
        }
        loose.appendChild(child);
      }
    });
    p.remove();
  });
}


export const COMMANDS = {
  bold: {
    run: () => exec('bold'),
    active: () => document.queryCommandState('bold'),
  },
  italic: {
    run: () => exec('italic'),
    active: () => document.queryCommandState('italic'),
  },
  h2: {
    run: (ed) => toggleBlock(ed, 'h2'),
    active: (ed) => currentBlockTag(ed.el) === 'h2',
  },
  h3: {
    run: (ed) => toggleBlock(ed, 'h3'),
    active: (ed) => currentBlockTag(ed.el) === 'h3',
  },
  quote: {
    run: (ed) => toggleBlock(ed, 'blockquote'),
    active: (ed) => !!closestInRoot(ed.el, 'blockquote'),
  },
  ul: {
    run: (ed) => toggleList(ed, 'insertUnorderedList'),
    active: (ed) => closestInRoot(ed.el, 'ul, ol')?.tagName === 'UL',
  },
  ol: {
    run: (ed) => toggleList(ed, 'insertOrderedList'),
    active: (ed) => closestInRoot(ed.el, 'ul, ol')?.tagName === 'OL',
  },
  paragraph: {
    // Kembalikan blok menjadi paragraf biasa (termasuk keluar dari list).
    run(ed) {
      const list = closestInRoot(ed.el, 'ul, ol');
      if (list) toggleList(ed, list.tagName === 'UL' ? 'insertUnorderedList' : 'insertOrderedList');
      else exec('formatBlock', '<p>');
    },
    active: (ed) => currentBlockTag(ed.el) === 'p',
  },
  link: {
    // Tanpa argumen: minta URL ke UI (event 'linkrequest'). Jika tidak ada UI yang
    // mendengarkan (pemakaian tanpa Alpine), pakai prompt() bawaan browser.
    // Dengan argumen: pasang / ubah link. URL kosong atau tidak valid = hapus link.
    run(ed, href) {
      const anchor = closestInRoot(ed.el, 'a');

      if (href === undefined) {
        if (ed.listeners.linkrequest?.length) {
          ed.emit('linkrequest', { href: anchor?.getAttribute('href') || '' });
          return;
        }
        if (anchor) return COMMANDS.unlink.run(ed);
        const saved = saveSelection();
        href = window.prompt('Masukkan URL', 'https://');
        ed.el.focus();
        restoreSelection(saved);
      }

      const url = normalizeUrl(href);
      if (!url) {
        if (anchor) COMMANDS.unlink.run(ed);
        return;
      }

      if (anchor) {
        anchor.setAttribute('href', url);
        return;
      }

      const range = getRange();
      if (!range || range.collapsed) {
        exec('insertHTML', `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`);
      } else {
        exec('createLink', url);
      }
    },
    active: (ed) => !!closestInRoot(ed.el, 'a'),
  },
  unlink: {
    run(ed) {
      const anchor = closestInRoot(ed.el, 'a');
      if (anchor) selectNode(anchor);
      exec('unlink');
      window.getSelection().collapseToEnd();
    },
    active: () => false,
  },
  indent: {
    // Tab di dalam list -> jadikan sub-list.
    run: (ed) => closestInRoot(ed.el, 'li') && exec('indent'),
    active: () => false,
  },
  outdent: {
    run: (ed) => closestInRoot(ed.el, 'li') && exec('outdent'),
    active: () => false,
  },
};
