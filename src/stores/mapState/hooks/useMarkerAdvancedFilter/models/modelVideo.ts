import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFSemanticUnit,
  MAFValueBoolean,
} from '@/stores/types'

export class Video implements MAFConfig {
  id = 8
  name = '点位视频'
  option: MAFOptionSwitch = {
    textInactive: '不存在',
    textActive: '存在',
  }

  get defaultVal(): MAFValueBoolean {
    return {
      b: false,
    }
  }

  prepare(_val: MAFValueBoolean, _opt: MAFOptionSwitch): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, _opposite: boolean): MAFSemanticUnit[] {
    return []
  }

  filter(val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    return val.b ? !!marker.videoPath : !marker.videoPath
  }
}
