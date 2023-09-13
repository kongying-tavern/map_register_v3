import { BitmapLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import type { OverlayChunk } from '@/stores'
import { useMapSettingStore, useOverlayStore } from '@/stores'

export const getTilelikeOverlaysFrom = (target: GenshinBaseLayer): BitmapLayer[] => {
  const overlayStore = useOverlayStore()
  const mapSettingStore = useMapSettingStore()

  const isOverlayVisible = (overlay: OverlayChunk) => {
    if (!mapSettingStore.showOverlay)
      return false
    if (overlayStore.hiddenOverlayGroups.has(overlay.group.id))
      return false
    if (!overlay.group.multiple && overlayStore.topOverlayInGroup[overlay.group.id] !== overlay.item.id)
      return false
    return true
  }

  return overlayStore.tileLikeOverlays.reduce((seed, overlay) => {
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
      updateTriggers: {
        opacity: mapSettingStore.showOverlay,
        tintColor: overlayStore.stateId,
      },
    }))
    return seed
  }, [] as BitmapLayer[])
}
