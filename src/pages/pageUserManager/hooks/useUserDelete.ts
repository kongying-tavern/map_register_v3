import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useUserDelete = (form: Ref<API.SysUserVo>) => {
  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const { id } = toValue(form)
      if (id === undefined)
        throw new Error('用户 id 为空')
      await Api.user.deleteUser({ workId: id })
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '删除成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `删除失败，原因为：${err.message}`,
    })
  })

  return { submit, onSuccess, onError, ...rest }
}
