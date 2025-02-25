import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useMarkerDelete = () => {
  const { refresh: deleteMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (marker: API.MarkerVo) => {
      if (marker.id === undefined)
        throw new Error('点位 id 为空')

      await Api.marker.deleteMarker({ markerId: marker.id! })

      return marker
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '删除点位成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `删除点位失败，原因为：${err.message}`,
    })
  })

  return {
    deleteMarker,
    onSuccess,
    onError,
    ...rest,
  }
}
