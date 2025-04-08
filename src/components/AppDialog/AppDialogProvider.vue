<script lang="ts" setup>
import { context } from './context'

const beforeClose = (done: () => void) => {
  if (!context.payloadCache.value)
    context.resolveResult(undefined)
  done()
}

const hiddenHeader = computed(() => !context.dialogProps.value.showClose && !context.dialogProps.value.title)
</script>

<template>
  <el-dialog
    v-model="context.visible.value"
    v-bind="{
      width: 'fit-content',
      alignCenter: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      ...context.dialogProps.value,
    }"
    destroy-on-close
    append-to-body
    class="custom-dialog bg-transparent"
    :before-close="beforeClose"
    :class="{
      'hidden-header': hiddenHeader,
    }"
    @closed="context.resetState"
  >
    <component
      :is="context.component.value"
      v-bind="context.props.value"
      v-on="context.listener.value"
    />
  </el-dialog>
</template>

<style>
.custom-dialog.el-dialog {
  --el-dialog-border-radius: 8px;
  --el-dialog-padding-primary: 0;

  &.bg-transparent {
    background: transparent;
  }

  &.hidden-header {
    .el-dialog__header {
      display: none;
    }
  }
}
</style>
