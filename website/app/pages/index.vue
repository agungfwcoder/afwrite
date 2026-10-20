<script setup lang="ts">
// Landing page. Desain mengikuti referensi "Landing — afwrite" (warna utama emerald; mode gelap mengikuti nada referensi),
// dengan padanan mode terang. Teks SEO diambil dari content/index.md.
import { useClipboard } from '@vueuse/core'
import { BRAND } from '~~/brand'

const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })
}

const title = `${BRAND} — ${page.value.seo?.title || page.value.title}`
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const REPO = 'https://github.com/agungfwcoder/afwrite'
const INSTALL = 'npm i github:agungfwcoder/afwrite'

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
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  pointer: '<path d="m3 3 7 19 2.5-7.5L20 12Z"/>',
  slash: '<path d="M16 4 8 20"/>',
  markdown: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 15V9l3 3 3-3v6M15 12l2 3 2-3M17 9v6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
  chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  box: '<path d="M12 22V12M12 12 3 7M12 12l9-5M3 7l9-5 9 5v10l-9 5-9-5Z"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/>',
  language: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
  flask: '<path d="M9 2v6l-5 9a3 3 0 0 0 2.6 4.5h10.8A3 3 0 0 0 20 17l-5-9V2M8 2h8M7 15h10"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
}

// Warna aksen per kartu: [latar ikon, border ikon, warna ikon] untuk terang / gelap.
const TONE = {
  primary: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
  violet: 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-300',
  sky: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-300',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300',
  teal: 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-300',
  rose: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
}

const features = [
  { icon: 'pointer', tone: 'primary', title: 'Bubble toolbar', text: 'Blok teks untuk tebal, miring, link, dan judul. Toolbar atas bisa dimatikan agar tampilan sepenuhnya ala Medium.' },
  { icon: 'slash', tone: 'violet', title: 'Slash command & tombol +', text: 'Ketik / atau klik + di baris kosong untuk memilih judul, kutipan, list, kode, gambar, video, atau pemisah.' },
  { icon: 'markdown', tone: 'sky', title: 'Shortcut markdown', codes: ['##', '>', '-', '1.', '---', '```', '**tebal**', '*miring*'], text: 'langsung berubah format saat mengetik.' },
  { icon: 'image', tone: 'amber', title: 'Gambar & video', text: 'Upload, keterangan, alt text, tiga ukuran, seret file, tempel screenshot, serta video YouTube dan Vimeo.' },
  { icon: 'shield', tone: 'teal', title: 'Output selalu bersih', text: 'Paste dari Word, Google Docs, atau web disaring whitelist. Tersedia sanitasi server untuk Laravel (HTMLPurifier).' },
  { icon: 'layers', tone: 'rose', title: 'CSS tidak bentrok', text: 'Semua class dan variabel memakai prefix afw, aman bersama Bootstrap 5, Tailwind, dan framework lain.' }
] as const

const steps = [
  { title: 'Pasang paketnya', text: 'Lewat npm dengan bundler, atau satu tag <script> dari CDN.' },
  { title: 'Tambahkan ke form', text: 'Beri nama field; HTML-nya ikut ter-submit.' },
  { title: 'Sanitasi di server', text: 'Whitelist HTMLPurifier siap pakai untuk Laravel.' }
]

// Tab contoh kode. Token: [teks, kelas warna]; baris = array token.
type Token = [string, string?]
const T = { tag: 'text-pink-600 dark:text-pink-400', attr: 'text-emerald-600 dark:text-emerald-300', str: 'text-emerald-700 dark:text-emerald-300', kw: 'text-violet-600 dark:text-violet-300', dim: 'text-zinc-400 dark:text-zinc-500' }
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
      [['<form', T.tag], [' '], ['method', T.attr], ['='], ['"post"', T.str], [' '], ['action', T.attr], ['='], ['"{{ route(\'posts.update\', $post) }}"', T.str], ['>', T.tag]],
      [['  @csrf', T.kw]],
      [['  <x-wysiwyg', T.tag], [' '], ['name', T.attr], ['='], ['"body"', T.str], [' '], [':value', T.attr], ['='], ['"$post->body"', T.str], [' '], ['/>', T.tag]],
      [['  <button>', T.tag], ['Simpan'], ['</button>', T.tag]],
      [['</form>', T.tag]]
    ]
  }
]
const tab = ref(0)

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

// Animasi reveal: elemen [data-reveal] di bawah layar disembunyikan lalu muncul saat di-scroll.
// Yang sudah terlihat saat halaman dibuka dibiarkan (tanpa kedip); hero memakai animasi CSS.
let observer: IntersectionObserver | null = null
onMounted(() => {
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

const browsers = ['Chrome', 'Firefox', 'Safari']
const tested = ['Unit test', 'Browser · Chromium', 'Browser · Firefox', 'Browser · WebKit', 'Feature test Laravel']
</script>

<template>
  <div class="landing bg-white text-zinc-700 dark:bg-[#09090b] dark:text-zinc-200">
    <!-- HERO -->
    <section class="afw-grid-bg relative border-b border-zinc-100 dark:border-zinc-900">
      <div
        aria-hidden="true"
        class="hero-glow pointer-events-none absolute inset-0"
      />
      <div class="relative mx-auto flex max-w-[1200px] flex-wrap items-center gap-16 px-6 pt-24 pb-28">
        <div class="flex min-w-0 flex-[1_1_460px] flex-col gap-7">
          <NuxtLink
            to="/memulai/instalasi"
            style="--reveal-delay: 0ms"
            class="hero-in inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/30 bg-emerald-600/10 py-1 pr-3 pl-1 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-600/15 dark:text-emerald-200"
          >
            <span class="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-white">BARU</span>
            v2.1 · Pakai langsung dari CDN
            <svg
              class="size-3.5"
              v-bind="svgAttrs"
              v-html="ICON.chevron"
            />
          </NuxtLink>

          <h1
            style="--reveal-delay: 80ms"
            class="hero-in m-0 text-[clamp(44px,6vw,72px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-zinc-950 dark:text-zinc-50"
          >
            Editor WYSIWYG yang <span class="text-emerald-600 dark:text-emerald-400">tidak mengganggu.</span>
          </h1>
          <p
            style="--reveal-delay: 160ms"
            class="hero-in m-0 max-w-[560px] text-lg leading-[1.65] text-zinc-600 dark:text-zinc-400"
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
            <NuxtLink
              to="/memulai/demo"
              class="btn-ghost"
            >
              <svg
                class="size-4"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="ICON.play"
              />
              Coba editornya
            </NuxtLink>
          </div>

          <div
            style="--reveal-delay: 320ms"
            class="hero-in flex max-w-full items-center gap-3 self-start rounded-[10px] border border-zinc-200 bg-zinc-50 py-2.5 pr-2.5 pl-4 font-mono text-[13px] text-zinc-700 dark:border-zinc-800 dark:bg-[#111113] dark:text-zinc-300"
          >
            <span
              class="text-zinc-400 dark:text-zinc-500"
              aria-hidden="true"
            >$</span>
            <code class="min-w-0 truncate">{{ INSTALL }}</code>
            <button
              type="button"
              :aria-label="copied ? 'Tersalin' : 'Salin perintah'"
              class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              @click="copy(INSTALL)"
            >
              <svg
                class="size-[15px]"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="copied ? ICON.check : ICON.copy"
              />
            </button>
          </div>
        </div>

        <!-- Mockup editor -->
        <div
          style="--reveal-delay: 200ms"
          class="hero-in hero-in-mockup relative min-w-0 flex-[1_1_480px]"
        >
          <div
            aria-hidden="true"
            class="mockup-ring pointer-events-none absolute -inset-px rounded-[17px]"
          />
          <div class="relative rounded-2xl bg-white shadow-[0_40px_80px_-20px_rgba(24,24,27,0.25)] dark:bg-[#111113] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
            <div class="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div
                aria-hidden="true"
                class="flex gap-1.5"
              >
                <span
                  v-for="i in 3"
                  :key="i"
                  class="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"
                />
              </div>
              <div class="flex-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Tulisan baru
              </div>
              <div class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300">
                <span class="mock-pulse size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />Draf tersimpan
              </div>
            </div>

            <div class="relative flex flex-col gap-4 px-6 pt-10 pb-12 text-base sm:px-10 leading-[1.7] text-zinc-700 dark:text-zinc-300">
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
          </div>
        </div>
      </div>
    </section>

    <!-- BEKERJA BERSAMA -->
    <section class="border-b border-zinc-100 dark:border-zinc-900">
      <div
        data-reveal
        class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-8 text-sm"
      >
        <span class="text-xs font-semibold tracking-[0.08em] text-zinc-500 dark:text-zinc-400">BEKERJA BERSAMA</span>
        <span
          v-for="name in ['Alpine.js', 'Laravel', 'Livewire', 'Bootstrap 5', 'Tailwind CSS']"
          :key="name"
          class="text-base font-bold text-zinc-600 dark:text-zinc-300"
        >{{ name }}</span>
      </div>
    </section>

    <!-- MULAI CEPAT -->
    <section class="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-6 py-28">
      <div
        data-reveal
        class="flex min-w-0 flex-[1_1_380px] flex-col gap-8"
      >
        <div class="flex flex-col gap-3">
          <span class="eyebrow">MULAI CEPAT</span>
          <h2 class="section-title">
            Satu atribut, editor langsung jalan.
          </h2>
          <p class="m-0 text-[17px] leading-[1.65] text-zinc-600 dark:text-zinc-400">
            Tidak perlu membangun toolbar sendiri. Pasang paketnya, tambahkan <code class="inline-code">x-data</code>, dan isi editor terkirim bersama form.
          </p>
        </div>
        <ol class="m-0 flex list-none flex-col gap-5 p-0">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            class="flex gap-4"
          >
            <span class="flex size-8 flex-none items-center justify-center rounded-full border border-emerald-600 text-sm font-bold text-emerald-700 dark:text-emerald-200">{{ i + 1 }}</span>
            <div>
              <div class="font-semibold text-zinc-950 dark:text-zinc-50">
                {{ step.title }}
              </div>
              <div class="text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                {{ step.text }}
              </div>
            </div>
          </li>
        </ol>
      </div>

      <div
        data-reveal
        style="--reveal-delay: 120ms"
        class="min-w-0 flex-[1_1_520px] overflow-hidden rounded-[14px] border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#111113]"
      >
        <div
          role="tablist"
          aria-label="Contoh kode"
          class="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 px-2 pt-2 dark:border-zinc-800"
        >
          <button
            v-for="(t, i) in tabs"
            :key="t.name"
            type="button"
            role="tab"
            :aria-selected="tab === i"
            class="flex h-9 cursor-pointer items-center gap-2 border-b-2 px-3.5 text-[13px] font-medium transition-colors"
            :class="tab === i ? 'border-emerald-500 text-zinc-950 dark:border-emerald-400 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
            @click="tab = i"
          >
            <span
              class="size-2 rounded-[2px]"
              :class="t.dot"
            />{{ t.name }}
          </button>
        </div>
        <pre
          class="m-0 overflow-x-auto p-6 font-mono text-sm leading-[1.85] text-zinc-700 dark:text-zinc-300"
          role="tabpanel"
        ><template
          v-for="(line, n) in tabs[tab]!.lines"
          :key="n"
        ><span :class="T.dim">{{ n + 1 }}</span>  <span
          v-for="(tok, k) in line"
          :key="k"
          :class="tok[1]"
        >{{ tok[0] }}</span>
</template></pre>
        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-6 py-3 text-[13px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>Output: HTML bersih, siap disimpan.</span>
          <NuxtLink
            to="/memulai/demo"
            class="text-link"
          >Lihat hasilnya →</NuxtLink>
        </div>
      </div>
    </section>

    <!-- FITUR -->
    <section class="border-t border-zinc-100 bg-zinc-50/60 dark:border-zinc-900 dark:bg-[#0c0c0e]">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-14 px-6 py-28">
        <div
          data-reveal
          class="flex flex-col items-center gap-3 text-center"
        >
          <span class="eyebrow">PENGALAMAN MENULIS</span>
          <h2 class="section-title">
            Menulis tanpa gangguan
          </h2>
          <p class="m-0 max-w-[600px] text-[17px] leading-[1.65] text-zinc-600 dark:text-zinc-400">
            Semua alat ada saat dibutuhkan, tersembunyi saat tidak.
          </p>
        </div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            data-reveal
            :style="{ '--reveal-delay': `${(i % 3) * 80}ms` }"
            class="card flex flex-col gap-3.5 rounded-[14px] p-7"
          >
            <span
              class="icon-tile"
              :class="TONE[f.tone]"
            ><svg
              class="size-5"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON[f.icon]"
            /></span>
            <div class="text-[17px] font-bold text-zinc-950 dark:text-zinc-50">
              {{ f.title }}
            </div>
            <div class="text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
              <template v-if="'codes' in f">
                <template
                  v-for="(c, i) in f.codes"
                  :key="c"
                >
                  <code class="font-mono text-[13px] text-zinc-900 dark:text-zinc-200">{{ c }}</code>{{ i < f.codes.length - 1 ? ', ' : ' ' }}
                </template>
              </template>{{ f.text }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- UNTUK PRODUKSI -->
    <section class="border-t border-zinc-100 dark:border-zinc-900">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-14 px-6 py-28">
        <div
          data-reveal
          class="flex flex-col items-center gap-3 text-center"
        >
          <span class="eyebrow">UNTUK PRODUKSI</span>
          <h2 class="section-title">
            Siap untuk aplikasi sungguhan
          </h2>
        </div>

        <div class="flex flex-wrap gap-4">
          <!-- Engine -->
          <div
            data-reveal
            style="--reveal-delay: 0ms"
            class="card flex min-w-0 flex-[2_1_560px] flex-wrap items-center gap-8 rounded-2xl p-8"
          >
            <div class="flex flex-[1_1_260px] flex-col gap-3">
              <span
                class="icon-tile"
                :class="TONE.primary"
              ><svg
                class="size-5"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="ICON.chip"
              /></span>
              <div class="bento-title">
                Engine Tiptap / ProseMirror
              </div>
              <div class="bento-text">
                Mengetik, list, format, dan kursor konsisten di semua browser utama, tanpa tambalan khusus per browser.
              </div>
            </div>
            <div class="flex flex-[1_1_220px] flex-col gap-2">
              <div
                v-for="b in browsers"
                :key="b"
                class="flex items-center justify-between rounded-[10px] border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-[#09090b]"
              >
                <span class="text-zinc-800 dark:text-zinc-200">{{ b }}</span><span class="text-[13px] font-semibold text-emerald-600 dark:text-emerald-300">✓ Konsisten</span>
              </div>
            </div>
          </div>

          <!-- Laravel -->
          <NuxtLink
            to="/integrasi/laravel"
            data-reveal
            style="--reveal-delay: 80ms"
            class="card flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-2xl p-8"
          >
            <span
              class="icon-tile"
              :class="TONE.rose"
            ><svg
              class="size-5"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON.box"
            /></span>
            <div class="bento-title">Integrasi Laravel</div>
            <div class="bento-text">Komponen Blade, controller upload, sanitasi server, dan contoh Livewire.</div>
            <code class="mt-auto overflow-x-auto rounded-[10px] border border-zinc-200 bg-white px-3.5 py-3 font-mono text-[13px] whitespace-nowrap text-zinc-700 dark:border-zinc-800 dark:bg-[#09090b] dark:text-zinc-300"><span :class="T.tag">&lt;x-wysiwyg</span> <span :class="T.attr">name</span>=<span :class="T.str">"body"</span> <span :class="T.tag">/&gt;</span></code>
          </NuxtLink>

          <!-- Autosave -->
          <div
            data-reveal
            style="--reveal-delay: 0ms"
            class="card flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-2xl p-8"
          >
            <span
              class="icon-tile"
              :class="TONE.teal"
            ><svg
              class="size-5"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON.save"
            /></span>
            <div class="bento-title">
              Autosave draf
            </div>
            <div class="bento-text">
              Draf tersimpan di localStorage dan ditawarkan kembali saat halaman dibuka lagi.
            </div>
            <div class="mt-auto flex flex-wrap items-center gap-2 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[13px] text-amber-800 dark:text-amber-200">
              <span class="flex-[1_1_120px]">Ada draf tersimpan.</span>
              <span class="rounded-md bg-amber-400 px-2.5 py-1 font-semibold text-stone-900">Pulihkan</span>
              <span class="rounded-md px-2.5 py-1 font-semibold">Buang</span>
            </div>
          </div>

          <!-- HTML / JSON -->
          <div
            data-reveal
            style="--reveal-delay: 80ms"
            class="card flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-2xl p-8"
          >
            <span
              class="icon-tile font-mono text-sm font-semibold"
              :class="TONE.sky"
            >{ }</span>
            <div class="bento-title">
              HTML atau JSON
            </div>
            <div class="bento-text">
              Simpan sebagai HTML bersih atau JSON dokumen ProseMirror. Keduanya bisa dimuat ulang dengan aman.
            </div>
            <div class="mt-auto flex rounded-[10px] border border-zinc-200 bg-white p-1 text-[13px] font-semibold dark:border-zinc-800 dark:bg-[#09090b]">
              <span class="flex-1 rounded-[7px] bg-zinc-200 p-1.5 text-center text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50">HTML</span>
              <span class="flex-1 rounded-[7px] p-1.5 text-center text-zinc-500 dark:text-zinc-400">JSON</span>
            </div>
          </div>

          <!-- Bahasa -->
          <div
            data-reveal
            style="--reveal-delay: 160ms"
            class="card flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-2xl p-8"
          >
            <span
              class="icon-tile"
              :class="TONE.violet"
            ><svg
              class="size-5"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON.language"
            /></span>
            <div class="bento-title">
              Indonesia &amp; Inggris
            </div>
            <div class="bento-text">
              Semua teks antarmuka tersedia dalam dua bahasa dan bisa ditimpa satu per satu.
            </div>
            <div class="mt-auto flex gap-2 text-[13px] font-semibold">
              <span class="rounded-full bg-violet-500/15 px-3 py-1.5 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">ID · Indonesia</span>
              <span class="rounded-full border border-zinc-300 px-3 py-1.5 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">EN · English</span>
            </div>
          </div>

          <!-- Teruji -->
          <div
            data-reveal
            style="--reveal-delay: 0ms"
            class="card flex min-w-0 flex-[2_1_560px] flex-wrap items-center gap-8 rounded-2xl p-8"
          >
            <div class="flex flex-[1_1_260px] flex-col gap-3">
              <span
                class="icon-tile"
                :class="TONE.amber"
              ><svg
                class="size-5"
                v-bind="svgAttrs"
                stroke-linejoin="round"
                v-html="ICON.flask"
              /></span>
              <div class="bento-title">
                Teruji
              </div>
              <div class="bento-text">
                Unit test, test browser otomatis, dan feature test Laravel menjaga setiap rilis.
              </div>
            </div>
            <ul class="m-0 flex flex-[1_1_240px] list-none flex-col gap-2.5 p-0 font-mono text-[13px]">
              <li
                v-for="t in tested"
                :key="t"
                class="flex gap-2.5 text-zinc-700 dark:text-zinc-300"
              >
                <span class="text-emerald-600 dark:text-emerald-300">✓</span>{{ t }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-[1200px] px-6 pb-28">
      <div
        data-reveal
        class="relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl border border-emerald-400/30 bg-zinc-50 px-8 py-20 text-center dark:bg-[#111113]"
      >
        <div
          aria-hidden="true"
          class="afw-grid-bg pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          class="cta-glow pointer-events-none absolute inset-0"
        />
        <h2 class="relative m-0 text-[clamp(32px,4.5vw,52px)] leading-[1.08] font-extrabold tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
          Siap mencoba?
        </h2>
        <p class="relative m-0 max-w-[520px] text-[17px] leading-[1.65] text-zinc-600 dark:text-zinc-400">
          Pasang lewat npm atau CDN, tambahkan satu atribut x-data, dan editor siap dipakai di form Anda.
        </p>
        <div class="relative mt-2 flex flex-wrap justify-center gap-3">
          <NuxtLink
            to="/memulai/instalasi"
            class="btn-primary"
          >
            Instalasi
            <svg
              class="size-4"
              v-bind="svgAttrs"
              v-html="ICON.arrow"
            />
          </NuxtLink>
          <NuxtLink
            to="/memulai/demo"
            class="btn-ghost bg-white/60 dark:bg-[#09090b]/60"
          >
            <svg
              class="size-4"
              v-bind="svgAttrs"
              stroke-linejoin="round"
              v-html="ICON.play"
            />
            Coba editornya
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FOOTER landing -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 px-6 py-12">
        <div class="flex flex-[1_1_260px] flex-col gap-3">
          <div class="flex items-center gap-2.5 text-base font-bold text-zinc-950 dark:text-zinc-50">
            <span class="flex size-6 items-center justify-center rounded-[7px] bg-emerald-600"><svg
              class="size-[13px]"
              v-bind="svgAttrs"
              stroke="#ffffff"
              stroke-width="2.4"
              stroke-linejoin="round"
              v-html="ICON.pen"
            /></span>{{ BRAND }}
          </div>
          <div class="max-w-[300px] text-sm leading-[1.6] text-zinc-500 dark:text-zinc-400">
            Editor WYSIWYG untuk Alpine.js. Lisensi MIT.
          </div>
        </div>
        <div class="flex flex-wrap gap-12 text-sm">
          <div class="flex flex-col gap-2.5">
            <div class="font-semibold text-zinc-950 dark:text-zinc-50">
              Dokumentasi
            </div>
            <NuxtLink
              to="/memulai/instalasi"
              class="text-link"
            >Instalasi</NuxtLink>
            <NuxtLink
              to="/panduan/opsi"
              class="text-link"
            >Opsi</NuxtLink>
            <NuxtLink
              to="/integrasi/laravel"
              class="text-link"
            >Laravel</NuxtLink>
          </div>
          <div class="flex flex-col gap-2.5">
            <div class="font-semibold text-zinc-950 dark:text-zinc-50">
              Sumber
            </div>
            <NuxtLink
              to="/memulai/demo"
              class="text-link"
            >Demo</NuxtLink>
            <a
              :href="REPO"
              class="text-link"
            >GitHub</a>
            <NuxtLink
              to="/lainnya/changelog"
              class="text-link"
            >Changelog</NuxtLink>
          </div>
        </div>
      </div>
      <div class="mx-auto max-w-[1200px] border-t border-zinc-100 px-6 pt-5 pb-8 text-[13px] text-zinc-500 dark:border-zinc-900 dark:text-zinc-400">
        Dibangun dengan Tiptap, ProseMirror &amp; Nuxt UI · © 2026
      </div>
    </footer>
  </div>
</template>

<style>
/* Tidak scoped: semua aturan diawali .landing agar tidak bocor ke halaman lain. */
.landing .afw-grid-bg {
  background-image:
    linear-gradient(rgba(24, 24, 27, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24, 24, 27, 0.045) 1px, transparent 1px);
  background-size: 56px 56px;
}

.dark .landing .afw-grid-bg {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
}

.landing .hero-glow {
  background:
    radial-gradient(60% 50% at 70% 0%, rgba(16, 185, 129, 0.14), transparent 70%),
    radial-gradient(40% 40% at 10% 20%, rgba(20, 184, 166, 0.07), transparent 70%);
}

.dark .landing .hero-glow {
  background:
    radial-gradient(60% 50% at 70% 0%, rgba(16, 185, 129, 0.22), transparent 70%),
    radial-gradient(40% 40% at 10% 20%, rgba(20, 184, 166, 0.1), transparent 70%);
}

.landing .cta-glow {
  background: radial-gradient(50% 70% at 50% 0%, rgba(16, 185, 129, 0.18), transparent 70%);
}

.dark .landing .cta-glow {
  background: radial-gradient(50% 70% at 50% 0%, rgba(16, 185, 129, 0.28), transparent 70%);
}

.landing .mockup-ring {
  background: linear-gradient(140deg, rgba(52, 211, 153, 0.55), rgba(212, 212, 216, 0.4) 40%, rgba(45, 212, 191, 0.35));
}

.dark .landing .mockup-ring {
  background: linear-gradient(140deg, rgba(52, 211, 153, 0.55), rgba(39, 39, 42, 0.2) 40%, rgba(45, 212, 191, 0.35));
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

.landing .eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #059669;
}

.dark .landing .eyebrow {
  color: #6ee7b7;
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

.landing .inline-code {
  font-family: var(--font-mono);
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e4e4e7;
  background: #f4f4f5;
  color: #18181b;
}

.dark .landing .inline-code {
  border-color: #27272a;
  background: #18181b;
  color: #e4e4e7;
}

.landing .card {
  border: 1px solid #e4e4e7;
  background: #fff;
  transition: border-color 0.2s, background-color 0.2s;
}

.landing .card:hover {
  border-color: #d4d4d8;
  background-color: #fafafa;
}

.dark .landing .card {
  border-color: #27272a;
  background: #111113;
}

.dark .landing .card:hover {
  border-color: #3f3f46;
  background-color: #18181b;
}

.landing .icon-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border-width: 1px;
}

.landing .bento-title {
  font-size: 20px;
  font-weight: 700;
  color: #09090b;
}

.dark .landing .bento-title {
  color: #fafafa;
}

.landing .bento-text {
  font-size: 15px;
  line-height: 1.6;
  color: #52525b;
}

.dark .landing .bento-text {
  color: #a1a1aa;
}

.landing .text-link {
  color: #059669;
}

.landing .text-link:hover {
  color: #047857;
}

.dark .landing .text-link {
  color: #6ee7b7;
}

.dark .landing .text-link:hover {
  color: #a7f3d0;
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
