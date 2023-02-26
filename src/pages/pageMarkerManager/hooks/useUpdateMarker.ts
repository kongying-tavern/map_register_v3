import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface UpdateMarkerHookOptions extends FetchHookOptions<API.RPageListVoMarkerVo> {
  params?: () => {
    ids: number[]
    refreshTime?: number
    content?: string
    hiddenFlag?: number
  }
  callback?: () => void
}

/** 更新点位列表 */
export const useUpdateMarker = (options: UpdateMarkerHookOptions = {}) => {
  const { immediate, params, callback } = options

  const fetchParams = computed(() => params?.())

  const { refresh: updateMarkerInfo, onSuccess, ...rest } = useFetchHook({
    immediate,
    onRequest: async () => {
      const { ids, ...rest } = fetchParams.value ?? {}
      const data: { [key: string]: string | number } = {}
      const promiseList: Promise<any>[] = []
      Object.entries(rest).forEach((kv) => {
        const [key, value] = kv
        if (value !== undefined)
          data[key] = value
      })

      ids?.forEach((id) => {
        promiseList.push(Api.marker.updateMarker({ id, ...data }, {}))
      })

      return Promise.all(promiseList)
    },
  })

  onSuccess(() => {
    if (callback)
      callback()
  })

  return { updateMarkerInfo, ...rest }
}
