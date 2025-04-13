import type { ElForm } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useUserEdit = (form: Ref<API.SysUserVo>, options: { loading: Ref<boolean> }) => {
  const { loading } = options

  const formRef = shallowRef<InstanceType<typeof ElForm>>()

  const { refresh: submit, onError, onSuccess, ...rest } = useFetchHook({
    loading,
    onRequest: async () => {
      const isValid = formRef.value?.validate().then(() => true).catch(() => false)
      if (!isValid)
        throw new Error('表单校验未通过')

      const {
        id,
        accessPolicy = [],
        logo = '',
        nickname = '',
        phone = '',
        qq = '',
        roleId,
        remark = '',
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
        remark,
      })
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '编辑成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `编辑失败，原因为：${err.message}`,
    })
  })

  return {
    formRef,
    submit,
    onSuccess,
    onError,
    ...rest,
  }
}
