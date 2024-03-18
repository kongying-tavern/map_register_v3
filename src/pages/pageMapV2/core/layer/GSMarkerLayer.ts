import { IconLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'

// TODO 应将该图层将与 GSMarkerHoverLayer 合并为组合图层
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

    const getSize = focus?.type === 'defaultMarker'
      ? (id?: number) => focus.value.id === id ? 44 : 36
      : focus?.type === 'multipleMarkers'
        ? (id?: number) => focus.value.has(id!) ? 44 : 36
        : 36

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
        const state = isMarked(id!) ? 'marked' : 'default'
        const type = isUnderground ? 'underground' : 'default'
        return `${mainIconTag}.${state}.${type}`
      },
      getPosition: (id) => {
        const { render: { position } } = markersMap[id]
        const rewritePosition = markerDraggingMap[id]
        return rewritePosition ?? position
      },
      getSize,
      getColor: id => [0, 0, 0, (transparentMarked && isMarked(id!)) ? 51 : 255],
      sizeScale: 1,
      sizeMaxPixels: 40 * 2 ** (zoom + 2),
      sizeMinPixels: 4,
      updateTriggers: {
        getIcon: [hover, archiveHash],
        getPosition: [markerDraggingList],
        getSize: [hover, focus],
        getColor: [transparentMarked, archiveHash],
      },
    })
  }
}
