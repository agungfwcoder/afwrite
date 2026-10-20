# Saran perbaikan afwrite untuk integrasi CMS SIPAHAM

Daftar ini berasal dari upaya mengganti editor Tiptap buatan sendiri di CMS
(`~/Sites/BELAJAR/CMS`, Laravel 13 + Livewire 4 + Flux) dengan afwrite v2.0.0.
Isinya fitur yang kurang dan hal yang perlu disesuaikan supaya penggantian bisa
dilakukan **tanpa kehilangan data atau fitur**. Diurutkan dari yang paling
memblokir.

Kriteria lulus untuk semuanya: **round-trip stabil**. HTML yang diketik →
disimpan → dimuat ulang harus menghasilkan `getHTML()` yang identik, termasuk
setelah melewati sanitizer klien (`src/core/sanitize.js`) dan server
(`WyswygHtml::clean()`).

## Status (2026-10-20, digabung ke v2.0.0)

Semua butir tambahan hanya aktif di mode **Lengkap** dan **Sederhana**. Mode **Ala Medium**
(`title: true`) tetap seperti sebelumnya: bubble, output, dan shortcut tidak berubah.

| Butir | Status |
|---|---|
| A1 `data-media-id` | Selesai. Schema, sanitizer (hanya angka), `upload()` boleh mengembalikan `{ url, mediaId, alt }`, `getMeta().image.mediaId`, `WyswygHtml::clean()`, `window.wyswygUpload(url, { field })` |
| A2 hook `extensions` | Selesai. Opsi `extensions: []` + `sanitize: { allowTags, allowAttributes, allowClasses }`. `allowTags` hanya untuk tag inline |
| A3 Livewire 4 | Selesai. `wyswyg.js` tanpa `Alpine.start()`; watcher `html` membandingkan setelah dinormalisasi (`editor.normalizeHTML()`). Diuji Playwright di Laravel 13 + Livewire 4.4: x-model `$wire.body`, simpan → `clean()` → kursor tetap, reload identik, `wire:navigate` 5× tanpa listener/instance tertinggal |
| A4 dark `.dark` | Selesai. `.dark .afw`, `.dark .afw-prose`; `data-afw-theme="light"` untuk tetap terang |
| B1 perataan | Selesai. Output `class="afw-align-center|right|justify"` pada `p` & `h2`–`h6`; `ql-align-*`, `style="text-align"`, `align` ikut terbaca. Figure tidak (sudah punya ukuran normal/lebar/penuh) |
| B2 warna & stabilo | Selesai. `<span style="color: #hex">`, `<mark style="background-color: #hex">`, selalu hex, hanya dari palet (`colors`, `highlights`) |
| B3 garis bawah & coret | Selesai. ⌘U, ⌘⇧X. Coret hanya di toolbar (bubble tetap ringkas) |
| B4 H4–H5 | Sudah ada (`headings: [2, 3, 4, 5]`) |
| C1 tag baru per rilis | Tidak diikuti: sesuai keputusan pemilik, semua tetap di v2.0.0 |
| C2 `strong` → `b` | Didokumentasikan di CHANGELOG |
| C3 tes round-trip | Selesai. `tests/formats.test.js` (fixture C3 + hasil HTMLPurifier) dan `tests/browser/10-format.test.mjs` |
| D (sisi CMS) | Belum, dikerjakan di repo CMS |

Catatan untuk D: `SanitizesHtml.php` di CMS perlu mengizinkan class `afw-align-*` (bukan
`ql-align-*`), `u`, `s`, `span[style=color]`, `mark[style=background-color]`, dan
`img[data-media-id]`. Contohnya ada di `integrations/laravel/app/Support/WyswygHtml.php`.

---

## A. Wajib (memblokir migrasi)

### A1. Pertahankan `data-media-id` pada gambar

**Kenapa:** CMS menyimpan ID Media Library di `<img data-media-id="42">`.
Tombol "Jadikan Gambar Utama" memakainya untuk menjadikan gambar di badan
artikel sebagai featured image. Saat ini afwrite membuang atribut itu, jadi
fiturnya mati dan ID yang sudah tersimpan di DB hilang saat konten dibuka lalu
disimpan ulang.

**Yang diubah:**
- `src/core/schema.js`, node `Image` (sekitar baris 118-150):
  - tambah atribut `mediaId: { default: null }`;
  - `parseHTML` membaca `img.getAttribute('data-media-id')`;
  - `renderHTML` menulis `data-media-id` hanya kalau nilainya ada.
- `src/core/sanitize.js`, `imageFigure()` (sekitar baris 206) dan whitelist
  atribut `<img>`: izinkan `data-media-id`, divalidasi hanya angka
  (`/^\d+$/`).
- `src/core/media.js`, `insertImageFiles()` (sekitar baris 138-175): kontrak
  `upload(file)` sekarang `Promise<string>`. Terima juga
  `Promise<{ url, mediaId?, alt? }>` (tetap kompatibel kalau yang dikembalikan
  string), lalu set `mediaId` ke node.
- `integrations/laravel/`: `WyswygHtml::clean()` mengizinkan
  `img[data-media-id]`. Opsional: controller upload mengembalikan `mediaId`.

**Output yang diharapkan:**
```html
<figure><img src="/storage/a.jpg" alt="" data-media-id="42"><figcaption>Gambar 1</figcaption></figure>
```

**Uji:** `setHTML` dengan gambar ber-`data-media-id` → `getHTML()` tetap
memuatnya. Upload yang mengembalikan `{url, mediaId}` menghasilkan atributnya.
Nilai non-angka (`data-media-id="x onerror"`) dibuang.

### A2. Hook `extensions` untuk menambah ekstensi Tiptap dari luar

**Kenapa:** daftar ekstensi di `src/core/editor.js` (sekitar baris 649) di-hardcode.
Aplikasi tidak bisa menambah node atau mark sendiri tanpa fork. Dengan hook
ini, kebutuhan khusus aplikasi (misalnya B1–B3 di bawah, atau node lain nanti)
bisa ditambah tanpa mengubah library.

**Yang diubah:** opsi baru `extensions: []`, digabung setelah
`createExtensions(...)`. Sanitizer juga perlu bisa diperluas, karena semua yang
tidak ada di whitelist dibuang saat paste, `setHTML` dan `getHTML`. Usulannya
opsi `sanitize: { allowTags, allowAttributes, allowClasses }` atau callback
`sanitizeHook(node)`.

**Uji:** ekstensi mark sederhana yang dipasang lewat opsi bisa diterapkan dan
lolos round-trip.

### A3. Integrasi Livewire 4 yang teruji

**Kenapa:** contoh di `website/content/3.integrasi/2.livewire.md` dan
`integrations/laravel/README.md` ditulis untuk Livewire 3 dan belum diuji.
Selain itu `integrations/laravel/resources/js/wyswyg.js` memanggil
`Alpine.start()` sendiri, padahal Livewire 4 sudah membawa dan menjalankan
Alpine-nya sendiri. Akibatnya ada dua Alpine yang bentrok.

**Yang diubah:**
- Dokumentasikan pola untuk Livewire: tanpa import Alpine, cukup
  `document.addEventListener('alpine:init', () => window.Alpine.plugin(afwrite))`.
  Atau cukup `import 'afwrite'`, karena `src/index.js` sudah mendaftarkan
  dirinya sendiri.
- Contoh Blade untuk Livewire 4: `wire:ignore` + `x-modelable="html"` +
  `$wire.entangle()`, atau sinkron saat submit.
- Uji dengan `wire:navigate`: pindah halaman bolak-balik tidak boleh
  meninggalkan listener atau instance. `destroy()` sudah ada, tinggal
  dibuktikan.
- Kasus khusus: setelah submit, server mengembalikan HTML yang sudah dibersihkan
  (`WyswygHtml::clean`) dan bisa sedikit berbeda dari `getHTML()`. Watcher
  `html` (`src/alpine.js` sekitar baris 173) lalu memanggil `setHTML`, sehingga
  kursor melompat. Usulan: bandingkan setelah dinormalisasi (lewat sanitize
  klien) sebelum memanggil `setHTML`, atau sediakan opsi untuk mematikannya.

**Uji (Playwright):** halaman Livewire 4 dengan `wire:model` → ketik → submit →
reload → konten identik. Lalu navigasi `wire:navigate` keluar-masuk 5× tanpa
error dan tanpa instance ganda.

### A4. Dark mode mengikuti class `.dark` di `<html>`

**Kenapa:** Flux dan Tailwind memakai class `.dark` di `<html>`. afwrite hanya
mengenal `data-afw-theme="dark|auto"` (`src/style.css` sekitar baris 71-94),
jadi di aplikasi Flux editornya tetap terang saat aplikasi gelap.

**Yang diubah:** tambah selector `.dark .afw, .dark .afw-prose` yang memakai
variabel gelap yang sama. Atau sediakan mode `data-afw-theme="class"` yang
mengikuti `.dark` pada ancestor.

**Uji:** toggle `.dark` di `<html>` langsung mengubah tampilan tanpa reload.

---

## B. Fitur toolbar yang kurang (dipakai editor CMS sekarang)

Konten di DB saat ini belum memakai fitur-fitur ini, tapi toolbar CMS
menyediakannya. Kalau mau dipertahankan, ini yang perlu ditambahkan. Semuanya
sebaiknya bisa dimatikan lewat `toolbarItems`/`bubbleItems`, dan tetap lolos
sanitizer klien maupun server.

### B1. Perataan teks (kiri / tengah / kanan / rata kanan-kiri)
- Berlaku untuk paragraf, heading, dan figure.
- **Kompatibilitas:** konten lama di CMS memakai class `ql-align-center|right|justify`
  (warisan Quill). Saran: output tetap pakai class itu, atau `parseHTML` minimal
  menerima `ql-align-*` lalu menulis format afwrite sendiri (misalnya
  `data-align="center"`). Pilihannya harus tetap stabil, karena CMS akan
  menyesuaikan CSS dan sanitizer servernya.
- Hindari inline `style="text-align"`, karena sanitizer CMS hanya mengizinkan
  `color` dan `background-color`.

### B2. Warna teks & highlight (stabilo)
- Mark `color` → `<span style="color: #e11d48">`, dan mark `highlight` →
  `<mark style="background-color: #fef08a">`.
- **Normalisasi serialisasi:** browser mengubah `#fef08a` menjadi
  `rgb(254, 240, 138)` dan menambah `;` di akhir. Simpan nilai dalam satu
  format (hex), supaya HTML sebelum simpan dan sesudah reload sama persis.
  Masalah ini juga terjadi di editor CMS saat ini.
- Batasi ke palet yang ditentukan (opsi `colors: [...]`) dan validasi nilainya
  di sanitizer (hex/rgb saja).

### B3. Garis bawah & coret
- `<u>` dan `<s>`, dengan shortcut ⌘U dan ⌘⇧X.

### B4. (Opsional) Heading level 4–5
- CMS memakai `h2`–`h5`. afwrite default `headings: [2,3]`, tapi opsinya sudah
  ada. Cukup pastikan `h4` dan `h5` tampil rapi di toolbar, slash menu, dan
  `.afw-prose`.

---

## C. Distribusi & stabilitas

### C1. Rilis bertag yang tidak berubah
**Kenapa:** catatan di CHANGELOG menyebut perubahan kecil masih dimasukkan ke
2.0.0, sehingga `#semver:^2` bisa berubah diam-diam. CMS akan memasang lewat
commit yang dipin, dan itu lebih aman kalau setiap perubahan mendapat tag baru.

**Saran:** naikkan versi patch/minor setiap rilis (2.0.1, 2.1.0, …) dan jangan
memindahkan tag yang sudah ada. Pertimbangkan publish ke npm supaya
instalasinya `npm i afwrite@2.1.0`.

### C2. Konsistensi tag inline
afwrite menulis `<b>`/`<i>`, sedangkan konten lama CMS memakai
`<strong>`/`<em>`. Parsing sudah menerima keduanya, jadi aman. Hanya perlu
didokumentasikan bahwa membuka konten lama lalu menyimpannya akan mengubah
`strong` → `b` di DB (bukan bug, tapi akan terlihat sebagai perubahan di diff
dan audit).

### C3. Tes round-trip idempoten
Tambahkan tes unit (vitest) dan browser: untuk setiap fixture HTML,
`getHTML(setHTML(x)) === getHTML(setHTML(getHTML(setHTML(x))))`. Lakukan juga
pada output `WyswygHtml::clean()`. Fixture minimal:
- heading, list bersarang, blockquote, code block multi-baris;
- link dengan `target`/`rel`;
- figure + caption + `data-media-id` + `data-size`;
- embed video;
- karakter khusus (`& < > " —`, emoji, é);
- paste dari Word dan Google Docs;
- fitur B1–B3 kalau ditambahkan.

---

## D. Catatan untuk sisi CMS (dikerjakan nanti di repo CMS, bukan di afwrite)

Bukan tugas afwrite, dicatat supaya tidak terlupa saat migrasi:
- `app/Concerns/SanitizesHtml.php` harus mengizinkan output afwrite: `hr`,
  `figure[data-size]`, iframe embed (YouTube-nocookie/Vimeo saja, src dibangun
  ulang dari ID), `p.afw-subtitle` kalau mode artikel dipakai, dan format
  perataan dari B1.
- Endpoint upload CMS (`route('posts.upload')`) memakai field `file` dan
  mengembalikan `{url, mediaId}`. Helper `window.wyswygUpload` memakai field
  `image` dan hanya membaca `url`. Salah satu perlu disesuaikan (lihat A1).
- Tiga editor yang akan diganti semuanya lewat `<x-rich-text-editor>`: konten
  berita, deskripsi pelatihan, dan pertanyaan soal. Sinkron saat submit saat
  ini memakai `window._tiptapInstances[model].getHTML()` dan harus diganti
  dengan `Alpine.$data(el).getHTML()`.
- Halaman publik (`⚡berita-show`) memakai class `.prose-berita` dan daftar isi
  dari heading. Perlu dicek terhadap `.afw-prose`.
- Uji round-trip CMS: skrip Playwright (login → ketik + paste → simpan → reload →
  bandingkan HTML `$wire` sebelum/sesudah) dibuat saat analisis ini. Pakai
  Chrome sistem (`channel: 'chrome'`), karena browser bawaan Playwright 1.64
  belum terunduh. Hasil baseline
  dengan Tiptap saat ini: `data-color` pada `<mark>` dan `nofollow` pada `rel`
  hilang setelah reload, dan class `ql-align-*` hilang saat paste.
