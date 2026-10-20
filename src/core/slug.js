// Slug untuk URL dari judul: "Café Pagi, Ayo!" -> "cafe-pagi-ayo".
//
// Aksen dilepas (é -> e) dan tanda kutip dibuang (don't -> dont), sisanya selain a-z/0-9 menjadi "-".
// Huruf non-Latin (Arab, Mandarin, ...) tidak punya padanan a-z sehingga hasilnya bisa kosong.
// Ini hanya pratinjau di browser: slug final (dan keunikannya) tetap ditentukan server.
export function slugify(text, { maxLength = 80 } = {}) {
  const slug = String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= maxLength) return slug;
  // Potong di batas kata jika memungkinkan.
  const cut = slug.slice(0, maxLength + 1);
  const end = cut.lastIndexOf('-');
  return (end > 0 ? cut.slice(0, end) : slug.slice(0, maxLength)).replace(/-+$/, '');
}
