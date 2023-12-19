import type { Ref } from 'vue'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'

export interface MarkerSearchParams {
  areaIdList: number[]
  typeIdList: number[]
  itemIdList: number[]
  markerIdList: number[]
}

export interface MarkerSearchHookOptions {
  pagination: Ref<PaginationState>
  getParams: () => MarkerSearchParams
}

const markerList = ref<API.MarkerVo[]>([]) as Ref<API.MarkerVo[]>

/** 根据各种条件筛选查询点位信息 支持根据末端地区、末端类型、物品来进行查询，不填默认分页查询 */
// TODO 接口分页
export const useSearchMarkerList = (options: MarkerSearchHookOptions) => {
  const { pagination, getParams } = options

  const params = computed(() => getParams())

  const hasIntersection = (a: number[], b: number[]) => {
    const numSet = a.length < b.length ? new Set(a) : new Set(b)
    const arr = a.length < b.length ? b : a
    for (const num of arr) {
      if (numSet.has(num))
        return true
    }
    return false
  }

  const { refresh: updateMarkerList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const { areaIdList, typeIdList, itemIdList, markerIdList } = params.value
      const { current, pageSize: size } = pagination.value

      const queryAreaItemIds = areaIdList.length > 0 ? (await db.item.where('areaId').anyOf(areaIdList).toArray()).map(itemVo => itemVo.id!) : undefined
      const queryTypeItemIds = typeIdList.length > 0 ? (await db.item.where('typeIdList').anyOf(typeIdList).toArray()).map(itemVo => itemVo.id!) : undefined
      const idSet = new Set(markerIdList)

      // 1. 优先查询包含地区
      let collection = queryAreaItemIds ? db.marker.where('itemIdList').anyOf(queryAreaItemIds) : db.marker.toCollection()

      collection = collection.and(({ id, itemList = [] }) => {
        const itemLinkIds = itemList.map(itemLink => itemLink.itemId!)

        // 2. 查询包含类型
        if (queryTypeItemIds && !hasIntersection(itemLinkIds, queryTypeItemIds))
          return false

        // 3. 查询包含物品
        if (itemIdList.length && !hasIntersection(itemLinkIds, itemIdList))
          return false

        // 4. 查询包含 id
        if (markerIdList.length && !idSet.has(id!))
          return false

        return true
      })

      const totalMarkers = await collection.toArray()

      const offset = (current - 1) * size
      const markers = totalMarkers.slice(offset, offset + size)
      const total = totalMarkers.length

      return { markers, total }
    },
  })

  onSuccess(({ markers, total }) => {
    markerList.value = markers
    pagination.value.total = total
  })

  const resetPaginationUpdate = () => {
    pagination.value.current = 1
    updateMarkerList()
  }

  watch(() => pagination.value.current, updateMarkerList)
  watch(() => [pagination.value.pageSize], resetPaginationUpdate)
  watchDebounced(() => params.value, resetPaginationUpdate, { debounce: 500 })

  return { markerList, updateMarkerList, onSuccess, ...rest }
}
