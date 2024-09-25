<script lang="ts" setup>
import { useInteractionLayer, useMap, useMapSiderMenu } from './hooks'
import { genshinMapCanvasKey, mapAffixLayerKey } from './shared'
import {
  CollapseButton,
  MapContextMenu,
  MapCursor,
  MapSiderMenu,
  MapStateBar,
  MapWindowManager,
  MarkerBulkStateController,
  MarkerMoveController,
  MarkerPopover,
  MarkerTweakController,
  ZoomController,
} from './components'
import { context } from './components/MapWindowManager/core'
import { useAccessStore } from '@/stores'

const accessStore = useAccessStore()

const canvasRef = ref() as Ref<HTMLCanvasElement>
const mapAffixLayerRef = ref<HTMLElement>()

useMap(canvasRef)

// 拦截默认右键事件，由 GenshinMap 自行处理
useEventListener(canvasRef, 'contextmenu', ev => ev.preventDefault())

const { visible: interactionLayerVisible } = useInteractionLayer()

const { collapse } = useMapSiderMenu(canvasRef)

provide(genshinMapCanvasKey, canvasRef)
provide(mapAffixLayerKey, mapAffixLayerRef)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative">
    <canvas ref="canvasRef" class="map-renderer w-full h-full bg-black" />

    <div class="virtual-zone bg-[radial-gradient(transparent_50%,#00000060)]">
      <div ref="mapAffixLayerRef" class="affix-layer">
        <MarkerPopover />
        <MapContextMenu />
      </div>

      <MapSiderMenu
        v-model:collapse="collapse"
        class="z-10 transition-all"
        :class="[interactionLayerVisible ? 'pointer-events-auto' : '-translate-x-full']"
      />

      <CollapseButton
        v-model:collapse="collapse"
        :class="[interactionLayerVisible ? 'pointer-events-auto' : '-translate-x-full']"
        :style="{ '--tw-translate-x': interactionLayerVisible ? '0%' : '-300%' }"
      />

      <MapWindowManager v-if="context.getWindows().size > 0" />

      <ZoomController :delta-zoom="0.2" />

      <MapStateBar />

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
