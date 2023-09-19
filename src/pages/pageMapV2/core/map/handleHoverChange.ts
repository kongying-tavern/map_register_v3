import type { PickingInfo } from '@deck.gl/core/typed'
import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinMap } from '.'
import { isMarkerVo, isMovingMarker } from '@/utils'

export interface HoverMap {
  /** 点位信息 */
  marekr: API.MarkerVo
  /** overlay 的单元 id */
  overlay: string
}

type ExtraTypeMap<T> = {
  [K in keyof T]: {
    type: K
    value: T[K]
  }
}

export type HoverObject = ExtraTypeMap<HoverMap>[keyof HoverMap]

/** hover chang 具体处理策略 */
const hoverHandleStrategy = new Map<Function | undefined, ((target: GenshinMap, info: PickingInfo) => void)[]>([
  // 如果来源是 IconLayer，则可能处理 marker 相关数据
  [IconLayer, [
    ({ store }, { object }) => {
      if (!isMarkerVo(object) || object.id === store.map.getHover('marker')?.id)
        return
      store.map.setHover('marker', object)
    },
    ({ store }, { object }) => {
      if (!isMovingMarker(object) || object.origin.id === store.map.getHover('movingMarker')?.origin.id)
        return
      store.map.setHover('movingMarker', object)
    },
  ]],

  // 如果来源是 BitmapLayer，则可能处理 overlay 相关数据
  // TODO 受到 BitmapLayer 默认拾取方案的限制，与 overlay 的交互并不是很理想，等后期实现自定义拾取方案
])

/** hover 变化处理 */
export const handleHoverChange = (target: GenshinMap, info: PickingInfo) => {
  const { sourceLayer } = info

  if (!sourceLayer) {
    target.store.map.clear('hover')
    return
  }

  const layer = Reflect.getPrototypeOf(sourceLayer)?.constructor

  return hoverHandleStrategy.get(layer)?.forEach(handler => handler(target, info))
}
