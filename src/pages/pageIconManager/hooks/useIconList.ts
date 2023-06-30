import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 图标信息相关业务逻辑封装 */
export const useIconList = (params: ComputedRef<API.IconSearchVo>) => {
  const { refresh, onSuccess, onError } = useFetchHook({
    onRequest: async () => {
      const { data: { record = [], total = 0 } = {} } = await Api.icon.listIcon(params.value)

      return { record, total }
    },
  })

  return { refresh, onSuccess, onError }
}
