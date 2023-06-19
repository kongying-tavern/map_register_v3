import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import { pick } from 'lodash'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'

/** 新增点位，已自动处理 version 和 methodType 字段 */
export const useMarkerCreate = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    return {
      ...pick(marker, 'itemList', 'position', 'content', 'picture', 'videoPath', 'refreshTime', 'hiddenFlag', 'markerTitle', 'extra'),
      pictureCreatorId: marker.picture ? userStore.info.id : undefined,
    }
  }

  const buildModifyMarkerForm = (marker: API.MarkerVo): API.MarkerPunctuateVo => {
    return {
      ...pick(marker, 'itemList', 'position', 'content', 'picture', 'videoPath', 'refreshTime', 'hiddenFlag', 'markerTitle', 'extra') as API.MarkerPunctuateVo,
      pictureCreatorId: marker.picture ? userStore.info.id : undefined,
      methodType: 1,
    }
  }

  const request = async () => {
    if (!markerData.value)
      throw new Error('所需的点位数据为空')
    if (userStore.isAdmin) {
      const form = buildAdminMarkerForm(markerData.value)
      await Api.marker.createMarker(form)
    }
    else {
      const form = buildModifyMarkerForm(markerData.value)
      await Api.punctuate.addPunctuate({}, form)
    }
  }

  const { refresh: createMarker, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  onSuccess(() => ElMessage.success('新增点位成功'))
  onError(err => ElMessage.error(err.message))

  return { createMarker, onSuccess, onError, ...rest }
}
