import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  watchParams?: boolean
  params?: () => API.MarkerSearchVo
}

export const useMarker = (options: MarkerHookOptions = {}) => {
  const { loading = ref(false), immediate, watchParams = true, params, onSuccess, onError } = options

  const markerList = ref<API.MarkerVo[]>([])

  const queryBody = computed(() => params?.())

  const { refresh } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.marker.searchMarker({}, {
      ...queryBody.value,
    }),
    onSuccess: (res) => {
      markerList.value = res.data ?? []
      onSuccess?.(res)
    },
    onError,
  })

  watchParams && params && watch(queryBody, refresh, { deep: true })

  return { markerList, updateMarkerList: refresh }
}
