import { keyBy } from 'lodash'
import { idRange } from './models'
import type { MAFConfig } from '@/stores/types'

const conditionModels: MAFConfig[] = [
  idRange,
]

const conditionModelMap: Record<number, MAFConfig> = keyBy(conditionModels, 'id')

export const useMarkerAdvancedFilterCondition = () => {
  return {
    conditionList: conditionModels,
    conditionMap: conditionModelMap,
  }
}

export const useMarkerAdvancedFilterModel = (id: number): MAFConfig => conditionModelMap[id] ?? {
  id: 0,
  name: '',
  icon: null,
  template: null,
  option: {},
  defaultVal: {},
  semantic: () => '',
  filter: () => true,
}
