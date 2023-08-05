import type { ShallowRef } from 'vue'
import { useArchiveStore } from '@/stores'

export const useMarkerFinished = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const archiveStore = useArchiveStore()

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
    },
  })

  return { isFinished }
}
