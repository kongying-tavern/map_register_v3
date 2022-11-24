import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface ItemListHookOptions extends FetchHookOptions<API.RPageListVoItemVo> {
  watchParams?: boolean
  params?: () => API.ItemSearchVo
}

export const useItemList = (options: ItemListHookOptions = {}) => {
  const { immediate = false, watchParams = true, loading = ref(false), params } = options

  const itemList = ref<API.ItemVo[]>([])

  const fetchParams = computed(() => params?.())

  const { refresh, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.item.listItemIdByType({}, {
      areaIdList: [],
      current: 1,
      size: 10,
      typeIdList: [],
      ...fetchParams.value,
    }),
  })

  onSuccess((res) => {
    itemList.value = res?.data?.record ?? []
  })

  watchParams && params && watch(fetchParams, refresh, { deep: true })

  return { itemList, updateItemList: refresh, onSuccess, ...rest }
}
