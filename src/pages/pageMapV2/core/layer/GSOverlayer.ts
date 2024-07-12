import { BitmapLayer, SolidPolygonLayer } from '@deck.gl/layers'
import type { LayersList } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import type { GSCompositeLayerState } from '.'
import { useMapStateStore } from '@/stores'

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
    const { tileConfig } = this.props
    if (!tileConfig)
      return []

    const {
      showOverlayMask,
      chunkMap,
      normalChunks,
      tileLikeChunks,
      hover,
    } = this.props

    const { isHover, hasHover } = useMapStateStore()

    const [w, h] = tileConfig.tile.size
    const [ox, oy] = tileConfig.tile.tilesOffset

    const xmin = ox
    const ymin = oy
    const xmax = w + ox
    const ymax = h + oy

    return [
      tileLikeChunks.map((chunkId) => {
        const { id, url, bounds: [[xmin, ymin], [xmax, ymax]] } = chunkMap.get(chunkId)!
        return new BitmapLayer({
          id,
          bounds: [xmin, ymax, xmax, ymin],
          image: url,
          updateTriggers: {
            tintColor: hover,
          },
          transitions: {
            tintColor: 100,
          },
        })
      }),
      new SolidPolygonLayer({
        id: 'genshin-overlay-mask',
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
      normalChunks.map((chunkId) => {
        const { id, url, bounds: [[xmin, ymin], [xmax, ymax]] } = chunkMap.get(chunkId)!
        return new BitmapLayer({
          id,
          bounds: [xmin, ymax, xmax, ymin],
          image: url,
          tintColor: !hasHover('overlay') ? [255, 255, 255, 0] : isHover('overlay', chunkId) ? [255, 255, 255, 0] : [66, 66, 66, 40],
          updateTriggers: {
            tintColor: hover,
          },
          transitions: {
            tintColor: 100,
          },
        })
      }),
    ]
  }
}
