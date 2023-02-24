import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'

interface ItemListHookOptions extends FetchHookOptions<API.RPageListVoItemVo> {
  params?: () => API.ItemSearchVo
}

interface ItemUpdateHookOptions extends FetchHookOptions<API.RBoolean> {
  params?: () => API.ItemVo[]
  editSame?: boolean
}

/** 共享的物品列表 */
const itemList = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>
/** 共享的物品列表加载态，可覆盖 */
const loading = ref(false)
/** 共享的物品id → 物品对象映射表 */
const itemMap = computed(() => itemList.value.reduce((seed, item) => {
  item.itemId !== undefined && (seed[item.itemId] = item)
  return seed
}, {} as Record<number, API.ItemVo>))

/** 物品列表与相关操作方法 */
export const useItemList = (options: ItemListHookOptions = {}) => {
  const { immediate, loading: scopedLoading, params } = options

  const fetchParams = computed(() => params?.())

  const { refresh: updateItemList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: async () => {
      const { areaIdList = [], typeIdList = [], current = 1, size = 10 } = fetchParams.value ?? {}
      const typeId = typeIdList[0]
      if (!areaIdList.length)
        return {}
      const total = await db.item.count()
      const record = await db.item
        .where('areaId')
        .anyOf(areaIdList)
        .and(itemVO => typeId === undefined ? true : Boolean(itemVO.typeIdList?.includes(typeId)))
        .offset((current - 1) * size)
        .limit(size)
        .toArray()
      return { record, total }
    },
  })

  onSuccess(({ record = [] }) => {
    itemList.value = record.sort(({ sortIndex: ia }, { sortIndex: ib }) => {
      if (ia === undefined || ib === undefined)
        return 0
      return ib - ia
    })
  })

  const { pause, resume } = pausableWatch(fetchParams, updateItemList, { deep: true })

  return { itemList, itemMap, updateItemList, onSuccess, pause, resume, ...rest }
}

/** 修改某几个物品 */
export const useItemUpdate = (options: ItemUpdateHookOptions = {}) => {
  const { immediate = false, editSame = false, loading = ref(false), params } = options

  const fetchParams = computed(() => params?.())

  const { refresh, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => Api.item.updateItem({ editSame: editSame ? 1 : 0 }, fetchParams.value ?? []),
  })

  return { refresh, ...rest }
}

interface ItemDeleteHookOptions extends FetchHookOptions<API.RBoolean> {
  params: () => number[]
}

/** 按itemId列表删除几个物品 */
export const useItemDelete = (options: ItemDeleteHookOptions) => {
  const { immediate = false, loading = ref(false), params } = options

  const fetchParams = computed(() => params?.())

  const rest = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      const missions = fetchParams.value.map(itemId => Api.item.deleteItem({ itemId }))
      await Promise.allSettled(missions)
      /** @TODO 批量请求，可能会遇到来自服务器或网络错误无法收集，暂时先一律忽略 */
      return { error: false }
    },
  })

  return { ...rest }
}

interface ItemCreateHookOptions extends FetchHookOptions<API.RLong> {
  params: () => API.ItemVo
}

/** 新增物品 */
export const useItemCreate = (options: ItemCreateHookOptions) => {
  const { immediate = false, loading = ref(false), params } = options

  const fetchParams = computed(() => params?.())

  const rest = useFetchHook({
    immediate,
    loading,
    onRequest: async () => Api.item.createItem(fetchParams.value),
  })

  return { ...rest }
}
