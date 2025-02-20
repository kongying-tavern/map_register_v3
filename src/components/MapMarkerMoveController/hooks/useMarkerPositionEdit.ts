import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import { useMapStateStore, useMarkerStore, useTileStore } from '@/stores'

export const useMarkerPositionEdit = () => {
  const tileStore = useTileStore()
  const mapStateStore = useMapStateStore()
  const markerStore = useMarkerStore()

  const {
    isEmpty: isMissionEmpty,
    isProcessing: isDraggingProcessing,
    data: draggingMission,
    update: updateDragging,
    updateBy: updateDraggingBy,
  } = mapStateStore.subscribeMission('markerDragging', () => new Map())

  const { refresh: moveMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const tileConfig = tileStore.currentTileConfig
      if (!tileConfig)
        throw new Error('无法获取当前图层配置')

      const [cx, cy] = tileConfig.tile.center

      const { currentMarkerIdMap } = mapStateStore
      const missions = draggingMission.value

      const form: API.MarkerVo[] = []

      missions.forEach(([x, y], id) => {
        const marker = currentMarkerIdMap.get(id)
        if (!marker)
          return
        const {
          render: _1,
          createTime: _2,
          updateTime: _3,
          ...rest
        } = marker
        form.push({
          ...rest,
          position: `${x - cx},${y - cy}`,
        })
      })

      if (!form.length)
        throw new Error('已验证的提交信息为空')

      ElMessage.warning({
        message: '操作已提交，正在验证中...',
        duration: 0,
      })

      const updateIds = await Promise.all(form.map(marker => Api.marker.updateMarker(marker).then(() => marker.id!)))

      await markerStore.afterUpdated(updateIds)

      return updateIds
    },
  })

  const clearState = () => {
    mapStateStore.setTempMarkers('markerDragging', [])
    updateDragging(null)
  }

  onSuccess(() => {
    ElMessage.closeAll('warning')
    ElMessage.success({
      message: '操作成功',
    })
    clearState()
  })

  onError(err => ElMessage.error({
    message: `移动点位失败，原因为：${err.message}`,
  }))

  return {
    isMissionEmpty,
    isDraggingProcessing,
    draggingMission,
    moveMarker,
    clearState,
    onSuccess,
    onError,
    updateDragging,
    updateDraggingBy,
    ...rest,
  }
}
