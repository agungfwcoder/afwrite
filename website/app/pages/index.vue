<script setup lang="ts">
// Landing page. Layout mengikuti halaman depan Nuxt UI: hero (teks + kartu editor bertab), panel showcase berisi
// kartu-kartu demo fitur (masonry) dan tab "Coba langsung", lalu CTA dan footer. Warna: emerald + zinc.
// Teks SEO diambil dari content/index.md.
import { useClipboard } from '@vueuse/core'
import { BRAND, SLOGAN } from '~~/brand'
import { slugify } from '../../../src/core/slug.js'

const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })
}

const title = `${BRAND} — ${page.value.seo?.title || page.value.title}`
const description = page.value.seo?.description || page.value.description

// Gambar OG landing memakai nama tetap (public/og.png), bukan hasil defineOgImage yang namanya berganti tiap isinya
// berubah: WhatsApp dkk. menyimpan alamat gambar lama, dan alamat yang hilang membuat pratinjau link kosong.
// Gambar ini dirender dari template OgImage/Docs (judul SLOGAN, headline BRAND); salin ulang jika slogan berubah.
const ogImage = unref(createSitePathResolver({ absolute: true, withBase: true })('/og.png'))

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: { url: ogImage, width: 1200, height: 630, type: 'image/png', alt: `${BRAND} — ${SLOGAN}` },
  twitterCard: 'summary_large_image',
  twitterImage: ogImage
})

const REPO = 'https://github.com/agungfwcoder/afwrite'
const base = useRuntimeConfig().app.baseURL

const { copy, copied } = useClipboard()

// Atribut bersama untuk ikon garis.
const svgAttrs = {
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'aria-hidden': 'true'
}

// Ikon garis (24×24, stroke) yang dipakai di halaman ini.
const ICON = {
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  play: '<path d="M7 4v16l13-8Z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  quote: '<path d="M7 7h4v6H5V9a2 2 0 0 1 2-2Zm0 6c0 2-1 4-3 4"/><path d="M17 7h4v6h-6V9a2 2 0 0 1 2-2Zm0 6c0 2-1 4-3 4"/>',
  headingLarge: '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9.5 19h5"/>',
  headingSmall: '<path d="M8 12v-1.5h8V12"/><path d="M12 10.5V19"/><path d="M10.5 19h3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  listOrdered: '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  minus: '<path d="M5 12h14"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  pencil: '<path d="M21.2 6.8a2.8 2.8 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5Z"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'
}

// Token pewarnaan kode: [teks, kelas warna]; baris = array token.
type Token = [string, string?]
const T = { tag: 'text-pink-600 dark:text-pink-400', attr: 'text-emerald-600 dark:text-emerald-300', str: 'text-emerald-700 dark:text-emerald-300', kw: 'text-violet-600 dark:text-violet-300', dim: 'text-zinc-400 dark:text-zinc-500' }

// Kartu hero: tab "Editor" (mockup animasi) dan contoh kode.
const tabs: { name: string, dot: string, lines: Token[][] }[] = [
  {
    name: 'form.html',
    dot: 'bg-orange-400',
    lines: [
      [['<form', T.tag], [' '], ['method', T.attr], ['='], ['"post"', T.str], ['>', T.tag]],
      [['  <div', T.tag], [' '], ['x-data', T.attr], ['='], ['"wysiwyg({ name: \'body\' })"', T.str], ['>', T.tag]],
      [['    <p>', T.tag], ['Mulai menulis…'], ['</p>', T.tag]],
      [['  </div>', T.tag]],
      [['  <button>', T.tag], ['Simpan'], ['</button>', T.tag]],
      [['</form>', T.tag]]
    ]
  },
  {
    name: 'app.js',
    dot: 'bg-yellow-400',
    lines: [
      [['import', T.kw], [' Alpine '], ['from', T.kw], [' '], ['\'alpinejs\'', T.str]],
      [['import', T.kw], [' afwrite '], ['from', T.kw], [' '], ['\'afwrite\'', T.str]],
      [['import', T.kw], [' '], ['\'afwrite/style.css\'', T.str]],
      [['']],
      [['Alpine.plugin(afwrite)']],
      [['Alpine.start()']]
    ]
  },
  {
    name: 'edit.blade.php',
    dot: 'bg-red-400',
    lines: [
      [['<form', T.tag], [' '], ['method', T.attr], ['='], ['"post"', T.str], ['>', T.tag]],
      [['  @csrf', T.kw]],
      [['  <x-wysiwyg', T.tag], [' '], ['name', T.attr], ['='], ['"body"', T.str]],
      [['    '], [':value', T.attr], ['='], ['"$post->body"', T.str], [' '], ['/>', T.tag]],
      [['  <button>', T.tag], ['Simpan'], ['</button>', T.tag]],
      [['</form>', T.tag]]
    ]
  }
]
const heroTab = ref(-1) // -1 = Editor

// Logo brand di baris "Bekerja dengan".
const works = [
  { name: 'Alpine.js', icon: 'i-simple-icons-alpinedotjs' },
  { name: 'Laravel', icon: 'i-simple-icons-laravel' },
  { name: 'Livewire', icon: 'i-simple-icons-livewire' },
  { name: 'Bootstrap 5', icon: 'i-simple-icons-bootstrap' },
  { name: 'Tailwind CSS', icon: 'i-simple-icons-tailwindcss' }
]

// Mockup editor "hidup": judul diketik, teks diblok & ditebalkan, slash menu dipilih, berulang.
// Keadaan awal (SSR / tanpa JS / kurangi gerakan) = tampilan statis desain.
const DEMO_TITLE = 'Catatan untuk tim redaksi'
const demo = reactive({ running: false, title: DEMO_TITLE, caret: '' as '' | 'title' | 'slash', selected: true, bubble: true, bold: true, slash: true, menu: true, active: 0 })
let demoStopped = false
const wait = (ms: number) => new Promise<void>((resolve, reject) => setTimeout(() => (demoStopped ? reject(new Error('stop')) : resolve()), ms))

async function playDemo() {
  Object.assign(demo, { running: true, title: '', caret: 'title', selected: false, bubble: false, bold: false, slash: false, menu: false, active: 0 })
  for (;;) {
    await wait(500)
    for (const char of DEMO_TITLE) {
      demo.title += char
      await wait(char === ' ' ? 90 : 55)
    }
    await wait(600)
    demo.caret = ''
    demo.selected = true
    await wait(650)
    demo.bubble = true
    await wait(700)
    demo.bold = true
    await wait(900)
    Object.assign(demo, { bubble: false, selected: false, slash: true, caret: 'slash' })
    await wait(400)
    demo.menu = true
    for (const index of [1, 2, 3, 2]) {
      await wait(650)
      demo.active = index
    }
    await wait(1400)
    Object.assign(demo, { menu: false, slash: false, caret: 'title', bold: false, active: 0 })
    await wait(500)
    while (demo.title) {
      demo.title = demo.title.slice(0, -1)
      await wait(22)
    }
  }
}

// Panel showcase: "fitur" (kartu demo) atau "coba" (editor sungguhan). #coba di URL membuka tab kedua.
const showcase = ref<'fitur' | 'coba'>('fitur')

// Animasi reveal: elemen [data-reveal] di bawah layar disembunyikan lalu muncul saat di-scroll.
// Yang sudah terlihat saat halaman dibuka dibiarkan (tanpa kedip); hero memakai animasi CSS.
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (location.hash === '#coba') showcase.value = 'coba'
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  playDemo().catch(() => {})
  if (!('IntersectionObserver' in window)) return
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const el = entry.target as HTMLElement
      el.classList.add('is-revealed')
      observer?.unobserve(el)
      // Setelah selesai, kembalikan transisi bawaan elemen (mis. hover kartu).
      el.addEventListener('transitionend', () => el.classList.remove('reveal', 'is-revealed'), { once: true })
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })

  for (const el of document.querySelectorAll<HTMLElement>('.landing [data-reveal]')) {
    if (el.getBoundingClientRect().top < window.innerHeight) continue
    el.classList.add('reveal')
    observer.observe(el)
  }
})
onBeforeUnmount(() => {
  observer?.disconnect()
  demoStopped = true
})

// Varian editor di tab "Coba langsung".
const variants = [
  {
    name: 'Artikel ala Medium',
    hint: 'Judul & subjudul otomatis, hanya bubble toolbar. Blok teks untuk memformat.',
    options: { title: true, toolbar: false, stats: false },
    content: '<h1>All fine. Just write.</h1><p class="afw-subtitle">Subjudul muncul lewat tombol t kecil di baris tepat setelah judul.</p><p>Blok kalimat ini untuk memunculkan <b>bubble toolbar</b>. Tekan Enter, lalu ketik <code>/</code> untuk memilih blok: judul, kutipan, daftar, kode, gambar, atau video.</p><blockquote>Tulisan yang baik dimulai dari editor yang tidak mengganggu.</blockquote>'
  },
  {
    name: 'Lengkap',
    hint: 'Toolbar atas, bubble, slash menu, dan statistik kata.',
    options: {},
    content: '<h2>Catatan rapat</h2><p>Coba shortcut markdown: ketik <code>## </code> untuk judul, <code>- </code> untuk daftar, atau <code>**tebal**</code>.</p><ul><li><p>Rilis v2 minggu ini</p></li><li><p>Siapkan contoh Laravel</p></li></ul><p>Tempel link YouTube di baris kosong untuk menyisipkan video.</p>'
  },
  {
    name: 'Minimal',
    hint: 'Tanpa toolbar atas & statistik: hanya bubble dan slash menu.',
    options: { toolbar: false, stats: false },
    content: '<p>Editor paling ringkas. Ketik apa saja, blok untuk format, <code>/</code> untuk blok baru.</p>'
  }
]
const variant = ref(0)

// --- Data kartu showcase ---

const slashItems = [
  { icon: 'headingLarge', label: 'Judul', desc: 'Judul bagian yang besar', key: '##' },
  { icon: 'headingSmall', label: 'Subjudul', desc: 'Judul bagian yang lebih kecil', key: '###' },
  { icon: 'list', label: 'Daftar berpoin', desc: 'Daftar sederhana', key: '-' },
  { icon: 'listOrdered', label: 'Daftar bernomor', desc: 'Daftar berurutan', key: '1.' },
  { icon: 'quote', label: 'Kutipan', desc: 'Menyorot kutipan', key: '>' },
  { icon: 'code', label: 'Kode', desc: 'Blok kode program', key: '```' },
  { icon: 'image', label: 'Gambar', desc: 'Unggah dari perangkat', key: '' },
  { icon: 'video', label: 'Video', desc: 'YouTube atau Vimeo', key: '' },
  { icon: 'minus', label: 'Pemisah', desc: 'Garis pemisah antarbagian', key: '---' }
] as const

const shortcuts = [
  { label: 'Judul', keys: ['##'] },
  { label: 'Kutipan', keys: ['>'] },
  { label: 'Daftar berpoin', keys: ['-'] },
  { label: 'Daftar bernomor', keys: ['1.'] },
  { label: 'Blok kode', keys: ['```'] },
  { label: 'Pemisah', keys: ['---'] },
  { label: 'Tebal', keys: ['**teks**'] },
  { label: 'Pindah blok', keys: ['⌘', '⇧', '↑'] }
]

// Kartu "Judul & slug" memakai slugify asli dari library.
const slugTitle = ref('Café Pagi di Bandung!')
const slug = computed(() => slugify(slugTitle.value))

// Kartu bubble toolbar: tombol B / i bisa diklik.
const fmt = reactive({ bold: true, italic: false })

// Kartu gambar: tiga ukuran.
const imgSize = ref<'normal' | 'wide' | 'full'>('wide')
const imgSizes = [
  { key: 'normal', label: 'Normal' },
  { key: 'wide', label: 'Lebar' },
  { key: 'full', label: 'Penuh' }
] as const

// Kartu bahasa: teks antarmuka asli (src/i18n.js).
const lang = ref<'id' | 'en'>('id')
const STR = {
  id: { placeholder: 'Mulai menulis… ketik / untuk pilihan blok', bold: 'Tebal', italic: 'Miring', link: 'Link', draft: 'Ada draf yang belum tersimpan dari 10.24.', restore: 'Pulihkan', stats: '128 kata · 1 menit baca' },
  en: { placeholder: 'Start writing… type / for blocks', bold: 'Bold', italic: 'Italic', link: 'Link', draft: 'You have an unsaved draft from 10:24.', restore: 'Restore', stats: '128 words · 1 min read' }
}

const autosave = ref(true)

// Kartu pasang: npm atau CDN.
const install = ref<'npm' | 'cdn'>('npm')
const INSTALL = {
  npm: 'npm i github:agungfwcoder/afwrite#semver:^2',
  // '</' + 'script>' dipecah: tag penutup utuh di dalam string mengakhiri blok <script> SFC.
  cdn: '<script defer src="https://cdn.jsdelivr.net/gh/agungfwcoder/afwrite@2/dist/afwrite.min.js"></' + 'script>'
}

const browsers = [
  { name: 'Chrome', icon: 'i-simple-icons-googlechrome', color: 'text-[#4285F4]' },
  { name: 'Firefox', icon: 'i-simple-icons-firefoxbrowser', color: 'text-[#FF7139]' },
  { name: 'Safari', icon: 'i-simple-icons-safari', color: 'text-[#006CFF] dark:text-[#3B8EFF]' }
]

// Kartu "HTML atau JSON": isi yang sama dalam dua format.
const outFormat = ref<'html' | 'json'>('html')
const outputs: Record<'html' | 'json', Token[][]> = {
  html: [
    [['<h2>', T.tag], ['Judul'], ['</h2>', T.tag]],
    [['<p>', T.tag], ['Halo '], ['<strong>', T.tag], ['dunia'], ['</strong>', T.tag], ['</p>', T.tag]]
  ],
  json: [
    [['{ '], ['"type"', T.attr], [': '], ['"doc"', T.str], [', '], ['"content"', T.attr], [': [']],
    [['  { '], ['"type"', T.attr], [': '], ['"heading"', T.str], [',']],
    [['    '], ['"attrs"', T.attr], [': { '], ['"level"', T.attr], [': '], ['2', T.kw], [' },']],
    [['    '], ['"content"', T.attr], [': [{ '], ['"type"', T.attr], [': '], ['"text"', T.str], [',']],
    [['      '], ['"text"', T.attr], [': '], ['"Judul"', T.str], [' }] },']],
    [['  { '], ['"type"', T.attr], [': '], ['"paragraph"', T.str], [', '], ['"content"', T.attr], [': [']],
    [['    { '], ['"type"', T.attr], [': '], ['"text"', T.str], [', '], ['"text"', T.attr], [': '], ['"Halo "', T.str], [' },']],
    [['    { '], ['"type"', T.attr], [': '], ['"text"', T.str], [', '], ['"text"', T.attr], [': '], ['"dunia"', T.str], [',']],
    [['      '], ['"marks"', T.attr], [': [{ '], ['"type"', T.attr], [': '], ['"bold"', T.str], [' }] }']],
    [['  ] }']],
    [['] }']]
  ]
}

const tested = ['Unit test', 'Browser · Chromium', 'Browser · Firefox', 'Browser · WebKit', 'Feature test Laravel']
</script>

<template>
  <div class="landing bg-white text-zinc-700 dark:bg-[#09090b] dark:text-zinc-200">
    <!-- HERO -->
    <section class="relative overflow-hidden border-b border-emerald-500/30 dark:border-emerald-400/25">
      <div
        aria-hidden="true"
        class="hero-dots pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        class="hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
      />
      <div class="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-20 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:pt-28 lg:pb-24">
        <div class="flex min-w-0 flex-col gap-6">
          <NuxtLink
            to="/panduan/event-api#judul-slug"
            style="--reveal-delay: 0ms"
            class="hero-in inline-flex items-center gap-1.5 self-start rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15 dark:text-emerald-300"
          >
            Baru: judul &amp; slug untuk URL
            <svg
              class="size-3.5"
              v-bind="svgAttrs"
              v-html="ICON.arrow"
            />
          </NuxtLink>

          <h1
            style="--reveal-delay: 80ms"
            class="hero-in m-0 text-[clamp(44px,6vw,68px)] leading-[1.04] font-extrabold tracking-[-0.035em] text-zinc-950 dark:text-zinc-50"
          >
            All fine.<br><span class="text-emerald-600 dark:text-emerald-400">Just write.</span>
          </h1>
          <p
            style="--reveal-delay: 160ms"
            class="hero-in m-0 max-w-[540px] text-lg leading-[1.65] text-zinc-600 dark:text-zinc-400"
          >
            Editor ala Medium untuk Alpine.js: bubble toolbar, slash command, shortcut markdown, gambar &amp; video. Engine Tiptap/ProseMirror membuat perilaku mengetik sama di semua browser, dan output HTML-nya selalu bersih.
          </p>

          <div
            style="--reveal-delay: 240ms"
            class="hero-in flex flex-wrap gap-3"
          >
            <NuxtLink
              to="/memulai"
              class="btn-primary"
            >
              Mulai
              <svg
                class="size-4"
                v-bind="svgAttrs"
                v-html="ICON.arrow"
              />
            </NuxtLink>
            <a
              href="#coba"
              class="btn-ghost"
              @click="showcase = 'coba'"
            >
              <svg
                class="size-4"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="ICON.play"
              />
              Coba editornya
            </a>
          </div>

          <div
            style="--reveal-delay: 320ms"
            class="hero-in flex flex-wrap items-center gap-x-4 gap-y-3 text-[13px] text-zinc-500 dark:text-zinc-400"
          >
            <span>Bekerja dengan</span>
            <div class="flex items-center gap-3">
              <UIcon
                v-for="w in works"
                :key="w.name"
                :name="w.icon"
                :title="w.name"
                :aria-label="w.name"
                role="img"
                class="brand-logo size-[18px]"
              />
            </div>
            <span
              aria-hidden="true"
              class="h-4 w-px bg-zinc-300 dark:bg-zinc-700"
            />
            <a
              :href="REPO"
              class="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <UIcon
                name="i-simple-icons-github"
                class="size-4"
              />Open source · MIT
            </a>
          </div>
        </div>

        <!-- Kartu editor bertab -->
        <div
          style="--reveal-delay: 200ms"
          class="hero-in hero-in-mockup relative min-w-0"
        >
          <div class="overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 shadow-[0_40px_80px_-24px_rgba(24,24,27,0.25)] backdrop-blur dark:border-zinc-800 dark:bg-[#111113]/90 dark:shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)]">
            <div class="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 p-2 dark:border-zinc-800">
              <div
                role="tablist"
                aria-label="Contoh"
                class="flex items-center gap-1"
              >
                <button
                  type="button"
                  role="tab"
                  :aria-selected="heroTab === -1"
                  class="hero-tab"
                  :class="{ 'is-active': heroTab === -1 }"
                  @click="heroTab = -1"
                >
                  <svg
                    class="size-3.5 text-emerald-600 dark:text-emerald-400"
                    v-bind="svgAttrs"
                    stroke-linejoin="round"
                    v-html="ICON.pencil"
                  />Editor
                </button>
                <button
                  v-for="(t, i) in tabs"
                  :key="t.name"
                  type="button"
                  role="tab"
                  :aria-selected="heroTab === i"
                  class="hero-tab"
                  :class="{ 'is-active': heroTab === i }"
                  @click="heroTab = i"
                >
                  <span
                    class="size-2 rounded-[2px]"
                    :class="t.dot"
                  />{{ t.name }}
                </button>
              </div>
              <div class="ml-auto hidden shrink-0 items-center gap-1.5 pr-2 text-xs text-emerald-600 sm:flex dark:text-emerald-300">
                <span class="mock-pulse size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />Draf tersimpan
              </div>
            </div>

            <div class="relative h-[470px] sm:h-[460px]">
              <!-- Mockup editor (v-show agar animasinya tetap jalan saat tab berganti) -->
              <div
                v-show="heroTab === -1"
                class="relative flex flex-col gap-4 px-6 pt-12 pb-8 text-base leading-[1.7] text-zinc-700 sm:px-10 dark:text-zinc-300"
              >
                <!-- Teks penuh (tak terlihat) menahan ukuran, teks yang sedang diketik ditumpuk di atasnya. -->
                <div class="relative text-[30px] leading-tight font-extrabold tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">
                  <span :class="{ invisible: demo.running }">{{ DEMO_TITLE }}</span>
                  <span
                    v-if="demo.running"
                    class="absolute inset-0"
                  >{{ demo.title }}<span
                    v-if="demo.caret === 'title'"
                    class="mock-caret"
                  /></span>
                </div>

                <div class="relative">
                  <!-- bubble toolbar -->
                  <div
                    aria-hidden="true"
                    class="mock-pop absolute -top-12 left-24 z-[2] flex items-center gap-0.5 rounded-[10px] border border-zinc-700 bg-zinc-900 p-1 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.6)]"
                    :class="{ 'is-on': demo.bubble }"
                  >
                    <span
                      class="bubble-btn text-sm font-extrabold transition-colors duration-200"
                      :class="demo.bold ? 'bg-emerald-500/20 text-emerald-200' : 'text-zinc-300'"
                    >B</span>
                    <span class="bubble-btn font-serif text-[15px] text-zinc-300 italic">i</span>
                    <span class="bubble-btn text-zinc-300"><svg
                      class="size-[15px]"
                      v-bind="svgAttrs"
                      v-html="ICON.link"
                    /></span>
                    <span class="mx-1 h-[18px] w-px bg-zinc-700" />
                    <span class="bubble-btn text-zinc-300"><svg
                      class="size-[17px]"
                      v-bind="svgAttrs"
                      v-html="ICON.headingLarge"
                    /></span>
                    <span class="bubble-btn text-zinc-300"><svg
                      class="size-[17px]"
                      v-bind="svgAttrs"
                      v-html="ICON.headingSmall"
                    /></span>
                    <span class="bubble-btn text-zinc-300"><svg
                      class="size-[15px]"
                      v-bind="svgAttrs"
                      v-html="ICON.quote"
                    /></span>
                  </div>
                  Menulis seharusnya terasa <span
                    class="mock-sel rounded-[3px] px-0.5 py-px"
                    :class="{ 'is-on': demo.selected, 'font-bold text-zinc-950 dark:text-zinc-50': demo.bold }"
                  >tenang dan fokus</span>. Toolbar hanya muncul ketika Anda memblok teks, lalu menghilang lagi.
                </div>

                <div class="border-l-[3px] border-emerald-600 pl-4 text-zinc-500 dark:text-zinc-400">
                  Ketik ## untuk judul, &gt; untuk kutipan, dan **teks** untuk tebal.
                </div>

                <div class="relative -ml-7 flex items-center gap-3">
                  <span class="flex size-[22px] items-center justify-center rounded-full border border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"><svg
                    class="size-3"
                    v-bind="svgAttrs"
                    stroke-width="2.5"
                    v-html="ICON.plus"
                  /></span>
                  <span
                    class="text-zinc-950 dark:text-zinc-50"
                    :class="{ invisible: !demo.slash }"
                  >/<span
                    v-if="demo.caret === 'slash'"
                    class="mock-caret"
                  /></span><span
                    class="-ml-2.5 text-zinc-400 transition-opacity duration-200 dark:text-zinc-500"
                    :class="{ 'opacity-0': !demo.slash }"
                  >Ketik untuk memfilter…</span>
                </div>

                <!-- slash menu -->
                <div
                  aria-hidden="true"
                  class="mock-pop -mt-2 w-[260px] max-w-full self-start rounded-xl border border-zinc-200 bg-white p-1.5 text-sm leading-[1.3] shadow-[0_20px_40px_-12px_rgba(24,24,27,0.25)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]"
                  :class="{ 'is-on': demo.menu }"
                >
                  <div class="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
                    BLOK
                  </div>
                  <div
                    v-for="(item, i) in [
                      { icon: 'headingLarge', label: 'Judul', key: '##' },
                      { icon: 'list', label: 'Daftar berpoin', key: '-' },
                      { icon: 'image', label: 'Gambar', key: '' },
                      { icon: 'code', label: 'Blok kode', key: '```' }
                    ]"
                    :key="item.label"
                    class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
                    :class="i === demo.active ? 'bg-emerald-500/15 text-zinc-950 dark:bg-emerald-500/20 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-300'"
                  >
                    <span
                      class="flex size-7 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800"
                      :class="i === demo.active ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-500 dark:text-zinc-400'"
                    ><svg
                      class="size-[15px]"
                      v-bind="svgAttrs"
                      stroke-linejoin="round"
                      v-html="ICON[item.icon as keyof typeof ICON]"
                    /></span>
                    <span class="flex-1">{{ item.label }}</span>
                    <kbd
                      v-if="item.key"
                      class="font-mono text-[11px] text-zinc-500 dark:text-zinc-400"
                    >{{ item.key }}</kbd>
                  </div>
                </div>
              </div>

              <!-- Contoh kode -->
              <pre
                v-if="heroTab >= 0"
                role="tabpanel"
                class="m-0 h-full overflow-auto p-5 font-mono text-[13px] leading-[1.85] text-zinc-700 sm:p-6 dark:text-zinc-300"
              ><template
                v-for="(line, n) in tabs[heroTab]!.lines"
                :key="n"
              ><span :class="T.dim">{{ String(n + 1).padStart(2, ' ') }}</span>  <span
                v-for="(tok, k) in line"
                :key="k"
                :class="tok[1]"
              >{{ tok[0] }}</span>
</template></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SHOWCASE: kartu demo fitur / editor sungguhan -->
    <section
      id="coba"
      class="mx-auto max-w-[1200px] scroll-mt-20 px-6 pt-16 pb-24"
    >
      <div
        data-reveal
        class="flex items-center gap-4"
      >
        <div
          role="tablist"
          aria-label="Showcase"
          class="flex shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-[#111113]"
        >
          <button
            v-for="s in ([{ key: 'fitur', label: 'Fitur', icon: 'grid' }, { key: 'coba', label: 'Coba langsung', icon: 'play' }] as const)"
            :key="s.key"
            type="button"
            role="tab"
            :aria-selected="showcase === s.key"
            class="flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors"
            :class="showcase === s.key ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'"
            @click="showcase = s.key"
          >
            <svg
              class="size-3.5"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON[s.icon]"
            />{{ s.label }}
          </button>
        </div>
        <span
          aria-hidden="true"
          class="hidden h-px flex-1 bg-zinc-200 sm:block dark:bg-zinc-800"
        />
        <span class="hidden font-mono text-xs text-zinc-400 sm:block dark:text-zinc-500">Satu editor, banyak cara pakai</span>
      </div>

      <div
        data-reveal
        style="--reveal-delay: 80ms"
        class="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4 dark:border-zinc-800/80 dark:bg-[#0d0d0f]"
      >
        <!-- FITUR -->
        <div
          v-if="showcase === 'fitur'"
          class="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 xl:columns-4"
        >
          <!-- Slash menu -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Slash menu &amp; tombol +
              </div>
              <div class="sc-desc">
                Ketik / di baris kosong untuk memilih blok.
              </div>
            </div>
            <div class="sc-inset overflow-hidden">
              <div class="flex h-9 items-center gap-2 border-b border-zinc-200 px-3 text-[13px] dark:border-zinc-800">
                <span class="font-semibold text-zinc-950 dark:text-zinc-50">/</span><span class="text-zinc-400 dark:text-zinc-500">Ketik untuk memfilter…</span>
              </div>
              <div class="p-1">
                <div class="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
                  BLOK
                </div>
                <div
                  v-for="(item, i) in slashItems"
                  :key="item.label"
                  class="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                  :class="i === 0 ? 'bg-emerald-500/10 dark:bg-emerald-500/15' : ''"
                >
                  <span
                    class="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800"
                    :class="i === 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-500 dark:text-zinc-400'"
                  ><svg
                    class="size-3.5"
                    v-bind="svgAttrs"
                    stroke-linejoin="round"
                    v-html="ICON[item.icon]"
                  /></span>
                  <span class="min-w-0 flex-1 truncate"><span class="text-zinc-900 dark:text-zinc-100">{{ item.label }}</span> <span class="text-zinc-400 dark:text-zinc-500">{{ item.desc }}</span></span>
                  <kbd
                    v-if="item.key"
                    class="sc-kbd"
                  >{{ item.key }}</kbd>
                </div>
              </div>
            </div>
          </div>

          <!-- Judul & slug -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Judul &amp; slug
              </div>
              <div class="sc-desc">
                Teks pertama jadi judul; slug-nya ikut di event change.
              </div>
            </div>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Judul</span>
              <input
                v-model="slugTitle"
                type="text"
                class="sc-field w-full"
                aria-label="Judul"
              >
            </label>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Slug</span>
              <div class="sc-field justify-between gap-2 font-mono text-emerald-700 dark:text-emerald-300">
                <span class="min-w-0 truncate">{{ slug || '—' }}</span>
                <button
                  type="button"
                  aria-label="Salin slug"
                  class="cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  @click="copy(slug)"
                >
                  <svg
                    class="size-3.5"
                    v-bind="svgAttrs"
                    stroke-linejoin="round"
                    v-html="ICON.copy"
                  />
                </button>
              </div>
            </div>
            <code class="font-mono text-[11.5px] text-zinc-500 dark:text-zinc-400">$event.detail.meta.slug</code>
          </div>

          <!-- Bubble toolbar -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Bubble toolbar
              </div>
              <div class="sc-desc">
                Muncul saat teks diblok. Coba klik B dan i.
              </div>
            </div>
            <div class="flex flex-col items-start gap-3 pt-1">
              <div class="flex items-center gap-0.5 rounded-[10px] border border-zinc-700 bg-zinc-900 p-1 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]">
                <button
                  type="button"
                  class="bubble-btn cursor-pointer text-sm font-extrabold transition-colors"
                  :class="fmt.bold ? 'bg-emerald-500/20 text-emerald-200' : 'text-zinc-300 hover:bg-zinc-800'"
                  :aria-pressed="fmt.bold"
                  aria-label="Tebal"
                  @click="fmt.bold = !fmt.bold"
                >
                  B
                </button>
                <button
                  type="button"
                  class="bubble-btn cursor-pointer font-serif text-[15px] italic transition-colors"
                  :class="fmt.italic ? 'bg-emerald-500/20 text-emerald-200' : 'text-zinc-300 hover:bg-zinc-800'"
                  :aria-pressed="fmt.italic"
                  aria-label="Miring"
                  @click="fmt.italic = !fmt.italic"
                >
                  i
                </button>
                <span class="bubble-btn text-zinc-300"><svg
                  class="size-[15px]"
                  v-bind="svgAttrs"
                  v-html="ICON.link"
                /></span>
                <span class="mx-1 h-[18px] w-px bg-zinc-700" />
                <span class="bubble-btn text-zinc-300"><svg
                  class="size-[17px]"
                  v-bind="svgAttrs"
                  v-html="ICON.headingLarge"
                /></span>
                <span class="bubble-btn text-zinc-300"><svg
                  class="size-[17px]"
                  v-bind="svgAttrs"
                  v-html="ICON.headingSmall"
                /></span>
              </div>
              <p class="m-0 text-[13.5px] leading-[1.7] text-zinc-600 dark:text-zinc-300">
                Menulis seharusnya terasa <span
                  class="rounded-[3px] bg-emerald-500/25 px-0.5"
                  :class="{ 'font-bold text-zinc-950 dark:text-zinc-50': fmt.bold, 'italic': fmt.italic }"
                >tenang dan fokus</span>, tanpa toolbar yang terus terlihat.
              </p>
            </div>
          </div>

          <!-- Mode artikel -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Mode artikel
              </div>
              <div class="sc-desc">
                Judul &amp; subjudul otomatis, seperti Medium.
              </div>
            </div>
            <div class="grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
              <span class="pt-1.5 text-right text-[11px] text-zinc-400 dark:text-zinc-500">Judul</span>
              <div class="border-l border-zinc-300 pl-3 text-lg leading-snug font-extrabold text-zinc-950 dark:border-zinc-700 dark:text-zinc-50">
                Catatan dari Bandung
              </div>
              <span class="pt-0.5 text-right text-[11px] text-zinc-400 dark:text-zinc-500">Subjudul</span>
              <div class="border-l border-zinc-300 pb-1 pl-3 text-[13.5px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Pagi yang dingin dan kopi yang hangat
              </div>
              <span />
              <div class="flex flex-col gap-1.5 pt-2 pl-3">
                <span class="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <span class="h-2 w-11/12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <span class="h-2 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>

          <!-- Shortcut markdown -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Shortcut markdown
              </div>
              <div class="sc-desc">
                Format berubah langsung saat mengetik.
              </div>
            </div>
            <div class="-mx-4 -mb-4 divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800/80 dark:border-zinc-800/80">
              <div
                v-for="s in shortcuts"
                :key="s.label"
                class="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px] text-zinc-700 dark:text-zinc-300"
              >
                {{ s.label }}
                <span class="flex gap-1">
                  <kbd
                    v-for="k in s.keys"
                    :key="k"
                    class="sc-kbd"
                  >{{ k }}</kbd>
                </span>
              </div>
            </div>
          </div>

          <!-- Gambar & video -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Gambar &amp; video
              </div>
              <div class="sc-desc">
                Upload, keterangan, alt text, dan tiga ukuran.
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="flex rounded-lg border border-zinc-200 bg-white p-0.5 text-xs font-medium dark:border-zinc-800 dark:bg-[#09090b]">
                <button
                  v-for="s in imgSizes"
                  :key="s.key"
                  type="button"
                  class="cursor-pointer rounded-md px-2.5 py-1 transition-colors"
                  :class="imgSize === s.key ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
                  @click="imgSize = s.key"
                >
                  {{ s.label }}
                </button>
              </div>
              <div
                class="img-mock flex aspect-[16/9] items-center justify-center rounded-md text-white/80 transition-all duration-300"
                :class="{ 'w-2/3': imgSize === 'normal', 'w-full': imgSize === 'wide', 'img-full': imgSize === 'full' }"
              >
                <svg
                  class="size-6"
                  v-bind="svgAttrs"
                  stroke-linejoin="round"
                  v-html="ICON.image"
                />
              </div>
              <span class="text-xs text-zinc-500 italic dark:text-zinc-400">Senja di Parangtritis</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <UIcon
                name="i-simple-icons-youtube"
                class="size-4 text-[#FF0000]"
              />
              <UIcon
                name="i-simple-icons-vimeo"
                class="size-4 text-[#1AB7EA]"
              />
              Tempel link video di baris kosong
            </div>
          </div>

          <!-- Engine -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Engine Tiptap / ProseMirror
              </div>
              <div class="sc-desc">
                Mengetik, list, dan kursor sama di semua browser.
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="b in browsers"
                :key="b.name"
                class="sc-inset flex items-center justify-between px-3 py-2 text-[13px]"
              >
                <span class="flex items-center gap-2 text-zinc-800 dark:text-zinc-200"><UIcon
                  :name="b.icon"
                  class="size-4 shrink-0"
                  :class="b.color"
                />{{ b.name }}</span><span class="text-xs font-semibold text-emerald-600 dark:text-emerald-300">✓ Konsisten</span>
              </div>
            </div>
          </div>

          <!-- Seret blok -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Pindah blok
              </div>
              <div class="sc-desc">
                Seret lewat pegangan ⋮⋮, atau pakai keyboard.
              </div>
            </div>
            <div class="flex flex-col gap-1 text-[13px]">
              <div class="flex items-center gap-2 px-1 py-1.5 text-zinc-600 dark:text-zinc-400">
                <svg
                  class="size-3.5 text-zinc-300 dark:text-zinc-600"
                  v-bind="svgAttrs"
                  v-html="ICON.grip"
                />Pembuka
              </div>
              <div class="h-0.5 rounded-full bg-emerald-500" />
              <div class="flex items-center gap-2 px-1 py-1.5 text-zinc-600 dark:text-zinc-400">
                <svg
                  class="size-3.5 text-zinc-300 dark:text-zinc-600"
                  v-bind="svgAttrs"
                  v-html="ICON.grip"
                />Isi utama
              </div>
              <div class="flex translate-x-3 -rotate-1 items-center gap-2 rounded-md border border-emerald-500/40 bg-white px-2 py-1.5 text-zinc-900 shadow-[0_10px_24px_-8px_rgba(5,150,105,0.45)] dark:bg-zinc-900 dark:text-zinc-100">
                <svg
                  class="size-3.5 text-emerald-600 dark:text-emerald-400"
                  v-bind="svgAttrs"
                  v-html="ICON.grip"
                />Kutipan narasumber
              </div>
              <div class="flex items-center gap-2 px-1 py-1.5 text-zinc-600 dark:text-zinc-400">
                <svg
                  class="size-3.5 text-zinc-300 dark:text-zinc-600"
                  v-bind="svgAttrs"
                  v-html="ICON.grip"
                />Penutup
              </div>
            </div>
          </div>

          <!-- Bahasa -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Indonesia &amp; Inggris
              </div>
              <div class="sc-desc">
                Semua teks antarmuka bisa ditimpa satu per satu.
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-lg border border-zinc-200 bg-white p-0.5 text-[13px] font-medium dark:border-zinc-800 dark:bg-[#09090b]">
              <button
                v-for="l in (['id', 'en'] as const)"
                :key="l"
                type="button"
                class="cursor-pointer rounded-md py-1.5 transition-colors"
                :class="lang === l ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
                @click="lang = l"
              >
                {{ l === 'id' ? 'Indonesia' : 'English' }}
              </button>
            </div>
            <div class="sc-field text-zinc-400 dark:text-zinc-500">
              <span class="truncate">{{ STR[lang].placeholder }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 text-xs">
              <span
                v-for="k in (['bold', 'italic', 'link'] as const)"
                :key="k"
                class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
              >{{ STR[lang][k] }}</span>
              <span class="ml-auto self-center text-zinc-400 dark:text-zinc-500">{{ STR[lang].stats }}</span>
            </div>
          </div>

          <!-- HTML / JSON -->
          <div class="sc-card">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="sc-title">
                  HTML atau JSON
                </div>
                <div class="sc-desc">
                  Simpan HTML bersih atau JSON ProseMirror.
                </div>
              </div>
              <NuxtLink
                to="/panduan/json"
                class="shrink-0 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
              >Panduan →</NuxtLink>
            </div>
            <div
              role="tablist"
              class="flex rounded-lg border border-zinc-200 bg-white p-0.5 text-xs font-semibold dark:border-zinc-800 dark:bg-[#09090b]"
            >
              <button
                v-for="f in (['html', 'json'] as const)"
                :key="f"
                type="button"
                role="tab"
                :aria-selected="outFormat === f"
                class="flex-1 cursor-pointer rounded-md p-1 text-center uppercase transition-colors"
                :class="outFormat === f ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
                @click="outFormat = f"
              >
                {{ f }}
              </button>
            </div>
            <pre
              role="tabpanel"
              class="sc-inset m-0 h-[214px] overflow-auto p-3 font-mono text-[11.5px] leading-[1.7] text-zinc-700 [scrollbar-width:thin] dark:text-zinc-300"
            ><template
              v-for="(line, n) in outputs[outFormat]"
              :key="n"
            ><span
              v-for="(tok, k) in line"
              :key="k"
              :class="tok[1]"
            >{{ tok[0] }}</span>
</template></pre>
          </div>

          <!-- Sanitasi -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Output selalu bersih
              </div>
              <div class="sc-desc">
                Paste dari Word, Google Docs, atau web disaring.
              </div>
            </div>
            <div class="sc-inset p-3 font-mono text-[11.5px] leading-[1.7]">
              <div class="mb-1 font-sans text-[11px] font-semibold tracking-[0.04em] text-zinc-400 dark:text-zinc-500">
                DITEMPEL
              </div>
              <div class="text-rose-600/90 line-through decoration-rose-500/40 dark:text-rose-400/90">
                &lt;span style="mso-bidi:…"&gt;
              </div>
              <div class="text-rose-600/90 line-through decoration-rose-500/40 dark:text-rose-400/90">
                &lt;font face="Calibri"&gt;&lt;o:p&gt;
              </div>
              <div class="flex justify-center py-1 text-zinc-400">
                <svg
                  class="size-3.5"
                  v-bind="svgAttrs"
                  v-html="ICON.down"
                />
              </div>
              <div class="mb-1 font-sans text-[11px] font-semibold tracking-[0.04em] text-zinc-400 dark:text-zinc-500">
                DISIMPAN
              </div>
              <div><span :class="T.tag">&lt;p&gt;</span>Halo <span :class="T.tag">&lt;strong&gt;</span>dunia<span :class="T.tag">&lt;/strong&gt;&lt;/p&gt;</span></div>
            </div>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">
              Plus whitelist HTMLPurifier untuk server Laravel.
            </div>
          </div>

          <!-- Autosave -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Autosave draf
              </div>
              <div class="sc-desc">
                Tersimpan di localStorage, ditawarkan lagi nanti.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="autosave"
              class="flex cursor-pointer items-center gap-3 text-left"
              @click="autosave = !autosave"
            >
              <span
                class="relative h-5 w-9 shrink-0 rounded-full transition-colors"
                :class="autosave ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'"
              ><span
                class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform"
                :class="{ 'translate-x-4': autosave }"
              /></span>
              <span class="text-[13px] text-zinc-800 dark:text-zinc-200">Simpan draf otomatis</span>
            </button>
            <div
              class="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12.5px] text-amber-800 transition-opacity dark:text-amber-200"
              :class="{ 'opacity-40': !autosave }"
            >
              <span class="basis-full">Ada draf yang belum tersimpan dari 10.24.</span>
              <span class="rounded-md bg-amber-400 px-2.5 py-1 font-semibold text-stone-900">Pulihkan</span>
              <span class="rounded-md px-2.5 py-1 font-semibold">Buang</span>
            </div>
          </div>

          <!-- Laravel -->
          <NuxtLink
            to="/integrasi/laravel"
            class="sc-card sc-card-link"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-simple-icons-laravel"
                class="mt-0.5 size-5 shrink-0 text-[#FF2D20]"
              />
              <div>
                <div class="sc-title">
                  Integrasi Laravel
                </div>
                <div class="sc-desc">
                  Komponen Blade, upload, sanitasi server, Livewire.
                </div>
              </div>
            </div>
            <code class="sc-inset overflow-x-auto px-3 py-2.5 font-mono text-xs whitespace-nowrap text-zinc-700 dark:text-zinc-300"><span :class="T.tag">&lt;x-wysiwyg</span> <span :class="T.attr">name</span>=<span :class="T.str">"body"</span> <span :class="T.tag">/&gt;</span></code>
          </NuxtLink>

          <!-- Pasang -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Pasang dalam semenit
              </div>
              <div class="sc-desc">
                Lewat npm dengan bundler, atau satu tag script.
              </div>
            </div>
            <div class="flex gap-1 text-xs font-medium">
              <button
                v-for="k in (['npm', 'cdn'] as const)"
                :key="k"
                type="button"
                class="cursor-pointer rounded-md px-2.5 py-1 uppercase transition-colors"
                :class="install === k ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
                @click="install = k"
              >
                {{ k }}
              </button>
            </div>
            <div class="sc-inset flex items-center gap-2 py-1.5 pr-1.5 pl-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              <span class="min-w-0 flex-1 truncate">{{ INSTALL[install] }}</span>
              <button
                type="button"
                :aria-label="copied ? 'Tersalin' : 'Salin'"
                class="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                @click="copy(INSTALL[install])"
              >
                <svg
                  class="size-3.5"
                  v-bind="svgAttrs"
                  stroke-linejoin="round"
                  v-html="copied ? ICON.check : ICON.copy"
                />
              </button>
            </div>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ install === 'npm' ? 'Tiptap/ProseMirror ikut terpasang sebagai dependency.' : 'Sudah berisi Tiptap/ProseMirror (±130 KB gzip). Muat sebelum Alpine.' }}
            </div>
          </div>

          <!-- CSS -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                CSS tidak bentrok
              </div>
              <div class="sc-desc">
                Semua class &amp; variabel memakai prefix afw.
              </div>
            </div>
            <div class="sc-inset flex flex-col gap-1 p-3 font-mono text-xs">
              <span><span :class="T.tag">.afw</span> <span class="text-zinc-400">{ … }</span></span>
              <span><span :class="T.tag">.afw-toolbar</span> <span class="text-zinc-400">{ … }</span></span>
              <span><span :class="T.attr">--afw-accent</span>: <span :class="T.str">#059669</span>;</span>
            </div>
            <div class="flex flex-wrap gap-1.5 text-xs">
              <span class="flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"><UIcon
                name="i-simple-icons-bootstrap"
                class="size-3.5 text-[#7952B3]"
              />Bootstrap 5 ✓</span>
              <span class="flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"><UIcon
                name="i-simple-icons-tailwindcss"
                class="size-3.5 text-[#06B6D4]"
              />Tailwind ✓</span>
            </div>
          </div>

          <!-- Teruji -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Teruji
              </div>
              <div class="sc-desc">
                Setiap rilis dijaga test otomatis.
              </div>
            </div>
            <ul class="m-0 flex list-none flex-col gap-2 p-0 font-mono text-xs">
              <li
                v-for="t in tested"
                :key="t"
                class="flex gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <span class="text-emerald-600 dark:text-emerald-300">✓</span>{{ t }}
              </li>
            </ul>
          </div>
        </div>

        <!-- COBA LANGSUNG -->
        <div
          v-else
          class="mx-auto flex w-full max-w-[860px] flex-col gap-4 py-4 sm:py-8"
        >
          <div
            role="tablist"
            aria-label="Varian editor"
            class="flex flex-wrap justify-center gap-2"
          >
            <button
              v-for="(v, i) in variants"
              :key="v.name"
              type="button"
              role="tab"
              :aria-selected="variant === i"
              class="cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
              :class="variant === i ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50'"
              @click="variant = i"
            >
              {{ v.name }}
            </button>
          </div>
          <p class="m-0 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {{ variants[variant]!.hint }}
          </p>
          <LazyEditorDemo
            :key="variant"
            hydrate-on-visible
            :content="variants[variant]!.content"
            :options="variants[variant]!.options"
          />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-[1200px] px-6 pb-24">
      <div
        data-reveal
        class="relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-zinc-50 px-6 py-20 text-center sm:px-8 dark:bg-[#0d0d0f]"
      >
        <div
          aria-hidden="true"
          class="hero-dots pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden="true"
          class="hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-full"
        />
        <h2 class="section-title relative">
          Siap mencoba?
        </h2>
        <p class="relative m-0 max-w-[520px] text-[17px] leading-[1.65] text-zinc-600 dark:text-zinc-400">
          Pasang lewat npm atau CDN, tambahkan satu atribut x-data, dan editor siap dipakai di form Anda.
        </p>
        <div class="relative mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <NuxtLink
            to="/memulai/instalasi"
            class="btn-primary justify-center"
          >
            Instalasi
            <svg
              class="size-4"
              v-bind="svgAttrs"
              v-html="ICON.arrow"
            />
          </NuxtLink>
          <a
            href="#coba"
            class="btn-ghost justify-center bg-white/60 dark:bg-[#09090b]/60"
            @click="showcase = 'coba'"
          >
            <svg
              class="size-4"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON.play"
            />
            Coba editornya
          </a>
        </div>
      </div>
    </section>

    <!-- FOOTER landing -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-6 py-8 text-[13px] text-zinc-500 md:flex-row md:justify-between dark:text-zinc-400">
        <div class="flex items-center gap-2">
          <img
            :src="`${base}logo.svg`"
            alt=""
            class="size-5"
          >
          <span class="font-semibold text-zinc-950 dark:text-zinc-50">{{ BRAND }}</span>
          <span>· Lisensi MIT</span>
        </div>
        <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <NuxtLink
            to="/memulai/instalasi"
            class="foot-link"
          >Instalasi</NuxtLink>
          <NuxtLink
            to="/panduan/opsi"
            class="foot-link"
          >Opsi</NuxtLink>
          <NuxtLink
            to="/integrasi/laravel"
            class="foot-link"
          >Laravel</NuxtLink>
          <NuxtLink
            to="/memulai/demo"
            class="foot-link"
          >Demo</NuxtLink>
          <NuxtLink
            to="/lainnya/changelog"
            class="foot-link"
          >Changelog</NuxtLink>
        </nav>
        <div class="flex items-center gap-4">
          <span class="hidden lg:inline">Dibangun dengan Tiptap, ProseMirror &amp; Nuxt UI</span>
          <a
            :href="REPO"
            aria-label="GitHub"
            class="foot-link"
          ><UIcon
            name="i-simple-icons-github"
            class="size-[18px]"
          /></a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Tidak scoped: semua aturan diawali .landing agar tidak bocor ke halaman lain. */

/* Latar hero & CTA: titik-titik halus + pendar emerald dari bawah. */
.landing .hero-dots {
  background-image: radial-gradient(rgba(24, 24, 27, 0.14) 1px, transparent 1px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent 95%);
  mask-image: linear-gradient(to bottom, #000 30%, transparent 95%);
}

.dark .landing .hero-dots {
  background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px);
}

.landing .hero-fade {
  background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.1));
}

.dark .landing .hero-fade {
  background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.13));
}

/* Logo brand "Bekerja dengan": abu-abu, berwarna saat disorot. */
.landing .brand-logo {
  color: #a1a1aa;
  transition: color 0.2s;
}

.dark .landing .brand-logo {
  color: #71717a;
}

.landing .brand-logo:hover {
  color: #3f3f46;
}

.dark .landing .brand-logo:hover {
  color: #e4e4e7;
}

.landing .hero-tab {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  color: #71717a;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.landing .hero-tab:hover {
  color: #18181b;
}

.landing .hero-tab.is-active {
  background: #f4f4f5;
  color: #09090b;
}

.dark .landing .hero-tab {
  color: #a1a1aa;
}

.dark .landing .hero-tab:hover {
  color: #f4f4f5;
}

.dark .landing .hero-tab.is-active {
  background: #27272a;
  color: #fafafa;
}

.landing .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  background: #059669;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 8px 24px -8px rgba(5, 150, 105, 0.6);
  transition: background-color 0.2s;
}

.landing .btn-primary:hover {
  background: #10b981;
}

.landing .btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1px solid #d4d4d8;
  color: #27272a;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;
}

.landing .btn-ghost:hover {
  background-color: #f4f4f5;
  color: #09090b;
}

.dark .landing .btn-ghost {
  border-color: #3f3f46;
  color: #e4e4e7;
}

.dark .landing .btn-ghost:hover {
  background-color: #27272a;
  color: #fafafa;
}

.landing .bubble-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
}

.landing .section-title {
  margin: 0;
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #09090b;
}

.dark .landing .section-title {
  color: #fafafa;
}

/* Kartu showcase (masonry lewat CSS columns). */
.landing .sc-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  break-inside: avoid;
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.2s;
}

@media (min-width: 640px) {
  .landing .sc-card {
    margin-bottom: 16px;
  }
}

.dark .landing .sc-card {
  border-color: #27272a;
  background: #111113;
}

.landing .sc-card-link:hover {
  border-color: rgba(16, 185, 129, 0.45);
}

.landing .sc-title {
  font-size: 14px;
  font-weight: 600;
  color: #09090b;
}

.dark .landing .sc-title {
  color: #fafafa;
}

.landing .sc-desc {
  margin-top: 2px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #71717a;
}

.dark .landing .sc-desc {
  color: #a1a1aa;
}

.landing .sc-inset {
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  background: #fafafa;
}

.dark .landing .sc-inset {
  border-color: #27272a;
  background: #09090b;
}

.landing .sc-field {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e4e4e7;
  border-radius: 7px;
  background: #fff;
  font-size: 13px;
  color: #18181b;
  outline: none;
}

.landing .sc-field:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.dark .landing .sc-field {
  border-color: #27272a;
  background: #09090b;
  color: #f4f4f5;
}

.landing .sc-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border: 1px solid #e4e4e7;
  border-radius: 5px;
  background: #fafafa;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #52525b;
}

.dark .landing .sc-kbd {
  border-color: #3f3f46;
  background: #18181b;
  color: #a1a1aa;
}

.landing .img-mock {
  background: linear-gradient(135deg, #f59e0b 0%, #ec4899 45%, #6366f1 100%);
}

.landing .img-full {
  width: calc(100% + 32px);
  margin: 0 -16px;
  border-radius: 0;
}

.landing .foot-link {
  transition: color 0.2s;
}

.landing .foot-link:hover {
  color: #09090b;
}

.dark .landing .foot-link:hover {
  color: #fafafa;
}

/* Animasi reveal. Hero: CSS murni saat halaman dibuka. Bagian lain: kelas dari IntersectionObserver. */
@keyframes afw-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}
@keyframes afw-rise-mockup {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
  }
}
.landing .hero-in {
  animation: afw-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms) both;
}
.landing .hero-in-mockup {
  animation-name: afw-rise-mockup;
  animation-duration: 1s;
}
.landing .reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0ms);
}
.landing .reveal.is-revealed {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .landing .hero-in {
    animation: none;
  }
}

/* Mockup editor: kursor, seleksi, munculnya bubble/menu, titik draf. */
.landing .mock-caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.12em;
  background: #34d399;
  animation: afw-blink 1s steps(1) infinite;
}
@keyframes afw-blink {
  50% {
    opacity: 0;
  }
}
.landing .mock-sel {
  background-image: linear-gradient(rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.3));
  background-repeat: no-repeat;
  background-size: 0% 100%;
  transition: background-size 0.55s cubic-bezier(0.65, 0, 0.35, 1);
}
.landing .mock-sel.is-on {
  background-size: 100% 100%;
}
.landing .mock-pop {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
  transform-origin: 30% 100%;
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.landing .mock-pop.is-on {
  opacity: 1;
  transform: none;
}
.landing .mock-pulse {
  animation: afw-pulse 2.4s ease-out infinite;
}
@keyframes afw-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55);
  }
  70%,
  100% {
    box-shadow: 0 0 0 6px rgba(52, 211, 153, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .landing .mock-caret,
  .landing .mock-pulse {
    animation: none;
  }
}
</style>
