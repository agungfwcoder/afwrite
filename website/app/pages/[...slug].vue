<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description']
  })
})

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const headline = computed(() => findPageHeadline(navigation?.value, page.value?.path))

defineOgImage('Docs', { title, description, headline: headline.value })

const editLink = computed(() => toc?.bottom?.edit && `${toc.bottom.edit}/${page.value?.stem}.${page.value?.extension}`)
const links = computed(() => (toc?.bottom?.links || []).filter(Boolean))

const toast = useToast()
const feedback = ref<boolean | null>(null)
function sendFeedback(helpful: boolean) {
  feedback.value = helpful
  toast.add({ title: 'Terima kasih atas masukannya!', icon: 'i-lucide-heart' })
}
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
    >
      <template #headline>
        <nav
          aria-label="Breadcrumb"
          class="flex items-center gap-2"
        >
          <NuxtLink
            to="/memulai"
            class="hover:text-highlighted transition-colors"
          >Dokumentasi</NuxtLink>
          <template v-if="headline">
            <span aria-hidden="true">/</span>
            <span class="font-medium text-primary">{{ headline }}</span>
          </template>
        </nav>
      </template>

      <template #links>
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
        />

        <PageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <div class="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-6 text-sm text-muted">
        <NuxtLink
          v-if="editLink"
          :to="editLink"
          target="_blank"
          class="inline-flex items-center gap-2 hover:text-highlighted transition-colors"
        >
          <UIcon
            name="i-lucide-pencil"
            class="size-3.5"
          />
          Sunting halaman ini di GitHub
        </NuxtLink>
        <div class="flex items-center gap-2">
          Halaman ini membantu?
          <UButton
            v-for="option in [{ label: 'Ya', value: true }, { label: 'Tidak', value: false }]"
            :key="option.label"
            :label="option.label"
            color="neutral"
            :variant="feedback === option.value ? 'soft' : 'outline'"
            :disabled="feedback !== null"
            @click="sendFeedback(option.value)"
          />
        </div>
      </div>

      <UContentSurround
        v-if="surround?.length"
        :surround="surround"
        class="mt-6"
      >
        <template #link-leading="{ link }">
          <template v-if="link.path === surround?.[0]?.path">
            <UIcon
              name="i-lucide-arrow-left"
              class="size-3.5"
            />Sebelumnya
          </template>
          <template v-else>
            Berikutnya<UIcon
              name="i-lucide-arrow-right"
              class="size-3.5"
            />
          </template>
        </template>
      </UContentSurround>
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        highlight
        highlight-variant="circuit"
        :title="toc?.title"
        :links="page.body?.toc?.links"
      >
        <template
          v-if="toc?.bottom"
          #bottom
        >
          <div
            class="hidden lg:block space-y-6"
            :class="{ 'mt-6!': page.body?.toc?.links?.length }"
          >
            <USeparator
              v-if="page.body?.toc?.links?.length"
              type="dashed"
            />

            <UPageLinks
              :title="toc.bottom.title"
              :links="links"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
