<script setup lang="ts">
defineProps<{
  value: string
}>()
</script>

<template>
  <div class="common-text h-full overflow-hidden text-xs py-1" :title="value">
    <div class="text-wrapper">
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
}
</style>
