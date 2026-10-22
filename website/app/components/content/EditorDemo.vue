<script setup lang="ts">
// Editor afwrite sungguhan di dalam halaman dokumentasi.
//
//   ::editor-demo{:options='{"headings":[2,3,4]}'}
//   ::
//
// Dipasang lewat create() (tanpa Alpine), seperti wrapper Vue di examples/vue. Elemen editor
// dibuat lewat DOM biasa (bukan template Vue) karena isinya dikelola afwrite dan ProseMirror.
const props = withDefaults(defineProps<{
  content?: string
  options?: Record<string, unknown>
  output?: boolean
}>(), {
  content: '',
  options: () => ({}),
  output: true
})

const colorMode = useColorMode()
const container = ref<HTMLElement | null>(null)
const html = ref('')
const ready = ref(false)
let host: HTMLElement | null = null
let editor: { destroy: () => void } | null = null // bukan ref(): jangan dibungkus Proxy Vue

const theme = () => (colorMode.value === 'dark' ? 'dark' : 'light')

onMounted(async () => {
  const { create } = await import('afwrite')
  if (!container.value) return // halaman sudah ditinggalkan sebelum modul selesai dimuat

  host = document.createElement('div')
  host.setAttribute('data-afw-theme', theme())
  host.innerHTML = props.content
  container.value.appendChild(host)
  const instance = create(host, { stats: true, ...props.options })
  instance.on('change', ({ html: value }: { html: string }) => (html.value = value))
  html.value = instance.getHTML()
  ready.value = true
  editor = instance
})

watch(() => colorMode.value, () => host?.setAttribute('data-afw-theme', theme()))

onBeforeUnmount(() => {
  editor?.destroy()
  host?.remove()
})

const pretty = computed(() => html.value
  .replace(/(<\/(p|h[2-6]|blockquote|ul|ol|li|pre|figure)>|<hr>)/g, '$1\n')
  .replace(/(<(ul|ol)>)/g, '$1\n')
  .trim())
</script>

<template>
  <div class="not-prose my-6 space-y-3">
    <div
      ref="container"
      class="min-h-72 rounded-lg"
      :class="{ 'animate-pulse bg-elevated': !ready }"
    />
    <details
      v-if="output"
      class="rounded-lg border border-default bg-muted text-sm"
    >
      <summary class="cursor-pointer select-none px-4 py-2 font-medium text-muted">
        HTML output ({{ html.length }} characters)
      </summary>
      <pre class="overflow-x-auto whitespace-pre-wrap break-all px-4 pb-4 font-mono text-xs text-default">{{ pretty || '(empty)' }}</pre>
    </details>
  </div>
</template>
