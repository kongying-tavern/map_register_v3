<script lang="ts" setup>
import { InputBase } from '.'
import type { MAFOptionInput, MAFValueInput } from '@/stores/types'

defineProps<{
  options: MAFOptionInput
}>()

const modelValue = defineModel<MAFValueInput>('modelValue', {
  required: false,
  default: {
    v: '',
  },
  type: Object,
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">内容满足正则</span>
    <InputBase
      v-model="modelValue.v"
      class="flex-auto"
      :options="options"
    />
  </div>
</template>
