import { BitmapLayer } from '@deck.gl/layers/typed'
import type { Color } from '@deck.gl/core/typed'
import type { GenshinBaseLayer } from '../core'
import type { OverlaySingleConfig } from '@/stores'
import { useMapSettingStore, useOverlayStore } from '@/stores'

const CONSPICUOUS_COLOR: Color = [255, 255, 255]
const INCONSPICUOUS_COLOR: Color = [128, 128, 128]

export const getOverlaysFrom = (target: GenshinBaseLayer): BitmapLayer[] => {
  const overlayStore = useOverlayStore()
  const mapSettingStore = useMapSettingStore()

  const isOverlayVisible = (overlay: OverlaySingleConfig) => {
    if (!mapSettingStore.showOverlay)
      return false
    if (overlayStore.hiddenOverlayGroups.has(overlay.groupId))
      return false
    if (!overlay.groupMultiple && overlayStore.topOverlayInGroup[overlay.groupId] !== overlay.unitId)
      return false
    return true
  }

  const isOverlayConspicuous = (overlay: OverlaySingleConfig) => {
    return overlayStore.topOverlayInGroup[overlay.groupId] === overlay.unitId
  }

  return overlayStore.visibleOverlays.reduce((seed, overlay) => {
    let [[xmin, ymin], [xmax, ymax]] = overlay.bounds
    ;[xmin, ymin] = target.context.deck.projectCoord([xmin, ymin])
    ;[xmax, ymax] = target.context.deck.projectCoord([xmax, ymax])
    seed.push(new BitmapLayer({
      id: `${target.props.id}-overlay-${overlay.id}`,
      pickable: mapSettingStore.showTooltip,
      coordinateSystem: target.rawProps.coordinateSystem,
      coordinateOrigin: target.rawProps.coordinateOrigin,
      bounds: [xmin, ymax, xmax, ymin],
      image: overlay.url,
      opacity: isOverlayVisible(overlay) ? 1 : 0,
      tintColor: isOverlayConspicuous(overlay) ? CONSPICUOUS_COLOR : INCONSPICUOUS_COLOR,
      transitions: {
        opacity: 150,
        tintColor: 150,
      },
      updateTriggers: {
        opacity: mapSettingStore.showOverlay,
        tintColor: overlayStore.stateId,
      },
    }))
    return seed
  }, [] as BitmapLayer[])
}
