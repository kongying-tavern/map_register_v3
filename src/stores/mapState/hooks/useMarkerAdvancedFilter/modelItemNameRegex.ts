import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFValueString,
} from '@/stores/types'

export class ItemNameRegex implements MAFConfig {
  id = 104
  name = '物品名称正则'
  option: MAFOptionInput = {
    placeholder: '',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(_val: MAFValueString): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
