import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFValueSwitch,
} from '@/stores/types'

export const image: MAFConfig = {
  id: 7,
  name: '点位图片',
  option: {
    textInactive: '不存在',
    textActive: '存在',
  },
  defaultVal: {
    v: false,
  },
  prepare: (_val: MAFValueSwitch): MAFMetaDummy => {
    return {}
  },
  semantic: () => '',
  filter: (val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean => {
    return val.v ? !!marker.picture : !marker.picture
  },
}
