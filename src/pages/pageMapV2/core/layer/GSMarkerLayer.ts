import type { LayersList } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import { MarkerSubLayer } from './MarkerSubLayer'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import { useMapStateStore } from '@/stores'

/**
 * # 点位图层
 */
export class GSMarkerLayer extends CompositeLayer<GSCompositeLayerState & LayerAttachOptions> {
  static layerName = 'GenshinMarkerLayer'

  constructor(state: GSCompositeLayerState, options: LayerAttachOptions) {
    super({
      id: 'genshin-marker-layer',
      onHover: (info) => {
        const { addHover, removeHover, isHover } = useMapStateStore()
        const markerId = info.object as number | undefined
        if (markerId === undefined)
          return removeHover('marker')
        if (isHover<number>('marker', markerId))
          return
        addHover('marker', markerId, true)
      },
      onClick: (info) => {
        const markerId = info.object as number | undefined
        const { addFocus, removeFocus, isFocus } = useMapStateStore()
        if (info.sourceLayer?.id !== this.id || markerId === undefined)
          return removeFocus('marker')
        if (isFocus<number>('marker', markerId))
          return
        addFocus('marker', markerId, true)
      },
      ...state,
      ...options,
    })
  }

  renderLayers = (): LayersList => {
    const { markerSpriteImage } = this.props
    if (!markerSpriteImage)
      return []

    const { isHover, isFocus } = useMapStateStore()

    const {
      markersIds,
      markersMap,
      interactionTimestamp,
      markerDraggingMap,
      markerDraggingList,
      markerSpriteMapping,
      isViewPortChanging,
      markedMarkers,
      archiveHash,
      transparentMarked,
      zoom,
    } = this.props

    const isMarked = (id: number) => {
      return markedMarkers.has(id)
    }

    const { defaultIds, topIds } = markersIds.reduce((seed, id) => {
      if (isHover<number>('marker', id) || isFocus<number>('marker', id))
        seed.topIds.push(id)
      else
        seed.defaultIds.push(id)
      return seed
    }, { defaultIds: [] as number[], topIds: [] as number[] })

    const getColor: [number, number, number, number] | ((id: number) => [number, number, number, number]) = !transparentMarked
      ? [0, 0, 0, 255]
      : (id: number) => markedMarkers.has(id)
          ? [0, 0, 0, 128]
          : [0, 0, 0, 255]

    const getIcon = (id: number) => {
      const info = markersMap.get(id)
      if (!info)
        return '无'
      const extra = info.extra as API.MarkerExtra | undefined
      const { render: { mainIconTag = '无' } } = info
      return extra?.iconOverride?.tag ?? mainIconTag
    }

    const getIconFlag = (id: number) => {
      const info = markersMap.get(id)
      if (!info)
        return 0b0001
      const { render: { isUnderground } } = info
      const state = isMarked(id)
        ? 0b1000
        : isFocus<number>('marker', id)
          ? 0b0100
          : isHover<number>('marker', id)
            ? 0b0010
            : 0b0001
      return state + (isUnderground ? 0b10000 : 0b00000)
    }

    const getPosition = (id: number) => {
      const info = markersMap.get(id)
      if (!info)
        return [999_999, 999_999] as [number, number]
      const { render: { position } } = info
      const rewritePosition = markerDraggingMap[id]
      return rewritePosition ?? position
    }

    const sizeMaxPixels = 40 * 2 ** (zoom + 2)

    return [
      new MarkerSubLayer({
        id: 'genshin-default-markers',
        pickable: !isViewPortChanging,
        data: defaultIds,
        iconAtlas: markerSpriteImage,
        iconMapping: markerSpriteMapping,
        getIcon,
        getIconFlag,
        getPosition,
        getSize: 44,
        getColor,
        sizeScale: 1,
        sizeMaxPixels,
        sizeMinPixels: 4,
        updateTriggers: {
          getIcon: [interactionTimestamp, archiveHash],
          getPosition: [markerDraggingList],
        },
      }),
      new MarkerSubLayer({
        id: 'genshin-top-markers',
        pickable: !isViewPortChanging,
        data: topIds,
        iconAtlas: markerSpriteImage,
        iconMapping: markerSpriteMapping,
        getIcon,
        getIconFlag,
        getPosition,
        getSize: 44,
        getColor: [0, 0, 0, 255],
        sizeScale: 1,
        sizeMaxPixels,
        sizeMinPixels: 4,
        updateTriggers: {
          getIcon: [interactionTimestamp, archiveHash],
          getPosition: [markerDraggingList],
          getColor: [transparentMarked, archiveHash],
        },
      }),
    ]
  }
}
