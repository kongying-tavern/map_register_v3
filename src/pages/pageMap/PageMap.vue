<script lang="ts" setup>
import { ref } from 'vue'
import 'leaflet/dist/leaflet.css'
import { ControlPanel, UndergroundSwitch } from './components'
import { areaListInjection, iconMapInjection, itemListInjection, itemTypeInjection, mapInjection, markerListInjection } from './shared'
import { useContextMenu, useLayer, useMap, useMarker } from './hooks'
import { AppUserAvatar } from '@/components'
import { useAreaList, useIconList, useItemList, useTypeList } from '@/hooks'
import { useItemStore, useMapStore, useMarkerStore } from '@/stores'

// ==================== 地图相关 ====================
const containerRef = ref<HTMLElement | null>(null)
const mapStore = useMapStore()

const { map, on: onMapEvent } = useMap(containerRef)
const { layers, activeLayer, selectLayer, setMapNameByAreaCode } = useLayer(map)

onMounted(() => {
  if (!mapStore.areaCode)
    selectLayer(Object.keys(layers.value)[0])
})

// ==================== 地区相关 ====================
const { areaList, onSuccess: onAreaFetched } = useAreaList({ immediate: true })

mapStore.$subscribe((_, { areaCode }) => {
  setMapNameByAreaCode(!areaList.value.length ? undefined : areaCode)
})

const areaId = computed(() => {
  if (!mapStore.areaCode)
    return
  return areaList.value.find(area => area.code === mapStore.areaCode)?.areaId
})

// ==================== 图标相关 ====================
const { iconMap } = useIconList({ immediate: true })

// ==================== 物品相关 ====================

const { itemList } = useItemList({
  immediate: true,
  params: () => ({
    areaIdList: areaId.value === undefined ? [] : [areaId.value],
    typeIdList: mapStore.typeId ? [mapStore.typeId] : [],
    size: 1000,
  }),
})

/** 物品类型列表 */
const { typeList } = useTypeList({ immediate: true })

/** 已选择的物品 */
const selectedItem = computed(() => itemList.value.find(item => item.name === mapStore.iconName))
/** 特殊物品 ID 列表（如传送点、秘境等，详见 apifox 文档） */
const specialItemList = computed(() => {
  return itemList.value
    .filter(item => item.specialFlag === 1 && selectedItem.value?.itemId !== item.itemId).map(item => item.itemId ?? -1)
})
// 在物品列表变更后，如果当前已选的同类物品不在列表内，则清除已选项
// TODO 初次加载时可能无法保留状态
watch(() => [mapStore.areaCode, mapStore.typeId], () => {
  if (!selectedItem.value)
    mapStore.iconName = undefined
})

// ==================== 点位相关 ====================
const { markerList, updateMarkerList } = useMarker({
  selectedItem,
  params: () => ({
    rawParams: {
      itemIdList: selectedItem.value?.itemId === undefined ? [] : [selectedItem.value.itemId],
    },
    showAuditedMarker: Boolean(mapStore.showAuditedMarker),
    showPunctuateMarker: Boolean(mapStore.showPunctuateMarker),
    onlyUnderground: Boolean(mapStore.onlyUnderground),
    showSpecial: true,
    specialItems: specialItemList.value,
  }),
})

const { openContextMenu } = useContextMenu({
  selectedItem,
  refreshMarkers: updateMarkerList,
})
onMapEvent('contextmenu', openContextMenu)

// ==================== 其他 ====================
onAreaFetched(() => {
  mapStore.areaCode !== undefined && setMapNameByAreaCode(mapStore.areaCode)
  updateMarkerList()
})

// ==================== 全量数据更新 ====================
const itemStore = useItemStore()
const markerStore = useMarkerStore()
onMounted(() => {
  itemStore.backgroundUpdate()
  markerStore.backgroundUpdate()
})

// ==================== 依赖注入 ====================
provide(mapInjection, map)
provide(areaListInjection, areaList)
provide(itemListInjection, itemList)
provide(itemTypeInjection, typeList)
provide(markerListInjection, markerList)
provide(iconMapInjection, iconMap)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <ControlPanel class="control-unit control-bg left-2 top-2 bottom-2" />

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
  border-radius: 8px;
}

// TODO 考虑到字体颜色需要适配背景图像的变化，先写死
.control-bg {
  &::before {
    content: '';
    border-radius: 8px;
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgb(48 49 51 / 0.5);
    backdrop-filter: blur(61px);
    z-index: -1;
  }
}
</style>
