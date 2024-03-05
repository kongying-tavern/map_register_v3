import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFValueInput,
} from '@/stores/types'

export class TitleContain implements MAFConfig {
  id = 2
  name = '标题包含'
  option: MAFOptionInput = {
    placeholder: '',
  }

  get defaultVal(): MAFValueInput {
    return {
      v: '',
    }
  }

  prepare(_val: MAFValueInput): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueInput, _opt: MAFOptionInput, _meta: MAFMetaDummy, opposite: boolean): string {
    if (!val.v)
      return ''
    return `标题${opposite ? '不' : ''}包含【${val.v ?? ''}】`
  }

  filter(val: MAFValueInput, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    if (!val.v)
      return false
    return (marker.markerTitle ?? '').includes(val.v)
  }
}
