<script setup lang="ts">
import { id } from '@nuxt/ui/locale'

const { seo } = useAppConfig()
const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false
})

// Situs bisa berada di sub-folder (GitHub Pages: /afwrite/), jadi aset diberi baseURL.
const base = useRuntimeConfig().app.baseURL

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#009994' }
  ],
  link: [
    { rel: 'icon', href: `${base}favicon.ico`, sizes: '48x48' },
    { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` },
    { rel: 'manifest', href: `${base}site.webmanifest` }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogType: 'website',
  ogLocale: 'id_ID',
  twitterCard: 'summary_large_image'
})

provide('navigation', navigation)

// Grup "Links" di modal pencarian (⌘K), seperti situs Nuxt UI.
const searchLinks = [
  { label: 'Memulai', description: 'Pasang dan pakai afwrite untuk pertama kali.', icon: 'i-lucide-play', to: '/memulai' },
  { label: 'Panduan', description: 'Opsi, toolbar, perintah, gambar, event, dan API.', icon: 'i-lucide-book-open', to: '/panduan/opsi' },
  { label: 'Integrasi', description: 'Komponen Blade, upload, sanitasi server, dan Livewire.', icon: 'i-lucide-plug', to: '/integrasi/laravel' },
  { label: 'Coba langsung', description: 'Editor sungguhan di halaman depan.', icon: 'i-lucide-square-pen', to: '/#coba' },
  { label: 'Catatan rilis', description: 'Perubahan di setiap versi.', icon: 'i-lucide-rocket', to: '/lainnya/changelog' },
  { label: 'GitHub', description: 'Kode sumber, isu, dan laporan keamanan.', icon: 'i-simple-icons-github', to: 'https://github.com/agungfwcoder/afwrite', target: '_blank' }
]
</script>

<template>
  <UApp :locale="id">
    <NuxtLoadingIndicator />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <!-- Landing punya footer sendiri. -->
    <AppFooter v-if="route.path !== '/'" />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        :links="searchLinks"
      />
    </ClientOnly>
  </UApp>
</template>
