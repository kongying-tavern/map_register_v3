import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import Resource from '@/api/resource'
import db from '@/database/db'
import { useFetchHook } from '@/hooks'
import { getDigest } from '@/utils'

export const useIconUpdate = (form: Ref<API.IconVo>, options: IconUpdateOptions = {}) => {
  const { type = 'png', iconEditable = true } = options

  const stash = shallowRef<HTMLCanvasElement | null>(null)

  const isChanged = computed(() => Boolean(stash.value))

  const stashIcon = (canvas: HTMLCanvasElement) => {
    stash.value = canvas
  }

  const clearStash = () => {
    stash.value = null
  }

  const {
    refresh: updateIcon,
    loading,
    onError,
    onSuccess,
  } = useFetchHook({
    onRequest: async () => {
      const canvas = stash.value

      const {
        description,
        id,
        tag,
        typeIdList,
        url,
        version,
      } = form.value

      const updateLocalInfo = async () => {
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
      }

      // 如果没有传递 icon，跳过图片上传
      if (!canvas || !toValue(iconEditable)) {
        await Api.icon.updateIcon({
          description,
          id,
          tag,
          typeIdList,
          url,
          version,
        })
        await updateLocalInfo()
        return
      }

      const icon = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob)
            return reject(new Error('序列化图像失败'))
          resolve(blob)
        })
      })
      const hash = await getDigest(icon, 'SHA-256')
      const time = dayjs()
      const fileName = `${hash}.${type}`
      const folderName = time.format('YYYY-MM-DD')
      /** @example '2025-09-09/abcdefg.png' */
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

      await Api.icon.updateIcon({
        description,
        id,
        tag,
        typeIdList,
        version,
        url: fileUrl,
      })
      await updateLocalInfo()
    },
  })

  onError((err) => {
    ElMessage.error(`更新图标失败，原因为：${err.message}`)
  })

  onSuccess(() => {
    ElMessage.success('更新图标成功')
  })

  return {
    /** 图像是否已编辑 */
    isChanged,
    /** 更新进行中 */
    loading,
    /** 将 icon 添加到暂存区等待上传 */
    stashIcon,
    /** 将暂存区的 icon 移除 */
    clearStash,
    /** 更新图标信息 */
    updateIcon,
    /** 操作失败回调 */
    onError,
    /** 操作成功回调 */
    onSuccess,
  }
}

interface IconUpdateOptions {
  /** @default 'png' */
  type?: string
  /** @default true 图像是否可编辑 */
  iconEditable?: MaybeRef<boolean>
}
