import { ElMessage, ElNotification } from 'element-plus'
import { useFetchHook } from '@/hooks'
import db from '@/database'
import Api from '@/api/api'
import { useMapStateStore, useTileStore } from '@/stores'

export const useMarkerPositionEdit = () => {
  const tileStore = useTileStore()
  const mapStateStore = useMapStateStore()

  const { refresh: moveMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (mapStateStore.mission?.type !== 'markerDragging')
        throw new Error('任务类型冲突')

      const tileConfig = tileStore.currentTileConfig
      if (!tileConfig)
        throw new Error('无法获取当前图层配置')

      const [cx, cy] = tileConfig.tile.center

      const currentLayerMarkersMap = mapStateStore.currentLayerMarkersMap
      const missions = mapStateStore.mission.value

      const form: API.MarkerVo[] = []

      for (const id in missions) {
        const marker = currentLayerMarkersMap[id]
        if (!marker)
          continue
        const {
          render: _1,
          createTime: _2,
          updateTime: _3,
          ...rest
        } = marker
        const [x, y] = missions[id]
        form.push({
          ...rest,
          position: `${x - cx},${y - cy}`,
        })
      }

      if (!form.length)
        throw new Error('已验证的提交信息为空')

      const updateIds = await Promise.all(form.map(marker => Api.marker.updateMarker(marker).then(() => marker.id!)))

      const { data: updatedMarkers = [] } = await Api.marker.listMarkerById({}, updateIds)
      await db.marker.bulkPut(updatedMarkers)
    },
  })

  const clearState = () => {
    mapStateStore.setMission(null)
    mapStateStore.setViewPortLocked(false)
  }

  onSuccess(() => {
    ElNotification.success({
      title: '移动点位',
      message: '操作成功',
      offset: 48,
    })
    clearState()
  })

  onError(err => ElMessage.error({
    message: `移动点位失败，原因为：${err.message}`,
    offset: 48,
  }))

  onSuccess(clearState)

  return { moveMarker, clearState, onSuccess, onError, ...rest }
}
