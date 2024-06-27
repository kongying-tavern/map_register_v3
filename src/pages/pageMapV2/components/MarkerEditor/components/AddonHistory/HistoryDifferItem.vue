<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="diff-item">
    <el-divider
      content-position="left"
      style="margin: 12px 0 16px; --el-bg-color: var(--el-fill-color-blank)"
    >
      <div class=" font-bold">
        {{ label }}
      </div>
    </el-divider>

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
