<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation
            :collapsible="false"
            :navigation="navigation"
            :ui="{ linkTrailingIcon: 'hidden' }"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
