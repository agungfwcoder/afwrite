// Jenis blok untuk slash menu (/) dan tombol "+".
// `markdown` ditampilkan sebagai petunjuk shortcut di menu.
export const BLOCKS = [
  { command: 'paragraph', label: 'Teks', description: 'Paragraf biasa', markdown: '', keywords: ['p', 'teks', 'paragraf', 'text', 'paragraph'] },
  { command: 'h2', label: 'Judul', description: 'Judul bagian yang besar', markdown: '##', keywords: ['h2', 'judul', 'heading', 'title'] },
  { command: 'h3', label: 'Subjudul', description: 'Judul bagian yang lebih kecil', markdown: '###', keywords: ['h3', 'subjudul', 'subheading'] },
  { command: 'quote', label: 'Kutipan', description: 'Menyorot kutipan', markdown: '>', keywords: ['quote', 'kutipan', 'blockquote', 'sitat'] },
  { command: 'ul', label: 'Daftar berpoin', description: 'Daftar sederhana', markdown: '-', keywords: ['ul', 'list', 'daftar', 'bullet', 'poin'] },
  { command: 'ol', label: 'Daftar bernomor', description: 'Daftar berurutan', markdown: '1.', keywords: ['ol', 'list', 'daftar', 'nomor', 'number', 'urut'] },
];

export function filterBlocks(query, blocks = BLOCKS) {
  const q = query.trim().toLowerCase();
  if (!q) return blocks;
  return blocks.filter(
    (b) => b.label.toLowerCase().includes(q) || b.keywords.some((k) => k.startsWith(q)),
  );
}
