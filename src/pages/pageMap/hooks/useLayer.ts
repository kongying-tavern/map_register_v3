import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import type { MapNameEnum } from '../configs'
import { mapTiles } from '../configs'
import type { GenshinMap } from '../utils'
import { GenshinTileLayer, TileUtil } from '../utils'
import { useMapStore } from '@/stores'

export const useLayer = (mapRef: Ref<GenshinMap | null>) => {
  const mapStore = useMapStore()

  const layers = computed(() => {
    const tileLayerObj: Record<string, GenshinTileLayer> = {}
    for (const name in mapTiles) {
      const config = mapTiles[name as MapNameEnum]
      if (!config.code)
        continue
      tileLayerObj[name] = GenshinTileLayer.getLayer(name as MapNameEnum)
    }
    return tileLayerObj
  })

  const activeLayer = ref<GenshinTileLayer | null>(null) as Ref<GenshinTileLayer | null>

  const layerConfig = computed(() => {
    if (!activeLayer.value)
      return
    return cloneDeep(TileUtil.getConfig(activeLayer.value.name as MapNameEnum))
  })

  const selectLayer = (name: string) => {
    const layer = layers.value[name]
    if (!mapRef.value) {
      ElMessage.error('无法获取地图实例')
      return
    }
    if (!layer) {
      ElMessage.error('选择的图层不存在')
      return
    }
    if (activeLayer.value?.name === name)
      return
    mapRef.value.eachLayer(l => mapRef.value?.removeLayer(l))
    layer.addTo(mapRef.value)
    mapRef.value.configBaseLayer(layer)
    activeLayer.value = layer
    mapRef.value.fireEvent('baselayerchange', { layerConfig })
  }

  const activeName = computed({
    get: () => activeLayer.value?.name,
    set: (name) => {
      if (!name)
        return
      selectLayer(name)
    },
  })

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

  return { layers, activeLayer, activeName, layerConfig, selectLayer, setMapNameByAreaCode }
}
