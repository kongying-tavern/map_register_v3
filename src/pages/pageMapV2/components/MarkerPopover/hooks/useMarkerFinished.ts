import type { ShallowRef } from 'vue'
import { useArchiveStore } from '@/stores'
import { useMap } from '@/pages/pageMapV2/hooks'

export const useMarkerFinished = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const archiveStore = useArchiveStore()

  const { map } = useMap()

  const isFinished = computed({
    get: () => {
      if (markerInfo.value?.id === undefined)
        return false
      return archiveStore.currentArchive.body.Data_KYJG.has(markerInfo.value.id)
    },
    set: (v) => {
      if (markerInfo.value?.id === undefined)
        return
      archiveStore.currentArchive.body.Data_KYJG[v ? 'add' : 'delete'](markerInfo.value.id)
      map.value?.baseLayer?.forceUpdate()
    },
  })

  return { isFinished }
}
