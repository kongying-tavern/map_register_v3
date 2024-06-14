import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionRange,
  MAFValueNumberRange,
} from '@/stores/types'

export class ItemSize implements MAFConfig {
  id = 105
  name = '物品条数'
  option: MAFOptionRange = {
    placeholderMin: '不限',
    placeholderMax: '不限',
  }

  get defaultVal(): MAFValueNumberRange {
    return {
      nMin: null,
      nMax: null,
    }
  }

  prepare(_val: MAFValueNumberRange): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueNumberRange, _opt: MAFOptionRange, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueNumberRange, _opt: MAFOptionRange, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
