<script lang="ts" setup>
import { computed } from 'vue'
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
    v-bind="context.dialogProps.value"
    :before-close="beforeClose"
    class="custom-dialog"
    append-to-body
    :class="{
      'hidden-header': hiddenHeader,
    }"
    :style="{
      '--el-dialog-border-radius': '8px',
      '--el-dialog-padding-primary': '0',
      '--el-dialog-width': 'auto',
    }"
    @closed="context.resetState"
  >
    <component :is="context.component.value" v-bind="context.props.value" v-on="context.listener.value">
      <template v-for="(slot, slotName) in context.slots.value">
        <slot :name="slotName">
          <component :is="slot" />
        </slot>
      </template>
    </component>
  </el-dialog>
</template>

<style>
.custom-dialog {
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
