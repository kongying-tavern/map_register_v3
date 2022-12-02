<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { ContextMenu, CtrlItemGroup } from './components'
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

const { areaTree, onSuccess: onAreaFetched } = useAreaList()

const areaId = computed({
  get: () => !areaTree.value.length ? undefined : Number(filterForm.areaId),
  set: (v) => {
    filterForm.areaId = v
    setMapNameByAreaId(v)
  },
})

// ==================== 物品相关 ====================

const { itemList, loading: itemLoading, onSuccess: onItemsFetched } = useItemList({
  params: () => ({
    areaIdList: !areaId.value || Number.isNaN(areaId.value) ? [] : [areaId.value],
    size: 1000,
  }),
})

const selectedItem = computed(() => itemList.value.find(item => item.name === filterForm.iconName))

onItemsFetched(() => {
  // 在物品列表加载完成后，如果当前已选的同类物品不在列表内，则清除已选项
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

const iconUrl = computed(() => iconMap.value[selectedItem?.value?.iconTag ?? ''])

// ==================== 其他 ====================

onAreaFetched(() => {
  filterForm.areaId !== undefined && setMapNameByAreaId(Number(filterForm.areaId))
  if (selectedItem.value?.itemId !== undefined) {
    createMarkerWhenReady()
    updateMarkerList()
  }
})

/** 控制侧边栏折叠 */
const collapsed = ref(false)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <div
      class="custom-control-panel absolute left-2 top-2 bottom-2 bg-slate-600 bg-opacity-70 backdrop-blur rounded flex flex-col items-start p-2 gap-2"
      :class="{ collapsed }"
    >
      <div class="w-full flex justify-between gap-1">
        <el-tree-select
          v-model="areaId"
          :data="areaTree"
          :props="{ label: 'name', value: 'areaId' }"
          :default-expanded-keys="areaId === undefined ? [] : [areaId]"
          accordion
          node-key="areaId"
          placeholder="请选择地区"
        />
        <el-image
          v-if="selectedItem"
          :src="iconUrl"
          :alt="selectedItem?.name"
          lazy
          class="selected-item-bar w-8 h-8 align-middle bg-gray-800 rounded border border-x-amber-300 cursor-pointer"
          style="--el-fill-color-light: transparent"
          fit="contain"
          decoding="async"
          referrerpolicy="no-referrer"
          @click="(filterForm.iconName = undefined)"
        >
          <template #error>
            <img class="w-full h-full object-contain" src="https://assets.yuanshen.site/icons/-1.png">
          </template>
        </el-image>
        <el-button type="primary" @click="collapsed = !collapsed">
          {{ collapsed ? '展开' : '折叠' }}
        </el-button>
      </div>
      <CtrlItemGroup
        v-model="filterForm.iconName"
        :item-list="itemList"
        :icon-map="iconMap"
        :loading="itemLoading"
        item-key-name="name"
        class="flex-1"
      />
    </div>

    <div class="custom-control-panel absolute right-2 top-2 bg-slate-600 bg-opacity-70 backdrop-blur rounded">
      <AppUserAvatar map-mode />
    </div>

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

.custom-control-panel {
  --clip-height: 0;

  z-index: 1000;
  transition: all ease 300ms;
  clip-path: inset(0 0 var(--clip-height) round 0.25rem);

  &.collapsed {
    --clip-height: calc(100% - 48px);
  }
}

.selected-item-bar {
  position: relative;
  overflow: visible;

  &::before, &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: -6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    pointer-events: none;
  }
  &::before {
    background-color: var(--el-color-danger);
  }
  &::after {
    background-color: var(--el-color-white);
    clip-path: inset(6px 3px);
  }
}
</style>
