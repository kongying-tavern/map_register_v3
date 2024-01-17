<script setup lang="ts">
import { useMapCursor } from '@/pages/pageMapV2/hooks'

const { cursorRef, isVisible, pos } = useMapCursor(true)
</script>

<template>
  <div v-if="isVisible" ref="cursorRef" class="map-cursor" :style="{ '--tx': pos.x, '--ty': pos.y }" />
</template>

<style scoped>
.map-cursor {
  position: absolute;
  width: 64px;
  height: 64px;
  left: 0;
  top: 0;
  background-color: skyblue;
  translate: calc(var(--tx) * 1px) calc(var(--ty) * 1px);
  pointer-events: none;
  z-index: 20;
}
</style>
