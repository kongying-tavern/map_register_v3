import { keyBy } from 'lodash'
import { idRange } from './models'
import type { MAFConfig } from '@/stores/types'

// ==================== 模型配置 ====================
const markerAdvancedFilterConfigs: MAFConfig[] = [
  idRange,
]

const markerAdvancedFilterConfigMap: Record<number, MAFConfig> = keyBy(markerAdvancedFilterConfigs, 'id')

export const useMarkerAdvancedFilter = () => {
  const getMAFConfig = (id: number): MAFConfig => markerAdvancedFilterConfigMap[id] ?? {
    id: 0,
    name: '',
    option: {},
    defaultVal: {},
    semantic: () => '',
    filter: () => true,
  }

  return {
    markerAdvancedFilterConfigs,
    markerAdvancedFilterConfigMap,

    getMAFConfig,
  }
}
