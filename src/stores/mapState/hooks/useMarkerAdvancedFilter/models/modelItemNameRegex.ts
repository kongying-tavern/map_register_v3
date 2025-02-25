import type {
  MAFConfig,
  MAFMetaItemNameRegex,
  MAFOptionInput,
  MAFSemanticUnit,
  MAFValueString,
} from '@/stores/types'
import { useItemStore } from '@/stores'

export class ItemNameRegex implements MAFConfig<MAFValueString, MAFOptionInput, MAFMetaItemNameRegex> {
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

  prepare(val: MAFValueString, _opt: MAFOptionInput): MAFMetaItemNameRegex {
    const meta: MAFMetaItemNameRegex = {
      re: undefined,
      itemIds: new Set<number>(),
    }

    // 处理正则表达式
    if (val.s) {
      try {
        meta.re = new RegExp(val.s, 'iu')
      }
      catch {
        meta.re = null
      }
    }

    // 处理物品ID
    if (meta.re) {
      const { itemList } = useItemStore()
      const itemIdSet: Set<number> = itemList
        .reduce<Set<number>>((seed, item) => {
          if (meta.re!.test(item.name!))
            seed.add(item.id!)
          return seed
        }, new Set())
      meta.itemIds = itemIdSet
    }

    return meta
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaItemNameRegex, opposite: boolean): MAFSemanticUnit[] {
    return [
      { type: 'text', text: '物品名' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '满足正则' },
      meta.re === null ? { type: 'error', text: '正则错误' } : { type: 'regex', text: val.s },
    ].filter(v => v) as MAFSemanticUnit[]
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
