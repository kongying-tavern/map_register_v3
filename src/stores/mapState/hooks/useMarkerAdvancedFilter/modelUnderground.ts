import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFValueSwitch,
} from '@/stores/types'

interface ExtraUnderground {
  is_underground?: boolean
}

export class Underground implements MAFConfig {
  id = 5
  name = '点位地下'
  option: MAFOptionSwitch = {
    textInactive: '地上',
    textActive: '地下',
  }

  get defaultVal(): MAFValueSwitch {
    return {
      b: false,
    }
  }

  prepare(_val: MAFValueSwitch): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueSwitch, opt: MAFOptionSwitch, _meta: MAFMetaDummy, opposite: boolean): string {
    return `${opposite ? '不' : ''}为${val.b ? opt.textActive : opt.textInactive}点位`
  }

  filter(val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    const underground = (marker.extra?.underground ?? {}) as ExtraUnderground
    return Boolean(underground.is_underground) === Boolean(val.b)
  }
}
