import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

export interface MarkerListHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  params?: () => API.MarkerSearchVo
  fetchWhenChange?: boolean
}

export const useMarkerList = (options: MarkerListHookOptions = {}) => {
  const { immediate, loading = ref(false), fetchWhenChange, params, onSuccess, onError } = options

  const markerList = ref<API.MarkerVo[]>([])

  const watchParams = computed(() => params?.())

  const { refresh } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.marker.searchMarker({}, {
      ...watchParams.value,
    }),
    onSuccess: (res) => {
      markerList.value = res.data ?? []
      onSuccess?.(res)
    },
    onError,
  })

  fetchWhenChange && watch(watchParams, refresh, { deep: true })

  return { markerList, loading, updateMarkerList: refresh }
}
