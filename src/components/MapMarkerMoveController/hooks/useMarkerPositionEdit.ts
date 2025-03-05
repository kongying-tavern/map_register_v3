import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useMapStateStore, useMarkerStore, useTileStore } from '@/stores'
import { ElMessage } from 'element-plus'

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

  const { refresh: moveMarker, onSuccess, onError, onFinish, ...rest } = useFetchHook({
    onRequest: async () => {
      const tileConfig = tileStore.currentTileConfig
      if (!tileConfig)
        throw new Error('无法获取当前图层配置')

      const [cx, cy] = tileConfig.tile.center

      const { currentMarkerIdMap } = mapStateStore
      const missions = draggingMission.value

      const payload: API.TweakVo[] = []

      missions.forEach(([x, y], id) => {
        const marker = currentMarkerIdMap.get(id)
        if (!marker)
          throw new Error(`获取 id 为 ${id} 的点位数据时出错，对象不存在。`)
        payload.push({
          markerIds: [id],
          tweaks: [{
            prop: 'position',
            type: 'update',
            meta: {
              value: `${x - cx},${y - cy}`,
            },
          }],
        })
      })

      if (!payload.length)
        throw new Error('已验证的提交信息为空')

      ElMessage.warning({
        message: '操作已提交，正在验证中...',
        duration: 0,
      })

      const { data = [] } = await Api.marker.tweakMarkers(payload)

      await markerStore.afterUpdated(data.map(({ id }) => id!))
    },
  })

  const clearState = () => {
    mapStateStore.setTempMarkers('markerDragging', [])
    updateDragging(null)
  }

  onFinish(() => {
    ElMessage.closeAll('warning')
  })

  onSuccess(() => {
    ElMessage.success({
      message: '操作成功',
    })
    clearState()
  })

  onError(err => {
    ElMessage.error({
      message: `移动点位失败，原因为：${err.message}`,
    })
  })

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
