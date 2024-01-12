<script setup lang="ts">
import { ActionPanel } from './components'
import { usePanelDrag } from './hooks'
import { PanelContext } from './core'

const context = new PanelContext()

context.setActionPanels({
  markerLink: { name: '点位关联', translate: { x: 0, y: 0 }, order: 0 },
  test2: { name: 'Test2', translate: { x: 100, y: 100 }, order: 1 },
})

usePanelDrag({ context })
</script>

<template>
  <div class="action-panel-manager">
    <ActionPanel
      v-for="(action, id) in context.getActionPanels()"
      :id="id"
      :key="id"
      :context="context"
      :info="action"
      :drag-hook-id="context.dragHookId"
    />
  </div>
</template>

<style scoped>
.action-panel-manager {
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
