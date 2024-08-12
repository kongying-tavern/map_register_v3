import { genshinMapCanvasKey } from './../shared'
import { useMapStateStore, useTileStore } from '@/stores'

export interface MapProjectionHookOptions {
  noCovertCoord?: boolean
  integer?: boolean
}

export const useMapProjection = (coord: API.Coordinate2D | Ref<API.Coordinate2D | undefined>, options: MapProjectionHookOptions = {}) => {
  const { noCovertCoord = false, integer = false } = options

  const viewRef = inject(genshinMapCanvasKey, ref())

  const { width, height } = useElementSize(viewRef)
  const mapStateStore = useMapStateStore()
  const tileStore = useTileStore()

  /** 投影后元素应随地图缩放等级所缩放的比例 */
  const scaleRatio = computed(() => 2 ** (mapStateStore.viewState.zoom))

  /** 视口中心坐标 */
  const center = computed<API.Coordinate2D>(() => [width.value / 2, height.value / 2])

  /** 投影后元素显示在视口上的坐标 */
  const position = computed<API.Coordinate2D>(() => {
    if (!tileStore.currentTileConfig)
      return [0, 0]
    const rawCoord = unref(coord)
    if (!rawCoord)
      return [0, 0]
    const [coordOffsetX, coordOffsetY] = noCovertCoord ? [0, 0] : tileStore.currentTileConfig.tile.center
    const { target, zoom } = mapStateStore.viewState
    const scale = 2 ** zoom
    const [x, y] = rawCoord
    const [tx, ty] = target
    const lx = (x + coordOffsetX - tx) * scale
    const ly = (y + coordOffsetY - ty) * scale
    const [cx, cy] = center.value
    return integer
      ? [Math.floor(cx + lx), Math.floor(cy + ly)]
      : [cx + lx, cy + ly]
  })

  return {
    scaleRatio,
    position,
    zoom: computed(() => mapStateStore.viewState.zoom),
  }
}
