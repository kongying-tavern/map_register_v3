import type { ShallowRef } from 'vue'
import { ref } from 'vue'
import { useFetchHook } from '@/hooks'

export const useSkeletonPicture = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const pictureUrl = ref('')

  const { onSuccess, refresh, ...rest } = useFetchHook({
    onRequest: async (imgUrl?: string) => {
      if (!imgUrl)
        return
      const data = await fetch(imgUrl, { mode: 'cors' })
      return data.blob()
    },
  })

  watch(() => markerInfo.value?.picture, refresh)

  onSuccess((blob) => {
    URL.revokeObjectURL(pictureUrl.value)
    pictureUrl.value = blob ? URL.createObjectURL(blob) : ''
  })

  return { pictureUrl, ...rest }
}
