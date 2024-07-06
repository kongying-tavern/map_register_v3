<script lang="ts" setup>
defineProps<{
  src?: string
}>()
</script>

<template>
  <div
    class="w-8 h-8
      rounded-full
      border border-[var(--el-border-color)]
      bg-[var(--el-color-primary-light-9)]
      flex-shrink-0
    "
  >
    <img
      v-if="src"
      class="w-full h-full object-contain rounded"
      :src="src"
      crossorigin=""
    >
  </div>
</template>
