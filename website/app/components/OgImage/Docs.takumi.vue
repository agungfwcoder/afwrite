<script setup lang="ts">
import { BRAND, SLOGAN } from '~~/brand'
import logo from '~~/public/logo.svg?raw'

const LOGO = `data:image/svg+xml;base64,${btoa(logo)}`

defineOptions({
  inheritAttrs: false
})

defineProps<{
  headline?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div
    class="w-full h-full flex relative overflow-hidden"
    style="background-color: #09090b"
    data-theme="dark"
  >
    <div
      class="absolute top-0 left-0 w-1.5 h-full"
      style="background-color: #34d399"
    />

    <div class="flex flex-col justify-between flex-1 px-20 py-16">
      <div />

      <div class="flex flex-col gap-5">
        <span
          v-if="headline"
          class="text-2xl font-medium"
          style="color: #34d399"
        >
          {{ headline }}
        </span>

        <h1
          v-if="title"
          class="text-6xl font-bold"
          style="color: #fafafa"
        >
          {{ title }}
        </h1>

        <p
          v-if="description"
          class="text-3xl/11"
          :style="{ lineClamp: 2, textOverflow: 'ellipsis', color: '#a1a1aa' }"
        >
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <img
          :src="LOGO"
          width="44"
          height="44"
        >
        <div
          class="h-px flex-1"
          style="background-color: #27272a"
        />
        <span
          v-if="title !== SLOGAN"
          class="text-2xl"
          style="color: #a1a1aa"
        >{{ SLOGAN }}</span>
        <span
          class="text-2xl font-bold"
          style="color: #fafafa"
        >{{ BRAND }}</span>
      </div>
    </div>
  </div>
</template>
