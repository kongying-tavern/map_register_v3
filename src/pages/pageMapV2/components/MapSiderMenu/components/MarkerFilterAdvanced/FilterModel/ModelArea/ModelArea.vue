<script lang="ts" setup>
import type { MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'

defineProps<{
  options: MAFOptionSelect<{ [key: string]: string }>
}>()

defineModel<MAFValueNumberArray>('modelValue', {
  required: false,
  default: {
    na: [],
  },
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">地区</span>
  </div>
</template>
