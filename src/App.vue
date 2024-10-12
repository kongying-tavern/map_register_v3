<script setup lang="ts">
import { TRANSITION_EVENTS } from '@deck.gl/core'
import type { LayersList } from '@deck.gl/core'
import { GSTagLayer, GSTileLayer, GenshinMapDeck } from '@/packages/map'
import type { GenshinMap, GenshinMapProps, GenshinMapViewState } from '@/packages/map'
import { useTileStore } from '@/stores'
import { useResourceStatus } from '@/hooks'

// ================ 全局状态 ================
const tileStore = useTileStore()

// ================ 地图状态 ================
const genshinDeck = shallowRef<GenshinMap | null>(null)

// ================ 视口状态 ================
const initialViewState: Ref<GenshinMapViewState> = ref({
  zoom: -2,
  minZoom: -4,
  maxZoom: 2,
  target: [-7270, 8880],
  transitionDuration: 150,
  transitionEasing: t => t,
  transitionInterruption: TRANSITION_EVENTS.BREAK,
})

// ================ 资源管理 ================
const { status: resourceStatus } = useResourceStatus()

// ================ 图层管理 ================
const tileLayer = computed(() => {
  const tile = tileStore.currentTileConfig?.tile
  if (!tile)
    return
  return new GSTileLayer({
    code: tile.code,
    size: tile.size,
    extension: tile.extension,
    tilesOffset: tile.tilesOffset,
  })
})

const tagLayer = computed(() => {
  const tile = tileStore.currentTileConfig?.tile
  if (!tile || !resourceStatus.value.fonts)
    return
  return new GSTagLayer({
    tagGroups: tileStore.visibleTagGroups,
    offset: tile.center,
  })
})

const layers = computed<LayersList>(() => [
  tileLayer.value,
  tagLayer.value,
])

// ================ 地图管理 ================
const getTooltip = (...[info]: Parameters<NonNullable<GenshinMapProps['getTooltip']>>) => {
  const { coordinate, layer, sourceLayer } = info
  if (!coordinate)
    return null
  return {
    html: `
    <div class="w-[200px] h-[200px] p-1 text-xs bg-[#00000060]">
      <div>x: ${Math.floor(coordinate[0])}, y: ${Math.floor(coordinate[1])}</div>
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
      class="bg-black"
      :layers="layers"
      :initial-view-state
      :get-tooltip="getTooltip"
      @load="(instance) => (genshinDeck = instance)"
    />
  </div>
</template>
