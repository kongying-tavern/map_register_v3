import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface MarkerListHookOptions extends FetchHookOptions<API.RPageListVoMarkerVo> {
  params?: () => API.PageSearchVo
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
