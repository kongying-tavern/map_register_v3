import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useUserKickOut = (form: Ref<API.SysUserVo>) => {
  const { refresh: submit, onError, onSuccess, ...rest } = useFetchHook({
    onRequest: async () => {
      const { id } = toValue(form)
      if (id === undefined)
        throw new Error('用户 id 为空')
      await Api.user.kickOutUser({ workId: id })
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '注销用户成功',
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `注销用户失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return { submit, onSuccess, onError, ...rest }
}
