<script lang="ts" setup>
import type { MAFMetaDummy, MAFOptionSelect, MAFValueNumberExact } from '@/stores/types'
import { GSSegmented } from '@/components'

defineProps<{
  options: MAFOptionSelect<{ label: string, value: number }>
  meta: MAFMetaDummy
}>()

const modelValue = defineModel<MAFValueNumberExact>('modelValue', {
  required: false,
  default: {
    nx: 0,
  },
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">点位为</span>
    <GSSegmented
      v-model="modelValue.nx"
      size="small"
      :options="options.options"
      :label-key="options.optionLabel"
      :value-key="options.optionValue"
    />
    <span class="flex-none">点位</span>
  </div>
</template>
