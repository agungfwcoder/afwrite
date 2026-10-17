// Media di dalam editor: gambar (dengan upload), embed video, dan pemisah (<hr>).
//
// Di DOM editor, <figure> dibuat contenteditable="false" agar tidak bisa "terketik"
// sebagian, sementara <figcaption> di dalamnya tetap bisa diedit. Atribut khusus editor
// ini dibuang oleh sanitize() saat output.

import { format } from '../i18n.js';
import { createEmbedIframe, parseEmbed } from './embed.js';
import { placeCaretAtEnd, restoreSelection } from './selection.js';
const SIZES = ['wide', 'full'];

export const isMediaNode = (node) =>
  node?.nodeType === Node.ELEMENT_NODE && (node.tagName === 'FIGURE' || node.tagName === 'HR');

export function mediaKind(node) {
  if (node.tagName === 'HR') return 'divider';
  return node.querySelector('iframe') ? 'embed' : 'image';
}

// Siapkan media setelah konten berubah (setHTML, paste, dll.).
export function prepareMedia(root, captionPlaceholder = '', editable = true) {
  root.querySelectorAll(':scope > figure').forEach((figure) => {
    if (figure.getAttribute('contenteditable') !== 'false') figure.setAttribute('contenteditable', 'false');
    // Mode baca saja: keterangan kosong tidak perlu ditampilkan/dibuat.
    if (!editable) {
      figure.querySelector(':scope > figcaption')?.setAttribute('contenteditable', 'false');
      return;
    }

    let caption = figure.querySelector(':scope > figcaption');
    if (!caption) {
      caption = document.createElement('figcaption');
      figure.append(caption);
    }
    if (caption.getAttribute('contenteditable') !== 'true') caption.setAttribute('contenteditable', 'true');
    caption.dataset.placeholder = captionPlaceholder;

    figure.querySelector(':scope > img')?.setAttribute('draggable', 'false');
    figure.querySelector(':scope > iframe')?.setAttribute('tabindex', '-1');
  });
  root.querySelectorAll(':scope > hr').forEach((hr) => hr.setAttribute('contenteditable', 'false'));

  // Selalu ada paragraf setelah media terakhir agar kursor bisa diletakkan di sana.
  const last = root.lastElementChild;
  if (isMediaNode(last)) root.append(emptyParagraph());
}

export function emptyParagraph() {
  const p = document.createElement('p');
  p.append(document.createElement('br'));
  return p;
}

export function createImageFigure(src, alt = '') {
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.setAttribute('src', src);
  img.setAttribute('alt', alt);
  figure.append(img);
  return figure;
}

export function createEmbedFigure(url) {
  const embed = parseEmbed(url);
  if (!embed) return null;
  const figure = document.createElement('figure');
  figure.setAttribute('data-embed', embed.provider);
  figure.append(createEmbedIframe(embed));
  return figure;
}

// Blok tingkat teratas yang memuat posisi kursor.
export function topBlockAtCaret(root) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  let node = sel.getRangeAt(0).startContainer;
  if (!root.contains(node)) return null;
  while (node && node.parentNode !== root) node = node.parentNode;
  return node === root ? null : node;
}

// Sisipkan blok media di posisi kursor: paragraf kosong diganti, selain itu disisipkan
// setelah blok tempat kursor. Kursor pindah ke paragraf setelah media.
export function insertMediaBlock(root, node, captionPlaceholder = '') {
  const current = topBlockAtCaret(root);
  const isEmptyParagraph = current?.tagName === 'P' && !current.textContent.trim() && !current.querySelector('img');

  if (current && isEmptyParagraph) current.replaceWith(node);
  else if (current) current.after(node);
  else root.append(node);

  let next = node.nextElementSibling;
  if (!next || isMediaNode(next)) {
    next = emptyParagraph();
    node.after(next);
  }
  prepareMedia(root, captionPlaceholder);
  placeCaretIn(next, 'start');
  return node;
}

export function placeCaretIn(block, where = 'start') {
  if (where === 'end') return placeCaretAtEnd(block);
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(true);
  restoreSelection(range);
}

export function setMediaSize(node, size) {
  if (node?.tagName !== 'FIGURE') return;
  if (SIZES.includes(size)) node.setAttribute('data-size', size);
  else node.removeAttribute('data-size');
}

// ---------- Upload gambar ----------

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Sisipkan file gambar. `upload(file)` -> Promise<url> dari opsi pengguna;
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
    const figure = createImageFigure(preview, '');
    figure.setAttribute('data-afw-uploading', '');
    insertMediaBlock(editor.el, figure, editor.strings.captionPlaceholder);
    editor._handleChange();

    try {
      const url = upload ? await upload(file) : await readAsDataUrl(file);
      if (!url) throw new Error('URL hasil upload kosong');
      figure.querySelector('img').setAttribute('src', url);
      figure.removeAttribute('data-afw-uploading');
    } catch (err) {
      figure.remove();
      editor.emit('error', { message: format(t.errorUpload, { name: file.name }), error: err });
    } finally {
      URL.revokeObjectURL(preview);
      prepareMedia(editor.el, t.captionPlaceholder);
      editor._handleChange();
    }
  }
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
