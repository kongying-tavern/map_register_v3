import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'

/** 编辑点位，已自动处理 version 和 methodType 字段 */
export const useMarkerEdit = (markerData: Ref<API.MarkerVo>) => {
  const userStore = useUserStore()

  /**
   * 基于 url 参数传递来判断 picture 是否已经更改
   * 此处对 picture 传递过来的 url 上的参数 timestamp、和 last-modified 进行判断和处理
   */
  const checkPictureChange = () => {
    const { picture = '' } = markerData.value
    if (!picture)
      return false

    const pictureURL = new URL(picture)
    const params = pictureURL.searchParams
    const timestamp = Number(params.get('timestamp'))
    const lastModified = Number(params.get('last-modified'))

    const isChanged = (!isNaN(timestamp) && !isNaN(lastModified)) && timestamp > lastModified

    if (isChanged) {
      !lastModified && params.set('last-modified', `${new Date().getTime()}`)
      params.delete('timestamp')
      markerData.value.picture = `${pictureURL.origin}${pictureURL.pathname}?${params.toString()}`
    }

    return isChanged
  }

  const buildAdminMarkerForm = (): API.MarkerVo => {
    const marker = markerData.value
    const isPictureChanged = checkPictureChange()
    return {
      id: marker.id,
      itemList: marker.itemList,
      position: marker.position,
      content: marker.content,
      picture: marker.picture,
      pictureCreatorId: isPictureChanged ? userStore.info.id : marker.pictureCreatorId,
      videoPath: marker.videoPath,
      refreshTime: marker.refreshTime,
      hiddenFlag: marker.hiddenFlag,
      markerTitle: marker.markerTitle,
      extra: marker.extra,
      version: marker.version ?? 0 + 1,
    }
  }

  const buildModifyMarkerForm = (): API.MarkerPunctuateVo => {
    const marker = markerData.value
    const isPictureChanged = checkPictureChange()
    return {
      id: marker.id,
      // itemList: marker.itemList,
      position: marker.position,
      content: marker.content,
      picture: marker.picture,
      pictureCreatorId: isPictureChanged ? userStore.info.id : marker.pictureCreatorId,
      videoPath: marker.videoPath,
      refreshTime: marker.refreshTime,
      hiddenFlag: marker.hiddenFlag,
      markerTitle: marker.markerTitle,
      extra: marker.extra,
      version: marker.version ?? 0 + 1,
      methodType: 2,
    }
  }

  const { refresh: editMarker, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (userStore.isAdmin) {
        const form: API.MarkerVo = buildAdminMarkerForm()
        await Api.marker.updateMarker(form)
      }
      else {
        const form: API.MarkerPunctuateVo = buildModifyMarkerForm()
        await Api.punctuate.addPunctuate({}, form)
      }
    },
  })

  onSuccess(() => ElMessage.success('编辑点位成功'))
  onError(err => ElMessage.error(err.message))

  return { editMarker, onSuccess, onError, ...rest }
}
