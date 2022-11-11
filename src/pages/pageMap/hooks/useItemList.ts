import type { Ref } from 'vue'
import Api from '@/api/api'
import { messageFrom } from '@/utils'

interface ItemListHookOptions {
  params?: () => API.ItemSearchVo
  onSuccess?: (data: API.PageListVoItemVo) => void
  onError?: (err: Error) => void
  loading?: Ref<boolean>
}

export const useItemList = (options: ItemListHookOptions = {}) => {
  const { loading = ref(false), params, onSuccess, onError } = options

  const itemList = ref<API.ItemVo[]>([])

  const updateItemList = async () => {
    try {
      loading.value = true
      const { data = {} } = await Api.item.listItemIdByType({}, {
        areaIdList: [],
        current: 1,
        size: 10,
        typeIdList: [],
        ...params?.(),
      })
      const { record = [] } = data
      itemList.value = record
      onSuccess?.(data)
    }
    catch (err) {
      onError?.(err instanceof Error ? err : new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
    }
  }

  return { itemList, loading, updateItemList }
}
