// Daftar perintah format. Tiap perintah punya:
//   run(editor, ...args)  -> menjalankan format
//   active(editor)        -> true jika format sedang aktif di posisi kursor
//
// UI hanya mengenal nama perintah; isinya memakai perintah Tiptap/ProseMirror
// (editor.tiptap), bukan document.execCommand seperti v1.

import { createImageRequest, insertImages, isFileList, pickImageFiles } from './media.js';
import { parseEmbed } from './embed.js';
import { ALIGNS, normalizeColor } from './formats.js';
import { titleIndex } from './schema.js';
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

// Mode artikel: blok tepat setelah judul bisa menjadi subjudul.
const afterTitle = (ed) =>
  ed.options.title && $from(ed).depth === 1 && $from(ed).index(0) === titleIndex(ed.tiptap.state.doc) + 1;
// Tombol judul "kecil" (level kedua yang aktif, seperti t kecil di Medium) = subjudul di posisi itu.
export const subtitleLevel = (ed) => ed.options.headings[1] ?? ed.options.headings[0];

// Judul hanya untuk level yang diaktifkan lewat opsi `headings`.
const heading = (level) => ({
  run(ed) {
    if (!ed.options.headings.includes(level)) return false;
    if (afterTitle(ed) && level === subtitleLevel(ed)) {
      if (blockType(ed) === 'subtitle') return tt(ed).commands.setNode('paragraph');
      // Artikel wajib punya isi: jika baris ini satu-satunya, sediakan paragraf kosong di bawahnya.
      const isLast = $from(ed).index(0) === ed.tiptap.state.doc.childCount - 1;
      return tt(ed).chain()
        .command(({ tr, state }) => {
          if (isLast) tr.insert(tr.doc.content.size, state.schema.nodes.paragraph.create());
          return true;
        })
        .setNode('subtitle')
        .run();
    }
    // Perataan ikut dipertahankan saat paragraf <-> judul.
    return blockType(ed) === 'subtitle'
      ? tt(ed).commands.setNode('heading', { level })
      : toggleBlock('heading', { level, ...keepAlign(ed) })(ed);
  },
  active: (ed) => tt(ed).isActive('heading', { level }) || (blockType(ed) === 'subtitle' && level === subtitleLevel(ed)),
});

// ----- Format tambahan (opsi formats) -----

// Perintah -> format yang dibutuhkan (salah satu). Tanpa format itu tombolnya tidak ditampilkan.
export const COMMAND_FORMATS = {
  underline: ['underline'],
  strike: ['strike'],
  color: ['color', 'highlight'], // tombol palet: warna teks dan/atau stabilo
  highlight: ['highlight'],
  align: ['align'],
  alignLeft: ['align'],
  alignCenter: ['align'],
  alignRight: ['align'],
  alignJustify: ['align'],
};
export const commandAvailable = (formats, name) => !COMMAND_FORMATS[name] || COMMAND_FORMATS[name].some((f) => formats.includes(f));
const hasFormat = (ed, name) => ed.options.formats.includes(name);

const ALIGN_TYPES = ['paragraph', 'heading'];
const keepAlign = (ed) => (hasFormat(ed, 'align') ? { textAlign: currentAlign(ed) } : {});

// Perataan blok tingkat teratas di posisi kursor: 'center' | 'right' | 'justify', atau null (kiri).
export function currentAlign(ed) {
  const $pos = $from(ed);
  const node = $pos.depth >= 1 ? $pos.node(1) : $pos.nodeAfter; // seleksi seluruh dokumen: blok pertama
  return node && ALIGN_TYPES.includes(node.type.name) ? node.attrs.textAlign || null : null;
}

// Ratakan semua paragraf & judul tingkat teratas dalam seleksi (isi list dan kutipan tidak).
function setAlign(ed, value) {
  if (!hasFormat(ed, 'align')) return false;
  const align = ALIGNS.includes(value) ? value : null;
  const { state, view } = tt(ed);
  const { from, to } = state.selection;
  const tr = state.tr;
  // Hanya blok tingkat teratas: tidak masuk ke dalam list / kutipan.
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (ALIGN_TYPES.includes(node.type.name) && node.attrs.textAlign !== align) {
      tr.setNodeMarkup(pos, null, { ...node.attrs, textAlign: align });
    }
    return false;
  });
  if (tr.docChanged) view.dispatch(tr);
  return true;
}

const alignCommand = (value) => ({
  run: (ed) => setAlign(ed, value),
  active: (ed) => currentAlign(ed) === (value === 'left' ? null : value),
});

const toggleFormat = (name) => ({
  run: (ed) => hasFormat(ed, name) && tt(ed).commands.toggleMark(name),
  active: (ed) => hasFormat(ed, name) && tt(ed).isActive(name),
});

// Warna dari palet (opsi colors / highlights). Tanpa nilai (atau null) = hapus warna.
const colorCommand = (name, palette) => ({
  run(ed, value) {
    if (!hasFormat(ed, name)) return false;
    const color = normalizeColor(value);
    if (!color) return tt(ed).chain().extendMarkRange(name).unsetMark(name).run();
    if (!ed.options[palette].includes(color)) return false;
    return tt(ed).commands.setMark(name, { color });
  },
  active: (ed) => hasFormat(ed, name) && tt(ed).isActive(name),
});

// Perintah yang tidak berlaku di judul / subjudul artikel (tombolnya tampil redup).
const SUBTITLE_DISABLED = ['bold', 'italic', 'ul', 'ol', 'codeblock', 'indent', 'outdent', ...Object.keys(COMMAND_FORMATS)];
export function isCommandDisabled(ed, name) {
  if (!commandAvailable(ed.options.formats, name)) return true;
  const type = blockType(ed);
  // Dari judul hanya bisa menyisipkan blok non-teks; blok itu dipasang di atas judul.
  if (type === 'title') return !['undo', 'redo', 'image', 'embed', 'hr'].includes(name);
  if (type === 'subtitle') return SUBTITLE_DISABLED.includes(name);
  return false;
}

export const COMMANDS = {
  bold: {
    run: (ed) => tt(ed).commands.toggleMark('bold'),
    active: (ed) => tt(ed).isActive('bold'),
  },
  italic: {
    run: (ed) => tt(ed).commands.toggleMark('italic'),
    active: (ed) => tt(ed).isActive('italic'),
  },
  underline: toggleFormat('underline'),
  strike: toggleFormat('strike'),
  // exec('color', '#e11d48') / exec('highlight', '#fef08a'); tanpa nilai = hapus.
  // Tombol 'color' di UI membuka palet; statusnya aktif jika teks berwarna atau berstabilo.
  color: {
    ...colorCommand('color', 'colors'),
    active: (ed) => (hasFormat(ed, 'color') && tt(ed).isActive('color')) || (hasFormat(ed, 'highlight') && tt(ed).isActive('highlight')),
  },
  highlight: colorCommand('highlight', 'highlights'),
  // exec('align', 'center'); tanpa nilai = ganti bergiliran kiri -> tengah -> kanan -> rata kanan-kiri.
  align: {
    run(ed, value) {
      if (value !== undefined) return setAlign(ed, value);
      const order = [null, ...ALIGNS];
      return setAlign(ed, order[(order.indexOf(currentAlign(ed)) + 1) % order.length]);
    },
    active: (ed) => currentAlign(ed) !== null,
  },
  alignLeft: alignCommand('left'),
  alignCenter: alignCommand('center'),
  alignRight: alignCommand('right'),
  alignJustify: alignCommand('justify'),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
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
      else if (blockType(ed) !== 'title') tt(ed).commands.setNode('paragraph', keepAlign(ed));
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
    // Tanpa argumen: minta gambar ke UI aplikasi (event 'imagerequest', mis. galeri), atau buka
    // dialog pilih file jika tidak ada. Dengan argumen: FileList/File/array File (diupload), atau
    // deskriptor { src, alt?, mediaId?, size? } / array-nya (disisipkan langsung).
    run(ed, arg) {
      if (arg == null) {
        if (ed.listeners.imagerequest?.length) {
          ed.emit('imagerequest', createImageRequest(ed));
          return;
        }
        return pickImageFiles(ed);
      }
      return insertImages(ed, arg);
    },
    active: () => false,
  },
  replaceImage: {
    // Ganti gambar terpilih. Tanpa argumen: minta gambar pengganti ke UI aplikasi (imagerequest
    // dengan mode 'replace'), atau dialog file. Dengan argumen: deskriptor / File (= replaceMedia).
    run(ed, arg) {
      if (ed.selectedMedia()?.kind !== 'image') return;
      if (arg == null) {
        if (ed.listeners.imagerequest?.length) {
          ed.emit('imagerequest', createImageRequest(ed, { mode: 'replace' }));
          return;
        }
        return pickImageFiles(ed, { replace: true });
      }
      return ed.replaceMedia(Array.isArray(arg) || isFileList(arg) ? arg[0] : arg);
    },
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
