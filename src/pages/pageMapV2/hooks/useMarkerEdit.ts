import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 编辑点位，已自动处理 version 和 methodType 字段 */
export const useMarkerEdit = (markerData: Ref<API.MarkerVo>) => {
  const { refresh: editMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const { id: markerId, version = 0 } = markerData.value
      if (markerId === undefined)
        throw new Error('点位 id 为空')

      const form: API.MarkerVo = {
        ...markerData.value,
        version: version + 1,
      }

      await Api.marker.updateMarker(form)
    },
  })

  onSuccess(() => ElMessage.success('编辑点位成功'))
  onError(err => ElMessage.error(err.message))

  return { editMarker, onSuccess, onError, ...rest }
}
