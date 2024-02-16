import { useMarkerAdvancedFilter, useMarkerFilter } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'
import type {
  useAreaStore,
  useItemStore,
  useItemTypeStore,
  useMarkerStore,
  usePreferenceStore,
  useTileStore,
} from '@/stores'
import type { MAFMeta } from '@/stores/types'

interface MarkerHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
  markerStore: ReturnType<typeof useMarkerStore>
  tileStore: ReturnType<typeof useTileStore>
  areaStore: ReturnType<typeof useAreaStore>
  itemTypeStore: ReturnType<typeof useItemTypeStore>
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

  const areaIdMap = areaStore.areaIdMap
  const itemIdMap = itemStore.itemIdMap
  const { markerFilterType } = useMarkerFilter(options)
  const { getMAFConfig } = useMarkerAdvancedFilter(options)

  /** 筛选处理状态 */
  const markersFilterLoading = ref(false)

  /** 当前基础筛选器（地区-类型-物品）条件表示下的所有点位 */
  const markersForBasicFilter = asyncComputed(async () => {
    const tileConfigs = tileStore.mergedTileConfigs
    if (!tileConfigs)
      return []

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

    const advancedFilters = preferenceStore.preference['markerFilter.filter.advancedFilter'] ?? []

    /** 合并计算布尔值，支持 null 值 */
    const operateBool = (v1: boolean | null, v2: boolean | null, op: boolean): boolean | null => {
      if (v1 === null)
        return v2
      else if (v2 === null)
        return v1
      else
        return op ? (v1 && v2) : (v1 || v2)
    }
    /** 判断是否可以进行逻辑截断，可逻辑截断时返回 true */
    const breakBool = (v: boolean | null, op: boolean): boolean => (v === true && !op) || (v === false && op)

    const metaCache = new Map<string, MAFMeta>()
    const res = markerStore.markerList.filter((marker: API.MarkerVo) => {
      let globalVal: boolean | null = null
      for (let groupIndex = 0; groupIndex < advancedFilters.length; groupIndex++) {
        const group = advancedFilters[groupIndex]
        if (breakBool(globalVal, group.operator))
          break

        let groupVal: boolean | null = null
        for (let itemIndex = 0; itemIndex < group.children.length; itemIndex++) {
          const item = group.children[itemIndex]
          if (breakBool(groupVal, item.operator))
            break

          const filterConfig = getMAFConfig(item.id)
          const {
            prepare: filterPrepare,
            option: filterOption,
            filter: filterAction,
          } = filterConfig
          const itemMetaKey: string = `${groupIndex}-${itemIndex}`
          let itemMeta: MAFMeta | undefined = metaCache.get(itemMetaKey)
          if (!itemMeta) {
            itemMeta = filterPrepare(item.value)
            metaCache.set(itemMetaKey, itemMeta)
          }
          let itemVal: boolean = filterAction(item.value, filterOption, itemMeta, marker)
          if (item.opposite)
            itemVal = !itemVal
          groupVal = operateBool(groupVal, itemVal, item.operator)
        }

        if (group.opposite)
          groupVal = !groupVal
        globalVal = operateBool(globalVal, groupVal, group.operator)
      }

      return globalVal
    })
    return createRenderMarkers(res, { tileConfigs, areaIdMap, itemIdMap })
  }, [], { evaluating: markersFilterLoading })

  /** 当前混合选择器 */
  const markersForFilter = computed(() => {
    switch (markerFilterType.value) {
      case 'advanced':
        return markersForAdvancedFilter.value
      case 'basic':
      default:
        return markersForBasicFilter.value
    }
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
