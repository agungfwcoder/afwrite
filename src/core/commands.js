// Daftar perintah format. Tiap perintah punya:
//   run(editor, ...args)  -> menjalankan format
//   active(editor)        -> true jika format sedang aktif di posisi kursor
//
// UI hanya mengenal nama perintah; isinya memakai perintah Tiptap/ProseMirror
// (editor.tiptap), bukan document.execCommand seperti v1.

import { insertImageFiles, pickImageFiles } from './media.js';
import { parseEmbed } from './embed.js';
import { normalizeUrl } from './url.js';

const tt = (ed) => ed.tiptap;
const $from = (ed) => ed.tiptap.state.selection.$from;

// Node terdekat (dari posisi kursor ke atas) yang namanya ada di `names`.
export function closestNode(ed, names) {
  const $pos = $from(ed);
  for (let d = $pos.depth; d > 0; d--) {
    if (names.includes($pos.node(d).type.name)) return $pos.node(d);
  }
  return null;
}

const inList = (ed) => !!closestNode(ed, ['listItem']);
const listType = (ed) => closestNode(ed, ['bulletList', 'orderedList'])?.type.name || null;
const blockType = (ed) => $from(ed).parent.type.name;

const toggleBlock = (name, attrs) => (ed) => tt(ed).commands.toggleNode(name, 'paragraph', attrs);

export const COMMANDS = {
  bold: {
    run: (ed) => tt(ed).commands.toggleMark('bold'),
    active: (ed) => tt(ed).isActive('bold'),
  },
  italic: {
    run: (ed) => tt(ed).commands.toggleMark('italic'),
    active: (ed) => tt(ed).isActive('italic'),
  },
  h2: {
    run: toggleBlock('heading', { level: 2 }),
    active: (ed) => tt(ed).isActive('heading', { level: 2 }),
  },
  h3: {
    run: toggleBlock('heading', { level: 3 }),
    active: (ed) => tt(ed).isActive('heading', { level: 3 }),
  },
  quote: {
    run: toggleBlock('blockquote'),
    active: (ed) => blockType(ed) === 'blockquote',
  },
  // Pindah UL <-> OL mengganti seluruh list; klik lagi mengeluarkan item dari list.
  ul: {
    run: (ed) => tt(ed).commands.toggleBulletList(),
    active: (ed) => listType(ed) === 'bulletList',
  },
  ol: {
    run: (ed) => tt(ed).commands.toggleOrderedList(),
    active: (ed) => listType(ed) === 'orderedList',
  },
  codeblock: {
    run: (ed) => tt(ed).commands.toggleCodeBlock(),
    active: (ed) => blockType(ed) === 'codeBlock',
  },
  paragraph: {
    // Kembalikan blok menjadi paragraf biasa (termasuk keluar dari list).
    run(ed) {
      if (inList(ed)) tt(ed).commands.liftListItem('listItem');
      else tt(ed).commands.setNode('paragraph');
    },
    active: (ed) => blockType(ed) === 'paragraph' && !inList(ed),
  },
  link: {
    // Tanpa argumen: minta URL ke UI (event 'linkrequest'). Jika tidak ada UI yang
    // mendengarkan (pemakaian tanpa Alpine), pakai prompt() bawaan browser.
    // Dengan argumen: pasang / ubah link. URL kosong atau tidak valid = hapus link.
    run(ed, href) {
      const editor = tt(ed);
      const current = editor.isActive('link') ? editor.getAttributes('link').href || '' : null;

      if (href === undefined) {
        if (ed.listeners.linkrequest?.length) {
          ed.emit('linkrequest', { href: current || '' });
          return;
        }
        if (current !== null) return COMMANDS.unlink.run(ed);
        const saved = ed.saveSelection();
        href = window.prompt(ed.strings.promptUrl, 'https://');
        ed.restoreSelection(saved);
      }

      const url = normalizeUrl(href);
      if (!url) {
        if (current !== null) COMMANDS.unlink.run(ed);
        return;
      }

      if (current !== null) {
        editor.chain().extendMarkRange('link').setMark('link', { href: url }).run();
      } else if (editor.state.selection.empty) {
        editor.commands.insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] });
      } else {
        editor.commands.setMark('link', { href: url });
      }
    },
    active: (ed) => tt(ed).isActive('link'),
  },
  unlink: {
    run(ed) {
      const editor = tt(ed);
      editor.chain().extendMarkRange('link').unsetMark('link').run();
      const { to } = editor.state.selection;
      editor.commands.setTextSelection(to);
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
        const saved = ed.saveSelection();
        url = window.prompt(ed.strings.promptEmbed);
        if (!url) return;
        ed.restoreSelection(saved);
      }
      const embed = parseEmbed(url);
      if (!embed) {
        ed.emit('error', { message: ed.strings.errorEmbed });
        return;
      }
      tt(ed).commands.insertMediaBlock({ type: 'embed', attrs: { provider: embed.provider, id: embed.id } });
    },
    active: () => false,
  },
  hr: {
    run: (ed) => tt(ed).commands.insertMediaBlock({ type: 'horizontalRule' }),
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
    run: (ed) => inList(ed) && tt(ed).commands.sinkListItem('listItem'),
    active: () => false,
  },
  outdent: {
    run: (ed) => inList(ed) && tt(ed).commands.liftListItem('listItem'),
    active: () => false,
  },
};
