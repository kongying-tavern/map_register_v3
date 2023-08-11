import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { pick } from 'lodash'
import type { MarkerEditorForm } from '../components/MarkerEditor'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'

/** 编辑点位，已自动处理 methodType 字段 */
export const useMarkerEdit = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()

  /** 编辑器实例 */
  const editorRef = ref<InstanceType<typeof MarkerEditorForm> | null>(null)

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
    'version',
    'extra',
  ]

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    const isPictureChanged = checkPictureChange(marker)
    return {
      ...pick(marker, commonKeys),
      pictureCreatorId: isPictureChanged ? userStore.info.id : marker.pictureCreatorId,
    }
  }

  /** 原始操作 */
  const request = async () => {
    if (!markerData.value)
      throw new Error('所需的点位数据为空')
    const shallowCopy = { ...markerData.value }
    await editorRef.value?.uploadPicture()
    const form: API.MarkerVo = buildAdminMarkerForm(shallowCopy)
    await Api.marker.updateMarker(form)
  }

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  const editMarker = async () => {
    try {
      await editorRef.value?.validate()
      await submit()
    }
    catch {
      // validate, no error
    }
  }

  onSuccess(() => ElMessage.success({
    message: `${userStore.isAdmin ? '编辑点位' : '提交审核'}成功`,
    offset: 48,
  }))

  onError(err => ElMessage.error({
    message: `${userStore.isAdmin ? '编辑点位' : '提交审核'}失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { editorRef, editMarker, request, onSuccess, onError, ...rest }
}
