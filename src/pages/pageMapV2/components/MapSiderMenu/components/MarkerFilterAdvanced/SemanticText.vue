<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useMapStateStore } from '@/stores'

const { markerAdvancedSemantic } = storeToRefs(useMapStateStore())
</script>

<template>
  <div v-if="markerAdvancedSemantic" class="semantic-text">
    {{ markerAdvancedSemantic }}
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
