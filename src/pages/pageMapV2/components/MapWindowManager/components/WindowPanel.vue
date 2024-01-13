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
      {{ info.name }}
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

  &.is-top {
    outline: 4px solid #33333340;
  }
}

.window-panel-header {
  flex-shrink: 0;
  background: #CCC;
  user-select: none;
}

.window-panel-main {
  flex: 1;
  background: #FFF;
  overflow: auto;
}
</style>
