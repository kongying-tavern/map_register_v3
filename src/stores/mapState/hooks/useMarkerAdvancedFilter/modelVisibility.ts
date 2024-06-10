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

  semantic(_val: MAFValueNumberArray, _opt: MAFOptionSelect<OptionType>, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueNumberArray, _opt: MAFOptionSelect<OptionType>, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
