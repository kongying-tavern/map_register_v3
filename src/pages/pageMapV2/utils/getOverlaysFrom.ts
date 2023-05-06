import { BitmapLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'

export type BoundsExpression = [number, number, number, number]

export const getOverlaysFrom = (target: GenshinBaseLayer): BitmapLayer[] => {
  return target.overlayManager.overlays.map(overlay => new BitmapLayer({
    id: `${target.props.id}-overlay-${overlay.name}`,
    pickable: target.context.deck.stateManager.get('showTooltip'),
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    bounds: overlay.overlayBounds,
    image: overlay.url,
    operation: 'draw',
    visible: target.context.deck.stateManager.get('showOverlay'),
  }))
}
