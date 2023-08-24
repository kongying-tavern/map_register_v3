import type { ShallowRef } from 'vue'
import { useMapStore } from '@/stores'

export const useMarkerMove = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const mapStore = useMapStore()

  const isMoving = computed({
    get: () => {
      if (!markerInfo.value)
        return false
      return mapStore.mission?.type === 'moveMarkers' && mapStore.mission.value.find(moving => moving.origin.id === markerInfo.value!.id) !== undefined
    },
    set: (v) => {
      if (!markerInfo.value)
        return false
      if (mapStore.mission && mapStore.mission.type !== 'moveMarkers')
        return false

      const mission = mapStore.getMission('moveMarkers') ?? []
      const findIndex = mission.findIndex(moving => moving.origin.id === markerInfo.value!.id)

      if (v && findIndex < 0)
        mission.push({ origin: markerInfo.value, offset: [0, 0] })
      if (!v && findIndex >= 0)
        mission.splice(findIndex, 1)

      mapStore.setMission('moveMarkers', [...mission])
    },
  })

  return { isMoving }
}
