import { LineLayer, PolygonLayer } from '@deck.gl/layers'
import type { LayersList } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import { LINK_ACTION_CONFIG } from '@/shared'
import { useMapStateStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'

/** 箭头半角度 */
const ARROW_ANGLE = (15 / 180) * Math.PI

/** 箭头斜边长 */
const ARROW_LENGTH = 20

/** 关联指示线图层 */
export class GSMarkerLinkLayer extends CompositeLayer<GSCompositeLayerState & LayerAttachOptions> {
  static layerName = 'GenshinMarkerLinkLayer'

  constructor(state: GSCompositeLayerState, { zoom }: LayerAttachOptions) {
    super({
      id: 'genshin-marker-link-layer',
      onHover: (info) => {
        const { addHover, removeHover, isHover } = useMapStateStore()
        const markerLink = info.object as GSMapState.MLRenderUnit | undefined
        if (markerLink === undefined)
          return removeHover('markerLink')
        if (isHover<string>('markerLink', markerLink.key))
          return
        addHover('markerLink', markerLink.key, true)
      },
      zoom,
      ...state,
    })
  }

  renderLayers = (): LayersList => {
    const {
      markersMap,
      markerLinkRenderList,
      zoom,
      interactionTimestamp,
    } = this.props

    const { isHover } = useMapStateStore()

    const zoomedArrowLength = Math.min(ARROW_LENGTH, ARROW_LENGTH * 2 ** -zoom)

    return [
      new LineLayer<GSMapState.MLRenderUnit>({
        id: 'marker-link-line-hover',
        pickable: true,
        data: markerLinkRenderList,
        getWidth: 16,
        getColor: ({ type, key }) => {
          const [R, G, B] = LINK_ACTION_CONFIG[type].lineColor
          const A: number = isHover<string>('markerLink', key) ? 50 : 0
          return [R, G, B, A]
        },
        getSourcePosition: ({ source }) => markersMap.get(source)!.render.position,
        getTargetPosition: ({ target }) => markersMap.get(target)!.render.position,
        updateTriggers: {
          getColor: interactionTimestamp,
        },
      }),
      new PolygonLayer<GSMapState.MLRenderUnit>({
        id: 'marker-link-line',
        data: markerLinkRenderList,
        pickable: true,
        filled: true,
        lineJointRounded: true,
        lineWidthMaxPixels: 2,
        getLineWidth: 2,
        getFillColor: ({ type }) => LINK_ACTION_CONFIG[type].lineColor,
        getLineColor: ({ type }) => LINK_ACTION_CONFIG[type].lineColor,
        getPolygon: ({ source, target }) => {
          const [x1, y1] = markersMap.get(source)!.render.position
          const [x2, y2] = markersMap.get(target)!.render.position
          /** 旋转角 */
          const θ = Math.atan((y2 - y1) / (x2 - x1))
          /** 象限标识 */
          const c = x2 > x1 ? 1 : -1
          // 箭头左侧
          const x3 = x2 - Math.cos(θ - ARROW_ANGLE) * zoomedArrowLength * c
          const y3 = y2 - Math.sin(θ - ARROW_ANGLE) * zoomedArrowLength * c
          // 箭头右侧
          const x4 = x2 - Math.cos(θ + ARROW_ANGLE) * zoomedArrowLength * c
          const y4 = y2 - Math.sin(θ + ARROW_ANGLE) * zoomedArrowLength * c
          // 箭头底部
          const x5 = x3 + (x4 - x3) / 2
          const y5 = y3 + (y4 - y3) / 2

          // 线段形状
          const arrowPolygon = [
            [x1, y1],
            [x5, y5],
            [x3, y3],
            [x2, y2],
            [x4, y4],
            [x5, y5],
          ]
          return arrowPolygon
        },
        updateTriggers: {
          getLineColor: interactionTimestamp,
          getPolygon: zoom,
        },
      }),
    ]
  }
}
