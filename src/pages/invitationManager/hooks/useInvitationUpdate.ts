import type { Awaitable } from '@vueuse/core'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

interface InvitationUpdateHookOptions {
  form: Ref<API.SysUserInvitationVo>
  validate: () => Awaitable<boolean | undefined>
}

export const useInvitationUpdate = (options: InvitationUpdateHookOptions) => {
  const { form, validate } = options

  const { onSuccess, onError, ...rest } = useFetchHook({
    initialValue: {},
    shallow: true,
    onRequest: async () => {
      const isValid = await validate()
      if (!isValid)
        throw new Error('校验未通过', { cause: 'validate' })
      const { id, code, username, accessPolicy, roleId, remark } = form.value
      return await Api.invitation.updateInvitation({
        id,
        code,
        username,
        accessPolicy,
        roleId,
        remark,
      })
    },
  })

  onSuccess(() => {
    ElMessage.success('更新邀请码成功')
  })

  onError((err) => {
    if (err.cause === 'validate')
      return
    ElMessage.error(`更新邀请码失败，原因为：${err.message}`)
  })

  return {
    onSuccess,
    onError,
    ...rest,
  }
}
