import { keyBy } from 'lodash'
import {
  ContentContain,
  ContentRegex,
  IdRange,
  Image,
  TitleContain,
  Underground,
  Video,
} from './models'
import type { usePreferenceStore } from '@/stores'
import type { MAFConfig } from '@/stores/types'

interface MarkerAdvancedFilterHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
}

// ==================== 模型配置 ====================
const markerAdvancedFilterConfigs: MAFConfig[] = [
  new IdRange(),
  new TitleContain(),
  new ContentContain(),
  new ContentRegex(),
  new Underground(),
  new Image(),
  new Video(),
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
