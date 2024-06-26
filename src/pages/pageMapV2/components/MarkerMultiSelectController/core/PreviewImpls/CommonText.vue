<script setup lang="ts">
import type { ModifierConstructorOptions } from '..'
import type { TextModifierProps } from '../modifiers'

defineProps<{
  options: ModifierConstructorOptions<TextModifierProps>
  value: string
}>()
</script>

<template>
  <div class="common-text h-full overflow-hidden text-xs py-1" :title="value">
    <div class="text-wrapper" :class="[options.allowMultiline ? 'multiline' : '']">
      {{ value }}
    </div>
  </div>
</template>

<style scoped>
.text-wrapper {
  text-align: left;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow: hidden;

  &.multiline {
    white-space: pre;
  }
}
</style>
