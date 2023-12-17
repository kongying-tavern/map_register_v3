import { IconLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'

export class GSMarkerLayer extends IconLayer<number> {
  declare state: IconLayer['state'] & {
    data: GSMapState.MarkerWithRenderConfig[]
  }

  static layerName = 'GenshinMarkerLayer'

  constructor(state: GSCompositeLayerState, { zoom }: LayerAttachOptions) {
    const {
      markersIds,
      markersMap,
      markerDraggingMap,
      markerDraggingList,
      focus,
      hover,
      markerSpriteImage,
      markerSpriteMapping,
      isViewPortChanging,
      markedMarkers,
      archiveHash,
      transparentMarked,
    } = state

    const isHover = (id: number) => {
      if (hover?.type !== 'defaultMarker')
        return false
      return hover.value.id === id
    }

    const isFocus = (id?: number) => {
      if (focus?.type !== 'defaultMarker')
        return false
      return focus.value.id === id
    }

    const isMarked = (id: number) => {
      return markedMarkers.has(id)
    }

    super({
      id: 'genshin-marker-layer',
      pickable: !isViewPortChanging,
      data: markersIds,
      iconAtlas: markerSpriteImage,
      iconMapping: markerSpriteMapping,
      getIcon: (id) => {
        const { render: { isUnderground, mainIconTag } } = markersMap[id]
        const state = isMarked(id!) ? 'marked' : isHover(id!) ? 'hover' : 'default'
        const type = isUnderground ? 'underground' : 'default'
        return `${mainIconTag}.${state}.${type}`
      },
      getPosition: (id) => {
        const { render: { position } } = markersMap[id]
        const rewritePosition = markerDraggingMap[id]
        return rewritePosition ?? position
      },
      getSize: id => isFocus(id) ? 44 : 36,
      getColor: id => [0, 0, 0, (transparentMarked && isMarked(id!)) ? 51 : 255],
      sizeScale: 1,
      sizeMaxPixels: 40 * 2 ** (zoom + 2),
      sizeMinPixels: 4,
      updateTriggers: {
        getIcon: [hover, archiveHash],
        getPosition: [markerDraggingList],
        getSize: [focus],
        getColor: [transparentMarked, archiveHash],
      },
      transitions: {
        getSize: 66,
        getColor: 66,
      },
    })
  }
}
