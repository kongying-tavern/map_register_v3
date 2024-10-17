<script setup lang="ts">
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import type { MapWindow } from '../types'
import { useWindowContext } from '../hooks'
import WindowResizer from './WindowResizer.vue'

const props = defineProps<{
  id: string
  dragHookId: string
}>()

const emits = defineEmits<{
  optimizeWindowPosition: []
}>()

const context = useWindowContext()

const info = defineModel<MapWindow.Info>('info', {
  required: true,
})

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
      'is-collapse': info.isMinus,
    }"
    :style="{
      '--w': info.size.width,
      '--h': info.size.height,
      '--tx': info.translate.x,
      '--ty': info.translate.y,
    }"
    :[`data-${dragHookId}`]="id"
  >
    <div class="window-header" :class="{ 'is-collapse': info.isMinus }">
      <div class="header-title" data-draggable="true">
        {{ info.name }}
      </div>

      <div class="header-action flex-shrink-0">
        <ElIcon
          :size="30"
          class="header-action-button"
          style="--hover-color: var(--el-color-primary); --active-color: var(--el-color-primary-light-3)"
          @click="() => context.minusWindow(id)"
        >
          <Plus v-if="info.isMinus" />
          <Minus v-else />
        </ElIcon>

        <ElIcon
          :size="30"
          class="header-action-button"
          style="--hover-color: var(--el-color-danger); --active-color: var(--el-color-danger-light-3)"
          @click="() => context.closeWindow(id)"
        >
          <Close />
        </ElIcon>
      </div>
    </div>

    <div ref="mainRef" class="window-content" :class="{ 'is-collapse': info.isMinus }" />

    <WindowResizer
      v-if="!info.isMinus && context.getWindow(id)"
      :size="context.getWindow(id)!.size"
      :translate="context.getWindow(id)!.translate"
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
  outline: 1px solid color-mix(in srgb, var(--el-border-color-darker) 50%, transparent 50%);

  @apply shadow-sm;

  &.is-collapse {
    width: 300px;
  }

  &.is-top {
    @apply shadow-2xl;
  }
}

.window-header {
  height: calc(v-bind('context.HEADER_HEIGHT') * 1px);
  flex-shrink: 0;
  background: #263240;
  overflow: hidden;
  user-select: none;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  &.is-collapse {
    border-radius: 6px;
  }
}

.header-title {
  @apply
    px-2 flex-1
    text-xs text-[#C6C2BA] font-bold leading-[30px]
    overflow-hidden whitespace-nowrap text-ellipsis
  ;
  cursor: move;
}

.header-action-button {
  @apply
    p-2
    transition-all
    text-[var(--el-color-white)]
    hover:bg-[var(--hover-color)]
    hover:text-[var(--el-color-white)]
    active:bg-[var(--active-color)]
  ;
}

.window-content {
  height: calc(var(--h, 600) * 1px);
  background: var(--el-bg-color);
  overflow: auto;
  border-radius: 0 0 6px 6px;
  &.is-collapse {
    display: none;
  }
}
</style>
