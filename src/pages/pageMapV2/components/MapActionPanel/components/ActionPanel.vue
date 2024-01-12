<script setup lang="ts">
import type { ActionPanelTypes } from '../types'

defineProps<{
  context: ActionPanelTypes.Context
  id: string
  info: ActionPanelTypes.Info
  dragHookId: string
}>()
</script>

<template>
  <div
    class="action-panel"
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
      class="action-panel-header"
      data-draggable="true"
    >
      {{ info.name }}
    </div>

    <div class="action-panel-main">
      <div v-for="i in 10" :key="i">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum distinctio ducimus amet laboriosam? Eius, aperiam, praesentium doloribus, animi molestias reprehenderit sunt labore deserunt sit ipsum voluptatem? Atque nemo temporibus blanditiis?
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-panel {
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

.action-panel-header {
  flex-shrink: 0;
  background: #CCC;
  user-select: none;
}

.action-panel-main {
  flex: 1;
  background: #FFF;
  overflow: auto;
}
</style>
../types
