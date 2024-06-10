<script lang="ts" setup>
import type { MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'

defineProps<{
  options: MAFOptionSelect<{ label: string; value: number }>
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
    <span class="flex-none">刷新时间</span>
  </div>
</template>
