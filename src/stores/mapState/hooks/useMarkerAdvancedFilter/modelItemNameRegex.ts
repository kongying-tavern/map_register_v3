import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionDummy,
  MAFValueDummy,
} from '@/stores/types'

export class ItemNameRegex implements MAFConfig {
  id = 104
  name = '物品名称正则'
  option: MAFOptionDummy = {}

  get defaultVal(): MAFValueDummy {
    return {}
  }

  prepare(_val: MAFValueDummy): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueDummy, _opt: MAFOptionDummy, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueDummy, _opt: MAFOptionDummy, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
