import type { Ref } from 'vue'
import type { Collection } from 'dexie'
import { liveQuery } from 'dexie'
import { useSubscription } from '@vueuse/rxjs'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'
import { useItemStore } from '@/stores'

export interface ItemQueryForm {
  name?: string
  areaId?: number
  itemTypeId?: number
}

export interface ItemHookOptions {
  getParams: () => ItemQueryForm
  pagination: Ref<PaginationState>
}

/** 物品列表与相关操作方法 */
export const useItemList = (options: ItemHookOptions) => {
  const { pagination, getParams } = options

  const itemList = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>

  /** 共享的物品id → 物品对象映射表 */
  const itemMap = computed(() => itemList.value.reduce((seed, item) => {
    item.id !== undefined && (seed[item.id] = item)
    return seed
  }, {} as Record<number, API.ItemVo>))

  const params = computed(() => getParams())

  const { refresh: updateItemList, loading, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const { current, pageSize: size } = pagination.value
      const { areaId, itemTypeId } = params.value
      let { name = '' } = params.value
      name = name.trim()

      let collection: Collection<API.ItemVo> | undefined

      if (typeof areaId === 'number')
        collection = db.item.where('areaId').equals(areaId)

      if (typeof itemTypeId === 'number') {
        collection = collection
          ? collection.filter(item => item.typeIdList?.includes(itemTypeId) ?? false)
          : db.item.where('typeIdList').anyOf([itemTypeId])
      }

      if (!collection)
        collection = db.item.toCollection()

      if (name)
        collection = collection.filter(item => item.name?.includes(name) ?? false)

      if (!collection)
        collection = db.item.toCollection()

      const total = await collection.clone().count()
      const items = await collection.offset((current - 1) * size).limit(size).toArray()

      itemList.value = items
      pagination.value.total = total

      return { items, total }
    },
  })

  const resetPaginationUpdate = () => {
    pagination.value.current = 1
    updateItemList()
  }

  watch(() => pagination.value.current, updateItemList)
  watch(() => [params.value, pagination.value.pageSize], resetPaginationUpdate)

  // 在物品进行更改操作后同步本地与云端的物品列表
  // TODO 可能需要改为数据库中间件以实现无感操作
  const itemStore = useItemStore()
  const { refresh: syncItemListChanged } = useFetchHook({
    loading,
    onRequest: async () => {
      await itemStore.resetMD5()
      await itemStore.backgroundUpdate()
    },
  })

  // 订阅物品更新，当物品更新时刷新列表
  useSubscription(liveQuery(() => db.item.toArray()).subscribe(() => {
    itemList.value = []
    updateItemList()
  }))

  return { itemList, itemMap, loading, updateItemList, syncItemListChanged, ...rest }
}
