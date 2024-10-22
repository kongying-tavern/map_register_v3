import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import { pick } from 'lodash'
import type { MarkerForm } from '../components'
import { usePictureUpload } from './usePictureUpload'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'
import db from '@/database'

/** 新增点位，已自动处理 version 和 methodType 字段 */
export const useMarkerCreate = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()

  /** 编辑器实例 */
  const editorRef = ref<InstanceType<typeof MarkerForm> | null>(null)

  const commonKeys = [
    'itemList',
    'position',
    'content',
    'picture',
    'markerCreatorId',
    'videoPath',
    'refreshTime',
    'hiddenFlag',
    'markerTitle',
    'extra',
  ]

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    return {
      ...pick(marker, commonKeys),
      pictureCreatorId: marker.picture ? userStore.info?.id : undefined,
    }
  }

  const { tryUploadPicture } = usePictureUpload()

  const request = async () => {
    if (!markerData.value)
      throw new Error('表单数据为空')

    const form = buildAdminMarkerForm(markerData.value)

    await tryUploadPicture(form)

    const { data: markerId } = await Api.marker.createMarker(form)

    if (markerId === undefined)
      throw new Error('无法确认点位信息，未返回对应的点位 id')

    const { data: { 0: submitedMarkerInfo } = [] } = await Api.marker.listMarkerById([markerId!])

    if (!submitedMarkerInfo)
      throw new Error('无法确认点位信息，点位对象为空')

    await db.marker.put(submitedMarkerInfo)
  }

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({ onRequest: request })

  const createMarker = async () => {
    try {
      const isValid = await editorRef.value?.validate()
      if (!isValid)
        return
      await submit()
    }
    catch (err) {
      // validate, no error
    }
  }

  onSuccess(() => ElMessage.success({
    message: '新增点位成功',
  }))

  onError(err => ElMessage.error({
    message: `新增点位失败，原因为：${err.message}`,
  }))

  return { editorRef, createMarker, onSuccess, onError, ...rest }
}
