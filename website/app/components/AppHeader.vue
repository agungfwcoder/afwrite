<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
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
        <span class="flex size-7 items-center justify-center rounded-lg bg-indigo-600">
          <svg
            aria-hidden="true"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        </span>
        {{ header.title }}
        <span
          v-if="header?.version"
          class="rounded-full border border-accented px-2 py-0.5 font-mono text-[11px] font-medium text-muted"
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
        highlight
        :navigation="navigation"
      />
    </template>
  </UHeader>
</template>
