import { LineLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState } from '.'

/** 拖拽指示线图层 */
export class GSDraggingLineLayer extends LineLayer<{ id: number; position: API.Coordinate2D }> {
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
      getSourcePosition: ({ id }) => markersMap.get(id)!.render.position,
      getTargetPosition: ({ position }) => position,
      getColor: [255, 255, 0, 255],
      getWidth: 1,
    })
  }
}
