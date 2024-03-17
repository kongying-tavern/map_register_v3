<script lang="ts" setup>
import type { MAFOptionSwitch, MAFValueSwitch } from '@/stores/types'
import { GSSwitch } from '@/components/GenshinUI'

defineProps<{
  options: MAFOptionSwitch
}>()

const modelValue = defineModel<MAFValueSwitch>('modelValue', {
  required: false,
  default: {
    b: true,
  },
  type: Object,
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">点位关联</span>
    <GSSwitch
      v-model="modelValue.b"
      :label="modelValue.b ? options.textActive : options.textInactive"
      label-inactive-color="#313131"
      label-active-color="#313131"
    />
  </div>
</template>
