import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { useImageHostingStore, useUserInfoStore } from '@/stores'
import Api from '@/api/api'

interface ImageUploadHookOptions {
  image: Ref<Blob | undefined>
  tagName: Ref<string | undefined>
}

export const useImageUpload = (options: ImageUploadHookOptions) => {
  const { image, tagName } = options

  const userInfoStore = useUserInfoStore()
  const imageHostingStore = useImageHostingStore()

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

  const imageHostingUrl = ref('')

  const reset = () => {
    percentage.value = 0
    status.value = ''
    text.value = ''
    imageHostingUrl.value = ''
  }

  watch(image, reset)

  const file = computed(() => {
    if (!image.value)
      return
    return new File([image.value], croppedImageName.value, {
      type: image.value.type,
      lastModified: Date.now(),
    })
  })

  const { refresh: uploadImage, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (!file.value)
        throw new Error('没有文件可以上传')
      if (!tagName.value)
        throw new Error('icon tag 为空')

      if (!imageHostingUrl.value) {
        text.value = '正在上传'
        const url = await imageHostingStore.upload(file.value, (rate) => {
          percentage.value = 100 * rate
        })
        imageHostingUrl.value = url
      }

      text.value = '正在创建图片资产'
      const { data: iconId } = await Api.icon.createIcon({
        name: file.value.name,
        url: imageHostingUrl.value,
        typeIdList: [],
        creatorId: userInfoStore.info.id,
      })
      if (iconId === undefined)
        throw new Error('新增图片资产的 id 为空')

      text.value = '正在关联图片资产'
      await Api.tag.updateTag({
        tagName: tagName.value,
        iconId,
      })
    },
  })

  onSuccess(() => {
    status.value = 'success'
    ElMessage.success({
      message: '图片修改成功',
      offset: 48,
    })
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
