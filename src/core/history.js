// Riwayat undo/redo berbasis snapshot.
//
// Undo bawaan browser hanya mencatat perubahan lewat execCommand; perubahan DOM langsung
// (media, perapian otomatis) membuatnya tidak konsisten. Karena itu editor mencatat sendiri
// isi + posisi kursor setelah setiap perubahan, dan mencegat Ctrl/⌘+Z.

const TYPING_MERGE_MS = 1000;

// Posisi node sebagai deretan indeks anak dari root, agar bisa dipulihkan setelah
// innerHTML diganti (node lama sudah tidak ada).
function pathTo(root, node) {
  const path = [];
  while (node && node !== root) {
    if (!node.parentNode) return null;
    path.unshift([...node.parentNode.childNodes].indexOf(node));
    node = node.parentNode;
  }
  return node === root ? path : null;
}

function nodeAt(root, path) {
  let node = root;
  for (const index of path) {
    node = node?.childNodes[index];
  }
  return node || null;
}

export function serializeSelection(root) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  const start = pathTo(root, range.startContainer);
  const end = pathTo(root, range.endContainer);
  if (!start || !end) return null;
  return { start, startOffset: range.startOffset, end, endOffset: range.endOffset };
}

export function restoreSerializedSelection(root, saved) {
  if (!saved) return false;
  const start = nodeAt(root, saved.start);
  const end = nodeAt(root, saved.end);
  if (!start || !end) return false;

  const length = (n) => (n.nodeType === Node.TEXT_NODE ? n.length : n.childNodes.length);
  const range = document.createRange();
  range.setStart(start, Math.min(saved.startOffset, length(start)));
  range.setEnd(end, Math.min(saved.endOffset, length(end)));
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

export class History {
  constructor({ limit = 100 } = {}) {
    this.limit = limit;
    this.reset();
  }

  reset(snapshot = null) {
    this.stack = snapshot ? [snapshot] : [];
    this.index = this.stack.length - 1;
    this.lastTyping = 0;
  }

  // `typing`: ketikan beruntun dalam waktu dekat digabung menjadi satu langkah.
  record(snapshot, { typing = false } = {}) {
    const current = this.stack[this.index];
    if (current && current.html === snapshot.html) {
      current.selection = snapshot.selection; // isi sama, perbarui posisi kursor saja
      return false;
    }

    const now = Date.now();
    const merge = typing && this.lastTyping && now - this.lastTyping < TYPING_MERGE_MS && this.index > 0;
    this.lastTyping = typing ? now : 0;

    // Perubahan baru membuang riwayat redo.
    this.stack.length = this.index + 1;
    if (merge) {
      this.stack[this.index] = snapshot;
    } else {
      this.stack.push(snapshot);
      if (this.stack.length > this.limit) this.stack.shift();
      this.index = this.stack.length - 1;
    }
    return true;
  }

  canUndo() {
    return this.index > 0;
  }

  canRedo() {
    return this.index < this.stack.length - 1;
  }

  undo() {
    if (!this.canUndo()) return null;
    this.lastTyping = 0;
    return this.stack[--this.index];
  }

  redo() {
    if (!this.canRedo()) return null;
    this.lastTyping = 0;
    return this.stack[++this.index];
  }
}
