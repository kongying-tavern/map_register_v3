<script lang="ts" setup>
defineProps<{
  src?: string
}>()
</script>

<template>
  <div
    class="w-8 h-8 rounded border flex-shrink-0"
    style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
  >
    <img
      v-if="src"
      class="w-full h-full object-contain rounded border"
      :src="src"
      crossorigin=""
    >
  </div>
</template>
