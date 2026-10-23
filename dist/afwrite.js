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
			imageRequest: ["Gambar", "Unggah atau pilih dari galeri"],
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
		replaceImage: "Ganti gambar",
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
		errorImageSrc: "Alamat gambar tidak valid.",
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
			imageRequest: ["Image", "Upload or choose from library"],
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
		replaceImage: "Replace image",
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
		errorImageSrc: "Invalid image URL.",
		errorUpload: "Failed to upload \"{name}\"."
	}
};
function he(e = "en", t = {}) {
	let n = me[e] || me.en;
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
], Te = [
	"#e11d48",
	"#ea580c",
	"#ca8a04",
	"#16a34a",
	"#2563eb",
	"#9333ea",
	"#71717a"
], Ee = [
	"#fef08a",
	"#bbf7d0",
	"#bfdbfe",
	"#fbcfe8",
	"#fed7aa"
];
function De(e, t = !1) {
	return e === !0 || e == null ? t ? [] : [...y] : Array.isArray(e) ? y.filter((t) => e.includes(t)) : [];
}
function b(e) {
	let t = String(e ?? "").trim().toLowerCase(), n = t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
	if (n) return `#${n[1].length === 3 ? [...n[1]].map((e) => e + e).join("") : n[1]}`;
	if (n = t.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(1|1\.0+|0?\.\d+|0)\s*)?\)$/), !n || n[4] !== void 0 && Number(n[4]) < 1) return null;
	let r = n.slice(1, 4).map(Number);
	return r.every((e) => e <= 255) ? `#${r.map((e) => e.toString(16).padStart(2, "0")).join("")}` : null;
}
function Oe(e, t) {
	let n = (Array.isArray(e) ? e : t).map(b).filter(Boolean);
	return [...new Set(n)];
}
function x(e, t) {
	let n = String(e || "").match(RegExp(`(?:^|;)\\s*${t}\\s*:\\s*([^;]+)`, "i"));
	return n ? n[1].trim().replace(/\s*!important$/i, "") : "";
}
function ke(e) {
	for (let t of e.classList || []) {
		let e = t.match(/^(?:afw|ql)-align-(center|right|justify)$/);
		if (e) return e[1];
	}
	let t = (x(e.getAttribute("style"), "text-align") || e.getAttribute("align") || "").toLowerCase();
	return we.includes(t) ? t : null;
}
//#endregion
//#region src/core/url.js
var Ae = [
	"http",
	"https",
	"mailto",
	"tel"
];
function S(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase(), r = n.match(/^([a-z][a-z0-9+.-]*):/), i = r && /^[a-z0-9.-]+:\d/.test(n);
	return r && !i ? Ae.includes(r[1]) ? t : null : /^(\/|#|\?|\.)/.test(t) ? t : `https://${t}`;
}
//#endregion
//#region src/core/schema.js
var je = [
	"image",
	"embed",
	"horizontalRule"
], Me = ["wide", "full"], Ne = r.create({
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
}), Pe = r.create({
	name: "italic",
	parseHTML: () => [
		{ tag: "i" },
		{ tag: "em" },
		{ style: "font-style=italic" }
	],
	renderHTML: () => ["i", 0]
}), Fe = r.create({
	name: "code",
	code: !0,
	parseHTML: () => [{ tag: "code" }],
	renderHTML: () => ["code", 0]
}), Ie = r.create({
	name: "link",
	inclusive: !1,
	priority: 1e3,
	addAttributes: () => ({ href: { default: null } }),
	parseHTML: () => [{
		tag: "a[href]",
		getAttrs: (e) => {
			let t = S(e.getAttribute("href"));
			return t ? { href: t } : !1;
		}
	}],
	renderHTML: ({ HTMLAttributes: e }) => [
		"a",
		{ href: e.href },
		0
	]
}), Le = r.create({
	name: "underline",
	parseHTML: () => [{ tag: "u" }],
	renderHTML: () => ["u", 0]
}), Re = r.create({
	name: "strike",
	parseHTML: () => [{ tag: "s" }],
	renderHTML: () => ["s", 0]
}), ze = r.create({
	name: "color",
	addAttributes: () => ({ color: {
		default: null,
		rendered: !1
	} }),
	parseHTML: () => [{
		tag: "span",
		getAttrs: (e) => {
			let t = b(x(e.getAttribute("style"), "color"));
			return t ? { color: t } : !1;
		}
	}],
	renderHTML: ({ mark: e }) => [
		"span",
		{ style: `color: ${e.attrs.color}` },
		0
	]
}), Be = r.create({
	name: "highlight",
	addAttributes: () => ({ color: {
		default: null,
		rendered: !1
	} }),
	parseHTML: () => [{
		tag: "mark",
		getAttrs: (e) => ({ color: b(x(e.getAttribute("style"), "background-color")) })
	}],
	renderHTML: ({ mark: e }) => [
		"mark",
		e.attrs.color ? { style: `background-color: ${e.attrs.color}` } : {},
		0
	]
}), Ve = t.create({
	name: "textAlign",
	addGlobalAttributes: () => [{
		types: ["paragraph", "heading"],
		attributes: { textAlign: {
			default: null,
			parseHTML: (e) => ke(e),
			renderHTML: (e) => e.textAlign ? { class: `afw-align-${e.textAlign}` } : {}
		} }
	}]
}), He = i.create({
	name: "title",
	content: "text*",
	marks: "",
	defining: !0,
	parseHTML: () => [{
		tag: "h1",
		priority: 60
	}],
	renderHTML: () => ["h1", 0]
}), Ue = i.create({
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
}), We = i.create({
	name: "blockquote",
	group: "block",
	content: "inline*",
	defining: !0,
	parseHTML: () => [{ tag: "blockquote" }],
	renderHTML: () => ["blockquote", 0]
}), Ge = i.create({
	name: "horizontalRule",
	group: "block",
	atom: !0,
	selectable: !0,
	parseHTML: () => [{ tag: "hr" }],
	renderHTML: () => ["hr"]
}), Ke = {
	default: null,
	parseHTML: (e) => Me.includes(e.getAttribute("data-size")) ? e.getAttribute("data-size") : null,
	renderHTML: (e) => e.size ? { "data-size": e.size } : {}
}, qe = (e) => e.querySelector(":scope > figcaption") || document.createElement("figcaption"), Je = i.create({
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
			size: Ke,
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
			contentElement: qe,
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
		return ({ node: e }) => new it(e, this.options);
	}
}), Ye = i.create({
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
		size: Ke
	}),
	parseHTML: () => [{
		tag: "figure[data-embed]",
		priority: 60,
		contentElement: qe,
		getAttrs: (e) => {
			let t = v(e.querySelector(":scope > iframe")?.getAttribute("src"));
			return t ? {
				provider: t.provider,
				id: t.id
			} : !1;
		}
	}],
	renderHTML({ node: e, HTMLAttributes: t }) {
		let n = Xe(e);
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
		return ({ node: e }) => new it(e, this.options);
	}
}), Xe = (e) => v(e.attrs.provider === "vimeo" ? `https://vimeo.com/${e.attrs.id}` : `https://youtu.be/${e.attrs.id}`), Ze = /^\s*(?:(?:<figure[\s>][\s\S]*?<\/figure>|<hr\s*\/?>)\s*)*<h1[\s>]/i;
function Qe(e, t) {
	return t && !Ze.test(e) ? `<h1></h1>${e}` : e;
}
var $e = [
	"image",
	"embed",
	"horizontalRule"
];
function C(e) {
	let t = 0;
	for (; t < e.childCount - 1 && e.child(t).type.name !== "title";) t++;
	return t;
}
function et(e) {
	let t = 0;
	for (let n = 0, r = C(e); n < r; n++) t += e.child(n).nodeSize;
	return t;
}
function tt({ allowDataImages: e = !0, captionPlaceholder: t = "", headings: n = [2, 3], title: r = !1, formats: i = y } = {}) {
	let a = {
		underline: Le,
		strike: Re,
		color: ze,
		highlight: Be,
		align: Ve
	};
	return [
		...r ? [
			ae.extend({ content: `(${$e.join(" | ")})* title subtitle? block+` }),
			He,
			Ue
		] : [ae],
		fe,
		pe,
		oe.configure({ keepMarks: !0 }),
		se.configure({ levels: n }),
		We,
		ce,
		de,
		le,
		ue,
		ie.configure({
			exitOnTripleEnter: !1,
			languageClassPrefix: null
		}),
		Ge,
		Je.configure({
			allowDataImages: e,
			captionPlaceholder: t
		}),
		Ye.configure({ captionPlaceholder: t }),
		Ne,
		Pe,
		Fe,
		Ie,
		...y.filter((e) => i.includes(e)).map((e) => a[e])
	];
}
//#endregion
//#region src/core/media.js
var nt = ["wide", "full"], w = (e) => !!e && je.includes(e.type.name);
function rt(e) {
	return e.type.name === "horizontalRule" ? "divider" : e.type.name === "embed" ? "embed" : "image";
}
var it = class {
	constructor(e, { captionPlaceholder: t = "" } = {}) {
		this.node = e, this.dom = document.createElement("figure"), this.contentDOM = document.createElement("figcaption"), this.contentDOM.dataset.placeholder = t, e.type.name === "embed" ? (this.media = Se(Xe(e)), this.media.setAttribute("tabindex", "-1"), this.dom.setAttribute("data-embed", e.attrs.provider)) : (this.media = document.createElement("img"), this.media.setAttribute("draggable", "false")), this.dom.append(this.media, this.contentDOM), this.render(e);
	}
	render(e) {
		let { attrs: t } = e;
		at(this.dom, "data-size", t.size), at(this.dom, "data-afw-uploading", t.uploading ? "" : null), e.type.name === "image" && (this.media.getAttribute("src") !== t.src && this.media.setAttribute("src", t.src || ""), this.media.setAttribute("alt", t.alt || "")), this.contentDOM.classList.toggle("afw-is-empty", e.content.size === 0);
	}
	update(e) {
		return e.type !== this.node.type || e.type.name === "embed" && (e.attrs.id !== this.node.attrs.id || e.attrs.provider !== this.node.attrs.provider) ? !1 : (this.node = e, this.render(e), !0);
	}
	ignoreMutation(e) {
		return e.type === "selection" ? !1 : e.type === "attributes" || !this.contentDOM.contains(e.target);
	}
};
function at(e, t, n) {
	n == null ? e.removeAttribute(t) : e.getAttribute(t) !== n && e.setAttribute(t, n);
}
function ot(e) {
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
		return (!u || w(u)) && t.insert(l, n.schema.nodes.paragraph.create()), t.setSelection(_.near(t.doc.resolve(l + 1))), t.scrollIntoView(), !0;
	};
}
function st(e, t) {
	let n = null;
	return e.descendants((e, r) => n === null && (e.type.name === "image" && e.attrs.uploading === t && (n = r), !e.isBlock || e.type.name === "doc")), n;
}
var ct = 0, lt = (e) => typeof e?.length == "number" && typeof e.item == "function", ut = (e) => typeof Blob < "u" && e instanceof Blob;
function dt(e, t) {
	let n = Array.isArray(t) || lt(t) ? [...t] : [t], r = n.filter((e) => e && !ut(e)), i = n.filter(ut);
	if (r.length && pt(e, r), i.length) return yt(e, i);
}
function ft(e, { allowData: t = !0 } = {}) {
	let n = Ce(typeof e?.src == "string" ? e.src : "", { allowData: t });
	if (!n) return null;
	let r = e.mediaId ?? e.media_id;
	return {
		src: n,
		alt: typeof e.alt == "string" ? e.alt.trim() : "",
		mediaId: /^\d{1,20}$/.test(String(r ?? "")) ? String(r) : null,
		size: nt.includes(e.size) ? e.size : null
	};
}
function pt(e, t) {
	let n = [];
	for (let r of t) {
		let t = ft(r, { allowData: e.options.allowDataImages });
		t ? n.push(t) : e.emit("error", { message: e.strings.errorImageSrc });
	}
	if (!n.length) return;
	let r = e.tiptap.chain();
	n.forEach((e) => r.insertMediaBlock({
		type: "image",
		attrs: e
	})), r.run();
}
var mt = (e) => new Promise((t, n) => {
	let r = new FileReader();
	r.onload = () => t(r.result), r.onerror = () => n(r.error), r.readAsDataURL(e);
});
function ht(e) {
	let t = typeof e == "string" ? { url: e } : e && typeof e == "object" ? e : {}, n = typeof t.url == "string" ? t.url : "", r = t.mediaId ?? t.media_id;
	return {
		url: n,
		mediaId: /^\d{1,20}$/.test(String(r ?? "")) ? String(r) : null,
		alt: typeof t.alt == "string" ? t.alt.trim() : ""
	};
}
function gt(e, t) {
	let { maxImageSize: n } = e.options, r = e.strings, i = [...t].filter((e) => /^image\/(png|jpe?g|gif|webp|avif)$/.test(e.type));
	return !i.length && t.length && e.emit("error", { message: r.errorImageType }), i.filter((t) => {
		if (!n || t.size <= n) return !0;
		let i = (n / 1024 / 1024).toFixed(1).replace(/\.0$/, "");
		return e.emit("error", { message: ge(r.errorImageSize, {
			name: t.name,
			size: i
		}) }), !1;
	});
}
async function _t(e, t) {
	let { upload: n } = e.options, r = ht(n ? await n(t) : await mt(t));
	if (!r.url) throw Error("URL hasil upload kosong");
	return r;
}
var vt = (e, t, n) => e.emit("error", {
	message: ge(e.strings.errorUpload, { name: t.name }),
	error: n
});
async function yt(e, t) {
	for (let n of gt(e, t)) {
		let t = URL.createObjectURL(n), r = `u${++ct}`;
		e.tiptap.commands.insertMediaBlock({
			type: "image",
			attrs: {
				src: t,
				alt: "",
				uploading: r
			}
		});
		try {
			let { url: t, mediaId: i, alt: a } = await _t(e, n);
			bt(e, r, (e, n, r) => e.setNodeMarkup(n, null, {
				...r.attrs,
				src: t,
				mediaId: i,
				alt: r.attrs.alt || a,
				uploading: null
			}));
		} catch (t) {
			bt(e, r, (e, t, n) => e.delete(t, t + n.nodeSize)), vt(e, n, t);
		} finally {
			URL.revokeObjectURL(t);
		}
	}
}
function bt(e, t, n, { history: r = !0 } = {}) {
	let { state: i, view: a } = e.tiptap, o = st(i.doc, t);
	if (o === null) return;
	let s = i.selection instanceof h && i.selection.from === o, c = i.tr;
	n(c, o, i.doc.nodeAt(o)), s && c.doc.nodeAt(o)?.type.name === "image" && c.setSelection(h.create(c.doc, o)), r || c.setMeta("addToHistory", !1), a.dispatch(c);
}
function xt(e, t) {
	let n = Array.isArray(t) || lt(t) ? t[0] : t;
	if (!n || e.selectedMedia()?.kind !== "image") return;
	if (ut(n)) return St(e, n);
	let r = ft(n, { allowData: e.options.allowDataImages });
	if (!r) return e.emit("error", { message: e.strings.errorImageSrc });
	let { size: i, ...a } = r;
	e._updateMedia(() => ({
		...a,
		...i && { size: i },
		uploading: null
	}));
}
async function St(e, t) {
	let [n] = gt(e, [t]);
	if (!n) return;
	let { src: r, alt: i, mediaId: a } = e.tiptap.state.selection.node.attrs, o = URL.createObjectURL(t), s = `u${++ct}`;
	e._updateMedia(() => ({
		src: o,
		alt: "",
		mediaId: null,
		uploading: s
	}));
	try {
		let n = await _t(e, t);
		bt(e, s, (e, t, r) => e.setNodeMarkup(t, null, {
			...r.attrs,
			src: n.url,
			mediaId: n.mediaId,
			alt: r.attrs.alt || n.alt,
			uploading: null
		}), { history: !1 });
	} catch (n) {
		bt(e, s, (e, t, n) => e.setNodeMarkup(t, null, {
			...n.attrs,
			src: r,
			alt: i,
			mediaId: a,
			uploading: null
		}), { history: !1 }), vt(e, t, n);
	} finally {
		URL.revokeObjectURL(o);
	}
}
function Ct(e, { replace: t = !1 } = {}) {
	let n = e.saveSelection(), r = document.createElement("input");
	r.type = "file", r.accept = "image/png,image/jpeg,image/gif,image/webp,image/avif", r.multiple = !t, r.addEventListener("change", () => {
		e.restoreSelection(n), t ? xt(e, r.files) : yt(e, r.files);
	}), r.click();
}
function wt(e, { mode: t = "insert" } = {}) {
	let n = t === "replace", r = n ? e.selectedMedia() : null, i = e.saveSelection(), a = !1, o = (t) => (n) => {
		a || (a = !0, e.restoreSelection(i), t(n));
	};
	return {
		mode: t,
		...n && { current: {
			src: r?.src ?? null,
			alt: r?.alt ?? "",
			mediaId: r?.mediaId ?? null
		} },
		insert: o((t) => t != null && (n ? xt(e, t) : e.exec("image", t))),
		pickFiles: o(() => Ct(e, { replace: n })),
		cancel: o(() => {})
	};
}
//#endregion
//#region src/core/commands.js
var T = (e) => e.tiptap, E = (e) => e.tiptap.state.selection.$from;
function Tt(e, t) {
	let n = E(e);
	for (let e = n.depth; e > 0; e--) if (t.includes(n.node(e).type.name)) return n.node(e);
	return null;
}
var D = (e) => !!Tt(e, ["listItem"]), Et = (e) => Tt(e, ["bulletList", "orderedList"])?.type.name || null, O = (e) => E(e).parent.type.name, Dt = (e, t) => (n) => T(n).commands.toggleNode(e, "paragraph", t), Ot = (e) => e.options.title && E(e).depth === 1 && E(e).index(0) === C(e.tiptap.state.doc) + 1, kt = (e) => e.options.headings[1] ?? e.options.headings[0], k = (e) => ({
	run(t) {
		if (!t.options.headings.includes(e)) return !1;
		if (Ot(t) && e === kt(t)) {
			if (O(t) === "subtitle") return T(t).commands.setNode("paragraph");
			let e = E(t).index(0) === t.tiptap.state.doc.childCount - 1;
			return T(t).chain().command(({ tr: t, state: n }) => (e && t.insert(t.doc.content.size, n.schema.nodes.paragraph.create()), !0)).setNode("subtitle").run();
		}
		return O(t) === "subtitle" ? T(t).commands.setNode("heading", { level: e }) : Dt("heading", {
			level: e,
			...Nt(t)
		})(t);
	},
	active: (t) => T(t).isActive("heading", { level: e }) || O(t) === "subtitle" && e === kt(t)
}), At = {
	underline: ["underline"],
	strike: ["strike"],
	color: ["color", "highlight"],
	highlight: ["highlight"],
	align: ["align"],
	alignLeft: ["align"],
	alignCenter: ["align"],
	alignRight: ["align"],
	alignJustify: ["align"]
}, jt = (e, t) => !At[t] || At[t].some((t) => e.includes(t)), A = (e, t) => e.options.formats.includes(t), Mt = ["paragraph", "heading"], Nt = (e) => A(e, "align") ? { textAlign: j(e) } : {};
function j(e) {
	let t = E(e), n = t.depth >= 1 ? t.node(1) : t.nodeAfter;
	return n && Mt.includes(n.type.name) && n.attrs.textAlign || null;
}
function Pt(e, t) {
	if (!A(e, "align")) return !1;
	let n = we.includes(t) ? t : null, { state: r, view: i } = T(e), { from: a, to: o } = r.selection, s = r.tr;
	return r.doc.nodesBetween(a, o, (e, t) => (Mt.includes(e.type.name) && e.attrs.textAlign !== n && s.setNodeMarkup(t, null, {
		...e.attrs,
		textAlign: n
	}), !1)), s.docChanged && i.dispatch(s), !0;
}
var Ft = (e) => ({
	run: (t) => Pt(t, e),
	active: (t) => j(t) === (e === "left" ? null : e)
}), It = (e) => ({
	run: (t) => A(t, e) && T(t).commands.toggleMark(e),
	active: (t) => A(t, e) && T(t).isActive(e)
}), Lt = (e, t) => ({
	run(n, r) {
		if (!A(n, e)) return !1;
		let i = b(r);
		return i ? n.options[t].includes(i) ? T(n).commands.setMark(e, { color: i }) : !1 : T(n).chain().extendMarkRange(e).unsetMark(e).run();
	},
	active: (t) => A(t, e) && T(t).isActive(e)
}), Rt = [
	"bold",
	"italic",
	"ul",
	"ol",
	"codeblock",
	"indent",
	"outdent",
	...Object.keys(At)
];
function zt(e, t) {
	if (!jt(e.options.formats, t)) return !0;
	let n = O(e);
	return n === "title" ? ![
		"undo",
		"redo",
		"image",
		"embed",
		"hr"
	].includes(t) : n === "subtitle" && Rt.includes(t);
}
var Bt = {
	bold: {
		run: (e) => T(e).commands.toggleMark("bold"),
		active: (e) => T(e).isActive("bold")
	},
	italic: {
		run: (e) => T(e).commands.toggleMark("italic"),
		active: (e) => T(e).isActive("italic")
	},
	underline: It("underline"),
	strike: It("strike"),
	color: {
		...Lt("color", "colors"),
		active: (e) => A(e, "color") && T(e).isActive("color") || A(e, "highlight") && T(e).isActive("highlight")
	},
	highlight: Lt("highlight", "highlights"),
	align: {
		run(e, t) {
			if (t !== void 0) return Pt(e, t);
			let n = [null, ...we];
			return Pt(e, n[(n.indexOf(j(e)) + 1) % n.length]);
		},
		active: (e) => j(e) !== null
	},
	alignLeft: Ft("left"),
	alignCenter: Ft("center"),
	alignRight: Ft("right"),
	alignJustify: Ft("justify"),
	h2: k(2),
	h3: k(3),
	h4: k(4),
	h5: k(5),
	h6: k(6),
	quote: {
		run: Dt("blockquote"),
		active: (e) => O(e) === "blockquote"
	},
	ul: {
		run: (e) => T(e).commands.toggleBulletList(),
		active: (e) => Et(e) === "bulletList"
	},
	ol: {
		run: (e) => T(e).commands.toggleOrderedList(),
		active: (e) => Et(e) === "orderedList"
	},
	codeblock: {
		run: (e) => T(e).commands.toggleCodeBlock(),
		active: (e) => O(e) === "codeBlock"
	},
	paragraph: {
		run(e) {
			D(e) ? T(e).commands.liftListItem("listItem") : O(e) !== "title" && T(e).commands.setNode("paragraph", Nt(e));
		},
		active: (e) => O(e) === "paragraph" && !D(e)
	},
	link: {
		run(e, t) {
			let n = T(e), r = n.isActive("link") ? n.getAttributes("link").href || "" : null;
			if (t === void 0) {
				if (e.listeners.linkrequest?.length) {
					e.emit("linkrequest", { href: r || "" });
					return;
				}
				if (r !== null) return Bt.unlink.run(e);
				let n = e.saveSelection();
				t = window.prompt(e.strings.promptUrl, "https://"), e.restoreSelection(n);
			}
			let i = S(t);
			i ? r === null ? n.state.selection.empty ? n.commands.insertContent({
				type: "text",
				text: i,
				marks: [{
					type: "link",
					attrs: { href: i }
				}]
			}) : n.commands.setMark("link", { href: i }) : n.chain().extendMarkRange("link").setMark("link", { href: i }).run() : r !== null && Bt.unlink.run(e);
		},
		active: (e) => T(e).isActive("link")
	},
	unlink: {
		run(e) {
			let t = T(e);
			t.chain().extendMarkRange("link").unsetMark("link").run();
			let { to: n } = t.state.selection;
			t.commands.setTextSelection(n);
		},
		active: () => !1
	},
	image: {
		run(e, t) {
			if (t == null) {
				if (e.listeners.imagerequest?.length) {
					e.emit("imagerequest", wt(e));
					return;
				}
				return Ct(e);
			}
			return dt(e, t);
		},
		active: () => !1
	},
	replaceImage: {
		run(e, t) {
			if (e.selectedMedia()?.kind === "image") {
				if (t == null) {
					if (e.listeners.imagerequest?.length) {
						e.emit("imagerequest", wt(e, { mode: "replace" }));
						return;
					}
					return Ct(e, { replace: !0 });
				}
				return e.replaceMedia(Array.isArray(t) || lt(t) ? t[0] : t);
			}
		},
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
			n ? T(e).commands.insertMediaBlock({
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
		run: (e) => T(e).commands.insertMediaBlock({ type: "horizontalRule" }),
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
		run: (e) => D(e) && T(e).commands.sinkListItem("listItem"),
		active: () => !1
	},
	outdent: {
		run: (e) => D(e) && T(e).commands.liftListItem("listItem"),
		active: () => !1
	}
}, Vt = [
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
], Ht = [
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
function Ut(e, t = [2, 3]) {
	let r = Vt.map(({ find: e, run: r }) => new n({
		find: e,
		handler: ({ state: e, range: n, match: i, chain: a }) => {
			let o = e.doc.resolve(n.from);
			if (o.depth !== 1 || o.parent.type.name !== "paragraph") return null;
			r(a().deleteRange(n), i, t).run();
		}
	})), i = Ht.map(({ find: t, mark: r }) => {
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
var Wt = /* @__PURE__ */ new Set([
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
]), Gt = /* @__PURE__ */ new Set(["FIGURE", "HR"]), Kt = ["wide", "full"], qt = /* @__PURE__ */ new Set([
	"B",
	"I",
	"A",
	"CODE",
	"BR",
	"U",
	"S",
	"SPAN",
	"MARK"
]), Jt = [
	"B",
	"I",
	"A",
	"CODE",
	"U",
	"S",
	"SPAN",
	"MARK"
], Yt = {
	U: ["U", "underline"],
	INS: ["U", "underline"],
	S: ["S", "strike"],
	STRIKE: ["S", "strike"],
	DEL: ["S", "strike"]
}, Xt = /* @__PURE__ */ new Set([
	"P",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6"
]), Zt = /^\d{1,20}$/, Qt = /^(on|style$|class$|srcdoc$|formaction$|xmlns|xlink)/i, $t = /* @__PURE__ */ new Set([
	"href",
	"src",
	"cite",
	"action",
	"poster"
]), M = /* @__PURE__ */ new Set(["UL", "OL"]), en = /* @__PURE__ */ new Set(/* @__PURE__ */ "SCRIPT.STYLE.TEMPLATE.FRAME.FRAMESET.OBJECT.EMBED.APPLET.META.LINK.BASE.TITLE.HEAD.NOSCRIPT.SVG.MATH.CANVAS.FORM.INPUT.BUTTON.SELECT.OPTION.TEXTAREA.DIALOG.SOURCE.VIDEO.AUDIO.TRACK.O:P".split(".")), tn = {
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
}, nn = /* @__PURE__ */ new Set([
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
]), N = {}, rn = /* @__PURE__ */ new Set([
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
]), an = (e) => /^[a-z][a-z0-9-]*$/i.test(e);
function on(e) {
	let t = new Set((e.allowTags || []).filter(an).map((e) => e.toUpperCase()).filter((e) => !en.has(e) && !rn.has(e) && !Wt.has(e) && !qt.has(e) && !tn[e] && !nn.has(e))), n = {};
	return Object.entries(e.allowAttributes || {}).forEach(([e, t]) => {
		if (e !== "*" && !an(e)) return;
		let r = (Array.isArray(t) ? t : []).filter((e) => /^[a-z][a-z0-9_:-]*$/i.test(e) && !Qt.test(e));
		r.length && (n[e === "*" ? "*" : e.toUpperCase()] = r.map((e) => e.toLowerCase()));
	}), {
		tags: t,
		attributes: n,
		classes: new Set((e.allowClasses || []).filter((e) => /^[a-z_-][a-z0-9_-]*$/i.test(e) && !/^afw-/.test(e)))
	};
}
var P = (e) => N.formats.includes(e);
function sn(e) {
	let t = [...new Set((Array.isArray(e) ? e : []).map(Number))].filter((e) => Number.isInteger(e) && e >= 2 && e <= 6).sort((e, t) => e - t);
	return t.length ? t : [2, 3];
}
function cn(e) {
	let t = N.headings, n = Number(e[1]), r = t.filter((e) => e <= n);
	return `H${r.length ? r[r.length - 1] : t[0]}`;
}
function F(e, t = {}) {
	return !e || !String(e).trim() ? "" : ln(e, t).innerHTML;
}
function ln(e, t = {}) {
	N = {
		allowDataImages: !0,
		...t
	}, N.headings = sn(t.headings), N.title = !!t.title, N.formats = De(t.formats, N.title), N.colors = Oe(t.colors, Te), N.highlights = Oe(t.highlights, Ee), N.allow = on(t);
	let n = [...new DOMParser().parseFromString(String(e), "text/html").body.childNodes].flatMap(dn), r = document.createElement("div");
	return r.append(...xn(n, "P")), En(r), N.title && un(r), r;
}
function un(e) {
	let t = [...e.children], n = 0;
	for (; ["FIGURE", "HR"].includes(t[n]?.tagName);) n++;
	t[n]?.tagName !== "H1" && (n = 0);
	let r = t[n]?.tagName === "H1" ? t[n] : null;
	if (t.forEach((e, t) => {
		e.tagName === "H1" && e !== r && e.replaceWith(R(cn("H1"), {}, [...e.childNodes])), e.tagName === "P" && e.classList.contains("afw-subtitle") && !(r && t === n + 1) && e.removeAttribute("class");
	}), !r) return;
	r.textContent = ((e) => (e.querySelectorAll("br").forEach((e) => e.replaceWith(" ")), e.textContent.replace(/\s+/g, " ").trim()))(r);
	let i = r.nextElementSibling;
	i?.classList.contains("afw-subtitle") && (i.querySelectorAll("br").forEach((e) => e.replaceWith(" ")), i.querySelectorAll("b, i, code, u, s, span, mark").forEach(V));
}
function dn(e) {
	if (e.nodeType === Node.TEXT_NODE) return [document.createTextNode(e.data)];
	if (e.nodeType !== Node.ELEMENT_NODE) return [];
	let t = e.tagName.toUpperCase(), n = (e.getAttribute("style") || "").toLowerCase();
	if (en.has(t) || /display\s*:\s*none/.test(n) || /mso-list\s*:\s*ignore/.test(n)) return [];
	if (t === "IMG") return vn(e);
	if (t === "P" && N.title && e.classList.contains("afw-subtitle")) return [R("P", { class: "afw-subtitle" }, B([...e.childNodes].flatMap(dn)))];
	if (t === "IFRAME") {
		let t = v(e.getAttribute("src"));
		return t ? [yn(t)] : [];
	}
	if (t === "HR") return [R("HR")];
	if (t === "PRE") return _n(e);
	let r = [...e.childNodes].flatMap(dn);
	if (t === "FIGCAPTION") return [R("FIGCAPTION", {}, B(r))];
	if (t === "FIGURE") return bn(e, r);
	if (t === "B" && /font-weight\s*:\s*(normal|400)/.test(n)) return r;
	if (t === "TD" || t === "TH") return [...r, document.createTextNode(" ")];
	if (N.allow.tags.has(t)) return z(t, r, I(e, t));
	if (Yt[t]) {
		let [i, a] = Yt[t];
		return pn(P(a) ? z(i, r) : r, e, n);
	}
	if (t === "MARK") {
		if (!P("highlight")) return r;
		let t = fn(x(n, "background-color") || e.getAttribute("data-color"), N.highlights);
		return z("MARK", r, t ? { style: `background-color: ${t}` } : {});
	}
	let i = t === "H1" && N.title ? "H1" : /^H[1-6]$/.test(t) ? cn(t) : tn[t] || (nn.has(t) ? "P" : null);
	if (!i) return pn(r, e, n);
	if (i === "BR") return [document.createElement("br")];
	if (i === "A") {
		let t = S(e.getAttribute("href"));
		return t ? z("A", r, {
			href: t,
			...I(e, "A")
		}) : r;
	}
	return qt.has(i) ? z(i, r, I(e, i)) : Cn(i, r, mn(e, i));
}
function fn(e, t) {
	let n = b(e);
	return n && t.includes(n) ? n : null;
}
function pn(e, t, n) {
	let r = e;
	/font-style\s*:\s*italic/.test(n) && (r = z("I", r)), /font-weight\s*:\s*(bold|bolder|[6-9]00)/.test(n) && (r = z("B", r));
	let i = `${x(n, "text-decoration")} ${x(n, "text-decoration-line")}`;
	P("underline") && /underline/.test(i) && (r = z("U", r)), P("strike") && /line-through/.test(i) && (r = z("S", r));
	let a = P("color") && fn(x(n, "color") || (t.tagName === "FONT" ? t.getAttribute("color") : ""), N.colors);
	a && (r = z("SPAN", r, { style: `color: ${a}` }));
	let o = P("highlight") && fn(x(n, "background-color"), N.highlights);
	return o && (r = z("MARK", r, { style: `background-color: ${o}` })), r;
}
function I(e, t) {
	let { attributes: n, classes: r } = N.allow, i = {};
	[...n[t] || [], ...n["*"] || []].forEach((t) => {
		if (!e.hasAttribute(t)) return;
		let n = $t.has(t) ? S(e.getAttribute(t)) : e.getAttribute(t);
		n !== null && n !== "" && (i[t] = n);
	});
	let a = [...e.classList || []].filter((e) => r.has(e));
	return a.length && (i.class = a.join(" ")), i;
}
function mn(e, t) {
	let n = I(e, t), r = Xt.has(t) && P("align") ? ke(e) : null;
	return r && (n.class = [`afw-align-${r}`, n.class].filter(Boolean).join(" ")), n;
}
var L = (e) => e.nodeType === Node.ELEMENT_NODE && Wt.has(e.tagName), hn = (e) => e.nodeType === Node.ELEMENT_NODE && Gt.has(e.tagName);
function gn(e) {
	let t = e.cloneNode(!0);
	return t.querySelectorAll("br").forEach((e) => e.replaceWith("\n")), t.textContent.replace(/\u200b/g, "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");
}
function _n(e) {
	let t = gn(e);
	return t.trim() ? [R("PRE", {}, [R("CODE", {}, [document.createTextNode(t)])])] : [];
}
function vn(e) {
	let t = Ce(e.getAttribute("src") || e.getAttribute("data-src"), { allowData: N.allowDataImages });
	if (!t) return [];
	let n = (e.getAttribute("alt") || "").trim(), r = (e.getAttribute("data-media-id") || "").trim();
	return [R("FIGURE", {}, [R("IMG", {
		src: t,
		alt: n,
		...Zt.test(r) && { "data-media-id": r },
		...I(e, "IMG")
	})])];
}
function yn(e) {
	return R("FIGURE", { "data-embed": e.provider }, [Se(e)]);
}
function bn(e, t) {
	let n = t.filter((e) => e.nodeType === Node.ELEMENT_NODE && e.tagName === "FIGURE"), r = t.filter((e) => e.nodeType === Node.ELEMENT_NODE && e.tagName === "FIGCAPTION");
	if (!n.length) return xn(r.flatMap((e) => [...e.childNodes]), "P");
	let [i, ...a] = n, o = e.getAttribute("data-size");
	return Kt.includes(o) && i.setAttribute("data-size", o), r.length && i.append(R("FIGCAPTION", {}, r.flatMap((e) => [...e.childNodes]))), [i, ...a];
}
function R(e, t = {}, n = []) {
	let r = document.createElement(e);
	return Object.entries(t).forEach(([e, t]) => r.setAttribute(e, t)), r.append(...n), r;
}
function xn(e, t, n = {}) {
	let r = [], i = [], a = () => {
		i.length && r.push(R(t, n, i)), i = [];
	};
	return e.forEach((e) => {
		L(e) ? (a(), r.push(e)) : i.push(e);
	}), a(), r;
}
function z(e, t, n = {}) {
	if (!t.some(L)) return [R(e, n, t)];
	let r = [], i = [], a = () => {
		i.length && r.push(R(e, n, i)), i = [];
	};
	return t.forEach((t) => {
		L(t) ? (a(), Sn(t, e, n), r.push(t)) : i.push(t);
	}), a(), r;
}
function Sn(e, t, n) {
	if (Gt.has(e.tagName)) return;
	if (M.has(e.tagName)) {
		[...e.children].forEach((e) => Sn(e, t, n));
		return;
	}
	let r = [...e.childNodes];
	e.replaceChildren(...z(t, r.filter((e) => !L(e)), n)), r.filter(L).forEach((r) => {
		Sn(r, t, n), e.append(r);
	});
}
function B(e, { keepLists: t = !1 } = {}) {
	let n = [], r = !1;
	return e.forEach((e) => {
		if (hn(e)) n.length && (r = !0);
		else if (e.nodeType === Node.ELEMENT_NODE && e.tagName === "PRE") n.length && n.push(document.createElement("br")), n.push(R("CODE", {}, [e.textContent.replace(/\n/g, " ")])), r = !0;
		else if (t && e.nodeType === Node.ELEMENT_NODE && M.has(e.tagName)) n.push(e), r = !1;
		else if (L(e)) {
			let t = M.has(e.tagName) ? [...e.children].flatMap((e, t) => [...t ? [document.createElement("br")] : [], ...B([...e.childNodes])]) : B([...e.childNodes]);
			n.length && n.push(document.createElement("br")), n.push(...t), r = !0;
		} else r && (e.nodeType !== Node.TEXT_NODE || e.data.trim()) && (n.push(document.createElement("br")), r = !1), n.push(e);
	}), n;
}
function Cn(e, t, n = {}) {
	switch (e) {
		case "P":
		case "H1":
		case "H2":
		case "H3":
		case "H4":
		case "H5":
		case "H6": return xn(t, e, n);
		case "BLOCKQUOTE": return [R("BLOCKQUOTE", n, B(t))];
		case "LI": return [R("LI", n, B(t, { keepLists: !0 }))];
		case "UL":
		case "OL": {
			let r = R(e, n), i = [], a = () => {
				i.some((e) => e.nodeType !== Node.TEXT_NODE || e.data.trim()) && r.append(R("LI", {}, i)), i = [];
			};
			return t.forEach((e) => {
				if (!L(e)) return i.push(e);
				a(), e.tagName === "LI" ? r.append(e) : M.has(e.tagName) ? (r.lastElementChild || r.appendChild(R("LI"))).append(e) : r.append(R("LI", {}, B([e])));
			}), a(), [r];
		}
		default: return t;
	}
}
var wn = "h1, h2, h3, h4, h5, h6", Tn = `p, ${wn}, blockquote, li, figcaption`;
function En(e) {
	Dn(e), e.querySelectorAll(Tn).forEach(kn), An(e), e.querySelectorAll(Tn).forEach(jn), Mn(e), Nn(e), In(e), e.normalize();
}
function V(e) {
	e.replaceWith(...e.childNodes);
}
function Dn(e) {
	[
		"B",
		"I",
		"A",
		"CODE",
		"U",
		"S"
	].forEach((t) => {
		e.querySelectorAll(`${t} ${t}`).forEach(V);
	}), e.querySelectorAll("a u").forEach(V), e.querySelectorAll(wn.split(", ").map((e) => `${e} b`).join(", ")).forEach(V);
}
function On(e) {
	let t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode(e) {
		return e.nodeType === Node.ELEMENT_NODE && M.has(e.tagName) ? NodeFilter.FILTER_REJECT : e.nodeType === Node.TEXT_NODE || e.tagName === "BR" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} }), n = [];
	for (; t.nextNode();) n.push(t.currentNode);
	return n;
}
function kn(e) {
	let t = On(e), n = !0;
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
function An(e) {
	let t = !0;
	for (; t;) t = !1, e.querySelectorAll(Pn()).forEach((e) => {
		!e.textContent && !e.querySelector("br") ? (e.remove(), t = !0) : !e.textContent.trim() && !e.querySelector("br") && e.tagName !== "A" && (V(e), t = !0);
	});
}
function jn(e) {
	let t = On(e).filter((e) => e.nodeType !== Node.TEXT_NODE || e.data), n = 0;
	for (; n < t.length && t[n].nodeName === "BR";) t[n++].remove();
	let r = t.length - 1;
	for (; r >= n && t[r].nodeName === "BR";) t[r--].remove();
	for (let e = n + 1; e <= r; e++) t[e].nodeName === "BR" && t[e - 1].nodeName === "BR" && t[e].remove();
}
function Mn(e) {
	[...e.querySelectorAll(`${Tn}, ul, ol`)].reverse().forEach((e) => {
		let t = On(e).some((e) => e.nodeType === Node.TEXT_NODE && e.data.trim()), n = M.has(e.tagName) ? !!e.querySelector("li") : !!e.querySelector("ul, ol");
		!t && !n && e.remove();
	});
}
function Nn(e) {
	e.querySelectorAll("figure, hr").forEach((t) => {
		if (t.parentNode !== e) return t.remove();
		t.tagName === "FIGURE" && !t.querySelector(":scope > img, :scope > iframe") && t.remove();
	}), e.querySelectorAll("img, iframe, figcaption").forEach((e) => {
		e.parentNode?.tagName !== "FIGURE" && e.remove();
	}), e.querySelectorAll("pre").forEach((t) => {
		t.parentNode !== e && t.replaceWith(R("CODE", {}, [t.textContent]));
	});
}
var Pn = () => [...Jt, ...N.allow.tags].join(", "), Fn = (e, t) => e.attributes.length === t.attributes.length && [...e.attributes].every((e) => t.getAttribute(e.name) === e.value);
function In(e) {
	e.querySelectorAll(Pn()).forEach((t) => {
		if (!e.contains(t)) return;
		let n = t.nextSibling;
		for (; n && n.nodeType === Node.ELEMENT_NODE && n.tagName === t.tagName && Fn(n, t);) t.append(...n.childNodes), n.remove(), n = t.nextSibling;
	});
}
function Ln(e) {
	return String(e).replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[e]);
}
function Rn(e) {
	let t = String(e || "").replace(/\r\n?/g, "\n").trim();
	return t ? t.split(/\n\s*\n/).map((e) => `<p>${Ln(e.trim()).replace(/\n/g, "<br>")}</p>`).join("") : "";
}
//#endregion
//#region src/core/model.js
var zn = {}, Bn = (e = !1) => zn[e] ||= s(tt({
	headings: [
		2,
		3,
		4,
		5,
		6
	],
	title: e
}));
function Vn(e, t = {}) {
	let n = F(e, {
		...t,
		headings: sn(t.headings)
	});
	return n ? a(Qe(n, !!t.title), t.schema || Bn(!!t.title)).toJSON() : {
		type: "doc",
		content: []
	};
}
function Hn(e, t = {}) {
	let n = t.schema || Bn(!!t.title), r = Un(e, n);
	if (!r || r.type !== "doc" || !r.content?.length) return "";
	try {
		return F(o(p.fromJSON(n, r).content, n), t);
	} catch {
		return "";
	}
}
function Un(e, t) {
	if (!e || typeof e != "object" || !t.nodes[e.type]) return null;
	if (e.type === "text") {
		if (typeof e.text != "string" || !e.text) return null;
		let n = Array.isArray(e.marks) ? e.marks.filter((e) => e && t.marks[e.type]).map(Wn) : [];
		return {
			type: "text",
			text: e.text,
			...n.length && { marks: n }
		};
	}
	let n = { type: e.type };
	return e.attrs && typeof e.attrs == "object" && (n.attrs = { ...e.attrs }), Array.isArray(e.content) && (n.content = e.content.map((e) => Un(e, t)).filter(Boolean)), n;
}
var Wn = (e) => ({
	type: e.type,
	...e.attrs && typeof e.attrs == "object" && { attrs: { ...e.attrs } }
});
//#endregion
//#region src/core/slug.js
function Gn(e, { maxLength: t = 80 } = {}) {
	let n = String(e ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	if (n.length <= t) return n;
	let r = n.slice(0, t + 1), i = r.lastIndexOf("-");
	return (i > 0 ? r.slice(0, i) : n.slice(0, t)).replace(/-+$/, "");
}
//#endregion
//#region src/core/editor.js
var Kn = {
	content: "",
	lang: "en",
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
	colors: Te,
	highlights: Ee,
	extensions: [],
	sanitize: null,
	upload: null,
	maxImageSize: 5242880,
	allowDataImages: !0
}, qn = {
	open: !1,
	query: "",
	items: [],
	index: 0,
	rect: null
}, Jn = [
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
], Yn = "  ", H = (e) => e.type.name === "image" || e.type.name === "embed";
function Xn(e) {
	let t = !1;
	return e.descendants((e) => !t && ((e.isText && e.text.trim() || w(e)) && (t = !0), !t)), t;
}
var Zn = (e) => e.childCount === 1 && e.firstChild.type.name === "paragraph" && e.firstChild.content.size === 0, Qn = class {
	constructor(e, t = {}) {
		if (!e) throw Error("[afwrite] Elemen editor tidak ditemukan.");
		this.el = e, this.options = {
			...Kn,
			...t
		}, this.options.headings = sn(this.options.headings), this.options.formats = De(this.options.formats, !!this.options.title), this.options.colors = Oe(this.options.colors, Te), this.options.highlights = Oe(this.options.highlights, Ee), this.strings = he(this.options.lang, this.options.strings), this.readOnly = !1, this.listeners = {}, this.commands = Bt, this.slash = { ...qn }, this._setup(this.options.content || e.innerHTML);
	}
	exec(e, ...t) {
		if (this.readOnly) return;
		if (e === "undo" || e === "redo") return this[e]();
		let n = this.commands[e];
		return n ? (this.hasFocus() || (this._selectedMediaNode() ? this.tiptap.view.focus() : this.focus()), this._syncSelection(), !this.isDisabled(e) && n.run(this, ...t)) : console.warn(`[afwrite] Perintah tidak dikenal: ${e}`);
	}
	isDisabled(e) {
		return this.hasFocus() && zt(this, e);
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
		return !Xn(this.tiptap.state.doc);
	}
	normalizeHTML(e) {
		let t = this._parse(F(e, this._sanitizeOptions()));
		return Xn(t) ? F(o(t.content, this.tiptap.schema), this._sanitizeOptions()) : "";
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
			align: j(this)
		};
	}
	getHTML() {
		return this.isEmpty() ? "" : F(this.tiptap.getHTML(), this._sanitizeOptions());
	}
	setHTML(e, { silent: t = !1, resetHistory: n = !0 } = {}) {
		let r = this._parse(F(e, this._sanitizeOptions())), { view: i } = this.tiptap;
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
		return this.tiptap.state.doc.descendants((t) => H(t) ? !1 : !t.isTextblock || (e.push(t.textBetween(0, t.content.size, "\n", "\n")), !1)), e.join("\n");
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
		let t = ln(e, {
			...this._sanitizeOptions(),
			title: !1
		});
		if (!t.childNodes.length) return;
		this.hasFocus() || this.focus();
		let { state: n, view: r } = this.tiptap, i = this._parseFragment(t.innerHTML);
		if (i.childCount === 1 && i.firstChild.type.name === "paragraph") {
			let t = new DOMParser().parseFromString(String(e), "text/html").body.textContent, a = i.firstChild.content;
			/^\s/.test(t) && (a = f.from(n.schema.text(" ")).append(a)), /\s$/.test(t) && (a = a.append(f.from(n.schema.text(" ")))), r.dispatch(n.tr.replaceSelection(new m(a, 0, 0)).scrollIntoView());
		} else i = nr(i), r.dispatch(n.tr.replaceSelection(m.maxOpen(i)).scrollIntoView());
	}
	insertText(e) {
		this._syncSelection();
		let t = String(e || "").replace(/\r\n?/g, "\n");
		if (t) {
			if (t.includes("\n")) this.insertHTML(Rn(t));
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
			let e = rr();
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
			if (H(n) || n.type.name === "codeBlock") return !1;
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
			slug: Gn(n)
		};
	}
	getJSON() {
		return Vn(this.getHTML(), {
			...this._sanitizeOptions(),
			schema: this.tiptap.schema
		});
	}
	setJSON(e, t) {
		this.setHTML(Hn(e, {
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
		clearTimeout(this._autosaveTimer), this._autosaveKey && ar("remove", this._autosaveKey);
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
		return dt(this, e);
	}
	selectMedia(e) {
		if (this.readOnly) return;
		let { state: t, view: n } = this.tiptap, r = typeof e == "number" ? e : this._posOfDOM(e);
		r != null && w(t.doc.nodeAt(r)) && (n.focus(), n.dispatch(t.tr.setSelection(h.create(t.doc, r))));
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
		let { node: t } = e, n = t.type.name === "image";
		return {
			kind: rt(t),
			size: t.attrs.size || "normal",
			alt: t.attrs.alt || "",
			src: n && t.attrs.src || null,
			mediaId: n && t.attrs.mediaId || null
		};
	}
	replaceMedia(e) {
		if (!this.readOnly) return xt(this, e);
	}
	setMediaSize(e) {
		this._updateMedia((t) => t.type.name !== "horizontalRule" && { size: nt.includes(e) ? e : null });
	}
	setMediaAlt(e) {
		this._updateMedia((t) => t.type.name === "image" && { alt: String(e || "").trim() });
	}
	removeMedia() {
		let e = this._selectedMediaNode();
		if (!e) return;
		let { state: t, view: n } = this.tiptap, r = t.tr.delete(e.pos, e.pos + e.node.nodeSize), i = r.doc.resolve(e.pos), a = i.nodeAfter, o = i.nodeBefore;
		a && !w(a) ? r.setSelection(g.findFrom(i, 1, !0) || g.near(i)) : o && !w(o) ? r.setSelection(g.findFrom(i, -1, !0) || g.near(i)) : a ? r.setSelection(h.create(r.doc, e.pos)) : (r.insert(e.pos, t.schema.nodes.paragraph.create()), r.setSelection(_.create(r.doc, e.pos + 1))), n.dispatch(r.scrollIntoView());
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
		let { state: t, view: n } = this.tiptap, { doc: r, selection: i } = t, a = i.$from.index(0), o = this.options.title ? C(r) : -1, s = o < 0 ? 0 : o + (r.maybeChild(o + 1)?.type.name === "subtitle" ? 2 : 1), c = a + e;
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
		e && (this._slashDismissed = this._slashContext()?.from ?? null), this.slash.open && (this.slash = { ...qn }, this.emit("slash", this.slash));
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
		if (a.type.name === "codeBlock" || H(a) && !(r.selection instanceof h)) {
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
			addCommands: () => ({ insertMediaBlock: ot }),
			addInputRules() {
				return i.markdown ? Ut(this.editor.schema, i.headings) : [];
			},
			addProseMirrorPlugins: () => [
				$n(),
				tr(),
				...i.title ? [er(this.strings)] : []
			]
		});
		if (this.tiptap = new e({
			element: { mount: r },
			extensions: [
				...tt({
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
				transformPastedHTML: (e) => F(e, {
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
		return Qe(F(e, this._sanitizeOptions()) || "<p></p>", this.options.title);
	}
	_parse(e) {
		let t = a(Qe(e || "<p></p>", this.options.title), this.tiptap.schema);
		return w(t.lastChild) ? t.copy(t.content.append(f.from(this.tiptap.schema.nodes.paragraph.create()))) : t;
	}
	_startSelection(e) {
		return !this.options.title || !C(e) ? g.atStart(e) : _.create(e, et(e) + 1);
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
			let e = 0, t = C(o.doc);
			for (let n = 0; n <= t; n++) e += o.doc.child(n).nodeSize;
			o.doc.maybeChild(t + 1)?.type.name === "subtitle" && (e += o.doc.child(t + 1).nodeSize);
			let n = this._parseFragment(F(Rn(a), {
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
		return Zn(e.doc) && t.push("afw-is-empty"), this.readOnly && t.push("afw-is-readonly"), {
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
			let e = JSON.parse(ar("get", this._autosaveKey) || "null");
			e?.html && e.html !== this.getHTML() && (this.draft = e);
		} catch {}
	}
	_scheduleDraftSave() {
		this._autosaveKey && !this.draft && (clearTimeout(this._autosaveTimer), this._autosaveTimer = setTimeout(() => this._saveDraft(), this._autosaveDelay));
	}
	_saveDraft() {
		if (!this._autosaveKey || this.draft) return;
		let e = this.getHTML();
		e ? ar("set", this._autosaveKey, JSON.stringify({
			html: e,
			time: Date.now()
		})) : ar("remove", this._autosaveKey);
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
	_blockStrings() {
		let { blocks: e } = this.strings;
		return !this.listeners.imagerequest?.length || !e.imageRequest ? this.strings : {
			...this.strings,
			blocks: {
				...e,
				image: e.imageRequest
			}
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
		return e instanceof h && w(e.node) ? {
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
		if (this.readOnly || !w(e) || n.target.closest?.("figcaption")) return !1;
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
		return a && a.rect.top <= e || !w((i === -1 ? r[r.length - 1] : r[i - 1])?.node) && !w(a?.node) ? !1 : (this._insertParagraphAt(a ? a.offset : t.doc.content.size), !0);
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
		w(s) ? i.dispatch(r.tr.setSelection(h.create(r.doc, n < 0 ? a - s.nodeSize : a))) : s ? i.dispatch(r.tr.setSelection(g.findFrom(o, n, !0) || g.near(o, n)).scrollIntoView()) : this._insertParagraphAt(a);
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
		if (H(a)) {
			if (e.key === "Enter") {
				let e = i.after(), r = t.doc.nodeAt(e);
				return r && !w(r) ? n.dispatch(t.tr.setSelection(g.findFrom(t.doc.resolve(e), 1, !0)).scrollIntoView()) : this._insertParagraphAt(e), !0;
			}
			return e.key === "Backspace" && o || e.key === "Delete" && s;
		}
		if (i.depth !== 1 || !a.isTextblock) return !1;
		let c = e.key === "Backspace" && o, l = e.key === "Delete" && s;
		if (!c && !l) return !1;
		let u = t.doc.resolve(c ? i.before() : i.after()), d = c ? u.nodeBefore : u.nodeAfter;
		if (!w(d)) return !1;
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
			if (!e.shiftKey) n.dispatch(t.tr.insertText(Yn, i, a));
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
		let i = Jn.find((t) => t.code === e.code && !!t.alt === e.altKey && !!t.shift === e.shiftKey);
		return !i || !jt(this.options.formats, i.command) ? !1 : (this.exec(i.command), !0);
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
		let n = t[1], r = ve(n, this._blocks(), this._blockStrings()), i = this.slash.open && this.slash.query === n;
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
		let { $from: r, empty: i } = e.selection, a = r.parent, o = ir(this.el, "a"), s = r.depth === 1 && !a.content.size && ["paragraph", "title"].includes(a.type.name);
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
function $n() {
	return new te({ props: { decorations(e) {
		let { selection: t } = e, n = [];
		return t instanceof h && w(t.node) ? n.push(ne.node(t.from, t.to, { class: "afw-is-selected" })) : H(t.$from.parent) && n.push(ne.node(t.$from.before(), t.$from.after(), { class: "afw-is-editing" })), re.create(e.doc, n);
	} } });
}
function er(e) {
	return new te({ props: { decorations(t) {
		let { doc: n } = t, r = [], i = (e, t, n) => r.push(ne.node(e, e + t.nodeSize, n)), a = (e) => e.content.size ? {} : { class: "afw-is-empty" }, o = C(n), s = et(n), c = n.child(o);
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
function tr() {
	return new te({ appendTransaction(e, t, n) {
		return !e.some((e) => e.docChanged) || !w(n.doc.lastChild) ? null : n.tr.insert(n.doc.content.size, n.schema.nodes.paragraph.create());
	} });
}
function nr(e) {
	let t = e;
	for (; t.childCount > 1 && t.lastChild.type.name === "paragraph" && !t.lastChild.content.size;) t = t.cut(0, t.size - t.lastChild.nodeSize);
	return t;
}
function rr() {
	let e = window.getSelection();
	return e && e.rangeCount ? e.getRangeAt(0) : null;
}
function ir(e, t) {
	let n = rr();
	if (!n || !e.contains(n.startContainer)) return null;
	let r = n.startContainer;
	r.nodeType !== Node.ELEMENT_NODE && (r = r.parentElement);
	let i = r?.closest(t);
	return i && i !== e && e.contains(i) ? i : null;
}
function ar(e, t, n) {
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
var U = (e) => `<svg class="afw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`, W = {
	undo: U("<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10.5a5.5 5.5 0 0 1 0 11H11\"/>"),
	redo: U("<path d=\"m15 14 5-5-5-5\"/><path d=\"M20 9H9.5a5.5 5.5 0 0 0 0 11H13\"/>"),
	codeblock: U("<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>"),
	image: U("<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>"),
	embed: U("<path d=\"m22 8-6 4 6 4V8Z\"/><rect width=\"14\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" ry=\"2\"/>"),
	hr: U("<path d=\"M3 12h18\"/><path d=\"M8 6h8\" opacity=\".35\"/><path d=\"M8 18h8\" opacity=\".35\"/>"),
	sizeNormal: U("<path d=\"M3 3h18\"/><path d=\"M3 21h18\"/><rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"1.5\"/>"),
	sizeWide: U("<path d=\"M3 3h18\"/><path d=\"M3 21h18\"/><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"1.5\"/>"),
	sizeFull: U("<path d=\"M3 3h18\"/><path d=\"M3 21h18\"/><rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"1.5\"/>"),
	replace: U("<path d=\"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/><path d=\"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16\"/><path d=\"M16 16h5v5\"/>"),
	alt: U("<path d=\"M17 6.1H3\"/><path d=\"M21 12.1H3\"/><path d=\"M15.1 18H3\"/>"),
	trash: U("<path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/>"),
	paragraph: U("<polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/>"),
	plus: U("<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>"),
	check: U("<path d=\"M20 6 9 17l-5-5\"/>"),
	close: U("<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>"),
	edit: U("<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/>"),
	external: U("<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>"),
	unlink: U("<path d=\"m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71\"/><path d=\"m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71\"/><line x1=\"8\" x2=\"8\" y1=\"2\" y2=\"5\"/><line x1=\"2\" x2=\"5\" y1=\"8\" y2=\"8\"/><line x1=\"16\" x2=\"16\" y1=\"19\" y2=\"22\"/><line x1=\"19\" x2=\"22\" y1=\"16\" y2=\"16\"/>"),
	bold: U("<path d=\"M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8\"/>"),
	underline: U("<path d=\"M6 4v6a6 6 0 0 0 12 0V4\"/><line x1=\"4\" x2=\"20\" y1=\"20\" y2=\"20\"/>"),
	strike: U("<path d=\"M16 4H9a3 3 0 0 0-2.83 4\"/><path d=\"M14 12a4 4 0 0 1 0 8H6\"/><line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\"/>"),
	color: U("<path d=\"M4 20h16\"/><path d=\"m6 16 6-12 6 12\"/><path d=\"M8 12h8\"/>"),
	highlight: U("<path d=\"m9 11-6 6v3h9l3-3\"/><path d=\"m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4\"/>"),
	alignLeft: U("<path d=\"M21 5H3\"/><path d=\"M15 12H3\"/><path d=\"M17 19H3\"/>"),
	alignCenter: U("<path d=\"M21 5H3\"/><path d=\"M17 12H7\"/><path d=\"M19 19H5\"/>"),
	alignRight: U("<path d=\"M21 5H3\"/><path d=\"M21 12H9\"/><path d=\"M21 19H7\"/>"),
	alignJustify: U("<path d=\"M3 5h18\"/><path d=\"M3 12h18\"/><path d=\"M3 19h18\"/>"),
	italic: U("<line x1=\"19\" y1=\"4\" x2=\"10\" y2=\"4\"/><line x1=\"14\" y1=\"20\" x2=\"5\" y2=\"20\"/><line x1=\"15\" y1=\"4\" x2=\"9\" y2=\"20\"/>"),
	link: U("<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>"),
	h2: U("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1\"/>"),
	h3: U("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2\"/><path d=\"M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2\"/>"),
	headingLarge: U("<path d=\"M5 7V5h14v2\"/><path d=\"M12 5v14\"/><path d=\"M9.5 19h5\"/>"),
	headingSmall: U("<path d=\"M8 12v-1.5h8V12\"/><path d=\"M12 10.5V19\"/><path d=\"M10.5 19h3\"/>"),
	grip: U("<circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>"),
	h4: U("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M17 10v3a1 1 0 0 0 1 1h3\"/><path d=\"M21 10v8\"/>"),
	h5: U("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><path d=\"M17 13v-3h4\"/><path d=\"M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17\"/>"),
	h6: U("<path d=\"M4 12h8\"/><path d=\"M4 18V6\"/><path d=\"M12 18V6\"/><circle cx=\"19\" cy=\"16\" r=\"2\"/><path d=\"M20 10c-2 2-3 3.5-3 6\"/>"),
	quote: U("<path d=\"M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z\"/><path d=\"M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z\"/>"),
	ul: U("<line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"/><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"/><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"/><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"/>"),
	ol: U("<line x1=\"10\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"10\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"10\" y1=\"18\" x2=\"21\" y2=\"18\"/><path d=\"M4 6h1v4\"/><path d=\"M4 10h2\"/><path d=\"M6 18H4c0-1 2-2 2-3s-1-1.5-2-1\"/>")
}, or = typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform), G = or ? "⌘" : "Ctrl+", K = or ? "⌥" : "Alt+", q = or ? "⇧" : "Shift+", sr = [
	[
		{
			command: "bold",
			shortcut: `${G}B`
		},
		{
			command: "italic",
			shortcut: `${G}I`
		},
		{
			command: "underline",
			shortcut: `${G}U`
		},
		{
			command: "link",
			shortcut: `${G}K`
		}
	],
	[
		{
			command: "h2",
			shortcut: `${G}${K}2`
		},
		{
			command: "h3",
			shortcut: `${G}${K}3`
		},
		{
			command: "quote",
			shortcut: `${G}${q}9`
		}
	],
	[{
		command: "color",
		shortcut: ""
	}, {
		command: "align",
		shortcut: ""
	}]
], cr = [
	[
		{
			command: "bold",
			shortcut: `${G}B`
		},
		{
			command: "italic",
			shortcut: `${G}I`
		},
		{
			command: "underline",
			shortcut: `${G}U`
		},
		{
			command: "strike",
			shortcut: `${G}${q}X`
		},
		{
			command: "link",
			shortcut: `${G}K`
		}
	],
	[
		{
			command: "h2",
			shortcut: `${G}${K}2`
		},
		{
			command: "h3",
			shortcut: `${G}${K}3`
		},
		{
			command: "quote",
			shortcut: `${G}${q}9`
		},
		{
			command: "codeblock",
			shortcut: `${G}${K}C`
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
		shortcut: `${G}${q}8`
	}, {
		command: "ol",
		shortcut: `${G}${q}7`
	}],
	[{
		command: "undo",
		shortcut: `${G}Z`
	}, {
		command: "redo",
		shortcut: `${G}${q}Z`
	}]
], lr = [
	{
		command: "alignLeft",
		shortcut: `${G}${q}L`
	},
	{
		command: "alignCenter",
		shortcut: `${G}${q}E`
	},
	{
		command: "alignRight",
		shortcut: `${G}${q}R`
	},
	{
		command: "alignJustify",
		shortcut: `${G}${q}J`
	}
];
function ur(e, t) {
	return e.map((e) => e.filter((e) => jt(t, e.command))).filter((e) => e.length);
}
var dr = (e) => ({
	command: `h${e}`,
	shortcut: `${G}${K}${e}`
}), fr = (e) => /^h[2-6]$/.test(e.command);
function pr(e, t, n = Infinity) {
	return e.map((e) => e.flatMap((r, i) => fr(r) ? e.findIndex(fr) === i ? t.slice(0, n).map(dr) : [] : [r]));
}
//#endregion
//#region src/ui/template.js
var mr = "\n<div class=\"afw-toolbar\" role=\"toolbar\"></div>\n\n<div class=\"afw-draft\" role=\"status\" style=\"display: none\">\n  <span class=\"afw-draft-text\"></span>\n  <button type=\"button\" class=\"afw-draft-btn afw-draft-primary\" data-afw-action=\"restoreDraft\" data-afw-text=\"draftRestore\"></button>\n  <button type=\"button\" class=\"afw-draft-btn\" data-afw-action=\"discardDraft\" data-afw-text=\"draftDiscard\"></button>\n</div>\n\n<div class=\"afw-body\">\n  <div data-afw-editor></div>\n  <button type=\"button\" class=\"afw-handle\" draggable=\"true\" tabindex=\"-1\" data-afw-label=\"dragBlock\" data-afw-icon=\"grip\"></button>\n  <button type=\"button\" class=\"afw-plus\" data-afw-label=\"addBlock\" data-afw-icon=\"plus\"></button>\n</div>\n\n<div class=\"afw-footer\" style=\"display: none\">\n  <span class=\"afw-stats-words\"></span>\n  <span aria-hidden=\"true\">·</span>\n  <span class=\"afw-stats-minutes\"></span>\n</div>\n\n<div class=\"afw-bubble afw-bubble-main\" role=\"toolbar\">\n  <div class=\"afw-bubble-row afw-bubble-format\"></div>\n\n  <!-- Bukan elemen form: editor biasanya berada di dalam form halaman, dan form\n       bertingkat dibuang browser. Enter ditangani langsung di input. -->\n  <div class=\"afw-bubble-row afw-link-form\">\n    <input type=\"text\" class=\"afw-link-input\" autocomplete=\"off\" spellcheck=\"false\">\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse\" data-afw-action=\"applyInput\" data-afw-label=\"save\" data-afw-key=\"Enter\" data-afw-icon=\"check\"></button>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse afw-link-remove\" data-afw-action=\"removeLink\" data-afw-label=\"removeLink\" data-afw-icon=\"unlink\"></button>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse\" data-afw-action=\"cancelInput\" data-afw-label=\"cancel\" data-afw-key=\"Esc\" data-afw-icon=\"close\"></button>\n    <span class=\"afw-link-error\" style=\"display: none\"></span>\n  </div>\n\n  <div class=\"afw-bubble-row afw-bubble-linkinfo\">\n    <a class=\"afw-link-preview\" target=\"_blank\" rel=\"noopener noreferrer\">\n      <span class=\"afw-link-href\"></span>\n      <span class=\"afw-link-preview-icon\" data-afw-icon=\"external\"></span>\n    </a>\n    <span class=\"afw-sep\"></span>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse\" data-afw-action=\"editLink\" data-afw-label=\"editLink\" data-afw-icon=\"edit\"></button>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse\" data-afw-action=\"unlink\" data-afw-label=\"removeLink\" data-afw-icon=\"unlink\"></button>\n  </div>\n</div>\n\n<div class=\"afw-bubble afw-mediabar\" role=\"toolbar\" data-afw-label=\"mediaToolbarLabel\">\n  <div class=\"afw-bubble-row\">\n    <div class=\"afw-group afw-media-sizes\"></div>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse afw-media-image\" data-afw-action=\"replaceImage\" data-afw-label=\"replaceImage\" data-afw-icon=\"replace\"></button>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse afw-media-image afw-media-alt\" data-afw-action=\"editAlt\" data-afw-label=\"altText\" data-afw-icon=\"alt\"></button>\n    <button type=\"button\" class=\"afw-btn afw-btn-inverse\" data-afw-action=\"removeMedia\" data-afw-label=\"removeMedia\" data-afw-key=\"Backspace\" data-afw-icon=\"trash\"></button>\n  </div>\n</div>\n\n<div class=\"afw-bubble afw-pop\" role=\"toolbar\">\n  <div class=\"afw-bubble-row afw-pop-align\"></div>\n  <div class=\"afw-pop-colors\"></div>\n</div>\n\n<div class=\"afw-toast\" role=\"status\" aria-live=\"polite\"></div>\n\n<!-- Slash menu: item dipasang di antara judul dan pesan kosong. -->\n<div class=\"afw-menu\" role=\"listbox\" data-afw-label=\"blocksTitle\">\n  <div class=\"afw-menu-title\" data-afw-text=\"blocksTitle\"></div>\n  <div class=\"afw-menu-empty\" data-afw-text=\"noResults\" style=\"display: none\"></div>\n</div>\n";
//#endregion
//#region src/ui/dom.js
function J(e, t = {}, n = []) {
	let r = document.createElement(e);
	for (let [e, n] of Object.entries(t)) Y(r, e, n);
	for (let e of [].concat(n)) e != null && e !== !1 && r.append(e);
	return r;
}
function Y(e, t, n) {
	n == null || n === !1 ? e.removeAttribute(t) : e.getAttribute(t) !== String(n) && e.setAttribute(t, n);
}
function X(e, t) {
	e.style.display = t ? "" : "none";
}
function Z(e, t) {
	let n = String(t ?? "");
	e.textContent !== n && (e.textContent = n);
}
function hr(e, t) {
	e._afwHTML !== t && (e._afwHTML = t, e.innerHTML = t);
}
function gr(e, t, n, r) {
	return e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r);
}
var Q = (e) => e.preventDefault(), _r = 10, $ = 8, vr = () => typeof matchMedia < "u" && matchMedia("(pointer: coarse)").matches;
function yr() {
	let e = typeof window < "u" && window.visualViewport;
	return !!e && window.innerHeight - e.height > 120;
}
function br() {
	let e = typeof window < "u" && window.visualViewport;
	return e ? {
		left: e.offsetLeft,
		top: e.offsetTop,
		right: e.offsetLeft + e.width,
		bottom: e.offsetTop + e.height
	} : {
		left: 0,
		top: 0,
		right: window.innerWidth,
		bottom: window.innerHeight
	};
}
function xr(e, t, n, { prefer: r = "above", align: i = "center", gap: a = _r } = {}) {
	let o = e.getBoundingClientRect(), s = br(), c = t.offsetWidth, l = t.offsetHeight, u = i === "center" ? n.left + n.width / 2 - c / 2 : n.left;
	u = Math.max(s.left + $, Math.min(u, s.right - c - $));
	let d = n.top - l - a, f = n.bottom + a, p = d >= s.top + $, m = f + l <= s.bottom - $, ee = r === "above" ? p || !m ? d : f : m || !p ? f : d;
	return {
		x: Math.round(u - o.left),
		y: Math.round(ee - o.top)
	};
}
function Sr(e, t, n) {
	let r = br(), i = Cr(e), a = i ? i.getBoundingClientRect() : r, o = Math.max(r.top, a.top) + $, s = Math.min(r.bottom, a.bottom) - $, c = Math.ceil(Math.min(n - s, t - o));
	return c <= 0 ? !1 : (i ? i.scrollTop += c : window.scrollBy(0, c), !0);
}
function Cr(e) {
	for (let t = e.parentElement; t && t !== document.body; t = t.parentElement) {
		let { overflowY: e } = getComputedStyle(t);
		if (/(auto|scroll)/.test(e) && t.scrollHeight > t.clientHeight) return t;
	}
	return null;
}
function wr(e, t) {
	return Math.max(2, Math.round(e.left - t.left - 30));
}
//#endregion
//#region src/afwrite.js
var Tr = {
	image: null,
	title: "",
	subtitle: "",
	slug: ""
}, Er = {
	color: null,
	highlight: null,
	align: null
}, Dr = {
	link: "inputLink",
	embed: "inputEmbed",
	alt: "inputAlt"
}, Or = [
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
], kr = ["color", "align"], Ar = 4e3, jr = 350, Mr = /* @__PURE__ */ new WeakMap(), Nr = 0;
function Pr(e, t = {}, n = {}) {
	let r = typeof e == "string" ? document.querySelector(e) : e;
	if (!r) throw Error("[afwrite] Elemen editor tidak ditemukan.");
	if (Mr.has(r)) return console.warn("[afwrite] Elemen ini sudah berisi editor; instance yang ada dikembalikan."), Mr.get(r);
	let i = new Fr(r, t, n);
	return Mr.set(r, i), i;
}
var Fr = class {
	constructor(e, t, n) {
		this.root = e, this.options = t, this.internal = n, this.strings = he(t.lang, t.strings), this.headings = sn(t.headings), this.formats = De(t.formats, !!t.title), this.listeners = {}, this.cleanups = [], this.html = "", this.active = {}, this.disabled = {}, this.values = { ...Er }, this.readOnly = !!t.readonly, this.canUndo = !1, this.canRedo = !1, this.draft = null, this.stats = {
			words: 0,
			minutes: 0
		}, this.meta = { ...Tr }, this.name = t.name || "", this.titleName = t.titleName || "", this.format = t.format === "json" ? "json" : "html", this.showToolbar = t.toolbar ?? !0, this.showBubble = t.bubble ?? !0, this.showStats = t.stats ?? !0, this.toolbarItems = ur(t.toolbarItems || pr(cr, this.headings), this.formats), this.bubbleItems = ur(t.bubbleItems || pr(sr, this.headings, 2), this.formats), this.toast = {
			open: !1,
			message: ""
		}, this.bubble = {
			open: !1,
			ready: !1,
			pinned: !1,
			mode: "format",
			purpose: "link",
			x: 0,
			y: 0,
			url: "",
			href: "",
			hasLink: !1,
			error: ""
		}, this.media = {
			open: !1,
			ready: !1,
			x: 0,
			y: 0,
			kind: "image",
			size: "normal",
			alt: "",
			src: null,
			mediaId: null
		}, this.pop = {
			open: !1,
			ready: !1,
			kind: "",
			x: 0,
			y: 0
		}, this.slash = {
			open: !1,
			ready: !1,
			items: [],
			index: 0,
			x: 0,
			y: 0
		}, this.plus = {
			visible: !1,
			x: 2,
			y: 0
		}, this.handle = {
			visible: !1,
			x: 2,
			y: 0,
			pos: null
		}, this.dragging = !1, this.uid = `afw-${++Nr}`, this.savedRange = null, this.inputBusy = !1, this.popTrigger = null, this.popSelection = "", this._mount();
	}
	exec(e, ...t) {
		return this.editor?.exec(e, ...t);
	}
	insertImage(e) {
		this.editor?.exec("image", e);
	}
	replaceImage(e) {
		this.editor?.exec("replaceImage", e);
	}
	isActive(e) {
		return !!this.active[e];
	}
	isDisabled(e) {
		return e === "undo" ? !this.canUndo : e === "redo" ? !this.canRedo : !!this.disabled[e];
	}
	getHTML() {
		return this.editor?.getHTML() || "";
	}
	setHTML(e) {
		this.editor?.setHTML(e);
	}
	getJSON() {
		return this.editor?.getJSON();
	}
	setJSON(e) {
		this.editor?.setJSON(e);
	}
	getMeta() {
		return this.editor?.getMeta() ?? { ...Tr };
	}
	setReadOnly(e = !0) {
		this.editor?.setReadOnly(e);
	}
	focus() {
		this.editor?.focus();
	}
	restoreDraft() {
		this.editor.restoreDraft(), this.draft = null, this.render();
	}
	discardDraft() {
		this.editor.discardDraft(), this.draft = null, this.render();
	}
	t(e) {
		return this.strings[e] ?? e;
	}
	on(e, t) {
		return (this.listeners[e] ||= []).push(t), () => this.off(e, t);
	}
	off(e, t) {
		this.listeners[e] = (this.listeners[e] || []).filter((e) => e !== t);
	}
	destroy() {
		this.editor && (clearTimeout(this.toastTimer), clearTimeout(this.revealTimer), cancelAnimationFrame(this.viewportFrame), this.cleanups.forEach((e) => e()), this.cleanups = [], this.editor.destroy(), this.editor = null, this.listeners = {}, this.injected && this.internal.restore !== !1 && (this.root.innerHTML = this.initialMarkup), this.addedClass && this.root.classList.remove("afw"), Mr.delete(this.root));
	}
	_mount() {
		let { root: e, options: t } = this;
		this.addedClass = !e.classList.contains("afw"), e.classList.add("afw");
		let n = e.querySelector("[data-afw-editor]"), r = t;
		n || (this.initialMarkup = e.innerHTML, this.injected = !0, e.innerHTML = mr, n = e.querySelector("[data-afw-editor]"), r = {
			...t,
			content: t.content ?? this.initialMarkup
		}, this._buildUI());
		for (let t of this.injected ? e.children : [n]) Lr(t);
		let i = this.editor = new Qn(n, r);
		this.meta = i.getMeta(), i.on("change", (e) => {
			this.html = e, this.handle.visible = !1, this.stats = i.stats(), this.meta = i.getMeta(), this.render(), this._emit("change", {
				html: e,
				meta: this.meta
			});
		}), i.on("history", ({ canUndo: e, canRedo: t }) => {
			this.canUndo = e, this.canRedo = t, this.render();
		}), i.on("readonly", (e) => {
			this.readOnly = e, e && (this.closeBubble(), this.hideMediaBar(), this.plus.visible = !1, this.handle.visible = !1), this.render();
		}), i.on("state", (e) => {
			this.active = e, this.disabled = i.disabledState(), this.values = i.formatValues(), this.render();
		}), i.on("focus", () => this._emit("focus")), i.on("blur", () => this._emit("blur")), this.ui && (i.on("selection", (e) => this._onSelection(e)), i.on("slash", (e) => this._onSlash(e)), i.on("linkrequest", ({ href: e }) => this.openInput("link", e)), i.on("embedrequest", () => this.openInput("embed"))), t.imageRequest && i.on("imagerequest", (e) => this._emit("image-request", e)), i.on("error", (e) => {
			this.showToast(e.message), this._emit("error", e);
		}), this.html = i.getHTML(), this.stats = i.stats(), this.canUndo = i.canUndo(), this.canRedo = i.canRedo(), this.draft = i.draft || null, this.readOnly = i.readOnly, this.active = i.state(), this.disabled = i.disabledState(), this.values = i.formatValues();
		let a = e.closest("form");
		a && this.cleanups.push(gr(a, "submit", () => {
			this.draft && i.discardDraft(), i.clearDraft();
		})), this.ui && this._buildPalette(), this.render(), this._initToolbarFocus(), queueMicrotask(() => this.editor && this._emit("ready", { editor: i }));
	}
	_emit(e, t) {
		(this.listeners[e] || []).forEach((e) => e(t)), this.root.dispatchEvent(new CustomEvent(`wysiwyg-${e}`, {
			detail: t,
			bubbles: !0
		}));
	}
	_buildUI() {
		let { root: e } = this, t = (t) => e.querySelector(`:scope > ${t}`), n = t(".afw-bubble-main"), r = t(".afw-pop"), i = this.ui = {
			toolbar: t(".afw-toolbar"),
			draft: t(".afw-draft"),
			draftText: e.querySelector(".afw-draft-text"),
			footer: t(".afw-footer"),
			words: e.querySelector(".afw-stats-words"),
			minutes: e.querySelector(".afw-stats-minutes"),
			toast: t(".afw-toast"),
			handle: e.querySelector(".afw-body > .afw-handle"),
			plus: e.querySelector(".afw-body > .afw-plus"),
			bubble: n,
			bubbleFormat: n.querySelector(".afw-bubble-format"),
			linkForm: n.querySelector(".afw-link-form"),
			linkInput: n.querySelector(".afw-link-input"),
			linkRemove: n.querySelector(".afw-link-remove"),
			linkError: n.querySelector(".afw-link-error"),
			linkInfo: n.querySelector(".afw-bubble-linkinfo"),
			linkPreview: n.querySelector(".afw-link-preview"),
			linkHref: n.querySelector(".afw-link-href"),
			mediabar: t(".afw-mediabar"),
			mediaSizes: e.querySelector(".afw-media-sizes"),
			mediaImage: [...e.querySelectorAll(".afw-media-image")],
			mediaAlt: e.querySelector(".afw-media-alt"),
			pop: r,
			popAlign: r.querySelector(".afw-pop-align"),
			popColors: r.querySelector(".afw-pop-colors"),
			body: t(".afw-body"),
			menu: t(".afw-menu"),
			menuEmpty: e.querySelector(".afw-menu-empty"),
			inputs: []
		}, a = (e, t, n, r) => this.cleanups.push(gr(e, t, n, r));
		for (let t of e.querySelectorAll("[data-afw-label]")) {
			let e = this.t(t.dataset.afwLabel);
			Y(t, "aria-label", e), t.tagName === "BUTTON" && Y(t, "title", t.dataset.afwKey ? `${e} (${t.dataset.afwKey})` : e);
		}
		for (let t of e.querySelectorAll("[data-afw-icon]")) hr(t, W[t.dataset.afwIcon]);
		for (let t of e.querySelectorAll("[data-afw-text]")) Z(t, this.t(t.dataset.afwText));
		for (let t of e.querySelectorAll("[data-afw-action]")) t.closest(".afw-bubble") && a(t, "mousedown", Q), a(t, "click", () => this[t.dataset.afwAction]());
		Y(i.toolbar, "aria-label", this.t("toolbarLabel")), Y(i.bubble, "aria-label", this.t("toolbarLabel")), this.toolbarButtons = this._buttonGroups(i.toolbar, this.toolbarItems), this.bubbleButtons = this._buttonGroups(i.bubbleFormat, this.bubbleItems, "afw-btn-inverse"), a(i.toolbar, "keydown", (e) => this._toolbarKey(e)), a(i.bubble, "keydown", (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), this.cancelInput());
		}), a(i.linkInput, "input", () => {
			this.bubble.url = i.linkInput.value, this.bubble.error = "", this.render();
		}), a(i.linkInput, "keydown", (e) => {
			e.key === "Enter" && (e.preventDefault(), this.applyInput());
		}), a(i.linkInput, "blur", () => this._onInputBlur()), a(i.linkPreview, "mousedown", Q), this.mediaSizeButtons = Or.map((e) => ({
			el: this._button(e.label, "", e.icon, () => this.setMediaSize(e.value)),
			value: e.value
		})), i.mediaSizes.append(...this.mediaSizeButtons.map((e) => e.el), J("span", { class: "afw-sep" })), this.alignButtons = lr.map((e) => ({
			el: this._button(e.command, e.shortcut, e.command, () => this._applyPop(e.command)),
			command: e.command
		})), i.popAlign.append(...this.alignButtons.map((e) => e.el)), a(i.pop, "keydown", (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), this._closePop(!0));
		}), a(e, "keydown", (e) => {
			e.key === "Escape" && this.pop.open && (e.preventDefault(), e.stopPropagation(), this._closePop());
		}, !0), a(document, "mousedown", (e) => {
			this.pop.open && !i.pop.contains(e.target) && !this.popTrigger?.contains(e.target) && this._closePop();
		}, !0), Y(i.menu, "id", `${this.uid}-menu`), this.menuItems = [], a(i.plus, "mousedown", Q), a(i.plus, "click", () => this.openBlockMenu()), a(i.body, "mousemove", (e) => this._onBodyHover(e)), a(i.body, "mouseleave", () => this._hideHandle()), a(i.handle, "click", () => this._selectHandleBlock()), a(i.handle, "dragstart", (e) => this._startBlockDrag(e)), a(i.handle, "dragend", () => this._endBlockDrag());
		let o = () => this.dragging && this._endBlockDrag();
		if (a(document, "drop", o, !0), a(document, "dragend", o, !0), window.visualViewport) {
			let e = () => {
				cancelAnimationFrame(this.viewportFrame), this.viewportFrame = requestAnimationFrame(() => this._onViewportChange());
			};
			a(window.visualViewport, "resize", e), a(window.visualViewport, "scroll", e);
		}
		this.name && i.inputs.push(["content", e.appendChild(J("input", {
			type: "hidden",
			name: this.name
		}))]), this.titleName && i.inputs.push(["title", e.appendChild(J("input", {
			type: "hidden",
			name: this.titleName
		}))]);
	}
	_buildPalette() {
		let { editor: e, ui: t } = this, n = [{
			command: "color",
			label: "textColor",
			none: "defaultColor",
			colors: e.options.colors
		}, {
			command: "highlight",
			label: "highlight",
			none: "noHighlight",
			colors: e.options.highlights
		}].filter((e) => this.formats.includes(e.command) && e.colors.length);
		this.swatches = [];
		for (let e of n) {
			let n = this.t(e.label), r = this.t(e.none), i = (t, n) => {
				let r = this._button(null, "", null, () => this._applyPop(e.command, t), n);
				return this.swatches.push({
					el: r,
					command: e.command,
					value: t
				}), r;
			};
			t.popColors.append(J("div", { class: "afw-pop-row" }, [
				J("span", { class: "afw-pop-label" }, n),
				i(null, {
					class: "afw-swatch afw-swatch-none",
					title: r,
					"aria-label": r
				}),
				...e.colors.map((t) => i(t, {
					class: `afw-swatch afw-swatch-${e.command}`,
					style: `--afw-swatch: ${t}`,
					title: t,
					"aria-label": `${n} ${t}`
				}))
			]));
		}
	}
	_button(e, t, n, r, i = {}) {
		let a = e && this.t(e), o = J("button", {
			type: "button",
			class: "afw-btn afw-btn-inverse",
			title: a && (t ? `${a} (${t})` : a),
			"aria-label": a,
			...i
		});
		return n && hr(o, W[n]), this.cleanups.push(gr(o, "mousedown", Q), gr(o, "click", r)), o;
	}
	_buttonGroups(e, t, n = "") {
		let r = [];
		return t.forEach((t, i) => {
			let a = J("div", { class: "afw-group" }, i > 0 ? J("span", { class: "afw-sep" }) : null);
			for (let e of t) {
				let t = this._button(e.command, e.shortcut, null, (t) => this._onItem(e.command, t), {
					class: `afw-btn${n ? ` ${n}` : ""}`,
					"aria-haspopup": kr.includes(e.command) ? "true" : null
				});
				a.append(t), r.push({
					el: t,
					command: e.command
				});
			}
			e.append(a);
		}), r;
	}
	render() {
		this.internal.onRender?.(this);
		let { ui: e } = this;
		if (!e) return;
		X(e.toolbar, this.showToolbar && !this.readOnly);
		for (let e of [...this.toolbarButtons, ...this.bubbleButtons]) this._renderItem(e);
		X(e.draft, !!this.draft), this.draft && Z(e.draftText, this.draftMessage()), X(e.footer, this.showStats), Z(e.words, `${this.stats.words} ${this.t("words")}`), Z(e.minutes, `${this.stats.minutes} ${this.t("minutesRead")}`);
		let { bubble: t, media: n, pop: r } = this;
		Rr(e.bubble, t), e.bubbleFormat.classList.toggle("afw-is-hidden", t.mode !== "format"), e.linkForm.classList.toggle("afw-is-hidden", t.mode !== "input"), e.linkInfo.classList.toggle("afw-is-hidden", t.mode !== "linkinfo");
		let i = this.t(Dr[t.purpose]) || "";
		Y(e.linkInput, "placeholder", i), Y(e.linkInput, "aria-label", i), e.linkInput.value !== t.url && (e.linkInput.value = t.url), e.linkRemove.classList.toggle("afw-is-hidden", !(t.purpose === "link" && t.hasLink)), X(e.linkError, !!t.error), Z(e.linkError, t.error), Y(e.linkPreview, "href", t.href || null), Y(e.linkPreview, "title", t.href || null), Z(e.linkHref, t.href), Rr(e.mediabar, n), e.mediaSizes.classList.toggle("afw-is-hidden", n.kind === "divider");
		for (let { el: e, value: t } of this.mediaSizeButtons) {
			let r = n.size === t;
			e.classList.toggle("afw-is-active", r), Y(e, "aria-pressed", String(r));
		}
		e.mediaImage.forEach((e) => X(e, n.kind === "image")), e.mediaAlt.classList.toggle("afw-is-active", !!n.alt), Rr(e.pop, r), Y(e.pop, "aria-label", this.t(r.kind || "color")), e.popAlign.classList.toggle("afw-is-hidden", r.kind !== "align"), e.popColors.classList.toggle("afw-is-hidden", r.kind !== "color");
		for (let { el: e, command: t } of this.alignButtons) {
			let n = this.isActive(t);
			e.classList.toggle("afw-is-active", n), Y(e, "aria-pressed", String(n));
		}
		for (let { el: e, command: t, value: n } of this.swatches) {
			let r = n === null ? !this.values[t] : this.values[t] === n;
			e.classList.toggle("afw-is-active", r), Y(e, "aria-pressed", String(r));
		}
		e.toast.classList.toggle("afw-is-open", this.toast.open), Z(e.toast, this.toast.message), Rr(e.menu, this.slash), this._renderMenuItems(), X(e.menuEmpty, !this.slash.items.length);
		for (let [t, { visible: n, x: r, y: i }] of [[e.plus, this.plus], [e.handle, this.handle]]) {
			t.classList.toggle("afw-is-open", n);
			let e = `top: ${i}px; left: ${r}px`;
			t.getAttribute("style") !== e && t.setAttribute("style", e);
		}
		for (let [t, n] of e.inputs) {
			let e = t === "title" ? this.meta.title : this._inputValue();
			n.value !== e && (n.value = e);
		}
	}
	_renderMenuItems() {
		let { items: e, index: t } = this.slash;
		this.menuSource !== e && (this.menuSource = e, this.menuItems.forEach((e) => e.remove()), this.menuItems = e.map((e, t) => this._menuItem(e, t)), this.ui.menuEmpty.before(...this.menuItems)), this.menuItems.forEach((e, n) => {
			e.classList.toggle("afw-is-active", n === t), Y(e, "aria-selected", String(n === t));
		});
	}
	_menuItem(e, t) {
		let n = J("span", { class: "afw-menu-icon" });
		hr(n, this.icon(e.command));
		let r = J("kbd", { class: "afw-menu-kbd" }, e.markdown || "");
		X(r, !!e.markdown);
		let i = J("button", {
			type: "button",
			class: "afw-menu-item",
			role: "option",
			tabindex: "-1",
			id: `${this.uid}-opt-${t}`
		}, [
			n,
			J("span", { class: "afw-menu-text" }, [J("span", { class: "afw-menu-label" }, e.label), J("span", { class: "afw-menu-desc" }, e.description)]),
			r
		]);
		return i.addEventListener("mousedown", Q), i.addEventListener("mousemove", () => this._hoverSlash(t)), i.addEventListener("click", () => this.editor.applySlash(t)), i;
	}
	_renderItem({ el: e, command: t }) {
		let n = this.isActive(t);
		e.classList.toggle("afw-is-active", n), Y(e, "aria-pressed", String(n)), Y(e, "aria-disabled", String(this.isDisabled(t))), hr(e, this.icon(t));
	}
	icon(e) {
		if (e === "align") return W[`align${Ir(this.values.align || "left")}`];
		let { headings: t } = this;
		return t.length === 2 && /^h[2-6]$/.test(e) && t.includes(Number(e[1])) ? W[Number(e[1]) === t[0] ? "headingLarge" : "headingSmall"] : W[e] || "";
	}
	_inputValue() {
		return this.format === "json" ? JSON.stringify(this.editor.getJSON()) : this.html;
	}
	draftMessage() {
		let e = new Date(this.draft.time).toLocaleString(this.options.lang === "id" ? "id" : "en", {
			dateStyle: "medium",
			timeStyle: "short"
		});
		return ge(this.t("draftFound"), { time: e });
	}
	showToast(e) {
		this.toast = {
			open: !0,
			message: e
		}, this.render(), clearTimeout(this.toastTimer), this.toastTimer = setTimeout(() => {
			this.toast.open = !1, this.render();
		}, Ar);
	}
	_placeFloating(e, t, n, r) {
		this.render();
		let i = xr(this.root, t, n, r);
		e.x = i.x, e.y = i.y, e.ready = !0, this.render();
	}
	_onItem(e, t) {
		if (!kr.includes(e)) return this._closePop(), this.exec(e);
		if (this.pop.open && this.pop.kind === e) return this._closePop();
		this._openPop(e, t?.currentTarget);
	}
	_selectionKey() {
		let { from: e, to: t } = this.editor.tiptap.state.selection;
		return `${e}:${t}`;
	}
	_openPop(e, t) {
		if (this.readOnly || !this.editor || !t) return;
		this.editor.hasFocus() || this.editor.focus(), this.popTrigger = t, this.popSelection = this._selectionKey(), Object.assign(this.pop, {
			open: !0,
			ready: !1,
			kind: e
		});
		let n = t.closest(".afw-bubble") && !vr() ? "above" : "below";
		this._placeFloating(this.pop, this.ui.pop, t.getBoundingClientRect(), {
			prefer: n,
			gap: 6
		});
	}
	_closePop(e = !1) {
		this.pop.open && (this.pop.open = !1, this.pop.ready = !1, e && this.popTrigger?.focus(), this.popTrigger = null, this.render());
	}
	_applyPop(e, t) {
		this.editor?.exec(e, t), this._closePop();
	}
	_onSelection(e) {
		if (this.pop.open && (!e.inside || this._selectionKey() !== this.popSelection) && this._closePop(), !(this.bubble.open && this.bubble.mode === "input") && !this.readOnly) {
			if (this._updatePlus(e), e.media) return this.closeBubble(), this._showMediaBar(e.media);
			if (this.hideMediaBar(), !e.inside || e.dragging || e.inCode || this.slash.open || !this.showBubble) return this.closeBubble();
			if (!e.collapsed) return this._showBubbleAt("format", e.rect);
			if (e.link) return this.bubble.href = e.link.href, this._showBubbleAt("linkinfo", e.link.rect);
			this.closeBubble();
		}
	}
	_showBubbleAt(e, t) {
		let n = this.bubble.open && this.bubble.mode === e;
		this.bubble.mode = e, this.bubble.open = !0, n || (this.bubble.ready = !1);
		let r = vr() && e === "format";
		r && yr() ? (this.bubble.pinned = !0, this._placePinned(), this._scheduleReveal()) : (this.bubble.pinned = !1, this._placeFloating(this.bubble, this.ui.bubble, t, { prefer: r ? "below" : "above" }), r && this._scheduleReveal());
	}
	_placePinned() {
		this.render();
		let e = window.visualViewport;
		this.bubble.y = Math.round(e.offsetTop + e.height - this.ui.bubble.offsetHeight - 8), this.bubble.ready = !0, this.render();
	}
	_scheduleReveal() {
		clearTimeout(this.revealTimer), this.revealTimer = setTimeout(() => this._reveal(), jr);
	}
	_reveal() {
		if (!this.editor || !this.bubble.open || this.bubble.mode !== "format") return;
		let e = this.editor.selectionRect();
		if (!e) return;
		let t = e.bottom + 10 + this.ui.bubble.offsetHeight;
		Sr(this.root, e.top, t) && this.editor._scheduleSelection();
	}
	_onViewportChange() {
		if (this.editor) {
			if (this._closePop(), this.bubble.open || this.media.open) {
				if (this.bubble.open && this.bubble.mode === "input") {
					let e = this.bubble.purpose === "alt" ? this._mediaRect() : this.editor.selectionRect();
					e && this._placeFloating(this.bubble, this.ui.bubble, e, { prefer: "above" });
				} else this.editor._scheduleSelection();
			}
			this.slash.open && (this.slash.ready = !1, this._onSlash({
				...this.editor.slash,
				rect: this.editor.selectionRect()
			}));
		}
	}
	closeBubble() {
		Object.assign(this.bubble, {
			open: !1,
			ready: !1,
			pinned: !1,
			mode: "format",
			error: ""
		}), this.render();
	}
	openInput(e, t = "") {
		if (!this.ui) return;
		this.savedRange = this.editor.saveSelection();
		let n = e === "alt" ? this._mediaRect() : this.editor.selectionRect();
		n && (this.hideMediaBar(), Object.assign(this.bubble, {
			purpose: e,
			url: t || "",
			hasLink: e === "link" && !!t,
			error: ""
		}), this._showBubbleAt("input", n), this.ui.linkInput.focus(), this.ui.linkInput.select());
	}
	editLink() {
		this.openInput("link", this.bubble.href);
	}
	unlink() {
		this.exec("unlink");
	}
	applyInput() {
		let e = this.bubble.url.trim(), { editor: t } = this;
		switch (this.bubble.purpose) {
			case "link": return e && !S(e) ? this._inputError("errorUrl") : this._withEditorFocus(() => e ? t.exec("link", e) : t.exec("unlink"));
			case "embed": return e ? v(e) ? this._withEditorFocus(() => t.exec("embed", e)) : this._inputError("errorEmbed") : this.cancelInput();
			case "alt": return this._withEditorFocus(() => t.setMediaAlt(e));
		}
	}
	removeLink() {
		this._withEditorFocus(() => this.editor.exec("unlink"));
	}
	cancelInput() {
		if (this.bubble.mode !== "input") return this.closeBubble();
		let { purpose: e } = this.bubble;
		this._withEditorFocus(() => e === "alt" && this.editor.setMediaAlt(this.media.alt));
	}
	_inputError(e) {
		this.bubble.error = this.t(e), this.render();
	}
	_onInputBlur() {
		!this.inputBusy && this.bubble.mode === "input" && this.closeBubble();
	}
	_withEditorFocus(e) {
		this.inputBusy = !0, this.closeBubble(), this.editor.restoreSelection(this.savedRange), e(), this.savedRange = null, this.inputBusy = !1;
	}
	_showMediaBar({ kind: e, size: t, alt: n, src: r, mediaId: i, rect: a }) {
		let o = this.media.open;
		Object.assign(this.media, {
			open: !0,
			kind: e,
			size: t,
			alt: n,
			src: r,
			mediaId: i
		}), o || (this.media.ready = !1), this._placeFloating(this.media, this.ui.mediabar, a, { prefer: "above" });
	}
	hideMediaBar() {
		this.media.open && (this.media.open = !1, this.media.ready = !1, this.render());
	}
	_mediaRect() {
		return this.root.querySelector(".afw-content .afw-is-selected")?.getBoundingClientRect() || null;
	}
	setMediaSize(e) {
		this.editor.setMediaSize(e);
	}
	editAlt() {
		this.openInput("alt", this.media.alt);
	}
	removeMedia() {
		this.editor.removeMedia();
	}
	openBlockMenu() {
		this.editor?.openSlash();
	}
	_onSlash(e) {
		let { slash: t, editor: n } = this;
		if (t.items = e.items, t.index = e.index, e.open && e.items.length ? (n.el.setAttribute("aria-controls", `${this.uid}-menu`), n.el.setAttribute("aria-activedescendant", `${this.uid}-opt-${e.index}`)) : n.el.removeAttribute("aria-activedescendant"), !e.open) return t.open = !1, t.ready = !1, this.render();
		let r = t.open;
		if (t.open = !0, this.plus.visible = !1, this.closeBubble(), !r || !t.ready) {
			this.render();
			let n = xr(this.root, this.ui.menu, e.rect, {
				prefer: "below",
				align: "left",
				gap: 6
			});
			t.x = n.x, t.y = n.y;
		}
		t.ready = !0, this.render(), this.ui.menu.querySelector(".afw-is-active")?.scrollIntoView({ block: "nearest" });
	}
	_hoverSlash(e) {
		e !== this.slash.index && this.editor.setSlashIndex(e);
	}
	_updatePlus(e) {
		if (!e.inside || !e.emptyBlock || this.slash.open || this.dragging) {
			this.plus.visible = !1;
			return;
		}
		let t = this.root.getBoundingClientRect(), n = e.emptyBlock.rect;
		this.plus.y = Math.round(n.top - t.top + n.height / 2 - 12), this.plus.x = wr(n, t), this.plus.visible = !0;
	}
	_onBodyHover(e) {
		if (this.readOnly || this.dragging || this.options.dragHandle === !1 || vr()) return;
		let t = this.editor?.blockAt(e.clientY);
		if (!t || t.empty) return this._hideHandle();
		let n = this.root.getBoundingClientRect(), r = Math.round(t.line.top - n.top + t.line.height / 2 - 12), i = wr(t.rect, n), { handle: a } = this;
		a.visible && a.x === i && a.y === r && a.pos === t.pos || (Object.assign(a, {
			x: i,
			y: r,
			pos: t.pos,
			visible: !0
		}), this.render());
	}
	_hideHandle() {
		!this.dragging && this.handle.visible && (this.handle.visible = !1, this.render());
	}
	_selectHandleBlock() {
		this.handle.pos !== null && this.editor.selectBlock(this.handle.pos);
	}
	_startBlockDrag(e) {
		if (this.handle.pos === null) return e.preventDefault();
		this.dragging = !0, this.plus.visible = !1, this.closeBubble(), this.editor.startBlockDrag(this.handle.pos, e);
	}
	_endBlockDrag() {
		this.dragging = !1, this.handle.visible = !1, this.editor.endBlockDrag(), this.render();
	}
	_visibleToolbarButtons() {
		return this.toolbarButtons.map((e) => e.el).filter((e) => e.offsetParent !== null);
	}
	_initToolbarFocus() {
		this.ui && this._visibleToolbarButtons().forEach((e, t) => e.setAttribute("tabindex", t === 0 ? "0" : "-1"));
	}
	_toolbarKey(e) {
		let t = {
			ArrowRight: 1,
			ArrowLeft: -1,
			Home: -Infinity,
			End: Infinity
		};
		if (!(e.key in t)) return;
		e.preventDefault();
		let n = this._visibleToolbarButtons(), r = n.indexOf(document.activeElement);
		if (r < 0) return;
		let i = t[e.key], a = r + i;
		a = i === Infinity ? n.length - 1 : i === -Infinity ? 0 : (a + n.length) % n.length, n.forEach((e, t) => e.setAttribute("tabindex", t === a ? "0" : "-1")), n[a].focus();
	}
}, Ir = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function Lr(e) {
	e.setAttribute("x-ignore", ""), e._x_ignore = !0;
}
function Rr(e, { open: t, ready: n, x: r, y: i, pinned: a }) {
	e.classList.toggle("afw-is-open", t), e.classList.toggle("afw-is-ready", n), e.classList.toggle("afw-is-pinned", !!a);
	let o = a ? `top: ${i}px` : `left: ${r}px; top: ${i}px`;
	e.getAttribute("style") !== o && e.setAttribute("style", o);
}
//#endregion
//#region src/alpine.js
var zr = {
	image: null,
	title: "",
	subtitle: "",
	slug: ""
}, Br = [
	"html",
	"active",
	"disabled",
	"values",
	"readOnly",
	"canUndo",
	"canRedo",
	"draft",
	"stats",
	"meta",
	"bubble",
	"media",
	"pop",
	"slash",
	"plus",
	"handle",
	"toast",
	"dragging"
];
function Vr(e = {}) {
	let t = null, n = {};
	return {
		html: "",
		active: {},
		disabled: {},
		values: {
			color: null,
			highlight: null,
			align: null
		},
		readOnly: !!e.readonly,
		canUndo: !1,
		canRedo: !1,
		draft: null,
		stats: {
			words: 0,
			minutes: 0
		},
		meta: { ...zr },
		bubble: {},
		media: {},
		pop: {},
		slash: {},
		plus: {},
		handle: {},
		toast: {},
		dragging: !1,
		name: e.name || "",
		titleName: e.titleName || "",
		format: e.format === "json" ? "json" : "html",
		showToolbar: e.toolbar ?? !0,
		showBubble: e.bubble ?? !0,
		showStats: e.stats ?? !0,
		toolbar: [],
		bubbleItems: [],
		alignItems: lr,
		uid: "",
		init() {
			t = Pr(this.$el, e, {
				restore: !1,
				onRender: (e) => this._mirror(e)
			}), this.toolbar = t.toolbarItems, this.bubbleItems = t.bubbleItems, this.uid = t.uid, this._mirror(t), this.$watch("html", (e) => {
				let n = t?.editor;
				if (!n) return;
				let r = e || "", i = n.getHTML();
				r !== i && n.normalizeHTML(r) !== i && n.setHTML(r);
			});
			for (let e of [
				"showToolbar",
				"showBubble",
				"showStats"
			]) this.$watch(e, (n) => {
				t && (t[e] = n, e === "showBubble" && !n && t.closeBubble(), t.render());
			});
		},
		destroy() {
			t?.destroy(), t = null;
		},
		_mirror(e) {
			for (let t of Br) {
				let r = e[t], i = r && typeof r == "object";
				t in n && (i ? Hr(n[t], r) : n[t] === r) || (n[t] = i ? Array.isArray(r) ? [...r] : { ...r } : r, this[t] = i ? Array.isArray(r) ? [...r] : { ...r } : r);
			}
		},
		exec(e, ...n) {
			return t?.exec(e, ...n);
		},
		insertImage(e) {
			t?.insertImage(e);
		},
		replaceImage(e) {
			t?.replaceImage(e);
		},
		isActive(e) {
			return !!this.active[e];
		},
		isDisabled(e) {
			return e === "undo" ? !this.canUndo : e === "redo" ? !this.canRedo : !!this.disabled[e];
		},
		icon(e) {
			return this.values.align, t?.icon(e) ?? "";
		},
		t(e) {
			return t?.t(e) ?? e;
		},
		hasPop(e) {
			return e === "color" || e === "align";
		},
		inputValue() {
			let e = this.html;
			return this.format === "json" ? JSON.stringify(t ? t.getJSON() : {
				type: "doc",
				content: []
			}) : e;
		},
		getHTML() {
			return t?.getHTML() || "";
		},
		setHTML(e) {
			t?.setHTML(e);
		},
		getJSON() {
			return t?.getJSON();
		},
		setJSON(e) {
			t?.setJSON(e);
		},
		getMeta() {
			return t?.getMeta() ?? { ...zr };
		},
		setReadOnly(e = !0) {
			t?.setReadOnly(e);
		},
		focus() {
			t?.focus();
		},
		draftMessage() {
			return this.draft && t ? t.draftMessage() : "";
		},
		restoreDraft() {
			t?.restoreDraft();
		},
		discardDraft() {
			t?.discardDraft();
		},
		openLinkInput({ href: e = "" } = {}) {
			t?.openInput("link", e);
		},
		openBlockMenu() {
			t?.openBlockMenu();
		},
		editor() {
			return t?.editor ?? null;
		}
	};
}
function Hr(e, t) {
	if (e === t) return !0;
	if (!e || !t || typeof e != "object") return !1;
	let n = Object.keys(t);
	return n.length === Object.keys(e).length && n.every((n) => e[n] === t[n]);
}
function Ur(e) {
	e.data("wysiwyg", Vr);
}
//#endregion
//#region src/index.js
var Wr = Ur;
typeof document < "u" && document.addEventListener("alpine:init", () => window.Alpine?.plugin(Ur));
//#endregion
export { lr as ALIGN_ITEMS, _e as BLOCKS, sr as BUBBLE, Bt as COMMANDS, Te as DEFAULT_COLORS, Ee as DEFAULT_HIGHLIGHTS, Qn as Editor, y as FORMATS, W as ICONS, me as LOCALES, cr as TOOLBAR, Pr as create, Wr as default, Hn as fromJSON, he as getStrings, dr as headingItem, S as normalizeUrl, Ur as plugin, F as sanitize, Gn as slugify, Rn as textToHtml, Vn as toJSON, ur as withFormats, pr as withHeadings, Vr as wysiwygComponent };
