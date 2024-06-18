<script lang="ts" setup>
import { InputBase } from '.'
import type { MAFMetaContentRegex, MAFOptionInput, MAFValueString } from '@/stores/types'

defineProps<{
  options: MAFOptionInput
  meta: MAFMetaContentRegex
}>()

const modelValue = defineModel<MAFValueString>('modelValue', {
  required: false,
  default: {
    s: '',
  },
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">内容满足正则</span>
    <InputBase
      v-model="modelValue.s"
      class="flex-auto"
      :options="options"
      :error="meta.re === null"
    />
  </div>
</template>
