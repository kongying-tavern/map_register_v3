import Api from '@/api/api'
import Resource from '@/api/resource'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'
import { getDigest } from '@/utils'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

interface ImageUploadHookOptions {
  image: Ref<Blob | undefined>
  tagName: Ref<string | undefined>
}

export const useImageUpload = (options: ImageUploadHookOptions) => {
  const { image, tagName } = options

  const userStore = useUserStore()

  const percentage = ref(0)

  const status = ref<'' | 'success' | 'exception'>('')

  const text = ref('')

  const iconName = ref('')

  const reset = () => {
    percentage.value = 0
    status.value = ''
    text.value = ''
  }

  watch(image, reset)

  const { refresh: uploadImage, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (!userStore.info)
        throw new Error('未登录')

      const imageBlob = toValue(image)
      if (!imageBlob)
        throw new Error('图片为空')

      const iconTag = toValue(tagName)
      if (!iconTag)
        throw new Error('icon tag 为空')

      const hash = await getDigest(imageBlob, 'SHA-256')

      const fileName = `${hash}.png`

      const now = Date.now()

      const folderName = `${dayjs(now).format('YYYY-MM-DD')}`

      const filePath = `${folderName}/${fileName}`

      // TODO: 上传前检测 filePath 是否已经存在图片

      const file = new File([imageBlob], fileName, {
        type: 'image/png',
        lastModified: now,
      })

      text.value = '正在上传'
      const { data: { fileUrl = '' } = {} } = await Resource.image.upload({
        file,
        filePath,
      }, {
        onUploadProgress: (ev) => {
          const { loaded = 0, total = 0 } = ev
          percentage.value = 100 * (loaded / total) || 0
        },
      })
      if (!fileUrl)
        throw new Error('上传失败，响应的 url 为空')
      percentage.value = 100

      text.value = '正在创建图片资产'
      const { data: iconId } = await Api.icon.createIcon({
        name: !iconName.value ? fileName : iconName.value,
        url: fileUrl,
        typeIdList: [],
        creatorId: userStore.info.id,
      })
      if (iconId === undefined)
        throw new Error('新增图片资产的 id 为空')

      text.value = '正在关联图片资产'
      await Api.tag.updateTag({
        tagName: iconTag,
        iconId,
      })

      text.value = '正在更新数据库'
      const { data = {} } = await Api.tag.getTag({ name: iconTag })
      await db.iconTag.put(data)
    },
  })

  onSuccess(() => {
    status.value = 'success'
    ElMessage.success({
      message: '图片修改成功',
    })
  })

  onError((err) => {
    text.value = err.message
    status.value = 'exception'
    ElMessage.error({
      message: `图片修改失败，原因为：${err.message}`,
    })
  })

  return { iconName, percentage, status, text, uploadImage, onSuccess, onError, ...rest }
}
