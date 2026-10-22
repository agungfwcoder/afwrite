// Posisi elemen melayang (bubble, media bar, palet, slash menu, tombol + / pegangan drag).

const GAP = 10;
const EDGE = 8;

export const isCoarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

// Hitung posisi `el` terhadap `rect` (koordinat layar), lalu ubah ke koordinat relatif terhadap
// `root` (.afw). Tidak keluar dari layar.
export function place(root, el, rect, { prefer = 'above', align = 'center', gap = GAP } = {}) {
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
}

// Posisi kiri tombol di celah kiri konten: tepat sebelum tepi kiri blok (lebar tombol 24px).
export function gutterX(blockRect, rootRect) {
  return Math.max(2, Math.round(blockRect.left - rootRect.left - 30));
}
