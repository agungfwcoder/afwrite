// Situs dokumentasi (berbasis template Nuxt UI Docs). Nama yang tampil diatur di brand.ts.
// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { BRAND } from './brand'

// Demo di dokumentasi memakai source library langsung dari repo ini (../src),
// beserta Alpine dari node_modules repo induk.
const root = fileURLToPath(new URL('..', import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  alias: {
    'afwrite': `${root}src/index.js`,
    'alpinejs': `${root}node_modules/alpinejs/dist/module.esm.js`
  },

  vite: {
    server: {
      fs: { allow: [root] }
    }
  },

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
    }
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true,
      autoSubfolderIndex: false
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },

  llms: {
    // Saat build di GitHub Actions diisi alamat GitHub Pages (lihat .github/workflows/docs.yml).
    domain: process.env.NUXT_SITE_URL || 'http://localhost:3000/',
    title: BRAND,
    description: `Dokumentasi ${BRAND}: editor WYSIWYG modern untuk Alpine.js berbasis Tiptap/ProseMirror.`,
    full: {
      title: `${BRAND} - Dokumentasi lengkap`,
      description: `Seluruh dokumentasi ${BRAND} dalam satu berkas.`
    },
    sections: [
      {
        title: 'Memulai',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/memulai%' }
        ]
      },
      {
        title: 'Panduan',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/panduan%' }
        ]
      },
      {
        title: 'Integrasi',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/integrasi%' }
        ]
      }
    ]
  },

  mcp: {
    name: `${BRAND} docs`
  },

  ogImage: {
    zeroRuntime: true
  }
})
