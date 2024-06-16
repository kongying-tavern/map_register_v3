import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionRange,
  MAFOptionSwitch,
  MAFValueBoolean,
  MAFValueNumberRange,
} from '@/stores/types'

export class ItemCount implements MAFConfig {
  id = 106
  name = '物品计数'
  option: MAFOptionSwitch & MAFOptionRange = {
    textActive: '全部',
    textInactive: '任意',
    placeholderMin: '不限',
    placeholderMax: '不限',
  }

  get defaultVal(): MAFValueBoolean & MAFValueNumberRange {
    return {
      b: false,
      nMin: null,
      nMax: null,
    }
  }

  prepare(_val: MAFValueBoolean & MAFValueNumberRange): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueBoolean & MAFValueNumberRange, opt: MAFOptionSwitch & MAFOptionRange, _meta: MAFMetaDummy, opposite: boolean): string {
    const optionTag = val.b ? opt.textActive! : opt.textInactive!
    if (!Number.isFinite(val.nMin) && !Number.isFinite(val.nMax)) {
      return opposite ? `无${optionTag}物品计数` : `不限${optionTag}物品计数`
    }
    else if (Number.isFinite(val.nMin) && Number.isFinite(val.nMax)) {
      if (val.nMin === val.nMax)
        return `${optionTag}物品计数${opposite ? '非' : ''}【${val.nMin}】`

      else
        return `${optionTag}物品计数${opposite ? '非' : ''}【${val.nMin}~${val.nMax}】`
    }
    else if (Number.isFinite(val.nMin) && !Number.isFinite(val.nMax)) {
      return `${optionTag}物品计数【${opposite ? '＜' : '≥'}${val.nMin}】`
    }
    else if (!Number.isFinite(val.nMin) && Number.isFinite(val.nMax)) {
      return `${optionTag}物品计数【${opposite ? '＞' : '≤'}${val.nMax}】`
    }
    return ''
  }

  filter(val: MAFValueBoolean & MAFValueNumberRange, _opt: MAFOptionSwitch & MAFOptionRange, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    const minVal: number = val.nMin === undefined || val.nMin === null ? Number.NEGATIVE_INFINITY : val.nMin
    const maxVal: number = val.nMax === undefined || val.nMax === null ? Number.POSITIVE_INFINITY : val.nMax
    const itemList = marker.itemList ?? []
    const isMatch = (item: API.MarkerItemLinkVo): boolean => item.count! >= minVal && item.count! <= maxVal
    return val.b ? itemList.every(isMatch) : itemList.some(isMatch)
  }
}
