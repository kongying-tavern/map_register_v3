interface ItemCountHookOptions {
  archivedMarkers: Ref<API.MarkerVo[]>
  markerList: Ref<API.MarkerVo[]>
}

export const useItemCount = (options: ItemCountHookOptions) => {
  const {
    archivedMarkers,
    markerList,
  } = options

  const calculateItemCount = (markers: API.MarkerVo[]) => markers.reduce((map, marker: API.MarkerVo) => {
    marker.itemList?.forEach(({ itemId, count = 0 }) => {
      map.set(itemId!, (map.get(itemId!) ?? 0) + count)
    })
    return map
  }, new Map<number, number>())

  const itemTotalMap = computed(() => calculateItemCount(markerList.value))

  const itemCountMap = computed(() => calculateItemCount(archivedMarkers.value))

  return {
    itemTotalMap,
    itemCountMap,
  }
}
