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
  <div class="flex justify-between items-center mb-2 bg-[var(--el-color-primary-light-9)]">
    <div class="flex-1 p-1.5 px-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
      <slot name="default" />
    </div>

    <div
      class="h-full p-1.5 px-2
          flex items-center
          transition-all
          select-none"
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
