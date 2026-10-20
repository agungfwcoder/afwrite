import { BRAND } from '../brand'
import pkg from '../../package.json'

// Tema: gaya bawaan Nuxt UI 4.12 dengan warna utama emerald dan netral zinc (latar gelap diatur di main.css).
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc'
    },
    // Komponen memakai gaya bawaan Nuxt UI 4.12; hanya titik kuning logo di headline halaman yang ditambahkan.
    pageHeader: {
      slots: {
        headline: 'flex items-center gap-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-sun before:content-[\'\']'
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
