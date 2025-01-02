<script setup lang="ts">
defineProps<{
  left?: boolean
  right?: boolean
}>()
</script>

<template>
  <svg viewBox="0 0 64 64">
    <path
      d="m 12 32 l 0 -10 q 0 -20 20 -20 l 0 30 z"
      stroke="currentColor"
      :fill="left ? 'currentColor' : 'transparent'"
      :stroke-width="left ? 1 : 3"
    />
    <path
      d="m 32 32 l 0 -30 q 20 0 20 20 l 0 10 z"
      stroke="currentColor"
      :fill="right ? 'currentColor' : 'transparent'"
      :stroke-width="right ? 1 : 3"
    />
    <path
      d="m 12 32 l 40 0 l 0 10 a 20 20 0 0 1 -40 0 z"
      stroke="currentColor"
      fill="transparent"
      stroke-width="3"
    />
  </svg>
</template>
