import { useMarkerAdvancedFilter, useMarkerBasicFilter } from '.'
import { usePreferenceStore } from '@/stores'
import type { MAFGroup, MBFItem } from '@/stores/types'

export const useMarkerFilter = () => {
  const preferenceStore = usePreferenceStore()

  const markerFilterType = computed(() => {
    const type = preferenceStore.preference['markerFilter.setting.filterType']
    return ['basic', 'advanced'].includes(type) ? type : 'basic'
  })

  const markerFilters: ComputedRef<Map<string, MBFItem> | MAFGroup[]> = computed(() => {
    if (markerFilterType.value === 'advanced') {
      const { markerAdvancedFilters } = useMarkerAdvancedFilter()
      return markerAdvancedFilters.value
    }
    else {
      const { markerBasicFilters } = useMarkerBasicFilter()
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
