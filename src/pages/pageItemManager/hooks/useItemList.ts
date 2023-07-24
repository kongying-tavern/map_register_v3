import type { Ref } from 'vue'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

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
  const userMap = ref<Record<string, API.SysUserSmallVo>>({})

  /** 共享的物品id → 物品对象映射表 */
  const itemMap = computed(() => itemList.value.reduce((seed, item) => {
    item.id !== undefined && (seed[item.id] = item)
    return seed
  }, {} as Record<number, API.ItemVo>))

  const params = computed(() => getParams())

  const { refresh: updateItemList, onSuccess, loading, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = pagination.value
      const { areaId, itemTypeId } = params.value
      return Api.item.listItemIdByType({}, {
        current,
        size,
        areaIdList: !areaId ? [] : [areaId],
        typeIdList: !itemTypeId ? [] : [itemTypeId],
      })
    },
  })

  watch(() => [params.value.areaId, params.value.itemTypeId], updateItemList)

  onSuccess(({ data: { record = [], total = 0 } = {}, users = {} }) => {
    itemList.value = record
    pagination.value.total = total
    userMap.value = users
  })

  return { itemList, itemMap, loading, userMap, updateItemList, onSuccess, ...rest }
}
