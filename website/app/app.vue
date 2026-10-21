<script setup lang="ts">
import { en } from '@nuxt/ui/locale'

const { seo } = useAppConfig()
const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#009994' },
    // Situs punya tema gelap sendiri; tanpa ini "Auto dark mode" Chrome Android ikut menggelapkan
    // halaman terang secara paksa (teks jadi putih di atas kartu yang tetap terang).
    { name: 'color-scheme', content: 'light dark' }
  ],
  // useAsset: baseURL (GitHub Pages: /afwrite/) + ?v= dari isi berkas.
  link: [
    { rel: 'icon', href: useAsset('favicon.ico'), sizes: '48x48' },
    { rel: 'icon', href: useAsset('favicon.svg'), type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: useAsset('apple-touch-icon.png') },
    { rel: 'manifest', href: useAsset('site.webmanifest') }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogType: 'website',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image'
})

provide('navigation', navigation)

// Grup "Links" di modal pencarian (⌘K), seperti situs Nuxt UI.
const searchLinks = [
  { label: 'Getting started', description: 'Install and use afwrite for the first time.', icon: 'i-lucide-play', to: '/getting-started' },
  { label: 'Guide', description: 'Options, toolbar, commands, images, events, and API.', icon: 'i-lucide-book-open', to: '/guide/options' },
  { label: 'Integrations', description: 'Blade component, uploads, server-side sanitizing, and Livewire.', icon: 'i-lucide-plug', to: '/integrations/laravel' },
  { label: 'Try it live', description: 'The real editor on the home page.', icon: 'i-lucide-square-pen', to: '/#try' },
  { label: 'Changelog', description: 'What changed in each version.', icon: 'i-lucide-rocket', to: '/more/changelog' },
  { label: 'GitHub', description: 'Source code, issues, and security reports.', icon: 'i-simple-icons-github', to: 'https://github.com/agungfwcoder/afwrite', target: '_blank' }
]
</script>

<template>
  <UApp :locale="en">
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
