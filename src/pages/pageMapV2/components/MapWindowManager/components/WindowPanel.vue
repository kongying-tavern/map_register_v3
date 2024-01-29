<script setup lang="ts">
import type { MapWindow } from '../types'
import { context } from '../core'

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
    class="window-panel"
    :class="{
      'is-top': context.isTop(id),
    }"
    :style="{
      '--tx': info.translate.x,
      '--ty': info.translate.y,
    }"
    :[`data-${dragHookId}`]="id"
  >
    <div
      class="window-panel-header"
      data-draggable="true"
    >
      <div class="p-1 text-sm pointer-events-none">
        {{ info.name }}
      </div>
    </div>

    <div ref="mainRef" class="window-panel-main" />
  </div>
</template>

<style scoped>
.window-panel {
  width: 400px;
  height: 600px;
  border-radius: 6px;
  pointer-events: auto;
  position: absolute;
  left: 0;
  top: 0;
  translate: calc(var(--tx) * 1px) calc(var(--ty) * 1px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: v-bind('info.order');
  box-sizing: content-box;
  border: 1px solid var(--el-border-color-darker);

  &.is-top {
    box-shadow: var(--el-box-shadow);
  }
}

.window-panel-header {
  flex-shrink: 0;
  background: linear-gradient(
    to right,
    var(--el-color-primary),
    var(--el-color-primary-dark-2)
  );
  user-select: none;
  cursor: move;
}

.window-panel-main {
  flex: 1;
  background: var(--el-bg-color);
  overflow: auto;
}
</style>
