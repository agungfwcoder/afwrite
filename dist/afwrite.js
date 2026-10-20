import { Editor as e, Extension as t, InputRule as n, Mark as r, Node as i, createDocument as a, getHTMLFromFragment as o, getSchema as s, markInputRule as c } from "@tiptap/core";
import { Dropcursor as l, Gapcursor as u, UndoRedo as d } from "@tiptap/extensions";
import { Fragment as f, Node as p, Slice as m } from "@tiptap/pm/model";
import { EditorState as ee, NodeSelection as h, Plugin as te, Selection as g, TextSelection as _ } from "@tiptap/pm/state";
import { Decoration as ne, DecorationSet as re } from "@tiptap/pm/view";
import ie from "@tiptap/extension-code-block";
import ae from "@tiptap/extension-document";
import oe from "@tiptap/extension-hard-break";
import se from "@tiptap/extension-heading";
import { BulletList as ce, ListItem as le, ListKeymap as ue, OrderedList as de } from "@tiptap/extension-list";
import fe from "@tiptap/extension-paragraph";
import pe from "@tiptap/extension-text";
var me = {
	id: {
		placeholder: "Mulai menulis… ketik / untuk pilihan blok",
		editorLabel: "Editor teks",
		toolbarLabel: "Format teks",
		mediaToolbarLabel: "Atur media",
		bold: "Tebal",
		italic: "Miring",
		underline: "Garis bawah",
		strike: "Coret",
		color: "Warna & stabilo",
		highlight: "Stabilo",
		textColor: "Warna teks",
		defaultColor: "Warna bawaan",
		noHighlight: "Tanpa stabilo",
		align: "Perataan",
		alignLeft: "Rata kiri",
		alignCenter: "Rata tengah",
		alignRight: "Rata kanan",
		alignJustify: "Rata kanan-kiri",
		link: "Link",
		h2: "Judul",
		h3: "Subjudul",
		h4: "Judul 4",
		h5: "Judul 5",
		h6: "Judul 6",
		quote: "Kutipan",
		codeblock: "Blok kode",
		ul: "Daftar berpoin",
		ol: "Daftar bernomor",
		undo: "Urungkan",
		redo: "Ulangi",
		blocksTitle: "Blok",
		noResults: "Tidak ada hasil",
		addBlock: "Tambah blok",
		blocks: {
			paragraph: ["Teks", "Paragraf biasa"],
			h2: ["Judul", "Judul bagian yang besar"],
			h3: ["Subjudul", "Judul bagian yang lebih kecil"],
			h4: ["Judul 4", "Judul tingkat 4"],
			h5: ["Judul 5", "Judul tingkat 5"],
			h6: ["Judul 6", "Judul tingkat 6"],
			quote: ["Kutipan", "Menyorot kutipan"],
			ul: ["Daftar berpoin", "Daftar sederhana"],
			ol: ["Daftar bernomor", "Daftar berurutan"],
			codeblock: ["Kode", "Blok kode program"],
			image: ["Gambar", "Unggah dari perangkat"],
			embed: ["Video", "YouTube atau Vimeo"],
			hr: ["Pemisah", "Garis pemisah antarbagian"]
		},
		inputLink: "Tempel atau ketik URL…",
		inputEmbed: "Tempel link YouTube atau Vimeo…",
		inputAlt: "Deskripsikan gambar untuk pembaca layar…",
		save: "Simpan",
		cancel: "Batal",
		editLink: "Ubah link",
		removeLink: "Hapus link",
		sizeNormal: "Ukuran normal",
		sizeWide: "Lebar",
		sizeFull: "Penuh",
		altText: "Alt text",
		removeMedia: "Hapus media",
		captionPlaceholder: "Tulis keterangan (opsional)",
		titlePlaceholder: "Judul",
		subtitlePlaceholder: "Subjudul",
		titleLabel: "Judul",
		dragBlock: "Seret untuk memindahkan, klik untuk memilih blok",
		subtitleLabel: "Subjudul",
		words: "kata",
		minutesRead: "menit baca",
		draftFound: "Ada draf yang belum tersimpan dari {time}.",
		draftRestore: "Pulihkan",
		draftDiscard: "Buang",
		promptUrl: "Masukkan URL",
		promptEmbed: "Tempel link YouTube atau Vimeo",
		errorUrl: "URL tidak valid",
		errorEmbed: "Link video tidak dikenali (YouTube/Vimeo)",
		errorImageType: "Format gambar tidak didukung (pakai PNG, JPG, GIF, WebP, atau AVIF).",
		errorImageSize: "\"{name}\" lebih dari {size} MB.",
		errorUpload: "Gagal mengunggah \"{name}\"."
	},
	en: {
		placeholder: "Start writing… type / for blocks",
		editorLabel: "Text editor",
		toolbarLabel: "Text formatting",
		mediaToolbarLabel: "Media options",
		bold: "Bold",
		italic: "Italic",
		underline: "Underline",
		strike: "Strikethrough",
		color: "Color & highlight",
		highlight: "Highlight",
		textColor: "Text color",
		defaultColor: "Default color",
		noHighlight: "No highlight",
		align: "Alignment",
		alignLeft: "Align left",
		alignCenter: "Align center",
		alignRight: "Align right",
		alignJustify: "Justify",
		link: "Link",
		h2: "Heading",
		h3: "Subheading",
		h4: "Heading 4",
		h5: "Heading 5",
		h6: "Heading 6",
		quote: "Quote",
		codeblock: "Code block",
		ul: "Bulleted list",
		ol: "Numbered list",
		undo: "Undo",
		redo: "Redo",
		blocksTitle: "Blocks",
		noResults: "No results",
		addBlock: "Add block",
		blocks: {
			paragraph: ["Text", "Plain paragraph"],
			h2: ["Heading", "Large section heading"],
			h3: ["Subheading", "Smaller section heading"],
			h4: ["Heading 4", "Level 4 heading"],
			h5: ["Heading 5", "Level 5 heading"],
			h6: ["Heading 6", "Level 6 heading"],
			quote: ["Quote", "Highlight a quotation"],
			ul: ["Bulleted list", "Simple list"],
			ol: ["Numbered list", "Ordered list"],
			codeblock: ["Code", "Code block"],
			image: ["Image", "Upload from your device"],
			embed: ["Video", "YouTube or Vimeo"],
			hr: ["Divider", "Separate sections"]
		},
		inputLink: "Paste or type a URL…",
		inputEmbed: "Paste a YouTube or Vimeo link…",
		inputAlt: "Describe the image for screen readers…",
		save: "Save",
		cancel: "Cancel",
		editLink: "Edit link",
		removeLink: "Remove link",
		sizeNormal: "Normal size",
		sizeWide: "Wide",
		sizeFull: "Full width",
		altText: "Alt text",
		removeMedia: "Remove media",
		captionPlaceholder: "Write a caption (optional)",
		titlePlaceholder: "Title",
		subtitlePlaceholder: "Subtitle",
		titleLabel: "Title",
		dragBlock: "Drag to move, click to select the block",
		subtitleLabel: "Subtitle",
		words: "words",
		minutesRead: "min read",
		draftFound: "You have an unsaved draft from {time}.",
		draftRestore: "Restore",
		draftDiscard: "Discard",
		promptUrl: "Enter a URL",
		promptEmbed: "Paste a YouTube or Vimeo link",
		errorUrl: "Invalid URL",
		errorEmbed: "Video link not recognized (YouTube/Vimeo)",
		errorImageType: "Unsupported image format (use PNG, JPG, GIF, WebP, or AVIF).",
		errorImageSize: "\"{name}\" is larger than {size} MB.",
		errorUpload: "Failed to upload \"{name}\"."
	}
};
function he(e = "id", t = {}) {
	let n = me[e] || me.id;
	return {
		...n,
		...t,
		blocks: {
			...n.blocks,
			...t.blocks || {}
		}
	};
}
function ge(e, t = {}) {
	return String(e).replace(/\{(\w+)\}/g, (e, n) => n in t ? t[n] : e);
}
//#endregion
//#region src/core/blocks.js
var _e = [
	{
		command: "paragraph",
		markdown: "",
		keywords: [
			"p",
			"teks",
			"paragraf",
			"text",
			"paragraph"
		]
	},
	{
		command: "h2",
		markdown: "##",
		keywords: [
			"h2",
			"judul",
			"heading",
			"title"
		]
	},
	{
		command: "h3",
		markdown: "###",
		keywords: [
			"h3",
			"subjudul",
			"subheading"
		]
	},
	{
		command: "h4",
		markdown: "####",
		keywords: [
			"h4",
			"judul",
			"heading"
		]
	},
	{
		command: "h5",
		markdown: "#####",
		keywords: [
			"h5",
			"judul",
			"heading"
		]
	},
	{
		command: "h6",
		markdown: "######",
		keywords: [
			"h6",
			"judul",
			"heading"
		]
	},
	{
		command: "quote",
		markdown: ">",
		keywords: [
			"quote",
			"kutipan",
			"blockquote"
		]
	},
	{
		command: "ul",
		markdown: "-",
		keywords: [
			"ul",
			"list",
			"daftar",
			"bullet",
			"poin"
		]
	},
	{
		command: "ol",
		markdown: "1.",
		keywords: [
			"ol",
			"list",
			"daftar",
			"nomor",
			"number",
			"urut"
		]
	},
	{
		command: "codeblock",
		markdown: "```",
		keywords: [
			"code",
			"kode",
			"pre",
			"snippet",
			"program"
		]
	},
	{
		command: "image",
		markdown: "",
		keywords: [
			"image",
			"gambar",
			"foto",
			"img",
			"picture",
			"upload"
		]
	},
	{
		command: "embed",
		markdown: "",
		keywords: [
			"video",
			"youtube",
			"vimeo",
			"embed"
		]
	},
	{
		command: "hr",
		markdown: "---",
		keywords: [
			"hr",
			"pemisah",
			"garis",
			"divider",
			"separator"
		]
	}
];
function ve(e, t = _e, n = {}) {
	let r = e.trim().toLowerCase();
	return t.map((e) => {
		let [t = e.label || e.command, r = e.description || ""] = n.blocks?.[e.command] || [];
		return {
			...e,
			label: t,
			description: r
		};
	}).filter((e) => !r || e.label.toLowerCase().includes(r) || e.keywords.some((e) => e.startsWith(r)));
}
//#endregion
//#region src/core/embed.js
var ye = {
	youtube: {
		title: "YouTube",
		src: (e) => `https://www.youtube-nocookie.com/embed/${e}`
	},
	vimeo: {
		title: "Vimeo",
		src: (e) => `https://player.vimeo.com/video/${e}`
	}
}, be = [
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"music.youtube.com",
	"youtube-nocookie.com",
	"www.youtube-nocookie.com"
], xe = /^[\w-]{11}$/;
function v(e) {
	let t;
	try {
		let n = String(e || "").trim();
		t = new URL(/^https?:\/\//i.test(n) ? n : `https://${n}`);
	} catch {
		return null;
	}
	if (!/^https?:$/.test(t.protocol)) return null;
	let n = t.hostname.toLowerCase(), r = t.pathname.split("/").filter(Boolean), i = null, a = null;
	return n === "youtu.be" ? (i = "youtube", a = r[0]) : be.includes(n) ? (i = "youtube", a = r[0] === "watch" ? t.searchParams.get("v") : [
		"embed",
		"shorts",
		"live",
		"v"
	].includes(r[0]) ? r[1] : null) : n === "vimeo.com" || n === "www.vimeo.com" ? (i = "vimeo", a = r.find((e) => /^\d+$/.test(e))) : n === "player.vimeo.com" && r[0] === "video" && (i = "vimeo", a = r[1]), (i === "youtube" ? xe.test(a || "") : i === "vimeo" && /^\d{1,12}$/.test(a || "")) ? {
		provider: i,
		id: a,
		src: ye[i].src(a),
		title: ye[i].title
	} : null;
}
function Se(e) {
	let t = document.createElement("iframe");
	return t.setAttribute("src", e.src), t.setAttribute("title", e.title), t.setAttribute("allow", "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"), t.setAttribute("allowfullscreen", ""), t.setAttribute("loading", "lazy"), t.setAttribute("referrerpolicy", "strict-origin-when-cross-origin"), t;
}
function Ce(e, { allowData: t = !0, allowBlob: n = !1 } = {}) {
	let r = String(e || "").trim();
	return r ? /^https?:\/\//i.test(r) ? r : r.startsWith("//") ? `https:${r}` : /^\/(?!\/)/.test(r) || /^\.\.?\//.test(r) || t && /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(r) || n && /^blob:/i.test(r) ? r : null : null;
}
//#endregion
//#region src/core/formats.js
var y = [
	"underline",
	"strike",
	"color",
	"highlight",
	"align"
], we = [
	"center",
	"right",
	"justify"
], b = [
	"#e11d48",
	"#ea580c",
	"#ca8a04",
	"#16a34a",
	"#2563eb",
	"#9333ea",
	"#71717a"
], x = [
	"#fef08a",
	"#bbf7d0",
	"#bfdbfe",
	"#fbcfe8",
	"#fed7aa"
];
function Te(e, t = !1) {
	return e === !0 || e == null ? t ? [] : [...y] : Array.isArray(e) ? y.filter((t) => e.includes(t)) : [];
}
function S(e) {
	let t = String(e ?? "").trim().toLowerCase(), n = t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
	if (n) return `#${n[1].length === 3 ? [...n[1]].map((e) => e + e).join("") : n[1]}`;
	if (n = t.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(1|1\.0+|0?\.\d+|0)\s*)?\)$/), !n || n[4] !== void 0 && Number(n[4]) < 1) return null;
	let r = n.slice(1, 4).map(Number);
	return r.every((e) => e <= 255) ? `#${r.map((e) => e.toString(16).padStart(2, "0")).join("")}` : null;
}
function C(e, t) {
	let n = (Array.isArray(e) ? e : t).map(S).filter(Boolean);
	return [...new Set(n)];
}
function w(e, t) {
	let n = String(e || "").match(RegExp(`(?:^|;)\\s*${t}\\s*:\\s*([^;]+)`, "i"));
	return n ? n[1].trim().replace(/\s*!important$/i, "") : "";
}
function Ee(e) {
	for (let t of e.classList || []) {
		let e = t.match(/^(?:afw|ql)-align-(center|right|justify)$/);
		if (e) return e[1];
	}
	let t = (w(e.getAttribute("style"), "text-align") || e.getAttribute("align") || "").toLowerCase();
	return we.includes(t) ? t : null;
}
//#endregion
//#region src/core/url.js
var De = [
	"http",
	"https",
	"mailto",
	"tel"
];
function T(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase(), r = n.match(/^([a-z][a-z0-9+.-]*):/), i = r && /^[a-z0-9.-]+:\d/.test(n);
	return r && !i ? De.includes(r[1]) ? t : null : /^(\/|#|\?|\.)/.test(t) ? t : `https://${t}`;
}
//#endregion
//#region src/core/schema.js
var Oe = [
	"image",
	"embed",
	"horizontalRule"
], ke = ["wide", "full"], Ae = r.create({
	name: "bold",
	parseHTML: () => [
		{ tag: "b" },
		{ tag: "strong" },
		{
			style: "font-weight",
			getAttrs: (e) => /^(bold(er)?|[5-9]\d{2,})$/.test(e) && null
		}
	],
	renderHTML: () => ["b", 0]
}), je = r.create({
	name: "italic",
	parseHTML: () => [
		{ tag: "i" },
		{ tag: "em" },
		{ style: "font-style=italic" }
	],
	renderHTML: () => ["i", 0]
}), Me = r.create({
	name: "code",
	code: !0,
	parseHTML: () => [{ tag: "code" }],
	renderHTML: () => ["code", 0]
}), Ne = r.create({
	name: "link",
	inclusive: !1,
	priority: 1e3,
	addAttributes: () => ({ href: { default: null } }),
	parseHTML: () => [{
		tag: "a[href]",
		getAttrs: (e) => {
			let t = T(e.getAttribute("href"));
			return t ? { href: t } : !1;
		}
	}],
	renderHTML: ({ HTMLAttributes: e }) => [
		"a",
		{ href: e.href },
		0
	]
}), Pe = r.create({
	name: "underline",
	parseHTML: () => [{ tag: "u" }],
	renderHTML: () => ["u", 0]
}), Fe = r.create({
	name: "strike",
	parseHTML: () => [{ tag: "s" }],
	renderHTML: () => ["s", 0]
}), Ie = r.create({
	name: "color",
	addAttributes: () => ({ color: {
		default: null,
		rendered: !1
	} }),
	parseHTML: () => [{
		tag: "span",
		getAttrs: (e) => {
			let t = S(w(e.getAttribute("style"), "color"));
			return t ? { color: t } : !1;
		}
	}],
	renderHTML: ({ mark: e }) => [
		"span",
		{ style: `color: ${e.attrs.color}` },
		0
	]
}), Le = r.create({
	name: "highlight",
	addAttributes: () => ({ color: {
		default: null,
		rendered: !1
	} }),
	parseHTML: () => [{
		tag: "mark",
		getAttrs: (e) => ({ color: S(w(e.getAttribute("style"), "background-color")) })
	}],
	renderHTML: ({ mark: e }) => [
		"mark",
		e.attrs.color ? { style: `background-color: ${e.attrs.color}` } : {},
		0
	]
}), Re = t.create({
	name: "textAlign",
	addGlobalAttributes: () => [{
		types: ["paragraph", "heading"],
		attributes: { textAlign: {
			default: null,
			parseHTML: (e) => Ee(e),
			renderHTML: (e) => e.textAlign ? { class: `afw-align-${e.textAlign}` } : {}
		} }
	}]
}), ze = i.create({
	name: "title",
	content: "text*",
	marks: "",
	defining: !0,
	parseHTML: () => [{
		tag: "h1",
		priority: 60
	}],
	renderHTML: () => ["h1", 0]
}), Be = i.create({
	name: "subtitle",
	content: "text*",
	marks: "link",
	defining: !0,
	parseHTML: () => [{
		tag: "p.afw-subtitle",
		priority: 60
	}],
	renderHTML: () => [
		"p",
		{ class: "afw-subtitle" },
		0
	]
}), Ve = i.create({
	name: "blockquote",
	group: "block",
	content: "inline*",
	defining: !0,
	parseHTML: () => [{ tag: "blockquote" }],
	renderHTML: () => ["blockquote", 0]
}), He = i.create({
	name: "horizontalRule",
	group: "block",
	atom: !0,
	selectable: !0,
	parseHTML: () => [{ tag: "hr" }],
	renderHTML: () => ["hr"]
}), Ue = {
	default: null,
	parseHTML: (e) => ke.includes(e.getAttribute("data-size")) ? e.getAttribute("data-size") : null,
	renderHTML: (e) => e.size ? { "data-size": e.size } : {}
}, We = (e) => e.querySelector(":scope > figcaption") || document.createElement("figcaption"), Ge = i.create({
	name: "image",
	group: "block",
	content: "text*",
	marks: "",
	draggable: !0,
	selectable: !0,
	isolating: !0,
	addOptions: () => ({
		allowDataImages: !0,
		captionPlaceholder: ""
	}),
	addAttributes() {
		return {
			src: { default: null },
			alt: { default: "" },
			size: Ue,
			mediaId: {
				default: null,
				rendered: !1
			},
			uploading: {
				default: null,
				rendered: !1
			}
		};
	},
	parseHTML() {
		return [{
			tag: "figure",
			contentElement: We,
			getAttrs: (e) => {
				let t = e.querySelector(":scope > img"), n = t && Ce(t.getAttribute("src"), { allowData: this.options.allowDataImages }), r = t?.getAttribute("data-media-id");
				return n ? {
					src: n,
					alt: t.getAttribute("alt") || "",
					mediaId: /^\d{1,20}$/.test(r) ? r : null
				} : !1;
			}
		}];
	},
	renderHTML({ node: e, HTMLAttributes: t }) {
		let n = {
			src: e.attrs.src,
			alt: e.attrs.alt,
			"data-media-id": e.attrs.mediaId
		};
		return [
			"figure",
			{ "data-size": t["data-size"] },
			["img", n],
			["figcaption", 0]
		];
	},
	addNodeView() {
		return ({ node: e }) => new tt(e, this.options);
	}
}), Ke = i.create({
	name: "embed",
	group: "block",
	content: "text*",
	marks: "",
	draggable: !0,
	selectable: !0,
	isolating: !0,
	addOptions: () => ({ captionPlaceholder: "" }),
	addAttributes: () => ({
		provider: { default: null },
		id: { default: null },
		size: Ue
	}),
	parseHTML: () => [{
		tag: "figure[data-embed]",
		priority: 60,
		contentElement: We,
		getAttrs: (e) => {
			let t = v(e.querySelector(":scope > iframe")?.getAttribute("src"));
			return t ? {
				provider: t.provider,
				id: t.id
			} : !1;
		}
	}],
	renderHTML({ node: e, HTMLAttributes: t }) {
		let n = qe(e);
		if (!n) return ["figure", ["figcaption", 0]];
		let r = Se(n), i = Object.fromEntries([...r.attributes].map((e) => [e.name, e.value]));
		return [
			"figure",
			{
				"data-embed": n.provider,
				"data-size": t["data-size"]
			},
			["iframe", i],
			["figcaption", 0]
		];
	},
	addNodeView() {
		return ({ node: e }) => new tt(e, this.options);
	}
}), qe = (e) => v(e.attrs.provider === "vimeo" ? `https://vimeo.com/${e.attrs.id}` : `https://youtu.be/${e.attrs.id}`), Je = /^\s*(?:(?:<figure[\s>][\s\S]*?<\/figure>|<hr\s*\/?>)\s*)*<h1[\s>]/i;
function Ye(e, t) {
	return t && !Je.test(e) ? `<h1></h1>${e}` : e;
}
var Xe = [
	"image",
	"embed",
	"horizontalRule"
];
function E(e) {
	let t = 0;
	for (; t < e.childCount - 1 && e.child(t).type.name !== "title";) t++;
	return t;
}
function Ze(e) {
	let t = 0;
	for (let n = 0, r = E(e); n < r; n++) t += e.child(n).nodeSize;
	return t;
}
function Qe({ allowDataImages: e = !0, captionPlaceholder: t = "", headings: n = [2, 3], title: r = !1, formats: i = y } = {}) {
	let a = {
		underline: Pe,
		strike: Fe,
		color: Ie,
		highlight: Le,
		align: Re
	};
	return [
		...r ? [
			ae.extend({ content: `(${Xe.join(" | ")})* title subtitle? block+` }),
			ze,
			Be
		] : [ae],
		fe,
		pe,
		oe.configure({ keepMarks: !0 }),
		se.configure({ levels: n }),
		Ve,
		ce,
		de,
		le,
		ue,
		ie.configure({
			exitOnTripleEnter: !1,
			languageClassPrefix: null
		}),
		He,
		Ge.configure({
			allowDataImages: e,
			captionPlaceholder: t
		}),
		Ke.configure({ captionPlaceholder: t }),
		Ae,
		je,
		Me,
		Ne,
		...y.filter((e) => i.includes(e)).map((e) => a[e])
	];
}
//#endregion
//#region src/core/media.js
var $e = ["wide", "full"], D = (e) => !!e && Oe.includes(e.type.name);
function et(e) {
	return e.type.name === "horizontalRule" ? "divider" : e.type.name === "embed" ? "embed" : "image";
}
var tt = class {
	constructor(e, { captionPlaceholder: t = "" } = {}) {
		this.node = e, this.dom = document.createElement("figure"), this.contentDOM = document.createElement("figcaption"), this.contentDOM.dataset.placeholder = t, e.type.name === "embed" ? (this.media = Se(qe(e)), this.media.setAttribute("tabindex", "-1"), this.dom.setAttribute("data-embed", e.attrs.provider)) : (this.media = document.createElement("img"), this.media.setAttribute("draggable", "false")), this.dom.append(this.media, this.contentDOM), this.render(e);
	}
	render(e) {
		let { attrs: t } = e;
		nt(this.dom, "data-size", t.size), nt(this.dom, "data-afw-uploading", t.uploading ? "" : null), e.type.name === "image" && (this.media.getAttribute("src") !== t.src && this.media.setAttribute("src", t.src || ""), this.media.setAttribute("alt", t.alt || "")), this.contentDOM.classList.toggle("afw-is-empty", e.content.size === 0);
	}
	update(e) {
		return e.type !== this.node.type || e.type.name === "embed" && (e.attrs.id !== this.node.attrs.id || e.attrs.provider !== this.node.attrs.provider) ? !1 : (this.node = e, this.render(e), !0);
	}
	ignoreMutation(e) {
		return e.type === "selection" ? !1 : e.type === "attributes" || !this.contentDOM.contains(e.target);
	}
};
function nt(e, t, n) {
	n == null ? e.removeAttribute(t) : e.getAttribute(t) !== n && e.setAttribute(t, n);
}
function rt(e) {
	return ({ tr: t, state: n, dispatch: r }) => {
		let i = e.type && typeof e.type == "object" ? e : n.schema.nodeFromJSON(e), { selection: a } = t, { $from: o } = a, s, c;
		if (o.depth === 1 && o.parent.type.name === "title") return r && (t.insert(o.before(1), i), t.setSelection(_.create(t.doc, a.from + i.nodeSize)), t.scrollIntoView()), !0;
		if (o.depth === 1 && o.parent.type.name === "subtitle") s = c = o.after(1);
		else if (a instanceof h || o.depth === 0) s = c = a instanceof h ? a.to : o.pos;
		else {
			let e = o.node(1), t = e.type.name === "paragraph" && e.content.size === 0;
			s = t ? o.before(1) : o.after(1), c = t ? o.after(1) : s;
		}
		if (!r) return !0;
		t.replaceWith(s, c, i);
		let l = s + i.nodeSize, u = t.doc.nodeAt(l);
		return (!u || D(u)) && t.insert(l, n.schema.nodes.paragraph.create()), t.setSelection(_.near(t.doc.resolve(l + 1))), t.scrollIntoView(), !0;
	};
}
function it(e, t) {
	let n = null;
	return e.descendants((e, r) => n === null && (e.type.name === "image" && e.attrs.uploading === t && (n = r), !e.isBlock || e.type.name === "doc")), n;
}
var at = 0, ot = (e) => new Promise((t, n) => {
	let r = new FileReader();
	r.onload = () => t(r.result), r.onerror = () => n(r.error), r.readAsDataURL(e);
});
function st(e) {
	let t = typeof e == "string" ? { url: e } : e && typeof e == "object" ? e : {}, n = typeof t.url == "string" ? t.url : "", r = t.mediaId ?? t.media_id;
	return {
		url: n,
		mediaId: /^\d{1,20}$/.test(String(r ?? "")) ? String(r) : null,
		alt: typeof t.alt == "string" ? t.alt.trim() : ""
	};
}
async function ct(e, t) {
	let { upload: n, maxImageSize: r } = e.options, i = e.strings, a = [...t].filter((e) => /^image\/(png|jpe?g|gif|webp|avif)$/.test(e.type));
	if (!a.length) t.length && e.emit("error", { message: i.errorImageType });
	else for (let t of a) {
		if (r && t.size > r) {
			let n = (r / 1024 / 1024).toFixed(1).replace(/\.0$/, "");
			e.emit("error", { message: ge(i.errorImageSize, {
				name: t.name,
				size: n
			}) });
			continue;
		}
		let a = URL.createObjectURL(t), o = `u${++at}`;
		e.tiptap.commands.insertMediaBlock({
			type: "image",
			attrs: {
				src: a,
				alt: "",
				uploading: o
			}
		});
		try {
			let { url: r, mediaId: i, alt: a } = st(n ? await n(t) : await ot(t));
			if (!r) throw Error("URL hasil upload kosong");
			lt(e, o, (e, t, n) => e.setNodeMarkup(t, null, {
				...n.attrs,
				src: r,
				mediaId: i,
				alt: n.attrs.alt || a,
				uploading: null
			}));
		} catch (n) {
			lt(e, o, (e, t, n) => e.delete(t, t + n.nodeSize)), e.emit("error", {
				message: ge(i.errorUpload, { name: t.name }),
				error: n
			});
		} finally {
			URL.revokeObjectURL(a);
		}
	}
}
function lt(e, t, n) {
	let { state: r, view: i } = e.tiptap, a = it(r.doc, t);
	if (a === null) return;
	let o = r.tr;
	n(o, a, r.doc.nodeAt(a)), i.dispatch(o);
}
function ut(e) {
	let t = e.saveSelection(), n = document.createElement("input");
	n.type = "file", n.accept = "image/png,image/jpeg,image/gif,image/webp,image/avif", n.multiple = !0, n.addEventListener("change", () => {
		e.restoreSelection(t), ct(e, n.files);
	}), n.click();
}
//#endregion
//#region src/core/commands.js
var O = (e) => e.tiptap, k = (e) => e.tiptap.state.selection.$from;
function dt(e, t) {
	let n = k(e);
	for (let e = n.depth; e > 0; e--) if (t.includes(n.node(e).type.name)) return n.node(e);
	return null;
}
var A = (e) => !!dt(e, ["listItem"]), ft = (e) => dt(e, ["bulletList", "orderedList"])?.type.name || null, j = (e) => k(e).parent.type.name, pt = (e, t) => (n) => O(n).commands.toggleNode(e, "paragraph", t), mt = (e) => e.options.title && k(e).depth === 1 && k(e).index(0) === E(e.tiptap.state.doc) + 1, ht = (e) => e.options.headings[1] ?? e.options.headings[0], M = (e) => ({
	run(t) {
		if (!t.options.headings.includes(e)) return !1;
		if (mt(t) && e === ht(t)) {
			if (j(t) === "subtitle") return O(t).commands.setNode("paragraph");
			let e = k(t).index(0) === t.tiptap.state.doc.childCount - 1;
			return O(t).chain().command(({ tr: t, state: n }) => (e && t.insert(t.doc.content.size, n.schema.nodes.paragraph.create()), !0)).setNode("subtitle").run();
		}
		return j(t) === "subtitle" ? O(t).commands.setNode("heading", { level: e }) : pt("heading", {
			level: e,
			...yt(t)
		})(t);
	},
	active: (t) => O(t).isActive("heading", { level: e }) || j(t) === "subtitle" && e === ht(t)
}), gt = {
	underline: ["underline"],
	strike: ["strike"],
	color: ["color", "highlight"],
	highlight: ["highlight"],
	align: ["align"],
	alignLeft: ["align"],
	alignCenter: ["align"],
	alignRight: ["align"],
	alignJustify: ["align"]
}, _t = (e, t) => !gt[t] || gt[t].some((t) => e.includes(t)), N = (e, t) => e.options.formats.includes(t), vt = ["paragraph", "heading"], yt = (e) => N(e, "align") ? { textAlign: P(e) } : {};
function P(e) {
	let t = k(e), n = t.depth >= 1 ? t.node(1) : t.nodeAfter;
	return n && vt.includes(n.type.name) && n.attrs.textAlign || null;
}
function bt(e, t) {
	if (!N(e, "align")) return !1;
	let n = we.includes(t) ? t : null, { state: r, view: i } = O(e), { from: a, to: o } = r.selection, s = r.tr;
	return r.doc.nodesBetween(a, o, (e, t) => (vt.includes(e.type.name) && e.attrs.textAlign !== n && s.setNodeMarkup(t, null, {
		...e.attrs,
		textAlign: n
	}), !1)), s.docChanged && i.dispatch(s), !0;
}
var F = (e) => ({
	run: (t) => bt(t, e),
	active: (t) => P(t) === (e === "left" ? null : e)
}), xt = (e) => ({
	run: (t) => N(t, e) && O(t).commands.toggleMark(e),
	active: (t) => N(t, e) && O(t).isActive(e)
}), St = (e, t) => ({
	run(n, r) {
		if (!N(n, e)) return !1;
		let i = S(r);
		return i ? n.options[t].includes(i) ? O(n).commands.setMark(e, { color: i }) : !1 : O(n).chain().extendMarkRange(e).unsetMark(e).run();
	},
	active: (t) => N(t, e) && O(t).isActive(e)
}), Ct = [
	"bold",
	"italic",
	"ul",
	"ol",
	"codeblock",
	"indent",
	"outdent",
	...Object.keys(gt)
];
function wt(e, t) {
	if (!_t(e.options.formats, t)) return !0;
	let n = j(e);
	return n === "title" ? ![
		"undo",
		"redo",
		"image",
		"embed",
		"hr"
	].includes(t) : n === "subtitle" && Ct.includes(t);
}
var I = {
	bold: {
		run: (e) => O(e).commands.toggleMark("bold"),
		active: (e) => O(e).isActive("bold")
	},
	italic: {
		run: (e) => O(e).commands.toggleMark("italic"),
		active: (e) => O(e).isActive("italic")
	},
	underline: xt("underline"),
	strike: xt("strike"),
	color: {
		...St("color", "colors"),
		active: (e) => N(e, "color") && O(e).isActive("color") || N(e, "highlight") && O(e).isActive("highlight")
	},
	highlight: St("highlight", "highlights"),
	align: {
		run(e, t) {
			if (t !== void 0) return bt(e, t);
			let n = [null, ...we];
			return bt(e, n[(n.indexOf(P(e)) + 1) % n.length]);
		},
		active: (e) => P(e) !== null
	},
	alignLeft: F("left"),
	alignCenter: F("center"),
	alignRight: F("right"),
	alignJustify: F("justify"),
	h2: M(2),
	h3: M(3),
	h4: M(4),
	h5: M(5),
	h6: M(6),
	quote: {
		run: pt("blockquote"),
		active: (e) => j(e) === "blockquote"
	},
	ul: {
		run: (e) => O(e).commands.toggleBulletList(),
		active: (e) => ft(e) === "bulletList"
	},
	ol: {
		run: (e) => O(e).commands.toggleOrderedList(),
		active: (e) => ft(e) === "orderedList"
	},
	codeblock: {
		run: (e) => O(e).commands.toggleCodeBlock(),
		active: (e) => j(e) === "codeBlock"
	},
	paragraph: {
		run(e) {
			A(e) ? O(e).commands.liftListItem("listItem") : j(e) !== "title" && O(e).commands.setNode("paragraph", yt(e));
		},
		active: (e) => j(e) === "paragraph" && !A(e)
	},
	link: {
		run(e, t) {
			let n = O(e), r = n.isActive("link") ? n.getAttributes("link").href || "" : null;
			if (t === void 0) {
				if (e.listeners.linkrequest?.length) {
					e.emit("linkrequest", { href: r || "" });
					return;
				}
				if (r !== null) return I.unlink.run(e);
				let n = e.saveSelection();
				t = window.prompt(e.strings.promptUrl, "https://"), e.restoreSelection(n);
			}
			let i = T(t);
			i ? r === null ? n.state.selection.empty ? n.commands.insertContent({
				type: "text",
				text: i,
				marks: [{
					type: "link",
					attrs: { href: i }
				}]
			}) : n.commands.setMark("link", { href: i }) : n.chain().extendMarkRange("link").setMark("link", { href: i }).run() : r !== null && I.unlink.run(e);
		},
		active: (e) => O(e).isActive("link")
	},
	unlink: {
		run(e) {
			let t = O(e);
			t.chain().extendMarkRange("link").unsetMark("link").run();
			let { to: n } = t.state.selection;
			t.commands.setTextSelection(n);
		},
		active: () => !1
	},
	image: {
		run: (e, t) => t ? ct(e, t) : ut(e),
		active: () => !1
	},
	embed: {
		run(e, t) {
			if (t === void 0) {
				if (e.listeners.embedrequest?.length) {
					e.emit("embedrequest", {});
					return;
				}
				let n = e.saveSelection();
				if (t = window.prompt(e.strings.promptEmbed), !t) return;
				e.restoreSelection(n);
			}
			let n = v(t);
			n ? O(e).commands.insertMediaBlock({
				type: "embed",
				attrs: {
					provider: n.provider,
					id: n.id
				}
			}) : e.emit("error", { message: e.strings.errorEmbed });
		},
		active: () => !1
	},
	hr: {
		run: (e) => O(e).commands.insertMediaBlock({ type: "horizontalRule" }),
		active: () => !1
	},
	undo: {
		run: (e) => e.undo(),
		active: () => !1
	},
	redo: {
		run: (e) => e.redo(),
		active: () => !1
	},
	indent: {
		run: (e) => A(e) && O(e).commands.sinkListItem("listItem"),
		active: () => !1
	},
	outdent: {
		run: (e) => A(e) && O(e).commands.liftListItem("listItem"),
		active: () => !1
	}
}, Tt = [
	{
		find: /^(#{1,6})\s$/,
		run: (e, t, n) => {
			let r = Math.max(t[1].length, 2), i = n.filter((e) => e <= r);
			return e.setNode("heading", { level: i.length ? i[i.length - 1] : n[0] });
		}
	},
	{
		find: /^>\s$/,
		run: (e) => e.setNode("blockquote")
	},
	{
		find: /^[-*+]\s$/,
		run: (e) => e.toggleBulletList()
	},
	{
		find: /^\d+[.)]\s$/,
		run: (e) => e.toggleOrderedList()
	},
	{
		find: /^(-{3,}|\*{3,}|_{3,})\s$/,
		run: (e) => e.insertMediaBlock({ type: "horizontalRule" })
	},
	{
		find: /^```\s$/,
		run: (e) => e.setNode("codeBlock")
	}
], Et = [
	{
		find: /\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/,
		mark: "bold"
	},
	{
		find: /(?<![*\w])\*([^*\s](?:[^*]*[^*\s])?)\*$/,
		mark: "italic"
	},
	{
		find: /(?<![_\w])_([^_\s](?:[^_]*[^_\s])?)_$/,
		mark: "italic"
	},
	{
		find: /`([^`]+)`$/,
		mark: "code"
	}
];
function Dt(e, t = [2, 3]) {
	let r = Tt.map(({ find: e, run: r }) => new n({
		find: e,
		handler: ({ state: e, range: n, match: i, chain: a }) => {
			let o = e.doc.resolve(n.from);
			if (o.depth !== 1 || o.parent.type.name !== "paragraph") return null;
			r(a().deleteRange(n), i, t).run();
		}
	})), i = Et.map(({ find: t, mark: r }) => {
		let i = e.marks[r], a = c({
			find: t,
			type: i
		});
		return new n({
			find: t,
			handler: (e) => e.state.doc.resolve(e.range.from).parent.type.allowsMarkType(i) ? a.handler(e) : null
		});
	});
	return [...r, ...i];
}
//#endregion
//#region src/core/sanitize.js
var Ot = /* @__PURE__ */ new Set([
	"P",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"BLOCKQUOTE",
	"UL",
	"OL",
	"LI",
	"FIGURE",
	"HR",
	"PRE"
]), kt = /* @__PURE__ */ new Set(["FIGURE", "HR"]), At = ["wide", "full"], jt = /* @__PURE__ */ new Set([
	"B",
	"I",
	"A",
	"CODE",
	"BR",
	"U",
	"S",
	"SPAN",
	"MARK"
]), Mt = [
	"B",
	"I",
	"A",
	"CODE",
	"U",
	"S",
	"SPAN",
	"MARK"
], Nt = {
	U: ["U", "underline"],
	INS: ["U", "underline"],
	S: ["S", "strike"],
	STRIKE: ["S", "strike"],
	DEL: ["S", "strike"]
}, Pt = /* @__PURE__ */ new Set([
	"P",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6"
]), Ft = /^\d{1,20}$/, It = /^(on|style$|class$|srcdoc$|formaction$|xmlns|xlink)/i, Lt = /* @__PURE__ */ new Set([
	"href",
	"src",
	"cite",
	"action",
	"poster"
]), L = /* @__PURE__ */ new Set(["UL", "OL"]), Rt = /* @__PURE__ */ new Set(/* @__PURE__ */ "SCRIPT.STYLE.TEMPLATE.FRAME.FRAMESET.OBJECT.EMBED.APPLET.META.LINK.BASE.TITLE.HEAD.NOSCRIPT.SVG.MATH.CANVAS.FORM.INPUT.BUTTON.SELECT.OPTION.TEXTAREA.DIALOG.SOURCE.VIDEO.AUDIO.TRACK.O:P".split(".")), zt = {
	P: "P",
	BLOCKQUOTE: "BLOCKQUOTE",
	UL: "UL",
	OL: "OL",
	LI: "LI",
	B: "B",
	STRONG: "B",
	I: "I",
	EM: "I",
	CITE: "I",
	DFN: "I",
	A: "A",
	CODE: "CODE",
	TT: "CODE",
	KBD: "CODE",
	SAMP: "CODE",
	BR: "BR"
}, Bt = /* @__PURE__ */ new Set([
	"DIV",
	"SECTION",
	"ARTICLE",
	"MAIN",
	"HEADER",
	"FOOTER",
	"ASIDE",
	"NAV",
	"ADDRESS",
	"CENTER",
	"DL",
	"DT",
	"DD",
	"DETAILS",
	"SUMMARY",
	"TABLE",
	"CAPTION",
	"THEAD",
	"TBODY",
	"TFOOT",
	"TR",
	"BODY",
	"HTML"
]), R = {}, Vt = /* @__PURE__ */ new Set([
	"IMG",
	"IFRAME",
	"FRAME",
	"FIGURE",
	"FIGCAPTION",
	"PRE",
	"HR",
	"INS",
	"DEL",
	"STRIKE",
	"FONT"
]), Ht = (e) => /^[a-z][a-z0-9-]*$/i.test(e);
function Ut(e) {
	let t = new Set((e.allowTags || []).filter(Ht).map((e) => e.toUpperCase()).filter((e) => !Rt.has(e) && !Vt.has(e) && !Ot.has(e) && !jt.has(e) && !zt[e] && !Bt.has(e))), n = {};
	return Object.entries(e.allowAttributes || {}).forEach(([e, t]) => {
		if (e !== "*" && !Ht(e)) return;
		let r = (Array.isArray(t) ? t : []).filter((e) => /^[a-z][a-z0-9_:-]*$/i.test(e) && !It.test(e));
		r.length && (n[e === "*" ? "*" : e.toUpperCase()] = r.map((e) => e.toLowerCase()));
	}), {
		tags: t,
		attributes: n,
		classes: new Set((e.allowClasses || []).filter((e) => /^[a-z_-][a-z0-9_-]*$/i.test(e) && !/^afw-/.test(e)))
	};
}
var z = (e) => R.formats.includes(e);
function B(e) {
	let t = [...new Set((Array.isArray(e) ? e : []).map(Number))].filter((e) => Number.isInteger(e) && e >= 2 && e <= 6).sort((e, t) => e - t);
	return t.length ? t : [2, 3];
}
function Wt(e) {
	let t = R.headings, n = Number(e[1]), r = t.filter((e) => e <= n);
	return `H${r.length ? r[r.length - 1] : t[0]}`;
}
function V(e, t = {}) {
	return !e || !String(e).trim() ? "" : Gt(e, t).innerHTML;
}
function Gt(e, t = {}) {
	R = {
		allowDataImages: !0,
		...t
	}, R.headings = B(t.headings), R.title = !!t.title, R.formats = Te(t.formats, R.title), R.colors = C(t.colors, b), R.highlights = C(t.highlights, x), R.allow = Ut(t);
	let n = [...new DOMParser().parseFromString(String(e), "text/html").body.childNodes].flatMap(qt), r = document.createElement("div");
	return r.append(...rn(n, "P")), ln(r), R.title && Kt(r), r;
}
function Kt(e) {
	let t = [...e.children], n = 0;
	for (; ["FIGURE", "HR"].includes(t[n]?.tagName);) n++;
	t[n]?.tagName !== "H1" && (n = 0);
	let r = t[n]?.tagName === "H1" ? t[n] : null;
	if (t.forEach((e, t) => {
		e.tagName === "H1" && e !== r && e.replaceWith(W(Wt("H1"), {}, [...e.childNodes])), e.tagName === "P" && e.classList.contains("afw-subtitle") && !(r && t === n + 1) && e.removeAttribute("class");
	}), !r) return;
	r.textContent = ((e) => (e.querySelectorAll("br").forEach((e) => e.replaceWith(" ")), e.textContent.replace(/\s+/g, " ").trim()))(r);
	let i = r.nextElementSibling;
	i?.classList.contains("afw-subtitle") && (i.querySelectorAll("br").forEach((e) => e.replaceWith(" ")), i.querySelectorAll("b, i, code, u, s, span, mark").forEach(q));
}
function qt(e) {
	if (e.nodeType === Node.TEXT_NODE) return [document.createTextNode(e.data)];
	if (e.nodeType !== Node.ELEMENT_NODE) return [];
	let t = e.tagName.toUpperCase(), n = (e.getAttribute("style") || "").toLowerCase();
	if (Rt.has(t) || /display\s*:\s*none/.test(n) || /mso-list\s*:\s*ignore/.test(n)) return [];
	if (t === "IMG") return en(e);
	if (t === "P" && R.title && e.classList.contains("afw-subtitle")) return [W("P", { class: "afw-subtitle" }, K([...e.childNodes].flatMap(qt)))];
	if (t === "IFRAME") {
		let t = v(e.getAttribute("src"));
		return t ? [tn(t)] : [];
	}
	if (t === "HR") return [W("HR")];
	if (t === "PRE") return $t(e);
	let r = [...e.childNodes].flatMap(qt);
	if (t === "FIGCAPTION") return [W("FIGCAPTION", {}, K(r))];
	if (t === "FIGURE") return nn(e, r);
	if (t === "B" && /font-weight\s*:\s*(normal|400)/.test(n)) return r;
	if (t === "TD" || t === "TH") return [...r, document.createTextNode(" ")];
	if (R.allow.tags.has(t)) return G(t, r, H(e, t));
	if (Nt[t]) {
		let [i, a] = Nt[t];
		return Yt(z(a) ? G(i, r) : r, e, n);
	}
	if (t === "MARK") {
		if (!z("highlight")) return r;
		let t = Jt(w(n, "background-color") || e.getAttribute("data-color"), R.highlights);
		return G("MARK", r, t ? { style: `background-color: ${t}` } : {});
	}
	let i = t === "H1" && R.title ? "H1" : /^H[1-6]$/.test(t) ? Wt(t) : zt[t] || (Bt.has(t) ? "P" : null);
	if (!i) return Yt(r, e, n);
	if (i === "BR") return [document.createElement("br")];
	if (i === "A") {
		let t = T(e.getAttribute("href"));
		return t ? G("A", r, {
			href: t,
			...H(e, "A")
		}) : r;
	}
	return jt.has(i) ? G(i, r, H(e, i)) : on(i, r, Xt(e, i));
}
function Jt(e, t) {
	let n = S(e);
	return n && t.includes(n) ? n : null;
}
function Yt(e, t, n) {
	let r = e;
	/font-style\s*:\s*italic/.test(n) && (r = G("I", r)), /font-weight\s*:\s*(bold|bolder|[6-9]00)/.test(n) && (r = G("B", r));
	let i = `${w(n, "text-decoration")} ${w(n, "text-decoration-line")}`;
	z("underline") && /underline/.test(i) && (r = G("U", r)), z("strike") && /line-through/.test(i) && (r = G("S", r));
	let a = z("color") && Jt(w(n, "color") || (t.tagName === "FONT" ? t.getAttribute("color") : ""), R.colors);
	a && (r = G("SPAN", r, { style: `color: ${a}` }));
	let o = z("highlight") && Jt(w(n, "background-color"), R.highlights);
	return o && (r = G("MARK", r, { style: `background-color: ${o}` })), r;
}
function H(e, t) {
	let { attributes: n, classes: r } = R.allow, i = {};
	[...n[t] || [], ...n["*"] || []].forEach((t) => {
		if (!e.hasAttribute(t)) return;
		let n = Lt.has(t) ? T(e.getAttribute(t)) : e.getAttribute(t);
		n !== null && n !== "" && (i[t] = n);
	});
	let a = [...e.classList || []].filter((e) => r.has(e));
	return a.length && (i.class = a.join(" ")), i;
}
function Xt(e, t) {
	let n = H(e, t), r = Pt.has(t) && z("align") ? Ee(e) : null;
	return r && (n.class = [`afw-align-${r}`, n.class].filter(Boolean).join(" ")), n;
}
var U = (e) => e.nodeType === Node.ELEMENT_NODE && Ot.has(e.tagName), Zt = (e) => e.nodeType === Node.ELEMENT_NODE && kt.has(e.tagName);
function Qt(e) {
	let t = e.cloneNode(!0);
	return t.querySelectorAll("br").forEach((e) => e.replaceWith("\n")), t.textContent.replace(/\u200b/g, "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");
}
function $t(e) {
	let t = Qt(e);
	return t.trim() ? [W("PRE", {}, [W("CODE", {}, [document.createTextNode(t)])])] : [];
}
function en(e) {
	let t = Ce(e.getAttribute("src") || e.getAttribute("data-src"), { allowData: R.allowDataImages });
	if (!t) return [];
	let n = (e.getAttribute("alt") || "").trim(), r = (e.getAttribute("data-media-id") || "").trim();
	return [W("FIGURE", {}, [W("IMG", {
		src: t,
		alt: n,
		...Ft.test(r) && { "data-media-id": r },
		...H(e, "IMG")
	})])];
}
function tn(e) {
	return W("FIGURE", { "data-embed": e.provider }, [Se(e)]);
}
function nn(e, t) {
	let n = t.filter((e) => e.nodeType === Node.ELEMENT_NODE && e.tagName === "FIGURE"), r = t.filter((e) => e.nodeType === Node.ELEMENT_NODE && e.tagName === "FIGCAPTION");
	if (!n.length) return rn(r.flatMap((e) => [...e.childNodes]), "P");
	let [i, ...a] = n, o = e.getAttribute("data-size");
	return At.includes(o) && i.setAttribute("data-size", o), r.length && i.append(W("FIGCAPTION", {}, r.flatMap((e) => [...e.childNodes]))), [i, ...a];
}
function W(e, t = {}, n = []) {
	let r = document.createElement(e);
	return Object.entries(t).forEach(([e, t]) => r.setAttribute(e, t)), r.append(...n), r;
}
function rn(e, t, n = {}) {
	let r = [], i = [], a = () => {
		i.length && r.push(W(t, n, i)), i = [];
	};
	return e.forEach((e) => {
		U(e) ? (a(), r.push(e)) : i.push(e);
	}), a(), r;
}
function G(e, t, n = {}) {
	if (!t.some(U)) return [W(e, n, t)];
	let r = [], i = [], a = () => {
		i.length && r.push(W(e, n, i)), i = [];
	};
	return t.forEach((t) => {
		U(t) ? (a(), an(t, e, n), r.push(t)) : i.push(t);
	}), a(), r;
}
function an(e, t, n) {
	if (kt.has(e.tagName)) return;
	if (L.has(e.tagName)) {
		[...e.children].forEach((e) => an(e, t, n));
		return;
	}
	let r = [...e.childNodes];
	e.replaceChildren(...G(t, r.filter((e) => !U(e)), n)), r.filter(U).forEach((r) => {
		an(r, t, n), e.append(r);
	});
}
function K(e, { keepLists: t = !1 } = {}) {
	let n = [], r = !1;
	return e.forEach((e) => {
		if (Zt(e)) n.length && (r = !0);
		else if (e.nodeType === Node.ELEMENT_NODE && e.tagName === "PRE") n.length && n.push(document.createElement("br")), n.push(W("CODE", {}, [e.textContent.replace(/\n/g, " ")])), r = !0;
		else if (t && e.nodeType === Node.ELEMENT_NODE && L.has(e.tagName)) n.push(e), r = !1;
		else if (U(e)) {
			let t = L.has(e.tagName) ? [...e.children].flatMap((e, t) => [...t ? [document.createElement("br")] : [], ...K([...e.childNodes])]) : K([...e.childNodes]);
			n.length && n.push(document.createElement("br")), n.push(...t), r = !0;
		} else r && (e.nodeType !== Node.TEXT_NODE || e.data.trim()) && (n.push(document.createElement("br")), r = !1), n.push(e);
	}), n;
}
function on(e, t, n = {}) {
	switch (e) {
		case "P":
		case "H1":
		case "H2":
		case "H3":
		case "H4":
		case "H5":
		case "H6": return rn(t, e, n);
		case "BLOCKQUOTE": return [W("BLOCKQUOTE", n, K(t))];
		case "LI": return [W("LI", n, K(t, { keepLists: !0 }))];
		case "UL":
		case "OL": {
			let r = W(e, n), i = [], a = () => {
				i.some((e) => e.nodeType !== Node.TEXT_NODE || e.data.trim()) && r.append(W("LI", {}, i)), i = [];
			};
			return t.forEach((e) => {
				if (!U(e)) return i.push(e);
				a(), e.tagName === "LI" ? r.append(e) : L.has(e.tagName) ? (r.lastElementChild || r.appendChild(W("LI"))).append(e) : r.append(W("LI", {}, K([e])));
			}), a(), [r];
		}
		default: return t;
	}
}
var sn = "h1, h2, h3, h4, h5, h6", cn = `p, ${sn}, blockquote, li, figcaption`;
function ln(e) {
	un(e), e.querySelectorAll(cn).forEach(fn), pn(e), e.querySelectorAll(cn).forEach(mn), hn(e), gn(e), yn(e), e.normalize();
}
function q(e) {
	e.replaceWith(...e.childNodes);
}
function un(e) {
	[
		"B",
		"I",
		"A",
		"CODE",
		"U",
		"S"
	].forEach((t) => {
		e.querySelectorAll(`${t} ${t}`).forEach(q);
	}), e.querySelectorAll("a u").forEach(q), e.querySelectorAll(sn.split(", ").map((e) => `${e} b`).join(", ")).forEach(q);
}
function dn(e) {
	let t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode(e) {
		return e.nodeType === Node.ELEMENT_NODE && L.has(e.tagName) ? NodeFilter.FILTER_REJECT : e.nodeType === Node.TEXT_NODE || e.tagName === "BR" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} }), n = [];
	for (; t.nextNode();) n.push(t.currentNode);
	return n;
}
function fn(e) {
	let t = dn(e), n = !0;
	t.forEach((e) => {
		if (e.nodeType !== Node.TEXT_NODE) {
			n = !0;
			return;
		}
		let t = e.data.replace(/[\s ​﻿]+/g, (e) => /[^​﻿]/.test(e) ? " " : "");
		n && t.startsWith(" ") && (t = t.slice(1)), e.data = t, t && (n = t.endsWith(" "));
	});
	let r = !0;
	for (let e = t.length - 1; e >= 0; e--) {
		let n = t[e];
		n.nodeType === Node.TEXT_NODE ? (r && (n.data = n.data.replace(/ +$/, "")), n.data && (r = !1)) : r = !0;
	}
}
function pn(e) {
	let t = !0;
	for (; t;) t = !1, e.querySelectorAll(_n()).forEach((e) => {
		!e.textContent && !e.querySelector("br") ? (e.remove(), t = !0) : !e.textContent.trim() && !e.querySelector("br") && e.tagName !== "A" && (q(e), t = !0);
	});
}
function mn(e) {
	let t = dn(e).filter((e) => e.nodeType !== Node.TEXT_NODE || e.data), n = 0;
	for (; n < t.length && t[n].nodeName === "BR";) t[n++].remove();
	let r = t.length - 1;
	for (; r >= n && t[r].nodeName === "BR";) t[r--].remove();
	for (let e = n + 1; e <= r; e++) t[e].nodeName === "BR" && t[e - 1].nodeName === "BR" && t[e].remove();
}
function hn(e) {
	[...e.querySelectorAll(`${cn}, ul, ol`)].reverse().forEach((e) => {
		let t = dn(e).some((e) => e.nodeType === Node.TEXT_NODE && e.data.trim()), n = L.has(e.tagName) ? !!e.querySelector("li") : !!e.querySelector("ul, ol");
		!t && !n && e.remove();
	});
}
function gn(e) {
	e.querySelectorAll("figure, hr").forEach((t) => {
		if (t.parentNode !== e) return t.remove();
		t.tagName === "FIGURE" && !t.querySelector(":scope > img, :scope > iframe") && t.remove();
	}), e.querySelectorAll("img, iframe, figcaption").forEach((e) => {
		e.parentNode?.tagName !== "FIGURE" && e.remove();
	}), e.querySelectorAll("pre").forEach((t) => {
		t.parentNode !== e && t.replaceWith(W("CODE", {}, [t.textContent]));
	});
}
var _n = () => [...Mt, ...R.allow.tags].join(", "), vn = (e, t) => e.attributes.length === t.attributes.length && [...e.attributes].every((e) => t.getAttribute(e.name) === e.value);
function yn(e) {
	e.querySelectorAll(_n()).forEach((t) => {
		if (!e.contains(t)) return;
		let n = t.nextSibling;
		for (; n && n.nodeType === Node.ELEMENT_NODE && n.tagName === t.tagName && vn(n, t);) t.append(...n.childNodes), n.remove(), n = t.nextSibling;
	});
}
function bn(e) {
	return String(e).replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[e]);
}
function xn(e) {
	let t = String(e || "").replace(/\r\n?/g, "\n").trim();
	return t ? t.split(/\n\s*\n/).map((e) => `<p>${bn(e.trim()).replace(/\n/g, "<br>")}</p>`).join("") : "";
}
//#endregion
//#region src/core/model.js
var Sn = {}, Cn = (e = !1) => Sn[e] ||= s(Qe({
	headings: [
		2,
		3,
		4,
		5,
		6
	],
	title: e
}));
function wn(e, t = {}) {
	let n = V(e, {
		...t,
		headings: B(t.headings)
	});
	return n ? a(Ye(n, !!t.title), t.schema || Cn(!!t.title)).toJSON() : {
		type: "doc",
		content: []
	};
}
function Tn(e, t = {}) {
	let n = t.schema || Cn(!!t.title), r = En(e, n);
	if (!r || r.type !== "doc" || !r.content?.length) return "";
	try {
		return V(o(p.fromJSON(n, r).content, n), t);
	} catch {
		return "";
	}
}
function En(e, t) {
	if (!e || typeof e != "object" || !t.nodes[e.type]) return null;
	if (e.type === "text") {
		if (typeof e.text != "string" || !e.text) return null;
		let n = Array.isArray(e.marks) ? e.marks.filter((e) => e && t.marks[e.type]).map(Dn) : [];
		return {
			type: "text",
			text: e.text,
			...n.length && { marks: n }
		};
	}
	let n = { type: e.type };
	return e.attrs && typeof e.attrs == "object" && (n.attrs = { ...e.attrs }), Array.isArray(e.content) && (n.content = e.content.map((e) => En(e, t)).filter(Boolean)), n;
}
var Dn = (e) => ({
	type: e.type,
	...e.attrs && typeof e.attrs == "object" && { attrs: { ...e.attrs } }
});
//#endregion
//#region src/core/slug.js
function On(e, { maxLength: t = 80 } = {}) {
	let n = String(e ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	if (n.length <= t) return n;
	let r = n.slice(0, t + 1), i = r.lastIndexOf("-");
	return (i > 0 ? r.slice(0, i) : n.slice(0, t)).replace(/-+$/, "");
}
//#endregion
//#region src/core/editor.js
var kn = {
	content: "",
	lang: "id",
	strings: {},
	placeholder: null,
	label: null,
	readonly: !1,
	historyLimit: 100,
	autosave: null,
	pasteAsPlainText: !1,
	markdown: !0,
	slash: !0,
	blocks: _e,
	headings: [2, 3],
	title: !1,
	formats: null,
	colors: b,
	highlights: x,
	extensions: [],
	sanitize: null,
	upload: null,
	maxImageSize: 5242880,
	allowDataImages: !0
}, An = {
	open: !1,
	query: "",
	items: [],
	index: 0,
	rect: null
}, jn = [
	{
		code: "KeyB",
		command: "bold"
	},
	{
		code: "KeyI",
		command: "italic"
	},
	{
		code: "KeyK",
		command: "link"
	},
	{
		code: "KeyU",
		command: "underline"
	},
	{
		code: "KeyX",
		shift: !0,
		command: "strike"
	},
	{
		code: "KeyL",
		shift: !0,
		command: "alignLeft"
	},
	{
		code: "KeyE",
		shift: !0,
		command: "alignCenter"
	},
	{
		code: "KeyR",
		shift: !0,
		command: "alignRight"
	},
	{
		code: "KeyJ",
		shift: !0,
		command: "alignJustify"
	},
	{
		code: "Digit0",
		alt: !0,
		command: "paragraph"
	},
	{
		code: "Digit2",
		alt: !0,
		command: "h2"
	},
	{
		code: "Digit3",
		alt: !0,
		command: "h3"
	},
	{
		code: "Digit4",
		alt: !0,
		command: "h4"
	},
	{
		code: "Digit5",
		alt: !0,
		command: "h5"
	},
	{
		code: "Digit6",
		alt: !0,
		command: "h6"
	},
	{
		code: "Digit7",
		shift: !0,
		command: "ol"
	},
	{
		code: "Digit8",
		shift: !0,
		command: "ul"
	},
	{
		code: "Digit9",
		shift: !0,
		command: "quote"
	},
	{
		code: "KeyC",
		alt: !0,
		command: "codeblock"
	}
], Mn = "  ", J = (e) => e.type.name === "image" || e.type.name === "embed";
function Nn(e) {
	let t = !1;
	return e.descendants((e) => !t && ((e.isText && e.text.trim() || D(e)) && (t = !0), !t)), t;
}
var Pn = (e) => e.childCount === 1 && e.firstChild.type.name === "paragraph" && e.firstChild.content.size === 0, Fn = class {
	constructor(e, t = {}) {
		if (!e) throw Error("[afwrite] Elemen editor tidak ditemukan.");
		this.el = e, this.options = {
			...kn,
			...t
		}, this.options.headings = B(this.options.headings), this.options.formats = Te(this.options.formats, !!this.options.title), this.options.colors = C(this.options.colors, b), this.options.highlights = C(this.options.highlights, x), this.strings = he(this.options.lang, this.options.strings), this.readOnly = !1, this.listeners = {}, this.commands = I, this.slash = { ...An }, this._setup(this.options.content || e.innerHTML);
	}
	exec(e, ...t) {
		if (this.readOnly) return;
		if (e === "undo" || e === "redo") return this[e]();
		let n = this.commands[e];
		return n ? (this.hasFocus() || this.focus(), this._syncSelection(), !this.isDisabled(e) && n.run(this, ...t)) : console.warn(`[afwrite] Perintah tidak dikenal: ${e}`);
	}
	isDisabled(e) {
		return this.hasFocus() && wt(this, e);
	}
	disabledState() {
		return Object.fromEntries(Object.keys(this.commands).map((e) => [e, this.isDisabled(e)]));
	}
	isActive(e) {
		if (!this.hasFocus()) return !1;
		try {
			return !!this.commands[e]?.active(this);
		} catch {
			return !1;
		}
	}
	state() {
		return Object.fromEntries(Object.keys(this.commands).map((e) => [e, this.isActive(e)]));
	}
	hasFocus() {
		return !!this.tiptap.view?.hasFocus();
	}
	isEmpty() {
		return !Nn(this.tiptap.state.doc);
	}
	normalizeHTML(e) {
		let t = this._parse(V(e, this._sanitizeOptions()));
		return Nn(t) ? V(o(t.content, this.tiptap.schema), this._sanitizeOptions()) : "";
	}
	formatValues() {
		if (!this.hasFocus()) return {
			color: null,
			highlight: null,
			align: null
		};
		let e = (e) => this.options.formats.includes(e) && this.tiptap.getAttributes(e).color || null;
		return {
			color: e("color"),
			highlight: e("highlight"),
			align: P(this)
		};
	}
	getHTML() {
		return this.isEmpty() ? "" : V(this.tiptap.getHTML(), this._sanitizeOptions());
	}
	setHTML(e, { silent: t = !1, resetHistory: n = !0 } = {}) {
		let r = this._parse(V(e, this._sanitizeOptions())), { view: i } = this.tiptap;
		if (n) i.updateState(ee.create({
			doc: r,
			plugins: i.state.plugins,
			selection: this._startSelection(r)
		})), this._afterUpdate({ docChanged: !t });
		else {
			let e = i.state.tr.replaceWith(0, i.state.doc.content.size, r.content);
			e.setSelection(g.atEnd(e.doc)), this._silent = t, i.dispatch(e), this._silent = !1;
		}
	}
	getText() {
		let e = [];
		return this.tiptap.state.doc.descendants((t) => J(t) ? !1 : !t.isTextblock || (e.push(t.textBetween(0, t.content.size, "\n", "\n")), !1)), e.join("\n");
	}
	stats() {
		let e = (this.getText().match(/\S+/g) || []).length;
		return {
			words: e,
			minutes: e ? Math.max(1, Math.round(e / 200)) : 0
		};
	}
	insertHTML(e) {
		this._syncSelection();
		let t = Gt(e, {
			...this._sanitizeOptions(),
			title: !1
		});
		if (!t.childNodes.length) return;
		this.hasFocus() || this.focus();
		let { state: n, view: r } = this.tiptap, i = this._parseFragment(t.innerHTML);
		if (i.childCount === 1 && i.firstChild.type.name === "paragraph") {
			let t = new DOMParser().parseFromString(String(e), "text/html").body.textContent, a = i.firstChild.content;
			/^\s/.test(t) && (a = f.from(n.schema.text(" ")).append(a)), /\s$/.test(t) && (a = a.append(f.from(n.schema.text(" ")))), r.dispatch(n.tr.replaceSelection(new m(a, 0, 0)).scrollIntoView());
		} else i = zn(i), r.dispatch(n.tr.replaceSelection(m.maxOpen(i)).scrollIntoView());
	}
	insertText(e) {
		this._syncSelection();
		let t = String(e || "").replace(/\r\n?/g, "\n");
		if (t) {
			if (t.includes("\n")) this.insertHTML(xn(t));
			else {
				this.hasFocus() || this.focus();
				let { state: e, view: n } = this.tiptap;
				n.dispatch(e.tr.insertText(t).scrollIntoView());
			}
		}
	}
	focus() {
		let { view: e } = this.tiptap;
		e.focus(), e.dispatch(e.state.tr.setSelection(g.atEnd(e.state.doc)).scrollIntoView());
	}
	saveSelection() {
		return this.hasFocus() && this._syncSelection(), this.hasFocus() ? this.tiptap.state.selection.toJSON() : null;
	}
	restoreSelection(e) {
		let { view: t } = this.tiptap;
		if (t.focus(), e) try {
			t.dispatch(t.state.tr.setSelection(g.fromJSON(t.state.doc, e)));
		} catch {}
	}
	selectionRect() {
		let { view: e, state: t } = this.tiptap, { from: n, to: r, empty: i } = t.selection;
		if (!i && e.hasFocus()) {
			let e = Bn();
			if (e && this.el.contains(e.startContainer)) {
				let t = e.getBoundingClientRect();
				if (t.width || t.height) return t;
			}
		}
		try {
			let t = e.coordsAtPos(n), a = i ? t : e.coordsAtPos(r), o = Math.min(t.left, a.left);
			return new DOMRect(o, t.top, Math.max(t.right, a.right) - o, a.bottom - t.top);
		} catch {
			return null;
		}
	}
	clear() {
		this.setHTML("", { resetHistory: !1 });
	}
	getMeta() {
		let e = [], t = null;
		this.tiptap.state.doc.descendants((n) => {
			if (n.type.name === "image") return !t && n.attrs.src && !n.attrs.uploading && (t = {
				src: n.attrs.src,
				alt: n.attrs.alt,
				caption: n.textContent.trim(),
				mediaId: n.attrs.mediaId
			}), !1;
			if (J(n) || n.type.name === "codeBlock") return !1;
			if (n.isTextblock) {
				let t = n.textBetween(0, n.content.size, " ", " ").replace(/\s+/g, " ").trim();
				return t && e.push(t), !1;
			}
		});
		let n = e[0] || "";
		return {
			image: t,
			title: n,
			subtitle: e[1] || "",
			slug: On(n)
		};
	}
	getJSON() {
		return wn(this.getHTML(), {
			...this._sanitizeOptions(),
			schema: this.tiptap.schema
		});
	}
	setJSON(e, t) {
		this.setHTML(Tn(e, {
			...this._sanitizeOptions(),
			schema: this.tiptap.schema
		}), t);
	}
	restoreDraft() {
		let e = this.draft;
		e && (this.draft = null, this.setHTML(e.html, { resetHistory: !1 }));
	}
	discardDraft() {
		this.draft = null, this.clearDraft(), this._saveDraft();
	}
	clearDraft() {
		clearTimeout(this._autosaveTimer), this._autosaveKey && Y("remove", this._autosaveKey);
	}
	undo() {
		this.readOnly || (this.tiptap.view.focus(), this.tiptap.commands.undo());
	}
	redo() {
		this.readOnly || (this.tiptap.view.focus(), this.tiptap.commands.redo());
	}
	canUndo() {
		return this.tiptap.can().undo();
	}
	canRedo() {
		return this.tiptap.can().redo();
	}
	setReadOnly(e = !0) {
		this.readOnly = !!e, this.tiptap.setEditable(!this.readOnly, !1), this.closeSlash(), this.emit("readonly", this.readOnly), this.emit("state", this.state()), this._scheduleSelection();
	}
	insertImages(e) {
		return ct(this, e);
	}
	selectMedia(e) {
		if (this.readOnly) return;
		let { state: t, view: n } = this.tiptap, r = typeof e == "number" ? e : this._posOfDOM(e);
		r != null && D(t.doc.nodeAt(r)) && (n.focus(), n.dispatch(t.tr.setSelection(h.create(t.doc, r))));
	}
	deselectMedia() {
		let e = this._selectedMediaNode();
		if (!e) return;
		let { state: t, view: n } = this.tiptap;
		n.dispatch(t.tr.setSelection(g.near(t.doc.resolve(e.pos + e.node.nodeSize))));
	}
	selectedMedia() {
		let e = this._selectedMediaNode();
		if (!e) return null;
		let { node: t } = e;
		return {
			kind: et(t),
			size: t.attrs.size || "normal",
			alt: t.attrs.alt || ""
		};
	}
	setMediaSize(e) {
		this._updateMedia((t) => t.type.name !== "horizontalRule" && { size: $e.includes(e) ? e : null });
	}
	setMediaAlt(e) {
		this._updateMedia((t) => t.type.name === "image" && { alt: String(e || "").trim() });
	}
	removeMedia() {
		let e = this._selectedMediaNode();
		if (!e) return;
		let { state: t, view: n } = this.tiptap, r = t.tr.delete(e.pos, e.pos + e.node.nodeSize), i = r.doc.resolve(e.pos), a = i.nodeAfter, o = i.nodeBefore;
		a && !D(a) ? r.setSelection(g.findFrom(i, 1, !0) || g.near(i)) : o && !D(o) ? r.setSelection(g.findFrom(i, -1, !0) || g.near(i)) : a ? r.setSelection(h.create(r.doc, e.pos)) : (r.insert(e.pos, t.schema.nodes.paragraph.create()), r.setSelection(_.create(r.doc, e.pos + 1))), n.dispatch(r.scrollIntoView());
	}
	blockAt(e) {
		let { state: t, view: n } = this.tiptap, r = null;
		if (t.doc.forEach((t, i) => {
			let a = n.nodeDOM(i);
			if (!(a instanceof Element)) return;
			let o = a.getBoundingClientRect();
			o.top - 8 <= e && (r = {
				node: t,
				pos: i,
				rect: o,
				dom: a
			});
		}), !r || r.rect.bottom + 16 < e) return null;
		let { node: i, pos: a, rect: o } = r;
		if (i.type.name === "title" || i.type.name === "subtitle") return null;
		let s = {
			top: o.top,
			height: Math.min(o.height, 28)
		}, c = g.findFrom(t.doc.resolve(a + 1), 1, !0);
		if (!i.isAtom && c && c.from < a + i.nodeSize) try {
			let e = n.coordsAtPos(c.from);
			s = {
				top: e.top,
				height: e.bottom - e.top
			};
		} catch {}
		return {
			pos: a,
			rect: o,
			line: s,
			empty: i.type.name === "paragraph" && !i.content.size
		};
	}
	selectBlock(e) {
		let { state: t, view: n } = this.tiptap;
		!this.readOnly && t.doc.nodeAt(e) && (n.focus(), n.dispatch(t.tr.setSelection(h.create(t.doc, e))));
	}
	startBlockDrag(e, t) {
		let { view: n } = this.tiptap, { state: r } = n;
		if (this.readOnly || !t.dataTransfer || !r.doc.nodeAt(e)) return;
		let i = h.create(r.doc, e);
		n.dispatch(r.tr.setSelection(i));
		let a = i.content(), { dom: o, text: s } = n.serializeForClipboard(a);
		t.dataTransfer.clearData(), t.dataTransfer.setData("text/html", o.innerHTML), t.dataTransfer.setData("text/plain", s), t.dataTransfer.effectAllowed = "copyMove";
		let c = n.nodeDOM(e);
		c instanceof Element && t.dataTransfer.setDragImage(c, 0, 0), n.dragging = {
			slice: a,
			move: !0,
			node: i
		};
	}
	endBlockDrag() {
		setTimeout(() => {
			this.tiptap.view && (this.tiptap.view.dragging = null);
		}, 0);
	}
	moveBlock(e) {
		let { state: t, view: n } = this.tiptap, { doc: r, selection: i } = t, a = i.$from.index(0), o = this.options.title ? E(r) : -1, s = o < 0 ? 0 : o + (r.maybeChild(o + 1)?.type.name === "subtitle" ? 2 : 1), c = a + e;
		if (a < s || c < s || c >= r.childCount) return !1;
		let l = 0;
		for (let e = 0; e < a; e++) l += r.child(e).nodeSize;
		let u = r.child(a), d = r.child(c), f = e < 0 ? l - d.nodeSize : l + d.nodeSize, p = t.tr.delete(l, l + u.nodeSize).insert(f, u);
		if (i instanceof h) p.setSelection(h.create(p.doc, f));
		else {
			let e = f - l;
			p.setSelection(_.create(p.doc, i.from + e, i.to + e));
		}
		return n.dispatch(p.scrollIntoView()), !0;
	}
	openSlash() {
		this.hasFocus() || this.focus(), this._syncSelection(), this._slashDismissed = null;
		let { state: e, view: t } = this.tiptap;
		t.dispatch(e.tr.insertText("/"));
	}
	closeSlash({ dismiss: e = !1 } = {}) {
		e && (this._slashDismissed = this._slashContext()?.from ?? null), this.slash.open && (this.slash = { ...An }, this.emit("slash", this.slash));
	}
	setSlashIndex(e) {
		if (!this.slash.open || !this.slash.items.length) return;
		let t = this.slash.items.length;
		this.slash = {
			...this.slash,
			index: (e + t) % t
		}, this.emit("slash", this.slash);
	}
	applySlash(e = this.slash.index) {
		let t = typeof e == "number" ? this.slash.items[e] : e, n = this._slashContext();
		if (this.closeSlash(), t) {
			if (n) {
				let { state: e, view: t } = this.tiptap;
				t.dispatch(e.tr.delete(n.from, n.to));
			}
			this.exec(t.command);
		}
	}
	on(e, t) {
		return (this.listeners[e] ||= []).push(t), () => this.off(e, t);
	}
	off(e, t) {
		this.listeners[e] = (this.listeners[e] || []).filter((e) => e !== t);
	}
	emit(e, t) {
		(this.listeners[e] || []).forEach((e) => e(t));
	}
	destroy() {
		this._events.forEach(([e, t, n]) => e.removeEventListener(t, n)), cancelAnimationFrame(this._selectionFrame), clearTimeout(this._autosaveTimer), this._resize?.disconnect(), cancelAnimationFrame(this._wideFrame), this.tiptap.destroy(), this.listeners = {};
	}
	paste({ html: e = "", text: t = "", files: n = [] } = {}) {
		if (this.readOnly) return;
		this.hasFocus() || this.focus(), this._syncSelection();
		let { state: r, view: i } = this.tiptap, a = r.selection.$from.parent, o = [...n].filter((e) => e.type.startsWith("image/"));
		if (a.type.name === "title" && o.length) {
			this.exec("image", o);
			return;
		}
		if (a.type.name === "title" || a.type.name === "subtitle") {
			this._pasteIntoTitle(t || new DOMParser().parseFromString(e, "text/html").body.innerText || "");
			return;
		}
		if (a.type.name === "codeBlock" || J(a) && !(r.selection instanceof h)) {
			let e = a.type.name === "codeBlock" ? t.replace(/\r\n?/g, "\n") : t.replace(/\s+/g, " ").trim();
			e && i.dispatch(r.tr.insertText(e).scrollIntoView());
			return;
		}
		let s = !e || /^\s*(<meta[^>]*>\s*)?(<!--[^]*?-->\s*)*<img[^>]*>\s*(<!--[^]*?-->\s*)*$/i.test(e);
		n.length && s && !this.options.pasteAsPlainText ? e && /<img[^>]*src=["']?https?:/i.test(e) && !this.options.upload ? this.insertHTML(e) : this.insertImages(n) : this._pasteUrl(t, e) || (e && !this.options.pasteAsPlainText ? this.insertHTML(e) : t && this.insertText(t));
	}
	_setup(n) {
		let r = this.el, i = this.options;
		r.innerHTML = "", r.dataset.afwPlaceholder = i.placeholder ?? this.strings.placeholder;
		let a = t.create({
			name: "afwBehavior",
			addCommands: () => ({ insertMediaBlock: rt }),
			addInputRules() {
				return i.markdown ? Dt(this.editor.schema, i.headings) : [];
			},
			addProseMirrorPlugins: () => [
				In(),
				Rn(),
				...i.title ? [Ln(this.strings)] : []
			]
		});
		if (this.tiptap = new e({
			element: { mount: r },
			extensions: [
				...Qe({
					allowDataImages: i.allowDataImages,
					captionPlaceholder: this.strings.captionPlaceholder,
					headings: i.headings,
					title: i.title,
					formats: i.formats
				}),
				a,
				d.configure({
					depth: i.historyLimit,
					newGroupDelay: 1e3
				}),
				u,
				l.configure({
					color: !1,
					class: "afw-dropcursor"
				}),
				...Array.isArray(i.extensions) ? i.extensions : []
			],
			content: this._initialHTML(n),
			injectCSS: !1,
			enableInputRules: ["afwBehavior"],
			enablePasteRules: !1,
			editorProps: {
				attributes: (e) => this._viewAttributes(e),
				handleKeyDown: (e, t) => this._handleKeydown(t),
				handleTextInput: () => !!this._selectedMediaNode(),
				handlePaste: (e, t) => this._handlePaste(t),
				handleDrop: (e, t, n, r) => this._handleDrop(t, r),
				handleClickOn: (e, t, n, r, i) => this._handleClickOn(n, r, i),
				handleClick: (e, t, n) => this._handleClick(n),
				transformPastedHTML: (e) => V(e, {
					...this._sanitizeOptions(),
					title: !1
				})
			}
		}), this.tiptap.on("transaction", ({ transaction: e }) => this._afterUpdate(e)), i.title) {
			let { state: e, view: t } = this.tiptap;
			t.updateState(e.apply(e.tr.setSelection(this._startSelection(e.doc)).setMeta("addToHistory", !1)));
		}
		i.readonly && this.setReadOnly(!0), this._setupAutosave(), i.title && typeof ResizeObserver < "u" && (this._resize = new ResizeObserver(([e]) => {
			let t = (e.borderBoxSize?.[0]?.inlineSize ?? r.offsetWidth) >= 640;
			cancelAnimationFrame(this._wideFrame), this._wideFrame = requestAnimationFrame(() => {
				t !== r.hasAttribute("data-afw-wide") && r.toggleAttribute("data-afw-wide", t);
			});
		}), this._resize.observe(r, { box: "border-box" })), this._events = [
			[
				r,
				"focus",
				() => {
					queueMicrotask(() => this._syncSelection()), this.emit("focus"), this.emit("state", this.state()), this._scheduleSelection();
				}
			],
			[
				r,
				"blur",
				() => {
					this.closeSlash(), this.emit("blur"), this.emit("state", this.state()), this._scheduleSelection();
				}
			],
			[
				r,
				"mousedown",
				() => this._pointerDown = !0
			],
			[
				document,
				"mouseup",
				() => {
					this._pointerDown && (this._pointerDown = !1, this._scheduleSelection());
				}
			]
		], this._events.forEach(([e, t, n]) => e.addEventListener(t, n));
	}
	_initialHTML(e) {
		return Ye(V(e, this._sanitizeOptions()) || "<p></p>", this.options.title);
	}
	_parse(e) {
		let t = a(Ye(e || "<p></p>", this.options.title), this.tiptap.schema);
		return D(t.lastChild) ? t.copy(t.content.append(f.from(this.tiptap.schema.nodes.paragraph.create()))) : t;
	}
	_startSelection(e) {
		return !this.options.title || !E(e) ? g.atStart(e) : _.create(e, Ze(e) + 1);
	}
	_parseFragment(e) {
		let t = this._parse(e).content;
		if (!this.options.title) return t;
		let n = 0;
		return t.forEach((e, t) => {
			(e.type.name === "title" || e.type.name === "subtitle") && t === n && (n += e.nodeSize);
		}), t.cut(n);
	}
	_pasteIntoTitle(e) {
		let { state: t, view: n } = this.tiptap, r = e.replace(/\r\n?/g, "\n").split("\n"), i = r.shift().replace(/\s+/g, " "), a = r.join("\n").trim(), o = t.tr.insertText(i);
		if (a) {
			let e = 0, t = E(o.doc);
			for (let n = 0; n <= t; n++) e += o.doc.child(n).nodeSize;
			o.doc.maybeChild(t + 1)?.type.name === "subtitle" && (e += o.doc.child(t + 1).nodeSize);
			let n = this._parseFragment(V(xn(a), {
				...this._sanitizeOptions(),
				title: !1
			}));
			o.insert(e, n), o.setSelection(g.near(o.doc.resolve(e + n.size - 1), -1));
		}
		n.dispatch(o.scrollIntoView());
	}
	_handleTitleKey(e) {
		if (!this.options.title || e.ctrlKey || e.metaKey || e.altKey) return !1;
		let { state: t, view: n } = this.tiptap, { selection: r, schema: i } = t;
		if (!r.empty || r.$from.depth !== 1) return !1;
		let { $from: a } = r, o = a.parent, s = o.type.name, c = a.index(0), l = a.parentOffset === 0, u = a.parentOffset === o.content.size, d = a.before(), f = a.after(), p = t.doc.maybeChild(c + 1);
		if (e.key === "Enter" && (s === "title" || s === "subtitle")) {
			if (s === "title" && p?.type.name === "subtitle") return n.dispatch(t.tr.setSelection(_.create(t.doc, f + 1))), !0;
			let e = o.content.cut(a.parentOffset), r = t.tr.delete(a.pos, f - 1), c = r.mapping.map(f);
			return r.insert(c, i.nodes.paragraph.create(null, e.size ? i.text(o.textBetween(a.parentOffset, o.content.size)) : null)), r.setSelection(_.create(r.doc, c + 1)), n.dispatch(r.scrollIntoView()), !0;
		}
		if (e.key === "Delete" && u && (s === "title" || s === "subtitle")) return p && (s !== "title" || p.type.name !== "subtitle") && p.type.name === "paragraph" && !p.content.size && t.doc.childCount > c + 2 && n.dispatch(t.tr.delete(f, f + p.nodeSize)), !0;
		if (e.key !== "Backspace" || !l || c === 0) return !1;
		let m = t.doc.child(c - 1);
		if (!["title", "subtitle"].includes(m.type.name) || !o.isTextblock) return !1;
		let ee = d - 1, h = t.tr;
		return s !== "subtitle" && t.doc.childCount === c + 1 ? h.replaceWith(d, f, i.nodes.paragraph.create()) : h.delete(d, f), o.textContent && h.insertText(o.textContent, ee), h.setSelection(_.create(h.doc, ee)), n.dispatch(h.scrollIntoView()), !0;
	}
	_viewAttributes(e) {
		let t = ["afw-content"];
		return Pn(e.doc) && t.push("afw-is-empty"), this.readOnly && t.push("afw-is-readonly"), {
			class: t.join(" "),
			role: "textbox",
			"aria-multiline": "true",
			"aria-label": this.options.label || this.strings.editorLabel,
			"aria-readonly": String(this.readOnly)
		};
	}
	_afterUpdate(e) {
		e.docChanged && (this._scheduleDraftSave(), this._silent || this.emit("change", this.getHTML())), this._emitHistory(), this._updateSlash(), this.emit("state", this.state()), this._scheduleSelection();
	}
	_setupAutosave() {
		let e = this.options.autosave;
		if (!e) return;
		let { key: t, delay: n = 1e3 } = typeof e == "string" ? { key: e } : e;
		this._autosaveKey = `afw:draft:${t}`, this._autosaveDelay = n, this.draft = null;
		try {
			let e = JSON.parse(Y("get", this._autosaveKey) || "null");
			e?.html && e.html !== this.getHTML() && (this.draft = e);
		} catch {}
	}
	_scheduleDraftSave() {
		this._autosaveKey && !this.draft && (clearTimeout(this._autosaveTimer), this._autosaveTimer = setTimeout(() => this._saveDraft(), this._autosaveDelay));
	}
	_saveDraft() {
		if (!this._autosaveKey || this.draft) return;
		let e = this.getHTML();
		e ? Y("set", this._autosaveKey, JSON.stringify({
			html: e,
			time: Date.now()
		})) : Y("remove", this._autosaveKey);
	}
	_sanitizeOptions() {
		let { allowDataImages: e, headings: t, title: n, formats: r, colors: i, highlights: a, sanitize: o } = this.options;
		return {
			...o,
			allowDataImages: e,
			headings: t,
			title: n,
			formats: r,
			colors: i,
			highlights: a
		};
	}
	_blocks() {
		return this.options.blocks.filter((e) => (!/^h[2-6]$/.test(e.command) || this.options.headings.includes(Number(e.command[1]))) && !this.isDisabled(e.command));
	}
	_syncSelection() {
		let e = this.tiptap.view.domObserver;
		e && !this.tiptap.isDestroyed && (e.forceFlush(), e.flush());
	}
	_emitHistory() {
		let e = {
			canUndo: this.canUndo(),
			canRedo: this.canRedo()
		};
		(this._history?.canUndo !== e.canUndo || this._history?.canRedo !== e.canRedo) && (this._history = e, this.emit("history", e));
	}
	_selectedMediaNode() {
		let { selection: e } = this.tiptap.state;
		return e instanceof h && D(e.node) ? {
			node: e.node,
			pos: e.from
		} : null;
	}
	_updateMedia(e) {
		let t = this._selectedMediaNode(), n = t && e(t.node);
		if (!n) return;
		let { state: r, view: i } = this.tiptap, a = r.tr.setNodeMarkup(t.pos, null, {
			...t.node.attrs,
			...n
		});
		a.setSelection(h.create(a.doc, t.pos)), i.focus(), i.dispatch(a);
	}
	_posOfDOM(e) {
		let { view: t, state: n } = this.tiptap, r = null;
		return n.doc.forEach((n, i) => {
			r === null && t.nodeDOM(i) === e && (r = i);
		}), r;
	}
	_handleClickOn(e, t, n) {
		if (this.readOnly || !D(e) || n.target.closest?.("figcaption")) return !1;
		let { state: r, view: i } = this.tiptap;
		return i.dispatch(r.tr.setSelection(h.create(r.doc, t))), !0;
	}
	_handleClick(e) {
		return this.readOnly || e.target !== this.el ? !1 : this._clickGap(e.clientY);
	}
	_clickGap(e) {
		let { state: t, view: n } = this.tiptap, r = [];
		t.doc.forEach((e, t) => r.push({
			node: e,
			offset: t,
			rect: n.nodeDOM(t)?.getBoundingClientRect()
		}));
		let i = r.findIndex((t) => t.rect && t.rect.bottom >= e), a = r[i];
		return a && a.rect.top <= e || !D((i === -1 ? r[r.length - 1] : r[i - 1])?.node) && !D(a?.node) ? !1 : (this._insertParagraphAt(a ? a.offset : t.doc.content.size), !0);
	}
	_handleMediaKey(e, t) {
		let n = e.key;
		return n === "Backspace" || n === "Delete" ? (this.removeMedia(), !0) : n === "Enter" ? (this._insertParagraphAt(t.pos + t.node.nodeSize), !0) : [
			"ArrowUp",
			"ArrowLeft",
			"ArrowDown",
			"ArrowRight",
			"Escape"
		].includes(n) ? (this._moveFromMedia(t, ["ArrowUp", "ArrowLeft"].includes(n) ? -1 : 1), !0) : n.length === 1 && !e.ctrlKey && !e.metaKey;
	}
	_moveFromMedia({ node: e, pos: t }, n) {
		let { state: r, view: i } = this.tiptap, a = n < 0 ? t : t + e.nodeSize, o = r.doc.resolve(a), s = n < 0 ? o.nodeBefore : o.nodeAfter;
		D(s) ? i.dispatch(r.tr.setSelection(h.create(r.doc, n < 0 ? a - s.nodeSize : a))) : s ? i.dispatch(r.tr.setSelection(g.findFrom(o, n, !0) || g.near(o, n)).scrollIntoView()) : this._insertParagraphAt(a);
	}
	_insertParagraphAt(e) {
		let { state: t, view: n } = this.tiptap;
		if (t.doc.nodeAt(e)?.type.name === "title") {
			n.dispatch(t.tr.setSelection(_.create(t.doc, e + 1)).scrollIntoView());
			return;
		}
		let r = t.tr.insert(e, t.schema.nodes.paragraph.create());
		r.setSelection(_.create(r.doc, e + 1)), n.dispatch(r.scrollIntoView());
	}
	_handleKeyNearMedia(e) {
		let { state: t, view: n } = this.tiptap, { selection: r } = t;
		if (!r.empty) return !1;
		let { $from: i } = r, a = i.parent, o = i.parentOffset === 0, s = i.parentOffset === a.content.size;
		if (J(a)) {
			if (e.key === "Enter") {
				let e = i.after(), r = t.doc.nodeAt(e);
				return r && !D(r) ? n.dispatch(t.tr.setSelection(g.findFrom(t.doc.resolve(e), 1, !0)).scrollIntoView()) : this._insertParagraphAt(e), !0;
			}
			return e.key === "Backspace" && o || e.key === "Delete" && s;
		}
		if (i.depth !== 1 || !a.isTextblock) return !1;
		let c = e.key === "Backspace" && o, l = e.key === "Delete" && s;
		if (!c && !l) return !1;
		let u = t.doc.resolve(c ? i.before() : i.after()), d = c ? u.nodeBefore : u.nodeAfter;
		if (!D(d)) return !1;
		let f = t.tr, p = c ? u.pos - d.nodeSize : u.pos;
		return a.type.name === "paragraph" && a.content.size === 0 && (f.delete(i.before(), i.after()), l && (p -= a.nodeSize)), f.setSelection(h.create(f.doc, p)), n.dispatch(f), !0;
	}
	_handleCodeKey(e) {
		let { state: t, view: n } = this.tiptap, { $from: r, from: i, to: a, empty: o } = t.selection;
		if (r.parent.type.name !== "codeBlock" || e.ctrlKey || e.metaKey || e.altKey) return !1;
		let s = r.parent.textContent, c = r.start();
		if (e.key === "Enter") {
			if (o && r.parentOffset === s.length && s.endsWith("\n")) {
				let e = t.tr.delete(i - 1, i), a = e.mapping.map(r.after());
				e.insert(a, t.schema.nodes.paragraph.create()), e.setSelection(_.create(e.doc, a + 1)), n.dispatch(e.scrollIntoView());
			} else n.dispatch(t.tr.insertText("\n", i, a).scrollIntoView());
			return !0;
		}
		if (e.key === "Tab") {
			if (!e.shiftKey) n.dispatch(t.tr.insertText(Mn, i, a));
			else {
				let e = c + s.lastIndexOf("\n", r.parentOffset - 1) + 1, i = e - c, a = s.slice(i, i + 2).match(/^ */)[0].length;
				a && n.dispatch(t.tr.delete(e, e + a));
			}
			return !0;
		}
		return !1;
	}
	_handleKeydown(e) {
		if (this.readOnly) return !1;
		this._syncSelection();
		let { state: t } = this.tiptap, n = this._selectedMediaNode();
		if (n) return this._handleMediaKey(e, n);
		if (this._handleKeyNearMedia(e)) return !0;
		if (this.slash.open && !e.shiftKey) {
			let t = {
				ArrowDown: () => this.setSlashIndex(this.slash.index + 1),
				ArrowUp: () => this.setSlashIndex(this.slash.index - 1),
				Enter: () => this.slash.items.length && this.applySlash(),
				Tab: () => this.slash.items.length && this.applySlash(),
				Escape: () => this.closeSlash({ dismiss: !0 })
			};
			if (t[e.key]) return t[e.key](), !0;
		}
		if (this._handleTitleKey(e) || this._handleCodeKey(e)) return !0;
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) return this.moveBlock(e.key === "ArrowUp" ? -1 : 1), !0;
		let r = t.selection.$from.parent;
		if (e.key === "Enter" && !e.shiftKey && t.selection.empty && ["heading", "blockquote"].includes(r.type.name) && !r.content.size) return this.tiptap.commands.setNode("paragraph"), !0;
		if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) return this.tiptap.isActive("listItem") ? (this.exec(e.shiftKey ? "outdent" : "indent"), !0) : !1;
		if (!(e.ctrlKey || e.metaKey)) return !1;
		let i = jn.find((t) => t.code === e.code && !!t.alt === e.altKey && !!t.shift === e.shiftKey);
		return !i || !_t(this.options.formats, i.command) ? !1 : (this.exec(i.command), !0);
	}
	_handlePaste(e) {
		let t = e.clipboardData;
		return !t || this.readOnly ? !1 : (this.paste({
			html: t.getData("text/html"),
			text: t.getData("text/plain"),
			files: [...t.files || []]
		}), !0);
	}
	_pasteUrl(e, t) {
		let n = e.trim();
		if (!/^https?:\/\/\S+$/i.test(n) || t && !/^\s*(<meta[^>]*>\s*)?<a [^>]*>[^<]*<\/a>\s*$/i.test(t) && t.replace(/<[^>]+>/g, "").trim() !== n) return !1;
		let { selection: r } = this.tiptap.state;
		if (!r.empty && !this.tiptap.isActive("link")) return this.exec("link", n), !0;
		let { $from: i } = r, a = i.depth === 1 && i.parent.type.name === "paragraph" && !i.parent.content.size && v(n);
		return a ? (this.tiptap.commands.insertMediaBlock({
			type: "embed",
			attrs: {
				provider: a.provider,
				id: a.id
			}
		}), !0) : !1;
	}
	_handleDrop(e, t) {
		if (this.readOnly) return !0;
		if (t) return !1;
		let n = e.dataTransfer, r = n?.getData("text/html") || "", i = n?.getData("text/plain") || "", a = [...n?.files || []];
		if (!r && !i && !a.length) return !1;
		let { state: o, view: s } = this.tiptap, c = s.posAtCoords({
			left: e.clientX,
			top: e.clientY
		});
		return s.focus(), c && s.dispatch(o.tr.setSelection(g.near(o.doc.resolve(c.pos)))), a.length ? this.insertImages(a) : r && !this.options.pasteAsPlainText ? this.insertHTML(r) : this.insertText(i), !0;
	}
	_slashContext() {
		let { selection: e } = this.tiptap.state;
		if (!e.empty) return null;
		let { $from: t } = e, n = t.parent;
		return t.depth !== 1 || !["paragraph", "title"].includes(n.type.name) || t.parentOffset !== n.content.size ? null : {
			from: t.start(),
			to: t.pos,
			text: n.textContent
		};
	}
	_updateSlash() {
		if (!this.options.slash) return;
		let e = this.hasFocus() ? this._slashContext() : null, t = e?.text.match(/^\/([^\s/]{0,24})$/);
		if (!t) return this._slashDismissed = null, this.closeSlash();
		if (this._slashDismissed === e.from) return;
		let n = t[1], r = ve(n, this._blocks(), this.strings), i = this.slash.open && this.slash.query === n;
		this.slash = {
			open: !0,
			query: n,
			items: r,
			index: i ? Math.min(this.slash.index, Math.max(r.length - 1, 0)) : 0,
			rect: this.selectionRect()
		}, this.emit("slash", this.slash);
	}
	_scheduleSelection() {
		this.listeners.selection?.length && (cancelAnimationFrame(this._selectionFrame), this._selectionFrame = requestAnimationFrame(() => this.emit("selection", this._selectionInfo())));
	}
	_selectionInfo() {
		if (!this.hasFocus()) return { inside: !1 };
		let { state: e, view: t } = this.tiptap, n = this._selectedMediaNode();
		if (n) return {
			inside: !0,
			collapsed: !1,
			dragging: !!this._pointerDown,
			media: {
				...this.selectedMedia(),
				rect: t.nodeDOM(n.pos).getBoundingClientRect()
			}
		};
		let { $from: r, empty: i } = e.selection, a = r.parent, o = Vn(this.el, "a"), s = r.depth === 1 && !a.content.size && ["paragraph", "title"].includes(a.type.name);
		return {
			inside: !0,
			inCode: a.type.name === "codeBlock",
			collapsed: i,
			dragging: !!this._pointerDown,
			rect: this.selectionRect(),
			link: o ? {
				href: o.getAttribute("href"),
				rect: o.getBoundingClientRect()
			} : null,
			emptyBlock: s ? { rect: t.nodeDOM(r.before()).getBoundingClientRect() } : null
		};
	}
};
function In() {
	return new te({ props: { decorations(e) {
		let { selection: t } = e, n = [];
		return t instanceof h && D(t.node) ? n.push(ne.node(t.from, t.to, { class: "afw-is-selected" })) : J(t.$from.parent) && n.push(ne.node(t.$from.before(), t.$from.after(), { class: "afw-is-editing" })), re.create(e.doc, n);
	} } });
}
function Ln(e) {
	return new te({ props: { decorations(t) {
		let { doc: n } = t, r = [], i = (e, t, n) => r.push(ne.node(e, e + t.nodeSize, n)), a = (e) => e.content.size ? {} : { class: "afw-is-empty" }, o = E(n), s = Ze(n), c = n.child(o);
		i(s, c, {
			...a(c),
			"data-placeholder": e.titlePlaceholder,
			"data-label": e.titleLabel
		}), s += c.nodeSize;
		let l = n.maybeChild(o + 1), u = l?.type.name === "subtitle";
		u && (i(s, l, {
			...a(l),
			"data-placeholder": e.subtitlePlaceholder,
			"data-label": e.subtitleLabel
		}), s += l.nodeSize);
		let d = n.maybeChild(o + (u ? 2 : 1));
		return d?.type.name === "paragraph" && !d.content.size && n.lastChild === d && i(s, d, {
			class: "afw-is-empty",
			"data-placeholder": e.placeholder
		}), re.create(n, r);
	} } });
}
function Rn() {
	return new te({ appendTransaction(e, t, n) {
		return !e.some((e) => e.docChanged) || !D(n.doc.lastChild) ? null : n.tr.insert(n.doc.content.size, n.schema.nodes.paragraph.create());
	} });
}
function zn(e) {
	let t = e;
	for (; t.childCount > 1 && t.lastChild.type.name === "paragraph" && !t.lastChild.content.size;) t = t.cut(0, t.size - t.lastChild.nodeSize);
	return t;
}
function Bn() {
	let e = window.getSelection();
	return e && e.rangeCount ? e.getRangeAt(0) : null;
}
function Vn(e, t) {
	let n = Bn();
	if (!n || !e.contains(n.startContainer)) return null;
	let r = n.startContainer;
	r.nodeType !== Node.ELEMENT_NODE && (r = r.parentElement);
	let i = r?.closest(t);
	return i && i !== e && e.contains(i) ? i : null;
}
function Y(e, t, n) {
	try {
		if (e === "get") return window.localStorage.getItem(t);
		e === "set" && window.localStorage.setItem(t, n), e === "remove" && window.localStorage.removeItem(t);
	} catch {
		return null;
	}
	return null;
}
//#endregion
//#region src/icons.js
var X = (e) => `<svg class="afw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`, Hn = {
	undo: X("<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10.5a5.5 5.5 0 0 1 0 11H11\"/>"),
	redo: X("<path d=\"m15 14 5-5-5-5\"/><path d=\"M20 9H9.5a5.5 5.5 0 0 0 0 11H13\"/>"),
	codeblock: X("<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>"),
	image: X("<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>"),
	embed: X("<path d=\"m22 8-6 4 6 4V8Z\"/><rect width=\"14\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" ry=\"2\"/>"),
	hr: X("<path d=\"M3 12h18\"/><path d=\"M8 6h8\" opacity=\".35\"/><path d=\"M8 18h8\" opacity=\".35\"/>"),
	sizeNormal: X("<path d=\"M3 3h18\"/><path d=\"M3 21h18\"/><rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"1.5\"/>"),
	sizeWide: X("<path d=\"M3 3h18\"/><path d=\"M3 21h18\"/><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"1.5\"/>"),
	sizeFull: X("<path d=\"M3 3h18\"/><path d=\"M3 21h18\"/><rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"1.5\"/>"),
	alt: X("<path d=\"M17 6.1H3\"/><path d=\"M21 12.1H3\"/><path d=\"M15.1 18H3\"/>"),
	trash: X("<path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/>"),
	paragraph: X("<polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/>"),
	plus: X("<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>"),
	check: X("<path d=\"M20 6 9 17l-5-5\"/>"),
	close: X("<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>"),
	edit: X("<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/>"),
	external: X("<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>"),
	unlink: X("<path d=\"m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71\"/><path d=\"m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71\"/><line x1=\"8\" x2=\"8\" y1=\"2\" y2=\"5\"/><line x1=\"2\" x2=\"5\" y1=\"8\" y2=\"8\"/><line x1=\"16\" x2=\"16\" y1=\"19\" y2=\"22\"/><line x1=\"19\" x2=\"22\" y1=\"16\" y2=\"16\"/>"),
	bold: X("<path d=\"M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8\"/>"),
	underline: X("<path d=\"M6 4v6a6 6 0 0 0 12 0V4\"/><line x1=\"4\" x2=\"20\" y1=\"20\" y2=\"20\"/>"),
	strike: X("<path d=\"M16 4H9a3 3 0 0 0-2.83 4\"/><path d=\"M14 12a4 4 0 0 1 0 8H6\"/><line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\"/>"),
	color: X("<path d=\"M4 20h16\"/><path d=\"m6 16 6-12 6 12\"/><path d=\"M8 12h8\"/>"),
	highlight: X("<path d=\"m9 11-6 6v3h9l3-3\"/><path d=\"m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4\"/>"),
	alignLeft: X("<path d=\"M21 5H3\"/><path d=\"M15 12H3\"/><path d=\"M17 19H3\"/>"),
	alignCenter: X("<path d=\"M21 5H3\"/><path d=\"M17 12H7\"/><path d=\"M19 19H5\"/>"),
	alignRight: X("<path d=\"M21 5H3\"/><path d=\"M21 12H9\"/><path d=\"M21 19H7\"/>"),
	alignJustify: X("<path d=\"M3 5h18\"/><path d=\"M3 12h18\"/><path d=\"M3 19h18\"/>"),
	italic: X("<line x1=\"19\" y1=\"4\" x2=\"10\" y2=\"4\"/><line x1=\"14\" y1=\"20\" x2=\"5\" y2=\"20\"/><line x1=\"15\" y1=\"4\" x2=\"9\" y2=\"20\"/>"),
	link: X("<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>"),
	h2: X("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1\"/>"),
	h3: X("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2\"/><path d=\"M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2\"/>"),
	headingLarge: X("<path d=\"M5 7V5h14v2\"/><path d=\"M12 5v14\"/><path d=\"M9.5 19h5\"/>"),
	headingSmall: X("<path d=\"M8 12v-1.5h8V12\"/><path d=\"M12 10.5V19\"/><path d=\"M10.5 19h3\"/>"),
	grip: X("<circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>"),
	h4: X("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M17 10v3a1 1 0 0 0 1 1h3\"/><path d=\"M21 10v8\"/>"),
	h5: X("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M17 13v-3h4\"/><path d=\"M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17\"/>"),
	h6: X("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><circle cx=\"19\" cy=\"16\" r=\"2\"/><path d=\"M20 10c-2 2-3 3.5-3 6\"/>"),
	quote: X("<path d=\"M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z\"/><path d=\"M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z\"/>"),
	ul: X("<line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"/><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"/><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"/><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"/>"),
	ol: X("<line x1=\"10\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"10\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"10\" y1=\"18\" x2=\"21\" y2=\"18\"/><path d=\"M4 6h1v4\"/><path d=\"M4 10h2\"/><path d=\"M6 18H4c0-1 2-2 2-3s-1-1.5-2-1\"/>")
}, Un = typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform), Z = Un ? "⌘" : "Ctrl+", Q = Un ? "⌥" : "Alt+", $ = Un ? "⇧" : "Shift+", Wn = [
	[
		{
			command: "bold",
			shortcut: `${Z}B`
		},
		{
			command: "italic",
			shortcut: `${Z}I`
		},
		{
			command: "underline",
			shortcut: `${Z}U`
		},
		{
			command: "link",
			shortcut: `${Z}K`
		}
	],
	[
		{
			command: "h2",
			shortcut: `${Z}${Q}2`
		},
		{
			command: "h3",
			shortcut: `${Z}${Q}3`
		},
		{
			command: "quote",
			shortcut: `${Z}${$}9`
		}
	],
	[{
		command: "color",
		shortcut: ""
	}, {
		command: "align",
		shortcut: ""
	}]
], Gn = [
	[
		{
			command: "bold",
			shortcut: `${Z}B`
		},
		{
			command: "italic",
			shortcut: `${Z}I`
		},
		{
			command: "underline",
			shortcut: `${Z}U`
		},
		{
			command: "strike",
			shortcut: `${Z}${$}X`
		},
		{
			command: "link",
			shortcut: `${Z}K`
		}
	],
	[
		{
			command: "h2",
			shortcut: `${Z}${Q}2`
		},
		{
			command: "h3",
			shortcut: `${Z}${Q}3`
		},
		{
			command: "quote",
			shortcut: `${Z}${$}9`
		},
		{
			command: "codeblock",
			shortcut: `${Z}${Q}C`
		}
	],
	[{
		command: "color",
		shortcut: ""
	}, {
		command: "align",
		shortcut: ""
	}],
	[{
		command: "ul",
		shortcut: `${Z}${$}8`
	}, {
		command: "ol",
		shortcut: `${Z}${$}7`
	}],
	[{
		command: "undo",
		shortcut: `${Z}Z`
	}, {
		command: "redo",
		shortcut: `${Z}${$}Z`
	}]
], Kn = [
	{
		command: "alignLeft",
		shortcut: `${Z}${$}L`
	},
	{
		command: "alignCenter",
		shortcut: `${Z}${$}E`
	},
	{
		command: "alignRight",
		shortcut: `${Z}${$}R`
	},
	{
		command: "alignJustify",
		shortcut: `${Z}${$}J`
	}
];
function qn(e, t) {
	return e.map((e) => e.filter((e) => _t(t, e.command))).filter((e) => e.length);
}
var Jn = (e) => ({
	command: `h${e}`,
	shortcut: `${Z}${Q}${e}`
}), Yn = (e) => /^h[2-6]$/.test(e.command);
function Xn(e, t, n = Infinity) {
	return e.map((e) => e.flatMap((r, i) => Yn(r) ? e.findIndex(Yn) === i ? t.slice(0, n).map(Jn) : [] : [r]));
}
//#endregion
//#region src/template.js
var Zn = (e, t = "") => `
  <template x-for="(group, gi) in ${e}" :key="gi">
    <div class="afw-group">
      <span class="afw-sep" x-show="gi > 0"></span>
      <template x-for="item in group" :key="item.command">
        <button type="button" class="afw-btn ${t}"
                :class="{ 'afw-is-active': isActive(item.command) }"
                :title="item.shortcut ? \`\${t(item.command)} (\${item.shortcut})\` : t(item.command)"
                :aria-label="t(item.command)"
                :aria-pressed="isActive(item.command)"
                :aria-haspopup="hasPop(item.command) ? 'true' : null"
                :aria-disabled="isDisabled(item.command)"
                @mousedown.prevent
                @click="onItem(item.command, $event)"
                x-html="icon(item.command)"></button>
      </template>
    </div>
  </template>`, Qn = `
<div class="afw-toolbar" role="toolbar" :aria-label="t('toolbarLabel')" x-show="showToolbar && !readOnly"
     @keydown.arrow-right.prevent="moveFocus($event, 1)" @keydown.arrow-left.prevent="moveFocus($event, -1)"
     @keydown.home.prevent="moveFocus($event, -Infinity)" @keydown.end.prevent="moveFocus($event, Infinity)">
  ${Zn("toolbar")}
</div>

<div class="afw-draft" role="status" x-show="draft" x-cloak>
  <span x-text="draftMessage()"></span>
  <button type="button" class="afw-draft-btn afw-draft-primary" @click="restoreDraft()" x-text="t('draftRestore')"></button>
  <button type="button" class="afw-draft-btn" @click="discardDraft()" x-text="t('draftDiscard')"></button>
</div>

<div class="afw-body" @mousemove="onBodyHover($event)" @mouseleave="hideHandle()">
  <div data-afw-editor x-ignore></div>

  <!-- Pegangan drag: seret untuk memindah blok, klik untuk memilihnya. Satu slot dengan tombol +
       (tombol + hanya di baris kosong, pegangan hanya di blok berisi). mousedown sengaja tidak
       di-prevent: itu akan membatalkan drag. -->
  <button type="button" class="afw-handle" draggable="true" tabindex="-1"
          :class="{ 'afw-is-open': handle.visible }"
          :style="\`top: \${handle.y}px; left: \${handle.x}px\`"
          :title="t('dragBlock')" :aria-label="t('dragBlock')"
          @click="selectHandleBlock()" @dragstart="startBlockDrag($event)" @dragend="endBlockDrag()"
          x-html="icon('grip')"></button>

  <button type="button" class="afw-plus" :class="{ 'afw-is-open': plus.visible }"
          :style="\`top: \${plus.y}px; left: \${plus.x}px\`"
          :title="t('addBlock')" :aria-label="t('addBlock')"
          @mousedown.prevent @click="openBlockMenu()"
          x-html="icon('plus')"></button>
</div>

<div class="afw-footer" x-show="showStats" x-cloak>
  <span x-text="stats.words + ' ' + t('words')"></span>
  <span aria-hidden="true">·</span>
  <span x-text="stats.minutes + ' ' + t('minutesRead')"></span>
</div>

<!-- Bubble toolbar -->
<!-- Elemen melayang memakai class (bukan x-show) agar ukurannya bisa langsung diukur. -->
<div class="afw-bubble" x-ref="bubble"
     :class="{ 'afw-is-open': bubble.open, 'afw-is-ready': bubble.ready }"
     :style="\`left: \${bubble.x}px; top: \${bubble.y}px\`"
     role="toolbar" :aria-label="t('toolbarLabel')"
     @keydown.escape.prevent.stop="cancelInput()">

  <div class="afw-bubble-row" :class="{ 'afw-is-hidden': bubble.mode !== 'format' }">
    ${Zn("bubbleItems", "afw-btn-inverse")}
  </div>

  <!-- Bukan elemen form: editor biasanya berada di dalam form halaman, dan form
       bertingkat dibuang browser. Enter ditangani langsung di input. -->
  <!-- Satu input untuk beberapa keperluan: URL link, link video, dan alt text gambar. -->
  <div class="afw-bubble-row afw-link-form" :class="{ 'afw-is-hidden': bubble.mode !== 'input' }">
    <input type="text" class="afw-link-input" x-ref="linkInput" x-model="bubble.url"
           :placeholder="inputPlaceholder()" :aria-label="inputPlaceholder()"
           autocomplete="off" spellcheck="false"
           @input="bubble.error = ''"
           @keydown.enter.prevent="applyInput()"
           @blur="onInputBlur()">
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('save') + ' (Enter)'" x-bind:aria-label="t('save')" @mousedown.prevent @click="applyInput()" x-html="icon('check')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" :class="{ 'afw-is-hidden': !(bubble.purpose === 'link' && bubble.hasLink) }" x-bind:title="t('removeLink')" x-bind:aria-label="t('removeLink')" @mousedown.prevent @click="removeLink()" x-html="icon('unlink')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('cancel') + ' (Esc)'" x-bind:aria-label="t('cancel')" @mousedown.prevent @click="cancelInput()" x-html="icon('close')"></button>
    <span class="afw-link-error" x-show="bubble.error" x-text="bubble.error"></span>
  </div>

  <div class="afw-bubble-row" :class="{ 'afw-is-hidden': bubble.mode !== 'linkinfo' }">
    <a class="afw-link-preview" :href="bubble.href" target="_blank" rel="noopener noreferrer"
       :title="bubble.href" @mousedown.prevent>
      <span x-text="bubble.href"></span>
      <span class="afw-link-preview-icon" x-html="icon('external')"></span>
    </a>
    <span class="afw-sep"></span>
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('editLink')" x-bind:aria-label="t('editLink')" @mousedown.prevent @click="openLinkInput({ href: bubble.href })" x-html="icon('edit')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('removeLink')" x-bind:aria-label="t('removeLink')" @mousedown.prevent @click="exec('unlink')" x-html="icon('unlink')"></button>
  </div>
</div>

<!-- Toolbar media (gambar / video / pemisah yang sedang dipilih) -->
<div class="afw-bubble afw-mediabar" x-ref="mediabar"
     :class="{ 'afw-is-open': media.open, 'afw-is-ready': media.ready }"
     :style="\`left: \${media.x}px; top: \${media.y}px\`"
     role="toolbar" :aria-label="t('mediaToolbarLabel')">
  <div class="afw-bubble-row">
    <template x-if="media.kind !== 'divider'">
      <div class="afw-group">
        <template x-for="size in mediaSizes" :key="size.value">
          <button type="button" class="afw-btn afw-btn-inverse"
                  :class="{ 'afw-is-active': media.size === size.value }"
                  :title="t(size.label)" :aria-label="t(size.label)" :aria-pressed="media.size === size.value"
                  @mousedown.prevent @click="setMediaSize(size.value)"
                  x-html="icon(size.icon)"></button>
        </template>
        <span class="afw-sep"></span>
      </div>
    </template>
    <button type="button" class="afw-btn afw-btn-inverse" x-show="media.kind === 'image'"
            :class="{ 'afw-is-active': !!media.alt }"
            :title="t('altText')" :aria-label="t('altText')"
            @mousedown.prevent @click="editAlt()" x-html="icon('alt')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" :title="t('removeMedia') + ' (Backspace)'" :aria-label="t('removeMedia')"
            @mousedown.prevent @click="removeMedia()" x-html="icon('trash')"></button>
  </div>
</div>

<!-- Palet warna & perataan (dibuka dari tombol 'color' / 'align' di toolbar atau bubble) -->
<div class="afw-bubble afw-pop" x-ref="pop"
     :class="{ 'afw-is-open': pop.open, 'afw-is-ready': pop.ready }"
     :style="\`left: \${pop.x}px; top: \${pop.y}px\`"
     role="toolbar" :aria-label="t(pop.kind || 'color')"
     @keydown.escape.prevent.stop="closePop(true)">
  <div class="afw-bubble-row" :class="{ 'afw-is-hidden': pop.kind !== 'align' }">
    <template x-for="item in alignItems" :key="item.command">
      <button type="button" class="afw-btn afw-btn-inverse"
              :class="{ 'afw-is-active': isActive(item.command) }"
              :title="\`\${t(item.command)} (\${item.shortcut})\`" :aria-label="t(item.command)"
              :aria-pressed="isActive(item.command)"
              @mousedown.prevent @click="applyPop(item.command)"
              x-html="icon(item.command)"></button>
    </template>
  </div>
  <div class="afw-pop-colors" :class="{ 'afw-is-hidden': pop.kind !== 'color' }">
    <template x-for="row in paletteRows" :key="row.command">
      <div class="afw-pop-row">
        <span class="afw-pop-label" x-text="t(row.label)"></span>
        <button type="button" class="afw-swatch afw-swatch-none"
                :class="{ 'afw-is-active': !values[row.command] }"
                :title="t(row.none)" :aria-label="t(row.none)" :aria-pressed="!values[row.command]"
                @mousedown.prevent @click="applyPop(row.command, null)"></button>
        <template x-for="color in row.colors" :key="color">
          <button type="button" class="afw-swatch" :class="\`afw-swatch-\${row.command}\` + (values[row.command] === color ? ' afw-is-active' : '')"
                  :style="\`--afw-swatch: \${color}\`"
                  :title="color" :aria-label="\`\${t(row.label)} \${color}\`" :aria-pressed="values[row.command] === color"
                  @mousedown.prevent @click="applyPop(row.command, color)"></button>
        </template>
      </div>
    </template>
  </div>
</div>

<!-- Pesan error (mis. upload gagal) -->
<div class="afw-toast" role="status" aria-live="polite" :class="{ 'afw-is-open': toast.open }" x-text="toast.message"></div>

<!-- Slash menu -->
<div class="afw-menu" x-ref="menu"
     :class="{ 'afw-is-open': slash.open, 'afw-is-ready': slash.ready }"
     :style="\`left: \${slash.x}px; top: \${slash.y}px\`"
     role="listbox" :id="uid + '-menu'" :aria-label="t('blocksTitle')">
  <div class="afw-menu-title" x-text="t('blocksTitle')"></div>
  <template x-for="(item, i) in slash.items" :key="item.command">
    <button type="button" class="afw-menu-item" role="option" tabindex="-1" :id="uid + '-opt-' + i"
            :class="{ 'afw-is-active': i === slash.index }"
            :aria-selected="i === slash.index"
            @mousedown.prevent
            @mousemove="hoverSlash(i)"
            @click="applySlash(i)">
      <span class="afw-menu-icon" x-html="icon(item.command)"></span>
      <span class="afw-menu-text">
        <span class="afw-menu-label" x-text="item.label"></span>
        <span class="afw-menu-desc" x-text="item.description"></span>
      </span>
      <kbd class="afw-menu-kbd" x-show="item.markdown" x-text="item.markdown"></kbd>
    </button>
  </template>
  <div class="afw-menu-empty" x-show="!slash.items.length" x-text="t('noResults')"></div>
</div>

<template x-if="name">
  <input type="hidden" :name="name" :value="inputValue()">
</template>
<!-- Opsi titleName: judul (teks pertama / <h1> artikel) dikirim terpisah. -->
<template x-if="titleName">
  <input type="hidden" :name="titleName" :value="meta.title">
</template>
`, $n = 10, er = {
	image: null,
	title: "",
	subtitle: "",
	slug: ""
}, tr = 8, nr = {
	link: "inputLink",
	embed: "inputEmbed",
	alt: "inputAlt"
}, rr = [
	{
		value: "normal",
		label: "sizeNormal",
		icon: "sizeNormal"
	},
	{
		value: "wide",
		label: "sizeWide",
		icon: "sizeWide"
	},
	{
		value: "full",
		label: "sizeFull",
		icon: "sizeFull"
	}
], ir = ["color", "align"], ar = {
	color: null,
	highlight: null,
	align: null
}, or = 0, sr = () => typeof matchMedia < "u" && matchMedia("(pointer: coarse)").matches;
function cr(e = {}) {
	let t = null, n = null, r = null, i = !1, a = null, o = null, s = he(e.lang, e.strings), c = B(e.headings), l = Te(e.formats, !!e.title), u = null, d = "", f = () => {
		let { from: e, to: n } = t.tiptap.state.selection;
		return `${e}:${n}`;
	};
	return {
		html: "",
		active: {},
		disabled: {},
		uid: `afw-${++or}`,
		readOnly: !!e.readonly,
		canUndo: !1,
		canRedo: !1,
		name: e.name || "",
		format: e.format === "json" ? "json" : "html",
		draft: null,
		toolbar: qn(e.toolbarItems || Xn(Gn, c), l),
		bubbleItems: qn(e.bubbleItems || Xn(Wn, c, 2), l),
		alignItems: Kn,
		paletteRows: [],
		values: { ...ar },
		pop: {
			open: !1,
			ready: !1,
			kind: "",
			x: 0,
			y: 0
		},
		showToolbar: e.toolbar ?? !0,
		showBubble: e.bubble ?? !0,
		showStats: e.stats ?? !0,
		stats: {
			words: 0,
			minutes: 0
		},
		meta: { ...er },
		titleName: e.titleName || "",
		bubble: {
			open: !1,
			ready: !1,
			mode: "format",
			purpose: "link",
			x: 0,
			y: 0,
			url: "",
			href: "",
			hasLink: !1,
			error: ""
		},
		media: {
			open: !1,
			ready: !1,
			x: 0,
			y: 0,
			kind: "image",
			size: "normal",
			alt: ""
		},
		mediaSizes: rr,
		toast: {
			open: !1,
			message: ""
		},
		slash: {
			open: !1,
			ready: !1,
			items: [],
			index: 0,
			x: 0,
			y: 0
		},
		plus: {
			visible: !1,
			x: 2,
			y: 0
		},
		handle: {
			visible: !1,
			x: 2,
			y: 0,
			pos: null
		},
		dragging: !1,
		init() {
			n = this.$el, n.classList.add("afw");
			let r = n.querySelector("[data-afw-editor]"), i = e;
			if (!r) {
				let t = n.innerHTML;
				n.innerHTML = Qn, r = n.querySelector("[data-afw-editor]"), i = {
					...e,
					content: e.content ?? t
				};
			}
			r.hasAttribute("x-ignore") || (r.setAttribute("x-ignore", ""), r._x_ignore = !0), t = new Fn(r, i), this.meta = t.getMeta(), this.paletteRows = [{
				command: "color",
				label: "textColor",
				none: "defaultColor",
				colors: t.options.colors
			}, {
				command: "highlight",
				label: "highlight",
				none: "noHighlight",
				colors: t.options.highlights
			}].filter((e) => l.includes(e.command) && e.colors.length), t.on("change", (e) => {
				this.html = e, this.handle.visible = !1, this.stats = t.stats(), this.meta = t.getMeta(), n.dispatchEvent(new CustomEvent("wysiwyg-change", {
					detail: {
						html: e,
						meta: this.meta
					},
					bubbles: !0
				}));
			}), t.on("history", ({ canUndo: e, canRedo: t }) => {
				this.canUndo = e, this.canRedo = t;
			}), t.on("readonly", (e) => {
				this.readOnly = e, e && (this.closeBubble(), this.hideMediaBar(), this.plus.visible = !1, this.handle.visible = !1);
			}), t.on("focus", () => n.dispatchEvent(new CustomEvent("wysiwyg-focus", { bubbles: !0 }))), t.on("blur", () => n.dispatchEvent(new CustomEvent("wysiwyg-blur", { bubbles: !0 }))), t.on("state", (e) => {
				this.active = e, this.disabled = t.disabledState(), this.values = t.formatValues();
			}), t.on("selection", (e) => this.onSelection(e)), t.on("slash", (e) => this.onSlash(e)), t.on("linkrequest", ({ href: e }) => this.openInput("link", e)), t.on("embedrequest", () => this.openInput("embed")), t.on("error", (e) => {
				this.showToast(e.message), n.dispatchEvent(new CustomEvent("wysiwyg-error", {
					detail: e,
					bubbles: !0
				}));
			}), this.html = t.getHTML(), this.stats = t.stats(), this.canUndo = t.canUndo(), this.draft = t.draft || null;
			let a = () => this.dragging && this.endBlockDrag(), s = (e) => {
				this.pop.open && !this.$refs.pop?.contains(e.target) && !u?.contains(e.target) && this.closePop();
			}, c = (e) => {
				e.key === "Escape" && this.pop.open && (e.preventDefault(), e.stopPropagation(), this.closePop());
			};
			n.addEventListener("keydown", c, !0), document.addEventListener("drop", a, !0), document.addEventListener("dragend", a, !0), document.addEventListener("mousedown", s, !0), o = () => {
				document.removeEventListener("drop", a, !0), document.removeEventListener("dragend", a, !0), document.removeEventListener("mousedown", s, !0), n.removeEventListener("keydown", c, !0);
			}, n.closest("form")?.addEventListener("submit", () => {
				this.draft && t.discardDraft(), t.clearDraft();
			}), this.readOnly = t.readOnly, this.$watch("html", (e) => {
				if (!t) return;
				let n = e || "", r = t.getHTML();
				n !== r && t.normalizeHTML(n) !== r && t.setHTML(n);
			}), this.$nextTick(() => {
				this.initToolbarFocus(), n.dispatchEvent(new CustomEvent("wysiwyg-ready", {
					detail: { editor: t },
					bubbles: !0
				}));
			});
		},
		destroy() {
			clearTimeout(a), o?.(), t?.destroy(), t = null;
		},
		exec(e, ...n) {
			t?.exec(e, ...n);
		},
		isActive(e) {
			return !!this.active[e];
		},
		icon(e) {
			return e === "align" ? Hn[`align${lr(this.values.align || "left")}`] : c.length === 2 && /^h[2-6]$/.test(e) && c.includes(Number(e[1])) ? Hn[Number(e[1]) === c[0] ? "headingLarge" : "headingSmall"] : Hn[e] || "";
		},
		t(e) {
			return s[e] ?? e;
		},
		inputValue() {
			let e = this.html;
			return this.format === "json" ? JSON.stringify(t ? t.getJSON() : {
				type: "doc",
				content: []
			}) : e;
		},
		getJSON() {
			return t?.getJSON();
		},
		getMeta() {
			return t?.getMeta() ?? { ...er };
		},
		setJSON(e) {
			t?.setJSON(e);
		},
		hasPop(e) {
			return ir.includes(e);
		},
		onItem(e, t) {
			if (!this.hasPop(e)) return this.closePop(), this.exec(e);
			if (this.pop.open && this.pop.kind === e) return this.closePop();
			this.openPop(e, t?.currentTarget);
		},
		openPop(e, n) {
			!this.readOnly && t && n && (t.hasFocus() || t.focus(), u = n, d = f(), Object.assign(this.pop, {
				open: !0,
				ready: !1,
				kind: e
			}), this.$nextTick(() => {
				let e = n.closest(".afw-bubble") && !sr() ? "above" : "below", t = this.place(this.$refs.pop, n.getBoundingClientRect(), {
					prefer: e,
					gap: 6
				});
				this.pop.x = t.x, this.pop.y = t.y, this.pop.ready = !0;
			}));
		},
		closePop(e = !1) {
			this.pop.open && (this.pop.open = !1, this.pop.ready = !1, e && u?.focus(), u = null);
		},
		applyPop(e, n) {
			t?.exec(e, n), this.closePop();
		},
		draftMessage() {
			if (!this.draft) return "";
			let t = new Date(this.draft.time).toLocaleString(e.lang === "en" ? "en" : "id", {
				dateStyle: "medium",
				timeStyle: "short"
			});
			return ge(this.t("draftFound"), { time: t });
		},
		restoreDraft() {
			t.restoreDraft(), this.draft = null;
		},
		discardDraft() {
			t.discardDraft(), this.draft = null;
		},
		isDisabled(e) {
			return e === "undo" ? !this.canUndo : e === "redo" ? !this.canRedo : !!this.disabled[e];
		},
		setReadOnly(e = !0) {
			t?.setReadOnly(e);
		},
		editor() {
			return t;
		},
		toolbarButtons() {
			return [...n.querySelectorAll(".afw-toolbar .afw-btn")].filter((e) => e.offsetParent !== null);
		},
		initToolbarFocus() {
			this.toolbarButtons().forEach((e, t) => e.setAttribute("tabindex", t === 0 ? "0" : "-1"));
		},
		moveFocus(e, t) {
			let n = this.toolbarButtons(), r = n.indexOf(document.activeElement);
			if (r < 0) return;
			let i = r + t;
			i = t === Infinity ? n.length - 1 : t === -Infinity ? 0 : (i + n.length) % n.length, n.forEach((e, t) => e.setAttribute("tabindex", t === i ? "0" : "-1")), n[i].focus();
		},
		setHTML(e) {
			t?.setHTML(e);
		},
		getHTML() {
			return t?.getHTML() || "";
		},
		focus() {
			t?.focus();
		},
		place(e, t, { prefer: r = "above", align: i = "center", gap: a = $n } = {}) {
			let o = n.getBoundingClientRect(), s = e.offsetWidth, c = e.offsetHeight, l = i === "center" ? t.left + t.width / 2 - s / 2 : t.left;
			l = Math.max(tr, Math.min(l, window.innerWidth - s - tr));
			let u = t.top - c - a, d = t.bottom + a, f = u >= tr, p = d + c <= window.innerHeight - tr, m = r === "above" ? f || !p ? u : d : p || !f ? d : u;
			return {
				x: Math.round(l - o.left),
				y: Math.round(m - o.top)
			};
		},
		onSelection(e) {
			if (this.pop.open && (!e.inside || f() !== d) && this.closePop(), !(this.bubble.open && this.bubble.mode === "input") && !this.readOnly) {
				if (this.updatePlus(e), e.media) return this.closeBubble(), this.showMediaBar(e.media);
				if (this.hideMediaBar(), !e.inside || e.dragging || e.inCode || this.slash.open || !this.showBubble) return this.closeBubble();
				if (!e.collapsed) return this.showBubbleAt("format", e.rect);
				if (e.link) return this.bubble.href = e.link.href, this.showBubbleAt("linkinfo", e.link.rect);
				this.closeBubble();
			}
		},
		showBubbleAt(e, t) {
			let n = this.bubble.open && this.bubble.mode === e;
			this.bubble.mode = e, this.bubble.open = !0, n || (this.bubble.ready = !1), this.$nextTick(() => {
				let n = sr() && e === "format" ? "below" : "above", r = this.place(this.$refs.bubble, t, { prefer: n });
				this.bubble.x = r.x, this.bubble.y = r.y, this.bubble.ready = !0;
			});
		},
		closeBubble() {
			this.bubble.open = !1, this.bubble.ready = !1, this.bubble.mode = "format", this.bubble.error = "";
		},
		inputPlaceholder() {
			return this.t(nr[this.bubble.purpose]) || "";
		},
		openInput(e, n = "") {
			r = t.saveSelection();
			let i = e === "alt" ? this.mediaRect() : t.selectionRect();
			i && (this.hideMediaBar(), this.bubble.purpose = e, this.bubble.url = n || "", this.bubble.hasLink = e === "link" && !!n, this.bubble.error = "", this.showBubbleAt("input", i), this.$nextTick(() => {
				this.$refs.linkInput.focus(), this.$refs.linkInput.select();
			}));
		},
		openLinkInput({ href: e = "" } = {}) {
			this.openInput("link", e);
		},
		applyInput() {
			let e = this.bubble.url.trim(), n = this.bubble.purpose;
			if (n === "link") return e && !T(e) ? this.bubble.error = this.t("errorUrl") : this.withEditorFocus(() => e ? t.exec("link", e) : t.exec("unlink"));
			if (n === "embed") return e ? v(e) ? this.withEditorFocus(() => t.exec("embed", e)) : this.bubble.error = this.t("errorEmbed") : this.cancelInput();
			if (n === "alt") return this.withEditorFocus(() => t.setMediaAlt(e));
		},
		removeLink() {
			this.withEditorFocus(() => t.exec("unlink"));
		},
		cancelInput() {
			if (this.bubble.mode !== "input") return this.closeBubble();
			let e = this.bubble.purpose;
			this.withEditorFocus(() => e === "alt" && t.setMediaAlt(this.media.alt));
		},
		onInputBlur() {
			!i && this.bubble.mode === "input" && this.closeBubble();
		},
		withEditorFocus(e) {
			i = !0, this.closeBubble(), t.restoreSelection(r), e(), r = null, i = !1;
		},
		showMediaBar({ kind: e, size: t, alt: n, rect: r }) {
			let i = this.media.open;
			Object.assign(this.media, {
				open: !0,
				kind: e,
				size: t,
				alt: n
			}), i || (this.media.ready = !1), this.$nextTick(() => {
				let e = this.place(this.$refs.mediabar, r, { prefer: "above" });
				this.media.x = e.x, this.media.y = e.y, this.media.ready = !0;
			});
		},
		hideMediaBar() {
			this.media.open = !1, this.media.ready = !1;
		},
		mediaRect() {
			return n.querySelector(".afw-content .afw-is-selected")?.getBoundingClientRect() || null;
		},
		setMediaSize(e) {
			t.setMediaSize(e);
		},
		editAlt() {
			this.openInput("alt", this.media.alt);
		},
		removeMedia() {
			t.removeMedia();
		},
		showToast(e) {
			this.toast.message = e, this.toast.open = !0, clearTimeout(a), a = setTimeout(() => this.toast.open = !1, 4e3);
		},
		onSlash(e) {
			if (this.slash.items = e.items, this.slash.index = e.index, e.open && e.items.length ? (t.el.setAttribute("aria-controls", `${this.uid}-menu`), t.el.setAttribute("aria-activedescendant", `${this.uid}-opt-${e.index}`)) : t.el.removeAttribute("aria-activedescendant"), !e.open) {
				this.slash.open = !1, this.slash.ready = !1;
				return;
			}
			let n = this.slash.open;
			this.slash.open = !0, this.plus.visible = !1, this.closeBubble(), this.$nextTick(() => {
				if (!n || !this.slash.ready) {
					let t = this.place(this.$refs.menu, e.rect, {
						prefer: "below",
						align: "left",
						gap: 6
					});
					this.slash.x = t.x, this.slash.y = t.y;
				}
				this.slash.ready = !0, this.$refs.menu.querySelector(".afw-is-active")?.scrollIntoView({ block: "nearest" });
			});
		},
		applySlash(e) {
			t.applySlash(e);
		},
		hoverSlash(e) {
			e !== this.slash.index && t.setSlashIndex(e);
		},
		openBlockMenu() {
			t.openSlash();
		},
		updatePlus(e) {
			if (!e.inside || !e.emptyBlock || this.slash.open || this.dragging) {
				this.plus.visible = !1;
				return;
			}
			let t = n.getBoundingClientRect(), r = e.emptyBlock.rect;
			this.plus.y = Math.round(r.top - t.top + r.height / 2 - 12), this.plus.x = ur(r, t), this.plus.visible = !0;
		},
		onBodyHover(r) {
			if (this.readOnly || this.dragging || e.dragHandle === !1 || sr()) return;
			let i = t?.blockAt(r.clientY);
			if (!i || i.empty) return this.hideHandle();
			let a = n.getBoundingClientRect();
			this.handle.y = Math.round(i.line.top - a.top + i.line.height / 2 - 12), this.handle.x = ur(i.rect, a), this.handle.pos = i.pos, this.handle.visible = !0;
		},
		hideHandle() {
			this.dragging || (this.handle.visible = !1);
		},
		selectHandleBlock() {
			this.handle.pos !== null && t.selectBlock(this.handle.pos);
		},
		startBlockDrag(e) {
			if (this.handle.pos === null) return e.preventDefault();
			this.dragging = !0, this.closeBubble(), this.plus.visible = !1, t.startBlockDrag(this.handle.pos, e);
		},
		endBlockDrag() {
			this.dragging = !1, this.handle.visible = !1, t.endBlockDrag();
		}
	};
}
var lr = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function ur(e, t) {
	return Math.max(2, Math.round(e.left - t.left - 30));
}
function dr(e) {
	e.data("wysiwyg", cr);
}
//#endregion
//#region src/index.js
var fr = dr;
typeof document < "u" && document.addEventListener("alpine:init", () => window.Alpine?.plugin(dr));
//#endregion
export { Kn as ALIGN_ITEMS, _e as BLOCKS, Wn as BUBBLE, I as COMMANDS, b as DEFAULT_COLORS, x as DEFAULT_HIGHLIGHTS, Fn as Editor, y as FORMATS, Hn as ICONS, me as LOCALES, Gn as TOOLBAR, fr as default, Tn as fromJSON, he as getStrings, Jn as headingItem, T as normalizeUrl, dr as plugin, V as sanitize, On as slugify, xn as textToHtml, wn as toJSON, qn as withFormats, Xn as withHeadings, cr as wysiwygComponent };
