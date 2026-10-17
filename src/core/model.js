// Model dokumen JSON: blok + teks dengan format sebagai rentang karakter (ala Medium).
//
//   {
//     "type": "doc", "version": 1,
//     "blocks": [
//       { "type": "heading", "level": 2, "text": "Judul", "marks": [] },
//       { "type": "paragraph", "text": "Halo dunia", "marks": [{ "type": "bold", "start": 0, "end": 4 }] },
//       { "type": "quote", "text": "Baris 1\nBaris 2", "marks": [] },
//       { "type": "list", "style": "bullet", "items": [
//           { "text": "satu", "marks": [], "children": { "style": "ordered", "items": [...] } } ] },
//       { "type": "code", "text": "const a = 1;" },
//       { "type": "image", "src": "...", "alt": "...", "size": "wide", "caption": { "text": "...", "marks": [] } },
//       { "type": "embed", "provider": "youtube", "id": "dQw4w9WgXcQ" },
//       { "type": "divider" }
//     ]
//   }
//
// Mark: { type: 'bold' | 'italic' | 'code' | 'link', start, end, href? }; "\n" = baris baru (<br>).
// fromJSON() selalu menyanitasi hasilnya, jadi JSON dari sumber tak dipercaya tetap aman.

import { parseEmbed, createEmbedIframe } from './embed.js';
import { sanitize, sanitizeToElement } from './sanitize.js';

export const MODEL_VERSION = 1;
const MARK_TAGS = { B: 'bold', I: 'italic', CODE: 'code', A: 'link' };
// Urutan pembungkusan saat render (luar -> dalam), agar HTML yang dihasilkan konsisten.
const MARK_ORDER = ['link', 'bold', 'italic', 'code'];
const MARK_ELEMENT = { link: 'a', bold: 'b', italic: 'i', code: 'code' };

// ---------- HTML -> JSON ----------

export function toJSON(html) {
  const root = typeof html === 'string' ? sanitizeToElement(html) : html;
  const blocks = [...root.children].map(readBlock).filter(Boolean);
  return { type: 'doc', version: MODEL_VERSION, blocks };
}

function readBlock(el) {
  switch (el.tagName) {
    case 'P':
      return { type: 'paragraph', ...readInline(el) };
    case 'H2':
    case 'H3':
      return { type: 'heading', level: Number(el.tagName[1]), ...readInline(el) };
    case 'BLOCKQUOTE':
      return { type: 'quote', ...readInline(el) };
    case 'UL':
    case 'OL':
      return { type: 'list', ...readList(el) };
    case 'PRE':
      return { type: 'code', text: el.textContent };
    case 'HR':
      return { type: 'divider' };
    case 'FIGURE':
      return readFigure(el);
    default:
      return null;
  }
}

function readList(list) {
  return {
    style: list.tagName === 'OL' ? 'ordered' : 'bullet',
    items: [...list.children].map((li) => {
      const item = readInline(li);
      const sub = li.querySelector(':scope > ul, :scope > ol');
      if (sub) item.children = readList(sub);
      return item;
    }),
  };
}

function readFigure(figure) {
  const block = {};
  const img = figure.querySelector(':scope > img');
  const iframe = figure.querySelector(':scope > iframe');
  if (img) {
    Object.assign(block, { type: 'image', src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' });
  } else if (iframe) {
    const embed = parseEmbed(iframe.getAttribute('src'));
    if (!embed) return null;
    Object.assign(block, { type: 'embed', provider: embed.provider, id: embed.id });
  } else {
    return null;
  }
  const size = figure.getAttribute('data-size');
  if (size) block.size = size;
  const caption = figure.querySelector(':scope > figcaption');
  if (caption) block.caption = readInline(caption);
  return block;
}

// Teks + mark dari isi elemen (list bertingkat di dalam <li> dilewati).
function readInline(container) {
  let text = '';
  const marks = [];

  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.data;
      } else if (child.nodeName === 'BR') {
        text += '\n';
      } else if (child.nodeName === 'UL' || child.nodeName === 'OL') {
        // ditangani readList
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const start = text.length;
        walk(child);
        const type = MARK_TAGS[child.nodeName];
        if (type && text.length > start) {
          const mark = { type, start, end: text.length };
          if (type === 'link') mark.href = child.getAttribute('href');
          marks.push(mark);
        }
      }
    });
  };
  walk(container);
  return { text, marks: mergeMarks(marks) };
}

// Gabungkan mark sejenis yang bersinggungan; urutkan agar hasil konsisten.
function mergeMarks(marks) {
  const sorted = [...marks].sort((a, b) =>
    MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type) || a.start - b.start);
  const out = [];
  sorted.forEach((mark) => {
    const last = out[out.length - 1];
    if (last && last.type === mark.type && last.href === mark.href && mark.start <= last.end) {
      last.end = Math.max(last.end, mark.end);
    } else {
      out.push({ ...mark });
    }
  });
  return out.sort((a, b) => a.start - b.start || MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type));
}

// ---------- JSON -> HTML ----------

export function fromJSON(doc) {
  const blocks = Array.isArray(doc?.blocks) ? doc.blocks : [];
  const container = document.createElement('div');
  blocks.forEach((block) => {
    const el = renderBlock(block || {});
    if (el) container.append(el);
  });
  return sanitize(container.innerHTML);
}

function renderBlock(block) {
  switch (block.type) {
    case 'paragraph':
      return withInline('p', block);
    case 'heading':
      return withInline(block.level === 3 ? 'h3' : 'h2', block);
    case 'quote':
      return withInline('blockquote', block);
    case 'list':
      return renderList(block);
    case 'code': {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = String(block.text ?? '');
      pre.append(code);
      return pre;
    }
    case 'divider':
      return document.createElement('hr');
    case 'image':
    case 'embed':
      return renderFigure(block);
    default:
      return null;
  }
}

function renderList(list) {
  const el = document.createElement(list.style === 'ordered' ? 'ol' : 'ul');
  (Array.isArray(list.items) ? list.items : []).forEach((item) => {
    const li = withInline('li', item || {});
    if (item?.children) li.append(renderList(item.children));
    el.append(li);
  });
  return el;
}

function renderFigure(block) {
  const figure = document.createElement('figure');
  if (block.type === 'image') {
    const img = document.createElement('img');
    img.setAttribute('src', String(block.src ?? ''));
    img.setAttribute('alt', String(block.alt ?? ''));
    figure.append(img);
  } else {
    const embed = parseEmbed(block.provider === 'vimeo' ? `https://vimeo.com/${block.id}` : `https://youtu.be/${block.id}`);
    if (!embed) return null;
    figure.setAttribute('data-embed', embed.provider);
    figure.append(createEmbedIframe(embed));
  }
  if (block.size) figure.setAttribute('data-size', String(block.size));
  if (block.caption) figure.append(withInline('figcaption', block.caption));
  return figure;
}

function withInline(tag, { text = '', marks = [] } = {}) {
  const el = document.createElement(tag);
  el.append(...renderInline(String(text), Array.isArray(marks) ? marks : []));
  return el;
}

// Pecah teks di setiap batas mark, lalu bungkus tiap potongan dengan mark yang menutupinya.
function renderInline(text, marks) {
  const valid = marks.filter((m) => MARK_ORDER.includes(m?.type) && m.start < m.end);
  const cuts = new Set([0, text.length]);
  valid.forEach((m) => {
    cuts.add(Math.max(0, Math.min(text.length, m.start)));
    cuts.add(Math.max(0, Math.min(text.length, m.end)));
  });
  const points = [...cuts].sort((a, b) => a - b);

  const nodes = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [from, to] = [points[i], points[i + 1]];
    if (from === to) continue;

    let node = textWithBreaks(text.slice(from, to));
    const covering = valid
      .filter((m) => m.start <= from && m.end >= to)
      .sort((a, b) => MARK_ORDER.indexOf(b.type) - MARK_ORDER.indexOf(a.type)); // dalam -> luar
    covering.forEach((mark) => {
      const wrapper = document.createElement(MARK_ELEMENT[mark.type]);
      if (mark.type === 'link') wrapper.setAttribute('href', String(mark.href ?? ''));
      wrapper.append(...node);
      node = [wrapper];
    });
    nodes.push(...node);
  }
  return nodes;
}

function textWithBreaks(text) {
  const parts = text.split('\n');
  return parts.flatMap((part, i) => [
    ...(i ? [document.createElement('br')] : []),
    ...(part ? [document.createTextNode(part)] : []),
  ]);
}
