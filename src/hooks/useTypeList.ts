import type Node from 'element-plus/es/components/tree/src/model/node'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export interface TypeHookOptions extends FetchHookOptions<API.RPageListVoItemTypeVo> {
  params?: () => API.PageAndTypeListVo
}

export interface ExtraItemTypeVo extends API.ItemTypeVo {
  children: ExtraItemTypeVo[]
}

export const useTypeList = (options: TypeHookOptions = {}) => {
  const { immediate = true, loading = ref(false), params } = options

  const typeList = ref<API.ItemTypeVo[]>([])

  // TODO 未完成
  const typeTree = computed(() => {
    return typeList.value
  })

  const typeId = ref<number>()

  const withChildren = (items: API.ItemTypeVo[]) => {
    return items.map(item => ({ ...item, children: [] }))
  }

  const { refresh, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.itemType.listItemType({ self: 1 }, { typeIdList: [], current: 1, size: 1000, ...params?.() }),
    onSuccess: (res) => {
      typeList.value = withChildren(res?.data?.record ?? [])
    },
  })

  onSuccess(({ data: { record = [] } = {} }) => {
    typeList.value = withChildren(record)
  })

  const onTypeLoad = async (node: Node, resolve: (data: ExtraItemTypeVo[]) => void) => {
    if (node.level === 0)
      return
    const data = node.data as ExtraItemTypeVo
    const { data: { record = [] } = {} } = await Api
      .itemType
      .listItemType({ self: 1 }, { current: 1, size: 1000, typeIdList: [data.typeId as number] })
    resolve(withChildren(record))
  }

  return { typeId, typeList, typeTree, updateTypeList: refresh, onTypeLoad, onSuccess, ...rest }
}
