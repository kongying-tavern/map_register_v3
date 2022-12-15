<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import type { LeafletEvent } from 'leaflet'
import { ControlPanel } from './components'
import { areaListInjection, iconMapInjection, itemListInjection, markerListInjection } from './shared'
import { useContextMenu, useLayer, useMap, useMarker } from './hooks'
import type { MapNameEnum } from './configs'
import { mapTiles } from './configs'
import type { GenshinMap } from './utils'
import { AppUserAvatar } from '@/components'
import { useAreaList, useItemList } from '@/hooks'
import { useMapStore } from '@/stores'

// ==================== 地图相关 ====================
const containerRef = ref<HTMLElement | null>(null)
const mapStore = useMapStore()

const { map, stopPropagationSignal, on: onMapEvent } = useMap(containerRef)
const { layers, activeName, layerConfig, selectLayer } = useLayer(map)

onMounted(() => {
  if (!mapStore.areaId)
    selectLayer(Object.keys(layers.value)[0])
})

onMapEvent('baselayerchange', () => {
  if (!mapStore.center) {
    mapStore.center = layerConfig.value?.settings?.center as [number, number]
    mapStore.zoom = layerConfig.value?.settings?.zoom as number
    return
  }
  map.value?.flyTo(mapStore.center, mapStore.zoom ?? 0, {
    duration: 0.1,
  })
})

onMapEvent('zoom', (ev) => {
  mapStore.zoom = (ev.target as GenshinMap).getZoom()
})

onMapEvent('drag', useDebounceFn((ev: LeafletEvent) => {
  const center = (ev.target as GenshinMap).getCenter()
  mapStore.center = [Math.floor(center.lat), Math.floor(center.lng)]
}, 200))

// ==================== 地区相关 ====================
const { areaList, onSuccess: onAreaFetched } = useAreaList()

/**
 * 选择地区时会自动切换地图
 * @TODO 地图焦点自动移动到对应的地区中心
 */
const setMapNameByAreaId = (id?: number) => {
  if (id === undefined)
    return
  for (const key in mapTiles) {
    const config = mapTiles[key as MapNameEnum]
    if (!config)
      continue
    if (config.areaIds.includes(id)) {
      mapStore.areaId = id
      activeName.value = key
      mapStore.center = undefined
      return
    }
  }
}

const areaId = computed({
  get: () => !areaList.value.length ? undefined : mapStore.areaId,
  set: setMapNameByAreaId,
})

// ==================== 物品相关 ====================
const { itemList, loading: itemLoading } = useItemList({
  params: () => ({
    areaIdList: areaId.value === undefined ? [] : [areaId.value],
    size: 1000,
  }),
})

const filteredItemList = computed(() => {
  const { typeId } = mapStore
  if (typeId === undefined)
    return []
  return itemList.value.filter(item => item.typeIdList?.includes(typeId))
})

const selectedItem = computed(() => filteredItemList.value.find(item => item.name === mapStore.iconName))

// 在物品列表变更后，如果当前已选的同类物品不在列表内，则清除已选项
// TODO 初次加载时可能无法保留状态
watch(() => [mapStore.areaId, mapStore.typeId], () => {
  if (!selectedItem.value)
    mapStore.iconName = undefined
})

// ==================== 点位相关 ====================
const { iconMap, markerList, loading: markerLoading, createMarkerWhenReady, updateMarkerList } = useMarker(map, {
  selectedItem,
  stopPropagationSignal,
  params: () => ({
    itemIdList: selectedItem.value?.itemId === undefined ? [] : [selectedItem.value.itemId],
  }),
})

const { openContextMenu } = useContextMenu({
  selectedItem,
  refreshMarkers: updateMarkerList,
})
onMapEvent('contextmenu', openContextMenu)

// ==================== 其他 ====================
onAreaFetched(() => {
  mapStore.areaId !== undefined && setMapNameByAreaId(mapStore.areaId)
  if (selectedItem.value?.itemId !== undefined) {
    createMarkerWhenReady()
    updateMarkerList()
  }
})

// ==================== 依赖注入 ====================
provide(areaListInjection, areaList)
provide(itemListInjection, filteredItemList)
provide(markerListInjection, markerList)
provide(iconMapInjection, iconMap)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <ControlPanel
      v-model:area-id="areaId"
      v-model:icon-name="mapStore.iconName"
      v-model:type="mapStore.typeId"
      v-model:step="mapStore.step"
      :marker-loading="markerLoading"
      :item-loading="itemLoading"
      class="custom-control-panel left-2 top-2 bottom-2 grid p-2 gap-2"
    />

    <AppUserAvatar map-mode class="custom-control-panel right-2 top-2" />
  </div>
</template>

<style lang="scss">
// global
@import '@/style/leaflet/index.scss';
</style>

<style lang="scss" scoped>
.custom-control-panel {
  position: absolute;
  z-index: 1000;
  background: var(--bg-color);
  backdrop-filter: blur(56px);
  border-radius: 8px;
}
</style>
