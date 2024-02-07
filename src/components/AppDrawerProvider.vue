<script lang="ts" setup>
import {
  drawerProps,
  eventListener,
  component as is,
  payloadCache,
  props,
  resetState,
  resolveResult,
  visible,
} from '@/hooks/useGlobalDrawer/drawerContext'
import { useBanner } from '@/hooks'

const beforeClose = (done: () => void) => {
  if (!payloadCache.value)
    resolveResult()
  done()
}

const { show, hide } = useBanner()

const onClose = () => {
  show(import.meta.env.VITE_ENV_BANNER)
}

const onOpen = () => {
  hide()
}
</script>

<template>
  <el-drawer
    v-model="visible"
    v-bind="drawerProps"
    :before-close="beforeClose"
    @closed="resetState"
    @close="onClose"
    @open="onOpen"
  >
    <component :is="is" v-bind="props" v-on="eventListener" />
  </el-drawer>
</template>

<style lang="scss">
// .el-overlay {
//   --el-overlay-color-lighter: rgb(0 0 0 / 0.3);

//   background-color: transparent;
//   backdrop-filter: blur(6px);
// }

// .el-dialog {
//   &.bg-transparent {
//     background: transparent;
//   }
// }

// .hidden-header .el-dialog__header {
//   display: none;
// }
</style>
