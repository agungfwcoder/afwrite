// Konversi HTML <-> JSON dokumen (format ProseMirror/Tiptap):
//
//   toJSON('<p>Halo <b>dunia</b></p>')
//   // -> { type: 'doc', content: [{ type: 'paragraph', content: [
//   //      { type: 'text', text: 'Halo ' },
//   //      { type: 'text', text: 'dunia', marks: [{ type: 'bold' }] } ] }] }
//
// fromJSON() menerima input tak dipercaya: node/mark yang tidak dikenal dibuang dan hasil
// HTML-nya selalu lewat sanitize().

import { createDocument, getHTMLFromFragment, getSchema } from '@tiptap/core';
import { Node as PMNode } from '@tiptap/pm/model';
import { normalizeHeadings, sanitize } from './sanitize.js';
import { createExtensions, withTitle } from './schema.js';

// Schema JSON mengenal semua level judul; level yang dipakai dibatasi lewat sanitize().
// Mode artikel (title) memakai schema sendiri: title subtitle? block+.
const schemas = {};
const getDocSchema = (title = false) =>
  (schemas[title] ||= getSchema(createExtensions({ headings: [2, 3, 4, 5, 6], title })));

// Opsi: headings (level judul yang dipakai, bawaan [2, 3]), title (mode artikel), allowDataImages.
export function toJSON(html, options = {}) {
  const clean = sanitize(html, { ...options, headings: normalizeHeadings(options.headings) });
  if (!clean) return { type: 'doc', content: [] };
  return createDocument(withTitle(clean, !!options.title), getDocSchema(!!options.title)).toJSON();
}

export function fromJSON(doc, options = {}) {
  const s = getDocSchema(!!options.title);
  const cleaned = cleanNode(doc, s);
  if (!cleaned || cleaned.type !== 'doc' || !cleaned.content?.length) return '';
  try {
    return sanitize(getHTMLFromFragment(PMNode.fromJSON(s, cleaned).content, s), options);
  } catch {
    return '';
  }
}

// Buang node, mark, dan teks yang tidak valid agar PMNode.fromJSON tidak melempar error.
function cleanNode(node, s) {
  if (!node || typeof node !== 'object' || !s.nodes[node.type]) return null;
  if (node.type === 'text') {
    if (typeof node.text !== 'string' || !node.text) return null;
    const marks = Array.isArray(node.marks) ? node.marks.filter((m) => m && s.marks[m.type]).map(pick) : [];
    return { type: 'text', text: node.text, ...(marks.length && { marks }) };
  }
  const result = { type: node.type };
  if (node.attrs && typeof node.attrs === 'object') result.attrs = { ...node.attrs };
  if (Array.isArray(node.content)) result.content = node.content.map((c) => cleanNode(c, s)).filter(Boolean);
  return result;
}

const pick = (mark) => ({ type: mark.type, ...(mark.attrs && typeof mark.attrs === 'object' && { attrs: { ...mark.attrs } }) });
