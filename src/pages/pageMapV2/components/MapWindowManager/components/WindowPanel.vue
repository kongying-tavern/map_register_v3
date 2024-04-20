<script setup lang="ts">
import type { MapWindow } from '../types'
import { context } from '../core'
import WindowResizer from './WindowResizer.vue'

const props = defineProps<{
  id: string
  info: MapWindow.Info
  dragHookId: string
}>()

const emits = defineEmits<{
  optimizeWindowPosition: []
}>()

const mainRef = defineModel<HTMLElement | null>('mainRef', {
  default: null,
})

const handleResize = (resizeProps: MapWindow.ResizeProps) => {
  context.resize(props.id, resizeProps)
}
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
    <div class="window-header">
      <div class="header-title p-1 flex-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis" data-draggable="true">
        {{ info.name }}
      </div>

      <div class="header-action flex-shrink-0">
        <el-icon
          :size="30"
          class="
            p-1 transition-all
            hover:bg-[var(--el-color-danger)] hover:text-[var(--el-color-white)]
            active:bg-[var(--el-color-danger-light-3)]
          "
          color="var(--el-color-white)"
          @click="() => context.closeWindow(id)"
        >
          <Close />
        </el-icon>
      </div>
    </div>

    <div ref="mainRef" class="window-content" />

    <WindowResizer
      :size="context.getWindow(id)?.size"
      :translate="context.getWindow(id)?.translate"
      @resize="handleResize"
      @resize-end="() => emits('optimizeWindowPosition')"
    />
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
  overflow: hidden;
  user-select: none;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
}

.header-title {
  cursor: move;
}

.header-action {}

.window-content {
  height: calc(var(--h, 600) * 1px);
  background: var(--el-bg-color);
  overflow: auto;
  border-radius: 0 0 6px 6px;
}
</style>
