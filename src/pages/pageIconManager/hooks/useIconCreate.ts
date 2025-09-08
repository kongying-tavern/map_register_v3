import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import Resource from '@/api/resource'
import db from '@/database/db'
import { useFetchHook } from '@/hooks'
import { getDigest } from '@/utils'

export const useIconCreate = (form: Ref<API.IconVo>, options: IconCreateOptions = {}) => {
  const { type = 'webp' } = options

  const stash = shallowRef<HTMLCanvasElement | null>(null)

  const stashIcon = (canvas: HTMLCanvasElement) => {
    stash.value = canvas
  }

  const clearStash = () => {
    stash.value = null
  }

  const {
    refresh: createIcon,
    loading,
    onError,
    onSuccess,
  } = useFetchHook({
    onRequest: async () => {
      const canvas = stash.value
      if (!canvas)
        throw new Error('图像为空')

      const {
        description,
        id,
        tag,
        typeIdList,
      } = form.value

      const icon = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob)
            return reject(new Error('序列化图像失败'))
          resolve(blob)
        })
      })
      const hash = await getDigest(icon, 'SHA-1')
      const time = dayjs()
      const fileName = `${hash}-${time.valueOf()}.${type}`
      const folderName = time.format('YYYY-MM-DD')
      const filePath = `${folderName}/${fileName}`
      const file = new File([icon], fileName)

      const {
        message = '上传图片失败',
        data: {
          fileUrl = '',
        } = {},
      } = await Resource.image.upload({ file, filePath })
      if (!fileUrl)
        throw new Error(message)

      await Api.icon.createIcon({
        description,
        id,
        tag,
        typeIdList,
        url: fileUrl,
      })

      try {
        const { data = {}, error, message = '' } = await Api.icon.getIcon({ iconId: form.value.id! })
        if (error)
          throw new Error(message)
        await db.app.icon.put(data)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err)
        ElMessage.warning(`创建成功，但在确认图标信息时出现了错误: ${message}。稍后将会同步此图标的信息。`)
      }
    },
  })

  onError((err) => {
    ElMessage.error(`创建图标失败，原因为：${err.message}`)
  })

  onSuccess(() => {
    ElMessage.success('创建图标成功')
  })

  return {
    /** 操作进行中 */
    loading,
    /** 图片暂存区 */
    stash,
    /** 将 icon 添加到暂存区等待上传 */
    stashIcon,
    /** 将暂存区的 icon 移除 */
    clearStash,
    /** 创建图标 */
    createIcon,
    /** 操作失败回调 */
    onError,
    /** 操作成功回调 */
    onSuccess,
  }
}

interface IconCreateOptions {
  /** @default 'webp' */
  type?: string
}
