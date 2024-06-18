import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFSemanticUnit,
  MAFValueString,
} from '@/stores/types'

export class ContentContain implements MAFConfig {
  id = 3
  name = '内容包含'
  option: MAFOptionInput = {
    placeholder: '',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(_val: MAFValueString, _opt: MAFOptionInput): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, opposite: boolean): MAFSemanticUnit[] {
    return `内容${opposite ? '不' : ''}包含【${val.s ?? ''}】`
  }

  filter(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    if (!val.s)
      return false
    return (marker.content ?? '').includes(val.s)
  }
}
