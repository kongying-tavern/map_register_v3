<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { ContextMenu, ControlPanel } from './components'
import { useLayer, useMap, useMarker } from './hooks'
import type { MapNameEnum } from './configs'
import { mapTiles } from './configs'
import { AppUserAvatar } from '@/components'
import { useAreaList, useIconList, useItemList } from '@/hooks'

const containerRef = ref<HTMLElement | null>(null)

// ==================== 地图相关 ====================

const { map } = useMap(containerRef)
const { layers, activeName, selectLayer } = useLayer(map)

onActivated(() => {
  selectLayer(Object.keys(layers.value)[0])
})

// ==================== 地区相关 ====================

// 筛选物品所需的数据
const filterForm = useUrlSearchParams('history', {
  removeNullishValues: true,
  initialValue: {
    areaId: 2 as undefined | number,
    typeId: undefined as undefined | number,
    // 这里用 iconName 而不是 itemId 的原因：
    // 1. 不同地区存在相同的物品，但其 itemId 不同
    // TODO 可能存在的问题：
    // 1. 不同的物品拥有同一个 iconName
    iconName: undefined as undefined | string,
  },
})

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
      activeName.value = key
      return
    }
  }
}

const { areaList, onSuccess: onAreaFetched } = useAreaList()

const areaId = computed({
  get: () => !areaList.value.length ? undefined : Number(filterForm.areaId),
  set: (v) => {
    filterForm.areaId = v
    setMapNameByAreaId(v)
  },
})

// ==================== 物品相关 ====================

const { itemList, loading: itemLoading } = useItemList({
  params: () => ({
    areaIdList: !areaId.value || Number.isNaN(areaId.value) ? [] : [areaId.value],
    size: 1000,
  }),
})

const selectedType = computed({
  get: () => Number(filterForm.typeId),
  set: v => filterForm.typeId = v,
})
const filteredItemList = computed(() => {
  const typeId = selectedType.value
  if (typeId === undefined)
    return []
  return itemList.value.filter(item => item.typeIdList?.includes(typeId))
})

const selectedItem = computed(() => filteredItemList.value.find(item => item.name === filterForm.iconName))

// 在物品列表变更后，如果当前已选的同类物品不在列表内，则清除已选项
// TODO 初次加载时可能无法保留状态
watch(filteredItemList, () => {
  if (!selectedItem.value)
    filterForm.iconName = undefined
})

// ==================== 点位相关 ====================

/** 图标表 */
const { iconMap } = useIconList({
  immediate: false,
})

const { createMarkerWhenReady, updateMarkerList } = useMarker(map, {
  selectedItem,
  params: () => ({
    itemIdList: selectedItem.value?.itemId === undefined ? [] : [selectedItem.value.itemId],
  }),
})

// ==================== 其他 ====================

onAreaFetched(() => {
  filterForm.areaId !== undefined && setMapNameByAreaId(Number(filterForm.areaId))
  if (selectedItem.value?.itemId !== undefined) {
    createMarkerWhenReady()
    updateMarkerList()
  }
})
</script>

<template>
  <div class="genshin-map-container w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <ControlPanel
      v-model:area-id="areaId"
      v-model:icon-name="filterForm.iconName"
      v-model:type="selectedType"
      :area-list="areaList"
      :item-list="filteredItemList"
      :item-loading="itemLoading"
      :icon-map="iconMap"
      class="custom-control-panel left-control-panel left-2 top-2 bottom-2 grid p-2 gap-2"
    />

    <AppUserAvatar map-mode class="custom-control-panel right-2 top-2" />

    <ContextMenu :target="containerRef" />
  </div>
</template>

<style lang="scss" scoped>
.genshin-map-container {
  .genshin-map {
    cursor: crosshair;

    :deep(.leaflet-popup-content-wrapper) {
      border-radius: 4px;
      padding: 8px;
    }

    :deep(.leaflet-popup-content) {
      margin: 0;
    }
  }
}

.left-control-panel {
  grid-template-rows: auto 14rem 1fr;
}

.custom-control-panel {
  position: absolute;
  z-index: 1000;
  transition: all ease 300ms;
  background-color: rgba(111, 118, 124, 0.6);
  backdrop-filter: blur(56px);
  border-radius: 4px;
}
</style>
