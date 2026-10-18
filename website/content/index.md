---
seo:
  title: Editor WYSIWYG modern untuk Alpine.js
  description: Editor WYSIWYG ala Medium untuk Alpine.js dan Laravel, dengan engine Tiptap/ProseMirror, output HTML yang selalu bersih, dan CSS yang tidak bentrok dengan framework lain.
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
Editor WYSIWYG yang [tidak mengganggu]{.text-primary}.

#description
Editor ala Medium untuk Alpine.js: bubble toolbar, slash command, shortcut markdown, gambar & video. Engine Tiptap/ProseMirror membuat perilaku mengetik sama di semua browser, dan output HTML-nya selalu bersih.

#links
  :::u-button
  ---
  to: /memulai
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Mulai
  :::

  :::u-button
  ---
  icon: i-lucide-play
  color: neutral
  variant: outline
  size: xl
  to: /memulai/demo
  ---
  Coba editornya
  :::

#default
  :::prose-pre
  ---
  code: |
    <form method="post">
      <div x-data="wysiwyg({ name: 'body' })">
        <p>Mulai menulis…</p>
      </div>
      <button>Simpan</button>
    </form>
  filename: form.html
  ---

  ```html [form.html]
  <form method="post">
    <div x-data="wysiwyg({ name: 'body' })">
      <p>Mulai menulis…</p>
    </div>
    <button>Simpan</button>
  </form>
  ```
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Menulis tanpa gangguan

#links
  :::u-button
  ---
  color: neutral
  size: lg
  to: /memulai/demo
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  Lihat demo
  :::

#features
  :::u-page-feature
  ---
  icon: i-lucide-mouse-pointer-click
  ---
  #title
  Bubble toolbar

  #description
  Blok teks untuk tebal, miring, link, dan judul. Toolbar atas bisa dimatikan agar tampilan sepenuhnya ala Medium.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-slash
  ---
  #title
  Slash command & tombol +

  #description
  Ketik `/` atau klik `+` di baris kosong untuk memilih judul, kutipan, list, kode, gambar, video, atau pemisah.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-markdown
  ---
  #title
  Shortcut markdown

  #description
  `##`, `>`, `-`, `1.`, `---`, ```` ``` ````, `**tebal**`, `*miring*`, dan `` `kode` `` langsung berubah format saat mengetik.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-image
  ---
  #title
  Gambar & video

  #description
  Upload, keterangan, alt text, tiga ukuran, seret file, tempel screenshot, serta video YouTube dan Vimeo.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-shield-check
  ---
  #title
  Output selalu bersih

  #description
  Paste dari Word, Google Docs, atau web disaring whitelist. Tersedia sanitasi server untuk Laravel (HTMLPurifier).
  :::

  :::u-page-feature
  ---
  icon: i-lucide-layers
  ---
  #title
  CSS tidak bentrok

  #description
  Semua class dan variabel memakai prefix `afw`, aman bersama Bootstrap 5, Tailwind, dan framework lain.
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Siap untuk aplikasi sungguhan

#features
  :::u-page-feature
  ---
  icon: i-lucide-cpu
  ---
  #title
  Engine Tiptap / ProseMirror

  #description
  Mengetik, list, format, dan kursor konsisten di Chrome, Firefox, dan Safari, tanpa tambalan khusus per browser.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-laravel
  ---
  #title
  Integrasi Laravel

  #description
  Komponen `<x-wysiwyg>`, controller upload, sanitasi server, dan contoh Livewire.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-save
  ---
  #title
  Autosave draf

  #description
  Draf tersimpan di localStorage dengan banner Pulihkan / Buang saat halaman dibuka lagi.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-braces
  ---
  #title
  HTML atau JSON

  #description
  Simpan sebagai HTML bersih atau JSON dokumen ProseMirror. Keduanya bisa dimuat ulang dengan aman.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-languages
  ---
  #title
  Indonesia & Inggris

  #description
  Semua teks antarmuka tersedia dalam dua bahasa dan bisa ditimpa satu per satu.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-test-tube
  ---
  #title
  Teruji

  #description
  Unit test, test browser otomatis di Chromium, Firefox, dan WebKit, serta feature test Laravel.
  :::
::

::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: Instalasi
      to: '/memulai/instalasi'
      trailingIcon: i-lucide-arrow-right
    - label: Coba editornya
      to: '/memulai/demo'
      variant: subtle
      icon: i-lucide-play
  title: Siap mencoba?
  description: Pasang lewat npm, tambahkan satu atribut x-data, dan editor siap dipakai di form Anda.
  class: dark:bg-neutral-950
  ---

  :stars-bg
  :::
::
