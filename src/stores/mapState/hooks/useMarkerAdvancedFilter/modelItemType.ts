import { useItemStore, useItemTypeStore } from '@/stores'
import type {
  MAFConfig,
  MAFMetaItemType,
  MAFOptionSelect,
  MAFValueNumberArray,
} from '@/stores/types'

export class ItemType implements MAFConfig {
  id = 102
  name = '分类'
  option: ComputedRef<MAFOptionSelect<API.ItemTypeVo>> = computed(() => {
    const { itemTypeList } = useItemTypeStore()

    const typeList = itemTypeList.filter(itemType => itemType.isFinal)

    return {
      dialogTitle: '选择分类',
      dialogListClass: 'grid grid-cols-2',
      options: typeList,
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

  prepare(val: MAFValueNumberArray): MAFMetaItemType {
    const meta: MAFMetaItemType = {
      itemIds: new Set<number>(),
    }
    if (!val.na || val.na.length <= 0)
      return meta

    const { itemList } = useItemStore()
    const itemIdList: number[] = itemList
      .reduce<number[]>((seed, item) => {
        const typeIds = item.typeIdList ?? []
        for (const typeId of typeIds) {
          if (val.na.includes(typeId))
            return [...seed, item.id!]
        }
        return seed
      }, [])
    meta.itemIds = new Set(itemIdList)

    return meta
  }

  semantic(_val: MAFValueNumberArray, _opt: MAFOptionSelect<API.ItemTypeVo>, _meta: MAFMetaItemType, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueNumberArray, _opt: MAFOptionSelect<API.ItemTypeVo>, meta: MAFMetaItemType, marker: API.MarkerVo): boolean {
    const itemIds: number[] = (marker.itemList ?? []).map(v => v.itemId!).filter(v => v)
    for (const itemId of itemIds) {
      if (meta.itemIds.has(itemId))
        return true
    }
    return false
  }
}
