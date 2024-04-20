import { BitmapLayer, SolidPolygonLayer } from '@deck.gl/layers/typed'
import type { LayersList } from '@deck.gl/core/typed'
import { CompositeLayer } from '@deck.gl/core/typed'
import type { GSCompositeLayerState } from '.'

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
      showOverlayMask,
      chunkMap,
      normalChunks,
      tileLikeChunks,
    } = this.props

    const [w, h] = tileConfig!.tile.size
    const [ox, oy] = tileConfig!.tile.tilesOffset

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
        })
      }),
    ]
  }
}
