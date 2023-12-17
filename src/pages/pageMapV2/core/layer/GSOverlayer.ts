import { BitmapLayer, SolidPolygonLayer } from '@deck.gl/layers/typed'
import type { Color, LayersList } from '@deck.gl/core/typed'
import { CompositeLayer } from '@deck.gl/core/typed'
import type { GSCompositeLayerState } from '.'
import type { OverlayChunk } from '@/stores'

const CONSPICUOUS_COLOR: Color = [255, 255, 255]
const INCONSPICUOUS_COLOR: Color = [128, 128, 128]
const NO_MASK_COLOR: Color = [200, 200, 200]

/** 拖拽指示线图层 */
export class GSOverlayer extends CompositeLayer<GSCompositeLayerState> {
  static layerName = 'GenshinOverlayer'

  constructor(state: GSCompositeLayerState) {
    super({
      id: 'genshin-overlayer',
      ...state,
    })
  }

  renderLayers = (): LayersList => {
    const {
      tileConfig,
      overlayStateId,
      normalOverlays,
      tileLikeOverlays,
      showOverlay,
      showOverlayMask,
      topOverlayInGroup,
      hiddenOverlayGroups,
    } = this.props

    const [w, h] = tileConfig!.tile.size
    const [ox, oy] = tileConfig!.tile.tilesOffset

    const xmin = ox
    const ymin = oy
    const xmax = w + ox
    const ymax = h + oy

    const isOverlayVisible = (overlay: OverlayChunk) => {
      if (hiddenOverlayGroups.has(overlay.group.id))
        return false
      if (!overlay.group.multiple && topOverlayInGroup[overlay.group.id] !== overlay.item.id)
        return false
      return true
    }

    const isOverlayOnTop = (overlay: OverlayChunk) => {
      return topOverlayInGroup[overlay.group.id] === overlay.item.id
    }

    return [
      ...tileLikeOverlays.map((overlay) => {
        const { bounds: [[xmin, ymin], [xmax, ymax]] } = overlay
        return new BitmapLayer({
          id: `overlay-${overlay.id}`,
          visible: showOverlay,
          bounds: [xmin, ymax, xmax, ymin],
          image: overlay.url,
          opacity: isOverlayVisible(overlay) ? 1 : 0,
          tintColor: isOverlayOnTop(overlay)
            ? CONSPICUOUS_COLOR
            : showOverlayMask
              ? INCONSPICUOUS_COLOR
              : NO_MASK_COLOR,
          updateTriggers: {
            opacity: showOverlay,
            tintColor: overlayStateId,
          },
        })
      }),
      new SolidPolygonLayer({
        id: 'genshin-mask-layer',
        visible: showOverlay,
        data: [{
          polygon: [
            [xmin, ymin],
            [xmax, ymin],
            [xmax, ymax],
            [xmin, ymax],
          ],
        }],
        getFillColor: () => [0, 0, 0, showOverlayMask ? 0.5 * 255 : 0],
        updateTriggers: {
          getFillColor: showOverlayMask,
        },
        transitions: {
          getFillColor: 100,
        },
      }),
      ...normalOverlays.map((overlay) => {
        const { bounds: [[xmin, ymin], [xmax, ymax]] } = overlay
        return new BitmapLayer({
          id: `overlay-${overlay.id}`,
          visible: showOverlay,
          bounds: [xmin, ymax, xmax, ymin],
          image: overlay.url,
          opacity: isOverlayVisible(overlay) ? 1 : 0,
          tintColor: isOverlayOnTop(overlay)
            ? CONSPICUOUS_COLOR
            : showOverlayMask
              ? INCONSPICUOUS_COLOR
              : NO_MASK_COLOR,
          transitions: {
            opacity: 100,
            tintColor: 100,
          },
          updateTriggers: {
            opacity: showOverlay,
            tintColor: overlayStateId,
          },
        })
      }),
    ]
  }
}
