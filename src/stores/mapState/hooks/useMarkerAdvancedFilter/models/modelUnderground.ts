import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFSemanticUnit,
  MAFValueBoolean,
} from '@/stores/types'

interface ExtraUnderground {
  is_underground?: boolean
}

export class Underground implements MAFConfig {
  id = 5
  name = '地面点位'
  option: MAFOptionSwitch = {
    textInactive: '地面',
    textActive: '非地面',
  }

  get defaultVal(): MAFValueBoolean {
    return {
      b: false,
    }
  }

  prepare(_val: MAFValueBoolean, _opt: MAFOptionSwitch): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueBoolean, opt: MAFOptionSwitch, _meta: MAFMetaDummy, opposite: boolean): MAFSemanticUnit[] {
    return [
      { type: 'text', text: '点位' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '属于' },
      { type: 'tag', text: val.b ? opt.textActive : opt.textInactive },
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    const underground = (marker.extra?.underground ?? {}) as ExtraUnderground
    return Boolean(underground.is_underground) === Boolean(val.b)
  }
}
