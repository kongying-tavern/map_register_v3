<script setup lang="ts">
import { WindowPanel } from './components'
import { useWindowDrag } from './hooks'
import { context } from './core'
import { useUserAuthStore } from '@/stores'

const userAuthStore = useUserAuthStore()

const { optimizeWindowPosition } = useWindowDrag(context)

userAuthStore.onBeforeLogout(() => {
  context.clearWindow()
})

onBeforeUnmount(() => {
  context.clearWindow()
})
</script>

<template>
  <div class="map-window-manager">
    <WindowPanel
      v-for="([id, info]) in context.getWindows()"
      :id="id"
      :key="id"
      v-model:main-ref="info.ref"
      :info="info"
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
