import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'
import { useAreaStore, useItemStore, useMarkerStore, usePreferenceStore, useTileStore } from '@/stores'

export const useMarkes = () => {
  const preferenceStore = usePreferenceStore()
  const markerStore = useMarkerStore()
  const tileStore = useTileStore()
  const areaStore = useAreaStore()
  const itemStore = useItemStore()

  /** 筛选处理状态 */
  const markersFilterLoading = ref(false)

  /** 当前基础筛选器（地区-类型-物品）条件表示下的所有点位 */
  const markersForBaseFilter = asyncComputed(async () => {
    const tileConfigs = tileStore.mergedTileConfigs
    const itemIds = new Set(preferenceStore.preference['markerFilter.state.itemIds'] ?? [])
    const areaIdMap = areaStore.areaIdMap
    const itemIdMap = itemStore.itemIdMap
    const res = markerStore.markerList.filter(({ itemList = [] }) => {
      for (const { itemId } of itemList) {
        if (itemIds.has(itemId!))
          return true
      }
      return false
    })
    return createRenderMarkers(res, { tileConfigs, areaIdMap, itemIdMap })
  }, [], { evaluating: markersFilterLoading })

  /** 将点位分配到对应的底图中 */
  const markersGroupByTile = computed(() => {
    const markers = markersForBaseFilter.value
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

  /** 所属于当前底图的点位 */
  const currentLayerMarkers = computed(() => {
    const { currentTileCode } = tileStore
    if (!currentTileCode)
      return []
    return markersGroupByTile.value[currentTileCode] ?? []
  })

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
    markersFilterLoading,
    markersGroupByTile,
    currentLayerMarkers,
    currentLayerMarkersIds,
    currentLayerMarkersMap,
  }
}
