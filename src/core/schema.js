// Schema dokumen (Tiptap/ProseMirror). Isinya sama dengan whitelist sanitize.js:
//
//   blok   : paragraph <p>, heading <h2>-<h6> (sesuai opsi headings), blockquote <blockquote>, bulletList <ul>,
//            orderedList <ol>, listItem <li>, codeBlock <pre><code>, horizontalRule <hr>,
//            image <figure><img><figcaption>, embed <figure data-embed><iframe><figcaption>
//   inline : bold <b>, italic <i>, code <code>, link <a href>, hardBreak <br>
//   format tambahan (opsi formats): underline <u>, strike <s>, color <span style="color">,
//            highlight <mark>, atribut textAlign pada paragraph & heading (class afw-align-*)
//
// Mode artikel (opsi title): dokumen = (image | embed | horizontalRule)* title subtitle? block+,
// dengan title <h1> (teks polos) dan subtitle <p class="afw-subtitle"> (teks + link) yang hanya
// boleh tepat setelah judul. Di atas judul hanya boleh blok non-teks: teks pertama selalu judul.
// Gambar pertama dipakai sebagai gambar utama (feature image), lihat Editor#getMeta().
//
// Kutipan adalah blok teks (isinya inline + <br>), bukan wadah paragraf, agar output
// tetap <blockquote>a<br>b</blockquote> seperti v1.

import { Extension, Mark, Node } from '@tiptap/core';
import CodeBlock from '@tiptap/extension-code-block';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import { BulletList, ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { createEmbedIframe, normalizeImageSrc, parseEmbed } from './embed.js';
import { alignOf, FORMATS, normalizeColor, styleValue } from './formats.js';
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

const Underline = Mark.create({
  name: 'underline',
  parseHTML: () => [{ tag: 'u' }],
  renderHTML: () => ['u', 0],
});

const Strike = Mark.create({
  name: 'strike',
  parseHTML: () => [{ tag: 's' }],
  renderHTML: () => ['s', 0],
});

// Warna disimpan sebagai #rrggbb; nilainya sudah dibatasi ke palet oleh sanitize().
const TextColor = Mark.create({
  name: 'color',
  addAttributes: () => ({ color: { default: null, rendered: false } }),
  parseHTML: () => [{
    tag: 'span',
    getAttrs: (el) => {
      const color = normalizeColor(styleValue(el.getAttribute('style'), 'color'));
      return color ? { color } : false;
    },
  }],
  renderHTML: ({ mark }) => ['span', { style: `color: ${mark.attrs.color}` }, 0],
});

const Highlight = Mark.create({
  name: 'highlight',
  addAttributes: () => ({ color: { default: null, rendered: false } }),
  parseHTML: () => [{
    tag: 'mark',
    getAttrs: (el) => ({ color: normalizeColor(styleValue(el.getAttribute('style'), 'background-color')) }),
  }],
  renderHTML: ({ mark }) => ['mark', mark.attrs.color ? { style: `background-color: ${mark.attrs.color}` } : {}, 0],
});

// Perataan paragraf & judul: class afw-align-center | right | justify (rata kiri = tanpa class).
const TextAlign = Extension.create({
  name: 'textAlign',
  addGlobalAttributes: () => [{
    types: ['paragraph', 'heading'],
    attributes: {
      textAlign: {
        default: null,
        parseHTML: (el) => alignOf(el),
        renderHTML: (attrs) => (attrs.textAlign ? { class: `afw-align-${attrs.textAlign}` } : {}),
      },
    },
  }],
});

// ---------- Blok ----------

const Title = Node.create({
  name: 'title',
  content: 'text*',
  marks: '',
  defining: true,
  parseHTML: () => [{ tag: 'h1', priority: 60 }],
  renderHTML: () => ['h1', 0],
});

const Subtitle = Node.create({
  name: 'subtitle',
  content: 'text*',
  marks: 'link',
  defining: true,
  parseHTML: () => [{ tag: 'p.afw-subtitle', priority: 60 }],
  renderHTML: () => ['p', { class: 'afw-subtitle' }, 0],
});

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
      // ID media library aplikasi (data-media-id), mis. untuk memilih gambar utama.
      mediaId: { default: null, rendered: false },
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
        const mediaId = img?.getAttribute('data-media-id');
        return src ? { src, alt: img.getAttribute('alt') || '', mediaId: /^\d{1,20}$/.test(mediaId) ? mediaId : null } : false;
      },
    }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const img = { src: node.attrs.src, alt: node.attrs.alt, 'data-media-id': node.attrs.mediaId };
    return ['figure', { 'data-size': HTMLAttributes['data-size'] }, ['img', img], ['figcaption', 0]];
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

// Mode artikel: tanpa <h1> sebagai teks pertama (boleh didahului gambar/video/pemisah), ProseMirror
// akan memasukkan paragraf pertama ke dalam judul. Judul kosong ditambahkan dulu agar isi tetap di tempatnya.
const TITLE_START = /^\s*(?:(?:<figure[\s>][\s\S]*?<\/figure>|<hr\s*\/?>)\s*)*<h1[\s>]/i;
export function withTitle(html, title) {
  return title && !TITLE_START.test(html) ? `<h1></h1>${html}` : html;
}

// Blok yang boleh berada di atas judul artikel.
export const ABOVE_TITLE = ['image', 'embed', 'horizontalRule'];

// Indeks & posisi judul di dokumen artikel (setelah blok non-teks di atasnya).
export function titleIndex(doc) {
  let index = 0;
  while (index < doc.childCount - 1 && doc.child(index).type.name !== 'title') index++;
  return index;
}
export function titlePos(doc) {
  let pos = 0;
  for (let i = 0, end = titleIndex(doc); i < end; i++) pos += doc.child(i).nodeSize;
  return pos;
}

// Daftar extension. Opsi: allowDataImages (ikut opsi Editor), captionPlaceholder, headings, title,
// formats (format tambahan yang aktif, lihat formats.js).
export function createExtensions({ allowDataImages = true, captionPlaceholder = '', headings = [2, 3], title = false, formats = FORMATS } = {}) {
  const extra = { underline: Underline, strike: Strike, color: TextColor, highlight: Highlight, align: TextAlign };
  return [
    ...(title ? [Document.extend({ content: `(${ABOVE_TITLE.join(' | ')})* title subtitle? block+` }), Title, Subtitle] : [Document]),
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
    ...FORMATS.filter((f) => formats.includes(f)).map((f) => extra[f]),
  ];
}
