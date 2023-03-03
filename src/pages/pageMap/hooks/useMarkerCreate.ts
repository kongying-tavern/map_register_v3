import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import Api from '@/api/api'
import { useUserStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'

/** 新增点位，已自动处理 version 和 methodType 字段 */
export const useMarkerCreate = (markerData: Ref<API.MarkerVo | API.MarkerPunctuateVo>) => {
  const userStore = useUserStore()

  const { refresh: createMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const { version = 0 } = markerData.value
      const { id: authorId } = userStore.info
      if (authorId === undefined)
        return

      // 管理员直接创建点位
      if (userStore.isAdmin) {
        const { data: markerId = 0 } = await Api.marker.createMarker(markerData.value)
        const { data: [markervo] = [] } = await Api.marker.listMarkerById({}, [markerId])
        if (!markervo)
          throw new Error('无法确认点位信息')
        await db.marker.put(markervo, markerId)
        return
      }

      // 打点员提交创建申请
      const form: API.MarkerPunctuateVo = {
        ...markerData.value,
        version: version + 1,
        methodType: 1,
      }
      await Api.punctuate.addPunctuate({}, form)
      await Api.punctuate.pushPunctuate({ authorId })
    },
  })

  onSuccess(() => ElMessage.success(`${userStore.isAdmin ? '新增点位' : '提交新增点位申请'}成功`))
  onError(err => ElMessage.error(err.message))

  return { createMarker, onSuccess, onError, ...rest }
}
