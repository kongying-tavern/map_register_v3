import { BitmapLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'

export const getOverlaysFrom = (target: GenshinBaseLayer): BitmapLayer[] => {
  return target.overlayManager.overlays.map(overlay => new BitmapLayer({
    id: `${target.props.id}-overlay-${overlay.name}`,
    pickable: target.state.showTooltip,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    bounds: overlay.overlayBounds,
    image: overlay.url,
    visible: target.state.showOverlay,
    updateTriggers: {
      pickable: target.state.showOverlay,
      visible: target.state.showOverlay,
    },
  }))
}
