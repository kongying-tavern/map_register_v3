interface TypeCountHookOptions {
  archivedMarkers: Ref<API.MarkerVo[]>
  itemIdMap: Ref<Map<number, API.ItemVo>>
  markerList: Ref<API.MarkerVo[]>
  visibleItemIds: Ref<Set<number>>
}

export const useTypeCount = (options: TypeCountHookOptions) => {
  const {
    archivedMarkers,
    itemIdMap,
    markerList,
    visibleItemIds,
  } = options

  const calculateTypeCount = (markers: API.MarkerVo[]) => {
    return markers.reduce((map, marker) => {
      marker.itemList?.forEach(({ itemId }) => {
        if (!visibleItemIds.value.has(itemId!))
          return
        const item = itemIdMap.value.get(itemId!)
        if (!item)
          return
        item.typeIdList?.forEach((typeId) => {
          map.set(typeId, (map.get(typeId) ?? 0) + 1)
        })
      })
      return map
    }, new Map<number, number>())
  }

  const typeTotalMap = computed(() => calculateTypeCount(markerList.value))

  const typeCountMap = computed(() => calculateTypeCount(archivedMarkers.value))

  return {
    typeTotalMap,
    typeCountMap,
  }
}
