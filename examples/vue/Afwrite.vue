<script setup>
// <Afwrite v-model="html" :options="{ lang: 'en', upload }" />
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { create } from 'afwrite';
import 'afwrite/style.css';

const props = defineProps({ modelValue: { type: String, default: '' }, options: { type: Object, default: () => ({}) } });
const emit = defineEmits(['update:modelValue']);
const host = ref(null);
let editor = null; // bukan ref(): instance tidak boleh dibungkus Proxy reaktif Vue

onMounted(() => {
  editor = create(host.value, { ...props.options, content: props.modelValue });
  editor.on('change', ({ html }) => emit('update:modelValue', html));
});

// Nilai dari luar -> editor (dilewati bila isinya sama, agar kursor tidak melompat).
watch(() => props.modelValue, (value) => {
  if (!editor) return;
  const current = editor.getHTML();
  if (value !== current && editor.editor.normalizeHTML(value) !== current) editor.setHTML(value);
});

onBeforeUnmount(() => editor?.destroy());
</script>

<template>
  <div ref="host" />
</template>
