// Jenis blok untuk slash menu (/) dan tombol "+".
// Label & deskripsi diambil dari teks bahasa (i18n: strings.blocks[command]).
// `markdown` ditampilkan sebagai petunjuk shortcut di menu.
export const BLOCKS = [
  { command: 'paragraph', markdown: '', keywords: ['p', 'teks', 'paragraf', 'text', 'paragraph'] },
  { command: 'h2', markdown: '##', keywords: ['h2', 'judul', 'heading', 'title'] },
  { command: 'h3', markdown: '###', keywords: ['h3', 'subjudul', 'subheading'] },
  { command: 'h4', markdown: '####', keywords: ['h4', 'judul', 'heading'] },
  { command: 'h5', markdown: '#####', keywords: ['h5', 'judul', 'heading'] },
  { command: 'h6', markdown: '######', keywords: ['h6', 'judul', 'heading'] },
  { command: 'quote', markdown: '>', keywords: ['quote', 'kutipan', 'blockquote'] },
  { command: 'ul', markdown: '-', keywords: ['ul', 'list', 'daftar', 'bullet', 'poin'] },
  { command: 'ol', markdown: '1.', keywords: ['ol', 'list', 'daftar', 'nomor', 'number', 'urut'] },
  { command: 'codeblock', markdown: '```', keywords: ['code', 'kode', 'pre', 'snippet', 'program'] },
  { command: 'image', markdown: '', keywords: ['image', 'gambar', 'foto', 'img', 'picture', 'upload'] },
  { command: 'embed', markdown: '', keywords: ['video', 'youtube', 'vimeo', 'embed'] },
  { command: 'hr', markdown: '---', keywords: ['hr', 'pemisah', 'garis', 'divider', 'separator'] },
];

export function filterBlocks(query, blocks = BLOCKS, strings = {}) {
  const q = query.trim().toLowerCase();
  return blocks
    .map((block) => {
      const [label = block.label || block.command, description = block.description || ''] =
        strings.blocks?.[block.command] || [];
      return { ...block, label, description };
    })
    .filter((b) => !q || b.label.toLowerCase().includes(q) || b.keywords.some((k) => k.startsWith(q)));
}
