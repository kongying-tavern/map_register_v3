import Api from '@/api/api'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface UserDeviceHookOptions {
  pagination: Ref<PaginationState>
}

export const useUserDevice = (form: Ref<API.SysUserVo>, options: UserDeviceHookOptions) => {
  const { pagination } = options

  const deviceList = shallowRef<API.SysUserDeviceVo[]>([])

  const { onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const { id: userId } = toValue(form)
      if (userId === undefined)
        throw new Error('用户 id 为空')

      const { current, pageSize } = toValue(pagination)

      const { data: { record = [], total = 0 } = {} } = await Api.device.searchPage({
        current,
        sort: ['lastLoginTime-'],
        size: pageSize,
        userId,
      })

      return { record, total }
    },
  })

  onSuccess(({ record, total }) => {
    deviceList.value = record
    pagination.value.total = total
  })

  return {
    onSuccess,
    deviceList,
    ...rest,
  }
}
