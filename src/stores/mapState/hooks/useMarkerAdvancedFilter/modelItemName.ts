import { useItemStore } from '@/stores'
import type {
  MAFConfig,
  MAFMetaItemName,
  MAFOptionInput,
  MAFValueString,
} from '@/stores/types'

export class ItemName implements MAFConfig {
  id = 103
  name = '物品名称'
  option: MAFOptionInput = {
    placeholder: '格式：A,B,C',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(val: MAFValueString): MAFMetaItemName {
    const meta: MAFMetaItemName = {
      itemIds: new Set<number>(),
    }
    if (!val.s)
      return meta

    const { itemList } = useItemStore()
    const itemNames = val.s.split(',').filter(v => v)
    const itemNameSet = new Set(itemNames)
    const itemIdList: number[] = itemList
      .filter(item => itemNameSet.has(item.name!))
      .map(item => item.id!)
      .filter(v => v)
    meta.itemIds = new Set(itemIdList)

    return meta
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaItemName, opposite: boolean): string {
    return `物品${opposite ? '不' : ''}为【${val.s ?? ''}】`
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaItemName, marker: API.MarkerVo): boolean {
    const itemIds: number[] = (marker.itemList ?? []).map(item => item.itemId!).filter(v => v)
    for (const itemId of itemIds) {
      if (meta.itemIds.has(itemId))
        return true
    }
    return false
  }
}