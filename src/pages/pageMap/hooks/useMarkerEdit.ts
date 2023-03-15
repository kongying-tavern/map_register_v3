import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useUserStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'

/** 编辑点位，已自动处理 version 和 methodType 字段 */
export const useMarkerEdit = (markerData: Ref<API.MarkerVo>) => {
  const userStore = useUserStore()

  const { refresh: editMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const { id: markerId, version = 0 } = markerData.value
      const { id: authorId } = userStore.info
      if (markerId === undefined || authorId === undefined)
        return

      // 管理员直接编辑点位
      if (userStore.isAdmin) {
        await Api.marker.updateMarker(markerData.value)
        await db.marker.put(JSON.parse(JSON.stringify(markerData.value)), markerId)
        return
      }

      // 打点员提交编辑申请
      const form: API.MarkerPunctuateVo = {
        ...markerData.value,
        version: version + 1,
        methodType: 2,
      }
      await Api.punctuate.addPunctuate({}, form)
      await Api.punctuate.pushPunctuate({ authorId })
    },
  })

  onSuccess(() => ElMessage.success(`${userStore.isAdmin ? '编辑点位' : '提交编辑点位申请'}成功`))
  onError(err => ElMessage.error(err.message))

  return { editMarker, onSuccess, onError, ...rest }
}
