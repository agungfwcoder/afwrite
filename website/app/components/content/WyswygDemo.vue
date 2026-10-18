<script setup lang="ts">
// Editor wyswyg sungguhan di dalam halaman dokumentasi.
//
//   ::wyswyg-demo{:options='{"headings":[2,3,4]}'}
//   ::
//
// Elemen editor dibuat lewat DOM biasa (bukan template Vue) karena isinya dikelola Alpine
// dan ProseMirror. Alpine dimulai sekali; editor yang ditambahkan kemudian diinisialisasi
// otomatis oleh MutationObserver milik Alpine.
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

const theme = () => (colorMode.value === 'dark' ? 'dark' : 'light')

onMounted(async () => {
  const [{ default: Alpine }, { default: wyswyg }] = await Promise.all([import('alpinejs'), import('wyswyg')])
  const w = window as unknown as { Alpine?: typeof Alpine }
  if (!w.Alpine) {
    w.Alpine = Alpine
    Alpine.plugin(wyswyg)
    Alpine.start()
  }

  host = document.createElement('div')
  host.setAttribute('x-data', `wysiwyg(${JSON.stringify({ stats: true, ...props.options })})`)
  host.setAttribute('data-afw-theme', theme())
  host.innerHTML = props.content
  host.addEventListener('wysiwyg-change', (e) => {
    html.value = (e as CustomEvent).detail.html
  })
  host.addEventListener('wysiwyg-ready', (e) => {
    html.value = (e as CustomEvent).detail.editor.getHTML()
    ready.value = true
  })
  container.value?.appendChild(host)
})

watch(() => colorMode.value, () => host?.setAttribute('data-afw-theme', theme()))

onBeforeUnmount(() => host?.remove())

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
        Output HTML ({{ html.length }} karakter)
      </summary>
      <pre class="overflow-x-auto whitespace-pre-wrap break-all px-4 pb-4 font-mono text-xs text-default">{{ pretty || '(kosong)' }}</pre>
    </details>
  </div>
</template>
