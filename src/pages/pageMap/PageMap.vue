<script lang="ts" setup>
import { ref } from 'vue'
import 'leaflet/dist/leaflet.css'
import { ControlPanel, UndergroundSwitch } from './components'
import { areaListInjection, iconMapInjection, itemListInjection, itemTypeInjection, mapInjection, markerListInjection } from './shared'
import { useContextMenu, useLayer, useMap, useMarker } from './hooks'
import { AppUserAvatar } from '@/components'
import { useAreaList, useItemList, useTypeList } from '@/hooks'
import { useMapStore } from '@/stores'

// ==================== 地图相关 ====================
const containerRef = ref<HTMLElement | null>(null)
const mapStore = useMapStore()

const { map, stopPropagationSignal, on: onMapEvent } = useMap(containerRef)
const { layers, activeLayer, selectLayer, setMapNameByAreaCode } = useLayer(map)

onMounted(() => {
  if (!mapStore.areaCode)
    selectLayer(Object.keys(layers.value)[0])
})

// ==================== 地区相关 ====================
const { areaList, onSuccess: onAreaFetched } = useAreaList()

mapStore.$subscribe((_, { areaCode }) => {
  setMapNameByAreaCode(!areaList.value.length ? undefined : areaCode)
})

const areaId = computed(() => {
  if (!mapStore.areaCode)
    return
  return areaList.value.find(area => area.code === mapStore.areaCode)?.areaId
})

// ==================== 物品相关 ====================
const { itemList, loading: itemLoading } = useItemList({
  params: () => ({
    areaIdList: areaId.value === undefined ? [] : [areaId.value],
    size: 1000,
  }),
})

/** 物品类型列表 */
const { typeList } = useTypeList()

const filteredItemList = computed(() => {
  const { typeId } = mapStore
  if (typeId === undefined)
    return []
  return itemList.value.filter(item => item.typeIdList?.includes(typeId))
})

const selectedItem = computed(() => filteredItemList.value.find(item => item.name === mapStore.iconName))

// 在物品列表变更后，如果当前已选的同类物品不在列表内，则清除已选项
// TODO 初次加载时可能无法保留状态
watch(() => [mapStore.areaCode, mapStore.typeId], () => {
  if (!selectedItem.value)
    mapStore.iconName = undefined
})

// ==================== 点位相关 ====================
const { iconMap, markerList, loading: markerLoading, updateMarkerList } = useMarker(map, {
  selectedItem,
  itemList,
  stopPropagationSignal,
  params: () => ({
    rawParams: {
      itemIdList: selectedItem.value?.itemId === undefined ? [] : [selectedItem.value.itemId],
    },
    showAuditedMarker: Boolean(mapStore.showAuditedMarker),
    showPunctuateMarker: Boolean(mapStore.showPunctuateMarker),
    onlyUnderground: Boolean(mapStore.onlyUnderground),
  }),
})

const { openContextMenu } = useContextMenu({
  areaList,
  itemList,
  typeList,
  iconMap,
  selectedItem,
  refreshMarkers: updateMarkerList,
})
onMapEvent('contextmenu', openContextMenu)

// ==================== 其他 ====================
onAreaFetched(() => {
  mapStore.areaCode !== undefined && setMapNameByAreaCode(mapStore.areaCode)
  updateMarkerList()
})

// ==================== 依赖注入 ====================
provide(mapInjection, map)
provide(areaListInjection, areaList)
provide(itemListInjection, filteredItemList)
provide(itemTypeInjection, typeList)
provide(markerListInjection, markerList)
provide(iconMapInjection, iconMap)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <ControlPanel
      :marker-loading="markerLoading"
      :item-loading="itemLoading"
      class="control-unit control-bg left-2 top-2 bottom-2 grid p-2 gap-2"
    />

    <div class="control-unit top-2 right-2 flex gap-2">
      <UndergroundSwitch :active-layer="activeLayer" class="control-bg" />

      <AppUserAvatar map-mode class="control-bg" />
    </div>
  </div>
</template>

<style lang="scss">
// global
@import '@/style/leaflet/index.scss';
</style>

<style lang="scss" scoped>
.control-unit {
  position: absolute;
  z-index: 1000;
}

.control-bg {
  background: var(--bg-color);
  backdrop-filter: blur(56px);
  border-radius: 8px;
}
</style>
