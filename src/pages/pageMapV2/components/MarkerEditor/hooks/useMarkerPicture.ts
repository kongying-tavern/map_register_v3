import { useFetchHook } from '@/hooks'

export const useMarkerPicture = (picture: Ref<string | undefined>) => {
  const largeImage = shallowRef<Blob>()
  const largeImageUrl = useObjectUrl(largeImage)

  const thumbImage = shallowRef<Blob>()
  const thumbImageUrl = useObjectUrl(thumbImage)

  const { loading: initLoading, refresh: initPicture, onSuccess: onInitSuccess } = useFetchHook({
    shallow: true,
    initialValue: undefined,
    onRequest: async () => {
      const pictureUrl = picture.value
      if (!pictureUrl || pictureUrl.toLowerCase().startsWith('blob:'))
        return

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

      // 加载缩略图
      const thumb = await fetch(pictureUrl, { mode: 'cors' }).then(r => r.blob()).catch(() => undefined)

      // 加载大图
      const large = await fetch(largeUrl, { mode: 'cors' }).then(r => r.blob()).catch(() => thumb)

      return { large, thumb }
    },
  })

  onInitSuccess((data) => {
    if (!data)
      return
    const { large, thumb } = data
    largeImage.value = large
    thumbImage.value = thumb
  })

  watch(picture, initPicture, { immediate: true })

  return {
    initLoading,
    largeImageUrl,
    thumbImageUrl,
  }
}
