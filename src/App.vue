<script setup lang="ts">
import { TRANSITION_EVENTS } from 'deck.gl'
import { useSubscription } from '@vueuse/rxjs'
import { filter } from 'rxjs'
import { EaseoutInterpolator, GSZoomController, GenshinMapDeck } from '@/packages/map'
import type { GenshinMap, GenshinMapViewState } from '@/packages/map'
import { useArchiveStore, useMapStateStore, useShortcutStore, useTileStore } from '@/stores'
import { useMapLayers, useResourceStatus, useTheme } from '@/hooks'
import {
  AppDevInfo,
  AppDialogProvider,
  AppNoticeProvider,
  AppSiderMenu,
  AppStateBar,
  AppUserAvatar,
  AppWindowProvider,
  MapContextMenu,
  MapMarkerMoveController,
  MapMarkerPopover,
  MapMarkerToggleController,
  MapMarkerTweakController,
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
const archiveStore = useArchiveStore()
const shortcutStore = useShortcutStore()
const mapStateStore = useMapStateStore()

// ================ 地图状态 ================
const genshinDeck = shallowRef<GenshinMap | null>(null)

const mapAffixRef = shallowRef<HTMLDivElement>()
const containerRef = shallowRef<HTMLDivElement>()
const { width, height } = useElementSize(containerRef)

// 响应主题色切换
const { toggle: toggleDarkMode } = useTheme()
shortcutStore.useKeys(
  computed(() => archiveStore.currentArchive.body.Preference['app.shortcutKey.toggleDarkMode']),
  () => toggleDarkMode(),
)

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

// 将 viewState 变更事件响应到绑定对象上
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

// ================ 依赖注入 ================
provide(mapContainerKey, containerRef)
provide(mapContainerHeightKey, height)
provide(mapContainerWidthKey, width)
provide(mapAffixKey, mapAffixRef)
provide(mapViewStateKey, viewState)

onBeforeMount(() => {
  window.preloading.classList.add('is-end')
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
      :disable-view-state-change="mapStateStore.isViewPortLocked"
      :cursor="mapStateStore.cursor"
      class="bg-black"
      @focus="event => MapSubject.focus.next(event)"
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

    <GSZoomController v-model="viewState" :transition-duration="TRANSITION_DURATION" />
    <MapMarkerMoveController />
    <MapMarkerToggleController />
    <MapMarkerTweakController />

    <AppUserAvatar />
    <AppStateBar />
    <AppDevInfo />
    <AppSiderMenu />
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
