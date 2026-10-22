# Rencana: UI vanilla, Alpine jadi adapter

Tujuan: afwrite bisa dipakai **tanpa Alpine** (HTML biasa, React, Vue, Svelte, jQuery) dengan UI
yang sama persis, sementara pemakaian Alpine/Livewire tetap tidak berubah satu baris pun.

Dikerjakan di branch `ui-vanilla`. `main` tetap seperti sekarang sampai semua test lolos dan
dicoba manual.

## Kondisi sekarang

- `src/core/` (~3.400 baris: engine, sanitasi, media, perintah) **sudah tidak bergantung pada Alpine**.
- Ketergantungan Alpine hanya di `src/alpine.js` (~700 baris: state UI, posisi elemen melayang,
  bubble, media bar, palet, slash, tombol +, pegangan drag, aksesibilitas toolbar) dan
  `src/template.js` (markup dengan `x-for`, `x-show`, `:class`, `@click`, `x-ref`, `$nextTick`).

## Bentuk akhir

```
src/core/      mesin (tetap)
src/ui/        UI vanilla: membangun markup, memasang event, memperbarui tampilan dari state
src/afwrite.js API publik tanpa framework: create(el, options) -> instance
src/alpine.js  adapter tipis: Alpine.data('wysiwyg') membungkus create() + x-model / $wire
```

Pemakaian baru:

```js
import { create } from 'afwrite';
import 'afwrite/style.css';

const editor = create(document.querySelector('#body'), { name: 'body', upload });
editor.on('change', ({ html }) => { /* ... */ });
editor.destroy();
```

CDN: `Afwrite.create(el, options)`. Pemakaian Alpine lewat CDN dan bundler tetap seperti sekarang.

## Yang dipertahankan

- Tampilan & markup hasil akhir (`.afw-*`, class `afw-is-open` / `afw-is-ready`, role & aria):
  CSS tidak berubah
- API Alpine: `x-data="wysiwyg({...})"`, `x-modelable="html"`, `$wire.entangle`, method komponen
  (`exec`, `isActive`, `insertImage`, `replaceImage`, `getHTML/setHTML`, `getJSON/setJSON`,
  `setReadOnly`, `editor()`, ...), event `wysiwyg-*`
- Layout sendiri lewat `<div data-afw-editor x-ignore>`: state reaktif (`active`, `disabled`,
  `values`, `canUndo`, `stats`, `meta`, `html`) tetap tersedia di komponen Alpine
- Semua opsi yang ada di README
- Test browser 01–12 sebagai jaring pengaman, **tanpa diubah**

## Termin

### T1: fondasi `create()` & bagian statis
- `src/ui/dom.js`: helper kecil (buat elemen, pasang/lepas listener, toggle class, set style).
  Tanpa virtual DOM, tanpa dependency baru.
- `src/afwrite.js`: `create(el, options)` -> instance dengan `exec`, `isActive`, `getHTML/setHTML`,
  `getJSON/setJSON`, `getMeta`, `setReadOnly`, `focus`, `insertImage`, `replaceImage`, `on/off`,
  `destroy`, `editor` (instance `Editor`).
- Kerangka markup tanpa direktif Alpine di `src/ui/template.js`; daftar tombol dirender dari
  `TOOLBAR`/opsi. `src/template.js` (versi Alpine) dihapus di T4.
- Bagian statis: toolbar (status aktif/disabled, ikon perataan & judul), footer statistik,
  banner draf, input hidden `name` / `format` / `titleName`, hapus draf saat form dikirim,
  event DOM `wysiwyg-*` + callback `on()`.
- Test baru `13-vanilla.test.mjs` + halaman uji tanpa Alpine.

### T2: elemen melayang
- Fungsi `place()` dipindah ke `src/ui/position.js` (logika sama persis).
- Bubble 3 mode (format, input link/video/alt, info link), media bar (ukuran, ganti, alt, hapus),
  palet warna & perataan (klik di luar / Esc menutup), toast error.
- Pengganti `$nextTick`: ukur setelah class `afw-is-open` dipasang (sinkron) atau
  `requestAnimationFrame` di tempat yang memang perlu; urutan "buka -> ukur -> ready" dipertahankan.

### T3: slash menu, tombol +, drag, aksesibilitas
- Slash menu (posisi dikunci saat dibuka, scroll ke item aktif, `aria-activedescendant`).
- Tombol + di baris kosong, pegangan drag (hover, klik pilih blok, drag & drop, dragend di dokumen).
- Toolbar ARIA: satu tab stop, panah/Home/End.
- Test 13 diperluas: skenario utama 03, 04, 09, 10 dijalankan juga pada halaman tanpa Alpine.

### T4: Alpine jadi adapter (selesai)
Catatan: state dicerminkan tanpa membaca data Alpine (salinan di closure). Membaca `this.*` di
dalam render ikut tercatat sebagai dependensi effect aplikasi (mis. `x-effect="setReadOnly(...)"`
di demo), sehingga effect berjalan ulang dan menutup slash menu. `Alpine.raw` tidak menolong karena
`this` di method komponen adalah proxy gabungan Alpine, bukan proxy reaktif.
- `wysiwygComponent` memanggil `create()` lalu mencerminkan state ke data Alpine lewat satu event
  internal `state`, agar layout sendiri tetap reaktif.
- Markup UI bawaan diberi `x-ignore` (Alpine tidak memproses UI vanilla); mode `data-afw-editor`
  tetap seperti sekarang (hanya konten editor yang di-`x-ignore`).
- `x-model` / `$wire.entangle`: `$watch('html')` + perbandingan `normalizeHTML` tetap.
- Lolos `npm test`, `npm run test:browser -- all` (Chrome, Firefox, WebKit, bentrok
  Bootstrap/Tailwind), integrasi Laravel/Livewire.

### T5: build & wrapper framework
- Build ES: `create` diekspor; standalone CDN: `window.Afwrite.create` + pendaftaran plugin Alpine
  otomatis tetap ada.
- Cek ukuran bundle: target tidak lebih besar dari sekarang (~135 KB gzip).
- Contoh wrapper **di docs saja** (bukan paket terpisah, tanpa dependency React/Vue): React
  (`useRef` + `useEffect`), Vue (`onMounted`/`onBeforeUnmount` + `v-model`), HTML biasa.
- Dicoba dari aplikasi Vite terpisah untuk React dan Vue (seperti uji build v2).

### T6: docs & rilis
- Website: halaman "Tanpa Alpine", "React", "Vue"; landing & "Why afwrite" menyebut dukungan ini.
- README en/id, CHANGELOG, demo tanpa Alpine.
- Tes manual Android/iOS, merge ke `main`.

## Keputusan yang perlu disetujui

1. **Nama API**: `create(el, options)` (disarankan; `window.Afwrite` sudah berupa namespace,
   dan nama `Editor` sudah dipakai untuk inti) atau `new Afwrite(el, options)`.
2. **Versi**: mengikuti kebijakan sekarang, digabung ke 2.0.0 (belum ada pengguna). Alternatifnya
   2.1.0 karena ini penambahan API besar.
3. **Wrapper React/Vue**: hanya contoh di docs (disarankan) atau export `afwrite/react` dan
   `afwrite/vue` yang ikut dirawat dan dites.
4. **Alpine tetap peerDependency?** Disarankan dijadikan opsional (`peerDependenciesMeta`), karena
   tidak wajib lagi.

## Risiko

- Perbedaan waktu render (`$nextTick` vs manual) bisa membuat posisi bubble/menu meleset atau
  berkedip. Mitigasi: test browser yang sudah ada + screenshot sebelum/sesudah.
- Pengguna layout sendiri bergantung pada state Alpine; cermin state di T4 harus lengkap.
- Dua jalur listener (DOM event dan `on()`) jangan sampai memanggil handler dua kali.
