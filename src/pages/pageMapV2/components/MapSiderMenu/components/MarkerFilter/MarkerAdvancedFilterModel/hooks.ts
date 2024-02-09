import { keyBy } from 'lodash'
import { idRange } from './models'
import type { ConditionAdvancedModel } from './types'

const conditionModels: ConditionAdvancedModel[] = [
  idRange,
]

const conditionModelMap: Record<number, ConditionAdvancedModel> = keyBy(conditionModels, 'id')

export const useMarkerAdvancedFilterCondition = () => {
  return {
    conditionList: conditionModels,
    conditionMap: conditionModelMap,
  }
}

export const useMarkerAdvancedFilterModel = (id: number): ConditionAdvancedModel => conditionModelMap[id] ?? {
  id: 0,
  name: '',
  icon: null,
  template: null,
  option: {},
  defaultVal: {},
  semantic: () => '',
  filter: () => true,
}
