<script lang="ts" setup>
import { MarkerFilterButton } from '../../MarkerFilterComponent'
import { NumberRangeBase } from '.'
import type { MAFOptionRange, MAFOptionSwitch, MAFValueBoolean, MAFValueNumberRange } from '@/stores/types'

defineProps<{
  options: MAFOptionSwitch & MAFOptionRange
}>()

const modelValue = defineModel<MAFValueBoolean & MAFValueNumberRange>('modelValue', {
  required: false,
  default: {
    b: false,
    nMin: null,
    nMax: null,
  },
})

const toggleMatchType = () => {
  modelValue.value.b = !modelValue.value.b
}
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <MarkerFilterButton
      theme="light"
      @click="toggleMatchType"
    >
      <template #default>
        {{ modelValue.b ? options.textActive : options.textInactive }}
      </template>
    </MarkerFilterButton>
    <span class="flex-none">物品计数</span>
    <NumberRangeBase
      v-model:min="modelValue.nMin"
      v-model:max="modelValue.nMax"
      class="flex-auto"
      :options="options"
    />
  </div>
</template>
