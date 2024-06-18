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
  id = 11
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
      tag: '',
    }

    // 处理标签名
    const { hiddenFlagNameMap } = useHiddenFlagOptions()
    meta.tag = (val.na ?? [])
      .map(v => hiddenFlagNameMap.value[v ?? ''])
      .filter(v => v)
      .join(',')

    return meta
  }

  semantic(_val: MAFValueNumberArray, _opt: OptionType, _meta: MAFMetaVisibility, _opposite: boolean): MAFSemanticUnit[] {
    return []
  }

  filter(val: MAFValueNumberArray, _opt: OptionType, _meta: MAFMetaVisibility, marker: API.MarkerVo): boolean {
    return (val.na ?? []).includes(marker.hiddenFlag!)
  }
}
