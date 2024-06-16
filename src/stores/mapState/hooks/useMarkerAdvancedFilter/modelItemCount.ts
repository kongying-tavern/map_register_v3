import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionRange,
  MAFOptionSwitch,
  MAFValueBoolean,
  MAFValueNumberRange,
} from '@/stores/types'

export class ItemCount implements MAFConfig {
  id = 106
  name = '物品计数'
  option: MAFOptionSwitch & MAFOptionRange = {
    textActive: '全部',
    textInactive: '任意',
    placeholderMin: '不限',
    placeholderMax: '不限',
  }

  get defaultVal(): MAFValueBoolean & MAFValueNumberRange {
    return {
      b: false,
      nMin: null,
      nMax: null,
    }
  }

  prepare(_val: MAFValueBoolean & MAFValueNumberRange): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueBoolean & MAFValueNumberRange, _opt: MAFOptionSwitch & MAFOptionRange, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueBoolean & MAFValueNumberRange, _opt: MAFOptionSwitch & MAFOptionRange, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
