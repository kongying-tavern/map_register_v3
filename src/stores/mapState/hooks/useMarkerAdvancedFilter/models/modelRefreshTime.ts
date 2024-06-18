import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionRange,
  MAFOptionSelect,
  MAFSemanticUnit,
  MAFValueNumberRange,
} from '@/stores/types'
import { useRefreshTimeOptions } from '@/hooks'

type OptionType = MAFOptionRange & MAFOptionSelect<{ label: string; value: number }>

export class RefreshTime implements MAFConfig {
  id = 10
  name = '刷新时间'
  option: ComputedRef<OptionType> = computed(() => {
    const { refreshTimeOptions } = useRefreshTimeOptions()

    return {
      placeholderMin: '不限',
      placeholderMax: '不限',
      startMin: 0,
      startMinIncluded: false,
      endMin: 0,
      endMinIncluded: false,
      dialogTitle: '选择刷新时间',
      dialogListClass: 'grid grid-cols-2',
      options: refreshTimeOptions.value,
      optionLabel: 'label',
      optionValue: 'value',
    }
  })

  get defaultVal(): MAFValueNumberRange {
    return {
      nMin: null,
      nMax: null,
    }
  }

  prepare(_val: MAFValueNumberRange, _opt: OptionType): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueNumberRange, _opt: OptionType, _meta: MAFMetaDummy, opposite: boolean): MAFSemanticUnit[] {
    const { refreshTimeTypeNameMap } = useRefreshTimeOptions()

    if (!Number.isFinite(val.nMin) && !Number.isFinite(val.nMax)) {
      return opposite ? '无刷新时间' : '不限刷新时间'
    }
    else if (Number.isFinite(val.nMin) && Number.isFinite(val.nMax)) {
      if (val.nMin === val.nMax) {
        if (Number(val.nMin) <= 0)
          return `刷新时间${opposite ? '非' : ''}【${refreshTimeTypeNameMap.value[val.nMin ?? '']}】`
        else
          return `刷新时间${opposite ? '非' : ''}【${val.nMin}小时】`
      }
      else {
        return `刷新时间${opposite ? '非' : ''}【${val.nMin}~${val.nMax}小时】`
      }
    }
    else if (Number.isFinite(val.nMin) && !Number.isFinite(val.nMax)) {
      return `刷新时间【${opposite ? '＜' : '≥'}${val.nMin}小时】`
    }
    else if (!Number.isFinite(val.nMin) && Number.isFinite(val.nMax)) {
      return `刷新时间【${opposite ? '＞' : '≤'}${val.nMax}小时】`
    }
    return ''
  }

  filter(val: MAFValueNumberRange, _opt: OptionType, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    const minVal: number = val.nMin === undefined || val.nMin === null ? Number.NEGATIVE_INFINITY : (val.nMin <= 0 ? val.nMin : val.nMin * 3600 * 1000)
    const maxVal: number = val.nMax === undefined || val.nMax === null ? Number.POSITIVE_INFINITY : (val.nMax <= 0 ? val.nMax : val.nMax * 3600 * 1000)
    return marker.refreshTime! >= minVal && marker.refreshTime! <= maxVal
  }
}
