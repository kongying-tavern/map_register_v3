import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionDummy,
  MAFValueDummy,
} from '@/stores/types'

export class ItemSize implements MAFConfig {
  id = 105
  name = '物品条数'
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
