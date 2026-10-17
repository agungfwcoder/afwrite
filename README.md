# wyswyg

Editor WYSIWYG modern berbasis **vanilla JS + Alpine.js**, ringan (~21 KB gzip) tanpa dependency lain.

- Bubble toolbar saat teks diblok, slash command `/`, tombol `+` di baris kosong
- Shortcut markdown: `##`, `>`, `-`, `1.`, `---`, `**tebal**`, `*miring*`, `` `kode` ``
- Gambar (upload, caption, alt text, 3 ukuran), video YouTube/Vimeo, pemisah
- Paste dari Word, Google Docs, dan web selalu bersih; output HTML ter-sanitasi
- Undo/redo andal, mode baca saja, `x-model`, bahasa Indonesia & Inggris
- CSS terisolasi dengan prefix `afw` — aman bersama Bootstrap, Tailwind, dll.
- Teruji di Chrome, Firefox, dan Safari (WebKit)

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
| `undo` / `redo` | Ctrl/⌘ + Z / Ctrl/⌘ + Shift + Z (atau Ctrl + Y) | |
| `unlink` | | |

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
| `getHTML()`, `setHTML(html, { resetHistory })`, `getText()`, `clear()`, `isEmpty()` | Isi |
| `insertHTML(html)`, `insertText(teks)`, `paste({ html, text, files })`, `insertImages(files)` | Sisipkan |
| `undo()`, `redo()`, `canUndo()`, `canRedo()` | Riwayat |
| `setReadOnly(bool)`, `focus()`, `stats()` | Lainnya |
| `on(event, fn)` → fungsi untuk berhenti, `off()`, `destroy()` | Event |

Event `Editor`: `change`, `state`, `selection`, `slash`, `history`, `readonly`, `linkrequest`,
`embedrequest`, `error`, `focus`, `blur`.

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

- Tag: `p h2 h3 blockquote ul ol li b i a code br figure img figcaption iframe hr`
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

Struktur:

```
src/
  core/        inti editor tanpa Alpine (editor, perintah, sanitasi, media, riwayat, markdown)
  alpine.js    komponen Alpine: bubble, slash menu, toolbar media, input link
  template.js  markup UI default
  i18n.js      teks bahasa Indonesia & Inggris
  style.css    seluruh CSS (prefix afw)
demo/          halaman demo
tests/         unit test (Vitest) & test browser (Playwright)
```

## Lisensi

MIT
