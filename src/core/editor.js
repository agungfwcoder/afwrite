// Inti editor (engine: Tiptap / ProseMirror). Tidak bergantung pada Alpine sehingga bisa
// dipakai mandiri:
//
//   const editor = new Editor(document.querySelector('#el'), { placeholder: 'Tulis…' });
//   editor.on('change', (html) => console.log(html));
//   editor.exec('bold');
//
// Event:
//   change       (html)   isi berubah; html sudah disanitasi
//   state        (obj)    format aktif di posisi kursor, mis. { bold: true, h2: false, ... }
//   selection    (info)   posisi seleksi untuk UI melayang (bubble, tombol +)
//   slash        (state)  status slash menu: { open, query, items, index, rect }
//   linkrequest  ({href}) perintah link dijalankan tanpa URL; UI diminta menampilkan input
//   embedrequest ()       perintah embed dijalankan tanpa URL
//   error        ({message, error?}) mis. upload gagal / file terlalu besar
//   history      ({canUndo, canRedo})
//   readonly     (boolean)
//   focus / blur
//
// Instance Tiptap tersedia di editor.tiptap untuk pemakaian lanjutan.

import { createDocument, Editor as TiptapEditor, Extension } from '@tiptap/core';
import { Dropcursor, Gapcursor, UndoRedo } from '@tiptap/extensions';
import { Fragment, Slice } from '@tiptap/pm/model';
import { EditorState, NodeSelection, Plugin, Selection, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { getStrings } from '../i18n.js';
import { BLOCKS, filterBlocks } from './blocks.js';
import { COMMANDS, isCommandDisabled } from './commands.js';
import { parseEmbed } from './embed.js';
import { markdownRules } from './markdown.js';
import { insertImageFiles, insertMediaBlock, isMediaNode, mediaKind, SIZES } from './media.js';
import { fromJSON, toJSON } from './model.js';
import { normalizeHeadings, sanitize, sanitizeToElement, textToHtml } from './sanitize.js';
import { createExtensions, titleIndex, titlePos, withTitle } from './schema.js';
import { slugify } from './slug.js';

const DEFAULTS = {
  content: '',
  lang: 'id', // 'id' | 'en'
  strings: {}, // timpa sebagian teks antarmuka, lihat src/i18n.js
  placeholder: null, // default dari teks bahasa
  label: null, // aria-label editor; default dari teks bahasa
  readonly: false,
  historyLimit: 100,
  autosave: null, // 'kunci' atau { key, delay }: simpan draf ke localStorage
  pasteAsPlainText: false, // true: semua format dari clipboard dibuang
  markdown: true, // shortcut markdown saat mengetik
  slash: true, // slash menu
  blocks: BLOCKS, // isi slash menu (judul hanya untuk level di `headings`)
  headings: [2, 3], // level judul yang dipakai (2-6)
  title: false, // mode artikel ala Medium: baris pertama judul <h1>, subjudul lewat tombol judul kecil
  upload: null, // async (file) => url gambar; tanpa ini gambar disimpan sebagai data URL (base64)
  maxImageSize: 5 * 1024 * 1024, // byte; 0 = tanpa batas
  allowDataImages: true, // izinkan <img src="data:image/..."> di output
};

const CLOSED_SLASH = { open: false, query: '', items: [], index: 0, rect: null };

// Shortcut keyboard. Mod = Ctrl (Windows/Linux) atau Cmd (macOS). Dicocokkan lewat
// event.code agar tetap jalan di layout keyboard non-latin.
const SHORTCUTS = [
  { code: 'KeyB', command: 'bold' },
  { code: 'KeyI', command: 'italic' },
  { code: 'KeyK', command: 'link' },
  { code: 'Digit0', alt: true, command: 'paragraph' },
  { code: 'Digit2', alt: true, command: 'h2' },
  { code: 'Digit3', alt: true, command: 'h3' },
  { code: 'Digit4', alt: true, command: 'h4' },
  { code: 'Digit5', alt: true, command: 'h5' },
  { code: 'Digit6', alt: true, command: 'h6' },
  { code: 'Digit7', shift: true, command: 'ol' },
  { code: 'Digit8', shift: true, command: 'ul' },
  { code: 'Digit9', shift: true, command: 'quote' },
  { code: 'KeyC', alt: true, command: 'codeblock' },
];

const CODE_INDENT = '  ';
const isCaption = (node) => node.type.name === 'image' || node.type.name === 'embed';
const isDocEmpty = (doc) => doc.childCount === 1 && doc.firstChild.type.name === 'paragraph' && doc.firstChild.content.size === 0;

export class Editor {
  constructor(el, options = {}) {
    if (!el) throw new Error('[afwrite] Elemen editor tidak ditemukan.');

    this.el = el;
    this.options = { ...DEFAULTS, ...options };
    this.options.headings = normalizeHeadings(this.options.headings);
    this.strings = getStrings(this.options.lang, this.options.strings);
    this.readOnly = false;
    this.listeners = {};
    this.commands = COMMANDS;
    this.slash = { ...CLOSED_SLASH };

    this._setup(this.options.content || el.innerHTML);
  }

  // ---------- API publik ----------

  exec(name, ...args) {
    if (this.readOnly) return;
    if (name === 'undo' || name === 'redo') return this[name]();

    const command = this.commands[name];
    if (!command) return console.warn(`[afwrite] Perintah tidak dikenal: ${name}`);

    if (!this.hasFocus()) this.focus();
    this._syncSelection();
    if (this.isDisabled(name)) return false;
    return command.run(this, ...args);
  }

  // Perintah tidak berlaku di posisi kursor (mis. tebal di judul artikel).
  isDisabled(name) {
    return this.hasFocus() && isCommandDisabled(this, name);
  }

  disabledState() {
    return Object.fromEntries(Object.keys(this.commands).map((name) => [name, this.isDisabled(name)]));
  }

  isActive(name) {
    if (!this.hasFocus()) return false;
    try {
      return !!this.commands[name]?.active(this);
    } catch {
      return false;
    }
  }

  state() {
    return Object.fromEntries(Object.keys(this.commands).map((name) => [name, this.isActive(name)]));
  }

  hasFocus() {
    return !!this.tiptap.view?.hasFocus();
  }

  // Tanpa teks dan tanpa media (judul artikel yang kosong juga dianggap kosong).
  isEmpty() {
    let content = false;
    this.tiptap.state.doc.descendants((node) => {
      if (content) return false;
      if ((node.isText && node.text.trim()) || isMediaNode(node)) content = true;
      return !content;
    });
    return !content;
  }

  // Output selalu lewat sanitize(): tag whitelist, tanpa atribut, tanpa paragraf kosong.
  getHTML() {
    return this.isEmpty() ? '' : sanitize(this.tiptap.getHTML(), this._sanitizeOptions());
  }

  // Konten dari luar (database, dll.) disanitasi sebelum masuk editor.
  // Riwayat undo dimulai ulang, kecuali { resetHistory: false }.
  setHTML(html, { silent = false, resetHistory = true } = {}) {
    const doc = this._parse(sanitize(html, this._sanitizeOptions()));
    const { view } = this.tiptap;

    if (resetHistory) {
      view.updateState(EditorState.create({ doc, plugins: view.state.plugins, selection: this._startSelection(doc) }));
      this._afterUpdate({ docChanged: !silent });
    } else {
      const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
      tr.setSelection(Selection.atEnd(tr.doc));
      this._silent = silent;
      view.dispatch(tr);
      this._silent = false;
    }
  }

  // Teks polos dengan blok dipisah baris baru (untuk hitung kata, dll.).
  getText() {
    const parts = [];
    this.tiptap.state.doc.descendants((node) => {
      if (isCaption(node)) return false;
      if (node.isTextblock) {
        parts.push(node.textBetween(0, node.content.size, '\n', '\n'));
        return false;
      }
      return true;
    });
    return parts.join('\n');
  }

  stats() {
    const words = (this.getText().match(/\S+/g) || []).length;
    return { words, minutes: words ? Math.max(1, Math.round(words / 200)) : 0 };
  }

  // Sisipkan HTML di posisi kursor (disanitasi). Dipakai oleh paste & drop.
  insertHTML(html) {
    this._syncSelection();
    const clean = sanitizeToElement(html, { ...this._sanitizeOptions(), title: false });
    if (!clean.childNodes.length) return;
    if (!this.hasFocus()) this.focus();

    const { state, view } = this.tiptap;
    let content = this._parseFragment(clean.innerHTML);

    // Satu paragraf saja -> sisipkan isinya, agar tidak memecah paragraf tempat kursor berada.
    // Spasi di ujung (yang dibuang sanitize) dikembalikan agar kata tidak menempel.
    if (content.childCount === 1 && content.firstChild.type.name === 'paragraph') {
      const source = new DOMParser().parseFromString(String(html), 'text/html').body.textContent;
      let inline = content.firstChild.content;
      if (/^\s/.test(source)) inline = Fragment.from(state.schema.text(' ')).append(inline);
      if (/\s$/.test(source)) inline = inline.append(Fragment.from(state.schema.text(' ')));
      view.dispatch(state.tr.replaceSelection(new Slice(inline, 0, 0)).scrollIntoView());
      return;
    }
    content = trimTrailingEmpty(content);
    view.dispatch(state.tr.replaceSelection(Slice.maxOpen(content)).scrollIntoView());
  }

  insertText(text) {
    this._syncSelection();
    const value = String(text || '').replace(/\r\n?/g, '\n');
    if (!value) return;
    if (!value.includes('\n')) {
      // Satu baris: sisipkan apa adanya (spasi di ujung tetap terjaga).
      if (!this.hasFocus()) this.focus();
      const { state, view } = this.tiptap;
      view.dispatch(state.tr.insertText(value).scrollIntoView());
      return;
    }
    this.insertHTML(textToHtml(value));
  }

  // Fokus langsung (sinkron). Perintah focus() milik Tiptap menunda fokus ke frame berikutnya,
  // yang bisa menimpa seleksi yang dipasang sesudahnya.
  focus() {
    const { view } = this.tiptap;
    view.focus();
    view.dispatch(view.state.tr.setSelection(Selection.atEnd(view.state.doc)).scrollIntoView());
  }

  // Simpan & pulihkan seleksi, mis. saat fokus pindah ke input link.
  saveSelection() {
    if (this.hasFocus()) this._syncSelection();
    return this.hasFocus() ? this.tiptap.state.selection.toJSON() : null;
  }

  restoreSelection(saved) {
    const { view } = this.tiptap;
    view.focus();
    if (!saved) return;
    try {
      view.dispatch(view.state.tr.setSelection(Selection.fromJSON(view.state.doc, saved)));
    } catch {
      // posisi lama tidak valid lagi (isi berubah): biarkan seleksi saat ini
    }
  }

  // Posisi seleksi/kursor di layar (DOMRect), untuk menempatkan UI melayang.
  selectionRect() {
    const { view, state } = this.tiptap;
    const { from, to, empty } = state.selection;
    if (!empty && view.hasFocus()) {
      const range = getRange();
      if (range && this.el.contains(range.startContainer)) {
        const rect = range.getBoundingClientRect();
        if (rect.width || rect.height) return rect;
      }
    }
    try {
      const a = view.coordsAtPos(from);
      const b = empty ? a : view.coordsAtPos(to);
      const left = Math.min(a.left, b.left);
      return new DOMRect(left, a.top, Math.max(a.right, b.right) - left, b.bottom - a.top);
    } catch {
      return null;
    }
  }

  clear() {
    this.setHTML('', { resetHistory: false });
  }

  // Data pratinjau artikel ala Medium: gambar pertama, teks pertama (judul), dan teks kedua
  // (subjudul). Di mode artikel judul/subjudul diambil dari blok judul jika terisi.
  //   { image: { src, alt, caption } | null, title: string, subtitle: string, slug: string }
  // slug = slugify(title), hanya pratinjau: slug final tetap dibuat server.
  getMeta() {
    const texts = [];
    let image = null;
    this.tiptap.state.doc.descendants((node) => {
      if (node.type.name === 'image') {
        if (!image && node.attrs.src && !node.attrs.uploading) {
          image = { src: node.attrs.src, alt: node.attrs.alt, caption: node.textContent.trim() };
        }
        return false;
      }
      if (isCaption(node) || node.type.name === 'codeBlock') return false;
      if (node.isTextblock) {
        const text = node.textBetween(0, node.content.size, ' ', ' ').replace(/\s+/g, ' ').trim();
        if (text) texts.push(text);
        return false;
      }
    });
    const title = texts[0] || '';
    return { image, title, subtitle: texts[1] || '', slug: slugify(title) };
  }

  // ----- JSON (format dokumen ProseMirror/Tiptap) -----

  getJSON() {
    return toJSON(this.getHTML(), this._sanitizeOptions());
  }

  setJSON(doc, options) {
    this.setHTML(fromJSON(doc, this._sanitizeOptions()), options);
  }

  // ----- Autosave draf -----
  // Selama ada draf yang belum diputuskan (pulihkan/buang), autosave dijeda agar draf
  // lama tidak tertimpa.

  restoreDraft() {
    const draft = this.draft;
    if (!draft) return;
    this.draft = null;
    this.setHTML(draft.html, { resetHistory: false });
  }

  discardDraft() {
    this.draft = null;
    this.clearDraft();
    this._saveDraft();
  }

  // Hapus draf tersimpan, mis. setelah konten berhasil disimpan ke server.
  clearDraft() {
    clearTimeout(this._autosaveTimer);
    if (this._autosaveKey) storage('remove', this._autosaveKey);
  }

  // ----- Undo / redo -----

  undo() {
    if (this.readOnly) return;
    this.tiptap.view.focus();
    this.tiptap.commands.undo();
  }

  redo() {
    if (this.readOnly) return;
    this.tiptap.view.focus();
    this.tiptap.commands.redo();
  }

  canUndo() {
    return this.tiptap.can().undo();
  }

  canRedo() {
    return this.tiptap.can().redo();
  }

  // ----- Mode baca saja -----

  setReadOnly(readOnly = true) {
    this.readOnly = !!readOnly;
    this.tiptap.setEditable(!this.readOnly, false);
    this.closeSlash();
    this.emit('readonly', this.readOnly);
    this.emit('state', this.state());
    this._scheduleSelection();
  }

  // ----- Media (gambar, video, pemisah) -----

  insertImages(files) {
    return insertImageFiles(this, files);
  }

  // `target`: elemen <figure>/<hr> di editor, atau posisi node di dokumen.
  selectMedia(target) {
    if (this.readOnly) return;
    const { state, view } = this.tiptap;
    const pos = typeof target === 'number' ? target : this._posOfDOM(target);
    if (pos == null || !isMediaNode(state.doc.nodeAt(pos))) return;
    view.focus();
    view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
  }

  deselectMedia() {
    const media = this._selectedMediaNode();
    if (!media) return;
    const { state, view } = this.tiptap;
    view.dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(media.pos + media.node.nodeSize))));
  }

  // { kind: 'image' | 'embed' | 'divider', size, alt } atau null
  selectedMedia() {
    const media = this._selectedMediaNode();
    if (!media) return null;
    const { node } = media;
    return { kind: mediaKind(node), size: node.attrs.size || 'normal', alt: node.attrs.alt || '' };
  }

  setMediaSize(size) {
    this._updateMedia((node) => node.type.name !== 'horizontalRule' && { size: SIZES.includes(size) ? size : null });
  }

  setMediaAlt(alt) {
    this._updateMedia((node) => node.type.name === 'image' && { alt: String(alt || '').trim() });
  }

  removeMedia() {
    const media = this._selectedMediaNode();
    if (!media) return;
    const { state, view } = this.tiptap;
    const tr = state.tr.delete(media.pos, media.pos + media.node.nodeSize);
    const $pos = tr.doc.resolve(media.pos);
    const next = $pos.nodeAfter;
    const prev = $pos.nodeBefore;

    if (next && !isMediaNode(next)) tr.setSelection(Selection.findFrom($pos, 1, true) || Selection.near($pos));
    else if (prev && !isMediaNode(prev)) tr.setSelection(Selection.findFrom($pos, -1, true) || Selection.near($pos));
    else if (next) tr.setSelection(NodeSelection.create(tr.doc, media.pos));
    else {
      tr.insert(media.pos, state.schema.nodes.paragraph.create());
      tr.setSelection(TextSelection.create(tr.doc, media.pos + 1));
    }
    view.dispatch(tr.scrollIntoView());
  }

  // ----- Pindah blok (drag & drop, keyboard) -----

  // Blok tingkat teratas di koordinat Y layar, untuk pegangan drag.
  // { pos, rect, line: { top, height }, empty } atau null (judul/subjudul artikel tidak bisa dipindah).
  blockAt(clientY) {
    const { state, view } = this.tiptap;
    let found = null;
    state.doc.forEach((node, offset) => {
      const dom = view.nodeDOM(offset);
      if (!(dom instanceof Element)) return;
      const rect = dom.getBoundingClientRect();
      if (rect.top - 8 <= clientY) found = { node, pos: offset, rect, dom };
    });
    if (!found || found.rect.bottom + 16 < clientY) return null;
    const { node, pos, rect } = found;
    if (node.type.name === 'title' || node.type.name === 'subtitle') return null;

    // Tinggi baris pertama, agar pegangan sejajar dengan teks (bukan tengah blok yang tinggi).
    let line = { top: rect.top, height: Math.min(rect.height, 28) };
    const first = Selection.findFrom(state.doc.resolve(pos + 1), 1, true);
    if (!node.isAtom && first && first.from < pos + node.nodeSize) {
      try {
        const c = view.coordsAtPos(first.from);
        line = { top: c.top, height: c.bottom - c.top };
      } catch {
        // posisi tanpa koordinat: pakai bagian atas blok
      }
    }
    return { pos, rect, line, empty: node.type.name === 'paragraph' && !node.content.size };
  }

  selectBlock(pos) {
    const { state, view } = this.tiptap;
    if (this.readOnly || !state.doc.nodeAt(pos)) return;
    view.focus();
    view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
  }

  // Mulai menyeret blok di `pos` (dipanggil dari event dragstart pegangan). Penurunan blok
  // ditangani ProseMirror: penanda posisi, pindah dalam satu langkah undo.
  startBlockDrag(pos, event) {
    const { view } = this.tiptap;
    const { state } = view;
    if (this.readOnly || !event.dataTransfer || !state.doc.nodeAt(pos)) return;
    const selection = NodeSelection.create(state.doc, pos);
    view.dispatch(state.tr.setSelection(selection));
    const slice = selection.content();
    const { dom, text } = view.serializeForClipboard(slice);
    event.dataTransfer.clearData();
    event.dataTransfer.setData('text/html', dom.innerHTML);
    event.dataTransfer.setData('text/plain', text);
    event.dataTransfer.effectAllowed = 'copyMove';
    const blockDom = view.nodeDOM(pos);
    if (blockDom instanceof Element) event.dataTransfer.setDragImage(blockDom, 0, 0);
    view.dragging = { slice, move: true, node: selection };
  }

  endBlockDrag() {
    // Drop di luar editor: ProseMirror tidak sempat membersihkan status drag.
    setTimeout(() => {
      if (this.tiptap.view) this.tiptap.view.dragging = null;
    }, 0);
  }

  // Pindah blok tingkat teratas di posisi kursor ke atas (-1) atau ke bawah (1).
  moveBlock(dir) {
    const { state, view } = this.tiptap;
    const { doc, selection } = state;
    const index = selection.$from.index(0);
    const at = this.options.title ? titleIndex(doc) : -1;
    const min = at < 0 ? 0 : at + (doc.maybeChild(at + 1)?.type.name === 'subtitle' ? 2 : 1);
    const target = index + dir;
    if (index < min || target < min || target >= doc.childCount) return false;

    let pos = 0;
    for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize;
    const node = doc.child(index);
    const other = doc.child(target);
    const newPos = dir < 0 ? pos - other.nodeSize : pos + other.nodeSize;

    const tr = state.tr.delete(pos, pos + node.nodeSize).insert(newPos, node);
    if (selection instanceof NodeSelection) {
      tr.setSelection(NodeSelection.create(tr.doc, newPos));
    } else {
      const shift = newPos - pos;
      tr.setSelection(TextSelection.create(tr.doc, selection.from + shift, selection.to + shift));
    }
    view.dispatch(tr.scrollIntoView());
    return true;
  }

  // ----- Slash menu -----

  // Buka slash menu dari tombol "+": ketik "/" di posisi kursor.
  openSlash() {
    if (!this.hasFocus()) this.focus();
    this._syncSelection();
    this._slashDismissed = null;
    const { state, view } = this.tiptap;
    view.dispatch(state.tr.insertText('/'));
  }

  closeSlash({ dismiss = false } = {}) {
    if (dismiss) this._slashDismissed = this._slashContext()?.from ?? null;
    if (!this.slash.open) return;
    this.slash = { ...CLOSED_SLASH };
    this.emit('slash', this.slash);
  }

  setSlashIndex(index) {
    if (!this.slash.open || !this.slash.items.length) return;
    const count = this.slash.items.length;
    this.slash = { ...this.slash, index: (index + count) % count };
    this.emit('slash', this.slash);
  }

  // Terapkan item slash menu: hapus teks "/query", lalu jalankan perintahnya.
  applySlash(itemOrIndex = this.slash.index) {
    const item = typeof itemOrIndex === 'number' ? this.slash.items[itemOrIndex] : itemOrIndex;
    const context = this._slashContext();
    this.closeSlash();
    if (!item) return;

    if (context) {
      const { state, view } = this.tiptap;
      view.dispatch(state.tr.delete(context.from, context.to));
    }
    this.exec(item.command);
  }

  on(event, callback) {
    (this.listeners[event] ||= []).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.listeners[event] = (this.listeners[event] || []).filter((cb) => cb !== callback);
  }

  emit(event, payload) {
    (this.listeners[event] || []).forEach((cb) => cb(payload));
  }

  destroy() {
    this._events.forEach(([target, type, handler]) => target.removeEventListener(type, handler));
    cancelAnimationFrame(this._selectionFrame);
    clearTimeout(this._autosaveTimer);
    this._resize?.disconnect();
    cancelAnimationFrame(this._wideFrame);
    this.tiptap.destroy();
    this.listeners = {};
  }

  // Tempel secara terprogram dengan aturan yang sama seperti paste dari clipboard:
  //   editor.paste({ html: '<p>..</p>', text: '..', files: [File, ...] })
  paste({ html = '', text = '', files = [] } = {}) {
    if (this.readOnly) return;
    if (!this.hasFocus()) this.focus();
    this._syncSelection();
    const { state, view } = this.tiptap;
    const parent = state.selection.$from.parent;

    // Judul / subjudul artikel: baris pertama masuk ke sana, sisanya menjadi isi di bawahnya.
    // Gambar yang ditempel di judul menjadi gambar utama (lewat perintah image).
    const images = [...files].filter((f) => f.type.startsWith('image/'));
    if (parent.type.name === 'title' && images.length) {
      this.exec('image', images);
      return;
    }
    if (parent.type.name === 'title' || parent.type.name === 'subtitle') {
      this._pasteIntoTitle(text || new DOMParser().parseFromString(html, 'text/html').body.innerText || '');
      return;
    }

    // Blok kode & keterangan gambar: teks polos (keterangan: satu baris).
    if (parent.type.name === 'codeBlock' || (isCaption(parent) && !(state.selection instanceof NodeSelection))) {
      const value = parent.type.name === 'codeBlock' ? text.replace(/\r\n?/g, '\n') : text.replace(/\s+/g, ' ').trim();
      if (value) view.dispatch(state.tr.insertText(value).scrollIntoView());
      return;
    }

    // Gambar dari clipboard (screenshot, salin gambar). Jika HTML-nya hanya <img> ber-URL
    // dan tidak ada fungsi upload, pakai URL-nya saja (lebih ringan dari base64).
    const htmlIsOnlyImage = !html || /^\s*(<meta[^>]*>\s*)?(<!--[^]*?-->\s*)*<img[^>]*>\s*(<!--[^]*?-->\s*)*$/i.test(html);
    if (files.length && htmlIsOnlyImage && !this.options.pasteAsPlainText) {
      const httpImage = html && /<img[^>]*src=["']?https?:/i.test(html);
      if (httpImage && !this.options.upload) this.insertHTML(html);
      else this.insertImages(files);
      return;
    }

    if (this._pasteUrl(text, html)) return;

    if (html && !this.options.pasteAsPlainText) this.insertHTML(html);
    else if (text) this.insertText(text);
  }

  // ---------- Internal ----------

  _setup(content) {
    const el = this.el;
    const options = this.options;
    el.innerHTML = '';
    el.dataset.afwPlaceholder = options.placeholder ?? this.strings.placeholder;

    const behavior = Extension.create({
      name: 'afwBehavior',
      addCommands: () => ({ insertMediaBlock }),
      addInputRules() {
        return options.markdown ? markdownRules(this.editor.schema, options.headings) : [];
      },
      addProseMirrorPlugins: () => [
        decorationsPlugin(),
        trailingParagraphPlugin(),
        ...(options.title ? [titlePlugin(this.strings)] : []),
      ],
    });

    this.tiptap = new TiptapEditor({
      element: { mount: el },
      extensions: [
        ...createExtensions({
          allowDataImages: options.allowDataImages,
          captionPlaceholder: this.strings.captionPlaceholder,
          headings: options.headings,
          title: options.title,
        }),
        behavior,
        UndoRedo.configure({ depth: options.historyLimit, newGroupDelay: 1000 }),
        Gapcursor,
        Dropcursor.configure({ color: false, class: 'afw-dropcursor' }),
      ],
      content: this._initialHTML(content),
      injectCSS: false,
      enableInputRules: ['afwBehavior'],
      enablePasteRules: false,
      editorProps: {
        attributes: (state) => this._viewAttributes(state),
        handleKeyDown: (view, e) => this._handleKeydown(e),
        // Mengetik saat media terpilih tidak mengganti media.
        handleTextInput: () => !!this._selectedMediaNode(),
        handlePaste: (view, e) => this._handlePaste(e),
        handleDrop: (view, e, slice, moved) => this._handleDrop(e, moved),
        handleClickOn: (view, pos, node, nodePos, e) => this._handleClickOn(node, nodePos, e),
        handleClick: (view, pos, e) => this._handleClick(e),
        transformPastedHTML: (html) => sanitize(html, { ...this._sanitizeOptions(), title: false }),
      },
    });
    this.tiptap.on('transaction', ({ transaction }) => this._afterUpdate(transaction));
    if (options.title) {
      const { state, view } = this.tiptap;
      view.updateState(state.apply(state.tr.setSelection(this._startSelection(state.doc)).setMeta('addToHistory', false)));
    }

    if (options.readonly) this.setReadOnly(true);
    this._setupAutosave();

    // Mode artikel: label "Judul/Subjudul" di margin kiri hanya jika editor cukup lebar.
    // Atribut ini tidak dikelola ProseMirror, jadi aman dipasang langsung.
    if (options.title && typeof ResizeObserver !== 'undefined') {
      // Lebar luar (border box): padding yang bertambah saat label tampil tidak boleh
      // memengaruhi keputusan, agar label tidak menyala-padam di sekitar ambang batas.
      // Diterapkan di frame berikutnya (di luar callback) karena tinggi editor ikut berubah.
      this._resize = new ResizeObserver(([entry]) => {
        const wide = (entry.borderBoxSize?.[0]?.inlineSize ?? el.offsetWidth) >= 640;
        cancelAnimationFrame(this._wideFrame);
        this._wideFrame = requestAnimationFrame(() => {
          if (wide !== el.hasAttribute('data-afw-wide')) el.toggleAttribute('data-afw-wide', wide);
        });
      });
      this._resize.observe(el, { box: 'border-box' });
    }

    this._events = [
      [el, 'focus', () => {
        // Seleksi yang dipasang lewat script tepat setelah focus() langsung dibaca; tanpa ini
        // ProseMirror bisa mengembalikan kursor ke posisi lamanya.
        queueMicrotask(() => this._syncSelection());
        this.emit('focus');
        this.emit('state', this.state());
        this._scheduleSelection();
      }],
      [el, 'blur', () => {
        this.closeSlash();
        this.emit('blur');
        this.emit('state', this.state());
        this._scheduleSelection();
      }],
      // Selama mouse ditekan (sedang memblok teks), bubble belum ditampilkan.
      [el, 'mousedown', () => (this._pointerDown = true)],
      [document, 'mouseup', () => {
        if (!this._pointerDown) return;
        this._pointerDown = false;
        this._scheduleSelection();
      }],
    ];
    this._events.forEach(([target, type, handler]) => target.addEventListener(type, handler));
  }

  _initialHTML(content) {
    return withTitle(sanitize(content, this._sanitizeOptions()) || '<p></p>', this.options.title);
  }

  _parse(html) {
    const doc = createDocument(withTitle(html || '<p></p>', this.options.title), this.tiptap.schema);
    // Selalu ada paragraf setelah media terakhir agar kursor bisa diletakkan di sana.
    if (isMediaNode(doc.lastChild)) {
      return doc.copy(doc.content.append(Fragment.from(this.tiptap.schema.nodes.paragraph.create())));
    }
    return doc;
  }

  // Kursor awal: di awal dokumen, atau di judul artikel (bukan keterangan gambar utama).
  _startSelection(doc) {
    if (!this.options.title || !titleIndex(doc)) return Selection.atStart(doc);
    return TextSelection.create(doc, titlePos(doc) + 1);
  }

  // Isi HTML sebagai fragment blok biasa (tanpa judul kosong yang disisipkan schema artikel).
  _parseFragment(html) {
    const content = this._parse(html).content;
    if (!this.options.title) return content;
    let start = 0;
    content.forEach((node, offset) => {
      if ((node.type.name === 'title' || node.type.name === 'subtitle') && offset === start) start += node.nodeSize;
    });
    return content.cut(start);
  }

  _pasteIntoTitle(text) {
    const { state, view } = this.tiptap;
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const first = lines.shift().replace(/\s+/g, ' ');
    const rest = lines.join('\n').trim();
    const tr = state.tr.insertText(first);
    if (rest) {
      // Sisanya disisipkan setelah judul (dan subjudul, jika ada).
      let after = 0;
      const at = titleIndex(tr.doc);
      for (let i = 0; i <= at; i++) after += tr.doc.child(i).nodeSize;
      if (tr.doc.maybeChild(at + 1)?.type.name === 'subtitle') after += tr.doc.child(at + 1).nodeSize;
      const content = this._parseFragment(sanitize(textToHtml(rest), { ...this._sanitizeOptions(), title: false }));
      tr.insert(after, content);
      tr.setSelection(Selection.near(tr.doc.resolve(after + content.size - 1), -1));
    }
    view.dispatch(tr.scrollIntoView());
  }

  // Enter / Backspace / Delete di sekitar judul & subjudul artikel. Mengembalikan true jika ditangani.
  _handleTitleKey(e) {
    if (!this.options.title || e.ctrlKey || e.metaKey || e.altKey) return false;
    const { state, view } = this.tiptap;
    const { selection, schema } = state;
    if (!selection.empty || selection.$from.depth !== 1) return false;
    const { $from } = selection;
    const parent = $from.parent;
    const type = parent.type.name;
    const index = $from.index(0);
    const atStart = $from.parentOffset === 0;
    const atEnd = $from.parentOffset === parent.content.size;
    const start = $from.before();
    const end = $from.after();
    const next = state.doc.maybeChild(index + 1);

    if (e.key === 'Enter' && (type === 'title' || type === 'subtitle')) {
      // Judul diikuti subjudul: pindah ke awal subjudul.
      if (type === 'title' && next?.type.name === 'subtitle') {
        view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, end + 1)));
        return true;
      }
      // Teks setelah kursor pindah ke paragraf baru tepat di bawahnya.
      const tail = parent.content.cut($from.parentOffset);
      const tr = state.tr.delete($from.pos, end - 1);
      const at = tr.mapping.map(end);
      tr.insert(at, schema.nodes.paragraph.create(null, tail.size ? schema.text(parent.textBetween($from.parentOffset, parent.content.size)) : null));
      tr.setSelection(TextSelection.create(tr.doc, at + 1));
      view.dispatch(tr.scrollIntoView());
      return true;
    }

    if (e.key === 'Delete' && atEnd && (type === 'title' || type === 'subtitle')) {
      // Hanya paragraf kosong di bawahnya yang ikut terhapus; isi lain tidak digabung ke judul.
      const nextIsBody = next && !(type === 'title' && next.type.name === 'subtitle');
      if (nextIsBody && next.type.name === 'paragraph' && !next.content.size && state.doc.childCount > index + 2) {
        view.dispatch(state.tr.delete(end, end + next.nodeSize));
      }
      return true;
    }

    if (e.key !== 'Backspace' || !atStart || index === 0) return false;
    const prev = state.doc.child(index - 1);
    if (!['title', 'subtitle'].includes(prev.type.name) || !parent.isTextblock) return false;

    // Backspace di awal blok setelah judul/subjudul: teksnya (polos) bergabung ke atas.
    const prevEnd = start - 1;
    const tr = state.tr;
    const isOnlyBody = type !== 'subtitle' && state.doc.childCount === index + 1;
    if (isOnlyBody) tr.replaceWith(start, end, schema.nodes.paragraph.create());
    else tr.delete(start, end);
    if (parent.textContent) tr.insertText(parent.textContent, prevEnd);
    tr.setSelection(TextSelection.create(tr.doc, prevEnd));
    view.dispatch(tr.scrollIntoView());
    return true;
  }

  _viewAttributes(state) {
    const classes = ['afw-content'];
    if (isDocEmpty(state.doc)) classes.push('afw-is-empty');
    if (this.readOnly) classes.push('afw-is-readonly');
    return {
      class: classes.join(' '),
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': this.options.label || this.strings.editorLabel,
      'aria-readonly': String(this.readOnly),
    };
  }

  _afterUpdate(tr) {
    if (tr.docChanged) {
      this._scheduleDraftSave();
      if (!this._silent) this.emit('change', this.getHTML());
    }
    this._emitHistory();
    this._updateSlash();
    this.emit('state', this.state());
    this._scheduleSelection();
  }

  _setupAutosave() {
    const option = this.options.autosave;
    if (!option) return;
    const { key, delay = 1000 } = typeof option === 'string' ? { key: option } : option;
    this._autosaveKey = `afw:draft:${key}`;
    this._autosaveDelay = delay;
    this.draft = null;

    try {
      const saved = JSON.parse(storage('get', this._autosaveKey) || 'null');
      if (saved?.html && saved.html !== this.getHTML()) this.draft = saved;
    } catch {
      // draf rusak: abaikan
    }
  }

  _scheduleDraftSave() {
    if (!this._autosaveKey || this.draft) return;
    clearTimeout(this._autosaveTimer);
    this._autosaveTimer = setTimeout(() => this._saveDraft(), this._autosaveDelay);
  }

  _saveDraft() {
    if (!this._autosaveKey || this.draft) return;
    const html = this.getHTML();
    if (html) storage('set', this._autosaveKey, JSON.stringify({ html, time: Date.now() }));
    else storage('remove', this._autosaveKey);
  }

  _sanitizeOptions() {
    return { allowDataImages: this.options.allowDataImages, headings: this.options.headings, title: this.options.title };
  }

  // Item slash menu: judul hanya untuk level yang aktif.
  _blocks() {
    // Hanya blok yang berlaku di posisi kursor (mis. di judul artikel: gambar, video, pemisah).
    return this.options.blocks.filter((b) =>
      (!/^h[2-6]$/.test(b.command) || this.options.headings.includes(Number(b.command[1]))) && !this.isDisabled(b.command));
  }

  // Baca seleksi DOM sekarang juga. ProseMirror biasanya membacanya dari event
  // selectionchange, yang bisa datang terlambat jika tombol ditekan sangat cepat
  // (mis. Shift+Panah lalu langsung Ctrl+B).
  _syncSelection() {
    const observer = this.tiptap.view.domObserver;
    if (!observer || this.tiptap.isDestroyed) return;
    observer.forceFlush();
    observer.flush();
  }

  _emitHistory() {
    const value = { canUndo: this.canUndo(), canRedo: this.canRedo() };
    if (this._history?.canUndo === value.canUndo && this._history?.canRedo === value.canRedo) return;
    this._history = value;
    this.emit('history', value);
  }

  // ----- Media -----

  _selectedMediaNode() {
    const { selection } = this.tiptap.state;
    return selection instanceof NodeSelection && isMediaNode(selection.node)
      ? { node: selection.node, pos: selection.from }
      : null;
  }

  _updateMedia(getAttrs) {
    const media = this._selectedMediaNode();
    const attrs = media && getAttrs(media.node);
    if (!attrs) return;
    const { state, view } = this.tiptap;
    const tr = state.tr.setNodeMarkup(media.pos, null, { ...media.node.attrs, ...attrs });
    tr.setSelection(NodeSelection.create(tr.doc, media.pos));
    view.focus();
    view.dispatch(tr);
  }

  // Posisi node tingkat teratas yang DOM-nya `dom`.
  _posOfDOM(dom) {
    const { view, state } = this.tiptap;
    let found = null;
    state.doc.forEach((node, offset) => {
      if (found === null && view.nodeDOM(offset) === dom) found = offset;
    });
    return found;
  }

  _handleClickOn(node, nodePos, e) {
    if (this.readOnly || !isMediaNode(node) || e.target.closest?.('figcaption')) return false;
    const { state, view } = this.tiptap;
    view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, nodePos)));
    return true;
  }

  _handleClick(e) {
    if (this.readOnly || e.target !== this.el) return false;
    return this._clickGap(e.clientY);
  }

  // Klik di celah antar blok yang bersebelahan dengan media (mis. pemisah langsung diikuti
  // kutipan) -> buat paragraf kosong di sana, karena kursor tidak bisa diletakkan di celah itu.
  _clickGap(y) {
    const { state, view } = this.tiptap;
    const blocks = [];
    state.doc.forEach((node, offset) => blocks.push({ node, offset, rect: view.nodeDOM(offset)?.getBoundingClientRect() }));

    const index = blocks.findIndex((b) => b.rect && b.rect.bottom >= y);
    const after = blocks[index];
    if (after && after.rect.top <= y) return false; // di dalam blok, bukan celah
    const before = index === -1 ? blocks[blocks.length - 1] : blocks[index - 1];
    if (!isMediaNode(before?.node) && !isMediaNode(after?.node)) return false;

    this._insertParagraphAt(after ? after.offset : state.doc.content.size);
    return true;
  }

  // Keyboard saat media terpilih. Mengembalikan true jika ditangani.
  _handleMediaKey(e, media) {
    const key = e.key;
    if (key === 'Backspace' || key === 'Delete') {
      this.removeMedia();
      return true;
    }
    if (key === 'Enter') {
      this._insertParagraphAt(media.pos + media.node.nodeSize);
      return true;
    }
    if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Escape'].includes(key)) {
      this._moveFromMedia(media, ['ArrowUp', 'ArrowLeft'].includes(key) ? -1 : 1);
      return true;
    }
    // Mengetik saat media terpilih tidak mengganti media.
    return key.length === 1 && !e.ctrlKey && !e.metaKey;
  }

  _moveFromMedia({ node, pos }, dir) {
    const { state, view } = this.tiptap;
    const edge = dir < 0 ? pos : pos + node.nodeSize;
    const $edge = state.doc.resolve(edge);
    const target = dir < 0 ? $edge.nodeBefore : $edge.nodeAfter;

    if (isMediaNode(target)) {
      view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, dir < 0 ? edge - target.nodeSize : edge)));
    } else if (target) {
      view.dispatch(state.tr.setSelection(Selection.findFrom($edge, dir, true) || Selection.near($edge, dir)).scrollIntoView());
    } else {
      this._insertParagraphAt(edge);
    }
  }

  _insertParagraphAt(pos) {
    const { state, view } = this.tiptap;
    // Di atas judul artikel tidak boleh ada teks: pindah ke judul saja.
    if (state.doc.nodeAt(pos)?.type.name === 'title') {
      view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos + 1)).scrollIntoView());
      return;
    }
    const tr = state.tr.insert(pos, state.schema.nodes.paragraph.create());
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));
    view.dispatch(tr.scrollIntoView());
  }

  // Kursor di keterangan gambar, atau di tepi blok yang bersebelahan dengan media.
  _handleKeyNearMedia(e) {
    const { state, view } = this.tiptap;
    const { selection } = state;
    if (!selection.empty) return false;
    const { $from } = selection;
    const parent = $from.parent;
    const atStart = $from.parentOffset === 0;
    const atEnd = $from.parentOffset === parent.content.size;

    if (isCaption(parent)) {
      // Enter di keterangan -> lanjut ke paragraf setelah gambar.
      if (e.key === 'Enter') {
        const after = $from.after();
        const next = state.doc.nodeAt(after);
        if (next && !isMediaNode(next)) {
          view.dispatch(state.tr.setSelection(Selection.findFrom(state.doc.resolve(after), 1, true)).scrollIntoView());
        } else {
          this._insertParagraphAt(after);
        }
        return true;
      }
      // Keterangan tidak boleh tergabung dengan blok di sekitarnya.
      return (e.key === 'Backspace' && atStart) || (e.key === 'Delete' && atEnd);
    }

    // Backspace di awal paragraf setelah media / Delete di akhir paragraf sebelum media
    // -> pilih media itu dulu (bukan langsung menghapus).
    if ($from.depth !== 1 || !parent.isTextblock) return false;
    const back = e.key === 'Backspace' && atStart;
    const forward = e.key === 'Delete' && atEnd;
    if (!back && !forward) return false;

    const $block = state.doc.resolve(back ? $from.before() : $from.after());
    const media = back ? $block.nodeBefore : $block.nodeAfter;
    if (!isMediaNode(media)) return false;

    const tr = state.tr;
    let mediaPos = back ? $block.pos - media.nodeSize : $block.pos;
    if (parent.type.name === 'paragraph' && parent.content.size === 0) {
      tr.delete($from.before(), $from.after());
      if (forward) mediaPos -= parent.nodeSize;
    }
    tr.setSelection(NodeSelection.create(tr.doc, mediaPos));
    view.dispatch(tr);
    return true;
  }

  // Enter / Tab di blok kode. Mengembalikan true jika ditangani.
  _handleCodeKey(e) {
    const { state, view } = this.tiptap;
    const { $from, from, to, empty } = state.selection;
    if ($from.parent.type.name !== 'codeBlock' || e.ctrlKey || e.metaKey || e.altKey) return false;
    const text = $from.parent.textContent;
    const start = $from.start();

    if (e.key === 'Enter') {
      // Enter di baris kosong terakhir -> keluar dari blok kode.
      if (empty && $from.parentOffset === text.length && text.endsWith('\n')) {
        const tr = state.tr.delete(from - 1, from);
        const after = tr.mapping.map($from.after());
        tr.insert(after, state.schema.nodes.paragraph.create());
        tr.setSelection(TextSelection.create(tr.doc, after + 1));
        view.dispatch(tr.scrollIntoView());
      } else {
        view.dispatch(state.tr.insertText('\n', from, to).scrollIntoView());
      }
      return true;
    }

    if (e.key === 'Tab') {
      if (!e.shiftKey) {
        view.dispatch(state.tr.insertText(CODE_INDENT, from, to));
      } else {
        const lineStart = start + text.lastIndexOf('\n', $from.parentOffset - 1) + 1;
        const offset = lineStart - start;
        const remove = text.slice(offset, offset + CODE_INDENT.length).match(/^ */)[0].length;
        if (remove) view.dispatch(state.tr.delete(lineStart, lineStart + remove));
      }
      return true;
    }
    return false;
  }

  _handleKeydown(e) {
    if (this.readOnly) return false;
    this._syncSelection();
    const { state } = this.tiptap;

    const media = this._selectedMediaNode();
    if (media) return this._handleMediaKey(e, media);

    if (this._handleKeyNearMedia(e)) return true;

    // Navigasi slash menu (juga di judul artikel, jadi sebelum tombol khusus judul).
    if (this.slash.open && !e.shiftKey) {
      const keys = {
        ArrowDown: () => this.setSlashIndex(this.slash.index + 1),
        ArrowUp: () => this.setSlashIndex(this.slash.index - 1),
        Enter: () => this.slash.items.length && this.applySlash(),
        Tab: () => this.slash.items.length && this.applySlash(),
        Escape: () => this.closeSlash({ dismiss: true }),
      };
      if (keys[e.key]) {
        keys[e.key]();
        return true;
      }
    }

    if (this._handleTitleKey(e)) return true;
    if (this._handleCodeKey(e)) return true;

    // Ctrl/Cmd+Shift+Panah atas/bawah: pindah blok.
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      this.moveBlock(e.key === 'ArrowUp' ? -1 : 1);
      return true;
    }

    // Enter di judul/kutipan kosong -> kembali menjadi paragraf.
    const parent = state.selection.$from.parent;
    if (e.key === 'Enter' && !e.shiftKey && state.selection.empty && ['heading', 'blockquote'].includes(parent.type.name) && !parent.content.size) {
      this.tiptap.commands.setNode('paragraph');
      return true;
    }

    // Tab / Shift+Tab di dalam list = naik/turun tingkat. Di luar list, Tab dibiarkan
    // (untuk pindah fokus, penting bagi pengguna keyboard).
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (!this.tiptap.isActive('listItem')) return false;
      this.exec(e.shiftKey ? 'outdent' : 'indent');
      return true;
    }

    if (!(e.ctrlKey || e.metaKey)) return false;
    const shortcut = SHORTCUTS.find(
      (s) => s.code === e.code && !!s.alt === e.altKey && !!s.shift === e.shiftKey,
    );
    if (!shortcut) return false;
    this.exec(shortcut.command);
    return true;
  }

  _handlePaste(e) {
    const data = e.clipboardData;
    if (!data || this.readOnly) return false;
    this.paste({
      html: data.getData('text/html'),
      text: data.getData('text/plain'),
      files: [...(data.files || [])],
    });
    return true;
  }

  // Tempel satu URL:
  //  - ada teks terseleksi            -> jadikan link
  //  - di paragraf kosong, link video -> embed
  _pasteUrl(text, html) {
    const url = text.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return false;
    if (html && !/^\s*(<meta[^>]*>\s*)?<a [^>]*>[^<]*<\/a>\s*$/i.test(html) && html.replace(/<[^>]+>/g, '').trim() !== url) return false;

    const { selection } = this.tiptap.state;
    if (!selection.empty && !this.tiptap.isActive('link')) {
      this.exec('link', url);
      return true;
    }

    const { $from } = selection;
    const isEmptyParagraph = $from.depth === 1 && $from.parent.type.name === 'paragraph' && !$from.parent.content.size;
    const embed = isEmptyParagraph && parseEmbed(url);
    if (embed) {
      this.tiptap.commands.insertMediaBlock({ type: 'embed', attrs: { provider: embed.provider, id: embed.id } });
      return true;
    }
    return false;
  }

  // Drop dari luar editor (file, HTML, teks) ditangani dengan aturan yang sama seperti paste.
  // Memindah isi di dalam editor sendiri dibiarkan ke ProseMirror.
  _handleDrop(e, moved) {
    if (this.readOnly) return true;
    if (moved) return false;
    const data = e.dataTransfer;
    const html = data?.getData('text/html') || '';
    const text = data?.getData('text/plain') || '';
    const files = [...(data?.files || [])];
    if (!html && !text && !files.length) return false;

    const { state, view } = this.tiptap;
    const target = view.posAtCoords({ left: e.clientX, top: e.clientY });
    view.focus();
    if (target) view.dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(target.pos))));

    if (files.length) this.insertImages(files);
    else if (html && !this.options.pasteAsPlainText) this.insertHTML(html);
    else this.insertText(text);
    return true;
  }

  // Teks dari awal paragraf sampai kursor, jika kursor di akhir paragraf tingkat teratas.
  _slashContext() {
    const { selection } = this.tiptap.state;
    if (!selection.empty) return null;
    const { $from } = selection;
    const parent = $from.parent;
    if ($from.depth !== 1 || !['paragraph', 'title'].includes(parent.type.name) || $from.parentOffset !== parent.content.size) return null;
    return { from: $from.start(), to: $from.pos, text: parent.textContent };
  }

  _updateSlash() {
    if (!this.options.slash) return;

    const context = this.hasFocus() ? this._slashContext() : null;
    const match = context?.text.match(/^\/([^\s/]{0,24})$/);

    if (!match) {
      this._slashDismissed = null;
      return this.closeSlash();
    }
    if (this._slashDismissed === context.from) return;

    const query = match[1];
    const items = filterBlocks(query, this._blocks(), this.strings);
    const sameQuery = this.slash.open && this.slash.query === query;

    this.slash = {
      open: true,
      query,
      items,
      index: sameQuery ? Math.min(this.slash.index, Math.max(items.length - 1, 0)) : 0,
      rect: this.selectionRect(),
    };
    this.emit('slash', this.slash);
  }

  // Info seleksi untuk UI, dikirim paling banyak sekali per frame.
  _scheduleSelection() {
    if (!this.listeners.selection?.length) return;
    cancelAnimationFrame(this._selectionFrame);
    this._selectionFrame = requestAnimationFrame(() => this.emit('selection', this._selectionInfo()));
  }

  _selectionInfo() {
    if (!this.hasFocus()) return { inside: false };
    const { state, view } = this.tiptap;

    const media = this._selectedMediaNode();
    if (media) {
      return {
        inside: true,
        collapsed: false,
        dragging: !!this._pointerDown,
        media: { ...this.selectedMedia(), rect: view.nodeDOM(media.pos).getBoundingClientRect() },
      };
    }

    const { $from, empty } = state.selection;
    const parent = $from.parent;
    const anchor = closestInRoot(this.el, 'a');
    // Baris kosong mendapat tombol "+"; juga judul artikel kosong (untuk media di atas judul).
    const isEmptyParagraph = $from.depth === 1 && !parent.content.size && ['paragraph', 'title'].includes(parent.type.name);

    return {
      inside: true,
      inCode: parent.type.name === 'codeBlock',
      collapsed: empty,
      dragging: !!this._pointerDown,
      rect: this.selectionRect(),
      link: anchor ? { href: anchor.getAttribute('href'), rect: anchor.getBoundingClientRect() } : null,
      emptyBlock: isEmptyParagraph ? { rect: view.nodeDOM($from.before()).getBoundingClientRect() } : null,
    };
  }
}

// Penanda visual: media terpilih (afw-is-selected) dan gambar yang keterangannya sedang
// diedit (afw-is-editing; keterangan kosong hanya tampil saat itu).
function decorationsPlugin() {
  return new Plugin({
    props: {
      decorations(state) {
        const { selection } = state;
        const decorations = [];
        if (selection instanceof NodeSelection && isMediaNode(selection.node)) {
          decorations.push(Decoration.node(selection.from, selection.to, { class: 'afw-is-selected' }));
        } else if (isCaption(selection.$from.parent)) {
          decorations.push(Decoration.node(selection.$from.before(), selection.$from.after(), { class: 'afw-is-editing' }));
        }
        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
}

// Mode artikel: placeholder & label (data-label) untuk judul, subjudul, dan paragraf isi pertama
// selama isi masih kosong.
function titlePlugin(strings) {
  return new Plugin({
    props: {
      decorations(state) {
        const { doc } = state;
        const decorations = [];
        const add = (pos, node, attrs) => decorations.push(Decoration.node(pos, pos + node.nodeSize, attrs));
        const empty = (node) => (node.content.size ? {} : { class: 'afw-is-empty' });

        const at = titleIndex(doc);
        let pos = titlePos(doc);
        const title = doc.child(at);
        add(pos, title, { ...empty(title), 'data-placeholder': strings.titlePlaceholder, 'data-label': strings.titleLabel });
        pos += title.nodeSize;

        const second = doc.maybeChild(at + 1);
        const hasSubtitle = second?.type.name === 'subtitle';
        if (hasSubtitle) {
          add(pos, second, { ...empty(second), 'data-placeholder': strings.subtitlePlaceholder, 'data-label': strings.subtitleLabel });
          pos += second.nodeSize;
        }

        const body = doc.maybeChild(at + (hasSubtitle ? 2 : 1));
        if (body?.type.name === 'paragraph' && !body.content.size && doc.lastChild === body) {
          add(pos, body, { class: 'afw-is-empty', 'data-placeholder': strings.placeholder });
        }
        return DecorationSet.create(doc, decorations);
      },
    },
  });
}

// Selalu ada paragraf setelah media terakhir agar kursor bisa diletakkan di sana.
function trailingParagraphPlugin() {
  return new Plugin({
    appendTransaction(transactions, oldState, state) {
      if (!transactions.some((tr) => tr.docChanged) || !isMediaNode(state.doc.lastChild)) return null;
      return state.tr.insert(state.doc.content.size, state.schema.nodes.paragraph.create());
    },
  });
}

// Paragraf kosong di akhir hasil parse tidak ikut disisipkan.
function trimTrailingEmpty(fragment) {
  let content = fragment;
  while (content.childCount > 1 && content.lastChild.type.name === 'paragraph' && !content.lastChild.content.size) {
    content = content.cut(0, content.size - content.lastChild.nodeSize);
  }
  return content;
}

function getRange() {
  const sel = window.getSelection();
  return sel && sel.rangeCount ? sel.getRangeAt(0) : null;
}

// Elemen terdekat (dari posisi kursor DOM) yang cocok dengan selector, dibatasi di dalam root.
function closestInRoot(root, selector) {
  const range = getRange();
  if (!range || !root.contains(range.startContainer)) return null;
  let node = range.startContainer;
  if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;
  const found = node?.closest(selector);
  return found && found !== root && root.contains(found) ? found : null;
}

// localStorage bisa tidak tersedia (mode privat, kuota penuh, dll.): jangan sampai error.
function storage(action, key, value) {
  try {
    if (action === 'get') return window.localStorage.getItem(key);
    if (action === 'set') window.localStorage.setItem(key, value);
    if (action === 'remove') window.localStorage.removeItem(key);
  } catch {
    return null;
  }
  return null;
}
