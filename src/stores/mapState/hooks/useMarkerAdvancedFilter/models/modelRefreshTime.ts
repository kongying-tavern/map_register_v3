import type {
  MAFConfig,
  MAFMetaRefreshTime,
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

  prepare(val: MAFValueNumberRange, _opt: OptionType): MAFMetaRefreshTime {
    const meta: MAFMetaRefreshTime = {
      isCustom: true,
      tagNameMap: {},
    }

    // 处理是否自定义
    meta.isCustom = !(Number.isFinite(val.nMin) && Number(val.nMin) <= 0 && Number.isFinite(val.nMax) && Number(val.nMax) <= 0)

    // 处理名称映射
    const { refreshTimeTypeNameMap } = useRefreshTimeOptions()
    meta.tagNameMap = refreshTimeTypeNameMap.value

    return meta
  }

  semantic(val: MAFValueNumberRange, _opt: OptionType, meta: MAFMetaRefreshTime, opposite: boolean): MAFSemanticUnit[] {
    return [
      { type: 'text', text: '刷新时间' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '为' },
      meta.isCustom
        ? { type: 'highlight', text: `${val.nMin ?? '不限'} ~ ${val.nMax ?? '不限'} 小时` }
        : { type: 'tag', text: meta.tagNameMap[val.nMin ?? ''] },
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(val: MAFValueNumberRange, _opt: OptionType, _meta: MAFMetaRefreshTime, marker: API.MarkerVo): boolean {
    const minVal: number = val.nMin === undefined || val.nMin === null ? Number.NEGATIVE_INFINITY : (val.nMin <= 0 ? val.nMin : val.nMin * 3600 * 1000)
    const maxVal: number = val.nMax === undefined || val.nMax === null ? Number.POSITIVE_INFINITY : (val.nMax <= 0 ? val.nMax : val.nMax * 3600 * 1000)
    return marker.refreshTime! >= minVal && marker.refreshTime! <= maxVal
  }
}
