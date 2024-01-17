import { PolygonLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'

const ACTION_COLOR_MAP: Record<GSMapState.MLRenderUnit['type'], [number, number, number, number]> = {
  TRIGGER: [255, 0, 0, 255],
  TRIGGER_ALL: [255, 255, 255, 255],
  TRIGGER_ANY: [0, 0, 0, 255],
  RELATED: [0, 255, 0, 255],
  EQUIVALENT: [0, 0, 255, 255],
}

/** 箭头半角度 */
const ARROW_ANGLE = (15 / 180) * Math.PI

/** 箭头斜边长 */
const ARROW_LENGTH = 20

/** 关联指示线图层 */
export class GSMarkerLinkLayer extends PolygonLayer<GSMapState.MLRenderUnit, LayerAttachOptions> {
  static layerName = 'GenshinMarkerLinkLayer'

  constructor(state: GSCompositeLayerState, { zoom }: LayerAttachOptions) {
    const {
      markersMap,
      markerLinkRenderList,
    } = state

    const zoomedArrowLength = Math.min(ARROW_LENGTH, ARROW_LENGTH * 2 ** -zoom)

    super({
      id: 'genshin-marker-link-layer',
      data: markerLinkRenderList,
      filled: true,
      lineJointRounded: true,
      lineWidthMaxPixels: 2,
      getLineWidth: 2,
      getFillColor: ({ type }) => ACTION_COLOR_MAP[type],
      getLineColor: ({ type }) => ACTION_COLOR_MAP[type],
      getPolygon: ({ source, target }) => {
        const [x1, y1] = markersMap[source].render.position
        const [x2, y2] = markersMap[target].render.position
        const θ = Math.atan((y2 - y1) / (x2 - x1))
        const c = x2 > x1 ? 1 : -1
        const x3 = x2 - Math.cos(θ - ARROW_ANGLE) * zoomedArrowLength * c
        const y3 = y2 - Math.sin(θ - ARROW_ANGLE) * zoomedArrowLength * c
        const x4 = x2 - Math.cos(θ + ARROW_ANGLE) * zoomedArrowLength * c
        const y4 = y2 - Math.sin(θ + ARROW_ANGLE) * zoomedArrowLength * c
        const x5 = x3 + (x4 - x3) / 2
        const y5 = y3 + (y4 - y3) / 2
        return [
          [x1, y1],
          [x5, y5],
          [x3, y3],
          [x2, y2],
          [x4, y4],
          [x5, y5],
        ]
      },
      updateTriggers: {
        getPolygon: zoom,
      },
    })
  }
}
