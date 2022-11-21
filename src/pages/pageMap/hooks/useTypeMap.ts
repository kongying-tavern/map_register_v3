import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export interface TypeHookOptions extends FetchHookOptions<API.RPageListVoItemTypeVo> {
  params?: () => API.PageAndTypeListVo
}

export const useTypeList = (options: TypeHookOptions = {}) => {
  const { immediate = true, loading = ref(false), params, onSuccess, onError } = options

  const typeList = ref<API.ItemTypeVo[]>([])

  // TODO 未完成
  const typeTree = computed(() => {
    return typeList.value
  })

  const typeId = ref<number>()

  const { refresh } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.itemType.listItemType({ self: 1 }, { typeIdList: [], current: 1, size: 1000, ...params?.() }),
    onSuccess: (res) => {
      typeList.value = res?.data?.record ?? []
      onSuccess?.(res)
    },
    onError,
  })

  return { typeId, typeList, typeTree, loading, updateTypeList: refresh }
}
