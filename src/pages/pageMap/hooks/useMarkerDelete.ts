import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useUserStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'

/** 删除点位，已自动处理 version 和 methodType 字段 */
export const useMarkerDelete = (markerData: Ref<API.MarkerVo>) => {
  const userStore = useUserStore()

  const { refresh: deleteMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const { id: markerId, version = 0 } = markerData.value
      const { id: authorId } = userStore.info
      if (markerId === undefined || authorId === undefined)
        return

      // 管理员直接删除点位
      if (userStore.isAdmin) {
        await Api.marker.deleteMarker({ markerId })
        await db.marker.delete(markerId)
        return
      }

      // 打点员提交删除申请
      const form: API.MarkerPunctuateVo = {
        ...markerData.value,
        version: version + 1,
        methodType: 3,
      }
      await Api.punctuate.addPunctuate({}, form)
      await Api.punctuate.pushPunctuate({ authorId })
    },
  })

  onSuccess(() => ElMessage.success(`${userStore.isAdmin ? '删除点位' : '提交删除点位申请'}成功`))
  onError(err => ElMessage.error(err.message))

  return { deleteMarker, onSuccess, onError, ...rest }
}
