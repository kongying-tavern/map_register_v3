import { useItemStore } from '@/stores'
import type {
  MAFConfig,
  MAFMetaItemNameRegex,
  MAFOptionInput,
  MAFValueString,
} from '@/stores/types'

export class ItemNameRegex implements MAFConfig {
  id = 104
  name = '物品名称正则'
  option: MAFOptionInput = {
    placeholder: '',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(val: MAFValueString): MAFMetaItemNameRegex {
    const meta: MAFMetaItemNameRegex = {
      itemIds: new Set<number>(),
    }
    if (!val.s)
      return meta

    let re: RegExp | undefined
    try {
      re = new RegExp(val.s, 'gui')
    }
    catch (_err) {
      // 忽略错误
    }
    if (!re)
      return meta

    const { itemList } = useItemStore()
    const itemIdSet: Set<number> = itemList
      .reduce<Set<number>>((seed, item) => {
        if (re.test(item.name!))
          seed.add(item.id!)
        return seed
      }, new Set())
    meta.itemIds = itemIdSet

    return meta
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaItemNameRegex, opposite: boolean): string {
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaItemNameRegex, marker: API.MarkerVo): boolean {
    const itemIds: number[] = (marker.itemList ?? []).map(item => item.itemId!).filter(v => v)
    for (const itemId of itemIds) {
      if (meta.itemIds.has(itemId))
        return true
    }
    return false
  }
}
