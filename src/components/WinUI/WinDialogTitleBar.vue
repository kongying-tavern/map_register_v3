<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

const props = defineProps<{
  loading?: boolean
  disabled?: boolean
}>()

const emits = defineEmits<{
  close: []
}>()

const emitClose = () => {
  if (props.disabled || props.loading)
    return
  emits('close')
}
</script>

<template>
  <div class="win-dialog-title-bar">
    <div class="title-name">
      <slot name="default" />
    </div>

    <div
      class="title-action"
      :class="[
        disabled
          ? 'cursor-not-allowed'
          : '\
            hover:bg-[var(--el-color-danger)]\
            hover:text-[var(--el-bg-color)]\
            active:bg-[var(--el-color-danger-light-3)]\
            active:text-[var(--el-bg-color)]',
      ]"
      @click="emitClose"
    >
      <el-icon :size="16">
        <Close />
      </el-icon>
    </div>
  </div>
</template>

<style scoped>
.win-dialog-title-bar {
  @apply
    flex justify-between items-center
    bg-[var(--el-color-primary-light-9)]
  ;
}

.title-name {
  @apply
    overflow-hidden
    flex-1 p-1.5 px-2
    text-xs text-ellipsis whitespace-nowrap
  ;
}

.title-action {
  @apply
    h-full p-1.5 px-2
    flex items-center
    transition-all
    select-none
  ;
}
</style>
