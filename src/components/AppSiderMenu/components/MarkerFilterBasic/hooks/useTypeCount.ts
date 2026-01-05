import type * as API2 from '@/api/alova/globals'

interface TypeCountHookOptions {
  archivedMarkers: Ref<API2.MarkerVo[]>
  visibleItemIds: Ref<Set<number>>
  markerList: Ref<API2.MarkerVo[]>
  itemIdMap: Ref<Map<number, API2.ItemVo>>
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
   * @warning HACK 02
   * 2025-08-28 应用户 [鈴(QQ 717818652)] 要求，添加如下特殊逻辑：
   * 当【物品分类】为【宝箱品质】时，【选择全部】的点位计数不包含名为【宝箱相关】物品的点位计数
   */
  const calculateTypeCount = (markers: API2.MarkerVo[]) => {
    return markers.reduce((map, marker) => {
      marker.itemList?.forEach(({ itemId, count = 0 }) => {
        if (!visibleItemIds.value.has(itemId!))
          return
        const item = itemIdMap.value.get(itemId!)
        if (!item)
          return
        item.typeIdList?.forEach((typeId) => {
          const itemType = itemTypeIdMap.value.get(typeId)
          if (!itemType)
            return
          // HACK 01, 02
          if (itemType.name !== '宝箱品质' || !['其他', '宝箱相关'].includes(item.name ?? ''))
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
