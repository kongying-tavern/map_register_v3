import { useMarkerAdvancedFilter, useMarkerBasicFilter } from '.'
import type { useAreaStore, useItemStore, useItemTypeStore, usePreferenceStore } from '@/stores'
import type { MAFGroup, MBFItem } from '@/stores/types'

interface MarkerFilterHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
  areaStore: ReturnType<typeof useAreaStore>
  itemTypeStore: ReturnType<typeof useItemTypeStore>
  itemStore: ReturnType<typeof useItemStore>
}

export const useMarkerFilter = (options: MarkerFilterHookOptions) => {
  const { preferenceStore } = options

  const { markerBasicFilters } = useMarkerBasicFilter(options)
  const { markerAdvancedFilters } = useMarkerAdvancedFilter(options)

  const markerFilterType = computed(() => {
    const type = preferenceStore.preference['markerFilter.setting.filterType']
    return ['basic', 'advanced'].includes(type) ? type : 'basic'
  })

  const markerFilters: ComputedRef<Map<string, MBFItem> | MAFGroup[]> = computed(() => {
    switch (markerFilterType.value) {
      case 'advanced':
        return markerAdvancedFilters.value
      case 'basic':
      default:
        return markerBasicFilters.value
    }
  })

  const markerFilterSize = computed(() => {
    switch (markerFilterType.value) {
      case 'advanced':
        return (markerFilters.value as MAFGroup[]).length
      case 'basic':
      default:
        return (markerFilters.value as Map<string, MBFItem>).size
    }
  })

  return {
    markerFilterType,
    markerFilters,
    markerFilterSize,
  }
}
