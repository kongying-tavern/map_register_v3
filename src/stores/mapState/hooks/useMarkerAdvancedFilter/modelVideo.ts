import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFValueSwitch,
} from '@/stores/types'

export const video: MAFConfig = {
  id: 8,
  name: '点位视频',
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
  semantic: (val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, opposite: boolean): string => {
    return `${opposite === !!val.v ? '不' : ''}包含视频`
  },
  filter: (val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean => {
    return val.v ? !!marker.videoPath : !marker.videoPath
  },
}
