<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const toast = useToast()
const { copy, copied } = useClipboard()
// Alamat yang sedang dibuka (bukan site.url, yang bawaannya http://localhost:3000/).
const origin = useRequestURL().origin

const mdPath = computed(() => `${origin}/raw${route.path.replace(/\/$/, '')}.md`)

const items = [
  {
    label: 'Salin link Markdown',
    icon: 'i-lucide-link',
    onSelect() {
      copy(mdPath.value)
      toast.add({
        title: 'Tersalin ke clipboard',
        icon: 'i-lucide-check-circle'
      })
    }
  },
  {
    label: 'Lihat sebagai Markdown',
    icon: 'i-simple-icons:markdown',
    target: '_blank',
    to: `/raw${route.path}.md`
  },
  {
    label: 'Unduh Markdown',
    icon: 'i-lucide-download',
    onSelect: downloadPage
  }
]

// Simpan isi halaman sebagai file .md (nama file dari bagian terakhir alamat halaman).
async function downloadPage() {
  const text = await $fetch<string>(`/raw${route.path.replace(/\/$/, '')}.md`)
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${route.path.split('/').filter(Boolean).pop() || 'index'}.md`
  link.click()
  URL.revokeObjectURL(url)
}

async function copyPage() {
  copy(await $fetch<string>(`/raw${route.path}.md`))
}
</script>

<template>
  <UFieldGroup>
    <UButton
      label="Salin halaman"
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
        aria-label="Menu salin"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
