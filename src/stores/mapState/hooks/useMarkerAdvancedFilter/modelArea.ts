import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSelect,
  MAFValueDummy,
} from '@/stores/types'

export class Area implements MAFConfig {
  id = 101
  name = '地区'
  option: MAFOptionSelect<unknown> = {
    options: [],
    optionLabel: 'label',
    optionValue: 'value',
  }

  get defaultVal(): MAFValueDummy {
    return {}
  }

  prepare(_val: MAFValueDummy): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueDummy, _opt: MAFOptionSelect, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueDummy, _opt: MAFOptionSelect, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
