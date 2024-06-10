import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionDummy,
  MAFValueNumberArray,
} from '@/stores/types'

export class Visibility implements MAFConfig {
  id = 11
  name = '可见范围'
  option: MAFOptionDummy = {}

  get defaultVal(): MAFValueNumberArray {
    return {
      na: [],
    }
  }

  prepare(_val: MAFValueNumberArray): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueNumberArray, _opt: MAFOptionDummy, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueNumberArray, _opt: MAFOptionDummy, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
