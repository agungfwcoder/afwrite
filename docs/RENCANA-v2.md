# Rencana v2: engine Tiptap, tampilan tetap

Tujuan: mengganti inti editor (`contenteditable` + `execCommand`) dengan Tiptap 3 / ProseMirror,
tanpa mengubah tampilan, cara pakai di Alpine, maupun format HTML output.

Dikerjakan di branch `v2-tiptap`. `main` tetap v1 sampai v2 lolos semua test dan dicoba manual.

## Yang dipertahankan

- `src/template.js`, `src/style.css`, `src/icons.js`, `src/i18n.js`: tampilan & prefix `afw`
- API Alpine: `x-data="wysiwyg({...})"`, `x-model`, event `wysiwyg-*`, input tersembunyi `name`
- API `Editor` publik: `exec`, `isActive`, `getHTML/setHTML`, `getJSON/setJSON`, `paste`, `undo/redo`,
  `setReadOnly`, media, slash, draft
- Format HTML output (`<b>`, `<i>`, `<figure data-size>`, `<figure data-embed>`, dst.), jadi konten lama
  di database tetap terbaca dan `WyswygHtml::clean()` di Laravel tidak berubah
- `sanitize.js` tetap dipakai untuk paste dan `setHTML` (lapisan keamanan kedua)
- Test browser 01–06 sebagai jaring pengaman

## Yang diganti

| v1 (`src/core/`) | v2 |
|---|---|
| `commands.js`, `cleanup.js`, `selection.js` | perintah & schema Tiptap |
| `history.js` | extension UndoRedo |
| `markdown.js` | input rules Tiptap |
| `codeblock.js` | node CodeBlock + keymap Tab |
| `media.js`, `embed.js` | node `figure` (gambar + caption) dan `embed` buatan sendiri |
| `blocks.js` + logika slash | `@tiptap/suggestion` |
| `model.js` | `editor.getJSON()` (lihat keputusan 1) |

Catatan teknis:
- Instance Tiptap disimpan di closure, **bukan** di data reaktif Alpine (proxy Alpine merusak
  state ProseMirror).
- Mark `bold`/`italic` di-extend agar tetap merender `<b>`/`<i>`, bukan `<strong>`/`<em>`.
- Extension yang tidak ada di whitelist dimatikan: strike, underline, h1/h4–h6.
- Gapcursor bawaan Tiptap menggantikan perbaikan "klik celah di sekitar media".

## Termin

### v2-T1: fondasi & format dasar
- Branch, pasang `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extensions`
- Wrapper `Editor` dengan API publik yang sama, dipasang di elemen `data-afw-editor`
- Schema sesuai whitelist; bold/italic/link/code, h2/h3, kutipan, list, hr
- Toolbar & state aktif; placeholder; statistik
- Lolos: `01-dasar`

### v2-T2: paste, sanitasi, markdown
- `transformPastedHTML` lewat `sanitize()`; paste sebagai teks; URL di atas teks terseleksi -> link
- Input rules: `#`, `##`, `###`, `>`, `-`, `1.`, `---`, ```` ``` ````, `**tebal**`, `*miring*`, `` `kode` ``
- Lolos: `02-sanitasi-paste`

### v2-T3: UI modern
- Bubble (format / input link / info link) memakai posisi dari seleksi ProseMirror
- Slash menu via Suggestion, tombol `+` di paragraf kosong, toast
- Lolos: `03-ui-modern`

### v2-T4: media
- Node `figure`: gambar, caption yang bisa diedit, alt, ukuran normal/lebar/penuh, media bar
- Upload (pratinjau blob, `data-afw-uploading`), drag & drop, tempel screenshot
- Node `embed` YouTube/Vimeo; tempel link YouTube di baris kosong
- Lolos: `04-media`

### v2-T5: API, stabilitas, lanjutan
- Undo/redo, readonly, `x-model`, event, i18n, ARIA toolbar
- Blok kode (Enter, Tab, Shift+Tab), JSON, autosave + banner draf
- Lolos: `05-api-stabilitas`, `06-lanjutan`, feature test Laravel + HTMLPurifier

### v2-T6: uji perangkat & rilis
- Uji manual: Chrome Android (Gboard), Safari iOS, IME (mis. Jepang), spellcheck
- Ukuran bundle, README (bagian Credit: Tiptap/ProseMirror, MIT), CHANGELOG, panduan migrasi
- Rilis `v2.0.0`, merge ke `main`

### Opsional setelah v2
- Tabel (`@tiptap/extension-table`)
- Syntax highlighting blok kode (lowlight)

## Keputusan yang perlu diambil

1. **Format JSON**: pakai JSON bawaan Tiptap (disarankan; sesuai standar ProseMirror) atau
   pertahankan format v1 (`blocks` + `marks` rentang) lewat konverter.
2. **Ukuran bundle**: perkiraan naik dari ~25 KB ke ~80–100 KB gzip.
3. **Build UMD**: Tiptap ikut di-bundle (perlu file lisensi pihak ketiga) atau hanya build ES
   dengan Tiptap sebagai dependency.
