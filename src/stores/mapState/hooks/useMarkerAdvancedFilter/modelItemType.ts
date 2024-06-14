import { useItemTypeStore } from '@/stores'
import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSelect,
  MAFValueNumberArray,
} from '@/stores/types'

export class ItemType implements MAFConfig {
  id = 102
  name = '分类'
  option: ComputedRef<MAFOptionSelect<API.ItemTypeVo>> = computed(() => {
    const { itemTypeList } = useItemTypeStore()

    return {
      dialogTitle: '选择分类',
      dialogListClass: 'grid grid-cols-2',
      options: itemTypeList,
      optionLabel: 'name',
      optionValue: 'id',
      optionSelectMultiple: true,
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

  semantic(_val: MAFValueNumberArray, _opt: MAFOptionSelect<API.ItemTypeVo>, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueNumberArray, _opt: MAFOptionSelect<API.ItemTypeVo>, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
