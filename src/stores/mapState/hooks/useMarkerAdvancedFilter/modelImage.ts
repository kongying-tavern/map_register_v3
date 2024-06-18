import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFValueBoolean,
} from '@/stores/types'

export class Image implements MAFConfig {
  id = 7
  name = '点位图片'
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

  semantic(val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, opposite: boolean): string {
    return `${opposite === !!val.b ? '不' : ''}包含图片`
  }

  filter(val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    return val.b ? !!marker.picture : !marker.picture
  }
}
