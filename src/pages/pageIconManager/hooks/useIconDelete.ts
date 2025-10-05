import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useIconDelete = () => {
  const { refresh: deleteIcon, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (icon: API.IconVo) => {
      await Api.icon.deleteIcon({ iconId: icon.id! })
      return icon
    },
  })

  onSuccess(() => ElMessage.success({
    message: '删除成功',
  }))

  onError(err => ElMessage.error({
    message: `删除图标失败，原因为：${err.message}`,
  }))

  return { loading, deleteIcon, onSuccess, ...rest }
}
