<script lang="ts" setup>
import { useInteractionLayer, useMap, useMapSiderMenu } from './hooks'
import { genshinMapCanvasKey, mapAffixLayerKey, mutuallyExclusiveLayerKey } from './shared'
import {
  CollapseButton,
  MapContextMenu,
  MapCursor,
  MapSiderMenu,
  MapStateBar,
  MapWindowManager,
  MarkerMoveController,
  MarkerMultiSelectController,
  MarkerPopover,
  ZoomController,
} from './components'
import { useAccessStore } from '@/stores'

const accessStore = useAccessStore()

const canvasRef = ref() as Ref<HTMLCanvasElement>
const mutuallyExclusiveLayerRef = ref<HTMLElement>()
const mapAffixLayerRef = ref<HTMLElement>()

useMap(canvasRef)

// 拦截默认右键事件，由 GenshinMap 自行处理
useEventListener(canvasRef, 'contextmenu', ev => ev.preventDefault())

const { visible: interactionLayerVisible } = useInteractionLayer()

const { collapse } = useMapSiderMenu(canvasRef)

provide(genshinMapCanvasKey, canvasRef)
provide(mutuallyExclusiveLayerKey, mutuallyExclusiveLayerRef)
provide(mapAffixLayerKey, mapAffixLayerRef)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative">
    <div class="background-mask absolute left-0 top-0 w-full h-full pointer-events-none z-[1]" />

    <canvas ref="canvasRef" class="map-renderer w-full h-full bg-black" />

    <div class="map-interaction-layer absolute left-0 top-0 w-full h-full pointer-events-none transition-all">
      <div ref="mapAffixLayerRef" class="map-affix-provider">
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
    </div>

    <MapWindowManager />
    <ZoomController class="absolute right-0 top-1/2" :delta-zoom="0.2" />
    <MapStateBar />
    <MapCursor />

    <div
      ref="mutuallyExclusiveLayerRef"
      class="mutually-exclusive-layer absolute left-0 top-0 w-full h-full pointer-events-none"
    >
      <MarkerMoveController />
      <MarkerMultiSelectController v-if="accessStore.get('MARKER_BATCH_EDIT')" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.background-mask {
  background: radial-gradient(transparent 50%, #00000060);
}
</style>
