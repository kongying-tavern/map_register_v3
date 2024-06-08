import { computed } from 'vue'
import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionRange,
  MAFOptionSelect,
  MAFOptionSwitch,
  MAFValueBoolean,
  MAFValueNumberRange,
} from '@/stores/types'
import { useRefreshTimeOptions } from '@/hooks'

export class RefreshTime implements MAFConfig {
  id = 10
  name = '刷新时间'
  option: ComputedRef<MAFOptionRange & MAFOptionSelect<{ label: string; value: number }>> = computed(() => {
    const { refreshTimeOptions } = useRefreshTimeOptions()

    return {
      placeholderMin: '不限',
      placeholderMax: '不限',
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

  prepare(_val: MAFValueBoolean): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueBoolean, _opt: MAFOptionSwitch, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
