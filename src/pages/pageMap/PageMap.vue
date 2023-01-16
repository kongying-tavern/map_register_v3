<script lang="ts" setup>
import { ref } from 'vue'
import 'leaflet/dist/leaflet.css'
import type { LeafletEvent } from 'leaflet'
import L from 'leaflet'
import { ControlPanel } from './components'
import { areaListInjection, iconMapInjection, itemListInjection, itemTypeInjection, mapInjection, markerListInjection, underGroundModeInjection } from './shared'
import { useContextMenu, useLayer, useMap, useMarker } from './hooks'
import type { MapNameEnum } from './configs'
import { mapTiles } from './configs'
import type { GenshinMap } from './utils'
import { AppUserAvatar } from '@/components'
import { useAreaList, useItemList, useTypeList } from '@/hooks'
import { useMapStore } from '@/stores'

// ==================== 地图相关 ====================
const containerRef = ref<HTMLElement | null>(null)
const mapStore = useMapStore()

const { map, stopPropagationSignal, on: onMapEvent } = useMap(containerRef)
const { layers, activeLayer, activeName, layerConfig, selectLayer } = useLayer(map)

onMounted(() => {
  if (!mapStore.areaCode)
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

onMapEvent('move', useDebounceFn((ev: LeafletEvent) => {
  const center = (ev.target as GenshinMap).getCenter()
  mapStore.center = [Math.floor(center.lat), Math.floor(center.lng)]
}, 500))

// ==================== 地区相关 ====================
const { areaList, onSuccess: onAreaFetched } = useAreaList()

/**
 * 选择地区时会自动切换地图
 * @TODO 地图焦点自动移动到对应的地区中心
 * @注意 需要在 ../config/mapTiles 里配置地图与地区关联 id
 */
const setMapNameByAreaCode = (code?: string) => {
  if (!code)
    return
  for (const key in mapTiles) {
    const config = mapTiles[key as MapNameEnum]
    if (!config)
      continue
    if (config.areaCodes.includes(code)) {
      activeName.value = key
      mapStore.areaCode = code
      mapStore.center = undefined
      return
    }
  }
}

/** 须弥判断 */
const isSumeru = computed(() => {
  return mapStore.areaCode ? mapStore.areaCode.search('A:XM') > -1 : false
})
/** 须弥雨林判断 */
const isSumeruForest = computed(() => {
  return mapStore.areaCode === 'A:XM:FOREST'
})
/** 大赤沙海判断 */
const isSumeruDesert = computed(() => {
  return mapStore.areaCode === 'A:XM:DESERT'
})

/** 地下模式状态 */
const isUnderGround = ref<boolean>(true)
/** 地下模式切换按钮背景颜色 */
const underGroundBtnColor = computed(() => {
  return isUnderGround.value ? 'var(--bg-color)' : 'var(--el-color-info)'
})
/** 须弥雨林地下图层 */
const sumeruForestLayer = L.imageOverlay('https://v3.yuanshen.site/imgs/sumeru_undergroundmap_shade.png', [[-6299, -2190], [-838, 1906]])
/** 大赤沙海基本地下图层 */
const sumeruDesertLayer = L.imageOverlay('https://v3.yuanshen.site/imgs/固定底图.png', [[-7670, 480], [-3369, 4781]])

/** 地下模式切换事件 */
const undergroundMode = () => {
  if (isSumeruForest.value) {
    // 须弥雨林
    if (isUnderGround.value) {
      activeLayer.value?.setOpacity(0.45)
      map.value?.addLayer(sumeruForestLayer)
    }
    else {
      activeLayer.value?.setOpacity(1)
      map.value?.removeLayer(sumeruForestLayer)
    }
  }
  if (isSumeruDesert.value) {
    // 大赤沙海
    if (isUnderGround.value) {
      activeLayer.value?.setOpacity(0.45)
      map.value?.addLayer(sumeruDesertLayer)
    }
    else {
      activeLayer.value?.setOpacity(1)
      map.value?.removeLayer(sumeruDesertLayer)
    }
  }
  isUnderGround.value = !isUnderGround.value
}

const areaCode = computed({
  get: () => !areaList.value.length ? undefined : mapStore.areaCode,
  set: setMapNameByAreaCode,
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
const { iconMap, markerList, loading: markerLoading, createMarkerWhenReady, updateMarkerList } = useMarker(map, {
  selectedItem,
  itemList,
  stopPropagationSignal,
  params: () => ({
    itemIdList: selectedItem.value?.itemId === undefined ? [] : [selectedItem.value.itemId],
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
  if (selectedItem.value?.itemId !== undefined) {
    createMarkerWhenReady()
    updateMarkerList()
  }
})

// ==================== 依赖注入 ====================
provide(mapInjection, map)
provide(areaListInjection, areaList)
provide(itemListInjection, filteredItemList)
provide(itemTypeInjection, typeList)
provide(markerListInjection, markerList)
provide(iconMapInjection, iconMap)
provide(underGroundModeInjection, isUnderGround)
</script>

<template>
  <div class="genshin-map-container w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <ControlPanel
      v-model:area-code="areaCode"
      v-model:icon-name="mapStore.iconName"
      v-model:type="mapStore.typeId"
      v-model:step="mapStore.step"
      :marker-loading="markerLoading"
      :item-loading="itemLoading"
      class="custom-control-panel left-2 top-2 bottom-2 grid p-2 gap-2"
    />

    <AppUserAvatar map-mode class="custom-control-panel right-2 top-2" />

    <!-- 地下模式切换 -->
    <el-tooltip
      class="box-item"
      effect="dark"
      :content="`须弥地下模式 ${isUnderGround ? '关闭' : '开启'}`"
      placement="bottom"
    >
      <el-button
        v-if="isSumeru" size="large"
        class="underground-panel"
        :style="{ 'background-color': underGroundBtnColor, 'border-color': underGroundBtnColor }"
        circle
        @click="undergroundMode"
      >
        <svg t="1673867585560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="879" width="20" height="20"><path d="M512.219429 579.291429c17.133714 0 33.846857-5.577143 54.418285-17.572572l335.579429-194.56c34.285714-20.150857 48-36.022857 48-59.593143 0-23.131429-13.714286-39.003429-48-59.136L566.637714 53.869714c-20.571429-12.013714-37.284571-17.590857-54.418285-17.590857-17.572571 0-33.865143 5.577143-54.436572 17.572572L122.221714 248.411429c-34.285714 20.150857-48 36.022857-48 59.154285 0 23.588571 13.714286 39.442286 48 59.574857l335.561143 194.56c20.571429 12.013714 36.864 17.590857 54.436572 17.590858z m0-74.569143c-6.016 0-12.013714-2.157714-18.870858-6.016L166.784 311.862857c-1.718857-0.859429-2.998857-2.139429-2.998857-4.297143 0-1.700571 1.28-2.998857 2.998857-3.84l326.582857-186.88c6.838857-3.84 12.836571-5.979429 18.834286-5.979428 6.016 0 12.013714 2.139429 18.870857 5.997714l326.144 186.843429c2.139429 0.859429 3.437714 2.157714 3.437714 3.858285 0 2.139429-1.298286 3.437714-3.437714 4.297143L531.072 498.706286c-6.857143 3.858286-12.854857 6.016-18.852571 6.016z m0 285.842285c15.414857 0 28.708571-7.277714 46.701714-17.993142L927.085714 555.282286c16.274286-9.856 23.149714-23.990857 23.149715-37.284572 0-17.554286-12.854857-32.146286-24.429715-37.705143L528.493714 709.577143c-5.997714 3.419429-11.574857 5.997714-16.274285 5.997714-4.717714 0-10.294857-2.56-16.292572-5.997714L98.633143 480.274286c-11.995429 5.577143-24.850286 20.150857-24.850286 37.723428 0 13.293714 7.716571 27.867429 23.588572 37.302857L465.481143 772.571429c17.993143 10.715429 30.848 17.993143 46.72 17.993142z m0 197.156572c15.414857 0 28.708571-7.296 46.701714-18.011429L927.085714 752.420571c15.853714-8.996571 23.149714-23.990857 23.149715-37.284571 0-17.554286-12.854857-31.707429-24.429715-37.705143L528.493714 907.136c-5.997714 3.437714-11.574857 5.997714-16.274285 5.997714-4.717714 0-10.294857-2.56-16.292572-5.997714L98.633143 677.430857c-11.995429 5.997714-24.850286 20.132571-24.850286 37.705143 0 13.293714 7.716571 28.288 23.588572 37.302857L465.481143 969.691429c17.993143 10.715429 30.848 18.011429 46.72 18.011428z" p-id="880" fill="#ffffff" /></svg>
      </el-button>
    </el-tooltip>
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

.underground-panel {
  position: absolute;
  z-index: 1000;
  backdrop-filter: blur(56px);
  color: #fff;
  top: 0.5rem;
  right: 4.5rem;
  padding: 10px;
}
</style>
