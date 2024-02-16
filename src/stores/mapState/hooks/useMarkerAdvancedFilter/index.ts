import { keyBy } from 'lodash'
import {
  contentContain,
  idRange,
  titleContain,
} from './models'
import type { usePreferenceStore } from '@/stores'
import type { MAFConfig } from '@/stores/types'

interface MarkerAdvancedFilterHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
}

// ==================== 模型配置 ====================
const markerAdvancedFilterConfigs: MAFConfig[] = [
  idRange,
  titleContain,
  contentContain,
]

const markerAdvancedFilterConfigMap: Record<number, MAFConfig> = keyBy(markerAdvancedFilterConfigs, 'id')

export const useMarkerAdvancedFilter = (options: MarkerAdvancedFilterHookOptions) => {
  const { preferenceStore } = options

  const conditions = computed(() => preferenceStore.preference['markerFilter.filter.advancedFilter'])

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
