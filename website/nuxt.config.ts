// Situs dokumentasi (berbasis template Nuxt UI Docs). Nama yang tampil diatur di brand.ts.
// https://nuxt.com/docs/api/configuration/nuxt-config
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BRAND } from './brand'

// Demo di dokumentasi memakai source library langsung dari repo ini (../src),
// beserta Alpine dari node_modules repo induk.
const root = fileURLToPath(new URL('..', import.meta.url))

// Versi aset di public/ (dipakai sebagai ?v= lewat useAsset): hash pendek isi berkasnya, jadi berubah
// sendiri setiap logo/ikon/og diganti dan cache browser maupun pratinjau link ikut segar.
// Versi manifest ikut ikon PWA di dalamnya.
const assetHash = (...files: string[]) => {
  const hash = createHash('sha1')
  for (const file of files) hash.update(readFileSync(new URL(`./public/${file}`, import.meta.url)))
  return hash.digest('hex').slice(0, 8)
}
const assetVersions = Object.fromEntries(
  ['logo.svg', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png'].map(file => [file, assetHash(file)])
)
assetVersions['site.webmanifest'] = assetHash('site.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png')

// Origin situs (tanpa path). NUXT_SITE_URL juga dibaca langsung oleh modul site-config, jadi
// isinya cukup origin; base path (/afwrite/ di GitHub Pages) datang dari NUXT_APP_BASE_URL.
const siteOrigin = new URL(process.env.NUXT_SITE_URL || 'http://localhost:3000').origin
const siteUrl = `${siteOrigin}${process.env.NUXT_APP_BASE_URL || '/'}`

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

  // Alamat situs untuk URL absolut (og:image). Base path ditambahkan sendiri oleh modul.
  site: {
    url: siteOrigin,
    name: BRAND,
    defaultLocale: 'id'
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

  runtimeConfig: {
    public: {
      assetVersions
    }
  },

  alias: {
    afwrite: `${root}src/index.js`,
    alpinejs: `${root}node_modules/alpinejs/dist/module.esm.js`
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

  vite: {
    server: {
      fs: { allow: [root] }
    },
    // Nuxt UI membawa Tiptap/ProseMirror sendiri di website/node_modules, sedangkan ../src
    // mengambilnya dari node_modules root. Dua salinan ProseMirror tidak bisa bercampur
    // ("Adding different instances of a keyed plugin"), jadi dipaksa satu salinan.
    resolve: {
      dedupe: [
        '@tiptap/core', '@tiptap/pm', '@tiptap/extensions', '@tiptap/extension-code-block',
        '@tiptap/extension-document', '@tiptap/extension-hard-break', '@tiptap/extension-heading',
        '@tiptap/extension-list', '@tiptap/extension-paragraph', '@tiptap/extension-text',
        'prosemirror-model', 'prosemirror-state', 'prosemirror-view', 'prosemirror-transform'
      ]
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
    provider: 'iconify',
    // Ikon ikut dibundel agar tampil tanpa menunggu API Iconify (yang namanya dinamis didaftarkan manual).
    clientBundle: {
      scan: true,
      icons: [
        'simple-icons:alpinedotjs', 'simple-icons:laravel', 'simple-icons:livewire', 'simple-icons:bootstrap',
        'simple-icons:tailwindcss', 'simple-icons:github', 'simple-icons:googlechrome', 'simple-icons:firefoxbrowser',
        'simple-icons:safari', 'simple-icons:youtube', 'simple-icons:vimeo',
        'vscode-icons:file-type-html', 'vscode-icons:file-type-js-official', 'vscode-icons:file-type-blade'
      ]
    }
  },

  llms: {
    domain: siteUrl.replace(/\/$/, ''),
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
    zeroRuntime: true,
    // Render pertama saat prerender lebih lambat (memuat font & renderer); bawaan 15 detik.
    security: { renderTimeout: 60_000 }
  }
})
