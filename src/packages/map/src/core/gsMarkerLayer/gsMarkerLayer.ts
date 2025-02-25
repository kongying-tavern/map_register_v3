import type { CompositeLayerProps, Layer, LayersList, UpdateParameters } from 'deck.gl'
import type { GSMarkerInfo, GSMarkerLayerProps } from '../../types'
import { CompositeLayer } from 'deck.gl'
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

  static isInstance = (v?: Layer | null): v is GSMarkerLayer => {
    if (!v)
      return false
    if (!(v instanceof this))
      return false
    return (v.constructor as typeof Layer).layerName === this.layerName
  }

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

  getIcon = (info: GSMarkerInfo) => {
    return (info.extra as API.MarkerExtra | undefined)?.iconOverride?.tag ?? info.render.mainIconTag ?? '无'
  }

  renderLayers = (): LayersList => {
    const { iconAtlas } = this.props
    if (!iconAtlas)
      return []

    const { zoom } = this.context.viewport
    const {
      data,
      iconMapping,
      hoverMarkerIds,
      focusMarkerIds,
      markedMarkerIds,
      rewritePositions,
    } = this.props

    const isInteraction = (id: number) => {
      return hoverMarkerIds?.has(id) || focusMarkerIds?.has(id)
    }

    const isMarked = (id: number) => {
      return markedMarkerIds?.has(id)
    }

    const getIconFlag = (info: GSMarkerInfo) => {
      const id = info.id!
      const markerLevelMask = info.render.isUnderground ? 0b10000 : 0b00000
      const markerStateMask = focusMarkerIds?.has(id)
        ? 0b0100
        : markedMarkerIds?.has(id)
          ? 0b1000
          : hoverMarkerIds?.has(id)
            ? 0b0010
            : 0b0001
      return markerLevelMask + markerStateMask
    }

    const getPosition = (info: GSMarkerInfo) => {
      return rewritePositions?.get(info.id!) ?? info.render.position
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
        getIcon: this.getIcon,
        getIconFlag,
        getPosition,
        getSize: 40,
        getColor: ({ id }) => [0, 0, 0, isInteraction(id!) ? 0 : isMarked(id!) ? 128 : 255],
        sizeScale: 1,
        sizeMaxPixels,
        sizeMinPixels: 4,
        updateTriggers: {
          getIconFlag: [markedMarkerIds, focusMarkerIds],
          getColor: [focusMarkerIds, hoverMarkerIds],
          getPosition: [rewritePositions],
        },
      }),
      new GSMarkerRenderLayer({
        id: `${this.id}-top`,
        pickable: true,
        data,
        statusCount: ATTACH_TOTAL,
        iconAtlas,
        iconMapping,
        getIcon: this.getIcon,
        getIconFlag,
        getPosition,
        getSize: 40,
        getColor: ({ id }) => [0, 0, 0, isInteraction(id!) ? 255 : 0],
        sizeScale: 1,
        sizeMaxPixels,
        sizeMinPixels: 4,
        updateTriggers: {
          getIconFlag: [markedMarkerIds, focusMarkerIds, hoverMarkerIds],
          getColor: [focusMarkerIds, hoverMarkerIds],
          getPosition: [rewritePositions],
        },
      }),
    ]
  }
}
