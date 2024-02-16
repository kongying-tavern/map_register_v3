import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionInput,
  MAFValueInput,
} from '@/stores/types'

export const contentContain: MAFConfig = {
  id: 3,
  name: '内容包含',
  option: {
    placeholder: '',
  },
  defaultVal: {
    v: '',
  },
  prepare: (_val: MAFValueInput): MAFMetaDummy => {
    return {}
  },
  semantic: () => '',
  filter: (val: MAFValueInput, _opt: MAFOptionInput, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean => {
    if (!val.v)
      return false
    return (marker.content ?? '').includes(val.v)
  },
}
