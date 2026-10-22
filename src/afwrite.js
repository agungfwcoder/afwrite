// API tanpa framework: UI lengkap tanpa Alpine (HTML biasa, React, Vue, Svelte, ...).
//
//   import { create } from 'afwrite';
//   import 'afwrite/style.css';
//
//   const editor = create(document.querySelector('#body'), { name: 'body', upload });
//   editor.on('change', ({ html }) => console.log(html));
//   editor.destroy(); // mis. saat komponen di-unmount
//
// Lewat CDN: Afwrite.create(el, options). Opsi sama dengan wysiwyg({...}) di Alpine.
// Isi awal elemen menjadi konten awal; destroy() mengembalikan isi elemen seperti semula.
//
// Event: lewat on(nama, fn) -> ready, change, focus, blur, error, image-request; juga dikirim
// sebagai event DOM wysiwyg-* (bubbling dari elemen .afw), sama seperti versi Alpine.
//
// Untuk layout sendiri, sediakan <div data-afw-editor> di dalam elemen; markup UI bawaan
// tidak akan disuntikkan.

import { Editor } from './core/editor.js';
import { parseEmbed } from './core/embed.js';
import { normalizeUrl } from './core/url.js';
import { format as formatText, getStrings } from './i18n.js';
import { normalizeFormats } from './core/formats.js';
import { normalizeHeadings } from './core/sanitize.js';
import { ALIGN_ITEMS, BUBBLE, ICONS, TOOLBAR, withFormats, withHeadings } from './icons.js';
import { TEMPLATE } from './ui/template.js';
import { el, keepFocus, listen, setAttr, setHTML, setText, show } from './ui/dom.js';
import { gutterX, isCoarsePointer, place } from './ui/position.js';

const EMPTY_META = { image: null, title: '', subtitle: '', slug: '' };
const EMPTY_VALUES = { color: null, highlight: null, align: null };
const INPUT_PLACEHOLDERS = { link: 'inputLink', embed: 'inputEmbed', alt: 'inputAlt' };
const MEDIA_SIZES = [
  { value: 'normal', label: 'sizeNormal', icon: 'sizeNormal' },
  { value: 'wide', label: 'sizeWide', icon: 'sizeWide' },
  { value: 'full', label: 'sizeFull', icon: 'sizeFull' },
];
// Tombol yang membuka palet (bukan langsung menjalankan perintah).
const POPOVERS = ['color', 'align'];
const TOAST_DELAY = 4000;
const instances = new WeakMap();
let uidCounter = 0;

// `internal` hanya untuk adapter (src/alpine.js): { onRender(ui), restore }.
export function create(target, options = {}, internal = {}) {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) throw new Error('[afwrite] Elemen editor tidak ditemukan.');
  if (instances.has(root)) {
    console.warn('[afwrite] Elemen ini sudah berisi editor; instance yang ada dikembalikan.');
    return instances.get(root);
  }
  const instance = new EditorUI(root, options, internal);
  instances.set(root, instance);
  return instance;
}

class EditorUI {
  constructor(root, options, internal) {
    this.root = root;
    this.options = options;
    this.internal = internal;
    this.strings = getStrings(options.lang, options.strings);
    // Susunan tombol bawaan mengikuti level judul aktif (bubble: paling banyak 2 level).
    this.headings = normalizeHeadings(options.headings);
    // Format tambahan (garis bawah, warna, perataan): tidak ada di mode artikel kecuali diminta.
    this.formats = normalizeFormats(options.formats, !!options.title);
    this.listeners = {};
    this.cleanups = [];

    this.html = '';
    this.active = {};
    this.disabled = {};
    this.values = { ...EMPTY_VALUES };
    this.readOnly = !!options.readonly;
    this.canUndo = false;
    this.canRedo = false;
    this.draft = null;
    this.stats = { words: 0, minutes: 0 };
    this.meta = { ...EMPTY_META };
    this.name = options.name || '';
    this.titleName = options.titleName || '';
    this.format = options.format === 'json' ? 'json' : 'html';
    this.showToolbar = options.toolbar ?? true;
    this.showBubble = options.bubble ?? true;
    this.showStats = options.stats ?? true;
    this.toolbarItems = withFormats(options.toolbarItems || withHeadings(TOOLBAR, this.headings), this.formats);
    this.bubbleItems = withFormats(options.bubbleItems || withHeadings(BUBBLE, this.headings, 2), this.formats);
    this.toast = { open: false, message: '' };
    // mode: format | input | linkinfo; purpose (mode input): link | embed | alt
    this.bubble = { open: false, ready: false, mode: 'format', purpose: 'link', x: 0, y: 0, url: '', href: '', hasLink: false, error: '' };
    this.media = { open: false, ready: false, x: 0, y: 0, kind: 'image', size: 'normal', alt: '', src: null, mediaId: null };
    this.pop = { open: false, ready: false, kind: '', x: 0, y: 0 };
    this.slash = { open: false, ready: false, items: [], index: 0, x: 0, y: 0 };
    this.plus = { visible: false, x: 2, y: 0 };
    this.handle = { visible: false, x: 2, y: 0, pos: null };
    this.dragging = false;
    this.uid = `afw-${++uidCounter}`;

    this.savedRange = null;
    this.inputBusy = false;
    this.popTrigger = null; // tombol yang membuka palet
    this.popSelection = ''; // posisi seleksi saat palet dibuka

    this._mount();
  }

  // ---------- API ----------

  exec(name, ...args) {
    return this.editor?.exec(name, ...args);
  }

  // Deskriptor { src, alt?, mediaId?, size? } atau array-nya, mis. hasil pilihan galeri.
  insertImage(images) {
    this.editor?.exec('image', images);
  }

  // Ganti gambar terpilih. Tanpa argumen: galeri (imageRequest) atau dialog file.
  replaceImage(image) {
    this.editor?.exec('replaceImage', image);
  }

  isActive(name) {
    return !!this.active[name];
  }

  isDisabled(name) {
    if (name === 'undo') return !this.canUndo;
    if (name === 'redo') return !this.canRedo;
    return !!this.disabled[name];
  }

  getHTML() {
    return this.editor?.getHTML() || '';
  }

  setHTML(html) {
    this.editor?.setHTML(html);
  }

  getJSON() {
    return this.editor?.getJSON();
  }

  setJSON(doc) {
    this.editor?.setJSON(doc);
  }

  getMeta() {
    return this.editor?.getMeta() ?? { ...EMPTY_META };
  }

  setReadOnly(value = true) {
    this.editor?.setReadOnly(value);
  }

  focus() {
    this.editor?.focus();
  }

  restoreDraft() {
    this.editor.restoreDraft();
    this.draft = null;
    this.render();
  }

  discardDraft() {
    this.editor.discardDraft();
    this.draft = null;
    this.render();
  }

  t(key) {
    return this.strings[key] ?? key;
  }

  // on('change', ({ html, meta }) => ...); mengembalikan fungsi untuk melepas listener.
  on(event, callback) {
    (this.listeners[event] ||= []).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.listeners[event] = (this.listeners[event] || []).filter((cb) => cb !== callback);
  }

  destroy() {
    if (!this.editor) return;
    clearTimeout(this.toastTimer);
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.editor.destroy();
    this.editor = null;
    this.listeners = {};
    // Elemen kembali seperti sebelum create(), jadi bisa dipasang lagi (mis. React StrictMode).
    if (this.injected && this.internal.restore !== false) this.root.innerHTML = this.initialMarkup;
    if (this.addedClass) this.root.classList.remove('afw');
    instances.delete(this.root);
  }

  // ---------- Pemasangan ----------

  _mount() {
    const { root, options } = this;
    this.addedClass = !root.classList.contains('afw');
    root.classList.add('afw');

    let editorEl = root.querySelector('[data-afw-editor]');
    let editorOptions = options;
    if (!editorEl) {
      // Isi awal elemen dipakai sebagai konten, lalu diganti markup UI bawaan.
      this.initialMarkup = root.innerHTML;
      this.injected = true;
      root.innerHTML = TEMPLATE;
      editorEl = root.querySelector('[data-afw-editor]');
      editorOptions = { ...options, content: options.content ?? this.initialMarkup };
      this._buildUI();
    }
    // Di halaman yang memakai Alpine, UI dan konten tidak boleh diproses Alpine: atribut seperti
    // x-init / @click dari konten tersimpan atau hasil paste akan ikut dieksekusi. Layout sendiri:
    // hanya elemen konten, markup milik aplikasi tetap diproses.
    for (const node of this.injected ? root.children : [editorEl]) ignoreAlpine(node);

    const editor = (this.editor = new Editor(editorEl, editorOptions));
    this.meta = editor.getMeta();

    editor.on('change', (html) => {
      this.html = html;
      this.handle.visible = false; // posisi blok bisa bergeser
      this.stats = editor.stats();
      this.meta = editor.getMeta();
      this.render();
      this._emit('change', { html, meta: this.meta });
    });
    editor.on('history', ({ canUndo, canRedo }) => {
      this.canUndo = canUndo;
      this.canRedo = canRedo;
      this.render();
    });
    editor.on('readonly', (value) => {
      this.readOnly = value;
      if (value) {
        this.closeBubble();
        this.hideMediaBar();
        this.plus.visible = false;
        this.handle.visible = false;
      }
      this.render();
    });
    editor.on('state', (state) => {
      this.active = state;
      this.disabled = editor.disabledState();
      this.values = editor.formatValues();
      this.render();
    });
    editor.on('focus', () => this._emit('focus'));
    editor.on('blur', () => this._emit('blur'));
    if (this.ui) {
      // Tanpa UI bawaan (layout sendiri) perintah link/video memakai prompt() bawaan browser.
      editor.on('selection', (info) => this._onSelection(info));
      editor.on('slash', (state) => this._onSlash(state));
      editor.on('linkrequest', ({ href }) => this.openInput('link', href));
      editor.on('embedrequest', () => this.openInput('embed'));
    }
    // Opsi imageRequest: gambar dipilih lewat UI aplikasi (mis. galeri) alih-alih dialog file.
    // Listener hanya dipasang bila diminta, karena keberadaannya mematikan dialog file bawaan.
    if (options.imageRequest) editor.on('imagerequest', (detail) => this._emit('image-request', detail));
    editor.on('error', (detail) => {
      this.showToast(detail.message);
      this._emit('error', detail);
    });

    this.html = editor.getHTML();
    this.stats = editor.stats();
    this.canUndo = editor.canUndo();
    this.canRedo = editor.canRedo();
    this.draft = editor.draft || null;
    this.readOnly = editor.readOnly;
    this.active = editor.state();
    this.disabled = editor.disabledState();
    this.values = editor.formatValues();

    // Draf autosave tidak diperlukan lagi setelah form dikirim.
    const form = root.closest('form');
    if (form) {
      this.cleanups.push(listen(form, 'submit', () => {
        if (this.draft) editor.discardDraft();
        editor.clearDraft();
      }));
    }

    if (this.ui) this._buildPalette();
    this.render();
    this._initToolbarFocus();
    // Setelah create() selesai, agar listener yang dipasang lewat on() ikut menerima 'ready'.
    queueMicrotask(() => this.editor && this._emit('ready', { editor }));
  }

  // Event untuk listener on() dan event DOM wysiwyg-* (bubbling, seperti versi Alpine).
  _emit(event, detail) {
    (this.listeners[event] || []).forEach((cb) => cb(detail));
    this.root.dispatchEvent(new CustomEvent(`wysiwyg-${event}`, { detail, bubbles: true }));
  }

  _buildUI() {
    const { root } = this;
    const part = (selector) => root.querySelector(`:scope > ${selector}`);
    const bubble = part('.afw-bubble-main');
    const pop = part('.afw-pop');
    const ui = (this.ui = {
      toolbar: part('.afw-toolbar'),
      draft: part('.afw-draft'),
      draftText: root.querySelector('.afw-draft-text'),
      footer: part('.afw-footer'),
      words: root.querySelector('.afw-stats-words'),
      minutes: root.querySelector('.afw-stats-minutes'),
      toast: part('.afw-toast'),
      handle: root.querySelector('.afw-body > .afw-handle'),
      plus: root.querySelector('.afw-body > .afw-plus'),
      bubble,
      bubbleFormat: bubble.querySelector('.afw-bubble-format'),
      linkForm: bubble.querySelector('.afw-link-form'),
      linkInput: bubble.querySelector('.afw-link-input'),
      linkRemove: bubble.querySelector('.afw-link-remove'),
      linkError: bubble.querySelector('.afw-link-error'),
      linkInfo: bubble.querySelector('.afw-bubble-linkinfo'),
      linkPreview: bubble.querySelector('.afw-link-preview'),
      linkHref: bubble.querySelector('.afw-link-href'),
      mediabar: part('.afw-mediabar'),
      mediaSizes: root.querySelector('.afw-media-sizes'),
      mediaImage: [...root.querySelectorAll('.afw-media-image')],
      mediaAlt: root.querySelector('.afw-media-alt'),
      pop,
      popAlign: pop.querySelector('.afw-pop-align'),
      popColors: pop.querySelector('.afw-pop-colors'),
      body: part('.afw-body'),
      menu: part('.afw-menu'),
      menuEmpty: root.querySelector('.afw-menu-empty'),
      inputs: [],
    });
    const on = (target, type, handler, opts) => this.cleanups.push(listen(target, type, handler, opts));

    // Penanda statis di template (lihat src/ui/template.js).
    for (const node of root.querySelectorAll('[data-afw-label]')) {
      const label = this.t(node.dataset.afwLabel);
      setAttr(node, 'aria-label', label);
      if (node.tagName === 'BUTTON') setAttr(node, 'title', node.dataset.afwKey ? `${label} (${node.dataset.afwKey})` : label);
    }
    for (const node of root.querySelectorAll('[data-afw-icon]')) setHTML(node, ICONS[node.dataset.afwIcon]);
    for (const node of root.querySelectorAll('[data-afw-text]')) setText(node, this.t(node.dataset.afwText));
    for (const node of root.querySelectorAll('[data-afw-action]')) {
      // Tombol di elemen melayang tidak boleh mengambil fokus dari editor.
      if (node.closest('.afw-bubble')) on(node, 'mousedown', keepFocus);
      on(node, 'click', () => this[node.dataset.afwAction]());
    }

    setAttr(ui.toolbar, 'aria-label', this.t('toolbarLabel'));
    setAttr(ui.bubble, 'aria-label', this.t('toolbarLabel'));
    this.toolbarButtons = this._buttonGroups(ui.toolbar, this.toolbarItems);
    this.bubbleButtons = this._buttonGroups(ui.bubbleFormat, this.bubbleItems, 'afw-btn-inverse');
    on(ui.toolbar, 'keydown', (e) => this._toolbarKey(e));

    // Bubble: Esc membatalkan input / menutup bubble.
    on(ui.bubble, 'keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      this.cancelInput();
    });
    on(ui.linkInput, 'input', () => {
      this.bubble.url = ui.linkInput.value;
      this.bubble.error = '';
      this.render();
    });
    on(ui.linkInput, 'keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      this.applyInput();
    });
    on(ui.linkInput, 'blur', () => this._onInputBlur());
    on(ui.linkPreview, 'mousedown', keepFocus);

    this.mediaSizeButtons = MEDIA_SIZES.map((size) => ({
      el: this._button(size.label, '', size.icon, () => this.setMediaSize(size.value)),
      value: size.value,
    }));
    ui.mediaSizes.append(...this.mediaSizeButtons.map((b) => b.el), el('span', { class: 'afw-sep' }));

    this.alignButtons = ALIGN_ITEMS.map((item) => ({
      el: this._button(item.command, item.shortcut, item.command, () => this._applyPop(item.command)),
      command: item.command,
    }));
    ui.popAlign.append(...this.alignButtons.map((b) => b.el));

    // Palet: Esc menutup dan mengembalikan fokus ke tombol pembukanya. Klik di luar palet atau Esc
    // saat fokus di editor (fokus tetap di editor selama palet terbuka) juga menutupnya.
    on(ui.pop, 'keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      this._closePop(true);
    });
    on(root, 'keydown', (e) => {
      if (e.key !== 'Escape' || !this.pop.open) return;
      e.preventDefault();
      e.stopPropagation();
      this._closePop();
    }, true);
    on(document, 'mousedown', (e) => {
      if (this.pop.open && !ui.pop.contains(e.target) && !this.popTrigger?.contains(e.target)) this._closePop();
    }, true);

    // Slash menu, tombol + dan pegangan drag.
    setAttr(ui.menu, 'id', `${this.uid}-menu`);
    this.menuItems = [];
    on(ui.plus, 'mousedown', keepFocus);
    on(ui.plus, 'click', () => this.openBlockMenu());
    on(ui.body, 'mousemove', (e) => this._onBodyHover(e));
    on(ui.body, 'mouseleave', () => this._hideHandle());
    // mousedown pada pegangan sengaja tidak di-prevent: itu akan membatalkan drag.
    on(ui.handle, 'click', () => this._selectHandleBlock());
    on(ui.handle, 'dragstart', (e) => this._startBlockDrag(e));
    on(ui.handle, 'dragend', () => this._endBlockDrag());
    // Drag blok selesai (drop atau dibatalkan) di mana pun: browser bisa tidak mengirim dragend
    // ke pegangan yang sudah disembunyikan saat isi editor berubah.
    const finishDrag = () => this.dragging && this._endBlockDrag();
    on(document, 'drop', finishDrag, true);
    on(document, 'dragend', finishDrag, true);

    // Input hidden untuk form: isi (HTML / JSON) dan, dengan opsi titleName, judul.
    if (this.name) ui.inputs.push(['content', root.appendChild(el('input', { type: 'hidden', name: this.name }))]);
    if (this.titleName) ui.inputs.push(['title', root.appendChild(el('input', { type: 'hidden', name: this.titleName }))]);
  }

  // Baris palet warna mengikuti opsi colors / highlights (dinormalisasi oleh Editor).
  _buildPalette() {
    const { editor, ui } = this;
    const rows = [
      { command: 'color', label: 'textColor', none: 'defaultColor', colors: editor.options.colors },
      { command: 'highlight', label: 'highlight', none: 'noHighlight', colors: editor.options.highlights },
    ].filter((row) => this.formats.includes(row.command) && row.colors.length);

    this.swatches = [];
    for (const row of rows) {
      const label = this.t(row.label);
      const none = this.t(row.none);
      const swatch = (value, attrs) => {
        const button = this._button(null, '', null, () => this._applyPop(row.command, value), attrs);
        this.swatches.push({ el: button, command: row.command, value });
        return button;
      };
      ui.popColors.append(el('div', { class: 'afw-pop-row' }, [
        el('span', { class: 'afw-pop-label' }, label),
        swatch(null, { class: 'afw-swatch afw-swatch-none', title: none, 'aria-label': none }),
        ...row.colors.map((color) => swatch(color, {
          class: `afw-swatch afw-swatch-${row.command}`,
          style: `--afw-swatch: ${color}`,
          title: color,
          'aria-label': `${label} ${color}`,
        })),
      ]));
    }
  }

  // Tombol yang tidak mengambil fokus dari editor. `label`: kunci teks untuk title & aria-label
  // (dengan shortcut di title); `icon`: nama ikon; class bawaan tombol di elemen melayang.
  _button(label, shortcut, icon, onClick, attrs = {}) {
    const text = label && this.t(label);
    const button = el('button', {
      type: 'button',
      class: 'afw-btn afw-btn-inverse',
      title: text && (shortcut ? `${text} (${shortcut})` : text),
      'aria-label': text,
      ...attrs,
    });
    if (icon) setHTML(button, ICONS[icon]);
    this.cleanups.push(listen(button, 'mousedown', keepFocus), listen(button, 'click', onClick));
    return button;
  }

  // Grup tombol (toolbar / bubble): [[{ command, shortcut }, ...], ...] -> tombol + pemisah.
  _buttonGroups(container, groups, extraClass = '') {
    const buttons = [];
    groups.forEach((group, gi) => {
      const groupEl = el('div', { class: 'afw-group' }, gi > 0 ? el('span', { class: 'afw-sep' }) : null);
      for (const item of group) {
        // Ikon diisi render(): bisa berubah (perataan di posisi kursor).
        const button = this._button(item.command, item.shortcut, null, (e) => this._onItem(item.command, e), {
          class: `afw-btn${extraClass ? ` ${extraClass}` : ''}`,
          'aria-haspopup': POPOVERS.includes(item.command) ? 'true' : null,
        });
        groupEl.append(button);
        buttons.push({ el: button, command: item.command });
      }
      container.append(groupEl);
    });
    return buttons;
  }

  // ---------- Tampilan ----------

  // Menyelaraskan DOM dengan state. Murah: hanya atribut/teks yang berubah yang ditulis ulang.
  render() {
    this.internal.onRender?.(this);
    const { ui } = this;
    if (!ui) return;

    show(ui.toolbar, this.showToolbar && !this.readOnly);
    for (const button of [...this.toolbarButtons, ...this.bubbleButtons]) this._renderItem(button);

    show(ui.draft, !!this.draft);
    if (this.draft) setText(ui.draftText, this.draftMessage());

    show(ui.footer, this.showStats);
    setText(ui.words, `${this.stats.words} ${this.t('words')}`);
    setText(ui.minutes, `${this.stats.minutes} ${this.t('minutesRead')}`);

    // Bubble
    const { bubble, media, pop } = this;
    floating(ui.bubble, bubble);
    ui.bubbleFormat.classList.toggle('afw-is-hidden', bubble.mode !== 'format');
    ui.linkForm.classList.toggle('afw-is-hidden', bubble.mode !== 'input');
    ui.linkInfo.classList.toggle('afw-is-hidden', bubble.mode !== 'linkinfo');
    const placeholder = this.t(INPUT_PLACEHOLDERS[bubble.purpose]) || '';
    setAttr(ui.linkInput, 'placeholder', placeholder);
    setAttr(ui.linkInput, 'aria-label', placeholder);
    if (ui.linkInput.value !== bubble.url) ui.linkInput.value = bubble.url;
    ui.linkRemove.classList.toggle('afw-is-hidden', !(bubble.purpose === 'link' && bubble.hasLink));
    show(ui.linkError, !!bubble.error);
    setText(ui.linkError, bubble.error);
    setAttr(ui.linkPreview, 'href', bubble.href || null);
    setAttr(ui.linkPreview, 'title', bubble.href || null);
    setText(ui.linkHref, bubble.href);

    // Media bar
    floating(ui.mediabar, media);
    ui.mediaSizes.classList.toggle('afw-is-hidden', media.kind === 'divider');
    for (const { el: button, value } of this.mediaSizeButtons) {
      const active = media.size === value;
      button.classList.toggle('afw-is-active', active);
      setAttr(button, 'aria-pressed', String(active));
    }
    ui.mediaImage.forEach((button) => show(button, media.kind === 'image'));
    ui.mediaAlt.classList.toggle('afw-is-active', !!media.alt);

    // Palet
    floating(ui.pop, pop);
    setAttr(ui.pop, 'aria-label', this.t(pop.kind || 'color'));
    ui.popAlign.classList.toggle('afw-is-hidden', pop.kind !== 'align');
    ui.popColors.classList.toggle('afw-is-hidden', pop.kind !== 'color');
    for (const { el: button, command } of this.alignButtons) {
      const active = this.isActive(command);
      button.classList.toggle('afw-is-active', active);
      setAttr(button, 'aria-pressed', String(active));
    }
    for (const { el: button, command, value } of this.swatches) {
      const active = value === null ? !this.values[command] : this.values[command] === value;
      button.classList.toggle('afw-is-active', active);
      setAttr(button, 'aria-pressed', String(active));
    }

    ui.toast.classList.toggle('afw-is-open', this.toast.open);
    setText(ui.toast, this.toast.message);

    // Slash menu
    floating(ui.menu, this.slash);
    this._renderMenuItems();
    show(ui.menuEmpty, !this.slash.items.length);

    // Tombol + & pegangan drag
    for (const [button, { visible, x, y }] of [[ui.plus, this.plus], [ui.handle, this.handle]]) {
      button.classList.toggle('afw-is-open', visible);
      const style = `top: ${y}px; left: ${x}px`;
      if (button.getAttribute('style') !== style) button.setAttribute('style', style);
    }

    for (const [kind, input] of ui.inputs) {
      const value = kind === 'title' ? this.meta.title : this._inputValue();
      if (input.value !== value) input.value = value;
    }
  }

  // Item slash menu dibuat ulang hanya saat daftarnya berganti; selebihnya cukup item aktif.
  _renderMenuItems() {
    const { items, index } = this.slash;
    if (this.menuSource !== items) {
      this.menuSource = items;
      this.menuItems.forEach((item) => item.remove());
      this.menuItems = items.map((item, i) => this._menuItem(item, i));
      this.ui.menuEmpty.before(...this.menuItems);
    }
    this.menuItems.forEach((item, i) => {
      item.classList.toggle('afw-is-active', i === index);
      setAttr(item, 'aria-selected', String(i === index));
    });
  }

  _menuItem(item, i) {
    const icon = el('span', { class: 'afw-menu-icon' });
    setHTML(icon, this.icon(item.command));
    const kbd = el('kbd', { class: 'afw-menu-kbd' }, item.markdown || '');
    show(kbd, !!item.markdown);
    const button = el('button', { type: 'button', class: 'afw-menu-item', role: 'option', tabindex: '-1', id: `${this.uid}-opt-${i}` }, [
      icon,
      el('span', { class: 'afw-menu-text' }, [
        el('span', { class: 'afw-menu-label' }, item.label),
        el('span', { class: 'afw-menu-desc' }, item.description),
      ]),
      kbd,
    ]);
    // Listener ikut hilang bersama elemennya saat daftar dibuat ulang.
    button.addEventListener('mousedown', keepFocus);
    button.addEventListener('mousemove', () => this._hoverSlash(i));
    button.addEventListener('click', () => this.editor.applySlash(i));
    return button;
  }

  _renderItem({ el: button, command }) {
    const active = this.isActive(command);
    button.classList.toggle('afw-is-active', active);
    setAttr(button, 'aria-pressed', String(active));
    setAttr(button, 'aria-disabled', String(this.isDisabled(command)));
    setHTML(button, this.icon(command));
  }

  icon(name) {
    // Tombol perataan menampilkan perataan di posisi kursor.
    if (name === 'align') return ICONS[`align${capitalize(this.values.align || 'left')}`];
    // Hanya dua level judul: tampil sebagai T besar dan t kecil.
    const { headings } = this;
    if (headings.length === 2 && /^h[2-6]$/.test(name) && headings.includes(Number(name[1]))) {
      return ICONS[Number(name[1]) === headings[0] ? 'headingLarge' : 'headingSmall'];
    }
    return ICONS[name] || '';
  }

  // Nilai input hidden: HTML, atau JSON jika format: 'json'.
  _inputValue() {
    return this.format === 'json' ? JSON.stringify(this.editor.getJSON()) : this.html;
  }

  draftMessage() {
    const time = new Date(this.draft.time).toLocaleString(this.options.lang === 'id' ? 'id' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return formatText(this.t('draftFound'), { time });
  }

  showToast(message) {
    this.toast = { open: true, message };
    this.render();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.open = false;
      this.render();
    }, TOAST_DELAY);
  }

  // Buka elemen melayang, ukur, lalu posisikan: class afw-is-open dipasang dulu agar ukurannya
  // bisa dibaca; afw-is-ready (terlihat) baru setelah posisinya benar.
  _placeFloating(state, node, rect, opts) {
    this.render();
    const pos = place(this.root, node, rect, opts);
    state.x = pos.x;
    state.y = pos.y;
    state.ready = true;
    this.render();
  }

  // ---------- Palet warna & perataan ----------

  // Klik tombol toolbar/bubble: tombol palet membuka palet, lainnya langsung dijalankan.
  _onItem(name, event) {
    if (!POPOVERS.includes(name)) {
      this._closePop();
      return this.exec(name);
    }
    if (this.pop.open && this.pop.kind === name) return this._closePop();
    this._openPop(name, event?.currentTarget);
  }

  _selectionKey() {
    const { from, to } = this.editor.tiptap.state.selection;
    return `${from}:${to}`;
  }

  _openPop(kind, trigger) {
    if (this.readOnly || !this.editor || !trigger) return;
    if (!this.editor.hasFocus()) this.editor.focus();
    this.popTrigger = trigger;
    this.popSelection = this._selectionKey();
    Object.assign(this.pop, { open: true, ready: false, kind });
    // Dari bubble (di atas seleksi): palet di atasnya; dari toolbar: di bawah tombol.
    const inBubble = !!trigger.closest('.afw-bubble');
    const prefer = inBubble && !isCoarsePointer() ? 'above' : 'below';
    this._placeFloating(this.pop, this.ui.pop, trigger.getBoundingClientRect(), { prefer, gap: 6 });
  }

  _closePop(refocus = false) {
    if (!this.pop.open) return;
    this.pop.open = false;
    this.pop.ready = false;
    if (refocus) this.popTrigger?.focus();
    this.popTrigger = null;
    this.render();
  }

  _applyPop(name, value) {
    this.editor?.exec(name, value);
    this._closePop();
  }

  // ---------- Bubble ----------

  _onSelection(info) {
    // Seleksi pindah (klik di teks lain, dll.) atau editor kehilangan fokus: palet ditutup.
    if (this.pop.open && (!info.inside || this._selectionKey() !== this.popSelection)) this._closePop();
    // Sedang mengisi input (URL/alt): fokus ada di input, seleksi editor diabaikan.
    if (this.bubble.open && this.bubble.mode === 'input') return;
    if (this.readOnly) return;

    this._updatePlus(info);

    if (info.media) {
      this.closeBubble();
      return this._showMediaBar(info.media);
    }
    this.hideMediaBar();

    // Bubble format tidak berlaku di blok kode (isinya teks polos).
    if (!info.inside || info.dragging || info.inCode || this.slash.open || !this.showBubble) return this.closeBubble();
    if (!info.collapsed) return this._showBubbleAt('format', info.rect);
    if (info.link) {
      this.bubble.href = info.link.href;
      return this._showBubbleAt('linkinfo', info.link.rect);
    }
    this.closeBubble();
  }

  _showBubbleAt(mode, rect) {
    const sameMode = this.bubble.open && this.bubble.mode === mode;
    this.bubble.mode = mode;
    this.bubble.open = true;
    if (!sameMode) this.bubble.ready = false;
    // Di perangkat sentuh, menu bawaan OS muncul di atas seleksi -> bubble di bawah.
    const prefer = isCoarsePointer() && mode === 'format' ? 'below' : 'above';
    this._placeFloating(this.bubble, this.ui.bubble, rect, { prefer });
  }

  closeBubble() {
    Object.assign(this.bubble, { open: false, ready: false, mode: 'format', error: '' });
    this.render();
  }

  // ---------- Input: link, video, alt text ----------

  openInput(purpose, value = '') {
    if (!this.ui) return;
    this.savedRange = this.editor.saveSelection();
    const rect = purpose === 'alt' ? this._mediaRect() : this.editor.selectionRect();
    if (!rect) return;

    this.hideMediaBar();
    Object.assign(this.bubble, { purpose, url: value || '', hasLink: purpose === 'link' && !!value, error: '' });
    this._showBubbleAt('input', rect);
    this.ui.linkInput.focus();
    this.ui.linkInput.select();
  }

  editLink() {
    this.openInput('link', this.bubble.href);
  }

  unlink() {
    this.exec('unlink');
  }

  applyInput() {
    const value = this.bubble.url.trim();
    const { editor } = this;

    switch (this.bubble.purpose) {
      case 'link':
        if (value && !normalizeUrl(value)) return this._inputError('errorUrl');
        return this._withEditorFocus(() => (value ? editor.exec('link', value) : editor.exec('unlink')));
      case 'embed':
        if (!value) return this.cancelInput();
        if (!parseEmbed(value)) return this._inputError('errorEmbed');
        return this._withEditorFocus(() => editor.exec('embed', value));
      case 'alt':
        return this._withEditorFocus(() => editor.setMediaAlt(value));
    }
  }

  removeLink() {
    this._withEditorFocus(() => this.editor.exec('unlink'));
  }

  cancelInput() {
    if (this.bubble.mode !== 'input') return this.closeBubble();
    const { purpose } = this.bubble;
    this._withEditorFocus(() => purpose === 'alt' && this.editor.setMediaAlt(this.media.alt));
  }

  _inputError(key) {
    this.bubble.error = this.t(key);
    this.render();
  }

  // Fokus pindah dari input ke tempat lain (klik di luar) -> tutup tanpa menyimpan.
  _onInputBlur() {
    if (!this.inputBusy && this.bubble.mode === 'input') this.closeBubble();
  }

  _withEditorFocus(callback) {
    this.inputBusy = true;
    this.closeBubble();
    this.editor.restoreSelection(this.savedRange);
    callback();
    this.savedRange = null;
    this.inputBusy = false;
  }

  // ---------- Media ----------

  _showMediaBar({ kind, size, alt, src, mediaId, rect }) {
    const wasOpen = this.media.open;
    Object.assign(this.media, { open: true, kind, size, alt, src, mediaId });
    if (!wasOpen) this.media.ready = false;
    this._placeFloating(this.media, this.ui.mediabar, rect, { prefer: 'above' });
  }

  hideMediaBar() {
    if (!this.media.open) return;
    this.media.open = false;
    this.media.ready = false;
    this.render();
  }

  _mediaRect() {
    return this.root.querySelector('.afw-content .afw-is-selected')?.getBoundingClientRect() || null;
  }

  setMediaSize(size) {
    this.editor.setMediaSize(size);
  }

  editAlt() {
    this.openInput('alt', this.media.alt);
  }

  removeMedia() {
    this.editor.removeMedia();
  }

  // ---------- Slash menu & tombol + ----------

  // Buka slash menu di baris kursor (sama seperti mengetik "/").
  openBlockMenu() {
    this.editor?.openSlash();
  }

  _onSlash(state) {
    const { slash, editor } = this;
    slash.items = state.items;
    slash.index = state.index;

    // Pembaca layar: editor "mengendalikan" listbox slash menu.
    if (state.open && state.items.length) {
      editor.el.setAttribute('aria-controls', `${this.uid}-menu`);
      editor.el.setAttribute('aria-activedescendant', `${this.uid}-opt-${state.index}`);
    } else {
      editor.el.removeAttribute('aria-activedescendant');
    }

    if (!state.open) {
      slash.open = false;
      slash.ready = false;
      return this.render();
    }

    const wasOpen = slash.open;
    slash.open = true;
    this.plus.visible = false;
    this.closeBubble();

    // Posisi dikunci saat menu dibuka agar tidak melompat ketika daftar menyusut.
    if (!wasOpen || !slash.ready) {
      this.render(); // terbuka & berisi dulu, baru bisa diukur
      const pos = place(this.root, this.ui.menu, state.rect, { prefer: 'below', align: 'left', gap: 6 });
      slash.x = pos.x;
      slash.y = pos.y;
    }
    slash.ready = true;
    this.render();
    this.ui.menu.querySelector('.afw-is-active')?.scrollIntoView({ block: 'nearest' });
  }

  _hoverSlash(index) {
    if (index !== this.slash.index) this.editor.setSlashIndex(index);
  }

  _updatePlus(info) {
    if (!info.inside || !info.emptyBlock || this.slash.open || this.dragging) {
      this.plus.visible = false;
      return;
    }
    const box = this.root.getBoundingClientRect();
    const block = info.emptyBlock.rect;
    this.plus.y = Math.round(block.top - box.top + block.height / 2 - 12);
    this.plus.x = gutterX(block, box);
    this.plus.visible = true;
  }

  // ---------- Pegangan drag (pindah blok) ----------

  _onBodyHover(event) {
    if (this.readOnly || this.dragging || this.options.dragHandle === false || isCoarsePointer()) return;
    const info = this.editor?.blockAt(event.clientY);
    if (!info || info.empty) return this._hideHandle();
    const box = this.root.getBoundingClientRect();
    const y = Math.round(info.line.top - box.top + info.line.height / 2 - 12);
    const x = gutterX(info.rect, box);
    const { handle } = this;
    if (handle.visible && handle.x === x && handle.y === y && handle.pos === info.pos) return;
    Object.assign(handle, { x, y, pos: info.pos, visible: true });
    this.render();
  }

  _hideHandle() {
    if (this.dragging || !this.handle.visible) return;
    this.handle.visible = false;
    this.render();
  }

  _selectHandleBlock() {
    if (this.handle.pos !== null) this.editor.selectBlock(this.handle.pos);
  }

  _startBlockDrag(event) {
    if (this.handle.pos === null) return event.preventDefault();
    this.dragging = true;
    this.plus.visible = false;
    this.closeBubble();
    this.editor.startBlockDrag(this.handle.pos, event);
  }

  _endBlockDrag() {
    this.dragging = false;
    this.handle.visible = false;
    this.editor.endBlockDrag();
    this.render();
  }

  // ---------- Aksesibilitas toolbar ----------
  // Pola toolbar ARIA: satu tab stop; tombol panah/Home/End berpindah antartombol.

  _visibleToolbarButtons() {
    return this.toolbarButtons.map((b) => b.el).filter((b) => b.offsetParent !== null);
  }

  _initToolbarFocus() {
    if (!this.ui) return;
    this._visibleToolbarButtons().forEach((b, i) => b.setAttribute('tabindex', i === 0 ? '0' : '-1'));
  }

  _toolbarKey(e) {
    const steps = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity };
    if (!(e.key in steps)) return;
    e.preventDefault();
    const buttons = this._visibleToolbarButtons();
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    const step = steps[e.key];
    let next = current + step;
    if (step === Infinity) next = buttons.length - 1;
    else if (step === -Infinity) next = 0;
    else next = (next + buttons.length) % buttons.length;
    buttons.forEach((b, i) => b.setAttribute('tabindex', i === next ? '0' : '-1'));
    buttons[next].focus();
  }
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function ignoreAlpine(node) {
  node.setAttribute('x-ignore', '');
  node._x_ignore = true;
}

// Class & posisi elemen melayang (bubble, media bar, palet).
function floating(node, { open, ready, x, y }) {
  node.classList.toggle('afw-is-open', open);
  node.classList.toggle('afw-is-ready', ready);
  const style = `left: ${x}px; top: ${y}px`;
  if (node.getAttribute('style') !== style) node.setAttribute('style', style);
}
