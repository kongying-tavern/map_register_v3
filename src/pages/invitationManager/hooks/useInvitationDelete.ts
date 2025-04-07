import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useInvitationDelete = () => {
  const { onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async ({ id: invitationId }: API.SysUserInvitationVo) => {
      if (invitationId === undefined)
        throw new Error('ID 为空')
      await Api.invitation.deleteInvitation({ invitationId })
      return invitationId
    },
  })

  onSuccess(() => {
    ElMessage.success('删除邀请码成功')
  })

  onError((err) => {
    ElMessage.error(`删除邀请码失败，原因为：${err.message}`)
  })

  return {
    onSuccess,
    onError,
    ...rest,
  }
}
