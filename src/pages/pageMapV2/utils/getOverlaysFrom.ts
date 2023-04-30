import { BitmapLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'

export type BoundsExpression = [number, number, number, number]

export const getOverlaysFrom = (target: GenshinBaseLayer): BitmapLayer[] => {
  const { center: [cx, cy] } = target.rawProps
  /** 配置与 leaflet 不同，需要将 y 轴对调 */
  const calculate = ([xmin, ymin, xmax, ymax]: BoundsExpression): BoundsExpression => {
    return [xmin + cx, ymax + cy, xmax + cx, ymin + cy]
  }
  return target.overlayManager.overlays.map(overlay => new BitmapLayer({
    id: `${target.props.id}-overlay-${overlay.name}`,
    pickable: target.context.deck.stateManager.get('showTooltip'),
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    bounds: calculate(overlay.bounds),
    image: overlay.url,
    operation: 'draw',
    visible: target.context.deck.stateManager.get('showUndergroundLayer'),
  }))
}
