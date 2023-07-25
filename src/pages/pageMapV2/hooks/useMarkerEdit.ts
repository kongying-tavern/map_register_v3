import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { pick } from 'lodash'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'

/** 编辑点位，已自动处理 methodType 字段 */
export const useMarkerEdit = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()

  /**
   * 基于 url 参数传递来判断 picture 是否已经更改
   * 此处对 picture 传递过来的 url 上的参数 timestamp、和 last-modified 进行判断和处理
   */
  const checkPictureChange = (marker: API.MarkerVo) => {
    const { picture = '' } = marker
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
      marker.picture = `${pictureURL.origin}${pictureURL.pathname}?${params.toString()}`
    }

    return isChanged
  }

  const commonKeys = [
    'id',
    'itemList',
    'position',
    'content',
    'picture',
    'videoPath',
    'refreshTime',
    'hiddenFlag',
    'markerTitle',
    'extra',
  ]

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    const isPictureChanged = checkPictureChange(marker)
    return {
      ...pick(marker, commonKeys),
      pictureCreatorId: isPictureChanged ? userStore.info.id : marker.pictureCreatorId,
    }
  }

  const buildModifyMarkerForm = (marker: API.MarkerVo): API.MarkerPunctuateVo => {
    const isPictureChanged = checkPictureChange(marker)
    return {
      ...pick(marker, commonKeys) as API.MarkerPunctuateVo,
      pictureCreatorId: isPictureChanged ? userStore.info.id : marker.pictureCreatorId,
      methodType: 2,
    }
  }

  /** 原始操作 */
  const request = async () => {
    if (!markerData.value)
      throw new Error('所需的点位数据为空')
    const shallowCopy = { ...markerData.value }
    if (userStore.isAdmin) {
      const form: API.MarkerVo = buildAdminMarkerForm(shallowCopy)
      await Api.marker.updateMarker(form)
    }
    else {
      const form: API.MarkerPunctuateVo = buildModifyMarkerForm(shallowCopy)
      await Api.punctuate.addPunctuate({}, form)
    }
  }

  const { refresh: editMarker, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  onSuccess(() => ElMessage.success({
    message: `${userStore.isAdmin ? '编辑点位' : '提交审核'}成功`,
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `${userStore.isAdmin ? '编辑点位' : '提交审核'}失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { editMarker, request, onSuccess, onError, ...rest }
}
