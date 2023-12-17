import { ElMessage, ElMessageBox, ElText } from 'element-plus'
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
      <>确认删除点位<ElText type='warning'>{marker.markerTitle} (id:{marker.id})</ElText>？该操作不可逆。</>,
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
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `删除点位失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { confirmDeleteMarker, loading, ...rest }
}
