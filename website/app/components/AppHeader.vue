<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const base = useRuntimeConfig().app.baseURL
const route = useRoute()

const isActive = (item: { match: string }) => new RegExp(item.match).test(route.path)
</script>

<template>
  <UHeader
    :ui="{ title: 'text-[17px] items-center', left: 'lg:flex-none gap-8', center: 'flex-1 justify-start', right: 'lg:flex-none gap-2' }"
    :to="header?.to || '/'"
  >
    <nav
      v-if="header?.nav"
      aria-label="Utama"
      class="flex items-center gap-6 text-sm font-medium"
    >
      <NuxtLink
        v-for="item in header.nav"
        :key="item.to"
        :to="item.to"
        :aria-current="isActive(item) ? 'page' : undefined"
        :class="isActive(item) ? 'text-highlighted' : 'text-muted hover:text-highlighted transition-colors'"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <template
      v-if="header?.logo?.dark || header?.logo?.light || header?.title"
      #title
    >
      <UColorModeImage
        v-if="header?.logo?.dark || header?.logo?.light"
        :light="header?.logo?.light!"
        :dark="header?.logo?.dark!"
        :alt="header?.logo?.alt"
        class="h-6 w-auto shrink-0"
      />

      <span
        v-else-if="header?.title"
        class="flex items-center gap-2.5"
      >
        <img
          :src="`${base}logo.svg`"
          alt=""
          class="size-7"
        >
        {{ header.title }}
        <span
          v-if="header?.version"
          class="rounded-full border border-sun/40 bg-sun/10 px-2 py-0.5 font-mono text-[11px] font-medium text-sun-ink dark:text-sun"
        >{{ header.version }}</span>
      </span>
    </template>

    <template
      v-else
      #left
    >
      <NuxtLink :to="header?.to || '/'">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UContentSearchButton
        v-if="header?.search"
        :collapsed="false"
        label="Cari dokumentasi…"
        variant="soft"
        color="neutral"
        class="hidden lg:flex w-70"
      />
      <UContentSearchButton
        v-if="header?.search"
        class="lg:hidden"
      />

      <UColorModeButton v-if="header?.colorMode" />

      <template v-if="header?.links">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #body>
      <UContentNavigation
        variant="link"
        highlight
        :navigation="navigation"
        :ui="{ linkLeadingIcon: 'hidden' }"
      />
    </template>
  </UHeader>
</template>
