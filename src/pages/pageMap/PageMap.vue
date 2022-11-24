<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { CtrlItemGroup } from './components'
import { useItemList, useLayer, useMap, useMarker } from './hooks'
import type { MapNameEnum } from './configs'
import { mapTiles } from './configs'
import { AppUserAvatar } from '@/components'
import { useAreaList, useIconList } from '@/hooks'

const containerRef = ref<HTMLElement | null>(null)

// ==================== 地图相关 ====================

const { map, onMapCreated } = useMap(containerRef)
const { layers, activeName, selectLayer } = useLayer(map)

// 地图初始化完成后触发
onMapCreated(() => {
  selectLayer(Object.keys(layers.value)[0])
})

// ==================== 地区相关 ====================

// 筛选物品所需的数据
const filterForm = useUrlSearchParams('history', {
  removeNullishValues: true,
  initialValue: {
    itemId: undefined as undefined | number,
    areaId: 2 as undefined | number,
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

const itemId = computed({
  get: () => Number(filterForm.itemId),
  set: v => filterForm.itemId = v,
})

const { itemList } = useItemList({
  params: () => ({
    areaIdList: !areaId.value || Number.isNaN(areaId.value) ? [] : [areaId.value],
    size: 1000,
  }),
})

const selectedItem = computed(() => itemList.value.find(item => item.itemId === itemId.value))

// ==================== 点位相关 ====================

/** 图标表 */
const { iconMap } = useIconList({
  immediate: false,
})

const { createMarkerWhenReady, updateMarkerList } = useMarker(map, {
  selectedItem,
  params: () => ({
    itemIdList: isNaN(itemId.value) ? [] : [itemId.value],
  }),
})

const iconUrl = computed(() => {
  const iconTag = selectedItem?.value?.iconTag
  return iconMap.value[iconTag ?? '']
})

// ==================== 其他 ====================

onAreaFetched(() => {
  filterForm.areaId !== undefined && setMapNameByAreaId(Number(filterForm.areaId))
  if (filterForm.itemId !== undefined) {
    createMarkerWhenReady()
    updateMarkerList()
  }
})

/** 控制侧边栏折叠 */
const collapsed = ref(false)
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
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
          node-key="areaId"
          placeholder="请选择地区"
        />
        <el-image
          v-if="selectedItem"
          :src="iconUrl"
          :alt="selectedItem?.name"
          lazy
          class="w-8 h-8 align-middle bg-gray-800 rounded border border-x-amber-300"
          style="--el-fill-color-light: transparent"
          fit="contain"
          decoding="async"
          referrerpolicy="no-referrer"
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
        v-model="itemId"
        :item-list="itemList"
        :icon-map="iconMap"
        class="flex-1"
      />
    </div>

    <div class="custom-control-panel absolute right-2 top-2 bg-slate-600 bg-opacity-70 backdrop-blur rounded">
      <AppUserAvatar map-mode />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-control-panel {
  --clip-height: 0;

  z-index: 1000;
  transition: all ease 300ms;
  clip-path: inset(0 0 var(--clip-height) round 0.25rem);

  &.collapsed {
    --clip-height: calc(100% - 48px);
  }
}
</style>
