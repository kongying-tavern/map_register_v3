<script lang="ts" setup>
import { NumberRangeBase } from '.'
import type { MAFOptionInput, MAFValueNumberRange } from '@/stores/types'

defineProps<{
  options: MAFOptionInput
}>()

const modelValue = defineModel<MAFValueNumberRange>('modelValue', {
  required: false,
  default: {
    nMin: null,
    nMax: null,
  },
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">刷新时间</span>
    <NumberRangeBase
      v-model:min="modelValue.nMin"
      v-model:max="modelValue.nMax"
      class="flex-auto"
      :options="options"
    />
  </div>
</template>
