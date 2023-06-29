import type { Ref } from 'vue'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export interface IconListHookOptions {
  params: Ref<API.IconSearchVo>
  pagination?: Ref<{
    total: number
    current: number
    pageSize: number
  }>
  selectedType: Ref<number>
}

/** 图标信息相关业务逻辑封装 */
export const useIconWithName = (options: IconListHookOptions) => {
  const { pagination = ref({ current: 0, pageSize: 10 }), selectedType } = options

  const userNameCache = ref<Map<number, string>>(new Map())

  const { refresh, onSuccess, onError } = useFetchHook({
    onRequest: async () => {
      const { current, pageSize } = pagination.value
      const { data: { record = [], total = 0 } = {} } = await Api.icon.listIcon({
        size: pageSize,
        current,
        typeIdList: selectedType.value === -1 ? undefined : [selectedType.value],
      })
      type IconWithName = API.IconVo & { updaterName?: string }
      record.forEach((item: IconWithName) => {
        item.updaterId = item.updaterId || 1
        if (userNameCache.value.has(item.updaterId)) {
          item.updaterName = userNameCache.value.get(item.updaterId)
          return
        }
        Api.sysUserController.getUserInfo({
          userId: item.updaterId,
        }).then((res) => {
          if (!res.data)
            return
          if (res.data.id === undefined || res.data.nickname === undefined)
            return
          item.updaterName = res.data.nickname
          userNameCache.value.set(res.data.id, res.data.nickname)
        })
      })
      return { record, total }
    },
  })

  return { refresh, onSuccess, onError }
}
