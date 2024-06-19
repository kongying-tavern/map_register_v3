<script lang="ts" setup>
import type { MAFSemanticUnit } from '@/stores/types'

defineProps<{
  option: MAFSemanticUnit
}>()
</script>

<template>
  <span class="semantic-block sem-opposite-indicator">
    {{ option.text ?? '' }}
  </span>
</template>

<style lang="scss" scoped>
.sem-opposite-indicator {
  color: var(--gs-color-danger);
}
</style>
