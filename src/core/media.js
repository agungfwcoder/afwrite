// Media di dalam editor: gambar (dengan upload), embed video, dan pemisah (<hr>).
//
// Gambar & video adalah node <figure> yang isinya teks keterangan (<figcaption>). Elemen
// <img>/<iframe> berada di luar area isi node, jadi tidak bisa terketik; klik pada media
// memilih seluruh node (NodeSelection).

import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { format } from '../i18n.js';
import { createEmbedIframe } from './embed.js';
import { embedOf, MEDIA_NODES } from './schema.js';

export const SIZES = ['wide', 'full'];
export const isMediaNode = (node) => !!node && MEDIA_NODES.includes(node.type.name);

export function mediaKind(node) {
  if (node.type.name === 'horizontalRule') return 'divider';
  return node.type.name === 'embed' ? 'embed' : 'image';
}

// ---------- NodeView <figure> ----------

export class FigureView {
  constructor(node, { captionPlaceholder = '' } = {}) {
    this.node = node;
    this.dom = document.createElement('figure');
    this.contentDOM = document.createElement('figcaption');
    this.contentDOM.dataset.placeholder = captionPlaceholder;

    if (node.type.name === 'embed') {
      this.media = createEmbedIframe(embedOf(node));
      this.media.setAttribute('tabindex', '-1');
      this.dom.setAttribute('data-embed', node.attrs.provider);
    } else {
      this.media = document.createElement('img');
      this.media.setAttribute('draggable', 'false');
    }
    this.dom.append(this.media, this.contentDOM);
    this.render(node);
  }

  render(node) {
    const { attrs } = node;
    toggleAttr(this.dom, 'data-size', attrs.size);
    toggleAttr(this.dom, 'data-afw-uploading', attrs.uploading ? '' : null);
    if (node.type.name === 'image') {
      if (this.media.getAttribute('src') !== attrs.src) this.media.setAttribute('src', attrs.src || '');
      this.media.setAttribute('alt', attrs.alt || '');
    }
    this.contentDOM.classList.toggle('afw-is-empty', node.content.size === 0);
  }

  update(node) {
    if (node.type !== this.node.type) return false;
    if (node.type.name === 'embed' && (node.attrs.id !== this.node.attrs.id || node.attrs.provider !== this.node.attrs.provider)) return false;
    this.node = node;
    this.render(node);
    return true;
  }

  // Perubahan atribut (class/src) dibuat sendiri oleh NodeView; hanya isi keterangan
  // yang perlu dibaca ulang oleh ProseMirror.
  ignoreMutation(mutation) {
    if (mutation.type === 'selection') return false;
    return mutation.type === 'attributes' || !this.contentDOM.contains(mutation.target);
  }
}

function toggleAttr(el, name, value) {
  if (value == null) el.removeAttribute(name);
  else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

// ---------- Perintah: sisipkan blok media ----------
// Paragraf kosong diganti, selain itu media disisipkan setelah blok tingkat teratas tempat
// kursor. Kursor pindah ke paragraf setelah media (dibuat jika belum ada).

export function insertMediaBlock(content) {
  return ({ tr, state, dispatch }) => {
    const node = content.type && typeof content.type === 'object' ? content : state.schema.nodeFromJSON(content);
    const { selection } = tr;
    const { $from } = selection;

    let from;
    let to;
    if ($from.depth === 1 && $from.parent.type.name === 'title') {
      // Mode artikel: media dari judul dipasang tepat di atas judul; kursor tetap di judul.
      if (!dispatch) return true;
      tr.insert($from.before(1), node);
      tr.setSelection(TextSelection.create(tr.doc, selection.from + node.nodeSize));
      tr.scrollIntoView();
      return true;
    }
    if ($from.depth === 1 && $from.parent.type.name === 'subtitle') {
      from = to = $from.after(1);
    } else if (selection instanceof NodeSelection || $from.depth === 0) {
      from = to = selection instanceof NodeSelection ? selection.to : $from.pos;
    } else {
      const top = $from.node(1);
      const isEmptyParagraph = top.type.name === 'paragraph' && top.content.size === 0;
      from = isEmptyParagraph ? $from.before(1) : $from.after(1);
      to = isEmptyParagraph ? $from.after(1) : from;
    }
    if (!dispatch) return true;

    tr.replaceWith(from, to, node);
    const after = from + node.nodeSize;
    const next = tr.doc.nodeAt(after);
    if (!next || isMediaNode(next)) tr.insert(after, state.schema.nodes.paragraph.create());
    tr.setSelection(TextSelection.near(tr.doc.resolve(after + 1)));
    tr.scrollIntoView();
    return true;
  };
}

// Posisi node gambar yang sedang di-upload (id dari atribut `uploading`).
function findUploading(doc, id) {
  let found = null;
  doc.descendants((node, pos) => {
    if (found !== null) return false;
    if (node.type.name === 'image' && node.attrs.uploading === id) found = pos;
    return !node.isBlock || node.type.name === 'doc';
  });
  return found;
}

// ---------- Upload gambar ----------

let uploadCounter = 0;

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Hasil upload: string URL, atau { url, mediaId?, alt? } (mediaId = ID media library aplikasi,
// hanya angka; ditulis sebagai data-media-id). Nilai tidak valid -> null.
export function normalizeUpload(result) {
  const data = typeof result === 'string' ? { url: result } : result && typeof result === 'object' ? result : {};
  const url = typeof data.url === 'string' ? data.url : '';
  const mediaId = data.mediaId ?? data.media_id;
  return {
    url,
    mediaId: /^\d{1,20}$/.test(String(mediaId ?? '')) ? String(mediaId) : null,
    alt: typeof data.alt === 'string' ? data.alt.trim() : '',
  };
}

// Sisipkan file gambar. `upload(file)` -> Promise<url | { url, mediaId, alt }> dari opsi pengguna;
// tanpa itu, gambar disimpan sebagai data URL (base64) di dalam HTML.
export async function insertImageFiles(editor, files) {
  const { upload, maxImageSize } = editor.options;
  const t = editor.strings;
  const images = [...files].filter((f) => /^image\/(png|jpe?g|gif|webp|avif)$/.test(f.type));

  if (!images.length) {
    if (files.length) editor.emit('error', { message: t.errorImageType });
    return;
  }

  for (const file of images) {
    if (maxImageSize && file.size > maxImageSize) {
      const mb = (maxImageSize / 1024 / 1024).toFixed(1).replace(/\.0$/, '');
      editor.emit('error', { message: format(t.errorImageSize, { name: file.name, size: mb }) });
      continue;
    }

    // Pratinjau langsung tampil selama upload berjalan.
    const preview = URL.createObjectURL(file);
    const id = `u${++uploadCounter}`;
    editor.tiptap.commands.insertMediaBlock({ type: 'image', attrs: { src: preview, alt: '', uploading: id } });

    try {
      const { url, mediaId, alt } = normalizeUpload(upload ? await upload(file) : await readAsDataUrl(file));
      if (!url) throw new Error('URL hasil upload kosong');
      updateUploading(editor, id, (tr, pos, node) =>
        tr.setNodeMarkup(pos, null, { ...node.attrs, src: url, mediaId, alt: node.attrs.alt || alt, uploading: null }));
    } catch (err) {
      updateUploading(editor, id, (tr, pos, node) => tr.delete(pos, pos + node.nodeSize));
      editor.emit('error', { message: format(t.errorUpload, { name: file.name }), error: err });
    } finally {
      URL.revokeObjectURL(preview);
    }
  }
}

function updateUploading(editor, id, change) {
  const { state, view } = editor.tiptap;
  const pos = findUploading(state.doc, id);
  if (pos === null) return; // gambar sudah dihapus pengguna selama upload
  const tr = state.tr;
  change(tr, pos, state.doc.nodeAt(pos));
  view.dispatch(tr);
}

// Buka dialog pilih file (tanpa UI khusus; bekerja juga tanpa Alpine).
export function pickImageFiles(editor) {
  const saved = editor.saveSelection();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/gif,image/webp,image/avif';
  input.multiple = true;
  input.addEventListener('change', () => {
    editor.restoreSelection(saved);
    insertImageFiles(editor, input.files);
  });
  input.click();
}
