// Inti editor. Tidak bergantung pada Alpine sehingga bisa dipakai mandiri:
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
//   draft        ({html, time}) ada draf autosave yang berbeda dari isi saat ini
//   focus / blur

import { getStrings } from '../i18n.js';
import { BLOCKS, filterBlocks } from './blocks.js';
import { History, restoreSerializedSelection, serializeSelection } from './history.js';
import { fromJSON, toJSON } from './model.js';
import { COMMANDS } from './commands.js';
import { cleanLive } from './cleanup.js';
import { handleCodeKey, inCodeBlock, normalizeCodeBlocks, replaceInCode } from './codeblock.js';
import { parseEmbed } from './embed.js';
import { applyBlockShortcut, applyInlineShortcut } from './markdown.js';
import {
  createEmbedFigure,
  emptyParagraph,
  insertImageFiles,
  insertMediaBlock,
  isMediaNode,
  mediaKind,
  placeCaretIn,
  prepareMedia,
  setMediaSize,
  topBlockAtCaret,
} from './media.js';
import { sanitize, sanitizeToElement, textToHtml } from './sanitize.js';
import {
  closestInRoot,
  getRange,
  isSelectionInside,
  placeCaretAtEnd,
  restoreSelection,
  saveSelection,
} from './selection.js';

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
  blocks: BLOCKS, // isi slash menu
  upload: null, // async (file) => url gambar; tanpa ini gambar disimpan sebagai data URL (base64)
  maxImageSize: 5 * 1024 * 1024, // byte; 0 = tanpa batas
  allowDataImages: true, // izinkan <img src="data:image/..."> di output
};

const EMPTY_PARAGRAPH = '<p><br></p>';
const CLOSED_SLASH = { open: false, query: '', items: [], index: 0, rect: null };

// Shortcut keyboard. Mod = Ctrl (Windows/Linux) atau Cmd (macOS).
const SHORTCUTS = [
  { code: 'KeyB', command: 'bold' },
  { code: 'KeyI', command: 'italic' },
  { code: 'KeyK', command: 'link' },
  { code: 'Digit0', alt: true, command: 'paragraph' },
  { code: 'Digit2', alt: true, command: 'h2' },
  { code: 'Digit3', alt: true, command: 'h3' },
  { code: 'Digit7', shift: true, command: 'ol' },
  { code: 'Digit8', shift: true, command: 'ul' },
  { code: 'Digit9', shift: true, command: 'quote' },
  { code: 'KeyC', alt: true, command: 'codeblock' },
];

export class Editor {
  constructor(el, options = {}) {
    if (!el) throw new Error('[wyswyg] Elemen editor tidak ditemukan.');

    this.el = el;
    this.options = { ...DEFAULTS, ...options };
    this.strings = getStrings(this.options.lang, this.options.strings);
    this.history = new History({ limit: this.options.historyLimit });
    this.readOnly = false;
    this.listeners = {};
    this.commands = COMMANDS;
    this.slash = { ...CLOSED_SLASH };

    this._setup();
  }

  // ---------- API publik ----------

  exec(name, ...args) {
    if (this.readOnly) return;
    if (name === 'undo' || name === 'redo') return this[name]();

    const command = this.commands[name];
    if (!command) return console.warn(`[wyswyg] Perintah tidak dikenal: ${name}`);

    if (!isSelectionInside(this.el)) {
      this.el.focus();
      placeCaretAtEnd(this.el);
    }

    this._applyBrowserDefaults();
    command.run(this, ...args);
    this._handleChange();
  }

  isActive(name) {
    if (!isSelectionInside(this.el)) return false;
    try {
      return !!this.commands[name]?.active(this);
    } catch {
      return false;
    }
  }

  state() {
    return Object.fromEntries(Object.keys(this.commands).map((name) => [name, this.isActive(name)]));
  }

  isEmpty() {
    return this.el.textContent.trim() === '' && !this.el.querySelector('img, hr, iframe, li');
  }

  // Output selalu lewat sanitize(): tag whitelist, tanpa atribut, tanpa paragraf kosong.
  getHTML() {
    return this.isEmpty() ? '' : sanitize(this.el.innerHTML, this._sanitizeOptions());
  }

  // Konten dari luar (database, dll.) disanitasi sebelum masuk editor.
  // Riwayat undo dimulai ulang, kecuali { resetHistory: false }.
  setHTML(html, { silent = false, resetHistory = true } = {}) {
    this._clearMediaSelection();
    this.el.innerHTML = sanitize(html, this._sanitizeOptions()) || EMPTY_PARAGRAPH;
    this._prepareMedia();
    this._updatePlaceholder();
    if (resetHistory) {
      this.history.reset(this._snapshot());
      this._emitHistory();
    } else {
      this._record();
    }
    if (!silent) this.emit('change', this.getHTML());
  }

  // Teks polos dengan blok dipisah baris baru (untuk hitung kata, dll.).
  getText() {
    return [...this.el.querySelectorAll('p, h2, h3, blockquote, li, pre')]
      .filter((block) => !block.querySelector('p, li'))
      .map((block) => block.textContent)
      .join('\n')
      .replace(/​/g, '');
  }

  stats() {
    const words = (this.getText().match(/\S+/g) || []).length;
    return { words, minutes: words ? Math.max(1, Math.round(words / 200)) : 0 };
  }

  // Sisipkan HTML di posisi kursor (disanitasi). Dipakai oleh paste & drop.
  insertHTML(html) {
    const clean = sanitizeToElement(html, this._sanitizeOptions());
    if (!clean.childNodes.length) return;

    // Satu paragraf saja -> sisipkan isinya, agar tidak memecah paragraf tempat kursor berada.
    // Spasi di ujung (yang dibuang sanitize) dikembalikan agar kata tidak menempel.
    const only = clean.children.length === 1 ? clean.firstElementChild : null;
    let markup = clean.innerHTML;
    if (only && only.tagName === 'P') {
      const source = new DOMParser().parseFromString(String(html), 'text/html').body.textContent;
      // &nbsp;: Safari membuang spasi biasa di ujung HTML yang disisipkan.
      markup = (/^\s/.test(source) ? '&nbsp;' : '') + only.innerHTML + (/\s$/.test(source) ? '&nbsp;' : '');
    }

    if (!isSelectionInside(this.el)) this.focus();
    this._applyBrowserDefaults();
    document.execCommand('insertHTML', false, markup);
    this._handleChange();
  }

  insertText(text) {
    const value = String(text || '').replace(/\r\n?/g, '\n');
    if (!value.includes('\n')) {
      // Satu baris: sisipkan apa adanya (spasi di ujung tetap terjaga).
      if (!isSelectionInside(this.el)) this.focus();
      document.execCommand('insertText', false, value);
      this._handleChange();
      return;
    }
    this.insertHTML(textToHtml(value));
  }

  focus() {
    this.el.focus();
    placeCaretAtEnd(this.el);
  }

  // Simpan & pulihkan seleksi, mis. saat fokus pindah ke input link.
  saveSelection() {
    return isSelectionInside(this.el) ? saveSelection() : null;
  }

  restoreSelection(range) {
    this.el.focus({ preventScroll: true });
    if (range) restoreSelection(range);
  }

  // Posisi seleksi/kursor di layar (DOMRect), untuk menempatkan UI melayang.
  selectionRect() {
    const range = getRange();
    return range && this.el.contains(range.startContainer) ? rangeRect(range) : null;
  }

  clear() {
    this.setHTML('', { resetHistory: false });
  }

  // ----- JSON -----

  getJSON() {
    return toJSON(this.getHTML());
  }

  setJSON(doc, options) {
    this.setHTML(fromJSON(doc), options);
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
    const snapshot = this.history.undo();
    if (snapshot) this._restoreSnapshot(snapshot);
  }

  redo() {
    const snapshot = this.history.redo();
    if (snapshot) this._restoreSnapshot(snapshot);
  }

  canUndo() {
    return this.history.canUndo();
  }

  canRedo() {
    return this.history.canRedo();
  }

  // ----- Mode baca saja -----

  setReadOnly(readOnly = true) {
    this.readOnly = !!readOnly;
    this.el.setAttribute('contenteditable', this.readOnly ? 'false' : 'true');
    this.el.setAttribute('aria-readonly', String(this.readOnly));
    this.el.classList.toggle('afw-is-readonly', this.readOnly);
    this.closeSlash();
    this._clearMediaSelection();
    this._prepareMedia();
    this._updatePlaceholder();
    this.emit('readonly', this.readOnly);
    this._scheduleSelection();
  }

  // ----- Media (gambar, video, pemisah) -----

  insertImages(files) {
    return insertImageFiles(this, files);
  }

  selectMedia(node) {
    if (this.readOnly || !isMediaNode(node) || node.parentNode !== this.el) return;
    if (this._selectedMedia !== node) {
      this._clearMediaSelection();
      this._selectedMedia = node;
      node.classList.add('afw-is-selected');
    }
    // Seleksi DOM diletakkan mengelilingi media agar fokus & keyboard tetap di editor.
    this._selectingMedia = true;
    this.el.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNode(node);
    restoreSelection(range);
    this._selectingMedia = false;
    this.emit('state', this.state());
    this._scheduleSelection();
  }

  deselectMedia() {
    if (!this._selectedMedia) return;
    this._clearMediaSelection();
    this._scheduleSelection();
  }

  // { kind: 'image' | 'embed' | 'divider', size, alt } atau null
  selectedMedia() {
    const node = this._selectedMedia;
    if (!node) return null;
    return {
      kind: mediaKind(node),
      size: node.getAttribute('data-size') || 'normal',
      alt: node.querySelector('img')?.getAttribute('alt') || '',
    };
  }

  setMediaSize(size) {
    if (!this._selectedMedia) return;
    setMediaSize(this._selectedMedia, size);
    this._handleChange();
    this.selectMedia(this._selectedMedia);
  }

  setMediaAlt(alt) {
    const img = this._selectedMedia?.querySelector('img');
    if (!img) return;
    img.setAttribute('alt', String(alt || '').trim());
    this._handleChange();
    this.selectMedia(this._selectedMedia);
  }

  removeMedia() {
    const node = this._selectedMedia;
    if (!node) return;
    const next = node.nextElementSibling;
    const prev = node.previousElementSibling;
    this._clearMediaSelection();
    node.remove();

    const target = next && !isMediaNode(next) ? next : prev && !isMediaNode(prev) ? prev : null;
    if (target) placeCaretIn(target, target === next ? 'start' : 'end');
    else if (isMediaNode(next)) this.selectMedia(next);
    else {
      const p = emptyParagraph();
      this.el.append(p);
      placeCaretIn(p);
    }
    this._handleChange();
  }

  // ----- Slash menu -----

  // Buka slash menu dari tombol "+": ketik "/" di posisi kursor.
  openSlash() {
    if (!isSelectionInside(this.el)) this.focus();
    this._slashDismissed = null;
    document.execCommand('insertText', false, '/');
    this._handleChange();
  }

  closeSlash({ dismiss = false } = {}) {
    if (dismiss) this._slashDismissed = this._slashBlock;
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
      restoreSelection(context.before);
      document.execCommand('delete');
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
    const el = this.el;
    this._events.forEach(([target, type, handler]) => target.removeEventListener(type, handler));
    cancelAnimationFrame(this._selectionFrame);
    clearTimeout(this._autosaveTimer);
    el.removeAttribute('contenteditable');
    this.listeners = {};
  }

  // ---------- Internal ----------

  _setup() {
    const el = this.el;

    el.setAttribute('contenteditable', 'true');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-multiline', 'true');
    el.setAttribute('aria-label', this.options.label || this.strings.editorLabel);
    el.classList.add('afw-content');
    el.dataset.afwPlaceholder = this.options.placeholder ?? this.strings.placeholder;

    this.setHTML(this.options.content || el.innerHTML, { silent: true });
    if (this.options.readonly) this.setReadOnly(true);
    this._setupAutosave();

    this._events = [
      // Saat IME composition (keyboard mobile, input Jepang/Cina) DOM tidak boleh diubah.
      [el, 'input', (e) => !e.isComposing && this._handleInput(e)],
      [el, 'keydown', (e) => this._handleKeydown(e)],
      // Undo/redo dari menu Edit browser atau gerakan di perangkat sentuh.
      [el, 'beforeinput', (e) => {
        if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
          e.preventDefault();
          e.inputType === 'historyUndo' ? this.undo() : this.redo();
        }
      }],
      [el, 'focus', () => {
        this._applyBrowserDefaults();
        this.emit('focus');
      }],
      [el, 'blur', () => {
        this.closeSlash();
        this.emit('blur');
        this.emit('state', this.state());
      }],
      [el, 'paste', (e) => this._handlePaste(e)],
      [el, 'click', (e) => this._handleClick(e)],
      [el, 'drop', (e) => this._handleDrop(e)],
      // Drag dari dalam editor sendiri (memindah teks) dibiarkan ke browser.
      [el, 'dragstart', () => (this._internalDrag = true)],
      [el, 'dragend', () => (this._internalDrag = false)],
      // Selama mouse ditekan (sedang memblok teks), bubble belum ditampilkan.
      [el, 'mousedown', () => (this._pointerDown = true)],
      [document, 'mouseup', () => {
        if (!this._pointerDown) return;
        this._pointerDown = false;
        this._scheduleSelection();
      }],
      [document, 'selectionchange', () => {
        this._checkMediaSelection();
        if (isSelectionInside(this.el)) this.emit('state', this.state());
        if (this.slash.open) this._updateSlash();
        this._scheduleSelection();
      }],
    ];
    this._events.forEach(([target, type, handler]) => target.addEventListener(type, handler));
  }

  // Enter menghasilkan <p> (bukan <div>), dan format memakai tag (<b>), bukan <span style>.
  _applyBrowserDefaults() {
    document.execCommand('defaultParagraphSeparator', false, 'p');
    document.execCommand('styleWithCSS', false, false);
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
    return { allowDataImages: this.options.allowDataImages };
  }

  _prepareMedia() {
    prepareMedia(this.el, this.strings.captionPlaceholder, !this.readOnly);
  }

  _snapshot() {
    return { html: this.el.innerHTML, selection: serializeSelection(this.el) };
  }

  _record(options) {
    this.history.record(this._snapshot(), options);
    this._emitHistory();
  }

  _emitHistory() {
    this.emit('history', { canUndo: this.history.canUndo(), canRedo: this.history.canRedo() });
  }

  _restoreSnapshot(snapshot) {
    this._clearMediaSelection();
    this.el.innerHTML = snapshot.html;
    this.el.querySelectorAll('.afw-is-selected').forEach((node) => node.classList.remove('afw-is-selected'));
    this.el.focus({ preventScroll: true });
    if (!restoreSerializedSelection(this.el, snapshot.selection)) placeCaretAtEnd(this.el);
    this._handleChange({ record: false });
    this._emitHistory();
  }

  _clearMediaSelection() {
    this._selectedMedia?.classList.remove('afw-is-selected');
    this._selectedMedia = null;
  }

  // Seleksi pindah ke tempat lain di editor -> media tidak lagi terpilih.
  _checkMediaSelection() {
    const node = this._selectedMedia;
    if (!node || this._selectingMedia) return;
    if (!node.isConnected) return this._clearMediaSelection();

    const range = getRange();
    if (!range || !this.el.contains(range.commonAncestorContainer)) return; // fokus di toolbar/input
    const index = [...this.el.childNodes].indexOf(node);
    const stillAround = range.startContainer === this.el && range.startOffset === index &&
      range.endContainer === this.el && range.endOffset === index + 1;
    if (!stillAround) this._clearMediaSelection();
  }

  _handleClick(e) {
    if (this.readOnly) return;
    const media = e.target.closest?.('figure, hr');
    if (media && media.parentNode === this.el && !e.target.closest('figcaption')) {
      e.preventDefault();
      this.selectMedia(media);
    }
  }

  _inCaption() {
    const range = getRange();
    let node = range?.startContainer;
    if (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;
    return !!node?.closest?.('figcaption') && this.el.contains(node);
  }

  // Keyboard saat media terpilih. Mengembalikan true jika ditangani.
  _handleMediaKey(e) {
    const node = this._selectedMedia;
    const key = e.key;

    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault();
      this.removeMedia();
      return true;
    }
    if (key === 'Enter') {
      e.preventDefault();
      const p = emptyParagraph();
      node.after(p);
      this._clearMediaSelection();
      placeCaretIn(p);
      this._handleChange();
      return true;
    }
    if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Escape'].includes(key)) {
      e.preventDefault();
      this._moveFromMedia(node, ['ArrowUp', 'ArrowLeft'].includes(key) ? 'before' : 'after');
      return true;
    }
    // Mengetik saat media terpilih tidak mengganti media.
    if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      return true;
    }
    return false;
  }

  _moveFromMedia(node, direction) {
    const target = direction === 'before' ? node.previousElementSibling : node.nextElementSibling;
    if (isMediaNode(target)) return this.selectMedia(target);

    this._clearMediaSelection();
    if (target) {
      placeCaretIn(target, direction === 'before' ? 'end' : 'start');
    } else {
      const p = emptyParagraph();
      direction === 'before' ? node.before(p) : node.after(p);
      placeCaretIn(p);
      this._handleChange();
    }
    this._scheduleSelection();
  }

  // Backspace di awal paragraf setelah media / Delete di akhir paragraf sebelum media
  // -> pilih media itu dulu (bukan langsung menghapus).
  _handleKeyNearMedia(e) {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return false;
    const range = getRange();
    if (!range || !range.collapsed) return false;

    const block = topBlockAtCaret(this.el);
    if (!block || isMediaNode(block)) return false;

    const edge = document.createRange();
    if (e.key === 'Backspace') {
      edge.setStart(block, 0);
      edge.setEnd(range.startContainer, range.startOffset);
    } else {
      edge.setStart(range.startContainer, range.startOffset);
      edge.setEnd(block, block.childNodes.length);
    }
    if (edge.toString().replace(/\u200b/g, '')) return false;

    const media = e.key === 'Backspace' ? block.previousElementSibling : block.nextElementSibling;
    if (!isMediaNode(media)) return false;

    e.preventDefault();
    if (!block.textContent.trim() && block.tagName === 'P') block.remove();
    this.selectMedia(media);
    this._handleChange();
    return true;
  }

  _handleInput(e) {
    if (this.options.markdown && e.inputType === 'insertText' && e.data && !this._inCaption()) {
      const char = e.data.slice(-1);
      if (char === ' ' && applyBlockShortcut(this)) return;
      if (applyInlineShortcut(this, char)) return this._handleChange();
    }
    // Ketikan & hapus karakter beruntun digabung menjadi satu langkah undo.
    this._handleChange({ typing: /^(insertText|insertCompositionText|deleteContent)/.test(e.inputType) });
  }

  _handleKeydown(e) {
    if (this.readOnly) return;

    // Undo / redo memakai riwayat editor sendiri.
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === 'z' || key === 'y') {
        e.preventDefault();
        if (key === 'z' && !e.shiftKey) this.undo();
        else this.redo();
        return;
      }
    }

    if (this._selectedMedia && this._handleMediaKey(e)) return;

    // Enter di keterangan gambar -> lanjut ke paragraf setelah gambar.
    if (e.key === 'Enter' && this._inCaption()) {
      e.preventDefault();
      const figure = topBlockAtCaret(this.el);
      let next = figure.nextElementSibling;
      if (!next || isMediaNode(next)) {
        next = emptyParagraph();
        figure.after(next);
      }
      this.el.focus({ preventScroll: true });
      placeCaretIn(next);
      this._handleChange();
      return;
    }

    if (this._handleKeyNearMedia(e)) return;

    if (!this.slash.open && handleCodeKey(this, e)) {
      this._handleChange();
      return;
    }

    // Navigasi slash menu.
    if (this.slash.open) {
      const keys = {
        ArrowDown: () => this.setSlashIndex(this.slash.index + 1),
        ArrowUp: () => this.setSlashIndex(this.slash.index - 1),
        Enter: () => this.slash.items.length && this.applySlash(),
        Tab: () => this.slash.items.length && this.applySlash(),
        Escape: () => this.closeSlash({ dismiss: true }),
      };
      if (keys[e.key] && !e.shiftKey) {
        e.preventDefault();
        keys[e.key]();
        return;
      }
    }

    // Tab / Shift+Tab di dalam list = naik/turun tingkat. Di luar list, Tab dibiarkan
    // (untuk pindah fokus, penting bagi pengguna keyboard).
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey && closestInRoot(this.el, 'li')) {
      e.preventDefault();
      this.exec(e.shiftKey ? 'outdent' : 'indent');
      return;
    }

    if (!(e.ctrlKey || e.metaKey)) return;

    const shortcut = SHORTCUTS.find(
      (s) => s.code === e.code && !!s.alt === e.altKey && !!s.shift === e.shiftKey,
    );
    if (!shortcut) return;

    e.preventDefault();
    this.exec(shortcut.command);
  }

  _handlePaste(e) {
    const data = e.clipboardData;
    if (!data || this.readOnly) return;
    e.preventDefault();
    this.paste({
      html: data.getData('text/html'),
      text: data.getData('text/plain'),
      files: [...(data.files || [])],
    });
  }

  // Tempel secara terprogram dengan aturan yang sama seperti paste dari clipboard:
  //   editor.paste({ html: '<p>..</p>', text: '..', files: [File, ...] })
  paste({ html = '', text = '', files = [] } = {}) {
    if (this.readOnly) return;
    if (!isSelectionInside(this.el)) this.focus();

    // Blok kode: teks apa adanya.
    const pre = inCodeBlock(this.el);
    if (pre) {
      replaceInCode(pre.querySelector('code'), text.replace(/\r\n?/g, '\n'));
      this._handleChange();
      return;
    }

    // Keterangan gambar: hanya teks satu baris.
    if (this._inCaption()) {
      document.execCommand('insertText', false, text.replace(/\s+/g, ' ').trim());
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

  // Tempel satu URL:
  //  - ada teks terseleksi            -> jadikan link
  //  - di paragraf kosong, link video -> embed
  _pasteUrl(text, html) {
    const url = text.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return false;
    if (html && !/^\s*(<meta[^>]*>\s*)?<a [^>]*>[^<]*<\/a>\s*$/i.test(html) && html.replace(/<[^>]+>/g, '').trim() !== url) return false;

    const range = getRange();
    if (range && !range.collapsed && !closestInRoot(this.el, 'a')) {
      this.exec('link', url);
      return true;
    }

    const block = topBlockAtCaret(this.el);
    const isEmptyParagraph = block?.tagName === 'P' && !block.textContent.trim();
    if (isEmptyParagraph && parseEmbed(url)) {
      insertMediaBlock(this.el, createEmbedFigure(url), this.strings.captionPlaceholder);
      this._handleChange();
      return true;
    }
    return false;
  }

  _handleDrop(e) {
    if (this._internalDrag || this.readOnly) return;
    const data = e.dataTransfer;
    const html = data?.getData('text/html');
    const text = data?.getData('text/plain');
    const files = [...(data?.files || [])];
    if (!html && !text && !files.length) return;

    e.preventDefault();
    const range = rangeFromPoint(e.clientX, e.clientY);
    if (range && this.el.contains(range.startContainer)) {
      this.el.focus();
      restoreSelection(range);
    }
    if (files.length) {
      this.insertImages(files);
      return;
    }
    if (html && !this.options.pasteAsPlainText) this.insertHTML(html);
    else this.insertText(text);
  }

  // typing: perubahan berasal dari ketikan (digabung di riwayat undo)
  // record: false saat memulihkan snapshot undo/redo
  _handleChange({ typing = false, record = true } = {}) {
    this._ensureParagraph();
    cleanLive(this.el);
    normalizeCodeBlocks(this.el);
    this._prepareMedia();
    if (this._selectedMedia && !this._selectedMedia.isConnected) this._clearMediaSelection();
    this._updatePlaceholder();
    this._updateSlash();
    if (record) this._record({ typing });
    this._scheduleDraftSave();
    this.emit('change', this.getHTML());
    this.emit('state', this.state());
    this._scheduleSelection();
  }

  // Teks dari awal paragraf sampai kursor, jika kursor di akhir paragraf.
  _slashContext() {
    const range = getRange();
    if (!range || !range.collapsed) return null;

    const block = closestInRoot(this.el, 'p');
    if (!block || block.closest('li, blockquote')) return null;

    const before = document.createRange();
    before.setStart(block, 0);
    before.setEnd(range.startContainer, range.startOffset);

    const after = document.createRange();
    after.setStart(range.startContainer, range.startOffset);
    after.setEnd(block, block.childNodes.length);
    if (after.toString().replace(/​/g, '')) return null;

    return { block, before, text: before.toString() };
  }

  _updateSlash() {
    if (!this.options.slash) return;

    const context = this._slashContext();
    const match = context?.text.match(/^\/([^\s/]{0,24})$/);
    this._slashBlock = context?.block || null;

    if (!match) {
      this._slashDismissed = null;
      return this.closeSlash();
    }
    if (this._slashDismissed === context.block) return;

    const query = match[1];
    const items = filterBlocks(query, this.options.blocks, this.strings);
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
    if (this._selectedMedia) {
      return {
        inside: true,
        collapsed: false,
        dragging: !!this._pointerDown,
        media: { ...this.selectedMedia(), rect: this._selectedMedia.getBoundingClientRect() },
      };
    }

    const range = getRange();
    const inside = !!range && this.el.contains(range.commonAncestorContainer) && document.activeElement === this.el;
    if (!inside) return { inside: false };

    const anchor = closestInRoot(this.el, 'a');
    const block = closestInRoot(this.el, 'p, h2, h3, blockquote, li');
    const isEmptyParagraph = block?.tagName === 'P' && !block.closest('li, blockquote') && !block.textContent.replace(/​/g, '');

    return {
      inside: true,
      inCode: !!inCodeBlock(this.el),
      collapsed: range.collapsed,
      dragging: !!this._pointerDown,
      rect: rangeRect(range),
      link: anchor ? { href: anchor.getAttribute('href'), rect: anchor.getBoundingClientRect() } : null,
      emptyBlock: isEmptyParagraph ? { rect: block.getBoundingClientRect() } : null,
    };
  }

  // Pastikan isi editor selalu dibungkus blok (<p>), tidak pernah teks lepas.
  _ensureParagraph() {
    const el = this.el;

    if (!el.firstChild || el.innerHTML === '<br>') {
      el.innerHTML = EMPTY_PARAGRAPH;
      placeCaretAtEnd(el.firstChild);
      return;
    }

    const hasLooseText = [...el.childNodes].some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '',
    );
    if (hasLooseText) document.execCommand('formatBlock', false, '<p>');
  }

  _updatePlaceholder() {
    this.el.classList.toggle('afw-is-empty', this.isEmpty() && this.el.children.length <= 1);
  }
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

// DOMRect seleksi. Range yang collapsed di paragraf kosong sering memberi rect nol,
// jadi jatuh ke rect elemen terdekat.
function rangeRect(range) {
  const rect = range.getBoundingClientRect();
  if (rect.width || rect.height) return rect;

  const first = range.getClientRects()[0];
  if (first) return first;

  let node = range.startContainer;
  if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;
  const box = node.getBoundingClientRect();
  return new DOMRect(box.left, box.top, 0, Math.min(box.height, 28));
}

function rangeFromPoint(x, y) {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  const pos = document.caretPositionFromPoint?.(x, y);
  if (!pos) return null;
  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  range.collapse(true);
  return range;
}
