import { useMarkerFilterBasic } from '.'
import { usePreferenceStore } from '@/stores'
import type { Condition } from '@/stores/types/userPreference'

export const useMarkerFilter = () => {
  const preferenceStore = usePreferenceStore()

  const filterType = computed(() => {
    const type = preferenceStore.preference['markerFilter.setting.filterType']
    if (['basic', 'advanced'].includes(type))
      return type

    return 'basic'
  })

  const conditions: ComputedRef<Map<string, Condition> | never[]> = computed(() => {
    if (filterType.value === 'advanced') {
      // TODO 添加高级过滤器筛选条件
      return []
    }
    else {
      const { conditions: conditionsBasic } = useMarkerFilterBasic()
      return conditionsBasic.value
    }
  })

  const conditionSize = computed(() => {
    switch (filterType.value) {
      case 'advanced':
        // TODO 添加高级过滤器筛选条件计数
        return (conditions.value as never[]).length
      case 'basic':
      default:
        return (conditions.value as Map<string, Condition>).size
    }
  })

  return { conditions, conditionSize }
}
