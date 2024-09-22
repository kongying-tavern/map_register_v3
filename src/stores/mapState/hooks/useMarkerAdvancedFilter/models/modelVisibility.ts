import type {
  MAFConfig,
  MAFMetaVisibility,
  MAFOptionSelect,
  MAFSemanticUnit,
  MAFValueNumberArray,
} from '@/stores/types'
import { useHiddenFlagOptions } from '@/hooks'

type OptionType = MAFOptionSelect<{ label: string; value: number }>

export class Visibility implements MAFConfig {
  id = 8
  name = '可见范围'
  option: ComputedRef<OptionType> = computed(() => {
    const { hiddenFlagOptions } = useHiddenFlagOptions()

    return {
      dialogTitle: '选择可见范围',
      options: hiddenFlagOptions.value,
      optionSelectMultiple: true,
      optionLabel: 'label',
      optionValue: 'value',
    }
  })

  get defaultVal(): MAFValueNumberArray {
    return {
      na: [],
    }
  }

  prepare(val: MAFValueNumberArray, _opt: OptionType): MAFMetaVisibility {
    const meta: MAFMetaVisibility = {
      tagList: [],
      tag: '',
    }

    // 处理标签名
    const { hiddenFlagNameMap } = useHiddenFlagOptions()
    meta.tagList = (val.na ?? [])
      .map(v => hiddenFlagNameMap.value[v ?? ''])
      .filter(v => v)
    meta.tag = meta.tagList.join(',')

    return meta
  }

  semantic(_val: MAFValueNumberArray, _opt: OptionType, meta: MAFMetaVisibility, opposite: boolean): MAFSemanticUnit[] {
    return [
      { type: 'text', text: '可见范围' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '为' },
      ...meta.tagList.map(tag => ({ type: 'tag', text: tag })),
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(val: MAFValueNumberArray, _opt: OptionType, _meta: MAFMetaVisibility, marker: API.MarkerVo): boolean {
    return (val.na ?? []).includes(marker.hiddenFlag!)
  }
}
