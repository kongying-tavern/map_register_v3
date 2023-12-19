import { useFetchHook } from '@/hooks'
import { getDigest } from '@/utils'
import { useImageHostingStore } from '@/stores'

export interface MarkerPictureHookOptions {
  afterUpload: (res: { large: string; thumb: string }) => void
}

export const useMarkerPicture = (marker: Ref<API.MarkerVo>, options: MarkerPictureHookOptions) => {
  const imageHostingStore = useImageHostingStore()

  const rawThumbImage = shallowRef<Blob>()
  const rawThumbImageUrl = useObjectUrl(rawThumbImage)

  const thumbImage = shallowRef<Blob>()
  const largeImage = shallowRef<Blob>()

  const { loading: initLoading, refresh: initPicture, onSuccess: onInitSuccess } = useFetchHook({
    onRequest: async (pictureUrl?: string) => {
      if (!pictureUrl) {
        return {
          thumb: undefined,
          large: undefined,
        }
      }

      const { protocol, origin, pathname } = new URL(pictureUrl)

      if (!['http:', 'https:'].includes(protocol))
        throw new Error(`协议 "${protocol}" 不支持`)

      const paths = pathname.split('/')

      const nameunits = paths.at(-1)!.split('.')
      if (!nameunits || nameunits.length < 2)
        throw new Error(`路径 "${pathname}" 未包含可解析的文件名`)

      // 提取拓展名
      const extname = nameunits.at(-1)!

      // 提取文件名（不含拓展名）
      const filename = nameunits.slice(0, -1).join('.')

      // 合成大图地址
      const largeUrl = `${origin}${paths.slice(0, -1).join('/')}/${filename}_large.${extname}`

      // 加载大图
      const large = await fetch(largeUrl, { mode: 'cors' }).then(r => r.blob()).catch(() => undefined)

      // 加载缩略图
      const thumb = await fetch(pictureUrl, { mode: 'cors' }).then(r => r.blob()).catch(() => undefined)

      return {
        thumb,
        large,
      }
    },
  })

  onInitSuccess(({ thumb, large }) => {
    rawThumbImage.value = thumb
    largeImage.value = large ?? thumb
  })

  watch(() => marker.value.picture, initPicture, { immediate: true })

  const cache = ref({
    large: {} as Record<string, string>,
    thumb: {} as Record<string, string>,
  })

  /** 处理进度描述 */
  const content = ref('')

  watch(thumbImage, (thumb) => {
    content.value = thumb ? '等待上传' : ''
  })

  const { loading: uploadLoading, refresh: uploadImage, onSuccess: onUploadSuccess, onError: onUploadError } = useFetchHook({
    onRequest: async () => {
      if (!thumbImage.value || !largeImage.value)
        return

      const newThumbHash = await getDigest(thumbImage.value, 'SHA-256')
      if (!cache.value.thumb[newThumbHash]) {
        const url = await imageHostingStore.upload(
          new File([thumbImage.value], `${newThumbHash}.png`),
          (ratio: number) => {
            content.value = `正在上传缩略图:\n${Math.ceil(100 * ratio)} %`
          },
        )
        cache.value.thumb[newThumbHash] = url
      }

      const newLargeHash = await getDigest(largeImage.value, 'SHA-256')
      if (!cache.value.large[newLargeHash]) {
        const url = await imageHostingStore.upload(
          new File([largeImage.value], `${newLargeHash}.png`),
          (ratio: number) => {
            content.value = `正在上传大图:\n${Math.ceil(100 * ratio)} %`
          },
        )
        cache.value.large[newLargeHash] = url
      }

      const res = {
        large: cache.value.large[newLargeHash],
        thumb: cache.value.thumb[newThumbHash],
      }

      options.afterUpload(res)

      return res
    },
  })

  onUploadSuccess(() => {
    content.value = `上传完毕`
  })

  onUploadError((err) => {
    content.value = `上传失败：${err.message}`
  })

  return {
    initLoading,

    rawThumbImage,
    rawThumbImageUrl,

    thumbImage,
    largeImage,

    content,

    uploadLoading,
    uploadImage,
    onUploadSuccess,
  }
}
