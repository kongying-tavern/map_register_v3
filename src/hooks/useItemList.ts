import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface ItemListHookOptions extends FetchHookOptions<API.RPageListVoItemVo> {
  params?: () => API.ItemSearchVo
}

/** 物品列表与相关操作方法 */
export const useItemList = (options: ItemListHookOptions = {}) => {
  const { immediate = true, loading = ref(false), params } = options

  const itemList = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>

  const fetchParams = computed(() => params?.())

  const { refresh: updateItemList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      const { areaIdList = [], typeIdList = [], current = 1, size = 10 } = fetchParams.value ?? {}
      if (!areaIdList.length && !typeIdList.length)
        return {}
      return Api.item.listItemIdByType({}, { areaIdList, typeIdList, current, size })
    },
  })

  onSuccess((res) => {
    itemList.value = (res?.data?.record ?? []).sort((a, b) => Number(a.sortIndex) - Number(b.sortIndex))
  })

  const { pause, resume } = pausableWatch(fetchParams, updateItemList, { deep: true })

  return { itemList, updateItemList, onSuccess, pause, resume, ...rest }
}
