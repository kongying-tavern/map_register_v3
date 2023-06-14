import type { Coordinate2D } from './../core'
import { useMap } from './../hooks'
import { genshinMapCanvasKey } from './../shared'

export const useMapProjection = (coord: Coordinate2D | Ref<Coordinate2D | undefined>) => {
  const viewRef = inject(genshinMapCanvasKey, ref(null))

  const { width, height } = useElementSize(viewRef)
  const { map } = useMap()

  /** 投影后元素应随地图缩放等级所缩放的比例 */
  const scaleRatio = computed(() => 2 ** (map.value?.mainViewState.zoom ?? 1))

  /** 视口中心坐标 */
  const center = computed<Coordinate2D>(() => [width.value / 2, height.value / 2])

  /** 投影后元素显示在视口上的坐标 */
  const position = computed<Coordinate2D>(() => {
    const rawCoord = unref(coord)
    if (!map.value?.baseLayer || !rawCoord)
      return [-9999, -9999]
    const [coordOffsetX, coordOffsetY] = map.value.baseLayer.rawProps.center
    const { target, zoom } = map.value.mainViewState
    const scale = 2 ** zoom
    const [x, y] = rawCoord
    const [tx, ty] = target
    const lx = (x + coordOffsetX - tx) * scale
    const ly = (y + coordOffsetY - ty) * scale
    const [cx, cy] = center.value
    return [cx + lx, cy + ly]
  })

  return { scaleRatio, position }
}
