<script lang="ts" setup>
import type { MAFSemanticUnit } from '@/stores/types'

defineProps<{
  option: MAFSemanticUnit
}>()
</script>

<template>
  <span class="semantic-block sem-tag">
    {{ option.text ?? '' }}
  </span>
</template>

<style lang="scss" scoped>
.sem-tag {
  background-color: var(--gs-color-cancel);
  border-radius: 0.7lh;
  border: 1px solid #dedede;
  color: #fff;
  font-weight: normal;
  padding: .2rem .4rem;
}
</style>
