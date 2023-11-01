import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

interface ImageSelectHookOptions {
  tagName: Ref<string | undefined>
}

export const useImageSelect = (options: ImageSelectHookOptions) => {
  const { tagName } = options

  const selectedImage = ref<API.IconVo | null>(null)

  const { refresh: useImage, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (!selectedImage.value)
        throw new Error('还未选择任何图片')
      if (!tagName.value)
        throw new Error('icon tag 为空')

      await Api.tag.updateTag({
        tagName: tagName.value,
        iconId: selectedImage.value.id!,
      })
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '图片修改成功',
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `图片修改失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return { selectedImage, useImage, onSuccess, onError, ...rest }
}
