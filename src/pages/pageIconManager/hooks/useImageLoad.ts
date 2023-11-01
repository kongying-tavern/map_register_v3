import { ElMessage } from 'element-plus'
import { getFileType } from '../utils'
import { useFetchHook } from '@/hooks'

export const useImageLoad = () => {
  const { data: localImage, refresh: loadLocalImage, onSuccess, onError, ...rest } = useFetchHook({
    initialValue: undefined,
    shallow: true,
    onRequest: () => new Promise<Blob | undefined>((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = false

      input.oncancel = () => {
        input.remove()
        resolve(undefined)
      }

      input.oninput = async () => {
        const file = input.files?.[0]
        input.remove()

        if (!file)
          return resolve(undefined)

        const realType = await getFileType(file)
        if (realType === 'unknown')
          return reject(new Error('不支持的图片类型'))

        resolve(file)
      }

      input.click()
    }),
  })

  const localImageUrl = useObjectUrl(localImage)

  onError(err => ElMessage.error({
    message: `加载图片失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { localImage, localImageUrl, loadLocalImage, onSuccess, onError, ...rest }
}
