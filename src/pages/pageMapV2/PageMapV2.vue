<script lang="ts" setup>
import { useMap } from './hooks'
import { genshinMapCanvasKey, mapAffixLayerKey } from './shared'
import {
  MapContextMenu,
  MapCursor,
  MarkerBulkStateController,
  MarkerMoveController,
  MarkerTweakController,
  ZoomController,
} from './components'
import { useAccessStore } from '@/stores'

const accessStore = useAccessStore()

const canvasRef = ref() as Ref<HTMLCanvasElement>
const mapAffixLayerRef = ref<HTMLElement>()

useMap(canvasRef)

// 拦截默认右键事件，由 GenshinMap 自行处理
useEventListener(canvasRef, 'contextmenu', ev => ev.preventDefault())

provide(genshinMapCanvasKey, canvasRef)
provide(mapAffixLayerKey, mapAffixLayerRef)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative">
    <canvas ref="canvasRef" class="map-renderer w-full h-full bg-black" />

    <div class="virtual-zone bg-[radial-gradient(transparent_50%,#00000060)]">
      <div ref="mapAffixLayerRef" class="affix-layer">
        <MapContextMenu />
      </div>

      <ZoomController :delta-zoom="0.2" />

      <MapCursor />

      <MarkerMoveController v-if="accessStore.get('MARKER_EDIT')" />
      <MarkerTweakController v-if="accessStore.get('MARKER_BATCH_EDIT')" />
      <MarkerBulkStateController />
    </div>
  </div>
</template>

<style scoped>
.virtual-zone {
  @apply absolute left-0 top-0 w-full h-full pointer-events-none;
}
</style>
