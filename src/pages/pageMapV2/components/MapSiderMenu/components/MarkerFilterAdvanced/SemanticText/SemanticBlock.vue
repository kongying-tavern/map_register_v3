<script lang="ts" setup>
import {
  SemanticBlockHighlight,
  SemanticBlockLogicOperator,
  SemanticBlockNumber,
  SemanticBlockOppositeIndicator,
  SemanticBlockParenthesis,
  SemanticBlockTag,
  SemanticBlockText,
} from '.'
import type { MAFSemanticUnit } from '@/stores/types'

const props = defineProps<{
  block: MAFSemanticUnit
}>()

const blockComponent = computed<Component>(() => {
  return {
    'logic-operator': SemanticBlockLogicOperator,
    'opposite-indicator': SemanticBlockOppositeIndicator,
    'parenthesis': SemanticBlockParenthesis,
    'tag': SemanticBlockTag,
    'highlight': SemanticBlockHighlight,
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
