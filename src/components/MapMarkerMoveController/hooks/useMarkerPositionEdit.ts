import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import db from '@/database/db'
import { useFetchHook } from '@/hooks'
import { HashFlag } from '@/shared'
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

      const { data: markers = [] } = await Api.marker.tweakMarkers(payload)
      markerStore.unsafeModify(markers)
      return markers
    },
  })

  const clearState = () => {
    mapStateStore.setTempMarkers('markerDragging', [])
    updateDragging(null)
  }

  onFinish(() => {
    ElMessage.closeAll('warning')
  })

  onSuccess(async (markers) => {
    try {
      clearState()
      ElMessage.success({
        message: '操作成功',
      })
      if (!markers.length)
        return
      await db.app.marker.bulkPut(markers.map(marker => ({
        ...marker,
        __hash: HashFlag.LOCAL,
      })))
    }
    catch {
      // no error
    }
  })

  onError((err) => {
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
