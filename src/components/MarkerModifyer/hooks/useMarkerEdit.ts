import type { Ref } from 'vue'
import type { MarkerForm } from '../components'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useMarkerStore, useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { omit } from 'lodash'
import { usePictureUpload } from './usePictureUpload'

/** 编辑点位，已自动处理 methodType 字段 */
export const useMarkerEdit = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()
  const markerStore = useMarkerStore()

  /** 编辑器实例 */
  const editorRef = ref<InstanceType<typeof MarkerForm> | null>(null)

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

    const isChanged = (!Number.isNaN(timestamp) && !Number.isNaN(lastModified)) && timestamp > lastModified

    if (isChanged) {
      !lastModified && params.set('last-modified', `${new Date().getTime()}`)
      params.delete('timestamp')
      marker.picture = `${pictureURL.origin}${pictureURL.pathname}?${params.toString()}`
    }

    return isChanged
  }

  const commonKeys: (keyof API.MarkerVo)[] = [
    'updateTime',
    'createTime',
  ]

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    const isPictureChanged = checkPictureChange(marker)
    return {
      ...omit(marker, commonKeys),
      pictureCreatorId: isPictureChanged ? userStore.info?.id : marker.pictureCreatorId,
    }
  }

  const { tryUploadPicture } = usePictureUpload()

  /** 原始操作 */
  const request = async () => {
    const marker = markerData.value
    if (!marker)
      throw new Error('表单数据为空')

    const form = buildAdminMarkerForm(marker)

    await tryUploadPicture(form)

    await Api.marker.updateMarker(form)

    await markerStore.afterUpdated([form.id!])
  }

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  const editMarker = async () => {
    try {
      if (!markerData.value)
        throw new Error('所需的点位数据为空')
      const isValid = await editorRef.value?.validate()
      if (!isValid)
        return
      await submit()
    }
    catch {
      // validate, no error
    }
  }

  onSuccess(() => {
    ElMessage.success({
      message: '编辑点位成功',
    })
  })

  onError(err => ElMessage.error({
    message: `编辑点位失败，原因为：${err.message}`,
  }))

  return { editorRef, editMarker, request, onSuccess, onError, ...rest }
}
