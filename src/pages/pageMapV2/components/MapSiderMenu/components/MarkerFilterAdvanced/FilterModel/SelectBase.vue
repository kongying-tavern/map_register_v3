<script lang="ts" setup>
import { MarkerFilterSelect } from '../../MarkerFilterComponent'
import type { MAFOptionSelect } from '@/stores/types'

type ValueType = string | number | null

defineProps<{
  options: MAFOptionSelect<{ [key: string]: string | number }>
}>()

const modelValue = defineModel<ValueType | ValueType[]>('modelValue', {
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
