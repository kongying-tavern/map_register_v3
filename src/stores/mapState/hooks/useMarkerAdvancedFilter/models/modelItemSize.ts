import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionRange,
  MAFSemanticUnit,
  MAFValueNumberRange,
} from '@/stores/types'

export class ItemSize implements MAFConfig {
  id = 105
  name = '物品条数'
  option: MAFOptionRange = {
    placeholderMin: '不限',
    placeholderMax: '不限',
  }

  get defaultVal(): MAFValueNumberRange {
    return {
      nMin: null,
      nMax: null,
    }
  }

  prepare(_val: MAFValueNumberRange, _opt: MAFOptionRange): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueNumberRange, _opt: MAFOptionRange, _meta: MAFMetaDummy, _opposite: boolean): MAFSemanticUnit[] {
    return []
  }

  filter(val: MAFValueNumberRange, _opt: MAFOptionRange, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    const minVal: number = val.nMin === undefined || val.nMin === null ? Number.NEGATIVE_INFINITY : val.nMin
    const maxVal: number = val.nMax === undefined || val.nMax === null ? Number.POSITIVE_INFINITY : val.nMax
    const itemList = marker.itemList ?? []
    return itemList.length >= minVal && itemList.length <= maxVal
  }
}
