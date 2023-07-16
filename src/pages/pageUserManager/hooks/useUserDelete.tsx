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

  const confirmDelete = (users: API.SysUserVo | API.SysUserVo[]) => ElMessageBox.confirm(
    Array.isArray(users)
      ? <div>
          <div>该操作不可恢复，确认删除以下用户：</div>
          {users.map(user => <div>{user.username}</div>)}
        </div>
      : `该操作不可恢复，确认删除用户: ${users.username}？`,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await submitDeleteUser(users)
        instance.confirmButtonLoading = false
        done()
      },
    }).catch(() => false)

  return { loading, confirmDelete, onSuccess, onError }
}
