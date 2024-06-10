import type {
  MAFConfig,
  MAFMetaDummy,
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

  prepare(_val: MAFValueNumberArray): MAFMetaDummy {
    return {}
  }

  semantic(val: MAFValueNumberArray, _opt: MAFOptionSelect<OptionType>, _meta: MAFMetaDummy, opposite: boolean): string {
    const { hiddenFlagNameMap } = useHiddenFlagOptions()
    if (!val.na || val.na.length <= 0) {
      return opposite ? '不限可见范围' : '无可见范围'
    }
    else {
      const tag: string = (val.na ?? [])
        .map(v => hiddenFlagNameMap.value[v ?? ''])
        .filter(v => v)
        .join(',')
      return `可见范围${opposite ? '不为' : '为'}【${tag}】`
    }
  }

  filter(val: MAFValueNumberArray, _opt: MAFOptionSelect<OptionType>, _meta: MAFMetaDummy, marker: API.MarkerVo): boolean {
    return (val.na ?? []).includes(marker.hiddenFlag!)
  }
}
