import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSwitch,
  MAFValueSwitch,
} from '@/stores/types'

interface ExtraUnderground {
  is_underground?: boolean
}

export const underground: MAFConfig = {
  id: 5,
  name: '点位地下',
  option: {
    textInactive: '地上',
    textActive: '地下',
  },
  defaultVal: {
    v: false,
  },
  prepare: (_val: MAFValueSwitch): MAFMetaDummy => {
    return {}
  },
  semantic: () => '',
  filter: (val: MAFValueSwitch, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean => {
    const underground = (marker.extra?.underground ?? {}) as ExtraUnderground
    return Boolean(underground.is_underground) === Boolean(val.v)
  },
}
