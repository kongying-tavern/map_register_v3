<script lang="ts" setup>
import {
  SemanticBlockNumber,
  SemanticBlockOppositeIndicator,
  SemanticBlockParenthesis,
  SemanticBlockText,
} from '.'
import type { MAFSemanticUnit } from '@/stores/types'

const props = defineProps<{
  block: MAFSemanticUnit
}>()

const blockComponent = computed<Component>(() => {
  return {
    'opposite-indicator': SemanticBlockOppositeIndicator,
    'parenthesis': SemanticBlockParenthesis,
    'text': SemanticBlockText,
    'number': SemanticBlockNumber,
  }[props.block.type]
})
</script>

<template>
  <component
    :is="blockComponent"
    :option="block"
  />
</template>
