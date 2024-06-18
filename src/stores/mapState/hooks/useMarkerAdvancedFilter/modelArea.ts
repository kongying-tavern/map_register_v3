import { useAreaStore, useItemStore } from '@/stores'
import type { AreaWithChildren } from '@/stores'
import type {
  MAFConfig,
  MAFMetaArea,
  MAFOptionSelect,
  MAFValueNumberArray,
} from '@/stores/types'

type OptionType = MAFOptionSelect<AreaWithChildren>

export class Area implements MAFConfig {
  id = 101
  name = '地区'
  option: ComputedRef<OptionType> = computed(() => {
    const { areaTree } = useAreaStore()

    return {
      dialogTitle: '选择地区',
      options: areaTree,
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

  prepare(val: MAFValueNumberArray, _opt: OptionType): MAFMetaArea {
    const meta: MAFMetaArea = {
      tag: '',
      areaParentIdMap: {},
      itemIds: new Set<number>(),
    }

    const { areaIdMap, childrenAreaList } = useAreaStore()
    // 处理标签名
    meta.tag = val.na
      .map(areaId => (areaIdMap.get(areaId) ?? {}).name!)
      .filter(v => v)
      .join(',')

    // 处理地区父ID映射
    meta.areaParentIdMap = Object.fromEntries(childrenAreaList.map(({ id: childId = 0, parentId = -1 }) => [childId, parentId]))

    // 处理物品ID
    if (val.na && val.na.length > 0) {
      const { itemList } = useItemStore()
      const itemIdList: number[] = itemList
        .filter(item => val.na.includes(item.areaId!))
        .map(item => item.id!)
        .filter(v => v)
      meta.itemIds = new Set(itemIdList)
    }

    return meta
  }

  semantic(val: MAFValueNumberArray, _opt: OptionType, meta: MAFMetaArea, opposite: boolean): MAFSemanticUnit[] {
    if (!val.na || val.na.length <= 0)
      return opposite ? '属于所有地区' : '不属于任何地区'
    return `地区${opposite ? '不' : ''}为【${meta.tag ?? ''}】`
  }

  filter(_val: MAFValueNumberArray, _opt: OptionType, meta: MAFMetaArea, marker: API.MarkerVo): boolean {
    const itemIds: number[] = (marker.itemList ?? []).map(v => v.itemId!).filter(v => v)
    for (const itemId of itemIds) {
      if (meta.itemIds.has(itemId))
        return true
    }
    return false
  }
}
