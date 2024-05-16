<script setup lang="ts">
import fastDiff, { DELETE, INSERT } from 'fast-diff'

defineProps<{
  newData?: string
  oldData?: string
}>()
</script>

<template>
  <span
    v-for="([flag, char], index) in fastDiff(oldData ?? '', newData ?? '')"
    :key="index"
    class="differ-text"
    :class="{
      [0]: '',
      [INSERT]: 'insert',
      [DELETE]: 'delete',
    }[flag]"
  >
    {{ char }}
  </span>
</template>

<style scoped>
.differ-text {
  &.insert {
    background: var(--el-color-success-light-5);
  }

  &.delete {
    background: var(--el-color-danger-light-5);
  }
}
</style>
