import { storeToRefs } from 'pinia'
import { useMapStateStore, usePreferenceStore } from '@/stores'

export const useMarkerFilter = () => {
  const { preference } = storeToRefs(usePreferenceStore())
  const { markerBasicFilters } = storeToRefs(useMapStateStore())

  const reviewCondition = (id: string) => {
    const condition = markerBasicFilters.value.get(id)
    if (!condition)
      return
    const { area, type } = condition
    preference.value['markerFilter.state.areaCode'] = area.code!
    preference.value['markerFilter.state.itemTypeId'] = type.id!
    preference.value['markerFilter.state.step'] = 2
  }

  const deleteCondition = (id: string) => {
    const condition = markerBasicFilters.value.get(id)
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
    reviewCondition,
    deleteCondition,
    clearCondition,
  }
}
