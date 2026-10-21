<p align="center"><img src="website/public/logo.svg" width="72" height="72" alt="afwrite"></p>

# afwrite

[English](README.md) · **Bahasa Indonesia**

Editor WYSIWYG modern ala Medium berbasis **vanilla JS + Alpine.js**, dengan engine
[Tiptap](https://tiptap.dev) / [ProseMirror](https://prosemirror.net).

**Gratis untuk semua fitur.** Tidak ada paket berbayar, license key, atau batas pemakaian: semua
yang ada di bawah berlisensi MIT. [Kenapa afwrite?](https://agungfwcoder.github.io/afwrite/more/why)

- Bubble toolbar saat teks diblok, slash command `/`, tombol `+` di baris kosong
- Shortcut markdown: `##`, `>`, `-`, `1.`, `---`, `**tebal**`, `*miring*`, `` `kode` ``
- Gambar (upload, caption, alt text, 3 ukuran), video YouTube/Vimeo, pemisah, blok kode
- Output HTML atau JSON (format dokumen ProseMirror), autosave draf ke localStorage
- Paste dari Word, Google Docs, dan web selalu bersih; output HTML ter-sanitasi
- Perilaku mengetik konsisten di semua browser (engine ProseMirror), undo/redo, mode baca saja,
  `x-model`, bahasa Indonesia & Inggris
- CSS terisolasi dengan prefix `afw` — aman bersama Bootstrap, Tailwind, dll.
- Teruji di Chrome, Firefox, dan Safari (WebKit); integrasi Laravel siap pakai

Dokumentasi lengkap: https://agungfwcoder.github.io/afwrite/

## Instalasi

### Lewat CDN (tanpa build)

Script afwrite dimuat **sebelum** Alpine; plugin terdaftar otomatis dan API lain ada di `window.Afwrite`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/agungfwcoder/afwrite@2/dist/afwrite.css">
<script defer src="https://cdn.jsdelivr.net/gh/agungfwcoder/afwrite@2/dist/afwrite.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

### Lewat bundler

```bash
npm install github:agungfwcoder/afwrite#semver:^2 alpinejs
# setelah dipublish ke npm: npm install afwrite alpinejs
```

Tiptap/ProseMirror ikut terpasang sebagai dependency. Dipakai lewat bundler (Vite, termasuk Vite di
Laravel). Ukuran total di aplikasi sekitar
135 KB gzip (ProseMirror sekitar 77 KB di antaranya); muat hanya di halaman yang memakai editor
bila perlu (`import()` dinamis).

```js
import Alpine from 'alpinejs';
import afwrite from 'afwrite';
import 'afwrite/style.css';

Alpine.plugin(afwrite);
Alpine.start();
```

Livewire 3/4 sudah membawa dan menjalankan Alpine sendiri: jangan impor `alpinejs` atau memanggil
`Alpine.start()`. Cukup `import 'afwrite'` dan `import 'afwrite/style.css'`; plugin terdaftar
otomatis saat event `alpine:init`.

## Pemakaian

```html
<form method="post">
  <div x-data="wysiwyg({ name: 'body', upload: uploadImage })">
    <p>Konten awal (opsional)</p>
  </div>
  <button>Simpan</button>
</form>
```

Markup UI (toolbar, bubble, menu) dibuat otomatis. Isi elemen menjadi konten awal, dan
`name` membuat `<input type="hidden">` berisi HTML yang ikut terkirim bersama form.

Dengan `x-model`:

```html
<div x-data="{ body: '' }">
  <div x-data="wysiwyg()" x-modelable="html" x-model="body"></div>
</div>
```

### Opsi

| Opsi | Default | Keterangan |
|---|---|---|
| `name` | `''` | Nama input hidden untuk form |
| `lang` | `'en'` | Bahasa antarmuka: `'en'` atau `'id'` (Indonesia) |
| `strings` | `{}` | Timpa sebagian teks, mis. `{ placeholder: 'Tulis…' }` (lihat `src/i18n.js`) |
| `placeholder` | dari `lang` | Teks saat editor kosong |
| `toolbar` | `true` | Toolbar di atas; `false` = hanya bubble (ala Medium) |
| `bubble` | `true` | Bubble toolbar saat teks diblok |
| `stats` | `true` | Jumlah kata & waktu baca |
| `dragHandle` | `true` | Pegangan ⋮⋮ di kiri blok: seret untuk memindah, klik untuk memilih |
| `readonly` | `false` | Mode baca saja |
| `upload` | `null` | `async (file) => url` atau `{ url, mediaId, alt }` (`mediaId` ditulis sebagai `data-media-id`). Tanpa ini gambar disimpan sebagai base64 |
| `maxImageSize` | `5 MB` | Batas ukuran gambar (byte); `0` = tanpa batas |
| `allowDataImages` | `true` | Izinkan `<img src="data:image/…">` di output |
| `headings` | `[2, 3]` | Level judul yang dipakai (2–6), mis. `[2, 3, 4, 5, 6]`. Tombol toolbar, slash menu, shortcut, dan markdown mengikuti; level lain diturunkan ke level aktif terdekat |
| `title` | `false` | Mode artikel ala Medium: teks paling atas judul `<h1>` (di atasnya hanya boleh gambar/video/pemisah); tombol judul kecil (level kedua) di baris tepat setelahnya membuat subjudul `<p class="afw-subtitle">` |
| `formats` | semua | Format tambahan: `'underline'`, `'strike'`, `'color'`, `'highlight'`, `'align'`. Mode artikel: tidak ada (tetap polos). `false` = tanpa |
| `colors`, `highlights` | palet bawaan | Palet warna teks & stabilo (hex); warna di luar palet dibuang |
| `extensions` | `[]` | Extension Tiptap tambahan (node/mark milik aplikasi) |
| `sanitize` | `null` | Whitelist untuk extension di atas: `{ allowTags, allowAttributes, allowClasses }` |
| `markdown` | `true` | Shortcut markdown |
| `slash` | `true` | Slash menu |
| `pasteAsPlainText` | `false` | Buang semua format saat paste |
| `toolbarItems`, `bubbleItems` | bawaan | Susunan tombol (lihat `src/icons.js`) |
| `historyLimit` | `100` | Jumlah langkah undo |
| `format` | `'html'` | Isi input hidden: `'html'` atau `'json'` |
| `titleName` | `''` | Nama input hidden berisi judul (`<h1>` artikel / teks pertama) |
| `autosave` | `null` | `'kunci-unik'` atau `{ key, delay }`: simpan draf ke localStorage |

Contoh `upload`:

```js
async function uploadImage(file) {
  const body = new FormData();
  body.append('image', file);
  const res = await fetch('/upload', { method: 'POST', body });
  return (await res.json()).url;
}
```

### Method komponen Alpine

Dipanggil dari markup di dalam komponen atau lewat `Alpine.$data(el)`:

| Method | Keterangan |
|---|---|
| `getHTML()` / `setHTML(html)` | Ambil / ganti isi (selalu disanitasi) |
| `getJSON()` / `setJSON(doc)` | Isi sebagai JSON dokumen ProseMirror |
| `getMeta()` | Pratinjau ala Medium: `{ image, title, subtitle, slug }` dari gambar pertama (dengan `mediaId`), teks pertama, dan teks kedua |
| `exec(perintah, ...arg)` | Jalankan perintah, lihat tabel perintah |
| `isActive(perintah)` | Format aktif di posisi kursor |
| `setReadOnly(bool)` | Ubah mode baca saja |
| `focus()` | Fokus ke akhir editor |
| `editor()` | Instance `Editor` (API lengkap di bawah) |

### Event

Dikirim dari elemen editor dan *bubbling*, jadi bisa ditangkap di parent:

```html
<div x-data="wysiwyg()" @wysiwyg-change="console.log($event.detail.html)"></div>
```

`wysiwyg-ready` (`{ editor }`), `wysiwyg-change` (`{ html, meta }`), `wysiwyg-focus`, `wysiwyg-blur`,
`wysiwyg-error` (`{ message }`).

### Perintah & shortcut

| Perintah | Shortcut | Markdown |
|---|---|---|
| `bold` / `italic` | Ctrl/⌘ + B / I | `**teks**` / `*teks*` |
| `underline` / `strike` | Ctrl/⌘ + U / Ctrl/⌘ + Shift + X | |
| `color` / `highlight` | palet di toolbar & bubble; `exec('color', '#e11d48')` | |
| `alignLeft` … `alignJustify` | Ctrl/⌘ + Shift + L / E / R / J; `exec('align', 'center')` | |
| `link` | Ctrl/⌘ + K | tempel URL di atas teks terseleksi |
| `h2` … `h6` | Ctrl/⌘ + Alt + 2 … 6 | `## ` … `###### ` (level harus aktif di `headings`) |
| `paragraph` | Ctrl/⌘ + Alt + 0 | |
| `quote` | Ctrl/⌘ + Shift + 9 | `> ` |
| `ul` / `ol` | Ctrl/⌘ + Shift + 8 / 7 | `- ` / `1. ` |
| `indent` / `outdent` | Tab / Shift + Tab (di dalam list) | |
| `image` | | `/gambar`, seret file, tempel screenshot |
| `replaceImage` | | tombol **Ganti gambar** di toolbar media; caption, ukuran, dan posisi tetap |
| `embed` | | `/video`, tempel link YouTube di baris kosong |
| `hr` | | `--- ` |
| `codeblock` | Ctrl/⌘ + Alt + C | ```` ``` ```` + spasi, `/kode` |
| `undo` / `redo` | Ctrl/⌘ + Z / Ctrl/⌘ + Shift + Z (atau Ctrl + Y) | |
| pindah blok | Ctrl/⌘ + Shift + ↑ / ↓, atau seret pegangan ⋮⋮ | |
| `unlink` | | |

Di dalam blok kode: **Enter** = baris baru, **Tab / Shift+Tab** = indentasi, **Enter** di baris
kosong terakhir = keluar dari blok, paste selalu sebagai teks.

Saat gambar/video/pemisah dipilih: **Backspace/Delete** menghapus, **Enter** membuat paragraf
baru di bawahnya, **panah** keluar dari media.

## Tanpa Alpine

Inti editor tidak bergantung pada Alpine (tanpa UI melayang; link & video memakai `prompt()`):

```js
import { Editor } from 'afwrite';
import 'afwrite/style.css';

const editor = new Editor(document.querySelector('#editor'), { lang: 'en' });
editor.on('change', (html) => (input.value = html));
document.querySelector('#bold').onclick = () => editor.exec('bold');
```

Elemen `#editor` perlu dibungkus elemen berclass `afw` agar style berlaku.

| API `Editor` | Keterangan |
|---|---|
| `exec(nama, ...arg)`, `isActive(nama)`, `state()`, `formatValues()` | Perintah & status format (`formatValues()`: `{ color, highlight, align }` di posisi kursor) |
| `getHTML()`, `setHTML(html, { resetHistory })`, `getJSON()`, `setJSON(doc)`, `getText()`, `clear()`, `isEmpty()` | Isi |
| `normalizeHTML(html)` | HTML seperti hasil `getHTML()` setelah `setHTML(html)`, tanpa mengubah isi; untuk membandingkan konten dari luar |
| `insertHTML(html)`, `insertText(teks)`, `paste({ html, text, files })`, `insertImages(files)` | Sisipkan |
| `undo()`, `redo()`, `canUndo()`, `canRedo()` | Riwayat |
| `restoreDraft()`, `discardDraft()`, `clearDraft()`, `draft` | Autosave |
| `setReadOnly(bool)`, `focus()`, `stats()` | Lainnya |
| `on(event, fn)` → fungsi untuk berhenti, `off()`, `destroy()` | Event |

Event `Editor`: `change`, `state`, `selection`, `slash`, `history`, `readonly`, `linkrequest`,
`embedrequest`, `error`, `focus`, `blur`.

Instance Tiptap tersedia di `editor.tiptap` untuk kebutuhan lanjutan (mis.
`editor.tiptap.commands`, `editor.tiptap.state`). Perubahan lewat jalur ini tetap memicu event
`change`, tetapi output tetap dibatasi whitelist sanitasi.

## Format JSON

Format dokumen ProseMirror/Tiptap, sehingga bisa dibaca alat-alat dari ekosistem yang sama:

```js
editor.getJSON();
// { type: 'doc', content: [
//   { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Judul' }] },
//   { type: 'paragraph', content: [
//     { type: 'text', text: 'Halo ' },
//     { type: 'text', marks: [{ type: 'bold' }], text: 'dunia' } ] },
//   { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', ... }] }] },
//   { type: 'image', attrs: { src: '/x.png', alt: '', size: 'wide' }, content: [/* keterangan */] },
//   { type: 'embed', attrs: { provider: 'youtube', id: '...' } },
//   { type: 'codeBlock', content: [...] }, { type: 'horizontalRule' } ] }
```

Node: `paragraph`, `heading` (level 2/3), `blockquote`, `bulletList`, `orderedList`, `listItem`,
`codeBlock`, `horizontalRule`, `image`, `embed`, `hardBreak`, `text`. Mark: `bold`, `italic`,
`code`, `link` (`href`). `toJSON(html)` dan `fromJSON(doc)` juga diekspor; `fromJSON` membuang
node/mark yang tidak dikenal dan selalu menyanitasi, jadi JSON dari sumber tak dipercaya tetap aman.

> Berubah di v2: format JSON v1 (`blocks` + `marks` rentang) tidak lagi didukung. HTML tidak berubah.

## Autosave

```html
<div x-data="wysiwyg({ name: 'body', autosave: 'post-42' })"></div>
```

Draf disimpan ke localStorage setiap ada perubahan (jeda 1 detik). Saat halaman dibuka lagi dan
ada draf yang berbeda, muncul banner **Pulihkan / Buang**; selama belum dipilih, draf lama tidak
ditimpa. Draf dihapus otomatis saat form induknya dikirim.

## Laravel

Komponen `<x-wysiwyg>`, controller upload, dan sanitasi server (HTMLPurifier) yang sudah diuji ada
di [`integrations/laravel`](integrations/laravel/README.md).

## Menampilkan hasil

Pakai class `afw-prose` agar tipografi sama dengan di editor:

```html
<article class="afw-prose">{!! $post->body !!}</article>
```

Tema gelap: `data-afw-theme="dark"` (atau `"auto"`) pada `.afw` maupun `.afw-prose`, atau class
`.dark` pada ancestor (Tailwind, Flux, Nuxt UI) yang langsung berlaku tanpa reload;
`data-afw-theme="light"` untuk tetap terang di dalam `.dark`.
Media ukuran penuh di `.afw-prose` melebar keluar sebesar `--afw-prose-bleed` (default `0`).

## Kustomisasi tampilan

Semua warna, font, dan ukuran memakai variabel CSS `--afw-*`:

```css
.afw, .afw-prose {
  --afw-accent: #e11d48;
  --afw-font-content: Georgia, serif;
  --afw-content-size: 1.25rem;
  --afw-quote-style: italic; /* kutipan miring (bawaan: normal) */
}
```

## Keamanan

Semua HTML yang masuk (paste, drop, `setHTML`) dan keluar (`getHTML`) melewati whitelist:

- Tag: `p h1 (mode artikel) h2–h6 (sesuai headings) blockquote ul ol li b i a code br pre figure img figcaption iframe hr`,
  plus `u s span mark` jika format tambahan aktif
- Format tambahan: `span[style=color]` & `mark[style=background-color]` hanya warna dari palet (hex),
  `class="afw-align-center|right|justify"` pada `p` & `h2`–`h6`
- Atribut: `a[href]` (http/https/mailto/tel/relatif), `img[src alt data-media-id]` (src divalidasi; data URL
  hanya PNG/JPG/GIF/WebP/AVIF; `data-media-id` hanya angka), `figure[data-size data-embed]`, iframe hanya YouTube/Vimeo
  dengan `src` yang dibangun ulang dari ID video.

> **Penting:** sanitasi di browser tidak menggantikan sanitasi di server. Request bisa dikirim
> tanpa melewati editor, jadi server wajib menyaring HTML sebelum menyimpan atau menampilkannya
> (mis. HTMLPurifier / `mews/purifier` di Laravel) dengan whitelist yang sama.

`sanitize()` juga bisa dipakai langsung:

```js
import { sanitize } from 'afwrite';
sanitize('<div style="x">Hai <script>x()</script><b>kamu</b></div>'); // '<p>Hai <b>kamu</b></p>'
```

## Dokumentasi

Situs dokumentasi lengkap (dengan editor yang bisa dicoba) ada di folder [`website/`](website/README.md):

```bash
cd website && npm install && npm run dev
```

## Pengembangan

```bash
npm install
npm run dev            # demo di http://localhost:5173
npm run build          # dist/
npm test               # unit test (Vitest)

npx playwright install chromium firefox webkit   # sekali saja
npm run test:browser                             # test browser di Chromium
npm run test:browser -- all                      # Chromium, Firefox, WebKit
```

Integrasi Laravel: `php artisan test --filter=WyswygTest` di proyek Laravel yang sudah memuat
file dari `integrations/laravel`.

Struktur:

```
src/
  core/        inti editor tanpa Alpine (engine Tiptap: schema, perintah, sanitasi, media, markdown)
  alpine.js    komponen Alpine: bubble, slash menu, toolbar media, input link
  template.js  markup UI default
  i18n.js      teks bahasa Indonesia & Inggris
  style.css    seluruh CSS (prefix afw)
demo/          halaman demo
integrations/  integrasi Laravel (Blade, upload, sanitasi server)
tests/         unit test (Vitest) & test browser (Playwright)
website/       situs dokumentasi (Nuxt UI Docs)
```

## Credit

Dibangun di atas [Tiptap](https://tiptap.dev), [ProseMirror](https://prosemirror.net), dan
[Alpine.js](https://alpinejs.dev) (semuanya berlisensi MIT). Ikon berbasis [Lucide](https://lucide.dev)
(ISC). Situs dokumentasi memakai template [Nuxt UI Docs](https://github.com/nuxt-ui-templates/docs)
(MIT, lisensinya di `website/LICENSE`).

## Lisensi

[MIT](LICENSE) © 2026 agungfwcoder
