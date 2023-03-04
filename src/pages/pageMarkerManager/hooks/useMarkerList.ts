import type { Ref } from 'vue'
import type { Collection } from 'dexie'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'

interface MarkerSearchHookOptions extends Omit<FetchHookOptions<API.RPageListVoMarkerVo>, 'immediate'> {
  pagination: Ref<{
    total: number
    current: number
    pageSize: number
  }>
  params: () => { markerIdList?: number[] }
  & API.PageSearchVo
  & API.MarkerSearchVo
}

const markerList = ref<API.MarkerVo[]>([]) as Ref<API.MarkerVo[]>

/** 根据各种条件筛选查询点位信息 支持根据末端地区、末端类型、物品来进行查询，不填默认分页查询 */
// TODO 接口分页
export const useSearchMarkerList = (options: MarkerSearchHookOptions) => {
  const { pagination, loading: scopedLoading, params } = options

  const fetchParams = computed(() => params?.())

  const { refresh: updateMarkerList, onSuccess, ...rest } = useFetchHook<{ record: API.MarkerVo[]; total: number }>({
    immediate: true,
    loading: scopedLoading,
    onRequest: async () => {
      const {
        // getBeta = false, // TODO 逻辑可能删除
        // hiddenFlagList = [], // // TODO 逻辑可能删除
        areaIdList = [],
        typeIdList = [],
        itemIdList = [],
        markerIdList = [],
        current = 1,
        size = 10,
      } = fetchParams.value ?? {}

      const isMarkerIdEmpty = markerIdList.length < 1
      const isAreaEmpty = areaIdList.length < 1
      const isTypeEmpty = typeIdList.length < 1
      const isItemEmpty = itemIdList.length < 1

      // TODO 当查询逻辑很复杂时，响应时间可能会达到百毫秒量级，需要优化查询的方式
      let collection: Collection<API.MarkerVo, number> | undefined

      // 1. id 查询最优先，覆盖其他条件
      if (!isMarkerIdEmpty) {
        collection = db.marker.where('id').anyOf(markerIdList)
      }
      // 2. 其他情况下，由于物品类型制约了物品的选择，对于点位只需要判断是否满足地区和物品的条件即可
      else {
        if (!isAreaEmpty) {
          const queryItems = (await db.item.where('areaId').anyOf(areaIdList).toArray()).map(itemVo => itemVo.itemId as number)
          collection = db.marker.where('itemIdList').anyOf(queryItems)
        }
        if (!isTypeEmpty && isItemEmpty) {
          const queryItems = (await db.item.where('typeIdList').anyOf(typeIdList).toArray()).map(itemVo => itemVo.itemId as number)
          collection = collection
            ? collection.and(markerVo => markerVo.itemList?.find(item => queryItems.includes(item.itemId as number)) !== undefined)
            : db.marker.where('itemIdList').anyOf(queryItems)
        }
        if (!isItemEmpty) {
          collection = collection
            ? collection.and(markerVo => markerVo.itemList?.find(item => itemIdList.includes(item.itemId as number)) !== undefined)
            : db.marker.where('itemIdList').anyOf(itemIdList)
        }
      }

      // 0. 当条件为空时，则查询全部点位
      collection ??= db.marker.toCollection()

      let record = await collection.toArray()
      // collection.count() 存在 bug，这里使用手动分页和计数
      const total = record.length
      record = record.slice((current - 1) * size, current * size)
      return { total, record }
    },
  })

  onSuccess(({ record }) => {
    markerList.value = record
  })

  // 由于混合对象 watch，这里需要进行对象脏检查，只有参数不同时才进行新的搜索
  watch(fetchParams, (newParams, oldParams) => {
    const { current: c1, size: s1, ...restNew } = newParams ?? {}
    const { current: c2, size: s2, ...restOld } = oldParams ?? {}
    const obj1 = JSON.stringify({ c: c1, s: s1 })
    const obj2 = JSON.stringify({ c: c2, s: s2 })
    const obj3 = JSON.stringify(restNew)
    const obj4 = JSON.stringify(restOld)
    const isPaginationSame = obj1 === obj2
    const isOtherParamsSame = obj3 === obj4
    if (isPaginationSame && isOtherParamsSame)
      return
    if (!isOtherParamsSame)
      pagination.value.current = 1
    updateMarkerList()
  }, { deep: true })

  return { markerList, updateMarkerList, onSuccess, ...rest }
}
