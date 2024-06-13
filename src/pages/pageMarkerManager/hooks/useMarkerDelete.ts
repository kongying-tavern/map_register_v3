import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

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
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `删除点位失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return {
    deleteMarker,
    onSuccess,
    onError,
    ...rest,
  }
}
