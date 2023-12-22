import { LineLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState } from '.'

/** 关联指示线图层 */
export class GSLinkLayer extends LineLayer<{ id: number; position: API.Coordinate2D }> {
  declare state: LineLayer['state'] & {
    data: { id: number; position: API.Coordinate2D }[]
  }

  static layerName = 'GenshinDraggingLineLayer'

  constructor(state: GSCompositeLayerState) {
    const {
      markersMap,
      markerDraggingList,
    } = state

    super({
      id: 'genshin-dragging-line-layer',
      data: markerDraggingList,
      getSourcePosition: ({ id }) => markersMap[id].render.position,
      getTargetPosition: ({ position }) => position,
      getColor: [255, 255, 0, 255],
      getWidth: 1,
    })
  }
}
