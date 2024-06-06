<script lang="ts" setup>
import { InputBase } from '.'
import type { MAFOptionInput, MAFValueString } from '@/stores/types'

defineProps<{
  options: MAFOptionInput
}>()

const modelValue = defineModel<MAFValueString>('modelValue', {
  required: false,
  default: {
    s: '',
  },
  type: Object,
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">内容包含</span>
    <InputBase
      v-model="modelValue.s"
      class="flex-auto"
      :options="options"
    />
  </div>
</template>
