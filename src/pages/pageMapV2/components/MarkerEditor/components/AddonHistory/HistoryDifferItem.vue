<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="diff-item">
    <div class="label">
      {{ label }}
    </div>

    <div>
      <slot name="default" />
    </div>
  </div>
</template>

<style scoped>
.diff-item {
  margin-bottom: 16px;
  .label {
    font-weight: bolder;
  }
}
</style>
