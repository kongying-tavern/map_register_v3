import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFSemanticUnit,
  MAFValueString,
} from '@/stores/types'
import { MAF_MODEL_NAME_MAP, MAFModelId } from '@/shared'

export class ContentContain implements MAFConfig<MAFValueString, MAFOptionInput, MAFMetaDummy> {
  id = MAFModelId.CONTENT_CONTAIN
  name = MAF_MODEL_NAME_MAP[MAFModelId.CONTENT_CONTAIN]
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
      { type: 'text', text: '内容' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '包含' },
      { type: 'highlight', text: val.s },
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    if (!val.s)
      return false
    return (marker.content ?? '').includes(val.s)
  }
}
