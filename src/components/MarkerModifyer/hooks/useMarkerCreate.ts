import type { Ref } from 'vue'
import type { MarkerForm } from '../components'
import { ElMessage } from 'element-plus'
import { omit } from 'lodash'
import { useFetchHook } from '@/hooks'
import { useMarkerStore, useUserStore } from '@/stores'
import { usePictureUpload } from './usePictureUpload'

/** 新增点位，已自动处理 version 和 methodType 字段 */
export const useMarkerCreate = (markerData: Ref<API.MarkerVo | null>) => {
  const userStore = useUserStore()
  const markerStore = useMarkerStore()

  /** 编辑器实例 */
  const editorRef = ref<InstanceType<typeof MarkerForm> | null>(null)

  const commonKeys: (keyof API.MarkerVo)[] = [
    'updateTime',
    'createTime',
  ]

  const buildAdminMarkerForm = (marker: API.MarkerVo): API.MarkerVo => {
    return {
      ...omit(marker, commonKeys),
      pictureCreatorId: marker.picture ? userStore.info?.id : undefined,
    }
  }

  const { tryUploadPicture } = usePictureUpload()

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (!markerData.value)
        throw new Error('表单数据为空')
      const form = buildAdminMarkerForm(markerData.value)
      await tryUploadPicture(form)
      await markerStore.createMarker(form)
    },
  })

  const isProcessing = ref(false)

  const createMarker = async () => {
    if (isProcessing.value)
      return
    try {
      isProcessing.value = true
      const isValid = await editorRef.value?.validate()
      if (!isValid)
        return
      await submit()
    }
    catch {
      // validate, no error
    }
    finally {
      isProcessing.value = false
    }
  }

  onSuccess(async () => {
    ElMessage.success({
      message: '新增点位成功',
    })
  })

  onError(err => ElMessage.error({
    message: `新增点位失败，原因为：${err.message}`,
  }))

  return { editorRef, createMarker, onSuccess, onError, ...rest }
}
