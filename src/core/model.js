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
import { sanitize } from './sanitize.js';
import { createExtensions } from './schema.js';

let schema = null;
const getDocSchema = () => (schema ||= getSchema(createExtensions()));

export function toJSON(html) {
  const clean = sanitize(html);
  if (!clean) return { type: 'doc', content: [] };
  return createDocument(clean, getDocSchema()).toJSON();
}

export function fromJSON(doc) {
  const s = getDocSchema();
  const cleaned = cleanNode(doc, s);
  if (!cleaned || cleaned.type !== 'doc' || !cleaned.content?.length) return '';
  try {
    return sanitize(getHTMLFromFragment(PMNode.fromJSON(s, cleaned).content, s));
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
