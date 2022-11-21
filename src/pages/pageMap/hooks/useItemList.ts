import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface ItemListHookOptions extends FetchHookOptions<API.RPageListVoItemVo> {
  params?: () => API.ItemSearchVo
}

export const useItemList = (options: ItemListHookOptions = {}) => {
  const { immediate = false, loading = ref(false), params, onSuccess, onError } = options

  const itemList = ref<API.ItemVo[]>([])

  const watchParams = computed(() => params?.())

  const { refresh } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.item.listItemIdByType({}, {
      areaIdList: [],
      current: 1,
      size: 10,
      typeIdList: [],
      ...watchParams.value,
    }),
    onSuccess: (res) => {
      itemList.value = res?.data?.record ?? []
      onSuccess?.(res)
    },
    onError,
  })

  if (params)
    watch(watchParams, refresh, { deep: true })

  return { itemList, loading, updateItemList: refresh }
}
