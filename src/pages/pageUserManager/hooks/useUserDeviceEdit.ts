import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useUserDeviceEdit = (data: Ref<API.SysUserDeviceVo | undefined>, options: { loading: Ref<boolean> }) => {
  const { loading } = options

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    loading,
    onRequest: async (status: unknown) => {
      const { id } = toValue(data) ?? {}
      if (id === undefined)
        throw new Error('设备 id 为空')

      await Api.sysUserDeviceController.updateDevice({
        id,
        status: status as API.SysUserDeviceVo['status'],
      })

      return status as API.SysUserDeviceVo['status']
    },
  })

  onSuccess((status) => {
    if (!data.value)
      return
    data.value.status = status
  })

  return {
    submit,
    onSuccess,
    onError,
    ...rest,
  }
}
