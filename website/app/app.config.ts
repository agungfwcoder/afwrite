import { BRAND } from '../brand'
import pkg from '../../package.json'

// Tema: gaya bawaan Nuxt UI 4.12 dengan warna utama brand (#009994) dan netral zinc (latar gelap diatur di main.css).
export default defineAppConfig({
  ui: {
    // info (callout note) ikut brand dan success (callout tip) kuning, seperti referensi desain v2.
    colors: {
      primary: 'brand',
      neutral: 'zinc',
      info: 'brand',
      success: 'amber'
    },
    // Gaya "kertas" referensi desain v2: kotak kecil miring berwarna kuning/teal sebagai penanda.
    pageHeader: {
      slots: {
        headline: 'flex items-center gap-2 font-semibold before:size-[7px] before:shrink-0 before:rotate-12 before:rounded-[2px] before:bg-sun before:content-[\'\']',
        title: 'font-extrabold tracking-[-0.03em]'
      }
    },
    contentSurround: {
      slots: {
        link: 'rounded-xl px-5 py-6 hover:border-primary/50',
        linkTitle: 'font-bold'
      }
    },
    prose: {
      h2: {
        slots: {
          base: 'text-[23px] tracking-[-0.02em]'
        }
      },
      callout: {
        slots: {
          base: 'rounded-xl px-4 py-3.5 text-[13.5px]/[1.65]'
        }
      },
      // Ikon kartu duduk di atas kotak kertas miring (::before); kartu genap di card-group berwarna kuning.
      card: {
        slots: {
          base: 'grid grid-cols-[2.25rem_minmax(0,1fr)] items-start [&>a]:absolute gap-x-3.5 p-4 sm:p-4 rounded-xl bg-muted/60 before:absolute before:top-4 before:left-4 before:size-9 before:-rotate-6 before:rounded-[5px] before:bg-brand-600 before:content-[\'\']',
          icon: 'relative row-span-2 m-2 mb-0 size-5 text-white!',
          title: 'col-start-2 font-bold',
          description: 'col-start-2 text-[13px]/[1.5]'
        }
      },
      cardGroup: {
        base: 'gap-3 [&>*:nth-child(even)]:before:rotate-[5deg] [&>*:nth-child(even)]:before:bg-sun [&>*:nth-child(even)_.iconify]:text-stone-900!'
      },
      // Nomor langkah: kotak kertas kuning/teal bergantian di atas garis putus-putus.
      steps: {
        base: 'border-dashed',
        variants: {
          level: {
            3: '[&>h3]:before:size-7 [&>h3]:before:-rotate-6 [&>h3]:before:rounded-[4px] [&>h3]:before:bg-sun [&>h3]:before:font-mono [&>h3]:before:font-extrabold [&>h3]:before:text-stone-900 [&>h3:nth-of-type(even)]:before:rotate-[5deg] [&>h3:nth-of-type(even)]:before:bg-brand-600 [&>h3:nth-of-type(even)]:before:text-white'
          }
        }
      },
      pre: {
        slots: {
          header: 'rounded-t-xl',
          base: 'rounded-xl'
        }
      },
      code: {
        base: 'rounded-full px-[7px] py-px'
      },
      tr: {
        base: '[&:first-child>th:first-child]:rounded-ss-xl [&:first-child>th:last-child]:rounded-se-xl [&:last-child>td:first-child]:rounded-es-xl [&:last-child>td:last-child]:rounded-ee-xl'
      },
      table: {
        slots: {
          root: 'rounded-xl',
          base: 'rounded-xl'
        }
      }
    }
  },
  header: {
    title: BRAND,
    version: `v${pkg.version.split('.')[0]}`, // hanya versi mayor (lihat CHANGELOG)
    to: '/',
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    nav: [
      { label: 'Dokumentasi', to: '/memulai', match: '^/(memulai(?!/demo)|panduan|integrasi|lainnya/(pengembangan|kredit))' },
      { label: 'Coba langsung', to: '/memulai/demo', match: '^/memulai/demo' },
      { label: 'Catatan rilis', to: '/lainnya/changelog', match: '^/lainnya/changelog' }
    ],
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/agungfwcoder/afwrite',
      'target': '_blank',
      'aria-label': 'Repositori GitHub'
    }]
  },
  footer: {
    credits: `${BRAND} · MIT · Dibangun dengan Tiptap, ProseMirror & Nuxt UI · © ${new Date().getFullYear()}`,
    colorMode: false,
    links: []
  },
  toc: {
    title: 'Di halaman ini',
    bottom: {
      title: 'Tautan',
      edit: 'https://github.com/agungfwcoder/afwrite/edit/main/website/content',
      links: [{
        icon: 'i-lucide-play',
        label: 'Coba editornya',
        to: '/memulai/demo'
      }, {
        icon: 'i-lucide-scroll-text',
        label: 'Catatan rilis',
        to: '/lainnya/changelog'
      }, {
        icon: 'i-lucide-circle-plus',
        label: 'Laporkan masalah',
        to: 'https://github.com/agungfwcoder/afwrite/issues',
        target: '_blank'
      }]
    }
  }
})
