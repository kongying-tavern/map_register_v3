import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import { pick } from 'lodash'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'
import { useCondition } from '@/pages/pageMapV2/hooks'
import db from '@/database'

/** 新增点位，已自动处理 version 和 methodType 字段 */
export const useMarkerCreate = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()
  const conditionManager = useCondition()

  const commonKeys = [
    'itemList',
    'position',
    'content',
    'picture',
    'markerCreatorId',
    'videoPath',
    'refreshTime',
    'hiddenFlag',
    'markerTitle',
    'extra',
  ]

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    return {
      ...pick(marker, commonKeys),
      pictureCreatorId: marker.picture ? userStore.info.id : undefined,
    }
  }

  const request = async () => {
    if (!markerData.value)
      throw new Error('所需的点位数据为空')

    const form = buildAdminMarkerForm(markerData.value)
    const { data: markerId } = await Api.marker.createMarker(form)

    if (markerId === undefined)
      throw new Error('无法确认点位信息，未返回对应的点位 id')

    const { data: { 0: submitedMarkerInfo } = [] } = await Api.marker.listMarkerById({}, [markerId!])

    if (!submitedMarkerInfo)
      throw new Error('无法确认点位信息，点位对象为空')

    await db.marker.put(submitedMarkerInfo)

    await conditionManager.requestMarkersUpdate()
  }

  const { refresh: createMarker, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  onSuccess(() => ElMessage.success({
    message: `${userStore.isAdmin ? '新增点位' : '提交审核'}成功`,
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `${userStore.isAdmin ? '新增点位' : '提交审核'}失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { createMarker, onSuccess, onError, ...rest }
}
