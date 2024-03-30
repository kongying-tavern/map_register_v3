<script setup lang="ts">
import type { MapWindow } from '../types'
import { context } from '../core'
import WindowResizer from './WindowResizer.vue'

defineProps<{
  id: string
  info: MapWindow.Info
  dragHookId: string
}>()

const mainRef = defineModel<HTMLElement | null>('mainRef', {
  default: null,
})
</script>

<template>
  <div
    class="window-instance"
    :class="{
      'is-top': context.isTop(id),
    }"
    :style="{
      '--w': context.getWindow(id)?.size.width,
      '--h': context.getWindow(id)?.size.height,
      '--tx': info.translate.x,
      '--ty': info.translate.y,
    }"
    :[`data-${dragHookId}`]="id"
  >
    <div class="window-header" data-draggable="true">
      <div class="p-1 text-sm pointer-events-none">
        {{ info.name }}
      </div>
    </div>

    <div ref="mainRef" class="window-content" />

    <WindowResizer />
  </div>
</template>

<style scoped>
.window-instance {
  width: calc(var(--w, 400) * 1px);
  border-radius: 6px;
  pointer-events: auto;
  position: absolute;
  left: 0;
  top: 0;
  translate: calc(var(--tx) * 1px) calc(var(--ty) * 1px);
  display: flex;
  flex-direction: column;
  z-index: v-bind('info.order');
  outline: 1px solid var(--el-border-color-darker);

  &.is-top {
    box-shadow: var(--el-box-shadow);
  }
}

.window-header {
  height: calc(v-bind('context.HEADER_HEIGHT') * 1px);
  flex-shrink: 0;
  background: linear-gradient(
    to right,
    var(--el-color-primary),
    var(--el-color-primary-dark-2)
  );
  user-select: none;
  cursor: move;
  border-radius: 6px 6px 0 0;
}

.window-content {
  height: calc(var(--h, 600) * 1px);
  background: var(--el-bg-color);
  overflow: auto;
  border-radius: 0 0 6px 6px;
}
</style>
