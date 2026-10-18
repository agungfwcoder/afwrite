// Teks antarmuka. Pilih dengan opsi `lang` ('id' | 'en'), dan timpa sebagian
// dengan opsi `strings`, mis. { placeholder: 'Mulai…', bold: 'Fett' }.

const id = {
  placeholder: 'Mulai menulis… ketik / untuk pilihan blok',
  editorLabel: 'Editor teks',
  toolbarLabel: 'Format teks',
  mediaToolbarLabel: 'Atur media',

  bold: 'Tebal',
  italic: 'Miring',
  link: 'Link',
  h2: 'Judul',
  h3: 'Subjudul',
  h4: 'Judul 4',
  h5: 'Judul 5',
  h6: 'Judul 6',
  quote: 'Kutipan',
  codeblock: 'Blok kode',
  ul: 'Daftar berpoin',
  ol: 'Daftar bernomor',
  undo: 'Urungkan',
  redo: 'Ulangi',

  blocksTitle: 'Blok',
  noResults: 'Tidak ada hasil',
  addBlock: 'Tambah blok',
  blocks: {
    paragraph: ['Teks', 'Paragraf biasa'],
    h2: ['Judul', 'Judul bagian yang besar'],
    h3: ['Subjudul', 'Judul bagian yang lebih kecil'],
    h4: ['Judul 4', 'Judul tingkat 4'],
    h5: ['Judul 5', 'Judul tingkat 5'],
    h6: ['Judul 6', 'Judul tingkat 6'],
    quote: ['Kutipan', 'Menyorot kutipan'],
    ul: ['Daftar berpoin', 'Daftar sederhana'],
    ol: ['Daftar bernomor', 'Daftar berurutan'],
    codeblock: ['Kode', 'Blok kode program'],
    image: ['Gambar', 'Unggah dari perangkat'],
    embed: ['Video', 'YouTube atau Vimeo'],
    hr: ['Pemisah', 'Garis pemisah antarbagian'],
  },

  inputLink: 'Tempel atau ketik URL…',
  inputEmbed: 'Tempel link YouTube atau Vimeo…',
  inputAlt: 'Deskripsikan gambar untuk pembaca layar…',
  save: 'Simpan',
  cancel: 'Batal',
  editLink: 'Ubah link',
  removeLink: 'Hapus link',

  sizeNormal: 'Ukuran normal',
  sizeWide: 'Lebar',
  sizeFull: 'Penuh',
  altText: 'Alt text',
  removeMedia: 'Hapus media',
  captionPlaceholder: 'Tulis keterangan (opsional)',

  words: 'kata',
  minutesRead: 'menit baca',

  draftFound: 'Ada draf yang belum tersimpan dari {time}.',
  draftRestore: 'Pulihkan',
  draftDiscard: 'Buang',

  promptUrl: 'Masukkan URL',
  promptEmbed: 'Tempel link YouTube atau Vimeo',
  errorUrl: 'URL tidak valid',
  errorEmbed: 'Link video tidak dikenali (YouTube/Vimeo)',
  errorImageType: 'Format gambar tidak didukung (pakai PNG, JPG, GIF, WebP, atau AVIF).',
  errorImageSize: '"{name}" lebih dari {size} MB.',
  errorUpload: 'Gagal mengunggah "{name}".',
};

const en = {
  placeholder: 'Start writing… type / for blocks',
  editorLabel: 'Text editor',
  toolbarLabel: 'Text formatting',
  mediaToolbarLabel: 'Media options',

  bold: 'Bold',
  italic: 'Italic',
  link: 'Link',
  h2: 'Heading',
  h3: 'Subheading',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  quote: 'Quote',
  codeblock: 'Code block',
  ul: 'Bulleted list',
  ol: 'Numbered list',
  undo: 'Undo',
  redo: 'Redo',

  blocksTitle: 'Blocks',
  noResults: 'No results',
  addBlock: 'Add block',
  blocks: {
    paragraph: ['Text', 'Plain paragraph'],
    h2: ['Heading', 'Large section heading'],
    h3: ['Subheading', 'Smaller section heading'],
    h4: ['Heading 4', 'Level 4 heading'],
    h5: ['Heading 5', 'Level 5 heading'],
    h6: ['Heading 6', 'Level 6 heading'],
    quote: ['Quote', 'Highlight a quotation'],
    ul: ['Bulleted list', 'Simple list'],
    ol: ['Numbered list', 'Ordered list'],
    codeblock: ['Code', 'Code block'],
    image: ['Image', 'Upload from your device'],
    embed: ['Video', 'YouTube or Vimeo'],
    hr: ['Divider', 'Separate sections'],
  },

  inputLink: 'Paste or type a URL…',
  inputEmbed: 'Paste a YouTube or Vimeo link…',
  inputAlt: 'Describe the image for screen readers…',
  save: 'Save',
  cancel: 'Cancel',
  editLink: 'Edit link',
  removeLink: 'Remove link',

  sizeNormal: 'Normal size',
  sizeWide: 'Wide',
  sizeFull: 'Full width',
  altText: 'Alt text',
  removeMedia: 'Remove media',
  captionPlaceholder: 'Write a caption (optional)',

  words: 'words',
  minutesRead: 'min read',

  draftFound: 'You have an unsaved draft from {time}.',
  draftRestore: 'Restore',
  draftDiscard: 'Discard',

  promptUrl: 'Enter a URL',
  promptEmbed: 'Paste a YouTube or Vimeo link',
  errorUrl: 'Invalid URL',
  errorEmbed: 'Video link not recognized (YouTube/Vimeo)',
  errorImageType: 'Unsupported image format (use PNG, JPG, GIF, WebP, or AVIF).',
  errorImageSize: '"{name}" is larger than {size} MB.',
  errorUpload: 'Failed to upload "{name}".',
};

export const LOCALES = { id, en };

export function getStrings(lang = 'id', overrides = {}) {
  const base = LOCALES[lang] || LOCALES.id;
  return {
    ...base,
    ...overrides,
    blocks: { ...base.blocks, ...(overrides.blocks || {}) },
  };
}

// format('"{name}" gagal', { name: 'a.png' }) -> '"a.png" gagal'
export function format(text, values = {}) {
  return String(text).replace(/\{(\w+)\}/g, (m, key) => (key in values ? values[key] : m));
}
