import type { ShallowRef } from 'vue'
import { useArchiveStore } from '@/stores'

/**
 * 用于控制点位是否已完成
 * @todo 后续可能需要对接点位联动逻辑
 */
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
