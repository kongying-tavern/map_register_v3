import { ElMessage, ElMessageBox } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import db from '@/database'

export const useMarkerDelete = () => {
  const { refresh: deleteMarker, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (markerId: number) => {
      await Api.marker.deleteMarker({ markerId })
      await db.marker.delete(markerId)
    },
  })

  const confirmDeleteMarker = async (marker: API.MarkerVo | null) => {
    if (!marker)
      return
    ElMessageBox.confirm(
      '确认删除点位',
      '警告',
      {
        confirmButtonClass: 'el-button--danger',
        beforeClose: async (action, instance, done) => {
          if (loading.value)
            return
          if (action !== 'confirm')
            return done()
          instance.confirmButtonLoading = true
          await deleteMarker(marker.id!)
          instance.confirmButtonLoading = false
          done()
        },
      },
    ).catch(() => false)
  }

  onSuccess(() => ElMessage.success({
    message: '删除点位成功',
  }))

  onError(err => ElMessage.error({
    message: `删除点位失败，原因为：${err.message}`,
  }))

  return { confirmDeleteMarker, loading, ...rest }
}
