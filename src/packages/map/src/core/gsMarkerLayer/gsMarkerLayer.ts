import type { CompositeLayerProps, Layer, LayersList, UpdateParameters } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import type { GSMarkerInfo, GSMarkerLayerProps } from '../../types'
import { GSMarkerRenderLayer } from './gsMarkerRenderLayer'

/**
 * 可用于附加渲染的子纹理总数。
 * 该值为 `src\stores\hooks\useMarkerSprite.ts` 中定义的状态数以及
 * `src\worker\markerSpriteRenderer\renderer.worker.ts` 中定义的附加纹理数
 * 的总和
 */
const ATTACH_TOTAL = 5

/**
 * # 点位图层
 */
export class GSMarkerLayer extends CompositeLayer<GSMarkerLayerProps> {
  static layerName = 'GenshinMarkerLayer'

  constructor(props: GSMarkerLayerProps) {
    super({
      id: 'marker',
      pickable: true,
      ...props,
    })
  }

  shouldUpdateState(params: UpdateParameters<Layer<GSMarkerLayerProps & Required<CompositeLayerProps>>>): boolean {
    const { propsOrDataChanged, viewportChanged } = params.changeFlags
    return propsOrDataChanged || viewportChanged
  }

  renderLayers = (): LayersList => {
    const { iconAtlas } = this.props
    if (!iconAtlas)
      return []

    const { zoom } = this.context.viewport

    const {
      data,
      iconMapping,
      hover,
      getFocus,
      getMarked,
    } = this.props

    const getIcon = (info: GSMarkerInfo) => {
      return (info.extra as API.MarkerExtra | undefined)?.iconOverride?.tag ?? info.render.mainIconTag ?? '无'
    }

    const getIconFlag = (info: GSMarkerInfo) => {
      const { id } = info
      const state = getMarked(id!)
        ? 0b1000
        : getFocus(id!)
          ? 0b0100
          : hover.has(id!)
            ? 0b0010
            : 0b0001
      return state + (info.render.isUnderground ? 0b10000 : 0b00000)
    }

    const getPosition = (info: GSMarkerInfo) => {
      return info.render.position
    }

    const sizeMaxPixels = 40 * 2 ** (zoom + 2)

    return [
      new GSMarkerRenderLayer({
        id: `${this.id}-bottom`,
        pickable: true,
        data,
        statusCount: ATTACH_TOTAL,
        iconAtlas,
        iconMapping,
        getIcon,
        getIconFlag,
        getPosition,
        getSize: 44,
        getColor: ({ id }) => [0, 0, 0, hover.has(id!) ? 0 : 255],
        sizeScale: 1,
        sizeMaxPixels,
        sizeMinPixels: 4,
        updateTriggers: {
          getIconFlag: [hover],
          getColor: [hover],
        },
      }),
      new GSMarkerRenderLayer({
        id: `${this.id}-top`,
        pickable: true,
        data,
        statusCount: ATTACH_TOTAL,
        iconAtlas,
        iconMapping,
        getIcon,
        getIconFlag,
        getPosition,
        getSize: 44,
        getColor: ({ id }) => [0, 0, 0, hover.has(id!) ? 255 : 0],
        sizeScale: 1,
        sizeMaxPixels,
        sizeMinPixels: 4,
        updateTriggers: {
          getIconFlag: [hover],
          getColor: [hover],
        },
      }),
    ]
  }
}
