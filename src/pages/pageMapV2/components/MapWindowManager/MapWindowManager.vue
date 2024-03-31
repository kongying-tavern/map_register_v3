<script setup lang="ts">
import { WindowPanel } from './components'
import { useWindowDrag } from './hooks'
import { context } from './core'

const { optimizeWindowPosition } = useWindowDrag(context)
</script>

<template>
  <div class="map-window-manager">
    <WindowPanel
      v-for="(action, id) in context.getWindows()"
      :id="id"
      :key="id"
      v-model:main-ref="action.ref"
      :info="action"
      :drag-hook-id="context.dragHookId"
      @optimize-window-position="optimizeWindowPosition"
    />
  </div>
</template>

<style scoped>
.map-window-manager {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 10;
}
</style>
