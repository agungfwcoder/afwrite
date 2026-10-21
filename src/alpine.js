// Integrasi Alpine.js.
//
//   import Alpine from 'alpinejs';
//   import afwrite from 'afwrite';
//   Alpine.plugin(afwrite);
//
// Pemakaian paling sederhana (UI dibuat otomatis):
//
//   <div x-data="wysiwyg({ name: 'content', placeholder: 'Tulis…' })">
//     <p>Konten awal (opsional)</p>
//   </div>
//
// Opsi UI: toolbar (true), bubble (true), stats (true), dragHandle (true), name (nama input hidden),
// toolbarItems / bubbleItems (susunan tombol sendiri; tombol format yang tidak aktif disaring),
// format ('html' | 'json': isi input hidden), titleName (nama input hidden berisi judul).
// Autosave: opsi autosave: 'kunci-unik'. Draf dihapus otomatis saat form dikirim.
// Opsi lain diteruskan ke Editor (lang, placeholder, upload, readonly, markdown, ...).
//
// x-model: tambahkan x-modelable="html", mis.
//   <div x-data="wysiwyg()" x-modelable="html" x-model="post.body"></div>
//
// Event (bubbling dari elemen .afw): wysiwyg-ready, wysiwyg-change, wysiwyg-focus,
// wysiwyg-blur, wysiwyg-error.
//
// Untuk layout sendiri, sediakan <div data-afw-editor x-ignore> di dalam komponen;
// markup default tidak akan disuntikkan.

import { Editor } from './core/editor.js';
import { parseEmbed } from './core/embed.js';
import { normalizeUrl } from './core/url.js';
import { format as formatText, getStrings } from './i18n.js';
import { normalizeFormats } from './core/formats.js';
import { normalizeHeadings } from './core/sanitize.js';
import { ALIGN_ITEMS, BUBBLE, ICONS, TOOLBAR, withFormats, withHeadings } from './icons.js';
import { TEMPLATE } from './template.js';

const GAP = 10;
const EMPTY_META = { image: null, title: '', subtitle: '', slug: '' };
const EDGE = 8;
const INPUT_PLACEHOLDERS = { link: 'inputLink', embed: 'inputEmbed', alt: 'inputAlt' };
const MEDIA_SIZES = [
  { value: 'normal', label: 'sizeNormal', icon: 'sizeNormal' },
  { value: 'wide', label: 'sizeWide', icon: 'sizeWide' },
  { value: 'full', label: 'sizeFull', icon: 'sizeFull' },
];
// Tombol yang membuka palet (bukan langsung menjalankan perintah).
const POPOVERS = ['color', 'align'];
const EMPTY_VALUES = { color: null, highlight: null, align: null };
let uidCounter = 0;
const isCoarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export function wysiwygComponent(options = {}) {
  // Disimpan di closure, bukan di data reaktif, agar instance Editor (yang memegang
  // elemen DOM dan Range) tidak dibungkus Proxy oleh Alpine.
  let editor = null;
  let root = null; // elemen .afw; disimpan karena $el bisa menunjuk elemen lain saat dipanggil dari event
  let savedRange = null;
  let inputBusy = false;
  let toastTimer = null;
  let cleanup = null;
  const strings = getStrings(options.lang, options.strings);
  // Susunan tombol bawaan mengikuti level judul aktif (bubble: paling banyak 2 level).
  const headings = normalizeHeadings(options.headings);
  // Format tambahan (garis bawah, warna, perataan): tidak ada di mode artikel kecuali diminta.
  const formats = normalizeFormats(options.formats, !!options.title);
  let popTrigger = null; // tombol yang membuka palet
  let popSelection = ''; // posisi seleksi saat palet dibuka
  const selectionKey = () => {
    const { from, to } = editor.tiptap.state.selection;
    return `${from}:${to}`;
  };

  return {
    html: '',
    active: {},
    disabled: {},
    uid: `afw-${++uidCounter}`,
    readOnly: !!options.readonly,
    canUndo: false,
    canRedo: false,
    name: options.name || '',
    format: options.format === 'json' ? 'json' : 'html',
    draft: null,
    toolbar: withFormats(options.toolbarItems || withHeadings(TOOLBAR, headings), formats),
    bubbleItems: withFormats(options.bubbleItems || withHeadings(BUBBLE, headings, 2), formats),
    alignItems: ALIGN_ITEMS,
    // Baris palet warna (diisi setelah editor dibuat, mengikuti opsi colors / highlights).
    paletteRows: [],
    // Nilai format di posisi kursor (warna, stabilo, perataan), untuk palet & ikon perataan.
    values: { ...EMPTY_VALUES },
    pop: { open: false, ready: false, kind: '', x: 0, y: 0 },
    showToolbar: options.toolbar ?? true,
    showBubble: options.bubble ?? true,
    showStats: options.stats ?? true,
    stats: { words: 0, minutes: 0 },
    // Judul/slug terkini (lihat Editor#getMeta), dipakai event & input judul (opsi titleName).
    meta: { ...EMPTY_META },
    titleName: options.titleName || '',
    // mode: format | input | linkinfo; purpose (mode input): link | embed | alt
    bubble: { open: false, ready: false, mode: 'format', purpose: 'link', x: 0, y: 0, url: '', href: '', hasLink: false, error: '' },
    media: { open: false, ready: false, x: 0, y: 0, kind: 'image', size: 'normal', alt: '' },
    mediaSizes: MEDIA_SIZES,
    toast: { open: false, message: '' },
    slash: { open: false, ready: false, items: [], index: 0, x: 0, y: 0 },
    plus: { visible: false, x: 2, y: 0 },
    handle: { visible: false, x: 2, y: 0, pos: null },
    dragging: false,

    init() {
      root = this.$el;
      root.classList.add('afw');

      let el = root.querySelector('[data-afw-editor]');
      let editorOptions = options;
      if (!el) {
        // Isi awal elemen dipakai sebagai konten, lalu diganti markup UI default.
        // Dilakukan di init() agar Alpine belum sempat memproses isi lama.
        const initial = root.innerHTML;
        root.innerHTML = TEMPLATE;
        el = root.querySelector('[data-afw-editor]');
        editorOptions = { ...options, content: options.content ?? initial };
      }

      // Konten editor tidak boleh diproses Alpine: atribut seperti x-init / @click
      // dari konten tersimpan atau hasil paste akan ikut dieksekusi.
      if (!el.hasAttribute('x-ignore')) {
        el.setAttribute('x-ignore', '');
        el._x_ignore = true;
      }

      editor = new Editor(el, editorOptions);
      this.meta = editor.getMeta();
      this.paletteRows = [
        { command: 'color', label: 'textColor', none: 'defaultColor', colors: editor.options.colors },
        { command: 'highlight', label: 'highlight', none: 'noHighlight', colors: editor.options.highlights },
      ].filter((row) => formats.includes(row.command) && row.colors.length);

      editor.on('change', (html) => {
        this.html = html;
        this.handle.visible = false; // posisi blok bisa bergeser
        this.stats = editor.stats();
        this.meta = editor.getMeta();
        root.dispatchEvent(new CustomEvent('wysiwyg-change', { detail: { html, meta: this.meta }, bubbles: true }));
      });
      editor.on('history', ({ canUndo, canRedo }) => {
        this.canUndo = canUndo;
        this.canRedo = canRedo;
      });
      editor.on('readonly', (value) => {
        this.readOnly = value;
        if (value) {
          this.closeBubble();
          this.hideMediaBar();
          this.plus.visible = false;
          this.handle.visible = false;
        }
      });
      editor.on('focus', () => root.dispatchEvent(new CustomEvent('wysiwyg-focus', { bubbles: true })));
      editor.on('blur', () => root.dispatchEvent(new CustomEvent('wysiwyg-blur', { bubbles: true })));
      editor.on('state', (state) => {
        this.active = state;
        this.disabled = editor.disabledState();
        this.values = editor.formatValues();
      });
      editor.on('selection', (info) => this.onSelection(info));
      editor.on('slash', (state) => this.onSlash(state));
      editor.on('linkrequest', ({ href }) => this.openInput('link', href));
      editor.on('embedrequest', () => this.openInput('embed'));
      editor.on('error', (detail) => {
        this.showToast(detail.message);
        root.dispatchEvent(new CustomEvent('wysiwyg-error', { detail, bubbles: true }));
      });

      this.html = editor.getHTML();
      this.stats = editor.stats();
      this.canUndo = editor.canUndo();
      this.draft = editor.draft || null;

      // Drag blok selesai (drop atau dibatalkan) di mana pun: browser bisa tidak mengirim dragend
      // ke pegangan yang sudah disembunyikan saat isi editor berubah.
      const finishDrag = () => this.dragging && this.endBlockDrag();
      // Klik di luar palet atau Esc (fokus tetap di editor selama palet terbuka) menutupnya.
      const outsidePop = (e) => {
        if (this.pop.open && !this.$refs.pop?.contains(e.target) && !popTrigger?.contains(e.target)) this.closePop();
      };
      const escapePop = (e) => {
        if (e.key !== 'Escape' || !this.pop.open) return;
        e.preventDefault();
        e.stopPropagation();
        this.closePop();
      };
      root.addEventListener('keydown', escapePop, true);
      document.addEventListener('drop', finishDrag, true);
      document.addEventListener('dragend', finishDrag, true);
      document.addEventListener('mousedown', outsidePop, true);
      cleanup = () => {
        document.removeEventListener('drop', finishDrag, true);
        document.removeEventListener('dragend', finishDrag, true);
        document.removeEventListener('mousedown', outsidePop, true);
        root.removeEventListener('keydown', escapePop, true);
      };

      // Draf autosave tidak diperlukan lagi setelah form dikirim.
      root.closest('form')?.addEventListener('submit', () => {
        if (this.draft) editor.discardDraft();
        editor.clearDraft();
      });
      this.readOnly = editor.readOnly;

      // Nilai dari luar (x-model / x-modelable / $wire.entangle) -> isi editor. Dibandingkan setelah
      // dinormalisasi: HTML yang sama isinya tapi beda penulisan (mis. hasil sanitasi server) tidak
      // memuat ulang editor, sehingga kursor tidak melompat.
      this.$watch('html', (value) => {
        if (!editor) return;
        const html = value || '';
        const current = editor.getHTML();
        if (html !== current && editor.normalizeHTML(html) !== current) editor.setHTML(html);
      });

      this.$nextTick(() => {
        this.initToolbarFocus();
        root.dispatchEvent(new CustomEvent('wysiwyg-ready', { detail: { editor }, bubbles: true }));
      });
    },

    destroy() {
      clearTimeout(toastTimer);
      cleanup?.();
      editor?.destroy();
      editor = null;
    },

    // ---------- API ----------

    exec(name, ...args) {
      editor?.exec(name, ...args);
    },

    isActive(name) {
      return !!this.active[name];
    },

    icon(name) {
      // Tombol perataan menampilkan perataan di posisi kursor.
      if (name === 'align') return ICONS[`align${capitalize(this.values.align || 'left')}`];
      // Hanya dua level judul: tampil sebagai T besar dan t kecil.
      if (headings.length === 2 && /^h[2-6]$/.test(name) && headings.includes(Number(name[1]))) {
        return ICONS[Number(name[1]) === headings[0] ? 'headingLarge' : 'headingSmall'];
      }
      return ICONS[name] || '';
    },

    t(key) {
      return strings[key] ?? key;
    },

    // Nilai input hidden: HTML, atau JSON jika format: 'json'.
    inputValue() {
      const html = this.html; // dependensi reaktif
      return this.format === 'json' ? JSON.stringify(editor ? editor.getJSON() : { type: 'doc', content: [] }) : html;
    },

    getJSON() {
      return editor?.getJSON();
    },

    getMeta() {
      return editor?.getMeta() ?? { ...EMPTY_META };
    },

    setJSON(doc) {
      editor?.setJSON(doc);
    },

    // ---------- Palet warna & perataan ----------

    hasPop(name) {
      return POPOVERS.includes(name);
    },

    // Klik tombol toolbar/bubble: tombol palet membuka palet, lainnya langsung dijalankan.
    onItem(name, event) {
      if (!this.hasPop(name)) {
        this.closePop();
        return this.exec(name);
      }
      if (this.pop.open && this.pop.kind === name) return this.closePop();
      this.openPop(name, event?.currentTarget);
    },

    openPop(kind, trigger) {
      if (this.readOnly || !editor || !trigger) return;
      if (!editor.hasFocus()) editor.focus();
      popTrigger = trigger;
      popSelection = selectionKey();
      Object.assign(this.pop, { open: true, ready: false, kind });
      this.$nextTick(() => {
        // Dari bubble (di atas seleksi): palet di atasnya; dari toolbar: di bawah tombol.
        const inBubble = !!trigger.closest('.afw-bubble');
        const prefer = inBubble && !isCoarsePointer() ? 'above' : 'below';
        const pos = this.place(this.$refs.pop, trigger.getBoundingClientRect(), { prefer, gap: 6 });
        this.pop.x = pos.x;
        this.pop.y = pos.y;
        this.pop.ready = true;
      });
    },

    closePop(refocus = false) {
      if (!this.pop.open) return;
      this.pop.open = false;
      this.pop.ready = false;
      if (refocus) popTrigger?.focus();
      popTrigger = null;
    },

    applyPop(name, value) {
      editor?.exec(name, value);
      this.closePop();
    },

    // ---------- Draf autosave ----------

    draftMessage() {
      if (!this.draft) return '';
      const time = new Date(this.draft.time).toLocaleString(options.lang === 'id' ? 'id' : 'en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      return formatText(this.t('draftFound'), { time });
    },

    restoreDraft() {
      editor.restoreDraft();
      this.draft = null;
    },

    discardDraft() {
      editor.discardDraft();
      this.draft = null;
    },

    isDisabled(name) {
      if (name === 'undo') return !this.canUndo;
      if (name === 'redo') return !this.canRedo;
      return !!this.disabled[name];
    },

    setReadOnly(value = true) {
      editor?.setReadOnly(value);
    },

    // Instance Editor untuk pemakaian lanjutan (mis. editor.on(...)).
    editor() {
      return editor;
    },

    // ---------- Aksesibilitas toolbar ----------
    // Pola toolbar ARIA: satu tab stop; tombol panah/Home/End berpindah antartombol.

    toolbarButtons() {
      return [...root.querySelectorAll('.afw-toolbar .afw-btn')].filter((b) => b.offsetParent !== null);
    },

    initToolbarFocus() {
      this.toolbarButtons().forEach((b, i) => b.setAttribute('tabindex', i === 0 ? '0' : '-1'));
    },

    moveFocus(event, step) {
      const buttons = this.toolbarButtons();
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      let next = current + step;
      if (step === Infinity) next = buttons.length - 1;
      else if (step === -Infinity) next = 0;
      else next = (next + buttons.length) % buttons.length;
      buttons.forEach((b, i) => b.setAttribute('tabindex', i === next ? '0' : '-1'));
      buttons[next].focus();
    },

    setHTML(html) {
      editor?.setHTML(html);
    },

    getHTML() {
      return editor?.getHTML() || '';
    },

    focus() {
      editor?.focus();
    },

    // ---------- Posisi UI melayang ----------

    // Hitung posisi elemen melayang terhadap `rect` (koordinat layar), lalu ubah
    // ke koordinat relatif terhadap root `.afw`. Tidak keluar dari layar.
    place(el, rect, { prefer = 'above', align = 'center', gap = GAP } = {}) {
      const box = root.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      let left = align === 'center' ? rect.left + rect.width / 2 - w / 2 : rect.left;
      left = Math.max(EDGE, Math.min(left, window.innerWidth - w - EDGE));

      const above = rect.top - h - gap;
      const below = rect.bottom + gap;
      const fitsAbove = above >= EDGE;
      const fitsBelow = below + h <= window.innerHeight - EDGE;
      const top = prefer === 'above'
        ? (fitsAbove || !fitsBelow ? above : below)
        : (fitsBelow || !fitsAbove ? below : above);

      return { x: Math.round(left - box.left), y: Math.round(top - box.top) };
    },

    // ---------- Bubble ----------

    onSelection(info) {
      // Seleksi pindah (klik di teks lain, dll.) atau editor kehilangan fokus: palet ditutup.
      if (this.pop.open && (!info.inside || selectionKey() !== popSelection)) this.closePop();
      // Sedang mengisi input (URL/alt): fokus ada di input, seleksi editor diabaikan.
      if (this.bubble.open && this.bubble.mode === 'input') return;
      if (this.readOnly) return;

      this.updatePlus(info);

      if (info.media) {
        this.closeBubble();
        return this.showMediaBar(info.media);
      }
      this.hideMediaBar();

      // Bubble format tidak berlaku di blok kode (isinya teks polos).
      if (!info.inside || info.dragging || info.inCode || this.slash.open || !this.showBubble) return this.closeBubble();
      if (!info.collapsed) return this.showBubbleAt('format', info.rect);
      if (info.link) {
        this.bubble.href = info.link.href;
        return this.showBubbleAt('linkinfo', info.link.rect);
      }
      this.closeBubble();
    },

    showBubbleAt(mode, rect) {
      const sameMode = this.bubble.open && this.bubble.mode === mode;
      this.bubble.mode = mode;
      this.bubble.open = true;
      if (!sameMode) this.bubble.ready = false;

      this.$nextTick(() => {
        // Di perangkat sentuh, menu bawaan OS muncul di atas seleksi -> bubble di bawah.
        const prefer = isCoarsePointer() && mode === 'format' ? 'below' : 'above';
        const pos = this.place(this.$refs.bubble, rect, { prefer });
        this.bubble.x = pos.x;
        this.bubble.y = pos.y;
        this.bubble.ready = true;
      });
    },

    closeBubble() {
      this.bubble.open = false;
      this.bubble.ready = false;
      this.bubble.mode = 'format';
      this.bubble.error = '';
    },

    // ---------- Input: link, video, alt text ----------

    inputPlaceholder() {
      return this.t(INPUT_PLACEHOLDERS[this.bubble.purpose]) || '';
    },

    openInput(purpose, value = '') {
      savedRange = editor.saveSelection();
      const rect = purpose === 'alt' ? this.mediaRect() : editor.selectionRect();
      if (!rect) return;

      this.hideMediaBar();
      this.bubble.purpose = purpose;
      this.bubble.url = value || '';
      this.bubble.hasLink = purpose === 'link' && !!value;
      this.bubble.error = '';
      this.showBubbleAt('input', rect);
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
        this.$refs.linkInput.select();
      });
    },

    // Dipertahankan untuk kompatibilitas: openLinkInput({ href }).
    openLinkInput({ href = '' } = {}) {
      this.openInput('link', href);
    },

    applyInput() {
      const value = this.bubble.url.trim();
      const purpose = this.bubble.purpose;

      if (purpose === 'link') {
        if (value && !normalizeUrl(value)) return (this.bubble.error = this.t('errorUrl'));
        return this.withEditorFocus(() => (value ? editor.exec('link', value) : editor.exec('unlink')));
      }
      if (purpose === 'embed') {
        if (!value) return this.cancelInput();
        if (!parseEmbed(value)) return (this.bubble.error = this.t('errorEmbed'));
        return this.withEditorFocus(() => editor.exec('embed', value));
      }
      if (purpose === 'alt') {
        return this.withEditorFocus(() => editor.setMediaAlt(value));
      }
    },

    removeLink() {
      this.withEditorFocus(() => editor.exec('unlink'));
    },

    cancelInput() {
      if (this.bubble.mode !== 'input') return this.closeBubble();
      const purpose = this.bubble.purpose;
      this.withEditorFocus(() => purpose === 'alt' && editor.setMediaAlt(this.media.alt));
    },

    // Fokus pindah dari input ke tempat lain (klik di luar) -> tutup tanpa menyimpan.
    onInputBlur() {
      if (!inputBusy && this.bubble.mode === 'input') this.closeBubble();
    },

    withEditorFocus(callback) {
      inputBusy = true;
      this.closeBubble();
      editor.restoreSelection(savedRange);
      callback();
      savedRange = null;
      inputBusy = false;
    },

    // ---------- Media ----------

    showMediaBar({ kind, size, alt, rect }) {
      const wasOpen = this.media.open;
      Object.assign(this.media, { open: true, kind, size, alt });
      if (!wasOpen) this.media.ready = false;
      this.$nextTick(() => {
        const pos = this.place(this.$refs.mediabar, rect, { prefer: 'above' });
        this.media.x = pos.x;
        this.media.y = pos.y;
        this.media.ready = true;
      });
    },

    hideMediaBar() {
      this.media.open = false;
      this.media.ready = false;
    },

    mediaRect() {
      return root.querySelector('.afw-content .afw-is-selected')?.getBoundingClientRect() || null;
    },

    setMediaSize(size) {
      editor.setMediaSize(size);
    },

    editAlt() {
      this.openInput('alt', this.media.alt);
    },

    removeMedia() {
      editor.removeMedia();
    },

    showToast(message) {
      this.toast.message = message;
      this.toast.open = true;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (this.toast.open = false), 4000);
    },

    // ---------- Slash menu & tombol + ----------

    onSlash(state) {
      this.slash.items = state.items;
      this.slash.index = state.index;

      // Pembaca layar: editor "mengendalikan" listbox slash menu.
      if (state.open && state.items.length) {
        editor.el.setAttribute('aria-controls', `${this.uid}-menu`);
        editor.el.setAttribute('aria-activedescendant', `${this.uid}-opt-${state.index}`);
      } else {
        editor.el.removeAttribute('aria-activedescendant');
      }

      if (!state.open) {
        this.slash.open = false;
        this.slash.ready = false;
        return;
      }

      const wasOpen = this.slash.open;
      this.slash.open = true;
      this.plus.visible = false;
      this.closeBubble();

      this.$nextTick(() => {
        // Posisi dikunci saat menu dibuka agar tidak melompat ketika daftar menyusut.
        if (!wasOpen || !this.slash.ready) {
          const pos = this.place(this.$refs.menu, state.rect, { prefer: 'below', align: 'left', gap: 6 });
          this.slash.x = pos.x;
          this.slash.y = pos.y;
        }
        this.slash.ready = true;
        this.$refs.menu.querySelector('.afw-is-active')?.scrollIntoView({ block: 'nearest' });
      });
    },

    applySlash(index) {
      editor.applySlash(index);
    },

    hoverSlash(index) {
      if (index !== this.slash.index) editor.setSlashIndex(index);
    },

    openBlockMenu() {
      editor.openSlash();
    },

    updatePlus(info) {
      if (!info.inside || !info.emptyBlock || this.slash.open || this.dragging) {
        this.plus.visible = false;
        return;
      }
      const box = root.getBoundingClientRect();
      const block = info.emptyBlock.rect;
      this.plus.y = Math.round(block.top - box.top + block.height / 2 - 12);
      this.plus.x = gutterX(block, box);
      this.plus.visible = true;
    },

    // ---------- Pegangan drag (pindah blok) ----------

    onBodyHover(event) {
      if (this.readOnly || this.dragging || options.dragHandle === false || isCoarsePointer()) return;
      const info = editor?.blockAt(event.clientY);
      if (!info || info.empty) return this.hideHandle();
      const box = root.getBoundingClientRect();
      this.handle.y = Math.round(info.line.top - box.top + info.line.height / 2 - 12);
      this.handle.x = gutterX(info.rect, box);
      this.handle.pos = info.pos;
      this.handle.visible = true;
    },

    hideHandle() {
      if (!this.dragging) this.handle.visible = false;
    },

    selectHandleBlock() {
      if (this.handle.pos !== null) editor.selectBlock(this.handle.pos);
    },

    startBlockDrag(event) {
      if (this.handle.pos === null) return event.preventDefault();
      this.dragging = true;
      this.closeBubble();
      this.plus.visible = false;
      editor.startBlockDrag(this.handle.pos, event);
    },

    endBlockDrag() {
      this.dragging = false;
      this.handle.visible = false;
      editor.endBlockDrag();
    },
  };
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Posisi kiri tombol di celah kiri konten: tepat sebelum tepi kiri blok (lebar tombol 24px).
function gutterX(blockRect, rootRect) {
  return Math.max(2, Math.round(blockRect.left - rootRect.left - 30));
}

export default function afwritePlugin(Alpine) {
  Alpine.data('wysiwyg', wysiwygComponent);
}
