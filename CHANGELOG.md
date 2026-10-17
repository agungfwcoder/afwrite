# Changelog

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
