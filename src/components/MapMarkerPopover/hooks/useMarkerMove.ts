import type { ShallowRef } from 'vue'
import { useMapStateStore } from '@/stores'
import type { GSMarkerInfo } from '@/packages/map'

export const useMarkerMove = (markerInfo: ShallowRef<GSMarkerInfo | null>) => {
  const mapStateStore = useMapStateStore()

  const { data, isEnable, update } = mapStateStore.subscribeMission('markerDragging', () => ({}))

  const draggingPosition = computed(() => {
    if (!markerInfo.value)
      return
    return data.value[markerInfo.value.id!]
  })

  const position = computed<API.Coordinate2D>(() => {
    if (!markerInfo.value)
      return [0, 0]
    return draggingPosition.value ?? markerInfo.value.render.position
  })

  const isMoving = computed({
    get: () => {
      if (!markerInfo.value)
        return false
      return draggingPosition.value !== undefined
    },
    set: (isStartDrag) => {
      if (!markerInfo.value)
        return false
      const newData = { ...data.value }
      if (!isStartDrag)
        delete newData[markerInfo.value.id!]
      else
        newData[markerInfo.value.id!] = markerInfo.value.render.position
      update(newData)
    },
  })

  return { isMoving, isEnable, position }
}
