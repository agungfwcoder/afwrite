# Changelog

## 2.2.0 — 2026-10-20

### Baru
- `slugify(teks, { maxLength })`: slug untuk URL dari judul ("Café Pagi!" -> `cafe-pagi`). Hanya
  pratinjau; slug final tetap dibuat server
- `getMeta()` ikut mengembalikan `slug`, dan event `wysiwyg-change` kini membawa `{ html, meta }`
- Opsi `titleName`: input hidden berisi judul (`<h1>` artikel / teks pertama). Prop Blade `title-name`

## 2.1.0 — 2026-10-20

### Berubah
- Nama paket menjadi `afwrite` (sebelumnya `wyswyg`, nama yang di npm sudah dipakai paket lain):
  `import afwrite from 'afwrite'`, `import 'afwrite/style.css'`. Berkas build menjadi
  `dist/afwrite.js` & `dist/afwrite.css`. Komponen `x-data="wysiwyg(...)"`, event, dan nama di
  integrasi Laravel (`WyswygHtml`, route `wyswyg.upload`) tidak berubah
- `dist/` ikut di repo agar bisa dipasang dari GitHub dan dimuat lewat CDN

### Baru
- Build standalone `dist/afwrite.min.js` untuk `<script>` / CDN (jsDelivr), sudah berisi
  Tiptap/ProseMirror. Plugin terdaftar otomatis, API di `window.Afwrite`
- Opsi `headings` (bawaan `[2, 3]`): level judul H2–H6. Tombol toolbar & bubble (bubble paling
  banyak 2 level), slash menu, shortcut Ctrl/⌘+Alt+2…6, dan markdown `##`…`######` mengikuti
  level aktif; level lain diturunkan ke level aktif terdekat. Prop Blade `:headings`, dan
  `WyswygHtml::clean()` kini mengizinkan h2–h6
- `toJSON(html, options)` / `fromJSON(doc, options)` menerima `headings`
- Ikon H4, H5, H6 dan helper `withHeadings()` untuk menyusun toolbar sendiri
- Tepat dua level judul aktif (termasuk bawaan): tombolnya tampil sebagai **T** besar dan **t** kecil
  seperti Medium; tiga level atau lebih tetap H2/H3/…
- Opsi `title` (mode artikel ala Medium): baris pertama selalu judul `<h1>` (teks polos), dengan
  placeholder dan label "Judul/Subjudul" di margin kiri saat editor cukup lebar dan bloknya sudah
  berisi. Tombol judul kecil di baris tepat setelah judul membuat subjudul `<p class="afw-subtitle">` (teks + link); di
  tempat lain tetap judul bagian biasa. Format yang tidak berlaku tampil redup. Paste beberapa
  baris ke judul: baris pertama jadi judul, sisanya isi. Prop Blade `:title`, dan
  `WyswygHtml::clean()` mengizinkan `h1` & class `afw-subtitle`
- Mode artikel: gambar, video, dan pemisah boleh di atas judul (teks pertama tetap judul). Tombol
  `+` atau `/` di judul kosong (menu berisi Gambar/Video/Pemisah), atau tempel/seret gambar ke judul,
  memasangnya tepat di atas judul; kursor tetap di judul
- `getMeta()`: `{ image, title, subtitle }` dari gambar pertama, teks pertama, dan teks kedua,
  seperti preview cerita di Medium
- Pindah blok: pegangan ⋮⋮ muncul di kiri blok saat mouse di atasnya (satu slot dengan tombol `+`,
  yang kini 24px). Seret untuk memindah (penanda posisi & satu langkah undo), klik untuk memilih
  blok utuh. Ctrl/⌘+Shift+↑/↓ memindah blok lewat keyboard. Judul/subjudul artikel tidak ikut
  dipindah. Opsi `dragHandle: false` untuk mematikan pegangan. API `moveBlock()`, `selectBlock()`

## 2.0.0 — 2026-10-18

Engine baru: [Tiptap](https://tiptap.dev) 3 / [ProseMirror](https://prosemirror.net), menggantikan
`contenteditable` + `document.execCommand`. Tampilan, komponen Alpine, API `Editor`, event, dan
format HTML output tidak berubah, sehingga konten lama tetap terbaca.

### Berubah
- Perilaku mengetik, list, format, dan kursor ditangani ProseMirror: sama di semua browser,
  tanpa tambalan khusus Chrome/Safari
- JSON memakai format dokumen ProseMirror (`{ type: 'doc', content: [...] }`); format v1
  (`blocks` + `marks` rentang) tidak lagi didukung
- Build hanya modul ES; Tiptap/ProseMirror menjadi dependency (total sekitar 135 KB gzip di aplikasi)
- Build UMD (`<script>` tanpa bundler) dihapus

### Baru
- `editor.tiptap`: akses ke instance Tiptap untuk kebutuhan lanjutan
- Gap cursor (kursor di antara dua media) dan penanda posisi saat menyeret gambar

### Perbaikan
- Seleksi yang dipasang lewat script, atau tombol yang ditekan sangat cepat setelah
  Shift+Panah, kini selalu terbaca sebelum perintah dijalankan
- Drop HTML/teks dari luar memakai aturan yang sama dengan paste di semua browser

## 1.1.0 — 2026-10-17

### Termin 6: lanjutan
- Blok kode `<pre><code>`: ```` ``` ````, `/kode`, tombol toolbar, Ctrl/⌘+Alt+C; Enter, Tab,
  Shift+Tab, dan paste sebagai teks di dalam blok
- Model JSON: `getJSON()` / `setJSON()`, `toJSON()` / `fromJSON()`, opsi `format: 'json'`
- Autosave draf ke localStorage dengan banner Pulihkan / Buang
- Integrasi Laravel: komponen `<x-wysiwyg>`, controller upload, `WyswygHtml::clean()`
  (HTMLPurifier) beserta feature test
- Test: 115 unit test, 207 pemeriksaan browser per engine (Chromium, Firefox, WebKit)

## 1.0.0 — 2026-10-17

Rilis pertama.

### Termin 5: API & stabilitas
- Undo/redo dengan riwayat sendiri (ketikan beruntun digabung; operasi media ikut tercatat),
  tombol undo/redo di toolbar, dan dukungan menu Edit browser
- Mode baca saja (`readonly`, `setReadOnly()`)
- Dukungan `x-model` lewat `x-modelable="html"`, event `wysiwyg-ready/focus/blur/error`
- Bahasa Indonesia & Inggris (`lang`, `strings`)
- Class `.afw-prose` untuk menampilkan hasil dengan tipografi yang sama
- Aksesibilitas: navigasi toolbar dengan panah/Home/End, `aria-activedescendant` di slash menu
- API `editor.paste({ html, text, files })`
- Perbaikan Safari: posisi kursor setelah membuat list, mematikan list, ketikan setelah
  shortcut markdown, spasi saat paste
- Test browser di Chromium, Firefox, dan WebKit (`npm run test:browser -- all`)

### Termin 4: media
- Gambar (upload, caption, alt text, ukuran normal/lebar/penuh), video YouTube/Vimeo, pemisah

### Termin 3: UI modern
- Bubble toolbar, link inline, slash command, tombol `+`, shortcut markdown, statistik

### Termin 2: sanitasi & paste
- Sanitasi berbasis whitelist; paste dari Word/Google Docs/web dibersihkan

### Termin 1: editor dasar
- Format teks, heading, kutipan, list, link, shortcut keyboard, CSS terisolasi `afw`
