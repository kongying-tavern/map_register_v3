import { ElMessage, ElNotification } from 'element-plus'
import { omit } from 'lodash'
import { useFetchHook } from '@/hooks'
import { useCondition } from '@/pages/pageMapV2/hooks'
import db from '@/database'
import Api from '@/api/api'

export const useMarkerPositionEdit = () => {
  const conditionManager = useCondition()

  const { refresh: moveMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (markers: API.MarkerVo[]) => {
      const results = {
        success: [] as number[],
        failed: [] as number[],
      }
      await Promise.all(markers.map(marker => Api.marker
        .updateMarker(omit(marker, 'createTime, updateTime'))
        .then(() => results.success.push(marker.id!))
        .catch(() => results.failed.push(marker.id!)),
      ))
      const { data: updateMarkers = [] } = await Api.marker.listMarkerById({}, results.success)
      await db.marker.bulkPut(updateMarkers)
      return results
    },
  })

  onSuccess(async ({ success, failed }) => {
    if (success.length > 0) {
      ElNotification.success({
        title: '移动点位',
        message: `点位 ${success.join(' , ')} 移动成功`,
        offset: 48,
      })
      await conditionManager.requestMarkersUpdate()
    }
    // TODO 不完全成功，提示方式可能需要改进
    if (failed.length > 0) {
      ElNotification.error({
        title: '移动点位',
        message: `点位 ${failed.join(' , ')} 移动失败`,
        offset: 48,
      })
    }
  })

  onError(err => ElMessage.error({
    message: `移动点位失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { moveMarker, onSuccess, onError, ...rest }
}
