import type * as API2 from '@/api/alova/globals'

interface ItemCountHookOptions {
  archivedMarkers: Ref<API2.MarkerVo[]>
  markerList: Ref<API2.MarkerVo[]>
}

export const useItemCount = (options: ItemCountHookOptions) => {
  const {
    archivedMarkers,
    markerList,
  } = options

  const calculateItemCount = (markers: API2.MarkerVo[]) => markers.reduce((map, marker: API2.MarkerVo) => {
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
