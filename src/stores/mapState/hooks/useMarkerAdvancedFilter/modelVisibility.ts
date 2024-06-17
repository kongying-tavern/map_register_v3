import type {
  MAFConfig,
  MAFMetaVisibility,
  MAFOptionSelect,
  MAFValueNumberArray,
} from '@/stores/types'
import { useHiddenFlagOptions } from '@/hooks'

interface OptionType { label: string; value: number }

export class Visibility implements MAFConfig {
  id = 11
  name = '可见范围'
  option: ComputedRef<MAFOptionSelect<OptionType>> = computed(() => {
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

  prepare(val: MAFValueNumberArray): MAFMetaVisibility {
    const meta: MAFMetaVisibility = {
      tag: '',
    }
    if (!val.na || val.na.length <= 0)
      return meta

    // 处理标签名
    const { hiddenFlagNameMap } = useHiddenFlagOptions()
    meta.tag = (val.na ?? [])
      .map(v => hiddenFlagNameMap[v ?? ''])
      .filter(v => v)
      .join(',')

    return meta
  }

  semantic(val: MAFValueNumberArray, _opt: MAFOptionSelect<OptionType>, meta: MAFMetaVisibility, opposite: boolean): string {
    if (!val.na || val.na.length <= 0)
      return opposite ? '不限可见范围' : '无可见范围'
    return `可见范围${opposite ? '不为' : '为'}【${meta.tag ?? ''}】`
  }

  filter(val: MAFValueNumberArray, _opt: MAFOptionSelect<OptionType>, _meta: MAFMetaVisibility, marker: API.MarkerVo): boolean {
    return (val.na ?? []).includes(marker.hiddenFlag!)
  }
}
