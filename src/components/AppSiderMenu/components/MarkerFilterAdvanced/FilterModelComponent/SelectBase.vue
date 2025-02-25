<script lang="ts" setup>
import type { MAFOptionSelect } from '@/stores/types'
import { MarkerFilterSelect } from '../../MarkerFilterComponent'

type ValueType = string | number

defineProps<{
  options: MAFOptionSelect<{ [key: string]: string | number } | unknown>
}>()

const modelValue = defineModel<ValueType | ValueType[] | null | undefined>('modelValue', {
  required: true,
  default: null,
})
</script>

<template>
  <MarkerFilterSelect
    v-model="modelValue"
    :multiple="options.optionSelectMultiple"
    :list="options.options"
    :label-key="options.optionLabel"
    :value-key="options.optionValue"
    :dialog-title="options.dialogTitle"
    :dialog-list-class="options.dialogListClass"
  >
    <template v-if="$slots.default">
      <slot />
    </template>
  </MarkerFilterSelect>
</template>
