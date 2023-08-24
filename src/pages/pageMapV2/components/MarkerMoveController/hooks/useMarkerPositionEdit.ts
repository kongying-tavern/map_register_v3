import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { useCondition } from '@/pages/pageMapV2/hooks'
import db from '@/database'
import Api from '@/api/api'

export const useMarkerPositionEdit = () => {
  const conditionManager = useCondition()

  const { refresh: moveMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (markers: API.MarkerVo[]) => {
      await Promise.allSettled(markers.map(marker => Api.marker.updateMarker(marker)))

      const { data: updateMarkers = [] } = await Api.marker.listMarkerById({}, markers.map(marker => marker.id!))

      await db.marker.bulkPut(updateMarkers)

      await conditionManager.requestMarkersUpdate()
    },
  })

  onSuccess(() => ElMessage.success({
    message: '移动点位成功',
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `移动点位失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { moveMarker, onSuccess, onError, ...rest }
}
