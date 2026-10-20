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
    { name: 'theme-color', content: '#059669' }
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
      />
    </ClientOnly>
  </UApp>
</template>
