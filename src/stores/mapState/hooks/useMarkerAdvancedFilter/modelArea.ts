import { useAreaStore } from '@/stores/area'
import type { AreaWithChildren } from '@/stores'
import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSelect,
  MAFValueNumberArray,
} from '@/stores/types'

export class Area implements MAFConfig {
  id = 101
  name = '地区'
  option: ComputedRef<MAFOptionSelect<AreaWithChildren>> = computed(() => {
    const { areaTree } = useAreaStore()

    return {
      options: areaTree,
      optionLabel: 'name',
      optionValue: 'id',
      optionSelectMultiple: true,
      dialogTitle: '选择地区',
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

  semantic(_val: MAFValueNumberArray, _opt: MAFOptionSelect<AreaWithChildren>, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueNumberArray, _opt: MAFOptionSelect<AreaWithChildren>, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
