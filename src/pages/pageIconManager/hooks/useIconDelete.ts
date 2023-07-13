import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useIconDelete = () => {
  const { refresh: submitDeleteIcon, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (icon: API.IconVo) => {
      await Api.icon.deleteIcon({ iconId: icon.id! })
    },
  })

  const confirmDeleteIcon = async (icon: API.IconVo) => ElMessageBox.confirm(`该操作不可恢复，确认删除图标 【${icon.name}】？`, '警告', {
    confirmButtonClass: 'el-button--danger',
    beforeClose: async (action, instance, done) => {
      if (loading.value)
        return
      if (action !== 'confirm')
        return done()
      instance.confirmButtonLoading = true
      await submitDeleteIcon(icon)
      instance.confirmButtonLoading = false
      done()
    },
  }).catch(() => false)

  onSuccess(() => ElMessage.success({
    message: '删除成功',
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `删除图标失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { confirmDeleteIcon, onSuccess, ...rest }
}
