import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks/useFetch'
import Api from '@/api/api'

export const useUserDelete = () => {
  const { loading, refresh: submitDeleteUser, onSuccess, onError } = useFetchHook({
    onRequest: async (users: API.SysUserVo | API.SysUserVo[]) => {
      const mission = Array.isArray(users)
        ? Promise.allSettled(users.map(user => Api.sysUserController.deleteUser({ workId: user.id! })))
        : Api.sysUserController.deleteUser({ workId: users.id! })
      await mission
    },
  })

  onSuccess(() => ElMessage.success({
    message: '删除成功',
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `删除失败，原因为：${err.message}`,
    offset: 48,
  }))

  const confirmDelete = (maybeUsers: API.SysUserVo | API.SysUserVo[]) => ElMessageBox.confirm(
    Array.isArray(maybeUsers)
      ? <div>
          <div>将删除以下 {maybeUsers.length} 个用户：</div>
          {maybeUsers.map((item, index) => <div>&emsp;{index + 1}. <span style="color: #FB923C">{item.nickname} (id: {item.id})</span></div>)}
          <div>该操作不可逆，请确认？</div>
        </div>
      : <div>将删除用户<span style="color: #FB923C">{maybeUsers.nickname} (id: {maybeUsers.id})</span>，该操作不可逆，请确认？</div>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await submitDeleteUser(maybeUsers)
        instance.confirmButtonLoading = false
        done()
      },
    },
  ).catch(() => false)

  return { loading, confirmDelete, onSuccess, onError }
}
