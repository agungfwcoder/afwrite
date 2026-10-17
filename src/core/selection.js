// Helper seputar Selection & Range API.

export const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, blockquote, li, pre, div';

export function getRange() {
  const sel = window.getSelection();
  return sel && sel.rangeCount ? sel.getRangeAt(0) : null;
}

export function isSelectionInside(root) {
  const range = getRange();
  return !!range && root.contains(range.commonAncestorContainer);
}

// Elemen terdekat (dari posisi kursor) yang cocok dengan selector, dibatasi di dalam root.
export function closestInRoot(root, selector) {
  const range = getRange();
  if (!range || !root.contains(range.startContainer)) return null;

  let node = range.startContainer;
  if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;

  const found = node && node.closest(selector);
  return found && found !== root && root.contains(found) ? found : null;
}

export function currentBlockTag(root) {
  const block = closestInRoot(root, BLOCK_SELECTOR);
  return block ? block.tagName.toLowerCase() : null;
}

export function saveSelection() {
  const range = getRange();
  return range ? range.cloneRange() : null;
}

export function restoreSelection(range) {
  if (!range) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export function selectNode(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  restoreSelection(range);
}

const TEXT_CONTAINERS = /^(P|H[1-6]|BLOCKQUOTE|UL|OL|LI|DIV)$/;

// Kursor di akhir isi elemen. Turun ke blok teks terakhir, dan jika blok diakhiri
// <br> placeholder, kursor diletakkan SEBELUM <br>: Chrome menormalkan ini sendiri,
// tetapi Safari/Firefox akan mengetik setelah <br> (baris baru yang tidak terlihat).
export function placeCaretAtEnd(el) {
  let target = el;
  while (target.lastElementChild && TEXT_CONTAINERS.test(target.lastElementChild.tagName)) {
    target = target.lastElementChild;
  }
  const range = document.createRange();
  if (target.lastChild?.nodeName === 'BR') {
    range.setStartBefore(target.lastChild);
    range.collapse(true);
  } else {
    range.selectNodeContents(target);
    range.collapse(false);
  }
  restoreSelection(range);
}

// Jumlah karakter dari awal `el` sampai kursor.
export function textOffsetIn(el) {
  const range = getRange();
  if (!range || !el.contains(range.startContainer)) return 0;
  const before = document.createRange();
  before.setStart(el, 0);
  before.setEnd(range.startContainer, range.startOffset);
  return before.toString().length;
}

// Letakkan kursor setelah karakter ke-`offset` di dalam `el` (atau di akhir).
export function placeCaretAtTextOffset(el, offset) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (remaining <= node.length) {
      const range = document.createRange();
      range.setStart(node, remaining);
      range.collapse(true);
      return restoreSelection(range);
    }
    remaining -= node.length;
  }
  placeCaretAtEnd(el);
}

// Range ikut bergeser saat node dipindah, jadi yang disimpan adalah node + offset mentah.
export function rememberSelection() {
  const range = getRange();
  return range && {
    sc: range.startContainer, so: range.startOffset,
    ec: range.endContainer, eo: range.endOffset,
  };
}

const nodeLength = (node) =>
  node.nodeType === Node.TEXT_NODE ? node.length : node.childNodes.length;

export function restoreRemembered(saved, root) {
  if (!saved || !saved.sc.isConnected || !saved.ec.isConnected || !root.contains(saved.sc)) return false;

  const range = document.createRange();
  range.setStart(saved.sc, Math.min(saved.so, nodeLength(saved.sc)));
  range.setEnd(saved.ec, Math.min(saved.eo, nodeLength(saved.ec)));
  restoreSelection(range);
  return true;
}
