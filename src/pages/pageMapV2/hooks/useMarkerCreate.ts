import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 新增点位，已自动处理 version 和 methodType 字段 */
export const useMarkerCreate = (markerData: Ref<API.MarkerVo>) => {
  const { refresh: createMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const { version = 0 } = markerData.value

      const form: API.MarkerVo = {
        ...markerData.value,
        version: version + 1,
      }

      await Api.marker.createMarker(form)
    },
  })

  onSuccess(() => ElMessage.success('新增点位成功'))
  onError(err => ElMessage.error(err.message))

  return { createMarker, onSuccess, onError, ...rest }
}
