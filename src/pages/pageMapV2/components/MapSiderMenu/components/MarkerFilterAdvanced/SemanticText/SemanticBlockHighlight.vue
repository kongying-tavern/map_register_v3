<script lang="ts" setup>
import type { MAFSemanticUnit } from '@/stores/types'

defineProps<{
  option: MAFSemanticUnit
}>()
</script>

<template>
  <span class="semantic-block sem-highlight">
    {{ option.text ?? '' }}
  </span>
</template>

<style lang="scss" scoped>
.sem-highlight {
  border-bottom: var(--gs-color-cancel) .2rem dotted;
  padding: .1rem .1rem;
  margin: 0 .2rem;
  background-color: #f5e192;

  &:hover {
    background-color: rgb(250, 219, 81);
  }
}
</style>
