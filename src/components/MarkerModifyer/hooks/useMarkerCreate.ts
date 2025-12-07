import type { Ref } from 'vue'
import type { MarkerForm } from '../components'
import { ElMessage } from 'element-plus'
import { omit } from 'lodash'
import Api from '@/api/api'
import db from '@/database/db'
import { useFetchHook } from '@/hooks'
import { HashFlag } from '@/shared'
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
      const { data: markerId } = await Api.marker.createMarker(form)
      markerStore.unsafeModify([JSON.parse(JSON.stringify(form))])
      return { ...form, id: markerId } as API.MarkerVo
    },
  })

  const createMarker = async () => {
    try {
      const isValid = await editorRef.value?.validate()
      if (!isValid)
        return
      await submit()
    }
    catch {
      // validate, no error
    }
  }

  onSuccess(async (form) => {
    ElMessage.success({
      message: '新增点位成功',
    })
    try {
      if (form.id === undefined)
        throw new Error('无法确认点位信息，未返回对应的点位 id')
      // 乐观更新到本地
      const { data: [marker] = [] } = await Api.marker.listMarkerById([form.id])
      if (!marker) {
        db.app.marker.put({
          ...form,
          id: form.id,
          __hash: HashFlag.LOCAL,
        })
        return
      }
      await db.app.marker.put({
        ...marker,
        __hash: HashFlag.LOCAL,
      })
    }
    catch {
      // no error
    }
  })

  onError(err => ElMessage.error({
    message: `新增点位失败，原因为：${err.message}`,
  }))

  return { editorRef, createMarker, onSuccess, onError, ...rest }
}
