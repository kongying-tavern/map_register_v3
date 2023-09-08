<script lang="ts" setup>
import { useInteractionLayer, useMap, useMapInteraction, useMarkerFocus } from './hooks'
import { genshinMapCanvasKey, mapAffixLayerKey, mutuallyExclusiveLayerKey } from './shared'
import {
  CollapseButton,
  MapContextMenu,
  MapOverlayController,
  MapSiderMenu,
  MarkerMoveController,
  MarkerPopover,
  ZoomController,
} from './components'
import { GSSwitch } from '@/components'
import { useMapSettingStore } from '@/stores'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mutuallyExclusiveLayerRef = ref<HTMLElement | null>(null)
const mapAffixLayerRef = ref<HTMLElement | null>(null)

useMap(canvasRef)
const mapSettingStore = useMapSettingStore()

useMarkerFocus(canvasRef)

useMapInteraction()

// 拦截默认右键事件，由 GenshinMap 自行处理
useEventListener(canvasRef, 'contextmenu', ev => ev.preventDefault())

const { visible: interactionLayerVisible } = useInteractionLayer()

const collapse = ref(false)
whenever(() => collapse.value, () => canvasRef.value?.focus())
useEventListener('keydown', (ev) => {
  if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)
    return
  if (ev.code === 'Backquote')
    collapse.value = !collapse.value
})

provide(genshinMapCanvasKey, canvasRef)
provide(mutuallyExclusiveLayerKey, mutuallyExclusiveLayerRef)
provide(mapAffixLayerKey, mapAffixLayerRef)
</script>

<template>
  <div class="w-full h-full relative">
    <div class="map-mask absolute left-0 top-0 w-full h-full pointer-events-none" />

    <canvas ref="canvasRef" class="map-renderer w-full h-full bg-black" />

    <div class="map-interaction-layer absolute left-0 top-0 w-full h-full pointer-events-none transition-all">
      <div
        class="map-tiny-settings absolute bottom-0 p-2 flex flex-col gap-2 invisible sm:visible z-10 transition-all"
        :class="[
          interactionLayerVisible ? 'pointer-events-auto' : '-translate-x-full',
        ]"
        :style="{
          '--tw-translate-x': '-300%',
        }"
      >
        <GSSwitch v-model="mapSettingStore.showTag" label="显示地图标签" size="large" />
        <GSSwitch v-model="mapSettingStore.showOverlay" label="显示附加图层" size="large" />
        <GSSwitch v-model="mapSettingStore.hideMarkedMarker" label="隐藏标记点位" size="large" />
      </div>

      <div ref="mapAffixLayerRef" class="map-affix-provider">
        <MapOverlayController />
        <MarkerPopover />
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

    <ZoomController class="absolute right-0 top-1/2" />
    <MapContextMenu />

    <div
      ref="mutuallyExclusiveLayerRef"
      class="mutually-exclusive-layer absolute left-0 top-0 w-full h-full pointer-events-none"
    >
      <MarkerMoveController />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-mask {
  background: radial-gradient(transparent 50%, #00000060);
  z-index: 1;
}
</style>
