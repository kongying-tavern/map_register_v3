<script setup lang="ts">
import fastDiff, { DELETE, INSERT } from 'fast-diff'

defineProps<{
  newData?: string
  oldData?: string
}>()

const withBreaks = (str: string) => {
  const units = str.split('\n')
  return units.reduce((seed, char, index) => {
    seed.push(char)
    if (index < units.length - 1)
      seed.push('\n')
    return seed
  }, [] as string[])
}
</script>

<template>
  <span
    v-for="([flag, str], index) in fastDiff(oldData ?? '', newData ?? '')"
    :key="index"
    class="differ-text"
    :class="{
      [0]: '',
      [INSERT]: 'insert',
      [DELETE]: 'delete',
    }[flag]"
  >
    <template v-for="(char, charIndex) in withBreaks(str)" :key="charIndex">
      <template v-if="char !== '\n'">
        {{ char }}
      </template>
      <br v-else>
    </template>
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
