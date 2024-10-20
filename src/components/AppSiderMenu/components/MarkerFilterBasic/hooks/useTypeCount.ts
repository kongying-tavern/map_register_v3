interface TypeCountHookOptions {
  archivedMarkers: Ref<API.MarkerVo[]>
  visibleItemIds: Ref<Set<number>>
  markerList: Ref<API.MarkerVo[]>
  itemIdMap: Ref<Map<number, API.ItemVo>>
  itemTypeIdMap: Ref<Map<number, API.ItemTypeVo>>
}

export const useTypeCount = (options: TypeCountHookOptions) => {
  const {
    archivedMarkers,
    visibleItemIds,
    markerList,
    itemIdMap,
    itemTypeIdMap,
  } = options

  /**
   * @warning HACK 01
   * 2024-08-27 应用户 [鈴(QQ 717818652)] 要求，添加如下特殊逻辑：
   * 当【物品分类】为【宝箱品质】时，【选择全部】的点位计数不包含名为【其他】物品的点位计数
   */
  const calculateTypeCount = (markers: API.MarkerVo[]) => {
    return markers.reduce((map, marker) => {
      marker.itemList?.forEach(({ itemId, count = 0 }) => {
        if (!visibleItemIds.value.has(itemId!))
          return
        const item = itemIdMap.value.get(itemId!)
        if (!item)
          return
        item.typeIdList?.forEach((typeId) => {
          const itemType = itemTypeIdMap.value.get(typeId)
          // HACK 01
          if (!itemType || (itemType.name === '宝箱品质' && item.name === '其他'))
            return
          map.set(typeId, (map.get(typeId) ?? 0) + count)
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
