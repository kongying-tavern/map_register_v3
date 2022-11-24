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
      ...fetchParams.value,
    }),
  })

  onSuccess((res) => {
    itemList.value = (res?.data?.record ?? []).sort((a, b) => Number(a.itemId) - Number(b.itemId))
  })

  watchParams && params && watch(fetchParams, refresh, { deep: true })

  return { itemList, updateItemList: refresh, onSuccess, ...rest }
}
