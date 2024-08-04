<script setup lang="ts">
import type { ModifierConstructorOptions } from '..'
import type { TextModifierProps } from '../modifiers'

defineProps<{
  options: ModifierConstructorOptions<TextModifierProps>
  value: string
  oldValue?: string
}>()
</script>

<template>
  <div class="common-text h-full overflow-hidden text-xs py-1" :title="value">
    <div v-if="value === oldValue" class="text-[var(--el-text-color-secondary)]">
      无变化
    </div>
    <div v-else class="text-wrapper h-full overflow-auto">
      <p v-for="paragraph in value.split('\n')" :key="paragraph" class="min-h-[16px]">
        {{ paragraph }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.text-wrapper {
  &::-webkit-scrollbar {
    width: 4px;
    background-color: var(--el-border-color);
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--el-color-primary);
  }
}
</style>
