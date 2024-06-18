<script lang="ts" setup>
import type { MAFSemanticUnit } from '@/stores/types'

const props = defineProps<{
  block: MAFSemanticUnit
}>()

const blockComponent = computed<Component>(() => {
  return {}[props.block.type]
})
</script>

<template>
  <component
    :is="blockComponent"
    :option="block"
  />
</template>
