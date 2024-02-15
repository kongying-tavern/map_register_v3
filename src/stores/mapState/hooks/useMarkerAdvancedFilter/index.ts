import { keyBy } from 'lodash'
import { storeToRefs } from 'pinia'
import { idRange } from './models'
import { usePreferenceStore } from '@/stores'
import type { MAFConfig } from '@/stores/types'

// ==================== 模型配置 ====================
const markerAdvancedFilterConfigs: MAFConfig[] = [
  idRange,
]

const markerAdvancedFilterConfigMap: Record<number, MAFConfig> = keyBy(markerAdvancedFilterConfigs, 'id')

export const useMarkerAdvancedFilter = () => {
  const { preference } = storeToRefs(usePreferenceStore())

  const conditions = computed(() => preference.value['markerFilter.filter.advancedFilter'])

  const getMAFConfig = (id: number): MAFConfig => markerAdvancedFilterConfigMap[id] ?? {
    id: 0,
    name: '',
    option: {},
    defaultVal: {},
    semantic: () => '',
    filter: () => true,
  }

  return {
    markerAdvancedFilters: conditions,

    markerAdvancedFilterConfigs,
    markerAdvancedFilterConfigMap,

    getMAFConfig,
  }
}
