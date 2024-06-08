<script lang="ts" setup>
import { MarkerFilterNumberRange } from '../../MarkerFilterComponent'
import type { MAFOptionRange } from '@/stores/types'

defineProps<{
  options: MAFOptionRange
}>()

const modelValueMin = defineModel<number | null>('min', {
  required: false,
  default: null,
})

const modelValueMax = defineModel<number | null>('max', {
  required: false,
  default: null,
})
</script>

<template>
  <MarkerFilterNumberRange
    v-model:min="modelValueMin"
    v-model:max="modelValueMax"
    :placeholder-min="options?.placeholderMin"
    :placeholder-max="options?.placeholderMax"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
    <template v-if="$slots.separator" #separator>
      <slot name="separator" />
    </template>
  </MarkerFilterNumberRange>
</template>
