import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import Resource from '@/api/resource'
import { useFetchHook } from '@/hooks'
import { useIconStore } from '@/stores/icon'
import { getDigest, toBlob } from '@/utils'

export const useIconUpdate = (form: Ref<API.IconVo>, options: IconUpdateOptions = {}) => {
  const { type = 'png' } = options
  const iconStore = useIconStore()

  /** 待处理画布 */
  const stash = shallowRef<Record<string, HTMLCanvasElement | null>>({})

  const iconEditable = ref(false)

  const isChanged = computed(() => {
    return Object.keys(stash.value).length > 0
  })

  const stashIcon = (variant: string, canvasOrRemove: HTMLCanvasElement | null) => {
    stash.value[variant] = canvasOrRemove
    triggerRef(stash)
  }

  const clearStash = (variant: string) => {
    delete stash.value[variant]
    triggerRef(stash)
  }

  const {
    refresh: updateIcon,
    loading,
    onError,
    onSuccess,
  } = useFetchHook({
    onRequest: async () => {
      const {
        description,
        id,
        tag,
        typeIdList,
        url,
        urlVariants = {},
        version,
      } = form.value

      // 如果没有传递 icon，跳过图片上传
      if (!isChanged.value || !toValue(iconEditable)) {
        await iconStore.updateIcon({
          description,
          id,
          tag,
          typeIdList,
          url,
          urlVariants,
          version,
        })
        return
      }

      const mission = Object.entries(stash.value).map(async ([variant, canvas]) => {
        if (!canvas)
          return { variant, url: null }
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
      const { default: defaultVariant = url, ...newUrlVariants } = urls.reduce((acc, cur) => {
        // HACK: 通过赋予 null 值来删除某个变体
        // default 变体不允许删除
        acc[cur.variant] = cur.url as unknown as string
        return acc
      }, {} as Record<string, string>)

      await iconStore.updateIcon({
        description,
        id,
        tag,
        typeIdList,
        version,
        url: defaultVariant,
        urlVariants: {
          ...urlVariants,
          ...newUrlVariants,
        },
      })
    },
  })

  onError((err) => {
    ElMessage.error(`更新图标失败，原因为：${err.message}`)
  })

  onSuccess(() => {
    ElMessage.success('更新图标成功')
  })

  return {
    /** 待上传的变体图片组 */
    stash,
    /** 是否启用图像编辑 */
    iconEditable,
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
  /** @default 'png' 上传类型 */
  type?: string
}
