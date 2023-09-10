import { pick } from 'lodash'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'
import Api from '@/api/api'
import { useCondition } from '@/pages/pageMapV2/hooks'
import db from '@/database'

export const useMarkerDelete = () => {
  const userStore = useUserStore()
  const conditionManager = useCondition()

  const buildModifyMarkerForm = (marker: API.MarkerVo): API.MarkerPunctuateVo => {
    return {
      ...pick(marker, Object.keys(marker)) as API.MarkerPunctuateVo,
      methodType: 3,
    }
  }

  const request = async (marker: API.MarkerVo) => {
    if (userStore.isAdmin)
      return await Api.marker.deleteMarker({ markerId: marker.id! })

    const form = buildModifyMarkerForm(marker)
    await Api.punctuate.addPunctuate({}, form)

    const { data: { 0: submitedMarkerInfo } = [] } = await Api.marker.listMarkerById({}, [form.id!])

    if (!submitedMarkerInfo)
      throw new Error('无法确认点位信息，点位对象为空')

    await db.marker.put(submitedMarkerInfo)

    await conditionManager.requestMarkersUpdate()
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
    message: `${userStore.isAdmin ? '删除点位' : '提交审核'}成功`,
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `${userStore.isAdmin ? '删除点位' : '提交审核'}失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { deleteMarker, onSuccess, onError, ...rest }
}
