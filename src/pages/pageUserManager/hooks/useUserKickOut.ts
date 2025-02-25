import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

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
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `注销用户失败，原因为：${err.message}`,
    })
  })

  return { submit, onSuccess, onError, ...rest }
}
