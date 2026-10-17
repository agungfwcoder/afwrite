// Daftar perintah format. Tiap perintah punya:
//   run(editor, ...args)  -> menjalankan format
//   active(editor)        -> true jika format sedang aktif di posisi kursor
//
// Termin 1 masih memakai document.execCommand (deprecated, tapi didukung semua
// browser dan otomatis masuk riwayat undo). Implementasinya bisa diganti nanti
// tanpa mengubah UI, karena UI hanya mengenal nama perintah.

import { toggleCodeBlock } from './codeblock.js';
import { createEmbedFigure, insertImageFiles, insertMediaBlock, pickImageFiles, topBlockAtCaret } from './media.js';
import { normalizeUrl } from './url.js';
import { escapeHtml } from './sanitize.js';
import {
  getRange,
  placeCaretAtEnd,
  placeCaretAtTextOffset,
  textOffsetIn,
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
  let fallback = null;

  if (list && list.tagName !== target) {
    renameElement(list, target);
  } else if (list) {
    // Mematikan list ditangani sendiri: Safari membuat list bertingkat alih-alih menghapusnya.
    fallback = listItemToParagraph(closestInRoot(editor.el, 'li'));
    if (fallback) fallback = { el: fallback, offset: Infinity };
  } else {
    // Cadangan posisi kursor: Safari mengganti node teks saat membuat list sehingga
    // posisi tersimpan tidak bisa dipulihkan; kursor dikembalikan lewat offset karakter.
    const top = topBlockAtCaret(editor.el);
    const index = top ? [...editor.el.children].indexOf(top) : -1;
    const offset = top ? textOffsetIn(top) : 0;
    exec(command);
    unwrapBlocksFromParagraphs(editor.el);
    if (index >= 0) fallback = { el: editor.el.children[index], offset };
  }

  removeTrailingBreaks(editor.el);
  if (!restoreRemembered(saved, editor.el) && fallback?.el) placeCaretAtTextOffset(fallback.el, fallback.offset);
}

// <li> di posisi kursor menjadi <p>; item sesudahnya pindah ke list baru di bawahnya.
// List bertingkat di dalam item itu tetap menjadi list setelah paragraf.
function listItemToParagraph(li) {
  if (!li) return null;
  const list = li.parentElement;

  if (list.parentElement?.tagName === 'LI') {
    exec('outdent');
    return null;
  }

  const p = document.createElement('p');
  const nested = [];
  [...li.childNodes].forEach((child) => {
    if (child.nodeName === 'UL' || child.nodeName === 'OL') nested.push(child);
    else p.appendChild(child);
  });
  if (!p.textContent && !p.querySelector('br')) p.appendChild(document.createElement('br'));

  const after = [];
  for (let next = li.nextElementSibling; next; next = next.nextElementSibling) after.push(next);

  list.after(p);
  let anchor = p;
  nested.forEach((sub) => {
    anchor.after(sub);
    anchor = sub;
  });
  if (after.length) {
    const tail = document.createElement(list.tagName);
    tail.append(...after);
    anchor.after(tail);
  }

  li.remove();
  if (!list.children.length) list.remove();
  return p;
}

// Safari menambahkan <br> di akhir <li> berisi teks; tanpa dibuang, Enter di akhir item
// dianggap di "baris kosong" dan langsung keluar dari list.
function removeTrailingBreaks(root) {
  root.querySelectorAll('li').forEach((li) => {
    const last = li.lastChild;
    if (last?.nodeName === 'BR' && li.textContent.trim() && last.previousSibling?.nodeName !== 'BR') last.remove();
  });
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
  codeblock: {
    run: (ed) => toggleCodeBlock(ed),
    active: (ed) => !!closestInRoot(ed.el, 'pre'),
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
        href = window.prompt(ed.strings.promptUrl, 'https://');
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
  // ----- Media -----
  image: {
    // Tanpa argumen: buka dialog pilih file. Dengan argumen: FileList/array File.
    run: (ed, files) => (files ? insertImageFiles(ed, files) : pickImageFiles(ed)),
    active: () => false,
  },
  embed: {
    // Tanpa argumen: minta URL ke UI (event 'embedrequest'), atau prompt() jika tidak ada UI.
    run(ed, url) {
      if (url === undefined) {
        if (ed.listeners.embedrequest?.length) {
          ed.emit('embedrequest', {});
          return;
        }
        const saved = saveSelection();
        url = window.prompt(ed.strings.promptEmbed);
        if (!url) return;
        ed.el.focus();
        restoreSelection(saved);
      }
      const figure = createEmbedFigure(url);
      if (!figure) {
        ed.emit('error', { message: ed.strings.errorEmbed });
        return;
      }
      insertMediaBlock(ed.el, figure, ed.strings.captionPlaceholder);
    },
    active: () => false,
  },
  hr: {
    run: (ed) => insertMediaBlock(ed.el, document.createElement('hr'), ed.strings.captionPlaceholder),
    active: () => false,
  },
  undo: {
    run: (ed) => ed.undo(),
    active: () => false,
  },
  redo: {
    run: (ed) => ed.redo(),
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
