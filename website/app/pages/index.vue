<script setup lang="ts">
// Landing page. Layout mengikuti halaman depan Nuxt UI: hero (teks + kartu editor bertab), panel showcase berisi
// kartu-kartu demo fitur (masonry) dan tab "Coba langsung", lalu CTA dan footer. Warna: brand (#009994) + zinc, dengan aksen kecil kuning logo (sun).
// Teks SEO diambil dari content/index.md.
import { useClipboard } from '@vueuse/core'
import { BRAND, FREE, SLOGAN } from '~~/brand'
import { slugify } from '../../../src/core/slug.js'

const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = `${BRAND} — ${page.value.seo?.title || page.value.title}`
const description = page.value.seo?.description || page.value.description

// Gambar OG landing memakai nama tetap (public/og.png), bukan hasil defineOgImage yang namanya berganti tiap isinya
// berubah: WhatsApp dkk. menyimpan alamat gambar lama, dan alamat yang hilang membuat pratinjau link kosong.
// Gambar ini meniru hero dan dirender dari website/og/landing.html; render ulang jika slogan atau hero berubah.
const ogImage = `${unref(createSitePathResolver({ absolute: true, withBase: true })('/og.png'))}?v=${useRuntimeConfig().public.assetVersions['og.png']}`

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
const logo = useAsset('logo.svg')

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
const T = { tag: 'text-pink-600 dark:text-pink-400', attr: 'text-brand-600 dark:text-brand-300', str: 'text-brand-700 dark:text-brand-300', kw: 'italic text-violet-600 dark:text-violet-300', dim: 'text-zinc-400 dark:text-zinc-500' }

// Kartu hero: tab "Editor" (mockup animasi) dan contoh kode.
const tabs: { name: string, icon: string, lines: Token[][] }[] = [
  {
    name: 'form.html',
    icon: 'i-vscode-icons-file-type-html',
    lines: [
      [['<form', T.tag], [' '], ['method', T.attr], ['='], ['"post"', T.str], ['>', T.tag]],
      [['  <div', T.tag], [' '], ['x-data', T.attr], ['='], ['"wysiwyg({ name: \'body\' })"', T.str], ['>', T.tag]],
      [['    <p>', T.tag], ['Start writing…'], ['</p>', T.tag]],
      [['  </div>', T.tag]],
      [['  <button>', T.tag], ['Save'], ['</button>', T.tag]],
      [['</form>', T.tag]]
    ]
  },
  {
    name: 'app.js',
    icon: 'i-vscode-icons-file-type-js-official',
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
    icon: 'i-vscode-icons-file-type-blade',
    lines: [
      [['<form', T.tag], [' '], ['method', T.attr], ['='], ['"post"', T.str], ['>', T.tag]],
      [['  @csrf', T.kw]],
      [['  <x-wysiwyg', T.tag], [' '], ['name', T.attr], ['='], ['"body"', T.str]],
      [['    '], [':value', T.attr], ['='], ['"$post->body"', T.str], [' '], ['/>', T.tag]],
      [['  <button>', T.tag], ['Save'], ['</button>', T.tag]],
      [['</form>', T.tag]]
    ]
  }
]
const heroTab = ref(-1) // -1 = Editor

// Deretan chip blok di bawah kartu hero (seperti deretan tema di halaman Nuxt UI).
const chips = [
  { icon: 'headingLarge', label: 'Heading', cls: 'bg-brand-500/12 text-brand-600 ring-brand-500/25 dark:text-brand-300' },
  { icon: 'list', label: 'Bulleted list', cls: 'bg-sky-500/12 text-sky-600 ring-sky-500/25 dark:text-sky-300' },
  { icon: 'quote', label: 'Quote', cls: 'bg-violet-500/12 text-violet-600 ring-violet-500/25 dark:text-violet-300' },
  { icon: 'code', label: 'Code block', cls: 'bg-rose-500/12 text-rose-600 ring-rose-500/25 dark:text-rose-300' },
  { icon: 'image', label: 'Image', cls: 'bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-300' },
  { icon: 'video', label: 'Video', cls: 'bg-red-500/12 text-red-600 ring-red-500/25 dark:text-red-300' }
] as const

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

// Panel showcase: "fitur" (kartu demo) atau "coba" (editor sungguhan). #try di URL membuka tab kedua.
const showcase = ref<'fitur' | 'coba'>('fitur')
// Di ponsel kartu fitur dipotong (5 pertama) sampai tombol "Tampilkan semua" ditekan.
const showAll = ref(false)
function collapseFeatures() {
  showAll.value = false
  document.getElementById('try')?.scrollIntoView({ block: 'start' })
}

// Animasi reveal: elemen [data-reveal] di bawah layar disembunyikan lalu muncul saat di-scroll.
// Yang sudah terlihat saat halaman dibuka dibiarkan (tanpa kedip); hero memakai animasi CSS.
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (location.hash === '#try') showcase.value = 'coba'
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
      el.addEventListener('transitionend', () => el.classList.remove('reveal', 'reveal-move', 'is-revealed'), { once: true })
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })

  for (const el of document.querySelectorAll<HTMLElement>('.landing [data-reveal]')) {
    if (el.getBoundingClientRect().top < window.innerHeight) continue
    el.classList.add('reveal')
    // data-reveal="move": hanya naik tanpa memudar. Opacity < 1 mematikan backdrop-filter kaca selama
    // animasi, sehingga kertas di belakangnya sempat tampil tajam sebelum buram.
    if (el.dataset.reveal === 'move') el.classList.add('reveal-move')
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
    name: 'Medium-style article',
    hint: 'Automatic title & subtitle, bubble toolbar only. Select text to format it.',
    options: { title: true, toolbar: false, stats: false },
    content: '<h1>All fine. Just write.</h1><p class="afw-subtitle">Subjudul muncul lewat tombol t kecil di baris tepat setelah judul.</p><p>Blok kalimat ini untuk memunculkan <b>bubble toolbar</b>. Tekan Enter, lalu ketik <code>/</code> untuk memilih blok: judul, kutipan, daftar, kode, gambar, atau video.</p><blockquote>Tulisan yang baik dimulai dari editor yang tidak mengganggu.</blockquote>'
  },
  {
    name: 'Full',
    hint: 'Top toolbar, bubble toolbar, slash menu, and word count.',
    options: {},
    content: '<h2>Catatan rapat</h2><p>Coba shortcut markdown: ketik <code>## </code> untuk judul, <code>- </code> untuk daftar, atau <code>**tebal**</code>.</p><ul><li><p>Rilis v2 minggu ini</p></li><li><p>Siapkan contoh Laravel</p></li></ul><p>Tempel link YouTube di baris kosong untuk menyisipkan video.</p>'
  },
  {
    name: 'Minimal',
    hint: 'No top toolbar or stats: just the bubble toolbar and slash menu.',
    options: { toolbar: false, stats: false },
    content: '<p>Editor paling ringkas. Ketik apa saja, blok untuk format, <code>/</code> untuk blok baru.</p>'
  }
]
const variant = ref(0)

// --- Data kartu showcase ---

const slashItems = [
  { icon: 'headingLarge', label: 'Heading', desc: 'Large section heading', key: '##' },
  { icon: 'headingSmall', label: 'Subheading', desc: 'Smaller section heading', key: '###' },
  { icon: 'list', label: 'Bulleted list', desc: 'Simple list', key: '-' },
  { icon: 'listOrdered', label: 'Numbered list', desc: 'Ordered list', key: '1.' },
  { icon: 'quote', label: 'Quote', desc: 'Highlight a quotation', key: '>' },
  { icon: 'code', label: 'Code', desc: 'Code block', key: '```' },
  { icon: 'image', label: 'Image', desc: 'Upload from your device', key: '' },
  { icon: 'video', label: 'Video', desc: 'YouTube or Vimeo', key: '' },
  { icon: 'minus', label: 'Divider', desc: 'Separate sections', key: '---' }
] as const

const shortcuts = [
  { label: 'Heading', keys: ['##'] },
  { label: 'Quote', keys: ['>'] },
  { label: 'Bulleted list', keys: ['-'] },
  { label: 'Numbered list', keys: ['1.'] },
  { label: 'Code block', keys: ['```'] },
  { label: 'Divider', keys: ['---'] },
  { label: 'Bold', keys: ['**text**'] },
  { label: 'Move block', keys: ['⌘', '⇧', '↑'] }
]

// Kartu "Judul & slug" memakai slugify asli dari library.
const slugTitle = ref('Café Pagi di Medan!')
const slug = computed(() => slugify(slugTitle.value))

// Kartu bubble toolbar: tombol B / i bisa diklik.
const fmt = reactive({ bold: true, italic: false })

// Kartu gambar: tiga ukuran.
const imgSize = ref<'normal' | 'wide' | 'full'>('wide')
const imgSizes = [
  { key: 'normal', label: 'Normal' },
  { key: 'wide', label: 'Wide' },
  { key: 'full', label: 'Full width' }
] as const

// Kartu bahasa: teks antarmuka asli (src/i18n.js).
const lang = ref<'id' | 'en'>('en')
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
    [['<h2>', T.tag], ['Title'], ['</h2>', T.tag]],
    [['<p>', T.tag], ['Hello '], ['<strong>', T.tag], ['world'], ['</strong>', T.tag], ['</p>', T.tag]]
  ],
  json: [
    [['{ '], ['"type"', T.attr], [': '], ['"doc"', T.str], [', '], ['"content"', T.attr], [': [']],
    [['  { '], ['"type"', T.attr], [': '], ['"heading"', T.str], [',']],
    [['    '], ['"attrs"', T.attr], [': { '], ['"level"', T.attr], [': '], ['2', T.kw], [' },']],
    [['    '], ['"content"', T.attr], [': [{ '], ['"type"', T.attr], [': '], ['"text"', T.str], [',']],
    [['      '], ['"text"', T.attr], [': '], ['"Title"', T.str], [' }] },']],
    [['  { '], ['"type"', T.attr], [': '], ['"paragraph"', T.str], [', '], ['"content"', T.attr], [': [']],
    [['    { '], ['"type"', T.attr], [': '], ['"text"', T.str], [', '], ['"text"', T.attr], [': '], ['"Hello "', T.str], [' },']],
    [['    { '], ['"type"', T.attr], [': '], ['"text"', T.str], [', '], ['"text"', T.attr], [': '], ['"world"', T.str], [',']],
    [['      '], ['"marks"', T.attr], [': [{ '], ['"type"', T.attr], [': '], ['"bold"', T.str], [' }] }']],
    [['  ] }']],
    [['] }']]
  ]
}

const tested = ['Unit tests', 'Browser · Chromium', 'Browser · Firefox', 'Browser · WebKit', 'Laravel feature tests']
</script>

<template>
  <div class="landing overflow-x-clip bg-[#f4f6f6] text-zinc-700 dark:bg-[#09090b] dark:text-zinc-200">
    <!-- HERO -->
    <section class="hero relative overflow-hidden">
      <div
        aria-hidden="true"
        class="hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
      />
      <div
        aria-hidden="true"
        class="hero-sun pointer-events-none absolute inset-0"
      />
      <!-- Garis tegas di bawah hero, seperti halaman Nuxt UI. -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-500 to-transparent dark:via-brand-400"
      />
      <!-- Horizon: cahaya di garis bawah yang membesar & meredup bergelombang. -->
      <div
        aria-hidden="true"
        class="hero-horizon pointer-events-none absolute inset-x-0 bottom-0 h-56"
      >
        <span class="hero-wave" />
        <span class="hero-wave" />
        <span class="hero-wave" />
      </div>
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-12 px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pt-24 lg:pb-24">
        <div class="flex min-w-0 flex-col items-start gap-6">
          <NuxtLink
            to="/more/why"
            style="--reveal-delay: 0ms"
            class="hero-in inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-500/15 dark:text-brand-400"
          >
            {{ FREE }}, no paid plan
            <svg
              class="size-4"
              v-bind="svgAttrs"
              v-html="ICON.arrow"
            />
          </NuxtLink>

          <h1
            style="--reveal-delay: 80ms"
            class="hero-in m-0 text-[clamp(44px,5.8vw,72px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-zinc-950 dark:text-zinc-50"
          >
            All fine.<br><span class="text-brand-600 dark:text-brand-400">Just write</span><span class="text-sun">.</span>
          </h1>
          <p
            style="--reveal-delay: 160ms"
            class="hero-in m-0 max-w-[560px] text-lg leading-[1.6] text-zinc-600 dark:text-zinc-400"
          >
            A <mark class="free-mark">free</mark>, Medium-style editor for Alpine.js and Laravel. Bubble toolbar, slash commands, markdown shortcuts, images &amp; video, and always-clean HTML. Every feature included, <span class="scribble">no paid plan<svg
              aria-hidden="true"
              viewBox="0 0 134 14"
              preserveAspectRatio="none"
            ><path
              d="M2 6.5C40 3.5 84 3 126 4.5L10 10.5C52 8 94 7.5 132 9"
              pathLength="1"
            /></svg></span>.
          </p>

          <div
            style="--reveal-delay: 240ms"
            class="hero-in flex flex-wrap gap-3"
          >
            <NuxtLink
              to="/getting-started"
              class="btn-solid"
            >
              Get started
            </NuxtLink>
            <a
              href="#try"
              class="btn-soft"
              @click="showcase = 'coba'"
            >
              Try the editor
            </a>
          </div>

          <div
            style="--reveal-delay: 320ms"
            class="hero-in flex flex-wrap items-center gap-x-3 gap-y-3 text-[13px] text-zinc-500 dark:text-zinc-400"
          >
            <span>Works with</span>
            <div class="flex items-center gap-2.5">
              <UIcon
                v-for="w in works"
                :key="w.name"
                :name="w.icon"
                :title="w.name"
                :aria-label="w.name"
                role="img"
                class="brand-logo size-4"
              />
            </div>
            <!-- Ponsel: tanpa pemisah, link turun ke baris sendiri (pemisah tidak tertinggal di ujung baris). -->
            <span
              aria-hidden="true"
              class="mx-1 hidden h-3.5 w-px bg-zinc-300 sm:block dark:bg-zinc-700"
            />
            <a
              :href="REPO"
              class="flex w-full items-center gap-1.5 transition-colors hover:text-zinc-900 sm:w-auto dark:hover:text-zinc-100"
            >
              <UIcon
                name="i-simple-icons-github"
                class="size-4"
              />100% free · MIT
            </a>
          </div>
        </div>

        <!-- Kartu editor bertab (gaya kartu kode Nuxt UI) -->
        <div
          style="--reveal-delay: 200ms"
          class="hero-in hero-in-mockup relative min-w-0"
        >
          <!-- Kertas berwarna di belakang kaca (ukuran tetap, diperkecil di ponsel). -->
          <span
            aria-hidden="true"
            class="paper paper-teal -top-8 -right-5 size-[150px] sm:-top-12 sm:-right-9 sm:size-[230px]"
            style="--r: 12deg; --d: 8s"
          />
          <span
            aria-hidden="true"
            class="paper paper-sun -top-4 right-20 size-[84px] sm:-top-5 sm:right-[70px] sm:size-[120px]"
            style="--r: -6deg; --d: 5s"
          />
          <span
            aria-hidden="true"
            class="paper paper-sun -left-5 bottom-6 size-[130px] sm:-left-11 sm:bottom-2.5 sm:size-[190px]"
            style="--r: -10deg; --d: 7s"
          />
          <span
            aria-hidden="true"
            class="paper paper-teal-soft -bottom-10 left-[38%] size-[100px] sm:-bottom-[54px] sm:size-[140px]"
            style="--r: 18deg; --d: 9s"
          />
          <div class="glass-strong relative rounded-[20px] p-2 sm:rounded-[22px] sm:p-2.5">
            <div class="flex items-center gap-1 overflow-x-auto px-0.5 pb-2 sm:pb-2.5">
              <div
                role="tablist"
                aria-label="Examples"
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
                    class="size-3.5 text-sun-ink dark:text-sun"
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
                  <UIcon
                    :name="t.icon"
                    class="size-3.5"
                  />{{ t.name }}
                </button>
              </div>
              <div class="ml-auto hidden shrink-0 items-center gap-1.5 pr-2 text-xs text-brand-600 sm:flex dark:text-brand-300">
                <span class="mock-pulse size-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />Draft saved
              </div>
            </div>

            <div class="relative rounded-xl border border-zinc-200/80 bg-white/90 shadow-[0_24px_60px_-28px_rgba(24,24,27,0.3)] dark:border-white/[0.06] dark:bg-[#0a0a0a]/88 dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)]">
              <!-- Mockup editor. Selalu ikut alur (hanya disembunyikan) agar tinggi kartu mengikuti isinya
                   dan tidak berubah saat tab kode dibuka; animasinya juga tetap jalan. -->
              <div
                class="relative flex flex-col gap-4 px-6 pt-10 pb-8 text-base leading-[1.7] text-zinc-700 sm:px-10 dark:text-zinc-300"
                :class="{ invisible: heroTab >= 0 }"
                :aria-hidden="heroTab >= 0 ? 'true' : undefined"
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
                      :class="demo.bold ? 'bg-brand-500/20 text-brand-200' : 'text-zinc-300'"
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

                <div class="border-l-[3px] border-brand-600 pl-4 text-zinc-500 dark:text-zinc-400">
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
                  >Type to filter…</span>
                </div>

                <!-- slash menu menjorok ±16px keluar dari bawah kartu luar: margin negatif = pb-8 panel (32px)
                     + jarak panel ke tepi kartu (10px, atau 48px saat deretan chip tampil) + 16px. -->
                <div
                  aria-hidden="true"
                  class="mock-pop relative z-[3] -mt-2 -mb-[58px] w-[260px] sm:-mb-[96px] lg:-mb-[58px] xl:-mb-[96px] max-w-full self-start rounded-[10px] border border-zinc-200 bg-white p-1.5 text-sm leading-[1.3] shadow-[0_20px_40px_-12px_rgba(24,24,27,0.25)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]"
                  :class="{ 'is-on': demo.menu }"
                >
                  <div class="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
                    BLOCKS
                  </div>
                  <div
                    v-for="(item, i) in [
                      { icon: 'headingLarge', label: 'Heading', key: '##' },
                      { icon: 'list', label: 'Bulleted list', key: '-' },
                      { icon: 'image', label: 'Image', key: '' },
                      { icon: 'code', label: 'Code block', key: '```' }
                    ]"
                    :key="item.label"
                    class="flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 transition-colors duration-150"
                    :class="i === demo.active ? 'bg-brand-500/15 text-zinc-950 dark:bg-brand-500/20 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-300'"
                  >
                    <span
                      class="flex size-7 items-center justify-center rounded-[6px] bg-zinc-100 dark:bg-zinc-800"
                      :class="i === demo.active ? 'text-brand-600 dark:text-brand-300' : 'text-zinc-500 dark:text-zinc-400'"
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
                class="absolute inset-0 m-0 overflow-auto px-5 py-5 font-mono text-[13.5px] leading-[1.8] text-zinc-700 sm:px-6 dark:text-zinc-300"
              ><template
                v-for="(line, n) in tabs[heroTab]!.lines"
                :key="n"
              ><span
                v-for="(tok, k) in line"
                :key="k"
                :class="tok[1]"
              >{{ tok[0] }}</span>
</template></pre>
            </div>

            <!-- Chip blok. Rata kanan agar tidak tertimpa slash menu yang menjorok keluar di kiri;
                 disembunyikan di ponsel dan di lg (kartu terlalu sempit sehingga tetap tertimpa). -->
            <div class="hidden flex-wrap justify-end gap-1.5 px-0.5 pt-2.5 sm:flex lg:hidden xl:flex">
              <span
                v-for="c in chips"
                :key="c.label"
                :title="c.label"
                class="flex size-7 items-center justify-center rounded-full ring-1 ring-inset"
                :class="c.cls"
              ><svg
                class="size-3.5"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="ICON[c.icon]"
              /></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SHOWCASE: kartu demo fitur / editor sungguhan -->
    <section
      id="try"
      class="mx-auto max-w-(--ui-container) scroll-mt-20 px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:pb-10"
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
            v-for="s in ([{ key: 'fitur', label: 'Features', icon: 'grid' }, { key: 'coba', label: 'Try it live', icon: 'play' }] as const)"
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
        <span class="hidden font-mono text-xs text-zinc-400 sm:block dark:text-zinc-500">One editor, many ways to use it</span>
      </div>

      <div
        data-reveal="move"
        style="--reveal-delay: 80ms"
        class="relative mt-4 rounded-[24px] border border-zinc-200 bg-[#edf0f0] p-3 sm:rounded-[28px] sm:p-4 dark:border-white/[0.07] dark:bg-[#0d0d0d]"
      >
        <!-- Panel tanpa overflow-hidden agar kertas boleh sedikit keluar dari tepinya; titik-titik tetap
             di dalam panel lewat sudut yang sama (rounded-[inherit]). -->
        <template v-if="showcase === 'fitur'">
          <div
            aria-hidden="true"
            class="sc-dots pointer-events-none absolute inset-0 rounded-[inherit]"
          />
          <span
            aria-hidden="true"
            class="paper paper-teal top-[70px] -left-6 size-[150px] sm:size-[210px]"
            style="--d: 9s"
          />
          <span
            aria-hidden="true"
            class="paper paper-sun top-[36%] left-[33%] size-[170px]"
            style="--d: 7s"
          />
          <span
            aria-hidden="true"
            class="paper paper-sun top-10 right-[22%] hidden size-[150px] sm:block"
            style="--d: 8s"
          />
          <span
            aria-hidden="true"
            class="paper paper-teal-soft top-[24%] -right-6 hidden size-[220px] sm:block"
            style="--d: 10s"
          />
          <span
            aria-hidden="true"
            class="paper paper-sun bottom-[60px] left-[10%] size-[150px]"
            style="--d: 6s"
          />
          <span
            aria-hidden="true"
            class="paper paper-teal right-[6%] bottom-[24%] sm:right-[36%] sm:bottom-[11%] size-[180px]"
            style="--d: 8.5s"
          />
        </template>
        <!-- FITUR -->
        <div
          v-if="showcase === 'fitur'"
          class="relative columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 xl:columns-4"
          :class="{ 'sc-clamp': !showAll }"
        >
          <!-- Slash menu -->
          <div class="sc-card sc-card-bleed">
            <div>
              <div class="sc-title">
                Slash menu &amp; + button
              </div>
              <div class="sc-desc">
                Type / on an empty line to pick a block.
              </div>
            </div>
            <div class="sc-inset overflow-hidden">
              <div class="flex h-9 items-center gap-2 border-b border-zinc-200 px-3 text-[13px] dark:border-zinc-800">
                <span class="font-semibold text-zinc-950 dark:text-zinc-50">/</span><span class="text-zinc-400 dark:text-zinc-500">Type to filter…</span>
              </div>
              <div class="p-1">
                <div class="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
                  BLOCKS
                </div>
                <!-- Sampai Kutipan terlihat jelas; satu item sesudahnya memudar, sisanya tidak ditampilkan. -->
                <div class="sc-fade-end">
                  <div
                    v-for="(item, i) in slashItems.slice(0, 6)"
                    :key="item.label"
                    class="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                    :class="i === 0 ? 'bg-brand-500/10 dark:bg-brand-500/15' : ''"
                  >
                    <span
                      class="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800"
                      :class="i === 0 ? 'text-brand-600 dark:text-brand-300' : 'text-zinc-500 dark:text-zinc-400'"
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
          </div>

          <!-- Judul & slug -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Title &amp; slug
              </div>
              <div class="sc-desc">
                The first line becomes the title; its slug rides along on the change event.
              </div>
            </div>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Title</span>
              <input
                v-model="slugTitle"
                type="text"
                class="sc-field w-full"
                aria-label="Title"
              >
            </label>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Slug</span>
              <div class="sc-field justify-between gap-2 font-mono text-brand-700 dark:text-brand-300">
                <span class="min-w-0 truncate">{{ slug || '—' }}</span>
                <button
                  type="button"
                  aria-label="Copy slug"
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
                Appears when you select text. Try clicking B and i.
              </div>
            </div>
            <div class="flex flex-col items-start gap-3 pt-1">
              <div class="flex items-center gap-0.5 rounded-[10px] border border-zinc-700 bg-zinc-900 p-1 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]">
                <button
                  type="button"
                  class="bubble-btn cursor-pointer text-sm font-extrabold transition-colors"
                  :class="fmt.bold ? 'bg-brand-500/20 text-brand-200' : 'text-zinc-300 hover:bg-zinc-800'"
                  :aria-pressed="fmt.bold"
                  aria-label="Bold"
                  @click="fmt.bold = !fmt.bold"
                >
                  B
                </button>
                <button
                  type="button"
                  class="bubble-btn cursor-pointer font-serif text-[15px] italic transition-colors"
                  :class="fmt.italic ? 'bg-brand-500/20 text-brand-200' : 'text-zinc-300 hover:bg-zinc-800'"
                  :aria-pressed="fmt.italic"
                  aria-label="Italic"
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
                  class="rounded-[3px] bg-brand-500/25 px-0.5"
                  :class="{ 'font-bold text-zinc-950 dark:text-zinc-50': fmt.bold, 'italic': fmt.italic }"
                >tenang dan fokus</span>, tanpa toolbar yang terus terlihat.
              </p>
            </div>
          </div>

          <!-- Mode artikel -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Article mode
              </div>
              <div class="sc-desc">
                Automatic title &amp; subtitle, just like Medium.
              </div>
            </div>
            <div class="grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
              <span class="pt-1.5 text-right text-[11px] text-zinc-400 dark:text-zinc-500">Title</span>
              <div class="border-l border-zinc-300 pl-3 text-lg leading-snug font-extrabold text-zinc-950 dark:border-zinc-700 dark:text-zinc-50">
                Catatan dari Medan
              </div>
              <span class="pt-0.5 text-right text-[11px] text-zinc-400 dark:text-zinc-500">Subtitle</span>
              <div class="border-l border-zinc-300 pb-1 pl-3 text-[13.5px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Pagi yang dingin dan kopi yang hangat
              </div>
              <span />
              <div class="flex flex-col gap-1.5 pt-2 pl-3">
                <span class="h-2 w-full rounded-full bg-zinc-200 dark:bg-white/15" />
                <span class="h-2 w-11/12 rounded-full bg-zinc-200 dark:bg-white/15" />
                <span class="h-2 w-3/4 rounded-full bg-zinc-200 dark:bg-white/15" />
              </div>
            </div>
          </div>

          <!-- Shortcut markdown -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Markdown shortcuts
              </div>
              <div class="sc-desc">
                Formatting applies as you type.
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
                Images &amp; video
              </div>
              <div class="sc-desc">
                Uploads, one-click replace, captions, alt text, and three sizes.
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
              Paste a video link on an empty line
            </div>
          </div>

          <!-- Engine -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Tiptap / ProseMirror engine
              </div>
              <div class="sc-desc">
                Typing, lists, and the cursor behave the same in every browser.
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
                />{{ b.name }}</span><span class="text-xs font-semibold text-brand-600 dark:text-brand-300">✓ Consistent</span>
              </div>
            </div>
          </div>

          <!-- Seret blok -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Move blocks
              </div>
              <div class="sc-desc">
                Drag by the ⋮⋮ handle, or use the keyboard.
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
              <div class="h-0.5 rounded-full bg-brand-500" />
              <div class="flex items-center gap-2 px-1 py-1.5 text-zinc-600 dark:text-zinc-400">
                <svg
                  class="size-3.5 text-zinc-300 dark:text-zinc-600"
                  v-bind="svgAttrs"
                  v-html="ICON.grip"
                />Isi utama
              </div>
              <div class="flex translate-x-3 -rotate-1 items-center gap-2 rounded-md border border-brand-500/40 bg-white px-2 py-1.5 text-zinc-900 shadow-[0_10px_24px_-8px_rgba(5,150,105,0.45)] dark:bg-zinc-900 dark:text-zinc-100">
                <svg
                  class="size-3.5 text-brand-600 dark:text-brand-400"
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
                English &amp; Indonesian
              </div>
              <div class="sc-desc">
                Every UI string can be overridden, one by one.
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-lg border border-zinc-200 bg-white p-0.5 text-[13px] font-medium dark:border-zinc-800 dark:bg-[#09090b]">
              <button
                v-for="l in (['en', 'id'] as const)"
                :key="l"
                type="button"
                class="cursor-pointer rounded-md py-1.5 transition-colors"
                :class="lang === l ? 'bg-brand-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
                @click="lang = l"
              >
                {{ l === 'id' ? 'Indonesian' : 'English' }}
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
                  HTML or JSON
                </div>
                <div class="sc-desc">
                  Store clean HTML or ProseMirror JSON.
                </div>
              </div>
              <NuxtLink
                to="/guide/json"
                class="shrink-0 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
              >Guide →</NuxtLink>
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
                Always-clean output
              </div>
              <div class="sc-desc">
                Pastes from Word, Google Docs, or the web get filtered.
              </div>
            </div>
            <div class="sc-inset p-3 font-mono text-[11.5px] leading-[1.7]">
              <div class="mb-1 font-sans text-[11px] font-semibold tracking-[0.04em] text-zinc-400 dark:text-zinc-500">
                PASTED
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
                SAVED
              </div>
              <div><span :class="T.tag">&lt;p&gt;</span>Hello <span :class="T.tag">&lt;strong&gt;</span>world<span :class="T.tag">&lt;/strong&gt;&lt;/p&gt;</span></div>
            </div>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">
              Plus an HTMLPurifier whitelist for your Laravel server.
            </div>
          </div>

          <!-- Autosave -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Draft autosave
              </div>
              <div class="sc-desc">
                Saved to localStorage, offered back later.
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
                :class="autosave ? 'bg-brand-600' : 'bg-zinc-300 dark:bg-zinc-700'"
              ><span
                class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform"
                :class="{ 'translate-x-4': autosave }"
              /></span>
              <span class="text-[13px] text-zinc-800 dark:text-zinc-200">Auto-save drafts</span>
            </button>
            <div
              class="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12.5px] text-amber-800 transition-opacity dark:text-amber-200"
              :class="{ 'opacity-40': !autosave }"
            >
              <span class="basis-full">You have an unsaved draft from 10:24.</span>
              <span class="rounded-md bg-amber-400 px-2.5 py-1 font-semibold text-stone-900">Restore</span>
              <span class="rounded-md px-2.5 py-1 font-semibold">Discard</span>
            </div>
          </div>

          <!-- Laravel -->
          <NuxtLink
            to="/integrations/laravel"
            class="sc-card sc-card-link"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-simple-icons-laravel"
                class="mt-0.5 size-5 shrink-0 text-[#FF2D20]"
              />
              <div>
                <div class="sc-title">
                  Laravel integration
                </div>
                <div class="sc-desc">
                  Blade component, uploads, server sanitizing, Livewire.
                </div>
              </div>
            </div>
            <code class="sc-inset overflow-x-auto px-3 py-2.5 font-mono text-xs whitespace-nowrap text-zinc-700 dark:text-zinc-300"><span :class="T.tag">&lt;x-wysiwyg</span> <span :class="T.attr">name</span>=<span :class="T.str">"body"</span> <span :class="T.tag">/&gt;</span></code>
          </NuxtLink>

          <!-- Pasang -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                Install in a minute
              </div>
              <div class="sc-desc">
                Via npm with a bundler, or a single script tag.
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
                :aria-label="copied ? 'Copied' : 'Copy'"
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
              {{ install === 'npm' ? 'Tiptap/ProseMirror comes along as a dependency.' : 'Tiptap/ProseMirror bundled in (~130 KB gzip). Load it before Alpine.' }}
            </div>
          </div>

          <!-- CSS -->
          <div class="sc-card">
            <div>
              <div class="sc-title">
                CSS that won't clash
              </div>
              <div class="sc-desc">
                Every class &amp; variable uses the afw prefix.
              </div>
            </div>
            <div class="sc-inset flex flex-col gap-1 p-3 font-mono text-xs">
              <span><span :class="T.tag">.afw</span> <span class="text-zinc-400">{ … }</span></span>
              <span><span :class="T.tag">.afw-toolbar</span> <span class="text-zinc-400">{ … }</span></span>
              <span><span :class="T.attr">--afw-accent</span>: <span :class="T.str">#009994</span>;</span>
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
                Tested
              </div>
              <div class="sc-desc">
                Every release is guarded by automated tests.
              </div>
            </div>
            <ul class="m-0 flex list-none flex-col gap-2 p-0 font-mono text-xs">
              <li
                v-for="t in tested"
                :key="t"
                class="flex gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <span class="text-brand-600 dark:text-brand-300">✓</span>{{ t }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Desktop: bagian bawah panel (kartu, tepi, kertas) memudar ke latar halaman. -->
        <div
          v-if="showcase === 'fitur'"
          aria-hidden="true"
          class="sc-fade-out pointer-events-none absolute -inset-x-10 -bottom-px hidden h-[240px] sm:block"
        />

        <div
          v-if="showcase === 'fitur' && !showAll"
          class="relative -mt-28 flex justify-center bg-linear-to-b from-transparent via-[#edf0f0] to-[#edf0f0] pt-20 pb-1 sm:hidden dark:via-[#0d0d0d] dark:to-[#0d0d0d]"
        >
          <button
            type="button"
            class="btn-soft cursor-pointer gap-2"
            @click="showAll = true"
          >
            Show all features
            <svg
              class="size-4"
              v-bind="svgAttrs"
              v-html="ICON.down"
            />
          </button>
        </div>

        <div
          v-if="showcase === 'fitur' && showAll"
          class="sticky bottom-4 z-10 flex justify-center pt-1 pb-1 sm:hidden"
        >
          <!-- Menempel di bawah layar selama daftar fitur yang terbuka masih terlihat. -->
          <button
            type="button"
            class="btn-soft btn-float cursor-pointer gap-2"
            @click="collapseFeatures"
          >
            Show less
            <svg
              class="size-4 rotate-180"
              v-bind="svgAttrs"
              v-html="ICON.down"
            />
          </button>
        </div>

        <!-- COBA LANGSUNG (syarat eksplisit: blok di atasnya bukan pasangan v-if/v-else) -->
        <div
          v-if="showcase === 'coba'"
          class="relative mx-auto flex w-full max-w-[860px] flex-col gap-4 py-4 sm:py-8"
        >
          <div
            role="tablist"
            aria-label="Editor variants"
            class="flex flex-wrap justify-center gap-2"
          >
            <button
              v-for="(v, i) in variants"
              :key="v.name"
              type="button"
              role="tab"
              :aria-selected="variant === i"
              class="cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
              :class="variant === i ? 'border-brand-600 bg-brand-600 text-white' : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50'"
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
    <section class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8 pb-24">
      <div
        data-reveal="move"
        class="relative overflow-hidden rounded-[22px]"
      >
        <div
          aria-hidden="true"
          class="sc-dots pointer-events-none absolute inset-0"
        />
        <span
          aria-hidden="true"
          class="paper paper-teal top-[18%] left-[6%] size-[120px] sm:size-[170px]"
          style="--r: -14deg; --d: 7s"
        />
        <span
          aria-hidden="true"
          class="paper paper-sun bottom-[6%] left-[16%] size-[90px] sm:size-[110px]"
          style="--r: 10deg; --d: 5s"
        />
        <span
          aria-hidden="true"
          class="paper paper-sun top-[6%] right-[8%] size-[110px] sm:size-[150px]"
          style="--r: 16deg; --d: 8s"
        />
        <span
          aria-hidden="true"
          class="paper paper-teal-soft right-[18%] bottom-[10%] size-[120px]"
          style="--r: -8deg; --d: 6s"
        />
        <div class="glass cta-panel relative flex flex-col items-center gap-5 overflow-hidden rounded-[22px] px-6 py-20 text-center sm:px-8">
          <!-- Cahaya yang bergerak sambil meredup dan menerang. -->
          <div
            aria-hidden="true"
            class="cta-glow pointer-events-none absolute inset-0"
          />
          <h2 class="section-title relative">
            Ready to try it<span class="text-sun">?</span>
          </h2>
          <p class="relative m-0 max-w-[520px] text-[17px] leading-[1.65] text-zinc-600 dark:text-zinc-400">
            Every feature is free. Install via npm or CDN, add a single x-data attribute, and the editor is ready to use in your forms.
          </p>
          <div class="relative mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <NuxtLink
              to="/getting-started/installation"
              class="btn-primary justify-center"
            >
              Installation
              <svg
                class="size-4"
                v-bind="svgAttrs"
                v-html="ICON.arrow"
              />
            </NuxtLink>
            <a
              href="#try"
              class="btn-ghost justify-center bg-white/50 dark:bg-[#0a0a0a]/40"
              @click="showcase = 'coba'"
            >
              <svg
                class="size-4"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="ICON.play"
              />
              Try the editor
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER landing -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto flex max-w-(--ui-container) flex-col items-center gap-5 px-4 sm:px-6 lg:px-8 py-8 text-[13px] text-zinc-500 md:flex-row md:justify-between dark:text-zinc-400">
        <div class="flex items-center gap-2">
          <img
            :src="logo"
            alt=""
            class="size-5"
          >
          <span class="font-logo font-semibold text-zinc-950 dark:text-zinc-50">{{ BRAND }}</span>
          <span>· {{ FREE }} · MIT License</span>
        </div>
        <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <NuxtLink
            to="/getting-started/installation"
            class="foot-link"
          >Installation</NuxtLink>
          <NuxtLink
            to="/guide/options"
            class="foot-link"
          >Options</NuxtLink>
          <NuxtLink
            to="/integrations/laravel"
            class="foot-link"
          >Laravel</NuxtLink>
          <NuxtLink
            to="/getting-started/demo"
            class="foot-link"
          >Demo</NuxtLink>
          <NuxtLink
            to="/more/changelog"
            class="foot-link"
          >Changelog</NuxtLink>
          <NuxtLink
            to="/more/why"
            class="foot-link"
          >Why afwrite</NuxtLink>
        </nav>
        <div class="flex items-center gap-4">
          <span class="hidden lg:inline">Built with Tiptap, ProseMirror &amp; Nuxt UI</span>
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

/* Latar hero: pendar brand dari bawah. */
.landing .hero-fade {
  background: linear-gradient(to bottom, transparent, rgba(12, 180, 174, 0.14));
}

.dark .landing .hero-fade {
  background: linear-gradient(to bottom, transparent, rgba(12, 180, 174, 0.16));
}

/* Horizon hero: cahaya di sepanjang garis bawah (tepi kiri sampai kanan layar) yang membesar lalu
   meredup. Pendar dasar bernapas, pita-pita cahaya menyapu ke kanan dan ke kiri, dan garisnya ikut
   menyala. Sengaja tidak simetris: tiap pita punya lebar, tinggi, kecepatan, dan titik terang sendiri. */
.landing .hero-horizon {
  overflow: hidden;
}

/* Pendar dasar selebar layar, lebih terang di beberapa bagian. */
.landing .hero-horizon::before {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 70px;
  background: linear-gradient(to top, rgba(12, 180, 174, 0.22), transparent);
  -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.45), #000 28%, rgba(0, 0, 0, 0.6) 55%, #000 80%, rgba(0, 0, 0, 0.5));
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.45), #000 28%, rgba(0, 0, 0, 0.6) 55%, #000 80%, rgba(0, 0, 0, 0.5));
  transform-origin: 50% 100%;
  animation: hero-breathe 7s ease-in-out infinite;
}

.dark .landing .hero-horizon::before {
  background: linear-gradient(to top, rgba(20, 204, 198, 0.18), transparent);
}

/* Garis horizon yang menyala, paling terang agak ke kiri. */
.landing .hero-horizon::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: linear-gradient(to right, rgba(12, 180, 174, 0.3), rgba(12, 180, 174, 0.95) 36%, rgba(12, 180, 174, 0.55) 70%, rgba(12, 180, 174, 0.35));
  animation: hero-core 5s ease-in-out infinite;
}

.dark .landing .hero-horizon::after {
  background: linear-gradient(to right, rgba(20, 204, 198, 0.35), rgba(211, 247, 244, 0.95) 36%, rgba(20, 204, 198, 0.6) 70%, rgba(20, 204, 198, 0.4));
}

/* Pita cahaya datar yang menempel di garis (memudar ke atas dan ke kedua sisi, tanpa lengkung).
   --from/--to: posisi awal & akhir (persen lebar pita sendiri), --mid: posisi saat paling terang. */
.landing .hero-wave {
  --w: 40%;
  --peak: 1;
  position: absolute;
  bottom: 0;
  left: 0;
  width: var(--w);
  height: 80px;
  background: linear-gradient(to top, rgba(12, 180, 174, 0.34), rgba(12, 180, 174, 0.08) 45%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 30%, #000 60%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 30%, #000 60%, transparent);
  opacity: 0;
  transform-origin: 50% 100%;
  animation: hero-sweep 11s ease-in-out infinite;
}

.dark .landing .hero-wave {
  background: linear-gradient(to top, rgba(20, 204, 198, 0.3), rgba(20, 204, 198, 0.07) 45%, transparent);
}

/* Ke kanan, sedang. */
.landing .hero-wave:nth-child(1) {
  --from: -100%;
  --mid: 70%;
  --to: 250%;
  animation-delay: -2s;
}

/* Ke kiri, lebar & rendah, lebih lambat dan redup. */
.landing .hero-wave:nth-child(2) {
  --w: 58%;
  --peak: 0.7;
  --from: 172%;
  --mid: 25%;
  --to: -100%;
  height: 55px;
  animation-duration: 15s;
  animation-delay: -9s;
}

/* Ke kanan, sempit & tinggi, paling lambat. */
.landing .hero-wave:nth-child(3) {
  --w: 26%;
  --peak: 0.55;
  --from: -100%;
  --mid: 230%;
  --to: 385%;
  height: 115px;
  animation-duration: 19s;
  animation-delay: -13s;
}

@keyframes hero-breathe {
  0%,
  100% { opacity: 0.5; transform: scaleY(0.7); }
  45% { opacity: 1; transform: scaleY(1.25); }
}

@keyframes hero-sweep {
  0% { opacity: 0; transform: translateX(var(--from)) scale(0.7, 0.6); }
  42% { opacity: var(--peak); transform: translateX(var(--mid)) scale(1.3, 1); }
  100% { opacity: 0; transform: translateX(var(--to)) scale(0.8, 0.7); }
}

@keyframes hero-core {
  0%,
  100% { opacity: 0.5; }
  55% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .landing .hero-horizon::before,
  .landing .hero-horizon::after {
    animation: none;
  }

  .landing .hero-wave {
    display: none;
  }
}

/* CTA: latar gelap dengan cahaya brand yang bergerak. Lapisan gradien besar perlahan berpindah
   posisi, pendar bawah bergeser kiri-kanan sambil bernapas, dan pendar di belakang judul bergerak
   berlawanan arah. */
.landing .cta-glow {
  background:
    radial-gradient(38% 60% at 18% 100%, rgba(12, 180, 174, 0.2), transparent 70%),
    radial-gradient(34% 55% at 85% 10%, rgba(12, 180, 174, 0.12), transparent 70%);
  background-size: 160% 160%;
  animation: cta-pan 16s ease-in-out infinite alternate;
}

.dark .landing .cta-glow {
  background:
    radial-gradient(38% 60% at 18% 100%, rgba(20, 204, 198, 0.16), transparent 70%),
    radial-gradient(34% 55% at 85% 10%, rgba(20, 204, 198, 0.08), transparent 70%);
  background-size: 160% 160%;
}

.landing .cta-glow::before,
.landing .cta-glow::after {
  content: '';
  position: absolute;
  left: 50%;
  border-radius: 50%;
}

/* Pendar lebar dari tepi bawah. */
.landing .cta-glow::before {
  bottom: -55%;
  width: 80%;
  height: 100%;
  background: radial-gradient(closest-side, rgba(12, 180, 174, 0.34), transparent);
  animation: cta-drift-bottom 11s ease-in-out infinite;
}

/* Pendar lembut di belakang judul. */
.landing .cta-glow::after {
  top: 6%;
  width: 44%;
  height: 55%;
  background: radial-gradient(closest-side, rgba(12, 180, 174, 0.16), transparent);
  animation: cta-drift-top 13s ease-in-out infinite;
}

.dark .landing .cta-glow::before {
  background: radial-gradient(closest-side, rgba(20, 204, 198, 0.28), transparent);
}

.dark .landing .cta-glow::after {
  background: radial-gradient(closest-side, rgba(20, 204, 198, 0.13), transparent);
}

@keyframes cta-pan {
  0% { background-position: 0% 100%; }
  50% { background-position: 60% 40%; }
  100% { background-position: 100% 0%; }
}

@keyframes cta-drift-bottom {
  0%,
  100% { opacity: 0.4; transform: translateX(-78%) scale(0.9); }
  50% { opacity: 1; transform: translateX(-22%) scale(1.1); }
}

@keyframes cta-drift-top {
  0%,
  100% { opacity: 0.9; transform: translateX(-25%) translateY(4%) scale(1.05); }
  50% { opacity: 0.35; transform: translateX(-75%) translateY(-6%) scale(0.9); }
}

@media (prefers-reduced-motion: reduce) {
  .landing .cta-glow,
  .landing .cta-glow::before,
  .landing .cta-glow::after {
    animation: none;
  }

  .landing .cta-glow::before,
  .landing .cta-glow::after {
    transform: translateX(-50%);
    opacity: 0.7;
  }
}

/* Aksen kuning logo di pojok kanan atas hero. Ukuran tetap (bukan persen) agar tidak menjadi pita
   tegak di layar sempit. */
.landing .hero-sun {
  background: radial-gradient(min(420px, 85vw) min(320px, 60vw) at 92% 0%, rgba(255, 187, 0, 0.14), transparent 70%);
}

.dark .landing .hero-sun {
  background: radial-gradient(min(420px, 85vw) min(320px, 60vw) at 92% 0%, rgba(255, 187, 0, 0.12), transparent 70%);
}

/* Kata "free" di deskripsi hero: label kuning logo supaya langsung terlihat. */
.landing .free-mark {
  padding: 1px 7px;
  border-radius: 6px;
  background: rgba(255, 187, 0, 0.22);
  color: #7a5200;
  font-weight: 600;
}

.dark .landing .free-mark {
  background: rgba(255, 187, 0, 0.16);
  color: #ffd25e;
}

/* "no paid plan": coretan tangan (SVG) di bawah teks, digambar saat hero muncul. */
.landing .scribble {
  position: relative;
  white-space: nowrap;
  color: #18181b;
}

.dark .landing .scribble {
  color: #fafafa;
}

.landing .scribble svg {
  position: absolute;
  left: -6px;
  bottom: -10px;
  width: calc(100% + 16px);
  height: 13px;
  overflow: visible;
}

.landing .scribble path {
  fill: none;
  stroke: #ffbb00;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: afw-scribble 1.1s cubic-bezier(0.65, 0, 0.35, 1) 1s forwards;
}

@keyframes afw-scribble {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing .scribble path {
    animation: none;
    stroke-dashoffset: 0;
  }
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
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: #71717a;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.landing .hero-tab:hover {
  color: #18181b;
}

/* Ring di dalam pill: baris tab bisa di-scroll, jadi ring di luar akan terpotong. */
.landing .hero-tab:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: -2px;
}

.landing .hero-tab.is-active {
  background: #fff;
  color: #09090b;
  box-shadow: 0 1px 2px rgba(24, 24, 27, 0.08);
}

.dark .landing .hero-tab {
  color: #a1a1aa;
}

.dark .landing .hero-tab:hover {
  color: #f4f4f5;
}

.dark .landing .hero-tab.is-active {
  background: rgba(255, 255, 255, 0.08);
  color: #fafafa;
  box-shadow: none;
}

/* Tombol hero (bentuk mengikuti Nuxt UI: solid + soft, tanpa ikon). */
.landing .btn-solid,
.landing .btn-soft {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.landing .btn-solid {
  background: #009994;
  color: #fff;
}

.landing .btn-solid:hover {
  background: #0cb4ae;
}

.landing .btn-soft {
  background: rgba(24, 24, 27, 0.06);
  color: #18181b;
}

.landing .btn-soft:hover {
  background: rgba(24, 24, 27, 0.1);
}

.dark .landing .btn-soft {
  background: rgba(255, 255, 255, 0.07);
  color: #f4f4f5;
}

.dark .landing .btn-soft:hover {
  background: rgba(255, 255, 255, 0.11);
}

.landing .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  background: #009994;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 8px 24px -8px rgba(0, 153, 148, 0.6);
  transition: background-color 0.2s;
}

.landing .btn-primary:hover {
  background: #0cb4ae;
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

/* Kaca + kertas: bentuk berwarna (kertas) di belakang panel kaca buram. */
.landing .glass,
.landing .glass-strong {
  border: 1px solid rgba(24, 24, 27, 0.08);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  backdrop-filter: blur(22px) saturate(150%);
}

.landing .glass {
  background-color: rgba(255, 255, 255, 0.66);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 24px 48px -24px rgba(24, 24, 27, 0.22);
}

.landing .glass-strong {
  background-color: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  backdrop-filter: blur(28px) saturate(160%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 30px 60px -20px rgba(24, 24, 27, 0.28);
}

.dark .landing .glass {
  border-color: rgba(255, 255, 255, 0.08);
  background-color: rgba(22, 22, 22, 0.8);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 24px 48px -24px rgba(0, 0, 0, 0.7);
}

.dark .landing .glass-strong {
  border-color: rgba(255, 255, 255, 0.1);
  background-color: rgba(16, 16, 16, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 30px 60px -20px rgba(0, 0, 0, 0.75);
}

/* Panel CTA sedikit lebih gelap dari kaca biasa agar cahayanya menonjol. */
.dark .landing .cta-panel {
  background-color: rgba(8, 9, 10, 0.8);
}

/* --r: rotasi, --d: durasi melayang (tanpa --d deklarasi animation tidak valid, jadi kertas diam). */
.landing .paper {
  position: absolute;
  border-radius: 16px;
  pointer-events: none;
  transform: rotate(var(--r, 0deg));
  animation: paper-float var(--d) ease-in-out infinite;
}

.landing .paper-teal {
  background: #009994;
}

.landing .paper-teal-soft {
  background: #3fb5ae;
}

.landing .paper-sun {
  background: #f7c143;
}

.dark .landing .paper-teal {
  background: #0a8a85;
}

.dark .landing .paper-teal-soft {
  background: #2f9c96;
}

/* Naik-turun cukup jauh agar tetap terlihat di balik kaca buram. */
@keyframes paper-float {
  0%,
  100% { transform: translateY(0) rotate(var(--r, 0deg)); }
  50% { transform: translateY(-24px) rotate(calc(var(--r, 0deg) + 6deg)); }
}

@media (prefers-reduced-motion: reduce) {
  .landing .paper {
    animation: none;
  }
}

/* Titik-titik di wadah showcase & CTA, memudar di atas dan bawah. */
.landing .sc-dots {
  background-image: radial-gradient(rgba(24, 24, 27, 0.16) 1px, transparent 1.3px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 70%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 70%, transparent);
  opacity: 0.6;
}

.dark .landing .sc-dots {
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1.3px);
}

/* Kartu showcase (masonry lewat CSS columns), berupa kaca di atas kertas. */
.landing .sc-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  break-inside: avoid;
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.66);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  backdrop-filter: blur(22px) saturate(150%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 24px 48px -24px rgba(24, 24, 27, 0.18);
  transition: border-color 0.2s;
}

.landing .sc-card:hover {
  border-color: rgba(12, 180, 174, 0.45);
}

@media (min-width: 640px) {
  .landing .sc-card {
    margin-bottom: 16px;
  }
}

.dark .landing .sc-card {
  border-color: rgba(255, 255, 255, 0.08);
  background-color: rgba(22, 22, 22, 0.8);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 24px 48px -24px rgba(0, 0, 0, 0.7);
}

/* Ponsel: hanya 5 kartu pertama sampai "Tampilkan semua fitur" ditekan. */
@media (max-width: 639px) {
  .landing .sc-clamp > :nth-child(n + 6) {
    display: none;
  }
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
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 10px;
  background: rgba(250, 250, 250, 0.7);
}

.dark .landing .sc-inset {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 10, 0.55);
}

/* Ujung bawah panel fitur memudar ke latar halaman, dengan kurva agar tidak terlihat seperti pita. */
.landing .sc-fade-out {
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--ui-bg) 45%, transparent) 40%,
    color-mix(in srgb, var(--ui-bg) 85%, transparent) 72%,
    var(--ui-bg) 92%
  );
}

/* Tombol yang melayang di atas kartu (sticky): latar padat agar tetap terbaca. */
.landing .btn-soft.btn-float {
  border: 1px solid rgba(24, 24, 27, 0.1);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(24, 24, 27, 0.14);
  backdrop-filter: blur(8px);
}

.dark .landing .btn-soft.btn-float {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(24, 24, 27, 0.92);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

/* Daftar yang terpotong: item terakhir memudar ke bawah. */
.landing .sc-fade-end {
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent);
}

/* Panel terakhir menembus tepi bawah kartu dan terpotong olehnya (seperti landing Livewire). */
.landing .sc-card-bleed {
  overflow: hidden;
  padding-bottom: 0;
}

.landing .sc-card-bleed > .sc-inset:last-child {
  margin-bottom: -1px;
  padding-bottom: 6px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
  border-color: #0cb4ae;
  box-shadow: 0 0 0 3px rgba(12, 180, 174, 0.15);
}

.dark .landing .sc-field {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(10, 10, 10, 0.55);
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

/* Gambar contoh "Senja di Parangtritis": kuning logo ke teal brand. */
.landing .img-mock {
  background: linear-gradient(135deg, #f7c143 0%, #3fb5ae 55%, #127a76 100%);
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
/* Mock hero berkaca: tanpa opacity (lihat data-reveal="move"). */
@keyframes afw-rise-mockup {
  from {
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
.landing .reveal.reveal-move {
  opacity: 1;
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
  background: #ffbb00;
  animation: afw-blink 1s steps(1) infinite;
}
@keyframes afw-blink {
  50% {
    opacity: 0;
  }
}
.landing .mock-sel {
  background-image: linear-gradient(rgba(12, 180, 174, 0.3), rgba(12, 180, 174, 0.3));
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
    box-shadow: 0 0 0 0 rgba(20, 204, 198, 0.55);
  }
  70%,
  100% {
    box-shadow: 0 0 0 6px rgba(20, 204, 198, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .landing .mock-caret,
  .landing .mock-pulse {
    animation: none;
  }
}
</style>
