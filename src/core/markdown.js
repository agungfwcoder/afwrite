// Shortcut markdown saat mengetik (input rule ProseMirror).
//
// Di awal paragraf tingkat teratas (diikuti spasi):
//   # atau ##  -> Judul      ### s.d. ######  -> judul level 3-6 (level yang tidak aktif
//                            turun ke level aktif terdekat)      >  -> Kutipan
//   - * +      -> Daftar berpoin                1. -> Daftar bernomor
//   ---        -> Pemisah                     ```  -> Blok kode
//
// Di dalam teks:
//   **tebal**   *miring*   _miring_   `kode`

import { InputRule, markInputRule } from '@tiptap/core';

// Blok: hanya di paragraf tingkat teratas (bukan di dalam list).
const BLOCK_RULES = [
  {
    find: /^(#{1,6})\s$/,
    run: (chain, match, headings) => {
      const wanted = Math.max(match[1].length, 2);
      const lower = headings.filter((n) => n <= wanted);
      return chain.setNode('heading', { level: lower.length ? lower[lower.length - 1] : headings[0] });
    },
  },
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

export function markdownRules(schema, headings = [2, 3]) {
  const blocks = BLOCK_RULES.map(({ find, run }) => new InputRule({
    find,
    handler: ({ state, range, match, chain }) => {
      const $from = state.doc.resolve(range.from);
      if ($from.depth !== 1 || $from.parent.type.name !== 'paragraph') return null;
      run(chain().deleteRange(range), match, headings).run();
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
