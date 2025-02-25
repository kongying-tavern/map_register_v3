import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFSemanticUnit,
  MAFValueString,
} from '@/stores/types'

export class TitleContain implements MAFConfig<MAFValueString, MAFOptionInput, MAFMetaDummy> {
  id = 2
  name = '标题包含'
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
    return [
      { type: 'text', text: '标题' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '包含' },
      { type: 'highlight', text: val.s },
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    if (!val.s)
      return false
    return (marker.markerTitle ?? '').includes(val.s)
  }
}
