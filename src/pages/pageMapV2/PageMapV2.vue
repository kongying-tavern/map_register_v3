<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useInteractionLayer, useMap, useMapSiderMenu } from './hooks'
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
import { usePreferenceStore, useUserInfoStore } from '@/stores'

const canvasRef = ref() as Ref<HTMLCanvasElement>
const mutuallyExclusiveLayerRef = ref<HTMLElement | null>(null)
const mapAffixLayerRef = ref<HTMLElement | null>(null)

const userInfoStore = useUserInfoStore()
const { preference } = storeToRefs(usePreferenceStore())

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
      <div
        class="map-tiny-settings absolute bottom-0 p-2 flex flex-col gap-2 invisible sm:visible z-10 transition-all"
        :class="[
          interactionLayerVisible ? 'pointer-events-auto' : '-translate-x-full',
        ]"
        :style="{
          '--tw-translate-x': '-300%',
        }"
      >
        <GSSwitch v-model="preference['map.setting.showZoneTag']" label="显示区域标签" size="large" />
        <GSSwitch v-model="preference['map.state.showOverlay']" label="显示附加图层" size="large" />
        <GSSwitch v-model="preference['map.setting.transparentMarked']" label="隐藏标记点位" size="large" />
      </div>

      <div ref="mapAffixLayerRef" class="map-affix-provider">
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

    <ZoomController class="absolute right-0 top-1/2" :delta-zoom="0.2" />

    <div class="right-bottom-panel genshin-text absolute right-0 bottom-0 -translate-x-6 -translate-y-2 pointer-events-none flex flex-col items-end gap-2 z-[1]">
      <MapOverlayController />
      <div class="text-white leading-none">
        UID: {{ userInfoStore.info.id }}
      </div>
    </div>

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
.background-mask {
  background: radial-gradient(transparent 50%, #00000060);
}
</style>
