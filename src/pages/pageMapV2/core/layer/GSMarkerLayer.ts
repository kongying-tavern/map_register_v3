import { IconLayer } from '@deck.gl/layers'
import type { LayersList } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import { useMapStateStore } from '@/stores'

// TODO 应将该图层将与 GSMarkerHoverLayer 合并为组合图层
export class GSMarkerLayer extends CompositeLayer<GSCompositeLayerState & LayerAttachOptions> {
  static layerName = 'GenshinMarkerLayer'

  constructor(state: GSCompositeLayerState, options: LayerAttachOptions) {
    super({
      id: 'genshin-marker-layer',
      onHover: (info) => {
        const { addHover, removeHover, isHover } = useMapStateStore()
        if (info.sourceLayer?.id !== this.id)
          return removeHover('markerLink')
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

    const getColor: [number, number, number, number] | ((id: number) => [number, number, number, number]) = transparentMarked
      ? [0, 0, 0, 255]
      : (id: number) => markedMarkers.has(id)
          ? [0, 0, 0, 128]
          : [0, 0, 0, 255]

    return [
      new IconLayer(({
        id: 'genshin-hover-markers',
        pickable: true,
        data: defaultIds,
        iconAtlas: markerSpriteImage,
        iconMapping: markerSpriteMapping,
        getIcon: (id) => {
          const { render: { isUnderground, mainIconTag } } = markersMap.get(id)!
          const state = isMarked(id!) ? 'marked' : 'default'
          const type = isUnderground ? 'underground' : 'default'
          return `${mainIconTag}.${state}.${type}`
        },
        getPosition: (id) => {
          const { render: { position } } = markersMap.get(id)!
          const rewritePosition = markerDraggingMap[id]
          return rewritePosition ?? position
        },
        getSize: id => isFocus<number>('marker', id) ? 44 : 36,
        getColor: [0, 0, 0, 255],
        sizeScale: 1,
        sizeMaxPixels: 40 * 2 ** (zoom + 2),
        sizeMinPixels: 4,
        updateTriggers: {
          getPosition: [markerDraggingList],
          getSize: [interactionTimestamp],
        },
      })),
      new IconLayer({
        id: 'genshin-markers',
        pickable: !isViewPortChanging,
        data: topIds,
        iconAtlas: markerSpriteImage,
        iconMapping: markerSpriteMapping,
        getIcon: (id) => {
          const { render: { isUnderground, mainIconTag = '无' } } = markersMap.get(id)!
          const state = isMarked(id!) ? 'marked' : 'default'
          const type = isUnderground ? 'underground' : 'default'
          return `${mainIconTag}.${state}.${type}`
        },
        getPosition: (id) => {
          const { render: { position } } = markersMap.get(id)!
          const rewritePosition = markerDraggingMap[id]
          return rewritePosition ?? position
        },
        getSize: (id) => {
          if (isFocus<number>('marker', id))
            return 44
          if (isHover<number>('marker', id))
            return 40
          return 36
        },
        getColor,
        sizeScale: 1,
        sizeMaxPixels: 40 * 2 ** (zoom + 2),
        sizeMinPixels: 4,
        updateTriggers: {
          getIcon: [interactionTimestamp, archiveHash],
          getPosition: [markerDraggingList],
          getSize: [interactionTimestamp],
          getColor: [transparentMarked, archiveHash],
        },
      }),
    ]
  }
}
