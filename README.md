# wyswyg

Editor WYSIWYG modern berbasis **vanilla JS + Alpine.js**, ringan (~25 KB gzip) tanpa dependency lain.

- Bubble toolbar saat teks diblok, slash command `/`, tombol `+` di baris kosong
- Shortcut markdown: `##`, `>`, `-`, `1.`, `---`, `**tebal**`, `*miring*`, `` `kode` ``
- Gambar (upload, caption, alt text, 3 ukuran), video YouTube/Vimeo, pemisah, blok kode
- Output HTML atau JSON (model blok + mark), autosave draf ke localStorage
- Paste dari Word, Google Docs, dan web selalu bersih; output HTML ter-sanitasi
- Undo/redo andal, mode baca saja, `x-model`, bahasa Indonesia & Inggris
- CSS terisolasi dengan prefix `afw` — aman bersama Bootstrap, Tailwind, dll.
- Teruji di Chrome, Firefox, dan Safari (WebKit); integrasi Laravel siap pakai

## Instalasi

```bash
npm install wyswyg alpinejs
```

```js
import Alpine from 'alpinejs';
import wyswyg from 'wyswyg';
import 'wyswyg/style.css';

Alpine.plugin(wyswyg);
Alpine.start();
```

Lewat `<script>` (tanpa bundler) — plugin terdaftar otomatis:

```html
<link rel="stylesheet" href="dist/wyswyg.css">
<script src="dist/wyswyg.umd.cjs"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
```

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
| `lang` | `'id'` | Bahasa antarmuka: `'id'` atau `'en'` |
| `strings` | `{}` | Timpa sebagian teks, mis. `{ placeholder: 'Tulis…' }` (lihat `src/i18n.js`) |
| `placeholder` | dari `lang` | Teks saat editor kosong |
| `toolbar` | `true` | Toolbar di atas; `false` = hanya bubble (ala Medium) |
| `bubble` | `true` | Bubble toolbar saat teks diblok |
| `stats` | `true` | Jumlah kata & waktu baca |
| `readonly` | `false` | Mode baca saja |
| `upload` | `null` | `async (file) => url`. Tanpa ini gambar disimpan sebagai base64 |
| `maxImageSize` | `5 MB` | Batas ukuran gambar (byte); `0` = tanpa batas |
| `allowDataImages` | `true` | Izinkan `<img src="data:image/…">` di output |
| `markdown` | `true` | Shortcut markdown |
| `slash` | `true` | Slash menu |
| `pasteAsPlainText` | `false` | Buang semua format saat paste |
| `toolbarItems`, `bubbleItems` | bawaan | Susunan tombol (lihat `src/icons.js`) |
| `historyLimit` | `100` | Jumlah langkah undo |
| `format` | `'html'` | Isi input hidden: `'html'` atau `'json'` |
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
| `getJSON()` / `setJSON(doc)` | Isi sebagai model JSON |
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

`wysiwyg-ready` (`{ editor }`), `wysiwyg-change` (`{ html }`), `wysiwyg-focus`, `wysiwyg-blur`,
`wysiwyg-error` (`{ message }`).

### Perintah & shortcut

| Perintah | Shortcut | Markdown |
|---|---|---|
| `bold` / `italic` | Ctrl/⌘ + B / I | `**teks**` / `*teks*` |
| `link` | Ctrl/⌘ + K | tempel URL di atas teks terseleksi |
| `h2` / `h3` | Ctrl/⌘ + Alt + 2 / 3 | `## ` / `### ` |
| `paragraph` | Ctrl/⌘ + Alt + 0 | |
| `quote` | Ctrl/⌘ + Shift + 9 | `> ` |
| `ul` / `ol` | Ctrl/⌘ + Shift + 8 / 7 | `- ` / `1. ` |
| `indent` / `outdent` | Tab / Shift + Tab (di dalam list) | |
| `image` | | `/gambar`, seret file, tempel screenshot |
| `embed` | | `/video`, tempel link YouTube di baris kosong |
| `hr` | | `--- ` |
| `codeblock` | Ctrl/⌘ + Alt + C | ```` ``` ```` + spasi, `/kode` |
| `undo` / `redo` | Ctrl/⌘ + Z / Ctrl/⌘ + Shift + Z (atau Ctrl + Y) | |
| `unlink` | | |

Di dalam blok kode: **Enter** = baris baru, **Tab / Shift+Tab** = indentasi, **Enter** di baris
kosong terakhir = keluar dari blok, paste selalu sebagai teks.

Saat gambar/video/pemisah dipilih: **Backspace/Delete** menghapus, **Enter** membuat paragraf
baru di bawahnya, **panah** keluar dari media.

## Tanpa Alpine

Inti editor tidak bergantung pada Alpine (tanpa UI melayang; link & video memakai `prompt()`):

```js
import { Editor } from 'wyswyg';
import 'wyswyg/style.css';

const editor = new Editor(document.querySelector('#editor'), { lang: 'en' });
editor.on('change', (html) => (input.value = html));
document.querySelector('#bold').onclick = () => editor.exec('bold');
```

Elemen `#editor` perlu dibungkus elemen berclass `afw` agar style berlaku.

| API `Editor` | Keterangan |
|---|---|
| `exec(nama, ...arg)`, `isActive(nama)`, `state()` | Perintah & status format |
| `getHTML()`, `setHTML(html, { resetHistory })`, `getJSON()`, `setJSON(doc)`, `getText()`, `clear()`, `isEmpty()` | Isi |
| `insertHTML(html)`, `insertText(teks)`, `paste({ html, text, files })`, `insertImages(files)` | Sisipkan |
| `undo()`, `redo()`, `canUndo()`, `canRedo()` | Riwayat |
| `restoreDraft()`, `discardDraft()`, `clearDraft()`, `draft` | Autosave |
| `setReadOnly(bool)`, `focus()`, `stats()` | Lainnya |
| `on(event, fn)` → fungsi untuk berhenti, `off()`, `destroy()` | Event |

Event `Editor`: `change`, `state`, `selection`, `slash`, `history`, `readonly`, `linkrequest`,
`embedrequest`, `error`, `focus`, `blur`.

## Format JSON

```js
editor.getJSON();
// { type: 'doc', version: 1, blocks: [
//   { type: 'heading', level: 2, text: 'Judul', marks: [] },
//   { type: 'paragraph', text: 'Halo dunia', marks: [{ type: 'bold', start: 5, end: 10 }] },
//   { type: 'list', style: 'bullet', items: [{ text: 'satu', marks: [] }] },
//   { type: 'image', src: '/x.png', alt: '', size: 'wide', caption: { text: '...', marks: [] } },
//   { type: 'embed', provider: 'youtube', id: '...' }, { type: 'code', text: '...' }, { type: 'divider' } ] }
```

Format inline disimpan sebagai rentang karakter (`bold`, `italic`, `code`, `link` + `href`),
cocok untuk dirender di platform lain. `toJSON(html)` dan `fromJSON(doc)` juga diekspor;
`fromJSON` selalu menyanitasi, jadi JSON dari sumber tak dipercaya tetap aman.

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

Tema gelap: `data-afw-theme="dark"` (atau `"auto"`) pada `.afw` maupun `.afw-prose`.
Media ukuran penuh di `.afw-prose` melebar keluar sebesar `--afw-prose-bleed` (default `0`).

## Kustomisasi tampilan

Semua warna, font, dan ukuran memakai variabel CSS `--afw-*`:

```css
.afw, .afw-prose {
  --afw-accent: #e11d48;
  --afw-font-content: Georgia, serif;
  --afw-content-size: 1.25rem;
}
```

## Keamanan

Semua HTML yang masuk (paste, drop, `setHTML`) dan keluar (`getHTML`) melewati whitelist:

- Tag: `p h2 h3 blockquote ul ol li b i a code br pre figure img figcaption iframe hr`
- Atribut: `a[href]` (http/https/mailto/tel/relatif), `img[src alt]` (src divalidasi; data URL
  hanya PNG/JPG/GIF/WebP/AVIF), `figure[data-size data-embed]`, iframe hanya YouTube/Vimeo
  dengan `src` yang dibangun ulang dari ID video.

> **Penting:** sanitasi di browser tidak menggantikan sanitasi di server. Request bisa dikirim
> tanpa melewati editor, jadi server wajib menyaring HTML sebelum menyimpan atau menampilkannya
> (mis. HTMLPurifier / `mews/purifier` di Laravel) dengan whitelist yang sama.

`sanitize()` juga bisa dipakai langsung:

```js
import { sanitize } from 'wyswyg';
sanitize('<div style="x">Hai <script>x()</script><b>kamu</b></div>'); // '<p>Hai <b>kamu</b></p>'
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
  core/        inti editor tanpa Alpine (editor, perintah, sanitasi, media, riwayat, markdown)
  alpine.js    komponen Alpine: bubble, slash menu, toolbar media, input link
  template.js  markup UI default
  i18n.js      teks bahasa Indonesia & Inggris
  style.css    seluruh CSS (prefix afw)
demo/          halaman demo
integrations/  integrasi Laravel (Blade, upload, sanitasi server)
tests/         unit test (Vitest) & test browser (Playwright)
```

## Lisensi

MIT
