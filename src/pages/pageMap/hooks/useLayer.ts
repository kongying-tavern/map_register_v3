import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { MapNameEnum } from '../configs'
import { mapTiles } from '../configs'
import type { GenshinMap } from '../utils'
import { GenshinTileLayer } from '../utils'

export const useLayer = (mapRef: Ref<GenshinMap | null>) => {
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

  const layerOptions = computed(() => Object.keys(layers.value).map(name => ({
    label: name,
    value: name,
  })))

  const activeLayer = ref<GenshinTileLayer | null>(null) as Ref<GenshinTileLayer | null>

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
    mapRef.value.addBaseLayer(layer)
    activeLayer.value = layer
  }

  const activeName = computed({
    get: () => activeLayer.value?.name,
    set: (name) => {
      if (!name)
        return
      selectLayer(name)
    },
  })

  return { layers, activeLayer, activeName, layerOptions, selectLayer }
}
