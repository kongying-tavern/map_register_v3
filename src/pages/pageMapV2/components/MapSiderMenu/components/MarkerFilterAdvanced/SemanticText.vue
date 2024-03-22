<script lang="ts" setup>
import { useMarkerFilter } from './hooks'

const { conditionSemanticText } = useMarkerFilter()
</script>

<template>
  <div v-if="conditionSemanticText" class="semantic-text">
    {{ conditionSemanticText }}
  </div>
</template>

<style lang="scss" scoped>
.semantic-text {
  --radius: 8px;
  --color-bg: #c6c2ba;
  --color-text: #313131;

  background-color: var(--color-bg);
  color: var(--color-text);
  border-radius: var(--radius);
  padding: 8px;
}
</style>
