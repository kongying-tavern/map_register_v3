<script lang="ts" setup>
import { ConditionInput } from '../..'
import type { ConditionAdvancedOptInput } from '../types'

defineProps<{
  options: ConditionAdvancedOptInput
}>()

const modelValue = defineModel<string>('modelValue', {
  required: true,
  default: '',
})
</script>

<template>
  <ConditionInput
    v-model="modelValue"
    :placeholder="options?.placeholder"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </ConditionInput>
</template>
