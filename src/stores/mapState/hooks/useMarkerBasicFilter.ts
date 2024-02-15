import { storeToRefs } from 'pinia'
import type { useAreaStore, useItemStore, useItemTypeStore, usePreferenceStore } from '@/stores'
import type { MBFItem } from '@/stores/types'

interface MarkerBasicFilterHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
  areaStore: ReturnType<typeof useAreaStore>
  itemTypeStore: ReturnType<typeof useItemTypeStore>
  itemStore: ReturnType<typeof useItemStore>
}

export const useMarkerBasicFilter = (options: MarkerBasicFilterHookOptions) => {
  const {
    preferenceStore,
    areaStore,
    itemTypeStore,
    itemStore,
  } = options

  const { preference } = storeToRefs(preferenceStore)
  const { areaIdMap } = storeToRefs(areaStore)
  const { itemTypeIdMap } = storeToRefs(itemTypeStore)
  const { itemIdMap } = storeToRefs(itemStore)

  const conditions = computed(() => {
    const itemMap = itemIdMap.value
    const areaMap = areaIdMap.value
    const typeMap = itemTypeIdMap.value

    const map = new Map<string, MBFItem>()
    preference.value['markerFilter.state.itemIds']?.forEach((itemId) => {
      const item = itemMap.get(itemId)
      if (!item)
        return
      const area = areaMap.get(item.areaId!)
      if (!area)
        return
      item.typeIdList?.forEach((itemTypeId) => {
        const type = typeMap.get(itemTypeId!)
        if (!type)
          return
        const id = `${area.code!}-${itemTypeId}`
        const existCondition = map.get(id)
        if (!existCondition) {
          map.set(id, {
            area,
            type,
            items: [itemId],
          })
          return
        }
        existCondition.items.push(itemId)
      })
    })

    return map
  })

  return {
    markerBasicFilters: conditions,
  }
}
