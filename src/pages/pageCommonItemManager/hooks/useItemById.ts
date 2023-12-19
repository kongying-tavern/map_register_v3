import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

/** 共享的物品列表 */
const itemList = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>
/** 共享的物品列表加载态，可覆盖 */
const loading = ref(false)

interface ItemIdHookOptions extends FetchHookOptions<API.RListItemVo> {
  params: () => number[]
}

/** 通过itemId查询物品信息 */
export const useItemById = (options: ItemIdHookOptions) => {
  const { immediate, loading: scopedLoading, params } = options

  const fetchParams = computed(() => params?.())

  const { refresh: updateItemList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: async () => {
      if (fetchParams.value.length !== 0)
        return Api.item.listItemById ({}, fetchParams.value)
      else
        return Api.item.listItemById ({}, [0])
    },
  })

  onSuccess(({ data }) => {
    itemList.value = data!.sort(({ sortIndex: ia }, { sortIndex: ib }) => {
      if (ia === undefined || ib === undefined)
        return 0
      return ib - ia
    })
  })

  // const { pause, resume } = pausableWatch(fetchParams, updateItemList, { deep: true })

  // return { itemList, updateItemList, onSuccess, pause, resume, ...rest }
  return { itemList, updateItemList, onSuccess, ...rest }
}
