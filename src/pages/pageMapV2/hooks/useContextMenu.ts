import type { PickingInfo } from '@deck.gl/core/typed'
import type { Coordinate2D, GenshinMap, GenshinMapEvents } from '../core'
import { useMap } from './../hooks'

export const useContextMenu = () => {
  const { map } = useMap()

  const visible = ref(false)

  const position = ref<Coordinate2D | undefined>(undefined)

  const handleContext = (info: PickingInfo, ev: GenshinMapEvents['click']['1'], mapInstance: GenshinMap) => {
    console.log('地图点击', info, ev)
    // visible.value = true
    // const [x, y] = info.coordinate as Coordinate2D
    // const [ox, oy] = mapInstance.baseLayer?.rawProps.coordinateOrigin ?? [0, 0, 0]
    // position.value = [x - ox, y - oy]
  }

  watch(map, (mapInstance) => {
    if (!mapInstance)
      return
    mapInstance.event.on('click', (info, ev) => handleContext(info, ev, mapInstance))
  })

  return { visible, position }
}
