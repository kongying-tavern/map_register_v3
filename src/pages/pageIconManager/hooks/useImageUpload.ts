import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import Api from '@/api/api'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { GlobalDialogController } from '@/components'
import { useUserInfoStore } from '@/stores'
import Resource from '@/api/resource'

interface ImageUploadHookOptions {
  image: Ref<Blob | undefined>
  tagName: Ref<string | undefined>
}

export const useImageUpload = (options: ImageUploadHookOptions) => {
  const { image, tagName } = options

  const userInfoStore = useUserInfoStore()

  const croppedImageName = refWithControl(tagName.value ?? '', {
    onBeforeChange: (v) => {
      if (v !== v.trim())
        return false
      return v.length <= 16
    },
  })

  const percentage = ref(0)

  const status = ref<'' | 'success' | 'exception'>('')

  const text = ref('')

  const reset = () => {
    percentage.value = 0
    status.value = ''
    text.value = ''
  }

  watch(image, reset)

  const file = computed(() => {
    if (!image.value)
      return
    return new File([image.value], `${croppedImageName.value}.png`, {
      type: 'image/png',
      lastModified: Date.now(),
    })
  })

  const { refresh: uploadImage, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const image = file.value
      if (!image)
        throw new Error('没有文件可以上传')

      const shallowTagName = tagName.value
      if (!shallowTagName)
        throw new Error('icon tag 为空')

      const folder = `${dayjs().format('YYYY-MM-DD')}`

      text.value = '正在上传'
      const { data: { fileUrl = '' } = {} } = await Resource.image.upload({
        file: image,
        filePath: `${folder}/${image.name}`,
      }, {
        onUploadProgress: (ev) => {
          const { loaded = 0, total = 0 } = ev
          percentage.value = (loaded / total) || 0
        },
      })
      if (!fileUrl)
        throw new Error('上传失败，响应的 url 为空')

      text.value = '正在创建图片资产'
      const { data: iconId } = await Api.icon.createIcon({
        name: image.name,
        url: fileUrl,
        typeIdList: [],
        creatorId: userInfoStore.info.id,
      })
      if (iconId === undefined)
        throw new Error('新增图片资产的 id 为空')

      text.value = '正在关联图片资产'
      await Api.tag.updateTag({
        tagName: shallowTagName,
        iconId,
      })

      text.value = '正在更新数据库'
      const { data = {} } = await Api.tag.getTag({ name: shallowTagName })
      await db.iconTag.put(data)
    },
  })

  onSuccess(() => {
    status.value = 'success'
    ElMessage.success({
      message: '图片修改成功',
      offset: 48,
    })
    GlobalDialogController.close()
  })

  onError((err) => {
    text.value = err.message
    status.value = 'exception'
    ElMessage.error({
      message: `图片修改失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return { croppedImageName, percentage, status, text, uploadImage, onSuccess, onError, ...rest }
}
