import type { Ref } from 'vue'
import Api from '@/api/api'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface CommonItemListHookOptions {
  pagination: Ref<PaginationState>
}

/** 物品列表与相关操作方法 */
export const useCommonItemList = (options: CommonItemListHookOptions) => {
  const { pagination } = options

  const { refresh: updateCommonItemList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = pagination.value
      return Api.itemCommon.listCommonItem({ current, size })
    },
  })

  const itemList = ref<API.ItemAreaPublicVo[]>([])
  const userMap = ref<Record<string, API.SysUserSmallVo>>({})

  onSuccess(({ data: { record = [], total = 0 } = {}, users = {} }) => {
    itemList.value = record
    pagination.value.total = total
    userMap.value = users
  })

  return { itemList, userMap, updateCommonItemList, onSuccess, ...rest }
}
