// Integrasi Alpine.js: adapter tipis di atas create() (src/afwrite.js), yang memegang UI & logika.
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
// Opsi sama dengan create(): toolbar, bubble, stats, dragHandle, name, toolbarItems / bubbleItems,
// format ('html' | 'json'), titleName, autosave, lalu opsi Editor (lang, placeholder, upload, ...).
//
// x-model: tambahkan x-modelable="html", mis.
//   <div x-data="wysiwyg()" x-modelable="html" x-model="post.body"></div>
//
// Event (bubbling dari elemen .afw): wysiwyg-ready, wysiwyg-change, wysiwyg-focus,
// wysiwyg-blur, wysiwyg-error, wysiwyg-image-request.
//
// Untuk layout sendiri, sediakan <div data-afw-editor x-ignore> di dalam komponen;
// markup default tidak akan disuntikkan. State reaktif (active, disabled, values, canUndo, ...)
// dan method (exec, isActive, isDisabled, icon, t, ...) tersedia untuk markup itu.

import { create } from './afwrite.js';
import { ALIGN_ITEMS } from './icons.js';

const EMPTY_META = { image: null, title: '', subtitle: '', slug: '' };
// State UI yang dicerminkan ke data Alpine setiap kali tampilan diperbarui.
const MIRRORED = [
  'html', 'active', 'disabled', 'values', 'readOnly', 'canUndo', 'canRedo', 'draft', 'stats', 'meta',
  'bubble', 'media', 'pop', 'slash', 'plus', 'handle', 'toast', 'dragging',
];

export function wysiwygComponent(options = {}) {
  // Disimpan di closure, bukan di data reaktif, agar instance (yang memegang elemen DOM dan
  // state ProseMirror) tidak dibungkus Proxy oleh Alpine.
  let ui = null;
  // Nilai terakhir yang dicerminkan (lihat _mirror).
  const mirrored = {};

  return {
    html: '',
    active: {},
    disabled: {},
    values: { color: null, highlight: null, align: null },
    readOnly: !!options.readonly,
    canUndo: false,
    canRedo: false,
    draft: null,
    stats: { words: 0, minutes: 0 },
    meta: { ...EMPTY_META },
    bubble: {},
    media: {},
    pop: {},
    slash: {},
    plus: {},
    handle: {},
    toast: {},
    dragging: false,
    name: options.name || '',
    titleName: options.titleName || '',
    format: options.format === 'json' ? 'json' : 'html',
    showToolbar: options.toolbar ?? true,
    showBubble: options.bubble ?? true,
    showStats: options.stats ?? true,
    toolbar: [],
    bubbleItems: [],
    alignItems: ALIGN_ITEMS,
    uid: '',

    init() {
      ui = create(this.$el, options, {
        // Elemen tidak dikembalikan saat destroy: Alpine/Livewire yang mengatur DOM komponen.
        restore: false,
        onRender: (instance) => this._mirror(instance),
      });
      this.toolbar = ui.toolbarItems;
      this.bubbleItems = ui.bubbleItems;
      this.uid = ui.uid;
      this._mirror(ui);

      // Nilai dari luar (x-model / x-modelable / $wire.entangle) -> isi editor. Dibandingkan setelah
      // dinormalisasi: HTML yang sama isinya tapi beda penulisan (mis. hasil sanitasi server) tidak
      // memuat ulang editor, sehingga kursor tidak melompat.
      this.$watch('html', (value) => {
        const editor = ui?.editor;
        if (!editor) return;
        const html = value || '';
        const current = editor.getHTML();
        if (html !== current && editor.normalizeHTML(html) !== current) editor.setHTML(html);
      });

      // Bagian UI yang bisa diubah dari luar, mis. x-effect="showToolbar = mode === 'full'".
      for (const key of ['showToolbar', 'showBubble', 'showStats']) {
        this.$watch(key, (value) => {
          if (!ui) return;
          ui[key] = value;
          if (key === 'showBubble' && !value) ui.closeBubble();
          ui.render();
        });
      }
    },

    destroy() {
      ui?.destroy();
      ui = null;
    },

    // Salin state yang berubah saja, sebagai salinan baru agar Alpine mendeteksi perubahannya.
    // State Alpine sengaja tidak dibaca (dibandingkan dengan salinan di closure): render bisa terjadi
    // di dalam effect milik aplikasi (mis. x-effect="setReadOnly(readonly)"), dan bacaan di sana
    // menjadi dependensi effect itu, sehingga effect berjalan ulang setiap kali state editor berubah.
    _mirror(instance) {
      for (const key of MIRRORED) {
        const value = instance[key];
        const isObject = value && typeof value === 'object';
        if (key in mirrored && (isObject ? shallowEqual(mirrored[key], value) : mirrored[key] === value)) continue;
        mirrored[key] = isObject ? (Array.isArray(value) ? [...value] : { ...value }) : value;
        this[key] = isObject ? (Array.isArray(value) ? [...value] : { ...value }) : value;
      }
    },

    // ---------- API ----------

    exec(name, ...args) {
      return ui?.exec(name, ...args);
    },

    // Deskriptor { src, alt?, mediaId?, size? } atau array-nya, mis. hasil pilihan galeri.
    insertImage(images) {
      ui?.insertImage(images);
    },

    // Ganti gambar terpilih. Tanpa argumen: galeri (imageRequest) atau dialog file.
    replaceImage(image) {
      ui?.replaceImage(image);
    },

    isActive(name) {
      return !!this.active[name];
    },

    isDisabled(name) {
      if (name === 'undo') return !this.canUndo;
      if (name === 'redo') return !this.canRedo;
      return !!this.disabled[name];
    },

    // Bergantung pada `values` agar ikon perataan ikut berubah di layout sendiri.
    icon(name) {
      void this.values.align;
      return ui?.icon(name) ?? '';
    },

    t(key) {
      return ui?.t(key) ?? key;
    },

    hasPop(name) {
      return name === 'color' || name === 'align';
    },

    // Nilai input hidden: HTML, atau JSON jika format: 'json'.
    inputValue() {
      const html = this.html; // dependensi reaktif
      return this.format === 'json' ? JSON.stringify(ui ? ui.getJSON() : { type: 'doc', content: [] }) : html;
    },

    getHTML() {
      return ui?.getHTML() || '';
    },

    setHTML(html) {
      ui?.setHTML(html);
    },

    getJSON() {
      return ui?.getJSON();
    },

    setJSON(doc) {
      ui?.setJSON(doc);
    },

    getMeta() {
      return ui?.getMeta() ?? { ...EMPTY_META };
    },

    setReadOnly(value = true) {
      ui?.setReadOnly(value);
    },

    focus() {
      ui?.focus();
    },

    draftMessage() {
      return this.draft && ui ? ui.draftMessage() : '';
    },

    restoreDraft() {
      ui?.restoreDraft();
    },

    discardDraft() {
      ui?.discardDraft();
    },

    // Dipertahankan untuk kompatibilitas: openLinkInput({ href }).
    openLinkInput({ href = '' } = {}) {
      ui?.openInput('link', href);
    },

    openBlockMenu() {
      ui?.openBlockMenu();
    },

    // Instance Editor untuk pemakaian lanjutan (mis. editor.on(...)).
    editor() {
      return ui?.editor ?? null;
    },
  };
}

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object') return false;
  const keys = Object.keys(b);
  return keys.length === Object.keys(a).length && keys.every((k) => a[k] === b[k]);
}

export default function afwritePlugin(Alpine) {
  Alpine.data('wysiwyg', wysiwygComponent);
}
