import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 图标信息相关业务逻辑封装 */
export const useIconList = (params: ComputedRef<API.IconSearchVo>) => {
  const userNameCache = ref<Map<number, string>>(new Map())

  Api.sysUserController.getUserList({
    current: 0,
    size: 1000,
    sort: [
      'create_time-',
    ],
  }).then((res) => {
    if (!res.data)
      return
    const userList = res.data.record || []
    userList.forEach((item) => {
      if (item.id === undefined || item.nickname === undefined)
        return
      userNameCache.value.set(item.id, item.nickname)
    })
  })

  const { refresh, onSuccess, onError } = useFetchHook({
    onRequest: async () => {
      const { data: { record = [], total = 0 } = {} } = await Api.icon.listIcon(params.value)

      // 增加更新者名称
      type IconWithName = API.IconVo & { updaterName?: string }
      record.forEach((item: IconWithName) => {
        item.updaterId = item.updaterId || 1
        if (userNameCache.value.has(item.updaterId))
          item.updaterName = userNameCache.value.get(item.updaterId)
        else
          item.updaterName = '未知'
      })
      return { record, total }
    },
  })

  return { refresh, onSuccess, onError }
}
