<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const toast = useToast()
const { copy, copied } = useClipboard()
// Alamat yang sedang dibuka (bukan site.url, yang bawaannya http://localhost:3000/).
const origin = useRequestURL().origin

// Situs bisa berada di sub-folder (GitHub Pages: /afwrite/), jadi path raw diberi baseURL.
const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
const rawPath = computed(() => `${base}/raw${route.path.replace(/\/$/, '')}.md`)
const mdPath = computed(() => `${origin}${rawPath.value}`)

const items = [
  {
    label: 'Copy Markdown link',
    icon: 'i-lucide-link',
    onSelect() {
      copy(mdPath.value)
      toast.add({
        title: 'Copied to clipboard',
        icon: 'i-lucide-check-circle'
      })
    }
  },
  {
    label: 'View as Markdown',
    icon: 'i-simple-icons:markdown',
    target: '_blank',
    to: rawPath.value,
    external: true
  },
  {
    label: 'Download Markdown',
    icon: 'i-lucide-download',
    onSelect: downloadPage
  }
]

// Simpan isi halaman sebagai file .md (nama file dari bagian terakhir alamat halaman).
async function downloadPage() {
  const text = await $fetch<string>(rawPath.value)
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${route.path.split('/').filter(Boolean).pop() || 'index'}.md`
  link.click()
  URL.revokeObjectURL(url)
}

async function copyPage() {
  copy(await $fetch<string>(rawPath.value))
}
</script>

<template>
  <UFieldGroup>
    <UButton
      label="Copy page"
      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
      color="neutral"
      variant="outline"
      :ui="{
        leadingIcon: [copied ? 'text-primary' : 'text-neutral', 'size-3.5']
      }"
      @click="copyPage"
    />
    <UDropdownMenu
      :items="items"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8
      }"
      :ui="{
        content: 'w-48'
      }"
    >
      <UButton
        icon="i-lucide-chevron-down"
        size="sm"
        color="neutral"
        variant="outline"
        aria-label="Copy options"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
