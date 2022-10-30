import type { Ref } from 'vue'
import { merge } from 'lodash'
import Api from '@/api/api'
import { messageFrom } from '@/utils'

export interface ItemListHookOptions {
  /** 可传入响应式的布尔值以重用外部 loading 状态 */
  loading?: Ref<boolean>
  /** 是否在组件挂载后立即请求 */
  immediate?: boolean
  /** 列表所需参数 */
  params?: () => API.ItemSearchVo
  /** 列表更新成功的回调 */
  onSuccess?: (list: API.ItemVo[], total: number) => void
  /** 列表更新失败的回调 */
  onError?: (err: Error) => void
}

export const useItemList = (options: ItemListHookOptions = {}) => {
  const {
    loading = ref(false),
    immediate = true,
    params,
    onSuccess,
    onError,
  } = options

  /** 列表数据 */
  const itemlist = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>

  /** 请求并更新列表 */
  const updateList = async () => {
    try {
      loading.value = true

      const mergedParams = merge({
        areaIdList: [],
        typeIdList: [],
        current: 1,
        size: 10,
      }, params?.() ?? {})

      const { data: { record = [], total = 0 } = {} } = await Api.item.listItemIdByType({}, mergedParams)
      itemlist.value = record

      onSuccess?.(record, total)
    }
    catch (err) {
      onError?.(new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    immediate && updateList()
  })

  return { itemlist, loading, updateList }
}
