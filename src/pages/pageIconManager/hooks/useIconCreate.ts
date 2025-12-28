import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import Resource from '@/api/resource'
import { useFetchHook } from '@/hooks'
import { useIconStore } from '@/stores'
import { getDigest, toBlob } from '@/utils'

export const useIconCreate = (form: Ref<API.IconVo>, options: IconCreateOptions = {}) => {
  const { type = 'png' } = options

  const iconStore = useIconStore()

  const stash = shallowRef<Record<string, HTMLCanvasElement>>({})

  const stashIcon = (variant: string, canvas: HTMLCanvasElement | null) => {
    if (!canvas)
      delete stash.value[variant]
    else
      stash.value[variant] = canvas
    triggerRef(stash)
  }

  const clearStash = (variant: string) => {
    delete stash.value[variant]
    triggerRef(stash)
  }

  const {
    refresh: createIcon,
    loading,
    onError,
    onSuccess,
  } = useFetchHook({
    onRequest: async () => {
      if (!stash.value.default)
        throw new Error('默认图标变体不能为空')

      const {
        description,
        id,
        tag,
        typeIdList,
      } = form.value

      const mission = Object.entries(stash.value).map(async ([variant, canvas]) => {
        const blob = await toBlob(canvas)
        const hash = await getDigest(blob, 'SHA-256')
        const time = dayjs()
        const fileName = `${hash}.${type}`
        const folderName = time.format('YYYY-MM-DD')
        /** @example '2025-09-09/abcdefg.png' */
        const filePath = `${folderName}/${fileName}`
        // 如果资源已经存在，直接返回已存在的链接
        const { data } = await Api.resource.getResource({ filePath })
        if (data?.fileUrl)
          return { variant, url: data.fileUrl }
        // 资源不存在，上传资源
        const file = new File([blob], fileName, { type: blob.type })
        const {
          message = `上传 ${filePath} 失败`,
          data: {
            fileUrl = '',
          } = {},
        } = await Resource.image.upload({ file, filePath })
        if (!fileUrl)
          throw new Error(message)
        return { variant, url: fileUrl }
      })

      const urls = await Promise.all(mission)

      // default 变体不进入 urlVariants 字段
      const { default: defaultVariant = '', ...urlVariants } = urls.reduce((acc, cur) => {
        acc[cur.variant] = cur.url
        return acc
      }, {} as Record<string, string>)

      await iconStore.createIcon({
        description,
        id,
        tag,
        typeIdList,
        url: defaultVariant,
        urlVariants,
      })
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
  /** @default 'png' */
  type?: string
}
