// Integrasi Alpine.js.
//
//   import Alpine from 'alpinejs';
//   import wyswyg from 'wyswyg';
//   Alpine.plugin(wyswyg);
//
// Pemakaian paling sederhana (UI dibuat otomatis):
//
//   <div x-data="wysiwyg({ name: 'content', placeholder: 'Tulis…' })">
//     <p>Konten awal (opsional)</p>
//   </div>
//
// Opsi UI: toolbar (true), bubble (true), stats (true), name (nama input hidden).
// Opsi lain diteruskan ke Editor (placeholder, markdown, slash, pasteAsPlainText, ...).
//
// Untuk layout sendiri, sediakan <div data-afw-editor x-ignore> di dalam komponen;
// markup default tidak akan disuntikkan.

import { Editor } from './core/editor.js';
import { parseEmbed } from './core/embed.js';
import { normalizeUrl } from './core/url.js';
import { BUBBLE, ICONS, TOOLBAR } from './icons.js';
import { TEMPLATE } from './template.js';

const GAP = 10;
const EDGE = 8;
const INPUT_PLACEHOLDERS = {
  link: 'Tempel atau ketik URL…',
  embed: 'Tempel link YouTube atau Vimeo…',
  alt: 'Deskripsikan gambar untuk pembaca layar…',
};
const MEDIA_SIZES = [
  { value: 'normal', label: 'Ukuran normal', icon: 'sizeNormal' },
  { value: 'wide', label: 'Lebar', icon: 'sizeWide' },
  { value: 'full', label: 'Penuh', icon: 'sizeFull' },
];
const isCoarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export function wysiwygComponent(options = {}) {
  // Disimpan di closure, bukan di data reaktif, agar instance Editor (yang memegang
  // elemen DOM dan Range) tidak dibungkus Proxy oleh Alpine.
  let editor = null;
  let root = null; // elemen .afw; disimpan karena $el bisa menunjuk elemen lain saat dipanggil dari event
  let savedRange = null;
  let inputBusy = false;
  let toastTimer = null;

  return {
    html: '',
    active: {},
    name: options.name || '',
    toolbar: options.toolbarItems || TOOLBAR,
    bubbleItems: options.bubbleItems || BUBBLE,
    showToolbar: options.toolbar ?? true,
    showBubble: options.bubble ?? true,
    showStats: options.stats ?? true,
    stats: { words: 0, minutes: 0 },
    // mode: format | input | linkinfo; purpose (mode input): link | embed | alt
    bubble: { open: false, ready: false, mode: 'format', purpose: 'link', x: 0, y: 0, url: '', href: '', hasLink: false, error: '' },
    media: { open: false, ready: false, x: 0, y: 0, kind: 'image', size: 'normal', alt: '' },
    mediaSizes: MEDIA_SIZES,
    toast: { open: false, message: '' },
    slash: { open: false, ready: false, items: [], index: 0, x: 0, y: 0 },
    plus: { visible: false, y: 0 },

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

      editor.on('change', (html) => {
        this.html = html;
        this.stats = editor.stats();
        this.$dispatch('wysiwyg-change', { html });
      });
      editor.on('state', (state) => (this.active = state));
      editor.on('selection', (info) => this.onSelection(info));
      editor.on('slash', (state) => this.onSlash(state));
      editor.on('linkrequest', ({ href }) => this.openInput('link', href));
      editor.on('embedrequest', () => this.openInput('embed'));
      editor.on('error', ({ message }) => this.showToast(message));

      this.html = editor.getHTML();
      this.stats = editor.stats();
    },

    destroy() {
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
      return ICONS[name] || '';
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
      // Sedang mengisi input (URL/alt): fokus ada di input, seleksi editor diabaikan.
      if (this.bubble.open && this.bubble.mode === 'input') return;

      this.updatePlus(info);

      if (info.media) {
        this.closeBubble();
        return this.showMediaBar(info.media);
      }
      this.hideMediaBar();

      if (!info.inside || info.dragging || this.slash.open || !this.showBubble) return this.closeBubble();
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
      return INPUT_PLACEHOLDERS[this.bubble.purpose] || '';
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
        if (value && !normalizeUrl(value)) return (this.bubble.error = 'URL tidak valid');
        return this.withEditorFocus(() => (value ? editor.exec('link', value) : editor.exec('unlink')));
      }
      if (purpose === 'embed') {
        if (!value) return this.cancelInput();
        if (!parseEmbed(value)) return (this.bubble.error = 'Link video tidak dikenali (YouTube/Vimeo)');
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
      if (!info.inside || !info.emptyBlock || this.slash.open) {
        this.plus.visible = false;
        return;
      }
      const box = root.getBoundingClientRect();
      const block = info.emptyBlock.rect;
      this.plus.y = Math.round(block.top - box.top + block.height / 2 - 14);
      this.plus.visible = true;
    },
  };
}

export default function wyswygPlugin(Alpine) {
  Alpine.data('wysiwyg', wysiwygComponent);
}
