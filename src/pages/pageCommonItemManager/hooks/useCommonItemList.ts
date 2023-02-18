import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

/** 共享的物品列表 */
const itemList = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>
/** 共享的物品列表加载态，可覆盖 */
const loading = ref(false)

interface CommonItemListHookOptions extends FetchHookOptions<API.RPageListVoItemVo> {
  params?: () => API.PageSearchVo
}
/** 物品列表与相关操作方法 */
export const useCommonItemList = (options: CommonItemListHookOptions = {}) => {
  const { immediate, loading: scopedLoading, params } = options

  const fetchParams = computed(() => params?.())

  const { refresh: updateItemList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: async () => {
      const { current = 1, size = 10 } = fetchParams.value ?? {}
      return Api.itemCommon.listCommonItem ({ current, size })
    },
  })

  onSuccess(({ data: { record = [] } = {} }) => {
    itemList.value = record.sort(({ sortIndex: ia }, { sortIndex: ib }) => {
      if (ia === undefined || ib === undefined)
        return 0
      return ib - ia
    })
  })

  const { pause, resume } = pausableWatch(fetchParams, updateItemList, { deep: true })

  return { itemList, updateItemList, onSuccess, pause, resume, ...rest }
}

interface CommonItemDeleteOptions extends FetchHookOptions<API.RBoolean> {
  params: () => number[]
}

/** 按itemId列表从公共物品中移除几个物品 */
export const useCommonItemDelete = (options: CommonItemDeleteOptions) => {
  const { immediate = false, loading = ref(false), params } = options

  const fetchParams = computed(() => params?.())

  const rest = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      const missions = fetchParams.value.map(itemId => Api.itemCommon.deleteCommonItem({ itemId }))
      await Promise.allSettled(missions)
      // TODO 批量请求，可能会遇到来自服务器或网络错误无法收集，暂时先一律忽略
      return { error: false }
    },
  })

  return { ...rest }
}

interface CommonItemAddHookOptions extends FetchHookOptions<API.RBoolean> {
  params: () => number[]
}

/** 新增物品 */
export const useCommonItemAdd = (options: CommonItemAddHookOptions) => {
  const { immediate = false, loading = ref(false), params } = options

  const fetchParams = computed(() => params?.())

  const rest = useFetchHook({
    immediate,
    loading,
    onRequest: async () => Api.itemCommon.addCommonItem(fetchParams.value),
  })

  return { ...rest }
}
