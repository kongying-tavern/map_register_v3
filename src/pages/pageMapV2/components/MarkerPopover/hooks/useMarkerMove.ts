import type { ShallowRef } from 'vue'
import { useMapStateStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'

export const useMarkerMove = (markerInfo: ShallowRef<GSMapState.MarkerWithRenderConfig | null>) => {
  const mapStateStore = useMapStateStore()

  const position = computed<API.Coordinate2D>(() => {
    if (!markerInfo.value)
      return [0, 0]
    if (mapStateStore.mission?.type !== 'markerDragging' || !mapStateStore.mission.value[markerInfo.value.id!])
      return markerInfo.value.render.position
    return mapStateStore.mission.value[markerInfo.value.id!]
  })

  const isMoving = computed({
    get: () => {
      if (!markerInfo.value)
        return false
      if (mapStateStore.mission?.type !== 'markerDragging')
        return false
      return Boolean(mapStateStore.mission.value[markerInfo.value.id!])
    },
    set: (v) => {
      if (!markerInfo.value)
        return false
      if (mapStateStore.mission && mapStateStore.mission.type !== 'markerDragging')
        return false

      const mission = mapStateStore.mission?.type === 'markerDragging' ? { ...mapStateStore.mission.value } : {}

      if (v)
        mission[markerInfo.value.id!] = markerInfo.value.render.position
      if (!v)
        delete mission[markerInfo.value.id!]

      mapStateStore.setMission({ type: 'markerDragging', value: mission })
    },
  })

  return { isMoving, position }
}
