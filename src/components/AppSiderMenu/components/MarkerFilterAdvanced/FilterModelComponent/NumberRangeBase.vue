<script lang="ts" setup>
import type { MAFOptionRange } from '@/stores/types'
import { MarkerFilterNumberRange } from '../../MarkerFilterComponent'

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
    :placeholder-min="options.placeholderMin"
    :placeholder-max="options.placeholderMax"
    :min-value-min="options.startMin"
    :min-value-min-include="options.startMinIncluded"
    :min-value-max="options.startMax"
    :min-value-max-include="options.startMaxIncluded"
    :max-value-min="options.endMin"
    :max-value-min-include="options.endMinIncluded"
    :max-value-max="options.endMax"
    :max-value-max-include="options.endMaxIncluded"
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
