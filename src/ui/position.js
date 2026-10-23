// Posisi elemen melayang (bubble, media bar, palet, slash menu, tombol + / pegangan drag).

const GAP = 10;
const EDGE = 8;

export const isCoarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

// Keyboard virtual (HP) sedang terbuka: visualViewport jauh lebih pendek dari jendela. Ambang 120px
// menghindari positif palsu dari bilah UI browser yang muncul/hilang.
export function keyboardOpen() {
  const vv = typeof window !== 'undefined' && window.visualViewport;
  return !!vv && window.innerHeight - vv.height > 120;
}

// Area layar yang benar-benar terlihat, dalam koordinat getBoundingClientRect(). Di HP keyboard
// hanya mengecilkan visualViewport; window.innerHeight tetap, jadi tanpa ini elemen melayang bisa
// jatuh di belakang keyboard.
export function visibleBox() {
  const vv = typeof window !== 'undefined' && window.visualViewport;
  if (!vv) return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  return { left: vv.offsetLeft, top: vv.offsetTop, right: vv.offsetLeft + vv.width, bottom: vv.offsetTop + vv.height };
}

// Hitung posisi `el` terhadap `rect` (koordinat layar), lalu ubah ke koordinat relatif terhadap
// `root` (.afw). Tidak keluar dari area yang terlihat.
export function place(root, el, rect, { prefer = 'above', align = 'center', gap = GAP } = {}) {
  const box = root.getBoundingClientRect();
  const view = visibleBox();
  const w = el.offsetWidth;
  const h = el.offsetHeight;

  let left = align === 'center' ? rect.left + rect.width / 2 - w / 2 : rect.left;
  left = Math.max(view.left + EDGE, Math.min(left, view.right - w - EDGE));

  const above = rect.top - h - gap;
  const below = rect.bottom + gap;
  const fitsAbove = above >= view.top + EDGE;
  const fitsBelow = below + h <= view.bottom - EDGE;
  const top = prefer === 'above'
    ? (fitsAbove || !fitsBelow ? above : below)
    : (fitsBelow || !fitsAbove ? below : above);

  return { x: Math.round(left - box.left), y: Math.round(top - box.top) };
}

// Geser halaman (atau wadah ber-scroll terdekat) seperlunya agar rentang vertikal [top, bottom]
// (koordinat layar) terlihat, tanpa mendorong `top` keluar dari atas. Mengembalikan true bila
// ada yang di-scroll.
export function revealRange(root, top, bottom) {
  const view = visibleBox();
  const scroller = scrollParent(root);
  const limit = scroller ? scroller.getBoundingClientRect() : view;
  const visibleTop = Math.max(view.top, limit.top) + EDGE;
  const visibleBottom = Math.min(view.bottom, limit.bottom) - EDGE;
  // Dibulatkan ke atas: browser menggeser per piksel utuh, dan kurang sepecahan piksel saja sudah
  // membuat elemen tidak muat di bawah seleksi.
  const delta = Math.ceil(Math.min(bottom - visibleBottom, top - visibleTop));
  if (delta <= 0) return false;
  if (scroller) scroller.scrollTop += delta;
  else window.scrollBy(0, delta);
  return true;
}

function scrollParent(el) {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

// Posisi kiri tombol di celah kiri konten: tepat sebelum tepi kiri blok (lebar tombol 24px).
export function gutterX(blockRect, rootRect) {
  return Math.max(2, Math.round(blockRect.left - rootRect.left - 30));
}
