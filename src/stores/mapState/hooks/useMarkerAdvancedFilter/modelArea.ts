import { useAreaStore } from '@/stores/area'
import { type AreaWithChildren, useItemStore } from '@/stores'
import type {
  MAFConfig,
  MAFMetaArea,
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

  prepare(val: MAFValueNumberArray): MAFMetaArea {
    const meta: MAFMetaArea = {
      itemIds: new Set<number>(),
    }
    if (!val.na || val.na.length <= 0)
      return meta

    const { itemList } = useItemStore()
    const itemIdList: number[] = itemList
      .filter(item => val.na.includes(item.areaId!))
      .map(item => item.id!)
      .filter(v => v)
    meta.itemIds = new Set(itemIdList)

    return meta
  }

  semantic(val: MAFValueNumberArray, _opt: MAFOptionSelect<AreaWithChildren>, _meta: MAFMetaArea, opposite: boolean): string {
    if (!val.na || val.na.length <= 0)
      return opposite ? '属于所有地区' : '不属于任何地区'

    const { areaIdMap } = useAreaStore()
    const areaNames = val.na
      .map(areaId => (areaIdMap.get(areaId!) ?? {}).name)
      .filter(v => v)
      .join(',')
    return `地区${opposite ? '不' : ''}为【${areaNames}】`
  }

  filter(_val: MAFValueNumberArray, _opt: MAFOptionSelect<AreaWithChildren>, meta: MAFMetaArea, marker: API.MarkerVo): boolean {
    const itemIds: number[] = (marker.itemList ?? []).map(v => v.itemId!).filter(v => v)
    for (const itemId of itemIds) {
      if (meta.itemIds.has(itemId))
        return true
    }
    return false
  }
}
