<script lang="ts" setup>
import {
  SemanticBlockError,
  SemanticBlockHighlight,
  SemanticBlockLogicOperator,
  SemanticBlockNumber,
  SemanticBlockOppositeIndicator,
  SemanticBlockParenthesis,
  SemanticBlockRegex,
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
    'error': SemanticBlockError,
    'regex': SemanticBlockRegex,
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
