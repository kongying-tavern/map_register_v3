<script lang="ts" setup>
import type { ConditionAdvancedOptInput, ConditionAdvancedValInput } from '../types'
import { InputBase } from '.'

defineProps<{
  options: ConditionAdvancedOptInput
}>()

const modelValue = defineModel<ConditionAdvancedValInput>('modelValue', {
  required: false,
  default: {
    v: '',
  },
  type: Object,
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">ID范围</span>
    <InputBase
      v-model="modelValue.v"
      class="flex-auto"
      :options="options"
    />
  </div>
</template>
