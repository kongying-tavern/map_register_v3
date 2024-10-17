<script setup lang="ts">
import { TRANSITION_EVENTS } from '@deck.gl/core'
import {
  EaseoutInterpolator,
  GSZoomController,
  GenshinMapDeck,
} from '@/packages/map'
import type { GenshinMap, GenshinMapProps, GenshinMapViewState } from '@/packages/map'
import {
  useMapStateStore,
  useTileStore,
} from '@/stores'
import {
  useMapLayers,
  useResourceStatus,
} from '@/hooks'
import {
  AppDevInfo,
  AppStateBar,
  AppUserAvatar,
  AppWindowProvider,
} from '@/components'

// ================ 全局状态 ================
const tileStore = useTileStore()
const mapStateStore = useMapStateStore()

// ================ 地图状态 ================
const genshinDeck = shallowRef<GenshinMap | null>(null)

// ================ 视口状态 ================
const TRANSITION_DURATION = 150

/**
 * 基于 `Deck.setProps` 实现，因此
 * 必须通过整体赋值的方式来设置视口状态。
 * ```
 * // Good √
 * viewState.value = { ...viewState.value, zoom: -1 }
 * // Bad ×
 * viewState.value.zoom = -1
 * ```
 */
const viewState: Ref<GenshinMapViewState> = ref({
  zoom: -1,
  minZoom: -4,
  maxZoom: 2,
  target: [328, 6660],
  transitionDuration: TRANSITION_DURATION,
  transitionEasing: t => t,
  transitionInterruption: TRANSITION_EVENTS.BREAK,
})

mapStateStore.event.on('setViewState', (newViewState) => {
  viewState.value = {
    ...viewState.value,
    ...newViewState,
  }
})

watch(() => tileStore.currentTileConfig, (currentTileConfig) => {
  if (!currentTileConfig)
    return
  const { target: [x, y], zoom } = currentTileConfig.initViewState
  const [ox, oy] = currentTileConfig.tile.center
  viewState.value = {
    ...viewState.value,
    target: [x + ox, y + oy],
    zoom,
    transitionDuration: 1000,
    transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
  }
})

// ================ 资源管理 ================
const { status: resourceStatus } = useResourceStatus()

// ================ 图层管理 ================
const { layers } = useMapLayers({ resourceStatus })

// ================ 地图管理 ================
const getTooltip: GenshinMapProps['getTooltip'] = (info) => {
  const { coordinate, layer, sourceLayer } = info
  if (!coordinate)
    return null
  return {
    html: `
    <div class="w-[200px] h-[200px] p-1 text-xs text-white bg-[#00000080]">
      <div>x: ${Math.floor(coordinate[0])}, y: ${Math.floor(coordinate[1])}, zoom: ${info.viewport?.zoom?.toFixed(2)}</div>
      <div>layer: ${layer ? layer.id : 'no layer'}</div>
      <div>layer: ${sourceLayer ? sourceLayer.id : 'no layer'}</div>
    </div>`,
    style: {
      padding: '0 0 0 32px',
      backgroundColor: 'unset',
      backgroundClip: 'content-box',
      overflow: 'hidden',
    },
  }
}
</script>

<template>
  <div class="w-full h-full overflow-hidden">
    <GenshinMapDeck
      v-model:view-state="viewState"
      :layers="layers"
      :get-tooltip="getTooltip"
      class="bg-black"
      @load="(instance) => (genshinDeck = instance)"
    />

    <AppUserAvatar />

    <GSZoomController
      v-model="viewState"
      :transition-duration="TRANSITION_DURATION"
    />

    <AppStateBar
      v-model:view-state="viewState"
    />

    <AppDevInfo />

    <AppWindowProvider />
  </div>
</template>
