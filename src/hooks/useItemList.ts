import type { Ref } from 'vue'
import type { Collection } from 'dexie'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'

interface ItemListHookOptions extends FetchHookOptions<API.RPageListVoItemVo> {
  params?: () => API.ItemSearchVo
  filterOptions?: () => API.ItemVo
}

/** 共享的物品列表 */
const itemList = ref<API.ItemVo[]>([]) as Ref<API.ItemVo[]>
/** 共享的物品列表加载态，可覆盖 */
const loading = ref(false)
/** 共享的物品id → 物品对象映射表 */
const itemMap = computed(() => itemList.value.reduce((seed, item) => {
  item.id !== undefined && (seed[item.id] = item)
  return seed
}, {} as Record<number, API.ItemVo>))

/** 物品列表与相关操作方法 */
export const useItemList = (options: ItemListHookOptions = {}) => {
  const { immediate, loading: scopedLoading, params, filterOptions } = options

  const fetchParams = computed(() => params?.())
  const filterParams = computed(() => filterOptions?.())

  const cachedItemMap = reactive<Record<number, API.ItemVo | undefined>>({})
  const getItem = (itemId?: number) => {
    if (itemId === undefined)
      return
    if (cachedItemMap[itemId] === undefined) {
      db.item.get(itemId).then((itemVo) => {
        cachedItemMap[itemId] = itemVo
      })
    }
    return cachedItemMap[itemId]
  }

  const { refresh: updateItemList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: async () => {
      const { areaIdList = [], typeIdList = [], current = 1, size = 10 } = fetchParams.value ?? {}
      const typeId = typeIdList[0]
      const exp = new RegExp(`${filterParams.value?.name ?? ''}`)
      let collection: Collection

      if (!areaIdList.length) {
        if (!filterParams.value?.name)
          return {}
        collection = db.item
          .toCollection()
          .filter(itemVo => exp.test(itemVo.name ?? ''))
      }
      else {
        collection = db.item
          .where('id')
          .anyOf(areaIdList)
          .and(itemVO => typeId === undefined ? true : Boolean(itemVO.typeIdList?.includes(typeId)))
        if (filterParams.value?.name)
          collection.filter(itemVo => exp.test(itemVo.name ?? ''))
      }

      const total = await collection.count()
      const record = await collection
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

  return { itemList, itemMap, updateItemList, getItem, onSuccess, pause, resume, ...rest }
}
