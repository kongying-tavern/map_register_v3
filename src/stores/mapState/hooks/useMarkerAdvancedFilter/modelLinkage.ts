import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFValueSwitch,
} from '@/stores/types'

export class Linkage implements MAFConfig {
  id = 9
  name = '点位关联'
  option: MAFOptionSwitch = {
    textInactive: '不存在',
    textActive: '存在',
  }

  get defaultVal(): MAFValueSwitch {
    return {
      b: true,
    }
  }

  prepare(_val: MAFValueSwitch): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, opposite: boolean): string {
    return `${opposite === !!val.b ? '不' : ''}存在点位关联`
  }

  filter(val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    return val.b ? !!marker.linkageId : !marker.linkageId
  }
}
