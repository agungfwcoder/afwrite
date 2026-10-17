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
//   focus / blur

import { BLOCKS, filterBlocks } from './blocks.js';
import { COMMANDS } from './commands.js';
import { cleanLive } from './cleanup.js';
import { applyBlockShortcut, applyInlineShortcut } from './markdown.js';
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
  placeholder: 'Mulai menulis… ketik / untuk pilihan blok',
  pasteAsPlainText: false, // true: semua format dari clipboard dibuang
  markdown: true, // shortcut markdown saat mengetik
  slash: true, // slash menu
  blocks: BLOCKS, // isi slash menu
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
];

export class Editor {
  constructor(el, options = {}) {
    if (!el) throw new Error('[wyswyg] Elemen editor tidak ditemukan.');

    this.el = el;
    this.options = { ...DEFAULTS, ...options };
    this.listeners = {};
    this.commands = COMMANDS;
    this.slash = { ...CLOSED_SLASH };

    this._setup();
  }

  // ---------- API publik ----------

  exec(name, ...args) {
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
    return this.isEmpty() ? '' : sanitize(this.el.innerHTML);
  }

  // Konten dari luar (database, dll.) disanitasi sebelum masuk editor.
  setHTML(html, { silent = false } = {}) {
    this.el.innerHTML = sanitize(html) || EMPTY_PARAGRAPH;
    this._updatePlaceholder();
    if (!silent) this.emit('change', this.getHTML());
  }

  // Teks polos dengan blok dipisah baris baru (untuk hitung kata, dll.).
  getText() {
    return [...this.el.querySelectorAll('p, h2, h3, blockquote, li')]
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
    const clean = sanitizeToElement(html);
    if (!clean.childNodes.length) return;

    // Satu paragraf saja -> sisipkan isinya, agar tidak memecah paragraf tempat kursor berada.
    // Spasi di ujung (yang dibuang sanitize) dikembalikan agar kata tidak menempel.
    const only = clean.children.length === 1 ? clean.firstElementChild : null;
    let markup = clean.innerHTML;
    if (only && only.tagName === 'P') {
      const source = new DOMParser().parseFromString(String(html), 'text/html').body.textContent;
      markup = (/^\s/.test(source) ? ' ' : '') + only.innerHTML + (/\s$/.test(source) ? ' ' : '');
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
    el.removeAttribute('contenteditable');
    this.listeners = {};
  }

  // ---------- Internal ----------

  _setup() {
    const el = this.el;

    el.setAttribute('contenteditable', 'true');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-multiline', 'true');
    el.classList.add('afw-content');
    el.dataset.afwPlaceholder = this.options.placeholder;

    this.setHTML(this.options.content || el.innerHTML, { silent: true });

    this._events = [
      // Saat IME composition (keyboard mobile, input Jepang/Cina) DOM tidak boleh diubah.
      [el, 'input', (e) => !e.isComposing && this._handleInput(e)],
      [el, 'keydown', (e) => this._handleKeydown(e)],
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

  _handleInput(e) {
    if (this.options.markdown && e.inputType === 'insertText' && e.data) {
      const char = e.data.slice(-1);
      if (char === ' ' && applyBlockShortcut(this)) return;
      if (applyInlineShortcut(this, char)) return this._handleChange();
    }
    this._handleChange();
  }

  _handleKeydown(e) {
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
    if (!data) return;
    e.preventDefault();

    const html = data.getData('text/html');
    const text = data.getData('text/plain');
    // File/gambar dari clipboard ditangani di Termin 4.
    if (html && !this.options.pasteAsPlainText) this.insertHTML(html);
    else if (text) this.insertText(text);
  }

  _handleDrop(e) {
    if (this._internalDrag) return;
    const data = e.dataTransfer;
    const html = data?.getData('text/html');
    const text = data?.getData('text/plain');
    if (!html && !text) return;

    e.preventDefault();
    const range = rangeFromPoint(e.clientX, e.clientY);
    if (range && this.el.contains(range.startContainer)) {
      this.el.focus();
      restoreSelection(range);
    }
    if (html && !this.options.pasteAsPlainText) this.insertHTML(html);
    else this.insertText(text);
  }

  _handleChange() {
    this._ensureParagraph();
    cleanLive(this.el);
    this._updatePlaceholder();
    this._updateSlash();
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
    const items = filterBlocks(query, this.options.blocks);
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
    const range = getRange();
    const inside = !!range && this.el.contains(range.commonAncestorContainer) && document.activeElement === this.el;
    if (!inside) return { inside: false };

    const anchor = closestInRoot(this.el, 'a');
    const block = closestInRoot(this.el, 'p, h2, h3, blockquote, li');
    const isEmptyParagraph = block?.tagName === 'P' && !block.closest('li, blockquote') && !block.textContent.replace(/​/g, '');

    return {
      inside: true,
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
