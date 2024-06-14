import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFValueString,
} from '@/stores/types'

export class ItemName implements MAFConfig {
  id = 103
  name = '物品名称'
  option: MAFOptionInput = {
    placeholder: '格式：A,B,C',
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
