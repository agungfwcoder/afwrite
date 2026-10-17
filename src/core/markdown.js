// Shortcut markdown saat mengetik (input rule ProseMirror).
//
// Di awal paragraf tingkat teratas (diikuti spasi):
//   # atau ##  -> Judul      ###  -> Subjudul    >  -> Kutipan
//   - * +      -> Daftar berpoin                1. -> Daftar bernomor
//   ---        -> Pemisah                     ```  -> Blok kode
//
// Di dalam teks:
//   **tebal**   *miring*   _miring_   `kode`

import { InputRule, markInputRule } from '@tiptap/core';

// Blok: hanya di paragraf tingkat teratas (bukan di dalam list).
const BLOCK_RULES = [
  { find: /^#{1,2}\s$/, run: (chain) => chain.setNode('heading', { level: 2 }) },
  { find: /^###\s$/, run: (chain) => chain.setNode('heading', { level: 3 }) },
  { find: /^>\s$/, run: (chain) => chain.setNode('blockquote') },
  { find: /^[-*+]\s$/, run: (chain) => chain.toggleBulletList() },
  { find: /^\d+[.)]\s$/, run: (chain) => chain.toggleOrderedList() },
  { find: /^(-{3,}|\*{3,}|_{3,})\s$/, run: (chain) => chain.insertMediaBlock({ type: 'horizontalRule' }) },
  { find: /^```\s$/, run: (chain) => chain.setNode('codeBlock') },
];

const INLINE_RULES = [
  { find: /\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/, mark: 'bold' },
  { find: /(?<![*\w])\*([^*\s](?:[^*]*[^*\s])?)\*$/, mark: 'italic' },
  { find: /(?<![_\w])_([^_\s](?:[^_]*[^_\s])?)_$/, mark: 'italic' },
  { find: /`([^`]+)`$/, mark: 'code' },
];

export function markdownRules(schema) {
  const blocks = BLOCK_RULES.map(({ find, run }) => new InputRule({
    find,
    handler: ({ state, range, chain }) => {
      const $from = state.doc.resolve(range.from);
      if ($from.depth !== 1 || $from.parent.type.name !== 'paragraph') return null;
      run(chain().deleteRange(range)).run();
    },
  }));

  const inline = INLINE_RULES.map(({ find, mark }) => {
    const type = schema.marks[mark];
    const rule = markInputRule({ find, type });
    return new InputRule({
      find,
      handler: (props) => {
        // Keterangan gambar tidak menerima format: tanda * dsb. dibiarkan sebagai teks.
        const $from = props.state.doc.resolve(props.range.from);
        if (!$from.parent.type.allowsMarkType(type)) return null;
        return rule.handler(props);
      },
    });
  });

  return [...blocks, ...inline];
}
