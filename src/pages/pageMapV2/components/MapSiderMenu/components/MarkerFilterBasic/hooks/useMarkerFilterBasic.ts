import { storeToRefs } from 'pinia'
import { useAreaStore, useItemStore, useItemTypeStore, usePreferenceStore } from '@/stores'
import type { MBFItem } from '@/stores/types'

export const useMarkerFilterBasic = () => {
  const { preference } = storeToRefs(usePreferenceStore())
  const { itemIdMap } = storeToRefs(useItemStore())
  const { areaIdMap } = storeToRefs(useAreaStore())
  const { itemTypeIdMap } = storeToRefs(useItemTypeStore())

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

  const reviewCondition = (id: string) => {
    const condition = conditions.value.get(id)
    if (!condition)
      return
    const { area, type } = condition
    preference.value['markerFilter.state.areaCode'] = area.code!
    preference.value['markerFilter.state.itemTypeId'] = type.id!
    preference.value['markerFilter.state.step'] = 2
  }

  const deleteCondition = (id: string) => {
    const condition = conditions.value.get(id)
    if (!condition)
      return
    const existItemIds = new Set(preference.value['markerFilter.state.itemIds'])
    const { items } = condition
    items.forEach(itemId => existItemIds.delete(itemId))
    preference.value['markerFilter.state.itemIds'] = [...existItemIds]
  }

  const clearCondition = () => {
    preference.value['markerFilter.state.itemIds'] = []
  }

  return {
    conditions,

    reviewCondition,
    deleteCondition,
    clearCondition,
  }
}
