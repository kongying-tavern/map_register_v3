import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const usePasswordUpdate = (form: Ref<API.SysUserPasswordUpdateVo>) => {
  const { refresh: submit, onError, onSuccess, ...rest } = useFetchHook({
    onRequest: async () => {
      const {
        userId,
        oldPassword = '',
        password = '',
      } = toValue(form)

      if (userId === undefined)
        throw new Error('表单信息中用户 id 为空')

      await Api.sysUserController.updateUserPasswordByAdmin({
        userId,
        password,
        oldPassword,
      })
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '密码修改成功',
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `密码修改失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return { submit, onSuccess, onError, ...rest }
}
