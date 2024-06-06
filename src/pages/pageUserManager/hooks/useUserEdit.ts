import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useUserEdit = (form: Ref<API.SysUserVo>, options: { loading: Ref<boolean> }) => {
  const { loading } = options

  const { refresh: submit, onError, onSuccess, ...rest } = useFetchHook({
    loading,
    onRequest: async () => {
      const {
        id,
        accessPolicy = [],
        logo = '',
        nickname = '',
        phone = '',
        qq = '',
        roleId,
      } = toValue(form)

      if (id === undefined)
        throw new Error('表单信息中用户 id 为空')

      await Api.user.updateUser({
        userId: id,
        accessPolicy,
        logo,
        nickname,
        phone,
        qq,
        roleId,
      })
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '编辑成功',
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `编辑失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return { submit, onSuccess, onError, ...rest }
}
