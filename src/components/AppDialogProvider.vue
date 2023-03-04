<script lang="ts" setup>
import { buttons, dialogProps, eventListener, component as is, payloadCache, props, resetState, resolveResult, visible } from '@/hooks/useGlobalDialog/dialogContext'

const beforeClose = (done: () => void) => {
  if (!payloadCache.value)
    resolveResult()
  done()
}

const hiddenHeader = computed(() => !dialogProps.value.showClose && !dialogProps.value.title)
</script>

<template>
  <el-dialog
    v-model="visible"
    v-bind="dialogProps"
    :before-close="beforeClose"
    class="global-single-dialog"
    :class="{
      'hidden-header': hiddenHeader,
    }"
    :style="{
      '--el-dialog-border-radius': '8px',
    }"
    @closed="resetState"
  >
    <component :is="is" v-bind="props" v-on="eventListener" />

    <template v-if="buttons.size" #footer>
      <el-button v-for="[role, button] in buttons" :key="role" v-bind="button.props" @click="button.onClick">
        {{ button.text }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.el-overlay {
  --el-overlay-color-lighter: rgb(0 0 0 / 0.3);

  background-color: transparent;
  backdrop-filter: blur(6px);
}

.el-dialog {
  &.bg-transparent {
    background: transparent;
  }
}

.hidden-header .el-dialog__header {
  display: none;
}
</style>
