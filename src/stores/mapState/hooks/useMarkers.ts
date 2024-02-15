import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'
import type { useAreaStore, useItemStore, useMarkerStore, usePreferenceStore, useTileStore } from '@/stores'

interface MarkerHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
  markerStore: ReturnType<typeof useMarkerStore>
  tileStore: ReturnType<typeof useTileStore>
  areaStore: ReturnType<typeof useAreaStore>
  itemStore: ReturnType<typeof useItemStore>
}

export const useMarkers = (options: MarkerHookOptions) => {
  const {
    preferenceStore,
    markerStore,
    tileStore,
    areaStore,
    itemStore,
  } = options

  /** 筛选处理状态 */
  const markersFilterLoading = ref(false)

  /** 当前基础筛选器（地区-类型-物品）条件表示下的所有点位 */
  const markersForBaseFilter = asyncComputed(async () => {
    const tileConfigs = tileStore.mergedTileConfigs
    if (!tileConfigs)
      return []
    const areaIdMap = areaStore.areaIdMap
    const itemIdMap = itemStore.itemIdMap
    const itemIds = new Set(preferenceStore.preference['markerFilter.state.itemIds'] ?? [])
    const res = markerStore.markerList.filter(({ itemList = [] }) => {
      for (const { itemId } of itemList) {
        if (itemIds.has(itemId!))
          return true
      }
      return false
    })
    return createRenderMarkers(res, { tileConfigs, areaIdMap, itemIdMap })
  }, [], { evaluating: markersFilterLoading })

  /** 当前高级筛选器条件表示下的所有点位 */
  const markersForAdvancedFilter = asyncComputed(async () => {
    const tileConfigs = tileStore.mergedTileConfigs
    if (!tileConfigs)
      return []
    const areaIdMap = areaStore.areaIdMap
    const itemIdMap = itemStore.itemIdMap
    const res = markerStore.markerList.filter(() => {
      return true
    })
    return createRenderMarkers(res, { tileConfigs, areaIdMap, itemIdMap })
  }, [], { evaluating: markersFilterLoading })

  /** 当前混合选择器 */
  const markersForFilter = computed(() => {
    const filterType = preferenceStore.preference['markerFilter.setting.filterType'] ?? 'basic'
    if (filterType === 'advanced')
      return markersForAdvancedFilter.value
    else
      return markersForBaseFilter.value
  })

  /** 将点位分配到对应的底图中 */
  const markersGroupByTile = computed(() => {
    const markers = markersForFilter.value
    const map: Record<string, GSMapState.MarkerWithRenderConfig[]> = {}
    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i]
      if (!map[marker.render.tileCode]) {
        map[marker.render.tileCode] = [marker]
        continue
      }
      map[marker.render.tileCode].push(marker)
    }
    return map
  })

  // ==================== 临时点位 - start ====================

  const staticMarkers = computed(() => {
    const { currentTileCode } = tileStore
    if (!currentTileCode)
      return []
    return markersGroupByTile.value[currentTileCode] ?? []
  })

  const staticMarkerIds = computed(() => new Set(staticMarkers.value.map(marker => marker.id!)))

  /** 临时点位集合 */
  const tempMarkerMap = shallowRef(new Map<string, (API.MarkerVo | GSMapState.MarkerWithRenderConfig)[]>())

  /** 未去重的临时点位 */
  const undifferentiated = computed(() => {
    const markers: (API.MarkerVo | GSMapState.MarkerWithRenderConfig)[] = []
    tempMarkerMap.value.forEach((typeMarkers) => {
      markers.push(...typeMarkers)
    })
    return markers
  })

  /** 已去重并经过预渲染处理的临时点位 */
  const tempMarkers = computed(() => {
    const tileConfigs = tileStore.mergedTileConfigs
    if (!tileConfigs)
      return []
    const ids = new Set(staticMarkerIds.value)
    const differentiated = undifferentiated.value.filter((marker) => {
      if (ids.has(marker.id!))
        return false
      ids.add(marker.id!)
      return true
    })
    // 去重
    const { areaIdMap } = areaStore
    const { itemIdMap } = itemStore
    return createRenderMarkers(differentiated, {
      tileConfigs,
      areaIdMap,
      itemIdMap,
      isTemporary: true,
    })
  })

  const setTempMarkers = <K extends keyof GSMapState.TempMarkerTypeMap>(type: GSMapState.TempMarkerType, markers: GSMapState.TempMarkerTypeMap[K]) => {
    const map = new Map(tempMarkerMap.value)
    map.set(type, markers)
    tempMarkerMap.value = map
  }

  const setTempMarkersBy = <K extends keyof GSMapState.TempMarkerTypeMap>(type: K, cb: (oldMarkers: GSMapState.TempMarkerTypeMap[K], setter: (value: GSMapState.TempMarkerTypeMap[K]) => void) => void) => {
    cb((tempMarkerMap.value.get(type) ?? []) as GSMapState.TempMarkerTypeMap[K], (value) => {
      setTempMarkers(type, value)
    })
  }

  const clearTempMarkes = () => {
    tempMarkerMap.value = new Map()
  }

  // ====================  临时点位 - end  ====================

  /** 所属于当前底图的点位 */
  const currentLayerMarkers = computed(() => staticMarkers.value.concat(tempMarkers.value))

  const currentLayerMarkersIds = computed(() => {
    return currentLayerMarkers.value.map(marker => marker.id!)
  })

  const currentLayerMarkersMap = computed(() => {
    const markers = currentLayerMarkers.value
    const map: Record<number, GSMapState.MarkerWithRenderConfig> = {}
    markers.forEach((marker) => {
      map[marker.id!] = marker
    })
    return map
  })

  return {
    setTempMarkers,
    setTempMarkersBy,
    clearTempMarkes,
    markersFilterLoading,
    markersGroupByTile,
    currentLayerMarkers,
    currentLayerMarkersIds,
    currentLayerMarkersMap,
    staticMarkers,
    staticMarkerIds,
    tempMarkers,
  }
}
