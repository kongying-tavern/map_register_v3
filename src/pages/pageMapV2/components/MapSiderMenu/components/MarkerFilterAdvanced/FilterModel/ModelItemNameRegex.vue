<script lang="ts" setup>
import type { MAFOptionDummy, MAFValueDummy } from '@/stores/types'

defineProps<{
  options: MAFOptionDummy
}>()

defineModel<MAFValueDummy>('modelValue', {
  required: false,
  default: {},
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">物品名满足正则</span>
  </div>
</template>
