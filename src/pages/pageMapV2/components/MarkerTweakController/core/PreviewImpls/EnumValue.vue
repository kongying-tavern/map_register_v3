<script setup lang="ts" generic="T">
import type { ModifierConstructorOptions } from '..'
import type { EnumModifierProps } from '../modifiers'

defineProps<{
  value: T
  options: ModifierConstructorOptions<EnumModifierProps<T>>
}>()
</script>

<template>
  <div class="common-text h-full overflow-hidden text-xs py-1">
    <div class="text-wrapper">
      {{ options.optionMap.get(value as T) }}
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
}
</style>
