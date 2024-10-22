<script setup lang="ts">
import { TRANSITION_EVENTS } from '@deck.gl/core'
import { useSubscription } from '@vueuse/rxjs'
import { filter } from 'rxjs'
import { EaseoutInterpolator, GSZoomController, GenshinMapDeck } from '@/packages/map'
import type { GenshinMap, GenshinMapProps, GenshinMapViewState } from '@/packages/map'
import { useMapStateStore, useTileStore } from '@/stores'
import { useMapLayers, useResourceStatus } from '@/hooks'
import {
  AppDevInfo,
  AppDialogProvider,
  AppNoticeProvider,
  AppSiderMenu,
  AppStateBar,
  AppUserAvatar,
  AppWindowProvider,
  MapContextMenu,
  MapMarkerPopover,
} from '@/components'
import {
  MapSubject,
  mapAffixKey,
  mapContainerHeightKey,
  mapContainerKey,
  mapContainerWidthKey,
  mapViewStateKey,
} from '@/shared'

// ================ 全局状态 ================
const tileStore = useTileStore()
const mapStateStore = useMapStateStore()

const siderMenuCollapse = ref(true)

// ================ 地图状态 ================
const genshinDeck = shallowRef<GenshinMap | null>(null)

const mapAffixRef = shallowRef<HTMLDivElement>()
const containerRef = shallowRef<HTMLDivElement>()
const { width, height } = useElementSize(containerRef)

// 以下注入用于实现地图悬浮组件的定位/投影等逻辑
provide(mapContainerKey, containerRef)
provide(mapContainerHeightKey, height)
provide(mapContainerWidthKey, width)
provide(mapAffixKey, mapAffixRef)

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

provide(mapViewStateKey, viewState)

useSubscription(MapSubject.viewState.subscribe((newViewState) => {
  viewState.value = {
    ...viewState.value,
    ...newViewState,
  }
}))

// 切换地区时，使用地区配置的初始视口状态
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
}, { immediate: true })

// ================ 资源管理 ================
const { status: resourceStatus } = useResourceStatus()

// ================ 地图管理 ================
const getTooltip: GenshinMapProps['getTooltip'] = (info) => {
  const { coordinate, layer, sourceLayer } = info
  if (!coordinate)
    return null
  return {
    html: `
    <div class="w-[200px] h-[200px] p-1 text-xs text-white bg-[#00000080]">
      <div>x: ${Math.floor(coordinate[0])}, y: ${Math.floor(coordinate[1])}, zoom: ${info.viewport?.zoom?.toFixed(2)}</div>
      <div>rootlayer: ${layer ? layer.id : 'no layer'}</div>
      <div>sourceLayer: ${sourceLayer ? sourceLayer.id : 'no layer'}</div>
    </div>`,
    style: {
      padding: '0 0 0 32px',
      backgroundColor: 'unset',
      backgroundClip: 'content-box',
      overflow: 'hidden',
    },
  }
}

// 地图 focus 清理
useSubscription(MapSubject.click.pipe(
  filter(({ info }) => !info.layer),
).subscribe(() => mapStateStore.interaction.clearFocus()))

// 地图 hover 清理
useSubscription(MapSubject.hover.pipe(
  filter(({ info }) => !info.layer),
).subscribe(() => mapStateStore.interaction.clearHover()))

// ================ 图层管理 ================
const { layers } = useMapLayers({
  resourceStatus,
})
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-full overflow-hidden relative"
  >
    <GenshinMapDeck
      v-model:view-state="viewState"
      :layers="layers"
      :get-tooltip="getTooltip"
      class="bg-black"
      @load="(instance) => (genshinDeck = instance)"
      @click="(info, event) => MapSubject.click.next({ info, event })"
      @hover="(info, event) => MapSubject.hover.next({ info, event })"
      @drag="(info, event) => MapSubject.drag.next({ info, event })"
      @drag-end="(info, event) => MapSubject.dragEnd.next({ info, event })"
      @drag-start="(info, event) => MapSubject.dragStart.next({ info, event })"
    />

    <div ref="mapAffixRef" class="affix-layer">
      <MapMarkerPopover />
      <MapContextMenu />
    </div>

    <GSZoomController
      v-model="viewState"
      :transition-duration="TRANSITION_DURATION"
    />

    <AppUserAvatar />
    <AppStateBar v-model:view-state="viewState" />
    <AppDevInfo />
    <AppSiderMenu v-model:collapse="siderMenuCollapse" />
    <AppWindowProvider />
    <AppNoticeProvider />
    <AppDialogProvider />
  </div>
</template>

<style scoped>
.affix-layer {
  @apply absolute left-0 top-0 w-full h-full pointer-events-none;
}
</style>
