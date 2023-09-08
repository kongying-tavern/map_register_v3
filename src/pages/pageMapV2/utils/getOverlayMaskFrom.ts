import { SolidPolygonLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import { useMapSettingStore, useOverlayStore } from '@/stores'

export const getOverlayMaskFrom = (target: GenshinBaseLayer) => {
  const [xmin, ymax, xmax, ymin] = target.rawProps.bounds
  const overflow = 1024
  const overlayStore = useOverlayStore()
  const mapSettingStore = useMapSettingStore()

  return new SolidPolygonLayer({
    id: `${target.props.id}-mask`,
    visible: overlayStore.mergedOverlayConfig.overlayMask,
    data: [{
      polygon: [
        [xmin - overflow, ymin - overflow],
        [xmax + overflow, ymin - overflow],
        [xmax + overflow, ymax + overflow],
        [xmin - overflow, ymax + overflow],
      ],
    }],
    getFillColor: () => [0, 0, 0, mapSettingStore.showOverlay ? overlayStore.mergedOverlayConfig.overlayMaskOpacity * 255 : 0],
    transitions: {
      getFillColor: 150,
    },
    updateTriggers: {
      getFillColor: mapSettingStore.showOverlay,
    },
  })
}
