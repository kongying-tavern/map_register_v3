import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface MarkerListHookOptions extends FetchHookOptions<API.RPageListVoMarkerVo> {
  params?: () => API.PageSearchVo
}

interface MarkerSearchHookOptions extends FetchHookOptions<API.RPageListVoMarkerVo> {
  params?: () => API.MarkerSearchVo & {
    markerIdList: number[]
    current: number
    size: number
  }
}

const markerList = ref<API.MarkerVo[]>([]) as Ref<API.MarkerVo[]>
const totalCount = ref<number>(0)

/** 获取点位列表 */
export const useMarkerList = (options: MarkerListHookOptions = {}) => {
  const { immediate, loading: scopedLoading, params } = options

  const fetchParams = computed(() => params?.())

  const { refresh: updateMarkerList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading,
    onRequest: async () => {
      const { current = 1, size = 10 } = fetchParams.value ?? {}
      return Api.marker.listMarkerPage({}, { current, size })
    },
  })

  onSuccess(({ data: { record = [], total = 0 } = {} }) => {
    markerList.value = record
    totalCount.value = total
  })

  const { pause, resume } = pausableWatch(fetchParams, updateMarkerList, { deep: true })

  return { markerList, totalCount, updateMarkerList, onSuccess, pause, resume, ...rest }
}

/** 根据各种条件筛选查询点位信息 支持根据末端地区、末端类型、物品来进行查询，不填默认分页查询 */
// TODO 接口分页
export const useSearchMarkerList = (options: MarkerSearchHookOptions = {}) => {
  const { immediate, loading: scopedLoading, params } = options

  const fetchParams = computed(() => params?.())

  const { refresh: searchMarkerList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading,
    onRequest: async () => {
      const {
        areaIdList = [],
        itemIdList = [],
        typeIdList = [],
        getBeta = false,
        hiddenFlagList = [],
        markerIdList = [],
        current = 1,
        size = 10,
      } = fetchParams.value ?? {}
      // 按Id查询
      if (markerIdList.length) {
        return Api.marker.listMarkerById({}, markerIdList)
      }
      else {
        const reqBody: API.MarkerSearchVo & { current: number; size: number } = {
          getBeta,
          hiddenFlagList,
          current,
          size,
        }
        if (areaIdList.length)
          reqBody.areaIdList = areaIdList
        else if (itemIdList.length)
          reqBody.itemIdList = itemIdList
        else if (typeIdList.length)
          reqBody.typeIdList = typeIdList
        else
          return Api.marker.listMarkerPage({}, { current, size })
        return Api.marker.searchMarker({}, reqBody)
      }
    },
  })

  // @ts-expect-error-next-line
  const checkIsObject: (v: API.MarkerVo[] | API.PageListVoMarkerVo) => v is API.PageListVoMarkerVo = (data) => {
    if (Object.prototype.toString.call(data).includes('Object'))
      return true
    return false
  }

  onSuccess((response: API.RPageListVoMarkerVo | API.RListMarkerVo) => {
    const data = response.data
    if (!data)
      return
    if (checkIsObject(data)) {
      markerList.value = data.record!
      totalCount.value = data.total!
    }
    else {
      const { current = 1, size = 10 } = fetchParams.value ?? {}
      markerList.value = data.slice((current - 1) * size, current * size)
      totalCount.value = data.length
    }
  })

  const { pause, resume } = pausableWatch(fetchParams, searchMarkerList, { deep: true })

  return { markerList, totalCount, searchMarkerList, onSuccess, pause, resume, ...rest }
}
