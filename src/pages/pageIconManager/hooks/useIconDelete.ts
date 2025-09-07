import { ElMessage, ElMessageBox } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useIconDelete = () => {
  const { refresh: submitDeleteIcon, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (icon: API.IconVo) => {
      await Api.icon.deleteIcon({ iconId: icon.id! })
    },
  })

  const confirmDeleteIcon = async (icon: API.IconVo) => ElMessageBox.confirm(
    `该操作不可恢复，确认删除图标 ${icon.tag} ？`,
    '警告',
    {
      type: 'warning',
      closeOnClickModal: false,
      closeOnPressEscape: false,
      closeOnHashChange: false,
      showClose: false,
      distinguishCancelAndClose: true,
      cancelButtonClass: 'el-button--primary el-button--danger',
      cancelButtonText: '确定',
      confirmButtonClass: 'el-button--info is-text',
      confirmButtonText: '取消',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'cancel')
          return done()
        instance.cancelButtonLoading = true
        await submitDeleteIcon(icon)
        instance.cancelButtonLoading = false
        done()
      },
    },
  )
    .catch(() => false)

  onSuccess(() => ElMessage.success({
    message: '删除成功',
  }))

  onError(err => ElMessage.error({
    message: `删除图标失败，原因为：${err.message}`,
  }))

  return { confirmDeleteIcon, onSuccess, ...rest }
}
