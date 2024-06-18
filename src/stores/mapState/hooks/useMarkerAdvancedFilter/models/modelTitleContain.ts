import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFSemanticUnit,
  MAFValueString,
} from '@/stores/types'

export class TitleContain implements MAFConfig {
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

  semantic(_val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, _opposite: boolean): MAFSemanticUnit[] {
    return []
  }

  filter(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    if (!val.s)
      return false
    return (marker.markerTitle ?? '').includes(val.s)
  }
}