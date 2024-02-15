import { useMarkerFilter as useMarkerFilterBasic } from '../../MarkerFilterBasic/hooks'
import { useMarkerFilter as useMarkerFilterAdvanced } from '../../MarkerFilterAdvanced/hooks'
import { usePreferenceStore } from '@/stores'
import type { MAFGroup, MBFItem } from '@/stores/types'

export const useMarkerFilter = () => {
  const preferenceStore = usePreferenceStore()

  const filterType = computed(() => {
    const type = preferenceStore.preference['markerFilter.setting.filterType']
    return ['basic', 'advanced'].includes(type) ? type : 'basic'
  })

  const conditions: ComputedRef<Map<string, MBFItem> | MAFGroup[]> = computed(() => {
    if (filterType.value === 'advanced') {
      const { conditions: conditionAdvanced } = useMarkerFilterAdvanced()
      return conditionAdvanced.value
    }
    else {
      const { conditions: conditionsBasic } = useMarkerFilterBasic()
      return conditionsBasic.value
    }
  })

  const conditionSize = computed(() => {
    switch (filterType.value) {
      case 'advanced':
        return (conditions.value as MAFGroup[]).length
      case 'basic':
      default:
        return (conditions.value as Map<string, MBFItem>).size
    }
  })

  return { filterType, conditions, conditionSize }
}
