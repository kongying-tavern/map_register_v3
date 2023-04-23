import { useCondition, useMap } from '.'

/** 获取当前显示图层对应的点位列表 */
export const useCurrentLayerMarkers = () => {
  const { map } = useMap()

  const currentLayer = computed(() => map.value?.baseLayer)

  const conditionManager = useCondition()

  const markers = computed(() => {
    if (!currentLayer.value)
      return []
    return conditionManager.layerMarkerMap[currentLayer.value.rawProps.code] ?? []
  })

  return { markers }
}
