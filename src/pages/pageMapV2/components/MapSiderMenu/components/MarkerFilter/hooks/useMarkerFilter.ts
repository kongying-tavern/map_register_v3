import { useMarkerFilterAdvanced, useMarkerFilterBasic } from '.'
import { usePreferenceStore } from '@/stores'
import type { ConditionAdvanced, ConditionBasic } from '@/stores/types/userPreference'

export const useMarkerFilter = () => {
  const preferenceStore = usePreferenceStore()

  const filterType = computed(() => {
    const type = preferenceStore.preference['markerFilter.setting.filterType']
    if (['basic', 'advanced'].includes(type))
      return type

    return 'basic'
  })

  const conditions: ComputedRef<Map<string, ConditionBasic> | ConditionAdvanced[]> = computed(() => {
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
        return (conditions.value as ConditionAdvanced[]).length
      case 'basic':
      default:
        return (conditions.value as Map<string, ConditionBasic>).size
    }
  })

  return { filterType, conditions, conditionSize }
}
