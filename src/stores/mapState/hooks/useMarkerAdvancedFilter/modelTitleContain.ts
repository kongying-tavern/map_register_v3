import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
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

  prepare(_val: MAFValueString): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, opposite: boolean): string {
    if (!val.s)
      return ''
    return `标题${opposite ? '不' : ''}包含【${val.s ?? ''}】`
  }

  filter(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    if (!val.s)
      return false
    return (marker.markerTitle ?? '').includes(val.s)
  }
}
