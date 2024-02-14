<script setup lang="ts" generic="T, LK extends keyof T, VK extends keyof T">
defineProps<{
  options: T[]
  labelKey: LK
  valueKey: VK
}>()

defineModel<T[VK]>('modelValue', {
  required: false,
  default: undefined,
})
</script>

<template>
  <div class="gs-select">
    Select
  </div>
</template>

<style scoped>
.gs-select {
  border: 1px solid red;
}
</style>
