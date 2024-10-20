<script lang="ts" setup>
import type { MAFMetaDummy, MAFOptionSwitch, MAFValueBoolean } from '@/stores/types'
import { GSSwitch } from '@/components/GenshinUI'

defineProps<{
  options: MAFOptionSwitch
  meta: MAFMetaDummy
}>()

const modelValue = defineModel<MAFValueBoolean>('modelValue', {
  required: false,
  default: {
    b: false,
  },
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">点位视频</span>
    <GSSwitch
      v-model="modelValue.b"
      :label="modelValue.b ? options.textActive : options.textInactive"
      label-inactive-color="#313131"
      label-active-color="#313131"
    />
  </div>
</template>
