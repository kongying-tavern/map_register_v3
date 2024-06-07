import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionDummy,
  MAFOptionSwitch,
  MAFValueBoolean,
  MAFValueNumberRange,
} from '@/stores/types'

export class RefreshTime implements MAFConfig {
  id = 10
  name = '刷新时间'
  option: MAFOptionDummy = {}

  get defaultVal(): MAFValueNumberRange {
    return {
      nMin: null,
      nMax: null,
    }
  }

  prepare(_val: MAFValueBoolean): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
