// Schema dokumen (Tiptap/ProseMirror). Isinya sama dengan whitelist sanitize.js:
//
//   blok   : paragraph <p>, heading <h2>-<h6> (sesuai opsi headings), blockquote <blockquote>, bulletList <ul>,
//            orderedList <ol>, listItem <li>, codeBlock <pre><code>, horizontalRule <hr>,
//            image <figure><img><figcaption>, embed <figure data-embed><iframe><figcaption>
//   inline : bold <b>, italic <i>, code <code>, link <a href>, hardBreak <br>
//
// Kutipan adalah blok teks (isinya inline + <br>), bukan wadah paragraf, agar output
// tetap <blockquote>a<br>b</blockquote> seperti v1.

import { Mark, Node } from '@tiptap/core';
import CodeBlock from '@tiptap/extension-code-block';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import { BulletList, ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { createEmbedIframe, normalizeImageSrc, parseEmbed } from './embed.js';
import { FigureView } from './media.js';
import { normalizeUrl } from './url.js';

export const MEDIA_NODES = ['image', 'embed', 'horizontalRule'];
const FIGURE_SIZES = ['wide', 'full'];

// ---------- Mark ----------

const Bold = Mark.create({
  name: 'bold',
  parseHTML: () => [
    { tag: 'b' },
    { tag: 'strong' },
    { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
  ],
  renderHTML: () => ['b', 0],
});

const Italic = Mark.create({
  name: 'italic',
  parseHTML: () => [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
  renderHTML: () => ['i', 0],
});

const Code = Mark.create({
  name: 'code',
  code: true,
  parseHTML: () => [{ tag: 'code' }],
  renderHTML: () => ['code', 0],
});

const Link = Mark.create({
  name: 'link',
  inclusive: false,
  priority: 1000, // <a> membungkus format lain
  addAttributes: () => ({ href: { default: null } }),
  parseHTML: () => [{
    tag: 'a[href]',
    getAttrs: (el) => {
      const href = normalizeUrl(el.getAttribute('href'));
      return href ? { href } : false;
    },
  }],
  renderHTML: ({ HTMLAttributes }) => ['a', { href: HTMLAttributes.href }, 0],
});

// ---------- Blok ----------

const Blockquote = Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML: () => [{ tag: 'blockquote' }],
  renderHTML: () => ['blockquote', 0],
});

const HorizontalRule = Node.create({
  name: 'horizontalRule',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML: () => [{ tag: 'hr' }],
  renderHTML: () => ['hr'],
});

const sizeAttribute = {
  default: null,
  parseHTML: (el) => (FIGURE_SIZES.includes(el.getAttribute('data-size')) ? el.getAttribute('data-size') : null),
  renderHTML: (attrs) => (attrs.size ? { 'data-size': attrs.size } : {}),
};

// Isi node = teks keterangan (<figcaption>). Elemen <figcaption> belum tentu ada di HTML sumber.
const captionElement = (el) => el.querySelector(':scope > figcaption') || document.createElement('figcaption');

const Image = Node.create({
  name: 'image',
  group: 'block',
  content: 'text*',
  marks: '',
  draggable: true,
  selectable: true,
  isolating: true,
  addOptions: () => ({ allowDataImages: true, captionPlaceholder: '' }),
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      size: sizeAttribute,
      // Id upload yang sedang berjalan (pratinjau blob:); tidak pernah ikut output.
      uploading: { default: null, rendered: false },
    };
  },
  parseHTML() {
    return [{
      tag: 'figure',
      contentElement: captionElement,
      getAttrs: (el) => {
        const img = el.querySelector(':scope > img');
        const src = img && normalizeImageSrc(img.getAttribute('src'), { allowData: this.options.allowDataImages });
        return src ? { src, alt: img.getAttribute('alt') || '' } : false;
      },
    }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['figure', { 'data-size': HTMLAttributes['data-size'] }, ['img', { src: node.attrs.src, alt: node.attrs.alt }], ['figcaption', 0]];
  },
  addNodeView() {
    return ({ node }) => new FigureView(node, this.options);
  },
});

const Embed = Node.create({
  name: 'embed',
  group: 'block',
  content: 'text*',
  marks: '',
  draggable: true,
  selectable: true,
  isolating: true,
  addOptions: () => ({ captionPlaceholder: '' }),
  addAttributes: () => ({
    provider: { default: null },
    id: { default: null },
    size: sizeAttribute,
  }),
  parseHTML: () => [{
    tag: 'figure[data-embed]',
    priority: 60, // sebelum aturan figure gambar
    contentElement: captionElement,
    getAttrs: (el) => {
      const embed = parseEmbed(el.querySelector(':scope > iframe')?.getAttribute('src'));
      return embed ? { provider: embed.provider, id: embed.id } : false;
    },
  }],
  renderHTML({ node, HTMLAttributes }) {
    const embed = embedOf(node);
    // Id tidak valid (mis. dari JSON tak dipercaya): figure tanpa media, dibuang sanitize().
    if (!embed) return ['figure', ['figcaption', 0]];
    const iframe = createEmbedIframe(embed);
    const attrs = Object.fromEntries([...iframe.attributes].map((a) => [a.name, a.value]));
    return ['figure', { 'data-embed': embed.provider, 'data-size': HTMLAttributes['data-size'] }, ['iframe', attrs], ['figcaption', 0]];
  },
  addNodeView() {
    return ({ node }) => new FigureView(node, this.options);
  },
});

export const embedOf = (node) =>
  parseEmbed(node.attrs.provider === 'vimeo' ? `https://vimeo.com/${node.attrs.id}` : `https://youtu.be/${node.attrs.id}`);

// Daftar extension. Opsi: allowDataImages (ikut opsi Editor), captionPlaceholder.
export function createExtensions({ allowDataImages = true, captionPlaceholder = '', headings = [2, 3] } = {}) {
  return [
    Document,
    Paragraph,
    Text,
    HardBreak.configure({ keepMarks: true }),
    Heading.configure({ levels: headings }),
    Blockquote,
    BulletList,
    OrderedList,
    ListItem,
    ListKeymap,
    CodeBlock.configure({ exitOnTripleEnter: false, languageClassPrefix: null }),
    HorizontalRule,
    Image.configure({ allowDataImages, captionPlaceholder }),
    Embed.configure({ captionPlaceholder }),
    Bold,
    Italic,
    Code,
    Link,
  ];
}
