import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import db from '@/database'

export const useMarkerDelete = () => {
  const request = async (marker: API.MarkerVo) => {
    await Api.marker.deleteMarker({ markerId: marker.id! })

    const { data: { 0: submitedMarkerInfo } = [] } = await Api.marker.listMarkerById({}, [marker.id!])

    if (!submitedMarkerInfo)
      throw new Error('无法确认点位信息，点位对象为空')

    await db.marker.put(submitedMarkerInfo)
  }

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  const deleteMarker = async (marker: API.MarkerVo | null) => {
    if (!marker)
      return
    const isConfirm = await ElMessageBox.confirm(
      `确认删除点位（${marker.markerTitle} id:${marker.id}）？该操作不可逆。`,
      {
        title: '警告',
        confirmButtonClass: 'el-button--danger',
      },
    ).catch(() => false)
    isConfirm && await submit(marker)
  }

  onSuccess(() => ElMessage.success({
    message: '删除点位成功',
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `删除点位失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { deleteMarker, onSuccess, onError, ...rest }
}
