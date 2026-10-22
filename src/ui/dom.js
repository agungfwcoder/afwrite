// Helper DOM kecil untuk UI vanilla (tanpa framework, tanpa virtual DOM).
// Teks selalu lewat textContent / setAttribute; hanya ikon SVG bawaan yang masuk lewat innerHTML.

// el('button', { type: 'button', class: 'afw-btn' }, [anak...])
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) setAttr(node, name, value);
  for (const child of [].concat(children)) {
    if (child != null && child !== false) node.append(child);
  }
  return node;
}

// null / undefined / false menghapus atribut.
export function setAttr(node, name, value) {
  if (value == null || value === false) node.removeAttribute(name);
  else if (node.getAttribute(name) !== String(value)) node.setAttribute(name, value);
}

// Seperti x-show: elemen disembunyikan lewat display: none.
export function show(node, visible) {
  node.style.display = visible ? '' : 'none';
}

export function setText(node, text) {
  const value = String(text ?? '');
  if (node.textContent !== value) node.textContent = value;
}

// Hanya untuk markup tepercaya (ikon bawaan).
export function setHTML(node, html) {
  if (node._afwHTML !== html) {
    node._afwHTML = html;
    node.innerHTML = html;
  }
}

// Pasang listener dan kembalikan fungsi untuk melepasnya.
export function listen(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

// Tombol yang tidak boleh mengambil fokus dari editor saat diklik (seperti @mousedown.prevent).
export const keepFocus = (e) => e.preventDefault();
