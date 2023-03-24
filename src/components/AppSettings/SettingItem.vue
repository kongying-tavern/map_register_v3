<script lang="ts" setup>
defineProps<{
  label: string
  content?: string
}>()
</script>

<template>
  <div class="setting-item flex justify-between px-4 py-3 gap-4" v-bind="$attrs">
    <div class="flex-flex col">
      <div class="text-black">
        {{ label }}
      </div>
      <div class="text-gray-600 text-xs">
        <slot name="content">
          {{ content }}
        </slot>
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-item {
  &:not(:last-of-type) {
    border-bottom: 1px solid var(--el-border-color);
  }
}
</style>
