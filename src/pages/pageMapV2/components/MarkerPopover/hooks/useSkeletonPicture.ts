import type { ShallowRef } from 'vue'
import { useFetchHook } from '@/hooks'

export const useSkeletonPicture = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const { data: image, refresh, loading, ...rest } = useFetchHook({
    onRequest: async () => {
      const { picture } = toValue(markerInfo) ?? {}
      if (!picture)
        return
      const now = Date.now()
      const data = await fetch(picture, { mode: 'cors' })
      const rest = Date.now() - now
      if (rest < 200)
        await new Promise(resolve => window.setTimeout(resolve, 200 - rest))
      return data.blob()
    },
  })

  const pictureUrl = useObjectUrl(image)

  watch(() => markerInfo.value?.picture, refresh)

  return { pictureUrl, loading, ...rest }
}
