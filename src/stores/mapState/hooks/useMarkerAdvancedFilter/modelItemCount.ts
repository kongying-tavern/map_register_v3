import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionDummy,
  MAFValueDummy,
} from '@/stores/types'

export class ItemCount implements MAFConfig {
  id = 106
  name = '物品计数'
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
